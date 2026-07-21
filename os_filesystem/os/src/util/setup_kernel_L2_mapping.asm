; UTIL_SETUP_KERNEL_L2_MAPPING
; Parameters:
;   none
; Return value (immediate value):
;   none
.UTIL_SETUP_KERNEL_L2_MAPPING:
PUSH %eax
PUSH %ebx
PUSH %ecx
PUSH %edx

; kernel space is the top 1Gib, so 256 L2 page tables are needed to map it


PUSH $0 ; amount of page tables counter
PUSH $CONST_KERNEl_MEMORY_START ; current physical memory address
PUSH $0 ; page table index

; Stack Layout:
; esp + 8  amount of page tables counter
; esp + 4  current physical memory address
; esp      page table index


._UTIL_SETUP_KERNEL_L2_MAPPING_START:
MOV %esp, %ebx
ADD $8, %ebx
CMP $256, *%ebx ; reached amount of page tables needed?
JGE _UTIL_SETUP_KERNEL_L2_MAPPING_DONE

; allocate new page table
; Searches for a free page table, marks it as used and returns the base address
; UTIL_ALLOCATE_PAGE_TABLE
; Parameters 
;   none
; Return value (immediate value):
;   eax     page table base address (0xFFFFFFFF = invalid)
CALL UTIL_ALLOCATE_PAGE_TABLE
CMP $0xFFFFFFFF, %eax
JE _UTIL_SETUP_KERNEL_L2_MAPPING_TABLE_ERROR


MOV $0, *%esp ; reset page table index counter

._UTIL_SETUP_KERNEL_L2_MAPPING_POPULATE_TABLE_START:
    CMP $1024, *%esp
    JGE _UTIL_SETUP_KERNEL_L2_MAPPING_POPULATE_TABLE_DONE

    ; calculate entry address
    ; eax has table base address
    MOV *%esp, %ecx ; index
    SHL $2, %ecx ; byte offset in page table
    ADD %eax, %ecx ; pointer to L2 entry

    ; format page table entry entry
    MOV %esp, %ebx
    ADD $4, %ebx
    MOV *%ebx, %ebx ; current physical memory address to map
    AND $0xFFFFF000, %ebx ; calculate the address part of the page table entry
    SHR $12, %ebx ; make space for the flags (12)


    MOV %esp, %edx
    ADD $8, %edx
    CMP $64, *%edx
    JGE _UTIL_SETUP_KERNEL_L2_MAPPING_SETUP_FLAGS
    OR $0xB0000000, %ebx ; B = Present, Executable, Mode bits set
    JMP _UTIL_SETUP_KERNEL_L2_MAPPING_SETUP_FLAGS_DONE

    ._UTIL_SETUP_KERNEL_L2_MAPPING_SETUP_FLAGS:
    OR $0x90000000, %ebx ; 9 = Present and Mode bits set


._UTIL_SETUP_KERNEL_L2_MAPPING_SETUP_FLAGS_DONE:



    MOV %ebx, *%ecx ; map entry
    
    ; add frame size to current physical address
    MOV %esp, %edx
    ADD $4, %edx
    ADD $CONST_OS_FRAME_SIZE, *%edx ; update stack entry

    ; increase page table index
    MOV %esp, %edx
    ADD $1, *%edx

    JMP _UTIL_SETUP_KERNEL_L2_MAPPING_POPULATE_TABLE_START


._UTIL_SETUP_KERNEL_L2_MAPPING_POPULATE_TABLE_DONE:
    ; increase page table counter
    MOV %esp, %edx
    ADD $8, %edx
    ADD $1, *%edx

    JMP _UTIL_SETUP_KERNEL_L2_MAPPING_START


._UTIL_SETUP_KERNEL_L2_MAPPING_DONE:
    ADD $12, %esp ; clear variables from stack

POP %edx
POP %ecx
POP %ebx
POP %eax
RET

._UTIL_SETUP_KERNEL_L2_MAPPING_TABLE_ERROR:
    ; no space left for page tables
    ; this should not happen
    ; TODO stop simulator
    ADD $12, %esp ; clear variables from stack
    POP %edx
    POP %ecx
    POP %ebx
    POP %eax
    RET