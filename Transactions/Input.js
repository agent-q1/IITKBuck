class Input {
    constructor(transactionID, indexOfOutput, signature){
        this.transactionID = transactionID;
        this.indexOfOutput = indexOfOutput;
        this.signature = signature;
    }
}

module.exports = Input