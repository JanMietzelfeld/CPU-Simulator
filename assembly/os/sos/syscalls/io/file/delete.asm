; SYSCALLS_IO_FILE_DELETE
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     success status (0 = success, -1 = file did not exist)
.SYSCALLS_IO_FILE_DELETE:
    ;CALL ASSERT_ZERO_TERMINATED_FILENAME_IN_USERSPACE
    ; 5    00000101 - file_delete (filename_ptr=op2) -> success=eax
    DEV $5, %ebx
    RET
