/*
This file serves as a blueprint for the required server-side endpoints.
Since I cannot directly implement server-side logic, this file outlines
the necessary code to be implemented on the server (e.g., in a Node.js/Express environment).
*/

// Endpoint: POST /api/forward-to-sheet
// This endpoint will receive order data and append it to a Google Sheet.

/*
** 1. Server Setup (Example using Express.js) **

const express = require('express');
const { google } = require('googleapis');
const app = express();
app.use(express.json());

// CORS configuration is needed if the frontend and backend are on different origins
// const cors = require('cors');
// app.use(cors());

*/

/*
** 2. Google Sheets API Authentication **

- You need to create a Google Cloud Project and enable the Google Sheets API.
- Create a Service Account and download the JSON key file.
- Store the contents of the JSON key file in an environment variable (e.g., GOOGLE_API_CREDENTIALS).
- Share your target Google Sheet with the service account's email address.
- Store the Spreadsheet ID in an environment variable (e.g., SPREADSHEET_ID).

*/

/*
** 3. Endpoint Implementation **

app.post('/api/forward-to-sheet', async (req, res) => {
  const orders = req.body.orders;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    return res.status(400).send('No order data provided.');
  }

  try {
    // Authentication
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_API_CREDENTIALS),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });
    const sheets = google.sheets({ version: 'v4', auth });

    // Prepare data for Google Sheets
    // The first row should be the headers
    const headerRow = [
      'Order ID', 'Customer Name', 'Phone', 'Kecamatan', 'Kota', 
      'Estimated Liters', 'Actual Liters', 'Status', 'Created At', 'Courier ID'
    ];
    
    const rows = orders.map(order => [
      order.id,
      order.customerName,
      order.customerPhone,
      order.customerKecamatan,
      order.customerKota,
      order.estimatedLiters,
      order.actualLiters || 'N/A',
      order.status,
      order.createdAt,
      order.courierId || 'N/A'
    ]);

    // Check if sheet exists, create if not, and add headers
    // For simplicity, this example assumes the sheet and headers already exist.
    // A more robust implementation would handle sheet/header creation.

    // Append data to the sheet
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.SPREADSHEET_ID,
      range: 'Sheet1!A1', // Appends after the last row of the specified range
      valueInputOption: 'USER_ENTERED',
      resource: {
        values: [headerRow, ...rows], // A more robust solution would separate header and data appends
      },
    });

    res.status(200).send('Data successfully forwarded to Google Sheet.');

  } catch (error) {
    console.error('Error forwarding data to Google Sheet:', error);
    res.status(500).send('Internal Server Error.');
  }
});

*/

// Endpoint: POST /api/send-notification
// This endpoint will receive a message and send it as a notification (e.g., via WhatsApp/Twilio).

/*
** 1. Additional Setup (Example using Twilio) **

- Sign up for a Twilio account.
- Get your Account SID, Auth Token, and a Twilio phone number (or configure WhatsApp sender).
- Store these in environment variables: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER.
- Store the destination phone number in an environment variable: NOTIFICATION_RECIPIENT_PHONE.

const twilio = require('twilio');
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

*/

/*
** 2. Endpoint Implementation **

app.post('/api/send-notification', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).send('No message provided.');
  }
  
  if (!twilioClient) {
    console.warn('Twilio client not configured. Check environment variables.');
    return res.status(500).send('Notification service not configured.');
  }

  try {
    await twilioClient.messages.create({
      body: message,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`, // For WhatsApp
      to: `whatsapp:${process.env.NOTIFICATION_RECIPIENT_PHONE}`
    });
    
    res.status(200).send('Test notification sent successfully.');

  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).send('Internal Server Error.');
  }
});

*/

/*
** 4. Start the server **

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

*/