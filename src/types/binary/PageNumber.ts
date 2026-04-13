import { DoubleWord } from "./DoubleWord";

export type PageNumber = number & { __brand: "PageNumber" };

export namespace PageNumber {

    export const MAX_POSITIVE_NUMBER: number = 2**20 - 1;
    export const MAX_NEGATIVE_NUMBER: number = -(2**19);
    export const NUMBER_OF_BITS: number = 20;

    /**
     * This method gets the PageNumber from a number.
     * @returns
     */
    export function fromNumber(number: number): PageNumber {
        return (number & 0xfffff) as PageNumber;
    }

    /**
     * This method gets the PageNumber from a virtualAddress.
     * @returns
     */
    export function fromVirtualAddress(virtualAddress: DoubleWord): PageNumber {
        return ((virtualAddress >> (DoubleWord.NUMBER_OF_BITS - NUMBER_OF_BITS)) & 0xfffff) as PageNumber;
    }
}