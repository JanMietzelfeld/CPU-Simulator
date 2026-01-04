import { BinaryValue } from "./BinaryValue";

/**
 * This class represents an address space or a range of addresses.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class AddressSpace {
   
    /**
     * This member stores the lower boundry of the address space.
     * @readonly
     */
    private readonly _lowAddress: number;

     /**
     * This member stores the upper boundry of the address space.
     * @readonly
     */
    private readonly _highAddress: number;

    /**
     * Constructs a new address space from the given boundries.
     * @param lowAddress The lower boundry of the address space.
     * @param highAddress The upper boundry of the address space.
     */
    public constructor(lowAddress: number, highAddress: number) {
        this._lowAddress = lowAddress;
        this._highAddress = highAddress;
    }

    /**
     * This method tests whether a given address is in range of the address space.
     * @param element The address to test.
     * @returns True, if the given address is in range, false otherwise.
     */
    public inRange(address: BinaryValue): boolean {
        return (this._lowAddress <= address.value) && (address.value <= this._highAddress);
    }

    /**
     * This method returns the decimal representation of the address spaces lowest address.
     * @returns The decimal representation of the upper boundry.
     */
    public get lowAddress(): number {
        return this._lowAddress;
    }

    /**
     * This method returns the decimal representation of the address spaces highest address.
     * @returns The decimal representation of the upper boundry.
     */
    public get highAddress(): number {
        return this._highAddress;
    }

    /**
     * This accessor calculates and returns the size of this range.
     */
    public get size(): number {
        return this._highAddress - this._lowAddress + 1;
    }
}