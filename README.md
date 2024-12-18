# Enchères Immo's auction widget

Add a real-estate auction widget to your website, powered by Enchères Immo's API 🚀 

## Production

This workspace is a mono-repository that contains the following packages:

| Package                   | Link                                                                                                                                     | README                                        |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| `docs`                    | WIP                                                                                                                                      | [README](./docs/README.md)                    |
| `example`                 | WIP                                                                                                                                      | [README](./example/README.md)                 |
| `packages/auction-widget` | [![npm version](https://badge.fury.io/js/@encheres-immo%2Fauction-widget.svg)](https://badge.fury.io/js/@encheres-immo%2Fauction-widget) | [README](./packages/auction-widget/README.md) |
| `packages/widget-client`  | [![npm version](https://badge.fury.io/js/@encheres-immo%2Fwidget-client.svg)](https://badge.fury.io/js/@encheres-immo%2Fwidget-client)   | [README](./packages/widget-client/README.md)  |

## Development

This repository contains all open-source packages developed by [Enchères Immo](https://encheres-immo.com/), and is maintained by our team of developers. But we also deeply appreciate any contribution from the community, no matter how small or big.

### Quick Links

📖 [Main repository](https://github.com/encheres-immo/auction-widget), with all our public packages.

🐛 [Report a bug](https://github.com/encheres-immo/auction-widget/issues), please read our [contributing guidelines](https://github.com/encheres-immo/auction-widget/blob/main/CONTRIBUTING.md) and [code of conduct](https://github.com/encheres-immo/auction-widget/blob/main/CODE_OF_CONDUCT.md) first.

🚨 [Report a security vulnerability](https://github.com/encheres-immo/auction-widget/security/advisories/new), and be sure to review our [security policy](https://github.com/encheres-immo/auction-widget/blob/main/SECURITY.md).

💬 [Join the discussion](https://github.com/encheres-immo/auction-widget/discussions), if you have any questions, ideas, or suggestions.

### Getting Started

We use [pnpm](https://pnpm.io/) as our package manager, since it's not only faster and safer than npm and yarn, but also because it has better support for monorepos. Global commands are :

| Command          | Action                                  |
| :--------------- | :-------------------------------------- |
| `pnpm install`   | Installs dependencies for all packages  |
| `pnpm changeset` | Generate a changeset for a pull request |

For package-specific commands and instructions, please refer to the README of the package, listed above.

### CI / CD

We use GitHub Actions to automate our CI/CD pipeline. When a pull request is opened, the following checks are performed for all packages: ~~linting~~ (WIP), testing, and building. Learn more [here](https://github.com/encheres-immo/auction-widget/blob/main/.github/workflows/ci.yml). 

Labels are also automatically added to indicate where the changes are located. Learn more [here](https://github.com/encheres-immo/auction-widget/blob/main/.github/labeler.yml).

If your changes concern a published package (labels starting with `pkg:`), you will need to generate a changeset using the `pnpm changeset` command. This will create a new file in the `.changeset` directory. Once the pull request is merged, a release pull request will be created, consuming all changesets into changelogs and version bumps. Learn more [here](https://github.com/changesets/changesets).

Merging the release pull request will automatically publish the new versions to npm and the CDN. Learn more [here](https://github.com/encheres-immo/auction-widget/blob/main/.github/workflows/release.yml) and [here](https://www.jsdelivr.com/).
