/**
 * File: forms.js
 * Description: Module to render various forms for the public service application.
 * All functions are now global and will be loaded directly by index.html.
 */

/**
 * Renders the custom form for "Surat Keterangan Kuliah".
 * @param {HTMLElement} permohonanForm - The form element to populate.
 * @param {string[]} allFields - Array of field names from the sheet configuration.
 * @param {string} pengolah - The processing unit.
 * @param {string} layananName - The name of the service.
 * @param {Array<Object>} prodiData - The fetched data for prodi and fakultas.
 */
function renderSuketKuliahForm(permohonanForm, allFields, pengolah, layananName, prodiData) {
    if (!prodiData) {
        permohonanForm.innerHTML = `<p class="text-red-500 text-center">Gagal memuat data. Silakan tutup dan buka kembali form ini.</p>`;
        return;
    }

    let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
    formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
    let fieldsHtml = '';

    fieldsHtml += `
        <div class="mb-4 md:col-span-2">
            <p class="text-xs text-blue-600 bg-blue-50 p-2 rounded-md mb-2">Jika diperuntukkan sebagai dasar pembayaran Tunjangan Penghasilan Orang Tua maka silakan pilih Unit Kerja Layanan "Rektorat"</p>
            <label for="unit-kerja-layanan" class="block text-sm font-medium text-gray-700 mb-1">Unit Kerja Layanan <span class="text-red-500">*</span></label>
            <select id="unit-kerja-layanan" name="Unit Kerja Layanan" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="" disabled selected>-- Pilih Unit Kerja --</option>
                <option>Rektorat</option>
                <option>Biro AUAK</option>
                <option>Fakultas Syariah dan Hukum Islam</option>
                <option>Fakultas Tarbiyah</option>
                <option>Fakultas Ekonomi dan Bisnis Islam</option>
                <option>Fakultas Ushuluddin dan Dakwah</option>
                <option>Pascasarjana</option>
            </select>
        </div>
    `;
    
    allFields.forEach(field => {
        const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
        const fieldLower = field.toLowerCase().trim();
        let isRequired = !['email', 'telepon'].includes(fieldLower) && !fieldLower.includes('orang tua');
        let inputHtml = '';
        let wrapperClass = 'mb-4';
        let fieldLabel = field;
        if (isRequired) {
            fieldLabel += ` <span class="text-red-500">*</span>`;
        }

        switch (fieldLower) {
            case 'tempat lahir':
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                             <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TEMPAT LAHIR. CONTOH: Watampone, Bone, Kel. Macege, dll</p>`;
                break;
            case 'tanggal lahir':
                 inputHtml = `<input type="date" id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                              <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TANGGAL LAHIR. CONTOH: 20 September 2000, 1 Oktober 1999, dll</p>`;
                break;
            case 'alamat':
                inputHtml = `<textarea id="${fieldId}" name="${field}" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                             <p class="text-xs text-gray-500 mt-1">DIISI SESUAI DENGAN ALAMAT PADA KTP</p>`;
                wrapperClass += ' md:col-span-2';
                break;
            case 'semester':
                const semesterOptions = ['I (Satu)', 'II (Dua)', 'III (Tiga)', 'IV (Empat)', 'V (Lima)', 'VI (Enam)', 'VII (Tujuh)', 'VIII (Delapan)', 'IX (Sembilan)', 'X (Sepuluh)', 'XI (Sebelas)', 'XII (Dua Belas)', 'XIII (Tiga Belas)', 'XIV (Empat Belas)'];
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih --</option>
                                ${semesterOptions.map(o => `<option value="${o}">${o}</option>`).join('')}
                             </select>`;
                break;
            case 'jenis kelamin':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih --</option>
                                <option>Laki-laki</option><option>Perempuan</option>
                             </select>`;
                break;
            case 'prodi':
                const prodiOptions = prodiData.map(item => `<option value="${item.prodi}">${item.prodi}</option>`).join('');
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih Prodi --</option>
                                ${prodiOptions}
                             </select>`;
                break;
            case 'fakultas':
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" readonly class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />`;
                break;
            case 'tahun akademik':
                const currentYear = new Date().getFullYear();
                const years = [`${currentYear - 2}/${currentYear - 1}`, `${currentYear - 1}/${currentYear}`, `${currentYear}/${currentYear + 1}`];
                const yearOptions = years.map(y => `<option value="${y}" ${ (new Date().getMonth() > 6 ? years[2] : years[1]) === y ? 'selected' : ''}>${y}</option>`).join('');
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                ${yearOptions}
                             </select>`;
                break;
            default:
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" ${isRequired ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />`;
                break;
        }
         fieldsHtml += `
            <div class="${wrapperClass}" ${fieldLower.includes('orang tua') ? 'data-group="orang-tua" style="display:none;"' : ''}>
                <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">${fieldLabel}</label>
                ${inputHtml}
            </div>`;
    });

    formHtml += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">${fieldsHtml}</div>`;
    permohonanForm.innerHTML = formHtml;
    
    // --- Event Listeners untuk form Suket Kuliah ---
    const prodiSelect = permohonanForm.querySelector('[name="Prodi"]');
    const fakultasInput = permohonanForm.querySelector('[name="Fakultas"]');
    prodiSelect.addEventListener('change', function() {
        const selectedProdi = this.value;
        const match = prodiData.find(item => item.prodi === selectedProdi);
        if (match) {
            fakultasInput.value = match.fakultas;
        }
    });

    const unitKerjaSelect = permohonanForm.querySelector('#unit-kerja-layanan');
    unitKerjaSelect.addEventListener('change', function() {
        const isRektorat = this.value === 'Rektorat';
        const orangTuaFields = permohonanForm.querySelectorAll('[data-group="orang-tua"]');
        orangTuaFields.forEach(field => {
            field.style.display = isRektorat ? 'block' : 'none';
            const input = field.querySelector('input, select, textarea');
            if(input) {
                input.required = isRektorat;
            }
        });
    });
    // Trigger sekali untuk set state awal
    unitKerjaSelect.dispatchEvent(new Event('change'));
}


/**
 * Renders the custom form for "Peminjaman".
 * @param {HTMLElement} permohonanForm - The form element to populate.
 * @param {string[]} allFields - Array of field names from the sheet configuration.
 * @param {string} pengolah - The processing unit.
 */
function renderPeminjamanForm(permohonanForm, allFields, pengolah) {
    let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
    let fieldsContainerHtml = '';

    const unitKerjaOptions = ['Rektorat', 'Fakultas Syariah dan Hukum Islam', 'Fakultas Tarbiyah', 'Fakultas Ekonomi dan Bisnis Islam', 'Fakultas Ushuluddin dan Dakwah', 'Pascasarjana'];
    let unitKerjaOptHtml = unitKerjaOptions.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    fieldsContainerHtml += `
        <div class="mb-4 md:col-span-2">
            <label for="unit-kerja-layanan" class="block text-sm font-medium text-gray-700 mb-1">Unit Kerja Layanan</label>
            <select id="unit-kerja-layanan" name="Unit Kerja Layanan" required class="w-full px-4 py-2 border border-yellow-300 rounded-lg bg-yellow-50 text-sm focus:ring-yellow-400 focus:border-yellow-400">
            <option value="" disabled selected>-- Pilih Unit Kerja --</option>
            ${unitKerjaOptHtml}
            </select>
        </div>
    `;

    fieldsContainerHtml += `
        <div class="mb-4 md:col-span-2">
            <label for="jenis-layanan-peminjaman" class="block text-sm font-medium text-gray-700 mb-1">Jenis Layanan</label>
            <select id="jenis-layanan-peminjaman" name="Jenis Layanan" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="" disabled selected>-- Pilih --</option>
                <option>Peminjaman Tempat</option>
                <option>Peminjaman Kendaraan</option>
            </select>
        </div>
    `;

    allFields.forEach(field => {
        if (field.toLowerCase().trim() === 'jenis layanan') {
            return;
        }
        const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
        const fieldLower = field.toLowerCase().trim();
        let description = '';
        const descriptions = {
            'nama': 'Nama Organisasi atau Individu',
            'perihal': 'Contoh: Permohonan Peminjaman Aula Utama / Bus',
            'kegiatan': 'Contoh: FESTASI III Biru 17 Kampus V UNM Parepare di Pare Pare',
            'email': 'Silakan mengisi Email atau Telepon untuk memudahkan penyampaian informasi pelayanan.',
            'telepon': 'Silakan mengisi Email atau Telepon untuk memudahkan penyampaian informasi pelayanan.'
        };
        if (descriptions[fieldLower]) {
            description = `<p class="text-xs text-gray-500 mt-1">${descriptions[fieldLower]}</p>`;
        }
        const isRequired = !['email', 'telepon'].includes(fieldLower);
        const inputType = (fieldLower.includes('tanggal') || fieldLower.includes('tgl')) ? 'date' : 'text';
        fieldsContainerHtml += `
            <div class="mb-4">
                <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">${field}</label>
                <input type="${inputType}" id="${fieldId}" name="${field}" ${isRequired ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                ${description}
            </div>
        `;
    });
    
    formHtml += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">${fieldsContainerHtml}</div>`
    permohonanForm.innerHTML = formHtml;
}

/**
 * Renders the custom form for "Pengaduan".
 * @param {HTMLElement} permohonanForm - The form element to populate.
 * @param {string[]} allFields - Array of field names from the sheet configuration.
 * @param {string} pengolah - The processing unit.
 * @param {string} layananName - The name of the service.
 */
function renderPengaduanForm(permohonanForm, allFields, pengolah, layananName) {
    let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
    formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
    
    let pelaporHtml = '';
    let terlaporHtml = '';
    let lainnyaHtml = '';
    const satuanKerjaOptions = ['Rektorat', 'Biro AUAK', 'Fakultas Syariah dan Hukum Islam', 'Fakultas Tarbiyah', 'Fakultas Ekonomi dan Bisnis Islam', 'Fakultas Ushuluddin dan Dakwah', 'Pascasarjana', 'Lembaga Penjaminan Mutu', 'Lembaga Penelitian dan Pengabdian Masyarakat', 'Satuan Pengawasan Internal', 'UPT TIPD', 'UPT Perpustakaan', 'UPT Bahasa', 'UPT Mahad Al Jamiah'];
    const jenisAduanOptions = ['Korupsi / Pungli', 'Pelayanan Publik', 'Penyalahgunaan Wewenang', 'Tata Laksana / Regulasi', 'Hukum / HAM', 'Kepegawian', 'Umum'];
    
    allFields.forEach(field => {
        const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
        const fieldLower = field.toLowerCase();
        let isRequired = !['email', 'telepon', 'anonim', 'rahasia', 'file'].includes(fieldLower.replace(/ identitas pelapor| pelapor/g, ''));
        let fieldInputHtml = '';
        let wrapperClass = 'mb-4';
        if (fieldLower.includes('anonim')) {
            fieldInputHtml = `<div class="flex items-center mt-2"><input type="checkbox" id="${fieldId}" name="${field}" class="h-4 w-4 text-green-800 border-gray-300 rounded focus:ring-green-800" /><label for="${fieldId}" class="ml-2 text-sm text-gray-600">Saya ingin identitas saya sebagai ANONIM, yang tidak dapat dilihat oleh Terlapor dan publik</label></div>`;
            wrapperClass = 'md:col-span-2';
        } else if (fieldLower.includes('rahasia')) {
            fieldInputHtml = `<div class="flex items-center mt-2"><input type="checkbox" id="${fieldId}" name="${field}" class="h-4 w-4 text-green-800 border-gray-300 rounded focus:ring-green-800" /><label for="${fieldId}" class="ml-2 text-sm text-gray-600">Saya ingin Isi Laporan Saya menjadi Rahasia oleh Publik</label></div>`;
            wrapperClass = 'md:col-span-2';
        } else {
            let inputElement = '';
            if (fieldLower.includes('jenis kelamin')) {
                inputElement = `<select id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm" required><option value="" disabled selected>-- Pilih --</option><option>Laki-laki</option><option>Perempuan</option></select>`;
            } else if (fieldLower.includes('email')) {
                inputElement = `<input type="email" id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />`;
            } else if (fieldLower.includes('telepon')) {
                inputElement = `<input type="number" id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />`;
            } else if (fieldLower.includes('jenis identitas')) {
                inputElement = `<select id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm" required><option value="" disabled selected>-- Pilih --</option><option>KTP</option><option>Visa</option><option>SIM</option></select>`;
            } else if (fieldLower.includes('satuan kerja') || fieldLower.includes('unit kerja')) {
                const optionsHtml = satuanKerjaOptions.map(opt => `<option>${opt}</option>`).join('');
                inputElement = `<select id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm" required><option value="" disabled selected>-- Pilih Satuan Kerja --</option>${optionsHtml}</select>`;
            } else if (fieldLower === 'jenis') {
                const optionsHtml = jenisAduanOptions.map(opt => `<option>${opt}</option>`).join('');
                inputElement = `<select id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm" required><option value="" disabled selected>-- Pilih Jenis Aduan --</option>${optionsHtml}</select>`;
            } else if (fieldLower.includes('isi laporan') || fieldLower.includes('harapan') || fieldLower.includes('topik')) {
                inputElement = `<textarea id="${fieldId}" name="${field}" rows="4" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" ${isRequired ? 'required' : ''}></textarea>`;
                wrapperClass += ' md:col-span-2';
            } else if (fieldLower.includes('file')) {
                inputElement = `<input type="file" id="${fieldId}" name="${field}" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100" />`;
                wrapperClass += ' md:col-span-2';
            } else {
                inputElement = `<input type="text" id="${fieldId}" name="${field}" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" ${isRequired ? 'required' : ''} />`;
            }
            fieldInputHtml = `<label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">${field}</label>${inputElement}`;
        }
        const fieldWrapperHtml = `<div class="${wrapperClass}">${fieldInputHtml}</div>`;
        if (fieldLower.includes('pelapor')) {
            pelaporHtml += fieldWrapperHtml;
        } else if (fieldLower.includes('terlapor')) {
            terlaporHtml += fieldWrapperHtml;
        } else {
            lainnyaHtml += fieldWrapperHtml;
        }
    });
    formHtml += `
      <div class="mb-4">
          <label class="flex items-center cursor-pointer">
              <input type="checkbox" id="lapor-terlapor-checkbox" class="h-4 w-4 text-green-800 border-gray-300 rounded focus:ring-green-800" />
              <span class="ml-3 text-sm font-medium text-gray-800">Saya ingin melaporkan Terlapor</span>
          </label>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <div>
              <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Pelapor</h3>
              ${pelaporHtml}
          </div>
          <div id="terlapor-section">
              <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Terlapor</h3>
              ${terlaporHtml}
          </div>
      </div>
      <div class="mt-4">
          <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Lainnya</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
              ${lainnyaHtml}
          </div>
      </div>
  `;
    permohonanForm.innerHTML = formHtml;
    const laporCheckbox = document.getElementById('lapor-terlapor-checkbox');
    const terlaporSection = document.getElementById('terlapor-section');
    if (laporCheckbox && terlaporSection) {
        const terlaporInputs = terlaporSection.querySelectorAll('input, select, textarea');
        const updateTerlaporState = (shouldBeEnabled) => {
            terlaporSection.classList.toggle('section-disabled', !shouldBeEnabled);
            terlaporInputs.forEach(input => {
                input.disabled = !shouldBeEnabled;
                const inputName = input.name.toLowerCase();
                if (!inputName.includes('anonim') && !inputName.includes('rahasia')) {
                    input.required = shouldBeEnabled;
                }
            });
        };
        updateTerlaporState(false);
        laporCheckbox.addEventListener('change', (e) => {
            updateTerlaporState(e.target.checked);
        });
    }
}


/**
 * Renders a generic form for services without custom layouts.
 * @param {HTMLElement} permohonanForm - The form element to populate.
 * @param {string[]} allFields - Array of field names from the sheet configuration.
 * @param {string} pengolah - The processing unit.
 * @param {string} layananName - The name of the service.
 */
function renderGenericForm(permohonanForm, allFields, pengolah, layananName) {
    let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
    formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;

    let fieldsContainerHtml = '';
    allFields.forEach(field => {
        const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
        const isRequired = !['email', 'telepon'].includes(field.toLowerCase().trim());
        fieldsContainerHtml += `
            <div class="mb-4">
                <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">${field}</label>
                <input type="text" id="${fieldId}" name="${field}" ${isRequired ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
        `;
    });
    formHtml += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">${fieldsContainerHtml}</div>`;
    permohonanForm.innerHTML = formHtml;
}

