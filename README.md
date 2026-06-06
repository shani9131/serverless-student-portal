# 🎓 Serverless Student Information System (SIS)

![AWS Architecture](https://img.shields.io/badge/AWS-Serverless-FF9900?style=for-the-badge&logo=amazon-aws&logoColor=white)
![Python Backend](https://img.shields.io/badge/Python-3.x-3776AB?style=for-the-badge&logo=python&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-HTML%20%7C%20CSS%20%7C%20JS-E34F26?style=for-the-badge)

A fully cloud-native, serverless web application designed to manage student data, attendance, and financial ledgers. Built entirely on AWS infrastructure, this project features Role-Based Access Control (RBAC) and real-time database mutations.

🔗 **[View Live Project Here](http://shani-eduportal-project-2026.s3-website.ap-south-1.amazonaws.com)**

---

## 🏗️ Cloud Architecture

This application operates on a 100% decoupled, serverless architecture:

1. **Frontend Hosting:** AWS S3 (Static Website Hosting)
2. **API Routing & Security:** Amazon API Gateway (Handling CORS & Preflight)
3. **Compute Layer:** AWS Lambda (Python 3.x with Boto3)
4. **Database:** Amazon DynamoDB (NoSQL)

---

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Secure gateway routing separating `Admin` and `Student` sessions using JWT-style token validation.
* **Serverless Backend APIs:** Dedicated Lambda functions handling specific modular tasks (`login`, `addStudent`, `manageStudent`, `changePassword`).
* **Dynamic Student Dashboard:** Real-time data fetching rendering specific student courses, attendance percentages, and pending fee invoices.
* **Admin Management Gateway:** A secure portal allowing administrators to execute CRUD operations on the live DynamoDB database directly from the UI.
* **Reserved Keyword Bypass:** Implemented `ExpressionAttributeNames` aliases in Boto3 to safely mutate system-reserved keywords in NoSQL.

---

## 💻 Technology Stack

**Frontend:**
* HTML5, CSS3, JavaScript (ES6+)
* Bootstrap 5 (Responsive Grid & Modals)
* Chart.js (Data Visualization)

**Backend (AWS Cloud):**
* **Amazon S3:** Frontend asset delivery.
* **Amazon API Gateway:** RESTful API endpoints.
* **AWS Lambda:** Serverless Python scripts executing business logic.
* **Amazon DynamoDB:** `Users`, `Students`, `Subjects`, `Attendance`, and `Fees` tables.

---

## 🚀 Local Setup & Installation

If you wish to run the frontend locally while connecting to the live AWS database:

1. Clone the repository:
   ```bash
   git clone [https://github.com/your-username/serverless-student-portal.git](https://github.com/your-username/serverless-student-portal.git)
