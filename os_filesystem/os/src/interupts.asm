
; collect all the ISRs for the interrupts here

    ; collect all the ISRs for intenal interrupts (exceptions)

    include "os/src/interrupts/divide_error"            ; 0x00
    include "os/src/interrupts/invalid_opcode"          ; 0x06
    include "os/src/interrupts/general_protection_fault"; 0x0D
    include "os/src/interrupts/page_fault"              ; 0x0E


    ; collect all the ISRs for external interrupts here

    include "os/src/interrupts/syscalls"                ; 0x80