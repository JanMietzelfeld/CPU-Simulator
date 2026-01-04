import { BinaryValue } from "./BinaryValue";
import { Byte } from "./Byte";

export class Word extends BinaryValue {
	public static readonly MAX_POSITIVE_NUMBER_DEC: number = 2^16 -1;
	public static readonly MAX_NEGATIVE_NUMBER_DEC: number = -2^15;
	public static readonly NUMBER_OF_BITS_DEC: number = 16;
	public static readonly SIZE_IN_BYTES: number = 2;

	/**
	 * Instantiates a new object.
	 * @param [value] The binary data to initialize the new object with.
	 * @constructor
	 */
	public constructor(value: number = 0){
		super(value, Word.NUMBER_OF_BITS_DEC);
	}

	public getUpperByte(): Byte {
		return new Byte(this.getMostSignificantBits(Byte.NUMBER_OF_BITS_DEC));
	} 

	public getLowerByte(): Byte {
		return new Byte(this.getLeastSignificantBits(Byte.NUMBER_OF_BITS_DEC));
	} 
	
	/**
	 * For comparison, both binary values are converted to strings.
	 * Conversion presarves the order of items, which is important for the comparison.
	 * @param word The binary value to compare to.
	 * @returns True, when both binary values are identical, false otherwise.
	 */
	public equal(word: Word): boolean {
		return this.value === word.value;
	}
}