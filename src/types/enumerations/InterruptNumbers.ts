export enum InterruptNumbers {
    DIVIDE_ERROR = 0x0,
	INVALID_OPCODE = 0x6,
	GENERAL_PROTECTION_FAULT = 0xD,
	PAGE_FAULT = 0xE,
	TIMER = 0x20,
	SYSTEM_CALL = 0x80,
}

export function interruptNameByValue(value: number): string {
	for (const [key, val] of Object.entries(InterruptNumbers)) {
		if (val === value) {
			return key;
		}
	}
	return "unknown"
}