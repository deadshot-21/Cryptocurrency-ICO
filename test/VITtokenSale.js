let VITtoken = artifacts.require("./VITtoken.sol");
let VITtokenSale = artifacts.require("./VITtokenSale.sol");


contract('VITtokenSale',function(accounts){
	let tokenInstance;
	let tokenSaleInstance;
	let admin = accounts[0];
	let buyer = accounts[1];
	let tokenPrice = 1000000000000000;
	let tokensAvailable = 7500000;
	let numberOfTokens;

	it('INITIALIZES THE CONTRACT WITH THE CORRECT VALUES',function(){
		return VITtokenSale.deployed().then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.address
		}).then(function(address){
			assert.notEqual(address, 0x0, 'HAS CONTRACT ADDRESS');
			return tokenSaleInstance.tokenContract();
		}).then(function(address){
			assert.notEqual(address, 0x0, 'HAS CONTRACT ADDRESS');
			return tokenSaleInstance.tokenPrice();
		}).then(function(price){
			assert.equal(price,tokenPrice,'TOKEN PRICE IS CORRECT');
		});
	});

	it('FACILITATES TOKEN BUYING',function(){
		return VITtoken.deployed().then(function(instance){
			tokenInstance = instance;
			return VITtokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			//75% of all token to sale
			return tokenInstance.transfer(tokenSaleInstance.address, tokensAvailable, { from: admin});
		}).then(function(receipt){
			numberOfTokens = 10;
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: numberOfTokens * tokenPrice});
		}).then(function(receipt){
			assert.equal(receipt.logs.length, 1, 'triggers one event');
      		assert.equal(receipt.logs[0].event, 'Sell', 'should be the "Sell" event');
      		assert.equal(receipt.logs[0].args._buyer, buyer, 'logs the account that purchased the tokens');
      		assert.equal(receipt.logs[0].args._amount, numberOfTokens, 'logs the number of tokens purchased');
			return tokenSaleInstance.tokenSold();
		}).then(function(amount){
			assert.equal(amount.toNumber(),numberOfTokens,'INCREAMENT THE NUMBER OF TOKENS SOLD');
			return tokenInstance.balanceOf(buyer);
		}).then(function(balance){
			assert.equal(balance.toNumber(),numberOfTokens);
			return tokenInstance.balanceOf(tokenSaleInstance.address);
		}).then(function(balance){
			assert.equal(balance.toNumber(),tokensAvailable - numberOfTokens);
			//Try to buy tokens different from ether value
			return tokenSaleInstance.buyTokens(numberOfTokens, {from: buyer, value: 1 });
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert')>= 0,'ERROR MESSAGE MUST CONTAIN REVERT1');
			return tokenSaleInstance.buyTokens(8000000, {from: buyer, value: numberOfTokens * tokenPrice});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert')>= 0,'ERROR MESSAGE MUST CONTAIN REVERT2');
		});
	});

	it('ENDS TOKEN SALE',function(){
		return VITtoken.deployed().then(function(instance){
			tokenInstane = instance;
			return VITtokenSale.deployed();
		}).then(function(instance){
			tokenSaleInstance = instance;
			return tokenSaleInstance.endSale({ from: buyer});
		}).then(assert.fail).catch(function(error){
			assert(error.message.indexOf('revert') >= 0, 'MUST BE ADMIN TO END SALE');
			return tokenSaleInstance.endSale({ from: admin});
		}).then(function(receipt){
			return tokenInstance.balanceOf(admin);
		}).then(function(balance){
			assert.equal(balance.toNumber(),9999990,'RETURNS UNSOLD TOKENS');
			return tokenSaleInstance.tokenPrice();
			balance = web3.eth.getBalance(tokenSaleInstance.address)
      		assert.equal(balance.toNumber(), 0);	
		});
	});
});
