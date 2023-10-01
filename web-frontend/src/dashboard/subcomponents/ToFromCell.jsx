import React, { useState, useContext } from 'react';
import { getEllipsisTxt, commaNumber } from '../helpers/h.js';
import CancelIcon from '@mui/icons-material/Cancel';
import { GeneralContext } from '../../App.js';

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
    const [editingFN, setEditingFN] = useState(false);
    const [newFriendlyNameInput, setNewFriendlyNameInput] = useState('');
    const { updateCommitFriendlyNameRequest, setUpdateCommitFriendlyNameRequest, CacheFriendlyLabels } = useContext(GeneralContext);

    const handleKeyDown = (e) => {
        let addressToUpdate;
        if (props.toFrom === 'to') {
            addressToUpdate = props.row.to_address;
        } else if (props.toFrom === 'from') {
            addressToUpdate = props.row.from_address;
        }

        if (e.key === 'Enter' && addressToUpdate) {
            console.log('commit update friendly name: ', e.target.value, addressToUpdate);
            setUpdateCommitFriendlyNameRequest({
                address: addressToUpdate,
                friendlyName: e.target.value
            });
            setEditingFN(false);
        }
    };

    const address = props.toFrom === 'to' ? props.row.to_address : props.row.from_address;
    const displayedValue = editingFN === true && props.clickMode === 'edit' ? 'null' : getFriendlyLabel(address, CacheFriendlyLabels);

    return (
        <div onClick={editingFN ? undefined : () => setEditingFN(true)}>
            {editingFN && props.clickMode === 'edit' ? (
                <div className="hoverOpacity" style={{ display: 'flex' }}>
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
            ) : (
                displayedValue
            )}
        </div>
    );
};

export default ToFromCell;
