# Dependency Remediation Review

## Status

Reviewed 2026-08-02. No dependency or lockfile change was made because the
remaining runtime fixes are not all supported by the current stable framework
dependency ranges. Never run `npm audit fix --force` for this project.

## Installed Findings and Safe Paths

| Package/path | Installed | Finding | Supported remediation decision |
| --- | --- | --- | --- |
| `sharp` via Next.js | `0.34.5` | Versions before `0.35.0` inherit patched libvips vulnerabilities. | Do not force `0.35.x`: Next.js 16.2.11 declares `^0.34.5`. Upgrade through a stable Next.js release that officially supports patched Sharp. |
| Next.js internal `postcss` | `8.4.31` | Current PostCSS advisories include fixes through `8.5.18`. | Do not override the framework-pinned internal copy independently. Upgrade through a supported stable Next.js release. |
| Top-level `postcss` via Tailwind | `8.5.16` | Path traversal is fixed in `8.5.18`. | A lockfile refresh to `8.5.18` is a narrow patch candidate, but it should be combined with the supported framework resolution and verified as its own dependency batch. |
| `brace-expansion` in tooling | `1.1.15` and `5.0.7` | Unbounded expansion length is fixed in `5.0.8`. | Patch/override only in a dedicated dependency batch with a clean install, ESLint, TypeScript, Prisma generation, and build verification. The affected paths are tooling, not storefront request handling. |
| `@hono/node-server` via `@prisma/dev` | `1.19.11` | Repeated-slash `serveStatic` bypass is fixed in `1.19.13`. | Prefer the next Prisma release that updates its exact development-tool dependency. This app does not import or deploy Hono as its HTTP runtime. |
| `fast-uri` | `3.1.3` | The authority-confusion issue is fixed in `3.1.2`. | Already patched; no action. |

No matching public GitHub advisory was found for the installed `valibot@1.2.0`
during this review. It is present only through Prisma development tooling and
should be rechecked with the next package-manager audit.

## Risk Classification

- Runtime/build-chain blocker waiting for upstream support: Sharp and the
  Next.js-pinned PostCSS copy.
- Safe patch candidates for a later isolated dependency batch: top-level
  PostCSS, `brace-expansion`, and Prisma's Hono dependency through a Prisma
  release.
- No forced downgrade, prerelease Next.js, manual lockfile edit, or unsupported
  nested override is approved.

## Primary References

- Sharp advisory: https://github.com/advisories/GHSA-f88m-g3jw-g9cj
- Next.js 16.2.11 Sharp tracking issue:
  https://github.com/vercel/next.js/issues/96064
- PostCSS path-traversal advisory:
  https://github.com/advisories/GHSA-r28c-9q8g-f849
- Brace-expansion advisory:
  https://github.com/advisories/GHSA-mh99-v99m-4gvg
- Hono advisory: https://github.com/advisories/GHSA-92pp-h63x-v22m
- Fast URI advisory:
  https://github.com/fastify/fast-uri/security/advisories/GHSA-v39h-62p7-jpjc

## Next Review

Re-run the package-manager audit after a stable Next.js or Prisma release
changes these dependency ranges. Apply only patch/minor changes supported by
their parents, then verify a clean install, full ESLint, TypeScript, Prisma
generation, production build, and production smoke test.

