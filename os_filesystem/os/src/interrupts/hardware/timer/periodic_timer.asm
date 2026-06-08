; Interrupt ISR for the periodic timer interrupt (0x20)

.INTERRUPTS_PERIODIC_TIMER:

    PUSH %eax
    PUSH %ebx
    PUSH %ecx



    MOV $CONST_OS_CURRENT_PCB_POINTER, %eax
    MOV *%eax, %eax ; pcb pointer

    ; Get time slice counter, decrement by one and check if rescheduling is needed
    ADD $CONST_OS_PCB_TIME_SLICE_COUNTER_OFFSET, %eax
    MOV *%eax, %ebx
    SHR $24, %ebx ; isolate counter
    SUB $1, %ebx
    CMP $0, %ebx
    JE _INTERRUPTS_PERIODIC_TIMER_RESCHEDULE

    SHL $24, %ebx
    AND $0xFFFFFF, *%eax
    OR %ebx, *%eax ; set counter
    JMP _INTERRUPTS_PERIODIC_TIMER_RETURN

    ._INTERRUPTS_PERIODIC_TIMER_RESCHEDULE:

        CALL UTIL_SCHEDULER

._INTERRUPTS_PERIODIC_TIMER_RETURN:
    POP %ecx
    POP %ebx
    POP %eax
    IRET
    
    

