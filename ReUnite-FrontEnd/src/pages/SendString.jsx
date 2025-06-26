import React, { useState } from "react";

function SendString() {
  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");

  const sendToBackend = async () => {
    try {
      const res = await fetch("http://localhost:3000/process-string", {
        method: "POST",
        headers: { "Content-Type": "text/plain" }, // Important: sending plain text
        body: input, // Send raw string
      });

      const data = await res.json();
      setResponse(data.results);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter something..."
      />
      <button onClick={sendToBackend}>Send</button>
      <p>Response:</p>
      <ul>
        {Array.isArray(response) &&
          response.map((item, index) => (
            <li key={index}>
              <strong>{item.title}</strong> - {item.similarity.toFixed(2)}%
            </li>
          ))}
      </ul>
    </div>
  );
}

export default SendString;
