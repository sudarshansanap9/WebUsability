import React from "react";
import "./App.css";
import Homepage from './component/Homepage';
import SmallNavbar from './component/SmallNavbar';
import ChartComponent from './component/ChartComponent';


const App = () => {
  return (
    <div className="video-container">
      <video autoPlay loop muted playsInline className="background-video">
        <source src="/background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="content">
      
        <Homepage />
        <SmallNavbar />
        <div className='text-center pt-3'><ChartComponent/></div>

      </div>
    </div>
  );
};

export default App;




