import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import Navbar from "../components/Navbar";
import SearchPage_ItemCard from "./SearchPage_ItemCard";
import SearchPage_ItemList from "./SearchPage_ItemList";
import SearchPage_ImageUploadModal from "./SearchPage_ImageUploadModal";
import { dummyItems } from "../assets/dummydata";
import { FiSearch } from "react-icons/fi";
import { FaListUl } from "react-icons/fa6";
import { TbGridDots } from "react-icons/tb";
import "./SearchImagePage.css";

const SearchImagePage = () => {
  const location = useLocation();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [filteredItems, setFilteredItems] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [items] = useState(dummyItems);

  useEffect(() => {
    if (location.state?.image) {
      setUploadedImage(location.state.image);
    }
  }, [location.state]);

  useEffect(() => {
    if (uploadedImage) {
      setFilteredItems(items); // Replace with actual search logic
    }
  }, [uploadedImage, items]);

  const handleChangeImage = () => {
    setShowModal(true);
  };

  return (
    <>
      <Navbar />
      <div className="SearchImagePage-container">
        <h1 className="SearchImagePage-Title">Search by Image</h1>

        <div className="SearchImagePage">
          <div className="SearchImagePage-Controls">
            <div className="view-toggle">
              <TbGridDots
                className={`view-icon ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              />
              <FaListUl
                className={`view-icon ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              />
            </div>
          </div>
          <div className="SearchImagePage-Content">
            <div className="SearchImagePage-Left">
              {uploadedImage && (
                <>
                  <div className="SearchImagePage-ImageContainer">
                    <img
                      src={uploadedImage}
                      alt="Uploaded for search"
                      className="SearchImagePage-UploadedImage"
                    />
                  </div>
                  <div className="SearchImagePage-ChangeImage">
                    <button onClick={handleChangeImage}>Change Image</button>
                  </div>
                </>
              )}
            </div>

            <div className="SearchImagePage-Right">
              {uploadedImage ? (
                <>
                  <div
                    className={`SearchPage-Items ${
                      viewMode === "grid" ? "grid-view" : "list-view"
                    }`}
                  >
                    {filteredItems.length > 0 ? (
                      filteredItems.map((item) =>
                        viewMode === "grid" ? (
                          <SearchPage_ItemCard key={item.id} item={item} />
                        ) : (
                          <SearchPage_ItemList key={item.id} item={item} />
                        )
                      )
                    ) : (
                      <p className="no-results">
                        No items found matching your image.
                      </p>
                    )}
                  </div>
                </>
              ) : (
                <div className="SearchImagePage-EmptyState">
                  <p>No image uploaded for search</p>
                  <button onClick={() => setShowModal(true)}>
                    Upload Image to Search
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
        <SearchPage_ImageUploadModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default SearchImagePage;
