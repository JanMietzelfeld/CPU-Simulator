import { Byte } from "../types/binary/Byte";

describe("Test instantiation of a byte", () => {

    test("Test instantiation of byte with formNumber method", () => {
        expect(Byte.fromNumber(-8)).toEqual(0b11111000);
    });
});