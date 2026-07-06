import { DoubleWord } from "../types/binary/DoubleWord";
import { Byte } from "../types/binary/Byte";
import { Instructions } from "../types/enumerations/IntructionSet";
import { InstructionTypes } from "../types/enumerations/InstructionTypes";
import { OperandTypes } from "../types/enumerations/OperandTypes";
import { RegisterNumbers } from "../types/enumerations/RegisterNumbers";
import { AddressingModes } from "../types/enumerations/AdressingModes";
import { InterruptNumbers } from "../types/enumerations/InterruptNumbers";
import { DevOperations } from "../types/enumerations/DevOperations";

/**
 * This enumeration is a duplicate of the one, that can be
 * found in src/types/types.ts. This is intended, as imports
 * are problematic to use in frontend. Maybe there is a solution.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export enum NumberSystem {
    HEX = 16,
    DEC = 10,
    BIN = 2,
}

/**
 * This class encapsulates the logic needed to initialize and sync the GUI
 * with the backend process.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class Renderer {
    /**
     * This class member stores the highest available physical memory address.
     */
    public static readonly HIGH_ADDRESS_PHYSICAL_MEMORY_DEC: number = 4_294_967_295;

    /**
     * This class member stores the number of bits representing the page frame number.
     * The page frame number can be extracted from a physical memory address by removing the offset bits from the right.
     * @readonly
     */
    public static readonly NUMBER_BITS_PAGE_FRAME_ADDRESS: number = 20;


    /**
     * This field stores a reference to the browser "window".
     */
    private readonly _window: Window & typeof globalThis;

    /**
     * This field stores a reference to the HTML document.
     */
    private readonly _document: Document;

    /**
     * This field indicates, whether an assembly program is currently loaded.
     */
    public programLoaded: boolean;

    /**
     * This field stores a reference to the HTMLElement representing the EAX register.
     * @readonly
     */
    private readonly _eax: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the EAX register.
     */
    public dataRepresentationEAX: NumberSystem; // Replace with actual type or import if available

    /**
     * This field stores a reference to the HTMLElement representing the EBX register.
     * @readonly
     */
    private readonly _ebx: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the EBX register.
     */
    public dataRepresentationEBX: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the ECX register.
     * @readonly
     */
    private readonly _ecx: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the ECX register.
     */
    public dataRepresentationECX: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the EDX register.
     * @readonly
     */
    private readonly _edx: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the EDX register.
     */
    public dataRepresentationEDX: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the EIP register.
     * @readonly
     */
    private readonly _eip: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the EIP register.
     */
    public dataRepresentationEIP: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the FLAGS register.
     * @readonly
     */
    private readonly _flags: HTMLElement | null;

    /**
     * This field stores a reference to the HTMLElement representing the EIR register.
     * @readonly
     */
    private readonly _eir: HTMLElement | null;

    /**
     * TODO: Implement mechanism for retrieving textual instruction from main process of the Simulator!
     * This field is currently unused, as there is no such mechanism.
     * The only available representation for the EIR register is binary.
     * 
     * This field stores the currently selected representation of the data for the EIR register.
     */
    public dataRepresentationEIR: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the NPTP register.
     * @readonly
     */
    private readonly _nptp: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the NPTP register.
     */
    public dataRepresentationNPTP: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the VMPTR register.
     * @readonly
     */
    private readonly _vmptr: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the VMPTR register.
     */
    public dataRepresentationVMPTR: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the ESP register.
     * @readonly
     */
    private readonly _esp: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the ESP register.
     */
    public dataRepresentationESP: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the ITP register.
     * @readonly
     */
    private readonly _itp: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the ITP register.
     */
    public dataRepresentationITP: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the GPTP register.
     * @readonly
     */
    private readonly _gptp: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the GPTP register.
     */
    public dataRepresentationGPTP: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the PTP register.
     * @readonly
     */
    private readonly _ptp: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the data for the PTP register.
     */
    public dataRepresentationPTP: NumberSystem;

    /**
     * This field stores a reference to the HTMLElement representing the RAM search widget.
     * @readonly
     */
    private readonly _ramSearch: HTMLElement | null;

    /**
     * This field stores the currently selected representation of the memory address for the RAM search.
     */
    public dataRepresentationRAMSearch: NumberSystem;

    /**
     * This field is used to observe the visibility of the GUI elements representing cells of the physical RAM.
     * @readonly
     */
    private readonly _physicalRAMObserver: IntersectionObserver;

    /**
     * This field is used to observe the visibility of the GUI elements representing cells of the virtual RAM.
     * @readonly
     */
    private readonly _virtualRAMObserver: IntersectionObserver;

    /**
     * This field is used to observe the visibility of the GUI elements representing Page Table entries.
     */
    private readonly _pageTableObserver: IntersectionObserver;

    /**
     * This field stores a list with all visible GUI elements associated with the widget of the physical main memory.
     */
    private _listOfVisiblePhysicalRAMGuiElements: Array<Element>;

    /**
     * This field stores a list with all visible GUI elements associated with the widget of the virtual main memory.
     */
    private _listOfVisibleVirtualRAMGuiElements: Array<Element>;

    /**
     * This field stores a list with all visible GUI elements associated with the widget of the Page Table.
     */
    private _listOfVisiblePageTableEntries: Array<Element>;

    /**
     * This field stores the currently selected data representation for the detailed RAM view, dictating how the byte data gets interpreted.
     */
    public ramDataRepresentation: string;

    /**
     * This field stores the currently selected block size for the detailed RAM view, dictating how many bytes per row are shown.
     */
    public ramBlockSize: number;

    /**
     * This field stores the memory start address from the input box in the detailed RAM view.
     */
    public ramViewStartAddress: number;

    /**
     * This field stores the memory end address from the input box in the detailed RAM view.
     */
    public ramViewEndAddress: number;

    /**
     * This field stores a callback used to observe the HTMLElements representing the cells of the pyhsical RAM.
     * @param entries A list of elements, which triggered the intersection observer. 
     * @returns A callback, which is used as the logic to perform whenever elements enter or leave the observed viewspace.
     */
    private readonly _physicalRAMObserverCallback: IntersectionObserverCallback = async (entries: IntersectionObserverEntry[]) => {
        const ramCellsHTMLElement: HTMLElement | null = this._document.getElementById("physical-ram-cells");
        if (!ramCellsHTMLElement) {
            return;
        }
        for (const entry of entries) {
            if (entry.isIntersecting && entry.rootBounds !== null) {
                // Element enters viewport. Calculate the direction from which the element is entering the viewport.
                const fromTop: number = entry.intersectionRect.top;
                const fromBottom: number = entry.rootBounds.height - entry.intersectionRect.bottom;
                // Make entered element visible.
                entry.target.classList.remove("invisible");
                // Check if element enters from top of viewport.
                if (entry.target.isEqualNode(ramCellsHTMLElement.firstElementChild) && fromTop < fromBottom) {
                    // Element is scrolling in from top of viewport and is the first child node of the HTMLElement representing the RAM view.
                    // Insert element and a preceding element at the front of the list.
                    const physicalAddressHexString: string = entry.target.getAttribute("data-physical-address")!;
                    const nextHigherPhysicalAddressDec: number = parseInt(physicalAddressHexString, 16) + 1;
                    if (nextHigherPhysicalAddressDec >= Math.pow(2, 32)) {
                        return;
                    }
                    const binaryContent: number = await this._window.mainMemory.readFromPhysicalMemory(nextHigherPhysicalAddressDec);
                    const element: Element = this.createPhysicalRAMGuiElement("0x" + nextHigherPhysicalAddressDec.toString(16), binaryContent.toString(2).padStart(8, "0"));
                    this._physicalRAMObserver.observe(element);
                    ramCellsHTMLElement.insertBefore(element, ramCellsHTMLElement.firstElementChild);
                    this._listOfVisiblePhysicalRAMGuiElements.unshift(element);
                    this._physicalRAMObserver.unobserve(ramCellsHTMLElement.lastElementChild!);
                    this._listOfVisiblePhysicalRAMGuiElements.splice(this._listOfVisiblePhysicalRAMGuiElements.indexOf(ramCellsHTMLElement.lastElementChild!), 1);
                    ramCellsHTMLElement.removeChild(ramCellsHTMLElement.lastElementChild!);
                }
                // Check if element enters from bottom of viewport.
                if (entry.target.isEqualNode(ramCellsHTMLElement.lastElementChild) && fromTop > fromBottom) {
                    // Element is scrolling in from bottom of viewport and is the last child node of the HTMLElement representing the RAM view.
                    // Insert element at the end of the list.
                    const physicalAddressHexString: string = entry.target.getAttribute("data-physical-address")!;
                    const nextLowerPhysicalAddressDec: number = parseInt(physicalAddressHexString, 16) - 1;
                    if (nextLowerPhysicalAddressDec < 0) {
                        return;
                    }
                    const binaryContent: number = await this._window.mainMemory.readFromPhysicalMemory(nextLowerPhysicalAddressDec);
                    const element: Element = this.createPhysicalRAMGuiElement("0x" + nextLowerPhysicalAddressDec.toString(16), binaryContent.toString(2).padStart(8, "0"));
                    this._physicalRAMObserver.observe(element);
                    ramCellsHTMLElement.appendChild(element);
                    this._listOfVisiblePhysicalRAMGuiElements.push(element);
                    this._physicalRAMObserver.unobserve(ramCellsHTMLElement.firstElementChild!);
                    this._listOfVisiblePhysicalRAMGuiElements.splice(this._listOfVisiblePhysicalRAMGuiElements.indexOf(ramCellsHTMLElement.firstElementChild!), 1);
                    ramCellsHTMLElement.removeChild(ramCellsHTMLElement.firstElementChild!);
                }
            } else {
                // Element not in the viewport.
                entry.target.classList.add("invisible");
            }
        }
    }

    /**
     * This field stores a callback used to observe the HTMLElements representing the cells of the pyhsical RAM.
     * @param entries A list of elements, which triggered the intersection observer. 
     * @returns A callback, which is used as the logic to perform whenever elements enter or leave the observed viewspace.
     */
    private readonly _virtualRAMObserverCallback: IntersectionObserverCallback = async (entries: IntersectionObserverEntry[]) => {
        const ramCellsHTMLElement: HTMLElement | null = this._document.getElementById("virtual-ram-cells");
        if (!ramCellsHTMLElement) {
            return;
        }
        for (const entry of entries) {
            if (entry.isIntersecting && entry.rootBounds !== null) {
                // Element enters viewport. Calculate the direction from which the element is entering the viewport.
                const fromTop: number = entry.intersectionRect.top;
                const fromBottom: number = entry.rootBounds.height - entry.intersectionRect.bottom;
                // Make entered element visible.
                entry.target.classList.remove("invisible");
                // Check if element enters from top of viewport.
                if (entry.target.isEqualNode(ramCellsHTMLElement.firstElementChild) && fromTop < fromBottom) {
                    // Element is scrolling in from top of viewport and is the first child node of the HTMLElement representing the RAM view.
                    // Insert element and a preceding element at the front of the list.
                    const virtualAddressHexString: string = entry.target.getAttribute("data-virtual-address")!;
                    const nextHigherVirtualAddressDec: number = parseInt(virtualAddressHexString, 16) + 1;
                    if (nextHigherVirtualAddressDec >= Math.pow(2, 32)) {
                        return;
                    }
                    const binaryContent: number | undefined = await this._window.mainMemory.readFromVirtualMemory(nextHigherVirtualAddressDec);
                    const element: Element = this.createVirtualRAMGuiElement("0x" + nextHigherVirtualAddressDec.toString(16), binaryContent === undefined ? "Not Mapped" : binaryContent.toString(2).padStart(8, "0"));
                    this._virtualRAMObserver.observe(element);
                    ramCellsHTMLElement.insertBefore(element, ramCellsHTMLElement.firstElementChild);
                    this._listOfVisibleVirtualRAMGuiElements.unshift(element);
                    this._virtualRAMObserver.unobserve(ramCellsHTMLElement.lastElementChild!);
                    this._listOfVisibleVirtualRAMGuiElements.splice(this._listOfVisibleVirtualRAMGuiElements.indexOf(ramCellsHTMLElement.lastElementChild!), 1);
                    ramCellsHTMLElement.removeChild(ramCellsHTMLElement.lastElementChild!);
                }
                // Check if element enters from bottom of viewport.
                if (entry.target.isEqualNode(ramCellsHTMLElement.lastElementChild) && fromTop > fromBottom) {
                    // Element is scrolling in from bottom of viewport and is the last child node of the HTMLElement representing the RAM view.
                    // Insert element at the end of the list.
                    const virtualAddressHexString: string = entry.target.getAttribute("data-virtual-address")!;
                    const nextLowerVirtualAddressDec: number = parseInt(virtualAddressHexString, 16) - 1;
                    if (nextLowerVirtualAddressDec < 0) {
                        return;
                    }
                    const binaryContent: number | undefined = await this._window.mainMemory.readFromVirtualMemory(nextLowerVirtualAddressDec);
                    const element: Element = this.createVirtualRAMGuiElement("0x" + nextLowerVirtualAddressDec.toString(16), binaryContent === undefined ? "Not Mapped" : binaryContent.toString(2).padStart(8, "0"));
                    this._virtualRAMObserver.observe(element);
                    ramCellsHTMLElement.appendChild(element);
                    this._listOfVisibleVirtualRAMGuiElements.push(element);
                    this._virtualRAMObserver.unobserve(ramCellsHTMLElement.firstElementChild!);
                    this._listOfVisibleVirtualRAMGuiElements.splice(this._listOfVisibleVirtualRAMGuiElements.indexOf(ramCellsHTMLElement.firstElementChild!), 1);
                    ramCellsHTMLElement.removeChild(ramCellsHTMLElement.firstElementChild!);
                }
            } else {
                // Element not in the viewport.
                entry.target.classList.add("invisible");
            }
        }
    }

    /**
     * This field stores a callback used to observe the GUI elements representing the entries of the Page Table.
     * @param entries A list of elements, which triggered the intersection observer. 
     * @returns A callback, which is used as the logic to perform whenever elements enter or leave the observed viewspace.
     */
    private readonly _pageTableObserverCallback: IntersectionObserverCallback = async (entries: IntersectionObserverEntry[]) => {
        const pageTableEntriesHTMLElement: HTMLElement | null = this._document.getElementById("page-table-entries");
        if (!pageTableEntriesHTMLElement) {
            return;
        }
        for (const entry of entries) {
            if (!entry.target.hasAttribute("data-page-number")) {
                continue;
            }
            if (entry.isIntersecting && entry.rootBounds !== null) {
                // Element enters viewport. Calculate the direction from which the element is entering the viewport.
                const fromTop: number = entry.intersectionRect.top;
                const fromBottom: number = entry.rootBounds.height - entry.intersectionRect.bottom;
                // Make entered element visible.
                entry.target.classList.remove("invisible");
                // Check if element enters from top of viewport.
                if (entry.target.isEqualNode(pageTableEntriesHTMLElement.firstElementChild) && fromTop < fromBottom) {
                    // Element is scrolling in from top of viewport and is the first child node of the HTMLElement representing the RAM view.
                    // Insert element and a preceding element at the front of the list.
                    const pageNumberDecString: string = entry.target.getAttribute("data-page-number")!;
                    const numberAddressesPerPageDec: number = Math.pow(2, 12);
                    const nextHigherPageNumberDec: number = parseInt(pageNumberDecString, 10) + 1;
                    if (nextHigherPageNumberDec >= (Math.pow(2, 32) / numberAddressesPerPageDec) - 1) {
                        return;
                    }
                    const pageTableEntries: Map<number, number> = await this._window.mainMemory.readPageTableEntries(nextHigherPageNumberDec, nextHigherPageNumberDec);
                    for (const [pageNumber, pageTableEntry] of Array.from(pageTableEntries).reverse()) {
                        const presentFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(0, 1) === "1") ? true : false;
                        const writableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(1, 2) === "1") ? true : false;
                        const executableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(2, 3) === "1") ? true : false;
                        const accessableOnlyInKernelModeFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(3, 4) === "1") ? true : false;
                        const pinnedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(4, 5) === "1") ? true : false;
                        const changedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(5, 6) === "1") ? true : false;
                        const pageFrameNumberHexString = `0x${parseInt(pageTableEntry.toString(2).padStart(32, "0").slice(-Renderer.NUMBER_BITS_PAGE_FRAME_ADDRESS), 2)}`;
                        const element: HTMLElement = this.createPageTableEntryElement(
                            "0x" + pageNumber.toString(16),
                            presentFlag,
                            writableFlag,
                            executableFlag,
                            accessableOnlyInKernelModeFlag,
                            pinnedFlag,
                            changedFlag,
                            pageFrameNumberHexString
                        );
                        this._pageTableObserver.observe(element);
                        pageTableEntriesHTMLElement.insertBefore(element, pageTableEntriesHTMLElement.firstElementChild);
                        this._listOfVisiblePageTableEntries.unshift(element);
                        this._pageTableObserver.unobserve(pageTableEntriesHTMLElement.lastElementChild!);
                        this._listOfVisiblePageTableEntries.splice(this._listOfVisiblePageTableEntries.indexOf(pageTableEntriesHTMLElement.lastElementChild!), 1);
                        pageTableEntriesHTMLElement.removeChild(pageTableEntriesHTMLElement.lastElementChild!);
                    }
                }
                // Check if element enters from bottom of viewport.
                if (entry.target.isEqualNode(pageTableEntriesHTMLElement.lastElementChild) && fromTop > fromBottom) {
                    // Element is scrolling in from bottom of viewport and is the last child node of the HTMLElement representing the RAM view.
                    // Insert element at the end of the list.
                    const pageNumberDecString: string = entry.target.getAttribute("data-page-number")!;
                    const nextLowerPageNumberDec: number = parseInt(pageNumberDecString, 10) - 1;
                    if (nextLowerPageNumberDec < 0) {
                        return;
                    }
                    const pageTableEntries: Map<number, number> = await this._window.mainMemory.readPageTableEntries(nextLowerPageNumberDec, nextLowerPageNumberDec);
                    for (const [pageNumber, pageTableEntry] of Array.from(pageTableEntries).reverse()) {
                        const presentFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(0, 1) === "1") ? true : false;
                        const writableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(1, 2) === "1") ? true : false;
                        const executableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(2, 3) === "1") ? true : false;
                        const accessableOnlyInKernelModeFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(3, 4) === "1") ? true : false;
                        const pinnedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(4, 5) === "1") ? true : false;
                        const changedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(5, 6) === "1") ? true : false;
                        const pageFrameNumberHexString = `0x${parseInt(pageTableEntry.toString(2).padStart(32, "0").slice(-Renderer.NUMBER_BITS_PAGE_FRAME_ADDRESS), 2)}`;
                        const element: HTMLElement = this.createPageTableEntryElement(
                            "0x" + pageNumber.toString(16),
                            presentFlag,
                            writableFlag,
                            executableFlag,
                            accessableOnlyInKernelModeFlag,
                            pinnedFlag,
                            changedFlag,
                            pageFrameNumberHexString
                        );
                        this._pageTableObserver.observe(element);
                        pageTableEntriesHTMLElement.appendChild(element);
                        this._listOfVisiblePageTableEntries.push(element);
                        this._virtualRAMObserver.unobserve(pageTableEntriesHTMLElement.firstElementChild!);
                        this._listOfVisiblePageTableEntries.splice(this._listOfVisiblePageTableEntries.indexOf(pageTableEntriesHTMLElement.firstElementChild!), 1);
                        pageTableEntriesHTMLElement.removeChild(pageTableEntriesHTMLElement.firstElementChild!);
                    }
                }
            } else {
                // Element not in the viewport.
                entry.target.classList.add("invisible");
            }
        }
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the EAX register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerEAX: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationEAX = NumberSystem.DEC;
                this.readEAX(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationEAX = NumberSystem.HEX;
                this.readEAX(16);
            } else {
                this.dataRepresentationEAX = NumberSystem.BIN;
                this.readEAX(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the EBX register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerEBX: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationEBX = NumberSystem.DEC;
                this.readEBX(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationEBX = NumberSystem.HEX;
                this.readEBX(16);
            } else {
                this.dataRepresentationEBX = NumberSystem.BIN;
                this.readEBX(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the ECX register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerECX: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationECX = NumberSystem.DEC;
                this.readECX(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationECX = NumberSystem.HEX;
                this.readECX(16);
            } else {
                this.dataRepresentationECX = NumberSystem.BIN;
                this.readECX(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the ECX register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerEDX: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationECX = NumberSystem.DEC;
                this.readEDX(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationECX = NumberSystem.HEX;
                this.readEDX(16);
            } else {
                this.dataRepresentationECX = NumberSystem.BIN;
                this.readEDX(2);
            }
        }
        return;
    }


    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the EIP register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerEIP: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationEIP = NumberSystem.DEC;
                this.readEIP(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationEIP = NumberSystem.HEX;
                this.readEIP(16);
            } else {
                this.dataRepresentationEIP = NumberSystem.BIN;
                this.readEIP(2);
            }
        }
        return;
    }

    /**
     * TODO: This callback is currently unused. It will be used to switch between binary and textual representation of the loaded instruction!
     * This callback is used as the change listeners logic for the GUI element, which visualizes the EIR register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerEIR: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "INSTRUCTION") {
                // TODO: Implement mechanism for retrieving textual instruction from main process of the Simulator!
                this.readEIR();
            } else {
                this.readEIR();
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the NPTP register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerNPTP: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationNPTP = NumberSystem.DEC;
                this.readNPTP(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationNPTP = NumberSystem.HEX;
                this.readNPTP(16);
            } else {
                this.dataRepresentationNPTP = NumberSystem.BIN;
                this.readNPTP(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the VMPTR register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerVMPTR: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationVMPTR = NumberSystem.DEC;
                this.readVMPTR(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationVMPTR = NumberSystem.HEX;
                this.readVMPTR(16);
            } else {
                this.dataRepresentationVMPTR = NumberSystem.BIN;
                this.readVMPTR(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the ESP register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerESP: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationESP = NumberSystem.DEC;
                this.readESP(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationESP = NumberSystem.HEX;
                this.readESP(16);
            } else {
                this.dataRepresentationESP = NumberSystem.BIN;
                this.readESP(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the ITP register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerITP: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationITP = NumberSystem.DEC;
                this.readITP(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationITP = NumberSystem.HEX;
                this.readITP(16);
            } else {
                this.dataRepresentationITP = NumberSystem.BIN;
                this.readITP(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the GPTP register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerGPTP: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationGPTP = NumberSystem.DEC;
                this.readGPTP(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationGPTP = NumberSystem.HEX;
                this.readGPTP(16);
            } else {
                this.dataRepresentationGPTP = NumberSystem.BIN;
                this.readGPTP(2);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the PTP register.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerPTP: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedRepresentation);
            if (currentRepresentation === demandedRepresentation) {
                return;
            } else if (demandedRepresentation === "DECIMAL") {
                this.dataRepresentationPTP = NumberSystem.DEC;
                this.readPTP(10);
            } else if (demandedRepresentation === "HEXADECIMAL") {
                this.dataRepresentationPTP = NumberSystem.HEX;
                this.readPTP(16);
            } else {
                this.dataRepresentationPTP = NumberSystem.BIN;
                this.readPTP(2);
            }
        }
        return;
    }


    /**
     * This callback is used as the change listener logic for the select element that controls the byte display format for the RAM display element
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerRamByteRepresentation: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        const ramBlockSizeSelector: HTMLSelectElement = this._document.getElementById("ram-select-blocksize") as HTMLSelectElement;
        if (parent !== null) {
            const currentByteRepresentation: string = parent.getAttribute("data-representation")!;
            const demandedByteRepresentation: string = target.value;
            parent.setAttribute("data-representation", demandedByteRepresentation);
            if (currentByteRepresentation === demandedByteRepresentation) {
                return
            }
            this.ramDataRepresentation = demandedByteRepresentation;
            const blockSizeDisable: boolean = (demandedByteRepresentation === "ASCII" || demandedByteRepresentation === "ASSEMBLY");
            ramBlockSizeSelector.disabled = blockSizeDisable;
            if (demandedByteRepresentation === "ASSEMBLY") {
                this.ramBlockSize = 12;
            } else {
                const previousBlockSize: string = parent.getAttribute("block-size")!;
                this.ramBlockSize = parseInt(previousBlockSize);
            }
            this.checkAddressRangeInput();
            this.createUpdateDetailedRamViewTable(this.ramViewStartAddress, this.ramViewEndAddress);
        }
        return;
    }

    /**
     * This callback is used as the change listener logic for the select element that controls the blocksize in the RAM display element.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerRamBlockSize: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentBlockSize: string = parent.getAttribute("block-size")!;
            const demandedBlockSize: string = target.value;
            parent.setAttribute("block-size", demandedBlockSize);
            if (currentBlockSize === demandedBlockSize) {
                return;
            } else {
                this.ramBlockSize = parseInt(demandedBlockSize);
                this.checkAddressRangeInput();
                this.createUpdateDetailedRamViewTable(this.ramViewStartAddress, this.ramViewEndAddress);
            }
        }
        return;
    }

    /**
     * This callback is used as the change listeners logic for the GUI element, which visualizes the RAM-Cell search module.
     * @param event An object, which represents the event fired, whenever a change occurs on the <select> element contained in the GUI element.
     */
    private readonly onChangeListenerRAMSearch: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLSelectElement = event.target as HTMLSelectElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            const currentLocation: string = parent.getAttribute("search-location")!;
            const demandedLocation: string = target.value;
            const searchValue: string = (this._document.getElementById("ramsearch-input") as HTMLInputElement).value;
            parent.setAttribute("search-location", demandedLocation);
            if (currentLocation === demandedLocation) {
                return;
            } else if (demandedLocation === "PHYSICAL") {
                //this.jumpToPhysicalRamElement(searchValue, this.dataRepresentationRAMSearch);
                this.highlightRamElement(Number(searchValue));
            } else {
                //this.jumpToVirtualRamElement(searchValue, this.dataRepresentationRAMSearch);
                this.highlightRamElement(Number(searchValue), true);
            }
        }
        return;
    }

    /**
     * This callback is used as the keyup listeners logic for the GUI element, which visualizes the RAM-Cell search module.
     * @param event An object, which represents the event fired, whenever a change occurs on the <input> element contained in the GUI element.
     */
    private readonly onKeyUpRAMSearch: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        const parent: HTMLElement | null = target.parentElement;
        const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
        const searchValue: string = target.value;
        const regExAllowedChars = /^[0-9a-fA-Fx]+$/;
        const regExEnter = /(0[x])?[a-fA-F0-9]+$/;
        let isHex = regExAllowedChars.test(searchValue);
        if(!isHex) {
            target.value = searchValue.slice(0, -1);
        }
        if (keyboardEvent.key === 'Enter' && parent !== null) {
            isHex = regExEnter.test(searchValue);
            if (!isHex) {
                target.value = "0x0";
                return;
            }
            const currentLocation = parent.getAttribute("search-location")!;
            if (currentLocation === "PHYSICAL") {
                this.highlightRamElement(Number(searchValue));
            } else {
                this.highlightRamElement(Number(searchValue), true);
                //this.jumpToVirtualRamElement(searchValue, this.dataRepresentationRAMSearch);
            }
        }
        return;
    }


    /**
     * This callback is used as the keyup listener logic for the address range GUI element in the detailed ram view.
     * @param event An object, which represents the event fired, whenever a change occurs on the <input> element contained in the GUI element.
     */
    private readonly onKeyUpAddressRangeBox: EventListenerOrEventListenerObject = (event: Event): void => {
        const target: HTMLInputElement = event.target as HTMLInputElement;
        
        const keyboardEvent: KeyboardEvent = event as KeyboardEvent;
        const regExAllowedChars = /^[0-9a-fA-Fx]+$/; 
        //const memoryStartAddress: string = inputBoxStart.value;
        //const memoryEndAddress: string = inputBoxEnd.value;
        const isHex = regExAllowedChars.test(target.value);
        if(!isHex) {
            target.value = target.value.slice(0, -1);
        }
        if (keyboardEvent.key === 'Enter') {
            this.checkAddressRangeInput();
            this.createUpdateDetailedRamViewTable(this.ramViewStartAddress, this.ramViewEndAddress);
        }
    }

    /**
     * This method checks if the given values are valid for the address range input box in the detailed memory view window.
     * If the format is valid and the end address is bigger than the start address, but the address range is not a multiple of the current block size,
     * then the end address is rounded up to the next multiple.
     * @param startAddress The address that will be used as the first memory address to display
     * @param endAddress The address that will be used as the last memory address to display
     * @returns Returns true or false depending on if the address range and format is valid
     */
    private checkAddressRangeInput(): void {
        const inputBoxStart: HTMLInputElement = this._document.getElementById("ram-input-box-start") as HTMLInputElement;
        const inputBoxEnd: HTMLInputElement = this._document.getElementById("ram-input-box-end") as HTMLInputElement;
        const startAddress = inputBoxStart.value;
        const endAddress = inputBoxEnd.value;
        const regExEnter = /(0[x])?[a-fA-F0-9]+$/;
        const inputStartValidFormat = regExEnter.test(startAddress);
        const inputEndValidFormat = regExEnter.test(endAddress);
        const startAddressDec = parseInt(startAddress,16);
        const endAddressDec = parseInt(endAddress,16);
        const addressRange = endAddressDec - startAddressDec;
        if (inputStartValidFormat && inputEndValidFormat && startAddressDec <= endAddressDec) {
            this.ramViewStartAddress = startAddressDec;
            this.ramViewEndAddress = endAddressDec;
            const addressRangeRest = (addressRange + 1) % this.ramBlockSize;
            if (addressRangeRest !== 0) {
                this.ramViewEndAddress = endAddressDec + (this.ramBlockSize - addressRangeRest);
                inputBoxEnd.value = "0x" + this.ramViewEndAddress.toString(16);
            }
        } else {
            inputBoxStart.value = "0x0";
            inputBoxEnd.value = "0xb";
            this.ramViewStartAddress = 0x0;
            this.ramViewEndAddress = 0xb;
        }
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the EAX register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerEAX: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readEAX(NumberSystem.HEX);
            if (this._eax !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the EBX register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerEBX: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readEBX(NumberSystem.HEX);
            if (this._ebx !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the ECX register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerECX: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readECX(NumberSystem.HEX);
            if (this._ecx !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the ECX register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerEDX: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readEDX(NumberSystem.HEX);
            if (this._edx !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the ESP register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerESP: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readESP(NumberSystem.HEX);
            if (this._esp !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the EIP register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerEIP: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readEIP(NumberSystem.HEX);
            if (this._eip !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the ITP register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerITP: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readITP(NumberSystem.HEX);
            if (this._itp !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

    /**
     * This callback is used as the click listener logic for the GUI element, which visualizes the PTP register.
     * @param event An object, which represents the event fired, whenever a click on the GUI element occurs.
     */
    private readonly onClickListenerPTP: EventListenerOrEventListenerObject = async (event: Event): Promise<void> => {
        const target: HTMLElement = event.target as HTMLElement;
        const parent: HTMLElement | null = target.parentElement;
        if (parent !== null) {
            if (target.getAttribute("name") === "register-select-representation") return;
            const content: string = await this._window.simulator.readPTP(NumberSystem.HEX);
            if (this._ptp !== null) {
                this.highlightRamElement(Number(content));
            }
        } 
        return;
    }

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
     * Constructs an instance with the given HTML document associated.
     * @param document A reference to an HTML document.
     * @param window A reference to the browser "window".
     */
    public constructor(document: Document, window: Window & typeof globalThis) {
        this._document = document;
        this._eax = document.getElementById("eax");
        this.dataRepresentationEAX = NumberSystem.BIN;
        this._ebx = document.getElementById("ebx");
        this.dataRepresentationEBX = NumberSystem.BIN;
        this._ecx = document.getElementById("ecx");
        this.dataRepresentationECX = NumberSystem.BIN;
        this._edx = document.getElementById("edx");
        this.dataRepresentationEDX = NumberSystem.BIN;
        this._flags = document.getElementById("flags");
        this._eip = document.getElementById("eip");
        this.dataRepresentationEIP = NumberSystem.BIN;
        this._eir = document.getElementById("eir");
        this.dataRepresentationEIR = NumberSystem.BIN;
        this._esp = document.getElementById("esp");
        this.dataRepresentationESP = NumberSystem.BIN;
        this._gptp = document.getElementById("gptp");
        this.dataRepresentationGPTP = NumberSystem.BIN;
        this._itp = document.getElementById("itp");
        this.dataRepresentationITP = NumberSystem.BIN;
        this._nptp = document.getElementById("nptp");
        this.dataRepresentationNPTP = NumberSystem.BIN;
        this._ptp = document.getElementById("ptp");
        this.dataRepresentationPTP = NumberSystem.BIN;
        this._vmptr = document.getElementById("vmptr");
        this.dataRepresentationVMPTR = NumberSystem.BIN;
        this._ramSearch = document.getElementById("ram-search");
        this.dataRepresentationRAMSearch = NumberSystem.HEX;
        this._physicalRAMObserver = new IntersectionObserver(this._physicalRAMObserverCallback, {
            root: null,             // Viewport is root element.
            rootMargin: "0px",      // Margin for root element.
            threshold: 0            // The element will be displayed, if it enters the rootMargin.
        });
        this._virtualRAMObserver = new IntersectionObserver(this._virtualRAMObserverCallback, {
            root: null,             // Viewport is root element.
            rootMargin: "0px",      // Margin for root element.
            threshold: 0            // The element will be displayed, if it enters the rootMargin.
        });
        this._pageTableObserver = new IntersectionObserver(this._pageTableObserverCallback, {
            root: null,             // Viewport is root element.
            rootMargin: "0px",      // Margin for root element.
            threshold: 0            // The element will be displayed, if it enters the rootMargin.
        })
        this._listOfVisiblePhysicalRAMGuiElements = new Array<Element>();
        this._listOfVisibleVirtualRAMGuiElements = new Array<Element>();
        this._listOfVisiblePageTableEntries = new Array<Element>();
        this.autoScrollForPhysicalRAMEnabled = true;
        this.autoScrollForVirtualRAMEnabled = true;
        this.autoScrollForPageTableEnabled = true;
        this.programLoaded = true;
        this._window = window;
        this.ramDataRepresentation = "BIN";
        this.ramBlockSize = 1;
        this.ramViewStartAddress = 0x0;
        this.ramViewEndAddress = 0xb;
    }

    /**
     * This method registers all the listener for the address range box in the memory view window.
     */
    public registerAddressRangeBoxListener(): void {
        const inputElementStart: HTMLInputElement = this._document.getElementById("ram-input-box-start") as HTMLInputElement;
        const inputElementEnd: HTMLInputElement = this._document.getElementById("ram-input-box-end") as HTMLInputElement;

        inputElementStart.addEventListener("keyup", this.onKeyUpAddressRangeBox);
        inputElementEnd.addEventListener("keyup", this.onKeyUpAddressRangeBox);
    }

    /**
     * This method registers all the listener for the control box that contains the settings for the RAM display element.
     */
    public registerDetailedRamViewSelectElement(): void {
        const byteDataTypeSelect: HTMLSelectElement = this._document.getElementById("ram-select-byte-datatype") as HTMLSelectElement;
        const blockSizeSelect: HTMLSelectElement = this._document.getElementById("ram-select-blocksize") as HTMLSelectElement;
        byteDataTypeSelect.addEventListener("change", this.onChangeListenerRamByteRepresentation);
        blockSizeSelect.addEventListener("change", this.onChangeListenerRamBlockSize);
    }

    /**
     * This method registers all the listener for the RAM-Cell search-module
     */
    public registerRAMSearchListener(): void {
        const searchModules: HTMLCollectionOf<Element> = this._document.getElementsByClassName("search-module");
        for (const searchModule of searchModules) {
            const selectElement: Element = searchModule.children.namedItem("select-address-space")!;
            const inputElement: Element = searchModule.children.namedItem("searchbox")!;
            selectElement.addEventListener("change", this.onChangeListenerRAMSearch);
            inputElement.addEventListener("keyup", this.onKeyUpRAMSearch);
        }
        return;
    }

    /**
     * This method registers the change listeners for all <select> elements inside the GUI elements, which represent
     * registers during start of the simulator.
     */
    public registerChangeListener(): void {
        const registerElements: HTMLCollectionOf<Element> = this._document.getElementsByClassName("register");
        for (const register of registerElements) {
            const selectElement: Element = register.children.namedItem("register-select-representation")!;
            let eventListener: EventListenerOrEventListenerObject | undefined = undefined;
            switch (register.getAttribute("id")!.toLowerCase()) {
                case "eax":
                    eventListener = this.onChangeListenerEAX;
                    break;
                case "ebx":
                    eventListener = this.onChangeListenerEBX;
                    break;
                case "ecx":
                    eventListener = this.onChangeListenerECX;
                    break;
                case "edx":
                    eventListener = this.onChangeListenerEDX;
                    break;
                case "vmptr":
                    eventListener = this.onChangeListenerVMPTR;
                    break;
                case "eip":
                    eventListener = this.onChangeListenerEIP;
                    break;
                case "eir":
                    /**
                     * TODO: Create mechanism to retrieve textual representation of the loaded instruction.
                     * As this is currently not implemented, the EIR register can display its content
                     * only in its binary representation.
                     */
                    // eventListener = this.onChangeListenerEIR;
                    break;
                case "esp":
                    eventListener = this.onChangeListenerESP;
                    break;
                case "gptp":
                    eventListener = this.onChangeListenerGPTP;
                    break;
                case "ptp":
                    eventListener = this.onChangeListenerPTP;
                    break;
                case "itp":
                    eventListener = this.onChangeListenerITP;
                    break;
                case "nptp":
                    eventListener = this.onChangeListenerNPTP;
                    break;
                default:
                    break;
            }
            if (eventListener !== undefined) {
                selectElement.addEventListener("change", eventListener);
            }
        }
        return;
    }

    /**
     * This method registers the click listeners during the start of the simulator for all register GUI elements 
     * which represent registers that could hold a memory address.
     */
    public registerClickListener(): void {
        const registerElements: HTMLCollectionOf<Element> = this._document.getElementsByClassName("register");
        for (const register of registerElements) {
            let eventListener: EventListenerOrEventListenerObject | undefined = undefined;
            switch (register.getAttribute("id")!.toLowerCase()) {
                case "eax":
                    eventListener = this.onClickListenerEAX;
                    break;
                case "ebx":
                    eventListener = this.onClickListenerEBX;
                    break;
                case "ecx":
                    eventListener = this.onClickListenerECX;
                    break;
                case "edx":
                    eventListener = this.onClickListenerEDX;
                    break;
                case "esp":
                    eventListener = this.onClickListenerESP;
                    break;
                case "eip":
                    eventListener = this.onClickListenerEIP;
                    break;
                case "itp":
                    eventListener = this.onClickListenerITP;
                    break;
                case "ptp":
                    eventListener = this.onClickListenerPTP;
                    break;
                default:
                    break;
            }
            if (eventListener !== undefined) {
                register.addEventListener("click", eventListener);
            }
        }
        return;
    }

    /**
     * This function reloads the RAM view, by taking the visible elements into account. This is done in order to avoid
     * weird jumps in the widget, representing the physical main memory.
     */
    public async reloadPhysicalRAMView(): Promise<void> {
        const ramCellsHTMLElement: HTMLElement | null = this._document.getElementById("physical-ram-cells");
        if (!ramCellsHTMLElement) {
            return;
        }
        if (ramCellsHTMLElement.innerText !== "") {
            ramCellsHTMLElement.innerText = "";
            // Disconnect obersever, which results in no element beeing observed. 
            this._physicalRAMObserver.disconnect();
        }
        // Read physical memory address from the last element, which should have the lowest visible memory address.
        const firstPhysicalAddressToRead: number =
            parseInt(this._listOfVisiblePhysicalRAMGuiElements.at(this._listOfVisiblePhysicalRAMGuiElements.length - 1)!.getAttribute("data-physical-address")!, 16);
        // Read physical memory address from the first element, which should have the highest visible memory adress.
        const lastPhysicalAddressToRead: number = parseInt(this._listOfVisiblePhysicalRAMGuiElements.at(0)!.getAttribute("data-physical-address")!, 16);
        const ramCells: Map<number, number> =
            await this._window.mainMemory.readRangeFromPhysicalMemory(firstPhysicalAddressToRead, lastPhysicalAddressToRead);
        for (const [physicalAddress, binaryContent] of Array.from(ramCells).reverse()) {
            const element: HTMLElement = this.createPhysicalRAMGuiElement("0x" + physicalAddress.toString(16), binaryContent.toString(2).padStart(8, "0"));
            ramCellsHTMLElement.appendChild(element);
            this._listOfVisiblePhysicalRAMGuiElements.push(element);
            this._physicalRAMObserver.observe(element);
        }
        // Jump to lowest available address to prevent endless scrolling.
        this._document.querySelector(`[data-physical-address="${"0x" + firstPhysicalAddressToRead.toString(16)}"]`)!.scrollIntoView();
        return;
    }

    /**
     * This function reloads the RAM view, by taking the visible elements into account. This is done in order to avoid
     * weird jumps in the widget, representing the virtual main memory.
     */
    public async reloadVirtualRAMView(): Promise<void> {
        const ramCellsHTMLElement: HTMLElement | null = this._document.getElementById("virtual-ram-cells");
        if (!ramCellsHTMLElement) {
            return;
        }
        if (ramCellsHTMLElement.innerText !== "") {
            ramCellsHTMLElement.innerText = "";
            // Disconnect obersever, which results in no element beeing observed. 
            this._virtualRAMObserver.disconnect();
        }
        // Read physical memory address from the last element, which should have the lowest visible memory address.
        const firstVirtualAddressToRead: number =
            parseInt(this._listOfVisibleVirtualRAMGuiElements.at(this._listOfVisibleVirtualRAMGuiElements.length - 1)!.getAttribute("data-virtual-address")!, 16);
        // Read physical memory address from the first element, which should have the highest visible memory adress.
        const lastVirtualAddressToRead: number = parseInt(this._listOfVisibleVirtualRAMGuiElements.at(0)!.getAttribute("data-virtual-address")!, 16);
        const ramCells: Map<number, number | undefined> =
            await this._window.mainMemory.readRangeFromVirtualMemory(firstVirtualAddressToRead, lastVirtualAddressToRead);
        for (const [virtualAddress, binaryContent] of Array.from(ramCells).reverse()) {
            const element: HTMLElement = this.createVirtualRAMGuiElement("0x" + virtualAddress.toString(16), binaryContent === undefined ? "Not Mapped" : binaryContent.toString(2).padStart(8, "0"));
            ramCellsHTMLElement.appendChild(element);
            this._listOfVisibleVirtualRAMGuiElements.push(element);
            this._virtualRAMObserver.observe(element);
        }
        // Jump to lowest available address to prevent endless scrolling.
        this._document.querySelector(`[data-virtual-address="${"0x" + firstVirtualAddressToRead.toString(16)}"]`)!.scrollIntoView();
        return;
    }

    /**
     * This method initializes the view of the physical RAM by reading the first twenty
     * entries of the main memory and creating HTMLElements, which represents the individual 
     * RAM cells.
     * @param [firstPhysicalAddressToReadHex=0x0] The first physical memory address to read from main memory in hexadecimal representation.
     * @param [lastPhysicalAddressToReadHex=0x1e] The last physical memory address to read from main memory in hexadecimal representation.
     */
    public async createPhysicalRAMView(firstPhysicalAddressToReadHex = 0x0, lastPhysicalAddressToReadHex = 0x1e): Promise<void> {
        const ramCellsHTMLElement: HTMLElement | null = this._document.getElementById("physical-ram-cells");
        if (!ramCellsHTMLElement) {
            return;
        }
        if (ramCellsHTMLElement.innerText !== "") {
            ramCellsHTMLElement.innerText = "";
            // Disconnect obersever, which results in no element beeing observed. 
            this._physicalRAMObserver.disconnect();
            this._listOfVisiblePhysicalRAMGuiElements = new Array<Element>();
        }
        const ramCells: Map<number, number> = await this._window.mainMemory.readRangeFromPhysicalMemory(firstPhysicalAddressToReadHex, lastPhysicalAddressToReadHex);
        for (const [physicalAddress, binaryContent] of Array.from(ramCells).reverse()) {
            const element: HTMLElement = this.createPhysicalRAMGuiElement("0x" + physicalAddress.toString(16), binaryContent.toString(2).padStart(8, "0"));
            ramCellsHTMLElement.appendChild(element);
            this._listOfVisiblePhysicalRAMGuiElements.push(element);
            this._physicalRAMObserver.observe(element);
        }
        // Jump to lowest available address to prevent endless scrolling.
        this._document.querySelector(`[data-physical-address="${"0x" + firstPhysicalAddressToReadHex.toString(16)}"]`)!.scrollIntoView();
        return;
    }

    /**
     * This method initializes the view of the virtual RAM by reading the first twenty entries of the main memory 
     * and creating HTMLElements, which represents the individual RAM cells.
     * @param [firstVirtualAddressToReadHex=0x0] The first virtual memory address to read from main memory in hexadecimal representation.
     * @param [lastVirtualAddressToReadHex=0x1e] The last virtual memory address to read from main memory in hexadecimal representation.
     */
    public async createVirtualRAMView(firstVirtualAddressToReadHex = 0x0, lastVirtualAddressToReadHex = 0x1e): Promise<void> {
        const ramCellsHTMLElement: HTMLElement | null = this._document.getElementById("virtual-ram-cells");
        if (!ramCellsHTMLElement) {
            return;
        }
        if (ramCellsHTMLElement.innerText !== "") {
            ramCellsHTMLElement.innerText = "";
            // Disconnect obersever, which results in no element beeing observed. 
            this._virtualRAMObserver.disconnect();
            this._listOfVisibleVirtualRAMGuiElements = new Array<Element>();
        }
        const ramCells: Map<number, number | undefined> = await this._window.mainMemory.readRangeFromVirtualMemory(firstVirtualAddressToReadHex, lastVirtualAddressToReadHex);
        for (const [virtualAddress, binaryContent] of Array.from(ramCells).reverse()) {
            const element: HTMLElement = this.createVirtualRAMGuiElement("0x" +  virtualAddress.toString(16), binaryContent === undefined ? "Not Mapped" : binaryContent.toString(2).padStart(8, "0"));
            ramCellsHTMLElement.appendChild(element);
            this._listOfVisibleVirtualRAMGuiElements.push(element);
            this._virtualRAMObserver.observe(element);
        }
        // Jump to lowest available address to prevent endless scrolling.
        this._document.querySelector(`[data-virtual-address="${"0x" + firstVirtualAddressToReadHex.toString(16)}"]`)!.scrollIntoView();
        return;
    }

    /**
     * This method creates an HTMLElement representing a physical RAM cell. This element consist out of a label with the 
     * pyhsical memory address and the binary content of the main memory at this address.
     * @param physicalAddressHexString The physical memory address of the RAM cell.
     * @param binaryStringContent The binary content of this RAM cell.
     * @returns A HTMLElement representing a RAM cell.
     */
    public createPhysicalRAMGuiElement(physicalAddressHexString: string, binaryStringContent: string): HTMLElement {
        const outerDivElement: HTMLElement = this._document.createElement("div");
        outerDivElement.setAttribute("class", "ram-cell widget");
        outerDivElement.setAttribute("id", `physical-ram-cell-${physicalAddressHexString}`);
        outerDivElement.setAttribute("data-physical-address", physicalAddressHexString);
        const labelDivElement: HTMLElement = this._document.createElement("label");
        labelDivElement.setAttribute("class", "lg-text");
        labelDivElement.innerHTML = physicalAddressHexString;
        const contendivivElement: HTMLElement = this._document.createElement("div");
        contendivivElement.setAttribute("class", "ram-cell-content");
        contendivivElement.setAttribute("name", "ram-cell-content");
        contendivivElement.innerText = binaryStringContent;
        outerDivElement.appendChild(labelDivElement);
        outerDivElement.appendChild(contendivivElement);
        return outerDivElement;
    }

    /**
     * This method creates an HTMLElement representing a virtual RAM cell. This element consist out of a label with the 
     * pyhsical memory address and the binary content of the main memory at this address.
     * @param virtualAddressHexString The virtual memory address of the RAM cell.
     * @param binaryStringContent The binary content of this RAM cell.
     * @returns A HTMLElement representing a RAM cell.
     */
    public createVirtualRAMGuiElement(virtualAddressHexString: string, binaryStringContent: string): HTMLElement {
        const outerDivElement: HTMLElement = this._document.createElement("div");
        outerDivElement.setAttribute("class", "ram-cell widget");
        outerDivElement.setAttribute("id", `virtual-ram-cell-${virtualAddressHexString}`);
        outerDivElement.setAttribute("data-virtual-address", virtualAddressHexString);
        const labelDivElement: HTMLElement = this._document.createElement("label");
        labelDivElement.setAttribute("class", "lg-text");
        labelDivElement.innerHTML = virtualAddressHexString;
        const contendivivElement: HTMLElement = this._document.createElement("div");
        contendivivElement.setAttribute("class", "ram-cell-content");
        contendivivElement.setAttribute("name", "ram-cell-content");
        contendivivElement.innerText = binaryStringContent;
        outerDivElement.appendChild(labelDivElement);
        outerDivElement.appendChild(contendivivElement);
        return outerDivElement;
    }

    /**
     * This method creates a GUI element, which represents an entry of the Page Table.
     * @param pageNumberDecString The virtual page address, which is often refered to as the pages number.
     * @param presentFlag This flag indicates whether the page is currently mounted to a page frame.
     * @param writableFlag This flag indicates whether the page is writable or read-only.
     * @param executableFlag This flag indicates whether the page is executable or not.
     * @param accessableOnlyInKernelModeFlag This flag indicates whether the page can only be accessed in kernel mode.
     * @param pinnedFlag This flag indicates whether the page is protected against attempts to write it to a background memory.
     * @param changedFlag This flag indicates whether the page was changed since it was mounted to a page frame.
     * @param pageFrameNumberDecString The physical page frame address, which is often refered to as the page frames number.
     * @returns An GUI element representing a single Page Table entry.
     */
    public createPageTableEntryElement(
        pageNumberDecString: string,
        presentFlag: boolean,
        writableFlag: boolean,
        executableFlag: boolean,
        accessableOnlyInKernelModeFlag: boolean,
        pinnedFlag: boolean,
        changedFlag: boolean,
        pageFrameNumberDecString: string
    ): HTMLElement {
        const trElement: HTMLElement = this._document.createElement("tr");
        trElement.setAttribute("class", "page-table-entry");
        trElement.setAttribute("data-page-number", `${pageNumberDecString}`);
        const tdElementPageNumber: HTMLElement = this._document.createElement("td");
        tdElementPageNumber.innerText = pageFrameNumberDecString;
        const tdElementPresent: HTMLElement = this._document.createElement("td");
        tdElementPresent.innerText = (presentFlag) ? "true" : "false";
        const tdElementWritable: HTMLElement = this._document.createElement("td");
        tdElementWritable.innerText = (writableFlag) ? "true" : "false";
        const tdElementExecutable: HTMLElement = this._document.createElement("td");
        tdElementExecutable.innerText = (executableFlag) ? "true" : "false";
        const tdElementAccessableOnlyInKernelMode: HTMLElement = this._document.createElement("td");
        tdElementAccessableOnlyInKernelMode.innerText = (accessableOnlyInKernelModeFlag) ? "true" : "false";
        const tdElementPinned: HTMLElement = this._document.createElement("td");
        tdElementPinned.innerText = (pinnedFlag) ? "true" : "false";
        const tdElementChanged: HTMLElement = this._document.createElement("td");
        tdElementChanged.innerText = (changedFlag) ? "true" : "false";
        const tdElementPageFrameNumber: HTMLElement = this._document.createElement("td");
        tdElementPageFrameNumber.innerText = pageFrameNumberDecString;
        trElement.appendChild(tdElementPageNumber);
        trElement.appendChild(tdElementPresent);
        trElement.appendChild(tdElementWritable);
        trElement.appendChild(tdElementExecutable);
        trElement.appendChild(tdElementAccessableOnlyInKernelMode);
        trElement.appendChild(tdElementPinned);
        trElement.appendChild(tdElementChanged);
        trElement.appendChild(tdElementPageFrameNumber);
        return trElement;
    }

    /**
     * This method initializes the view of the Page Table reading the first thirty entries of the Page Table
     * and creats GUI elements, which represents the individual entries.
     * @param [firstPageNumberToRead=0] The first page number to read from Page Table.
     * @param [lastPageNumberToRead=30] The last page number to read from Page Table.
     */
    public async createPageTableView(firstPageNumberToRead = 0, lastPageNumberToRead = 30): Promise<void> {
        const pageTableEntiresElement: HTMLElement | null = this._document.getElementById("page-table-entries");
        if (pageTableEntiresElement === null) {
            return;
        }
        if (pageTableEntiresElement.innerText !== "") {
            pageTableEntiresElement.innerHTML = "";
            // Disconnect obersever, which results in no element beeing observed.
            this._pageTableObserver.disconnect();
            this._listOfVisiblePageTableEntries = new Array<Element>();
        }
        const pageTableEntries: Map<number, number> =
            await this._window.mainMemory.readPageTableEntries(firstPageNumberToRead, lastPageNumberToRead);
        for (const [pageNumber, pageTableEntry] of Array.from(pageTableEntries).reverse()) {
            const presentFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(0, 1) === "1") ? true : false;
            const writableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(1, 2) === "1") ? true : false;
            const executableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(2, 3) === "1") ? true : false;
            const accessableOnlyInKernelModeFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(3, 4) === "1") ? true : false;
            const pinnedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(4, 5) === "1") ? true : false;
            const changedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(5, 6) === "1") ? true : false;
            const pageFrameNumberHexString = `0x${parseInt(pageTableEntry.toString(2).padStart(32, "0").slice(-Renderer.NUMBER_BITS_PAGE_FRAME_ADDRESS), 2)}`;
            const element: HTMLElement = this.createPageTableEntryElement(
                "0x" + pageNumber.toString(16),
                presentFlag,
                writableFlag,
                executableFlag,
                accessableOnlyInKernelModeFlag,
                pinnedFlag,
                changedFlag,
                pageFrameNumberHexString
            );
            pageTableEntiresElement.appendChild(element);
            this._listOfVisiblePageTableEntries.push(element);
            this._pageTableObserver.observe(element);
        }
        // Jump to lowest available address to prevent endless scrolling.
        this._document.querySelector(`[data-page-number="${"0x" + firstPageNumberToRead.toString(16)}"]`)!.scrollIntoView();
        return;
    }

    /**
     * This method reloads the view of the Page Table depending on the visible Page Table entries.
     */
    public async reloadPageTableView(): Promise<void> {
        const pageTableEntiresElement: HTMLElement | null = this._document.getElementById("page-table-entries");
        if (pageTableEntiresElement === null) {
            return;
        }
        if (pageTableEntiresElement.innerText !== "") {
            pageTableEntiresElement.innerHTML = "";
            // Disconnect obersever, which results in no element beeing observed.
            this._pageTableObserver.disconnect();
        }
        // Read physical memory address from the last element, which should have the lowest visible memory address.
        const firstPageNumberToRead: number =
            parseInt(this._listOfVisiblePageTableEntries.at(this._listOfVisiblePageTableEntries.length - 1)!.getAttribute("data-page-number")!);
        // Read physical memory address from the first element, which should have the highest visible memory adress.
        const lastPageNumberToRead: number = parseInt(this._listOfVisiblePageTableEntries.at(0)!.getAttribute("data-page-number")!);
        const ramCells: Map<number, number> =
            await this._window.mainMemory.readPageTableEntries(firstPageNumberToRead, lastPageNumberToRead);
        for (const [pageNumber, pageTableEntry] of Array.from(ramCells).reverse()) {
            const presentFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(0, 1) === "1") ? true : false;
            const writableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(1, 2) === "1") ? true : false;
            const executableFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(2, 3) === "1") ? true : false;
            const accessableOnlyInKernelModeFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(3, 4) === "1") ? true : false;
            const pinnedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(4, 5) === "1") ? true : false;
            const changedFlag: boolean = (pageTableEntry.toString(2).padStart(32, "0").slice(5, 6) === "1") ? true : false;
            const pageFrameNumberHexString = `0x${parseInt(pageTableEntry.toString(2).padStart(32, "0").slice(-Renderer.NUMBER_BITS_PAGE_FRAME_ADDRESS), 2)}`;
            const element: HTMLElement = this.createPageTableEntryElement(
                "0x" + pageNumber.toString(16),
                presentFlag,
                writableFlag,
                executableFlag,
                accessableOnlyInKernelModeFlag,
                pinnedFlag,
                changedFlag,
                pageFrameNumberHexString
            );
            pageTableEntiresElement.appendChild(element);
            this._listOfVisiblePageTableEntries.push(element);
            this._pageTableObserver.observe(element);
        }
        // Jump to lowest available address to prevent endless scrolling.
        this._document.querySelector(`[data-page-number="${"0x" + firstPageNumberToRead.toString(16)}"]`)!.scrollIntoView();
        return;
    }

    /**
     * This method reads the content of the EAX register.
     */
    public async readEAX(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readEAX(radix);
        if (this._eax !== null) {
            this._eax.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the EBX register.
     */
    public async readEBX(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readEBX(radix);
        if (this._ebx !== null) {
            this._ebx.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the ECX register.
     */
    public async readECX(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readECX(radix);
        if (this._ecx !== null) {
            this._ecx.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the ECX register.
     */
    public async readEDX(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readEDX(radix);
        if (this._edx !== null) {
            this._edx.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the FLAGS register.
     */
    public async readFLAGS(): Promise<void> {
        const content: string = await this._window.simulator.readFLAGS();
        if (this._flags !== null) {
            this._flags.children.namedItem("register-content")!.textContent = content;
        }
        const bodyElement: HTMLElement = this._document.getElementsByTagName("body")[0];
        // Check if kernel mode is enabled.
        if (content[0] === "1" && content[1] === "1") {
            // Kernel mode is enabled. Display pulse animation.
            bodyElement.classList.add("pulse");
        } else {
            // Kernel mode is not enabled. Remove pulse animation.
            bodyElement.classList.remove("pulse");
        }
        return;
    }

    /**
     * This method reads the content of the EIR register.
     */
    public async readEIR(): Promise<void> {
        const content: string = await this._window.simulator.readEIR();
        if (this._eir !== null) {
            this._eir.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the NPTP register.
     */
    public async readNPTP(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readNPTP(radix);
        if (this._nptp !== null) {
            this._nptp.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the VMPTR register.
     */
    public async readVMPTR(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readVMPTR(radix);
        if (this._vmptr !== null) {
            this._vmptr.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the ESP register.
     */
    public async readESP(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readESP(radix);
        if (this._esp !== null) {
            this._esp.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the ITP register.
     */
    public async readITP(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readITP(radix);
        if (this._itp !== null) {
            this._itp.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the GPTP register.
     */
    public async readGPTP(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readGPTP(radix);
        if (this._gptp !== null) {
            this._gptp.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method reads the content of the PTP register.
     */
    public async readPTP(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readPTP(radix);
        if (this._ptp !== null) {
            this._ptp.children.namedItem("register-content")!.textContent = content;
        }
        return;
    }

    /**
     * This method highlights a row in the RAM display element. If it is a virtual address it gets translated to a physical address first.
     * @param targetAddress The target address to highlight.
     * @param isVirtualAddress Is the target address a virtual address or a physical address.
     */
    public async highlightRamElement(targetAddress: number, isVirtualAddress: boolean = false): Promise<void> {
        const inputBoxStart: HTMLInputElement = this._document.getElementById("ram-input-box-start") as HTMLInputElement;
        const inputBoxEnd: HTMLInputElement = this._document.getElementById("ram-input-box-end") as HTMLInputElement;
        const detailedRAMViewTable = this._document.getElementById("ram-table") as HTMLTableCellElement;
        const tableBody = detailedRAMViewTable.getElementsByTagName('tbody')[0];
        
        let physicalAddress = targetAddress;
        if (isVirtualAddress) {
            physicalAddress = await this._window.mainMemory.translateVirtualAddress(DoubleWord.fromNumber(Number(targetAddress)));
        }

        const blocksBefore: number = this.ramDataRepresentation === "ASCII" ? 5 : Math.min(5, Math.floor(physicalAddress / this.ramBlockSize));
        const blocksAfter: number = this.ramDataRepresentation === "ASCII" ? 12 : 6;

        let startAddress = physicalAddress - (blocksBefore * this.ramBlockSize);
        const endAddress = physicalAddress + (blocksAfter * this.ramBlockSize) - 1;
        if (startAddress < 0) {
            startAddress = 0;
        }
        inputBoxStart.value = "0x" + startAddress.toString(16);
        inputBoxEnd.value = "0x" + endAddress.toString(16);
        this.ramViewStartAddress = startAddress;
        this.ramViewEndAddress = endAddress;
        const targetAddressIndex: number = await this.createUpdateDetailedRamViewTable(this.ramViewStartAddress, this.ramViewEndAddress, physicalAddress);
        const rowIndex = this.ramDataRepresentation === "ASCII" ? targetAddressIndex : blocksBefore;
        console.log(rowIndex + " index")
        console.log(targetAddressIndex + " target address index")
        const tableRow = tableBody.rows[rowIndex];
        for (const cell of tableRow.cells) {
            cell.classList.add("highlighted");
        }
    }

    /**
     * This method jumps to a virtual memory address and highlights the GUI element in the "Virtual RAM" view representing the memory address.
     * @param ramAddress The virtual memory address to highlight and scroll to.
     * @param dataRepresentationRegister The number system the memory address is represented in.
     */
    public async jumpToVirtualRamElement(ramAddress: string, dataRepresentationRegister: NumberSystem): Promise<void> {
        let virtualAddressHexString = "";
        if (dataRepresentationRegister === NumberSystem.HEX) {
            virtualAddressHexString = ramAddress;
        } else if (dataRepresentationRegister === NumberSystem.DEC) {
            virtualAddressHexString = `0x${parseInt(ramAddress, 10).toString(16)}`;
        } else {
            ramAddress = ramAddress.replace(/[\s]+/g, "");
            virtualAddressHexString = `0x${parseInt(ramAddress, 2).toString(16)}`;
        }
        // Remove CSS class "highlighted" from any other HTML element(s).
        for (const element of this._document.querySelectorAll(`div[data-physical-address]`)) {
            if (element.classList.contains("highlighted")) {
                element.classList.remove("highlighted");
            }
        }
        for (const element of this._document.querySelectorAll(`div[data-virtual-address]`)) {
            if (element.classList.contains("highlighted")) {
                element.classList.remove("highlighted");
            }
        }
        // Find HTML element representing the loaded virtual memory address.
        let element: Element | null = this._document.querySelector<Element>(`[data-virtual-address="${virtualAddressHexString}"]`);
        /**
         *  Check if automatic scroll for the virtual memory widget is enabled.
         */
        if (this.autoScrollForVirtualRAMEnabled && this.programLoaded) {
            // Check if a GUI element, representing a virtual memory address, is currently present in the document
            if (element === null) {
                // Element is not present in document. Load it (alongside 30 addresses above and beneath) into the document.
                let firstVirtualAddressToReadDec: number = parseInt(virtualAddressHexString, 16) - 15;
                let lastVirtualAddressToReadDec: number = parseInt(virtualAddressHexString, 16) + 14;
                if (firstVirtualAddressToReadDec <= 0) {
                    firstVirtualAddressToReadDec = 0;
                }
                if (lastVirtualAddressToReadDec >= Renderer.HIGH_ADDRESS_PHYSICAL_MEMORY_DEC) {
                    lastVirtualAddressToReadDec = Renderer.HIGH_ADDRESS_PHYSICAL_MEMORY_DEC;
                }
                await this.createVirtualRAMView(firstVirtualAddressToReadDec, lastVirtualAddressToReadDec);
                element = this._document.querySelector<Element>(`[data-virtual-address="${virtualAddressHexString}"]`);
            }
            if (element !== null) {
                // Scroll this element into view.
                element.scrollIntoView();
            }
        }
        if (element !== null) {
            // Emphesize this element.
            element.classList.add("highlighted");
        }
    }

    /**
     * This method jumps to a physical memory address and highlights the GUI element in the "Physical RAM" view representing the memory address.
     * @param ramAddress The physical memory address to highlight and scroll to.
     * @param dataRepresentationRegister The number system the memory address is represented in.
     */
    public async jumpToPhysicalRamElement(ramAddress: string, dataRepresentationRegister: NumberSystem): Promise<void> {
        let physicalAddressHexString = "";
        if (dataRepresentationRegister === NumberSystem.HEX) {
            physicalAddressHexString = ramAddress;
        } else if (dataRepresentationRegister === NumberSystem.DEC) {
            physicalAddressHexString = `0x${parseInt(ramAddress, 10).toString(16)}`;
        } else {
            ramAddress = ramAddress.replace(/[\s]+/g, "");
            physicalAddressHexString = `0x${parseInt(ramAddress, 2).toString(16)}`;
        }
        // Remove CSS class "highlighted" from any other HTML element(s).
        for (const element of this._document.querySelectorAll(`div[data-physical-address]`)) {
            if (element.classList.contains("highlighted")) {
                element.classList.remove("highlighted");
            }
        }
        for (const element of this._document.querySelectorAll(`div[data-virtual-address]`)) {
            if (element.classList.contains("highlighted")) {
                element.classList.remove("highlighted");
            }
        }
        // Find HTML element representing the loaded physical memory address.
        let element: Element | null = this._document.querySelector<Element>(`[data-physical-address="${physicalAddressHexString}"]`);
        /**
         *  Check if automatic scroll for the physical memory widget is enabled.
         */
        if (this.autoScrollForPhysicalRAMEnabled) {
            // Check if a GUI element, representing a physical memory address, is currently present in the document
            if (element === null) {
                // Element is not present in document. Load it (alongside 30 addresses above and beneath) into the document.
                let firstPhysicalAddressToReadDec: number = parseInt(physicalAddressHexString, 16) - 15;
                let lastPhysicalAddressToReadDec: number = parseInt(physicalAddressHexString, 16) + 14;
                if (firstPhysicalAddressToReadDec <= 0) {
                    firstPhysicalAddressToReadDec = 0;
                }
                if (lastPhysicalAddressToReadDec >= Renderer.HIGH_ADDRESS_PHYSICAL_MEMORY_DEC) {
                    lastPhysicalAddressToReadDec = Renderer.HIGH_ADDRESS_PHYSICAL_MEMORY_DEC;
                }

                await this.createPhysicalRAMView(firstPhysicalAddressToReadDec, lastPhysicalAddressToReadDec);
                element = this._document.querySelector<Element>(`[data-physical-address="${physicalAddressHexString}"]`);
            }
            if (element !== null) {
                // Scroll this element into view.
                element.scrollIntoView();
            }
        }
        if (element !== null) {
            // Emphesize this element.
            element.classList.add("highlighted");
        }
    }

    /**
     * This method reads the content of the EIP register.
     */
    public async readEIP(radix: NumberSystem): Promise<void> {
        const content: string = await this._window.simulator.readEIP(radix);
        const hexContent: string = await this._window.simulator.readEIP(NumberSystem.HEX);
        const physicalAddress: DoubleWord = await this._window.mainMemory.translateVirtualAddress(DoubleWord.fromNumber(Number(hexContent)));
        if (this._eip !== null) {
            this._eip.children.namedItem("register-content")!.textContent = content;
            console.log(hexContent + " hex content")
            console.log(parseInt(hexContent, 16) + " parsed hex content")
            await this.highlightRamElement(physicalAddress);
            
        }
        return;
    }

    /**
     * Performs the next CPU cycle (fetch, decode, execute).
     */
    public async cycle(): Promise<void> {
        if (!this.programLoaded) {
            alert("No programm is currently loaded!");
            return;
        }
        if (!await this._window.simulator.nextCycle()) {
            //alert("Programm finished execution.");
        }
        await this.reloadPhysicalRAMView();
        await this.reloadVirtualRAMView();
        // TODO: Fix bug!
        // await this.reloadPageTableView();
        await this.readEAX(this.dataRepresentationEAX);
        await this.readEBX(this.dataRepresentationEBX);
        await this.readECX(this.dataRepresentationECX);
        await this.readEDX(this.dataRepresentationEDX);
        await this.readFLAGS();
        await this.readEIP(this.dataRepresentationEIP);
        // TODO: Hide until a new place for the GUI element, representing the EIR register, is found.
        // await renderer.readEIR();
        await this.readESP(this.dataRepresentationESP);
        await this.readPTP(this.dataRepresentationPTP);
        await this.readGPTP(this.dataRepresentationGPTP);
        await this.readITP(this.dataRepresentationITP);
        await this.readNPTP(this.dataRepresentationNPTP);
        await this.readVMPTR(this.dataRepresentationVMPTR);
        //await this.createUpdateDetailedRamViewTable(this.ramViewStartAddress, this.ramViewEndAddress);
        return;
    }


    public async clearLog(): Promise<void> {
        const log: HTMLElement | null = document.getElementById("log");
        if (log !== null) {
            log.children.namedItem("log-content")!.textContent = "";
        }
        return;
    }

    /**
     * This method updates the log-widget with a message.
     * @param message The message that gets appended to the log-widget. 
     */
    public async updateLog(message: string): Promise<void> {
        const log: HTMLElement | null = document.getElementById("log");
        if (log !== null) {
            log.children.namedItem("log-content")!.insertAdjacentElement("beforeend", document.createElement("br"));
            log.children.namedItem("log-content")!.insertAdjacentText("beforeend", message);
            log.children.namedItem("log-content")!.scrollTop = log.children.namedItem("log-content")!.scrollHeight;
        }
        return;
    }

    public async hideLog(): Promise<void> {
        const log: HTMLElement | null = document.getElementById("log-section");
        if (log !== null) {
            log.style.display = "none";
        }
        return;
    }

    public async showLog(): Promise<void> {
        const logSection: HTMLElement | null = document.getElementById("log-section");
        const log: HTMLElement | null = document.getElementById("log");
        if (logSection && log !== null) {
            logSection.style.display = "block";
            log.children.namedItem("log-content")!.scrollTop = log.children.namedItem("log-content")!.scrollHeight;
        }
        return;
    }

    /**
     * This method builds the table rows for the RAM display element, displaying the content as numerical values.
     * @param physicalAddressStart The start address of the display range.
     * @param physicalAddressEnd The end address of the display range.
     * @param ramTableBody The table body element that is used to display the RAM view.
     */
    public async createRamViewRowsNumeric(physicalAddressStart: number, physicalAddressEnd: number, ramTableBody: HTMLTableSectionElement): Promise<void> {
        let tableRow: HTMLTableRowElement = this._document.createElement("tr");     
        let physicalAddressColumn = tableRow.insertCell();
        let virtualAddressColumn = tableRow.insertCell();

        const ramCells: Map<number, number> = await this._window.mainMemory.readRangeFromPhysicalMemory(physicalAddressStart, physicalAddressEnd);

        for (let [index,[physicalAddress, ramCellContent]] of Array.from(ramCells).entries()) {
            //Create Byte cells in the row and fill with data.
            const byteData = tableRow.insertCell();
            switch (this.ramDataRepresentation) {
                case "BIN":
                    byteData.innerHTML = ramCellContent.toString(2).padStart(8, "0");
                    break;
                case "DEC":
                    byteData.innerHTML = ramCellContent.toString(10);
                    break;
                case "HEX":
                    byteData.innerHTML = `0x${ramCellContent.toString(16)}`;
                    break;
            }
            
            const virtualAddresses: DoubleWord[] = await this.reverseMemoryMapSearch(physicalAddress);
            for (const virtualAddress of virtualAddresses) {
                virtualAddressColumn.append(`0x${virtualAddress.toString(16)}`);
                const rowBreak: HTMLBRElement = this._document.createElement("br");
                virtualAddressColumn.appendChild(rowBreak);
            }

            //If one row is completed, depending on ram block size, push the row and create a new one.
            if ((index + 1) % this.ramBlockSize === 0) {
                const startAddressString: string = `0x${(physicalAddress - (this.ramBlockSize - 1)).toString(16)}`;
                const endAddressString: string = `0x${physicalAddress.toString(16)}`;
                if (this.ramBlockSize === 1) {
                    physicalAddressColumn.innerHTML = endAddressString;
                } else {
                    physicalAddressColumn.innerHTML = `${startAddressString} - ${endAddressString}`;
                }
                ramTableBody.appendChild(tableRow);
                tableRow = this._document.createElement("tr");
                physicalAddressColumn = tableRow.insertCell();
                virtualAddressColumn = tableRow.insertCell();
            }
        }
    }

    /**
     * This method builds the table rows for the RAM display element, displaying the content as characters.
     * @param physicalAddressStart The start address of the display range.
     * @param physicalAddressEnd The end address of the display range.
     * @param ramTableBody The table body element that is used to display the RAM view.
     * @param targetAddress An address to find the row index for inside the table body.
     * @returns The row index of the target address in the table body.
     */
    public async createRamViewRowsAscii(physicalAddressStart: number, physicalAddressEnd: number, ramTableBody: HTMLTableSectionElement, targetAddress: number = 0): Promise<number> {
        const masks = [0b1000_0000, 0b1110_0000, 0b1111_0000, 0b1111_1000];
        const templates = [0b0000_0000, 0b1100_0000, 0b1110_0000, 0b1111_0000];
        const ramCells: Map<number, number> = await this._window.mainMemory.readRangeFromPhysicalMemory(physicalAddressStart, physicalAddressEnd);
        const ramContent = Uint8Array.from(ramCells.values());
        const utf8decoder = new TextDecoder("UTF-8");
        let targetAddressIndex:number = 0;
        let characterCounter: number = 0;

        for (let i = 0; i < ramContent.length;) {
            const tableRow: HTMLTableRowElement = this._document.createElement("tr");
            let characterSize = 1;
            //Find out size of utf8 character in byte
            for (let j = 0; j < 4; ++j) {
                const charMasked = (ramContent[i] & masks[j]);
                if (charMasked === templates[j]) {
                    characterSize = (j +1);
                    break;
                }
            }
            const character = ramContent.slice(i, (i + characterSize));
            const characterString = utf8decoder.decode(character);
            const physicalAddressColumn = tableRow.insertCell();
            const virtualAddressColumn = tableRow.insertCell();
            if (characterSize === 1) {
                if ((physicalAddressStart + i) === targetAddress) {
                    targetAddressIndex = characterCounter;
                }
                ++characterCounter;
                physicalAddressColumn.innerHTML = "0x" + (physicalAddressStart + i).toString(16);
                const virtualAddresses: DoubleWord[] = await this.reverseMemoryMapSearch(physicalAddressStart + i);
                for (const virtualAddress of virtualAddresses) {
                    virtualAddressColumn.append(`0x${virtualAddress.toString(16)}`);
                    const rowBreak: HTMLBRElement = this._document.createElement("br");
                    virtualAddressColumn.appendChild(rowBreak);
                }
            } else {
                const address: number = (physicalAddressStart + i + (characterSize - 1));
                const endAddress: number = address < physicalAddressEnd ? address : physicalAddressEnd;
                const startAddress: number = physicalAddressStart + i;
                physicalAddressColumn.innerHTML = `0x${(physicalAddressStart + i).toString(16)} - 0x${(endAddress).toString(16)}`;

                const virtualAddressesStart: DoubleWord[] = await this.reverseMemoryMapSearch(physicalAddressStart + i);
                const VirtualAddressesEnd: DoubleWord[] = await this.reverseMemoryMapSearch(endAddress);
                if (targetAddress >= startAddress && targetAddress <= endAddress) {
                    targetAddressIndex = characterCounter;
                }
                ++characterCounter;
                for (let i = 0; i < virtualAddressesStart.length; i++) {
                    const virtualAddressFrom = "0x" + virtualAddressesStart[i].toString(16);
                    const virtualAddressTo= "0x" + VirtualAddressesEnd[i].toString(16);
                    virtualAddressColumn.append(virtualAddressFrom + " - " + virtualAddressTo);
                    const rowBreak: HTMLBRElement = this._document.createElement("br");
                    virtualAddressColumn.appendChild(rowBreak);
                }
            }            
            const stringCell = tableRow.insertCell();
            stringCell.innerHTML = characterString;
            ramTableBody.appendChild(tableRow);
            i += characterSize;
        }
        return targetAddressIndex;
    }

    /**
     * This method builds the table rows for the RAM display element, displaying the content as assembly instructions
     * @param physicalAddressStart The start address of the display range.
     * @param physicalAddressEnd The end address of the display range.
     * @param ramTableBody The table body element that is used to display the RAM view.
     */
    public async createRamViewRowsAssembly(physicalAddressStart: number, physicalAddressEnd: number, ramTableBody: HTMLTableSectionElement): Promise<void> {
        const ramCells: Map<number, Byte> = await this._window.mainMemory.readRangeFromPhysicalMemory(physicalAddressStart, physicalAddressEnd);
        const ramContent: Array<Byte> = Array.from(ramCells.values());
        for (let i = 0; i < ramContent.length;) {
            const tableRow: HTMLTableRowElement = this._document.createElement("tr");
            const binary = ramContent.slice(i, (i + this.ramBlockSize));
            let instructionString = await this.getInstructionText(binary);

            const physicalAddressColumn = tableRow.insertCell();
            const virtualAddressColumn = tableRow.insertCell();
            const assemblyInstruction = tableRow.insertCell();

            const virtualAddressesStart: DoubleWord[] = await this.reverseMemoryMapSearch(physicalAddressStart + i);
            const VirtualAddressesEnd: DoubleWord[] = await this.reverseMemoryMapSearch(physicalAddressStart + i + (this.ramBlockSize - 1));

            for (let i = 0; i < virtualAddressesStart.length; i++) {
                const virtualAddressFrom = "0x" + virtualAddressesStart[i].toString(16);
                const virtualAddressTo= "0x" + VirtualAddressesEnd[i].toString(16);
                virtualAddressColumn.append(virtualAddressFrom + " - " + virtualAddressTo);
                const rowBreak: HTMLBRElement = this._document.createElement("br");
                virtualAddressColumn.appendChild(rowBreak);
            }

            const addressFrom = "0x" + (physicalAddressStart + i).toString(16);
            const addressTo = "0x" + (physicalAddressStart + i + (this.ramBlockSize - 1)).toString(16);
            physicalAddressColumn.innerHTML = addressFrom + " - " + addressTo;
            assemblyInstruction.innerHTML = instructionString;
            ramTableBody.appendChild(tableRow);
            i += this.ramBlockSize;
        }
    }

    /**
     * This method creates the table header for the RAM display.
     * @param dataMode The data representation mode.
     */
    public createTableHeader(dataMode: string): void {
        const detailedRAMViewTable = this._document.getElementById("ram-table") as HTMLTableCellElement;
        const tableHead = detailedRAMViewTable.getElementsByTagName('thead')[0];
        tableHead.innerHTML = "";
        const tableRow = tableHead.insertRow();
        const physicalAddressHead = tableRow.insertCell();
        physicalAddressHead.innerHTML = "Physical Address";
        const virtualAddressHead = tableRow.insertCell();
        virtualAddressHead.innerHTML = "Virtual Address";

        if (dataMode === "HEX" || dataMode === "BIN" || dataMode === "DEC") {
            for (let i = 0; i < this.ramBlockSize; ++i) {
                const byteHead = tableRow.insertCell();
                byteHead.innerHTML = `Byte ${i}`;
            }
        } else if (dataMode === "ASCII") {
            const characterHead = tableRow.insertCell();
            characterHead.innerHTML = "Char"
        } else if (dataMode === "ASSEMBLY") {
            const instructionHead = tableRow.insertCell();
            instructionHead.innerHTML = "Assembly Instruction";
        }
        
    }

    /**
     * This method creates or updates the RAM view GUI element.
     * @param physicalStartAddress The start address of the display range.
     * @param physicalEndAddress The end address of the display range.
     * @param targetAddress An address to find the row index for inside the table body.
     * @returns The row index of the target address in the table body.
     */
    public async createUpdateDetailedRamViewTable(physicalStartAddress: number, physicalEndAddress: number, targetAddress: number = 0): Promise<number> {
        const dataMode: string = this.ramDataRepresentation;
        this.createTableHeader(dataMode);
        const detailedRAMViewTable = this._document.getElementById("ram-table") as HTMLTableCellElement;
        const tableBody = detailedRAMViewTable.getElementsByTagName('tbody')[0];
        tableBody.innerHTML = "";
        let targetAddressIndex: number = 0;

        if (dataMode === "HEX" || dataMode === "BIN" || dataMode === "DEC") {
            await this.createRamViewRowsNumeric(physicalStartAddress, physicalEndAddress,tableBody);
        } else if (dataMode === "ASCII") {
            targetAddressIndex = await this.createRamViewRowsAscii(physicalStartAddress, physicalEndAddress, tableBody, targetAddress);
        } else if (dataMode === "ASSEMBLY") {
            await this.createRamViewRowsAssembly(physicalStartAddress, physicalEndAddress, tableBody);
        }
        return targetAddressIndex;
    }

    /**
     * This method translates assembly instructions back to the human readable format.
     * @param instructions Assembly instructions in form of a byte array.
     * @returns An array of human readable assembly instructions.
     */
    public async getInstructionText(instructions: Array<Byte>): Promise<string> {
        const instruction = DoubleWord.fromBytes(instructions[0], instructions[1], instructions[2], instructions[3]);

        const type: string = InstructionTypes[DoubleWord.getBitRange(instruction, 0, 3)];
        const operation: string =  Instructions[DoubleWord.getBitRange(instruction, 5, 12)];

        if (type === undefined || operation === undefined) {
            return "UNKNOWN";
        }
        let assemblyString = operation;
        
        const addrModeFirstOp: number =  DoubleWord.getBitRange(instruction, 14, 16);
        const firstOpType: number =  DoubleWord.getBitRange(instruction, 16, 23);

        if (addrModeFirstOp === undefined || firstOpType === undefined) {
            return "UNKNOWN";
        } else if (firstOpType === OperandTypes.NO) {
            return assemblyString;
        }

        const firstOperand = DoubleWord.fromBytes(instructions[4], instructions[5], instructions[6], instructions[7]);
        
        if (operation === "INT") {
            assemblyString += " " + InterruptNumbers[firstOperand];
        } else if (operation === "DEV") {
            assemblyString += " " + DevOperations[firstOperand];
        } else if (firstOpType === OperandTypes.IMMEDIATE ) {
            assemblyString += " $0x" + firstOperand.toString(16);
        } else if (firstOpType === OperandTypes.MEMORY_ADDRESS) {
            assemblyString += " @0x" + firstOperand.toString(16);
        } else {
            const registerName: string = RegisterNumbers[firstOperand];
            if (registerName === undefined) {
                return "UNKNOWN"
            }
            if (addrModeFirstOp === AddressingModes.INDIRECT) {
                assemblyString += " *%" + registerName;
            } else {
                assemblyString += " %" + registerName;
            }
        }
        
        const addrModeSecondOp: number =  DoubleWord.getBitRange(instruction, 23, 25);
        const secondOpType: number =  DoubleWord.getBitRange(instruction, 25);

        if (addrModeSecondOp === undefined || secondOpType === undefined) {
            return "UNKNOWN";
        } else if (secondOpType === OperandTypes.NO) {
            return assemblyString;
        }

        const secondOperand = DoubleWord.fromBytes(instructions[8], instructions[9], instructions[10], instructions[11]);
        
        if (secondOpType === OperandTypes.IMMEDIATE ) {
            assemblyString += ", $0x" + secondOperand.toString(16);
        } else if (secondOpType === OperandTypes.MEMORY_ADDRESS) {
            assemblyString += ", @0x" + secondOperand.toString(16);
        } else {
            const registerName: string = RegisterNumbers[secondOperand];
            if (registerName === undefined) {
                return "UNKNOWN"
            }
            if (addrModeSecondOp === AddressingModes.INDIRECT) {
                assemblyString += ", *%" + registerName;
            } else {
                assemblyString += ", %" + registerName;
            }
        }
        
        return assemblyString;
    }

    /**
     * This method searches through the reverse memory map inside the MMU and finds all virtual memory addresses that map to a physical memory address.
     * @param physicalAddress The physical memory address to find all virtual memory addresses for that map to that physical memory address.
     * @returns An array of double words representing virtual memory addresses.
     */
    public async reverseMemoryMapSearch(physicalAddress: number): Promise<DoubleWord[]> {
        const kernelSpaceStart: number = 0xC0000000;
        const kernelSpaceEnd: number = 0xFFFFFFFF;
        const virtualAddresses: DoubleWord[] = await this._window.mainMemory.findVirtualAddresses(DoubleWord.fromNumber(physicalAddress));
        if (physicalAddress <= kernelSpaceEnd && physicalAddress >= kernelSpaceStart) {
            virtualAddresses.push(DoubleWord.fromNumber(physicalAddress));
        }
        return virtualAddresses;
    }

}