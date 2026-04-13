import { Bit } from "./Bit";

export type PageTableEntryFlags = number & { __brand: "PageTableEntryFlags" };

export namespace PageTableEntryFlags {

    export const MAX_POSITIVE_NUMBER: number = 2**12 - 1;
    export const MAX_NEGATIVE_NUMBER: number = -(2**11);
    export const NUMBER_OF_BITS: number = 12;

    export type PageTableEntryFlagsBitIndex =
		| 0 | 1 | 2  | 3  | 4  | 5  | 6  | 7
		| 8 | 9 | 10 | 11;


    export enum FlagBits {
        
        PRESENT = 0,
        WRITABLE = 1,
        EXECUTABLE = 2,
        MODE = 3,
        PINNED = 4,
        CHANGED = 5
        
    }

    /**
     * This method creates a Bit from a number.
     * @returns
     */
    export function fromNumber(number: number): PageTableEntryFlags {
        return (number & 0xfff) as PageTableEntryFlags;
    }

    /**
     * This method gets a bit at a specified index, were index 0 is MSB and Index size - 1 is LSB.
     * @param byte
     * @param index The position of the bit to get.
     * @returns 
     */
    export function getBit(flags: PageTableEntryFlags, index: PageTableEntryFlagsBitIndex): Bit {
        return ((flags >>> (NUMBER_OF_BITS - 1 - index)) & 1) as Bit;
    }


	/**
	 * This method sets the bit at a specified index to the passed bit value, were index 0 is MSB and Index size - 1 is LSB.
	 * @param byte
	 * @param index The position of the bit to set.
	 * @param bit The binary value to set the bit to.
	 * @returns 
	 */
	export function setBit(flags: PageTableEntryFlags, index: PageTableEntryFlagsBitIndex, bit: Bit): PageTableEntryFlags {
		const mask = 1 << (NUMBER_OF_BITS - 1 - index); 
		return (bit === 0 ? flags & ~mask : flags | mask) as PageTableEntryFlags;
	}

    export function isPresent(flags: PageTableEntryFlags): boolean {
		return getBit(flags, FlagBits.PRESENT) === 1;
	}

    export function getPresentFlagBit(flags: PageTableEntryFlags): Bit {
		return getBit(flags, FlagBits.PRESENT);
	}

    export function setPresentFlagBit(flags: PageTableEntryFlags, bit: Bit): PageTableEntryFlags {
		return setBit(flags, FlagBits.PRESENT, bit);
	}

    export function isWritable(flags: PageTableEntryFlags): boolean {
		return getBit(flags, FlagBits.WRITABLE) === 1;
	}

    export function getWritaleFlagBit(flags: PageTableEntryFlags): Bit {
		return getBit(flags, FlagBits.WRITABLE);
	}

    export function setWritableFlagBit(flags: PageTableEntryFlags, bit: Bit): PageTableEntryFlags {
		return setBit(flags, FlagBits.WRITABLE, bit);
	}

    export function isExecutable(flags: PageTableEntryFlags): boolean {
		return getBit(flags, FlagBits.EXECUTABLE) === 1;
	}

    export function getExecutableFlagBit(flags: PageTableEntryFlags): Bit {
		return getBit(flags, FlagBits.EXECUTABLE);
	}

    export function setExecutableFlagBit(flags: PageTableEntryFlags, bit: Bit): PageTableEntryFlags {
		return setBit(flags, FlagBits.EXECUTABLE, bit);
	}

    export function isKernelModeOnly(flags: PageTableEntryFlags): boolean {
		return getBit(flags, FlagBits.MODE) === 1;
	}

    export function getModeFlagBit(flags: PageTableEntryFlags): Bit {
		return getBit(flags, FlagBits.MODE);
	}

    export function setModeFlagBit(flags: PageTableEntryFlags, bit: Bit): PageTableEntryFlags {
		return setBit(flags, FlagBits.MODE, bit);
	}

    export function isPinned(flags: PageTableEntryFlags): boolean {
		return getBit(flags, FlagBits.PINNED) === 1;
	}

    export function getPinnedFlagBit(flags: PageTableEntryFlags): Bit {
		return getBit(flags, FlagBits.PINNED);
	}

    export function setPinnedFlagBit(flags: PageTableEntryFlags, bit: Bit): PageTableEntryFlags {
		return setBit(flags, FlagBits.PINNED, bit);
	}

    export function hasChanged(flags: PageTableEntryFlags): boolean {
		return getBit(flags, FlagBits.CHANGED) === 1;
	}

    export function getChangedFlagBit(flags: PageTableEntryFlags): Bit {
		return getBit(flags, FlagBits.CHANGED);
	}

    export function setChangedFlagBit(flags: PageTableEntryFlags, bit: Bit): PageTableEntryFlags {
		return setBit(flags, FlagBits.CHANGED, bit);
	}
}