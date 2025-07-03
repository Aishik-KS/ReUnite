import React, { useState, useEffect, useRef } from "react";
import "./SubmitPage.css";
import {
  FaCamera,
  FaLocationArrow,
  FaCalendarAlt,
  FaMagic,
  FaPaperPlane,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import {
  GoogleGenAI,
  HarmBlockThreshold,
  HarmCategory,
} from "https://esm.sh/@google/genai";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../helpers/firebase";
import {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_UPLOAD_PRESET,
  GEMINI_API_KEY,
  GOOGLE_MAPS_API_KEY,
} from "../../../Configuration/configuration";

const DEFAULT_DROP_LOCATION = "One Stop@SAC";
const NTU_COORDINATES = { lat: 1.3483099, lng: 103.6831347 };

const loadGoogleMapsScript = (callback) => {
  if (window.google?.maps) {
    callback();
    return;
  }

  const existingScript = document.getElementById("googleMapsScript");
  if (existingScript) {
    existingScript.onload = callback;
    return;
  }

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
  script.id = "googleMapsScript";
  script.async = true;
  script.defer = true;
  script.onload = callback;
  script.onerror = () => console.error("Google Maps script failed to load");
  document.body.appendChild(script);
};

const SubmitPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    imageUrl: "",
    title: "",
    description: "",
    foundLocation: "",
    dropLocation: DEFAULT_DROP_LOCATION,
    foundDate: "",
  });
  const [image, setImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasGeneratedDescription, setHasGeneratedDescription] = useState(false);
  const [error, setError] = useState(null);

  // Refs
  const foundMapRef = useRef(null);
  const dropMapRef = useRef(null);
  const foundMapObj = useRef(null);
  const dropMapObj = useRef(null);
  const foundMarker = useRef(null);
  const dropMarker = useRef(null);
  const geocoder = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Maps
  useEffect(() => {
    loadGoogleMapsScript(() => {
      if (!window.google) {
        setError("Failed to load Google Maps");
        return;
      }

      try {
        geocoder.current = new window.google.maps.Geocoder();

        foundMapObj.current = new window.google.maps.Map(foundMapRef.current, {
          center: NTU_COORDINATES,
          zoom: 16,
        });

        dropMapObj.current = new window.google.maps.Map(dropMapRef.current, {
          center: NTU_COORDINATES,
          zoom: 16,
        });
      } catch (err) {
        setError("Error initializing maps: " + err.message);
      }
    });
  }, []);

  // Update markers when locations change
  useEffect(() => {
    if (formData.foundLocation && foundMapObj.current) {
      updateMapFromLocation(
        formData.foundLocation,
        foundMapObj.current,
        foundMarker
      );
    }
  }, [formData.foundLocation]);

  useEffect(() => {
    if (formData.dropLocation && dropMapObj.current) {
      updateMapFromLocation(
        formData.dropLocation,
        dropMapObj.current,
        dropMarker
      );
    }
  }, [formData.dropLocation]);

  const updateMarker = (mapObj, markerRef, position) => {
    if (!mapObj || !position) return;

    try {
      mapObj.setCenter(position);
      mapObj.setZoom(17);

      if (markerRef.current) {
        markerRef.current.setPosition(position);
      } else {
        markerRef.current = new window.google.maps.Marker({
          position,
          map: mapObj,
        });
      }
    } catch (err) {
      console.error("Error updating marker:", err);
      setError("Failed to update map marker");
    }
  };

  const reverseGeocode = async (coords, setLocationField) => {
    if (!geocoder.current) {
      setError("Geocoder not initialized");
      return;
    }

    try {
      const response = await new Promise((resolve, reject) => {
        geocoder.current.geocode({ location: coords }, (results, status) => {
          if (status === "OK") resolve(results);
          else reject(status);
        });
      });

      if (response[0]) {
        setLocationField(response[0].formatted_address);
      }
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      setError("Unable to get address from coordinates.");
    }
  };

  const updateMapFromLocation = (locationString, mapObj, markerRef) => {
    if (!locationString || !geocoder.current) return;

    const latLngMatch = locationString.match(
      /^\s*(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)\s*$/
    );

    if (latLngMatch) {
      const lat = parseFloat(latLngMatch[1]);
      const lng = parseFloat(latLngMatch[3]);
      updateMarker(mapObj, markerRef, { lat, lng });
    } else {
      geocoder.current.geocode(
        { address: locationString },
        (results, status) => {
          if (status === "OK" && results[0]) {
            const pos = results[0].geometry.location;
            updateMarker(mapObj, markerRef, { lat: pos.lat(), lng: pos.lng() });
          } else {
            setError("Could not find location: " + locationString);
          }
        }
      );
    }
  };

  const handleInputChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    setError(null);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.match("image.*")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setError("Image size should be less than 5MB");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImage(reader.result);
    reader.onerror = () => setError("Failed to read image file");
    reader.readAsDataURL(file);
    setError(null);
  };

  const getCurrentLocation = async (setLocationField, mapRef, markerRef) => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });

      const coords = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };

      updateMarker(mapRef.current, markerRef, coords);
      await reverseGeocode(coords, setLocationField);
      setError(null);
    } catch (error) {
      console.error("Error getting location:", error);
      setError("Could not get your location. Please enter manually.");
    }
  };

  const generateAIDescription = async () => {
    if (!image) {
      setError("Please upload an image first.");
      return;
    }

    let buffer = [];

    try {
      setIsGenerating(true);
      setError(null);

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
                text: "Generate a description of the main object in the image uploaded in only 1-2 sentences. Do not describe the background or how the object is positioned. Start with the phrase 'I have found a'",
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

      // Collect the stream output
      buffer.push(firstChunk.value.text || "");
      for await (let response of stream) {
        buffer.push(response.text || "");
      }

      const finalDescription = buffer.join("").trim();
      setFormData((prev) => ({ ...prev, description: finalDescription }));
      setHasGeneratedDescription(true);
    } catch (error) {
      console.error("AI generation failed:", error);
      setError("AI generation failed. Please try again.");
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
      setIsUploading(true);
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
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (
      !formData.title ||
      !formData.foundLocation ||
      !formData.foundDate ||
      !imageFile
    ) {
      setError("Please fill in all required fields and upload an image");
      return;
    }

    try {
      // Upload image to Cloudinary
      const imageUrl = await uploadImageToCloudinary();

      // Prepare data for Firestore
      const itemData = {
        title: formData.title,
        description: formData.description,
        foundLocation: formData.foundLocation.toUpperCase(),
        dropLocation: formData.dropLocation.toUpperCase(),
        foundDate: formData.foundDate,
        imageUrl,
        status: "UNCLAIMED",
        claimedBy: "NONE",
      };

      // Add document to Firestore
      await addDoc(collection(db, "items"), itemData);

      // Reset form after successful submission
      resetForm();
      alert("Item submitted successfully!");
    } catch (error) {
      console.error("Submission failed:", error);
      setError("Failed to submit item. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData({
      imageUrl: "",
      title: "",
      description: "",
      foundLocation: "",
      dropLocation: DEFAULT_DROP_LOCATION,
      foundDate: "",
    });
    setImage(null);
    setImageFile(null);
    setHasGeneratedDescription(false);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <>
      <Navbar />
      <div className="SubmitPage">
        <form className="SubmitPage-Form" onSubmit={handleSubmit}>
          <h2 className="SubmitPage-FormTitle">Enter Item Details Here</h2>

          <div className="SubmitPage-FormContent">
            {/* Left Column */}
            <div className="SubmitPage-FormLeft">
              <label htmlFor="image-upload" className="SubmitPage-UploadLabel">
                Upload Image
              </label>
              <div className="SubmitPage-UploadArea" id="image-upload">
                {image ? (
                  <img
                    src={image}
                    alt="Uploaded preview"
                    className="SubmitPage-ImagePreview"
                  />
                ) : (
                  <div className="SubmitPage-UploadPlaceholder">
                    <FaCamera className="SubmitPage-CameraIcon" />
                    <p>Click to upload or turn on camera</p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="SubmitPage-FileInput"
                  id="image-upload-input"
                />
              </div>

              <div className="SubmitPage-FormGroup">
                <label htmlFor="foundDate">Date Found*</label>
                <input
                  id="foundDate"
                  type="date"
                  value={formData.foundDate}
                  onChange={handleInputChange("foundDate")}
                  required
                  max={new Date().toISOString().split("T")[0]} // Can't be in the future
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="SubmitPage-FormRight">
              <div className="SubmitPage-FormGroup">
                <label htmlFor="title">Item Title*</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange("title")}
                  placeholder="e.g. Black Wallet, iPhone 12, etc."
                  required
                  minLength={3}
                />
              </div>

              <div className="SubmitPage-FormGroup description-group">
                <label htmlFor="description">Detailed Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={handleInputChange("description")}
                  placeholder="Describe the item in detail..."
                  rows="8"
                />
                <button
                  type="button"
                  className="SubmitPage-AIButton"
                  onClick={generateAIDescription}
                  disabled={isGenerating || !image}
                >
                  <FaMagic />
                  {isGenerating
                    ? "Generating..."
                    : hasGeneratedDescription
                    ? "Regenerate Description"
                    : "Generate AI Description"}
                </button>
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div className="SubmitPage-FullWidthFormGroup">
            <label htmlFor="foundLocation">Location Found*</label>
            <div className="location-input-group">
              <input
                id="foundLocation"
                type="text"
                value={formData.foundLocation}
                onChange={handleInputChange("foundLocation")}
                placeholder="Where did you find this item?"
                required
              />
              <button
                type="button"
                className="location-button"
                onClick={() =>
                  getCurrentLocation(
                    (loc) =>
                      setFormData((prev) => ({ ...prev, foundLocation: loc })),
                    foundMapObj,
                    foundMarker
                  )
                }
              >
                <FaLocationArrow />
                <span>Get Current Location</span>
              </button>
            </div>
          </div>

          <div className="SubmitPage-MapsContainer">
            <div className="SubmitPage-Map-Wrapper">
              <h3>Location Found Map</h3>
              <div ref={foundMapRef} className="SubmitPage-Map"></div>
            </div>

            <div className="SubmitPage-FullWidthFormGroup">
              <label htmlFor="dropLocation">Drop-off Location*</label>
              <div className="location-input-group">
                <input
                  id="dropLocation"
                  type="text"
                  value={formData.dropLocation}
                  onChange={handleInputChange("dropLocation")}
                  placeholder="Where should the item be dropped off?"
                  required
                />
                <button
                  type="button"
                  className="location-button"
                  onClick={() =>
                    getCurrentLocation(
                      (loc) =>
                        setFormData((prev) => ({ ...prev, dropLocation: loc })),
                      dropMapObj,
                      dropMarker
                    )
                  }
                >
                  <FaLocationArrow />
                  <span>Get Current Location</span>
                </button>
              </div>
            </div>

            <div className="SubmitPage-Map-Wrapper">
              <h3>Drop-off Location Map</h3>
              <div ref={dropMapRef} className="SubmitPage-Map"></div>
            </div>
          </div>

          <button
            type="submit"
            className="SubmitPage-SubmitButton SubmitPage-FullWidthButton"
            disabled={
              isUploading ||
              !formData.title ||
              !formData.foundLocation ||
              !formData.dropLocation ||
              !formData.foundDate ||
              !image
            }
          >
            {isUploading ? (
              "Uploading..."
            ) : (
              <>
                <FaPaperPlane /> Submit Item
              </>
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default SubmitPage;
