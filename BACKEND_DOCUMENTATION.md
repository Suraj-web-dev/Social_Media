# 🖥️ PingUp Social Media - Backend Architecture & API Documentation

Yeh document PingUp Social Media ke **Backend codebase** ka complete breakdown provide karta hai. Isme har functionality ke liye kon sa Controller, Model, Route, Middleware, Socket event aur Config file kaha aur kaise use kiya gaya hai, step-by-step explain kiya gaya hai.

---

## 🛠️ Backend Tech Stack
- **Runtime:** Node.js (ES Modules `import/export`)
- **Web Framework:** Express.js 5
- **Database:** MongoDB via Mongoose ODM
- **Authentication:** JWT (JSON Web Token) with HTTP-Only Cookie & Header fallback
- **Password Security:** BcryptJS (Hashing with salt rounds)
- **Real-Time Engine:** Socket.io (WebSockets + Polling fallback)
- **Media Uploads:** Multer (Memory Storage) + ImageKit SDK (CDN Media Hosting)
- **Environment:** Dotenv

---

## 📁 Backend Directory Structure (`Backend/`)

```
Backend/
├── configs/
│   ├── db.js                     # MongoDB connection setup with Mongoose
│   ├── imagekit.js               # ImageKit SDK configuration & initialization
│   └── multer.js                 # Multer storage configuration for memory buffer
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js    # Register, login, logout, getMe, delete account
│   │   ├── circle.controller.js  # Create, update, delete circles & manage circle members
│   │   ├── message.controller.js # Send 1-on-1 DM, get chat history, recent conversations
│   │   ├── notification.controller.js # Notifications fetch, mark read, real-time trigger helper
│   │   ├── post.controller.js    # Feed posts, reels, likes, comments, bookmarks, delete
│   │   ├── story.controller.js   # 24h stories, story views, story likes, story DM replies
│   │   └── user.controller.js    # Profile update (avatar/cover), follow/unfollow, discover
│   ├── middleware/
│   │   └── auth.middleware.js    # JWT authentication verification middleware
│   ├── models/
│   │   ├── Circle.model.js       # User custom audience circle schema
│   │   ├── Message.model.js      # Direct message & media schema
│   │   ├── Notification.model.js # User notifications schema
│   │   ├── Post.model.js         # Post, media, comments, and likes schema
│   │   ├── Story.model.js        # 24-hour expiring story schema
│   │   └── User.model.js         # User credentials, profile, connections schema
│   ├── routes/
│   │   ├── auth.routes.js        # /api/auth endpoints
│   │   ├── circle.routes.js      # /api/circle endpoints
│   │   ├── message.routes.js     # /api/message endpoints
│   │   ├── notification.routes.js# /api/notifications endpoints
│   │   ├── post.routes.js        # /api/post endpoints
│   │   ├── story.routes.js       # /api/story endpoints
│   │   └── user.routes.js        # /api/user endpoints
│   └── socket/
│       └── socket.js             # Socket.io server instance, active user map & real-time events
├── .env                          # Environment variables configuration
├── package.json                  # Dependencies and startup scripts
├── server.js                     # Main Express server entry point & middleware pipeline
└── vercel.json                   # Serverless deployment configuration
```

---

## 🗄️ Database Schemas & Data Models (`src/models/`)

### 1. `User.model.js` (User Identity & Connections)
- **Fields:**
  - `full_name`, `email` (unique, lowercase), `username` (unique, lowercase)
  - `password` (hashed with `bcrypt.hash` before save hook, excluded by default via `select: false`)
  - `profile_picture`, `cover_photo`, `bio`, `location`, `is_verified`
  - `followers` (Array of User `ObjectId`s)
  - `following` (Array of User `ObjectId`s)
  - `connections` (Array of mutual User `ObjectId`s)
  - `saved_posts` (Array of Post `ObjectId`s bookmarked by user)
- **Methods:**
  - `comparePassword(enteredPassword)`: Compares raw password with hashed password.

---

### 2. `Post.model.js` (Posts, Reels & Comments)
- **Fields:**
  - `user`: Reference to `User` author
  - `content`: Text body of post
  - `image_urls`: Array of ImageKit hosted image URLs
  - `video_urls`: Array of ImageKit hosted video URLs (used for Reels feed)
  - `privacy`: Enum `['Public', 'Connections', 'Circle', 'Private']`
  - `target_circle`: Reference to specific `Circle` if privacy is "Circle"
  - `location`, `feeling`: Extra metadata tags
  - `likes_count`: Array of User `ObjectId`s who liked the post
  - `comments`: Array of subdocuments containing `user`, `text`, `likes`, `createdAt`, `updatedAt`

---

### 3. `Story.model.js` (24-Hour Ephemeral Stories)
- **Fields:**
  - `user`: Reference to `User`
  - `media_url`, `media_type` (`'image'`, `'video'`, `'text'`)
  - `content`, `caption`, `background_color`, `font_style`, `filter`
  - `music`: Object containing `{ title, artist }`
  - `target_circle`: `'all'` or specific circle ID
  - `views`: Array of objects `{ user: ObjectId, viewedAt: Date }`
  - `likes`: Array of User `ObjectId`s
  - `createdAt`: Used with `$gte: last24Hours` query filter for automatic 24-hour expiration

---

### 4. `Message.model.js` (Direct Messages)
- **Fields:**
  - `sender`: Reference to `User`
  - `receiver`: Reference to `User`
  - `text`: String message
  - `media_url`: Attached image URL (ImageKit)
  - `message_type`: `'text'` | `'image'`
  - `seen`: Boolean (read receipt)

---

### 5. `Notification.model.js` (Activity Alerts)
- **Fields:**
  - `recipient`: User receiving notification
  - `sender`: User who triggered action
  - `type`: `'like_post'` | `'like_comment'` | `'comment_post'` | `'follow'` | `'message'`
  - `post`: Reference to Post (optional)
  - `commentId`: String ID of comment (optional)
  - `text`: Optional preview text
  - `isRead`: Boolean flag

---

### 6. `Circle.model.js` (Custom Audience Circles)
- **Fields:**
  - `user`: Owner of the circle
  - `name`: Name (e.g., "Close Friends", "Coding Buddies")
  - `icon`: Emoji or icon identifier
  - `color`: Hex color string for badge
  - `description`: Info text
  - `members`: Array of User `ObjectId`s

---

## 🧭 Backend Functionality vs Controllers Breakdown

### 1. 🔑 Authentication Controller (`src/controllers/auth.controller.js`)
* **Functions:**
  - `register(req, res)`: Validates input, hashes password, saves new user, creates JWT token and sets HTTP-only cookie.
  - `login(req, res)`: Authenticates user by email/username and password, returns user data & sets JWT cookie.
  - `logout(req, res)`: Clears the `token` cookie.
  - `getMe(req, res)`: Returns logged-in user profile from `req.user` verified by auth middleware.
  - `deleteAccount(req, res)`: Permanently deletes user record and clears session.

---

### 2. 👤 User Management Controller (`src/controllers/user.controller.js`)
* **Functions:**
  - `getUserData(req, res)`: Fetches user profile by ObjectId or username with populated followers, following, and connections.
  - `updateUserData(req, res)`: Handles avatar & cover photo buffer upload to ImageKit via Multer memory storage and updates profile fields.
  - `followUnfollowUser(req, res)`: Toggles follow status, updates mutual `connections` array, and dispatches real-time follow notification.
  - `getDiscoverUsers(req, res)`: Returns community members to explore and follow.
  - `getUserConnections(req, res)`: Returns populated list of followers, following, and mutual connections.

---

### 3. 📰 Post & Engagement Controller (`src/controllers/post.controller.js`)
* **Functions:**
  - `createPost(req, res)`: Uploads multiple media files to ImageKit (`/posts/images` or `/posts/videos`), saves post with selected privacy and circle target.
  - `getFeedPosts(req, res)`: Fetches all feed posts sorted by newest first (`createdAt: -1`), automatically filtering Circle-privacy posts so only authorized circle members and the author can view them.
  - `getReels(req, res)`: Queries posts having non-empty `video_urls` array for the video reel stream.
  - `getUserPosts(req, res)`: Returns all posts by a specific user ID/username.
  - `likeUnlikePost(req, res)`: Toggles like and creates in-app + socket notification for post author.
  - `getPostLikes(req, res)`: Returns populated list of users who liked the post.
  - `addComment(req, res)`: Pushes comment subdocument and triggers comment notification.
  - `deleteComment(req, res)`: Allows either the comment author or post owner to delete comment.
  - `likeUnlikeComment(req, res)`: Toggles like on comment subdocument.
  - `editComment(req, res)`: Updates comment text.
  - `bookmarkPost(req, res)`: Adds/removes post ID from user's `saved_posts` array.
  - `getSavedPosts(req, res)`: Populates and returns user's bookmarked posts.
  - `deletePost(req, res)`: Allows post author to delete post.

---

### 4. 📸 Stories Controller (`src/controllers/story.controller.js`)
* **Functions:**
  - `createStory(req, res)`: Creates media or text story with custom backgrounds, filters, and music metadata.
  - `getFeedStories(req, res)`: Queries active stories created within the last 24 hours (`createdAt: { $gte: 24h }`).
  - `viewStory(req, res)`: Records viewer user ID and timestamp (prevents duplicate views).
  - `likeStory(req, res)`: Toggles story like and dispatches notification.
  - `replyToStory(req, res)`: Automatically creates a direct message (`Message` model) to the story author containing the story reference.
  - `getStoryViewers(req, res)`: Returns viewers and likers list (only accessible to the story author).
  - `deleteStory(req, res)`: Deletes active story.

---

### 5. 💬 Real-Time Messaging Controller (`src/controllers/message.controller.js`)
* **Functions:**
  - `sendMessage(req, res)`: Creates message, uploads optional attached image to ImageKit, and emits real-time `receiveMessage` event directly to recipient's Socket ID.
  - `getMessages(req, res)`: Fetches conversation history between two users and marks unread incoming messages as `seen: true`.
  - `getRecentConversations(req, res)`: Groups latest chats by user and returns last message and unread count badges.

---

### 6. 🔔 Notifications Controller (`src/controllers/notification.controller.js`)
* **Functions:**
  - `createNotification({...})`: Internal helper that prevents duplicate spam notifications, creates DB record, and emits `newNotification` event to receiver via Socket.io.
  - `getNotifications(req, res)`: Returns latest 50 notifications with populated sender info and unread count.
  - `markNotificationAsRead(req, res)`: Sets `isRead: true` for a single notification.
  - `markAllNotificationsAsRead(req, res)`: Sets all unread notifications to read.
  - `deleteNotification(req, res)`: Deletes notification item.

---

### 7. ⭕ Circles Controller (`src/controllers/circle.controller.js`)
* **Functions:**
  - `getUserCircles(req, res)`: Fetches user circles (auto-seeds default presets like "Close Friends", "Coding Friends", "Family", "College" if first time).
  - `createCircle(req, res)`: Creates new circle with name, icon, color, description, and initial members.
  - `updateCircle(req, res)`: Updates circle details.
  - `deleteCircle(req, res)`: Deletes circle.
  - `toggleCircleMember(req, res)`: Adds or removes a user from circle members list.

---

## 🛡️ Security & Authentication Middleware (`src/middleware/auth.middleware.js`)
- **How it works:**
  1. Requests check for JWT token inside `req.cookies.token` OR `req.headers.authorization` (`Bearer <token>`).
  2. If token is missing, responds with `401 Unauthorized`.
  3. Decodes token using `process.env.JWT_SECRET`.
  4. Fetches user from DB (`User.findById(decoded.id).select("-password")`) and attaches it to `req.user`.
  5. Calls `next()` to pass control to the controller.

---

## ⚡ Real-Time Socket Architecture (`src/socket/socket.js`)
- **Active Connections Tracking:** Uses `userSocketMap[userId] = socket.id`.
- **Events:**
  - `connection`: Captures `userId` query parameter and registers socket ID.
  - `getOnlineUsers`: Broadcasts array of active user IDs to all clients whenever someone connects or disconnects.
  - `typing`: Relays typing state `{ senderId, isTyping }` to recipient's socket.
  - `disconnect`: Cleans up disconnected user ID from map.
  - `io.to(receiverSocketId).emit("receiveMessage", msg)`: Real-time chat dispatch.
  - `io.to(receiverSocketId).emit("newNotification", notif)`: Real-time notification dispatch.

---

## 🌐 Complete REST API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user |
| `POST` | `/api/auth/login` | Public | Login with email/username & password |
| `POST` | `/api/auth/logout` | Public | Clear auth cookie |
| `GET` | `/api/auth/me` | Private | Verify session and get logged-in user |
| `DELETE` | `/api/auth/delete` | Private | Permanently delete account |

### 👤 User Profile & Connections (`/api/user`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/user/data` | Private | Get current user profile |
| `GET` | `/api/user/:id` | Private | Get user profile by ID or username |
| `PUT` | `/api/user/update` | Private | Update profile & upload avatar/cover |
| `POST` | `/api/user/follow/:id` | Private | Follow / Unfollow user |
| `GET` | `/api/user/discover` | Private | Get suggested users to follow |
| `GET` | `/api/user/connections/all` | Private | Get populated followers, following & connections |

### 📝 Posts & Reels (`/api/post`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/post/create` | Private | Create post with images/videos |
| `GET` | `/api/post/feed` | Private | Get all feed posts (with circle privacy filter) |
| `GET` | `/api/post/reels` | Private | Get video reels feed |
| `GET` | `/api/post/user/:id` | Private | Get posts of specific user |
| `GET` | `/api/post/single/:id` | Private | Get single post / reel details |
| `POST` | `/api/post/like/:id` | Private | Toggle like on post |
| `GET` | `/api/post/likes/:id` | Private | Get users list who liked post |
| `POST` | `/api/post/comment/:id` | Private | Add comment to post |
| `DELETE`| `/api/post/comment/:postId/:commentId` | Private | Delete comment |
| `POST` | `/api/post/comment/like/:postId/:commentId` | Private | Like / Unlike comment |
| `PUT` | `/api/post/comment/:postId/:commentId` | Private | Edit comment |
| `POST` | `/api/post/bookmark/:id`| Private | Save / Bookmark post |
| `GET` | `/api/post/saved` | Private | Get all bookmarked posts |
| `DELETE`| `/api/post/:id` | Private | Delete own post |

### 📸 Stories (`/api/story`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/story/create` | Private | Create media or text story |
| `GET` | `/api/story/feed` | Private | Get active 24h stories |
| `POST` | `/api/story/:id/view` | Private | Record story view |
| `POST` | `/api/story/:id/like` | Private | Like / Unlike story |
| `POST` | `/api/story/:id/reply` | Private | Send DM reply to story |
| `GET` | `/api/story/:id/viewers` | Private | Get story viewers & likers list |
| `DELETE`| `/api/story/:id` | Private | Delete story |

### 💬 Direct Messages (`/api/message`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/message/send/:userId` | Private | Send message / image to user |
| `GET` | `/api/message/:userId` | Private | Get conversation messages history |
| `GET` | `/api/message/conversations/recent` | Private | Get list of recent chat conversations |

### 🔔 Notifications (`/api/notifications`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/notifications` | Private | Get user notifications & unread count |
| `PUT` | `/api/notifications/read/:id` | Private | Mark specific notification as read |
| `PUT` | `/api/notifications/read-all` | Private | Mark all notifications as read |
| `DELETE`| `/api/notifications/:id` | Private | Delete notification |

### ⭕ Custom Circles (`/api/circle`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/circle/my` | Private | Get user's custom circles (auto-seeds defaults) |
| `POST` | `/api/circle/create` | Private | Create new circle |
| `PUT` | `/api/circle/:id` | Private | Update circle |
| `DELETE`| `/api/circle/:id` | Private | Delete circle |
| `POST` | `/api/circle/:id/toggle-member` | Private | Add/Remove member from circle |

