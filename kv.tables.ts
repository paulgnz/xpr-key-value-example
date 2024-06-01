import * as _chain from "as-chain";
import { Name, Table } from "proton-tsc";


@packer(nocodegen)
export class KV implements _chain.Packer {
    
    constructor(
        public key: string = "",
        public value: string = ""
    ) {}
    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.packString(this.key);
        enc.packString(this.value);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        this.key = dec.unpackString();
        this.value = dec.unpackString();
        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += _chain.Utils.calcPackedStringLength(this.key);
        size += _chain.Utils.calcPackedStringLength(this.value);
        return size;
    }
}




export class AccountKVDB extends _chain.MultiIndex<AccountKV> {

}

@table("kvs", nocodegen)

export class AccountKV implements _chain.MultiIndexValue {
    
    constructor(
        public account: Name = new Name(),
        public values: KV[] = []
    ) {
        
    }

    @primary
    get primary(): u64 {
        return this.account.N;
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.account);
        enc.packObjectArray(this.values);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new Name();
            dec.unpack(obj);
            this.account = obj;
        }
        
    {
        let length = <i32>dec.unpackLength();
        this.values = new Array<KV>(length)
        for (let i=0; i<length; i++) {
            let obj = new KV();
            this.values[i] = obj;
            dec.unpack(obj);
        }
    }

        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.account.getSize();
        size += _chain.calcPackedVarUint32Length(this.values.length);
        for (let i=0; i<this.values.length; i++) {
            size += this.values[i].getSize();
        }

        return size;
    }

    static get tableName(): _chain.Name {
        return _chain.Name.fromU64(0x86F0000000000000);
    }

    static tableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        const idxTableBase: u64 = this.tableName.N & 0xfffffffffffffff0;
        const indices: _chain.IDXDB[] = [
        ];
        return indices;
    }

    getTableName(): _chain.Name {
        return AccountKV.tableName;
    }

    getTableIndexes(code: _chain.Name, scope: _chain.Name): _chain.IDXDB[] {
        return AccountKV.tableIndexes(code, scope);
    }

    getPrimaryValue(): u64 {
        return this.primary
    }

    getSecondaryValue(i: i32): _chain.SecondaryValue {
        _chain.check(false, "no secondary value!");
        return new _chain.SecondaryValue(_chain.SecondaryType.U64, new Array<u64>(0));
    }
    
    setSecondaryValue(i: i32, value: _chain.SecondaryValue): void {
        _chain.check(false, "no secondary value!");
    }


    static new(code: _chain.Name, scope: _chain.Name  = _chain.EMPTY_NAME): AccountKVDB {
        return new AccountKVDB(code, scope, this.tableName, this.tableIndexes(code, scope));
    }
}
