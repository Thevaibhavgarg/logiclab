# LogicLab

LogicLab is a browser-based logic circuit simulator. Build circuits by connecting logic gates, input switches, and output LEDs on an interactive canvas. See signals update as you change inputs, and generate truth tables for combinational circuits.

[Try LogicLab online](https://thevaibhavgarg.github.io/logiclab/) without installing anything.

## Features

- Drag-and-drop circuit editor with a zoomable, pannable canvas
- AND, OR, NOT, XOR, NAND, and NOR logic gates
- Input switches and output LEDs
- SR latches and D flip-flops for sequential circuits
- Live signal simulation and node signal inspection
- Truth-table generation for combinational circuits with up to 10 inputs
- Save circuits in your browser, or import and export circuits as JSON files

## Requirements

- [Node.js](https://nodejs.org/) 22.12+ (Node 22 or a newer supported LTS release)
- npm (included with Node.js)

## Getting started

1. Clone the repository and open its directory:

   ```bash
   git clone https://github.com/Thevaibhavgarg/logiclab.git
   cd logiclab
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

4. Open the local URL printed by Vite in your browser.

## Using LogicLab

1. Drag components from the left-hand toolbox onto the canvas.
2. Connect an output handle to an input handle to wire components together.
3. Click an input switch to toggle it between `0` and `1`. Signals propagate through the circuit automatically.
4. Select a node to inspect its inputs and outputs in the Properties panel. You can edit its label there.
5. To generate a truth table, add at least one Input and one Output node, open the **Truth Table** tab, and select **Generate Truth Table**. Truth tables are limited to 10 inputs and are not available for circuits containing sequential components.
6. To keep a circuit, enter a name in the toolbar and select **Save**. Use **Load** to access circuits saved in this browser. Saves are stored in the browser's local storage.
7. Use **Export** to download a circuit as a JSON file, or **Import** to load a previously exported JSON file.

Select a node or wire and press **Delete** or **Backspace** to remove it. Select **New** to clear the canvas; the app asks for confirmation first.

For sequential circuits, D flip-flops capture on a rising clock edge (`0` to `1`).
Latch and flip-flop state changes propagate through downstream gates during the
same simulation update. Chained flip-flops sample the previous state on that edge.

## Example and tutorial

Start with the [half-adder tutorial](./docs/half-adder-tutorial.md) to learn wiring,
input toggling, truth tables, and saving. You can also import the ready-made
[half-adder circuit](./examples/half-adder.logiclab.json) using the toolbar's **Import** button.

## Available commands

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run build` | Type-check the project and create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run Oxlint |
| `npm test` | Run simulator, sequential-state, and truth-table tests |

## Built with

React, TypeScript, Vite, React Flow, Zustand, and Tailwind CSS.

## Deployment

The [GitHub Actions workflow](./.github/workflows/ci.yml) deploys to
[GitHub Pages](https://thevaibhavgarg.github.io/logiclab/) after tests, linting,
and the build succeed on `main`. Pull requests run checks but do not deploy.

For your own fork, enable **Settings → Pages → Source → GitHub Actions**.
The Vite base path is `/logiclab/`; update `base` in [vite.config.ts](./vite.config.ts)
if you rename the repository, or use `/` for a root-level custom domain.
The deployed files come from `dist/`, not the source directory.

Circuit saves belong to each visitor's browser and site address. Use
**Export/Import** to transfer circuits between local development and the hosted site.

## Contributing

Contributions and bug reports are welcome. Open an issue to describe a bug or propose a change, or submit a pull request with a clear summary of the work.

Read the [contribution guide](./CONTRIBUTING.md) for setup, testing, and pull
request instructions. Please follow our [Code of Conduct](./CODE_OF_CONDUCT.md)
when participating.

Before submitting a pull request, run `npm test`, `npm run lint`, and
`npm run build`. Add a regression test when fixing simulator behavior.

The [CI workflow](./.github/workflows/ci.yml) runs these checks on pushes to
`main` and on pull requests. It can also be run manually from GitHub's **Actions** tab.

## License

This project is licensed under the MIT License. See [LICENSE](./LICENSE) for details.
