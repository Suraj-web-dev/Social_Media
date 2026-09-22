# 📱 PingUp Social Media - Frontend Architecture & Component Documentation

Yeh document PingUp Social Media ke **Frontend codebase** ka complete breakdown provide karta hai. Isme har ek functionality ke liye kon sa component, page, ya Redux slice kaha aur kaise use kiya gaya hai, step-by-step explain kiya gaya hai.

---

## 🛠️ Tech Stack & Libraries
- **Core:** React 19 + Vite
- **Styling:** TailwindCSS v4 + Custom Glassmorphism UI
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`)
- **Routing:** React Router DOM v7 (Lazy loading with `Suspense`)
- **Real-Time Communication:** Socket.io-client
- **Animations:** Framer Motion
- **Icons:** Lucide React
- **Notifications/Alerts:** React Hot Toast
- **Date Handling:** Moment.js

---

## 📁 Frontend Directory Structure (`Social_Media/src/`)

```
src/
├── api/
│   ├── axios.js                  # Axios instance with Base URL & withCredentials
│   └── socket.js                 # Real-time Socket.io client setup & events
├── components/
│   ├── chat/
│   │   ├── ChatHeader.jsx        # Chat recipient info, online status, call buttons
│   │   ├── ChatInput.jsx         # Message input, image upload, emoji picker, typing trigger
│   │   └── MessageList.jsx       # Chat message bubbles, timestamps, media preview
│   ├── AccountSettingsModal.jsx  # Change password & permanent delete account modal
│   ├── CirclesManagerModal.jsx   # Create, edit, delete & add members to custom circles
│   ├── EditProfileModal.jsx      # Edit avatar, cover, name, bio, location
│   ├── FeelingsPicker.jsx        # Emoji/Activity mood selector for posts
│   ├── InstagramCommentsModal.jsx# Instagram-style full comment drawer with reply & like
│   ├── LikesModal.jsx            # Modal showing list of users who liked post/story
│   ├── MediaPreview.jsx          # Media attachment preview with remove button
│   ├── MenuItem.jsx              # Navigation item for sidebar
│   ├── NotificationsModal.jsx    # Real-time notification center popup
│   ├── PostDetailModal.jsx       # Full post overlay with comments & interactions
│   ├── PostOptionsMenu.jsx       # Post 3-dots popup (Save, Delete, Share, Copy link)
│   ├── PrivacySelector.jsx       # Audience selector dropdown (Public, Circle, etc.)
│   ├── RecentMessages.jsx        # Sidebar recent DM conversation list
│   ├── SharePostModal.jsx        # Share post to direct message or copy link
│   ├── Sidebar.jsx               # Responsive Desktop & Mobile drawer navigation
│   ├── StoriesBar.jsx            # Top horizontal story tray with live view counters
│   ├── StoryModal.jsx            # Fullscreen Instagram-style story player with progress bar
│   ├── Storyviewers.jsx          # Bottom drawer displaying viewers & likers of story
│   ├── ThemeToggle.jsx           # Dark/Light mode switcher toggle
│   └── TrendingTags.jsx          # Trending hashtags & suggestions widget
├── context/
│   └── ThemeContext.jsx          # Dark / Light mode persistent state context
├── pages/
│   ├── ChatBox.jsx               # 1-on-1 Real-time Chat Conversation screen
│   ├── Connections.jsx           # Followers, Following, Mutuals & Circles Management
│   ├── CreatePost.jsx            # Dedicated Create Post page with rich media uploads
│   ├── Discover.jsx              # Explore & find new creators / suggested users
│   ├── Feed.jsx                  # Main home feed (Stories + Posts + Filters + Widgets)
│   ├── Layout.jsx                # Global App Shell (Sidebar + Main Outlet + Mobile Dock)
│   ├── Login.jsx                 # Login / Register Split screen with Glassmorphism
│   ├── Messages.jsx              # Master Messages Inbox page
│   ├── PostCard.jsx              # Reusable rich post card component
│   ├── Profile.jsx               # User profile page (Posts, Reels, Saved, Follow button)
│   ├── Reels.jsx                 # Short-video Reels Feed (TikTok/Instagram style)
│   └── SinglePost.jsx            # Single post / reel standalone view
├── redux/
│   ├── slices/
│   │   ├── authSlice.js          # User Auth & profile data state
│   │   ├── circleSlice.js        # Custom audience circles state
│   │   ├── messageSlice.js       # Real-time chats & conversations state
│   │   ├── notificationSlice.js  # Notifications list & unread count state
│   │   ├── postSlice.js          # Feed posts, reels, likes, comments, bookmarks
│   │   ├── storySlice.js         # 24h stories, viewers, reactions, active stories
│   │   └── userSlice.js          # Discover users, profile details, follow/unfollow
│   └── store.js                  # Central Redux Store configuration
├── routes/
│   └── AppRoutes.jsx             # App route configuration & protected route handling
├── utils/
│   └── toast.js                  # Custom styled react-hot-toast helper functions
├── App.jsx                       # Root App component with Theme & Toast provider
└── main.jsx                      # React entry point with Redux Provider & Router
```

---

## 🧭 Functionality vs Components Deep Dive

### 1. 🔐 Authentication & Session Management
* **Functionality:** User Registration, Login, Session Verification (`getMe`), Logout, Delete Account.
* **Files & Components Used:**
  - `src/pages/Login.jsx`: Glassmorphic auth form with toggle between "Login" and "Sign Up".
  - `src/redux/slices/authSlice.js`: Contains `loginUser`, `registerUser`, `checkAuth`, `logoutUser`, `deleteAccountThunk`.
  - `src/routes/AppRoutes.jsx`: Controls conditional rendering: agar user authenticated nahi hai toh `<Login />`, warna `<Layout />`.
* **Kaise kaam karta hai:**
  1. User credentials enter karta hai -> `dispatch(loginUser(data))`.
  2. Axios backend `/api/auth/login` ko call karta hai with HTTP-only cookie credentials.
  3. Redux state update hoti hai `state.auth.user`.
  4. Jab page refresh hota hai, `AppRoutes.jsx` automatically `dispatch(checkAuth())` chalata hai session persist rakhne ke liye.

---

### 2. 🏠 Home Feed & Content Consumption
* **Functionality:** Stories bar, Post Stream, Feed Filter Pills (For You, Following, Trending), Sticky Right Sidebar widgets.
* **Files & Components Used:**
  - `src/pages/Feed.jsx`: Main feed wrapper.
  - `src/components/StoriesBar.jsx`: Top horizontal story bubbles.
  - `src/pages/PostCard.jsx`: Individual post container.
  - `src/components/RecentMessages.jsx`: Quick chat widget on desktop.
  - `src/redux/slices/postSlice.js`: Manages `fetchFeedPosts`.
* **Kaise kaam karta hai:**
  1. `Feed.jsx` mount hote hi `fetchFeedPosts()` dispatch karta hai.
  2. Filter tabs (`For You`, `Following`, `Trending`) client-side fast filtering perform karte hain bina unnecessary API calls ke.
  3. Desktop screen par right-side `RecentMessages` aur `Explore Circles` widgets render hote hain.

---

### 3. 📝 Create Post & Rich Media Sharing
* **Functionality:** Text caption, multi-image upload, video reel upload, feeling/activity status, circle/audience privacy selector.
* **Files & Components Used:**
  - `src/pages/CreatePost.jsx`: Full featured post creator screen.
  - `src/components/FeelingsPicker.jsx`: Emojis & feelings picker popup (e.g. "happy", "coding", "traveling").
  - `src/components/PrivacySelector.jsx`: Privacy dropdown (`Public`, `Connections`, `Circle`).
  - `src/components/MediaPreview.jsx`: Preview uploaded images/videos with remove option before submitting.
  - `src/redux/slices/postSlice.js`: `createNewPost` async thunk with `FormData`.
* **Kaise kaam karta hai:**
  1. User images/videos select karta hai -> File objects state me aate hain aur `MediaPreview` me display hote hain.
  2. User privacy select karta hai -> Agar "Circle" select kiya toh user ke circles list show hoti hai.
  3. Submit button par `FormData` banaya jata hai aur backend `/api/post/create` par bhej diya jata hai.

---

### 4. ❤️ Post Interactions & Engagement
* **Functionality:** Like/Unlike post, Double tap like animation, Bookmark/Save post, Share modal, 3-dots post actions menu.
* **Files & Components Used:**
  - `src/pages/PostCard.jsx`: Double-tap heart animation, interactive like, comment, bookmark, share buttons.
  - `src/components/LikesModal.jsx`: Post like karne wale sabhi users ki list dikhata hai.
  - `src/components/SharePostModal.jsx`: Direct message me post share karne aur link copy karne ka modal.
  - `src/components/PostOptionsMenu.jsx`: Author ke liye Delete option, sabhi ke liye Save/Bookmark aur Copy Link.
  - `src/redux/slices/postSlice.js`: `toggleLikePost`, `toggleBookmarkPost`, `deletePostAction`.
* **Kaise kaam karta hai:**
  - Optimistic UI updates use hoti hain taaki button click karte hi heart red ho jaye bina network latency ke.

---

### 5. 💬 Instagram-Style Comments System
* **Functionality:** Sliding bottom drawer / modal for comments, like comment, reply to comment, delete own comment, emoji quick reactions.
* **Files & Components Used:**
  - `src/components/InstagramCommentsModal.jsx`: High-performance sliding sheet/modal with real-time comments list and input box.
  - `src/redux/slices/postSlice.js`: `addCommentThunk`, `deleteCommentThunk`, `toggleCommentLikeThunk`.
* **Kaise kaam karta hai:**
  1. `PostCard.jsx` me Comment icon click karne par `isCommentsOpen` true hota hai.
  2. `InstagramCommentsModal` post ke comments array ko render karta hai.
  3. Comment submit hone par backend post update karta hai aur notification trigger karta hai.

---

### 6. 📸 Stories & Status System (24-Hour Stories)
* **Functionality:** Stories carousel, Create Text/Image/Video story, Story Progress Bar, Story Viewers Drawer, Story Likes & DMs.
* **Files & Components Used:**
  - `src/components/StoriesBar.jsx`: Horizontal list of unread/read story rings with user avatars + "Add Story" button.
  - `src/components/StoryModal.jsx`: Fullscreen interactive story viewer with automatic timed slide progression, pause on touch, caption, filter, and quick reaction buttons.
  - `src/components/Storyviewers.jsx`: Shows exact list of viewers and likes on your active story.
  - `src/redux/slices/storySlice.js`: `fetchStories`, `createStoryThunk`, `viewStoryAction`, `likeStoryAction`, `replyStoryAction`.
* **Kaise kaam karta hai:**
  1. `StoriesBar` active stories load karta hai (`fetchStories`).
  2. Story click karne par `StoryModal` open hota hai.
  3. Automatic 5-second progress timer chalta hai; user tap se Next/Prev story switch kar sakta hai.
  4. Story open hote hi `viewStoryAction(storyId)` dispatch hota hai jo viewer count badhata hai.

---

### 7. ⚡ Real-Time Messaging & Direct Chats (DMs)
* **Functionality:** 1-on-1 private messaging, image sharing, instant socket delivery, unread message badges, online indicator, typing indicator.
* **Files & Components Used:**
  - `src/pages/Messages.jsx`: All conversations list view with search and unread badges.
  - `src/pages/ChatBox.jsx`: Main chat window for specific recipient.
  - `src/components/chat/ChatHeader.jsx`: Recipient profile picture, name, online badge (`Active now`).
  - `src/components/chat/MessageList.jsx`: Message history with message alignment (left for received, right for sent), image render, and seen status.
  - `src/components/chat/ChatInput.jsx`: Message text area, media attachment picker, image preview before send, typing trigger.
  - `src/api/socket.js`: Handles `receiveMessage`, `userTyping`, `getOnlineUsers`.
  - `src/redux/slices/messageSlice.js`: Stores `conversations`, `currentMessages`, `onlineUsers`.
* **Kaise kaam karta hai:**
  1. User message send karta hai -> HTTP POST `/api/message/send/:id` with optional image file.
  2. Backend Socket.io se receiver ko `receiveMessage` event bhejta hai.
  3. Frontend `socket.js` listener message capture karke Redux `addMessage` action trigger karta hai, jisse UI instantly bina reload update ho jaata hai.

---

### 8. 🔔 Real-Time Notifications Center
* **Functionality:** Likes, comments, follows real-time alerts, unread badge counter, mark as read, delete notification.
* **Files & Components Used:**
  - `src/components/NotificationsModal.jsx`: Dropdown notification drawer with tabs (All / Unread).
  - `src/components/Sidebar.jsx`: Displays real-time pulse badge when `unreadCount > 0`.
  - `src/redux/slices/notificationSlice.js`: `fetchNotifications`, `markAsRead`, `markAllAsRead`, `deleteNotificationThunk`.
* **Kaise kaam karta hai:**
  - User login hote hi `socket.on('newNotification')` initialize hota hai.
  - Koi bhi user like/comment/follow karta hai toh instant toast pop-up aur badge update hota hai.

---

### 9. ⭕ Custom Circles & Privacy Management
* **Functionality:** Create targeted audience groups (e.g., Close Friends, Family, Tech Buddies), add/remove members, share posts visible only to circle members.
* **Files & Components Used:**
  - `src/components/CirclesManagerModal.jsx`: Modal to create circles, pick custom icons & colors, search and add connections to circle.
  - `src/pages/Connections.jsx`: Tabbed view for Followers, Following, Connections, and My Circles.
  - `src/redux/slices/circleSlice.js`: `fetchUserCircles`, `createNewCircle`, `updateCircleThunk`, `deleteCircleThunk`, `toggleCircleMemberThunk`.
* **Kaise kaam karta hai:**
  - Circles user ko control dete hain ki specific post sirf chosen circle members hi dekh saken.

---

### 10. 🎬 Reels / Short Video Stream
* **Functionality:** Vertical full-screen video scroll feed with auto-play, like, comment, sound toggle.
* **Files & Components Used:**
  - `src/pages/Reels.jsx`: Scroll-snap vertical reels player.
  - `src/pages/SinglePost.jsx`: Standalone deep-link viewer for specific reel or post.
  - `src/redux/slices/postSlice.js`: `fetchReels`.

---

### 11. 👤 User Profile & Settings
* **Functionality:** Profile header (Avatar, Cover, Bio, Followers/Following counters), Tabs (Posts, Reels, Saved Posts), Edit Profile modal, Account Settings modal.
* **Files & Components Used:**
  - `src/pages/Profile.jsx`: Profile page for current user or other users (`/profile/:profileId`).
  - `src/components/EditProfileModal.jsx`: ImageKit avatar/cover upload and text update form.
  - `src/components/AccountSettingsModal.jsx`: Change password and delete account modal.
  - `src/redux/slices/userSlice.js`: `fetchUserData`, `updateUserProfile`, `toggleFollowUser`.

---

### 12. 🎨 Theme & Layout System
* **Functionality:** Dark / Light theme toggle, responsive sidebar on desktop, floating glass dock on mobile.
* **Files & Components Used:**
  - `src/pages/Layout.jsx`: Main layout wrapper with ambient GPU background blur orbs and mobile dock.
  - `src/components/Sidebar.jsx`: Full desktop sidebar with navigation items.
  - `src/context/ThemeContext.jsx`: Theme state manager synced with `localStorage` and `<html>` dark class.
  - `src/components/ThemeToggle.jsx`: Switch button.

---

## 📊 Redux Store Architecture Summary

| Redux Slice | File Location | Purpose & Managed State |
| :--- | :--- | :--- |
| **`auth`** | `src/redux/slices/authSlice.js` | User authentication, token, login/register status |
| **`post`** | `src/redux/slices/postSlice.js` | Feed posts, reels, bookmarks, active comments |
| **`story`** | `src/redux/slices/storySlice.js` | Active 24h stories, viewers, story interactions |
| **`message`** | `src/redux/slices/messageSlice.js` | Direct messages, active conversation, online users, typing state |
| **`notification`**| `src/redux/slices/notificationSlice.js`| Notification list, unread count |
| **`circle`** | `src/redux/slices/circleSlice.js` | Custom user circles, members list |
| **`user`** | `src/redux/slices/userSlice.js` | Other users' profile data, discover suggestions, follow status |

---

## 🔄 Request Lifecycle Flow (Frontend Perspective)
1. **User Action:** User clicks "Like" on a post in `PostCard.jsx`.
2. **Dispatch Action:** `dispatch(toggleLikePost(post._id))` triggers `postSlice.js`.
3. **Optimistic State Update:** Redux immediately updates like count and red heart icon in local state.
4. **API Request:** `axios.post('/api/post/like/:id')` sends request to backend with credentials.
5. **Real-time Sync:** Backend processes like -> emits notification via Socket.io to post owner -> Owner's `notificationSlice.js` receives notification without page refresh.

