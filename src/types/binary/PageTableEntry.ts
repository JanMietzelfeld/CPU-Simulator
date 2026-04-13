import { DoubleWord } from "./DoubleWord";
import { FrameNumber } from "./FrameNumber";
import { PageTableEntryFlags } from "./PageTableEntryFlags";


export type PageTableEntry = number & { __brand: "DoubleWord" & "PageTableEntry" };

export namespace PageTableEntry {

	export const NUMBER_OF_BITS: number = 32;

    export function fromDoubleWord(entry: DoubleWord): PageTableEntry {
        return entry as PageTableEntry;
    }

    export function fromFlagAndFrameNumber(flags: PageTableEntryFlags, frameNumber: FrameNumber): PageTableEntry {
        return ((flags << FrameNumber.NUMBER_OF_BITS) | frameNumber) as PageTableEntry;
    }

    export function getFlags(entry: PageTableEntry): PageTableEntryFlags {
        return PageTableEntryFlags.fromNumber(entry >>> FrameNumber.NUMBER_OF_BITS);
    }

    export function getFrameNumber(entry: PageTableEntry): FrameNumber {
        return FrameNumber.fromNumber(entry);
    }
}