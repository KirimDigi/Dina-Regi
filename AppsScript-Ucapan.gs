/*************************************************
 * KIRIMDIGI - Backend Ucapan & RSVP (Google Sheets)
 * Spreadsheet : https://docs.google.com/spreadsheets/d/1ml8Q_IDMrpOjQ0IrS3TSANF1mCJYSpkw7HAMIAo-4xQ/edit
 * Sheet       : Sheet1
 * Kolom       : timestamp | nama tamu | ucapan | konfirmasi kehadiran | jumlah tamu
 *
 * CARA PAKAI:
 * 1. Buka spreadsheet di atas > menu Extensions > Apps Script
 * 2. Hapus isi editor, paste SELURUH file ini, Save
 * 3. Deploy > New deployment > type: Web app
 *    - Execute as : Me
 *    - Who has access : Anyone
 *    - Deploy, copy Web app URL
 * 4. Di index.html isi KIRIMDIGI_SHEET_API dengan URL tersebut
 *************************************************/

var SHEET_ID = '1ml8Q_IDMrpOjQ0IrS3TSANF1mCJYSpkw7HAMIAo-4xQ';
var SHEET_NAME = 'Sheet1';
var HEADERS = ['timestamp', 'nama tamu', 'ucapan', 'konfirmasi kehadiran', 'jumlah tamu'];

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) sh.appendRow(HEADERS);
  return sh;
}

function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.action === 'add') return addUcapan_(p);
  return listUcapan_();
}

function doPost(e) {
  var p = (e && e.parameter) || {};
  return addUcapan_(p);
}

function addUcapan_(p) {
  try {
    var sh = getSheet_();
    sh.appendRow([
      new Date(),
      String(p.nama || ''),
      String(p.ucapan || ''),
      String(p.konfirmasi || ''),
      String(p.jumlah || '')
    ]);
    return json_({ ok: true, message: 'Tersimpan' });
  } catch (err) {
    return json_({ ok: false, message: String(err) });
  }
}

function listUcapan_() {
  try {
    var sh = getSheet_();
    var last = sh.getLastRow();
    if (last < 2) return json_({ ok: true, data: [] });
    var vals = sh.getRange(2, 1, last - 1, HEADERS.length).getValues().reverse();
    var data = vals.map(function (r) {
      return {
        timestamp: r[0] instanceof Date ? r[0].toISOString() : String(r[0] || ''),
        nama: String(r[1] || ''),
        ucapan: String(r[2] || ''),
        konfirmasi: String(r[3] || ''),
        jumlah: String(r[4] || '')
      };
    });
    return json_({ ok: true, data: data });
  } catch (err) {
    return json_({ ok: false, message: String(err) });
  }
}

function json_(o) {
  return ContentService
    .createTextOutput(JSON.stringify(o))
    .setMimeType(ContentService.MimeType.JSON);
}
