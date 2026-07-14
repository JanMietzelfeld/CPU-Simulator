/**
 * An enum representing all the registers and their binary codes.
 */
export const enum RegisterNumbers {
	EAX = 0b0000,
	EBX = 0b0001,
	ECX = 0b0010,
	EDX = 0b0011,
	EIP = 0b0100,
	EIR = 0b0101,
	ESP = 0b0110,
	ITP = 0b0111,
	PTP = 0b1000,
    FLAGS = 0b1001,
	NPTP = 0b1010,
	VMPTR = 0b1011
}