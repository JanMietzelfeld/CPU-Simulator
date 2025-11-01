export enum DevCommands {
	IO_SEEK = 0b0000000,
	IO_CLOSE = 0b0000001,
	IO_READ_BUFFER = 0b0000010,
	IO_WRITE_BUFFER = 0b0000011,
	FILE_CREATE = 0b0000100,
	FILE_DELETE = 0b0000101,
	FILE_OPEN = 0b0000110,
	FILE_STAT = 0b0000111,
	CONSOLE_PRINT_NUMBER = 0b0001000,
	CONSOLE_READ_NUMBER = 0b0001001,
	CPU_ENABLE_MEMORY_VIRTUALIZATION = 0b0001010,
	CPU_DISABLE_MEMORY_VIRTUALIZATION = 0b0001011,
}

export function devCommandNameByValue(value: number): string {
	for (const [key, val] of Object.entries(DevCommands)) {
		if (val === value) {
			return key;
		}
	}
	return "unknown"
}