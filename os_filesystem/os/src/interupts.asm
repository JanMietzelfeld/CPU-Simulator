
; collect all the ISRs for the interrupts here

    ; collect all the ISRs for intenal interrupts (exceptions)

    include "os/src/interrupts/exceptions/divide_error"            ; 0x00
    include "os/src/interrupts/exceptions/invalid_opcode"          ; 0x06
    include "os/src/interrupts/exceptions/general_protection_fault"; 0x0D
    include "os/src/interrupts/exceptions/page_fault"              ; 0x0E


    ; collect all the ISRs for external interrupts here

    include "os/src/interrupts/external/timer/timer"             ; 0x20
    include "os/src/interrupts/syscalls/syscalls"                ; 0x80