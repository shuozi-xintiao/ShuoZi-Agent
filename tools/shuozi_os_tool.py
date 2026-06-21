#!/usr/bin/env python3
"""
ShuoZi OS Tool Module — Native AI agent tools for the ShuoZi operating system.

Provides deep integration between ShuoZi Agent and the ShuoZi OS build
pipeline, emulation layer, and system introspection. These tools grow
alongside the OS itself — from bootloader to kernel to userspace.
"""

import json
import os
import subprocess
from pathlib import Path
from typing import Optional


# --- Default paths ---
SHUOZI_OS_DEFAULT_ROOT = os.path.expandvars(
    os.environ.get("SHUOZI_OS_ROOT", os.path.join(os.path.expanduser("~"), "shuozi-os"))
)


def _resolve_shuozi_root(root: Optional[str] = None) -> Path:
    """Resolve the ShuoZi OS source root, with env-var and argument override."""
    return Path(root or SHUOZI_OS_DEFAULT_ROOT).resolve()


# ---------------------------------------------------------------------------
# Tool: shuozi_build
# ---------------------------------------------------------------------------

SHUOZI_BUILD_SCHEMA = {
    "name": "shuozi_build",
    "description": (
        "Build the ShuoZi OS from source. Runs the build pipeline for the "
        "specified target (bootloader, kernel, or full image). Defaults to "
        "the bootloader (Phase 0 — MBR). Uses the build system configured "
        "in the ShuoZi OS source tree."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "target": {
                "type": "string",
                "enum": ["bootloader", "kernel", "image", "all"],
                "description": "Build target. 'bootloader' = MBR/first-stage, 'kernel' = kernel binary, 'image' = bootable disk image, 'all' = full pipeline.",
            },
            "source_root": {
                "type": "string",
                "description": "Path to the ShuoZi OS source root. Defaults to $SHUOZI_OS_ROOT or ~/shuozi-os.",
            },
        },
        "required": [],
    },
}


def shuozi_build_tool(
    target: str = "bootloader",
    source_root: Optional[str] = None,
) -> str:
    """
    Build ShuoZi OS components.

    Args:
        target: Which target to build (bootloader, kernel, image, all).
        source_root: Path to the ShuoZi OS source tree.

    Returns:
        JSON with build output, exit code, and artifact paths.
    """
    root = _resolve_shuozi_root(source_root)

    if not root.exists():
        return json.dumps({
            "success": False,
            "error": f"ShuoZi OS source root not found: {root}",
            "hint": "Clone the ShuoZi OS repository or set $SHUOZI_OS_ROOT to the correct path.",
        }, ensure_ascii=False)

    # Build commands — these evolve with the OS. Phase 0 uses nasm + dd.
    build_cmds = {
        "bootloader": ["nasm", "-f", "bin", "src/bootloader/mbr.asm", "-o", "build/mbr.bin"],
        "kernel": ["make", "-C", "src/kernel"],
        "image": ["make", "image"],
        "all": ["make", "all"],
    }

    cmd = build_cmds.get(target, build_cmds["bootloader"])

    try:
        result = subprocess.run(
            cmd,
            cwd=str(root),
            capture_output=True,
            text=True,
            timeout=120,
        )
        return json.dumps({
            "success": result.returncode == 0,
            "target": target,
            "exit_code": result.returncode,
            "stdout": result.stdout[-8000:] if len(result.stdout) > 8000 else result.stdout,
            "stderr": result.stderr[-4000:] if len(result.stderr) > 4000 else result.stderr,
            "source_root": str(root),
        }, ensure_ascii=False)
    except FileNotFoundError as e:
        return json.dumps({
            "success": False,
            "error": f"Build tool not found: {e}",
            "hint": "Install required build tools (nasm, gcc, make, ld) and ensure they are in PATH.",
        }, ensure_ascii=False)
    except subprocess.TimeoutExpired:
        return json.dumps({
            "success": False,
            "error": "Build timed out after 120 seconds.",
        }, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Tool: shuozi_status
# ---------------------------------------------------------------------------

SHUOZI_STATUS_SCHEMA = {
    "name": "shuozi_status",
    "description": (
        "Report the current development status of the ShuoZi OS source tree. "
        "Shows build artifacts, source structure, current phase/step, and "
        "git status. Useful for orienting before any OS-level work."
    ),
    "parameters": {
        "type": "object",
        "properties": {
            "source_root": {
                "type": "string",
                "description": "Path to the ShuoZi OS source root. Defaults to $SHUOZI_OS_ROOT or ~/shuozi-os.",
            },
        },
        "required": [],
    },
}


def shuozi_status_tool(source_root: Optional[str] = None) -> str:
    """
    Report ShuoZi OS development status.

    Args:
        source_root: Path to the ShuoZi OS source tree.

    Returns:
        JSON with source status, build artifacts, git info, and phase/step.
    """
    root = _resolve_shuozi_root(source_root)

    status = {
        "source_root": str(root),
        "exists": root.exists(),
    }

    if not root.exists():
        status["error"] = "ShuoZi OS source not found. Clone it to get started."
        return json.dumps(status, ensure_ascii=False)

    # Source structure
    status["top_level"] = sorted(
        [p.name for p in root.iterdir() if not p.name.startswith(".")],
    )[:50]

    # Build artifacts
    build_dir = root / "build"
    if build_dir.exists():
        artifacts = [str(p.relative_to(root)) for p in build_dir.rglob("*") if p.is_file()]
        status["build_artifacts"] = artifacts[:30]
    else:
        status["build_artifacts"] = []

    # Git status
    try:
        git_branch = subprocess.run(
            ["git", "rev-parse", "--abbrev-ref", "HEAD"],
            cwd=str(root), capture_output=True, text=True, timeout=10,
        )
        status["git_branch"] = git_branch.stdout.strip()

        git_status = subprocess.run(
            ["git", "status", "--short"],
            cwd=str(root), capture_output=True, text=True, timeout=10,
        )
        status["git_dirty"] = bool(git_status.stdout.strip())
        status["git_changes"] = git_status.stdout.strip().split("\n")[:20] if git_status.stdout.strip() else []

        git_log = subprocess.run(
            ["git", "log", "--oneline", "-5"],
            cwd=str(root), capture_output=True, text=True, timeout=10,
        )
        status["recent_commits"] = git_log.stdout.strip().split("\n") if git_log.stdout.strip() else []
    except Exception as e:
        status["git_error"] = str(e)

    # Check for ROADMAP.md to determine current phase
    roadmap = root / "ROADMAP.md"
    if roadmap.exists():
        try:
            roadmap_text = roadmap.read_text(encoding="utf-8")
            # Try to extract current phase info
            for line in roadmap_text.split("\n")[:30]:
                line = line.strip()
                if "Phase" in line or "Step" in line or "phase" in line:
                    status.setdefault("roadmap_hints", []).append(line)
        except Exception:
            pass

    return json.dumps(status, ensure_ascii=False)


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------
from tools.registry import registry, tool_error


def check_shuozi_requirements() -> bool:
    """ShuoZi OS tools are always available — they degrade gracefully
    when the OS source tree is not found."""
    return True


registry.register(
    name="shuozi_build",
    toolset="shuozi_os",
    schema=SHUOZI_BUILD_SCHEMA,
    handler=lambda args, **kw: shuozi_build_tool(
        target=args.get("target", "bootloader"),
        source_root=args.get("source_root"),
    ),
    check_fn=check_shuozi_requirements,
    emoji="🔧",
)

registry.register(
    name="shuozi_status",
    toolset="shuozi_os",
    schema=SHUOZI_STATUS_SCHEMA,
    handler=lambda args, **kw: shuozi_status_tool(
        source_root=args.get("source_root"),
    ),
    check_fn=check_shuozi_requirements,
    emoji="📊",
)
