
; constants for the syscall number

    ; SYSCALLS_FILE_READ
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     file descriptor (fd=0 for console, fd>0 for files)
    ;   *(ebx+4)   pointer to buffer, this buffer will be filled by the file system
    ;   *(ebx+8)   buffer size, limits the amount of bytes that will be read
    ; Return value (immediate value):
    ;   eax     success status (>=0 = number of bytes read, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = no console input ready)
    const CONST_SYSCALL_FILE_READ = 0

    ; SYSCALLS_FILE_WRITE
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     file descriptor (fd=0 for console, fd>0 for files)
    ;   *(ebx+4)   pointer to buffer, this buffer will be used by the file system
    ;   *(ebx+8)   buffer size, limits the amount of bytes that will be written
    ; Return value (immediate value):
    ;   eax     success status (>=0 = number of bytes written, -1 = invalid file descriptor, -2 = seek position out of file bounds)
    const CONST_SYSCALL_FILE_WRITE = 1

    ; SYSCALLS_FILE_OPEN
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file descriptor (-1 = error)
    const CONST_SYSCALL_FILE_OPEN = 2

    ; SYSCALLS_FILE_CLOSE
    ; Parameters (ebx is used as a immediate value):
    ;   ebx     file descriptor
    ; Return value:
    ;   eax     success status (0 = success, -1 = invalid file descriptor)
    const CONST_SYSCALL_FILE_CLOSE = 3

    ; SYSCALLS_FILE_STAT
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     file length or error code (>=0 = length, -1 = file does not exists, -2 = not a file)
    const CONST_SYSCALL_FILE_STAT = 4

    ; SYSCALLS_FILE_SEEK
    ; Parameters (ebx is a pointer to the following struct):
    ;   *(ebx)     file descriptor
    ;   *(ebx+4)   seek offset
    ;   *(ebx+8)   seek mode (0 - Seek from current position, 1 - Seek from start of file, 2 - Seek from end of file)
    ; Return value (immediate value):
    ;   eax     success status (0 = success, -1 = invalid file descriptor, -2 = seek position out of file bounds, -3 = negative seek position)
    const CONST_SYSCALL_FILE_SEEK = 5

    ; SYSCALLS_FILE_CREATE
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     success status (0 = success, -1 = file already exist)
    const CONST_SYSCALL_FILE_CREATE = 6

    ; SYSCALLS_FILE_DELETE
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value (immediate value):
    ;   eax     success status (0 = success, -1 = file did not exist)
    const CONST_SYSCALL_FILE_DELETE = 7    

    ; SYSCALLS_PROCESS_CREATE
    ; Parameters (ebx is a pointer to the start of an ASCII filename):
    ;   (ebx)     Pointer to a ASCII filename
    ; Return value:
    ;   eax     success status (0 = success, -1 = error)
    const CONST_SYSCALL_PROCESS_CREATE = 16

    ; SYSCALLS_PROCESS_EXIT:
    ; Parameters
    ;   none
    ; Return value:
    ;   none
    const CONST_SYSCALL_PROCESS_EXIT = 17

    ; SYSCALLS_PROCESS_YIELD
    ; Parameters
    ;   none
    ; Return value:
    ;   none
    const CONST_SYSCALL_PROCESS_YIELD = 18
    
   ; SYSCALLS_TIMER_START
    ; Parameters:
    ;   (ebx)     Time to wait
    ; Return value:
    ;   eax     success status (0 = success, -1 = error)
    const CONST_SYSCALL_TIMER_START = 24