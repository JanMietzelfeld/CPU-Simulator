import { EFLAGS } from "../main/simulator/functional_units/EFLAGS";

describe("Set and clear flag bits in the EFLAGS register", () => {
    const eflags: EFLAGS = new EFLAGS();
    test("Set zero flag", () => {
        eflags.setZero();
        expect(eflags.content.toString()).toBe("11000100");
    });

    test("Clear zero flag", () => {
        eflags.clearZero();
        expect(eflags.content.toString()).toBe("11000000");
    });

    test("Set parity flag", () => {
        eflags.setParity();
        expect(eflags.content.toString()).toBe("11000001");
    });

    test("Clear parity flag", () => {
        eflags.clearParity();
        expect(eflags.content.toString()).toBe("11000000");
    });

    test("Enter kernel mode", () => {
        eflags.enterKernelMode();
        expect(eflags.content.toString()).toBe("00000000");
    });

    test("Test if CPU is in kernel mode", () => {
        expect(eflags.isInKernelMode()).toBeTruthy();
    });

    test("Exit kernel mode and enter user mode", () => {
        eflags.enterUserMode()
        expect(eflags.content.toString()).toBe("11000000");
    });

    test("Test if CPU is in kernel mode", () => {
        expect(eflags.isInKernelMode()).toBeFalsy();
    });

    test("Test if CPU is in user mode", () => {
        expect(eflags.isInUserMode()).toBeTruthy();
    });
});