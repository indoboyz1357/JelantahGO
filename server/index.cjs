require('dotenv').config({ path: 'server/.env' });
const express = require('express');
const { google } = require('googleapis');
const app = express();
app.use(express.json());

// CORS configuration is needed if the frontend and backend are on different origins
const cors = require('cors');
app.use(cors());

app.post('/api/forward-to-sheet', async (req, res) => {
  console.log('Received request on /api/forward-to-sheet');
  const orders = req.body.orders;
  console.log('Received orders:', JSON.stringify(orders, null, 2));

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    console.log('Validation failed: No order data provided.');
    return res.status(400).send('No order data provided.');
  }

  try {
    console.log('Authenticating with Google Sheets API...');
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
        values: rows,
      },
    });

    console.log('Successfully appended data to Google Sheet.');
    res.status(200).send('Data successfully forwarded to Google Sheet.');

  } catch (error) {
    console.error('!!! Error forwarding data to Google Sheet:', error.message);
    res.status(500).send(`Internal Server Error: ${error.message}`);
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));