// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract Adoption {
    struct BookHistory {
        uint bookId;
        uint timeOfReturn;
        address borrower;
    }
    mapping(address => uint) public _borrowerToBookId;
    address[] public _borrowers;
    BookHistory[] public _item;
    mapping(uint => BookHistory[]) public _leger;
    uint[] public _borrowedBooks;
   

    function getBorrowedBookIds() public view returns (uint[] memory) {
        return _borrowedBooks;
    }

    function getBorrowers() public view returns (address[] memory) {
        return _borrowers;
    }

    function getLastLeger(uint bookId) public view returns (BookHistory memory) {
        uint lastItem = _leger[bookId].length -1;
        return _leger[bookId][lastItem];
    }

    function getLegers(uint[] memory bookIds) public view returns (BookHistory[][] memory) {
        BookHistory[][] memory books = new BookHistory[][](bookIds.length);
        for (uint i = 0; i < bookIds.length; i++) {
            BookHistory[] memory book = getLeger(bookIds[i]);
            books[i] = book;
        }
        
        return books;
    }

    function getLeger(uint bookId) public view returns (BookHistory[] memory) {
        return _leger[bookId];
    }

    function checkBookHistry(uint bookId) public view returns (bool) {
        if(_leger[bookId].length > 0) {
            return true;
        }

        return false;
    }

    function borrow(uint bookId) public returns (uint) {
        _borrowerToBookId[msg.sender] = bookId;
        _borrowers.push(msg.sender);
        if(_leger[bookId].length > 0) {
            BookHistory[] storage history = _leger[bookId];
            history.push(BookHistory(bookId, block.timestamp, msg.sender));
            _leger[bookId] = history;
        } else {
            BookHistory memory b = BookHistory(bookId, block.timestamp, msg.sender);
            _item.push(b);
            _leger[bookId] = _item;
        }
        _borrowedBooks.push(bookId);
        return block.timestamp;
    }
}