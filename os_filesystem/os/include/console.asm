.INCLUDE "os/include/syscalls"

JMP skip
;   Parameters:
;       eax     amount of bytes to read from the console
;   Return:
;       eax     success status (>=0 = number of bytes read, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = no console input ready)
;       ebx     pointer to buffer on stack containing the input data
.console_read_string:
    PUSH %eax ; Put amount of bytes to read from the console on stack
    MOV %esp, %ebx
    SUB $8, %ebx ; Space for pointer and file descriptor
    SUB $4, %ebx ; Space for the buffer content
    ;MOV %ebx, %ecx ; Save pointer to buffer
    PUSH %ebx ; Put pointer to buffer on stack
    MOV $0, %eax
    PUSH %eax ; Put fd=0 (console) on stack
    MOV %esp, %ebx ; parameter for file read
    MOV $CONST_SYSCALL_FILE_READ, %eax
    INT $0x80
    ADD $4, %ebx ; pointer to buffer
    RET


;   Parameters:
;       eax     amount of bytes to write to console
;       ebx     pointer to buffer to read from
;   Return: 
;       eax     success status (>=0 = number of bytes written, -1 = invalid file descriptor, -2 = seek position out of file bounds)
.console_write_string:
    PUSH %eax ; Put amount of bytes to write on stack
    PUSH %ebx ; Put pointer to string to write to console on stack
    MOV $0, %eax
    PUSH %eax ; Put fd=0 (console) on stack
    MOV %esp, %ebx ; Pointer to the struct needed for the file write syscall
    MOV $CONST_SYSCALL_FILE_WRITE, %eax
    INT $0x80
    RET

.skip: