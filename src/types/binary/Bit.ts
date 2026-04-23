export type Bit = 0 | 1;

export namespace Bit {

    export const SIZE: number = 2;

    /**
     * This method creates a Bit from a number.
     * @param number
     * @returns
     */
    export function fromNumber(number: number): Bit {
        return (number & 1) as Bit;
    }

    /**
     * This method inverts the Bit
     * @param bit
     * @returns
     */
    export function invert(bit: Bit): Bit {
        return (bit === 0 ? 1 : 0) as Bit;
    }
}