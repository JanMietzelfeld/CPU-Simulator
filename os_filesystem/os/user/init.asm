._INIT_START:
NOP
PUSH %ecx
NOP
POP %ecx
NOP
MOV $CONST_SYSCALL_PROCESS_YIELD, %eax
INT $0x80
JMP _INIT_START


include "os/include/syscalls"