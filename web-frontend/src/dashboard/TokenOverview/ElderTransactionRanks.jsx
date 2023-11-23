import React, { useContext, useEffect } from 'react';
import { GeneralContext } from '../../App.js';

const ElderTransactionRanks = () => {
    const { addressStats, addressTags } = useContext(GeneralContext);

    useEffect(()=>{
        console.log('ADDRESS STATS: ',addressStats)
        console.log('ADDRESS TAGS: ',addressTags)
    }, addressStats, addressTags)

    // Create an array of data with address, elderRank, incoming, and outgoing
    const data = Object.entries(addressStats? addressStats:[]).map(([address, stats]) => ({
        address,
        elderRank: addressTags[address]?.ElderRank || 0,
        incoming: stats.incoming,
        outgoing: stats.outgoing
    }));

    // Sort the data by ElderRank
    data.sort((a, b) => a.elderRank - b.elderRank);

    return (
        <div style={{paddingTop:'1vh', display:'flex', justifyContent:'center', alignItems:'start', position:'absolute', left:'0.95vw', top:'62vh', height:'35vh', width:'16vw', borderRadius:'0.25vw', border:'1px solid rgba(200,200,255,0.3'}}>
            <table style={{ color: 'white', backgroundColor: '#333', width: '95%', textAlign: 'center',fontSize:'0.75vw' }}>
                <thead>
                    <tr>
                        <th>Address</th>
                        <th>Incoming</th>
                        <th>Outgoing</th>
                        <th>Elder Rank</th> 
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <tr key={index}>
                            <td>{item.address}</td>
                            <td>{item.incoming}</td>
                            <td>{item.outgoing}</td>
                            <td>{item.elderRank}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ElderTransactionRanks;
