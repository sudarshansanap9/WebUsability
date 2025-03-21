import React from 'react';
import PropTypes from 'prop-types';


export default function Navbar(props) {
  
  const getOffcanvasStyle = () => {
    const width = window.innerWidth;
    return width < 700
      ? { backgroundColor: props.mode === 'light' ? 'white' : '#343a40' }
      : {};
  };
  
 
  return (
    <nav className={`navbar navbar-expand-lg  fixed-top`} >
    <div className="container-fluid">
      <a className="navbar-brand" href="/">{props.title}</a>
    <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
      <span className="navbar-toggler-icon"></span>
    </button>
    <div className="offcanvas offcanvas-end" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
      <div className="offcanvas-header" >
        <h5 className="offcanvas-title" id="offcanvasNavbarLabel">{props.title}</h5>
        <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
      </div>
      
    </div>
  </div>
</nav>
  );
}

Navbar.propTypes = {
  title: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  toggleMode: PropTypes.func.isRequired,
};

Navbar.defaultProps = {
  title: 'Set title here',
};








