 
    ; searches for an unused frame and returns it
    ; if memory is "full" it returns the addres 0xFFFFFFFF as invalid
    ; otherwise it returns the start addres of the frame

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   ebx     pcb pointer
    ; Return value (immediate value):
    ;   eax     frame base address (0xFFFFFFFF = invalid)
    .UTIL_ALLOCATE_FRAME:

    MOV $CONST_OS_MEMORY_MAP_START, %eax
    MOV $0, %ecx
    PUSH %ebx

    ._ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME:
        MOV *%eax, %ebx
        AND $0xFF000000, %ebx
        CMP $0, %ebx
        JE _ALLOCATE_FRAME_FOUND_FREE_FRAME
        CMP $CONST_OS_MEMORY_MAP_END, %eax
        JE _ALLOCATE_FRAME_NO_FRAME_FOUND
        ADD $1, %eax
        ADD $CONST_OS_FRAME_SIZE, %ecx
        JMP _ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME


    ._ALLOCATE_FRAME_FOUND_FREE_FRAME:
        POP %ebx
        MOV *%ebx, %ebx
        AND $0xFF000000, %ebx
        AND $0xFFFFFF, *%eax
        OR %ebx, *%eax

        MOV %ecx, %eax
        RET

    ._ALLOCATE_FRAME_NO_FRAME_FOUND:
        POP %ebx
        MOV $0xFFFFFFFF, %eax
        RET

