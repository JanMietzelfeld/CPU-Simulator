import { DoubleWord } from "../../../types/binary/DoubleWord";
import { Register } from "./Register";

/**
 * This class represents a special tpye of register,
 * which can hold a single address.
 * @author Erik Burmester <erik.burmester@nextbeam.net>
 */
export class PointerRegister extends Register<DoubleWord> {
    /**
     * Constructs a new instance.
     * @constructor
     */
    public constructor(name: string) {
        super(name, new DoubleWord());
    }

    /**
     * Accessor for retrieving a copy of the current registers content.
     * @override
     * @returns A copy of the current registers content.
     */
    public get content(): DoubleWord {
        return new DoubleWord(this._content.value);
    }

    /**
     * Accessor for setting the current registers content to a new value.
     * @override
     * @param newValue The new value.
     */
    public set content(newValue: DoubleWord) {
        this._content = new DoubleWord(newValue.value);
    }
}