import React from 'react'
import { GeneralContext } from '../../App';
import {useContext, useEffect, useState} from 'react';
import TimeAgo from 'javascript-time-ago'
import en from 'javascript-time-ago/locale/en';
import {getEllipsisTxt, commaNumber} from '../helpers/h.js';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';



TimeAgo.addDefaultLocale(en);

const CommunityTokenTr = (props) => {
    const {getnewTxData, setgetnewTxData} = useContext(GeneralContext); //this is the trigger to get new data from the api. value is the address of the token
    const {viewingTokenAddress, setviewingTokenAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddress, setclickedDetailsAddress} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedDetailsAddressFN, setclickedDetailsAddressFN} = useContext(GeneralContext); //this is the address of the token we are viewing
    const {clickedTokenSymbol, setclickedTokenSymbol} = useContext(GeneralContext);
    
    const {chainDataHeartbeat, setchainDataHeartbeat} = useContext(GeneralContext);
    const [chainDataHeartbeatDiff, setchainDataHeartbeatDiff] = React.useState(0);
    const [clickedTokenUsdQuote, setclickedTokenUsdQuote] = React.useState({});
    // const [heldValueUsd, setheldValueUsd] = React.useState(0);
    
    const {MinAmountFilterValue, setMinAmountFilterValue} = useContext(GeneralContext);
    const {MaxAmountFilterValue, setMaxAmountFilterValue} = useContext(GeneralContext);
    const {systemStatuses, setSystemStatuses} = useContext(GeneralContext);
    const {filteredtxDataInflow,   setfilteredtxDataInflow} = useContext(GeneralContext);
    const {filteredtxDataOutflow,  setfilteredtxDataOutflow} = useContext(GeneralContext);
    const [clickedSearchBar, setclickedSearchBar] = React.useState(false);
    
    const [updateBlacklistRequest, setupdateBlacklistRequest] = React.useState();
  
    const [searchInput, setsearchInput] = useState("")
    const {DisplayMinAmountFilterValue, setDisplayMinAmountFilterValue} = useContext(GeneralContext);
    const {DisplayMaxAmountFilterValue, setDisplayMaxAmountFilterValue} = useContext(GeneralContext);
    const {latestEthBlock, setlatestEthBlock} = useContext(GeneralContext); 
    const timeAgo = new TimeAgo('en-US'); 
    
    const {selectedAddressListOfTokens, setselectedAddressListOfTokens} = useContext(GeneralContext);
    const [selectedAddressListOfTokensSorted, setselectedAddressListOfTokensSorted] = React.useState();
  
    const {heldTokensSelectedAddress, setheldTokensSelectedAddress} = useContext(GeneralContext);
    const {heldTokensSelectedAddressFN, setheldTokensSelectedAddressFN} = useContext(GeneralContext);
    const {heldTokensSelectedAddressFNdisplayed, setheldTokensSelectedAddressFNdisplayed} = useContext(GeneralContext);
    
    const {communityHeldListFromSelectedAddy, setcommunityHeldListFromSelectedAddy} = useContext(GeneralContext);
    const {communityHeldListFromSelected, setcommunityHeldListFromSelected} = useContext(GeneralContext);
    const {getUpdatedTokenBalance, setgetUpdatedTokenBalance} = useContext(GeneralContext);
    
    const {selectedAddyInGameBalance, setselectedAddyInGameBalance} = useContext(GeneralContext);
    const {megaPriceUsd, setmegaPriceUsd} = useContext(GeneralContext);
    const {updateCommitFriendlyNameRequest, setupdateCommitFriendlyNameRequest} = useContext(GeneralContext);

    const [newFriendlyNameInput, setnewFriendlyNameInput] = React.useState('');
    const [clickedToggleUpdateFN, setclickedToggleUpdateFN] = React.useState(false);

    useEffect(()=>{
        console.log('clickedToggleUpdateFN: ', clickedToggleUpdateFN)
    },[clickedToggleUpdateFN])

    function determineWhichFNtoShow(tokenObj){
        for (var key in tokenObj) {
          if (key !== 'ENS' && key !== '_id' && !tokenObj[key].startsWith("0x")) {
              return (<td onClick={()=>{ console.log('clicked: ',props.token.address); setheldTokensSelectedAddress(props.token.address) }} style={{zIndex:'9999', color:'#fff'}}>{tokenObj[key]}</td>);
          }
        }
      
      
        return (<td style={{color:'#aaa'}}>{getEllipsisTxt(tokenObj["address"], 4)}</td>);
      }    

      
      const handleKeyDown = (e, address) => {
        if (e.key === 'Enter') {
          console.log('commit update friendly name: ', e.target.value, address);
          setclickedToggleUpdateFN(false);
          setupdateCommitFriendlyNameRequest({address:address, friendlyName:e.target.value})
          
        }
      }
   
    return ( 
        
        props.token.address?
        <tr  style={{cursor:'pointer', backgroundColor:'rgba(200,150,10,0.4)'}}>
        <td onClick={()=>{ setclickedToggleUpdateFN(!clickedToggleUpdateFN) }} style={{maxWidth:'1vw',}}><ModeEditOutlineIcon style={{fontSize:'0.75vw'}}/></td>
        {clickedToggleUpdateFN?
        <>
            <input value={newFriendlyNameInput} onKeyDown={(e)=>handleKeyDown(e, props.token.friendlyName.address)} onChange={(e) => setnewFriendlyNameInput(e.target.value)} style={{width:'80%',height:'100%', backgroundColor:'rgba(0,0,0,0.4)', color:'white', border:'none', textAlign:'center'}} placeholder="friendly name" />
        </> 
        : determineWhichFNtoShow(props.token.friendlyName)}
        <td><a target="_blank" href={"https://etherscan.io/address/"+props.token.address}>{getEllipsisTxt(props.token.address,4)}</a></td>
        <td style={{textAlign:'right'}}>
        {props.token[communityHeldListFromSelectedAddy]?
            commaNumber(parseFloat((props.token[communityHeldListFromSelectedAddy].metadata.balance)/ (10 ** props.token[communityHeldListFromSelectedAddy].metadata.decimals)).toFixed(4))
            : <></>}
        </td>
        
        <td style={{textAlign:'right'}}>
            $ {clickedTokenUsdQuote?props.token[communityHeldListFromSelectedAddy]? commaNumber(parseFloat((props.token[communityHeldListFromSelectedAddy].metadata.balance)/ (10 ** props.token[communityHeldListFromSelectedAddy].metadata.decimals) * clickedTokenUsdQuote).toFixed(2)): <></>: <></>}
        </td>
        </tr>
        : <> </>
        
    )

}

export default CommunityTokenTr