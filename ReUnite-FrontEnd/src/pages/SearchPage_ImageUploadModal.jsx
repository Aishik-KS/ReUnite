import React, { useState, useRef } from "react";
import { useNavigate } from "react-router";
import { FiUpload, FiCamera, FiX } from "react-icons/fi";
import "./SearchPage_ImageUploadModal.css";
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "https://esm.sh/@google/genai";
import { GEMINI_API_KEY } from "../../../Configuration/configuration";

const SearchPage_ImageUploadModal = ({ onClose }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [imageDescription, setImageDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      setError(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIDescription = async () => {
    if (!preview) {
      setError("Please select an image first");
      return null;
    }

    setIsGenerating(true);
    setError(null);

    try {
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
        throw new Error("Content was blocked for safety reasons");
      }

      let description = firstChunk.value.text || "";
      for await (const response of stream) {
        description += response.text || "";
      }

      return description.trim();
    } catch (error) {
      console.error("AI generation failed:", error);
      setError("Failed to generate description. Please try another image.");
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCameraClick = () => {
    alert("Camera functionality would be implemented here");
  };

  const handleUpload = async () => {
    if (!selectedImage) {
      setError("Please select an image first");
      return;
    }

    try {
      const description = await generateAIDescription();
      if (!description) return;

      setImageDescription(description);

      const res = await fetch("http://localhost:3000/process-string", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: description,
      });

      if (!res.ok) {
        throw new Error("Failed to process image");
      }

      const data = await res.json();

      navigate("/SearchImagePage", {
        state: {
          image: preview,
          results: data.results,
        },
      });

      onClose();
    } catch (err) {
      console.error("Upload failed:", err);
      setError(err.message || "An error occurred during upload");
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

        {error && <div className="error-message">{error}</div>}

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
                setImageDescription("");
                setError(null);
              }}
            >
              Change Image
            </button>
          </div>
        )}

        <div className="button-group">
          <button className="camera-button" onClick={handleCameraClick}>
            <FiCamera /> Open Camera
          </button>
          <button
            className="upload-button"
            onClick={handleUpload}
            disabled={!selectedImage || isGenerating}
          >
            {isGenerating
              ? "Searching Database. . . "
              : "Search with this Image"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SearchPage_ImageUploadModal;
