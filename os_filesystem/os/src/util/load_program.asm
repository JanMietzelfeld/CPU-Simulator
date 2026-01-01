

; The Loader is responsible for loading the code of a program into memory

; assume %ebx is the pointer to the filename of the to be loaded program

; UTIL_LOAD_PROGRAM
; Parameters (ebx is a pointer to the following struct):
;   *(ebx)     Pointer to a ASCII filename
;   *(ebx+4)   Pointer to the PCB
; Return value (immediate value):
;   eax     success status (0 = success, -1 = file does not exists, -2 = not a file, -3 = out of memory, -4 = unknown)
.UTIL_LOAD_PROGRAM:

    PUSH %ebx ; save ebx

    MOV *%ebx, %ebx
    ; %ebx is a pointer to the filename

    ; SYSCALLS_FILE_STAT
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file length or error code (>=0 = length, -1 = file does not exists, -2 = not a file)
    CALL SYSCALLS_FILE_STAT
    CMP $0, %eax
    JGE _UTIL_LOAD_PROGRAM_FILE_STAT
    POP %ebx
    RET

    ._UTIL_LOAD_PROGRAM_FILE_STAT:


    PUSH %eax ; Push the file length onto the stack

    ; SYSCALLS_FILE_OPEN
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file descriptor (-1 = error)
    CALL SYSCALLS_FILE_OPEN
    CMP $0, %eax
    JGE _UTIL_LOAD_PROGRAM_FILE_OPEN
    POP %ebx
    POP %ebx
    MOV $-4, %eax
    RET
    
    ._UTIL_LOAD_PROGRAM_FILE_OPEN:

    PUSH %eax ; Push the file descriptor onto the stack

    ; *(%esp+4) = file lenght
    ; *(%esp) = file descriptor

    ; calculate number of needed frames

    MOV %esp, %eax
    ADD $4, %eax
    MOV *%eax, %eax ; get file lenght

    MOV %eax, %ebx ; copy

    SHR $CONST_OS_FRAME_BIT_SIZE, %eax ; divide by frame size (2¹²) = 12 bit shifts to the right

    ; check if there is a remainder
    MOV $CONST_CPU_BIT_WIDTH, %ecx 
    SUB $CONST_OS_FRAME_BIT_SIZE, %ecx
    SAL %ecx, %ebx
    CMP $0, %ebx
    JE UTIL_LOAD_PROGRAM_NO_REMAINDER
        ADD $1, %eax ; if there is a remainder we need to allocate one more frame for it
    .UTIL_LOAD_PROGRAM_NO_REMAINDER:

    PUSH %eax ; Push the number of needed frames onto the stack

    PUSH $1 ; Push the number of written frames onto the stack

    ._UTIL_LOAD_PROGRAM_ALLOCATE_FRAMES:

        ; set up parameter
        MOV %esp, %ebx
        ADD $16, %ebx
        MOV *%ebx, %ebx
        ADD $4, %ebx
        MOV *%ebx, %ebx ; ebx = pcb pointer

        ; UTIL_ALLOCATE_FRAME
        ; Parameters 
        ;   ebx     pcb pointer
        ; Return value (immediate value):
        ;   eax     frame address (0xFFFFFFFF = invalid)
        CALL UTIL_ALLOCATE_FRAME
        CMP $0xFFFFFFFF, %eax
        JNE _UTIL_LOAD_PROGRAM_ALLOCATE_FRAME_NO_ERROR

        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx

        MOV $-3, %eax
        RET

        ._UTIL_LOAD_PROGRAM_ALLOCATE_FRAME_NO_ERROR:

        PUSH %eax ; Push the frame start address onto the stack

        ; struct for syscall Read
        PUSH $CONST_OS_FRAME_SIZE ; Push the buffer size onto the stack
        PUSH %eax ; Push the frame start address onto the stack

        MOV %esp, %ecx
        ADD $20, %ecx
        PUSH *%ecx ; Push the file descriptor onto the stack

        MOV %esp, %ebx ; set ebx to start of the struct

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
        JGE _UTIL_LOAD_PROGRAM_FILE_READ_NO_ERROR

        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx

        MOV $-4, %eax
        RET

        ._UTIL_LOAD_PROGRAM_FILE_READ_NO_ERROR:


        POP %ebx ; was virtualization enabled
        CMP $0, %ebx
        JE _UTIL_LOAD_PROGRAM_SKIP_MEMORY_VIRTUALIZATION
            DEV $CONST_DEV_COMMAND_CPU_ENABLE_MEMORY_VIRTUALIZATION, $0
        ._UTIL_LOAD_PROGRAM_SKIP_MEMORY_VIRTUALIZATION:

        POP %ebx
        POP %ebx
        POP %ebx

        PUSH $0         ; seek mode
        PUSH $CONST_OS_FRAME_SIZE    ; seek offset

        MOV %esp, %ecx
        ADD $20, %ecx
        PUSH *%ecx ; file descriptor

        MOV %esp, %ebx ; set ebx to start of the struct

        ; SYSCALLS_FILE_SEEK
        ; Parameters (ebx is a pointer to the following struct):
        ;   *(ebx)     file descriptor
        ;   *(ebx+4)   seek offset
        ;   *(ebx+8)   seek mode (0 - Seek from current position, 1 - Seek from start of file, 2 - Seek from end of file)
        ; Return value (immediate value):
        ;   eax     success status (0 = success, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = negative seek position)
        CALL SYSCALLS_FILE_SEEK
        CMP $0, %eax
        JGE _UTIL_LOAD_PROGRAM_FILE_SEEK_NO_ERROR

        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx
        POP %ebx

        MOV $-4, %eax
        RET

        ._UTIL_LOAD_PROGRAM_FILE_SEEK_NO_ERROR:

        POP %ebx
        POP %ebx
        POP %ebx

        ; map the frame into the virtial memory space

        ; *(%esp+8) = number of needed frames
        ; *(%esp+4) = number of written frames
        ; *(%esp) = frame start address

        ; calculate offset in page table (code starts at address 0 -> page 0)
        MOV %esp, %ecx
        ADD $4, %ecx
        MOV *%ecx, %ecx
        SUB $1, %ecx
        SHL $2, %ecx ; ecx = offset to get to the page table entry to be updated

        MOV %esp, %ebx ; get ebx back
        ADD $20, %ebx
        MOV *%ebx, %ebx
        ADD $4, %ebx
        MOV *%ebx, %ebx ; ebx = pcb pointer

        ADD $2, %ebx ; address of the Page Table Pointer
        MOV *%ebx, %eax ; Page Table Pointer

        ADD %ecx, %eax ; add the offset
        POP %ecx ; frame start address

        AND $0xFFFFF000, %ecx ; calculate the address part of the page table entry
        SHR $12, %ecx ; make space for the flags (12)
        OR $0xA0000000, %ecx ; A = Present and Executable bit
        MOV %ecx, *%eax
        MOV %esp, %eax 
        ADD $4, %eax ; number of nedded frames
        CMP *%esp, *%eax
        JE _UTIL_LOAD_PROGRAM_FIND_FRAMES_END
        ADD $1, *%esp
        JMP _UTIL_LOAD_PROGRAM_ALLOCATE_FRAMES

    ._UTIL_LOAD_PROGRAM_FIND_FRAMES_END:
        POP %ebx ; POP the number of written frames from the stack
        POP %ebx ; POP the number of needed frames from the stack
        POP %ebx ; POP the file descriptor from the stack

        POP %eax ; POP the file lenght from the stack
        POP %eax ; POP the ebx input

        ; SYSCALLS_FILE_CLOSE
        ; Parameters (ebx is used as a immediate value):
        ;   ebx     file descriptor
        ; Return value:
        ;   eax     success status (0 = success, -1 = invalid file descriptor)
        CALL SYSCALLS_FILE_CLOSE
        CMP $-1, %eax
        JNE _UTIL_LOAD_PROGRAM_FILE_CLOSED
            ; this should not be able to happen

            ; panic

            ; TODO stop the simulator
        ._UTIL_LOAD_PROGRAM_FILE_CLOSED:

MOV $0, %eax
RET
