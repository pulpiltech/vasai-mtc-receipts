const express = require('express');
const cors = require('cors');
const multer = require('multer');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const app = express();
const port = 3001;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads in memory
const upload = multer({ storage: multer.memoryStorage() });

// WhatsApp Client Setup
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

let isClientReady = false;

client.on('qr', (qr) => {
    console.log('Scan this QR code with your WhatsApp app:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('WhatsApp Client is ready!');
    isClientReady = true;
});

client.on('auth_failure', msg => {
    console.error('WhatsApp Authentication failure', msg);
});

client.on('disconnected', (reason) => {
    console.log('WhatsApp Client was logged out', reason);
    isClientReady = false;
});

client.initialize();

// API Endpoint to send a PDF via WhatsApp
app.post('/api/send-pdf', upload.single('pdf'), async (req, res) => {
    if (!isClientReady) {
        return res.status(503).json({ error: 'WhatsApp client is not ready yet. Please scan the QR code first.' });
    }

    try {
        const { phoneNumber, message } = req.body;
        const file = req.file;

        if (!phoneNumber) {
            return res.status(400).json({ error: 'phoneNumber is required' });
        }

        if (!file) {
            return res.status(400).json({ error: 'PDF file is required' });
        }

        // Format phone number for WhatsApp (remove + and spaces, append @c.us)
        // e.g., "919876543210" -> "919876543210@c.us"
        let formattedNumber = phoneNumber.replace(/[^0-9]/g, '');
        // Default to India country code if length is 10
        if (formattedNumber.length === 10) {
            formattedNumber = '91' + formattedNumber;
        }
        const chatId = `${formattedNumber}@c.us`;

        // Create MessageMedia from buffer
        const filename = file.originalname || 'receipt.pdf';
        const media = new MessageMedia('application/pdf', file.buffer.toString('base64'), filename);

        // Check if number is registered on WhatsApp
        const isRegistered = await client.isRegisteredUser(chatId);
        if (!isRegistered) {
            console.error(`Number ${chatId} is not registered on WhatsApp`);
            return res.status(404).json({ error: `Phone number ${phoneNumber} is not registered on WhatsApp` });
        }

        // Send message
        console.log(`Sending receipt to ${chatId}...`);
        await client.sendMessage(chatId, media, { caption: message || 'Here is your receipt.' });
        console.log(`Successfully sent to ${chatId}`);

        res.status(200).json({ success: true, message: 'Receipt sent successfully' });
    } catch (error) {
        console.error('Error sending WhatsApp message:', error);
        res.status(500).json({ error: 'Failed to send receipt', details: error.message });
    }
});

// Basic health check endpoint
app.get('/api/status', (req, res) => {
    res.json({ status: isClientReady ? 'ready' : 'not_ready' });
});

app.listen(port, () => {
    console.log(`WhatsApp service listening on port ${port}`);
});
