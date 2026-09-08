# Production Source Audit

Date: 2026-09-08. Scope: repository code, project naming and documentation.

ai.etgq.com | /www/dk_project/apps/ai.etgq.com/current | 258 tracked files matched after newline normalization. The production-only layout test asserts an old route that the current source redirects; it was not restored over the newer repository test. Production leftover pages are not added as active features.

The audit did not change live services, domain names, database contents, credentials or repository visibility. Missing snapshot files were not interpreted as source deletions. No force push or history rewrite was used.

Verification: the existing frontend layout-contract suite reports 1 pass and 5 failures. These tests and their source targets were not changed by this documentation update; several assertions target historical dashboard/customer-project layouts. This audit does not claim the existing suite is green or alter application behavior to satisfy old assertions.

Database files, uploads, environment files, private keys, live business caches and server logs remain outside this synchronization. Existing repository fixtures or historical data are not a current production backup.
