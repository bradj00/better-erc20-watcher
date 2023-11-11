import React, { useState, useContext } from 'react';
import { getEllipsisTxt, commaNumber } from '../helpers/h.js';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { GeneralContext } from '../../App.js';
import '../../App.css';

const getFriendlyLabel = (address, cache) => {

    const isEthereumAddress = (value) => {
        return typeof value === 'string' && value.startsWith('0x') && value.length === 42 && /^0x[a-fA-F0-9]{40}$/.test(value);
    };
    

    // Try to get the cached label
    const labelObj = cache[address];
    if (labelObj) {
        let ethereumAddress = null;

        // If manuallyDefined is available, return it immediately
        if (labelObj.manuallyDefined) {
            if (isEthereumAddress(labelObj.manuallyDefined)) {
                ethereumAddress = labelObj.manuallyDefined;
            } else {
                return labelObj.manuallyDefined;
            }
        } 

        // Check ENS
        if (labelObj.ENS) {
            if (isEthereumAddress(labelObj.ENS)) {
                ethereumAddress = labelObj.ENS;
            } else {
                return labelObj.ENS;
            }
        }

        // Check MegaWorld
        if (labelObj.MegaWorld) {
            if (isEthereumAddress(labelObj.MegaWorld)) {
                ethereumAddress = labelObj.MegaWorld;
            } else {
                return labelObj.MegaWorld;
            }
        }

        // Check OpenSea
        if (labelObj.OpenSea) {
            if (isEthereumAddress(labelObj.OpenSea)) {
                ethereumAddress = labelObj.OpenSea;
            } else {
                return labelObj.OpenSea;
            }
        }

        // If we have an ethereumAddress stored, return it.
        if (ethereumAddress) {
            return getEllipsisTxt(ethereumAddress, 6);
        } else {
            return getEllipsisTxt(address, 6);
        }
    }

    // Handle case where no labels were found or met the criteria
    // return "Unknown"; // Or another default value

    // Return ellipsed version if no match found in cache
    return getEllipsisTxt(address, 6);
};

const ToFromCell = (props) => {


    const [tagsArray, setTagsArray] = useState([
        "Contract",
        "EOA",
        "DEX",
        "CEX",
        "firstSeen",
        "holderType",
        "highTxActivity",
        "lowTxActivity",
        "YieldFarmer",
        "Trader",
        "HODLer",
        "NFTCollector",
        "DAOMember",
        "Gamer",
        "Staker",
        "LiquidityProvider",
        "EarlyAdopter",
        "BorrowerOrLender",
        "ChainHopper",
        "usesTumbler",
        "Compromised",
        "Phishing",
        "Multisig",
        "Layer2User",
        "CrossChain",
        "FlashbotTrader",
        "Charity",
        "GrantRecipient",
        "Developer",
        "BountyHunter"
    ]);



    const [editingFN, setEditingFN] = useState(false);
    const [newFriendlyNameInput, setNewFriendlyNameInput] = useState('');
    const [selectedCells, setSelectedCells] = useState([]);
    
    const { updateCommitFriendlyNameRequest, setupdateCommitFriendlyNameRequest, CacheFriendlyLabels } = useContext(GeneralContext);
    const {addressTags, setAddressTags} = useContext(GeneralContext);
    

    const handleClick = (index) => {
        console.log(`Cell ${index} was clicked.`);

        // Toggle the selected state of the clicked cell
        const newSelectedCells = [...selectedCells];
        if (selectedCells.includes(index)) {
          const position = newSelectedCells.indexOf(index);
          newSelectedCells.splice(position, 1);
        } else {
          newSelectedCells.push(index);
        }
        setSelectedCells(newSelectedCells);
      };

    const handleKeyDown = (e) => {
        let addressToUpdate = props.toFrom === 'to' ? props.row.to_address : props.row.from_address;

        if (e.key === 'Enter' && addressToUpdate) {
            console.log('commit update friendly name: ', e.target.value, addressToUpdate);
            setupdateCommitFriendlyNameRequest({
                address: addressToUpdate,
                friendlyName: e.target.value
            });
            setEditingFN(false);
        }
    };

    const address = props.toFrom === 'to' ? props.row.to_address : props.row.from_address;
    const displayedValue = getFriendlyLabel(address, CacheFriendlyLabels);

    const ellipsedAddress = getEllipsisTxt(address, 6);

    return (
        <div onClick={editingFN ? undefined : () => setEditingFN(true)}>
            {editingFN && props.clickMode === 'edit' ? (
                <>
                    <div className="hoverOpacity" style={{ display: 'flex', width: '100%' }}>
                        <input
                            value={newFriendlyNameInput}
                            onKeyDown={handleKeyDown}
                            onChange={(e) => setNewFriendlyNameInput(e.target.value)}
                            style={{
                                width: '80%',
                                height: '3vh',
                                backgroundColor: 'rgba(0,0,0,0.4)',
                                color: 'white',
                                border: 'none',
                                textAlign: 'center'
                            }}
                            placeholder="friendly name"
                        />
                        <div onClick={() => setEditingFN(false)}>
                            <CancelIcon />
                        </div>
                    </div>
                    <div className="address-container">
                        
                        <div style={{  backgroundColor:'rgba(10,10,10,0.9)', textAlign: 'center', position:'sticky', top:'0',width: '100%', }}>
                            <div style={{position:'absolute', border:'1px solid #ccc', padding:'0.2vw', borderRadius:'8px', top:'0.5vh',right:'0.5vw',fontSize:'0.7vw',}}> 
                                tags 
                            </div>
                            <div style={{fontSize:'1vw'}}>{displayedValue}</div>
                            <div style={{fontSize:'0.7vw'}}>{ellipsedAddress} </div>
                        </div>
    
                        <div className="grid-container" style={{ marginTop: '2vh' }}>
                            {tagsArray.map((tag, index) => (
                                <div key={index} className="cell" onClick={() => handleClick(index)}>
                                    <div className="icon">
                                        <div style={{width:'100%', textAlign:'center',}}>
                                            {selectedCells.includes(index) ? 
                                            <CheckCircleIcon style={{ color: 'rgba(0,255,0,1)' }} /> :
                                            <CancelIcon style={{ color: 'rgba(255,0,0,0.5)' }} />
                                            }
                                        </div>
                                        <div className="descriptor">{tag}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div style={{ textAlign: 'center', fontSize:'0.7vw', width: '100%' }}>
                    {displayedValue}
                </div>
            )}
        </div>
    );
    
};

export default ToFromCell;
