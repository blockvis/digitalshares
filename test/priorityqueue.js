const BigNumber = require('bignumber.js');

const chai = require('chai');
chai.use(require('chai-as-promised'));
chai.use(require('chai-bignumber')(BigNumber));

const expect = chai.expect;

const PriorityQueue = artifacts.require("../contracts/PriorityQueue.sol");

contract('PriorityQueue', async (accounts) => {
    let contract;

    before(async function () {
        this.timeout(1200000);
        contract = await PriorityQueue.new();
    });

    it('should store data item', async () => {
        await contract.push(1, 100);

        expect(await contract.size()).to.be.bignumber.equal(1);

        expect(await contract.min()).to.be.bignumber.equal(100);
        await contract.takeMin();
    });

    it('refuses to put same key twice', async () => {
        await contract.push(1, 100);
        await expect(contract.push(1, 200)).eventually.rejected;
    });

    it('should store again data item', async () => {
        await contract.push(1, 100);

        expect(await contract.size()).to.be.bignumber.equal(1);

        expect(await contract.min()).to.be.bignumber.equal(100);
        await contract.takeMin();
    });

    it('should store 2 data items', async () => {
        await contract.push(2, 50);
        await contract.push(1, 100);

        expect(await contract.size()).to.be.bignumber.equal(2);

        expect(await contract.min()).to.be.bignumber.equal(100);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(50);
        await contract.takeMin();
    });

    it('should store 4 data items', async () => {
        await contract.push(4, 50);
        await contract.push(3, 75);
        await contract.push(2, 100);
        await contract.push(1, 125);

        expect(await contract.size()).to.be.bignumber.equal(4);

        expect(await contract.min()).to.be.bignumber.equal(125);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(100);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(75);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(50);
        await contract.takeMin();
    });


    it('should store 5 data items', async () => {
        await contract.push(5, 25);
        await contract.push(4, 50);
        await contract.push(3, 75);
        await contract.push(2, 100);
        await contract.push(1, 125);

        expect(await contract.size()).to.be.bignumber.equal(5);

        expect(await contract.min()).to.be.bignumber.equal(125);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(100);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(75);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(50);
        await contract.takeMin();
        expect(await contract.min()).to.be.bignumber.equal(25);
        await contract.takeMin();
    });

    it('should store many items', async function() {
        this.timeout(1200000);
        let sum = 0;
        let i;
        let count = 1024;
        console.log('Base is:', (await contract.BASE()).toNumber());
        for (i = 0; i < count; i++) {
            const tx = await contract.push(10000 - i, i * 3);
            sum += tx.receipt.gasUsed;
            expect(await contract.min()).to.be.bignumber.equal(i * 3);
        }
        const store = sum;
        console.log('Storage gas:', store);
        console.log('Average storage:', (store / count));

        const n = await contract.size();
        expect(n).to.be.bignumber.equal(count);
        for (i = n - 1; i >= 0; i--) {
            expect(await contract.min()).to.be.bignumber.equal(i * 3);
            const tx = await contract.takeMin();
            sum += tx.receipt.gasUsed;
        }
        expect(await contract.size()).to.be.bignumber.equal(0);

        console.log('Remove:' , (sum - store));
        console.log('Average remove:', (sum - store) / count);
        console.log('Total gas:', sum);
    });

});
