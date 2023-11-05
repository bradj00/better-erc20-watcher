import React from 'react';
import '../App.css';

const AddressTagsManager = ({ address }) => {

    const handleClick = (cell) => {
        console.log(`Cell ${cell} of address ${address} was clicked.`);
    }

    return (
        <div className="address-container">
            {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="cell" onClick={() => handleClick(index + 1)}>
                    <div className="icon"></div>
                    <span className="descriptor">Text {index + 1}</span>
                </div>
            ))}
        </div>
    )
}

export default AddressTagsManager;
