App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',
  	loading: false,
  	tokenPrice: 1000000000000000,
  	tokenSold: 0,
  	tokensAvailable: 7500000,

	init: function(){
		console.log("App initialized....")
		return App.initWeb3();
	},
	initWeb3: function() {
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
  initContracts: function() {
    $.getJSON("VITtokenSale.json", function(vittokenSale) {
      App.contracts.VITtokenSale = TruffleContract(vittokenSale);
      App.contracts.VITtokenSale.setProvider(App.web3Provider);
      App.contracts.VITtokenSale.deployed().then(function(vittokenSale) {
        console.log("VIT Token Sale Address:", vittokenSale.address);
      });
    }).done(function() {
      $.getJSON("VITtoken.json", function(vitToken) {
        App.contracts.VITtoken = TruffleContract(vitToken);
        App.contracts.VITtoken.setProvider(App.web3Provider);
        App.contracts.VITtoken.deployed().then(function(vitToken) {
          console.log("VIT Token Address:", vitToken.address);
        });

        App.listenForEvents();
        return App.render();
      });
    })
  },

  listenForEvents: function() {
    App.contracts.VITtokenSale.deployed().then(function(instance) {
      instance.Sell({}, {
        fromBlock: 0,
        toBlock: 'latest',
      }).watch(function(error, event) {
        console.log("event triggered", event);
        App.render();
      })
    })
  },

  render: function() {

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if(err === null) {
        App.account = account;
        $('#accountAddress').html("Address: " + account);
      }
    })

    // Load token sale contract
    App.contracts.VITtokenSale.deployed().then(function(instance) {
      VITtokenSaleInstance = instance;
      return VITtokenSaleInstance.tokenPrice();
    }).then(function(tokenPrice) {
      App.tokenPrice = tokenPrice;
      $('.token-price').html(web3.fromWei(App.tokenPrice, "ether").toNumber());
      return VITtokenSaleInstance.tokenSold();
    }).then(function(tokenSold) {
      App.tokenSold = tokenSold.toNumber();
      $('.tokens-sold').html(App.tokenSold);
      $('.tokens-available').html(App.tokensAvailable);

      let progressPercent = (Math.ceil(App.tokenSold) / App.tokensAvailable) * 100;
      $('#progress').css('width', progressPercent + '%');

      // Load token contract
      App.contracts.VITtoken.deployed().then(function(instance) {
        VITtokenInstance = instance;
        return VITtokenInstance.balanceOf(App.account);
      }).then(function(balance) {
        $('.vit-balance').html(balance.toNumber());
      })
    });
  },
  buyTokens: function() {
    var numberOfTokens = $('#numberOfTokens').val();
    App.contracts.VITtokenSale.deployed().then(function(instance) {
      return instance.buyTokens(numberOfTokens, {
        from: App.account,
        value: numberOfTokens * App.tokenPrice,
        gas: 500000 // Gas limit
      });
    }).then(function(result) {
      console.log("Tokens bought...")
      $('form').trigger('reset') // reset number of tokens in form
      // Wait for Sell event
    });
  }

}

$(function(){
	$(window).load(function(){
		App.init();
	})
});