import React, {useEffect, useState} from 'react'
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import VolumeOffIcon from '@mui/icons-material/VolumeOff';
import { GeneralContext } from '../../App';
const AudioToggle = () => {
    
    const {audioEnabled, setAudioEnabled} = React.useContext(GeneralContext);

    useEffect(()=>{
        console.log('audioEnabled', audioEnabled);
    },[audioEnabled])
    return (
    <div style={{display:'flex'}}>
        {/* <ToggleSlider handleBackgroundColor={"#222"} active={audioEnabled} onToggle={()=>{setAudioEnabled(!audioEnabled);  }} /> */}
        {audioEnabled? <VolumeUpIcon /> :  <VolumeOffIcon />}
    </div>
    )
}

export default AudioToggle