/**
 * An enum representing the available operand types and their binary codes.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export enum EncodedOperandTypes {
	NO = 0b0001,
	EMBEDDED_IMMEDIATE = 0b0010,
	IMMEDIATE = 0b1010,
	REGISTER_DIRECT = 0b0011,
	REGISTER_INDIRECT = 0b0100,
	EMBEDDED_MEMORY_ADDRESS = 0b0101,
	MEMORY_ADDRESS = 0b1101
}