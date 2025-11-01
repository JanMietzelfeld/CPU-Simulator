; SYSCALLS_IO_FILE_OPEN
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     file descriptor
.SYSCALLS_IO_FILE_OPEN:
    ;CALL ASSERT_ZERO_TERMINATED_FILENAME_IN_USERSPACE
    ; 6    00000110 - file_open (filename_ptr=op2) -> fd=eax
    DEV $6, %ebx
    ; print the new filedescriptor for debugging
    ;CALL PRINT_EAX
    RET