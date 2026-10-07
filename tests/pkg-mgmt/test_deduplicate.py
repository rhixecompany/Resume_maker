import os
import sys
from pathlib import Path

# Load deduplicate-packages.py directly from the scripts directory.
# The directory name `pkg-mgmt` contains a hyphen, so it is not a valid
# Python package name for a normal `import` statement. We therefore load the
# module via importlib from its file path.
import importlib.util
from pathlib import Path

_SCRIPT_DIR = Path(__file__).resolve().parent.parent.parent / "scripts"
_MODULE_PATH = _SCRIPT_DIR / "pkg-mgmt" / "deduplicate-packages.py"
_spec = importlib.util.spec_from_file_location("deduplicate_packages", _MODULE_PATH)
deduplicate_packages = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(deduplicate_packages)


def _pkg(**over):
    base = {"id": "git", "name": "Git", "version": "2.42.0", "source": "winget"}
    base.update(over)
    return base


def test_deduplicate_keeps_latest():
    pkgs = [
        _pkg(version="2.40.0"),
        _pkg(version="2.42.0"),
        _pkg(id="vscode", version="1.85.0", source="chocolatey"),
    ]
    keep, remove = deduplicate_packages.deduplicate(pkgs)
    assert len(keep) == 2
    assert keep[0]["id"] == "git" and keep[0]["version"] == "2.42.0"
    assert len(remove) == 1
    assert remove[0]["version"] == "2.40.0"


def test_deduplicate_single_version_unchanged():
    pkgs = [_pkg(version="2.42.0")]
    keep, remove = deduplicate_packages.deduplicate(pkgs)
    assert len(keep) == 1
    assert len(remove) == 0


def test_deduplicate_semantic_versions():
    pkgs = [
        _pkg(version="9.0.0"),
        _pkg(version="8.19.4"),
    ]
    keep, remove = deduplicate_packages.deduplicate(pkgs)
    assert keep[0]["version"] == "9.0.0"
    assert remove[0]["version"] == "8.19.4"


def test_parse_version_semantic():
    assert str(deduplicate_packages.parse_version("2.42.0")) == "2.42.0"


def test_parse_version_windows_style():
    # winget sometimes emits "1:2.53.0-1" for apt-sourced windows packages.
    # Fallback parser returns a comparable tuple (epoch, major, minor, micro).
    assert deduplicate_packages.parse_version("1:2.53.0-1") == ("00000001", "00000002", "00000053", "00000001")


def test_empty_input():
    keep, remove = deduplicate_packages.deduplicate([])
    assert keep == []
    assert remove == []
