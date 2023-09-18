import React, { useState } from 'react';
import Draggable from 'react-draggable';

const ExamplePopUpWindow = () => {
  const [isMinimized, setIsMinimized] = useState(false);
  
  const handleToggleMinimize = (event) => {
    event.stopPropagation(); // Prevent the event from propagating to the Draggable component
  
    if (isMinimized) {
      setIsMinimized(false);
    } else {
      setIsMinimized(true);
    }
  };
  

  return (
    <Draggable handle=".drag-bar" disabled={isMinimized} defaultPosition={{x: 0, y: 0}} position={isMinimized ? {x: 0, y: 0} : null}>
      <div className={isMinimized ? "minimized" : "example-popup-window"}>
        <div className="drag-bar">
          ExamplePopUpWindow
          <button onMouseDown={(e) => handleToggleMinimize(e)} className="minimize-btn">

            {isMinimized ? '□' : '-'}
          </button>
        </div>
        {/* Your DEX content here */}
      </div>
    </Draggable>
  );
};

export default ExamplePopUpWindow;
