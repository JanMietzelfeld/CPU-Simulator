 
    ; searches for a unused frame and returns it
    ; if memory is "full" it returns the addres 0xFFFFFFFF as invalid
    ; otherwise it returns the start addres of the frame

    ; the const OS_RUNNUNG_PID contains the memory location of the Running pid number 
    ; the const OS_MEMORY_MAP_START contins the start addres of the Memory Mapping list

    ; saves the found frame address to %eax

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   ebx     pcb pointer
    ; Return value (immediate value):
    ;   eax     frame address (0xFFFFFFFF = invalid)
    .UTIL_ALLOCATE_FRAME:

    MOV $CONST_OS_MEMORY_MAP_START, %eax
    MOV $0, %ecx

    ._ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME:
        CMP $0, *%eax
        JE _ALLOCATE_FRAME_FOUND_FREE_FRAME
        CMP $CONST_OS_MEMORY_MAP_END, %eax
        JE _ALLOCATE_FRAME_NO_FRAME_FOUND
        ADD $1, %eax
        ADD $CONST_OS_FRAME_SIZE, %ecx
        JMP _ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME


    ._ALLOCATE_FRAME_FOUND_FREE_FRAME:
        MOV %ebx, *%eax
        MOV %ecx, %eax
        RET

    ._ALLOCATE_FRAME_NO_FRAME_FOUND:
        MOV $0xFFFFFFFF, %eax
        RET

