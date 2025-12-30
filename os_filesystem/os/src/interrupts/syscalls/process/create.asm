; SYSCALLS_PROCESS_CREATE
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value:
;   eax     success status (0 = success, -1 = error)
.SYSCALLS_PROCESS_CREATE_WITH_ASSERTS:

    CALL ASSERT_ZERO_TERMINATED_EBX_FILENAME_IN_USERSPACE

.SYSCALLS_PROCESS_CREATE:


    PUSH %ebx ; Pointer to the ASCII filename

    ; crate a new Process Control Block (PCB)

    ; UTIL_CREATE_PCB
    ; Parameters (ebx is a pointer to the start of an ASCII process name):
    ;   (ebx)   Pointer to a ASCII process name
    ; Return value:
    ;   (eax)   Pointer to the new PCB (0xFFFFFFFF = error)
    CALL UTIL_CREATE_PCB
    CMP $0xFFFFFFF, %eax
    JNE _SYSCALLS_PROCESS_CREATE_PCB_CREATED
    POP %ebx
    MOV $-1, %eax
    RET
    ._SYSCALLS_PROCESS_CREATE_PCB_CREATED:

    POP %ebx
    PUSH %eax ; Pointer to the PCB
    PUSH %ebx ; Pointer to the ASCII filename
    MOV %esp, %ebx

    ; UTIL_LOAD_PROGRAM
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     Pointer to a ASCII filename
    ;   *(ebx+4)   Pointer to the PCB
    ; Return value (immediate value):
    ;   eax     success status (0 = success, -1 = file does not exists, -2 = not a file, -3 = out of memory, -4 = unknown)
    CALL UTIL_LOAD_PROGRAM
    CMP $0, %eax
    JL _SYSCALLS_PROCESS_CREATE_UNDO_UTIL_CREATE_PCB

    POP %ebx
    POP %ebx

MOV $0, %eax
RET

._SYSCALLS_PROCESS_CREATE_UNDO_UTIL_CREATE_PCB:

; TODO undo


POP %ebx
POP %ebx
MOV $-1, %eax
RET