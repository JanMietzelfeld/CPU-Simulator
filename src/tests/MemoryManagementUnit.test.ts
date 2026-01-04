import { ArithmeticLogicUnit } from "../main/simulator/execution_units/ArithmeticLogicUnit";
import { MemoryManagementUnit } from "../main/simulator/execution_units/MemoryManagementUnit";
import { EFLAGS } from "../main/simulator/functional_units/EFLAGS";
import { PointerRegister } from "../main/simulator/functional_units/PointerRegister";
import { RAM } from "../main/simulator/functional_units/RAM";
import { Byte } from "../types/binary/Byte";
import { DoubleWord } from "../types/binary/DoubleWord";

describe("Read from and write to main memory using MMU as proxy", () => {
    const mainMemory = new RAM(Math.pow(2, 32));
    const flags: EFLAGS = new EFLAGS();
    const mmu = new MemoryManagementUnit(mainMemory, new PointerRegister("PTP"), new ArithmeticLogicUnit(flags), flags);

    test("Write byte to main memory", () => {
        mainMemory.cells.clear();
        const virtualAddress = new DoubleWord(0xFFFFFFFF);
        mmu.writeByteTo(virtualAddress, new Byte(-128));

        expect(mainMemory.cells).toEqual(new Map<number, number>([
            [0xFFFFFFFF, new Byte(-128).value]
        ]));
    });

    test("Write doubleword to main memory", () => {
        mainMemory.cells.clear();
        const virtualAddress = new DoubleWord(0x1000000);
        mmu.writeDoublewordTo(
            virtualAddress, 
            new DoubleWord(0b01101100_10010111_01010000_10110000),
            false
        );
        expect(mainMemory.cells).toEqual(new Map<number, number>([
            [0x1000000, new Byte(0b01101100).value],
            [0x1000001, new Byte(0b10010111).value],
            [0x1000002, new Byte(0b01010000).value],
            [0x1000003, new Byte(0b10110000).value]
        ]));
    });

    test("Read single byte from memory address", () => {
        const virtualAddress: DoubleWord = new DoubleWord(parseInt("0x1000000", 16));
        const result: Byte = mmu.readByteFrom(virtualAddress);
        expect(result.toString()).toBe("01101100");
    });

    test("Read single byte from a previously unused memory address", () => {
        const virtualAddress: DoubleWord = new DoubleWord(parseInt("0xFFFF", 16));
        const result: Byte = mmu.readByteFrom(virtualAddress);
        expect(result.toString()).toBe("00000000");
    });

    test("Read doubleword from memory address", () => {
        mainMemory.cells.clear();
        let virtualAddress = new DoubleWord(0);
        mmu.writeDoublewordTo(
            virtualAddress, 
            new DoubleWord(0b01101100100101110101000010110000),
            false
        );
        virtualAddress = new DoubleWord(0);
        const result: DoubleWord = mmu.readDoublewordFrom(virtualAddress, false);
        expect(result.value).toBe(0b01101100100101110101000010110000);
    });

    test("Read doubleword from a previously unused memory address", () => {
        const virtualAddress: DoubleWord = new DoubleWord(parseInt("0xFFFF", 16));
        const result: DoubleWord = mmu.readDoublewordFrom(virtualAddress, false);
        expect(result.toString()).toBe("00000000000000000000000000000000");
    });

    test("Read doubleword from partially unused memory address", () => {
        const virtualAddress: DoubleWord = new DoubleWord(parseInt("0x3", 16));
        const result: DoubleWord = mmu.readDoublewordFrom(virtualAddress, false);
        expect(result.toString()).toBe("10110000000000000000000000000000");
    });
});