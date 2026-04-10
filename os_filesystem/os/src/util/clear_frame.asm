; UTIL_CLEAR_FRAME
; Parameters:
;   (ebx)     Pointer to the frame base address
; Return value (immediate value):
;   none
.UTIL_CLEAR_FRAME:

    PUSH %ebx

    .CONST _UTIL_CLEAR_FRAME_CONST_EMPTY_FRAME_FILE_PATH "os/util/empty_frame.bin"


    MOV $_UTIL_CLEAR_FRAME_CONST_EMPTY_FRAME_FILE_PATH, %ebx

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

    POP %ebx ; Pointer to the frame base address

    PUSH $CONST_OS_FRAME_SIZE
    PUSH %ebx
    PUSH %eax

    MOV %esp, %ebx

    PUSH %eax ; file descriptor

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


    POP %ebx ; file descriptor

    ; SYSCALLS_FILE_CLOSE
    ; Parameters (ebx is used as a immediate value):
    ;   ebx     file descriptor
    ; Return value:
    ;   eax     success status (0 = success, -1 = invalid file descriptor)
    CALL SYSCALLS_FILE_CLOSE
    CMP $-1, %eax
    JNE _UTIL_CLEAR_FRAME_FILE_CLOSED
    ; this should not be able to happen

    ; panic

    ; TODO stop the simulator

    ._UTIL_CLEAR_FRAME_FILE_CLOSED:

    POP %ebx
    POP %ebx
    POP %ebx

RET