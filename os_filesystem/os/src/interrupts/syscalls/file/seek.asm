; SYSCALLS_FILE_SEEK
; Parameters (ebx is a pointer to the following struct):
;   *(ebx)     file descriptor
;   *(ebx+4)   seek offset
;   *(ebx+8)   seek mode (0 - Seek from current position, 1 - Seek from start of file, 2 - Seek from end of file)
; Return value (immediate value):
;   eax     success status (0 = success, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = negative seek position)
.SYSCALLS_FILE_SEEK_WITH_ASSERTS:
    
    ADD $8, %ebx ; TODO handle overflow
    CALL ASSERT_EBX_IN_USERSPACE
    SUB $8, %ebx

.SYSCALLS_FILE_SEEK:

    MOV %ebx, %eax
    ADD $4, %eax

    ; move syscall arguments onto stack as the DEV instruction requires it for io_seek

    ;   ebx+4     offset
    PUSH *%eax

    ;   ebx+8     mode
    ADD $4, %eax
    PUSH *%eax

    ; 0    00000000 - io_seek (fd=op2, offset=stack, mode=stack) -> success=eax
    ;          mode:   0 - Seek from current position
    ;              1 - Seek from start of file
    ;              2 - Seek from end of file
    DEV $CONST_DEV_COMMAND_IO_SEEK, *%ebx
    RET