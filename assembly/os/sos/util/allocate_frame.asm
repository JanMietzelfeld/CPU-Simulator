 
    ; searches for a unused frame and returns it
    ; if memory is "full" it returns the addres 0xFFFFFFFF as invalid
    ; otherwise it returns the start addres of the frame

    ; the const OS_RUNNUNG_PID contains the memory location of the Running pid number 
    ; the const OS_MEMORY_MAP_START contins the start addres of the Memory Mapping list

    ; saves the found frame address to %eax

    ; UTIL_ALLOCATE_FRAME
    ; Parameters 
    ;   none
    ; Return value (immediate value):
    ;   eax     frame address (0xFFFFFFFF = invalid)
    .UTIL_ALLOCATE_FRAME:

    ;MOV OS_MEMORY_MAP_START, %eax
    MOV $0xE0000000, %eax


    .ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME:
        TEST $0, *%eax
        JE ALLOCATE_FRAME_FOUND_FREE_FRAME
        ;TEST OS_MEMORY_MAP_END, %eax
        TEST $0xE00BFFFF, %eax
        JE ALLOCATE_FRAME_NO_FRAME_FOUND
        ADD $1, %eax
        JMP ALLOCATE_FRAME_SEARCH_FOR_FREE_FRAME


    .ALLOCATE_FRAME_FOUND_FREE_FRAME:
        ;MOV OS_RUNNUNG_PID, *%eax
        MOV $0xE0100A00, *%eax
        RET

    .ALLOCATE_FRAME_NO_FRAME_FOUND:
        MOV $0xFFFFFFFF, %eax
        RET

