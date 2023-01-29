import { JSBI } from "@uniswap/sdk";
import { ethers } from 'ethers'
import * as fs from 'fs';
import {ERC20, IUniswapV3PoolABI, IUniswapV3FactoryABI, IUniswapV3NFTmanagerABI}	from './ABIs.js';
import dotenv from 'dotenv';
dotenv.config({path:'./.env'});

const alchemyKey = process.env.ALCHEMY_KEY;
const provider = new ethers.providers.JsonRpcProvider("https://eth-mainnet.g.alchemy.com/v2/"+alchemyKey)

    // V3 standard addresses
const factory = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const NFTmanager = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";

async function getData(tokenID){
    let FactoryContract = new ethers.Contract(factory, IUniswapV3FactoryABI, provider);

    let NFTContract =  new ethers.Contract(NFTmanager, IUniswapV3NFTmanagerABI, provider);
    let position = await NFTContract.positions(tokenID);
    
    let token0contract =  new ethers.Contract(position.token0, ERC20, provider);
    let token1contract =  new ethers.Contract(position.token1, ERC20, provider);
    let token0Decimal = await token0contract.decimals();
    let token1Decimal = await token1contract.decimals();
    
    let token0sym = await token0contract.symbol();
    let token1sym = await token1contract.symbol();
    
    let V3pool = await FactoryContract.getPool(position.token0, position.token1, position.fee);
    let poolContract = new ethers.Contract(V3pool, IUniswapV3PoolABI, provider);

    let slot0 = await poolContract.slot0();

    
    let pairName = token0sym +"/"+ token1sym;
    
    let dict = {"SqrtX96" : slot0.sqrtPriceX96.toString(), "Pair": pairName, "T0d": token0Decimal, "T1d": token1Decimal, "tickLow": position.tickLower, "tickHigh": position.tickUpper, "liquidity": position.liquidity.toString()}

    return dict
}


const Q96 = JSBI.exponentiate(JSBI.BigInt(2), JSBI.BigInt(96));
const MIN_TICK = -887272;
const MAX_TICK = 887272;

function getTickAtSqrtRatio(sqrtPriceX96){
    let tick = Math.floor(Math.log((sqrtPriceX96/Q96)**2)/Math.log(1.0001));
    return tick;
}

async function getTokenAmounts(liquidity,sqrtPriceX96,tickLow,tickHigh,token0Decimal,token1Decimal){
    let sqrtRatioA = Math.sqrt(1.0001**tickLow).toFixed(18);
    let sqrtRatioB = Math.sqrt(1.0001**tickHigh).toFixed(18);
    let currentTick = getTickAtSqrtRatio(sqrtPriceX96);
    let sqrtPrice = sqrtPriceX96 / Q96;
    let amount0wei = 0;
    let amount1wei = 0;
    if(currentTick <= tickLow){
        amount0wei = Math.floor(liquidity*((sqrtRatioB-sqrtRatioA)/(sqrtRatioA*sqrtRatioB)));
    }
    if(currentTick > tickHigh){
        amount1wei = Math.floor(liquidity*(sqrtRatioB-sqrtRatioA));
    }
    if(currentTick >= tickLow && currentTick < tickHigh){ 
        amount0wei = Math.floor(liquidity*((sqrtRatioB-sqrtPrice)/(sqrtPrice*sqrtRatioB)));
        amount1wei = Math.floor(liquidity*(sqrtPrice-sqrtRatioA));
    }
    
    let amount0Human = (amount0wei/(10**token0Decimal)).toFixed(token0Decimal);
    let amount1Human = (amount1wei/(10**token1Decimal)).toFixed(token1Decimal);

    console.log("\n\nAmount Token0 wei: "+amount0wei);
    console.log("Amount Token1 wei: "+amount1wei);
    console.log("Amount Token0 : "+parseFloat(amount0Human));
    console.log("Amount Token1 : "+parseFloat(amount1Human));
    return [amount0wei, amount1wei]
}



export const checkContractTokenIdForTokensHeld = async (positionID) =>{
    let data = await getData(positionID);
    let tokens = await getTokenAmounts(data.liquidity, data.SqrtX96, data.tickLow, data.tickHigh, data.T0d, data.T1d);
    return ({token0Held: tokens[0], token1Held: tokens[1]})
}

console.clear();

let tempArr = [405639, 304383, 305147, 305392, 305408, 12083]

// for (let i = 0 ; i < tempArr.length; i++){
// 	checkContractTokenIdForTokensHeld(tempArr[i])
// }
// Also it can be used without the position data if you pull the data it will work for any range
// getTokenAmounts(12558033400096537032, 2025953380162437579067355541581128, 202980, 203040, 6, 18);































