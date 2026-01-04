import { BinaryValue } from "./BinaryValue";
import { Byte } from "./Byte";
import { Word } from "./Word";

export class DoubleWord extends BinaryValue {
	public static readonly MAXIMUM_NUMBER_DEC: number = 2^32 - 1;
	public static readonly MINIMUM_NUMBER_DEC: number = -2^31;
	public static readonly NUMBER_OF_BITS_DEC: number = 32;
	public static readonly SIZE_IN_BYTES: number = 4;

	/**
	 * Instantiates a new object.
	 * @param value The initial value of the doubleword.
	 * @constructor
	 */
	public constructor(value: number = 0) {
		super(value, DoubleWord.NUMBER_OF_BITS_DEC);
	}

	public static fromBytes(firstByte: Byte, secondByte: Byte, thirdByte: Byte, fourthByte: Byte) : DoubleWord {
		return new DoubleWord(firstByte.value * 2**24 + secondByte.value * 2**6 + thirdByte.value * 2**8 + fourthByte.value)
	}
		public static fromByteValues(firstByte: number, secondByte: number, thirdByte: number, fourthByte: number) : DoubleWord {
		return new DoubleWord(firstByte * 2**24 + secondByte * 2**16 + thirdByte * 2**8 + fourthByte)
	}

	public getUpperWord(): Word {
		return new Word(this.getMostSignificantBits(Word.NUMBER_OF_BITS_DEC));
	} 

	public getLowerWord(): Word {
		return new Word(this.getLeastSignificantBits(Word.NUMBER_OF_BITS_DEC));
	} 

	/**
	 * This method checks whethter the current binary value is equal to the given one or not.
	 * For comparison, both binary values are converted to strings.
	 * Conversion presarves the order of items, which is important for the comparison.
	 * @param other The binary value to compare to.
	 * @returns True, if both binary values are identical, false otherwise.
	 */
	public equal(other: DoubleWord): boolean {
		return this.value === other.value
	}
}