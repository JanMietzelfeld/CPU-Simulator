import { BinaryValue } from "./BinaryValue";
import { Bit } from "./Bit";
import { DataSizes } from "../enumerations/DataSizes";

/**
 * This class represents a byte sized binary value.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class Byte extends BinaryValue {
	public static readonly MAX_POSITIVE_NUMBER_DEC: number = 2^8 - 1;
	public static readonly MAX_NEGATIVE_NUMBER_DEC: number = -2^7;
	public static readonly NUMBER_OF_BITS_DEC: number = 8;

	/**
	 * Instantiates a new object.
	 * @param value The initial value of the byte.
	 * @constructor
	 */
	public constructor(value: number = 0) {
		super(value, Byte.NUMBER_OF_BITS_DEC);
	}

	/**
	 * For comparison
	 * @param byte The binary value to compare to.
	 * @returns True, when both binary values are identical, false otherwise.
	 */
	public equal(byte: Byte): boolean {
		return this.value === byte.value;
	}
}