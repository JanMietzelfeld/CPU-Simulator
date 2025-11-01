
; Interrupt ISR for the syscalls (0x80)
.INTERRUPTS_SYSCALLS:

    IRET

; collect all the syscall handlers here

    include "os/sos/syscalls/process/create"
    include "os/sos/syscalls/process/exit"
    include "os/sos/syscalls/process/yield"
        
    include "os/sos/syscalls/io/console/print"
    include "os/sos/syscalls/io/console/read"

    include "os/sos/syscalls/io/file/close"
    include "os/sos/syscalls/io/file/create"
    include "os/sos/syscalls/io/file/delete"
    include "os/sos/syscalls/io/file/open"
    include "os/sos/syscalls/io/file/read"
    include "os/sos/syscalls/io/file/seek"
    include "os/sos/syscalls/io/file/stat"
    include "os/sos/syscalls/io/file/write"
