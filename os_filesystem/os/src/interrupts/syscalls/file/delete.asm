; SYSCALLS_FILE_DELETE
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value (immediate value):
;   eax     success status (0 = success, -1 = file did not exist)
.SYSCALLS_FILE_DELETE_WITH_ASSERTS:
    CALL ASSERT_ZERO_TERMINATED_EBX_FILENAME_IN_USERSPACE
.SYSCALLS_FILE_DELETE:
    
    ; 5    00000101 - file_delete (filename_ptr=op2) -> success=eax
    DEV $CONST_DEV_COMMAND_FILE_DELETE, %ebx
    RET
