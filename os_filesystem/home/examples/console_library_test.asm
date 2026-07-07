.INCLUDE "os/include/console"

.CONST BUF 4 test
MOV $4, %eax ; number of bytes to read
MOV $test, %ebx

CALL console_read_string ; read from console
; ebx contains pointer to buffer now


MOV $test, %ebx
MOV $4, %eax ; number of bytes to write 
CALL console_write_string ; write to console


; exit the process
MOV $CONST_SYSCALL_PROCESS_EXIT, %eax
INT $0x80

