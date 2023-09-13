import React from 'react'
import { useState, CSSProperties } from "react";

import GridLoader from "react-spinners/GridLoader";



const override: CSSProperties = {
    display: "block",
    margin: "0 auto",
    borderColor: "red",
  };
  
  function LoadingTableSpinner(props) {
    let [loading, setLoading] = useState(true);
    let [color, setColor] = useState("#ffffff");
  
    return (
        <>
        <GridLoader color="#36d7b7" />
        {props.msg? props.msg: <>Loading...</>}
        </>
    );
  }
  
  export default LoadingTableSpinner;