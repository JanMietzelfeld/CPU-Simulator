; Interrupt ISR for a Page Fault (0x0E)
.INTERRUPTS_PAGE_FAULT:
    PUSH %eax
    PUSH %ebx
    PUSH %ecx



    MOV %esp, %ecx
    ADD $12, %ecx
    MOV *%ecx, %ecx
    PUSH %ecx ; save fault address

    ; ecx contains the address that caused the page fault

    ; extract page directory table index

    SHR $22, %ecx 
    SHL $2, %ecx ; calculate byte offset

    MOV $CONST_OS_CURRENT_PCB_POINTER, %ebx
    MOV *%ebx, %ebx ; PCB Pointer
    ADD $2, %ebx ; point to page directory table 
    MOV *%ebx, %eax ; page directory base address

    ADD %eax, %ecx ; address of page table directory entry

    MOV *%ecx, %eax ; page directory table entry
    TEST $0x80000000, %eax ; present bit set?
    JNZ _INTERRUPTS_PAGE_FAULT_FIND_PAGE_TABLE_INDEX
        ; L2 page table was not present, allocate and map
        ; ecx pointer to page directory table

        ; Searches for a free page table, marks it as used and returns the base address
        ; UTIL_ALLOCATE_PAGE_TABLE
        ; Parameters 
        ;   none
        ; Return value (immediate value):
        ;   eax     page table base address (0xFFFFFFFF = invalid)
        CALL UTIL_ALLOCATE_PAGE_TABLE
        CMP $0xFFFFFFFF, %eax
        JNE _INTERRUPTS_PAGE_FAULT_NO_ALLOCATE_PAGE_TABLE_FAULT
            ; No page table free, for now just kill process
            CALL SYSCALLS_PROCESS_EXIT
        ._INTERRUPTS_PAGE_FAULT_NO_ALLOCATE_PAGE_TABLE_FAULT:

        ; eax page table address
        MOV %eax, %ebx

        ; UTIL_INITIALIZE_PAGE_TABLE
        ; Parameters (ebx is a pointer to the start of the Page Table):
        ;   (ebx)     Pointer to the Page Table base address
        ; Return value (immediate value):
        ;   none
        CALL UTIL_INITIALIZE_PAGE_TABLE

        ; ecx page directory table entry pointer

        AND $0xFFF00000, *%ecx ;delete any old mapping, keep flags
        OR $0x80000000, *%ecx ;set present bit

        SHR $12, %eax ; make space for flags
        AND $0xFFFFF, %eax ; make sure any flags are removed
        OR %eax, *%ecx ; update entry without changing flags

    ._INTERRUPTS_PAGE_FAULT_FIND_PAGE_TABLE_INDEX:
    ; ecx contains pointer to page directory table entry
    MOV *%ecx, %ecx
    AND $0xFFFFF, %ecx ; remove flags
    SHL $12, %ecx ; physical address of L2 page table
    POP %ebx
    ; ebx fault address
    ; ecx physical address of L2 page table
    ; extract page table index
    AND $0x3FF000, %ebx
    SHR $12, %ebx ; page table index
    SHL $2, %ebx ; calculate byte offset
    ADD %ecx, %ebx ; ebx contains target address of page table entry

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   none
    ; Return value (immediate value):
    ;   eax     frame base address (0xFFFFFFFF = invalid)
    CALL UTIL_ALLOCATE_FRAME

    CMP $0xFFFFFFFF, %eax
    JNE _INTERRUPTS_PAGE_FAULT_NO_ALLOCATE_FRAME_FAULT
        ; No free memory, for now just kill process
        ; TODO implement swapping
        CALL SYSCALLS_PROCESS_EXIT
    ._INTERRUPTS_PAGE_FAULT_NO_ALLOCATE_FRAME_FAULT:

    ; eax frame address
    ; ebx page table entry pointer

    AND $0xFFF00000, *%ebx  ; delete old mapping
    OR $0x80000000, *%ebx ; set present bit

    SHR $12, %eax ; make space for flags
    AND $0xFFFFF, %eax ; make sure any flags are removed
    OR %eax, *%ebx ; update entry without changing flags






    ;MOV $CONST_OS_CURRENT_PCB_POINTER, %ebx
    ;MOV *%ebx, %ebx ; PCB Pointer

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   ebx     pcb pointer
    ; Return value (immediate value):
    ;   eax     frame address (0xFFFFFFFF = invalid)
    ;CALL UTIL_ALLOCATE_FRAME
    
    ; check for error
    ;CMP $0xFFFFFFFF, %eax
    ;JNE _INTERRUPTS_PAGE_FAULT_NO_UTIL_ALLOCATE_FRAME_ERROR

        ; memory is full 
        ; TODO implement memory swapping
        
        ; for now we just terminate the process
        ;CALL SYSCALLS_PROCESS_EXIT

    ;._INTERRUPTS_PAGE_FAULT_NO_UTIL_ALLOCATE_FRAME_ERROR:

    ;MOV %esp, %ecx
    ;ADD $12, %ecx
    ;MOV *%ecx, %ecx

    ; ecx contains the address that caused the page fault

    ;SHR $CONST_OS_FRAME_BIT_SIZE, %ecx ; calculate index for responsible page table entry

    ;MOV $CONST_OS_CURRENT_PCB_POINTER, %ebx ; get address of the pcb pointer
    ;MOV *%ebx, %ebx ; PCB Pointer

    ;ADD $2, %ebx ; address of the Page Table Pointer

    ;MOV *%ebx, %ebx ; Page Table Pointer

    ;SHL $2, %ecx ; each entry is 4 bytes big

    ;ADD %ecx, %ebx ; add the offset

    ;AND $0xFF000000, *%ebx  ; delete any old mapping
    ;OR $0x80000000, *%ebx ; 8 = Present | add the present bit

    ;SHR $CONST_OS_FRAME_BIT_SIZE,  %eax ; calculate frame index
    ;AND $0xFFFFFF, %eax ; make sure no flag is changed
    ;OR %eax, *%ebx ; update mapping (should not change flags)

    POP %ecx
    POP %ebx
    POP %eax
    ADD $4, %esp ; "pop" the address that caused the page fault
IRET