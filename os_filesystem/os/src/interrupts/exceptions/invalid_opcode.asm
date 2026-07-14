; Interrupt ISR for a Invalid Opcode (0x06)
.INTERRUPTS_INVALID_OPCODE:
    CALL SYSCALLS_PROCESS_EXIT ; Just terminate offending process
    IRET