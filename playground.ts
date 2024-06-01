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
    console.log('------ BEFORE ------');
    console.log(contract.tables.kvs().getTableRows());
    console.log('--------------------');
    
    // lets save webpage address for kv account
    await contract.actions.updatevalues(['kv', [{ key: 'webpage', value: 'www.proton.org' }]]).send('kv@active');

    
    // after all lets check if the data was peropery saved to table store

    console.log('------ AFTER ------');
    const data = contract.tables.kvs().getTableRows();
    console.log(JSON.stringify(data));
    console.log('--------------------');

    await contract.actions.updatevalues(['kv', [{ key: 'twitter', value: 'https://twitter.com/protonxpr' }]]).send('kv@active');

    // Check if there is any data in the store
    console.log('------ BEFORE REMOVE ------');
    const data_before_remove = contract.tables.kvs().getTableRows()
    console.log(JSON.stringify(data_before_remove));
    console.log('--------------------');
    
    await contract.actions.removekeys(['kv', ['webpage']]).send('kv@active');
    console.log('------ AFTER WEBPAGE REMOVE ------');
    const data_without_webpage = contract.tables.kvs().getTableRows()
    console.log(JSON.stringify(data_without_webpage));
    console.log('--------------------');
    
    await contract.actions.removekeys(['kv', ['twitter']]).send('kv@active');
    console.log('------ AFTER REMOVING ALL ------');
    const data_clean = contract.tables.kvs().getTableRows()
    console.log(JSON.stringify(data_clean));
    console.log('--------------------');
}

main();
