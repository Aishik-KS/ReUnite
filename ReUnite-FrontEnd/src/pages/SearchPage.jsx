import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { FiSearch } from "react-icons/fi";
import { FaListUl } from "react-icons/fa6";
import { TbGridDots } from "react-icons/tb";
import SearchPage_ItemCard from "./SearchPage_ItemCard";
import SearchPage_ItemList from "./SearchPage_ItemList";
import "./SearchPage.css";
import Fuse from "fuse.js";
import { dummyItems } from "../assets/dummydata";
import SearchPage_ImageUploadModal from "./SearchPage_ImageUploadModal";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase"; // Make sure you have this firebase configuration file

const SearchPage = () => {
  // Code to Take From Firebase
  const [items, setItems] = useState([]);
  useEffect(() => {
    const fetchItems = async () => {
      try {
        const snapshot = await getDocs(collection(db, "items"));
        const itemsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setItems(itemsList);
        console.log(items);
      } catch (error) {
        console.error("Error fetching items:", error);
      }
    };

    fetchItems();
  }, []);

  // Code to Take from Dummy Items
  // const [items, setItems] = useState(dummyItems);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' or 'list'
  const [showModal, setShowModal] = useState(false);

  // Fuse.js for fuzzy search
  const fuse = new Fuse(items, {
    keys: ["title", "description"],
    threshold: 0.3,
  });

  const filteredItems = searchTerm
    ? fuse.search(searchTerm).map((result) => result.item)
    : items;

  return (
    <>
      <Navbar />
      <div className="SearchPage-container">
        <div className="SearchPage">
          <div className="searchbar-container">
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
            <div className="search-input-container">
              <FiSearch className="searchbar-icon" />
              <input
                type="text"
                className="searchbar"
                placeholder="Search for items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="uploadImage" onClick={() => setShowModal(true)}>
              Search via Image Upload
            </button>
          </div>

          <div
            className={`SearchPage-Items ${
              viewMode === "grid" ? "grid-view" : "list-view"
            }`}
          >
            {filteredItems.map((item) =>
              viewMode === "grid" ? (
                <SearchPage_ItemCard key={item.id} item={item} />
              ) : (
                <SearchPage_ItemList key={item.id} item={item} />
              )
            )}
          </div>
        </div>
      </div>
      {showModal && (
        <SearchPage_ImageUploadModal onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default SearchPage;
