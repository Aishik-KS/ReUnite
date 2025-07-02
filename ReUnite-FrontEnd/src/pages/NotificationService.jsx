import React, { useState } from "react";
import "./NotificationService.css";
import { FaEnvelope, FaMagic, FaPaperPlane, FaImage } from "react-icons/fa";
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "https://esm.sh/@google/genai";
import Navbar from "../components/Navbar";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../helpers/firebase";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  GEMINI_API_KEY,
} from "../../../Configuration/configuration";

const NotificationService = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [email, setEmail] = useState("");
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedDescription, setHasGeneratedDescription] = useState(false);
  const [error, setError] = useState(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.match("image.*")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.onerror = () => setError("Failed to read image file");
    reader.readAsDataURL(file);
  };

  const generateAIDescription = async () => {
    if (!image) {
      alert("Please upload an image first.");
      return;
    }

    setIsGenerating(true);
    let buffer = [];

    try {
      const imageBase64 = image.split(",")[1];
      const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

      const stream = await ai.models.generateContentStream({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              { inlineData: { mimeType: "image/png", data: imageBase64 } },
              {
                text: "Generate a description of the main object in the image uploaded in only 1-2 sentences. Do not describe the background or how the object is positioned. Start with the phrase 'I have lost a'",
              },
            ],
          },
        ],
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_HARASSMENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
          {
            category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const firstChunk = await stream.next();
      if (firstChunk.value.promptFeedback?.blockReason) {
        alert(`Input blocked: ${firstChunk.value.promptFeedback.blockReason}`);
        return;
      }

      buffer.push(firstChunk.value.text || "");
      for await (let response of stream) {
        buffer.push(response.text || "");
      }

      const finalDescription = buffer.join("").trim();
      setDescription(finalDescription);
      setHasGeneratedDescription(true);
    } catch (error) {
      console.error("AI generation failed:", error);
      alert("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const uploadImageToCloudinary = async () => {
    if (!imageFile) {
      throw new Error("No image file to upload");
    }

    const data = new FormData();
    data.append("file", imageFile);
    data.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: data,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to upload image");
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      console.error("Upload error:", error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const imageUrl = imageFile ? await uploadImageToCloudinary() : null;

      const notificationData = {
        title,
        email,
        imageUrl,
        description,
        daysleft: 30,
      };

      await addDoc(collection(db, "notifications"), notificationData);
      setIsSuccess(true);
      resetForm();
    } catch (error) {
      console.error("Submission failed:", error);
      alert("Failed to submit notification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setEmail("");
    setImage(null);
    setImageFile(null);
  };

  return (
    <>
      <Navbar />
      <div className="notification-service-page">
        <div className="service-hero">
          <div className="hero-content">
            <h1>Can't Find Your Item?</h1>
            <p className="hero-subtitle">
              Our email notification service will monitor new found items for 30
              days and alert you if we find a potential match.
            </p>
            <div className="service-features">
              <div className="feature">
                <div className="feature-icon">1</div>
                <p>Daily automated checks</p>
              </div>
              <div className="feature">
                <div className="feature-icon">2</div>
                <p>Image or description matching</p>
              </div>
              <div className="feature">
                <div className="feature-icon">3</div>
                <p>Email alerts when matched</p>
              </div>
            </div>
          </div>
        </div>

        <div className="service-form-container">
          <div className="service-form-wrapper">
            <h2>Set Up Your Item Alert</h2>
            <p className="form-description">
              Provide details about your lost item below. We'll notify you via
              email if we find a matching item in our system.
            </p>

            <form className="notification-form" onSubmit={handleSubmit}>
              <div className="form-section">
                <h3>Item Information</h3>
                <div className="form-grid item-info-grid">
                  <div className="form-group">
                    <label htmlFor="title">Item Title*</label>
                    <input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Black Wallet, Gold Ring, iPhone 12"
                      required
                    />
                  </div>

                  <div className="form-group image-upload-group">
                    <label>Item Image (Optional)</label>
                    <div className="image-upload-container">
                      {image ? (
                        <div className="image-preview-container">
                          <img
                            src={image}
                            alt="Uploaded preview"
                            className="image-preview"
                          />
                          <button
                            type="button"
                            className="remove-image-button"
                            onClick={() => setImage(null)}
                          >
                            ×
                          </button>
                        </div>
                      ) : (
                        <label className="upload-label">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="file-input"
                          />
                          <div className="upload-placeholder">
                            <FaImage className="upload-icon" />
                            <span>Click to upload image</span>
                          </div>
                        </label>
                      )}
                    </div>
                  </div>

                  <div className="form-group description-group">
                    <label htmlFor="description">Detailed Description*</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your item in detail (color, size, unique features, when/where you lost it)"
                      rows="5"
                      required
                    />
                    {image && (
                      <button
                        type="button"
                        className="ai-button"
                        onClick={generateAIDescription}
                        disabled={isGenerating}
                      >
                        <FaMagic />{" "}
                        {isGenerating
                          ? "Generating..."
                          : hasGeneratedDescription
                          ? "Regenerate Description"
                          : "Generate AI Description"}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-section">
                <h3>Notification Details</h3>
                <div className="form-group">
                  <label htmlFor="email">
                    <FaEnvelope className="input-icon" /> Email Address*
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                  />
                  <p className="input-hint">
                    We'll send notifications to this email address
                  </p>
                </div>
              </div>

              <div className="form-footer">
                <p className="service-terms">
                  By submitting, you agree to receive email notifications if we
                  find a match for your item within 30 days.
                </p>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    "Processing..."
                  ) : (
                    <>
                      <FaPaperPlane /> Activate Notifications
                    </>
                  )}
                </button>

                {isSuccess && (
                  <div className="success-message">
                    Success! We'll email you if we find a match for your item.
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotificationService;
