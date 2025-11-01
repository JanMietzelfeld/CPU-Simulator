; SYSCALLS_IO_CONSOLE_READ
; Parameters:
;   none
; Return value (immediate value):
;   eax     number
;   ebx     success status (0=success, -1=no input ready, -2=could not parse number, -3=number does not fit into signed 32 bit DoubleWord)
.SYSCALLS_IO_CONSOLE_READ:
    ; 9    00001001 - console_read_number() -> number=eax, error=ebx
    DEV $9, $0
    RET