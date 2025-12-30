; Interrupt ISR for a divide error (0x00)
.INTERRUPTS_DIVIDE_ERROR:
    CALL SYSCALLS_PROCESS_EXIT ; Just terminate offending process
    IRET