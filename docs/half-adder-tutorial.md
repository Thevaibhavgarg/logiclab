# Build your first circuit: a half adder

A half adder adds two one-bit inputs, **A** and **B**. Its **Sum** output is
`A XOR B`, and its **Carry** output is `A AND B`.

## Try the included example

1. Follow the [setup instructions](../README.md#getting-started) and start LogicLab.
2. Click **Import** in the toolbar and select
   [half-adder.logiclab.json](../examples/half-adder.logiclab.json) from your clone.
   Import replaces the current circuit, so save or export your work first.
3. The canvas will show two input switches, an XOR gate, an AND gate, and two LEDs.
4. Click the A and B switches to try all four combinations. Green indicates `1`.

## Build it yourself

1. Click **New** and confirm. Name the circuit `Half Adder` in the toolbar.
2. Drag two **Input Switch** components, one **XOR**, one **AND**, and two
   **Output LED** components from the toolbox onto the canvas.
3. Select each input and output node and edit its label in **Properties**:
   name the inputs `A` and `B`, and the outputs `Sum` and `Carry`.
4. Drag from each input's right-hand output handle to a left-hand input handle
   on each gate:

   | Source | Destination |
   | --- | --- |
   | A | XOR upper input |
   | B | XOR lower input |
   | A | AND upper input |
   | B | AND lower input |
   | XOR output | Sum input |
   | AND output | Carry input |

   One output can feed both gates. Each gate input accepts one wire.
5. Toggle A and B and compare the LEDs with the table below.

## Check the results

| A | B | Sum | Carry |
| --- | --- | --- | --- |
| 0 | 0 | 0 | 0 |
| 0 | 1 | 1 | 0 |
| 1 | 0 | 1 | 0 |
| 1 | 1 | 0 | 1 |

Open **Truth Table** and click **Generate Truth Table**. Output columns are
sorted alphabetically, so the app shows **Carry** before **Sum**. The highlighted
row represents the inputs at generation time; generate again after toggling inputs.

## Keep and share your circuit

- Click **Save** to store the circuit in this browser. Saving with the same name
  replaces that named save.
- Click **Load** to find it in the **Saved** panel.
- Click **Export** to download a `.logiclab.json` file that someone else can import.
  Browser saves are local to the browser and site address; export a backup before
  clearing browser storage or switching devices.
