import * as React from 'react';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Title from './Title';

function preventDefault(event) {
  event.preventDefault();
}

export default function Deposits() {
  return (
    <div style={{position:'absolute',textAlign:'center', height:'200%', }}>
    <React.Fragment>
      <Title><span style={{fontSize:'3vh'}}>Token Volume</span></Title>
      <br></br>
      <Typography component="p" variant="h3" >
        3,024.00
      </Typography>
      
      <br></br>
      <br></br>
      <Typography color="text.secondary" sx={{ flex: 1 }}>
        past 30 days
      </Typography>
      <div>
        
        {/* <Link color="primary" href="#" variant="body2" onClick={preventDefault}>
          View balance
        </Link> */}
      </div>
    </React.Fragment>
    </div>
  );
}
