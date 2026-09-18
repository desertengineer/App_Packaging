---
name: website-rollback
description: Guidelines for soft reverts, tag rollbacks, or edge caching purges for desertengineer.github.io.
commands:
  - /revert-head
  - /rollback-tag
---

# Website Rollback Operational Flow
When processing web layout deployment adjustments, strictly adhere to these guardrails:
1. Ensure the remote target explicitly references: `https://github.com`.
2. Soft Reverts: Instruct the user to pull down 'main' and invoke `git revert HEAD`.
3. Hard Tag Reverts: Run `git checkout -B main [tag_version] && git push --force origin main`.
4. Domain Caching: Alert the user to navigate to Cloudflare Caching configurations and trigger 'Purge Everything' once the pipeline rebuild completes.
