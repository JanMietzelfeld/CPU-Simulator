import { PageTableEntry } from "../../../types/binary/PageTableEntry";
import { Bit } from "../../../types/binary/Bit";
import { DoubleWord } from "../../../types/binary/DoubleWord";


export class TranslationLookasideBuffer {
    private _data: [number, [number, PageTableEntry]][];
    private _capacity: number;

    public constructor(capacity: number) {
        this._data = [];
        this._capacity = capacity;
    }

    public insert(item: [DoubleWord, PageTableEntry]): void {
        if (this.has(item[0])) {
            return;
        }
        if (this._data.length === this._capacity) {
            this._data.pop();
        }
        this._data.push([1, [item[0].getMostSignificantBits(20), item[1]]]);
        this.sort();
        return;
    }

    public get data(): [number, [number, PageTableEntry]][] {
        return this._data;
    }

    private sort() {
        this._data.sort((current, successor) => (current[0] < successor[0]) ? current[0] : successor[0]);
    }

    public peek(): [number, [number, PageTableEntry]] | undefined {
        return (this._data.length === 0) 
            ? undefined
            : this._data[0];
    }

    public pop(): [number, [number, PageTableEntry]] | undefined {
        return (this._data.length === 0) ? undefined : this._data.pop();
    }
    
    public size(): number {
        return this._data.length;
    }
    
    public isEmpty(): boolean {
        return this._data.length === 0;
    }

    public has(virtualAddress: DoubleWord): boolean {
        let includes = false;
        for (let i = 0; i < this._data.length; ++i) {
            if (this._data[i][1][0] === virtualAddress.getMostSignificantBits(20)) {
                includes = true;
            }
        }
        return includes;
    }

    public get(virtualAddress: DoubleWord): PageTableEntry | undefined {
        let pageTableEntry: PageTableEntry | undefined = undefined;
        for (let i = 0; i < this._data.length; ++i) {
            if (this._data[i][1][0] === virtualAddress.getMostSignificantBits(20)) {
                pageTableEntry = this._data[i][1][1];
                this._data[i][0]++;
            }
        }
        this.sort();
        return pageTableEntry;
    }

    public clear(): void {
        this._data = [];
    }

    public toString(): string {
        return this._data.toString();
    }
}