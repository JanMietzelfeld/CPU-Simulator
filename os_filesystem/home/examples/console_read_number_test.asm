.INCLUDE "os/include/syscalls"

MOV $CONST_SYSCALL_CONSOLE_READ_NUMBER, %eax
INT $0x80

PUSH %eax ; save eax (number)

MOV $CONST_SYSCALL_CONSOLE_PRINT_NUMBER, %eax
INT $0x80 ; print status code to console

POP %ebx ; restore number

MOV $CONST_SYSCALL_CONSOLE_PRINT_NUMBER, %eax
INT $0x80 ; print number to console

; exit the process
MOV $CONST_SYSCALL_PROCESS_EXIT, %eax
INT $0x80
