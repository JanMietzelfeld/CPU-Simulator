import { Bit } from "./Bit";
import { DataSizes } from "../enumerations/DataSizes";
import { Byte } from "./Byte";

/**
 * This class represents a generic binary value.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class BinaryValue {
    /**
     * An array of bits, representing a binary value.
     */
    private _stringValue: string = "";
    private _numberValue: number = 0;
    private readonly _bits: number;

    /**
     * Constructs a new binary value from the given array of bits.
     * @param value An array of bits representing a binary value.
     */
    public constructor(value: number, numberOfBits: number) {

        this._bits = numberOfBits;
        this.value = value;
    }

        /**
	 * Accessor for reading the binary value.
	 */
	public get size(): number {
		return this._bits;
	}


    /**
	 * Accessor for reading the binary value.
	 */
	public get value(): number {
		return this._numberValue;
	}

	/**
	 * Accessor for setting the binary value.
	 * @param newValue The new value.
	 */
	public set value(newValue: number) {

        newValue = (newValue >>> 0) % (2**this._bits); 

        this._numberValue = newValue;
        this._stringValue = newValue.toString(2).padStart(this._bits, "0");
        this._stringValue = this._stringValue.slice(this._stringValue.length - this._bits);
	}

    /**
     * This method returns the least significant bit of this value.
     * @returns The least significant bit.
     */
    public getLeastSignificantBit(): Bit {
        return (this.value & 1) as Bit;
    }

    /**
     * This method returns the most significant bit of this value.
     * @returns The most significant bit.
     */
    public getMostSignificantBit(): Bit {
        return ((this.value >>> (this._bits - 1)) & 1) as Bit;
    }

    /**
     * This method returns the last bits of the binary value.
     * The number of bits returned depends on the argument passed.
     * @param nbrOfBits 
     * @returns 
     */
    public getLeastSignificantBits(nbrOfBits: number): number {
        return this.value & ((1 << nbrOfBits) - 1);
    }

    /**
     * This method returns the first bits of the binary value.
     * The number of bits returned depends on the argument passed.
     * @param nbrOfBits 
     * @returns 
     */
    public getMostSignificantBits(nbrOfBits: number): number {
        return (this.value >>> (this._bits - nbrOfBits)) & ((1 << nbrOfBits) - 1);
    }    

    /**
     * This method gets a bit at a specified index, were index 0 is MSB and Index size - 1 is LSB.
     * @param index The position of the bit to get.
     * @returns 
     */
    public getBit(index: number): Bit {
        
        return ((this.value >>> (this._bits - 1 - index)) & 1) as Bit;
    }

    /**
     * This method gets a range of bits from a specified start index.
     * @param start The zero-based index number indicating the beginning of the range.
     * @param end Zero-based index number indicating the end of the range. The range includes the bit up to, but not including, the bit indicated by end.
     * @returns 
     */
    public getBitRange(start: number, end: number = this._bits): number {
        
        return (this.value >>> (this._bits - end)) & ((1 << (end - start)) - 1);
    }

    /**
     * This method sets or clears the a bit at a specified index, were index 0 is MSB and Index size - 1 is LSB.
     * Clearing means setting the bit to a binary 0. Setting means setting the bit to a binary 1.
     * @param index The position of the bit to set.
     * @param bit The binary value to set the bit bit to.
     * @returns 
     */
    public setBit(index: number, bit: Bit) {
        const mask = 1 << (this._bits -1 - index); 

        if (bit) {
            // Set bit to 1
            this.value |= mask;
        } else {
            // Set bit to 0
            this.value &= ~mask;
        }
        
        return;
    }

    /**
	 * Converts the binary value into a string representation.
	 * @returns 
	 */
	public toString(): string {
		return this._stringValue;
	}

}