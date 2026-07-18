# Releasing Glyphfield

Publishing is prepared but must not run without explicit maintainer authorization.

## Prerequisites

1. Confirm the maintainer controls the npm `@p3yman` scope. Repository setup could not verify this because `npm whoami` returned `ENEEDAUTH`.
2. Protect a GitHub environment named `npm` and require manual reviewer approval.
3. In npm package settings, add a GitHub Actions trusted publisher with organization/user `p3yman`, repository `glyphfield`, workflow filename `release.yml`, and environment `npm`.

The requested repository is `p3yman/glyphfield`. Do not configure `p3yman/patternfield`: that name does not match `repository.url` or the workflow's repository identity and would prevent OIDC authorization.

## First publication

npm may require the package to exist before trusted publishing can be configured. If so, a scope owner must bootstrap `@p3yman/glyphfield` once from a trusted local environment using npm's documented interactive authentication and public access. Do not store or commit the resulting credentials. Immediately configure the trusted publisher, confirm provenance, and use only the OIDC workflow afterward.

## Release procedure

1. Merge reviewed changes and Changesets.
2. Run `npm run version-packages`, review the version and changelog, and merge that change.
3. Create and push an annotated `v<package-version>` tag only after explicit authorization.
4. Manually dispatch **Publish to npm** with that existing tag.
5. Approve the protected `npm` environment after reviewing the verification and package dry-run steps.

The workflow checks out the tag, verifies the tag/version match, runs the full local quality gate, audits production dependencies, performs a package dry run, and publishes publicly with npm trusted publishing and provenance. It deliberately has no `NPM_TOKEN` path.

## Supply chain

The package has no runtime dependencies. React and React DOM are peers and remain external. CI separately audits production dependencies and generates a CycloneDX SBOM. Dependabot proposes npm and GitHub Actions updates without automatic merging.
