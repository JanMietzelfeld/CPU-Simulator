
; collect all the ISRs for the interrupts here

    ; collect all the ISRs for intenal interrupts (exceptions)

    include "os/sos/interrupts/divide_error"            ; 0x00
    include "os/sos/interrupts/invalid_opcode"          ; 0x06
    include "os/sos/interrupts/general_protection_fault"; 0x0D
    include "os/sos/interrupts/page_fault"              ; 0x0E


    ; collect all the ISRs for external interrupts here

    include "os/sos/interrupts/syscalls"                ; 0x80