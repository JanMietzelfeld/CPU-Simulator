import { Byte } from "../types/binary/Byte";

describe("Test instantiation of a byte", () => {

    test("Test instantiation of byte with formInteger method", () => {
        expect(new Byte(-8).toString()).toEqual("11111000");
    });
});