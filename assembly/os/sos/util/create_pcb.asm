; UTIL_CREATE_PCB
; Parameters (ebx is a pointer to the start of an ASCII preocess name):
;   (ebx)     Pointer to a ASCII preocess name
; Return value:
;   none
.UTIL_CREATE_PCB:


; Create a PCB - 0xE00C0000 - 0xE00FFFFF - PCB List (1 PCB = 1KiB)

    ;MOV OS_PCP_MAPPING_START, %eax
    MOV $0xE0100000, %eax

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

    ; find a free PCB (with status Terminated)

    MOV $1, %ecx ; keep track of the pid

    ADD $1, %eax ; location of the status bit

    .CRAETE_PCB_FIND_FREE:
    MOV *%eax, %ebx
    AND $0xFF000000, %ebx
    TEST $0, %ebx
    JZ CREATE_PCB_FOUND_FREE
    ADD $0x400, %eax
    ADD $1, %ecx
    TEST $256, %ecx
    JNZ CRAETE_PCB_FIND_FREE

    ; if here, we failed to find a free PCB -> max process count already reached

    ; TODO handle error

    .CREATE_PCB_FOUND_FREE:
    SUB $1, %eax

    ;eax is the pointer to the new PCB

    PUSH %ecx ; push pid

    MOV %ecx, *%eax ;set pid
    ADD $1, %eax

    MOV $2, *%eax ;set status to to Waiting 
    ADD $1, %eax

    ; allocate Page Table

    ADD $4, %eax

    ; copy name

    MOV $0, %ecx
    SUB $1, %ebx

    .CREATE_PCB_COPY_NAME:
    ADD $1, %ebx
    ADD $1, %ecx
    MOV *%ebx, *%eax
    ADD $1, %eax

    TEST $32, %ecx
    JZ CREATE_PCB_COPY_NAME_DONE

    TEST $0, *%ebx
    JNZ CREATE_PCB_COPY_NAME

    .CREATE_PCB_COPY_NAME_DONE:
    MOV $0, *%eax ; \0 null byte

    MOV $32, %ebx
    SUB %ecx, %ebx
    ADD %ebx, %eax ; To make sure we point to the next PCB element independently from the name length


    ; reset Page Table CPU registers 

    ; 0x03A - 0x03A flags         (1 bytes) \
    ; 0x036 - 0x039 esp           (4 bytes) |
    ; 0x032 - 0x035 eip           (4 bytes) |
    ; 0x02E - 0x031 ecx           (4 bytes) | - CPU registers
    ; 0x02A - 0x02D ebx           (4 bytes) |
    ; 0x026 - 0x039 eax           (4 bytes) /

    MOV $0, *%eax   ; eax
    ADD $4, %eax

    MOV $0, *%eax   ; ebx
    ADD $4, %eax

    MOV $0, *%eax   ; ecx
    ADD $4, %eax

    MOV $0, *%eax   ; eip
    ADD $4, %eax

    MOV $0xC0000000, *%eax   ; esp
    ADD $4, %eax

    MOV $0xE0000000, *%eax   ; flags set cpl and interrupt bit to 1 (user mode with interrupts enabled)
    ADD $4, %eax

    ; allocate Page Table

    ; OS_PAGE_TABLE_START

    MOV *%esp, %ebx ; get pid
    MUL $0x1000000, %ebx

    PUSH %ebx ; push the pointer to the Page Table

    ; ebx is a pointer to the Page Table

    ; UTIL_INITIALIZE_PAGE_TABLE
    ; Parameters 
    ; Parameters (ebx is a pointer to the start of the Page Table):
    ;   (ebx)     Pointer to the Page Table
    ; Return value (immediate value):
    ;   none
    CALL UTIL_INITIALIZE_PAGE_TABLE


; PCB created

; Add PCB to the system (PCB Mapping, any status mapping...)

    ; 0xE0100000 - 0xE01003FF - PCB Table Mapping   (256 Entries * 4 Bytes = 1 KiB)                  /

    ;MOV OS_PCP_MAPPING_START, %eax ; Get a pointer to the PCB Table Mapping List
    MOV $0xE0100000, %eax ; Get a pointer to the PCB Table Mapping List
    ADD $4, %eax ; First entry is invalid because pid 0 is invalid

    MOV %esp, %ebx
    ADD $4, %ebx

    MOV $1, %ecx ; entry 0 is invalid

    .CREATE_PCB_UPDATE_PCB_MAPPING_LIST:
    TEST %ecx, *%ebx
    JE CREATE_PCB_UPDATED_PCB_MAPPING_LIST

    ADD $1, %ecx
    ADD $4, %eax

    JMP CREATE_PCB_UPDATE_PCB_MAPPING_LIST

    .CREATE_PCB_UPDATED_PCB_MAPPING_LIST:

    MOV *%esp, *%eax ;update the Mapping for pid 1

    ; Add to waiting queue
    ; OS_WAITING_QUEUE_START

    ;MOV OS_WAITING_QUEUE_START, %eax
    MOV $0xE0100800, %eax


    .CREATE_PCB_SEARCH_WAITING_LIST:
    TEST $0, *%eax
    ADD $1, %eax
    JNE CREATE_PCB_SEARCH_WAITING_LIST
    
    SUB $1, *%eax 

    ; eax is the pointer to the next free entry in the waiting queue

    MOV %esp, %ebx
    ADD $4, %ebx ; get pointer to pid

    MOV *%ebx, *%eax ; add the pid to the queue

; Process is now initialized in the os data structures

POP %eax ; pcb pointer (return value)

POP %ebx ; pop pid

RET
