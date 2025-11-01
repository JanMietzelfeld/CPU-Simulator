

.SWITCH_PROCESS:
    ;
    ; Process Control Block layout (1KiB) 0x000 - 0x3FF
    ; 0x03B - 0x3FF unused
    ; 0x03A - 0x03A flags         (1 bytes) \
    ; 0x036 - 0x039 esp           (4 bytes) |
    ; 0x032 - 0x035 eip           (4 bytes) |
    ; 0x02E - 0x031 ecx           (4 bytes) | - CPU registers
    ; 0x02A - 0x02D ebx           (4 bytes) |
    ; 0x026 - 0x039 eax           (4 bytes) /
    ; 0x006 - 0x025 name          (32 characters/bytes)
    ; 0x002 - 0x005 Page table *  (4 Bytes)     
    ; 0x001 - 0x001 status        (Runnung, Waiting, Blocked)
    ; 0x000 - 0x000 pid           (Process ID)
    ;
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
    ;

    MOV %ptp, *(OS_RUNNUNG_PCB_POINTER + 2)

    TEST *(OS_RUNNUNG_PCB_POINTER + 1), $0
    JE SWITCH_PROCESS_FIND_NEXT

    TEST *(OS_RUNNUNG_PCB_POINTER + 1), $1
    JE SWITCH_PROCESS_RUNNING

    TEST *(OS_RUNNUNG_PCB_POINTER + 1), $3
    JE SWITCH_PROCESS_BLOCKED

    .SWITCH_PROCESS_RUNNING:

    MOV $2, *(OS_RUNNUNG_PCB_POINTER + 1)

    ; add to the waiting queue
    PUSH OS_WAITING_QUEUE_START
    SUB $1, *(%esp)

    .SWITCH_PROCESS_SEARCH_WAITING_LIST:
    ADD $1, *(%esp)
    TEST *(%esp), %0
    JNE SWITCH_PROCESS_SEARCH_WAITING_LIST
    MOV *(OS_RUNNUNG_PCB_POINTER), *(%esp)
    POP %ebx
    JUMP SWITCH_PROCESS_FIND_NEXT

    .SWITCH_PROCESS_BLOCKED:

    ; add to the blocked queue
    PUSH OS_BLOCKED_QUEUE_START
    SUB $1, *(%esp)

    .SWITCH_PROCESS_SEARCH_BLOCKED_LIST:
    ADD $1, *(%esp)
    TEST *(%esp), %0
    JNE SWITCH_PROCESS_SEARCH_BLOCKED_LIST
    MOV *(OS_RUNNUNG_PCB_POINTER), *(%esp)
    POP %ebx
    JUMP SWITCH_PROCESS_FIND_NEXT


    .SWITCH_PROCESS_FIND_NEXT:

    PUSH *(OS_WAITING_QUEUE_START)

    PUSH OS_WAITING_QUEUE_START

    .SWITCH_PROCESS_UPDATE_WAITING_LIST:
    ADD $1, *(%esp)
    MOV *(%esp), *(%esp + 1)
    TEST $0, *(%esp)
    JNE SWITCH_PROCESS_UPDATE_WAITING_LIST

    POP %ebx

    PUSH OS_PCP_MAPPING_START

    PUSH 0

    ; find the PCB for the pid

    .SWITCH_PROCESS_FIND_PCB:
    ADD $4, *(%esp+ 4)
    ADD $1, *(%esp)
    TEST *(%esp + 8), *(%esp)
    JNE SWITCH_PROCESS_FIND_PCB
    
    MOV (*(%esp + 4) + 2), *(OS_RUNNUNG_PCB_POINTER)
    
    POP %ebx
    POP %ebx
    POP %ebx

    MOV $1, *(OS_RUNNUNG_PCB_POINTER+1)
    MOV *(OS_RUNNUNG_PCB_POINTER+2), %ptp

    RET