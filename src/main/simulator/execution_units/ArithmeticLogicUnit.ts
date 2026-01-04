import { BinaryValue } from "../../../types/binary/BinaryValue";
import { Bit } from "../../../types/binary/Bit";
import { DataSizes } from "../../../types/enumerations/DataSizes";
import { DoubleWord } from "../../../types/binary/DoubleWord";
import { DivisionByZeroError } from "../../../types/errors/DivisionByZeroError";
import { EFLAGS } from "../functional_units/EFLAGS";
import { Byte } from "../../../types/binary/Byte";

/**
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class ArithmeticLogicUnit {
    /**
     * A refference to the CPU cores EFLAGS register, this ALU is associated with.
     * @readonly
     */
    private readonly _eflags: EFLAGS;

    /**
     * Constructs a new instance from the given arguments.
     * @param eflags The EFLAGS register of the CPU core this ALU is associated with.
     * @constructor
     */
    public constructor(eflags: EFLAGS) {
        this._eflags = eflags;
    }

    /**
     * This method checks whether the given binary value is a binary zero
     * and sets or clears the **zero** flag accordingly.
     * @param operand A binary value.
     * @returns
     */
    private checkForZero(operand: DoubleWord) {
        if (operand.value === 0) {
            this._eflags.setZero();
        } else {
            this._eflags.clearZero();
        }
        return;
    }

    /**
     * This method checks whether the given binary value has an even number of set bits
     * in the least significant byte and sets or clears the **parity** flag accordingly.
     * @param operand A binary value.
     * @returns
     */
    private checkForParity(operand: DoubleWord) {
        let noSetBits = 0;
        operand.getLeastSignificantBits(Byte.NUMBER_OF_BITS_DEC).toString().split("").forEach(bit => {
            if (bit === "1") {
                ++noSetBits
            }
        });
        if (noSetBits % 2 === 0) {
            this._eflags.setParity();
        } else {
            this._eflags.clearParity();
        }
        return;
    }

    /**
     * This method checks whether the given binary value is negative and
     * sets or clears the **sign** flag accordingly. The given value is 
     * treated as a negative value if the MSB is set to 1.
     * @param operand A binary value. 
     * @returns
     */
    private checkForSigned(operand: DoubleWord) {
        if (operand.getMostSignificantBit() === 1) {
            this._eflags.setSigned();
        } else {
            this._eflags.clearSigned();
        }
        return;
    }

    /**
     * This method checks whether the last operation resulted in an overflow.
     * An overflow occurs, if the two highest bits of the carry are unequal.
     * @param carry The carry bits to check.
     */
    private checkForOverflow(carry: boolean, sign: boolean) {
        if (carry !== sign) {
            this._eflags.setOverflow();
        } else {
            this._eflags.clearOverflow();
        }
        return;
    }

    /**
     * This method checks whether to set or clear the **carry** flag after an operation.
     * @param carry The carry bits to check.
     */
    private checkCarry(carry: boolean) {
        if (carry === true) {
            this._eflags.setCarry();
        } else {
            this._eflags.clearCarry();
        }
    }

    /**
     * This method performs the logical NOT operation bit-wise on a doubleword sized binary value.
     * All its bits will be inverted: 1 becomes 0 and vice versa.The result corresponds 
     * to the one's complement of the given binary value.
     * 
     * All flags remain unchanged.
     * @param operand The doubleword sized binary value to invert.
     * @returns The inverted binary value.
     */
    public not(operand: DoubleWord): DoubleWord {        
        return new DoubleWord(~operand.value);
    }

    /**
     * This method performs an bit-wise, logical AND operation on two given binary values, 
     * according to the following table.
     * 
     * | Bit x | Bit y | Result |
     * |-------|-------|--------|
     * | 0     | 0     | 0      |
     * | 1     | 0     | 0      |
     * | 0     | 1     | 0      |
     * | 1     | 1     | 1      |
     * 
     * Both the **carry** and the **overflow** flag are *cleared*, while the **zero**, 
     * **sign** and **parity** flags are *set* or *cleared* according to the operations result.
     * @param firstOperand The first doubleword.
     * @param secondOperand The second doubleword.
     * @returns The resulting binary value.
     */
    public and(firstOperand: DoubleWord, secondOperand: DoubleWord): DoubleWord {
        const result: DoubleWord = new DoubleWord(firstOperand.value & secondOperand.value);
        this._eflags.clearCarry();
        this._eflags.clearOverflow();
    
        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);
        return result;
    }

    /**
     * This method performs an bit-wise, logical OR operation on two given binary values, 
     * according to the following table.
     * 
     * | Bit x | Bit y | Result |
     * |-------|-------|--------|
     * | 0     | 0     | 0      |
     * | 1     | 0     | 1      |
     * | 0     | 1     | 1      |
     * | 1     | 1     | 1      |
     * 
     * Both the **carry** and the **overflow** flag are *cleared*, while the **zero**, 
     * **sign** and **parity** flags are *set* or *cleared* according to the operations result.
     * @param firstOperand The first word.
     * @param secondOperand The second word.
     * @returns The resulting binary value.
     */
    public or(firstOperand: DoubleWord, secondOperand: DoubleWord): DoubleWord {
        const result: DoubleWord = new DoubleWord(firstOperand.value | secondOperand.value);
        this._eflags.clearCarry();
        this._eflags.clearOverflow();
        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);
        return result;
    }

    /**
     * This method performs an bit-wise, logical XOR operation on two given binary values, 
     * according to the following table.
     * 
     * | Bit x | Bit y | Result |
     * |-------|-------|--------|
     * | 0     | 0     | 0      |
     * | 1     | 0     | 1      |
     * | 0     | 1     | 1      |
     * | 1     | 1     | 0      |
     * 
     * Both the **carry** and the **overflow** flag are *cleared*, while the **zero**,
     * **sign** and **parity** flags are *set* or *cleared* according to the operations result.
     * @param firstOperand The first doubleword.
     * @param secondOperand The second doubleword.
     * @returns The resulting binary value.
     */
    public xor(firstOperand: DoubleWord, secondOperand: DoubleWord) {
        const result: DoubleWord = new DoubleWord(firstOperand.value ^ secondOperand.value);
        this._eflags.clearCarry();
        this._eflags.clearOverflow();
        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);
        return result;
    }

    /**
     * This method computes the two's complement of the given binary value.
     * 
     * Both the **carry** and the **overflow** flag are *cleared*, while the **zero**,
     * **sign** and **parity** flags are *set* or *cleared* according to the operations result.
     * @param operand The operand.
     * @returns The two's complement.
     */
    public neg(operand: DoubleWord): DoubleWord {
        const result: DoubleWord = new DoubleWord(~operand.value + 1);
        this._eflags.clearCarry();
        this._eflags.clearOverflow();
        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);
        return result;
    }

    /**
     * This method adds two given binary numbers without taking the carry into account.
     * 
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param firstSummand The first operand/summand.
     * @param secondSummand The second operand/summand.
     * @returns The sum of both operands/summands.
     */
    public add(firstSummand: DoubleWord, secondSummand: DoubleWord): DoubleWord {

        let numericResult = firstSummand.value + secondSummand.value;

        const carry: boolean = numericResult > DoubleWord.MAXIMUM_NUMBER_DEC;
        const result: DoubleWord = new DoubleWord(numericResult);


        this.checkForParity(result);
        this.checkForSigned(result);
        this.checkForZero(result);

        this.checkForOverflow(carry, this._eflags.sign === 1);
        this.checkCarry(carry);
        return result;
    }

    /**
     * This method adds two given binary numbers while taking the carry into account.
     * 
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param firstSummand The first operand/summand.
     * @param secondSummand The second operand/summand.
     * @returns The sum of both operands/summands.
     */
    public adc(firstSummand: DoubleWord, secondSummand: DoubleWord): DoubleWord {
        
        let numericResult = firstSummand.value + secondSummand.value + this._eflags.carry;

        const carry: boolean = numericResult > DoubleWord.MAXIMUM_NUMBER_DEC;
        const result: DoubleWord = new DoubleWord(numericResult);

        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);

        this.checkForOverflow(carry, this._eflags.sign === 1);
        this.checkCarry(carry);
        return result;
    }

    /**
     * This method subtracts two given binary numbers without taking the carry into account.
     * 
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param minuend The binary value to subtract from.
     * @param subtrahend The binary value to subtract.
     * @returns The difference of the first operand (minuend) and the second operand (subtrahend).
     */
    public sub(minuend: DoubleWord, subtrahend: DoubleWord): DoubleWord {
        
        let numericResult = minuend.value - subtrahend.value;

        const barrow: boolean = numericResult < 0;
        const result: DoubleWord = new DoubleWord(numericResult);

        this.checkForParity(result);
        this.checkForSigned(result);
        this.checkForZero(result);

        minuend.getMostSignificantBit() !== subtrahend.getMostSignificantBit() && minuend.getMostSignificantBit() !== result.getMostSignificantBit() ? this._eflags.setOverflow() : this._eflags.clearOverflow();
        this.checkCarry(barrow);

        return result;
    }

    /**
     * This method subtracts two given binary numbers with taking the carry into account.
     * 
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param minuend The binary value to subtract from.
     * @param subtrahend The binary value to subtract.
     * @returns The difference of the first operand (minuend) and the second operand (subtrahend).
     */
    public sbb(minuend: DoubleWord, subtrahend: DoubleWord): DoubleWord {

        let numericResult = minuend.value - subtrahend.value - this._eflags.carry;

        const barrow: boolean = numericResult < 0;
        const result: DoubleWord = new DoubleWord(numericResult);

        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);

        minuend.getMostSignificantBit() !== subtrahend.getMostSignificantBit() && minuend.getMostSignificantBit() !== result.getMostSignificantBit() ? this._eflags.setOverflow() : this._eflags.clearOverflow();
        this.checkCarry(barrow);

        return result;
    }


    /**
     * This method performs a logical shift on the given binary value one bit to the right.
     * @param operand The operand to perform a right shift on.
     * @returns The bit right shifted.
     */
    public logicalRightShift<T extends BinaryValue>(operand: T): Bit {
        
        const removedBit: Bit = operand.getLeastSignificantBit();

        operand.value = operand.value >>> 1;

        return removedBit;
    }

    /**
     * This method performs an arithmetic shift on the given binary value one bit to the right.
     * @param operand The operand to perform a right shift on.
     * @returns The bit right shifted.
     */
    public arithmeticRightShift<T extends BinaryValue>(operand: T): Bit {
        const removedBit: Bit = operand.getLeastSignificantBit();

        const msb = operand.getMostSignificantBit();

        // Arithmetic right shift by 1
        operand.value = operand.value >>> 1
        operand.setBit(0 , msb);

        return removedBit;
    }

    /**
     * This method performs an logical shift on the given binary value one bit to the left.
     * @param operand The operand to perform a right shift on.
     * @returns The bit left shifted.
     */
    public logicalLeftShift<T extends BinaryValue>(operand: T): Bit {
        const removedBit: Bit = operand.getMostSignificantBit();

        operand.value = operand.value << 1;

        return removedBit;
    }

     /**
     * This method performs a logical left shift on a given binary value
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param value The second operand, binary value to be shifted.
     * @param count The first operand, number of left shifts.
     * @returns The resulting binary value.
     */
    public shl(value: DoubleWord, count: DoubleWord, ): DoubleWord {

        const carry: Bit = value.getBit(count.value - 1);

        const result: DoubleWord = new DoubleWord(value.value << count.value);

        this.checkCarry(carry === 1);
        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);

        return result;
    }

    /**
     * This method performs a logical right shift on a given binary value
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param value The second operand, binary value to be shifted.
     * @param count The first operand, number of right shifts.
     * @returns The resulting binary value.
     */
    public shr(value: DoubleWord, count: DoubleWord): DoubleWord {

        let result: DoubleWord = value;

        if (DoubleWord.NUMBER_OF_BITS_DEC >= count.value) {
            
            const carry: Bit = value.getBit(DoubleWord.NUMBER_OF_BITS_DEC - count.value);
            count.value == 1 && value.getBit(0) == 1 ? this._eflags.setOverflow() : this._eflags.clearOverflow();

            result = new DoubleWord(value.value >>> count.value);
            this.checkCarry(carry === 1);

        } else {
            this._eflags.clearCarry()
            result = new DoubleWord();
        }

        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);

        return result;
    }

    /**
     * This method performs a arithmetic right shift on a given binary value
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * @param value The second operand, binary value to be shifted.
     * @param count The first operand, number of right shifts.
     * @returns The resulting binary value.
     */
    public sar(value: DoubleWord, count: DoubleWord): DoubleWord {

        let result: DoubleWord = value;


        if (DoubleWord.NUMBER_OF_BITS_DEC >= count.value) {

            result = new DoubleWord(value.value >> count.value);
            value.getBit(DoubleWord.NUMBER_OF_BITS_DEC - count.value) == 1 ? this._eflags.setCarry() : this._eflags.clearCarry()

        } else {
            result = new DoubleWord();
            this._eflags.clearCarry()
        }

        this._eflags.clearOverflow();
        this.checkForZero(result);
        this.checkForParity(result);
        this.checkForSigned(result);

        return result;
    }


    /**
     * This method multiplies both the given binary, doubleword sized values using Booths mulitplication algorithm, 
     * according to <https://medium.com/@jetnipit54/booth-algorithm-e6b8a6c5b8d>.
     * 
     * Affects the **carry** and **overflow** bit according to the result.
     * @param multiplier The operand, which determines, how often the first operand gets multiplied.
     * @param multiplicand The operand, which gets multiplied by the multiplicand.
     * @returns The resulting product.
     */
    public imul(multiplier: DoubleWord, multiplicand: DoubleWord): DoubleWord {
        
        const result64 = BigInt(multiplier.value) * BigInt(multiplicand.value);

        const low32 = Number(result64 & 0xFFFFFFFFn) >>> 0; 
        const high32 = Number((result64 >> 32n) & 0xFFFFFFFFn);

        const result = new DoubleWord(low32);

        // Determine if high32 is proper sign extension of low32
        const low32Signed = low32 | 0; // convert to signed
        const properSignExtension =
            (low32Signed >= 0 && high32 === 0) ||
            (low32Signed < 0 && high32 === 0xFFFFFFFF);

        const overflow = !properSignExtension;

        overflow ? this._eflags.setOverflow() : this._eflags.clearOverflow();
        overflow ? this._eflags.setCarry() : this._eflags.clearCarry();

        return result;
    }

    /**
     * This method divides both the given binary, doubleword sized values.
     * 
     * Status flags are not Affected.
     * @param dividend The first operand, which gets divided by the divisor.
     * @param divisor The second operand, which divides the dividend.
     * @returns The resulting quotient.
     */
    public idiv(dividend: DoubleWord, divisor: DoubleWord): DoubleWord {
        if (divisor.value === 0) {
            throw new DivisionByZeroError("Dividing by zero is not permittet.");
        }
        let result = (dividend.value | 0) / (divisor.value | 0);

        return new DoubleWord(result);
    }

    /**
     * This method compares both given binary values, by performing a subtraction.
     * 
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * 
     * In contrast to SUB, this operation does not effect the second operands value.
     * @param firstOperand 
     * @param secondOperand 
     */
    public cmp(firstOperand: DoubleWord, secondOperand: DoubleWord) {
        this.sub(secondOperand, firstOperand);
        return;
    }

    /**
     * This method compares both given binary values, by performing a logical AND operation.
     * 
     * Affects the **sign**, **zero**, **carry**, **overflow** and **parity** bit according to the result.
     * 
     * In contrast to AND, this operation does not effect the second operands value.
     * @param firstOperand 
     * @param secondOperand 
     */
    public test(firstOperand: DoubleWord, secondOperand: DoubleWord) {
        this.and(firstOperand, secondOperand);
    }
}