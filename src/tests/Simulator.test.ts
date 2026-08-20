
import { CPUCore } from "../main/simulator/execution_units/CPUCore";
import { SimulationController } from "../main/simulator/SimulationController";
import { DoubleWord } from "../types/binary/DoubleWord";

describe('Test Simulator', () => {
  test('loop program', () => {
    console.time("total");

    console.time("init");
    const simulator: SimulationController =
      SimulationController.getInstanceOrCreate(
        2 ** 32,
        "./settings/language_definition.json",
        "./os_filesystem"
      );
    console.timeEnd("init");

    console.log(CPUCore.instructionCount);

    console.time("load");
    simulator.createProcess(simulator.pathToOSFilesystem + "/home/examples/loop.asm");
    console.timeEnd("load");

    console.time("execution");

    while (simulator.core.edx.content !== 0x12345678 as DoubleWord) {
      simulator.core.cycle();
    }

    console.timeEnd("execution");

    console.timeEnd("total");

    console.log(CPUCore.instructionCount);

    expect(simulator.core.eax.content).toEqual(DoubleWord.ZERO);
  });
});