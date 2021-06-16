pragma solidity ^0.5.16;

import "./VITtoken.sol";

contract VITtokenSale{

	address payable admin;
	VITtoken public tokenContract;
	uint256 public tokenPrice;
	uint256 public tokenSold;

	event Sell(address _buyer, uint256 _amount);

	constructor(VITtoken _tokenContract, uint256 _tokenPrice) public{
		admin = msg.sender;
		tokenContract = _tokenContract;
		tokenPrice = _tokenPrice;
	}

	function multiply(uint x, uint y) internal pure returns(uint z){
		require(y ==0 || (z = x * y)/y == x);
	}

	//BUY TOKENS
	function buyTokens(uint256 _numberOfTokens) public payable{

		require(msg.value == multiply(_numberOfTokens,tokenPrice));
		require(tokenContract.balanceOf(address(this)) >= _numberOfTokens);
		require(tokenContract.transfer(msg.sender,_numberOfTokens));

		tokenSold += _numberOfTokens;

		emit Sell(msg.sender, _numberOfTokens);
	}

	function endSale() public {
		require(msg.sender == admin);
		require(tokenContract.transfer(admin,tokenContract.balanceOf(address(this))));
		admin.transfer(address(this).balance);
		//tokenSold = 0;
	}
}