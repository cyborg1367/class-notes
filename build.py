"""Build the public classroom in one transaction per checkout."""
import argparse
from contextlib import contextmanager
import json
from pathlib import Path
import re
import shutil
import subprocess
import sys
from tempfile import TemporaryDirectory
from urllib.parse import urlsplit

from build_assets import OBSOLETE_ASSETS, prepare_public_assets
from build_lock import project_build_lock

ROOT = Path(__file__).resolve().parent


def validate_public_config(root):
    assets = root / 'web' / 'assets'
    config = json.loads((assets / 'auth-config.json').read_text(encoding='utf-8'))
    assert set(config) == {'supabaseUrl', 'publishableKey'}, 'Only public project configuration belongs here.'
    if config['supabaseUrl'] or config['publishableKey']:
        url = urlsplit(config['supabaseUrl'])
        assert url.scheme == 'https' and url.hostname and not (
            url.username or url.password or url.query or url.fragment
        ) and url.path in ('', '/'), 'Use the HTTPS project URL.'
        assert re.fullmatch(r'sb_publishable_[A-Za-z0-9_-]+', config['publishableKey']), 'Only a publishable key may be deployed.'
    lab = json.loads((assets / 'lab-service.json').read_text(encoding='utf-8'))
    assert set(lab) == {'checkURL'}, 'Only the public check endpoint belongs in lab-service.json.'
    if lab['checkURL']:
        url = urlsplit(lab['checkURL'])
        assert url.scheme == 'https' and url.netloc == urlsplit(config['supabaseUrl']).netloc and (
            url.path == '/functions/v1/classroom-lab/check'
        ), 'Use this Supabase project\'s HTTPS classroom-lab/check endpoint.'


def run(*args):
    subprocess.run(args, cwd=ROOT, check=True)


def recover_public_output():
    cache = ROOT / '.cache'
    dist = ROOT / 'dist'
    previous = cache / 'previous-dist'
    if not previous.exists():
        return
    # This name exists only while a candidate is uncommitted. An interrupted
    # test run may have left its candidate at dist; restore the known-good tree.
    with TemporaryDirectory(dir=cache, prefix='recovery-dist-') as tmp:
        if dist.exists():
            dist.replace(Path(tmp) / 'interrupted-dist')
        previous.replace(dist)


@contextmanager
def publish_candidate(verify):
    validate_public_config(ROOT)
    cache = ROOT / '.cache'
    dist = ROOT / 'dist'
    previous = cache / 'previous-dist'
    with TemporaryDirectory(dir=cache, prefix='staging-dist-') as tmp:
        transaction = Path(tmp)
        staging = transaction / 'dist'
        shutil.copytree(ROOT / 'web', staging, ignore=shutil.ignore_patterns(
            '__pycache__', '*.pyc', '.DS_Store', '.idea', *OBSOLETE_ASSETS,
        ))
        prepare_public_assets(ROOT, staging)
        if verify:
            run(sys.executable, '-X', 'utf8', 'check.py', '--dist', str(staging))
        had_dist = dist.exists()
        try:
            if had_dist:
                dist.replace(previous)
            staging.replace(dist)
            # Tests exercise the installed candidate but commit it only if
            # the entire suite completes successfully.
            yield
            if previous.exists():
                previous.replace(transaction / 'retired-dist')
        except BaseException:
            if previous.exists():
                if dist.exists():
                    dist.replace(transaction / 'rejected-dist')
                previous.replace(dist)
            elif not had_dist and not staging.exists() and dist.exists():
                dist.replace(staging)
            raise
    print('Built public classroom application; private material is fetched after authorization.', flush=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--node', help='Node executable for the React build')
    parser.add_argument('--frontend-only', action='store_true')
    parser.add_argument('--verify', action='store_true')
    parser.add_argument('--test', action='store_true')
    args = parser.parse_args()
    if (args.frontend_only or args.test) and not args.node:
        parser.error('--node is required with --frontend-only or --test')
    if args.frontend_only and (args.verify or args.test):
        parser.error('--frontend-only cannot be combined with --verify or --test')
    with project_build_lock(ROOT):
        recover_public_output()
        if args.node:
            run(args.node, 'node_modules/typescript/bin/tsc', '--project', 'frontend/tsconfig.json')
            run(args.node, 'frontend/build.mjs')
        if args.frontend_only:
            return
        with publish_candidate(args.verify or args.test):
            if args.test:
                run(sys.executable, '-X', 'utf8', '-m', 'unittest', 'discover', '-s', 'tests')
                files = sorted(p.relative_to(ROOT).as_posix() for p in (ROOT / 'tests').iterdir()
                               if p.is_file() and p.name.endswith(('.test.cjs', '.test.mjs')))
                # DOM fixtures each load a full browser module graph. Bound
                # parallel workers so the check also finishes on small hosts.
                run(args.node, '--experimental-vm-modules', '--test', '--test-concurrency=4', '--test-timeout=30000', *files)


if __name__ == '__main__':
    try:
        main()
    except subprocess.CalledProcessError as error:
        sys.exit(error.returncode)
    except TimeoutError as error:
        sys.exit(str(error))
