import React from 'react'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardDoubleArrowDownIcon from '@mui/icons-material/KeyboardDoubleArrowDown';

const SettingsDisplayGrid = () => {
    return (
        <div style={{border:'0px solid #0f0', width:'82.5%', left:'17vw',top:'7.5vh', zIndex:'9999', height:'92%', position:'absolute',}}>
              <div style={{border:'1px solid rgba(100,100,120,1)',gridGap:'0.2vw', gridTemplateColumns:'repeat(20, 1fr)',padding:'1vw', gridTemplateRows:'repeat(20, 1fr)', backgroundColor:'rgba(100,100,120,0.4)', width:'100%',height:'99%', textAlign:'center', borderRadius:'20px',  position:'absolute',display:'grid', }}>
              
              <div style={{gridColumn:'span 20',fontSize:'2vh', position:'relative', width:'100%', height:'10%', border:'0px solid #f00', display:'flex', justifyContent:'left', alignItems:'center'}}>
                    Services Health: 
              </div>

                <div className="microService" style={{gridColumn:'span 2',}}>
                    <div style={{position:'relative'}}>
                        <div title="TXs begin processing here" style={{position:'absolute', top:'-0.4vw',left:'-1.1vw'}}><CheckCircleIcon style={{fontSize:'2vh', color:'#0f0'}}/></div>
                        <div>Ingestion Engine</div>
                    </div>
                </div>

                <div  style={{gridColumn:'span 1'}}></div>

                <div className="microService errorService" >
                    <div style={{position:'relative'}}>
                        <div>API Gateway</div>
                    </div>
                </div>

                <div className="emptySpacer"  style={{gridColumn:'span 15'}}></div>
                
                <div className="gridIconSpacer" style={{gridColumn:'span 2'}}>
                  <KeyboardDoubleArrowDownIcon />
                </div>

                <div  style={{gridColumn:'span 1'}}></div>
                
                <div className="gridIconSpacer" style={{gridColumn:'span 2'}}>
                  <KeyboardDoubleArrowDownIcon />
                </div>

                <div  className="emptySpacer" style={{gridColumn:'span 15'}}></div>

                <div className="microService" style={{gridColumn:'span 2',}}>
                    <div style={{position:'relative'}}>
                        <div>Translator Service</div>
                    </div>
                </div>
                
                <div className="gridIconSpacer" >
                  <DoubleArrowIcon />
                </div>
                
                
                
                <div className="microService" >
                    ...
                </div>
                
                <div className="gridIconSpacer" >
                  <DoubleArrowIcon />
                </div>

                
                <div className="microService warningService" >
                  Community Held Tokens Cacher
                </div>
              </div>





            </div>
    )
}

export default SettingsDisplayGrid