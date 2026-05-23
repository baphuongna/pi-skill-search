---
name: docker-sandbox
description: Containerized execution environments and lab automation. Use when running code in Docker containers, managing development environments, CI/CD pipelines, or automating lab instrument control. Trigger on imports of docker, or mentions of container, sandbox, isolated environment, lab automation, instrument control.
---
# docker-sandbox

Use this skill for containerized code execution and lab automation.

## Core patterns

- **Run**: `docker.from_env().containers.run('image', command, volumes={'/host': {'bind': '/container', 'mode': 'rw'}})`.
- **Build**: `docker.from_env().images.build(path='.', tag='my-image')`.
- **Exec**: `container.exec_run('python script.py')` for running inside a container.
- **Cleanup**: Always `container.remove()` and `image.remove()` after use.

## Rules

- Always set `mem_limit` and `cpu_count` to prevent resource exhaustion.
- Mount volumes read-only when writes aren't needed: `mode='ro'`.
- Use `detach=True` for long-running processes; `detach=False` for scripts.
- Clean up containers: `docker.from_env().containers.prune()`.

## Anti-patterns

- Don't run containers without resource limits — runaway processes kill the host.
- Don't mount sensitive directories (`/etc`, `~/.ssh`) into containers.
- Don't use `latest` tag in production — pin specific image versions.


