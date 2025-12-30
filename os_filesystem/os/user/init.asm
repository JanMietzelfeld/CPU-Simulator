._INIT_START:
MOV $10, %ebx
MOV $CONST_SYSCALL_TIMER_START, %eax
INT $0x80
JMP _INIT_START


include "os/include/syscalls"