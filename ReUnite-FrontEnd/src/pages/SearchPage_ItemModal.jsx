import React, { useState } from "react";
import {
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaBoxOpen,
  FaTimes,
} from "react-icons/fa";
import "./SearchPage_ItemModal.css";
import { db } from "../helpers/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth } from "../helpers/firebase";
import { sendClaimedItemEmail } from "../helpers/emailHelper";

const SearchPage_ItemModal = ({ item, onClose }) => {
  if (!item) return null;

  const [claimedStatus, setClaimedStatus] = useState(item.status);
  const [isDisputeInfoVisible, setIsDisputeInfoVisible] = useState(false);

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;
      console.log(email);
      toast.success("Google login successful! Redirecting...");

      await updateDoc(doc(db, "items", item.id), {
        status: "CLAIMED",
        claimedBy: email,
      });
      setClaimedStatus("CLAIMED");

      try {
        sendClaimedItemEmail(email, {
          title: item.title,
          dropLocation: item.dropLocation,
          imageUrl: item.imageUrl,
        })
          .then(() =>
            toast.info("Please check your email to view drop off location")
          )
          .catch((error) => console.error("Failed to send email:", error));
      } catch (error) {
        console.error("Email sending error:", error);
      }
    } catch (error) {
      handleLoginError(error, true);
    }
  };

  const handleLoginError = (error, isGoogle = false) => {
    console.error(`${isGoogle ? "Google" : ""} Login error:`, error);

    const errorMessages = {
      "auth/invalid-email": "Invalid email address format.",
      "auth/user-disabled": "This account has been disabled.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password.",
      "auth/too-many-requests": "Too many attempts. Try again later.",
      "auth/account-exists-with-different-credential":
        "An account already exists with this email.",
    };

    toast.error(
      errorMessages[error.code] ||
        `${isGoogle ? "Google" : ""} login failed. Please try again.`
    );
  };

  const handleClaim = async () => {};

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>
          <FaTimes />
        </button>

        <div className="modal-grid">
          <div className="modal-image-container">
            <img src={item.imageUrl} alt={item.title} className="modal-image" />
          </div>

          <div className="modal-details">
            <h2 className="modal-title">{item.title}</h2>
            <p className="modal-description">{item.description}</p>

            <div className="details-section">
              <div className="detail-row">
                <FaMapMarkerAlt className="detail-icon" />
                <div className="detail-text">
                  <span className="detail-label">Location Found: </span>
                  <span className="detail-value">{item.foundLocation}</span>
                </div>
              </div>

              <div className="detail-row">
                <FaCalendarAlt className="detail-icon" />
                <div className="detail-text">
                  <span className="detail-label">Date Found: </span>
                  <span className="detail-value">{item.foundDate}</span>
                </div>
              </div>

              <div className="detail-row">
                <FaBoxOpen className="detail-icon" />
                <div className="detail-text">
                  <span className="detail-label">Drop-off Location: </span>
                  <span className="detail-value">
                    {claimedStatus === "CLAIMED"
                      ? "Item has already been claimed. If You claimed this item, check your email."
                      : claimedStatus === "UNCLAIMED"
                      ? "Claim This Item to View"
                      : claimedStatus}
                  </span>
                </div>
              </div>
            </div>

            {claimedStatus === "UNCLAIMED" ? (
              <button
                type="button"
                className="social-button google"
                onClick={handleGoogleSignIn}
              >
                <FcGoogle className="social-icon" size={22} />
                <span>Sign in with Google to Claim</span>
              </button>
            ) : (
              <div className="dispute-container">
                <button
                  className="claim-btn"
                  onClick={() => setIsDisputeInfoVisible(!isDisputeInfoVisible)}
                >
                  {isDisputeInfoVisible
                    ? "Hide Dispute Information"
                    : "Would You Like to Dispute the Claim?"}
                </button>

                {isDisputeInfoVisible && (
                  <div className="dispute-info">
                    <p>
                      If you suspect theft or dishonest misappropriation of
                      property, please contact our Campus Security at 6790 5200
                      or report the incident to the Police immediately. You can
                      also file a security incident report with Campus Security
                      online at
                      <a
                        href="https://www.ntu.edu.sg/life-at-ntu/health-and-safety/report-a-security-incident"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        https://www.ntu.edu.sg/life-at-ntu/health-and-safety/report-a-security-incident
                      </a>
                      .
                    </p>
                    <p>
                      The University Campus Security will assist the Police in
                      their investigation. Please note, according to the
                      Personal Data Protection Act (PDPA), Campus Security is
                      not permitted to show CCTV footage to the complainant;
                      only the Police have the authority to review these
                      recordings.
                    </p>
                    <p>
                      You may subject yourself to liability of an offence of
                      dishonest misappropriation of property if you keep items
                      not belonging to you.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage_ItemModal;
