import React, { useContext } from 'react';
import { GeneralContext } from '../../../App.js';

const DetermineTxAction = (props) => {
    const { to, from } = props;
    const { addressTags } = useContext(GeneralContext); 

    const determineAction = () => {
        const fromTag = addressTags[from];
        const toTag = addressTags[to];

        // Define actions
        if ((fromTag?.isDEXPool || fromTag?.isDEXRouter) && !(toTag?.isDEXPool || toTag?.isDEXRouter)) return 'BUY';
        if (!(fromTag?.isDEXPool || fromTag?.isDEXRouter) && (toTag?.isDEXPool || toTag?.isDEXRouter)) return 'SELL';
        if ((fromTag?.isDEXPool || fromTag?.isDEXRouter) && (toTag?.isDEXPool || toTag?.isDEXRouter)) return 'Liq. Route';
        if (fromTag?.isCEXAddress) return 'Withdraw';
        if (toTag?.isCEXAddress) return 'Deposit';


        return 'P2P'; // Default action or unknown
    };

    const action = determineAction();

    const determineBackgroundColor = () => {
        switch (action) {
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
            <div>{action}</div>
        </div>
    );
};

export default DetermineTxAction;
