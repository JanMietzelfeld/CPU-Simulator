; SYSCALLS_FILE_CLOSE
; Parameters (ebx is used as a immediate value):
;   ebx     file descriptor
; Return value:
;   eax     success status (0 = success, -1 = invalid file descriptor)
.SYSCALLS_FILE_CLOSE_WITH_ASSERTS:
.SYSCALLS_FILE_CLOSE:

    ; 1    00000001 - io_close (fd=op2)
    DEV $CONST_DEV_COMMAND_IO_CLOSE, %ebx
    RET