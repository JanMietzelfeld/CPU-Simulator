import {describe, expect, test} from '@jest/globals';
import { RAM } from '../main/simulator/functional_units/RAM';
import { Byte } from '../types/binary/Byte';
import { DoubleWord } from '../types/binary/DoubleWord';

describe("Read and write from or to main memory", () => {
    const mainMemory: RAM = new RAM(Math.pow(2, 32) - 1);

    test("Clear byte", () => {
        mainMemory.clearByte(new DoubleWord(parseInt("0x0", 16)));
        expect(mainMemory.cells).toEqual(new Map<number, Byte>());
    });
    
    test("Write byte to main memory", () => {
        mainMemory.cells.clear();
        mainMemory.writeByteTo(new DoubleWord(parseInt("0x0", 16)), new Byte(0b10011000));
        mainMemory.writeByteTo(new DoubleWord(parseInt("0xFFFFFFFF", 16)), new Byte(0b11111111));
        mainMemory.writeByteTo(new DoubleWord(parseInt("0x1000000", 16)), new Byte(0b10010001));
        expect(mainMemory.cells).toEqual(new Map<number, number>([
            [parseInt("0x0", 16), new Byte(0b10011000).value],
            [parseInt("0xFFFFFFFF", 16), new Byte(0b11111111).value],
            [parseInt("0x1000000", 16), new Byte(0b10010001).value]
        ]));
    });

    test("Write doubleword to main memory", () => {
        mainMemory.cells.clear();
        const doubleword = new DoubleWord(0b11011001001011101010000101100000);
        mainMemory.writeDoubleWordTo(new DoubleWord(parseInt("0x0", 16)), doubleword);
        expect(mainMemory.cells).toEqual(new Map<number, number>([
            [parseInt("0x0", 16), new Byte(0b11011001).value],
            [parseInt("0x1", 16), new Byte(0b00101110).value],
            [parseInt("0x2", 16), new Byte(0b10100001).value],
            [parseInt("0x3", 16), new Byte(0b01100000).value]
        ]));
    });

    test("Read single byte from memory address", () => {
        const result: Byte = mainMemory.readByteFrom(new DoubleWord(parseInt("0x0", 16)));
        const byteExpected = new Byte(0b11011001);
        expect(result).toEqual(byteExpected);
    });

    test("Read single byte from a previously unused memory address", () => {
        const result: Byte = mainMemory.readByteFrom(new DoubleWord(parseInt("0xFFFF", 16)));
        const byteExpected = new Byte(0);
        expect(result).toEqual(byteExpected);
    });

    test("Read doubleword from memory address", () => {
        const result: DoubleWord = mainMemory.readDoublewordFrom(new DoubleWord(parseInt("0x0", 16)));
        const expectedDoubleword: DoubleWord = new DoubleWord(0b11011001001011101010000101100000);
        expect(result).toEqual(expectedDoubleword);
    });

    test("Read doubleword from a previously unused memory address", () => {
        mainMemory.cells.clear();
        const result: DoubleWord = mainMemory.readDoublewordFrom(new DoubleWord(0xFFFF));
        const expectedDoubleword: DoubleWord = new DoubleWord(0);
        expect(result).toEqual(expectedDoubleword);
    });

    test("Read doubleword from partially unused memory address", () => {
        mainMemory.cells.clear();
        const doubleword = new DoubleWord(0b11011001001011101010000101100000);
        mainMemory.writeDoubleWordTo(new DoubleWord(parseInt("0x0", 16)), doubleword);
        const result: DoubleWord = mainMemory.readDoublewordFrom(new DoubleWord(parseInt("0x3", 16)));
        const expectedDoubleword: DoubleWord = new DoubleWord(0b01100000000000000000000000000000);

        expect(result).toEqual(expectedDoubleword);
    });
});