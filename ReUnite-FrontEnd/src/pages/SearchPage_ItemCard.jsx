// // ViewItemModal.jsx
// import React from "react";
// import "./ViewItemModal.css"; // for styling the modal

// const ViewItemModal = ({ item, onClose }) => {
//   if (!item) return null;

//   return (
//     <div className="modal-backdrop" onClick={onClose}>
//       <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//         <button className="close-button" onClick={onClose}>
//           &times;
//         </button>
//         <h2>{item.name}</h2>
//         <p>
//           <strong>Description:</strong> {item.description}
//         </p>
//         <p>
//           <strong>Price:</strong> {item.price}
//         </p>
//         {/* Add more fields as necessary */}
//       </div>
//     </div>
//   );
// };

// export default ViewItemModal;

// SearchPage_ItemCard.js
import React, { useState } from "react";
import "./SearchPage_ItemCard.css";
import ItemDetailsModal from "./SearchPage_ItemModal";

const SearchPage_ItemCard = ({ item }) => {
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
