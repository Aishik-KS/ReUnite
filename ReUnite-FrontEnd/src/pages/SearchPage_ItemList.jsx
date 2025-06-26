import React, { useState } from "react";
import "./SearchPage_ItemList.css";
import ItemDetailsModal from "./SearchPage_ItemModal";

const SearchPage_ItemList = ({ item }) => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <div className="SearchPage-ItemList">
        <div className="list-item-container" onClick={() => setShowModal(true)}>
          <img
            src={item.imageUrl}
            alt={item.title}
            className="list-item-image"
          />
          <div className="list-item-content">
            <h3 className="list-item-title">{item.title}</h3>
            <p className="list-item-description">{item.description}</p>
            <div className="list-item-btn">View Details</div>
          </div>
        </div>
      </div>
      {showModal && (
        <ItemDetailsModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default SearchPage_ItemList;
