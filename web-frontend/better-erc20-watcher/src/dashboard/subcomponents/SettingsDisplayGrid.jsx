import React from 'react'
import DoubleArrowIcon from '@mui/icons-material/DoubleArrow';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const SettingsDisplayGrid = () => {
    return (
        <div style={{border:'1px solid #0f0', width:'82.5%', left:'17vw',top:'7.5vh', zIndex:'9999', height:'92%', position:'absolute',}}>

              <div style={{border:'1px solid rgba(100,100,120,1)',gridGap:'0.2vw', gridTemplateColumns:'repeat(10, 1fr)',padding:'1vw', gridTemplateRows:'repeat(10, 1fr)', backgroundColor:'rgba(100,100,120,0.4)', width:'100%',height:'99%', textAlign:'center', borderRadius:'20px',  position:'absolute',display:'grid', }}>
                <div className="microService" >
                  Ingestion Engine
                </div>
                <div className="microService" >
                  Translator
                </div>
                <div className="microService" >
                  Address Tokens Balance Cacher
                </div>
                <div className="microService" >
                  Community Held Tokens Cacher
                </div>
                
                <div className="microServiceSpacer">
                  <DoubleArrowIcon />
                </div>
                
                <div className="microService" >
                    <div style={{position:'relative'}}>
                        <div style={{position:'absolute', top:'-40%',right:'0'}}><CheckCircleIcon style={{fontSize:'2vh', color:'#0f0'}}/></div>
                        <div>Community Held Tokens Cacher</div>
                    </div>
                </div>
                
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                <div></div>
                
                <div className="microService" >
                  Community Held Tokens Cacher
                </div>
                

              </div>





            </div>
    )
}

export default SettingsDisplayGrid