import React, {useState} from 'react'

const WidgetPanelDistribution = () => {

    const [holdersData] = useState(() => {
        const data = Array.from({ length: 25 }, (_, index) => ({
            address: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}`,
            amount: Math.floor(Math.random() * 10000),
            percentage: parseFloat((Math.random() * 10).toFixed(2)), // Changed this to a float for easier sorting
        }));
    
        // Sort the data array by percentage in descending order
        return data.sort((a, b) => b.percentage - a.percentage).map(item => ({
            ...item,
            percentage: item.percentage + '%' // Convert back to string format after sorting
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
                            <td style={{textAlign:'center'}}>{index+1}</td>
                            <td style={{textAlign:'center'}}>
                                <a href={`https://etherscan.io/address/${holder.address.split('...').join('')}`} target="_blank" rel="noopener noreferrer">
                                    {holder.address}
                                </a>
                            </td>
                            <td style={{textAlign:'center'}}>{holder.amount.toLocaleString()}</td>
                            <td style={{textAlign:'center'}}>{holder.percentage}</td>
                        </tr>
                    ))}
                </tbody>
            </table>

        </div>

    )
}

export default WidgetPanelDistribution