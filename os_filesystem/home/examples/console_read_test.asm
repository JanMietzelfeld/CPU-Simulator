.INCLUDE "os/include/syscalls"

MOV $4, %eax ; buffer size for read
PUSH %eax

MOV %esp, %ebx
SUB $8, %ebx ; space for pointer and file descriptor
SUB $4, %ebx ; space for the buffer content

MOV %ebx, %ecx 
PUSH %ebx ; pointer to buffer
MOV $0, %eax ; console as fd
PUSH %eax

MOV %esp, %ebx ; parameter for file read
; read from console
MOV $CONST_SYSCALL_FILE_READ, %eax
INT $0x80


; write the data that was read back to the console

MOV %esp, %ebx ; parameter for file read
MOV $CONST_SYSCALL_FILE_WRITE, %eax
INT $0x80




; demonstrate that the rest of the buffer is still filled

MOV %esp, %ebx ; parameter for file read
; read from console
MOV $CONST_SYSCALL_FILE_READ, %eax
INT $0x80


; write the data that was read back to the console

MOV %esp, %ebx ; parameter for file read
MOV $CONST_SYSCALL_FILE_WRITE, %eax
INT $0x80









; exit the process
MOV $CONST_SYSCALL_PROCESS_EXIT, %eax
INT $0x80
