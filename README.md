# ReUnite – AI-Powered Lost & Found Platform for NTU

##  Inspiration
The current NTU lost & found system relies on:
- A cluttered Telegram channel (hard to search through long messages)
- A physical Google Sheets at One-Stop SAC (inconvenient for reporting)

We built ReUnite to modernize this process with AI and cloud technology.

##  Tech Stack

| Component           | Technology                          |
|---------------------|------------------------------------|
| **Frontend**        | React.js + Vite                    |
| **Backend**         | Firebase Cloud Firestore  + NodeJs         |
| **Authentication**  | Firebase Auth                      |
| **AI Services**     | Gemini (for image analysis)        |
| **Maps**            | Google Maps API                    |
| **Media Storage**   | Cloudinary                         |
| **Notifications**   | EmailJS + NodeMailer               |

## Key Features

### Lost Item Reporting
- **AI-Powered Descriptions**: Gemini generates text descriptions from uploaded images
- **Smart Geolocation**: Live map preview with drop-off pinning
- **Cloud Storage**: Images securely stored in Cloudinary
- **Auto-Expiry**: Items automatically removed after 30 days

### Item Search
- **Dual Search Modes**:
  - Text search in description field
  - Image similarity matching via Gemini
- **Flexible Viewing**: Grid or list display options
- **Detailed Modal**: Popup with full item details upon selection

### Secure Claim Process
- Google account login required for claims
- Drop-off location only revealed after claiming
- Dispute resolution via campus security

### Notification System
- Email subscriptions for unmatched searches
- Daily database checks for subscribed items
- Automatic alerts when matches are found

### Admin Dashboard
- Secure login for administrators
- System analytics and reporting
- Full database access and management

## Challenges Faced
- Firebase's new credit card requirement forced us to:
  - Evaluate alternative backend solutions
  - Implement careful cost monitoring
  - This added significant development time

## Future Roadmap
- **NTU Adoption**: Seek official university support
- **Global Expansion**: Scale platform beyond NTU
- **Mobile App**: Develop native iOS/Android versions
- **Enhanced AI**: Improve image matching accuracy
- **Campus Integration**: Connect with security systems
