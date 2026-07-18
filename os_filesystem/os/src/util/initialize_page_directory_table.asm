; UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE
; Parameters (ebx is a pointer to the start of the Page Table):
;   (ebx)     Pointer to the Page Table base address
; Return value (immediate value):
;   (eax)  0 = success, -1 = no space
.UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE:

PUSH %ebx
PUSH %ecx

PUSH %ebx ; page directory table base address
PUSH $768 ; index in page directory table 768 = start of kernel space
PUSH $CONST_KERNEl_MEMORY_START ; current physical memory address
PUSH $0 ; L2 index

; Stack Layout:
; esp + 12 page directory base address
; esp + 8  page directory index
; esp + 4  current physical memory address
; esp  L2 index


._UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_START:
MOV %esp, %ebx
ADD $8, %ebx
CMP $1024, *%ebx ; reached end of page directory table?
JGE _UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_DONE

; allocate new L2 table
; Searches for a free page table, marks it as used and returns the base address
; UTIL_ALLOCATE_PAGE_TABLE
; Parameters 
;   none
; Return value (immediate value):
;   eax     page table base address (0xFFFFFFFF = invalid)
CALL UTIL_ALLOCATE_PAGE_TABLE
CMP $0xFFFFFFFF, %eax
JE _UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_ERROR

PUSH %eax
; UTIL_INITIALIZE_PAGE_TABLE
; Parameters (ebx is a pointer to the start of the Page Table):
;   (ebx)     Pointer to the Page Table base address
; Return value (immediate value):
;   none
CALL UTIL_INITIALIZE_PAGE_TABLE
POP %eax
MOV %eax, %ebx

; format page directory entry
AND $0xFFFFF000, %eax ; calculate the address part of the page table entry
SHR $12, %eax ; make space for the flags (12)
OR $0xA0000000, %eax ; A = Present and Executable bit

; write entry to page directory entry
MOV %esp, %ecx
ADD $12, %ecx
MOV *%ecx, %ecx ; page directory base address
PUSH %eax ; save formatted pde
MOV %esp, %eax
ADD $12, %eax ; 12 because because push of formatted pde
MOV *%eax, %eax ; current pde index
SHL $2, %eax ; byte offset in pde
ADD %ecx, %eax ; eax pointer to pde entry
POP %ecx ; restore formatted pde
MOV %ecx, *%eax ; write to page directory

MOV $0, *%esp ; reset L2 index counter

._UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_L2_START:
    MOV *%esp, %eax
    CMP $1024, %eax
    JGE _UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_L2_DONE

    ; calculate L2 entry address
    ; ebx has L2 base address
    MOV %eax, %ecx ; L2 index
    SHL $2, %ecx ; byte offset in L2
    ADD %ebx, %ecx ; pointer to L2 entry

    ; format L2 entry
    MOV %esp, %eax
    ADD $4, %eax
    MOV *%eax, %eax ; current physical memory address to map
    AND $0xFFFFF000, %eax ; calculate the address part of the page table entry
    SHR $12, %eax ; make space for the flags (12)
    OR $0xA0000000, %eax ; A = Present and Executable bit
    MOV %eax, *%ecx ; map L2 to page directory entry
    
    ; add frame size to current physical address
    MOV %esp, %eax
    ADD $4, %eax
    ADD $CONST_OS_FRAME_SIZE, *%eax ; update stack entry

    ; increase L2 index
    MOV %esp, %eax
    ADD $1, *%eax

    JMP _UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_L2_START


._UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_L2_DONE:
    ; increase pde index
    MOV %esp, %eax
    ADD $8, %eax
    ADD $1, *%eax

    JMP _UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_START


._UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_DONE:
    ADD $16, %esp ; clear variables from stack
    POP %ecx
    POP %ebx
    MOV $0, %eax
    RET


._UTIL_INITIALIZE_PAGE_DIRECTORY_TABLE_ERROR:
    ; no space left for page tables
    ADD $16, %esp ; clear variables from stack
    POP %ecx
    POP %ebx
    MOV $-1, %eax
    RET
