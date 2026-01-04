import { BinaryValue } from "../binary/BinaryValue";
import { Bit } from "../binary/Bit";
import { DoubleWord } from "../binary/DoubleWord";

/**
 * Error which gets thrown whenever a page is currently not associated with a page frame.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class PageFaultError extends Error {
	/**
     * This field sotres the flag bits associated with the page for
     * which this error was thrown.
     */
    public readonly flags: BinaryValue

    /**
     * This field stores the page table entrys pyhsical address which
     * is currently not associated with a page. 
     */
	public readonly addressOfPageFault: DoubleWord;

	/**
	 * Constructs a new instance with the given message.
	 * @param description A short text describing the error and its cause.
	 */
	constructor(description: string, flags: BinaryValue, addressOfPageFault: DoubleWord) {
		super(description);
		this.flags = flags;
		this.addressOfPageFault = addressOfPageFault;
        // Set the prototype explicitly to enable typechecking.
        Object.setPrototypeOf(this, PageFaultError.prototype);
    }
}