# 🧠 CogniCare-AI

**CogniCare-AI** is an AI-powered cognitive assistance and memory support platform designed to help elderly people experiencing memory decline and cognitive difficulties.

The platform combines **cognitive games, adaptive difficulty, reminders, progress tracking, and caregiver support** in a simple and accessible interface.

---

## 📌 Problem Statement

Elderly people experiencing cognitive decline may face difficulties with memory, attention, daily activities, and remembering important tasks such as medicines and appointments.

Existing digital applications can often be complicated for elderly users and may not provide personalized cognitive activities or caregiver-oriented progress monitoring.

**CogniCare-AI** aims to address these challenges by providing an easy-to-use platform that combines cognitive exercises with personalized assistance and progress monitoring.

---

## 💡 Proposed Solution

CogniCare-AI provides a centralized platform where elderly users can:

* Play cognitive games designed around memory, attention, sequence, and pattern recognition.
* Receive personalized difficulty levels based on their performance.
* Track their cognitive game performance and progress.
* Receive reminders for medicines, hydration, appointments, and daily activities.
* Get assistance through a simple elderly-friendly interface.

Caregivers can also monitor relevant user progress and assistance-related information.

---

## ✨ Key Features

### 🧠 Cognitive Games

Interactive games designed to engage different cognitive abilities, including:

* Memory
* Attention
* Sequence recognition
* Pattern recognition

### 🤖 Adaptive Difficulty

The system uses user performance information to determine and update the difficulty level of cognitive activities.

This allows games to become more personalized according to the user's performance.

### 📊 Progress Tracking

The backend records game-related performance and provides progress information such as:

* Games played
* Average score
* Best score
* Average accuracy
* Total time
* Performance history

### 🔔 Reminders

Users can manage reminders for important daily activities such as:

* Medicines
* Hydration
* Medical appointments
* Other daily activities

### 👨‍⚕️ Caregiver Support

Caregiver-related APIs allow relevant user information and assistance data to be managed through the backend.

### 🔐 User Authentication

The platform provides:

* User registration
* User login
* Role-based user information

### 🌐 API-Based Architecture

The frontend communicates with the Flask backend through REST APIs, allowing the application modules to work together in a structured way.

---

## 🏗️ System Architecture

```text
                    ┌──────────────────────┐
                    │      User /          │
                    │      Caregiver       │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │   Next.js Frontend   │
                    │      Web Interface   │
                    └──────────┬───────────┘
                               │
                         REST API Calls
                               │
                               ▼
                    ┌──────────────────────┐
                    │    Flask Backend     │
                    │      REST APIs       │
                    └──────────┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌──────────┐     ┌───────────┐    ┌────────────┐
        │  SQLite  │     │ Game &    │    │ Adaptive   │
        │ Database │     │ Progress  │    │ Difficulty │
        └──────────┘     └───────────┘    └────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* Lucide Icons

### Backend

* Python
* Flask
* REST APIs
* SQLite

### AI / ML

* Python
* NumPy
* Pandas
* Scikit-learn
* Adaptive difficulty logic

### Development & Version Control

* Git
* GitHub
* Visual Studio Code

### Deployment

* **Frontend:** Vercel
* **Backend:** Render

---

## 📂 Project Structure

```text
CogniCare-AI/
│
├── backend/
│   ├── app.py
│   ├── auth.py
│   ├── database.py
│   ├── games.py
│   ├── reminders.py
│   ├── caregiver.py
│   ├── difficulty.py
│   ├── progress.py
│   ├── test_api.py
│   └── test_login.py
│
├── frontend/
│   ├── app/
│   ├── components/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## 🔧 Backend Modules

| File            | Purpose                                             |
| --------------- | --------------------------------------------------- |
| `app.py`        | Main Flask application and API registration         |
| `auth.py`       | User registration and login functionality           |
| `database.py`   | Database connection and database-related operations |
| `games.py`      | Game and score-related APIs                         |
| `progress.py`   | User progress and performance information           |
| `difficulty.py` | Adaptive difficulty and performance-related APIs    |
| `reminders.py`  | Reminder creation and management APIs               |
| `caregiver.py`  | Caregiver-related APIs                              |
| `test_api.py`   | API testing                                         |
| `test_login.py` | Login-related testing                               |

---

## 🔗 Main API Functionalities

The backend currently provides APIs for:

### Authentication

```text
POST /api/register
POST /api/login
```

### Games & Scores

```text
POST /api/games/submit
```

### Progress

```text
GET /api/progress/<user_id>
```

### Adaptive Difficulty

```text
GET  /api/difficulty/performance/<user_id>
GET  /api/difficulty/<user_id>/<game_name>
POST /api/difficulty/set
```

### Reminders

```text
POST   /api/reminders
GET    /api/reminders
PUT    /api/reminders/<id>
DELETE /api/reminders/<id>
```

Additional caregiver and game-related endpoints are implemented within the backend modules.

---

## 🚀 Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/pragyapriya-18/CogniCare-AI.git
cd CogniCare-AI
```

---

### 2. Backend Setup

Move into the backend directory:

```bash
cd backend
```

Create and activate a virtual environment:

### Windows

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

Start the backend:

```bash
python app.py
```

The backend will run locally at:

```text
http://127.0.0.1:5000
```

---

### 3. Frontend Setup

Open another terminal and move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=https://cognicare-ai.onrender.com
```

For local backend development, this can instead be:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

The frontend will run locally at:

```text
http://localhost:3000
```

---

## 🌐 Live Deployment

### Frontend

The deployed frontend is available at:

**https://cogni-flax.vercel.app/**

### Backend

The deployed Flask backend is available at:

**https://cognicare-ai.onrender.com**

The frontend is configured to communicate with the deployed backend through the `NEXT_PUBLIC_API_BASE_URL` environment variable.

---

## 🔄 Development Workflow

The project is maintained using Git and GitHub.

```text
Feature Development
        ↓
   Local Testing
        ↓
      Git Commit
        ↓
     Git Push
        ↓
  Integration / Deployment
```

Team members work on their assigned modules and changes are integrated into the main project.

The backend development work is handled by **Pragya and Priyanshi**.

---

## 👥 Team

| Member           | Responsibility                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------- |
| **Sameed Patil** | Architecture, Coordination, Integration, Presentation, Research, Documentation & Testing |
| **Aayushman**    | Frontend / UI                                                                            |
| **Pragya**       | Backend + Git/GitHub Management                                                          |
| **Priyanshi**    | Backend                                                                                  |
| **Rajshree**     | AI / ML                                                                                  |
| **Ritu**         | Cognitive Game Development                                                               |

---

## 🎯 Project Goal

The goal of CogniCare-AI is to provide an **accessible and engaging cognitive assistance platform** that supports elderly users through cognitive activities, personalized difficulty, reminders, and progress tracking while providing useful support for caregivers.

---

## 🔮 Future Scope

Future improvements can include:

* 🌐 Expansion to more regional languages
* 🧠 Advanced cognitive assessment
* 🤖 More personalized AI-based recommendations
* 📡 Improved offline functionality and synchronization
* 🏥 Integration with healthcare professionals and healthcare systems
* 🗣️ Advanced voice-based interaction
* 📱 Improved mobile and tablet support
* 📈 More detailed caregiver analytics
* 🔐 Further improvements to privacy and data security

---

## 📌 Project Status

**CogniCare-AI is currently under active development and has a deployed frontend and backend.**

The frontend is deployed using **Vercel**, while the backend is deployed using **Render**.

---

## 📜 License

This project is developed as part of a student project / hackathon initiative.
