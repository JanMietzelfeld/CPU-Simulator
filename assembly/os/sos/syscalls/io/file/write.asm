; SYSCALLS_IO_FILE_WRITE
; Parameters (ebx is a pointer to the following struct):
;   *(ebx)     file descriptor (fd=0 for console, fd>0 for files)
;   *(ebx+4)   pointer to buffer, this buffer will be used by the file system
;   *(ebx+8)   buffer size, limits the amount of bytes that will be written
; Return value (immediate value):
;   eax     success status (>=0 = number of bytes written, -1 = invalid file descriptor, -2 = seek position out of file bounds)
.SYSCALLS_IO_FILE_WRITE:
    ; Check if all user-provided arguments are within user space (file descriptor, buffer_ptr, buffer_size)
    MOV $12, %eax
    ;CALL ASSERT_EBX_IN_USERSPACE_WITH_OFFSET

    ; move user-provided arguments onto stack (required for DEV instruction)
    ;   ebx+4   pointer to buffer
    MOV %ebx, %eax
    ADD $4, %eax
    PUSH *%eax
    ;   ebx+8   buffer size
    ADD $4, %eax
    PUSH *%eax

    ; Check if user-given buffer is completely within user space
    ; Calculate highest address of the buffer: %ecx = buffer_ptr + buffer_size   ebx+4 + ebx+8
    
    ; eax currently holds address of buffer_size argument
    ; Dereference buffer_size and save into ecx
    MOV *%eax, %ecx 
    ; Move eax back onto buffer_ptr address
    SUB $4, %eax
    ; Dereference buffer_ptr and save into eax
    MOV *%eax, %eax
    ; Calculate buffer_ptr + buffer_size
    ADD %ecx, %eax
    ;CALL ASSERT_EAX_IN_USERSPACE
    
    ; 3    00000011 - io_write_buffer (fd=op2, buffer_ptr=stack, buffer_size=stack) -> bytes_written=eax
    DEV $3, *%ebx

    ; print success status for debugging
    ;CALL PRINT_EAX
    RET