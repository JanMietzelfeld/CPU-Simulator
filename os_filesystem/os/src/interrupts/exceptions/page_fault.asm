; Interrupt ISR for a Page Fault (0x0E)
.INTERRUPTS_PAGE_FAULT:
    PUSH %eax
    PUSH %ebx
    PUSH %ecx

    MOV $CONST_OS_CURRENT_PCB_POINTER, %ebx
    MOV *%ebx, %ebx ; PCB Pointer

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   ebx     pcb pointer
    ; Return value (immediate value):
    ;   eax     frame address (0xFFFFFFFF = invalid)
    CALL UTIL_ALLOCATE_FRAME
    
    ; check for error
    CMP $0xFFFFFFF, %eax
    JNE _INTERRUPTS_PAGE_FAULT_NO_UTIL_ALLOCATE_FRAME_ERROR

        ; memory is full 
        ; TODO implement memory swapping
        
        ; for now we just terminate the process
        CALL SYSCALLS_PROCESS_EXIT

    ._INTERRUPTS_PAGE_FAULT_NO_UTIL_ALLOCATE_FRAME_ERROR:

    MOV %esp, %ecx
    ADD $12, %ecx
    MOV *%ecx, %ecx

    ; ecx contains the address that caused the page fault

    SHR $CONST_OS_FRAME_BIT_SIZE, %ecx ; calculate index for responsible page table entry

    MOV $CONST_OS_CURRENT_PCB_POINTER, %ebx ; get address of the pcb pointer
    MOV *%ebx, %ebx ; PCB Pointer

    ADD $2, %ebx ; address of the Page Table Pointer

    MOV *%ebx, %ebx ; Page Table Pointer

    SHL $2, %ecx ; each entry is 4 bytes big

    ADD %ecx, %ebx ; add the offset

    AND $0xFF000000, *%ebx  ; delete any old mapping
    OR $0x80000000, *%ebx ; 8 = Present | add the present bit

    SHR $CONST_OS_FRAME_BIT_SIZE,  %eax ; calculate frame index
    AND $0xFFFFFF, %eax ; make sure no flag is changed
    OR %eax, *%ebx ; update mapping (should not change flags)

    POP %ecx
    POP %ebx
    POP %eax
    ADD $4, %esp ; "pop" the address that caused the page fault
IRET