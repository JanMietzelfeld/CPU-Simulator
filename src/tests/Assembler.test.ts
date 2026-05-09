import { readFileSync } from 'fs';
import { Assembler } from '../main/simulator/Assembler';
import { DoubleWord } from '../types/binary/DoubleWord';

describe('Encode instructions', () => {
    const assembler = new Assembler("./settings/language_definition.json", "./os_filesystem");
    
    test('Encode instruction "ADD $1, %eax"', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $1, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_00100011_00000001_00000000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "MOV $0x64, %eax"', () => {
        const result: DoubleWord[] = assembler.assemble("MOV $0x64, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00010010_00100011_01100100_00000000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "NOP"', () => {
        const result: DoubleWord[] = assembler.assemble("NOP");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b11111111_00010001_00000000_00000000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "ADD" with negative decimal immediate', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $-10, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_10100011_00000000_00000000),
            DoubleWord.fromNumber(0b11111111111111111111111111110110),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "ADD" with negative hexadecimal immediate', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $-0x10, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_10100011_00000000_00000000),
            DoubleWord.fromNumber(0b11111111111111111111111111110000),
        ];
        expect(result).toEqual(expectedOutput);
    });

    test('Encode instruction "ADD" with negative binary immediate', () => {
        const result: DoubleWord[] = assembler.assemble("ADD $-0b10, %eax");
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0b00000000_10100011_00000000_00000000),
            DoubleWord.fromNumber(0b11111111111111111111111111111110)
        ];
        expect(result).toEqual(expectedOutput);
    });

    test("Encode assembly programs", () => {        
        const result: DoubleWord[] = assembler.assemble(readFileSync("./os_filesystem/home/examples/loop.asm", "utf8"));
        const expectedOutput: DoubleWord[] = [
            DoubleWord.fromNumber(0x12236400),

            DoubleWord.fromNumber(35848448),

            DoubleWord.fromNumber(119734272),

            DoubleWord.fromNumber(248578048),
            DoubleWord.fromNumber(4),

            DoubleWord.fromNumber(312672259),
            DoubleWord.fromNumber(305419896),

            DoubleWord.fromNumber(304288000),
            
            DoubleWord.fromNumber(455180288),
        ];
        expect(result).toEqual(expectedOutput);
    });
});