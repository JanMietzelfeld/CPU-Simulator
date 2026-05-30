import { readFileSync } from 'fs';
import { Assembler } from '../main/simulator/Assembler';
import { DoubleWord } from '../types/binary/DoubleWord';
import { disassemble } from '../main/simulator/Disassembler';

describe('Disassemble program', () => {
    const assembler = new Assembler("./settings/language_definition.json", "./os_filesystem");
    
    test('Decode instruction "ADD $1, %EAX"', () => {
        const binary: DoubleWord[] = assembler.assemble("ADD $1, %EAX");
        let result = disassemble(binary);
        expect(result).toEqual("ADD $0x1, %EAX\n");
    });

    test('Decode instruction "MOV $0x64, %EAX"', () => {
        const binary: DoubleWord[] = assembler.assemble("MOV $0x64, %EAX");
        let result = disassemble(binary);
        expect(result).toEqual("MOV $0x64, %EAX\n");
    });

    test('Decode instruction "NOP"', () => {
        const binary: DoubleWord[] = assembler.assemble("NOP");
        let result = disassemble(binary);
        expect(result).toEqual("NOP\n");
    });

    test('Decode instruction "ADD" with negative decimal immediate', () => {
        const binary: DoubleWord[] = assembler.assemble("ADD $-10, %EAX");
        let result = disassemble(binary);
        expect(result).toEqual("ADD $0xfffffff6, %EAX\n");
    });

    test('Decode instruction "ADD" with negative hexadecimal immediate', () => {
        const binary: DoubleWord[] = assembler.assemble("ADD $-0x10, %EAX");
        let result = disassemble(binary);
        expect(result).toEqual("ADD $0xfffffff0, %EAX\n");
    });

    test('Decode instruction "ADD" with negative binary immediate', () => {
        const binary: DoubleWord[] = assembler.assemble("ADD $-0b10, %EAX");
        let result = disassemble(binary);
        expect(result).toEqual("ADD $0xfffffffe, %EAX\n");
    });

    test("Decode assembly programs", () => {        

        let code = `MOV $0x64, %EAX
SUB $0x1, %EAX
CMP $0x0, %EAX
JG @0x4
NOP
MOV $0x12345678, %EDX
MOV $0x11, %EAX
INT $0x80
`;
        const binary: DoubleWord[] = assembler.assemble(readFileSync("./os_filesystem/home/examples/loop.asm", "utf8"));
        let result = disassemble(binary);
        expect(result).toEqual(code);
    });
});