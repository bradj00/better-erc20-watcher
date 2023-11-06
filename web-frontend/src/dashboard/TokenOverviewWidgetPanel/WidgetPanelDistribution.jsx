import React, {useState} from 'react'

const WidgetPanelDistribution = () => {

    const [holdersData] = useState(() => {
        return Array.from({ length: 25 }, (_, index) => ({
            address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
            amount: Math.floor(Math.random() * 10000),
            percentage: (Math.random() * 10).toFixed(2) + '%',
        }));
    });


    return (
        <div style={{height:'95%', overflowY:'scroll', position: 'absolute', top: '0', width: '95%', marginTop: '0.5vw', fontSize: '1vh',  }}>
            
            <table className="token-holder-stats">
                <thead>
                <tr style={{position:'sticky', top:'0'}}>
                    <th>Rank</th>
                    <th>Address</th>
                    <th>Amount</th>
                    <th>Percentage</th>
                </tr>
                </thead>
                <tbody>
                {holdersData.map((holder, index) => (
                    <tr key={index}>
                    <td style={{textAlign:'center', }}>{index+1}</td>
                    <td style={{textAlign:'center', }}>{holder.address}</td>
                    <td style={{textAlign:'center', }}>{holder.amount.toLocaleString()}</td>
                    <td style={{textAlign:'center', }}>{holder.percentage}</td>
                    </tr>
                ))}
                </tbody>
            </table>
    </div>
    )
}

export default WidgetPanelDistribution