import { Assembler } from "./Assembler";
import { CPUCore } from "./execution_units/CPUCore";
import { RAM } from "./functional_units/RAM";
import { DoubleWord } from "../../types/binary/DoubleWord";
import { DataSizes } from "../../types/enumerations/DataSizes";
import { readFileSync, writeFileSync } from "fs";
import { DebugLogger } from "./Logger";
import { WebContents } from "electron";

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
    private static readonly KERNEL_SPACE_START: DoubleWord = DoubleWord.fromNumber(0xC0000000);

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

    private webContents: WebContents;

    /**
     * Creates a new instance.
     * @param capacityOfMainMemory The initial capacity of the main memory. This value can not be modified after the simulator started.
     * @param pathToLanguageDefinition The path to the language definition file.
     * @param pathToAssemblyFiles The path to the assembly files.
     * @param [processingWidth=DataSizes.DOUBLEWORD] The processing width of the simulated CPU.
     */
    private constructor(capacityOfMainMemory: number, pathToLanguageDefinition: string, webContents: WebContents, processingWidth: DataSizes = DataSizes.DOUBLEWORD) {
        this.mainMemory = new RAM(capacityOfMainMemory);
        this.core = new CPUCore(this.mainMemory, processingWidth);
        this._assembler = new Assembler(pathToLanguageDefinition);
        this._programmLoaded = true;
        this.autoScrollForPageTableEnabled = true;
        this.autoScrollForPhysicalRAMEnabled = true;
        this.autoScrollForVirtualRAMEnabled = true;
        this.webContents = webContents;
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
    public static getInstanceOrCreate(capacityOfMainMemory: number, pathToLanguageDefinition: string, webContents: WebContents): SimulationController {
        if (SimulationController._instance === null) {
            SimulationController._instance = new SimulationController(capacityOfMainMemory, pathToLanguageDefinition, webContents);
            SimulationController._instance.bootKernel();
        }
        return SimulationController._instance;
    }

    public static getInstance(): SimulationController | undefined  {
        if (SimulationController._instance === null) {
            return undefined;
        }
        return SimulationController._instance;
    }

    /**
     * This method boots the operating system by loading its data into main memory. The address space,
     * where the operating system is located in memory is sometimes called kernel space.
     */
    private bootKernel(): void {
        // Enter kernel mode.
        this.core.flags.enterKernelMode();
        // Enable real mode and disable memory virtualization.
        this.core.mmu.disableMemoryVirtualization();

        const startOfKernelSpace = SimulationController.KERNEL_SPACE_START;

        // Load kernel code into memory 
        if (startOfKernelSpace != 0xC0000000) {
            throw new EvalError("Unexpected begin of OS memory");
        }

        const compiledOS: DoubleWord[] = this._assembler.assemble(readFileSync(`${process.cwd()}/os_filesystem/os/src/os_entry.asm`, "utf-8"), startOfKernelSpace)

        //disassemble(compiledOS, kernelCodeStartAddress) //For debugging

        for (let i = 0; i < compiledOS.length; i++) {
            this.mainMemory.writeDoubleWordTo(DoubleWord.fromNumber(startOfKernelSpace + i*DoubleWord.NUMBER_OF_BYTES), compiledOS[i])
        }
        
        this.core.eip.content = startOfKernelSpace;

        //Assemble the init program (needed by the os)
        this.assembleProgram(process.cwd() + "/os_filesystem/os/user/init.asm");

        //Assemble the idle program (needed by the os)
        this.assembleProgram(process.cwd() + "/os_filesystem/os/user/idle.asm");
        
        this.createUtilityFiles();

        DebugLogger.log("");
        DebugLogger.log("Starting Execution");
        DebugLogger.log("");

        this.core.cycle();       
        
        this.webContents.send('clear_log');

        this.webContents.send('update_log', "OS Initialized");

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
        const compiledProgram: Array<DoubleWord> = this._assembler.assemble(fileContents);

        const buffer = Buffer.alloc(compiledProgram.length * 4);

        compiledProgram.forEach((doubleWord, i) => {
            const offset = i * 4;

            buffer[offset]     = DoubleWord.getFirstByte(doubleWord);
            buffer[offset + 1] = DoubleWord.getSecondByte(doubleWord);
            buffer[offset + 2] = DoubleWord.getThirdByte(doubleWord);
            buffer[offset + 3] = DoubleWord.getFourthByte(doubleWord);
        });

        writeFileSync(pathToProgramCode.replace(".asm", ".bin"), buffer);

        return;
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

        let buffer = Buffer.alloc(4096 * 4);

        writeFileSync(zeroFramePath, buffer);

        buffer = Buffer.alloc((786432 + 262144) * 4);

        for (let i = 0; i < 786432*4; i+=4) { //0x40000000
            buffer[i] = 0x40;
        }

        for (let i = 0; i < 262144; i++) {
            let index = 786432*4 + i*4;
            if (i < 65536) //0xB0...
            {
                let value = DoubleWord.fromNumber(0xB0000000 + i + 786432);
                buffer[index] = DoubleWord.getFirstByte(value);
                buffer[index+1] = DoubleWord.getSecondByte(value);
                buffer[index+2] = DoubleWord.getThirdByte(value);
                buffer[index+3] = DoubleWord.getFourthByte(value);
            }
            else //0x90...
            {
                let value = DoubleWord.fromNumber(0x90000000 + i + 786432);
                buffer[index] = DoubleWord.getFirstByte(value);
                buffer[index+1] = DoubleWord.getSecondByte(value);
                buffer[index+2] = DoubleWord.getThirdByte(value);
                buffer[index+3] = DoubleWord.getFourthByte(value);
            }
        }

        writeFileSync(pageTablePath, buffer);

        return;
    }



    /**
     * This method triggers execution of the next instruction
     */
    public cycle(): void {
        
        this.core.cycle();
    }

    /**
     * Send a message to be appended to the log-widget in the main window.
     * @param message The message that gets appended to the log-widget.
     */
    public log(message: string): void {
        this.webContents.send('update_log', message);
        DebugLogger.log("  " + message);
    }
}