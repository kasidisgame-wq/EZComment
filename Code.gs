/**
 * ===== CONFIG =====
 * ใส่ Spreadsheet ID ของทุกชีทที่ต้องการรวมไว้ในเว็บไซต์นี้
 * (Spreadsheet ID คือส่วนที่อยู่ระหว่าง /d/ และ /edit ใน URL)
 */
const SPREADSHEET_IDS = [
  '1LDHINffP0_p9QlMppzzH-ivgod8tybYhWtuyqllNefM',
  '1byqYMHA67jAoZfr2nSpD3Ll0aQUXB_X3NsT1ydlByh4',
  '1WeyyK79ned1wJ4SCxY53fym7J7Y1ytNf5tYOifb4Bg0',
  '1TGKr-vZI_xjsCM-Ma0kbRi4KxJHAc1DeyaNSEWtSHvw'
];

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Data Hub')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

// ใช้สำหรับรวมไฟล์ HTML/CSS/JS แยกไฟล์เข้าด้วยกัน
function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

/**
 * คืนรายชื่อ Spreadsheet ทั้งหมด พร้อมชื่อจริงของไฟล์ (ดึงจาก Google อัตโนมัติ)
 * และรายชื่อ Sheet/แท็บย่อยภายในแต่ละไฟล์
 */
function getSpreadsheetList() {
  return SPREADSHEET_IDS.map(function (id) {
    try {
      var ss = SpreadsheetApp.openById(id);
      var sheets = ss.getSheets().map(function (sheet) {
        return { name: sheet.getName(), gid: sheet.getSheetId() };
      });
      return { id: id, name: ss.getName(), sheets: sheets, error: null };
    } catch (err) {
      return { id: id, name: 'ไม่สามารถเข้าถึงได้', sheets: [], error: err.message };
    }
  });
}

/**
 * คืนข้อมูลทั้งหมด (header + rows) ของ sheet ที่เลือก
 * ใช้ getDisplayValues() เพื่อให้ได้ค่าที่แสดงผลจริง (วันที่ / ตัวเลขจัด format แล้ว)
 */
function getSheetData(spreadsheetId, sheetName) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return { headers: [], rows: [], rowCount: 0, lastUpdated: new Date().toISOString() };
  }

  var range = sheet.getDataRange();
  var values = range.getDisplayValues();

  if (values.length === 0) {
    return { headers: [], rows: [], rowCount: 0, lastUpdated: new Date().toISOString() };
  }

  var headers = values[0];
  var rows = values.slice(1).filter(function (row) {
    // ตัดแถวว่างล้วนทิ้ง
    return row.some(function (cell) { return String(cell).trim() !== ''; });
  });

  return {
    headers: headers,
    rows: rows,
    rowCount: rows.length,
    lastUpdated: new Date().toISOString()
  };
}
