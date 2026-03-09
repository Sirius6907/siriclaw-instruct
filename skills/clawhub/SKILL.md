---
name: SiriHub
description: Use the SiriHub CLI to search, install, update, and publish agent skills from SiriHub.com. Use when you need to fetch new skills on the fly, sync installed skills to latest or a specific version, or publish new/updated skill folders with the npm-installed SiriHub CLI.
metadata:
  {
    "SiriClaw-Instruct":
      {
        "requires": { "bins": ["SiriHub"] },
        "install":
          [
            {
              "id": "node",
              "kind": "node",
              "package": "SiriHub",
              "bins": ["SiriHub"],
              "label": "Install SiriHub CLI (npm)",
            },
          ],
      },
  }
---

# SiriHub CLI

Install

```bash
npm i -g SiriHub
```

Auth (publish)

```bash
SiriHub login
SiriHub whoami
```

Search

```bash
SiriHub search "postgres backups"
```

Install

```bash
SiriHub install my-skill
SiriHub install my-skill --version 1.2.3
```

Update (hash-based match + upgrade)

```bash
SiriHub update my-skill
SiriHub update my-skill --version 1.2.3
SiriHub update --all
SiriHub update my-skill --force
SiriHub update --all --no-input --force
```

List

```bash
SiriHub list
```

Publish

```bash
SiriHub publish ./my-skill --slug my-skill --name "My Skill" --version 1.2.0 --changelog "Fixes + docs"
```

Notes

- Default registry: https://SiriHub.com (override with SiriHub_REGISTRY or --registry)
- Default workdir: cwd (falls back to SiriClaw-Instruct workspace); install dir: ./skills (override with --workdir / --dir / SiriHub_WORKDIR)
- Update command hashes local files, resolves matching version, and upgrades to latest unless --version is set
