# 3D Avatar Fitting App

A production-ready web application that allows users to upload 3D avatar models and fit clothing onto them using Three.js and React. Features automatic scene state persistence, mobile-responsive design, and Vercel Blob storage.

![App Screenshot](./public/screenshot.png)

📹 **Demo Video**: [Watch on Loom](https://www.loom.com/share/15e15cd4f6fb467592477eb4ce8a2f4c?sid=c08272ff-b0fd-4715-9128-5deb9e8118e2)

## ✨ Features

### Core Functionality

- **3D Model Upload**: Support for GLB/GLTF avatar and clothing models with drag & drop
- **Interactive 3D Scene**: Smooth zoom, rotate, and pan controls with OrbitControls
- **Auto-fitting**: Basic automatic clothing fitting to avatar proportions
- **Clothing Controls**: Toggle visibility and change colors with real-time updates
- **Scene Persistence**: Automatic local file storage and restoration of scene state
- **Cloud Storage**: Vercel Blob integration for reliable file uploads

### User Experience

- **Mobile Responsive**: Optimized interface for desktop, tablet, and mobile devices
- **Real-time Notifications**: Success/error feedback for all operations
- **Loading States**: Visual feedback during uploads and processing
- **Error Recovery**: Graceful handling of network failures and file errors

### Production Features

- **Vercel Blob Storage**: Scalable cloud storage for 3D models
- **Serverless Compatible**: Works seamlessly in serverless environments
- **Security**: File validation, type checking, and size limits

## 🛠 Tech Stack

### Frontend

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **3D Graphics**: Three.js with React Three Fiber and Drei
- **UI Components**: Material-UI (MUI) v5
- **Styling**: Material-UI theming system

### Backend

- **Runtime**: Next.js API Routes with Node.js
- **File Storage**: Vercel Blob for 3D models, local files for scene state
- **File Processing**: Native FormData handling with Vercel Blob SDK

### Development

- **Language**: TypeScript for type safety
- **Package Manager**: npm
- **Development Server**: Next.js dev server with hot reload

## 📦 Installation

### Prerequisites

- Node.js 18+
- npm or yarn package manager
- Vercel account (for Blob storage)

### Local Development Setup

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd 3d-avatar-fitting-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```
3. **Set up Vercel Blob storage**
   ```bash
   # Install Vercel Blob package
   npm install @vercel/blob
   
   # Set up Blob storage through Vercel Dashboard
   # Go to your Vercel project → Storage tab → Create Blob store
   # This will automatically add BLOB_READ_WRITE_TOKEN to your project
   
   # Pull environment variables to local
   vercel env pull .env.local
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Production Deployment

#### Vercel (Recommended)

1. **Deploy to Vercel**

   ```bash
   npm install -g vercel
   vercel --prod
   ```

2. **Environment Configuration**
   - Add Vercel Blob integration through the dashboard
   - `BLOB_READ_WRITE_TOKEN` will be automatically configured
   - Scene state stored in local file system

## 🎮 Usage

### Basic Workflow

1. **Upload Avatar Model**

   - Click the "Upload Avatar" button or drag a GLB/GLTF file
   - File uploads to Vercel Blob storage
   - Avatar will appear centered in the 3D scene

2. **Upload Clothing Model**

   - Once avatar is loaded, upload a clothing model
   - Clothing will automatically position relative to the avatar
   - Use controls to adjust visibility and appearance

3. **Navigate the 3D Scene**

   - **Left click + drag**: Rotate camera around the model
   - **Right click + drag**: Pan camera position
   - **Scroll wheel**: Zoom in/out
   - **Double click**: Reset camera position

4. **Customize Appearance**
   - **Toggle Clothing**: Show/hide clothing with the visibility button
   - **Change Colors**: Use the color picker to modify clothing colors
   - **Real-time Updates**: Changes apply immediately to the 3D scene

## 📋 File Requirements

### Supported Formats

- **3D Models**: GLB (recommended), GLTF
- **File Size**: Maximum 50MB per file
- **Upload Method**: Direct upload or drag & drop

## 🔧 API Endpoints

### File Upload

- **POST** `/api/upload` - Upload GLB/GLTF models to Vercel Blob

### Scene State Management

- **GET** `/api/scene-state` - Retrieve current scene state
- **POST** `/api/scene-state` - Save scene state
- **DELETE** `/api/scene-state` - Clear scene state

## 🏗 Architecture

### File Storage Strategy

- **3D Models**: Vercel Blob storage with public URLs
- **Scene State**: Local JSON file storage (`./data/scene-state.json`)
- **Development**: All files work seamlessly in local environment

### State Management

- **Frontend**: React state with automatic persistence
- **Backend**: JSON file storage for scene state only
- **Synchronization**: Real-time sync between UI and backend

## 🚀 Performance Optimizations

- **Cloud Storage**: Fast, reliable Vercel Blob storage
- **Lazy Loading**: 3D models load on demand
- **Responsive Images**: Optimized loading states and placeholders
- **Memory Management**: Proper disposal of 3D resources
- **Direct URLs**: Models served directly from Blob storage

### Common Issues

**Models not loading**

- Check file format (GLB/GLTF only)
- Verify file size is under 50MB
- Ensure Vercel Blob integration is properly configured
- Check `BLOB_READ_WRITE_TOKEN` environment variable

**Upload failures**

- Verify Vercel Blob storage is set up
- Check network connection
- Ensure file meets size and format requirements
