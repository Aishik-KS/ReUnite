import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { FiUpload, FiCamera, FiX } from "react-icons/fi";
import axios from "axios";
import "./SearchPage_ImageUploadModal.css";
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "https://esm.sh/@google/genai";
import { GEMINI_API_KEY } from "../config/configuration";

const SearchPage_ImageUploadModal = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageDescription, setImageDescription] = useState(null);
  const [error, setError] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGeneratedDescription, setHasGeneratedDescription] = useState(false);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCameraClick = () => {
    alert("Camera functionality would be implemented here");
  };

  const generateAIDescription = async () => {
    if (!preview) {
      setError("Please upload an image first.");
      return;
    }

    let buffer = [];

    try {
      setIsGenerating(true);
      setError(null);

      const imageBase64 = preview.split(",")[1];
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
        setError(
          `Input blocked: ${firstChunk.value.promptFeedback.blockReason}`
        );
        return;
      }

      buffer.push(firstChunk.value.text || "");
      for await (let response of stream) {
        buffer.push(response.text || "");
      }

      const finalDescription = buffer.join("").trim();
      setImageDescription(finalDescription);
      setHasGeneratedDescription(true);
    } catch (error) {
      console.error("AI generation failed:", error);
      setError("AI generation failed. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    try {
      // If you need to upload to your server first:
      const response = await axios.post("http://localhost:5000/calculate", {
        image: preview,
      });

      // For now, just navigate with the image
      navigate("/SearchImagePage", { state: { image: preview } });
      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      setError("Upload failed. Please try again.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.match("image.*")) {
      handleImageChange({ target: { files: [file] } });
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="modal-overlay">
      <div className="image-upload-modal">
        <button className="close-button" onClick={onClose}>
          <FiX />
        </button>
        <h2>Upload Image</h2>
        <p>Upload an image to search for similar items</p>

        {!preview ? (
          <div
            className="upload-area"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current.click()}
          >
            <FiUpload className="upload-icon" />
            <p>Drag & drop an image here or click to browse</p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>
        ) : (
          <div className="image-preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <button
              className="change-image-button"
              onClick={() => {
                setSelectedImage(null);
                setPreview(null);
              }}
            >
              Change Image
            </button>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="button-group">
          <button className="camera-button" onClick={handleCameraClick}>
            <FiCamera /> Open Camera
          </button>
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!selectedImage}
          >
            Search with this Image
          </button>
        </div>

        {preview && !hasGeneratedDescription && (
          <button
            className="generate-description-button"
            onClick={generateAIDescription}
            disabled={isGenerating}
          >
            {isGenerating ? "Generating..." : "Generate Description"}
          </button>
        )}

        {imageDescription && (
          <div className="image-description">
            <h4>Generated Description:</h4>
            <p>{imageDescription}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage_ImageUploadModal;
