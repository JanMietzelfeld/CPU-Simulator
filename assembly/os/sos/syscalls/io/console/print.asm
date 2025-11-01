; SYSCALLS_IO_CONSOLE_PRINT
; Parameters (immediate value):
;   (ebx)     number to print
; Return value:
;   none
.SYSCALLS_IO_CONSOLE_PRINT:
    ; 8    00001000 - console_print_number(number=op2)
    DEV $8, %ebx
    RET