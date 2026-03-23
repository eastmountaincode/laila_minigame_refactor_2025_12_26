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
  // Find the first empty row by getting all data in column A
  const data = await getSheetData(spreadsheetId, 'Sheet1!A:A');
  const firstEmptyRow = (data?.length ?? 0) + 1;

  // Write to the specific row
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range: `Sheet1!A${firstEmptyRow}:B${firstEmptyRow}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [values] },
  });
}

export async function emailExists(spreadsheetId: string, email: string): Promise<boolean> {
  const data = await getSheetData(spreadsheetId, 'Sheet1!A:A');
  if (!data) return false;

  const normalizedEmail = email.toLowerCase().trim();
  return data.some(row => row[0]?.toLowerCase().trim() === normalizedEmail);
}

export async function deleteEmail(spreadsheetId: string, email: string): Promise<boolean> {
  const data = await getSheetData(spreadsheetId, 'Sheet1!A:A');
  if (!data) return false;

  const normalizedEmail = email.toLowerCase().trim();
  const rowIndex = data.findIndex(row => row[0]?.toLowerCase().trim() === normalizedEmail);

  if (rowIndex === -1) return false;

  // Get the sheet ID (needed for batchUpdate)
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheetId = spreadsheet.data.sheets?.[0]?.properties?.sheetId ?? 0;

  // Delete the row
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId,
            dimension: 'ROWS',
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });

  return true;
}
