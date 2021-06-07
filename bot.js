const ethers = require('ethers');
const chalk = require('chalk');
const dotenv = require('dotenv');
dotenv.config();

// todo 多个用户购买, 自动卖
let config = {
    wallteAddress: process.env.WALLETADDRESS,
    privateKey: process.env.PRIVATEKEY,

    targetSymbol: process.env.TARGTSYMBOL,
    targetAddress: process.env.TARGTSADDRESS, // 目标购买的币

    baseSymbol: process.env.BASESYMBOL,
    baseAddress: process.env.BASEADDRESS, // 用什么货币购买
    buyAmountInBase: parseFloat(process.env.BUYAMOUNTINBASE), // 准备付多少的基础货币
    slippage: parseFloat(process.env.SLIPPAGE),
    GWEI: parseInt(process.env.GWEI),
    gasLimit: parseInt(process.env.GAS_LIMIT),

    timeLeftBuy: parseInt(process.env.TIMELEFTBUY), //最后四秒购买
    minBuyAmout: parseInt(process.env.MINBUYAMOUT) * 10 ** 9,/// 20000个购买，才能触发

    factory: process.env.FACTORY,  //PancakeSwap V2 factory
    router: process.env.ROUTER, //PancakeSwap V2 router
    wss: process.env.WSS//'wss://bsc-ws-node.nariox.org:443';
};



let timeLeftBuy = parseInt(config.timeLeftBuy); //最后4秒钟购买
// let minBuyInterval =  3 * 1000; // 3秒,最小额购买间隔
let minBuyAmout = parseInt(config.minBuyAmout);/// 20000个购买，才能触发
// const bscMainnetUrl = 'https://bsc-dataseed1.defibit.io/'; //https://bsc-dataseed1.defibit.io/ https://bsc-dataseed.binance.org/
let waits = 2000;
let initialLiquidityDetected = false;
let gameStats = null;
let timeoutFlag = false;


const privateKey = config.privateKey;
// const provider = new ethers.providers.JsonRpcProvider(bscMainnetUrl)
const provider = new ethers.providers.WebSocketProvider(config.wss);
const wallet = new ethers.Wallet(privateKey);
const account = wallet.connect(provider);
const myAddress = config.wallteAddress;

const contractAddress = config.targetAddress;//目标币种的合约


const contractABI = [
    {
        "inputs": [],
        "name": "gameStats",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "currentRoundNumber",
                "type": "uint256"
            },
            {
                "internalType": "int256",
                "name": "currentTimeLeft",
                "type": "int256"
            },
            {
                "internalType": "uint256",
                "name": "currentPotValue",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentTimeLeftAtLastBuy",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentLastBuyBlock",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentBlockTime",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "currentBlockNumber",
                "type": "uint256"
            },
            {
                "internalType": "address[]",
                "name": "lastBuyerAddress",
                "type": "address[]"
            },
            {
                "internalType": "uint256[]",
                "name": "lastBuyerData",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "view",
        "constant": true,
        "type": "function"
    }
];


const factory = new ethers.Contract(
    config.factory,
    [
        'event PairCreated(address indexed token0, address indexed token1, address pair, uint)',
        'function getPair(address tokenA, address tokenB) external view returns (address pair)'
    ],
    account
);

const router = new ethers.Contract(
    config.router,
    [
        'function getAmountsOut(uint amountIn, address[] memory path) public view returns (uint[] memory amounts)',
        'function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)'
    ],
    account
);

const erc = new ethers.Contract(
    config.baseAddress,
    [{
        "constant": true,
        "inputs": [{"name": "_owner", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "balance", "type": "uint256"}],
        "payable": false,
        "type": "function"
    }],
    account
);


let buyAction = async () => {
    if (initialLiquidityDetected === true) {
        console.log(chalk.red('not buy cause already buy'));
        return null;
    }
    initialLiquidityDetected = true;
    const tokenIn = config.baseAddress;
    const tokenOut = config.targetAddress;
    //We buy x amount of the new token for our wbnb
    const amountIn = ethers.utils.parseUnits(`${config.buyAmountInBase}`, 'ether');
    const amounts = await router.getAmountsOut(amountIn, [tokenIn, tokenOut]);

    //Our execution price will be a bit different, we need some flexbility
    const amountOutMin = amounts[1].sub(amounts[1].div(`${config.slippage}`));
    // 如果购买的小于最小值, 增大购买额
    if (amountOutMin < minBuyAmout) {
        // 依次增加一些币
        config.buyAmountInBase = parseFloat((config.buyAmountInBase + 0.01).toFixed(3));
        console.log(chalk.red(`Add BUYAMOUNTINBASE: ${config.buyAmountInBase} WBNB`));
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
        config.wallteAddress,
        Date.now() + 1000 * 10, //10 s
        {
            'gasLimit': config.gasLimit,
            'gasPrice': ethers.utils.parseUnits(`${config.GWEI}`, 'gwei')
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


const convertStats = (val) => {
    const stats = {};

    stats.roundNumber = parseInt(val.currentRoundNumber.toString());
    stats.potValue = parseFloat(val.currentPotValue.toString()) / 1e18;
    stats.timeLeftAtLastBuy = parseInt(val.currentTimeLeftAtLastBuy.toString());
    stats.lastBuyBlock = parseInt(val.currentLastBuyBlock.toString());
    stats.currentBlockTime = parseInt(val.currentBlockTime.toString());
    stats.currentBlockNumber = parseInt(val.currentBlockNumber.toString());

    stats.lastBuyers = [];

    let index = 0;

    for (let index = 0; index < val.lastBuyerAddress.length; index++) {
        const address = val.lastBuyerAddress[index];
        stats.lastBuyers.push({address})
    }
    for (let index = 0; index < stats.lastBuyers.length; index++) {
        const buyer = stats.lastBuyers[index];

        // console.log("index ", index * 6 + 0)

        buyer.amount = parseFloat(val.lastBuyerData[index * 6 + 0].toString()) / 1e9
        buyer.timeLeftBefore = parseInt(val.lastBuyerData[index * 6 + 1].toString())
        buyer.timeLeftAfter = parseInt(val.lastBuyerData[index * 6 + 2].toString())
        buyer.blockTime = parseInt(val.lastBuyerData[index * 6 + 3].toString())
        buyer.blockNumber = parseInt(val.lastBuyerData[index * 6 + 4].toString())
        buyer.payoutAmount = parseFloat(val.lastBuyerData[index * 6 + 5].toString()) / 1e18
    }

    return stats
}

// 每次购买发送，到上区块大概5-6秒。每个区块3秒钟
const calculateTimeLeftSeconds = () => {
    // 与最后一个购买者相比，过去了多少区块
    const elapsedBlocks = gameStats.currentBlockNumber - gameStats.lastBuyBlock;
    // 与目前区块相比，过去了多久
    const elapsedTimeSinceCurrentBlock = Math.floor(Date.now() / 1000) - gameStats.currentBlockTime;

    const elapsedTime = elapsedBlocks * 3 + elapsedTimeSinceCurrentBlock

    return gameStats.timeLeftAtLastBuy - elapsedTime
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
    if (timeoutFlag === true) {
        initialLiquidityDetected = false;
        return false
    }
    let p = new MyPromise(10000, (resolve, reject) => {
        const contract = new ethers.Contract(contractAddress, contractABI, provider)
        contract.gameStats()
            .then(async (val) => {
                // console.log("val", val)
                gameStats = convertStats(val);
                // myAddress = '0x1bf94AcE856a08c4d011F5Fdcd8E3951d51C63B9';
                // 检查最新的两位
                for (let i = 0; i < 2; i++) {
                    if (gameStats.lastBuyers[i].address == myAddress) {
                        // if (gameStats.lastBuyers[0] == myAddress) {
                        console.log(chalk.green('Buy succ!'));
                        initialLiquidityDetected = false;
                        return true;
                    }
                }
                console.log(chalk.white('Check buy again....' + myAddress + '\t' + gameStats.lastBuyers[0].address));
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
    // setTimeout();
    // console.log("fetching..")
    const contract = new ethers.Contract(contractAddress, contractABI, provider)
    contract.gameStats()
        .then(async (val) => {
            // console.log("val", val)
            gameStats = convertStats(val)
            // console.log(gameStats);
            const timeLeft = calculateTimeLeftSeconds();
            const nowTime = new Date().toLocaleString();
            console.log(chalk.yellow("Now: " + nowTime + ", Time Countdown:" + timeLeft));
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
            // 等待多久的时候买
            if (timeLeft > 0 && timeLeft <= timeLeftBuy) {
                // 最新的购买者不是自己 就购买
                let flag_buy = true;
                let num = -1;
                for (let i = 0; i < 1; i++) {
                    const buyer = gameStats.lastBuyers.length > i ? gameStats.lastBuyers[i] : null
                    // if (buyer.address == data.recipient) {
                    if (buyer.address == myAddress) {
                        flag_buy = false;
                        num = i + 1;
                        break
                    }
                }
                if (flag_buy) {
                    console.log(chalk.green('buy it !'));
                    await buyAction();
                    // 购买以后，应该一直check最新的是不是自己。check到最新的是自己了，再向下执行。表明购买成功。
                    await checkBuySucc();
                } else {
                    console.log(chalk.green("Last " + num + " Address is me :) " + myAddress));
                }

                return true
            }

        })
        .catch((error) => {
            console.log("got error", error)
        })
};

function wait(ms) {
    return new Promise(resolve => setTimeout(() => resolve(), ms));
};


async function main() {
    while (true) {
        await rush();
        await wait(waits);
    }
}

main();

// rush();
