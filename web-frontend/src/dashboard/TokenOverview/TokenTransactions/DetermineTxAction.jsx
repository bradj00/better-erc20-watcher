import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../../App.js';

const DetermineTxAction = (props) => {
    const { to, from, txHash } = props;
    const { addressTags, txHashActionCache, settxHashActionCache, TxHashDetailsObj } = useContext(GeneralContext);

    const determineAction = () => {
        const fromTag = addressTags[from];
        const toTag = addressTags[to];
    
        // Define actions
        let action;
        
        // Check for Uniswap Position Management
        if (TxHashDetailsObj[txHash]?.isUniswapPositionManagement) {
            action = 'Liq. MGMT';
        } else {
            if ((fromTag?.isDEXPool || fromTag?.isDEXRouter) && !(toTag?.isDEXPool || toTag?.isDEXRouter)) action = 'BUY';
            else if (!(fromTag?.isDEXPool || fromTag?.isDEXRouter) && (toTag?.isDEXPool || toTag?.isDEXRouter)) action = 'SELL';
            // else if ((fromTag?.isDEXPool || fromTag?.isDEXRouter) && (toTag?.isDEXPool || toTag?.isDEXRouter)) action = 'Liq. Route';
            else if (fromTag?.isCEXAddress) action = 'Withdraw';
            else if (toTag?.isCEXAddress) action = 'Deposit';
            else action = 'P2P'; // Default action or unknown
        }
    
        // Save action to context
        settxHashActionCache(prevCache => ({
            ...prevCache,
            [txHash]: action
        }));
    
        return action;
    };
    

    // Using useEffect to ensure that the action is determined and stored only once
    useEffect(() => {
        determineAction();
    }, [from, to, txHash]); // Dependencies


    // useEffect(() => {
    //     console.log('TxHashDetailsObj: ',TxHashDetailsObj)
    // }, [TxHashDetailsObj]); 

    const determineBackgroundColor = () => {
        switch (txHashActionCache[txHash]) {
            case 'BUY': return 'rgba(0,255,0,0.3)';
            case 'SELL': return 'rgba(255,0,0,0.3)';
            case 'Liq. MGMT': return 'rgba(50,50,250,0.3)';
            case 'Withdraw': return 'rgba(255,130,0,0.6)';
            case 'Deposit': return 'rgba(125,0,255,0.3)';
            default: return 'rgba(50,50,50,0.8)'; // Default or unknown action
        }
    };

    const backgroundColor = determineBackgroundColor();

    return (
        <div style={{fontSize:'0.75vw', height: '2vw', width: '3.3vw', backgroundColor: backgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.25vw', textAlign:'center', border:'1px solid rgba(255,255,255,0.2)', padding:'0.15vw'}}>
            <div>{txHashActionCache[txHash]}</div>
        </div>
    );
};

export default DetermineTxAction;
