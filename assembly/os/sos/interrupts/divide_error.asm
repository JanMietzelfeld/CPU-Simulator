; Interrupt ISR for a div by 0 (0x00)MUL
.INTERRUPTS_DIVIDE_ERROR:
    CALL SYSCALLS_PROCESS_EXIT ; Just terminate offending process
    IRET