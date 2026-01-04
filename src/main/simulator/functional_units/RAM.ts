import { AddressSpace } from "../../../types/binary/AddressSpace";
import { Byte } from "../../../types/binary/Byte";
import { DoubleWord } from "../../../types/binary/DoubleWord";
import { AddressOutOfRangeError } from "../../../types/errors/AddressOutOfRangeError";

export class RAM {

    private readonly _addresSpace: AddressSpace;
    private readonly _cells: Map<number, number>

    /**
     * This method constructs an instance of the RAM class.
     * @param capacity The max. capacity of this instance of the RAM class.
     */
    public constructor(capacity: number) {
        this._cells = new Map<number, number>();
        this._addresSpace = new AddressSpace(0, capacity);
    }

    /**
     * This methods writes a doubleword (32-bit- or 4-byte-) value to memory to the specified memory address.
     * @param physicalAddress A physical memory address to write the doubleword-sized data to.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     * @param doubleword Doubleword-sized data to write.
     */
    public writeDoubleWordTo(physicalAddress: DoubleWord, doubleword: DoubleWord) {

        if (!this._addresSpace.inRange(physicalAddress)) {
            throw new AddressOutOfRangeError(`Memory address out of range [${this._addresSpace.lowAddress.toString()}, ${this._addresSpace.highAddress.toString()}].`)
        }

        // Bit 0 - 7
        const firstByte: Byte = doubleword.getUpperWord().getUpperByte();
        // Bit 8 - 15
        const secondByte: Byte = doubleword.getUpperWord().getLowerByte();
        // Bit 16 - 24
        const thirdByte: Byte = doubleword.getLowerWord().getUpperByte();
        // Bit 24 - 32
        const fourthByte: Byte = doubleword.getLowerWord().getLowerByte();


        let address: number = physicalAddress.value;
        // Only write byte, if it is not a zero byte.
        this.internalWriteByteTo(address, firstByte.value);
        address = (address + 1) >>> 0;
        // Only write byte, if it is not a zero byte.
        this.internalWriteByteTo(address, secondByte.value);
        address = (address + 1) >>> 0;

        // Only write byte, if it is not a zero byte.
        this.internalWriteByteTo(address, thirdByte.value);
        address = (address + 1) >>> 0;

        // Only write byte, if it is not a zero byte.
        this.internalWriteByteTo(address, fourthByte.value);
        return;
    }

    /**
     * This method writes a specified byte of data to the specified address in
     * in the main memory. Throws an error, if the data exeeds a byte.
     * @param physicalAddress A binary value representing a physical memory address to write the data to.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     * @param data Byte-sized data to write to the specified pyhsical memory address.
     */
    public writeByteTo(physicalAddress: DoubleWord, data: Byte) {
        
        if (!this._addresSpace.inRange(physicalAddress)) {
            throw new AddressOutOfRangeError(`Memory address out of range [${this._addresSpace.lowAddress.toString()}, ${this._addresSpace.highAddress.toString()}].`)
        }

        if (data.value === 0) {
            this.clearByte(physicalAddress);
            return;
        }
        // Write byte to "memory".
        this._cells.set(physicalAddress.value, data.value);
        return;
    }

    /**
     * This method writes a specified byte of data to the specified address in
     * in the main memory. Throws an error, if the data exeeds a byte.
     * @param physicalAddress A binary value representing a physical memory address to write the data to.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     * @param data Byte-sized data to write to the specified pyhsical memory address.
     */
    private internalWriteByteTo(physicalAddress: number, data: number) {
        if (data === 0) {
            this.internalClearByte(physicalAddress);
            return;
        }
        // Write byte to "memory".
        this._cells.set(physicalAddress, data);
        return;
    }

    /**
     * This method reads doubleword sized data from the main memory starting at the specified physical memory address.
     * @param physicalAddress A binary physical memory address to read the doubleword-sized data from.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     * @returns Doubleword-sized binary data.
     */
    public readDoublewordFrom(physicalAddress: DoubleWord): DoubleWord {

        if (!this._addresSpace.inRange(physicalAddress)) {
            throw new AddressOutOfRangeError(`Memory address out of range [${this._addresSpace.lowAddress.toString()}, ${this._addresSpace.highAddress.toString()}].`)
        }

        let address: number = physicalAddress.value;

        const firstByte: number = this.internalReadByteFrom(address);
        address = (address + 1) >>> 0;

        const secondByte: number = this.internalReadByteFrom(address);
        address = (address + 1) >>> 0;

        const thirdByte: number =  this.internalReadByteFrom(address);
        address = (address + 1) >>> 0;

        const fourthByte: number = this.internalReadByteFrom(address);

        return DoubleWord.fromByteValues(firstByte, secondByte, thirdByte, fourthByte);
    }

    /**
     * This method tries to read a byte from the specified memory address.
     * Returns a binary zero for address not conatined in the
     * map in order to simulate a full size memory.
     * @param physicalAddress A binary value representing a physical memory address to write the data to.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     * @returns The byte-sized data found at the specified address.
     */
    public readByteFrom(physicalAddress: DoubleWord): Byte {
        if (!this._addresSpace.inRange(physicalAddress)) {
            throw new AddressOutOfRangeError(`Memory address out of range [${this._addresSpace.lowAddress.toString()}, ${this._addresSpace.highAddress.toString()}].`)
        }
        const addressDecimal: number = physicalAddress.value;
        let result: number;
        if (this._cells.has(addressDecimal)) {
            result = this._cells.get(addressDecimal)!;
        } else {
            result = 0;
        }
        return new Byte(result);
    }

    private internalReadByteFrom(physicalAddress: number): number {
        let result: number;
        if (this._cells.has(physicalAddress)) {
            result = this._cells.get(physicalAddress)!;
        } else {
            result = 0;
        }
        return result;
    }

    /**
     * This method clears all bits at the specified location and removes the entry with the given physical memory
     * address from the cells map. Both is done only if there is an entry in cells map.
     * @param physicalAddress A binary value representing a physical memory address to write the data to.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     */
    public clearByte(physicalAddress: DoubleWord): void {
        const addressDecimal: number = physicalAddress.value;
        if (this._cells.has(addressDecimal)) {
            this._cells.delete(addressDecimal);
        }
        return;
    }

    /**
     * This method clears all bits at the specified location and removes the entry with the given physical memory
     * address from the cells map. Both is done only if there is an entry in cells map.
     * @param physicalAddress A binary value representing a physical memory address to write the data to.
     * @throws AddressOutOfRangeError - If the physical memory address is out of range.
     */
    private internalClearByte(physicalAddress: number): void {
        if (this._cells.has(physicalAddress)) {
            this._cells.delete(physicalAddress);
        }
        return;
    }

    /**
     * A public accessable getter for the memory cells.
     * This method will be used by the GUI in order to
     * display the contents of the main memory.
     * @returns The current content of this RAM instance.
     */
    public get cells(): Map<number, number> {
        return this._cells;
    }
}