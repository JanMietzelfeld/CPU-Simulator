import { DoubleWord } from "./DoubleWord";

export type FrameNumber = number & { __brand: "FrameNumber" };

export namespace FrameNumber {
    
    export const MAX_POSITIVE_NUMBER: number = 2**20 - 1;
    export const MAX_NEGATIVE_NUMBER: number = -(2**19);
    export const NUMBER_OF_BITS: number = 20;

    /**
     * This method gets the FrameNumber from a number.
     * @param number 
     * @returns
     */
    export function fromNumber(number: number): FrameNumber {
        return (number & MAX_POSITIVE_NUMBER) as FrameNumber;
    }

    /**
     * This method gets the FrameNumber from a pyhsical address.
     * @param pyhsicalAddress 
     * @returns
     */
    export function fromPyhsicalAddress(pyhsicalAddress: DoubleWord): FrameNumber {
        return ((pyhsicalAddress >> (DoubleWord.NUMBER_OF_BITS - NUMBER_OF_BITS)) & MAX_POSITIVE_NUMBER) as FrameNumber;
    }
}