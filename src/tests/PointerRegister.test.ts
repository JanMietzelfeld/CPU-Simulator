import { DoubleWord } from "../types/binary/DoubleWord";
import { PointerRegister } from "../main/simulator/functional_units/PointerRegister";

describe("Test register for addresses", () => {
    const ip: PointerRegister = new PointerRegister("EIP");

    test("Point address register to new address", () => {
        ip.content = new DoubleWord(0);
        expect(ip.content.toString()).toEqual(new DoubleWord(0).toString());
    });
});