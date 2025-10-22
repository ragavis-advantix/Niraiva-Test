# Niraiva Health App

## Project Overview

This project consists of a **frontend** web application and a **backend workflow** powered by **n8n** for processing uploaded health files (PDF, image, JSON) into structured health reports.

- **Frontend URL (local dev)**: [http://localhost:5173](http://localhost:5173)  
- **Backend Workflow**: n8n

---

## Frontend: Local Setup

The frontend is built with **Vite + React + TypeScript + Tailwind CSS + shadcn-ui**.

### Running locally

1. Clone the repository:
```sh
git clone https://github.com/ragavis-advantix/Niraiva-Test.git
cd Niraiva-Test
```

2. Install dependencies:
```sh
npm install
```

3. Start the development server:
```sh
npm run dev
```

This will open the app in your default browser with live reload.

### Local Proxy for File Uploads

A tiny Express server is provided to forward files to the n8n workflow.

1. Install server dependencies:
```sh
cd server
npm install express node-fetch@2 multer form-data cors
```

2. Start the proxy:
```sh
node server/index.js
```

- Default listens on port 4000
- Forwards files to http://localhost:5678/webhook/test
- Override with N8N_WEBHOOK environment variable if needed

### Example frontend upload call
```javascript
const input = document.querySelector('#file');
const form = new FormData();
form.append('file', input.files[0]);

const res = await fetch('http://localhost:4000/api/upload', {
    method: 'POST',
    body: form,
});

const json = await res.json();
console.log('n8n returned:', json);
```

---

## Backend: n8n Workflow

The backend workflow handles uploaded files and converts them into a structured health report schema.

### Quick Setup

**The complete n8n workflow is included in this repository as `Niraiva.json`.**

To use it:

1. Open your n8n instance (local or cloud)
2. Click on **Workflows** → **Import from File**
3. Select the `Niraiva.json` file from this repository
4. Configure your credentials (Google Gemini API, OCR.Space API if needed)
5. Activate the workflow

The workflow will be ready to accept file uploads at the webhook endpoint `/test`.

### Workflow Overview
```
Frontend Upload
      │
      ▼
Local Express Proxy
      │
      ▼
  Incoming Webhook (/test)
      │
      ▼
Detect File Type
      │
  ┌───┴────┬────┴─────┐
 PDF       JSON      Image
  │         │         │
Extract    Parse     Convert to Base64
Text       & Clean   → OCR
  │         │         │
  └─────────┴─────────┘
          │
          ▼
  AI Schema Structurer (Google Gemini / PaLM)
          │
          ▼
 Normalize AI Output
          │
          ▼
Send Final JSON Response
          │
          ▼
       Frontend
```

### Detailed Workflow Documentation

For a comprehensive understanding of how the workflow processes files and structures health data, refer to the workflow documentation sections below.

### 1️⃣ Entry Point: Receiving Files

**Node:** Incoming File Webhook

- **Type:** Webhook
- **Endpoint:** /test
- **Accepts:** PDF, image, or JSON
- **Purpose:** Entry point for uploaded files

### 2️⃣ Detect File Type

**Node:** Detect Uploaded File Type

**Function:**
- Reads the incoming file
- Dynamically identifies binary key
- Checks MIME type or file extension (pdf, image, json, text)
- Returns a structured JSON object with fileType and binaryKey

**Routing:**
- PDF → PDF Processing
- JSON → JSON Processing
- Image → Image Processing

### 3️⃣ File Processing Branch

#### PDF Processing

**Node:** Extract Text from PDF

- **Function:** Extract textual content from PDF
- **Next Step:** Send text to AI for structured analysis

#### JSON Processing

**Node:** Format Raw JSON Input

- **Function:** Parse and clean JSON for AI analysis
- **Next Step:** Send structured JSON to AI

#### Image Processing

**Node:** Convert Image to Base64 → OCR

**Function:**
- Convert image binary to Base64
- Send to OCR.Space for text extraction
- Send extracted text to AI for structured analysis

### 4️⃣ AI Structuring

**Node:** AI Schema Structurer (Google Gemini / PaLM via LangChain)

**Function:**
- Converts raw text or JSON into standardized health report schema
- Captures:
  - Patient profile: name, age, gender, blood type, allergies, etc.
  - Clinical info: parameters, medications, appointments, conditions, immunizations, lifestyle
- Adds deterministic notes for inferred data

### 5️⃣ Normalize AI Output

**Node:** Normalize AI Output

**Function:**
- Ensures JSON conforms to workflow schema
- Missing values set to null
- Adds extractedAt timestamp and status (success/failure)

### 6️⃣ Respond to Webhook

**Node:** Send Final Health Report Response

- **Function:** Sends fully structured health report JSON back to the frontend

---

## Technologies Used

- **Frontend:** Vite, React, TypeScript, Tailwind CSS, shadcn-ui
- **Backend Proxy:** Node.js, Express
- **Workflow:** n8n, Google Gemini (PaLM via LangChain), OCR.Space

---

## How to Edit the Project

### 1. Using your IDE

1. Clone repo
2. Install dependencies (`npm install`)
3. Run locally (`npm run dev`)
4. Push changes to GitHub → automatically reflected in the frontend

### 2. Editing on GitHub

1. Navigate to the file
2. Click the pencil icon to edit
3. Commit changes

### 3. Using GitHub Codespaces

1. Click Code → Codespaces → New codespace
2. Edit files and commit changes

---

## Deployment

Currently deployable via local host for testing

---

## Notes

- The frontend handles file uploads and displays structured health reports
- The Express proxy hides the n8n URL and allows server-side preprocessing
- The n8n workflow ensures every uploaded file is processed into a consistent health report JSON
- **The `Niraiva.json` file contains the complete n8n workflow configuration** for easy import and setup
- Comprehensive workflow documentation is provided in this README for better understanding of the data processing pipeline
