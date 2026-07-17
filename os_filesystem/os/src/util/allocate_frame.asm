 
    ; searches for an unused frame and returns it
    ; if memory is "full" it returns the addres 0xFFFFFFFF as invalid
    ; otherwise it returns the start addres of the frame

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   ebx     pcb pointer
    ; Return value (immediate value):
    ;   eax     frame base address (0xFFFFFFFF = invalid)
    .UTIL_ALLOCATE_FRAME:

    ;MOV $CONST_OS_MEMORY_MAP_START, %eax
    PUSH %ebx
    PUSH %ecx
    MOV $0, %ecx
    



; find free frame
        
    MOV $CONST_OS_MEMORY_BITMAP_START, %eax

    ._UTIL_ALLOCATE_FRAME_WALK_MEMORY_BITMAP_START:
        CMP $CONST_OS_MEMORY_BITMAP_END, %eax ; end of bitmap reached?
        JAE _UTIL_ALLOCATE_FRAME_ALLOCATE_FRAME_NO_FRAME_FOUND

        MOV *%eax, %ebx ; get content
        MOV $0, %ecx ; set bit counter to zero

        ._UTIL_ALLOCATE_FRAME_WALK_REGISTER_START:
            CMP $32, %ecx ; tested all 32 bits?
            JE _UTIL_ALLOCATE_FRAME_NEXT_DOUBLE_WORD
            TEST $0x80000000, %ebx
            JZ _UTIL_ALLOCATE_FRAME_FOUND_FREE_FRAME ; is the left most bit zero, frame found
            SHL $1, %ebx
            ADD $1, %ecx ; otherwise increase counter and try again
            JMP _UTIL_ALLOCATE_FRAME_WALK_REGISTER_START

    ._UTIL_ALLOCATE_FRAME_NEXT_DOUBLE_WORD:
        ADD $4, %eax
        JMP _UTIL_ALLOCATE_FRAME_WALK_MEMORY_BITMAP_START

    ._UTIL_ALLOCATE_FRAME_FOUND_FREE_FRAME:
        MOV $0x80000000, %ebx
        SHR %ecx, %ebx
        OR %ebx, *%eax ; set the bit at the index to 1, marking frame as used
        SUB $CONST_OS_MEMORY_BITMAP_START, %eax
        SHL $3, %eax ; multiply by 8
        ADD %ecx, %eax ; eax now contains index of first zero in bitmap
        
        ; calculate frame base address
        SHL $CONST_OS_FRAME_BIT_SIZE, %eax ; multiply index by size of one frame
        ADD $CONST_USER_MEMORY_START, %eax ; eax now holds address of first free frame
        POP %ecx
        POP %ebx
        RET









    ;._ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME:
    ;    MOV *%eax, %ebx
    ;    AND $0xFF000000, %ebx
    ;    CMP $0, %ebx
    ;    JE _ALLOCATE_FRAME_FOUND_FREE_FRAME
    ;    CMP $CONST_OS_MEMORY_MAP_END, %eax
    ;    JE _ALLOCATE_FRAME_NO_FRAME_FOUND
    ;    ADD $1, %eax
    ;    ADD $CONST_OS_FRAME_SIZE, %ecx
    ;    JMP _ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME


    ;._ALLOCATE_FRAME_FOUND_FREE_FRAME:
    ;    POP %ebx
    ;    MOV *%ebx, %ebx
    ;    AND $0xFF000000, %ebx
    ;    AND $0xFFFFFF, *%eax
    ;    OR %ebx, *%eax

    ;    MOV %ecx, %eax
    ;    RET

    ._UTIL_ALLOCATE_FRAME_ALLOCATE_FRAME_NO_FRAME_FOUND:
        POP %ecx
        POP %ebx
        MOV $0xFFFFFFFF, %eax
        RET

