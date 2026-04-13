import { GeneralPurposeRegister } from "../main/simulator/functional_units/GeneralPurposeRegister";
import { Bit } from "../types/binary/Bit";
import { DoubleWord } from "../types/binary/DoubleWord";

describe("Read and write from or to main memory", () => {
    const eax: GeneralPurposeRegister = new GeneralPurposeRegister("EAX");
    test("Write doubleword to register", () => {        
        eax.content = DoubleWord.fromNumber(0xFFFFFFFF);  
        expect(eax.content).toBe(0xFFFFFFFF);
    });

    test("Get name of register", () => {
        expect(eax.name).toBe("EAX");
    });
});