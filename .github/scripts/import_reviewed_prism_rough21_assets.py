#!/usr/bin/env python3
"""Import the final hash-bound PRISM rough site and source-bound ready clips.

Install at .github/scripts/import_reviewed_prism_rough21_assets.py. All downloads finish
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

REVIEWED_BASE = "a121bae0340e0f53b08b30c8e646a6465a15bac5"
FILE_COUNT = 37
TOTAL_BYTES = 13399764
VIDEO_COUNT = 22
BOOTSTRAP_PATHS = frozenset({
    ".github/scripts/import_reviewed_prism_rough21_assets.py",
    ".github/workflows/import-reviewed-prism-rough21-assets.yml",
})
STATIC_PATHS = frozenset(["prism/assets/prism/mjlab/locomotion_dynamics_2x4.pdf","prism/assets/prism/mjlab/locomotion_dynamics_2x4.png","prism/assets/prism/mjlab/locomotion_dynamics_2x4.svg","prism/assets/prism/mjlab/locomotion_dynamics_2x4_provenance.json","prism/assets/prism/mjlab/rough21-site.css","prism/assets/prism/mjlab/rough21_physical_metrics.csv","prism/assets/prism/mjlab/rough21_physical_metrics.json","prism/assets/prism/mjlab/rough21_provenance.json","prism/explorer/app.js","prism/explorer/bootstrap.js","prism/explorer/data.json","prism/explorer/index.html","prism/explorer/styles.css","prism/explorer/videos.json","prism/index.html"])
MEDIA_PATHS = frozenset(["prism/explorer/videos/rough21-friction_0p1-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_0p1-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_0p2-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_0p2-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_0p3-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_0p3-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_0p45-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_0p45-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_0p6-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_0p6-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_0p9-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_0p9-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_1p2-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_1p2-standard-seed401000.mp4","prism/explorer/videos/rough21-friction_1p5-prism-seed401000.mp4","prism/explorer/videos/rough21-friction_1p5-standard-seed401000.mp4","prism/explorer/videos/rough21-mass_0p6-prism-seed401000.mp4","prism/explorer/videos/rough21-mass_0p6-standard-seed401000.mp4","prism/explorer/videos/rough21-mass_0p8-prism-seed401000.mp4","prism/explorer/videos/rough21-mass_0p8-standard-seed401000.mp4","prism/explorer/videos/rough21-nominal-prism-seed401000.mp4","prism/explorer/videos/rough21-nominal-standard-seed401000.mp4"])
MEDIA_SHA256 = {
  "prism/explorer/videos/rough21-friction_0p1-prism-seed401000.mp4": "dd0621dfa2265260e6056b4e3957090af80767db2e267b89a8901ef29c2a6c28",
  "prism/explorer/videos/rough21-friction_0p1-standard-seed401000.mp4": "da92de33999360c8b868e8985265c9a69b63324bb3309bb32b15b1cc70a81ca7",
  "prism/explorer/videos/rough21-friction_0p2-prism-seed401000.mp4": "bd5ebc377718a21298ab0d376d1add143306d278b26d4f5a0dd38553c9088b8f",
  "prism/explorer/videos/rough21-friction_0p2-standard-seed401000.mp4": "daf00ce99de806f265ebd5eaf5221a322a4a27a9fa6e218c2f8eb105783a6541",
  "prism/explorer/videos/rough21-friction_0p3-prism-seed401000.mp4": "300c65ea608b2fa13b2b740c862750e4a7429b9d196cac673c47b8e15304f169",
  "prism/explorer/videos/rough21-friction_0p3-standard-seed401000.mp4": "b5befac37a02d2954e5b34842374f7ef8b5fcf184ec8a72c8e5a51a5d077c6f8",
  "prism/explorer/videos/rough21-friction_0p45-prism-seed401000.mp4": "d79a39deecbca5b83ad1325d8df38c55ece7abcbf86c907e6a6710cc979b9a78",
  "prism/explorer/videos/rough21-friction_0p45-standard-seed401000.mp4": "b00f0486e24bb98d8e979b3a1adc7a73369aeda388d23b0c7f1b3891b6c203f2",
  "prism/explorer/videos/rough21-friction_0p6-prism-seed401000.mp4": "a486e0edba8f8478b35c5fb2ad04a2b7219004a936633a7522241ee50e0dc9d4",
  "prism/explorer/videos/rough21-friction_0p6-standard-seed401000.mp4": "4104958d1afa35cbd3dd48d94fd8d2a9d5ba9a973ff6b977881ef95a4f42b676",
  "prism/explorer/videos/rough21-friction_0p9-prism-seed401000.mp4": "1726efe0df570bf56875aa2cfcc8e73b1536cd31549c9b570da201aa5bbaf832",
  "prism/explorer/videos/rough21-friction_0p9-standard-seed401000.mp4": "5eb393b203aad3b6c91c3bb983fa057c3cd15451262b5f6d7270784827123df0",
  "prism/explorer/videos/rough21-friction_1p2-prism-seed401000.mp4": "4bd7f5991ad7b677d6ce0936f3acf8dbb3956807b16c46ea5c8f88f48e799a5d",
  "prism/explorer/videos/rough21-friction_1p2-standard-seed401000.mp4": "36134686d265d4d671bc4bb911dc9ca4bef528a610cd18bb750025beef93775c",
  "prism/explorer/videos/rough21-friction_1p5-prism-seed401000.mp4": "fc5b21794c8b0bb380e3bb871eefd6e8167a0889e5455ce08dee3868bbfa74ae",
  "prism/explorer/videos/rough21-friction_1p5-standard-seed401000.mp4": "69f81e8b6d89b74bda20514bbac9d639948a25d7bb3e9fe935e3846951d32dfc",
  "prism/explorer/videos/rough21-mass_0p6-prism-seed401000.mp4": "66bb4807ea7388cb38e71698b768d4cedf30426bab709500496caee55d5982d4",
  "prism/explorer/videos/rough21-mass_0p6-standard-seed401000.mp4": "eb63584336b298937c10898cf4296be71ff1a7b5bb1d16ee5a2f30969df3d9bd",
  "prism/explorer/videos/rough21-mass_0p8-prism-seed401000.mp4": "c247da0c2b923be82afae7c18314fe4e822fa78a7413e98ad1697850e99aed8a",
  "prism/explorer/videos/rough21-mass_0p8-standard-seed401000.mp4": "5972605722d3c1c078b83970e053680252a253a406bd9830943d73ccd38a7b74",
  "prism/explorer/videos/rough21-nominal-prism-seed401000.mp4": "a486e0edba8f8478b35c5fb2ad04a2b7219004a936633a7522241ee50e0dc9d4",
  "prism/explorer/videos/rough21-nominal-standard-seed401000.mp4": "4104958d1afa35cbd3dd48d94fd8d2a9d5ba9a973ff6b977881ef95a4f42b676"
}
VIDEO_PATH = re.compile(r"prism/explorer/videos/rough21-[a-z0-9_]+-(?:standard|prism)-seed401000\.mp4\Z")
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
                    "Clip differs from the reviewed ready saved-policy recordings in the selected training map")
        seen.add(path)
        videos += int(video)
        total += entry["size"]
    require(seen == STATIC_PATHS | MEDIA_PATHS and videos == VIDEO_COUNT and total == TOTAL_BYTES,
            "Overlay must contain exactly the reviewed site files and reviewed ready rough21 videos")
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
