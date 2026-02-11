# 📂 Secure GitHub File Sync API

This is a secure serverless API endpoint designed to fetch files, images, and videos from a private GitHub repository. It uses **TOTP (Time-based One-Time Password)** for authentication, ensuring that only authorized users can access the content.

## 🚀 Features
* **Secure Authentication:** Uses `speakeasy` for TOTP verification.
* **Media Support:** Automatically detects and serves Images (`.jpg`, `.png`), Videos (`.mp4`), and Documents (`.pdf`).
* **File Listing:** Can list all files and folders in the repository root.
* **Raw Data Handling:** Handles binary data correctly for media files.

---

## 🛠️ Setup & Configuration

### 1. Environment Variables
You need to set up the following environment variables in your `.env` file or Vercel project settings:

```bash
GITHUB_TOKEN=your_github_personal_access_token
REPO_OWNER=your_github_username
REPO_NAME=your_repository_name
SHARED_SECRET=your_base32_totp_secret
```
2. Dependencies
Ensure you have the required package installed:

Bash
npm install speakeasy
🔌 API Usage
📂 1. List All Files
To get a list of files and folders in the repository:

HTTP
GET /api/handler?otp=123456
📥 2. Fetch a File
To retrieve a specific file (e.g., an image or video):

HTTP
GET /api/handler?otp=123456&file=images/my-photo.jpg
(Replace 123456 with your current OTP code)

🔒 Security Note
This API requires a valid OTP for every request.

Ensure your GITHUB_TOKEN has repo scope access.

Keep your SHARED_SECRET safe and never commit it to the repository.

<div align="center"> <sub>Built with ❤️ using Node.js & GitHub API</sub> </
