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