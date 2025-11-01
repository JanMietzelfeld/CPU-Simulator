
; collect all the ISRs for the interrupts here


    ; Interrupt Table layout
    ;
    ; Interrupt Table has 256 Entries (0x00-0xFF)
    ;
    ; 0x00 - 0x00 Div by 0              |
    ; 0x01 - 0x05 Unused                |
    ; 0x06 - 0x06 Invalid Opcode        |
    ; 0x07 - 0x0C Unused                | CPU exceptions (32)
    ; 0x0D . 0x0D Privilege Violation   |
    ; 0x0E - 0x0E Page Fault            |
    ; 0x0F - 0x1F Unused                |
    ; -----------------------------------
    ; 0x20 - 0x7F Unused                |
    ; 0x80 - 0x80 System Calls          | External interrupts (224)
    ; 0x81 - 0xFF Unused                |

    ; collect all the ISRs for intenal interrupts

    include "os/sos/interrupts/divide_by_zero"       ; 0x00
    include "os/sos/interrupts/invalid_opcode"       ; 0x06
    include "os/sos/interrupts/privilege_violation"  ; 0x0D
    include "os/sos/interrupts/page_fault"           ; 0x0E


    ; collect all the ISRs for external interrupts here

    include "os/sos/interrupts/syscalls"              ; 0x80