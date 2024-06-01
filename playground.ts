import { Blockchain } from "@proton/vert";

async function wait(ms: number) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

async function main() {
    const blockchain = new Blockchain();
    const contract = blockchain.createContract('kv', 'target/kv.contract');
    await wait(0);

    // first, we will check if there is no data in table store before the contract executed
    console.log('Before contract execution');
    console.log(contract.tables.kvs().getTableRows());
    console.log('After contract execution');
    
    // lets save webpage address for kv account
    contract.actions.updatevalues(['kv',[{key: 'webpage', value: 'supremebeme.com'}, {key: 'webpage', value: 'metalx.com'}]]).send('kv@active');

    
    // after all lets check if the data was peropery saved to table store

    console.log('before contract execution');
    const data = contract.tables.kvs().getTableRows();
    console.log(JSON.stringify(data));
    console.log('After contract execution');
}

main();
