; UTIL_CLEAR_FRAME
; Parameters:
;   (ebx)     Pointer to the frame base address
; Return value (immediate value):
;   none
.UTIL_CLEAR_FRAME:

    PUSH %ebx

    ; push "os/util/zero_frame.bin\0" onto stack
 
    PUSH $0x696E0000
    PUSH $0x6D652E62
    PUSH $0x5F667261
    PUSH $0x7A65726F
    PUSH $0x74696C2F
    PUSH $0x6F732F75

    MOV %esp, %ebx

    ; SYSCALLS_FILE_OPEN
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file descriptor (-1 = error)
    CALL SYSCALLS_FILE_OPEN
    CMP $-1, %eax
    JNE _UTIL_CLEAR_FRAME_FILE_OPEN

    ; this should not be able to happen

    ; panic

    ; TODO stop the simulator

    ._UTIL_CLEAR_FRAME_FILE_OPEN:

    POP %ebx
    POP %ebx
    POP %ebx
    POP %ebx
    POP %ebx
    POP %ebx

    POP %ebx ; Pointer to the frame base address

    PUSH $CONST_OS_FRAME_SIZE
    PUSH %ebx
    PUSH %eax

    MOV %esp, %ebx

    DEV $CONST_DEV_COMMAND_CPU_IS_MEMORY_VIRTUALIZATION_ENABLED, $0
    PUSH %eax ; is virtualization enabled
    DEV $CONST_DEV_COMMAND_CPU_DISABLE_MEMORY_VIRTUALIZATION, $0

    ; SYSCALLS_FILE_READ
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     file descriptor (fd=0 for console, fd>0 for files)
    ;   *(ebx+4)   pointer to buffer, this buffer will be filled by the file system
    ;   *(ebx+8)   buffer size, limits the amount of bytes that will be read
    ; Return value (immediate value):
    ;   eax     success status (>=0 = number of bytes read, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = no console input ready)
    CALL SYSCALLS_FILE_READ
    CMP $0, %eax
    JG _UTIL_CLEAR_FRAME_FILE_READ
    ; this should not be able to happen

    ; panic

    ; TODO stop the simulator

    ._UTIL_CLEAR_FRAME_FILE_READ:

    POP %ebx ; was virtualization enabled
    CMP $0, %ebx
    JE _UTIL_CLEAR_FRAME_SKIP_MEMORY_VIRTIALIZATION:
        DEV $CONST_DEV_COMMAND_CPU_ENABLE_MEMORY_VIRTUALIZATION, $0
    ._UTIL_CLEAR_FRAME_SKIP_MEMORY_VIRTIALIZATION:

    POP %ebx
    POP %ebx
    POP %ebx

RET