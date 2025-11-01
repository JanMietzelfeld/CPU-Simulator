

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
; Parameters 
; Parameters (ebx is a pointer to the start of the Page Table):
;   (ebx)     Pointer to the Page Table
; Return value (immediate value):
;   none
.UTIL_INITIALIZE_PAGE_TABLE:

MOV $0, %ecx

.INITIALIZE_PAGE_TABLE_INIT_USER_FLAGS:
    MOV $0x40000000, *%ebx ;Set Writable bit to 1
    ADD $4, %ebx

    ; test if done
    ADD $1, %ecx

    TEST $786432, %ecx ;There are 786432 Entries in user space
    JNE INITIALIZE_PAGE_TABLE_INIT_USER_FLAGS

MOV %ecx, %eax
MOV $0, %ecx

.INITIALIZE_PAGE_TABLE_INIT_KERNEL_FLAGS:

    AND $0x800FFFFF, %eax ; set up 1 - 1 map

    CMP $65536, %ecx ;There are 65536 Entries in the code segment kernel space

    JL INITIALIZE_PAGE_TABLE_INIT_KERNEL_CODE_SEGMENT

    OR $0x90000000, %eax ; Set Present and Mode bit to 1
    MOV %eax, *%ebx 
    JMP INITIALIZE_PAGE_TABLE_SKIP_INIT_KERNEL_CODE_SEGMENT

    .INITIALIZE_PAGE_TABLE_INIT_KERNEL_CODE_SEGMENT:
        OR $0xB0000000, %eax ;Set Present, Mode and Executable bit to 1
        MOV %eax, *%ebx 

    .INITIALIZE_PAGE_TABLE_SKIP_INIT_KERNEL_CODE_SEGMENT:
    
    ADD $4, %ebx

    ; test if done
    ADD $1, %ecx

    TEST $262144, %ecx ;There are 262144 Entries in kernel space
    JNE INITIALIZE_PAGE_TABLE_INIT_KERNEL_FLAGS

; Page Table Is Set Up

RET