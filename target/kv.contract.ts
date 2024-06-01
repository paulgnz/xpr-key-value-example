import * as _kv_tables from './kv.tables';
import * as _chain from "as-chain";
import { check, Contract, Name, requireAuth, TableStore } from "proton-tsc";
import { AccountKV, KV } from "./kv.tables";

@contract
export class kv extends Contract {
    accountkvTableStore: TableStore<AccountKV> = new TableStore<AccountKV>(this.receiver);

    @action("updatevalues")
    updatevalues(
        actor: Name,
        values: KV[]
    ): void {
        // Require authentication for the account we want to store data for
        requireAuth(actor)
    
        // Values should be passed
        check(values.length > 0, "Must provide at least one value")
        for (let i = 0; i < values.length; i++) {
            // The max key length should be less than 255 symbols
            check(values[i].key.length < 255, "The max key length is 255")
            // The max value length should be less than 255 symbols
            check(values[i].value.length < 255, "The max value length is 255")
        }
    
        // Check if there are any previously saved data for the account
        let kv = this.accountkvTableStore.get(actor.N)
        if (kv == null) {
            // Creating new key-value object for saving in blockchain
            kv = new AccountKV(actor, values)
        } else {
            // Adding or updating keys in existing data
            const existingKeys = kv.values.map<string>(value => value.key)
            for (let i = 0; i < values.length; i++) {
                const keyMatchIndex = existingKeys.indexOf(values[i].key)
                if (keyMatchIndex == -1) {
                    kv.values.push(values[i])
                } else {
                    kv.values[keyMatchIndex].value = values[i].value
                }
            }
        }
    
        // Save data in table
        this.accountkvTableStore.set(kv, actor)
    }
}

class updatevaluesAction implements _chain.Packer {
    constructor (
        public actor: _chain.Name | null = null,
        public values: Array<_kv_tables.KV> | null = null,
    ) {
    }

    pack(): u8[] {
        let enc = new _chain.Encoder(this.getSize());
        enc.pack(this.actor!);
        enc.packObjectArray(this.values!);
        return enc.getBytes();
    }
    
    unpack(data: u8[]): usize {
        let dec = new _chain.Decoder(data);
        
        {
            let obj = new _chain.Name();
            dec.unpack(obj);
            this.actor! = obj;
        }
        
    {
        let length = <i32>dec.unpackLength();
        this.values! = new Array<_kv_tables.KV>(length)
        for (let i=0; i<length; i++) {
            let obj = new _kv_tables.KV();
            this.values![i] = obj;
            dec.unpack(obj);
        }
    }

        return dec.getPos();
    }

    getSize(): usize {
        let size: usize = 0;
        size += this.actor!.getSize();
        size += _chain.calcPackedVarUint32Length(this.values!.length);
        for (let i=0; i<this.values!.length; i++) {
            size += this.values![i].getSize();
        }

        return size;
    }
}

export function apply(receiver: u64, firstReceiver: u64, action: u64): void {
	const _receiver = new _chain.Name(receiver);
	const _firstReceiver = new _chain.Name(firstReceiver);
	const _action = new _chain.Name(action);

	const mycontract = new kv(_receiver, _firstReceiver, _action);
	const actionData = _chain.readActionData();

	if (receiver == firstReceiver) {
		if (action == 0xD5526CAB668E9580) {//updatevalues
            const args = new updatevaluesAction();
            args.unpack(actionData);
            mycontract.updatevalues(args.actor!,args.values!);
        }
	}
  
	if (receiver != firstReceiver) {
		
	}
	return;
}
