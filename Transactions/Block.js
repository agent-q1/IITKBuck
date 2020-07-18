const BlockHeader = require('./BlockHeader');

class Block {

    constructor(){
        this.blockbody = [];
        this.blockHeader = new BlockHeader();

    }
   
}

module.exports = Block