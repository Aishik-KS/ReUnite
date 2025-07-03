// SearchPage_ItemCard.js
import React, { useState } from "react";
import "./SearchPage_ItemCard.css";
import ItemDetailsModal from "./SearchPage_ItemModal";

const SearchPage_ItemCard = ({ item }) => {
  console.log(item);
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className="SearchPage-ItemCard" onClick={() => setShowModal(true)}>
        <img src={item.imageUrl} alt={item.title} className="item-image" />
        <div className="ItemCard-Content">
          <h3 className="ItemTitle">{item.title}</h3>
          <div className="Btn" onClick={() => setShowModal(true)}>
            View Details
          </div>
        </div>
      </div>
      {showModal && (
        <ItemDetailsModal item={item} onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default SearchPage_ItemCard;
