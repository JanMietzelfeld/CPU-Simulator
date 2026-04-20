# Release Notes – Version 1.1.0

This release introduces the first operating system features for the Ihme-Core CPU Simulator, along with improvements to the simulator, GUI, and assembler.

# Key Features

# Operating System

Initial development of an OS for the simulator has begun. This release includes:

## Filesystem
- Added a basic filesystem

## Process Management
- The OS supports running multiple processes

## Memory Virtualization
- Each process runs in its own virtual address space

## System Calls
Added system calls for filesystem and process interaction:

- `file_read`
- `file_write`
- `file_open`
- `file_close`
- `file_stat`
- `file_seek`
- `file_create`
- `file_delete`
- `process_create`
- `process_exit`
- `process_yield`
- `timer_start`

---

# CPU Simulator

## DEV Instruction
- Added the `DEV` instruction to enable interaction between the OS and the simulator

## Timer Component
- Added a timer component allowing programs to wait for a specified number of instructions

## Bit Shift Instructions
- Added bit shift instructions:

```assembly
SHL $2, %eax ; Shift Logical Left
SHR $2, %eax ; Shift Logical Right
SAL $2, %eax ; Shift Arithmetic Left
SAR $2, %eax ; Shift Arithmetic Right
```

## Unsigned Conditional Jump Instructions
- Added unsigned conditional jump instructions:

```assembly
JA  $HANDLER   ; vs JG
JAE $HANDLER   ; vs JGE
JB  $HANDLER   ; vs JL
JBE $HANDLER   ; vs JLE
```

---

# GUI Improvements

## Clickable Registers
- Registers are now clickable to immediately view the RAM location they point to

## RAM Search
- Added a search field for RAM

## Log Output Window
- Added a log output window to better trace program execution

---

# Assembler Updates

## Include Preprocessor

- The assembler now supports including external assembly files:

```assembly
.INCLUDE "/os/include/syscalls"
```

## Constants

- The assembler now supports constant declarations:

```assembly
.CONST myIntConst 5
.CONST stringConst "This is a constant string"
```

Usage:

```assembly
MOV $myIntConst, %eax
```


## Symbolic Variables

- Variables can now be declared in the .DATA section:

```assembly
.DATA
intVariable      ; uninitialized integer variable
stringVariable "I am a string."
.CODE
```

Usage:

```assembly
MOV $10, @intVariable
MOV $stringVariable, %eax
```

Limitation: Variables are currently only supported in Kernel Mode