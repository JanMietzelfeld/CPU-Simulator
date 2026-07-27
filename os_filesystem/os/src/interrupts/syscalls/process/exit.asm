; SYSCALLS_PROCESS_EXIT:
; Parameters
;   none
; Return value:
;   none
.SYSCALLS_PROCESS_EXIT_WITH_ASSERTS:
.SYSCALLS_PROCESS_EXIT:
    DEV $CONST_DEV_COMMAND_PERFORMANCE_TIMER_START, $4
    ; set status of current process to terminated

    MOV $CONST_OS_CURRENT_PCB_POINTER, %eax
    MOV *%eax, %eax ; pcb pointer

    ; set status bit to terminated
    ADD $1, %eax
    AND $0xFFFFFF, *%eax

    ; free all allocated frames for the process

    ADD $1, %eax ; point to page directory table base address in PCB
    MOV *%eax, %ebx ; directory table base address
    ; clear page tables and frames

    ; UTIL_CLEAR_PAGE_DIRECTORY_TABLE
    ; Parameters:
    ;   (ebx)     Pointer to the page directory table base address
    ; Return value (immediate value):
    ;   none
    CALL UTIL_CLEAR_PAGE_DIRECTORY_TABLE
    DEV $CONST_DEV_COMMAND_PERFORMANCE_TIMER_STOP, $4
    ; UTIL_SCHEDULER
    ; Parameters:
    ;   none     
    ; Return value :
    ;   none
    CALL UTIL_SCHEDULER

RET ; we should never reach this RET