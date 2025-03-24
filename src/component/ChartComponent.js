import React from "react";

const SearchButton = () => {
  const handleSearchClick = () => {
    const url = document.getElementById("url").value;
    window.open(`/ht.html?url=${url}`, "_blank");
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
