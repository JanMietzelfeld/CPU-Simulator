.INCLUDE "os/include/syscalls"
.CONST stringTest "Test"

MOV $4, %eax; 4 bytes for "Test"
PUSH %eax; Buffer size for console access

MOV $stringTest, %eax; Move pointer to stringStart into eax
PUSH %eax

MOV $0, %eax
PUSH %eax; FD 0 for console

.write_start:
MOV %esp, %ebx 
MOV $CONST_SYSCALL_FILE_WRITE, %eax


INT $0x80; Call system interrupt
JMP write_start

                       


