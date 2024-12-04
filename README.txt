
### README.txt

---

# **Real-Time Chat Application**

## **Overview**
This is a fully functional real-time chat application built with modern technologies. It supports features like user authentication, real-time messaging, group chat, notifications, user profile management, and avatar/theme customization. But i less work on Frontend design because i wanted to work more on backed. So gave less time at UI.

---

## **Features**
1. **User Authentication**:
   - Register and Login with JWT-based authentication.
   - Secure token storage and handling.

2. **Real-Time Chat**:
   - Public chat for all connected users.
   - Private messaging between two users.
   - Group chat functionality.

3. **Notifications**:
   - Real-time notifications for new messages, group activities, and events.

4. **User Status**:
   - Online and offline tracking for connected users.

5. **Profile Management**:
   - Update profile details including username, email, password, and avatar.

6. **Theme Personalization**:
   - Customize the application's theme.

7. **Message Search**:
   - Search through messages in real-time.

8. **Typing Indicator**:
   - Real-time typing indicators for public and private chats.

9. **Media Uploads**:
   - Avatar uploads and rich media message support.

---

## **Technologies Used**
- **Frontend**: HTML, CSS, JavaScript, Bootstrap
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (with MongoDB Atlas)
- **Real-Time Communication**: Socket.IO
- **Media Storage**: Cloudinary
- **Authentication**: JWT (JSON Web Tokens)

---

## **Setup Instructions**

### **Prerequisites**
- Node.js installed on your system.
- MongoDB Atlas account for database connectivity.
- Cloudinary account for media storage.

### **Installation**
1. Clone the repository:
   ```bash
   git clone https://github.com/theBappy/Real-Time-Chat-App-Node-Express-MongoDB-Socket.io-JWT.git
   ```
2. Navigate to the project directory:
   ```bash
   cd chat-app
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### **Configuration**
1. Create a `.env` file in the root directory and configure the following:
   ```env
   PORT=3000
   MONGO_URI=your_mongo_db_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_URL=your_cloudinary_connection_url
   ```

2. Update `public/js/chat.js` for the correct WebSocket endpoint:
   ```javascript
   const socket = io('http://localhost:3000');
   ```

### **Run the Application**
1. Start the server:
   ```bash
   npm start
   ```
2. Open the browser and navigate to:
   ```
   http://localhost:3000
   ```

---

## **Development Progress**

### **Completed Features**
1. **User Authentication**:
   - Implemented secure JWT-based login and registration.
2. **Real-Time Messaging**:
   - Developed public and private chat features.
   - Added group chat support.
3. **File Uploads**:
   - Enabled avatar uploads via Cloudinary.
4. **User Profile**:
   - Integrated user profile management.
5. **Notifications**:
   - Real-time notifications for new messages and events.
6. **Search Messages**:
   - Built message search functionality.
7. **Online/Offline Tracking**:
   - Users’ statuses are tracked and displayed dynamically.
8. **UI/UX Enhancements**:
   - Designed user-friendly interfaces using Bootstrap.

### **Ongoing Development**
1. **Theme Personalization**:
   - Add dynamic theme customization options.

---

## **Usage Guide**
1. **Register/Login**:
   - Create an account or log in to access the chat features.
2. **Chat**:
   - Use public chat for group communication or private messaging for one-on-one conversations.
3. **Notifications**:
   - Stay updated with real-time notifications.
4. **Profile Management**:
   - Update your profile details and avatar from the user profile page.

---

## **Future Enhancements**
1. Deploy the application to a production environment (e.g., AWS, Heroku).
2. Implement advanced security measures (rate limiting, validation).
3. Add video call and multimedia message support.

---

## **Contact**
For queries or contributions, please contact:
- **Email**: developer@example.com
- **GitHub**: [Your GitHub Link](https://github.com/your-profile)

---
