import { Assembler } from "./Assembler";
import { CPUCore } from "./execution_units/CPUCore";
import { RAM } from "./functional_units/RAM";
import { DoubleWord } from "../../types/binary/DoubleWord";
import { PhysicalAddress } from "../../types/binary/PhysicalAddress";
import { VirtualAddress } from "../../types/binary/VirtualAddress";
import { Bit } from "../../types/binary/Bit";
import { MemoryManagementUnit } from "./execution_units/MemoryManagementUnit";
import { DataSizes } from "../../types/enumerations/DataSizes";
import { PageFaultError } from "../../types/errors/PageFaultError";
import { readFileSync, writeFileSync } from "fs";
import { PageTableEntry } from "../../types/binary/PageTableEntry";
import { InstructionOperand } from "../../types/binary/InstructionOperand";
import { EncodedAddressingModes } from "../../types/enumerations/EncodedAdressingModes";
import { AddressSpace } from "../../types/binary/AddressSpace";
import { EncodedOperandTypes } from "../../types/enumerations/EncodedOperandTypes";
import { Address } from "../../types/binary/Address";
import { disassemble } from "./Disassembler";
import { exit } from "process";
import { PassthroughFilesystem } from "./os/PassthroughFilesystem";
import { Byte } from "../../types/binary/Byte";

/**
 * The main logic of the simulator. Trough this class, the CPU cores and execution is controlled.
 */
export class SimulationController {
    public readonly core: CPUCore;
    public readonly mainMemory: RAM;
    private static _instance: SimulationController | null = null;
    private _assembler: Assembler;
    private _programmLoaded: boolean;

    /**
     * This class member stores the highest available memory address of physical memory.
     * @readonly
     */
    public static readonly HIGH_ADDRESS_PHYSICAL_MEMORY_DEC: number = 0xFFFFFFFF; // 4_294_967_295

    /**
     * This class member stores the highest available memory address of physical memory.
     * @readonly
     */
    public static readonly LOW_ADDRESS_PHYSICAL_MEMORY_DEC: number = 0;

    /**
     * This class member stores the highest physical memory address of the kernel space.
     * The size of the kernel space is exactly 1 gibibyte.
     * @readonly
     */
    private static readonly KERNEL_SPACE:  AddressSpace<PhysicalAddress> = 
        new AddressSpace<PhysicalAddress>(
            PhysicalAddress.fromInteger(0xC0000000),
            PhysicalAddress.fromInteger(0xFFFFFFFF)
        );

    /**
     * This field stores the path to the assembly files.
     */
    private _pathToAssemblyFiles: string;

    /**
     * This field represents a flag, which enables automatic scroll for the GUIs virtual RAM widget.
     */
    public autoScrollForVirtualRAMEnabled: boolean;

    /**
     * This field represents a flag, which enables automatic scroll for the GUIs physical RAM widget.
     */
    public autoScrollForPhysicalRAMEnabled: boolean;

    /**
     * This field represents a flag, which enables automatic scroll for the GUIs Page Table widget.
     */
    public autoScrollForPageTableEnabled: boolean;

    /**
     * Creates a new instance.
     * @param capacityOfMainMemory The initial capacity of the main memory. This value can not be modified after the simulator started.
     * @param pathToLanguageDefinition The path to the language definition file.
     * @param pathToAssemblyFiles The path to the assembly files.
     * @param [processingWidth=DataSizes.DOUBLEWORD] The processing width of the simulated CPU.
     */
    private constructor(capacityOfMainMemory: number, pathToLanguageDefinition: string, pathToAssemblyFiles: string, processingWidth: DataSizes = DataSizes.DOUBLEWORD) {
        this.mainMemory = new RAM(capacityOfMainMemory);
        this.core = new CPUCore(this.mainMemory, processingWidth);
        this._assembler = new Assembler(pathToLanguageDefinition);
        this._programmLoaded = true;
        this.autoScrollForPageTableEnabled = true;
        this.autoScrollForPhysicalRAMEnabled = true;
        this.autoScrollForVirtualRAMEnabled = true;
        this._pathToAssemblyFiles = pathToAssemblyFiles;
    }

    /**
     * This method checks whether an assembly programm is currently loaded into the main memory.
     * @returns True, if an assembly programm is currently loaded into main memory, false otherwise.
     */
    public get programmLoaded(): boolean {
        return this._programmLoaded;
    }

    /**
     * This method can be used to retrieve an initialized instance of the simulator.
     * @param capacityOfMainMemory
     * @param pathToLanguageDefinition
     * @param pathToAssemblyFiles
     * @returns 
     */
    public static getInstance(capacityOfMainMemory: number, pathToLanguageDefinition: string, pathToAssemblyFiles: string): SimulationController {
        if (SimulationController._instance === null) {
            SimulationController._instance = new SimulationController(capacityOfMainMemory, pathToLanguageDefinition, pathToAssemblyFiles);
            SimulationController._instance.bootKernel();
        }
        return SimulationController._instance;
    }

    /**
     * This method boots the operating system by loading its data into main memory. The address space,
     * where the operating system is located in memory is sometimes called kernel space.
     */
    private bootKernel(): void {


        // Enter kernel mode.
        this.core.eflags.enterKernelMode();
        // Enable real mode and disable memory virtualization.
        this.core.mmu.disableMemoryVirtualization();

        const startOfKernelSpace = SimulationController.KERNEL_SPACE.lowAddressToDecimal();

        // Load kernel code into memory 
        const kernelCodeStartAddress = startOfKernelSpace;
        if (kernelCodeStartAddress != 0xC0000000) {
            throw new EvalError("Unexpected begin of OS memory");
        }

        const compiledOS: DoubleWord[] = this._assembler.compile(readFileSync(`${process.cwd()}/os_filesystem/os/src/sos.asm`, "utf-8"), kernelCodeStartAddress)

        //disassemble(compiledOS, kernelCodeStartAddress) //For debugging

        for (let i = 0; i < compiledOS.length; i++) {
            this.mainMemory.writeDoublewordTo(PhysicalAddress.fromInteger(kernelCodeStartAddress + i*DoubleWord.SIZE_IN_BYTES), compiledOS[i])
        }
        
        this.core.setEIP(Address.fromInteger(kernelCodeStartAddress));

        //Assemble the init program (needed by the os)
        this.assembleProgram(process.cwd() + "/os_filesystem/os/user/init.asm");

        //Assemble the idle program (needed by the os)
        this.assembleProgram(process.cwd() + "/os_filesystem/os/user/idle.asm");
        
        this.createUtilityFiles();

        this.core.cycle();        

        return;
    }



    /**
     * This method is used to initialize a process and prepare its execution.
     * @param pathToProgramCode 
     * @returns 
     */
    public createProcess(pathToProgramCode: string): void {

        if (pathToProgramCode.endsWith(".asm")) {
            this.assembleProgram(pathToProgramCode);
            pathToProgramCode = pathToProgramCode.replace(".asm", ".bin");
        }

        if (!pathToProgramCode.endsWith(".bin")) {
            throw new EvalError("Expected a binary or assembly file")
        }

        if (!pathToProgramCode.includes("/os_filesystem/")) {
            throw new EvalError("file must be in the os_filesystem")
        }

        let relativePathToCode = pathToProgramCode.substring(pathToProgramCode.indexOf("/os_filesystem/") + "/os_filesystem/".length)
        relativePathToCode = relativePathToCode.concat("\0");

        while (relativePathToCode.length % 4 != 0)
        {
            relativePathToCode = relativePathToCode.concat("\0");
        }

        let buffer: number[] = [];

        for (let i = 0; i < relativePathToCode.length; i++) {

            buffer.push(relativePathToCode.charCodeAt(i));
        }


        writeFileSync(process.cwd() + "/os_filesystem/os/util/new_process_name.bin", Buffer.from(buffer));
        
        return;
    }

    /**
     * This method is used to assemble a program
     * @param pathToProgramCode 
     * @returns 
     */
    public assembleProgram(pathToProgramCode: string): void {
        
        // Read the program code.
        const fileContents: string = readFileSync(pathToProgramCode, "utf-8");
        // Compile the program code.
        const compiledProgram: Array<DoubleWord> = this._assembler.compile(fileContents);

        const binaryProgram: number[] = [];

        compiledProgram.forEach(word => {
            
            binaryProgram.push(new Byte(word.getMostSignificantByte()).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getMostSignificantBits(16).slice(8)).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getMostSignificantBits(24).slice(16)).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getLeastSignificantByte()).toUnsignedNumber());
        });

        const buffer = Buffer.from(binaryProgram);

        writeFileSync(pathToProgramCode.replace(".asm", ".bin"), buffer);

        return;
    }

    /**
     * This method is used to load a binary program
     * @param pathToProgramCode 
     * @returns program code
     */
    public loadBinaryProgram(code: string): Array<DoubleWord> {
        
        const data: Array<DoubleWord> = new Array<DoubleWord>;

        for (let i = 0; i < code.length - 4; i += 4) {
            
            let bits: Bit[] = [];

            for (let j = 0; j < 4; j++) {
                const character = code.at(i + j);
                const charBits = character?.charCodeAt(0)
                    .toString(2)
                    .padStart(8, '0') // ensure 8-bit representation
                    .split("")
                    .map(bit => bit === "0" ? 0 : 1 as Bit);

                bits.push(...charBits!);
            }
        

            data.push(new DoubleWord(bits));
        }

        return data;
    }

        /**
     * This method is used to assemble a program
     * @param pathToProgramCode 
     * @returns 
     */
    public createUtilityFiles(): void {
        
        writeFileSync(process.cwd() + "/os_filesystem/os/util/new_process_name.bin", Buffer.from([0]));

        let zeroFramePath = process.cwd() + "/os_filesystem/os/util/zero_frame.bin"

        let pageTablePath = process.cwd() + "/os_filesystem/os/util/page_table.bin"


        let fileContents: Array<DoubleWord> = [];

        for (let i = 0; i < 4096; i++) {
            fileContents.push(DoubleWord.fromInteger(0))
        }

        let binaryProgram: number[] = [];

        fileContents.forEach(word => {
            
            binaryProgram.push(new Byte(word.getMostSignificantByte()).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getMostSignificantBits(16).slice(8)).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getMostSignificantBits(24).slice(16)).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getLeastSignificantByte()).toUnsignedNumber());
        });

        let buffer = Buffer.from(binaryProgram);

        writeFileSync(zeroFramePath, buffer);

        fileContents = [];

        for (let i = 0; i < 786432; i++) {
            fileContents.push(DoubleWord.fromInteger(1073741824)); //0x40000000 = 1073741824
        }

        for (let i = 0; i < 262144; i++) {
            if (i < 65536)
            {
                let value = 2415919104;  //0xB0000000 = 2415919104

                fileContents.push(DoubleWord.fromInteger(value + i + 786432));
            }
            else
            {
                let value = 2952790016;  //0x90000000 = 2952790016

                fileContents.push(DoubleWord.fromInteger(value + i + 786432));
            }
        }

        binaryProgram = [];

        fileContents.forEach(word => {
            
            binaryProgram.push(new Byte(word.getMostSignificantByte()).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getMostSignificantBits(16).slice(8)).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getMostSignificantBits(24).slice(16)).toUnsignedNumber());
            binaryProgram.push(new Byte(word.getLeastSignificantByte()).toUnsignedNumber());
        });

        buffer = Buffer.from(binaryProgram);

        writeFileSync(pageTablePath, buffer);

        return;
    }



    /**
     * This method triggers execution of the next instruction
     */
    public cycle(): void {
        
        this.core.cycle();
    }
}