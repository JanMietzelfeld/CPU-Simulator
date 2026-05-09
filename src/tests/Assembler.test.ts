import { readFileSync } from 'fs';
import { Assembler } from '../main/simulator/Assembler';
import { DoubleWord } from '../types/binary/DoubleWord';

describe('Encode instructions', () => {
    const assembler = new Assembler("./settings/language_definition.json", "./os_filesystem");
    
    test('Encode instruction "ADD $1, %eax"', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $1, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_00010010_00000001_00000000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "MOV $0x64, %eax"', () => {
        const result: DoubleWord[] = assembler.assemble("MOV $0x64, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00010010_00010010_01100100_00000000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "NOP"', () => {
        const result: DoubleWord[] = assembler.assemble("NOP");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b11111111_00000000_00000000_00000000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "ADD" with negative decimal immediate', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $-10, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_10010010_00000000_00000000),
            DoubleWord.fromNumber(0b11111111111111111111111111110110),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "ADD" with negative hexadecimal immediate', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $-0x10, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_10010010_00000000_00000000),
            DoubleWord.fromNumber(0b11111111111111111111111111110000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "ADD" with negative binary immediate', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $-0b10, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_10010010_00000000_00000000),
            DoubleWord.fromNumber(0b11111111111111111111111111111110)
        ];
        expect(result).toEqual(expectedOutput);
    });

    test("Encode assembly programs", () => {        
        const result: DoubleWord[] = assembler.assemble(readFileSync("./os_filesystem/home/examples/loop.asm", "utf8"));
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0x12126400),

            DoubleWord.fromNumber(34734336),

            DoubleWord.fromNumber(118620160),

            DoubleWord.fromNumber(247463936),
            DoubleWord.fromNumber(4),

            DoubleWord.fromNumber(311558147),
            DoubleWord.fromNumber(305419896),

            DoubleWord.fromNumber(303173888),
            
            DoubleWord.fromNumber(454066176)
        ];
        expect(result).toEqual(expectedOutput);
    });
});