import React from "react";

const SearchButton = () => {
  const handleSearchClick = () => {
    window.open("/ht.html", "_blank");
  };

  return (
    <button 
      className="btn btn-outline-success"
      onClick={handleSearchClick}
    >
      Search
    </button>
  );
};

export default SearchButton;
