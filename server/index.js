import express from 'express';
import fetch from 'node-fetch';

import multer from 'multer';
import FormData from 'form-data';
import cors from 'cors';
import path from 'path';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
app.use(cors());
app.use(express.json());

// Default n8n webhook (can be overridden with N8N_WEBHOOK env var)
const N8N_WEBHOOK = process.env.N8N_WEBHOOK || 'http://localhost:5678/webhook/test';
console.log(`Starting server with N8N_WEBHOOK: ${N8N_WEBHOOK}`);

// Test endpoint that returns a sample medical report JSON
app.get('/api/test-report', (req, res) => {
    res.json({
        type: "health_report",
        metadata: {
            documentDate: new Date().toISOString().split('T')[0],
            documentType: "Health Report",
            provider: "Test Hospital"
        },
        data: {
            profile: {
                name: "Test Patient",
                age: 45,
                gender: "F",
                height: { value: 165, unit: "cm" },
                weight: { value: 70, unit: "kg" },
                bmi: 25.7
            },
            parameters: [
                {
                    name: "Blood Pressure",
                    value: "120/80",
                    unit: "mmHg",
                    status: "normal",
                    timestamp: new Date().toISOString()
                }
            ]
        },
        extractedAt: new Date().toISOString(),
        processingStatus: "success"
    });
});

// POST /api/upload - accepts a single file field named 'file' and proxies it to the n8n webhook
app.post('/api/upload', upload.single('file'), async (req, res) => {
    console.log('Received upload request');
    try {
        if (!req.file) {
            console.log('No file in request');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('Processing file:', req.file.originalname, 'type:', req.file.mimetype);
        const form = new FormData();
        // append the file buffer with originalname and mimetype
        form.append('file', req.file.buffer, {
            filename: req.file.originalname,
            contentType: req.file.mimetype,
        });

        // forward any other fields
        if (req.body) {
            for (const key of Object.keys(req.body)) {
                form.append(key, req.body[key]);
            }
        }

        console.log('Forwarding request to n8n webhook:', N8N_WEBHOOK);
        let forwardRes;
        try {
            forwardRes = await fetch(N8N_WEBHOOK, {
                method: 'POST',
                body: form,
                headers: form.getHeaders(),
                timeout: 30000, // 30 second timeout
            });
            console.log('Received response from n8n webhook with status:', forwardRes.status);
            console.log('Response headers:', forwardRes.headers);
        } catch (error) {
            console.error('Failed to connect to n8n webhook:', error.message);
            throw error;
        }

        const contentType = forwardRes.headers.get('content-type') || '';

        // Read response body (try json, fallback to text)
        let respBodyRaw;
        if (contentType.includes('application/json')) {
            try {
                respBodyRaw = await forwardRes.json();
            } catch (e) {
                // sometimes content-type is json but parsing fails; fallback to text
                const txt = await forwardRes.text();
                try { respBodyRaw = JSON.parse(txt); } catch { respBodyRaw = txt; }
            }
        } else {
            respBodyRaw = await forwardRes.text();
        }

        // Normalize common n8n response wrappers (items arrays or objects with `json` field)
        let normalizedBody = respBodyRaw;
        let normalizationNote = null;
        try {
            if (Array.isArray(respBodyRaw) && respBodyRaw.length > 0) {
                // prefer first item's .json if present
                const first = respBodyRaw[0];
                if (first && typeof first === 'object') {
                    if (first.json && typeof first.json === 'object') {
                        normalizedBody = first.json;
                        normalizationNote = 'selected_first_array_item.json';
                    } else {
                        normalizedBody = first;
                        normalizationNote = 'selected_first_array_item';
                    }
                }
            } else if (normalizedBody && typeof normalizedBody === 'object' && 'json' in normalizedBody && typeof normalizedBody.json === 'object') {
                normalizedBody = normalizedBody.json;
                normalizationNote = 'unwrapped_json_field';
            }
        } catch (e) {
            // ignore normalization errors and send raw body
        }

        // Send normalized response: JSON objects as application/json, otherwise as text
        if (normalizedBody && typeof normalizedBody === 'object') {
            if (normalizationNote) res.set('x-n8n-normalization', normalizationNote);
            res.status(forwardRes.status).json(normalizedBody);
        } else {
            const ct = contentType || 'text/plain';
            if (normalizationNote) res.set('x-n8n-normalization', normalizationNote);
            res.status(forwardRes.status).set({ 'content-type': ct }).send(normalizedBody);
        }
    } catch (err) {
        console.error('Error forwarding file to n8n:', err);
        res.status(500).json({ error: 'Failed to forward file', details: String(err) });
    }
});

// health
app.get('/api/health', (req, res) => res.json({ ok: true }));

// Simple webhook test endpoints so this server can respond at:
//   http://localhost:5678/webhook/test
// GET returns a basic JSON for quick checks. POST echoes the received JSON/body.
app.get('/webhook/test', (req, res) => {
    res.json({ ok: true, endpoint: '/webhook/test', method: 'GET' });
});

app.post('/webhook/test', (req, res) => {
    console.log('Received POST to /webhook/test');
    // If body is empty, try to collect raw text
    const payload = req.body && Object.keys(req.body).length ? req.body : { note: 'no json body received' };
    res.json({ ok: true, received: payload });
});

// Start the server
// Default port changed to 5678 to match the webhook URL the frontend/tests may call.
// You can still override with the PORT env var.
const PORT = process.env.PORT || 5678;
app.listen(PORT, () => {
    console.log(`Proxy server listening on http://localhost:${PORT}`);
    console.log(`Forwarding uploads to: ${N8N_WEBHOOK}`);
});
