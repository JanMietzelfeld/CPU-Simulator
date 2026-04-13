import { Bit } from "./Bit";
import { Byte } from "./Byte";
import { Word } from "./Word";

export type DoubleWord = number & { __brand: "DoubleWord" };

export namespace DoubleWord {
	export const MAX_POSITIVE_NUMBER: number = 2**32 - 1;
	export const MAX_NEGATIVE_NUMBER: number = -(2**31);
	export const NUMBER_OF_BITS: number = 32;
	export const NUMBER_OF_WORDS: number = 2;
	export const NUMBER_OF_BYTES: number = 4;

	export const ZERO: DoubleWord = 0 as DoubleWord;

	export type BitIndex =
		| 0  | 1  | 2  | 3  | 4  | 5  | 6  | 7
		| 8  | 9  | 10 | 11 | 12 | 13 | 14 | 15
		| 16 | 17 | 18 | 19 | 20 | 21 | 22 | 23
		| 24 | 25 | 26 | 27 | 28 | 29 | 30 | 31;

	export type BitCount =
	    | 1  | 2  | 3  | 4  | 5  | 6  | 7  | 8  
		| 9  | 10 | 11 | 12 | 13 | 14 | 15 | 16 
		| 17 | 18 | 19 | 20 | 21 | 22 | 23 | 24 
		| 25 | 26 | 27 | 28 | 29 | 30 | 31 | 32;

	/**
	 * This method creates a Word from a number.
	 * @returns
	 */
	export function fromNumber(number: number): DoubleWord {
		return (number & 0xffffffff) >>> 0 as DoubleWord;
	}

	/**
	 * This method creates a Word from bytes.
	 * @returns
	 */
	export function fromWords(high: Word, low: Word): DoubleWord {
		return ((high << Word.NUMBER_OF_BITS) | low) >>> 0 as DoubleWord;   
	}

	/**
	 * This method creates a Word from bytes.
	 * @returns
	 */
	export function fromBytes(b0: Byte, b1 : Byte, b2 : Byte, b3 : Byte): DoubleWord {
		return ((b0 << (NUMBER_OF_BITS - Byte.NUMBER_OF_BITS)) | 
				(b1 << Word.NUMBER_OF_BITS) |
				(b2 << Byte.NUMBER_OF_BITS) |
				b3) >>> 0 as DoubleWord;   
	}

	/**
	 * This method returns the least significant bit of this value.
	 * @returns The least significant bit.
	 */
	export function getLeastSignificantBit(doubleWord: DoubleWord): Bit {
		return (doubleWord & 1) as Bit;
	}

	/**
	 * This method returns the most significant bit of this value.
	 * @returns The most significant bit.
	 */
	export function getMostSignificantBit(doubleWord: DoubleWord): Bit {
		return ((doubleWord >>> (NUMBER_OF_BITS - 1)) & 1) as Bit;
	}

	/**
	 * This method returns the last bits of the binary value.
	 * @param doubleWord 
	 * @param count Amount of bits to include
	 * @returns 
	 */
	export function getLeastSignificantBits(doubleWord: DoubleWord, count: BitCount): DoubleWord {
		return (doubleWord & (count === 32 ? 0xffffffff : (1 << count) - 1)) >>> 0 as DoubleWord;
	}

	/**
	 * This method returns the first bits of the binary value.
	 * @param word 
	 * @param count Amount of bits to include
	 * @returns 
	 */
	export function getMostSignificantBits(doubleWord: DoubleWord, count: BitCount): DoubleWord {
		return ((doubleWord >>> (NUMBER_OF_BITS - count)) & (count === 32 ? 0xffffffff : (1 << count) - 1)) >>> 0 as DoubleWord;
	}    

	/**
	 * This method gets a bit at a specified index, were index 0 is MSB and Index size - 1 is LSB.
	 * @param byte
	 * @param index The position of the bit to get.
	 * @returns 
	 */
	export function getBit(doubleWord: DoubleWord, index: BitIndex): Bit {
		return ((doubleWord >>> (NUMBER_OF_BITS - 1 - index)) & 1) as Bit;
	}

	/**
	 * This method gets a range of bits from a specified start index
	 * @param word
	 * @param start The zero-based index number indicating the beginning of the range.
	 * @param end Zero-based index number indicating the end of the range. The range includes the bit up to, but not including, the bit indicated by end.
	 * @returns 
	 */
	export function getBitRange(doubleWord: DoubleWord, start: BitIndex, end: BitIndex | 32 = NUMBER_OF_BITS as 32): DoubleWord {
		return ((doubleWord >>> (NUMBER_OF_BITS - end)) & ((end - start) === 32 ? 0xffffffff : (1 << (end - start)) - 1)) >>> 0 as DoubleWord;
	}

	/**
	 * This method gets a range of bits from a specified start index
	 * @param word
	 * @param start The zero-based index number indicating the beginning of the range.
	 * @param count Number of bits to include after start
	 * @returns 
	 */
	export function getBitsStartingAt(doubleWord: DoubleWord, start: BitIndex, count: BitCount = 1): DoubleWord {
		const end = start + count;
		return ((doubleWord >>> (NUMBER_OF_BITS - end)) & ((end - start) === 32 ? 0xffffffff : (1 << (end - start)) - 1)) >>> 0 as DoubleWord;
	}

	/**
	 * This method sets the bit at a specified index to the passed bit value, were index 0 is MSB and Index size - 1 is LSB.
	 * @param byte
	 * @param index The position of the bit to set.
	 * @param bit The binary value to set the bit to.
	 * @returns 
	 */
	export function setBit(doubleWord: DoubleWord, index: BitIndex, bit: Bit): DoubleWord {
		const mask = 1 << (NUMBER_OF_BITS - 1 - index); 
		return (bit === 0 ? doubleWord & ~mask : doubleWord | mask) >>> 0 as DoubleWord;
	}

	/**
	 * This method gets the upper Word
	 * @param byte
	 * @returns 
	 */
	export function getUpperWord(doubleWord: DoubleWord): Word {
		return Word.fromNumber(doubleWord >>> Word.NUMBER_OF_BITS);
	} 

	/**
	 * This method gets the lower Word
	 * @param byte
	 * @returns 
	 */
	export function getLowerWord(doubleWord: DoubleWord): Word {
		return Word.fromNumber(doubleWord);
	} 



	/**
	 * This method gets the first Byte (Most Significant Byte)
	 * @param byte
	 * @returns 
	 */
	export function getFirstByte(doubleWord: DoubleWord): Byte {
		return Byte.fromNumber(doubleWord >>> (Word.NUMBER_OF_BITS + Byte.NUMBER_OF_BITS));
	} 

	/**
	 * This method gets the second Byte
	 * @param byte
	 * @returns 
	 */
	export function getSecondByte(doubleWord: DoubleWord): Byte {
		return Byte.fromNumber(doubleWord >>> Word.NUMBER_OF_BITS);
	} 

	/**
	 * This method gets the third Byte
	 * @param byte
	 * @returns 
	 */
	export function getThirdByte(doubleWord: DoubleWord): Byte {
		return Byte.fromNumber(doubleWord >>> Byte.NUMBER_OF_BITS);
	} 

	/**
	 * This method gets the fourth Byte (Least Significant Byte)
	 * @param byte
	 * @returns 
	 */
	export function getFourthByte(doubleWord: DoubleWord): Byte {
		return Byte.fromNumber(doubleWord);
	} 

	/**
     * This method performs a logical shift on the given DoubleWord one bit to the right.
     * @param operand The operand to perform a right shift on.
     * @returns
     */
	export function logicalRightShift(operand: DoubleWord): [DoubleWord, Bit] {
		const removedBit: Bit = (operand & 1) as Bit;
		return [(operand >>> 1) >>> 0 as DoubleWord, removedBit];
	}

	/**
	 * This method performs an arithmetic shift on the given DoubleWord one bit to the right.
	 * @param operand The operand to perform a right shift on.
	 * @returns The bit right shifted.
	 */
	export function arithmeticRightShift(operand: DoubleWord): [DoubleWord, Bit] {
		const removedBit: Bit = (operand & 1) as Bit;
		return [(operand >> 1) >>> 0 as DoubleWord, removedBit];
    }

    /**
     * This method performs an logical shift on the given DoubleWord one bit to the left.
     * @param operand The operand to perform a right left on.
     * @returns The bit left shifted.
     */
    export function leftShift(operand: DoubleWord): [DoubleWord, Bit] {
		const removedBit: Bit = DoubleWord.getMostSignificantBit(operand);
        operand = DoubleWord.fromNumber(operand << 1);
		return [operand, removedBit];
    }
}