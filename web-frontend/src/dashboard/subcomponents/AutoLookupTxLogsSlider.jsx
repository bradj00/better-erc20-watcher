import React, { useState } from 'react';

const AutoLookupTxLogsSlider = () => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    setIsActive(!isActive);
  };

  return (
    <label className="switch">
      <input type="checkbox" checked={isActive} onChange={handleToggle} />
      <span className="slider round"></span>
    </label>
  );
};

export default AutoLookupTxLogsSlider;

