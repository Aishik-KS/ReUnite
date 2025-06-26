import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import "./HomePage.css";
import Navbar from "../components/Navbar";
import Mirror_Logo from "../assets/ReUnite_Logo_Mirrored.png";
import Logo from "../assets/ReUnite_Logo.png";

const HomePage = () => {
  const navigate = useNavigate();
  let screenWidth = window.innerWidth;
  let screenHeight = window.innerHeight;
  return (
    <>
      <Navbar />
      <div className="HomePage">
        <div className="HomePage-Left">
          <img src={Logo} alt="ReUnite Logo Mirrored" />
        </div>
        <div className="HomePage-Center">
          <h1 className="HomePage-Title">ReUnite</h1>
          <div className="HomePage-SubTitle">
            Some Things Are <strong>SIMPLY IRREPLACEABLE</strong>. <br />
            Recover <strong>What's Yours</strong>.
          </div>

          <div className="HomePage-Buttons">
            <button
              className="HomePage-Button Found"
              onClick={() => navigate("/SubmitPage")}
            >
              I'VE FOUND AN ITEM
            </button>
            <button
              className="HomePage-Button Lost"
              onClick={() => navigate("/SearchPage")}
            >
              I'VE LOST AN ITEM
            </button>
          </div>
        </div>
        <div className="HomePage-Right">
          <img src={Mirror_Logo} alt="ReUnite Logo" />
        </div>
      </div>
    </>
  );
};

export default HomePage;
