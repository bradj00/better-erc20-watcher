import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../../App.js';

const DetermineTxAction = (props) => {
    const { to, from, txHash } = props;
    const { addressTags, txHashActionCache, settxHashActionCache } = useContext(GeneralContext);

    const determineAction = () => {
        const fromTag = addressTags[from];
        const toTag = addressTags[to];

        // Define actions
        let action;
        if ((fromTag?.isDEXPool || fromTag?.isDEXRouter) && !(toTag?.isDEXPool || toTag?.isDEXRouter)) action = 'BUY';
        else if (!(fromTag?.isDEXPool || fromTag?.isDEXRouter) && (toTag?.isDEXPool || toTag?.isDEXRouter)) action = 'SELL';
        else if ((fromTag?.isDEXPool || fromTag?.isDEXRouter) && (toTag?.isDEXPool || toTag?.isDEXRouter)) action = 'Liq. Route';
        else if (fromTag?.isCEXAddress) action = 'Withdraw';
        else if (toTag?.isCEXAddress) action = 'Deposit';
        else action = 'P2P'; // Default action or unknown

        // Save action to context

        console.log('setting action: ',action,txHash)
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

    const determineBackgroundColor = () => {
        switch (txHashActionCache[txHash]) {
            case 'BUY': return 'green';
            case 'SELL': return 'red';
            case 'Liq. Route': return 'rgba(50,50,250,0.7)';
            case 'Withdraw': return 'orange';
            case 'Deposit': return 'purple';
            default: return 'rgba(50,50,50,0.8)'; // Default or unknown action
        }
    };

    const backgroundColor = determineBackgroundColor();

    return (
        <div style={{fontSize:'0.75vw', height: '2vw', width: '3vw', backgroundColor: backgroundColor, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '0.25vw', textAlign:'center', padding:'0.1vw'}}>
            <div>{txHashActionCache[txHash]}</div>
        </div>
    );
};

export default DetermineTxAction;
