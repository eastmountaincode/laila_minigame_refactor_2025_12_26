import { google } from 'googleapis';

// Support both raw JSON and base64-encoded JSON
function getCredentials() {
  const key = process.env.GOOGLE_SERVICE_ACCOUNT_KEY!;
  try {
    return JSON.parse(key);
  } catch {
    // Try base64 decode
    return JSON.parse(Buffer.from(key, 'base64').toString('utf-8'));
  }
}

const auth = new google.auth.GoogleAuth({
  credentials: getCredentials(),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

export async function getSheetData(spreadsheetId: string, range: string) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  return response.data.values;
}

export async function appendRow(spreadsheetId: string, range: string, values: string[]) {
  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}
