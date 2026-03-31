# 🎓 NAAC Navigator

## 📌 Overview
NAAC Navigator is a smart digital platform designed to simplify and modernize the accreditation process for Higher Education Institutions (HEIs). It transforms a traditionally complex and paperwork-heavy system into a structured, efficient, and transparent digital experience.

The platform enables institutions to focus more on quality improvement rather than administrative challenges by digitizing every stage of the accreditation process.

---

## 🚀 Key Features

- 🖥️ **End-to-End Digital Process**
  - Manage the complete accreditation lifecycle from registration to final results.

- 📊 **User-Friendly Dashboards**
  - Step-by-step guidance to ensure accurate data submission.

- ⚙️ **Automated Workflows**
  - Reduces manual effort and minimizes errors through validation tools.

- 📁 **Centralized Data Management**
  - Upload documents, metrics, and reports in a standardized format.

- 🔍 **Real-Time Tracking**
  - Monitor progress, timelines, and updates instantly.

- 🔐 **Secure Peer Review Access**
  - Enables fair and informed evaluation by review teams.

- 📜 **Audit Trail & Transparency**
  - Every action is recorded digitally for accountability.

---

## 🎯 Objectives

- Simplify the NAAC accreditation process
- Improve data accuracy and consistency
- Enhance transparency and accountability
- Reduce administrative workload
- Promote continuous institutional improvement

---

## 💡 Benefits

- ✅ Saves time and effort through automation  
- ✅ Improves reliability of submitted data  
- ✅ Provides clear visibility into accreditation stages  
- ✅ Encourages quality enhancement in education  
- ✅ Ensures a transparent and fair evaluation process  

---

## 🔄 Workflow

1. Institution Registration  
2. Data Submission (Quantitative & Qualitative)  
3. Document Upload & Validation  
4. Peer Team Review  
5. Evaluation & Feedback  
6. Final Accreditation Results  

---

## 🏗️ System Architecture

Frontend (React / Vite)  
⬇  
Backend (Django REST API)  
⬇  
Database (PostgreSQL / SQLite)  
⬇  
AI Service (External API)

---

## ⚙️ Tech Stack

- Backend: Django + Django REST Framework
- Frontend: React (Vite)
- Auth: JWT Authentication
- Database: PostgreSQL
- File Storage: Local Media
- AI Integration: External API
- Report Generation: ReportLab + OpenPyXL

---


## 🛠️ Backend Setup Guide

### 1️⃣ Clone Repository
```bash
git clone <your-repo-url>
cd naac-navigator
````

---

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux / Mac
venv\Scripts\activate      # Windows
```

---

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

### 4️⃣ Setup Environment Variables

Create `.env` file:

```env
DB_URL=postgresql://user:password@localhost:5432/naac_db
AI_TIMEOUT=120
```

---

### 5️⃣ Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

---

### 6️⃣ Create Admin Account (Custom Command)

```bash
python manage.py create_admin
```

---

### 7️⃣ Run Backend Server

```bash
python manage.py runserver
```

---

## 💻 Frontend Setup Guide

```bash
cd aqar-web
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173/
```

---

## 🔐 Authentication APIs

| Endpoint             | Method | Description   |
| -------------------- | ------ | ------------- |
| `/api/auth/login/`   | POST   | Get JWT token |
| `/api/auth/refresh/` | POST   | Refresh token |
| `/api/auth/profile/` | GET    | User profile  |

---

## 👥 Roles & Access

### Admin

* Create Departments
* Create/Delete HOD
* View all data
* Unlock submissions

### HOD

* Fill metrics
* Upload documents
* Submit report

---

## 📊 Metrics API

```bash
GET    /form/<metric>/
POST   /form/<metric>/
PUT    /form/<metric>/<id>/
DELETE /form/<metric>/<id>/
```

Example:

```
/form/1-1/
/form/2-1/
/form/3-2/
```

---


## 📈 Impact

NAAC Navigator goes beyond compliance by acting as a continuous improvement tool. It highlights performance indicators and identifies growth areas in:

- Teaching & Learning  
- Research & Innovation  
- Governance  
- Student Support Systems  

---

## 🏁 Conclusion

NAAC Navigator transforms accreditation from a stressful administrative task into a structured, transparent, and growth-oriented journey. It empowers institutions to strive for excellence while maintaining clarity, efficiency, and integrity throughout the process.

---

## 🤝 Contributing
Contributions are welcome! Feel free to fork the repository and submit a pull request.

---

## 📄 License
This project is licensed under the MIT License.

---

## 📬 Contact
For queries or support, please reach out via the project repository.
