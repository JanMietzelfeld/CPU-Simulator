# Ihme-Core CPU Simulator User Manual

## 1 Writing Assembly Code for the CPU Simulator

## 1.1 Symbolic Constants

### 1.1.1 Symbolic Integer Constants

Symbolic integer constants can store a 32-Bit integer value and can be defined as follows:

``` Assembly
const myIntConst = 5
const myIntConst=5
```

The assembler stores the integer value and replaces all occurrences of the symbolic integer constant in the assembly code with their actual value.

The symbolic name of the integer constant can then be used like a normal integer value in the assembly code.
Here is an example of writing the previously defined integer constant into the EAX register:

``` Assembly
MOV $myIntConst, %eax
```

This writes the value 5 into the EAX register.

### 1.1.2 Symbolic String Constants

Symbolic string constants are treated a bit differently than symbolic integer constants and can be defined as follows:

``` Assembly
const myStringConst = "I am a string."
const myStringConst="I am a string."
```

The given string is stored as UTF-8 encoded and null terminated array in the code segment of the CPU-Simulator.

In case that the encoded string is not divisible by four byte, an additional four byte are used for the rest of the string. This is due to the current CPU-Simulator design using fixed 32-Bit instructions and operands. The rest of the four byte that are unused get filled by zeroes, so some memory overhead is expected.

Being stored in the code segment makes the string constant as the code segment is write protected in user mode and only writeable in kernel mode. To not interrupt the code execution a jump instruction is automatically placed in front of the string array. The target of the jump instruction is the first virtual memory address after the string array.

The assembler replaces the symbolic name of the string constant with the virtual memory start address of the string array. The array goes from the lowest virtual memory address to the highest virtual memory address.

The symbolic name of the string constant can then be used like a memory address in the assembly code.
Here is an example of writing the (start) virtual memory address of the previously defined string constant into the EAX register:

``` Assembly
MOV $myStringConst, %eax
```

In the current implementation the constants can be misused as variables, see the warning [below](#12-symbolic-variables).

## 1.2 Symbolic Variables

:warning:**Caution:** In the current implementation the symbolic integer and string variables are stored in the code segment. The code segment is write protected in user mode and only writeable in kernel mode. To assign different values to the variables during program runtime, the program has to switch into kernel mode. Under normal circumstances the program should not be able to to switch into kernel mode directly. To make the variables work correctly a modified NOP instruction has bee included, which switches the program into kernel mode. The NOP instruction has to be used once before variables can be assigned a new value (see the examples below). The modified NOP instruction is needed until a data segment or something of similar function is implemented.

Using the modified NOP instruction also makes constants behave like variables, so caution is advised.

### 1.2.1 Symbolic Integer Variables

Symbolic integer variables can store a 32-Bit integer value. They can be created as follows:

``` Assembly
NOP
.DATA
.intVariable ;uninitialized integer variable
.intVariableWithValue 5 ;creates integer variable with the value 5
.CODE
```

Defining and declaring symbolic integer variables always has to be done between the `.DATA` and the `.CODE` blocks. The variable gets initialized with zero internally if no value is given, like shown for the first variable above, otherwise it gets initialized with the given numerical value.
The assembler encodes the integer variable as 32-Bit integer and stores it in the code segment of the CPU-Simulator. To not interrupt the program flow a jump instruction is automatically added by the assembler in front of the integer variable in virtual memory. The jump target is the first virtual memory address after the integer variable.
The assembler replaces all occurrences of the symbolic name of the integer variable with their virtual memory address.
The `NOP` instruction switches the program into kernel mode, see the warning [above](#12-symbolic-variables).

Reassigning the value of a symbolic integer variable can be done as follows:

```Assembly
MOV $10, @intVariable
```

In the above example the value 10 is assigned to the symbolic integer variable `intVariable`.
The symbolic name can be used like a normal memory address.

### 1.2.2 Symbolic String Variables

Symbolic string variables are used to store a string as a null terminated array in memory. They can be defined as follows:

``` Assembly
NOP
.DATA
.stringVariable "I am a string."
.CODE
```

In the current implementation the string is encoded in UTF-8 and stored in a null terminated array in the code segment of the CPU-Simulator like the symbolic string constants. The `NOP` instruction is modified and needed to switch the program into kernel mode. For more details see [1.1.2 Symbolic String Constants](#112-symbolic-string-constants) and the warning [above](#12-symbolic-variables).

The assembler replaces the symbolic name of the string variables in the assembly code with their virtual memory address. The virtual memory address is the start address of the string array. The symbolic name can be used like a normal memory address.

```Assembly
MOV $stringVariable, %eax
```

In the above example the virtual memory start address of the `stringVariable` gets written into the EAX register.

## 2 GUI

## 2.1 Registers

### 2.1.1 Clickable Registers

Some registers can hold memory addresses either for the virtual or for the physical memory. A feature has been implemented that allows the user to jump to those memory addresses by clicking on the GUI element of the register. The memory cell in the virtual or physical memory gets highlighted after the jump. This minimizes the scrolling necessary and makes it easier to find those memory address easier.
Following registers implement the jump on click feature:

- EAX
- EBX
- ECX
- ESP
- EIP
- ITP
- PTP
