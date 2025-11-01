; SYSCALLS_IO_FILE_CREATE
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   None
.SYSCALLS_IO_FILE_CREATE:
    ;CALL ASSERT_ZERO_TERMINATED_FILENAME_IN_USERSPACE
    ; 4    00000100 - file_create (filename_ptr=op2)
    DEV $4, %ebx
    RET