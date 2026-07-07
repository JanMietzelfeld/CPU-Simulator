.INCLUDE "os/include/syscalls"

JMP skipLibrary
;   Parameters:
;       eax     amount of bytes to read from the console
;       ebx     pointer to buffer
;   Return:
;       eax     success status (>=0 = number of bytes read, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = no console input ready)
.console_read_string:
    PUSH %eax ; Put amount of bytes to read from the console on stack
    PUSH %ebx ; Put pointer to buffer on stack
    MOV $0, %eax
    PUSH %eax ; Put fd=0 (console) on stack
    MOV %esp, %ebx ; parameter for file read
    MOV $CONST_SYSCALL_FILE_READ, %eax
    INT $0x80
    ; restore stack pointer
    MOV %esp, %ecx
    ADD $12, %ecx
    MOV %ecx, %esp ; Restore stack pointer
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
    ; restore stack pointer
    MOV %esp, %ecx
    ADD $12, %ecx
    MOV %ecx, %esp ; Restore stack pointer
    RET

.skipLibrary: