
; Interrupt ISR for the syscalls (0x80)
.INTERRUPTS_SYSCALLS:

    IRET

; collect all the syscall handlers here

    .INCLUDE "os/sos/syscalls/process/create"
    .INCLUDE "os/sos/syscalls/process/exit"
    .INCLUDE "os/sos/syscalls/process/yield"
        
    .INCLUDE "os/sos/syscalls/io/console/print"
    .INCLUDE "os/sos/syscalls/io/console/read"

    .INCLUDE "os/sos/syscalls/io/file/close"
    .INCLUDE "os/sos/syscalls/io/file/create"
    .INCLUDE "os/sos/syscalls/io/file/delete"
    .INCLUDE "os/sos/syscalls/io/file/open"
    .INCLUDE "os/sos/syscalls/io/file/read"
    .INCLUDE "os/sos/syscalls/io/file/seek"
    .INCLUDE "os/sos/syscalls/io/file/stat"
    .INCLUDE "os/sos/syscalls/io/file/write"
