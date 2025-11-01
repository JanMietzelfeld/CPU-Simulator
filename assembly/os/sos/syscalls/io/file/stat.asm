; SYSCALLS_IO_FILE_STAT
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     file length or error code (>=0 = length, -1 = file adoes not exists, -2 = not a file)
.SYSCALLS_IO_FILE_STAT:
    ;CALL ASSERT_ZERO_TERMINATED_FILENAME_IN_USERSPACE
    ; 7    00000111 - file_stat (filename_ptr=op2) -> file_length=eax
    DEV $7, %ebx
    ; print the length
    ;CALL PRINT_EBX
    RET