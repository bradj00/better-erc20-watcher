import React, {useState, useContext} from 'react'
import {getEllipsisTxt, commaNumber} from '../helpers/h.js';
import CancelIcon from '@mui/icons-material/Cancel';
import { GeneralContext } from '../../App.js';

const displayAddressFN = (clickedDetailsAddressFN) => {
    if (clickedDetailsAddressFN === null || clickedDetailsAddressFN == undefined) {return 'null'}
    let firstAddress;
    Object.keys(clickedDetailsAddressFN).map(key => {
      if (key !== '_id' && key !== 'ENS' && key !== 'address' && ( typeof clickedDetailsAddressFN[key] === 'string' && !clickedDetailsAddressFN[key].startsWith('0x') ) ) {
        firstAddress = clickedDetailsAddressFN[key];
        return;
      }
      else if (key === 'ENS' && Array.isArray(clickedDetailsAddressFN[key])) {
        firstAddress = clickedDetailsAddressFN[key][0];
        return;
      }
      else if (key === 'address') {
        firstAddress = getEllipsisTxt(clickedDetailsAddressFN[key], 6);
        return;
      }
    });
    return firstAddress;
}




const ToFromCell = (props) => {
    const [editingFN, seteditingFN] = useState(false);
    const [newFriendlyNameInput, setnewFriendlyNameInput] = React.useState('');
    const {updateCommitFriendlyNameRequest, setupdateCommitFriendlyNameRequest} = useContext(GeneralContext);

    const handleKeyDown = (e, address) => {
        if (e.key === 'Enter') {
            if (props.toFrom == 'to'){
                console.log('commit update friendly name: ', e.target.value, props.row.to_address)
                setupdateCommitFriendlyNameRequest({address:props.row.to_address, friendlyName:e.target.value})
            }
            else if (props.toFrom == 'from'){
                console.log('commit update friendly name: ', e.target.value, props.row.from_address)
                setupdateCommitFriendlyNameRequest({address:props.row.from_address, friendlyName:e.target.value})
            }
            seteditingFN(false);

        //   setclickedToggleUpdateFN(false);
          
        }
      }




    return (
        <div onClick={()=>{ editingFN==true? <></> : seteditingFN(true) }}>
            
            {
                editingFN==true && props.clickMode == 'edit' ? 
                <div className="hoverOpacity" style={{display:'flex'}}>
                    <input  value={newFriendlyNameInput} onKeyDown={(e)=>handleKeyDown(e)} onChange={(e) => setnewFriendlyNameInput(e.target.value)} style={{width:'80%',height:'3vh', backgroundColor:'rgba(0,0,0,0.4)', color:'white', border:'none', textAlign:'center'}} placeholder="friendly name" />
                    <div  onClick={()=>{ seteditingFN(false)}}>
                        <CancelIcon />
                    </div>
                </div>
                :

                props.toFrom == 'to' ?
                (props.row.to_address_friendlyName== undefined) ? getEllipsisTxt(props.row.to_address, 6): displayAddressFN(props.row.to_address_friendlyName)
                :
                props.toFrom == 'from' ?
                (props.row.from_address_friendlyName== undefined) ? getEllipsisTxt(props.row.from_address, 6): displayAddressFN(props.row.from_address_friendlyName)
                :
                'null'


            }
            
        </div>
    )
}

export default ToFromCell