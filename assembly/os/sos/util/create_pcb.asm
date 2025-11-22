; UTIL_CREATE_PCB
; Parameters (ebx is a pointer to the start of an ASCII process name):
;   (ebx)     Pointer to a ASCII process name
; Return value:
;   (eax) Pointer to the new PCB (0xFFFFFFFF = error)
.UTIL_CREATE_PCB:

    PUSH %ebx ; push the Pointer to a ASCII process name

    MOV $CONST_OS_PCB_LIST_START, %eax

    ADD $CONST_OS_PCB_SIZE, %eax ; First entry is invalid because pid 0 is invalid

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

    ._CREATE_PCB_FIND_FREE:
        MOV *%eax, %ebx ; get status 
        AND $0xFF000000, %ebx
        CMP $0, %ebx
        JE _CREATE_PCB_FOUND_FREE ; is this PCB entry free (pid = 0)
        ADD $CONST_OS_PCB_SIZE, %eax
        ADD $1, %ecx ; pid %ecx taken check for %ecx + 1
        CMP $256, %ecx
        JNE _CREATE_PCB_FIND_FREE ; check next pid

        ; if here, we failed to find a free PCB -> max process count already reached

        ; return error

        POP %eax ; pop ASCII name
        MOV $0xFFFFFFFF, %eax
        RET

    ._CREATE_PCB_FOUND_FREE:
        SUB $1, %eax

        ;eax is the pointer to the new PCB

        PUSH %ecx ; push pid

        PUSH %eax ; push the pointer to the new PCB

        MOV %ecx, *%eax ;set pid
        ADD $1, %eax

        MOV $2, *%eax ; set status to to Waiting 
        ADD $1, %eax

        ; allocate Page Table

        SHL $CONST_OS_PAGE_TABLE_BIT_SIZE, %ecx
        ADD $CONST_OS_PAGE_TABLE_LIST_START, %ecx

        PUSH %ecx ; push the pointer to the Page Table

        MOV %ecx, *%eax  ; set page table pointer
        ADD $4, %eax

        MOV %ecx, %ebx

        PUSH %eax ; save eax

        ; UTIL_INITIALIZE_PAGE_TABLE
        ; Parameters 
        ; Parameters (ebx is a pointer to the start of the Page Table):
        ;   (ebx)     Pointer to the Page Table
        ; Return value (immediate value):
        ;   none
        CALL UTIL_INITIALIZE_PAGE_TABLE

        POP %eax ; restore eax

        ; copy name

        MOV $0, %ecx
        MOV %esp, %ebx
        ADD $11, %ebx ; get the ASCII Pointer - 1

    ._CREATE_PCB_COPY_NAME:
        ADD $1, %ebx
        ADD $1, %ecx
        MOV *%ebx, *%eax
        ADD $1, %eax

        CMP $32, %ecx ; did we copy 32 chars
        JZ _CREATE_PCB_COPY_NAME_DONE

        CMP $0, *%ebx ; did we just copy the null byte
        JNE _CREATE_PCB_COPY_NAME

    ._CREATE_PCB_COPY_NAME_DONE:
        MOV $0, *%eax ; make sure last char is a null byte

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

        MOV $CONST_OS_PCB_INTERRUPT_TABLE_START, *%eax   ; eip
        ADD $4, %eax

        MOV $CONST_OS_CODE_START, *%eax   ; esp
        ADD $4, %eax

        MOV $0xE0000000, *%eax   ; flags - set cpl and interrupt bit to 1 (user mode with interrupts enabled)
        ADD $4, %eax


    ; PCB created

    ; Add PCB to the system (PCB Mapping, any status mapping...)

        ; 0xE0100000 - 0xE01003FF - PCB Table Mapping   (256 Entries * 4 Bytes = 1 KiB)                  /

        MOV $CONST_OS_PCB_MAPPING_TABLE_START, %eax ; Get a pointer to the PCB Table Mapping List
        ADD $4, %eax ; First entry is invalid because pid 0 is invalid

        MOV %esp, %ebx
        ADD $8, %ebx ; get pid

        MOV $1, %ecx ; pid counter (entry 0 is invalid)

    ._CREATE_PCB_UPDATE_PCB_MAPPING_LIST:
        CMP %ecx, *%ebx
        JE _CREATE_PCB_UPDATED_PCB_MAPPING_LIST

        ADD $1, %ecx
        ADD $4, %eax

        JMP _CREATE_PCB_UPDATE_PCB_MAPPING_LIST

    ._CREATE_PCB_UPDATED_PCB_MAPPING_LIST:

        ; *%esp = ptp

        MOV *%esp, *%eax ; update the Mapping

    ; Add to waiting queue

    MOV $CONST_OS_PROCESS_WAITING_QUEUE_START, %eax
    SUB $1, %eax 

    ._CREATE_PCB_SEARCH_WAITING_LIST:
        ADD $1, %eax
        CMP $0, *%eax ; find next free entry in the queue
        JNE _CREATE_PCB_SEARCH_WAITING_LIST ; entry is present
        
        ; entry is free

        ; eax is the pointer to the next free entry in the waiting queue

        MOV %esp, %ebx
        ADD $8, %ebx ; get pointer to pid

        MOV *%ebx, *%eax ; add the pid to the queue

; Process is now initialized in the os data structures

POP %ebx ; ptp

POP %eax ; pcb pointer (return value)

POP %ebx ; pop pid

POP %ebx ; process name

RET
