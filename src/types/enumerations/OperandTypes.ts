/**
 * An enum representing the available operand types and their binary codes.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export enum OperandTypes {
	NO = 0b0000000,
	IMMEDIATE = 0b1010000,
	REGISTER = 0b1100000,
	MEMORY_ADDRESS = 0b1110000
}