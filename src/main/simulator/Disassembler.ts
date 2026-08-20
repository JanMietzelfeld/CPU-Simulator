import { Byte } from "../../types/binary/Byte";
import { DoubleWord } from "../../types/binary/DoubleWord";
import { InstructionOperand } from "../../types/binary/InstructionOperand";
import { DecodedOperandTypes } from "../../types/enumerations/DecodedOperandTypes";
import { EncodedOperandTypes } from "../../types/enumerations/EncodedOperandTypes";
import { OpCode } from "../../types/enumerations/OpCode";
import { RegisterNumbers } from "../../types/enumerations/RegisterNumbers";

export function disassemble(program: DoubleWord[]): string {

    let disassembledCode = "";

    if (program.length < 24) {
        throw new Error("File is not a valid executable. File too small.")
    }

    if (program[0] !== 0x7F_49_43_45) {
        throw new Error("File is not a valid executable.")
    }

    const header: DoubleWord[] = program.slice(program[1] / DoubleWord.NUMBER_OF_BYTES, program[1] / DoubleWord.NUMBER_OF_BYTES + 16);

    for (let i = 0; i < header[6] / DoubleWord.NUMBER_OF_BYTES; i++) {
        disassembledCode += ".CONST CONSTANT_" + (i + 1) + " " + program[header[2] / DoubleWord.NUMBER_OF_BYTES + i] + "\n";
    }

    for (let i = 0; i < header[9] / DoubleWord.NUMBER_OF_BYTES; i++) {
        disassembledCode += ".variable_" + (i + 1) + " " + program[header[5] / DoubleWord.NUMBER_OF_BYTES + i] + "\n";
    }

    if (header[11] !== 0)
    {
        disassembledCode += ".BUF" + program[header[9]] + " buffer\n";
    }

    program = program.slice(program[1] / DoubleWord.NUMBER_OF_BYTES + 16, program[1] / DoubleWord.NUMBER_OF_BYTES + 16 + header[3] / DoubleWord.NUMBER_OF_BYTES);

    for (let i = 0; i < program.length; i++) {

        const operationHeader = program[i];
        
        // Split instruction into its components.
        const encodedOpCode: Byte =  DoubleWord.getFirstByte(operationHeader);
        const encodedFirstOperandType: number =  DoubleWord.getBitRange(operationHeader, 8, 12);
        const encodedSecondOperandType: number =  DoubleWord.getBitRange(operationHeader, 12, 16);
        // Decode instruction.
        // Decode instruction type.

        if (!(encodedOpCode in OpCode)) {
            throw new Error("Invalid Opcode at position: " + i + " with the value of:" + operationHeader);
        }

        const decodedOpCode: OpCode = encodedOpCode as OpCode;

        // Decode type of first operand.

        if (!(encodedFirstOperandType in EncodedOperandTypes)) {
            throw new Error("Invalid Opcode at position: " + i + " with the value of:" + operationHeader);
        }

        let decodedFirstOperandType: EncodedOperandTypes = encodedFirstOperandType as EncodedOperandTypes;
   
        // Decode type of second operand.

        if (!(encodedSecondOperandType in EncodedOperandTypes)) {
            throw new Error("Invalid Opcode at position: " + i + " with the value of:" + operationHeader);
        }

        let decodedSecondOperandType: EncodedOperandTypes = encodedSecondOperandType as EncodedOperandTypes;
   
        let decodedFirstOperand: InstructionOperand | null;
        let decodedSecondOperand: InstructionOperand | null;

        let addPaddingForFirstOperand = false;
        let addPaddingForSecondOperand = false

        switch (decodedFirstOperandType) {
            case EncodedOperandTypes.PADDING:
                decodedFirstOperandType ^= 0b1000; 
                i++;
                addPaddingForFirstOperand = true;
                // fallthrough
            case EncodedOperandTypes.NO:
                decodedFirstOperand = null;
                break;
            case EncodedOperandTypes.EMBEDDED_IMMEDIATE:
            case EncodedOperandTypes.EMBEDDED_MEMORY_ADDRESS:
                decodedFirstOperandType ^= 0b1000; 
                // fallthrough
            case EncodedOperandTypes.REGISTER_DIRECT:
            case EncodedOperandTypes.REGISTER_INDIRECT:
                decodedFirstOperand = new InstructionOperand(
                    decodedFirstOperandType as DecodedOperandTypes,
                    DoubleWord.fromNumber(DoubleWord.getThirdByte(operationHeader))
                );
                break;
            case EncodedOperandTypes.MEMORY_ADDRESS:
            case EncodedOperandTypes.IMMEDIATE:
                decodedFirstOperand = new InstructionOperand(
                    decodedFirstOperandType,
                    program[i+1]
                );
                i++;
                if (decodedFirstOperand.value < 256) {
                    addPaddingForFirstOperand = true;
                }
                break;
            case EncodedOperandTypes.EXTERNAL_REGISTER_DIRECT:
            case EncodedOperandTypes.EXTERNAL_REGISTER_INDIRECT:
                decodedFirstOperandType ^= 0b1000; 
                decodedFirstOperand = new InstructionOperand(
                    decodedFirstOperandType as DecodedOperandTypes,
                    program[i+1]
                );
                i++;
                if (decodedFirstOperand.value < 256) {
                    addPaddingForFirstOperand = true;
                }
                break;
            default:
                decodedFirstOperand = null;
                break;
        }

        switch (decodedSecondOperandType) {
            case EncodedOperandTypes.PADDING:
                decodedSecondOperandType ^= 0b1000; 
                i++
                addPaddingForSecondOperand = true;
                // fallthrough
            case EncodedOperandTypes.NO:
                decodedSecondOperand = null;
                break;
            case EncodedOperandTypes.EMBEDDED_IMMEDIATE:
            case EncodedOperandTypes.EMBEDDED_MEMORY_ADDRESS:
                decodedSecondOperandType ^= 0b1000; 
                // fallthrough
            case EncodedOperandTypes.REGISTER_DIRECT:
            case EncodedOperandTypes.REGISTER_INDIRECT:
                decodedSecondOperand = new InstructionOperand(
                    decodedSecondOperandType as DecodedOperandTypes,
                    DoubleWord.fromNumber(DoubleWord.getFourthByte(operationHeader))
                );
                break;
            case EncodedOperandTypes.MEMORY_ADDRESS:
            case EncodedOperandTypes.IMMEDIATE:
                decodedSecondOperand = new InstructionOperand(
                    decodedSecondOperandType,
                    program[i+1]
                );
                i++;
                if (decodedSecondOperand.value < 256) {
                    addPaddingForSecondOperand = true;
                }
                break;
            case EncodedOperandTypes.EXTERNAL_REGISTER_DIRECT:
            case EncodedOperandTypes.EXTERNAL_REGISTER_INDIRECT:
                decodedSecondOperandType ^= 0b1000; 
                decodedSecondOperand = new InstructionOperand(
                    decodedSecondOperandType as DecodedOperandTypes,
                    program[i+1]
                );
                i++;
                if (decodedSecondOperand.value < 256) {
                    addPaddingForSecondOperand = true;
                }
                break;
            default:
                decodedSecondOperand = null;
                break;
        }

        disassembledCode += OpCode[decodedOpCode];

        if (decodedFirstOperand !== null) {
            if (decodedFirstOperandType === EncodedOperandTypes.IMMEDIATE) {
                disassembledCode += " $0x" + decodedFirstOperand.value.toString(16);
            } else if (decodedFirstOperandType === EncodedOperandTypes.MEMORY_ADDRESS) {
                disassembledCode += " @0x" + decodedFirstOperand.value.toString(16);
            } else {

                if (decodedFirstOperandType === EncodedOperandTypes.REGISTER_INDIRECT) {
                    disassembledCode += " *%" + RegisterNumbers[decodedFirstOperand.value];
                } else {
                    disassembledCode += " %" + RegisterNumbers[decodedFirstOperand.value];
                }
            }
        }

        if (decodedSecondOperand !== null) {
            if (decodedSecondOperandType === EncodedOperandTypes.IMMEDIATE) {
                disassembledCode += ", $0x" + decodedSecondOperand.value.toString(16);
            } else if (decodedSecondOperandType === EncodedOperandTypes.MEMORY_ADDRESS) {
                disassembledCode += ", @0x" + decodedSecondOperand.value.toString(16);
            } else {
                if (decodedSecondOperandType === EncodedOperandTypes.REGISTER_INDIRECT) {
                    disassembledCode += ", *%" + RegisterNumbers[decodedSecondOperand.value];
                } else {
                    disassembledCode += ", %" + RegisterNumbers[decodedSecondOperand.value];
                }
            }
        }
            
        disassembledCode += "\n";

        if (addPaddingForFirstOperand)
        {
            disassembledCode += "NOP\n";
        }

        if (addPaddingForSecondOperand)
        {
            disassembledCode += "NOP\n";
        }
    }

    return disassembledCode;
};