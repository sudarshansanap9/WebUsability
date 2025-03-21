import React, { useState } from 'react';
import './SmallNavbar.css'; // Create and import a separate CSS file for styling

import UrlIcon from'./UrlIcon.png';
import SearchIcon from './SearchIcon.png';



const SmallNavbar = () => {
  const [activeTab, setActiveTab] = useState('URL');

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
  };

  return (
    <div className="container">
    <div className="navbar-container">
      <div className="navbar-tabs ">
        
        <span
          className={`navbar-tab ${activeTab === 'URL' ? 'active' : ''}`}
          onClick={() => handleTabClick('URL')}
        >
          URL
        </span>
        <span
          className={`navbar-tab ${activeTab === 'SEARCH' ? 'active' : ''}`}
          onClick={() => handleTabClick('SEARCH')}
        >
          SEARCH
        </span>
      </div>
      <div className="navbar-content">
        
        {activeTab === 'URL' && (
          <div className="content " >
            <img src={UrlIcon} alt="URL Icon" />
            <input 
              type="text"
              placeholder="Search or scan a URL"
            style={{width:'50%', borderRadius:'10px',padding:'10px'}}/>
            
          </div>
        )}
        {activeTab === 'SEARCH' && (
          <div className="content ">
            <img src={SearchIcon} alt="Search Icon" />
            <input 
              type="text"
              placeholder="URL, IP address, domain, or file hash"
            style={{width:'50%', borderRadius:'10px',padding:'10px'}}/>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default SmallNavbar;
