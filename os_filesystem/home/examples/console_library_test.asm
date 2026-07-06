.INCLUDE "os/include/console"

;MOV $8, %eax ; number of bytes to read
;CALL console_read_string ; read from console
; ebx contains pointer to buffer now

.CONST testo "abcdefg"
MOV $testo, %ebx
MOV $4, %eax ; number of bytes to write 
CALL console_write_string ; write to console


; exit the process
MOV $CONST_SYSCALL_PROCESS_EXIT, %eax
INT $0x80

