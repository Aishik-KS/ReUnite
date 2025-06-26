import React, { useState } from "react";
import "./FAQ.css";
import Navbar from "../components/Navbar";

const faqData = [
  {
    question: "What is Reunite?",
    answer:
      "We're your go-to platform for finding lost items and reporting found items on campus. Think of us as a digital lost-and-found!",
  },
  {
    question: "How does Reunite make my life easier?",
    answer:
      "If you've lost something, you can quickly search our database. If you've found something, you can easily report it and help someone get their item back.",
  },
  {
    question: "I've found an item. What's the quickest way to report it?",
    answer:
      'Just click "Found Something." You\'ll snap a picture, add a quick description (our AI can even help!), and pinpoint the location where you found it on a map.',
  },
  {
    question: "Where does the picture of the item go?",
    answer:
      "Your picture is uploaded to a secure online storage, and we use it to show others what the item looks like.",
  },
  {
    question: "Do I need to be super descriptive when reporting an item?",
    answer:
      "No worries! You can write a description, or our smart AI can generate one for you directly from the picture.",
  },
  {
    question: "How do you know *exactly* where I found the item?",
    answer:
      "We use Google Maps to let you mark the precise spot. This helps owners know where to look!",
  },
  {
    question: "I lost an item. How do I start searching?",
    answer:
      'Head over to our "Search" page. You\'ll see all the items reported as found within the last month. You can view them in a grid or a list.',
  },
  {
    question: "Can I search using a picture of my lost item?",
    answer:
      "Absolutely! Upload a photo of what you lost, and our system will look for similar items. It's a great way to find a match!",
  },
  {
    question: "How long do found items stay listed on Reunite?",
    answer:
      "We keep found items on our search page for one month from when they were reported.",
  },
  {
    question: "I found my item on Reunite! How do I claim it?",
    answer:
      "To claim an item, you'll first need to log in with your Google account. This helps us confirm your identity.",
  },
  {
    question: "What if someone else also claims the item I want?",
    answer:
      "If there's a dispute, we advise both parties to resolve it with campus security. Reunite helps you connect, but they handle the final decision.",
  },
  {
    question:
      "Can Reunite tell me if someone finds my lost item *after* I've reported it missing?",
    answer:
      "Yes! If you provide details about your lost item (picture and description), we'll check daily for matches and send you a notification if we find one.",
  },
  {
    question:
      "How long will Reunite keep looking for my item and sending me alerts?",
    answer:
      "We'll keep searching and sending you notifications for up to one month from when you registered your lost item.",
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <Navbar />

      <div className="faqPage">
        <div className="faqPage-Display">
          <h2 className="faq-title">Frequently Asked Questions</h2>
          <h4 className="faq-description">
            Welcome to our FAQ section. Here you’ll find answers to the most
            common questions about ReUnite. We’re here to make your experience
            smooth and hassle-free.
          </h4>

          <div className="faqPage-DisplayContent">
            <div className="faq-container">
              {faqData.map((item, index) => (
                <div key={index} className="faq-item">
                  <div
                    className={`faq-question ${
                      openIndex === index ? "open" : ""
                    }`}
                    onClick={() => toggleFAQ(index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") toggleFAQ(index);
                    }}
                  >
                    <span className="faq-icon">
                      <span className="chevron">
                        {openIndex === index ? "▾" : "▸"}
                      </span>
                    </span>
                    {item.question}
                  </div>
                  <div
                    className={`faq-answer ${
                      openIndex === index ? "visible" : ""
                    }`}
                  >
                    {item.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <h4 className="faq-description">
            Still curious? If you don’t see your question here, feel free to
            contact us — we’re always happy to help.
          </h4>
        </div>
      </div>
    </>
  );
};

export default FAQ;
