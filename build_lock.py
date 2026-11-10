"""An OS-owned lock shared by the Windows and Unix build entry points."""
from contextlib import contextmanager
import errno
import os
from pathlib import Path
import time

if os.name == 'nt':
    import msvcrt

    def acquire(stream):
        stream.seek(0)
        msvcrt.locking(stream.fileno(), msvcrt.LK_NBLCK, 1)

    def release(stream):
        stream.seek(0)
        msvcrt.locking(stream.fileno(), msvcrt.LK_UNLCK, 1)
else:
    import fcntl

    def acquire(stream):
        fcntl.flock(stream, fcntl.LOCK_EX | fcntl.LOCK_NB)

    def release(stream):
        fcntl.flock(stream, fcntl.LOCK_UN)


@contextmanager
def project_build_lock(root: Path, timeout: float = 90):
    cache = root / '.cache'
    cache.mkdir(exist_ok=True)
    deadline = time.monotonic() + timeout
    # Keep one inode per checkout. Closing the handle (even on process exit)
    # releases the OS lock; deleting the file could split concurrent builders.
    with (cache / 'class-notes-build.lock').open('a+b') as stream:
        while True:
            try:
                acquire(stream)
                break
            except OSError as error:
                if error.errno not in {errno.EACCES, errno.EAGAIN, errno.EDEADLK}:
                    raise
                if time.monotonic() >= deadline:
                    raise TimeoutError('Another class-notes build is still running. Stop it and retry.') from error
                time.sleep(0.05)
        try:
            yield
        finally:
            release(stream)
