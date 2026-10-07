<!-- markdownlint-disable MD033 MD036 MD041 MD045 MD059 -->
<div align="center">
  <br />
  <a href="#" target="_blank">
    <img src="https://images.unsplash.com/photo-1593784991095-205097043f95?w=1200&h=400&fit=crop" alt="Xamehitv Banner">
  </a>
  <br />

  <div>
    <img src="https://img.shields.io/badge/-React-black?style=for-the-badge&logoColor=white&logo=react&color=61DAFB" alt="react" />
    <img src="https://img.shields.io/badge/-Node.js-black?style=for-the-badge&logoColor=white&logo=nodedotjs&color=339933" alt="nodejs" />
    <img src="https://img.shields.io/badge/-Express-black?style=for-the-badge&logoColor=white&logo=express&color=000000" alt="express" />
    <img src="https://img.shields.io/badge/-MongoDB-black?style=for-the-badge&logoColor=white&logo=mongodb&color=47A248" alt="mongodb" />
    <img src="https://img.shields.io/badge/-TypeScript-black?style=for-the-badge&logoColor=white&logo=typescript&color=3178C6" alt="typescript" />
  </div>

  <h3 align="center">Xamehitv - TV Streaming Platform</h3>

  <div align="center">
    A full-stack TV streaming application that delivers content to users via a modern, responsive web interface. Stream your favorite shows and movies with ease.
  </div>
</div>

## 📋 Table of Contents

1. 🤖 [Introduction](#introduction)
2. ⚙️ [Tech Stack](#tech-stack)
3. 🔋 [Features](#features)
4. 🚀 [Live Demo](#live-demo)
5. 🤸 [Quick Start](#quick-start)
6. 📊 [Business Value](#business-value)
7. 🔧 [Technical Details](#technical-details)
8. 📡 [API Documentation](#api-documentation)
9. 🚨 [FAQ / Troubleshooting](#faq)
10. 🔗 [Links](#links)

## 🤖 Introduction

Xamehitv is a comprehensive TV streaming platform built with modern web technologies. It provides users with access to a library of TV content, featuring smooth streaming, user profiles, and an intuitive interface for discovering and watching content.

**Target Users**: Entertainment seekers who want convenient access to TV content online.

**Problem Solved**: Bridges the gap between traditional TV and streaming by providing a web-based platform for accessing diverse content.

## ⚙️ Tech Stack

### Frontend

| Technology      | Version | Purpose      |
| --------------- | ------- | ------------ |
| **React**       | 18+     | UI Framework |
| **TypeScript**  | 5.x     | Type safety  |
| **Vite**        | 5.x     | Build tool   |
| **CSS Modules** | -       | Styling      |

### Backend

| Technology   | Version | Purpose       |
| ------------ | ------- | ------------- |
| **Node.js**  | 20+     | Runtime       |
| **Express**  | 4.x     | Web framework |
| **MongoDB**  | 7.x     | Database      |
| **Mongoose** | 8.x     | ODM           |

### Streaming

| Technology | Purpose          |
| ---------- | ---------------- |
| **HLS.js** | Video streaming  |
| **FFmpeg** | Video processing |

## 🔋 Features

### For Viewers

- 🎬 **Video Streaming**: Smooth playback of TV content
- 🔍 **Content Discovery**: Search and browse shows/movies
- 👤 **User Profiles**: Personalized experience
- 📺 **Watchlist**: Save shows for later
- 📜 **Viewing History**: Track what you've watched

### For Administrators

- 📦 **Content Management**: Add and organize content
- 👥 **User Management**: Manage accounts
- 📊 **Analytics**: Viewership statistics
- ⚙️ **System Configuration**

### Core Features

- **Responsive Design**: Works on all screen sizes
- **Search**: Find content quickly
- **Categories**: Browse by genre
- **Recommendations**: Personalized suggestions
- **Quality Options**: Multiple quality settings

## 🚀 Live Demo

| Platform | URL | Status |
| --- | --- | --- |
| **Frontend** | [Coming Soon](#) | 🔄 Deploying |
| **Backend** | [Coming Soon](#) | 🔄 Deploying |
| **GitHub** | [github.com/rhixecompany/xamehitv](https://github.com/rhixecompany/xamehitv) | ✅ Active |

---

## 🤸 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation

```bash
# Clone the repository
git clone https://github.com/rhixecompany/xamehitv.git
cd xamehitv

# Install frontend dependencies
cd frontend
bun install

# Install backend dependencies
cd ../backend
bun install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB URI and other settings

# Start backend
cd backend
bun run dev

# Start frontend (in a new terminal)
cd frontend
bun run dev
```

Open [http://localhost:5173](http://localhost:5173) (Vite) for frontend.

---

## 📊 Business Value

### For Users

- **Convenience**: Access content from any device
- **Variety**: Diverse content library
- **Cost-Effective**: Free streaming platform
- **Accessibility**: No subscription required

### For Platform Owners

- **Scalability**: Microservices-ready architecture
- **Monetization**: Ad-supported or subscription models
- **Data Insights**: User behavior analytics
- **Content Control**: Full library management

### Key Outcomes

- ✅ Cross-platform reach (web, mobile, tablet)
- ✅ Fast content delivery
- ✅ User engagement through personalization
- ✅ Foundation for growth and features

---

## 🔧 Technical Details

### Architecture

```
xamehitv/
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── pages/        # Page components
│   │   ├── services/     # API calls
│   │   └── styles/       # CSS modules
│   └── public/           # Static assets
└── backend/               # Express backend
    ├── src/
    │   ├── controllers/  # Route handlers
    │   ├── models/       # Mongoose models
    │   ├── routes/       # API routes
    │   ├── middleware/   # Express middleware
    │   └── services/     # Business logic
    └── config/           # Configuration
```

### API Endpoints

- `GET /api/content` - List all content
- `GET /api/content/:id` - Get content details
- `GET /api/stream/:id` - Get streaming URL
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/watchlist` - User's watchlist

### Key Patterns

- **RESTful API**: Clean, consistent API design
- **JWT Auth**: Secure authentication
- **MongoDB**: Flexible data modeling
- **Component Architecture**: Reusable React components

---

## 📡 API Documentation

### Authentication

```bash
# Register
POST /api/users/register
Body: { "email": "user@example.com", "password": "password", "name": "John" }

# Login
POST /api/users/login
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "jwt_token" }
```

### Content

```bash
# Get all content
GET /api/content

# Get single content
GET /api/content/123

# Search content
GET /api/content?search=show
```

---

## 🚨 FAQ / Troubleshooting

### Common Issues

**MongoDB connection fails**

- Verify MONGO_URI in .env
- Ensure MongoDB is running
- Check network connectivity

**Frontend build issues**

- Clear node_modules: `rm -rf node_modules && bun install`
- Check Node.js version

**Streaming issues**

- Verify video files are properly encoded
- Check FFmpeg installation
- Ensure correct MIME types

---

## 🔗 Links

- **GitHub**: [github.com/rhixecompany/xamehitv](https://github.com/rhixecompany/xamehitv)
- **Related Projects**:
  - [Horizon Banking](https://github.com/rhixecompany/banking)
  - [Rhixe Scans](https://github.com/rhixecompany/rhixe_scans)

---

## 📈 Future Enhancements

- [ ] Live TV streaming
- [ ] User reviews and ratings
- [ ] Social features
- [ ] Multiple language support
- [ ] Offline viewing
- [ ] Advanced recommendations

---

## 🤝 Contributing

Contributions welcome! Please check CONTRIBUTING.md for details.

---

## 📄 License

MIT License - see LICENSE file.

---

_Built with ❤️ by Alexander Iseghohi_
_Part of the rhixecompany portfolio_
