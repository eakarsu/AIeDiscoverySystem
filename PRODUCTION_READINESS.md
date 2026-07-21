# Production readiness

The governed API at `/api/governance` is the supported e-discovery matter governance path. It records tenant/matter-scoped authority and source evidence, legal holds, forensic collection receipts, chain of custody, versioned jurisdiction rules, privilege screening, redaction, qualified review, client approval, delivery/correction, and immutable connector history. It never makes legal conclusions, files, signs, or delivers productions.

## Deployment sequence

1. Review and back up the database, then apply `backend/migrations/001_governed_ediscovery_matter.sql` separately using a least-privilege migration identity.
2. Copy `.env.example` to `.env`, replace every placeholder, and configure a unique 32-plus-character JWT secret and explicit CORS allowlist.
3. Install locked dependencies explicitly. `start.sh` only supervises the already-installed backend and frontend.
4. Provision tenant memberships and deploy separately reviewed connector workers. Workers exchange opaque references, versions, digests, and receipts; raw secrets and sensitive content do not enter workflow payloads.
5. Exercise retry, dead-letter, reconciliation, retention/deletion, audit export, backup, restore, and incident-response procedures before production.

Production rejects wildcard CORS, weak secrets, provider/demo flags, generated routes, and startup schema mutation. The additive migration never drops or truncates tables. Public registration is forced to `reviewer`. Legacy demo seed SQL requires explicit `-v allow_demo_seed=1` against an isolated non-production database.

## Required external validation

Validate matter, registry, forensic collection, document, identity, e-signature, notification, and production-delivery contracts with qualified counsel. Test jurisdiction/effective-date conflicts, privilege, redaction, deadlines, adverse matters, legal holds, chain of custody, replayable receipts, and production-format acceptance. No filing, production delivery, or legal review was performed.
