module.exports = {

  compilers: {
    solc: {
      version: "0.8.0", 
    }
  },
  // See <http://truffleframework.com/docs/advanced/configuration>
  // for more about customizing your Truffle configuration!
  networks: {
    hardhat: {},
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*" // Match any network id
    },
    develop: {
      port: 7545,
      network_id: "*" // Match any network id
    },
    loggingEnabled: true
  }
};
