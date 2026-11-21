# Contributing to LogicLab

Thank you for helping improve LogicLab! Bug reports, documentation, circuit
examples, tests, and code improvements are all welcome.

Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md) in project interactions.

## Report a bug or suggest a feature

Search [existing issues](https://github.com/Thevaibhavgarg/logiclab/issues) first
to avoid duplicates. If none matches, open a new issue.

For bugs, include:

- What you expected and what actually happened
- Steps to reproduce, including which gates and connections you used
- Your browser, operating system, and Node.js version when relevant
- A minimal exported `.logiclab.json` circuit or screenshot, if useful

Remove personal or sensitive information before uploading anything. Do not post
credentials or exploitable vulnerability details in public issues.

For feature requests, describe the problem, the proposed behavior, and an example
use case. Discuss larger changes in an issue before starting implementation.

## Set up a development environment

Use Node.js 22.12+ (Node 22 or a newer supported LTS release) and npm.

1. Fork the repository on GitHub.
2. Clone your fork and create a working branch:

   ```bash
   git clone https://github.com/YOUR-USERNAME/logiclab.git
   cd logiclab
   git switch -c improve-circuit-editor
   ```

3. Install the locked dependencies and start the app:

   ```bash
   npm ci
   npm run dev
   ```

4. Open the local URL printed by Vite.

Try the [half-adder tutorial](./docs/half-adder-tutorial.md) to become familiar
with the editor.

## Make and validate your changes

- Keep changes focused on one fix or improvement.
- Follow the existing TypeScript, React, and styling patterns.
- Add regression tests for simulator fixes. Tests live beside the engine code
  in `src/engine/` and use Vitest.
- Update related documentation when behavior or setup changes.
- Keep circuit examples compatible with the app's JSON import format.
- Do not commit `node_modules/`, `dist/`, secrets, or local environment files.

Before opening a pull request, run:

```bash
npm test
npm run lint
npm run build
```

To run a single test file during development:

```bash
npm test -- src/engine/sequential.test.ts
```

For editor changes, also try the affected interaction in the browser. Automated
engine tests do not replace checking wiring, input toggles, imports, saves, and
other relevant UI behavior.

## Submit a pull request

1. Commit your changes with a descriptive message.
2. Push your branch to your fork:

   ```bash
   git push -u origin improve-circuit-editor
   ```

3. Open a pull request against LogicLab's `main` branch.
4. Explain what changed and why, link any related issue, and list the checks you
   ran. Include before-and-after screenshots for visible UI changes.
5. Confirm the [CI checks](./.github/workflows/ci.yml) pass and respond
   constructively to review feedback.

By contributing, you agree that your contributions are provided under this
project's [MIT License](./LICENSE).
