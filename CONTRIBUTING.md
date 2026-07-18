# Contributing

## Development

Use Node.js 24 and npm. The repository is a single package.

```sh
npm ci
npm run storybook
npm run verify
```

Keep public exports in `src/index.ts` intentional. Procedural helpers may be exported from private source modules for direct tests, but must not be added to the package entry point. Add behavioral tests for changes to generation, drawing, motion, or observers.

## Changes

1. Create a focused branch.
2. Add or update a Changeset with `npm run changeset` for user-visible changes.
3. Run `npm run verify`.
4. Open a pull request using the template.

Do not commit generated `dist`, coverage, Storybook output, tarballs, credentials, or local environment files.

## Releases

Maintainers follow [docs/releasing.md](./docs/releasing.md). Contributors must not publish packages or create release tags as part of a pull request.
