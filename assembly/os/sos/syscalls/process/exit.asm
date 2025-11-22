; SYSCALLS_PROCESS_EXIT:
; Parameters
;   none
; Return value:
;   none
.SYSCALLS_PROCESS_EXIT:

    ; set status of current process to terminated

    MOV $CONST_OS_CURRENT_PCB_POINTER, %eax
    MOV *%eax, %eax ; pcb pointer

    ; get pid
    MOV *%eax, %ebx
    AND $0xFF000000, %ebx
    SHR $24, %ebx
    ; ebx = pid

    ; set status bit
    ADD $1, %eax
    MOV $0, *%eax

    ; free all allocated frames for the process

    MOV $CONST_OS_MEMORY_MAP_START, %eax

    ._SYSCALLS_PROCESS_EXIT_FIND_FRAMES:    
        CMP %ebx, *%eax ; is this frame mapped to the current process ?
        JE _SYSCALLS_PROCESS_EXIT_FREE_FRAME

        CMP $CONST_OS_MEMORY_MAP_END, %eax ; are we at the end ?
        JE _SYSCALLS_PROCESS_EXIT_FREE_FRAMES_DONE

        ADD $1, %eax
        JMP _SYSCALLS_PROCESS_EXIT_FIND_FRAMES

    ._SYSCALLS_PROCESS_EXIT_FREE_FRAME: 
        ;CALL clear_frame ; override frame with 0 TODO implement this
        MOV $0, *%eax 
        ADD $1, %eax
        JMP _SYSCALLS_PROCESS_EXIT_FIND_FRAMES


    ._SYSCALLS_PROCESS_EXIT_FREE_FRAMES_DONE:

    ; UTIL_SCHEDULER
    ; Parameters:
    ;   none     
    ; Return value :
    ;   none
    .UTIL_SCHEDULER:

RET ; we should never reach this RET