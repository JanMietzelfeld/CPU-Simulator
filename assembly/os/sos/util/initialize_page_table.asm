

; Set Up Page Table
; assume than %ebx contains the base address of the Page Table

;                    Page Structure
;
;   --------------------------------------------------
;   |       12 Bits Flags     |       20 bits        |
;   | P W X M I C U U U U U U |                      |
;   | 0 0 0 0 0 0 0 0 0 0 0 0 | 00000000000000000000 |
;   --------------------------------------------------
;   P = Present bit (0 = not Present, 1 = Present)
;   W = Writable bit (0 = not Writable, 1 = Writable)
;   X = Executable bit (0 = not Executable, 1 = Executable)
;   M = Mode bit ( 0 = User mode allowed, 1 = Kernel mode only)
;   I = Pinned bit (0 = not Pinned, 1 = Pinned)
;   C = Changed bit (0 = not Changed, 1 = Changed)
;   U = Unused
;

; UTIL_INITIALIZE_PAGE_TABLE
; Parameters (ebx is a pointer to the start of the Page Table):
;   (ebx)     Pointer to the Page Table entry
; Return value (immediate value):
;   none
.UTIL_INITIALIZE_PAGE_TABLE:

    PUSH %ebx

    ; push "os/util/page_table.bin\0" onto stack

    PUSH $0x696E0000
    PUSH $0x6C652E62
    PUSH $0x5F746162
    PUSH $0x70616765
    PUSH $0x74696C2F
    PUSH $0x6F732F75 

    MOV %esp, %ebx

    ; SYSCALLS_FILE_OPEN
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file descriptor
    CALL SYSCALLS_FILE_OPEN
    ; TODO check for error code

    POP %ebx
    POP %ebx
    POP %ebx
    POP %ebx
    POP %ebx
    POP %ebx

    POP %ebx ; Pointer to the Page Table entry

    PUSH $CONST_OS_PAGE_TABLE_SIZE
    PUSH %ebx
    PUSH %eax

    MOV %esp, %ebx

    ; SYSCALLS_FILE_READ
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     file descriptor (fd=0 for console, fd>0 for files)
    ;   *(ebx+4)   pointer to buffer, this buffer will be filled by the file system
    ;   *(ebx+8)   buffer size, limits the amount of bytes that will be read
    ; Return value (immediate value):
    ;   eax     success status (>=0 = number of bytes read, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = no console input ready)
    CALL SYSCALLS_FILE_READ
    ; TODO check for error code

    POP %ebx
    POP %ebx
    POP %ebx

; Page Table Is Set Up

RET