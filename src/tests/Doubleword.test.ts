import { EFLAGS } from "../main/simulator/functional_units/EFLAGS";
import { ArithmeticLogicUnit } from "../main/simulator/execution_units/ArithmeticLogicUnit";
import { DoubleWord } from "../types/binary/DoubleWord";

describe("Create doubleword from decimal integer values", () => {
    test("Create doubleword from decimal -6", () => {
        expect(new DoubleWord(-6).toString()).toBe("11111111111111111111111111111010");
    });

    test("Create doubleword from decimal -300", () => {
        expect(new DoubleWord(-300).toString()).toBe("11111111111111111111111011010100");
    });

    test("Group bytes in doubleword string", () => {
        expect(new DoubleWord(8).toString()).toBe("00000000000000000000000000001000");
    });

    test("Create doubleword from positive decimal integer value", () => {
        expect(new DoubleWord(6).toString()).toBe("00000000000000000000000000000110");
    });

    test("Check wether (8)_10 is smaller than (11)_10", () => {
        expect(new DoubleWord(8).value < new DoubleWord(11).value).toBe(true);
    });

    test("Check wether (-1)_10 is smaller than (1)_10", () => {
        expect(new DoubleWord(-1).value > new DoubleWord(1).value).toBe(true);
    });

    test("Check wether (-1)_10 is smaller than (-2)_10", () => {
        expect(new DoubleWord(-1).value < new DoubleWord(-2).value).toBe(false);
    });

    test("Check wether (100)_10 is smaller than (11)_10", () => {
        expect(new DoubleWord(100).value < new DoubleWord(11).value).toBe(false);
    });

    test("Measure toNumber() performance", () => {
        const alu: ArithmeticLogicUnit = new ArithmeticLogicUnit(new EFLAGS())
        const repetitions = 100000;
        //const one = DoubleWord.fromInteger(1)
        let dword = new DoubleWord(0)
        for (let i = 0; i < repetitions; i++) {
            expect(dword.value).toBe(i)
            dword = alu.add(dword, new DoubleWord(1))
        }
        expect(dword.value).toBe(repetitions);
    });
});