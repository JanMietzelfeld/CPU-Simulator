import { DoubleWord } from "./DoubleWord";

export type FrameNumber = number & { __brand: "FrameNumber" };

export namespace FrameNumber {

    export const MAX_POSITIVE_NUMBER: number = 2**20 - 1;
    export const MAX_NEGATIVE_NUMBER: number = -(2**19);
    export const NUMBER_OF_BITS: number = 20;

    /**
     * This method gets the FrameNumber from a number.
     * @returns
     */
    export function fromNumber(number: number): FrameNumber {
        return (number & 0xfffff) as FrameNumber;
    }

    /**
     * This method gets the FrameNumber from a pyhsical address.
     * @returns
     */
    export function fromPyhsicalAddress(pyhsicalAddress: DoubleWord): FrameNumber {
        return ((pyhsicalAddress >> (DoubleWord.NUMBER_OF_BITS - NUMBER_OF_BITS)) & 0xfffff) as FrameNumber;
    }
}