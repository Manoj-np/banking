# ☁️ Paperless Bank Cloud Deployment Guide

This guide will help you take your **Paperless Bank** live on the internet!

## 🚀 Recommended Platform: Render.com
Render is the easiest way to deploy this specific project because it supports Docker out of the box.

### Step-by-Step Deployment:
1.  **Push to GitHub:** Upload your `banking` folder to a new private repository on GitHub.
2.  **Create Render Account:** Sign up at [Render.com](https://render.com).
3.  **New Web Service:**
    *   Click **New +** and select **Web Service**.
    *   Connect your GitHub repository.
4.  **Configuration:**
    *   **Name:** `paperless-bank`
    *   **Region:** Select the one closest to you.
    *   **Runtime:** Select **Docker**.
    *   **Plan:** Free or Starter.
5.  **Click Deploy!** Render will use the `Dockerfile` I created to build both the React frontend and Spring Boot backend together.

---

## 🗄️ Moving to a Real Database
Currently, the app uses **H2 (File-based)**. In the cloud, files are deleted when the app restarts. To keep your data forever:

1.  **Create a Database:** On Render, click **New +** and select **PostgreSQL**.
2.  **Get Connection String:** Copy the "External Database URL".
3.  **Update Config:** Add these Environment Variables to your Web Service in Render:
    *   `SPRING_DATASOURCE_URL`: (Your Postgres URL)
    *   `SPRING_JPA_HIBERNATE_DDL_AUTO`: `update`

---

## 🛠️ Local Testing with Docker
Before you deploy, you can test the cloud build on your own machine:

```bash
# Build the image
docker build -t paperless-bank .

# Run the container
docker run -p 8080:8080 paperless-bank
```

Your app will then be available at `http://localhost:8080` exactly as it will appear in the cloud.
