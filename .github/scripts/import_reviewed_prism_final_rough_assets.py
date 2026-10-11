#!/usr/bin/env python3
"""Import the final hash-bound PRISM rough site and exactly three saved-policy clips.

Install at .github/scripts/import_reviewed_prism_final_rough_assets.py. All downloads finish
and pass their size/SHA256 checks in private scratch before the checkout changes.
The companion workflow owns the explicit whitelist-only commit and normal push.
"""
from __future__ import annotations

import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import stat
import subprocess
import tempfile
from urllib.error import HTTPError
from urllib.parse import quote, urlsplit
from urllib.request import HTTPRedirectHandler, Request, build_opener

REVIEWED_BASE = "d19cd0e3ec093c2a2602c2cdf8ea26c9bd42baad"
FILE_COUNT = 19
TOTAL_BYTES = 1614930
VIDEO_COUNT = 3
BOOTSTRAP_PATHS = frozenset({
    ".github/scripts/import_reviewed_prism_final_rough_assets.py",
    ".github/workflows/import-reviewed-prism-final-rough-assets.yml",
})
STATIC_PATHS = frozenset({
    "prism/index.html",
    "prism/assets/prism/mjlab/site-additions.css",
    "prism/assets/prism/mjlab/terrain-sweep.html",
    "prism/assets/prism/mjlab/terrain_sweep_metrics.csv",
    "prism/assets/prism/mjlab/terrain_sweep_provenance.json",
    "prism/assets/prism/mjlab/random_rough_survival.svg",
    "prism/assets/prism/mjlab/random_rough_survival.pdf",
    "prism/assets/prism/mjlab/random_rough_metrics.json",
    "prism/assets/prism/mjlab/random_rough_metrics.csv",
    "prism/assets/prism/mjlab/random_rough_provenance.json",
    "prism/explorer/index.html",
    "prism/explorer/styles.css",
    "prism/explorer/app.js",
    "prism/explorer/bootstrap.js",
    "prism/explorer/data.json",
    "prism/explorer/videos.json",
})
MEDIA_PATHS = frozenset(
    f"prism/explorer/videos/g1-random_rough-{actor}-seed401000.mp4"
    for actor in ("standard", "matched", "prism")
)
MEDIA_SHA256 = {
    "prism/explorer/videos/g1-random_rough-standard-seed401000.mp4":
        "8ea0811ecb489368383c8d3238b6f6b31df32aa00263339fa7fa8a81b15bf4ef",
    "prism/explorer/videos/g1-random_rough-matched-seed401000.mp4":
        "597a71eea6197de968aab7b3d7f272f73014f8bc4005d334152ea9ecbbb1cfba",
    "prism/explorer/videos/g1-random_rough-prism-seed401000.mp4":
        "d5671cf504428d82cc1956e5f42638146cf2cfb51fc92302ae545c13795f022f",
}
VIDEO_PATH = re.compile(r"prism/explorer/videos/g1-random_rough-(?:standard|matched|prism)-seed401000\.mp4\Z")
HEX40 = re.compile(r"[0-9a-f]{40}\Z")
HEX64 = re.compile(r"[0-9a-f]{64}\Z")
MAX_MANIFEST_BYTES = 2 * 1024 * 1024


def require(condition, message):
    if not condition:
        raise ValueError(message)


def git(repo, *arguments):
    return subprocess.check_output(
        ["git", "-C", str(repo), *arguments], stderr=subprocess.PIPE
    ).decode("utf-8")


def check_base(repo, expected_base, expected_head):
    require(HEX40.fullmatch(expected_base) is not None and expected_base == REVIEWED_BASE,
            "Expected base must be the reviewed public website commit")
    require(HEX40.fullmatch(expected_head) is not None, "Malformed expected installation HEAD")
    require(not repo.is_symlink() and repo.is_dir(), "Checkout must be a regular directory")
    require(Path(git(repo, "rev-parse", "--show-toplevel").strip()).resolve() == repo.resolve(),
            "Repository root differs from the supplied checkout")
    require(git(repo, "symbolic-ref", "--short", "HEAD").strip() == "master",
            "Checkout must be on master")
    require(git(repo, "rev-parse", "HEAD").strip() == expected_head,
            "Master changed from the reviewed installation HEAD")
    require(not git(repo, "status", "--porcelain=v1", "--untracked-files=all"),
            "Checkout must be clean before import")
    ancestry = git(repo, "rev-list", "--parents", "-n", "1", expected_head).strip().split()
    require(ancestry == [expected_head, expected_base],
            "Installation must be exactly one ordinary commit above the reviewed base")
    changed = git(repo, "diff", "--name-status", "--no-renames", expected_base, expected_head,
                  "--").splitlines()
    require(set(changed) == {"A\t" + path for path in BOOTSTRAP_PATHS},
            "Installation commit must only add the reviewed workflow and importer")
    tree = git(repo, "ls-tree", expected_head, "--", *sorted(BOOTSTRAP_PATHS)).splitlines()
    require(len(tree) == 2 and all(line.startswith("100644 blob ") for line in tree),
            "Bootstrap files must be ordinary nonexecutable files")


def manifest_origin(url):
    parsed = urlsplit(url)
    require(parsed.scheme == "https" and parsed.hostname is not None,
            "Manifest URL must use HTTPS")
    require(parsed.username is None and parsed.password is None and parsed.port in (None, 443),
            "Manifest URL must have no credentials or custom port")
    require(re.fullmatch(r"[a-z0-9-]+\.trycloudflare\.com", parsed.hostname) is not None,
            "Manifest must use the reviewed Cloudflare quick-tunnel origin")
    require(parsed.path == "/manifest.json" and not parsed.query and not parsed.fragment,
            "Manifest URL must have the exact /manifest.json path")
    return "https://" + parsed.hostname


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, request, response, code, message, headers, new_url):
        raise HTTPError(request.full_url, code, "Redirects are prohibited", headers, response)


def response_for(url):
    request = Request(url, headers={"Accept-Encoding": "identity",
                                    "User-Agent": "PRISM-final-rough-asset-import/1"})
    response = build_opener(NoRedirects()).open(request, timeout=60)
    require(response.status == 200 and response.geturl() == url, "Unexpected asset response")
    require(response.headers.get("Content-Encoding", "identity").lower() == "identity",
            "Compressed transfer encoding is prohibited")
    return response


def unique_object(pairs):
    result = {}
    for key, value in pairs:
        require(key not in result, "Duplicate JSON object key")
        result[key] = value
    return result


def validate_manifest(blob, expected_sha256, expected_base):
    require(FILE_COUNT > VIDEO_COUNT and TOTAL_BYTES > 0
            and len(STATIC_PATHS) == FILE_COUNT - VIDEO_COUNT,
            "Final reviewed site contract has not been bound")
    require(HEX64.fullmatch(expected_sha256) is not None, "Malformed manifest SHA256")
    require(len(blob) <= MAX_MANIFEST_BYTES, "Manifest is too large")
    require(hashlib.sha256(blob).hexdigest() == expected_sha256, "Manifest SHA256 differs")
    manifest = json.loads(blob, object_pairs_hook=unique_object,
                          parse_constant=lambda value: (_ for _ in ()).throw(ValueError("Nonfinite JSON")))
    require(type(manifest) is dict and type(manifest.get("schema_version")) is int
            and manifest["schema_version"] == 1,
            "Unexpected transfer-manifest schema")
    require(manifest.get("expected_base") == expected_base == REVIEWED_BASE,
            "Transfer manifest is bound to a different website base")
    require(type(manifest.get("file_count")) is int and manifest["file_count"] == FILE_COUNT,
            "Reviewed file count changed")
    require(type(manifest.get("total_bytes")) is int and manifest["total_bytes"] == TOTAL_BYTES,
            "Reviewed total byte count changed")
    entries = manifest.get("files")
    require(type(entries) is list and len(entries) == FILE_COUNT, "Manifest file list differs")
    seen, videos, total = set(), 0, 0
    for entry in entries:
        require(type(entry) is dict and set(entry) == {"path", "size", "sha256"},
                "Each file must only supply path, size, and SHA256")
        path = entry["path"]
        require(type(path) is str and "\\" not in path and str(PurePosixPath(path)) == path,
                "Asset path is not a normalized POSIX path")
        require(path.startswith("prism/"), "Public assets must remain inside prism/")
        require(not path.startswith("/") and all(part not in ("", ".", "..")
                for part in path.split("/")), "Absolute paths and traversal are prohibited")
        video = VIDEO_PATH.fullmatch(path) is not None
        require(path in STATIC_PATHS or video, "Asset path is outside the reviewed static whitelist")
        require(path not in seen, "Duplicate asset path")
        require(type(entry["size"]) is int and 0 < entry["size"] <= TOTAL_BYTES,
                "Invalid asset size")
        require(type(entry["sha256"]) is str and HEX64.fullmatch(entry["sha256"]) is not None,
                "Invalid asset SHA256")
        if video:
            require(entry["sha256"] == MEDIA_SHA256[path],
                    "Clip differs from the three verified policies in the selected training map")
        seen.add(path)
        videos += int(video)
        total += entry["size"]
    require(seen == STATIC_PATHS | MEDIA_PATHS and videos == VIDEO_COUNT and total == TOTAL_BYTES,
            "Overlay must contain exactly the reviewed site files and three prescribed random-rough videos")
    return manifest


def check_destination(repo, path):
    target = repo.joinpath(*PurePosixPath(path).parts)
    current = repo
    for component in PurePosixPath(path).parts:
        current = current / component
        if os.path.lexists(current):
            mode = current.lstat().st_mode
            require(not stat.S_ISLNK(mode), "Destination contains a symbolic link")
            if current == target:
                require(stat.S_ISREG(mode) and not (mode & 0o111),
                        "Destination is not an ordinary nonexecutable asset")
            else:
                require(stat.S_ISDIR(mode), "Destination parent is not a directory")
    return target


def download_file(origin, entry, stage):
    path = stage.joinpath(*PurePosixPath(entry["path"]).parts)
    path.parent.mkdir(parents=True, exist_ok=True)
    digest, count = hashlib.sha256(), 0
    with response_for(origin + "/files/" + quote(entry["path"], safe="/")) as response:
        length = response.headers.get("Content-Length")
        if length is not None:
            require(length.isdecimal() and int(length) == entry["size"], "Content-Length differs")
        with path.open("xb") as output:
            while block := response.read(min(1024 * 1024, entry["size"] - count + 1)):
                count += len(block)
                require(count <= entry["size"], "Asset exceeds its reviewed byte size")
                digest.update(block)
                output.write(block)
    require(count == entry["size"] and digest.hexdigest() == entry["sha256"],
            "Asset size or SHA256 differs")
    path.chmod(0o644)


def copy_verified_assets(repo, stage, entries):
    for entry in entries:
        check_destination(repo, entry["path"])
    for entry in entries:
        target = check_destination(repo, entry["path"])
        source = stage.joinpath(*PurePosixPath(entry["path"]).parts)
        require(source.is_file() and not source.is_symlink(), "Staged asset must be a regular file")
        require(source.stat().st_size == entry["size"], "Staged asset size changed")
        require(hashlib.sha256(source.read_bytes()).hexdigest() == entry["sha256"],
                "Staged asset SHA256 changed")
    for entry in entries:
        target = check_destination(repo, entry["path"])
        target.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(prefix=".prism-import-", dir=target.parent, delete=False) as out:
            temporary = Path(out.name)
            try:
                with stage.joinpath(*PurePosixPath(entry["path"]).parts).open("rb") as source:
                    shutil.copyfileobj(source, out, length=1024 * 1024)
                out.flush()
                os.fsync(out.fileno())
                temporary.chmod(0o644)
                os.replace(temporary, target)
            finally:
                temporary.unlink(missing_ok=True)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--manifest-url", default=os.getenv("PRISM_MANIFEST_URL"), required=False)
    parser.add_argument("--manifest-sha256", default=os.getenv("PRISM_MANIFEST_SHA256"))
    parser.add_argument("--expected-base", default=os.getenv("PRISM_EXPECTED_BASE", REVIEWED_BASE))
    parser.add_argument("--expected-head", default=os.getenv("PRISM_EXPECTED_HEAD"))
    parser.add_argument("--repo", type=Path, required=True)
    parser.add_argument("--scratch-parent", type=Path, required=True)
    parser.add_argument("--allowed-paths-output", type=Path, required=True)
    parser.add_argument("--receipt-output", type=Path, required=True)
    parser.add_argument("--workers", type=int, default=4, choices=range(1, 5))
    args = parser.parse_args()
    require(args.manifest_url and args.manifest_sha256 and args.expected_head,
            "Manifest URL, manifest SHA256, and installation HEAD are required")
    origin = manifest_origin(args.manifest_url)
    repo = args.repo.absolute()
    check_base(repo, args.expected_base, args.expected_head)
    require(args.scratch_parent.is_dir() and not args.scratch_parent.is_symlink(),
            "Scratch parent must be an existing regular directory")
    require(not args.scratch_parent.resolve().is_relative_to(repo.resolve()),
            "Download scratch must be outside the checkout")
    for output in (args.allowed_paths_output, args.receipt_output):
        require(not output.resolve().is_relative_to(repo.resolve()) and not os.path.lexists(output),
                "Receipt and whitelist must be fresh files outside the checkout")
    with response_for(args.manifest_url) as response:
        blob = response.read(MAX_MANIFEST_BYTES + 1)
    manifest = validate_manifest(blob, args.manifest_sha256, args.expected_base)
    entries = manifest["files"]
    for entry in entries:
        target = check_destination(repo, entry["path"])
        if VIDEO_PATH.fullmatch(entry["path"]):
            require(not os.path.lexists(target), "Reviewed videos must be new assets")
    with tempfile.TemporaryDirectory(prefix="prism-reviewed-assets-", dir=args.scratch_parent) as scratch:
        stage = Path(scratch)
        with ThreadPoolExecutor(max_workers=args.workers) as pool:
            list(pool.map(lambda entry: download_file(origin, entry, stage), entries))
        check_base(repo, args.expected_base, args.expected_head)
        copy_verified_assets(repo, stage, entries)
    with args.allowed_paths_output.open("xb") as output:
        output.write(b"".join(entry["path"].encode("utf-8") + b"\0" for entry in entries))
    receipt = {"schema_version": 1, "status": "all_assets_verified_and_copied_not_committed",
               "expected_base": args.expected_base, "installation_head": args.expected_head,
               "manifest_sha256": args.manifest_sha256, "file_count": FILE_COUNT,
               "total_bytes": TOTAL_BYTES, "video_count": VIDEO_COUNT, "files": entries}
    with args.receipt_output.open("x") as output:
        json.dump(receipt, output, indent=2, allow_nan=False)
        output.write("\n")
    print(json.dumps({key: value for key, value in receipt.items() if key != "files"}))


if __name__ == "__main__":
    main()
