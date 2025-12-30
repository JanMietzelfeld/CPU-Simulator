; SYSCALLS_FILE_STAT
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     file length or error code (>=0 = length, -1 = file does not exists, -2 = not a file)
.SYSCALLS_FILE_STAT_WITH_ASSERTS:
    
    CALL ASSERT_ZERO_TERMINATED_EBX_FILENAME_IN_USERSPACE

.SYSCALLS_FILE_STAT:
    ; 7    00000111 - file_stat (filename_ptr=op2) -> file_length=eax
    DEV $CONST_DEV_COMMAND_FILE_STAT, %ebx
    RET