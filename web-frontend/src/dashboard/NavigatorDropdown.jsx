import React, { useState, useContext } from 'react';
import { GeneralContext } from '../App';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import PersonIcon from '@mui/icons-material/Person';
import ShareIcon from '@mui/icons-material/Share';
import SummarizeIcon from '@mui/icons-material/Summarize';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import WifiFindIcon from '@mui/icons-material/WifiFind';
import "../styles.css"

const NavigatorDropdown = () => {
    const { displayPanel, setdisplayPanel } = useContext(GeneralContext);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const handleIconClick = (panel) => {
        setdisplayPanel(panel);
        setIsDropdownOpen(false);
    }

    return (
        <div style={{  cursor: 'pointer', border: '0px solid #ff0', display: 'flex', justifyContent: 'left', zIndex: '10001', width: '20vw' }}>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} style={{ border: '0px solid #0f0', textAlign: 'center', fontSize: '1.5vh', zIndex: '10001', width: '15vw', height: '4.2vh', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#aaa', position: 'absolute' }}>
                
                <div className="selectedIcon" style={{ display: 'flex', alignItems: 'center', marginLeft: '0.25vw', fontSize: '1vw' }}>
                    {displayPanel === 'watchingTokens' && (
                        <>
                            <MonetizationOnIcon style={{ fontSize: '2vw', paddingRight: '0.1vw' }} />
                            <span>Watch Tokens</span>
                        </>
                    )}
                    {displayPanel === 'closelyWatchAddresses' && (
                        <>
                            <SummarizeIcon style={{ fontSize: '2vw' }} />
                            <span>Watch Addresses</span>
                        </>
                    )}
                    {displayPanel === 'addressSummary' && (
                        <>
                            <PersonIcon style={{ fontSize: '2vw' }} />
                            <span>Address Summaries</span>
                        </>
                    )}
                    {displayPanel === 'txVisualizer' && (
                        <>
                            <ShareIcon style={{ fontSize: '2vw' }} />
                            <span>Transaction Visualizer</span>
                        </>
                    )}
                    {displayPanel === 'tokenDetective' && (
                        <>
                            <WifiFindIcon style={{ fontSize: '2vw' }} />
                            <span>Detect New Tokens</span>
                        </>
                    )}
                    {displayPanel === 'servicesHealth' && (
                        <>
                            <TroubleshootIcon style={{ fontSize: '2vw' }} />
                            <span>Micro Service Health</span>
                        </>
                    )}
                </div>

                <div className={`dropdownItems ${isDropdownOpen ? 'expanded' : ''}`} style={{ backgroundColor: '#333', color: '#f5f5f5' }}>
                    {isDropdownOpen && (
                        <>
                            <div title="Watch Tokens" className="leftBarGridTopItem" onClick={() => handleIconClick('watchingTokens')}>
                                <MonetizationOnIcon className="leftBarGridTopItemIcon" style={{ fontSize: '2vw', marginRight: '0.5vw' }} />
                                Watch Tokens
                            </div>
                            <div title="Watch Address Activity" className="leftBarGridTopItem" onClick={() => handleIconClick('closelyWatchAddresses')}>
                                <SummarizeIcon className="leftBarGridTopItemIcon" style={{ fontSize: '2vw', marginRight: '0.5vw' }} />
                                Watch Addresses
                            </div>
                            <div title="Address Summaries" className="leftBarGridTopItem" onClick={() => handleIconClick('addressSummary')}>
                                <PersonIcon className="leftBarGridTopItemIcon" style={{ fontSize: '2vw', marginRight: '0.5vw' }} />
                                Address Summaries
                            </div>
                            <div title="Transaction Visualizer" className="leftBarGridTopItem" onClick={() => handleIconClick('txVisualizer')}>
                                <ShareIcon className="leftBarGridTopItemIcon" style={{ fontSize: '2vw', marginRight: '0.5vw' }} />
                                Transaction Visualizer
                            </div>
                            <div title="Detect New Tokens" className="leftBarGridTopItem" onClick={() => handleIconClick('tokenDetective')}>
                                <WifiFindIcon className="leftBarGridTopItemIcon" style={{ fontSize: '2vw', marginRight: '0.5vw' }} />
                                Detect New Tokens
                            </div>
                            <div title="Micro Service Health" className="leftBarGridTopItem" onClick={() => handleIconClick('servicesHealth')}>
                                <TroubleshootIcon className="leftBarGridTopItemIcon" style={{ fontSize: '2vw', marginRight: '0.5vw' }} />
                                Micro Service Health
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default NavigatorDropdown;
