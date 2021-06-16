const VITtoken = artifacts.require("./VITtoken.sol");

const VITtokenSale = artifacts.require("./VITtokenSale.sol");

module.exports = function (deployer) {
  deployer.deploy(VITtoken, 10000000).then(function(){
  	//price = 0.001 ether
  	let tokenPrice = 1000000000000000;
  	return deployer.deploy(VITtokenSale,VITtoken.address,tokenPrice);
  });
};
