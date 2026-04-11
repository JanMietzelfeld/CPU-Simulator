import { DoubleWord } from "../types/binary/DoubleWord";
import { TranslationLookasideBuffer } from "../main/simulator/functional_units/TranslationLookasideBuffer";
import { Bit } from "../types/binary/Bit";
import { PageTableEntry } from "../types/binary/PageTableEntry";
import { BinaryValue } from "../types/binary/BinaryValue";

describe("Test TLB", () => {
    const translationLookasideBuffer: TranslationLookasideBuffer = new TranslationLookasideBuffer(2);

    const virtualAddress1: DoubleWord = new DoubleWord(0x00001000);
    const pageFrameNbr1: BinaryValue = new BinaryValue(0, 20);
    const pageFlagBits1: BinaryValue= new BinaryValue(0b110010000000, 12);
    const pageTableEntry1: PageTableEntry = new PageTableEntry(pageFlagBits1, pageFrameNbr1);

    const virtualAddress2: DoubleWord = new DoubleWord(0x00002000);
    const pageFrameNbr2: BinaryValue = new BinaryValue(0, 20);
    const pageFlagBits2: BinaryValue= new BinaryValue(0b101010000000, 12);
    const pageTableEntry2: PageTableEntry = new PageTableEntry(pageFlagBits2, pageFrameNbr2);

    const virtualAddress3: DoubleWord = new DoubleWord(0x00003000);
    const pageFrameNbr3: BinaryValue = new BinaryValue(0, 20);
    const pageFlagBits3: BinaryValue= new BinaryValue(0b101010000000, 12);
    const pageTableEntry3: PageTableEntry = new PageTableEntry(pageFlagBits3, pageFrameNbr3);
    
    test("Insert first entry", () => {
        translationLookasideBuffer.insert([virtualAddress1, pageTableEntry1]);

        expect(translationLookasideBuffer.data).toEqual([
            [1, [virtualAddress1.getMostSignificantBits(20), pageTableEntry1]]
        ]);
    });

    test("Get entry", () => {
        translationLookasideBuffer.get(new DoubleWord(0x00001000));
        expect(translationLookasideBuffer.data).toEqual([
            [2, [virtualAddress1.getMostSignificantBits(20), pageTableEntry1]]
        ]);
    });

    test("Insert second entry", () => {
        translationLookasideBuffer.insert([virtualAddress2, pageTableEntry2]);
        expect(translationLookasideBuffer.data).toEqual([
            [2, [virtualAddress1.getMostSignificantBits(20), pageTableEntry1]], 
            [1, [virtualAddress2.getMostSignificantBits(20), pageTableEntry2]]
        ]);
    });

    test("Get entry", () => {
        translationLookasideBuffer.get(new DoubleWord(0x00001000));
        expect(translationLookasideBuffer.data).toEqual([
            [3, [new DoubleWord(0x00001000).getMostSignificantBits(20), pageTableEntry1]], 
            [1, [new DoubleWord(0x00002000).getMostSignificantBits(20), pageTableEntry2]]
        ]);
    });

    test("Insert third entry", () => {
        translationLookasideBuffer.insert([virtualAddress3, pageTableEntry3]);
        expect(translationLookasideBuffer.data)
            .toEqual([
                [3, [virtualAddress1.getMostSignificantBits(20), pageTableEntry1]],
                [1, [virtualAddress3.getMostSignificantBits(20), pageTableEntry3]]
            ]);
    });

    test("Get entry", () => {
        translationLookasideBuffer.get(new DoubleWord(0x00001000));
        expect(translationLookasideBuffer.data).toEqual([
            [4, [virtualAddress1.getMostSignificantBits(20), pageTableEntry1]],
            [1, [new DoubleWord(0x00003000).getMostSignificantBits(20), pageTableEntry3]]
        ]);
    });
});