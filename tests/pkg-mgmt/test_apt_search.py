import pytest
import subprocess


@pytest.mark.integration
def test_apt_search_finds_git():
    result = subprocess.run(
        ["bash", "scripts/pkg-mgmt/search-apt.sh", "git", "--exact"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 0, f"Expected 0, got {result.returncode}: {result.stderr}"


@pytest.mark.integration
def test_apt_search_missing_package():
    result = subprocess.run(
        ["bash", "scripts/pkg-mgmt/search-apt.sh", "nonexistent-package-xyz-123"],
        capture_output=True,
        text=True,
    )
    assert result.returncode == 1, f"Expected 1, got {result.returncode}: {result.stderr}"
