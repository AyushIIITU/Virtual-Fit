# Virtual Fit 💪

**Virtual Fit** is a full-stack virtual fitness application that combines a feature-rich mobile app built with **React Native + Expo** and a robust backend powered by both **Go** and **Python**. It offers real-time fitness tracking, pose detection, nutrition recommendations, and an intelligent fitness chatbot.

## 🏗️ Project Structure

```
ayushiiitu-virtual-fit/
    ├── Client/
    │   └── fitapp/
    └── Server/
        ├── Go/
        │   └── fitv1/
        └── Python/
            ├── app/
            ├── Chatbot/
            ├── Model Training/
            ├── services/
````
---

## 📱 Client: React Native (Expo)

- Built with modern Expo SDK
- Tailwind & NativeWind styling
- Tab-based navigation (`(tabs)/`)
- Authentication & onboarding screens
- Chatbot, food album, workout viewer
- Components for questionnaires, lists, UI themes
- Android native support (`android/` folder)

### Run the App

```bash
cd Client/fitapp
npm install
npx expo start
````

---

## 🧠 Python Backend (AI Services)

Python powers advanced AI features like:

* 🤖 **Fitness Chatbot** using LangChain + LLMs
* 📸 **Pose Detection** (YOLO + OpenCV)
* 🍽️ **Food Image Classification** + Nutrient Info
* 🔍 Embedding-based search (ChromaDB)
* 📡 Real-time updates via WebSocket
* 🧪 Deployed and tested with `streamlit`, `notebooks`, and `FastAPI`

### Run Python Server

```bash
conda create --name fitenv python>=3.13
conda activate fitenv
cd Server/Python
pip install -r requirements.txt
python server.py
```

---

## 🚀 Go Backend (Core API)

Go handles:

* 🔐 User Authentication
* 🧾 Workout & Exercise APIs
* 🍔 Food Album Management
* 📬 MongoDB Integration (service-repo pattern)

### Run Go Server

```bash
cd Server/Go/fitv1
go run cmd/main.go
```

---

## 🔧 Technologies Used

* **Frontend**: React Native, Expo, Tailwind (NativeWind), TypeScript
* **Backend (API)**: Go, MongoDB
* **Backend (AI)**: Python, YOLO, ChromaDB, LangGraph, LLaMA
* **Real-time**: WebSocket, Streamlit, OpenCV
---

## 🧪 Features

* ✅ Authentication & onboarding
* ✅ Chatbot for health and fitness Q\&A
* ✅ Upload food images → get nutrition info
* ✅ Real-time workout pose tracking
* ✅ Explore workouts, food albums, and more

---

## 📂 Future Plans

* Add support for iOS builds
* Integrate workout recommendation engine
* Add camera-based rep counting
* Sync user progress to cloud DB

---
