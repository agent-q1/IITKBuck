const Output = require('./Transactions/Output');
const Input = require('./Transactions/Input');
const Transaction = require('./Transactions/Transaction');
const crypto = require('crypto');
const fs = require('fs');
const now = require('nano-time');


// console.log(crypto.createHash('sha256').update(data).digest('hex'));


let UnusedOutputs = new Map();

const str = 'cc7f49ea1a79fea25e82eb187f674b75bfa80e99155d088866f8f32d7ef1212c00000001659509c0d11708c86f2528a2d5fa0202b79f29b6fa550b1a6d7f4893a60c976d';
const signature = '1e1e10a3c9223c9fb15526eea048093a18220b8616444a50725e4f313b7968718527d09550198e07ec3a0cf4e4c1578ba8e9f43a69c61fad267aaff2cb019dfa72005e53e112015459aca15ce287ac52ca3ece1121dd1c3cd3e939419014507f4109ff69e7cb356edc97a54c08fb851647ffc1ecfe6625f4d63c2cdc05ea5c907350a4136ba2726f4c238fbfea2d1754ac31395d9c2e6e28ea73a6321ae7147b45a996e9aa97439a11ea4a2093ca0954d519caa047cce1f1742a8e24a50ba8433a9700e68a8127e00691f33f6b4c562448ac3186acf1743030b09096de443e7b05af46f7229c4c98c5f7c59d6c7f35120494023d134ba414ff87acb8ef26bfd0';
verify(signature, str);





function sign(str) {
    const privateKey = fs.readFileSync("a_private.pem");

    const dataToBeSigned = Buffer.from(str, 'hex');
    const sign = crypto.createSign('SHA256');
    sign.update(dataToBeSigned);
    sign.end();


    const privateKeyObject = {
        key: privateKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32

    }
    //const signatureBuffer = sign.sign(privateKeyObject);
    const signatureString = sign.sign(privateKeyObject, 'hex');

    console.log(signatureString);
    return signatureString;
    //const verify = crypto.createVerify('SHA256');




}

function verify(signatureString, str) {
    const verify = crypto.createVerify('SHA256');
    const dataThatWasSigned = Buffer.from(str, 'hex');
    const publicKey = fs.readFileSync("a_public.pem");
    verify.update(dataThatWasSigned);
    verify.end();
    const publicKeyObject = {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
        saltLength: 32

    }
    console.log(verify.verify(publicKeyObject, signatureString, 'hex'));


}


function transactionFromByteArray(data) {




    let currentPos = 0;
    transaction = new Transaction();


    const numberOfInputs = parseInt(data.readUInt32BE(currentPos).toString(16), 10);
    currentPos += 4;

    for (var i = 0; i < numberOfInputs; i++) {

        const bufA = data.subarray(currentPos, currentPos + 32);
        currentPos += 32;
        const transactionId = bufA.toString('hex');
        const indexofOutput = data.readUInt32BE(currentPos).toString(10);
        currentPos += 4;
        const lengthOfSignature = data.readUInt32BE(currentPos).toString(10);
        currentPos += 4;

        const bufSignature = data.subarray(currentPos, currentPos + parseInt(lengthOfSignature, 10));
        currentPos += parseInt(lengthOfSignature, 10);
        const signature = bufSignature.toString('hex');
        input = new Input(transactionId, indexofOutput, signature);
        transaction.inputs.push(input);


    }

    const numberOfOutputs = parseInt(data.readUInt32BE(currentPos).toString(16), 10);
    currentPos += 4;

    for (var i = 0; i < numberOfOutputs; i++) {
        const numberOfCoins = data.readBigUInt64BE(currentPos);
        currentPos += 8;
        const lengthOfPublicKey = data.readUInt32BE(currentPos);
        currentPos += 4;
        const bufPublicKey = data.subarray(currentPos, currentPos + lengthOfPublicKey);
        currentPos += lengthOfPublicKey;

        output = new Output(numberOfCoins.toString(10), bufPublicKey);
        transaction.outputs.push(output);
    }

    return transaction;

}

function byteArrayFromTransaction(transaction) {


    let TotalInputBuf = getInputDataFromTransaction(transaction);


    let TotalOutputBuf = getOutputDataFromTransaction(transaction);


    const TotalTransactionBuf = Buffer.concat([TotalInputBuf, TotalOutputBuf], TotalOutputBuf.length + TotalInputBuf.length);

    return TotalTransactionBuf;




}

function getOutputDataFromTransaction(transaction) {

    const outputs = transaction.outputs;
    const NumberOfOutputs = outputs.length;
    const OutputbufA = Buffer.alloc(4);
    OutputbufA.writeUInt32BE(NumberOfOutputs, 0);
    let TotalOutputBuf = Buffer.concat([bufA], bufA.length);

    let OutputBuf;


    for (var i = 0; i < NumberOfOutputs; i++) {
        const output = outputs[i];

        const numberOfCoins = BigInt(output.coins);
        console.log(numberOfCoins.toString());
        const bufB = Buffer.alloc(8);
        bufB.writeBigInt64BE(numberOfCoins);

        //const bufE = pem.decode(file);
        const bufE = output.publicKey;
        const bufD = Buffer.alloc(4);
        bufD.writeUInt32BE(bufE.length);

        OutputBuf = Buffer.concat([bufB, bufD, bufE], bufB.length + bufD.length + bufE.length);

        TotalOutputBuf = Buffer.concat([TotalOutputBuf, OutputBuf], TotalOutputBuf.length + OutputBuf.length);

    }

    return TotalOutputBuf;

}

function getInputDataFromTransaction(transaction) {

    const inputs = transaction.inputs;

    const numeberOfInputs = inputs.length;
    let bufA = Buffer.alloc(4);
    bufA.writeUInt32BE(numeberOfInputs, 0);
    let TotalInputBuf = Buffer.concat([bufA], bufA.length);

    let InputBuf;



    for (var i = 0; i < numeberOfInputs; i++) {
        let input = inputs[i];
        let bufB = Buffer.from(input.transactionID, 'hex');
        let bufC = Buffer.alloc(4);

        bufC.writeUInt32BE(parseInt(input.indexOfOutput, 10));


        let bufE = Buffer.from(input.signature, 'hex');
        let bufD = Buffer.alloc(4);
        bufD.writeUInt32BE(bufE.length);

        InputBuf = Buffer.concat([bufB, bufC, bufD, bufE], bufB.length + bufC.length + bufD.length + bufE.length);

        TotalInputBuf = Buffer.concat([TotalInputBuf, InputBuf], TotalInputBuf.length + InputBuf.length);

    }

    return TotalInputBuf;


}

function findNonce(data, target) {

    for (var i = 0; ; i++) {
        const bufA = Buffer.alloc(8);
        bufA.writeBigUInt64BE(BigInt(now()));
        const bufB = Buffer.alloc(8);
        bufB.writeBigUInt64BE(i);

        const buf = Buffer.concat([data, bufA, bufB], data.length + bufA.length + bufB.length);
        hexHash = crypto.createHash('sha256').update(buf).digest('hex')

        if (hexHash < target) {
            return {
                nonce: i,
                data: buf,
                hash: hexHash
            }
        }

    }


}

function validateTransaction(transaction) {

    const dataToBeSigned = getOutputDataFromTransaction(transaction);

    const hashData = crypto.createHash('sha256').update(dataToBeSigned);

    let sumOfInputCoins = 0, sumOfOutputCoins = 0;

    for (let i = 0; i < transaction.outputs.length; i++) {
        let output = transaction.outputs[i];
        sumOfOutputCoins += output.coins;
    }



    for (let i = 0; i < transaction.inputs.length; i++) {
        let input = transaction.inputs[i];
        let key = JSON.stringify([input.transactionID, input.indexOfOutput]);

        if (!UnusedOutputs.has(key)) {
            return false;
        }

        output = UnusedOutputs.get(key);
        UnusedOutputs.delete(key);
        sumOfInputCoins += output.coins;
        userPublicKey = output.publicKey;

        const transactionID = input.transactionID;
        const bufTransactionID = Buffer.from(transactionID, 'hex');

        const indexOfInput = input.indexOfOutput;
        const bufIndexOfInput = Buffer.alloc(4);
        bufIndexOfInput.writeInt32BE(bufIndexOfInput);

        const FinalDataToBeSigned = Buffer.concat([bufTransactionID, bufIndexOfInput, hashData], bufTransactionID.length + bufIndexOfInput.length + hashData.length);

        
        const verify = crypto.createVerify('SHA256');
       
        verify.update(FinalDataToBeSigned);
        verify.end();
        const publicKeyObject = {
            key: userPublicKey,
            padding: crypto.constants.RSA_PKCS1_PSS_PADDING,
            saltLength: 32

        }
        if(!verify.verify(publicKeyObject, input.signature, 'hex')){
            return false;
        }
        
    }
    return (sumOfInputCoins >= sumOfOutputCoins);


}

module.exports = validateTransaction;
module.exports = getOutputDataFromTransaction;
module.exports = findNonce;
module.exports = getInputDataFromTransaction;
module.exports = byteArrayFromTransaction;
module.exports = transactionFromByteArray;
