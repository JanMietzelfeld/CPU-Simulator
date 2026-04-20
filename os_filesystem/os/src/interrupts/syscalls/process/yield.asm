; SYSCALLS_PROCESS_YIELD
; Parameters
;   none
; Return value:
;   none
.SYSCALLS_PROCESS_YIELD_WITH_ASSERTS:
.SYSCALLS_PROCESS_YIELD:

    ; UTIL_SCHEDULER
    ; Parameters:
    ;   none     
    ; Return value:
    ;   none
    CALL UTIL_SCHEDULER

RET