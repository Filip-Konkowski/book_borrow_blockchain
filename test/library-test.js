const { expect } = require("chai");
const { ethers } = require("hardhat");

let libContract;
let MyLibrary;
let owner;

beforeEach(async function () {
  // Get the ContractFactory and Signers here.
  MyLibrary = await ethers.getContractFactory("Adoption");
  [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

  // To deploy our contract, we just have to call Token.deploy() and await
  // for it to be deployed(), which happens once its transaction has been
  // mined.
  libContract = await MyLibrary.deploy();
});

describe("Adoption", function () {
  it("borrowed books has record of one borrowed book", async function () {

    await libContract.borrow(123);
    const result = await libContract.getBorrowers();

    expect(result.length).to.equal(1);
    expect(result[0]).to.equal(owner.address);
  });

  it("Check if the borrowed books are saved in chain", async function () {
    await libContract.borrow(222);
    const result = await libContract.getBorrowedBookIds();
    expect(result.length).to.equal(1);
    expect(result[0]).to.equal(222);
  })

  it("Non books borrowed should return empty array", async function () {

    const result = await libContract.getBorrowedBookIds();
    expect(result.length).to.equal(0);
  })

  it("Check _leger of borrowed book", async function () {
    await libContract.borrow(222);
    
    const result = await libContract.getLeger(222)

    const start = Date.now()/1000
    expect(Number(result[0]['timeOfReturn'])).to.be.above(start);
  })

  it("Return correct Legers", async function() {
    await libContract.borrow(222);
    await libContract.borrow(111);
    await libContract.borrow(1);
    await libContract.borrow(222);
    const result = await libContract.getLegers([222,111,1])
    
    const start = Date.now()/1000
    expect(Number(result[0][0]['timeOfReturn'])).to.be.above(start);
    expect(Number(result[0][1]['timeOfReturn'])).to.be.above(start);
    expect(result[0][3]).to.be.an('undefined');
  })

  // it("Check _leger when borrower overrid book", async function () {
  //   await libContract.borrow(222);
  //   const resultOne = await libContract.getLeger(222)

  //   await libContract.borrow(222);
  //   const resultTwo = await libContract.getLeger(222)
   
  //   const start = Date.now()/1000
  //   expect(resultOne[1]).to.be.an('undefined');
  //   // expect(Number(resultOne[0]['timeOfReturn'])).to.not.equal(resultTwo[1]['timeOfReturn']);
  //   console.log(resultOne)
  //   expect(Number(resultOne['timeOfReturn'])).to.not.equal(resultTwo['timeOfReturn']);
  // })
});
