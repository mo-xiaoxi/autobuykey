import ethers from 'ethers';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

const Web3 = require('web3');

// todo 多个用户购买
let data = {
    WBNB: 0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c, //wbnb

    to_PURCHASE: '0xbe08C3D86404244616eb986DA1e50291c3852276',  // token that you will purchase = BUSD for test '0xe9e7cea3dedca5984780bafc599bd69add087d56'

    AMOUNT_OF_WBNB: 0.05, // how much you want to buy in WBNB

    factory: 0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73,  //PancakeSwap V2 factory

    router: 0x10ED43C718714eb63d5aA57B78B54704E256024E, //PancakeSwap V2 router

    recipient: 0x8DE7D69CAbf020648c0E750BBa1E9A449fDbB874, //your wallet address,

    Slippage: 49, //in Percentage

    gasPrice: 5, //in gwei

    gasLimit: 345684, //at least 21000

    minBnb: 3 //min liquidity added
};

//config start
let timeLeftBuy = 2; //最后两秒钟购买
let minBuyInterval =  3 * 1000; // 3秒,最小额购买间隔
let minBuyAmout =  1 * 10 ** 9;/// 20000个购买，才能触发
// const bscMainnetUrl = 'https://bsc-dataseed1.defibit.io/' //https://bsc-dataseed1.defibit.io/ https://bsc-dataseed.binance.org/
const wss = 'wss://aged-holy-frog.bsc.quiknode.pro/c58049c92b82c5e642b6538741c827e24f5758fe/';//'wss://bsc-ws-node.nariox.org:443';


//config end


// global values
let jmlBnb = 0;
let waits = 2000;
let initialLiquidityDetected = false;
let lastBuyTime = new Date(); // 最近购买时间
const mnemonic = 0x8eed0dab3cf4f8b875fd770722b2be94001e981da651143fc3249d63f0e8dd8b; //your memonic;
const tokenIn = data.WBNB;
const tokenOut = data.to_PURCHASE;
// const provider = new ethers.providers.JsonRpcProvider(bscMainnetUrl)
const provider = new ethers.providers.WebSocketProvider(wss);
const wallet = new ethers.Wallet(mnemonic);
const account = wallet.connect(provider);
let myaddress = data.recipient;
// let myaddress = "0xAaA29cda83e39AC488B1419a3f48F6ee81d87229";
let gameStats = null;
let timeoutFlag = false;
const contractAddress = data.to_PURCHASE;//目标币种的合约



//   代币合约地址
let poolContract = "0xbe08C3D86404244616eb986DA1e50291c3852276";

let fomoAdmin = "0x88888888E58312A3e2100776Dd6873ACb9dB4f39";

var web3js = new Web3(wss);

// 获取余额
var erc20Contract = new web3js.eth.Contract(erc20abi, poolContract);

// 合约接口
var intefaceContract = new web3js.eth.Contract(poolabi, poolContract);


// ERC20ABI
let erc20abi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "_owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Burn",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "burn",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "burnFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_from",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "_to",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "_value",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "success",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]
// abi
let poolabi = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "minTokensBeforeSwap",
                "type": "uint256"
            }
        ],
        "name": "MinTokensBeforeSwapUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "previousOwner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokensSwapped",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "ethReceived",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "tokensIntoLiqudity",
                "type": "uint256"
            }
        ],
        "name": "SwapAndLiquify",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "bool",
                "name": "enabled",
                "type": "bool"
            }
        ],
        "name": "SwapAndLiquifyEnabledUpdated",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "_devFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_lastBuyAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_liquidityFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_lottoFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_lottoWalletAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_maxTxAmount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_shouldSwapToBNB",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "_taxFee",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "subtractedValue",
                "type": "uint256"
            }
        ],
        "name": "decreaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tAmount",
                "type": "uint256"
            }
        ],
        "name": "deliver",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "excludeFromFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "excludeFromReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "fomoAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "fomoAdmin",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getFomoAddress",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getLottoAddresss",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "inSwapAndLiquify",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "includeInFee",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "includeInReward",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "addedValue",
                "type": "uint256"
            }
        ],
        "name": "increaseAllowance",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "isExcludedFromFee",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "isExcludedFromReward",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "limitStatus",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "lottoAddress",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "openTimeFoMo",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "tAmount",
                "type": "uint256"
            },
            {
                "internalType": "bool",
                "name": "deductTransferFee",
                "type": "bool"
            }
        ],
        "name": "reflectionFromToken",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "router",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address payable",
                "name": "dev",
                "type": "address"
            }
        ],
        "name": "setDevAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "devFee",
                "type": "uint256"
            }
        ],
        "name": "setDevFeePercent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_fomoAdmin",
                "type": "address"
            }
        ],
        "name": "setFomoAdmin",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "enabled",
                "type": "bool"
            }
        ],
        "name": "setLimitStatus",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "liquidityFee",
                "type": "uint256"
            }
        ],
        "name": "setLiquidityFeePercent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "lottoFee",
                "type": "uint256"
            }
        ],
        "name": "setLottoFeePercent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "maxTxPercent",
                "type": "uint256"
            }
        ],
        "name": "setMaxTxPercent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "minFoMoBalance",
                "type": "uint256"
            }
        ],
        "name": "setMinFoMoBalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "minBalance",
                "type": "uint256"
            }
        ],
        "name": "setMinLottoBalance",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "_enabled",
                "type": "bool"
            }
        ],
        "name": "setSwapAndLiquifyEnabled",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "taxFee",
                "type": "uint256"
            }
        ],
        "name": "setTaxFeePercent",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bool",
                "name": "enabled",
                "type": "bool"
            }
        ],
        "name": "setshouldSwapToBNB",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "swapAndLiquifyEnabled",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "rAmount",
                "type": "uint256"
            }
        ],
        "name": "tokenFromReflection",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalFees",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "newOwner",
                "type": "address"
            }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniswapV2Pair",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "uniswapV2Router",
        "outputs": [
            {
                "internalType": "contract IUniswapV2Router02",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "stateMutability": "payable",
        "type": "receive"
    }
]



let buyAction = async () => {
    let nowTime = new Date();
    // 专门为抢key设计的，在sniper中不需要这个最近购买逻辑
    if (initialLiquidityDetected === true &&  nowTime - lastBuyTime < minBuyInterval) {
        console.log(chalk.red('not buy cause already buy and time pass little: '+ (nowTime - lastBuyTime)));
        return null;
    }
    // if (initialLiquidityDetected === true) {
    //     console.log(chalk.red('not buy cause already buy'));
    //     return null;
    // }
    initialLiquidityDetected = true;
    //We buy x amount of the new token for our wbnb
    const amountIn = ethers.utils.parseUnits(`${data.AMOUNT_OF_WBNB}`, 'ether');
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);

    //Our execution price will be a bit different, we need some flexbility
    const amountOutMin = amounts[1].sub(amounts[1].div(`${data.Slippage}`));
    // 如果购买的小于最小值, 增大购买额
    if (amountOutMin < minBuyAmout) {
        // 依次增加一些币
        data.AMOUNT_OF_WBNB = parseFloat((data.AMOUNT_OF_WBNB + 0.01).toFixed(3));
        console.log(chalk.red(`Add AMOUNT_OF_WBNB: ${data.AMOUNT_OF_WBNB} WBNB`));
        return await buyAction();
    }
    console.log(chalk.green('ready to buy.'));
    console.log(
        chalk.green.inverse(`Start to buy \n`)
        +
        `Buying Token
      =================
      tokenIn: ${amountIn.toString()} ${tokenIn} (WBNB)
      tokenOut: ${amountOutMin.toString()} ${tokenOut}
    `);
    lastBuyTime = new Date();

    // console.log('Processing Transaction.....');
    // console.log(chalk.yellow(`amountIn: ${amountIn}`));
    // console.log(chalk.yellow(`amountOutMin: ${amountOutMin}`));
    // console.log(chalk.yellow(`tokenIn: ${tokenIn}`));
    // console.log(chalk.yellow(`tokenOut: ${tokenOut}`));
    // console.log(chalk.yellow(`data.recipient: ${data.recipient}`));
    // console.log(chalk.yellow(`data.gasLimit: ${data.gasLimit}`));
    // console.log(chalk.yellow(`data.gasPrice: ${ethers.utils.parseUnits(`${data.gasPrice}`, 'gwei')}`));


    // let beginTime = new Date();
    // console.log(beginTime.toLocaleString());
    const tx = await router.swapExactTokensForTokens(
        amountIn,
        amountOutMin,
        [tokenIn, tokenOut],
        data.recipient,
        Date.now() + 10 * 60 * 10, //10 minutes
        {
            'gasLimit': data.gasLimit,
            'gasPrice': ethers.utils.parseUnits(`${data.gasPrice}`, 'gwei')
            // 'nonce' : 25 //set you want buy at where position in blocks
        });
    console.log(chalk.green('buy Send...'));
    // let nowTime = new Date();
    // console.log(nowTime.toLocaleString());
    // console.log(nowTime-beginTime);
    // const receipt = await tx.wait();
    // console.log(`Transaction receipt : https://www.bscscan.com/tx/${receipt.logs[1].transactionHash}`);
    // let endTime = new Date();
    // console.log(endTime-beginTime);
    // console.log(endTime.toLocaleString());
    return true
};

// 自动卖出购买到的token
let sellAction = async () => {

}




// 超时触发器
class MyPromise extends Promise {
    constructor(timeout, callback) {
        // We need to support being called with no milliseconds
        // value, because the various Promise methods (`then` and
        // such) correctly call the subclass constructor when
        // building the new promises they return.
        const haveTimeout = typeof timeout === "number";
        const init = haveTimeout ? callback : timeout;
        super((resolve, reject) => {
            if (haveTimeout) {
                const timer = setTimeout(() => {
                    reject(new Error(`Promise timed out after ${timeout}ms`));
                }, timeout);
                init(
                    (value) => {
                        clearTimeout(timer);
                        resolve(value);
                    },
                    (error) => {
                        clearTimeout(timer);
                        reject(error);
                    }
                );
            } else {
                init(resolve, reject);
            }
        });
    }
    // Pick your own name of course. (You could even override `resolve` itself
    // if you liked; just be sure to do the same arguments detection we do
    // above in the constructor, since you need to support the standard use of
    // `resolve`.)
    static resolveWithTimeout(timeout, x) {
        if (!x || typeof x.then !== "function") {
            // `x` isn't a thenable, no need for the timeout,
            // fulfill immediately
            return this.resolve(x);
        }
        return new this(timeout, x.then.bind(x));
    }
}



let checkBuySucc = async () => {
    // 十秒没检测到就超时退出
    if(timeoutFlag === true){
        initialLiquidityDetected = false;
        return false
    }
    let p = new MyPromise(10000, (resolve, reject) => {
        const contract = new ethers.Contract(contractAddress, contractABI, provider)
        contract.gameStats()
            .then(async (val) => {
                // console.log("val", val)
                gameStats = convertStats(val);
                // myaddress = '0x1bf94AcE856a08c4d011F5Fdcd8E3951d51C63B9';
                // 检查最新的两位
                for (let i = 0; i < 2; i++) {
                    if (gameStats.lastBuyers[i].address == myaddress) {
                        // if (gameStats.lastBuyers[0] == myaddress) {
                        console.log(chalk.green('Buy succ!'));
                        initialLiquidityDetected = false;
                        return true;
                    }
                }
                console.log(chalk.white('Check buy again....' + myaddress + '\t' + gameStats.lastBuyers[0].address));
                return await checkBuySucc();
            })
    });
    p.catch((error) => {
        // console.log('Time Out....');
        timeoutFlag = true;
        return false;
    });
};



let rush = async () => {

    let endTime = await intefaceContract.methods.openTimeFoMo().call();
    var now = new Date();
    now = (Date.parse(now) / 1000);
    var timeLeft = endTime - now;
    console.log(chalk.yellow("Now: " + now.toLocaleString() + ", Time Countdown:" + timeLeft));
    // 等待时间依据游戏剩余时间，渐进变化
    if (timeLeft > 600) {
        waits = 30000;
    } else if (timeLeft > 60) {
        waits = 5000;
    } else if (timeLeft > 4) {
        waits = 1000;
    } else {
        waits = 100;
    }
    // 截止时间小于100秒，买入。且大于一成功为止
    if (timeLeft >=0 && timeLeft<= timeLeftBuy) {
        //
        let lastAddress = await intefaceContract.methods._lastBuyAddress().call();
        // console.log("LastAddress:" + lastAddress);
        if (lastAddress != myAddress) {
            console.log(chalk.green("LastAddress:" + lastAddress + " is not me:" + myAddress + ", buy!!!"));
            // await buyAction();
            // await checkBuySucc();
        } else {
            console.log(chalk.green("LastAddress:" + lastAddress + " is me:" + myAddress + ", nice job!!!"));
        }

    }
};

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
};


const run = async () => {
    let flag = await checkLiq();
    if (flag) {
        buyAction();
    }
};



// rush();






// function get_lastAddress() {
//     let lastAddress = intefaceContract.methods._lastBuyAddress().call();
//     // document.getElementById("lastAddress").innerText = lastAddress;
//     console.log("lastAddress:" + lastAddress);
//     return lastAddress;
// }
//
// // count
// function get_count_down(callback) {
//     function finish(x) {
//         console.log(x)
//         return x
//     }
//
//     var result = intefaceContract.methods.openTimeFoMo().call()
//     console.log(result)
//
//     // {}, function(error, result) {
//     //     let endTime;
//     //     endTime = result;
//     //     var now = new Date();
//     //     now = (Date.parse(now) / 1000);
//     //
//     //     var timeLeft = endTime - now;
//     //     console.log("timeLeft:"+timeLeft);
//     //     // if (now >= endTime){
//     //     //     timeLeft = 0;
//     //     // }
//     // }).then(finish);
//     // console.log(2);
// }



function buy() {

}


// get_lastAddress();

// get_count_down();


// run();
async function main() {
    while (true) {
        await rush();
        await wait(waits);
    }
}

// main();

rush();
