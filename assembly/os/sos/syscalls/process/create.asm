; SYSCALLS_PROCESS_CREATE
; Parameters (ebx is a pointer to the start of an ASCII filename):
;   (ebx)     Pointer to a ASCII filename
; Return value:
;   none
.SYSCALLS_PROCESS_CREATE:
    
    ; crate a new Process Control Block (PCB)
    ; UTIL_CREATE_PCB
    ; Parameters (ebx is a pointer to the start of an ASCII process name):
    ;   (ebx)     Pointer to a ASCII preocess name
    ; Return value (immediate value):
    ;   eax    Pointer to the new PCB
    CALL UTIL_CREATE_PCB

    PUSH %ebx ; Pointer to ASCII filename
    PUSH %eax ; Pointer to the PCB

    MOV %esp, %ebx

    ; LOAD_PROGAM
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     Pointer to a ASCII filename
    ;   *(ebx+4)   Pointer to the PCB
    ; Return value (immediate value):
    ;   none
    CALL UTIL_LOAD_PROGRAM

    RET