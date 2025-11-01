

; The Loader is responsible for loading the code of a program into memory

; assume %ebx is the pointer to the filename of the to be loaded program

; UTIL_LOAD_PROGRAM
; Parameters (ebx is a pointer to the following struct):
;   *(ebx)     Pointer to a ASCII filename
;   *(ebx+4)   Pointer to the PCB
; Return value (immediate value):
;   none
.UTIL_LOAD_PROGRAM:


    PUSH %ebx ; save ebx

    MOV *%ebx, %ebx
    ; %ebx is a pointer to the filename

    ; SYSCALLS_IO_FILE_STAT
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file length or error code (>=0 = length, -1 = file adoes not exists, -2 = not a file)
    CALL SYSCALLS_IO_FILE_STAT
    ; TODO check for error code


    PUSH %eax ; Push the file length onto the stack

    ; SYSCALLS_IO_FILE_OPEN
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file descriptor
    CALL SYSCALLS_IO_FILE_OPEN
    ; TODO check for error code

    PUSH %eax ; Push the file descriptor onto the stack


    ; *(%esp+4) = file lenght
    ; *(%esp) = file descriptor

    ; calculate number of needed frames

    MOV %esp, %ecx
    ADD $4, %ecx
    MOV *%ecx, %eax ; get file lenght

    DIV $0x1000, %eax ; divide by frame size (2¹²)

    ; TODO check if there is a remainder, if not skip this
    ADD $1, %eax ; In most cases the lenght is not a multiple of the frame lenght 

    PUSH %eax ; Push the number of needed frames onto the stack

    PUSH $1 ; Push the number of written frames onto the stack

    .LOAD_PROG_ALLOCATE_FRAMES:

        ; UTIL_ALLOCATE_FRAME
        ; Parameters 
        ;   none
        ; Return value (immediate value):
        ;   eax     frame address (0xFFFFFFFF = invalid)
        CALL UTIL_ALLOCATE_FRAME

        ; %eax = frame start address
        ; TODO check if address is invalid
        PUSH %eax ; Push the frame start address onto the stack

        ; struct for syscall
        PUSH $0x1000 ; Push the buffer size onto the stack
        PUSH %eax ; Push the frame start address onto the stack

        MOV %esp, %ecx
        ADD $20, %ecx
        PUSH *%ecx ; Push the file descriptor onto the stack

        MOV %esp, %ebx ; set ebx to start of the struct

        ; SYSCALLS_IO_FILE_READ
        ; Parameters (ebx is a pointer to the following struct):
        ;   *(ebx)     file descriptor (fd=0 for console, fd>0 for files)
        ;   *(ebx+4)   pointer to buffer, this buffer will be filled by the file system
        ;   *(ebx+8)   buffer size, limits the amount of bytes that will be read
        ; Return value (immediate value):
        ;   eax     success status (>=0 = number of bytes read, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = no console input ready)
        CALL SYSCALLS_IO_FILE_READ
        ; TODO check for error code


        PUSH $0         ; seek mode
        PUSH $0x1000    ; seek offset

        MOV %esp, %ecx
        ADD $20, %ecx
        PUSH *%ecx ; file descriptor

        MOV %esp, %ebx ; set ebx to start of the struct

        ; SYSCALLS_IO_FILE_SEEK
        ; Parameters (ebx is a pointer to the following struct):
        ;   *(ebx)     file descriptor
        ;   *(ebx+4)   seek offset
        ;   *(ebx+8)   seek mode (0 - Seek from current position, 1 - Seek from start of file, 2 - Seek from end of file)
        ; Return value (immediate value):
        ;   eax     success status (0 = success, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = negative seek position)
        CALL SYSCALLS_IO_FILE_SEEK
        ; TODO check for error code

        ; map the frame into the virtial memory space

        ; *(%esp+8) = number of needed frames
        ; *(%esp+4) = number of written frames
        ; *(%esp) = frame start address

        ; calculate offset in page table (code starts at address 0 -> page 0)
        MOV %esp, %ecx
        ADD $4, %ecx
        MOV *%ecx, %ecx
        SUB $1, %ecx
        MUL $4, %ecx

        POP %ebx ; get ebx back
        MOV *%ebx, %ebx
        ADD $4, %ebx ; pointer to the pcb

        MOV *%ebx, %eax
        ADD $2, %eax
        PUSH %eax ; PUSH the start address of the Page Table

        ADD %ecx, *%esp

        MOV %esp, %ecx
        ADD $4, %ecx

        AND $0x11111000, *%ecx ; calculate the address part of the page table entry
        DIV $8, *%ecx ; make space for the flags
        OR $0xA0000000, *%ecx ; A = Present, Mode and Executable bit
        MOV *%esp, %eax
        MOV *%ecx, *%eax

        POP %ebx ; POP the start address of the Page Table


        POP %ebx ; frame start address

        MOV %esp, %eax
        ADD $4, %eax
        TEST *%esp, *%eax
        JE LOAD_PROG_FIND_FRAMES_END
        ADD $1, *%esp
        JMP LOAD_PROG_ALLOCATE_FRAMES

    .LOAD_PROG_FIND_FRAMES_END:
    POP %ebx ; POP the number of written frames onto the stack
    POP %ebx ; POP the number of needed frames onto the stack
    POP %ebx ; POP the file descriptor onto the stack
    POP %ebx ; POP the file lenght onto the stack


    RET
