// Data semester ditempatkan di frontend untuk keandalan
const DATA_SEMESTER = [
    'I (Satu)', 'II (Dua)', 'III (Tiga)', 'IV (Empat)', 'V (Lima)',
    'VI (Enam)', 'VII (Tujuh)', 'VIII (Delapan)', 'IX (Sembilan)', 'X (Sepuluh)',
    'XI (Sebelas)', 'XII (Dua Belas)', 'XIII (Tiga Belas)', 'XIV (Empat Belas)'
];

function renderSuketLulusForm(allFields, layananName) {
    let formHtml = `<input type="hidden" name="Pengolah" value="LA" />`;
    formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
    let fieldsHtml = '';

    const prodiOptions = DATA_AKADEMIK.map(item => `<option value="${item.prodi}">${item.prodi}</option>`).join('');

    allFields.forEach(field => {
        const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
        const fieldLower = field.toLowerCase().trim();

        if (fieldLower === 'unit kerja layanan') return;

        let isRequired = !['email', 'telepon'].includes(fieldLower);
        let inputHtml = '';
        let wrapperClass = 'mb-4';
        let fieldLabel = field;
        if (isRequired) {
            fieldLabel += ` <span class="text-red-500">*</span>`;
        }

        switch (fieldLower) {
            case 'prodi':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih Prodi --</option>
                                ${prodiOptions}
                            </select>`;
                break;
            case 'fakultas':
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" readonly class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />`;
                break;
            case 'jenis kelamin':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih --</option>
                                <option value="Laki-laki">Laki-laki</option>
                                <option value="Perempuan">Perempuan</option>
                            </select>`;
                break;
            case 'tempat lahir':
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                            <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TEMPAT LAHIR. CONTOH: Watampone, Bone, Kel. Macege, dll</p>`;
                break;
            case 'tanggal lahir':
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: 20 September 2000" />
                            <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TANGGAL LAHIR. CONTOH: 20 September 2000, 1 Oktober 1999, dll</p>`;
                break;
            case 'alamat':
                inputHtml = `<textarea id="${fieldId}" name="${field}" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                            <p class="text-xs text-gray-500 mt-1">DIISI SESUAI DENGAN ALAMAT PADA KTP</p>`;
                wrapperClass += ' md:col-span-2';
                break;
            default:
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" ${isRequired ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />`;
                break;
        }
        fieldsHtml += `
            <div class="${wrapperClass}">
                <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">${fieldLabel}</label>
                ${inputHtml}
            </div>`;
    });

    fieldsHtml += `
        <div class="mb-4">
            <label for="form-input-Tanggal-Yudisium-Lulus" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Yudisium Lulus <span class="text-red-500">*</span></label>
            <input type="text" id="form-input-Tanggal-Yudisium-Lulus" name="Tanggal Yudisium Lulus" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            <p class="text-xs text-gray-500 mt-1">Contoh : 12 Agustus 2025</p>
        </div>
        <div class="mb-4">
            <label for="form-input-Predikat-Yudisium-Lulus" class="block text-sm font-medium text-gray-700 mb-1">Predikat Yudisium Lulus <span class="text-red-500">*</span></label>
            <select id="form-input-Predikat-Yudisium-Lulus" name="Predikat Yudisium Lulus" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="" disabled selected>-- Pilih Predikat --</option>
                <option value="SANGAT MEMUASKAN">SANGAT MEMUASKAN</option>
                <option value="MEMUASKAN">MEMUaskan</option>
                <option value="CUMLAUDE">CUMLAUDE</option>
                <option value="CUKUP">CUKUP</option>
            </select>
        </div>
        <div class="mb-4 md:col-span-2">
            <label for="form-input-PIN-Ijazah" class="block text-sm font-medium text-gray-700 mb-1">PIN Ijazah <span class="text-red-500">*</span></label>
            <input type="number" id="form-input-PIN-Ijazah" name="PIN Ijazah" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
        </div>
    `;

    formHtml += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">${fieldsHtml}</div>`;
    permohonanForm.innerHTML = formHtml;

    const prodiSelect = permohonanForm.querySelector('[name="Prodi"]');
    const fakultasInput = permohonanForm.querySelector('[name="Fakultas"]');

    if (prodiSelect && fakultasInput) {
        prodiSelect.addEventListener('change', function() {
            const selectedProdi = this.value;
            const match = DATA_AKADEMIK.find(item => item.prodi === selectedProdi);
            if (match) {
                fakultasInput.value = match.fakultas;
            }
        });
    }
}

function renderLacakSkSeForm(allFields, pengolah, layananName) {
    let formHtml = `
        <input type="hidden" name="Pengolah" value="${pengolah}" />
        <input type="hidden" name="Jenis Layanan" value="${layananName}" />
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">
            <div class="mb-4">
                <label for="form-input-Unit-Kerja" class="block text-sm font-medium text-gray-700 mb-1">Unit Kerja <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Unit-Kerja" name="Unit Kerja" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="mb-4">
                <label for="form-input-Perihal" class="block text-sm font-medium text-gray-700 mb-1">Perihal <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Perihal" name="Perihal" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <p class="text-xs text-gray-500 mt-1">Isi Draft Ringkasan Judul SK</p>
            </div>
             <div class="mb-4 md:col-span-2">
                <label for="form-input-Jenis" class="block text-sm font-medium text-gray-700 mb-1">Jenis <span class="text-red-500">*</span></label>
                <select id="form-input-Jenis" name="Jenis" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                    <option value="" disabled selected>-- Pilih Jenis Naskah --</option>
                    <option value="Umum">Umum</option>
                    <option value="Akademik">Akademik</option>
                    <option value="Kemahasiswaan">Kemahasiswaan</option>
                </select>
                <div class="text-xs text-gray-500 mt-2 p-2 bg-gray-50 rounded-md">
                    <p><strong class="text-gray-700">Umum:</strong> Naskah non Akademik dan Kemahasiswaan</p>
                    <p><strong class="text-gray-700">Akademik:</strong> Naskah terkait proses Perkuliahaan Akademik</p>
                    <p><strong class="text-gray-700">Kemahasiswaan:</strong> Naskah yang terkait Kegiatan Kemahasiswaan</p>
                </div>
            </div>
            <div class="mb-4">
                <label for="form-input-Email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="form-input-Email" name="Email" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <p class="text-xs text-gray-500 mt-1">Opsional, tidak wajib diisi.</p>
            </div>
            <div class="mb-4">
                <label for="form-input-Telepon" class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="number" id="form-input-Telepon" name="Telepon" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <p class="text-xs text-gray-500 mt-1">Opsional, tidak wajib diisi.</p>
            </div>
        </div>
    `;
    permohonanForm.innerHTML = formHtml;
}

function renderSuketKuliahForm(allFields, pengolah, layananName) {
    let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
    formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
    let fieldsHtml = '';

    const unitKerjaOptions = UNIT_KERJA_LAYANAN.map(unit => `<option value="${unit}">${unit}</option>`).join('');

    fieldsHtml += `
        <div class="mb-4 md:col-span-2">
            <label for="unit-kerja-layanan" class="block text-sm font-medium text-gray-700 mb-1">Unit Kerja Layanan <span class="text-red-500">*</span></label>
            <select id="unit-kerja-layanan" name="Unit Kerja Layanan" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="" disabled selected>-- Pilih Unit Kerja --</option>
                ${unitKerjaOptions}
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
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: 20 September 2000" />
                            <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TANGGAL LAHIR. CONTOH: 20 September 2000, 1 Oktober 1999, dll</p>`;
                break;
            case 'alamat':
                inputHtml = `<textarea id="${fieldId}" name="${field}" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                            <p class="text-xs text-gray-500 mt-1">DIISI SESUAI DENGAN ALAMAT PADA KTP</p>`;
                wrapperClass += ' md:col-span-2';
                break;
            case 'semester':
                const semesterOptions = DATA_SEMESTER.map(o => `<option value="${o}">${o}</option>`).join('');
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih --</option>
                                ${semesterOptions}
                            </select>`;
                break;
            case 'jenis kelamin':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih --</option>
                                <option>Laki-laki</option><option>Perempuan</option>
                            </select>`;
                break;
            case 'prodi':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm" disabled>
                                <option value="" disabled selected>-- Pilih Unit Kerja dulu --</option>
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

    const unitKerjaSelect = permohonanForm.querySelector('#unit-kerja-layanan');
    const prodiSelect = permohonanForm.querySelector('[name="Prodi"]');
    const fakultasInput = permohonanForm.querySelector('[name="Fakultas"]');

    unitKerjaSelect.addEventListener('change', function() {
        const selectedUnit = this.value;
        const isRektorat = selectedUnit === 'Rektorat';

        const orangTuaFields = permohonanForm.querySelectorAll('[data-group="orang-tua"]');
        orangTuaFields.forEach(field => {
            field.style.display = isRektorat ? 'block' : 'none';
            const input = field.querySelector('input, select, textarea');
            if (input) {
                input.required = isRektorat;
            }
        });

        prodiSelect.innerHTML = '<option value="" disabled selected>-- Pilih Prodi --</option>';
        fakultasInput.value = '';

        let prodisToShow = [];

        if (isRektorat) {
            prodisToShow = DATA_AKADEMIK;
        } else if (selectedUnit) {
            prodisToShow = DATA_AKADEMIK.filter(item => item.fakultas === selectedUnit);
        }

        prodisToShow.forEach(item => {
            prodiSelect.innerHTML += `<option value="${item.prodi}">${item.prodi}</option>`;
        });

        if (selectedUnit) {
            prodiSelect.disabled = false;
        } else {
            prodiSelect.innerHTML = '<option value="" disabled selected>-- Pilih Unit Kerja dulu --</option>';
            prodiSelect.disabled = true;
        }
    });

    prodiSelect.addEventListener('change', function() {
        const selectedProdi = this.value;
        const match = DATA_AKADEMIK.find(item => item.prodi === selectedProdi);
        if (match) {
            fakultasInput.value = match.fakultas;
        } else {
            fakultasInput.value = '';
        }
    });

    unitKerjaSelect.dispatchEvent(new Event('change'));
}


function renderPeminjamanForm(allFields, pengolah, layananName) {
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
                <option value="Peminjaman Tempat">Peminjaman Tempat</option>
                <option value="Peminjaman Kendaraan">Peminjaman Kendaraan</option>
                <option value="Peminjaman Barang">Peminjaman Barang</option>
            </select>
        </div>
    `;

    allFields.forEach(field => {
        if (['jenis layanan', 'waktu', 'jenis'].includes(field.toLowerCase().trim())) {
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

    fieldsContainerHtml += `
        <div class="mb-4">
            <label for="form-input-waktu" class="block text-sm font-medium text-gray-700 mb-1">Waktu</label>
            <input type="text" id="form-input-waktu" name="Waktu" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            <p class="text-xs text-gray-500 mt-1">Waktu Peminjaman (Pilihan). Kolom ini tidak wajib diisi</p>
        </div>

        <div class="mb-4" id="jenis-barang-container" style="display: none;">
            <label for="form-input-jenis" class="block text-sm font-medium text-gray-700 mb-1">Jenis <span class="text-red-500">*</span></label>
            <input type="text" id="form-input-jenis" name="Jenis" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            <p class="text-xs text-gray-500 mt-1">Tambahkan Jenis yang dipinjam</p>
        </div>
    `;

    formHtml += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">${fieldsContainerHtml}</div>`
    permohonanForm.innerHTML = formHtml;

    const jenisLayananSelect = permohonanForm.querySelector('#jenis-layanan-peminjaman');
    const jenisBarangContainer = permohonanForm.querySelector('#jenis-barang-container');
    const jenisBarangInput = permohonanForm.querySelector('#form-input-jenis');

    if (jenisLayananSelect && jenisBarangContainer && jenisBarangInput) {
        jenisLayananSelect.addEventListener('change', function() {
            if (this.value === 'Peminjaman Barang') {
                jenisBarangContainer.style.display = 'block';
                jenisBarangInput.required = true;
            } else {
                jenisBarangContainer.style.display = 'none';
                jenisBarangInput.required = false;
                jenisBarangInput.value = '';
            }
        });
    }
}

function renderPengaduanForm(allFields, pengolah, layananName) {
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

    const isPengaduanLayanan = layananName.toLowerCase().includes('layanan');

    formHtml += `
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Pelapor</h3>
                ${pelaporHtml}
            </div>
            ${!isPengaduanLayanan ? `
            <div id="terlapor-section">
                <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Terlapor</h3>
                ${terlaporHtml}
            </div>` : ''}
        </div>
        ${!isPengaduanLayanan ? `
        <div class="mb-4">
            <label class="flex items-center cursor-pointer">
                <input type="checkbox" id="lapor-terlapor-checkbox" class="h-4 w-4 text-green-800 border-gray-300 rounded focus:ring-green-800" />
                <span class="ml-3 text-sm font-medium text-gray-800">Saya ingin melaporkan Terlapor</span>
            </label>
        </div>` : ''}
        <div class="mt-4">
            <h3 class="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Informasi Lainnya</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6">
                ${lainnyaHtml}
            </div>
        </div>
    `;
    permohonanForm.innerHTML = formHtml;

    if (!isPengaduanLayanan) {
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
}

function renderBebasBeasiswaForm(allFields, layananName) {
    let formHtml = `<input type="hidden" name="Pengolah" value="LA" />`;
    formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
    let fieldsHtml = '';

    const prodiOptions = DATA_AKADEMIK.map(item => `<option value="${item.prodi}">${item.prodi}</option>`).join('');
    const semesterOptions = DATA_SEMESTER.map(o => `<option value="${o}">${o}</option>`).join('');

    allFields.forEach(field => {
        const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
        const fieldLower = field.toLowerCase().trim();

        let isRequired = !['email', 'telepon'].includes(fieldLower);
        let inputHtml = '';
        let wrapperClass = 'mb-4';
        let fieldLabel = field;
        if (isRequired) {
            fieldLabel += ` <span class="text-red-500">*</span>`;
        }

        switch (fieldLower) {
            case 'prodi':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih Prodi --</option>
                                ${prodiOptions}
                            </select>`;
                break;
            case 'fakultas':
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" readonly class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />`;
                break;
            case 'semester':
                inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                <option value="" disabled selected>-- Pilih Semester --</option>
                                ${semesterOptions}
                            </select>`;
                break;

                // TAMBAHKAN BAGIAN INI
    case 'jenis kelamin':
        inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                        <option value="" disabled selected>-- Pilih --</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                    </select>`;
        break;
                
            default:
                inputHtml = `<input type="text" id="${fieldId}" name="${field}" ${isRequired ? 'required' : ''} class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />`;
                break;
        }
        fieldsHtml += `
            <div class="${wrapperClass}">
                <label for="${fieldId}" class="block text-sm font-medium text-gray-700 mb-1">${fieldLabel}</label>
                ${inputHtml}
            </div>`;
    });

    formHtml += `<div class="grid grid-cols-1 md:grid-cols-2 gap-x-4">${fieldsHtml}</div>`;
    permohonanForm.innerHTML = formHtml;

    // Event listener untuk auto-fill Fakultas berdasarkan Prodi
    const prodiSelect = permohonanForm.querySelector('[name="Prodi"]');
    const fakultasInput = permohonanForm.querySelector('[name="Fakultas"]');

    if (prodiSelect && fakultasInput) {
        prodiSelect.addEventListener('change', function() {
            const selectedProdi = this.value;
            const match = DATA_AKADEMIK.find(item => item.prodi === selectedProdi);
            if (match) {
                fakultasInput.value = match.fakultas;
            } else {
                fakultasInput.value = '';
            }
        });
    }
}

// FUNGSI RENDER SUKET ALUMNI (DIMODIFIKASI SECARA EKSTENSIF)
function renderSuketAlumniForm(allFields, layananName) {
    permohonanForm.innerHTML = `
        <input type="hidden" name="Pengolah" value="LA" />
        <input type="hidden" name="Jenis Layanan" value="${layananName}" />
        
        <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <label for="lulusan-select" class="block text-sm font-medium text-gray-700 mb-1">
                Lulusan <span class="text-red-500">*</span>
            </label>
            <select id="lulusan-select" name="Lulusan" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                <option value="" disabled selected>-- Pilih Institusi Kelulusan --</option>
                <option value="Sekolah Tinggi Agama Islam Negeri (STAIN) Watampone">Sekolah Tinggi Agama Islam Negeri (STAIN) Watampone</option>
                <option value="Institut Agama Islam Negeri (IAIN) Bone">Institut Agama Islam Negeri (IAIN) Bone</option>
            </select>
        </div>

        <div id="form-fields-grid" class="grid grid-cols-1 md:grid-cols-2 gap-x-4"></div>
    `;

    const formFieldsGrid = permohonanForm.querySelector('#form-fields-grid');
    const lulusanSelect = permohonanForm.querySelector('#lulusan-select');

    // --- Helper Functions untuk Render Dinamis ---
    const renderIainFields = () => {
        const prodiOptions = DATA_AKADEMIK.map(item => `<option value="${item.prodi}">${item.prodi}</option>`).join('');
        return `
            <div class="mb-4">
                <label for="form-input-Prodi" class="block text-sm font-medium text-gray-700 mb-1">Prodi <span class="text-red-500">*</span></label>
                <select id="form-input-Prodi" name="Prodi" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                    <option value="" disabled selected>-- Pilih Prodi --</option>
                    ${prodiOptions}
                </select>
            </div>
            <div class="mb-4">
                <label for="form-input-Fakultas" class="block text-sm font-medium text-gray-700 mb-1">Fakultas <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Fakultas" name="Fakultas" readonly class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-gray-100" />
            </div>
        `;
    };

    const renderStainFields = () => {
        return `
            <div class="mb-4">
                <label for="form-input-Prodi" class="block text-sm font-medium text-gray-700 mb-1">Prodi <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Prodi" name="Prodi" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <p class="text-xs text-gray-500 mt-1">CANTUMKAN TULISAN PROGRAM STUDI DI DEPAN NAMA PRODI YBS.<br>Contoh: Program Studi Pendidikan Agama Islam</p>
            </div>
            <div class="mb-4">
                <label for="form-input-Fakultas" class="block text-sm font-medium text-gray-700 mb-1">FAKULTAS / JURUSAN <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Fakultas" name="Fakultas" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                 <p class="text-xs text-gray-500 mt-1">CANTUMKAN TULISAN FAKULTAS / JURUSAN DI DEPAN NAMA FAKULTAS / JURUSAN YBS.<br>Contoh: Fakultas Syariah / Jurusan Syariah</p>
            </div>
        `;
    };

    // --- Event Listener Utama ---
    const handleLulusanChange = () => {
        const selectedValue = lulusanSelect.value;
        let dynamicFieldsHtml = '';
        
        if (selectedValue === 'IAIN') {
            dynamicFieldsHtml = renderIainFields();
        } else if (selectedValue === 'STAIN') {
            dynamicFieldsHtml = renderStainFields();
        }

        formFieldsGrid.innerHTML = `
            <div class="mb-4">
                <label for="form-input-Nama" class="block text-sm font-medium text-gray-700 mb-1">Nama <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Nama" name="Nama" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <p class="text-xs text-gray-500 mt-1">ISIKAN DENGAN HURUF KAPITAL CONTOH: ASRUL</p>
            </div>
            <div class="mb-4">
                <label for="form-input-NIM" class="block text-sm font-medium text-gray-700 mb-1">NIM <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-NIM" name="NIM" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="mb-4">
                <label for="form-input-Tempat-Lahir" class="block text-sm font-medium text-gray-700 mb-1">Tempat Lahir <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Tempat-Lahir" name="Tempat Lahir" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
                <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TEMPAT LAHIR. CONTOH: Watampone, Bone, Kel. Macege, dll</p>
            </div>
            <div class="mb-4">
                <label for="form-input-Tanggal-Lahir" class="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Tanggal-Lahir" name="Tanggal Lahir" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: 20 September 2000" />
                <p class="text-xs text-gray-500 mt-1">DIISI SESUAI TANGGAL LAHIR. CONTOH: 20 September 2000, 1 Oktober 1999, dll</p>
            </div>
            <div class="mb-4 md:col-span-2">
                <label for="form-input-Alamat" class="block text-sm font-medium text-gray-700 mb-1">Alamat <span class="text-red-500">*</span></label>
                <textarea id="form-input-Alamat" name="Alamat" required rows="3" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm"></textarea>
                <p class="text-xs text-gray-500 mt-1">Isikan Huruf Kapital pada setiap kata Contoh: Jl. S. Musi Watampone, Kab. Bone, Sulawesi Selatan</p>
            </div>
            ${dynamicFieldsHtml}
            <div class="mb-4">
                <label for="form-input-Tahun-Masuk" class="block text-sm font-medium text-gray-700 mb-1">Tahun Masuk <span class="text-red-500">*</span></label>
                <input type="number" id="form-input-Tahun-Masuk" name="Tahun Masuk" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: 2020" min="1900" max="2100" />
            </div>
            <div class="mb-4">
                <label for="form-input-Tahun-Lulus" class="block text-sm font-medium text-gray-700 mb-1">Tahun Lulus <span class="text-red-500">*</span></label>
                <input type="number" id="form-input-Tahun-Lulus" name="Tahun Lulus" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Contoh: 2024" min="1900" max="2100" />
            </div>
            <div class="mb-4">
                <label for="form-input-Nomor-Ijazah" class="block text-sm font-medium text-gray-700 mb-1">Nomor Ijazah <span class="text-red-500">*</span></label>
                <input type="text" id="form-input-Nomor-Ijazah" name="Nomor Ijazah" required class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="mb-4">
                <label for="form-input-Jenis-Kelamin" class="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin <span class="text-red-500">*</span></label>
                <select id="form-input-Jenis-Kelamin" name="Jenis Kelamin" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                    <option value="" disabled selected>-- Pilih --</option>
                    <option>Laki-laki</option>
                    <option>Perempuan</option>
                </select>
            </div>
             <div class="mb-4">
                <label for="form-input-Email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="form-input-Email" name="Email" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div class="mb-4">
                <label for="form-input-Telepon" class="block text-sm font-medium text-gray-700 mb-1">Telepon</label>
                <input type="text" id="form-input-Telepon" name="Telepon" class="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
        `;

        // PERBAIKAN: Pindahkan event listener ke sini, setelah HTML di-render
        if (selectedValue === 'IAIN') {
            const prodiSelect = permohonanForm.querySelector('[name="Prodi"]');
            const fakultasInput = permohonanForm.querySelector('[name="Fakultas"]');
            if (prodiSelect && fakultasInput) {
                prodiSelect.addEventListener('change', function() {
                    const selectedProdi = this.value;
                    const match = DATA_AKADEMIK.find(item => item.prodi === selectedProdi);
                    fakultasInput.value = match ? match.fakultas : '';
                });
            }
        }
    };

    lulusanSelect.addEventListener('change', handleLulusanChange);
    handleLulusanChange(); // Panggil sekali untuk inisialisasi
}


function renderGenericForm(allFields, pengolah, layananName) {
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

