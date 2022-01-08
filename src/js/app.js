App = {
  web3Provider: null,
  contracts: {},

  init: async function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return await App.initWeb3();
  },

  initWeb3: async function() {
    // Modern dapp browsers...
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });;
      } catch (error) {
        // User denied account access...
        console.error("User denied account access")
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      App.web3Provider = window.web3.currentProvider;
    }
    // If no injected web3 instance is detected, fall back to Ganache
    else {
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
    }
    web3 = new Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {
    $.getJSON('Adoption.json', function(data) {
      // Get the necessary contract artifact file and instantiate it with @truffle/contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact);
    
      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);
    
      // Use our contract to retrieve and mark the adopted pets
      return App.markAdopted();
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function() {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;
      return adoptionInstance.getBorrowedBookIds.call();
    }).then(function(borrowedBooks) {
      let arrayBorrowedBoooks = {};
      if (borrowedBooks.length == 0) {
        return;
      }
      for (bookNumber = 0; bookNumber < borrowedBooks.length; bookNumber++) {
        let item = borrowedBooks[bookNumber].words[0];
        if(!arrayBorrowedBoooks[item]) {
          arrayBorrowedBoooks[item] = item; 
        }
      }

      const bookids = [];
      for (let element in arrayBorrowedBoooks) bookids.push(Number(element));

      return adoptionInstance.getLegers.call(bookids);
    }).then(function(legers) {
      let bookCounter = {};
      let lastBooks = {};
      for (books of legers) {
        for (book of books) {
          if (bookCounter[book.bookId]) {
            bookCounter[book.bookId] = bookCounter[book.bookId] + 1;
          } else {
            bookCounter[book.bookId] = 1
          }
          if (lastBooks[book.bookId]) {
            if (lastBooks[book.bookId].timeOfReturn < book.timeOfReturn) {
              lastBooks[book.bookId] = book;
            }
          } else {
            lastBooks[book.bookId] = book;
          }
        }  
        for (let bookId in bookCounter) {
          $('.panel-pet').eq(bookId).find('.pet-age').text(bookCounter[bookId]);
        }
      }
      return lastBooks;
    }).then(function (lastBooks) {
      for (let key in lastBooks) {
        let book = lastBooks[key];
        const fiveMin = 5*60;
        const whenCanBeBorrow = (Date.now()/1000) - 1*60;
        if (book.timeOfReturn > whenCanBeBorrow)  {
          let returnDate = new Date(book.timeOfReturn*1000+60000);
          $('.panel-pet').eq(book.bookId).find('button').text('Borrowed').attr('disabled', true);
          $('.panel-pet').eq(book.bookId).find('.pet-breed').text(`${returnDate.getFullYear() + '-' + ('0' + (returnDate.getMonth()+1)).slice(-2) + '-' + ('0' + returnDate.getDate()).slice(-2)} 
          ${returnDate.getUTCHours() + ':' + ('0' + (returnDate.getUTCMinutes()+1)).slice(-2) + ':' + ('0' + returnDate.getUTCSeconds()).slice(-2)} UTC`)
        } else {
          $('.panel-pet').eq(book.bookId).find('.pet-breed').text('returned')
        }
        $('.panel-pet').eq(book.bookId).find('.pet-location').text(book.borrower.slice(2, 20))
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();
    var petId = parseInt($(event.target).data('id'));
    var adoptionInstance;
    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;
        // Execute adopt as a transaction by sending account
        return adoptionInstance.borrow(petId, {from: account});
      }).then(function(result) {
        return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
