/**
 * @OnlyCurrentDoc
 * File: Code.gs
 * Description: Server-side logic for the dashboard web app.
 * PERUBAHAN: File ini sekarang berfungsi sebagai backend API murni.
 */
const SHEET_ID = '1i_8i_J5yeuRWMUJDW76_Q9kQyPfbSsSMl6e8kmpMSfw'; // Default Sheet ID


// --- FUNGSI UTAMA API (ROUTER) ---


function doGet(e) {
  const action = e.parameter.action;
  let result;


  try {
    switch (action) {
      case 'getPublicLayanan':
        result = getPublicLayanan();
        break;
      case 'getPublicInfo':
        result = getPublicInfo();
        break;
      case 'getCalendarEvents':
        result = getCalendarEvents(e.parameter.sheetName, e.parameter.sheetId);
        break;
      case 'trackPermohonan':
        result = trackPermohonan(e.parameter.permohonanId, e.parameter.sheetName, e.parameter.sheetId);
        break;
      case 'clearCache':
        // Pengecekan keamanan sederhana: Hanya pemilik skrip yang dapat menghapus cache.
        if (Session.getActiveUser().getEmail() === Session.getEffectiveUser().getEmail() && Session.getActiveUser().getEmail() !== '') {
          result = clearCache();
        } else {
          result = { success: false, message: 'Authorization failed. Only the script owner can clear the cache.' };
        }
        break;
      case 'recordVisit':
        recordVisit();
        result = { success: true, message: 'Visit recorded.' };
        break;
      case 'recordClick':
        recordClick(e.parameter.itemName);
        result = { success: true, message: 'Click recorded.' };
        break;
      default:
        result = { error: 'Invalid action parameter.' };
    }
  } catch (err) {
    result = { error: 'Server error: ' + err.message };
  }
 
  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}


function doPost(e) {
    let result;
    try {
        const requestData = JSON.parse(e.postData.contents);
        const action = requestData.action;


        switch (action) {
            case 'submitPermohonan':
                const sheetName = requestData.sheetName;
                const sheetId = requestData.sheetId;
                result = submitPermohonan(requestData.formData, sheetName, sheetId);
                break;
            case 'submitHelpdesk':
                result = submitHelpdesk(requestData.formData);
                break;
            default:
                result = { success: false, message: 'Invalid POST action.' };
        }
    } catch (err) {
        result = { success: false, message: 'Server error: ' + err.message };
    }


    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
}




// --- FUNGSI-FUNGSI HELPER & LOGIKA BISNIS ---


/**
 * Fungsi untuk menghapus cache server secara manual.
 * Hanya bisa dijalankan oleh pemilik skrip.
 */
function clearCache() {
  try {
    const cache = CacheService.getScriptCache();
    // Kunci cache yang akan dihapus
    const keysToRemove = ['layanan_data', 'info_data'];
    cache.removeAll(keysToRemove);
    console.log('Cache cleared for keys:', keysToRemove.join(', '));
    return { success: true, message: 'Server cache for "layanan_data" and "info_data" has been cleared successfully.' };
  } catch (e) {
    console.error('Failed to clear cache: ' + e.toString());
    return { success: false, message: 'Failed to clear cache: ' + e.message };
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


function submitPermohonan(formData, sheetName, sheetId) {
  const targetSheetId = sheetId || SHEET_ID;
  try {
    if (!sheetName) throw new Error("Nama sheet tidak disediakan.");
   
    const spreadsheet = SpreadsheetApp.openById(targetSheetId);


    if (!spreadsheet) {
      throw new Error(`Gagal membuka spreadsheet. Pastikan ID Spreadsheet "${targetSheetId}" valid dan skrip memiliki izin untuk mengaksesnya.`);
    }


    const targetSheet = spreadsheet.getSheetByName(sheetName);


    if (!targetSheet) throw new Error(`Sheet "${sheetName}" tidak ditemukan.`);
   
    if (formData['Unit Kerja Layanan']) {
      formData['Pengolah'] = formData['Unit Kerja Layanan'];
      delete formData['Unit Kerja Layanan'];
    }
    const headers = targetSheet.getRange(1, 1, 1, targetSheet.getLastColumn()).getValues()[0];
    const jenisLayanan = formData['Jenis Layanan'] || 'UMUM';
    const singkatan = jenisLayanan.split(' ').map(word => word[0]).join('').toUpperCase();
    const permohonanId = `${singkatan}_${new Date().getTime()}`;
   
    formData['IDPermohonan'] = permohonanId;


    if (formData.fileData && formData.fileData.base64Data) {
      const fileUrl = uploadFileToDrive(formData.fileData, formData);
      formData['File'] = fileUrl;
    }
    delete formData.fileData;




    const timezone = spreadsheet.getSpreadsheetTimeZone();


    const newRow = headers.map(header => {
      const headerLower = header.toLowerCase().trim();
      if (['idpermohonan', 'idlayanan', 'id peminjaman'].includes(headerLower)) return permohonanId;
     
      if (headerLower === 'tanggal') return Utilities.formatDate(new Date(), timezone, 'dd/MM/yyyy');
      if (headerLower === 'status') return 'Diajukan';
      if (formData[header] && (headerLower.includes('tanggal') || headerLower.includes('tgl'))) {
        const date = new Date(formData[header]);
        return isNaN(date.getTime()) ? formData[header] : Utilities.formatDate(date, timezone, 'dd/MM/yyyy');
      }
      return formData[header] || '';
    });
   
    targetSheet.appendRow(newRow);
    return { success: true, id: permohonanId };
  } catch (e) {
    console.error(`Submit Error: ${e.toString()}`);
    return { success: false, message: e.message };
  }
}


function getPublicLayanan() {
  const cache = CacheService.getScriptCache();
  const cachedData = cache.get('layanan_data');
  if (cachedData) {
    try { return JSON.parse(cachedData); } catch(e) { console.error("Gagal parsing cache layanan, mengambil data baru."); }
  }
  try {
    const layananSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Layanan');
    if (!layananSheet) {
      console.error("Sheet 'Layanan' tidak ditemukan.");
      return [];
    }
    const dataRange = layananSheet.getDataRange();
    if (dataRange.getNumRows() <= 1) {
      return [];
    }
    const values = dataRange.getValues();
    const headers = values.shift();
    const data = values.map(row => { const obj = {}; headers.forEach((header, index) => { obj[header] = row[index]; }); return obj; });
    // PERUBAHAN: Durasi cache server diubah menjadi 9 jam (32400 detik)
    cache.put('layanan_data', JSON.stringify(data), 32400);
    return data;
  } catch (e) {
    console.error("Gagal mengambil data dari sheet Layanan: " + e.toString());
    return [];
  }
}


function getPublicInfo() {
  const cache = CacheService.getScriptCache();
  const cacheKey = 'info_data';
  try { const cachedData = cache.get(cacheKey); if (cachedData) { return JSON.parse(cachedData); } } catch (e) { console.error('Gagal mem-parsing data cache: ' + e.toString()); }
  try {
    const infoSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Info');
    if (!infoSheet) return [];
    const dataRange = infoSheet.getDataRange();
    if (dataRange.getNumRows() <= 1) return [];
    const values = dataRange.getValues();
    const headers = values.shift();
    const tanggalPostIndex = headers.findIndex(h => h.toLowerCase().trim() === 'tanggal post');
    const durasiIndex = headers.findIndex(h => h.toLowerCase().trim() === 'durasi (hari)');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const allData = values.map(row => { const obj = {}; headers.forEach((header, index) => { obj[header] = row[index]; }); return obj; }).filter(item => { if (tanggalPostIndex === -1 || durasiIndex === -1) return true; const tanggalPost = item['Tanggal Post']; const durasi = item['Durasi (hari)']; if (!durasi || !(tanggalPost instanceof Date) || isNaN(tanggalPost.getTime())) return true; const postDate = new Date(tanggalPost); postDate.setHours(0, 0, 0, 0); const expiryDate = new Date(postDate); expiryDate.setDate(postDate.getDate() + parseInt(durasi, 10)); return today < expiryDate; });
    // PERUBAHAN: Durasi cache server diubah menjadi 9 jam (32400 detik)
    cache.put(cacheKey, JSON.stringify(allData), 32400);
    return allData;
  } catch (e) { console.error("Gagal mengambil data dari sheet Info: " + e.toString()); return []; }
}


function getCalendarEvents(sheetName, sheetId) {
  const events = [];
  const targetSheetId = sheetId || SHEET_ID;
  try {
    const spreadsheet = SpreadsheetApp.openById(targetSheetId);
    if (!spreadsheet) return events; // Tambah validasi
    const timezone = spreadsheet.getSpreadsheetTimeZone();
   
    function parseDate(dateInput) {
      if (!dateInput) return null;
      if (dateInput instanceof Date) return dateInput;
      if (typeof dateInput === 'string' && dateInput.includes('/')) {
        const parts = dateInput.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10) - 1;
          const year = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) return new Date(year, month, day);
        }
      }
      const parsed = new Date(dateInput);
      return isNaN(parsed.getTime()) ? null : parsed;
    }
   
    const targetSheet = spreadsheet.getSheetByName(sheetName || 'Peminjaman');
   
    if (!targetSheet) return events;
    const data = targetSheet.getDataRange().getValues();
    if (data.length <= 1) return events;
   
    const headers = data.shift();
    const findIndex = (key) => headers.findIndex(h => h.toLowerCase().trim() === key.toLowerCase());
   
    const requiredColumns = {
        'Status': findIndex('Status'),
        'Nama': findIndex('Nama'),
        'Jenis Layanan': findIndex('Jenis Layanan'),
        'Tanggal Mulai': findIndex('Tanggal Mulai'),
        'Tanggal Selesai': findIndex('Tanggal Selesai'),
        'Kegiatan': findIndex('Kegiatan')
    };
    if (Object.values(requiredColumns).some(index => index === -1)) return events;
   
    data.forEach((row) => {
      if (String(row[requiredColumns['Status']]).trim().toLowerCase() === 'disetujui') {
        const startDate = parseDate(row[requiredColumns['Tanggal Mulai']]);
        const endDate = parseDate(row[requiredColumns['Tanggal Selesai']]);
       
        if (startDate && endDate) {
            endDate.setDate(endDate.getDate() + 1);
            const jenisLayananText = row[requiredColumns['Jenis Layanan']] || '';
            let iconName = jenisLayananText.toLowerCase().includes('tempat') ? 'building' : (jenisLayananText.toLowerCase().includes('kendaraan') ? 'car' : 'calendar-alt');
           
            const eventDetails = {
              'Nama': row[requiredColumns['Nama']],
              'Jenis Layanan': jenisLayananText,
              'Tanggal Mulai': Utilities.formatDate(new Date(row[requiredColumns['Tanggal Mulai']]), timezone, 'dd/MM/yyyy'),
              'Tanggal Selesai': Utilities.formatDate(new Date(row[requiredColumns['Tanggal Selesai']]), timezone, 'dd/MM/yyyy'),
              'Kegiatan': row[requiredColumns['Kegiatan']],
              'iconName': iconName
            };
           
            events.push({
              title: row[requiredColumns['Nama']] || 'Tanpa Nama',
              start: Utilities.formatDate(startDate, timezone, "yyyy-MM-dd"),
              end: Utilities.formatDate(endDate, timezone, "yyyy-MM-dd"),
              color: jenisLayananText.includes('Tempat') ? '#3b82f6' : '#16a34a',
              extendedProps: eventDetails
            });
        }
      }
    });
    return events;
  } catch (e) {
    console.error(`Error di getCalendarEvents: ${e.toString()}`);
    return events;
  }
}


function trackPermohonan(permohonanId, sheetName, sheetId) {
  const targetSheetId = sheetId || SHEET_ID;
  try {
    if (!sheetName) return { error: "Silakan pilih jenis layanan terlebih dahulu." };
    const targetSheet = SpreadsheetApp.openById(targetSheetId).getSheetByName(sheetName);
    if (!targetSheet) return { error: `Sheet "${sheetName}" tidak ditemukan.` };
    const data = targetSheet.getDataRange().getValues();
    const headers = data.shift();
    const idIndex = headers.findIndex(h => h.toLowerCase().trim() === 'idpermohonan' || h.toLowerCase().trim() === 'idlayanan');
    if (idIndex === -1) return { error: "Kolom ID tidak ditemukan." };
    for (const row of data) {
      if (String(row[idIndex]).trim().toLowerCase() === String(permohonanId).trim().toLowerCase()) {
        const resultObj = {};
        headers.forEach((header, index) => {
          let value = row[index];
          if (row[headers.indexOf('Anonim')] === true && ['Nama Pelapor', 'Email Identitas Pelapor', 'Telepon Identitas Pelapor', 'No Identitas Pelapor'].includes(header)) {
             value = '*****';
          } else if (value instanceof Date) {
             value = value.toLocaleString('id-ID');
          }
          resultObj[header] = value;
        });
        return resultObj;
      }
    }
    return null;
  } catch (e) {
    console.error(`Tracking Error: ${e.toString()}`);
    return { error: "Gagal melacak permohonan." };
  }
}


function recordVisit() {
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    const statSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Statistik');
    if (!statSheet) return;
    const data = statSheet.getRange('A:B').getValues();
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === 'Pengunjung Halaman') {
        const currentCount = parseInt(data[i][1], 10) || 0;
        statSheet.getRange(i + 1, 2).setValue(currentCount + 1);
        found = true;
        break;
      }
    }
    if (!found) statSheet.appendRow(['Pengunjung Halaman', 1]);
    lock.releaseLock();
  } catch (e) {
    console.error('Gagal mencatat kunjungan: ' + e.toString());
  }
}


function recordClick(itemName) {
  if (!itemName) return;
  try {
    const lock = LockService.getScriptLock();
    lock.waitLock(15000);
    const statSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Statistik');
     if (!statSheet) return;
    const data = statSheet.getRange('A:B').getValues();
    let found = false;
    for (let i = 0; i < data.length; i++) {
      if (data[i][0] === itemName) {
        const currentCount = parseInt(data[i][1], 10) || 0;
        statSheet.getRange(i + 1, 2).setValue(currentCount + 1);
        found = true;
        break;
      }
    }
    if (!found) statSheet.appendRow([itemName, 1]);
    lock.releaseLock();
  } catch (e) {
    console.error('Gagal mencatat klik untuk item "' + itemName + '": ' + e.toString());
  }
}


function submitHelpdesk(formData) {
  try {
    const helpdeskSheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName('Helpdesk');
    if (!helpdeskSheet) throw new Error('Sheet "Helpdesk" tidak ditemukan.');
    const helpdeskId = `${new Date().getTime()}_${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    helpdeskSheet.appendRow([helpdeskId, new Date(), formData.Nama, formData.Kontak, formData.Pesan]);
    return { success: true, id: helpdeskId };
  } catch (e) {
    console.error("Submit Helpdesk Error: " + e.toString());
    return { success: false, message: e.message };
  }
}
