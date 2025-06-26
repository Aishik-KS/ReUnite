import React, { useState, useEffect } from "react";
import { useLocation } from "react-router";
import Navbar from "../components/Navbar";
import SearchPage_ItemCard from "./SearchPage_ItemCard";
import SearchPage_ItemList from "./SearchPage_ItemList";
import SearchPage_ImageUploadModal from "./SearchPage_ImageUploadModal";
import { FaListUl } from "react-icons/fa6";
import { TbGridDots } from "react-icons/tb";
import { FiUpload } from "react-icons/fi";
import "./SearchImagePage.css";

const SearchImagePage = () => {
  const location = useLocation();
  const [uploadedImage, setUploadedImage] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (location.state) {
      setUploadedImage(location.state.image);
      setSearchResults(location.state.results || []);
    }
  }, [location.state]);

  const handleChangeImage = () => setShowModal(true);

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Finding matching items...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-state">
          <p>⚠️ {error}</p>
          <button onClick={() => setShowModal(true)}>Try Again</button>
        </div>
      );
    }

    if (searchResults.length === 0) {
      return (
        <div className="empty-state">
          <p>No matching items found</p>
          <button onClick={handleChangeImage}>Try a different image</button>
        </div>
      );
    }

    return (
      <div className={`results-container ${viewMode}`}>
        {searchResults.map((item) =>
          viewMode === "grid" ? (
            <SearchPage_ItemCard key={item.id} item={item} />
          ) : (
            <SearchPage_ItemList key={item.id} item={item} />
          )
        )}
      </div>
    );
  };

  return (
    <>
      <Navbar />
      <div className="search-image-page">
        <div className="SearchImagePage-main-content">
          <div className="image-panel">
            {uploadedImage ? (
              <>
                <div className="uploaded-image-container">
                  <img src={uploadedImage} alt="Uploaded for search" />
                  <button
                    className="change-image-btn"
                    onClick={handleChangeImage}
                  >
                    <FiUpload /> Change Image
                  </button>
                </div>
              </>
            ) : (
              <div className="upload-prompt">
                <div className="upload-cta">
                  <p>No image uploaded yet</p>
                  <button onClick={() => setShowModal(true)}>
                    <FiUpload /> Upload Image
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="results-panel">
            <div className="view-controls">
              <div className="view-toggle">
                <TbGridDots
                  className={viewMode === "grid" ? "active" : ""}
                  onClick={() => setViewMode("grid")}
                  title="Grid view"
                />
                <FaListUl
                  className={viewMode === "list" ? "active" : ""}
                  onClick={() => setViewMode("list")}
                  title="List view"
                />
              </div>
            </div>
            {renderResults()}
          </div>
        </div>

        {showModal && (
          <SearchPage_ImageUploadModal onClose={() => setShowModal(false)} />
        )}
      </div>
    </>
  );
};

export default SearchImagePage;
