# 3D Avatar Fitting App

A web application that allows users to upload 3D avatar models and fit clothing onto them using Three.js and React.

## Features

- **3D Model Upload**: Support for GLB/GLTF avatar and clothing models
- **Interactive 3D Scene**: Zoom, rotate, and pan controls
- **Auto-fitting**: Basic automatic clothing fitting to avatar proportions
- **Clothing Controls**: Toggle visibility and change colors
- **Drag & Drop**: Easy file upload with drag and drop support
- **Scene Persistence**: Backend storage of scene state
- **Material UI**: Clean, modern interface

## 🛠 Tech Stack

- **Frontend**: Next.js, React, Three.js, React Three Fiber
- **UI Framework**: Material-UI (MUI)
- **3D Graphics**: Three.js with React Three Fiber and Drei
- **Backend**: Next.js API routes, Node.js
- **File Handling**: Formidable, React Dropzone

## 📦 Installation

1. **Clone the repository**

   ```bash
   git clone <your-repo-url>
   cd 3d-avatar-fitting-app
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Create required directories**

   ```bash
   mkdir -p public/uploads data
   ```

4. **Run the development server**

   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎮 Usage

### Basic Workflow

1. **Upload Avatar**: Click or drag a GLB/GLTF avatar model into the avatar upload area
2. **Upload Clothing**: Once an avatar is loaded, upload a clothing model
3. **Interact**: Use mouse controls to navigate the 3D scene:
   - **Left click + drag**: Rotate camera
   - **Right click + drag**: Pan camera
   - **Scroll wheel**: Zoom in/out
4. **Customize**: Toggle clothing visibility and change colors using the control panel
5. **Reset**: Clear the scene to start over

### File Requirements

- **Supported Formats**: GLB, GLTF
- **File Size Limit**: 100MB per file
- **Model Requirements**:
  - Avatar models should be centered and properly scaled
  - Clothing models should be designed to fit humanoid avatars
