import { InterruptNumbers } from "../enumerations/InterruptNumbers";

/**
 * Error which gets thrown whenever an Exception is triggert .
 */
export class ExceptionError extends Error {

	private readonly _interruptNumber: InterruptNumbers;
	/**
	 * Constructs a new instance with the given message.
	 * @param description A short text describing the error and its cause.
	 */
    constructor(interruptNumber: InterruptNumbers) {
		super();
		this.name = "ExceptionError";
		this._interruptNumber = interruptNumber;
        // Set the prototype explicitly to enable typechecking.
        Object.setPrototypeOf(this, ExceptionError.prototype);
    }

	public get interruptNumber(): InterruptNumbers {
		return this._interruptNumber
	}
}