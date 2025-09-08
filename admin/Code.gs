/**
 * @OnlyCurrentDoc
 * File: Code.gs
 * Description: Server-side logic for the dashboard web app.
 */
const SHEET_ID = '1i_8i_J5yeuRWMUJDW76_Q9kQyPfbSsSMl6e8kmpMSfw'; // Default Sheet ID
const AKADEMIK_SHEET_ID = '1ajKNk7Lh1Ie8LbXSV23P7nsRPg6G1rryzTCXwmrlJAQ';

// --- FUNGSI ENKRIPSI SEDERHANA ---
// Ambil kunci dari Script Properties untuk keamanan
const ENCRYPTION_KEY = PropertiesService.getScriptProperties().getProperty('ENCRYPTION_KEY') || 'kunci-default-harap-diganti';

function encrypt(text) {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return Utilities.base64Encode(result);
}

function decrypt(encryptedText) {
  let decodedText = Utilities.newBlob(Utilities.base64Decode(encryptedText)).getDataAsString();
  let result = '';
  for (let i = 0; i < decodedText.length; i++) {
    result += String.fromCharCode(decodedText.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
  }
  return result;
}

/**
 * Fungsi untuk menghapus cache data layanan secara manual.
 */
function clearCache() {
  CacheService.getScriptCache().removeAll(['layanan_data', 'info_data']);
  console.log('Cache layanan dan info telah berhasil dihapus.');
}

/**
 * Fungsi utama untuk menyajikan aplikasi web admin.
 */
function doGet(e) {
  const page = HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Layanan IAIN Bone')
      .addMetaTag('viewport', 'width=device-width, initial-scale=1.0');
  page.setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
  return page;
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// ===============================================================
// FUNGSI-FUNGSI UNTUK DASBOR ADMIN
// ===============================================================
function authenticateUser(username, password) {
  try {
    const userSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('User');
    const data = userSheet.getDataRange().getValues();
    const headers = data.shift().map(h => h.toLowerCase().trim());
    const usernameIndex = headers.indexOf('username');
    const passwordIndex = headers.indexOf('password');
    const nameIndex = headers.indexOf('pengolah');
    const menuIndex = headers.indexOf('menu');
    const peranIndex = headers.indexOf('peran');
    const jumlahIndex = headers.indexOf('jumlah');
    const loginTerakhirIndex = headers.indexOf('login terakhir');

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (String(row[usernameIndex]).trim() === String(username).trim() && String(row[passwordIndex]) === String(password)) {
       
        const timezone = SpreadsheetApp.getActive().getSpreadsheetTimeZone();
        const now = new Date();
        if (jumlahIndex !== -1) {
          const currentCount = parseInt(row[jumlahIndex] || '0', 10);
          userSheet.getRange(i + 2, jumlahIndex + 1).setValue(currentCount + 1);
        }
        if (loginTerakhirIndex !== -1) {
          const formattedTimestamp = Utilities.formatDate(now, timezone, 'dd/MM/yyyy HH:mm:ss');
          userSheet.getRange(i + 2, loginTerakhirIndex + 1).setValue(formattedTimestamp);
        }

        return {
          username: row[usernameIndex],
          name: row[nameIndex],
          menus: (menuIndex !== -1 && row[menuIndex]) ? row[menuIndex].toString().trim() : '*',
          peran: (peranIndex !== -1 && row[peranIndex]) ? row[peranIndex].toString().trim() : 'Biasa'
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Authentication Error: " + error.toString());
    return null;
  }
}

function getInitialData(userInfo) {
  try {
    const mainSpreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const akademikSpreadsheet = SpreadsheetApp.openById(AKADEMIK_SHEET_ID);
   
    // Helper function to get data and add an original index
    const getDataFromSheet = (spreadsheet, sheetName) => {
      const sheet = spreadsheet.getSheetByName(sheetName);
      if (!sheet) return { headers: [], data: [] };
     
      const lastRow = sheet.getLastRow();
      if (lastRow < 1) return { headers: [], data: [] };
     
      const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
      if (lastRow < 2) return { headers: headers, data: [] };
     
      const values = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
      const timezone = spreadsheet.getSpreadsheetTimeZone();
     
      const data = values.map((row, index) => {
        const obj = {};
        row.forEach((cell, cellIndex) => {
          const header = headers[cellIndex];
          if (header) {
            obj[header] = cell instanceof Date ? Utilities.formatDate(cell, timezone, 'dd/MM/yyyy') : cell;
          }
        });
        return obj;
      });
     
      return { headers: headers, data: data };
    };

    let layananData = getDataFromSheet(mainSpreadsheet, 'Layanan');
    let publikData = getDataFromSheet(mainSpreadsheet, 'Info');
    let peminjamanData = getDataFromSheet(mainSpreadsheet, 'Peminjaman');
    let akademikData = getDataFromSheet(akademikSpreadsheet, 'Keterangan');
    let pengaduanData = getDataFromSheet(mainSpreadsheet, 'Pengaduan');
    let suratData = getDataFromSheet(mainSpreadsheet, 'Surat');

    if (userInfo && userInfo.peran !== 'Pusat') {
      const userPengolah = userInfo.name;
      const multiPengolahFilter = (row) => {
        const pengolahCell = row['Pengolah'];
        if (typeof pengolahCell !== 'string' || !pengolahCell) return false;
        const pengolahList = pengolahCell.split(',').map(p => p.trim());
        return pengolahList.includes(userPengolah);
      };

      if (peminjamanData.headers.includes('Pengolah')) {
        peminjamanData.data = peminjamanData.data.filter(multiPengolahFilter);
      }
      if (akademikData.headers.includes('Pengolah')) {
        akademikData.data = akademikData.data.filter(multiPengolahFilter);
      }
      if (pengaduanData.headers.includes('Pengolah')) {
        pengaduanData.data = pengaduanData.data.filter(multiPengolahFilter);
      }
    }

    if (userInfo.peran !== 'Pusat') {
      pengaduanData.data = pengaduanData.data.map(obj => {
        if (obj['Anonim'] === true) {
          const fieldsToHide = ['Nama Pelapor', 'Email Identitas Pelapor', 'Telepon Identitas Pelapor', 'No Identitas Pelapor'];
          fieldsToHide.forEach(field => {
            if (obj[field]) obj[field] = '********';
          });
        }
        return obj;
      });
    }

    return {
      layanan: layananData,
      publik: publikData,
      peminjaman: peminjamanData,
      akademik: akademikData,
      pengaduan: pengaduanData,
      surat: suratData
    };
  } catch (error) {
    console.error("Error fetching data: " + error.toString());
    return { error: "Gagal mengambil data dari server." };
  }
}

// --- FUNGSI PENGADUAN BARU ---
function getPengaduanDetail(idPermohonan, userInfo) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Pengaduan');
    const dataRange = sheet.getDataRange();
    const values = dataRange.getValues();
    const headers = values.shift();
    const idPermohonanStr = String(idPermohonan).trim();
    const rowIndex = values.findIndex(row => String(row[0]).trim() === idPermohonanStr);

    if (rowIndex === -1) {
       return { success: false, message: 'Data tidak ditemukan.' };
    }
   
    const row = values[rowIndex];
    const resultObj = {};
    const isAnonim = row[headers.indexOf('Anonim')] === true;

    headers.forEach((header, index) => {
      let value = row[index];
      const isSensitiveField = ['Nama Pelapor', 'Email Identitas Pelapor', 'Telepon Identitas Pelapor', 'No Identitas Pelapor'].includes(header);
      if (isAnonim && isSensitiveField) {
        if (userInfo.peran === 'Pusat') {
          try {
            value = value ? `[D] ${decrypt(value)}` : '[Data Kosong]';
          } catch (e) {
            value = 'Gagal Dekripsi';
          }
        } else {
          value = '***********';
        }
      } else if (value instanceof Date) {
        value = Utilities.formatDate(value, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'dd/MM/yyyy');
      }
      resultObj[header] = value;
    });

    return { success: true, data: resultObj };
  } catch (e) {
    console.error("Error in getPengaduanDetail: " + e.toString());
    return { success: false, message: e.message };
  }
}

function updatePengaduan(updateData) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Pengaduan');
    const data = sheet.getRange("A:A").getValues();
    const idToUpdate = String(updateData.rowIndex).trim();

    for (let i = 0; i < data.length; i++) {
      if (String(data[i][0]).trim() === idToUpdate) {
        const rowNumber = i + 1;
        const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
       
        const jawabanIndex = headers.indexOf('Jawaban') + 1;
        const statusIndex = headers.indexOf('Status') + 1;
        if (jawabanIndex > 0) {
           sheet.getRange(rowNumber, jawabanIndex).setValue(updateData.Jawaban);
        }
        if (statusIndex > 0) {
           sheet.getRange(rowNumber, statusIndex).setValue(updateData.Status);
        }
       
        return { success: true };
      }
    }
    return { success: false, message: 'ID Permohonan tidak ditemukan.' };
  } catch (e) {
    console.error("Error in updatePengaduan: " + e.toString());
    return { success: false, message: e.message };
  }
}

function deletePengaduan(idPermohonan) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Pengaduan');
    const data = sheet.getRange("A:A").getValues();
    const idToDelete = String(idPermohonan).trim();
    for (let i = data.length - 1; i >= 1; i--) {
      if (String(data[i][0]).trim() === idToDelete) {
        sheet.deleteRow(i + 1);
        return { success: true };
      }
    }
    return { success: false, message: 'ID Permohonan tidak ditemukan.' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// --- FUNGSI EKSPOR ---
function exportPengaduanData() {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Pengaduan');
    const data = sheet.getDataRange().getValues();
    const headers = data.shift();
    const anonimIndex = headers.findIndex(h => h.toLowerCase() === 'anonim');
    const fieldsToDecryptIndices = ['Nama Pelapor', 'Email Identitas Pelapor', 'Telepon Identitas Pelapor', 'No Identitas Pelapor']
                                    .map(fieldName => headers.findIndex(h => h === fieldName));

    let csvContent = headers.join(',') + '\n';
    data.forEach(row => {
      const processedRow = [...row];
      if (anonimIndex !== -1 && processedRow[anonimIndex] === true) {
        fieldsToDecryptIndices.forEach(index => {
          if (index !== -1 && processedRow[index]) {
            try {
              processedRow[index] = decrypt(processedRow[index]);
            } catch (e) {
              processedRow[index] = 'Gagal Dekripsi';
            }
          }
        });
      }
     
      const csvRow = processedRow.map(cell => {
        const cellStr = String(cell || '');
        return cellStr.includes(',') ? `"${cellStr.replace(/"/g, '""')}"` : cellStr;
      }).join(',');
     
      csvContent += csvRow + '\n';
    });

    return { success: true, csvData: csvContent };
  } catch (e) {
    console.error("Export Error: " + e.toString());
    return { success: false, message: e.message };
  }
}

// --- FUNGSI-FUNGSI CRUD DATA ---
function addInfoData(dataObject) {
  try {
    const infoSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Info');
    const headers = infoSheet.getRange(1, 1, 1, infoSheet.getLastColumn()).getValues()[0];
    if (headers.includes('Tanggal Post')) dataObject['Tanggal Post'] = new Date();
    const newRow = headers.map(header => dataObject[header] || '');
    infoSheet.appendRow(newRow);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateInfoData(rowIndex, dataObject) {
  try {
    const infoSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Info');
    const headers = infoSheet.getRange(1, 1, 1, infoSheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    infoSheet.getRange(parseInt(rowIndex, 10) + 2, 1, 1, newRow.length).setValues([newRow]);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteInfoData(rowIndex) {
  try {
    const infoSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Info');
    infoSheet.deleteRow(parseInt(rowIndex, 10) + 2);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function addPeminjamanData(dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Peminjaman');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => {
      const headerLower = header.toLowerCase();
      if (dataObject[header] && (headerLower.includes('tanggal') || headerLower.includes('tgl'))) {
        const date = new Date(dataObject[header]);
        if (!isNaN(date.getTime())) {
          return Utilities.formatDate(date, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'dd/MM/yyyy');
        }
      }
      return dataObject[header] || '';
    });
    sheet.appendRow(newRow);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function uploadFileToDrive(fileData, rowData) {
  try {
    function processTemplateString(template, data) {
      if (!template) return '';
      let processedString = template.replace(/\(This Year\)/g, new Date().getFullYear());
      processedString = processedString.replace(/\{(.+?)\}/g, (match, key) => {
        const keyInRowData = Object.keys(data).find(k => k.toLowerCase() === key.toLowerCase());
        const value = keyInRowData ? data[keyInRowData] : '';
        const safeValue = value || `(Data ${key} Kosong)`;
        return safeValue.toString().replace(/[\\/:"*?<>|]/g, '-');
      });
      return processedString.trim();
    }

    function getOrCreateFolderByPath(baseFolderId, path) {
      const baseFolder = DriveApp.getFolderById(baseFolderId);
      const folderNames = path.split('/').filter(name => name && name.trim() !== '');
      let currentFolder = baseFolder;
      for (const folderName of folderNames) {
        const folders = currentFolder.getFoldersByName(folderName);
        currentFolder = folders.hasNext() ? folders.next() : currentFolder.createFolder(folderName);
      }
      return currentFolder;
    }

    const layananSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Layanan');
    const layananData = layananSheet.getDataRange().getValues();
    const layananHeaders = layananData.shift();
    const jenisLayananIndex = layananHeaders.findIndex(h => h.toLowerCase() === 'jenis layanan');
    const folderIdIndex = layananHeaders.findIndex(h => h.toLowerCase() === 'folder');
    const varFolderIndex = layananHeaders.findIndex(h => h.toLowerCase() === 'variabel folder');
    const varNamaIndex = layananHeaders.findIndex(h => h.toLowerCase() === 'variabel nama');
   
    const jenisLayananTarget = rowData['Jenis Layanan'];
    if (!jenisLayananTarget) {
        throw new Error("Jenis Layanan tidak terdefinisi di data formulir.");
    }
    const layananInfo = layananData.find(row => row[jenisLayananIndex] === jenisLayananTarget);
   
    if (!layananInfo) throw new Error(`Konfigurasi untuk layanan "${jenisLayananTarget}" tidak ditemukan di sheet 'Layanan'.`);
   
    const baseFolderId = layananInfo[folderIdIndex];
    const folderTemplate = layananInfo[varFolderIndex] || '';
    const namaTemplate = layananInfo[varNamaIndex];
   
    if (!baseFolderId) throw new Error("Konfigurasi 'Folder' (ID Folder) tidak boleh kosong di sheet 'Layanan'.");
    if (!namaTemplate) throw new Error("Konfigurasi 'Variabel Nama' tidak boleh kosong di sheet 'Layanan'.");
   
    const folderPath = processTemplateString(folderTemplate, rowData);
    const fileName = processTemplateString(namaTemplate, rowData);
    const destinationFolder = getOrCreateFolderByPath(baseFolderId, folderPath);
    const blob = Utilities.newBlob(Utilities.base64Decode(fileData.base64Data), fileData.type, fileName);
    const newFile = destinationFolder.createFile(blob);
    return newFile.getUrl();
  } catch (e) {
    console.error("Upload File Error: " + e.toString());
    throw new Error("Gagal mengunggah file: " + e.message);
  }
}

/**
 * --- DIPERBARUI ---
 * Fungsi ini sekarang menggunakan `idPermohonan` sebagai kunci, bukan `rowIndex`.
 */
function updatePeminjamanData(idPermohonan, dataObject) {
  try {
    if (dataObject.fileData && dataObject.fileData.base64Data) {
      const fileUrl = uploadFileToDrive(dataObject.fileData, dataObject);
      dataObject['File'] = fileUrl;
    }
    delete dataObject.fileData;

    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Peminjaman');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
   
    // Cari baris yang benar berdasarkan IDPermohonan
    const idColumnValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    const rowIndexInSheet = idColumnValues.findIndex(row => row[0] === idPermohonan);
    if (rowIndexInSheet === -1) {
      return { success: false, message: 'ID Permohonan tidak ditemukan untuk diperbarui.' };
    }
   
    const rowToUpdate = rowIndexInSheet + 2; // +2 karena sheet 1-based dan data dimulai dari baris 2
    const newRow = headers.map(header => {
      const headerLower = header.toLowerCase();
      if (dataObject[header] && (headerLower.includes('tanggal') || headerLower.includes('tgl'))) {
        try {
          const date = new Date(dataObject[header]);
          if (!isNaN(date.getTime())) {
            return Utilities.formatDate(date, SpreadsheetApp.getActive().getSpreadsheetTimeZone(), 'dd/MM/yyyy');
          }
        } catch (e) {}
      }
      return dataObject[header] || '';
    });
    sheet.getRange(rowToUpdate, 1, 1, newRow.length).setValues([newRow]);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * --- DIPERBARUI ---
 * Fungsi ini sekarang menggunakan `idPermohonan` sebagai kunci, bukan `rowIndex`.
 */
function deletePeminjamanData(idPermohonan) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Peminjaman');
    // Cari baris yang benar berdasarkan IDPermohonan
    const idColumnValues = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
    const rowIndexInSheet = idColumnValues.findIndex(row => row[0] === idPermohonan);

    if (rowIndexInSheet === -1) {
      return { success: false, message: 'ID Permohonan tidak ditemukan untuk dihapus.' };
    }
    const rowToDelete = rowIndexInSheet + 2;
    sheet.deleteRow(rowToDelete);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function getHtmlSurat(rowData) {
  try {
    const suratSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Surat');
    const suratDataRange = suratSheet.getDataRange();
    const suratValues = suratDataRange.getValues();
    const suratHeaders = suratValues.shift();
   
    let ttdData = {};
    const pengolahPermohonan = rowData['Pengolah'] || '';
    const jenisLayananPermohonan = rowData['Jenis Layanan'] || '';
    for (const row of suratValues) {
        const suratRowObj = {};
        suratHeaders.forEach((header, index) => {
            suratRowObj[header] = row[index];
        });
        if (suratRowObj['Pengolah'] === pengolahPermohonan && suratRowObj['Jenis Layanan'] === jenisLayananPermohonan) {
            ttdData = {
              Kop: suratRowObj['Kop'],
              AtasNama: suratRowObj['Atas Nama'],
              JabatanTTD: suratRowObj['Jabatan TTD'],
              PejabatTTD: suratRowObj['Pejabat TTD'],
              NIPTTD: suratRowObj['NIP TTD']
            };
            break;
        }
    }
    const combinedData = { ...rowData, ...ttdData };
   
    const jenisLayanan = rowData['Jenis Layanan'] || '';
    const templateName = jenisLayanan.toLowerCase().includes('kendaraan') ? 'ijin-kendaraan' : 'ijin-tempat';
   
    const template = HtmlService.createTemplateFromFile(templateName);
    template.data = combinedData;
    return template.evaluate().getContent();
   
  } catch (e) {
    console.error("Error saat generate surat: " + e.toString());
    return `<html><body><h1>Error</h1><p>${e.toString()}</p></body></html>`;
  }
}

function addLayananData(dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Layanan');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    sheet.appendRow(newRow);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateLayananData(rowIndex, dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Layanan');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    sheet.getRange(parseInt(rowIndex, 10) + 2, 1, 1, newRow.length).setValues([newRow]);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteLayananData(rowIndex) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Layanan');
    sheet.deleteRow(parseInt(rowIndex, 10) + 2);
    clearCache();
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function addAkademikData(dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(AKADEMIK_SHEET_ID).getSheetByName('Keterangan');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    sheet.appendRow(newRow);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateAkademikData(rowIndex, dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(AKADEMIK_SHEET_ID).getSheetByName('Keterangan');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    sheet.getRange(parseInt(rowIndex, 10) + 2, 1, 1, newRow.length).setValues([newRow]);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteAkademikData(rowIndex) {
  try {
    const sheet = SpreadsheetApp.openById(AKADEMIK_SHEET_ID).getSheetByName('Keterangan');
    sheet.deleteRow(parseInt(rowIndex, 10) + 2);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

// --- BARU: FUNGSI CRUD UNTUK SHEET SURAT ---
function addSuratData(dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Surat');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    sheet.appendRow(newRow);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function updateSuratData(rowIndex, dataObject) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Surat');
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const newRow = headers.map(header => dataObject[header] || '');
    sheet.getRange(parseInt(rowIndex, 10) + 2, 1, 1, newRow.length).setValues([newRow]);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function deleteSuratData(rowIndex) {
  try {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Surat');
    sheet.deleteRow(parseInt(rowIndex, 10) + 2);
    return { success: true };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

function getHtmlSuketKuliah(rowData) {
  try {
    const template = HtmlService.createTemplateFromFile('ket-kuliah');
    template.data = rowData;
    return template.evaluate().getContent();
  } catch (e) {
    return `<html><body><h1>Error</h1><p>${e.toString()}</p></body></html>`;
  }
}

function getPeminjamanData() {
  try {
    const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
    const sheet = spreadsheet.getSheetByName('Peminjaman');
    if (!sheet) return { headers: [], data: [] };
   
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 1) return { headers: [], data: [] };
    const headers = sheet.getRange(1, 1, 1, lastCol > 0 ? lastCol : 1).getValues()[0];
   
    if (lastRow < 2) return { headers: headers, data: [] };
   
    const values = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();
    const timezone = spreadsheet.getSpreadsheetTimeZone();
    const data = values.map(row => {
      const obj = {};
      row.forEach((cell, index) => {
        const header = headers[index];
        if (header) {
           if (cell instanceof Date) {
             obj[header] = Utilities.formatDate(cell, timezone, 'dd/MM/yyyy');
           } else {
             obj[header] = cell;
           }
        }
      });
      return obj;
    });
   
    return { headers: headers, data: data };
  } catch (e) {
    console.error("Error fetching peminjaman data: " + e.toString());
    return { error: "Gagal mengambil data peminjaman." };
  }
}

function changeUserPassword(username, oldPassword, newPassword) {
  try {
    const userSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('User');
    const data = userSheet.getDataRange().getValues();
    const headers = data.shift();
    const usernameIndex = headers.findIndex(h => h.toLowerCase() === 'username');
    const passwordIndex = headers.findIndex(h => h.toLowerCase() === 'password');

    if (usernameIndex === -1 || passwordIndex === -1) {
      return { success: false, message: 'Sheet "User" tidak terkonfigurasi dengan benar.' };
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (String(row[usernameIndex]).trim() === String(username).trim()) {
        if (String(row[passwordIndex]) === String(oldPassword)) {
          userSheet.getRange(i + 2, passwordIndex + 1).setValue(newPassword);
          return { success: true };
        } else {
          return { success: false, message: 'Password lama yang Anda masukkan salah.' };
        }
      }
    }
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  } catch (error) {
    console.error("Password Change Error: " + error.toString());
    return { success: false, message: 'Terjadi kesalahan di server.' };
  }
}
