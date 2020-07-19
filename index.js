
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const http = require('http');
const https = require('https');
const {
    Worker, isMainThread, parentPort, workerData
} = require('worker_threads');

const Output = require('./Transactions/Output');
const Input = require('./Transactions/Input');
const Transaction = require('./Transactions/Transaction');
const Block = require('./Transactions/Block')

const getOutputDataFromTransaction = require('./Ass3');
const validateTransaction = require('./Ass3');
const findNonce = require('./Ass3');
const getInputDataFromTransaction = require('./Ass3');
const byteArrayFromTransaction = require('./Ass3');
const transactionFromByteArray = require('./Ass3');
const BlockHeader = require("./Transactions/BlockHeader");
const { stat } = require("fs");


const limitOfPeerSize = 5;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.use(express.json())


let resmap = new Map()
let UnusedOutputs = new Map();
let peers = ['iitkbucks.pclub.in']

let PotentialPeers = ['http:/www.google.com'];

let pendingTransactions = [];
let blockHeaders = [];


if (isMainThread) {    




    app.get("/getBlock/:blockNumber", (req, res) => {
        res.setHeader('content-type', 'application/octet-stream');
        // fs.readFileSync
        res.send(blocks[blockNumber].data)


    });

    app.get("/getPendingTransactions", (req, res) => {
        res.setHeader('content-type', 'application/json');
        res.send(JSON.stringify(blocks));
    });

    app.post("/newPeer", (req, res) => {

        if (peers.length >= limitOfPeerSize) {
            res.status(500);
            res.send('limit exceeded');

        }
        peer = req.body.url;
        peers.push(peer);
        res.send('successfully added peer');

    });

    app.get('/getPeers', (req, res) => {

       
        


        res.send(JSON.stringify(peers));
    });

    app.post('/newBlock', (req, res) => {
        blockData = req.body.data;
        // Make block object using blockData
        //validate pura block with checking double spending
        //processblock()
        // post request to all peers with same data.
        blockHeaders.push(blockData);

    });

    app.post('/newTransaction', (req, res) => {

        const inputs = Object.values(req.body.inputs);
        transaction = new Transaction();

        for (const input of inputs) {
            const inputObject = new Input(input.transactionID, input.index, input.signature);
            transaction.inputs.push(inputObject);
        }
        const outputs = Object.values(req.body.outputs);

        for (const output of outputs) {
            const outputObject = new Output(output.amount, output.recipient);
            transaction.outputs.push(outputObject);

        }

        if (validateTransaction(transaction)) {
            pendingTransactions.push(transaction);
            res.send('successfully added transaction');

        }
        else {
            res.status(500);
            res.send('invalid transaction');
        }

    })



    app.get("/list", (req, res) => {

        const obj = Object.fromEntries(resmap)
        res.json(obj)

    });



    app.post("/add", (req, res) => {
        console.log(req.body.key);




        if (!resmap.has(req.body.key)) {

            resmap.set(req.body.key, req.body.value)
            for (let peer of peers) {
                const options = {
                    method: 'POST',
                    headers: {
                        'Content-type': 'application/json'
                    }
                }
                const resstring = JSON.stringify(req.body)
                console.log(req.body)

                // const strrestopeer = JSON.parse(restopeer)


                const reqtopeer = http.request(peer, options, (res) => {
                    console.log('request sent to ')
                    console.log(peer)
                });

                reqtopeer.write(resstring)
                reqtopeer.end()




            }




        }

        //const json1 = JSON.parse(req.body)
        //console.log(json1)


        res.send("Thanks for the post")
    });

    initialise();


    app.listen(3000, () => {
        console.log("server started on port 3000");
    });

    var checkTransaction = setInterval(function() {
        
        if (pendingTransactions.length > 0) {
          clearInterval(checkTransaction);
        }
      }, 1000);

     

    
        const worker = new Worker(__filename, {
            workerData: pendingTransactions
          });

          worker.on('message', (block)=>{

            // block is a new mined block with everything in order.

              //found new block, send to peers
              console.log(block)
          })

    
    
}

else{

    block = new Block();
    block.body = workerData;
    console.log('new worker created');

    let nonce =  startmining(workerData);

    parentPort.postMessage(nonce);


}

function startmining(blockBody){
    //code to mine
    //returns entire block
    
   
}

function initialise() {
    //findPeers();
    console.log('initialised');

    const options2 = {
        hostname: 'iitkbucks.pclub.in',
        path: '/getBlock/1',
        method: 'GET'
    };
    console.log(options2);

    https.request(options2, (res) => {
        const { statusCode } = res;
        console.log(statusCode);
        res.on('data', function (blockData) {

            block = calculateBlockFromData(blockData);
            console.log(block);


          });

        //handle peers
    }).end();
    

   


    //send getblock to one of the peer continuously
    // getpendingtransaction
    // start mining() with subset of pending transaction.




}
function calculateBlockFromData(data){

    let currentPos = 0;
    const index = parseInt(data.readUInt32BE(currentPos).toString(16), 10);
    currentPos += 4;
    console.log('index is' , index);
    const bufA = data.subarray(currentPos, currentPos + 32);
    currentPos += 32;
    const hashOfParentBlock = bufA.toString('hex');
    const bufB = data.subarray(currentPos, currentPos + 32);
    currentPos += 32;
    const hashOfBlockBody = bufB.toString('hex');
    const bufC = data.subarray(currentPos, currentPos + 32);
    currentPos += 32;
    const targetValue = bufC.toString('hex');
    const timestamp = data.readBigUInt64BE(currentPos);
        currentPos += 8;
        const nonce = data.readBigUInt64BE(currentPos);
        currentPos += 8;

    blockHeader1 = new BlockHeader(index, hashOfParentBlock, targetValue,  timestamp.toString(), nonce.toString());
    
    console.log(blockHeader1);
    console.log(currentPos)
    block = new Block();
    block.blockHeader = blockHeader1;
    const numberOfTransactions = parseInt(data.readUInt32BE(currentPos).toString(16), 10);
    currentPos += 4;
    console.log(numberOfTransactions);
    for(let i = 0;i<numberOfTransactions;i++){
        const sizeOfTransaction = parseInt(data.readUInt32BE(currentPos).toString(16), 10);
        console.log(sizeOfTransaction);
        currentPos+=4;
        const transactionData = data.subarray(currentPos, currentPos + sizeOfTransaction);
        currentPos+=sizeOfTransaction;
        console.log(transactionData);
        transaction = transactionFromByteArray(transactionData);
        block.blockBody.push(transaction);

    }
    return block;
}
function processBlock(block) {

    // block header less than parent 
    // target should be equal 
    // hash of n-1 should be parent hash of n

    for (transaction in block.blockBody) {

        validateTransaction(transaction);



    }

    for (transaction in block.blockBody) {
        for (output in transaction.outputs) {
            // transaction IID = hash of transaction.data
            let key = JSON.stringify([transactionIID, (i)]);
            UnusedOutputs.set(key, output);


        }


    }

    blockHeaders.push(block.blockHeader);
    // save the entire data as .dat with name blocki block.data

}

function findPeers() {

    if (peers.length > limitOfPeerSize / 2) return;

    for (peer in PotentialPeers) {

        //set options 
        const options = {
            hostname: peer,
            path: '/newPeer',
            method: 'POST'

        };

        http.request(options, (res) => {
            const { statusCode } = res;

            if (statusCode == 500) {
                //getpeers of peer and then push to PotentialPeers
                peers.push(peer);
                const options2 = {
                    hostname: peer,
                    path: '/getPeers',
                    method: 'GET'
                };

                http.request(options2, (res) => {
                    const stringPeers = res.body;
                    const peers2 = JSON.parse(stringPeers);
                    for (peer2 in peers2) {
                        PotentialPeers.push(peer2);
                    }
                    findPeers();

                    //handle peers
                })

            }

            else if (statusCode == 200) {
                //PotentialPeers.push(getpeers of peer)
            }
        })
    }

    // setTimeout(() => {
    //     findPeers()
    // }, 2000);

}


