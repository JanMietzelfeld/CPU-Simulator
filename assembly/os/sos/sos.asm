JMP SOS_BOOT ; boot the kernel

include "os/sos/constants"
include "os/sos/interupts"
include "os/sos/util"

; Start of the BOOT Code

.SOS_BOOT:
    ; This is the entry point of the OS
    ;
    ; Assumptions at this point:
    ;   - We are in kernel mode
    ;   - Memory Virtualization is disabled
    ;
    ; Things we needs to set up before starting the first process:
    ;   - Stack Pointer
    ;   - Interrupt Pointer
    ;   - Interrupt table itself
    ;   - Page Table Pointer
    ;   - Page Table itself
    ;   - A PCB
    ;   - Set the current running pid to the init process id (1)
    ;   - Loading the code for the init process into Memory
    ;   - Activate Memory Virtualization
    ;   - Switch to user mode
    ;   - Run the init process
    ;

    MOV $OS_CONST_OS_CODE_START, %esp   ; initialize stack pointer

    MOV $OS_CONST_PCB_INTERRUPT_TABLE_START, %itp   ; initialize interrupt pointer

; Set Up Interrupt Table
    
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

    
    ; --- Set up the CPU exceptions---

    ; Set up the ISR (Interrupt Service Routine) for the Interrupt 0x00 (Div by 0)
    MOV %itp, %eax
    ADD $0, %eax ; Interrupt Nummber 0x00 * 4 Bytes = 0
    MOV INTERRUPTS_DIVIDE_BY_ZERO, *%eax

    ; Set up the ISR for 0x06 (Invalid Opcode)
    MOV %itp, %eax
    ADD $0x24, %eax ; Interrupt Nummber 0x06 * 4 Bytes = 0x24
    MOV INTERRUPTS_INVALID_OPCODE, *%eax

    ; Set up the ISR for 0x0D (Privilege Violation)
    MOV %itp, %eax
    ADD $0x34, %eax ; Interrupt Nummber 0x0D * 4 Bytes = 0x34
    MOV INTERRUPTS_PRIVILEGE_VIOLATION, *%eax

    ; Set up the ISR for 0x0E (Page Fault)
    MOV %itp, %eax
    ADD $0x38, %eax ; Interrupt Nummber 0x0E * 4 Bytes = 0x38
    MOV INTERRUPTS_PAGE_FAULT, *%eax

    ; --- Finished With The CPU exceptions---

    ; --- Set up the External interrupts---

    ; Set up the ISR for 0x80 (System Calls)
    MOV %itp, %eax
    ADD $0x200, %eax ; Interrupt Nummber 0x80 * 4 Bytes = 0x200
    MOV INTERRUPTS_SYSCALLS, *%eax

    ; --- Finished with the External interrupts---


; Interrupt Table Is Set Up

    MOV $OS_CONST_PAGE_TABLE_LIST_START, %ptp   ; initialize PTP (Level 1 Page Table Location)

; Set Up Page Table (L1) for the init process

    MOV %ptp, %eax

    ADD $0x2FFFFC, %eax  ; 4*786432 - 4 = 3145724 = 0x300000 For the stack
    MOV $0xC00BFFFF, %ebx; C = Present, Writable
    MOV %ebx, *%eax 


    ADD $4, %eax  ; 4*786432= 3145728 = 0x300000 For the os code
    MOV $0xB00C0000, %ebx; B = Present, Mode and Executable bit
    MOV %ebx, *%eax 
    ;TODO set up page table

; Page Table Is Set Up (L1)



; Create a PCB for the init process - 0xE00C0000 - 0xE00FFFFF - PCB List (1 PCB = 1KiB)

    MOV $OS_CONST_PCB_LIST_START, %eax
    ADD $0x400, %eax ; First entry is invalid because pid 0 is invalid

    ; Process Control Block layout (1KiB) 0x000 - 0x3FF
    ; 0x03B - 0x3FF unused
    ; 0x03A - 0x03A flags         (1 bytes) \
    ; 0x036 - 0x039 esp           (4 bytes) |
    ; 0x032 - 0x035 eip           (4 bytes) |
    ; 0x02E - 0x031 ecx           (4 bytes) | - CPU registers
    ; 0x02A - 0x02D ebx           (4 bytes) |
    ; 0x026 - 0x039 eax           (4 bytes) /
    ; 0x006 - 0x025 name          (32 characters/bytes)
    ; 0x002 - 0x005 Page table    (4 Bytes)     
    ; 0x001 - 0x001 status        (Runnung, Waiting, Blocked)
    ; 0x000 - 0x000 pid           (Process ID)
    ;

    ; Process ID (pid) definition
    ;
    ; pid = Process ID = 8 bit number
    ; the pid starts at 1 (0 is invalid => A max of 2⁸ - 1 (255) Processes)
    ; Needed Process Wating list size = 255 Bytes but we use 256 for simplicity
    ; Needed Process Blocked list size = 255 Bytesbut we use 256 for simplicity
    ; Init Process has pid of 1

    ; Process Status definition
    ;
    ; 8 bit number => max of 256 states
    ;
    ; we only use 4 : Runnung, Waiting, Blocked and Terminated
    ;
    ; Terminated has the id 0
    ; Runnung    has the id 1
    ; Waiting    has the id 2
    ; Blocked    has the id 3

    MOV $1, *%eax ;set pid to 1
    ADD $1, %eax

    MOV $1, *%eax ;set status to to Runnung 
    ADD $5, %eax

    ;set name to "init\0", ASCII code: i = "0x69", n = "0x6E", t = "0x74"
    MOV $0x69, *%eax ; i
    ADD $1, %eax
    MOV $0x6E, *%eax ; n
    ADD $1, %eax
    MOV $0x69, *%eax ; i
    ADD $1, %eax
    MOV $0x74, *%eax ; t
    ADD $1, %eax
    MOV $0, *%eax ; \0

; PCB created

; Add PCB to the system (PCB Mapping, any status mapping...)

    ; 0xE0100000 - 0xE01003FF - PCB Table Mapping   (256 Entries * 4 Bytes = 1 KiB)                  /

    MOV $OS_CONST_PCB_MAPPING_TABLE_START, %eax ; Get a pointer to the PCB Table Mapping List
    ADD $4, %eax ; First entry is invalid because pid 0 is invalid

    MOV $OS_CONST_PCB_LIST_START, %ebx
    ADD $OS_CONST_PCB_SIZE, %ebx ; First entry is invalid because pid 0 is invalid

    MOV %ebx, *%eax ;update the Mapping for pid 1

    ; Set Running process pcb pointer
    ; 0xE0100A00 - 0xE0100A00 - Running process *PCB(4 Byte)                                          |
    MOV $OS_CONST_CURRENT_PCB_POINTER, %eax ; Get a pointer to the PCB pointer
    MOV %ebx, *%eax ; Set up the active pcb

; Process is now initialized in the os data structures

; Load the Code of the init Program into memory
    ;
    ; To do this we need to find a free page frame in user memory
    ; right now this is easy because we know that user memory is empty (no process is running)

    ; the code for init Program should be located in the file os/init (in bynary)

    PUSH $0 ; null-termination for filename on stack

    PUSH $0x2E62696E
    PUSH $0x696E6974
    PUSH $0x7365722F
    PUSH $0x6F732F75 ; move filename "os/user/init.bin\0" onto stack

    DEV $DEV_COMMAND_OPEN_FILE, %esp   ; 00000110 - file_open (filename_ptr=op2) -> fd=eax
    
    POP %ecx
    POP %ecx
    POP %ecx
    POP %ecx
    POP %ecx

    ; set ebx to the file descriptor id
    MOV %eax, %ebx

    ; read 4KiB bytes (assume for now that the init program is not bigger than 4KiB)
    PUSH $0x100     ; buffer length
    PUSH $0x0       ; write init to the first page frame located at 0x0
    DEV $DEV_COMMAND_IO_READ_BUFFER, %ebx     ; 00000010 - io_read_buffer (fd=op2, buffer=stack, b_size=stack) -> bytes_read=eax
 
    ; set ecx to bytes_read
    MOV %eax, %ecx ; bytes_read

    ; update Page Table 

    MOV %ptp, %eax

    MOV $0x80000000, *%eax ; set the present bit to 1 and assign the first Pysical Address of frame 0 starting at 0x00000000

; Activate Memory Virtualization
DEV $DEV_COMMAND_CPU_ENABLE_MEMORY_VIRTUALIZATION, $0

PUSHF
AND $0xE0FFFFFF, *%esp ; reset flags
OR $0xE0000000, *%esp ; set cpl and interrupt bit to 1 (user mode with interrupts enabled)

PUSH $0 ; push the address to return to after iret

IRET ;Switch to user mode and Execute init

