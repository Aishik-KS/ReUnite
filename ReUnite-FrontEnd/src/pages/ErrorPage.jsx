import React from "react";
import "./ErrorPage.css"; // Assuming the styles will be moved to a separate CSS file

const ErrorPage = () => {
  return (
    <div className="Error-Page">
      <div className="card-wrapper">
        <div className="card">
          <div className="code">Page Not Found!</div>
          <div className="message">
            It seems that you <span className="highlight">LOST</span> your way!
          </div>
          <a href="/" className="button">
            <span className="arrow">←</span> Find Home
          </a>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;
