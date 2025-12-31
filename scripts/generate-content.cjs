const fs = require('fs');
const path = require('path');

/**
 * ======================================================================
 * DATA GENERATOR SCRIPT (ENHANCED DEBUGGING & POPUP SUPPORT)
 * ======================================================================
 */

// --- KONFIGURASI ---
const GAS_API_URL = "https://script.google.com/macros/s/AKfycbzQ4JxHEhqeQOA0oJPTl6fXHIMnnll3Q9yGjCI5UkwO1HfzAQTRrpmDgGThvF6THFam/exec";
const OUTPUT_DIR = path.join(__dirname, '../public/data');

/**
 * Fungsi utama fetch data
 */
async function fetchAndSave(action, filename) {
  console.log(`📡 Menarik data untuk aksi: ${action}...`);
  
  let fetchFunc;
  if (typeof fetch === 'function') {
    fetchFunc = fetch;
  } else {
    try {
      const module = await import('node-fetch');
      fetchFunc = module.default;
    } catch (e) {
      throw new Error('Fetch API tidak tersedia. Node v18+ required.');
    }
  }

  try {
    const response = await fetchFunc(`${GAS_API_URL}?action=${action}`);
    
    // Debug: Cek tipe konten
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error("Menerima HTML bukan JSON. Kemungkinan URL salah atau perlu login (Permission Denied).");
    }

    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    
    const jsonResponse = await response.json();
    
    // Debug: Tampilkan ringkasan apa yang diterima
    if (jsonResponse.status === 'error') {
      console.error(`⚠️ API Error [${action}]: ${jsonResponse.message}`);
    }

    // Ekstrak Data
    let dataToSave = jsonResponse;
    if (jsonResponse && jsonResponse.data) {
        dataToSave = jsonResponse.data;
    }

    // --- LOGIKA SANITASI ---
    if (action === 'getAppContent') dataToSave = sanitizeAppContent(dataToSave);
    if (action === 'getFormConfig') dataToSave = sanitizeFormConfig(dataToSave);
    if (action === 'getFAQ') dataToSave = sanitizeFAQ(dataToSave);
    
    // Sanitasi Services (PENTING: Handle array kosong)
    if (action === 'getServices') {
      if (!Array.isArray(dataToSave) || dataToSave.length === 0) {
        console.warn(`⚠️ PERINGATAN: Data ${filename} kosong! Cek Deployment Apps Script.`);
      } else {
        console.log(`   ℹ️ Menerima ${dataToSave.length} layanan.`);
      }
    }

    // Simpan
    const outputPath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(outputPath, JSON.stringify(dataToSave, null, 2));
    console.log(`✅ File ${filename} berhasil diperbarui.`);
    return true;

  } catch (error) {
    console.error(`❌ GAGAL memproses ${action}:`, error.message);
    return false;
  }
}

/**
 * Membersihkan data konten aplikasi (Slider, Links, & Popups)
 */
function sanitizeAppContent(rawData) {
    let finalData = { sliders: [], quickLinks: [], momentLinks: [], popups: [] };
    
    const sanitizeLink = (item) => ({
        id: item.id, title: item.title, subtitle: item.subtitle || "", url: item.url || '#',
        icon: item.icon && item.icon.trim() !== "" ? item.icon : "", color: item.color || "", tag: item.tag || null, order: item.order || 99
    });

    if (rawData && Array.isArray(rawData.sliders)) {
        finalData.sliders = rawData.sliders.map(item => ({
            id: item.id, title: item.title, subtitle: item.subtitle || "", image: item.image || "", tag: item.tag || null, order: item.order || 99
        }));
    }
    
    if (rawData && Array.isArray(rawData.quickLinks)) finalData.quickLinks = rawData.quickLinks.map(sanitizeLink);
    if (rawData && Array.isArray(rawData.momentLinks)) finalData.momentLinks = rawData.momentLinks.map(sanitizeLink);
    
    // --- POPUP SANITIZATION ---
    if (rawData && Array.isArray(rawData.popups)) {
        finalData.popups = rawData.popups.map(item => ({
            id: item.id,
            title: item.title,
            subtitle: item.subtitle || "",
            image: item.image || "",
            url: item.url || ""
        }));
    }

    return finalData;
}

function sanitizeFormConfig(rawData) {
    const sanitized = {};
    if (!rawData || typeof rawData !== 'object') return {};
    Object.keys(rawData).forEach(key => {
        if (Array.isArray(rawData[key])) {
            sanitized[key] = rawData[key].map(field => ({
                ...field, dependency: field.dependency || "", highlight: field.highlight === true
            }));
        }
    });
    return sanitized;
}

function sanitizeFAQ(rawData) {
    if (!Array.isArray(rawData)) return [];
    return rawData.map(faq => ({ ...faq, link: faq.link || "" }));
}

async function generateAll() {
  console.log('🚀 Memulai proses sinkronisasi data...');
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const results = await Promise.all([
    fetchAndSave('getAppContent', 'content.json'),
    fetchAndSave('getServices', 'services.json'),
    fetchAndSave('getFormConfig', 'form-config.json'),
    fetchAndSave('getFAQ', 'faq.json')
  ]);

  console.log(`\n🎉 Selesai!`);
}

generateAll();
