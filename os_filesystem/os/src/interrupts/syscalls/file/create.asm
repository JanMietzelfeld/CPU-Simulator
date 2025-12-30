; SYSCALLS_FILE_CREATE
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     success status (0 = success, -1 = file already exist)

.SYSCALLS_FILE_CREATE_WITH_ASSERTS:
    
    CALL ASSERT_ZERO_TERMINATED_EBX_FILENAME_IN_USERSPACE

.SYSCALLS_FILE_CREATE:

    ; 4    00000100 - file_create (filename_ptr=op2)
    DEV $CONST_DEV_COMMAND_FILE_CREATE, %ebx
    RET