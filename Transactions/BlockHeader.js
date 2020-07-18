class BlockHeader{
    constructor(index, hashOfParent, hashOfBlockBody, targetValue, timestamp, nonce){
        this.index = index;
        this.hashOfParent = hashOfParent;
        this.hashOfBlockBody = hashOfBlockBody;
        this.targetValue = targetValue;
        this.timestamp = timestamp;
        this.nonce = nonce;
        
    }
}

module.exports = BlockHeader;