import { DoubleWord } from "../binary/DoubleWord";


export type ProgramMetadata = DoubleWord[];


/**
 * Program Metadata
 * 
 * ELF header 32 byte (8 dwords)
 * byte 0x0-0x4 magic number
 * byte 0x5-0x8 program header byte offset
 * 6 dwords free
 * 
 * Program header (16 dwords)
 * 1 DWORD Total_L2_Tables
 * 
 * 1 DWORD Text segment virtual start address
 * 1 DWORD Text segment file offset
 * 1 DWORD Text segment size
 * 
 * 1 DWORD RoData segment virtual start address
 * 1 DWORD RoData segment file offset
 * 1 DWORD RoData segment size
 * 
 * 1 DWORD Data segment virtual start address
 * 1 DWORD Data segment file offset
 * 1 DWORD Data segment size
 * 	 
 * 1 DWORD Uninitialized Data segment virtual start address
 * 1 DWORD Uninitialized Data segment size
 * 
 * 4 dwords free
 */
export namespace ProgramMetadata {

	export const SIZE_IN_BYTES: number = (8 + 16) * DoubleWord.NUMBER_OF_BYTES;
    export const SIZE_IN_DOUBLEWORDS: number = 8 + 16;
    export const ICE_HEADER_SIZE_IN_DOUBLEWORDS: number = 8;
    export const PROGRAM_HEADER_SIZE_IN_DOUBLEWORDS: number = 16;

	export const ICE_MAGIC_NUMBER: DoubleWord = 0x7F_49_43_45 as DoubleWord // 0x7F followed by ICE in ASCII as Word;



	/**
	 * This method creates the ProgramMetadata from a buffer.
	 * @param buffer 
	 * @returns
	 */
	export function fromBuffer(buffer: Buffer): ProgramMetadata {
        if (buffer.length < 24) {
            throw new Error("Buffer is not a valid executable. Buffer too small.")
        }
        if (buffer.readUInt32BE(0) !== ICE_MAGIC_NUMBER) {
            throw new Error("Buffer is not a valid executable.")
        }

		const metadata: DoubleWord[] = [];

        for (let i = 0; i < ICE_HEADER_SIZE_IN_DOUBLEWORDS * DoubleWord.NUMBER_OF_BYTES; i += 4) {
            metadata.push(DoubleWord.fromNumber(buffer.readUInt32BE(i)));
        }

        for (let i = metadata[1]; i < metadata[1] + PROGRAM_HEADER_SIZE_IN_DOUBLEWORDS * DoubleWord.NUMBER_OF_BYTES; i = DoubleWord.fromNumber(i + 4)) {
            metadata.push(DoubleWord.fromNumber(buffer.readUInt32BE(i)));
        }

        return metadata as ProgramMetadata;
	}

    /**
	 * This method creates the ProgramMetadata from the file content array.
	 * @param buffer 
	 * @returns
	 */
	export function fromFileArray(content: DoubleWord[]): ProgramMetadata {
        if (content.length < 24) {
            throw new Error("Array is not a valid executable. Array too small.")
        }
        if (content[0] !== ICE_MAGIC_NUMBER) {
            throw new Error("File is not a valid executable.")
        }

		const metadata: DoubleWord[] = [];

        for (let i = 0; i < ICE_HEADER_SIZE_IN_DOUBLEWORDS; i++) {
            metadata.push(content[i]);
        }

        for (let i = metadata[1] / DoubleWord.NUMBER_OF_BYTES; i < metadata[1] + PROGRAM_HEADER_SIZE_IN_DOUBLEWORDS; i++) {
            metadata.push(content[i]);
        }

        return metadata as ProgramMetadata;
	}

    /**
	 * This method gets the program header offset
	 * @param metadata 
	 * @returns
	 */
	export function getProgramHeaderOffset(metadata: ProgramMetadata): DoubleWord {
        return metadata[1];
	}

    /**
	 * This method gets the total l2 tables that are needed
	 * @param metadata 
	 * @returns
	 */
	export function getTotalL2Tables(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS];
	}

    /**
	 * This method gets the Text segment virtual start address
	 * @param metadata 
	 * @returns
	 */
	export function getTextSegmentVirtualStartAddress(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 1];
	}

    /**
	 * This method gets the Text segment file offset
	 * @param metadata 
	 * @returns
	 */
	export function getTextSegmentFileOffset(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 2];
	}

    /**
	 * This method gets the Text segment size
	 * @param metadata 
	 * @returns
	 */
	export function getTextSegmentSize(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 3];
	}

    /**
	 * This method gets the RoData segment virtual start address
	 * @param metadata 
	 * @returns
	 */
	export function getRoDataSegmentVirtualStartAddress(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 4];
	}

    /**
	 * This method gets the RoData segment file offset
	 * @param metadata 
	 * @returns
	 */
	export function getRoDataSegmentFileOffset(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 5];
	}

    /**
	 * This method gets the RoData segment size
	 * @param metadata 
	 * @returns
	 */
	export function getRoDataSegmentSize(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 6];
	}

    /**
	 * This method gets the Data segment virtual start address
	 * @param metadata 
	 * @returns
	 */
	export function getDataSegmentVirtualStartAddress(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 7];
	}

    /**
	 * This method gets the Data segment file offset
	 * @param metadata 
	 * @returns
	 */
	export function getDataSegmentFileOffset(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 8];
	}

    /**
	 * This method gets the Data segment size
	 * @param metadata 
	 * @returns
	 */
	export function getDataSegmentSize(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 9];
	}

    /**
	 * This method gets the Uninitialized Data segment virtual start address
	 * @param metadata 
	 * @returns
	 */
	export function getUninitializedDataSegmentVirtualStartAddress(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS + 10];
	}

    /**
	 * This method gets the Uninitialized Data segment size
	 * @param metadata 
	 * @returns
	 */
	export function getUninitializedDataSegmentSize(metadata: ProgramMetadata): DoubleWord {
        return metadata[ICE_HEADER_SIZE_IN_DOUBLEWORDS +11];
	}
}