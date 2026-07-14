; SYSCALLS_FILE_OPEN
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     file descriptor (-1 = error)
.SYSCALLS_FILE_OPEN_WITH_ASSERTS:
    CALL ASSERT_ZERO_TERMINATED_EBX_FILENAME_IN_USERSPACE
.SYSCALLS_FILE_OPEN:
    
    ; 6    00000110 - file_open (filename_ptr=op2) -> fd=eax
    DEV $CONST_DEV_COMMAND_OPEN_FILE, %ebx
    RET