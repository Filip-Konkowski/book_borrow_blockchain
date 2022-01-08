// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const { ethers } = require("hardhat");
const hre = require("hardhat");
const fs = requirep('fs');

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const [deployer] = await ethers.getSigners();
  console.log(`Deploying constracts with the account: ${deployer.address}`);

  const balance = await deployer.getBalance();
  console.log(`Account balance: ${balance.toString()}`);

  const BookLibrary = await hre.ethers.getContractFactory("Adoption");
  const bookLibrary = await BookLibrary.deploy();

  await bookLibrary.deployed();

  console.log("bookLibrary deployed to:", bookLibrary.address);

  const data = {
    address: bookLibrary.address,
    abi: JSON.parse(bookLibrary.interface.format('json'))
  }
  fs.writeFileSync('src/Adoption.json', JSON.stringify(data))
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
