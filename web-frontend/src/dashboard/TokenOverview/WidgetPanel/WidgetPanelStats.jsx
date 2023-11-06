import React from 'react'

const WidgetPanelStats = () => {
    const percentages =                 ["+2.5%", "-1.2%", "+3.8%", "-62.8%"];
    const percentagesHolders =          ["+1.2%", "+2.5%", "+3.2%", "+70%"];
    const percentagesTwitterFollowers = ["-1.5%", "+3.3%", "+14.2%", "+21.6%"];

    return (
        <>
        <div style={{width:'100%', marginLeft:'auto'}}>
            <span style={{ color: 'rgba(150,220,255,0.5)',  fontSize:'150%', padding:'1vw',}}>Price:</span>
            <span style={{ color: 'rgba(150,220,255,0.5)',  fontSize:'150%', color:'rgba(255,255,0,1)', position:'absolute', right:'5%', }}>$0.07521</span>
            
        </div>
        <div className="grid-container" style={{}}>
            {["1 hour", "24 hours", "7 days", "30 days"].map((time, index) => (
            <div 
                key={index}
                style={{
                position: 'relative', 
                backgroundColor: 'rgba(50,50,50,0.8)', 
                border: '1px solid rgba(255,255,255,0.5)', 
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.8)', 
                height: '8vh',
                width:'3.55vw',
                padding: '10px',
                }}
            >
                
                <span 
                style={{
                    position: 'relative', 
                    fontSize: '120%',
                    color: percentages[index].startsWith('+') ? '#0c0' : '#c00', // Color based on positive or negative
                }}
                >
                {percentages[index]}
                </span>
                <div style={{fontSize:'60%'}}>{time}</div>
            </div>
            ))}
        </div>
        
        <div style={{width:'100%', marginLeft:'auto'}}>
            <span style={{ color: 'rgba(150,220,255,0.5)',  fontSize:'150%', padding:'1vw',}}>Active Addresses:</span>
            <span style={{ color: 'rgba(150,220,255,0.5)',  fontSize:'150%', color:'rgba(255,255,0,1)', position:'absolute', right:'5%', }}>42.8k</span>
            
        </div>
        <div className="grid-container" style={{}}>
            {["1 day", "30 days", "90 days", "180 days"].map((time, index) => (
            <div 
                key={index}
                style={{
                position: 'relative', 
                backgroundColor: 'rgba(50,50,50,0.8)', 
                border: '1px solid rgba(255,255,255,0.5)', 
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.8)', 
                height: '8vh',
                width:'3.55vw',
                padding: '10px',
                }}
            >
                
                <span 
                style={{
                    position: 'relative', 
                    fontSize: '120%',
                    color: percentagesHolders[index].startsWith('+') ? '#0c0' : '#c00', // Color based on positive or negative
                }}
                >
                {percentagesHolders[index]}
                </span>
                <div style={{fontSize:'60%'}}>{time}</div>
            </div>
            ))}
        </div>

        <div style={{width:'100%', marginLeft:'auto'}}>
            <span style={{ color: 'rgba(150,220,255,0.5)',  fontSize:'150%', padding:'1vw',}}>Twitter Followers: </span>
            <span style={{ color: 'rgba(150,220,255,0.5)',  fontSize:'150%', color:'rgba(255,255,0,1)', position:'absolute', right:'5%', }}> 16.3k </span>
            
        </div>
        <div className="grid-container" style={{}}>
            {["1 day", "7 days", "30 days", "180 days"].map((time, index) => (
            <div 
                key={index}
                style={{
                position: 'relative', 
                backgroundColor: 'rgba(50,50,50,0.8)', 
                border: '1px solid rgba(255,255,255,0.5)', 
                borderRadius: '5px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                color: 'rgba(255,255,255,0.8)', 
                height: '8vh',
                width:'3.55vw',
                padding: '10px',
                }}
            >
                
                <span 
                style={{
                    position: 'relative', 
                    fontSize: '110%',
                    color: percentagesTwitterFollowers[index].startsWith('+') ? '#0c0' : '#c00', // Color based on positive or negative
                }}
                >
                {percentagesTwitterFollowers[index]}
                </span>
                <div style={{fontSize:'60%'}}>{time}</div>
            </div>
            ))}
        </div>
        </>
    )
}

export default WidgetPanelStats