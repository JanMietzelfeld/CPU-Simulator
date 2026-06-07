.INCLUDE "os/include/syscalls"

; number to print on the console
MOV $0, %ebx

MOV $CONST_SYSCALL_CONSOLE_PRINT_NUMBER, %eax

.loop_start:

INT $0x80 ; call interrupt

ADD $1, %ebx

JMP loop_start