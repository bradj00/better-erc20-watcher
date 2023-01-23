import { JSBI } from "@uniswap/sdk";
import { ethers } from 'ethers';
import * as fs from 'fs';
import {ERC20, IUniswapV3PoolABI, IUniswapV3FactoryABI}	from './ABIs.js';
import dotenv from 'dotenv';
dotenv.config({path:'/.env'});

const alchemyKey = process.env.ALCHEMY_KEY;
console.log('alchemyKey: ',alchemyKey)
const url = "https://eth-mainnet.g.alchemy.com/v2/"+alchemyKey;
const provider = new ethers.providers.JsonRpcProvider(url)


const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";

function toPlainString(num) {
  return (''+ +num).replace(/(-?)(\d*)\.?(\d*)e([+-]\d+)/,
    function(a,b,c,d,e) {
      return e < 0
        ? b + '0.' + Array(1-e-c.length).join(0) + c + d
        : b + c + d + Array(e-d.length+1).join(0);
    });
}


async function getPoolData(token0, token1, fee){
    var t0 = token0.toLowerCase() < token1.toLowerCase() ? token0 : token1;
    var t1 = token0.toLowerCase() < token1.toLowerCase() ? token1 : token0;
    var token0contract =  new ethers.Contract(t0, ERC20, provider);
    var token1contract =  new ethers.Contract(t1, ERC20, provider);
    var token0Decimal = await token0contract.decimals();
    var token1Decimal = await token1contract.decimals();
    var token0sym = await token0contract.symbol();
    var token1sym = await token1contract.symbol();
    var FactoryContract =  new ethers.Contract(factory, IUniswapV3FactoryABI, provider);
    var V3pool = await FactoryContract.getPool(token0, token1, fee);
    var poolContract =  new ethers.Contract(V3pool, IUniswapV3PoolABI, provider);
    var slot0 = await poolContract.slot0();
    var pairName = token0sym +"/"+ token1sym;
    return {"SqrtX96" : slot0.sqrtPriceX96.toString(), "Pair": pairName, "T0d": token0Decimal, "T1d": token1Decimal}
}


function GetPrice(testz){
    let sqrtPriceX96 = testz.SqrtX96;
    let token0Decimals = testz.T0d;
    let token1Decimals = testz.T1d;
    
    var buyOneOfToken0 = (sqrtPriceX96 * sqrtPriceX96 * (10**token0Decimals) / (10**token1Decimals) / JSBI.BigInt(2) ** (JSBI.BigInt(192))).toFixed(token1Decimals);
    var buyOneOfToken1 = (1 / buyOneOfToken0).toFixed(token0Decimals);
    console.log("price of token0 in value of token1 : " + buyOneOfToken0.toString());
    console.log("price of token1 in value of token0 : " + buyOneOfToken1.toString());
    //console.log("");
    
        // Convert to wei
    var buyOneOfToken0Wei = toPlainString(Math.floor(buyOneOfToken0 * (10**token1Decimals)));
    var buyOneOfToken1Wei = toPlainString(Math.floor(buyOneOfToken1 * (10**token0Decimals)));
    console.log("price of token0 in value of token1 in lowest decimal : " + buyOneOfToken0Wei);
    console.log("price of token1 in value of token1 in lowest decimal : " + buyOneOfToken1Wei);
    console.log("");

    return ({"token0In1": buyOneOfToken0Wei, "token1in0": buyOneOfToken1Wei, "t0Decimals": token0Decimals, "t1Decimals": token1Decimals})
}




export default async function getLiquidityPoolPriceFromOnChain(token0, token1, feeAmount){
    console.log('alchemyKey: ',alchemyKey)
    var data = await getPoolData(token0, token1, feeAmount);
    console.log('getting pool prices for pair..')
    console.log(data)
    return ( GetPrice(data) )
}
// console.clear();

// getLiquidityPoolPriceFromOnChain(token0, token1, feeAmount)

//const testa = {"SqrtX96" : "1795414558883038839252603454575377", "Pair":"USDC/WETH", "T0d":6, "T1d":18}
//const testb = {"SqrtX96" : "177403796449349488305650", "Pair":"USDT/UNI", "T0d":18, "T1d":6}
//const testc = {"SqrtX96" : "2155762217846613132494468993", "Pair":"Dai/WETH", "T0d":18, "T1d":18}
//const testd = {"SqrtX96" : "79230069777981184539141962837", "Pair":"USDC/USDT", "T0d":6, "T1d":6}
//const teste = {"SqrtX96" : "215524551323017484063050", "Pair":"LINK/USDC", "T0d":18, "T1d":6}
//GetPrice(testa);
//GetPrice(testb);
//GetPrice(testc);
//GetPrice(testd);
//GetPrice(teste);