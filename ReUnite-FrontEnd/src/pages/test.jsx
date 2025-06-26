import React from "react";
import { dummyItems } from "../assets/dummydata";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";

const test = () => {
  const uploadDummyItems = async () => {
    try {
      for (const item of dummyItems) {
        const item_schema = {
          title: item.title,
          imageUrl: item.imageUrl,
          description: item.description,
          foundLocation: item.foundLocation,
          dropLocation: item.dropLocation,
          foundDate: item.foundDate,
          claimBy: item.claimBy,
          status: item.status,
        };

        await addDoc(collection(db, "Items"), item_schema);
        console.log(`Item added: ${item.title}`);
      }
      alert("All dummy items uploaded successfully!");
    } catch (error) {
      console.error("Error uploading dummy items: ", error);
    }
  };
  return (
    <div>
      <button onClick={uploadDummyItems}>Upload Dummy Items</button>
    </div>
  );
};

export default test;
