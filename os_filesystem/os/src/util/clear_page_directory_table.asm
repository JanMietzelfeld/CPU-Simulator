; UTIL_CLEAR_PAGE_DIRECTORY_TABLE
; Parameters:
;   (ebx)     Pointer to the page directory table base address
; Return value (immediate value):
;   none
.UTIL_CLEAR_PAGE_DIRECTORY_TABLE:

PUSH %eax
PUSH %ebx
PUSH %ecx

DEV $CONST_DEV_COMMAND_CPU_IS_MEMORY_VIRTUALIZATION_ENABLED, $0
PUSH %eax ; is virtualization enabled
DEV $CONST_DEV_COMMAND_CPU_DISABLE_MEMORY_VIRTUALIZATION, $0

MOV %ebx, %eax
MOV $0, %ebx ; index counter

._UTIL_CLEAR_PAGE_DIRECTORY_TABLE_WALK_START:
    CMP $1024, %ebx
    JGE _UTIL_CLEAR_PAGE_DIRECTORY_TABLE_WALK_DONE
    ; calculate entry address
    MOV %ebx, %ecx
    SHL $2, %ecx
    ADD %eax, %ecx ; index * 4 (byte) + base

    MOV *%ecx, %ecx ; ecx contains page directory table entry now
    TEST $0x80000000, %ecx ; present bit set?
    JZ _UTIL_CLEAR_PAGE_DIRECTORY_TABLE_SKIP_ENTRY
    AND $0xFFFFF, %ecx ; strip flags
    SHL $12, %ecx ; get L2 page table base address

    PUSH %eax
    PUSH %ebx ; page directory index counter
    PUSH %ecx ; L2 page table base address

    ; UTIL_CLEAR_PAGE_TABLE
    ; Parameters:
    ;   (ebx)       Page directory index
    ;   (ecx)       L2 page table base address
    ; Return value (immediate value):
    ;   none
    CALL UTIL_CLEAR_PAGE_TABLE

    POP %ecx
    POP %ebx
    POP %eax

    ._UTIL_CLEAR_PAGE_DIRECTORY_TABLE_SKIP_ENTRY:
        ADD $1, %ebx
    JMP _UTIL_CLEAR_PAGE_DIRECTORY_TABLE_WALK_START
     

._UTIL_CLEAR_PAGE_DIRECTORY_TABLE_WALK_DONE:


; clear page table bitmap 

MOV $CONST_OS_PAGE_TABLE_LIST_START, %ebx
MOV $CONST_OS_PAGE_TABLE_BITMAP_START, %ecx

; eax page table base address
; ebx page table list start address
; ecx page table bitmap start address

SUB %ebx, %eax
SHR $CONST_OS_PAGE_TABLE_BIT_SIZE, %eax ; global index of page table

; find word offset in bitmap
MOV %eax, %ebx
SHR $5, %ebx ; word index (global index / 32)
SHL $2, %ebx ; byte offset in bitmap (word index * 4)
ADD %ebx, %ecx ; memory address of dword in bitmap

; find bit position
AND $31, %eax 
MOV $31, %ebx
SUB %eax, %ebx ; index of the bit

; create mask to clear bit
MOV $1, %eax
SHL %ebx, %eax ; shift bit into position
NOT %eax ; invert to zero specific bit

; eax bitmask
; ecx memory address bitmap

MOV *%ecx, %ebx ; load dword from bitmap
AND %eax, %ebx ; apply mask
MOV %ebx, *%ecx ; write back to bitmap

POP %ebx ; was virtualization enabled
CMP $0, %ebx
JE _CLEAR_PAGE_DIRECTORY_TABLE_SKIP_MEMORY_VIRTUALIZATION
    DEV $CONST_DEV_COMMAND_CPU_ENABLE_MEMORY_VIRTUALIZATION, $0
._CLEAR_PAGE_DIRECTORY_TABLE_SKIP_MEMORY_VIRTUALIZATION:


POP %ecx
POP %ebx
; free page directory table itself
; UTIL_CLEAR_FRAME
; Parameters:
;   (ebx)     Pointer to the frame base address
; Return value (immediate value):
;   none
CALL UTIL_CLEAR_FRAME
POP %eax
RET