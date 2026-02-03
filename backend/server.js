const express = require('express');
const cors = require('cors');
const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Initialize Auth - using service account
if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
  console.error('CRITICAL ERROR: Missing Google Credentials in .env');
  process.exit(1);
}

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const doc = new GoogleSpreadsheet(process.env.SPREADSHEET_ID, serviceAccountAuth);

async function accessSpreadsheet() {
  try {
    await doc.loadInfo();
    console.log(`Loaded doc: ${doc.title}`);
  } catch (error) {
    console.error('Error loading Google Sheet:', error);
  }
}

// Access sheet on startup
accessSpreadsheet();

// API to Mark Attendance
app.post('/api/mark-attendance', async (req, res) => {
  const { rollNo } = req.body;
  console.log(`\n[API] Received Scan Request for: "${rollNo}"`);

  if (!rollNo) {
    return res.status(400).json({ error: 'Roll Number is required' });
  }

  try {
    if (!doc.sheetCount || doc.sheetCount === 0) {
      await accessSpreadsheet(); // Try loading again if not loaded
      if (!doc.sheetCount) throw new Error('Google Sheet not loaded or empty.');
    }
    const sheet = doc.sheetsByIndex[0];

    // Debug: Check if headers exist
    try {
      await sheet.loadHeaderRow();
      console.log('[SHEET] Headers Loaded:', sheet.headerValues);
    } catch (e) {
      console.error('[SHEET] Header load failed:', e.message);
      // If header load fails, try loading cells to see what's there
      await sheet.loadCells('A1:E1');
      const a1 = sheet.getCell(0, 0).value;
      const b1 = sheet.getCell(0, 1).value;
      const c1 = sheet.getCell(0, 2).value;
      console.error('[SHEET] Row 1 values seen by bot:', [a1, b1, c1]);
      return res.status(500).json({ error: 'Sheet header error. Ensure Row 1 has headers.', details: e.message });
    }

    const rows = await sheet.getRows();
    console.log(`[SHEET] Total rows fetched: ${rows.length}`);

    // Headers from screenshot: isPresent | Name | Rollnumber | Branch
    if (rows.length > 0) {
      // Safe fallback log
      try { console.log('[SHEET] First row keys:', Object.keys(rows[0].toObject())); } catch (e) { }
    }

    const studentRow = rows.find(row => {
      const sheetRoll = row.get('Rollnumber'); // This matches strict case header

      // Debug log for every row comparison (might be verbose, good for finding the error)
      // console.log(`Checking: "${sheetRoll}" vs "${rollNo}"`);

      // Compare both as trimmed lowercase strings
      const isMatch = sheetRoll && sheetRoll.toString().trim().toLowerCase() === rollNo.toString().trim().toLowerCase();
      if (isMatch) console.log(`[MATCH FOUND] Row ${row.rowNumber}: ${sheetRoll}`);
      return isMatch;
    });

    if (!studentRow) {
      console.log(`[FAIL] Student not found for roll: "${rollNo}"`);
      // Logic for not found - maybe we can add them? For now, 404.
      return res.status(404).json({ error: `Student not registered (Roll: ${rollNo})` });
    }

    // Check if already present
    const currentStatus = studentRow.get('isPresent');
    console.log(`[STATUS] Current status: "${currentStatus}"`);

    if (currentStatus === 'TRUE' || currentStatus === 'Present' || currentStatus === true || String(currentStatus).toLowerCase() === 'true') {
      console.log('[SKIP] Already marked present.');
      return res.status(200).json({
        message: 'Already marked present',
        student: {
          name: studentRow.get('Name'),
          rollNo: studentRow.get('Rollnumber'),
          branch: studentRow.get('Branch')
        }
      });
    }

    // Update status
    console.log('[UPDATE] Marking as TRUE...');
    studentRow.set('isPresent', 'TRUE');
    await studentRow.save();
    console.log('[SUCCESS] Saved to sheet.');

    return res.status(200).json({
      message: 'Marked Present',
      student: {
        name: studentRow.get('Name'),
        rollNo: studentRow.get('Rollnumber'),
        branch: studentRow.get('Branch')
      }
    });

  } catch (error) {
    console.error('[ERROR] Error processing attendance:', error);
    return res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('Attendance Backend is Running');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
