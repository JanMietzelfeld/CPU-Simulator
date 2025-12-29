; Interrupt ISR for a General Protection Fault (0x0D)
.INTERRUPTS_GENERAL_PROTECTION_FAULT:
    CALL SYSCALLS_PROCESS_EXIT ; Just terminate offending process
    IRET