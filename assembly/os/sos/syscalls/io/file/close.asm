; SYSCALLS_IO_FILE_CLOSE
; Parameters (ebx is used as a immediate value):
;   ebx     file descriptor
; Return value:
;   None
.SYSCALLS_IO_FILE_CLOSE:
    ; Check whether all user-provided data is within user space (file descriptor)
    MOV $4, %eax
    ;CALL ASSERT_EBX_IN_USERSPACE_WITH_OFFSET

    ; 1    00000001 - io_close (fd=op2)
    DEV $1, %ebx
    RET