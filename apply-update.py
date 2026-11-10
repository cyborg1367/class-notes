from hashlib import sha256
import json
from pathlib import Path
import shutil
import sys

here = Path(__file__).resolve().parent
repo = Path(sys.argv[1] if len(sys.argv) > 1 else '.').resolve()
package = repo / 'package.json'
if (not package.is_file() or not (repo / 'frontend/home/HomeHero.tsx').is_file()
        or json.loads(package.read_text(encoding='utf-8-sig')).get('name') != 'class-notes-public'):
    raise SystemExit('Run this from the class-notes React repository (or pass its path).')
manifest = json.loads((here / 'CHANGESET.json').read_text(encoding='utf-8'))


def contained(root, name):
    relative = Path(name)
    if relative.is_absolute() or '..' in relative.parts:
        raise SystemExit(f'Invalid update path: {name}')
    path = root / relative
    if not path.resolve().is_relative_to(root) or path.is_symlink():
        raise SystemExit(f'Update path points outside its project: {name}')
    return path


def digest(data, text=False):
    return sha256(data.replace(b'\r\n', b'\n') if text else data).hexdigest()


updates = []
for name, expected in manifest['updates'].items():
    source = contained(here / 'public-update', name)
    dest = contained(repo, name)
    if not source.is_file() or digest(source.read_bytes()) != expected:
        raise SystemExit(f'Update file missing or changed: {name}. Extract the ZIP again.')
    updates.append((source, dest))

obsolete = []
for name, expected in manifest['obsolete_lens'].items():
    target = contained(repo, name)
    if not target.exists():
        continue
    if not target.is_file() or digest(target.read_bytes(), expected['text']) != expected['sha256']:
        raise SystemExit(f'Old lens file was edited: {name}. Back it up or move it before retrying.')
    obsolete.append(target)

for source, dest in updates:
    dest.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, dest)
for target in obsolete:
    target.unlink()
print(f'Gradient Descent installed. Updated {len(updates)} files; removed {len(obsolete)} old lens files.')
print('Next: npm.cmd ci, then npm.cmd run dev')
