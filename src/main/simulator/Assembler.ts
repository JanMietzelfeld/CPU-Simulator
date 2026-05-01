import { readFileSync } from "node:fs";
import { UnrecognizedInstructionError } from "../../types/errors/UnrecognizedInstructionError";
import { AssemblyInstruction, AssemblyLanguageDefinition } from "./compiler/AssemblyLanguageDefinition";
import { DoubleWord } from "../../types/binary/DoubleWord";
import { Byte } from "../../types/binary/Byte";
import { OpCode } from "../../types/enumerations/OpCode";
import { EncodedOperandTypes } from "../../types/enumerations/EncodedOperandTypes";

export class Assembler {
	private static readonly NEW_LINE_REGEX: RegExp = /\r?\n|\r/gim;
	public readonly languageDefinition: AssemblyLanguageDefinition;
 	public readonly pathToOSFilesystem: string
	/**
	 * Constructs a new assembler object with the given processing width.
	 * @param pathToLanguageDefinition The path to the language definition file of the assembly language used by this assembler.
	 * @param pathToOSFilesystem 
	 */
	public constructor(pathToLanguageDefinition: string, pathToOSFilesystem: string) {
		this.languageDefinition = JSON.parse(readFileSync(pathToLanguageDefinition, "utf-8"));
		this.pathToOSFilesystem = pathToOSFilesystem;
	}

	/**
	 * This method preprocesses the file contents of a computer program written in assembly language.
	 * It removes all comments, leading and trailing whitespace and splits the file contents into seperate lines of code.
	 * It also replaces all include labels with the file content.
	 * The line order is preserved.
	 * @param fileContents A string containing the contents of a computer program written in assembly language.
	 * @returns A map, which maps line numbers to strings representing the original programs lines of code.
	 */
	private preprocess(fileContents: string): Map<number, string> {
		const lines: Map<number, string> = new Map();

		const includedContent: string = this.replaceIncludeLabels(fileContents);

		// Split file contents into lines of code, remove comments and mark empty lines for deletion
		const commentRegex = new RegExp(this.languageDefinition.comment_format, "gim");
		includedContent.split(Assembler.NEW_LINE_REGEX).forEach((line, lineNo) => {
			const lineWithoutComment: string = line.trim().replace(commentRegex, "");
			if (lineWithoutComment.length !== 0) {
				// Store line of code in map.
				lines.set(lineNo, lineWithoutComment);
			}
			
		});
		return lines;
	}

	/**
	 * This preprocesses method replaces a include label with the contents of the declared file.
	 * Include labels present in the declared assembly file are also replaced recursively.
	 * @param fileContents A string containing the include label.
	 * @returns A string, which contains the content of the file referenced in the include label.
	 */
	private replaceIncludeLabels(fileContents: string): string {

		let includedContent: string = "";

		// Replace the Include with the content
		const includeRegex = new RegExp(this.languageDefinition.include_format, "gim");
		fileContents.split(Assembler.NEW_LINE_REGEX).forEach((line) => {
			
			let lineContent: string = line;
			const regexMatch: RegExpMatchArray | null = includeRegex.exec(line);
			if (regexMatch !== null) {
				// Include found.
				let fileName: string = regexMatch[1];

				let fileContents: string = readFileSync(this.pathToOSFilesystem + "/" + fileName + ".asm", "utf-8");
				fileContents = this.replaceIncludeLabels(fileContents)

				lineContent = line.replace(includeRegex, () => fileContents);
			}

			if (lineContent.length !== 0) {
				includedContent += lineContent + "\n";
			}			
		});

		return includedContent;
	}

	/**
	 * This method encodes the reduced assembly program to its binary equivalent.
	 * @param lines A map, which maps line numbers to strings representing the original programs lines of code.
	 * @param baseOffset Base address where the program will be in memory. Default is 0.
	 * @returns An array of doublewords representing the encoded instructions and their operands of the assembly program.
	 */
	private encode(lines: Map<number, string>, baseOffset: number = 0): DoubleWord[] {

		// First pass (Locate all symbols (constants, global variables, labels))

		const jumpLabels: Map<string, string | number> = new Map();
		const constants: Map<string, string | number> = new Map();
		const variables: Map<string, string | number> = new Map();

		this.locateSymbols(lines, jumpLabels, constants, variables);

		// Second pass (encode all possible lines)
		let byteCount = baseOffset;
		const encodedInstructionsWithSymbols: Map<number, DoubleWord[] | String> = new Map();
		for (const [lineNo, line] of lines.entries()) {
			const encodedLine = this.encodeLine(lineNo, line, jumpLabels, constants, variables, byteCount);
			if (typeof encodedLine === "number") {
				encodedInstructionsWithSymbols.set(lineNo, line);
				for (const [jumpLabel, value] of jumpLabels.entries()) {
					if (typeof value === "string") {
						continue;
					}
					if (lineNo < value) {
						break;
					}
					jumpLabels.set(jumpLabel, byteCount.toString());
				}
				byteCount += encodedLine;
			} else {
				encodedInstructionsWithSymbols.set(lineNo, encodedLine);
				for (const [jumpLabel, value] of jumpLabels.entries()) {
					if (typeof value === "string") {
						continue;
					}
					if (lineNo < value) {
						break;
					}
					jumpLabels.set(jumpLabel, byteCount.toString());
				}
				byteCount += encodedLine.length * DoubleWord.NUMBER_OF_BYTES;
			}
		}


		// Third pass (decode all lines with unresolved dependencies)
		if (Array.from(encodedInstructionsWithSymbols.values()).some(v => typeof v === "string")) {
			byteCount = baseOffset;
			for (const [lineNo, line] of encodedInstructionsWithSymbols.entries()) {

				if (typeof line !== "string") {
					byteCount += line.length * DoubleWord.NUMBER_OF_BYTES;
					continue;
				}

				const encodedLine = this.encodeLine(lineNo, line, jumpLabels, constants, variables, byteCount, false);
				if (typeof encodedLine === "number") {
					throw new Error("Could not encode the jump label in line:" + line);
				} else {
					encodedInstructionsWithSymbols.set(lineNo, encodedLine);
					byteCount += encodedLine.length * DoubleWord.NUMBER_OF_BYTES;
				}
			}
		}

		return Array.from(encodedInstructionsWithSymbols.values())
				.filter((v): v is DoubleWord[] => Array.isArray(v))
				.flat();
	}

	/**
	 * This method encodes a single line of assembly code.
	 * @param lineNo The original computer programs line number of code which is currently encoded.
	 * @param line The original computer programs line of code which is currently encoded.
	 * @param jumpLabels The jump labels found in the assembly code.
	 * @param constants The constants found in the assembly code.
	 * @param variables The constants found in the assembly code.
	 * @returns An array of doublewords representing the encoded instructions and their operands of the assembly program.
	 */
	private encodeLine(lineNo: number, line: string, jumpLabels: Map<string, string | number>, constants: Map<string, string | number>, variables: Map<string, string | number>, byteCount: number, allowPacking: boolean = true) : DoubleWord[] | number {
		
		if (line.match(new RegExp(this.languageDefinition.constant_formats.declarationString, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.constant_formats.declarationString, "gim");
			const regexMatch = regexExp.exec(line);
			if (regexMatch === null) {
				throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
			}
			const name = regexMatch[1];
			const value = regexMatch[2];

			if (constants.has(name)) {
				let address = constants.get(name)!;
				let encodedString = this.encodeString(lineNo, line, value);
				if (typeof address === "number") {
					address = (byteCount + DoubleWord.NUMBER_OF_BYTES).toString();
				}

				let jumpInstruction:string = "JMP @" + (parseInt(address) + encodedString.length*DoubleWord.NUMBER_OF_BYTES).toString();
				let encodedInstruction: DoubleWord[] = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];

				if (encodedInstruction.length !== 1)
				{
					address = (parseInt(address) + ((encodedInstruction.length-1)*DoubleWord.NUMBER_OF_BYTES)).toString();
					jumpInstruction = "JMP @" + (parseInt(address) + encodedString.length*DoubleWord.NUMBER_OF_BYTES).toString();
					encodedInstruction = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];
				}
					
				constants.set(name, address);
				encodedInstruction.push(...encodedString);	
				return encodedInstruction;
			}
			throw new UnrecognizedInstructionError(`Unrecognized constant found in line ${lineNo + 1}: ${line}`);
		}
		if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationString, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationString, "gim");
			const regexMatch = regexExp.exec(line);
			if (regexMatch === null) {
				throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
			}
			const name = regexMatch[1];
			const value = regexMatch[2];
			if (variables.has(name)) {
				let address = variables.get(name)!;
				let encodedString = this.encodeString(lineNo, line, value);
				if (typeof address === "number") {
					address = (byteCount + DoubleWord.NUMBER_OF_BYTES).toString();
				}

				let jumpInstruction:string = "JMP @" + (parseInt(address) + encodedString.length*DoubleWord.NUMBER_OF_BYTES).toString();
				let encodedInstruction: DoubleWord[] = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];

				if (encodedInstruction.length !== 1)
				{
					address = (parseInt(address) + ((encodedInstruction.length-1)*DoubleWord.NUMBER_OF_BYTES)).toString();
					jumpInstruction = "JMP @" + (parseInt(address) + encodedString.length*DoubleWord.NUMBER_OF_BYTES).toString();
					encodedInstruction = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];
				}
					
				variables.set(name, address);
				encodedInstruction.push(...encodedString);	
				return encodedInstruction;
			}
			throw new UnrecognizedInstructionError(`Unrecognized variable found in line ${lineNo + 1}: ${line}`);
		}
		if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationBinary, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationBinary, "gim");
			const regexMatch = regexExp.exec(line);
			if (regexMatch === null) {
				throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
			}
			const name = regexMatch[1];
			const value = regexMatch[2];
			if (variables.has(name)) {
				let address = variables.get(name)!;
				if (typeof address === "number") {
					address = (byteCount + DoubleWord.NUMBER_OF_BYTES).toString();
				}

				let jumpInstruction:string = "JMP @" + (parseInt(address) + DoubleWord.NUMBER_OF_BYTES).toString();
				let encodedInstruction: DoubleWord[] = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];

				if (encodedInstruction.length !== 1)
				{
					address = (parseInt(address) + ((encodedInstruction.length-1)*DoubleWord.NUMBER_OF_BYTES)).toString();
					jumpInstruction = "JMP @" + (parseInt(address) + DoubleWord.NUMBER_OF_BYTES).toString();
					encodedInstruction = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];
				}
					
				variables.set(name, address);
				encodedInstruction.push(this.encodeBinaryValue(value === "" ? "0b0" : value));	
				return encodedInstruction;
			}
		} 
		if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationDecimal, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationDecimal, "gim");
			const regexMatch = regexExp.exec(line);
			if (regexMatch === null) {
				throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
			}
			const name = regexMatch[1];
			const value = regexMatch[2];
			if (variables.has(name)) {
				let address = variables.get(name)!;
				if (typeof address === "number") {
					address = (byteCount + DoubleWord.NUMBER_OF_BYTES).toString();
				}

				let jumpInstruction:string = "JMP @" + (parseInt(address) + DoubleWord.NUMBER_OF_BYTES).toString();
				let encodedInstruction: DoubleWord[] = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];

				if (encodedInstruction.length !== 1)
				{
					address = (parseInt(address) + ((encodedInstruction.length-1)*DoubleWord.NUMBER_OF_BYTES)).toString();
					jumpInstruction = "JMP @" + (parseInt(address) + DoubleWord.NUMBER_OF_BYTES).toString();
					encodedInstruction = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];
				}
					
				variables.set(name, address);
				encodedInstruction.push(this.encodeDecimalValue(value === "" ? "0" : value));	
				return encodedInstruction;
			}
		} 
		if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationHexadecimal, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationHexadecimal, "gim");
			const regexMatch = regexExp.exec(line);
			if (regexMatch === null) {
				throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
			}
			const name = regexMatch[1];
			const value = regexMatch[2];
			if (variables.has(name)) {
				let address = variables.get(name)!;
				if (typeof address === "number") {
					address = (byteCount + DoubleWord.NUMBER_OF_BYTES).toString();
				}

				let jumpInstruction:string = "JMP @" + (parseInt(address) + DoubleWord.NUMBER_OF_BYTES).toString();
				let encodedInstruction: DoubleWord[] = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];

				if (encodedInstruction.length !== 1)
				{
					address = (parseInt(address) + ((encodedInstruction.length-1)*DoubleWord.NUMBER_OF_BYTES)).toString();
					jumpInstruction = "JMP @" + (parseInt(address) + DoubleWord.NUMBER_OF_BYTES).toString();
					encodedInstruction = this.encodeLine(lineNo, jumpInstruction, new Map(), new Map(), new Map(), byteCount) as DoubleWord[];
				}
					
				variables.set(name, address);
				encodedInstruction.push(this.encodeHexadecimalValue(value === "" ? "0x0" : value));	
				return encodedInstruction;
			}
		}
		
		let encodedInstructions: DoubleWord[] | number = 0;
		let lineEncoded = false;

		for (const instruction of this.languageDefinition.instructions) {

			if (!line.trim().startsWith(instruction.mnemonic + " ") && line.trim() !== instruction.mnemonic)
			{
				continue;
			}
			encodedInstructions = this.encodeInstruction(instruction, line, lineNo, jumpLabels, constants, variables, allowPacking);
			lineEncoded = true;
			break;
		}

		if (!lineEncoded) {
			throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
		}

		return encodedInstructions;
	}

	/**
	 * This method locates symbols in the assembly code and stores them in the appropriate map.
	 * For jump labels a map between a jump label and a (virtual) memory address is created and the jump label is removed from the code,
	 * since they won't be translated.
	 * For symbolic integer constants their value is mapped to their symbolic name and for string constants the (virtual) memory start address gets
	 * mapped to their symbolic name.
	 * The lines with symbolic integer constants get removed, since their symbolic name gets replaced by their value later.
	 * For symbolic variables their (virtual) memory start address gets mapped to their symbolic name.
	 * @param lines A map, which maps line numbers to strings representing the original programs lines of code.
	 * @param jumpLabels An empty map, which will be used to store jump labels and their associated (virtual) memory address.
	 * @param constants An empty map, which will be used to store constants and their associated (virtual) memory address or value.
	 * @param variables An empty map, which will be used to store variables and their associated (virtual) memory addresses.
	 */
	private locateSymbols(lines: Map<number, string>, jumpLabels: Map<string, string | number>, constants: Map<string, string | number>, variables: Map<string, string | number>) : void {
		/**
		 * Use this variable in order to count the instructions, that need to be encoded
		 * later, because the keys in the map do not have to be consecutive, as blank lines 
		 * have been removed from the original source text.
		 */
		for (const [lineNo, line] of lines.entries()) {

			if (line.match(new RegExp(this.languageDefinition.variable_formats.dataSegmentStart)) 
				|| line[0].match(new RegExp(this.languageDefinition.variable_formats.dataSegmentEnd))) {
				lines.delete(lineNo);
				continue;
			}
			
			if (line.match(new RegExp(this.languageDefinition.constant_formats.declarationBinary, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.constant_formats.declarationBinary, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					constants.set(regexMatch[1], regexMatch[2]);
					lines.delete(lineNo);
				}
				continue;
			}
			
			if (line.match(new RegExp(this.languageDefinition.constant_formats.declarationDecimal, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.constant_formats.declarationDecimal, "gim");
				const	regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					constants.set(regexMatch[1], regexMatch[2]);
					lines.delete(lineNo);
				}
				continue;
			} 
			
			if (line.match(new RegExp(this.languageDefinition.constant_formats.declarationHexadecimal, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.constant_formats.declarationHexadecimal, "gim");
				const	regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					constants.set(regexMatch[1], regexMatch[2]);
					lines.delete(lineNo);
				}
				continue;
			}
			
			if (line.match(new RegExp(this.languageDefinition.constant_formats.declarationString, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.constant_formats.declarationString, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					constants.set(regexMatch[1], lineNo);
				}
				continue;
			} 
			
			if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationBinary, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationBinary, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					variables.set(regexMatch[1], lineNo);
				}
				continue;
			} 
			
			if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationDecimal, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationDecimal, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					variables.set(regexMatch[1], lineNo);
				}
				continue;
			} 
			
			if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationHexadecimal, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationHexadecimal, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					variables.set(regexMatch[1], lineNo);
				}
				continue;
			} 
			
			if (line.match(new RegExp(this.languageDefinition.variable_formats.declarationString, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.variable_formats.declarationString, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					variables.set(regexMatch[1], lineNo);
				}
				continue;
			} 
			
			if (line.match(new RegExp(this.languageDefinition.label_formats.declaration, "gim"))) {
				const regexExp = new RegExp(this.languageDefinition.label_formats.declaration, "gim");
				const regexMatch = regexExp.exec(line);
				if (regexMatch !== null) {
					jumpLabels.set(regexMatch[1], lineNo+1);
					lines.delete(lineNo);
				}
				continue;
			}
		}
	}

	/**
	 * This method encodes a null terminated string by writing it to memory and adding a jump instruction to the first memory address after the string.
	 * @param lineNo The original computer programs line number of code which is currently encoded.
	 * @param line The original computer programs line of code which is currently encoded.
	 * @param jumpLabels The jump labels found in the assembly code.
	 * @param stringValue The string content.
	 * @param baseAddress The (virtual) memory start address of the string.
	 * @returns An array containing the binary equivalent of the given instruction and its operand values.
	 */
	private encodeString(lineNo: number, line: string, stringValue: string) : DoubleWord[] {
		const encodedString: DoubleWord[] = [];
		let stringEncoded = false; 

		if (!stringValue.endsWith("\0")) {
			stringValue += "\0";
		}

		//Create a buffer from the string in utf8 encoding and calculate some important values.
		const stringBuffer = Buffer.from(stringValue, "utf8");
		const stringByteLength = stringBuffer.length;
		const continuousBufferSegmentSize = stringByteLength - (stringByteLength % 4);
		const restOfBufferSize = stringByteLength % 4;
		//Slice the part of the buffer that is divisible by four (in byte) into 32 bit big segments
		//and encode each segment into binary values.
		if (continuousBufferSegmentSize > 0) {
			for (let i = 0; i < continuousBufferSegmentSize; i += 4) {
				const byte1 = Byte.fromNumber(stringBuffer[i]);
				const byte2 = Byte.fromNumber(stringBuffer[i+1]);
				const byte3 = Byte.fromNumber(stringBuffer[i+2]);
				const byte4 = Byte.fromNumber(stringBuffer[i+3]);
				const encodedStringPart = DoubleWord.fromBytes(byte1, byte2, byte3, byte4);
				encodedString.push(encodedStringPart);
			}
		}
		//Get the last bytes from the buffer
		if (restOfBufferSize > 0) {
			const byte1 = Byte.fromNumber(stringBuffer[continuousBufferSegmentSize]);
			const byte2 = Byte.fromNumber(restOfBufferSize > 1 ? stringBuffer[continuousBufferSegmentSize+1] : 0);
			const byte3 = Byte.fromNumber(restOfBufferSize > 2 ? stringBuffer[continuousBufferSegmentSize+2] : 0);
			const byte4 = Byte.ZERO;
			const encodedStringPart = DoubleWord.fromBytes(byte1, byte2, byte3, byte4);
			encodedString.push(encodedStringPart);
		}
		stringEncoded = true;
		
		if (!stringEncoded) {
			throw new Error(`Error encoding string in line: ${lineNo + 1}: ${line}`);
		}
		return encodedString;
	}

	/**
	 * This method binary encodes a given instruction and its operands values.
	 * It is used for insructions that contain no indirect access to a register with an offset.
	 * @param regexMatchArrayInstruction An array containing the results of a match of a regular expression on an instruction.
	 * @param lineNo The original computer programs line of code which is currently encoded.
	 * @param jumpLabels The jump labels found in the assembly code.
	 * @returns An array containing the binary equivalent of the given instruction and its operand values.
	 */
	private encodeInstruction(instruction: AssemblyInstruction, line: string, lineNo: number, jumpLabels: Map<string, string | number>, constants: Map<string, string | number>, variables: Map<string, string | number>, allowPacking: boolean = true): DoubleWord[] | number {
		let allowPackingOperand1 = true;
		let allowPackingOperand2 = true;

		if (line.match(new RegExp(this.languageDefinition.constant_formats.usage, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.constant_formats.usage, "gim");
			const regexMatch = regexExp.exec(line);

			if (regexMatch !== null && constants.has(regexMatch[2])) {
				if (typeof constants.get(regexMatch[2]) === "number") {
					return (instruction.operands?.length ?? 0)*DoubleWord.NUMBER_OF_BYTES + DoubleWord.NUMBER_OF_BYTES;
				}

				line = line.replace(regexMatch[2], constants.get(regexMatch[2]) as string);
				allowPackingOperand1 = allowPacking;
				allowPackingOperand2 = allowPacking;
			}
		} else if (line.match(new RegExp(this.languageDefinition.variable_formats.usage, "gim"))) {
			const regexExp = new RegExp(this.languageDefinition.variable_formats.usage, "gim");
			const regexMatch = regexExp.exec(line);

			if (regexMatch !== null && variables.has(regexMatch[2])) {
				if (typeof variables.get(regexMatch[2]) === "number") {
					return (instruction.operands?.length ?? 0)*DoubleWord.NUMBER_OF_BYTES + DoubleWord.NUMBER_OF_BYTES;
				}

				line = line.replace(regexMatch[2], variables.get(regexMatch[2]) as string);
				allowPackingOperand1 = allowPacking;
				allowPackingOperand2 = allowPacking;
			}
		}
	
		const operand1: {name: string, allowed_types: string[]} | null = instruction.operands?.[0] ?? null;
		const operand2: {name: string, allowed_types: string[]} | null = instruction.operands?.[1] ?? null;
		let regexMatch: RegExpMatchArray | null = null;
		if (operand1 !== null) {
			/*
			* Iterate over all possible combinations of operand types
			* and check if the resulting regex matches the current line of code.
			*/
			outer: for (const operand1TypeString of operand1.allowed_types) {

				if (operand2 === null) {
					// Locate the operand type of the first operand in the language definition.
					const operand1TypeDefinition: {name: string; code: string; regex: string;}
						= this.languageDefinition.operand_types.find((current) => current.name === operand1TypeString)!;

					const regexInstruction = new RegExp(
						instruction.regex.replace(operand1.name, operand1TypeDefinition.regex),
						"gim"
					);
					// Check if the current line of code matches the created regex.
					regexMatch = regexInstruction.exec(line);
					if (regexMatch !== null) {
						break;
					}
					continue;
				}

				for (const operand2TypeString of operand2.allowed_types) {
					// Create a combination of operand types.
					const typeCombination: { __SOURCE__: string, __TARGET__: string } 
							= { __SOURCE__ : operand1TypeString, __TARGET__ : operand2TypeString };
					// Check if the combination of operand types is forbidden for this instruction.
					if (instruction.illegal_combinations_of_operand_types !== undefined && instruction.illegal_combinations_of_operand_types.includes(typeCombination)) {
						throw new UnrecognizedInstructionError(`Invalid instruction found in line ${lineNo + 1}: ${line}`);
					}
					// Locate the operand type of the first operand in the language definition.
					const operand1TypeDefinition: {name: string; code: string; regex: string;}
						= this.languageDefinition.operand_types.find((current) => current.name === operand1TypeString)!;
					// Locate the operand type of the second operand in the language definition.
					const operand2TypeDefinition: {name: string; code: string; regex: string;}
						= this.languageDefinition.operand_types.find((current) => current.name === operand2TypeString)!;
					// Create a regex for the current combination of operand types.
					const regexInstruction = new RegExp(
						instruction.regex
							.replace(operand1.name, operand1TypeDefinition.regex)
							.replace(operand2.name, operand2TypeDefinition.regex), 
						"gim"
					);
					// Check if the current line of code matches the created regex.
					regexMatch = regexInstruction.exec(line);
					if (regexMatch !== null) {
						break outer;
					}
					continue;
				}
			}
		}
		else {
			regexMatch = new RegExp(instruction.regex, "gim").exec(line);
		}
		
		if (regexMatch === null) { 
			throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${line}`);
		}

		const opcode: number = parseInt(instruction.opcode, 2);
		if (!(opcode in OpCode)) {
			throw new UnrecognizedInstructionError(`Unrecognized or invalid instruction found in line ${lineNo + 1}: ${regexMatch[1]}`);
		}
			
		let handleLabelsAsImmediate = opcode === OpCode.MOV;

		let typeOperand1: EncodedOperandTypes = EncodedOperandTypes.NO;
		let encodedOperandValue1: DoubleWord | null = null;

		if (regexMatch.length > 2) { // Check for first operand
			typeOperand1 = this.encodeOperandType(regexMatch[2], lineNo, handleLabelsAsImmediate);
			if (jumpLabels.has(regexMatch[2])) {
				if (typeof jumpLabels.get(regexMatch[2]) === "number") {
					let hasUnpackedSecondOperand = false;
					if (regexMatch.length > 3) { // Check for second operand
						let type = this.encodeOperandType(regexMatch[3], lineNo, handleLabelsAsImmediate);

						switch (type) {
							case EncodedOperandTypes.REGISTER_DIRECT:
							case EncodedOperandTypes.REGISTER_INDIRECT:
								hasUnpackedSecondOperand = false;
								break;
							case EncodedOperandTypes.IMMEDIATE:
							case EncodedOperandTypes.MEMORY_ADDRESS:
								hasUnpackedSecondOperand = true;
								break;
							default:
								hasUnpackedSecondOperand = false;
								break;
						}
					}
					return DoubleWord.NUMBER_OF_BYTES * 2 + (hasUnpackedSecondOperand ? DoubleWord.NUMBER_OF_BYTES : 0);
				}
				encodedOperandValue1 = DoubleWord.fromNumber(parseInt(jumpLabels.get(regexMatch[2]) as string));
				allowPackingOperand1 = false;
				allowPackingOperand2 = false;
			} else {
				encodedOperandValue1 = this.encodeOperandValue(regexMatch[2], lineNo);
			}
		}

		let embeddedOperand1 = 0;
		let embeddedOperand2 = 0;

		if (encodedOperandValue1 !== null) {

			switch (typeOperand1) {
				case EncodedOperandTypes.REGISTER_DIRECT:
				case EncodedOperandTypes.REGISTER_INDIRECT:
					embeddedOperand1 = encodedOperandValue1;
					encodedOperandValue1 = null
					break;
				case EncodedOperandTypes.IMMEDIATE:
				case EncodedOperandTypes.MEMORY_ADDRESS:
					if (encodedOperandValue1 < 2**Byte.NUMBER_OF_BITS && allowPackingOperand1)
					{
						embeddedOperand1 = encodedOperandValue1;
						encodedOperandValue1 = null;
						typeOperand1 ^= 0b1000;
					}
					break;
				default:
					break;
			}
		}


		let typeOperand2: EncodedOperandTypes = EncodedOperandTypes.NO;
		let encodedOperandValue2: DoubleWord | null = null;

		if (regexMatch.length > 3) { // Check for second operand
			typeOperand2 = this.encodeOperandType(regexMatch[3], lineNo, handleLabelsAsImmediate);
			if (jumpLabels.has(regexMatch[3])) {
				if (typeof jumpLabels.get(regexMatch[3]) === "number") {
					return DoubleWord.NUMBER_OF_BYTES * 2 + (encodedOperandValue1 === null ? 0 : DoubleWord.NUMBER_OF_BYTES);
				}
				encodedOperandValue2 = DoubleWord.fromNumber(parseInt(jumpLabels.get(regexMatch[3]) as string, 2));
				allowPackingOperand2 = false;
			} else {
				encodedOperandValue2 = this.encodeOperandValue(regexMatch[3], lineNo);
			}
		}

		if (encodedOperandValue2 !== null) {

			switch (typeOperand2) {
				case EncodedOperandTypes.REGISTER_DIRECT:
				case EncodedOperandTypes.REGISTER_INDIRECT:
					embeddedOperand2 = encodedOperandValue2;
					encodedOperandValue2 = null
					break;
				case EncodedOperandTypes.IMMEDIATE:
				case EncodedOperandTypes.MEMORY_ADDRESS:
					if (encodedOperandValue2 < 2**Byte.NUMBER_OF_BITS && allowPackingOperand2)
					{
						embeddedOperand2 = encodedOperandValue2;
						encodedOperandValue2 = null;
						typeOperand2 ^= 0b1000;
					}
					break;
				default:
					break;
			}
		}

		let finalInstruction: DoubleWord = DoubleWord.fromNumber(
			+ (opcode << (8 * 3))
			+ (typeOperand1 << (8 * 2 + 4))
			+ (typeOperand2 << (8 * 2))
			+ (embeddedOperand1 << 8)
			+ (embeddedOperand2)
		);
		
  		const result: DoubleWord[] = [finalInstruction];

		if (encodedOperandValue1 !== null) {
			result.push(encodedOperandValue1);
		}

		if (encodedOperandValue2 !== null) {
			result.push(encodedOperandValue2);
		}

		return result;
	}

	/**
	 * This method requires an operand that is coded into its binary form.
	 * It extracts the addressing mode and converts the given decimal, hexadecimal or binary value into an 32-bit value.
	 * The method returns a tupel of binary lists. The first one contains the operand as part of the instruction. According to
	 * the opcodes definition, this part of the instruction serves as an indicator for the datatype of the operand.
	 * The second one represents the actual value encoded as a 32-bit value.
	 * @param operand The operand to encode binary.
	 * @param line The original computer programs line of code which is currently encoded.
	 * @returns The binary encoded operand
	 */
	private encodeOperandValue(operand: string, line: number): DoubleWord {
		let operand32BitEncoded: DoubleWord;
		if (operand.length === 0) {
			operand32BitEncoded = DoubleWord.ZERO;
		} else if (operand.startsWith("$0b") || operand.startsWith("$-0b")) {
			// Binary immediate found.
			operand32BitEncoded = this.encodeBinaryValue(operand.replace("$", ""));
		} else if (operand.startsWith("$-0x") || operand.startsWith("$0x")) {
			// Hexadecimal immediate found.
			operand32BitEncoded = this.encodeHexadecimalValue(operand.replace("$", ""));
		} else if (operand.startsWith("$-") || operand.startsWith("$")) {
			// Decimal immediate found.
			operand32BitEncoded = this.encodeDecimalValue(operand.replace("$", ""));
		} else if (operand.startsWith("@0b")) {
			// Binary virtual memory address found.
			operand32BitEncoded = this.encodeBinaryValue(operand.replace("@", ""));
		} else if (operand.startsWith("@0x")) {
			// Hex virtual memory address found.
			operand32BitEncoded = this.encodeHexadecimalValue(operand.replace("@", ""),);
		} else if (operand.startsWith("@")) {
			// Decimal virtual memory address found.
			operand32BitEncoded = this.encodeDecimalValue(operand.replace("@", ""));
		} else if (operand.startsWith("*%")) {
			// Register used with indirect addressing mode
			operand32BitEncoded = this.encodeRegister(operand.replace("*%", ""), line);
		} else if (operand.startsWith("%")) {
			// Register used with direct addressing mode
			operand32BitEncoded = this.encodeRegister(operand.replace("%", ""), line);
		} else {
			throw Error(`In line ${line + 1}: Unrecognized operand type and value.`);
		}
		return operand32BitEncoded;
	}

	/**
	 * This method encodes an operands binary value into its 32-bit representation.
	 * @param operand The binary value to encode.
	 * @param line The line of code which this operand originates from.
	 * @returns The 32-bit binary representation of the given immediate operand.
	 */
	private encodeBinaryValue(operand: string): DoubleWord {
		operand = operand.replace("0b", "");
		if (operand.startsWith("-")) {
			// Negative value.
			return DoubleWord.fromNumber(parseInt(operand.replace("-", ""), 2) * -1);
		}
	
		// Positive value.
		return DoubleWord.fromNumber(parseInt(operand, 2));
	}

	/**
	 * This method encodes an operands hexadecimal value into its 32-bit binary representation.
	 * @param operand The hexadecimal value to encode.
	 * @returns The 32-bit binary representation of the given immediate operand.
	 */
	private encodeHexadecimalValue(operand: string): DoubleWord {
		operand = operand.replace("0x", "");
		if (operand.startsWith("-")) {
			// Negative value.
			return DoubleWord.fromNumber(parseInt(operand.replace("-", ""), 16) * -1);
		}
	
		// Positive value.
		return DoubleWord.fromNumber(parseInt(operand, 16));
	}

	/**
	 * This method encodes an operands decimal value into its 32-bit binary representation.
	 * @param operand The decimal value to encode.
	 * @returns The 32-bit binary representation of the given immediate operand.
	 */
	private encodeDecimalValue(operand: string): DoubleWord {
		if (operand.startsWith("-")) {
			// Negative value.
			return DoubleWord.fromNumber(parseInt(operand.replace("-", ""), 10) * -1);
		}
	
		// Positive value.
		return DoubleWord.fromNumber(parseInt(operand, 10));
	}

	/**
	 * This method encodes the given operands type.
	 * @param operand An operand whichs type will be encoded.
	 * @param line The original computer programs line of code which is currently encoded.
	 * @param handleLabelsAsImmediate By default labels will be interpreted as addresses. Set to true to use the label address as immediate value.
	 * @returns The binary encoded operands type.
	 */
	private encodeOperandType(operand: string, line: number, handleLabelsAsImmediate: boolean = false): EncodedOperandTypes {
		if (operand.length === 0) {
			return EncodedOperandTypes.NO;
		} 
		if (operand.startsWith("%")) {
			return EncodedOperandTypes.REGISTER_DIRECT;
		} 
		if (operand.startsWith("*%")) {
			return EncodedOperandTypes.REGISTER_INDIRECT;
		}
		if (operand.startsWith("$") || (operand.match(this.languageDefinition.label_formats.usage) && handleLabelsAsImmediate)) {
			return EncodedOperandTypes.IMMEDIATE;
		}
		if (operand.startsWith("@") || (operand.match(this.languageDefinition.label_formats.usage) && !handleLabelsAsImmediate)) {
			return EncodedOperandTypes.MEMORY_ADDRESS;
		}
		throw Error(`In line ${line + 1}: Unrecognized type of operand: ${operand}`);
	}

	/**
	 * This method encodes the given register into a its binary representation according to the assembly language definition.
	 * An error is thrown if the register could not be found in the language definition.
	 * @param register A string containing the register to encode.
	 * @param line The original computer programs line of code which is currently encoded.
	 * @returns The 32-bit encoded register.
	 * @throws An error if the given register is not recognized.
	 */
	private encodeRegister(register: string, line: number): DoubleWord {
		const reg = this.languageDefinition.addressable_registers
			.find(e => e.name.toLowerCase() === register.trim().toLowerCase());

		if (reg === undefined) {
			throw Error(`In line ${line}: Unrecognized register: ${register}`);
		}

		return DoubleWord.fromNumber(parseInt(reg.code, 2));
	}

	/**
	 * This method assembles a given computer program written in assembly language into its binary representation.
	 * The instructions will be encoded using the opcodes defined in the language definition.
	 * The order in which the instructions appear in the input program is preserved during the compilation process.
	 * @param s File contents of an .asm file containing a computer program written in assembly language.
	 * @param baseOffset Base address where the program will be in memory. Needed to adjust static addresses in jump labels. Default is 0.
	 * @returns An array of DoubleWords representing the binary encoded instructions of the given computer program.
	 */
	public assemble(s: string, baseOffset: number = 0): DoubleWord[] {
		const lines: Map<number, string> = this.preprocess(s);
		return this.encode(lines, baseOffset);
	}
}