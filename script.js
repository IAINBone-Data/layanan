// PENTING: Ganti URL di bawah ini dengan URL Web App BARU dari Google Apps Script Anda
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbxP_lhf2hL1OM6l4bCsJ0jfxbCzoT37fX79iMwVQ0W8i4nVv4IkVZXlohiNmFh16gZstw/exec';

// --- BARU: Data store lokal untuk informasi akademik ---
// Ini menggantikan panggilan fetch ke Google Sheet, membuat form lebih cepat.
const DATA_AKADEMIK = [
    { prodi: 'Hukum Keluarga Islam', fakultas: 'Fakultas Syariah dan Hukum Islam' },
    { prodi: 'Hukum Tatanegara', fakultas: 'Fakultas Syariah dan Hukum Islam' },
    { prodi: 'Hukum Ekonomi Syariah', fakultas: 'Fakultas Syariah dan Hukum Islam' },
    { prodi: 'Pendidikan Agama Islam', fakultas: 'Fakultas Tarbiyah' },
    { prodi: 'Pendidikan Bahasa Arab', fakultas: 'Fakultas Tarbiyah' },
    { prodi: 'Tadris Bahasa Inggris', fakultas: 'Fakultas Tarbiyah' },
    { prodi: 'Manajemen Pendidikan Islam', fakultas: 'Fakultas Tarbiyah' },
    { prodi: 'Pendidikan Guru Madrasah Ibtidaiyah', fakultas: 'Fakultas Tarbiyah' },
    { prodi: 'Pendidikan Islam Anak Usia Dini', fakultas: 'Fakultas Tarbiyah' },
    { prodi: 'S3 Pendidikan Agama Islam', fakultas: 'Pascasarjana' },
    { prodi: 'S2 Pendidikan Agama Islam', fakultas: 'Pascasarjana' },
    { prodi: 'S2 Pendidikan Bahasa Arab', fakultas: 'Pascasarjana' },
    { prodi: 'S2 Ekonomi Syariah', fakultas: 'Pascasarjana' },
    { prodi: 'S2 Hukum Keluarga Islam', fakultas: 'Pascasarjana' },
    { prodi: 'S2 Hukum Tatanegara', fakultas: 'Pascasarjana' },
    { prodi: 'Ilmu Al-Qur\'an Dan Tafsir', fakultas: 'Fakultas Ushuluddin dan Dakwah' },
    { prodi: 'Komunikasi Dan Penyiaran Islam', fakultas: 'Fakultas Ushuluddin dan Dakwah' },
    { prodi: 'Bimbingan Penyuluhan Islam', fakultas: 'Fakultas Ushuluddin dan Dakwah' },
    { prodi: 'Ekonomi Syariah', fakultas: 'Fakultas Ekonomi dan Bisnis Islam' },
    { prodi: 'Perbankan Syariah', fakultas: 'Fakultas Ekonomi dan Bisnis Islam' },
    { prodi: 'Akuntansi Syariah', fakultas: 'Fakultas Ekonomi dan Bisnis Islam' },
    { prodi: 'Manajemen Bisnis Syariah', fakultas: 'Fakultas Ekonomi dan Bisnis Islam' }
];

const UNIT_KERJA_LAYANAN = [
    'Rektorat',
    'Fakultas Syariah dan Hukum Islam',
    'Fakultas Tarbiyah',
    'Fakultas Ekonomi dan Bisnis Islam',
    'Fakultas Ushuluddin dan Dakwah',
    'Pascasarjana'
];
// --- AKHIR DARI DATA BARU ---


document.addEventListener('DOMContentLoaded', function() {

    function showNotificationModal(title, message, type = 'info') {
        const modal = document.getElementById('notificationModal');
        const iconContainer = document.getElementById('notificationIcon');
        const titleEl = document.getElementById('notificationTitle');
        const messageEl = document.getElementById('notificationMessage');
        const closeBtn = document.getElementById('closeNotificationBtn');
        if (!modal) return;
        const hideModal = () => {
            modal.classList.remove('visible');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };
        titleEl.textContent = title;
        messageEl.innerHTML = message;
        iconContainer.className = 'mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full text-4xl';
        if (type === 'success') {
            iconContainer.classList.add('bg-green-100', 'text-green-600');
            iconContainer.innerHTML = `<i class="fas fa-check-circle"></i>`;
        } else if (type === 'error') {
            iconContainer.classList.add('bg-red-100', 'text-red-600');
            iconContainer.innerHTML = `<i class="fas fa-times-circle"></i>`;
        } else {
            iconContainer.classList.add('bg-blue-100', 'text-blue-600');
            iconContainer.innerHTML = `<i class="fas fa-info-circle"></i>`;
        }
        iconContainer.style.display = (type === 'custom') ? 'none' : 'flex';
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.add('visible');
        }, 10);
        closeBtn.onclick = hideModal;
        // DIHAPUS: Menonaktifkan fitur tutup modal saat klik di luar area notifikasi
        // modal.onclick = (e) => {
        //     if (e.target === modal) {
        //         hideModal();
        //     }
        // };

        // BARU: Logika untuk tombol "Copy ID"
        const copyBtn = document.getElementById('copy-id-btn');
        const copyTarget = document.getElementById('copy-target-id');

        if (copyBtn && copyTarget) {
            copyBtn.onclick = () => {
                const textToCopy = copyTarget.innerText;
                const textArea = document.createElement('textarea');
                textArea.value = textToCopy;
                textArea.style.position = 'absolute';
                textArea.style.left = '-9999px';
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    copyBtn.textContent = 'Tersalin!';
                    copyBtn.classList.add('bg-green-200');
                    setTimeout(() => {
                        copyBtn.textContent = 'Copy ID';
                        copyBtn.classList.remove('bg-green-200');
                    }, 2000);
                } catch (err) {
                    console.error('Gagal menyalin ID:', err);
                    copyBtn.textContent = 'Gagal';
                }
                document.body.removeChild(textArea);
            };
        }
    }

    const skeletonLoader = document.getElementById('skeleton-loader');
    const realContent = document.getElementById('real-content');
    const layananTabsContainer = document.getElementById('layanan-tabs-container');
    const layananContentContainer = document.getElementById('layanan-content-container');
    const trackingForm = document.getElementById('trackingForm');
    const trackingResult = document.getElementById('trackingResult');
    const trackingLayananSelect = document.getElementById('trackingLayananSelect');
    const infoContainer = document.getElementById('infoContainer');
    const pinnedContainer = document.getElementById('pinnedContainer');
    const quicklinkContainer = document.getElementById('quicklinkContainer');
    const footerLinkContainer = document.getElementById('footerLinkContainer');
    const userTypeToggleContainer = document.getElementById('userTypeToggleContainer');
    const formModal = document.getElementById('formModal');
    const modalTitle = document.getElementById('modalTitle');
    const permohonanForm = document.getElementById('permohonanForm');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const calendarModal = document.getElementById('calendarModal');
    const closeCalendarModalBtn = document.getElementById('closeCalendarModalBtn');
    const calendarEl = document.getElementById('calendar');
    const calendarLoader = document.getElementById('calendarLoader');
    let calendar;
    const searchModal = document.getElementById('searchModal');
    const closeSearchModalBtn = document.getElementById('closeSearchModalBtn');
    const helpdeskModal = document.getElementById('helpdeskModal');
    const closeHelpdeskModalBtn = document.getElementById('closeHelpdeskModalBtn');
    const quickServicesModal = document.getElementById('quickServicesModal');
    const closeQuickServicesModalBtn = document.getElementById('closeQuickServicesModalBtn');
    const helpdeskForm = document.getElementById('helpdeskForm');
    const mobileTrackingForm = document.getElementById('mobileTrackingForm');
    const fabHelpdeskBtn = document.getElementById('fabHelpdeskBtn');

    let semuaLayanan = [];
    let currentUserType = 'Umum';
    let calendarDataCache = {}; // Cache global untuk data kalender
    // DIHAPUS: Cache untuk prodi/fakultas tidak lagi diperlukan karena data sekarang lokal.
    // let prodiFakultasDataCache = null; 


    loadAllPublicData();
    setupEventListeners();

    function setupEventListeners() {
        if (trackingForm) trackingForm.addEventListener('submit', handleTracking);
        if (mobileTrackingForm) mobileTrackingForm.addEventListener('submit', handleMobileTracking);
        const modalClosers = [
            { btn: closeModalBtn, modal: formModal }, { btn: cancelModalBtn, modal: formModal },
            { btn: closeSearchModalBtn, modal: searchModal }, { btn: closeHelpdeskModalBtn, modal: helpdeskModal },
            { btn: closeQuickServicesModalBtn, modal: quickServicesModal }, { btn: closeCalendarModalBtn, modal: calendarModal }
        ];
        modalClosers.forEach(item => {
            if (item && item.btn) item.btn.addEventListener('click', () => item.modal.classList.add('hidden'));
        });

        // DIHAPUS: Menonaktifkan fitur tutup modal saat klik di luar area form
        /*
        const modals = [formModal, searchModal, helpdeskModal, quickServicesModal, calendarModal];
        modals.forEach(modal => {
            if (modal) modal.addEventListener('click', (e) => e.target === modal && modal.classList.add('hidden'));
        });
        */

        if (permohonanForm) permohonanForm.addEventListener('submit', handlePermohonanSubmit);
        if (helpdeskForm) helpdeskForm.addEventListener('submit', handleHelpdeskSubmit);
        if (trackingResult) trackingResult.addEventListener('click', handleCloseTrackResult);
        if (userTypeToggleContainer) userTypeToggleContainer.addEventListener('click', toggleUserType);
        if (fabHelpdeskBtn) fabHelpdeskBtn.addEventListener('click', () => helpdeskModal.classList.remove('hidden'));
        
        function handleLinkClick(event) {
            const link = event.target.closest('a');
            if (link && link.href) {
                const textElement = link.querySelector('p');
                const itemName = `Klik: ${ (textElement) ? textElement.textContent.trim() : link.dataset.itemName}`;
                if (itemName) {
                    fetch(GAS_WEB_APP_URL + '?action=recordClick&itemName=' + encodeURIComponent(itemName));
                }
            }
        }
        [infoContainer, pinnedContainer, quicklinkContainer, footerLinkContainer].forEach(container => {
            if (container) container.addEventListener('click', handleLinkClick);
        });
        const navHome = document.getElementById('navHome');
        const navSearch = document.getElementById('navSearch');
        const navServices = document.getElementById('navServices');
        const navHelp = document.getElementById('navHelp');
        if (navHome) navHome.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        if (navSearch) navSearch.addEventListener('click', () => searchModal.classList.remove('hidden'));
        if (navServices) navServices.addEventListener('click', () => quickServicesModal.classList.remove('hidden'));
        if (navHelp) navHelp.addEventListener('click', () => helpdeskModal.classList.remove('hidden'));
    }

    function handleCloseTrackResult(e) {
        if (e.target.closest('.js-close-track-result')) {
            trackingResult.innerHTML = '';
            document.getElementById('permohonanId').value = '';
            trackingLayananSelect.selectedIndex = 0;
        }
    }

    function prefetchCalendarData(layananList) {
        const calendarServices = layananList.filter(l => (getValueCaseInsensitive(l, 'jenis') || '').toLowerCase() === 'kalender');

        calendarServices.forEach(service => {
            const sheet = getValueCaseInsensitive(service, 'sheet');
            const sheetId = getValueCaseInsensitive(service, 'Sheet ID') || '';
            if (sheet) {
                const cacheKey = `${sheet}-${sheetId}`;
                if (!calendarDataCache[cacheKey]) {
                    console.log(`Prefetching calendar data for: ${sheet}`);
                    fetch(`${GAS_WEB_APP_URL}?action=getCalendarEvents&sheetName=${encodeURIComponent(sheet)}&sheetId=${encodeURIComponent(sheetId)}`)
                        .then(res => res.json())
                        .then(events => {
                            calendarDataCache[cacheKey] = Array.isArray(events) ? events : [];
                            console.log(`Cache updated for: ${sheet}`);
                        })
                        .catch(err => console.error(`Failed to prefetch calendar data for ${sheet}:`, err));
                }
            }
        });
    }

    function loadAllPublicData() {
        const CACHE_KEY = 'allPublicDataCache';
        const CACHE_DURATION_MS = 5 * 60 * 1000; // 5 menit

        const cachedItemStr = localStorage.getItem(CACHE_KEY);
        let isLoadedFromCache = false;
        if (cachedItemStr) {
            try {
                const cachedItem = JSON.parse(cachedItemStr);
                const isExpired = Date.now() - cachedItem.timestamp > CACHE_DURATION_MS;
                if (!isExpired) {
                    console.log("Memuat data dari cache...");
                    skeletonLoader.classList.add('hidden');
                    realContent.classList.remove('hidden');
                    onLayananSuccess(cachedItem.data.layanan || []);
                    onInfoSuccess(cachedItem.data.info || []);
                    isLoadedFromCache = true;
                }
            } catch (e) {
                localStorage.removeItem(CACHE_KEY);
            }
        }

        console.log("Mengambil data baru dari jaringan...");
        const layananPromise = fetch(GAS_WEB_APP_URL + '?action=getPublicLayanan').then(res => res.json());
        const infoPromise = fetch(GAS_WEB_APP_URL + '?action=getPublicInfo').then(res => res.json());

        Promise.allSettled([layananPromise, infoPromise])
            .then((results) => {
                const layananSuccess = results[0].status === 'fulfilled';
                const infoSuccess = results[1].status === 'fulfilled';

                if (layananSuccess && infoSuccess) {
                    const freshLayananData = results[0].value || [];
                    const freshInfoData = results[1].value || [];

                    if (!isLoadedFromCache) {
                        skeletonLoader.classList.add('hidden');
                        realContent.classList.remove('hidden');
                    }
                    onLayananSuccess(freshLayananData);
                    onInfoSuccess(freshInfoData);
                    const itemToCache = {
                        data: {
                            layanan: freshLayananData,
                            info: freshInfoData
                        },
                        timestamp: Date.now()
                    };
                    localStorage.setItem(CACHE_KEY, JSON.stringify(itemToCache));
                    console.log("Cache diperbarui.");
                } else {
                    if (!isLoadedFromCache) {
                        if (!layananSuccess) onLayananFailure(results[0].reason);
                        if (!infoSuccess) onInfoFailure(results[1].reason);
                    }
                }
            });
        fetch(GAS_WEB_APP_URL + '?action=recordVisit');
    }

    function getValueCaseInsensitive(object, key) {
        if (!object || !key) return undefined;
        const asLowercase = key.toLowerCase();
        const keyFound = Object.keys(object).find(k => k.toLowerCase().trim() === asLowercase);
        return object[keyFound];
    }

    function getTextColorForBg(hexColor) {
        if (!hexColor || hexColor.length < 4) return 'text-white';
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hexColor = hexColor.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hexColor);
        if (!result) return 'text-white';
        const r = parseInt(result[1], 16);
        const g = parseInt(result[2], 16);
        const b = parseInt(result[3], 16);
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b);
        return luminance > 150 ? 'text-gray-800' : 'text-white';
    }

    function getIconForLayanan(layanan) {
        const customIcon = getValueCaseInsensitive(layanan, 'icon');
        if (customIcon && customIcon.toString().trim() !== '') {
            return customIcon.toString().trim();
        }
        return 'concierge-bell';
    }

    function getFooterIcon(text) {
        const lowerText = text.toLowerCase();
        if (lowerText.includes('facebook')) return 'fab fa-facebook-f';
        if (lowerText.includes('instagram')) return 'fab fa-instagram';
        if (lowerText.includes('youtube')) return 'fab fa-youtube';
        if (lowerText.includes('tiktok')) return 'fab fa-tiktok';
        if (lowerText.includes('website')) return 'fas fa-globe';
        return 'fas fa-link';
    }

    function onLayananSuccess(data) {
        semuaLayanan = data || [];
        if (!semuaLayanan || semuaLayanan.length === 0) {
            layananTabsContainer.innerHTML = '';
            layananContentContainer.innerHTML = '<p class="text-gray-500 text-center p-4">Tidak ada layanan yang tersedia.</p>';
            return;
        }
        renderLayananByFilter(currentUserType);
        const mobileTrackingSelect = document.getElementById('mobileTrackingLayananSelect');
        trackingLayananSelect.innerHTML = '<option value="">Pilih Jenis Layanan</option>';
        if (mobileTrackingSelect) mobileTrackingSelect.innerHTML = '<option value="">Pilih Jenis Layanan</option>';

        const trackableLayanan = semuaLayanan.filter(layanan => (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase() !== 'setting');
        trackableLayanan.forEach(layanan => {
            const layananName = getValueCaseInsensitive(layanan, 'jenis layanan');
            const targetSheet = getValueCaseInsensitive(layanan, 'sheet');
            const targetSheetId = getValueCaseInsensitive(layanan, 'Sheet ID') || '';
            if (layananName && targetSheet) {
                const optionValue = JSON.stringify({ name: targetSheet, id: targetSheetId });
                const option = `<option value='${optionValue}'>${layananName}</option>`;
                trackingLayananSelect.innerHTML += option;
                if (mobileTrackingSelect) mobileTrackingSelect.innerHTML += option;
            }
        });
        renderQuickServicesModal();
        prefetchCalendarData(semuaLayanan);
    }

    function onLayananFailure(error) {
        console.error('Gagal memuat layanan:', error);
        layananContentContainer.innerHTML = '<p class="text-red-500 col-span-full p-4 text-center">Gagal memuat daftar layanan. Silakan muat ulang.</p>';
    }

    function onInfoSuccess(allData) {
        const infoItems = [],
            pinItems = [],
            linkItems = [],
            footerLinkItems = [];
        (allData || []).forEach(item => {
            const jenis = (getValueCaseInsensitive(item, 'jenis') || '').toLowerCase();
            if (jenis === 'info') infoItems.push(item);
            else if (jenis === 'pin') pinItems.push(item);
            else if (jenis === 'link') linkItems.push(item);
            else if (jenis === 'footer link') footerLinkItems.push(item);
        });
        const topWrapper = document.getElementById('top-content-wrapper');
        const topSectionTitle = document.getElementById('top-section-title');
        if (infoItems.length >= 1 && pinItems.length >= 1) {
            topWrapper.className = 'grid grid-cols-1 md:grid-cols-2 md:gap-8 items-start';
            topSectionTitle.classList.add('hidden');
        } else {
            topWrapper.className = '';
            topSectionTitle.classList.remove('hidden');
        }
        renderInfoSlider(infoItems);
        renderPinnedButtons(pinItems);
        renderQuickLinks(linkItems);
        renderFooterLinks(footerLinkItems);
    }

    function onInfoFailure(error) {
        console.error('Gagal memuat informasi:', error);
        document.getElementById('infoContainer').innerHTML = '';
        document.getElementById('pinnedContainer').innerHTML = '';
        document.getElementById('quicklinkContainer').innerHTML = '';
    }

    function toggleUserType(e) {
        e.preventDefault();
        const target = e.target.closest('.toggle-btn');
        if (!target || target.classList.contains('active')) return;
        currentUserType = (target.id === 'toggleToInternal') ? 'Internal' : 'Umum';
        const allToggles = document.querySelectorAll('#userTypeToggleContainer .toggle-btn');
        allToggles.forEach(btn => {
            btn.classList.remove('active');
            btn.classList.add('text-gray-500');
        });
        target.classList.add('active');
        target.classList.remove('text-gray-500');
        renderLayananByFilter(currentUserType);
    }

    function renderLayananByFilter(filterType) {
        layananTabsContainer.innerHTML = '';
        layananContentContainer.innerHTML = '';
        const filteredData = semuaLayanan.filter(layanan => {
            const sebagai = (getValueCaseInsensitive(layanan, 'sebagai') || '').toLowerCase();
            const jenis = (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase();
            if (jenis === 'setting') return false;
            return filterType === 'Internal' ? sebagai === 'internal' : sebagai !== 'internal';
        });
        if (filteredData.length === 0) {
            layananContentContainer.innerHTML = `<div class="text-center py-10"><p class="text-gray-500">Tidak ada layanan yang tersedia untuk kategori ini.</p></div>`;
            return;
        }
        const groupedLayananData = filteredData.reduce((acc, layanan) => {
            const kategoriString = getValueCaseInsensitive(layanan, 'Kategori') || 'Lainnya';
            const kategoriList = kategoriString.split(',').map(k => k.trim());

            kategoriList.forEach(kategori => {
                if (!acc[kategori]) {
                    acc[kategori] = [];
                }
                acc[kategori].push(layanan);
            });
            
            return acc;
        }, {});
        const categories = Object.keys(groupedLayananData);
        const colorPalette = [{ bg: 'bg-blue-100', text: 'text-blue-800' }, { bg: 'bg-orange-100', text: 'text-orange-800' }, { bg: 'bg-purple-100', text: 'text-purple-800' }, { bg: 'bg-green-100', text: 'text-green-800' }, { bg: 'bg-red-100', text: 'text-red-800' }, { bg: 'bg-indigo-100', text: 'text-indigo-800' }];
        categories.forEach((kategori, index) => {
            const tabSlide = document.createElement('div');
            tabSlide.className = 'swiper-slide';
            tabSlide.innerHTML = `<button class="layanan-tab" data-category="${kategori}">${kategori}</button>`;
            layananTabsContainer.appendChild(tabSlide);
            const contentPanel = document.createElement('div');
            contentPanel.id = `panel-${kategori}`;
            contentPanel.className = 'layanan-content-panel';
            const categoryCard = document.createElement('div');
            categoryCard.className = "bg-white/50 backdrop-blur-lg p-6 rounded-xl shadow-lg border border-white/30";
            const iconsGrid = document.createElement('div');
            iconsGrid.className = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 text-center";
            groupedLayananData[kategori].forEach((layanan, i) => {
                const jenisLayanan = (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase();
                const linkUrl = getValueCaseInsensitive(layanan, 'link');
                const colors = colorPalette[i % colorPalette.length];
                const serviceItem = document.createElement(jenisLayanan === 'link' && linkUrl ? 'a' : 'div');
                serviceItem.className = "flex flex-col items-center space-y-2 cursor-pointer group";
                if (jenisLayanan === 'link' && linkUrl) {
                    serviceItem.href = linkUrl;
                    serviceItem.target = '_blank';
                    serviceItem.rel = 'noopener noreferrer';
                }
                serviceItem.innerHTML = `
                    <div class="${colors.bg} ${colors.text} w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110">
                        <i class="fas fa-${getIconForLayanan(layanan)}"></i>
                    </div>
                    <h3 class="font-medium text-xs text-gray-700">${getValueCaseInsensitive(layanan, 'jenis layanan')}</h3>`;
                if (jenisLayanan !== 'link') {
                    Object.assign(serviceItem.dataset, {
                        formFields: getValueCaseInsensitive(layanan, 'form') || '',
                        layananName: getValueCaseInsensitive(layanan, 'jenis layanan') || '',
                        pengolah: getValueCaseInsensitive(layanan, 'pengolah') || '',
                        jenis: getValueCaseInsensitive(layanan, 'jenis') || '',
                        sheet: getValueCaseInsensitive(layanan, 'sheet') || '',
                        sheetId: getValueCaseInsensitive(layanan, 'Sheet ID') || ''
                    });
                    if (serviceItem.dataset.jenis.toLowerCase() === 'kalender') {
                        serviceItem.addEventListener('click', openCalendarModal);
                    } else {
                        serviceItem.addEventListener('click', openFormModal);
                    }
                }
                iconsGrid.appendChild(serviceItem);
            });
            categoryCard.appendChild(iconsGrid);
            contentPanel.appendChild(categoryCard);
            layananContentContainer.appendChild(contentPanel);
            if (index === 0) {
                tabSlide.querySelector('button').classList.add('active');
            } else {
                contentPanel.classList.add('hidden');
            }
        });
        const tabSwiper = new Swiper('.layanan-tabs-swiper', {
            slidesPerView: 'auto',
            spaceBetween: 16,
            freeMode: true,
        });
        layananTabsContainer.addEventListener('click', function(e) {
            if (e.target && e.target.classList.contains('layanan-tab')) {
                const category = e.target.dataset.category;
                layananTabsContainer.querySelectorAll('.layanan-tab').forEach(tab => tab.classList.remove('active'));
                e.target.classList.add('active');
                layananContentContainer.querySelectorAll('.layanan-content-panel').forEach(panel => {
                    panel.classList.toggle('hidden', panel.id !== `panel-${category}`);
                });
            }
        });
    }

    function renderQuickServicesModal() {
        const container = document.getElementById('quickServicesContainer');
        if (!container || semuaLayanan.length === 0) return;
        container.innerHTML = '';
        const layananTampil = semuaLayanan.filter(layanan => (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase() !== 'setting');
        const groupedData = layananTampil.reduce((acc, layanan) => {
            const kategoriString = getValueCaseInsensitive(layanan, 'Kategori') || 'Lainnya';
            const kategoriList = kategoriString.split(',').map(k => k.trim());

            kategoriList.forEach(kategori => {
                if (!acc[kategori]) {
                    acc[kategori] = [];
                }
                acc[kategori].push(layanan);
            });
            
            return acc;
        }, {});
        for (const kategori in groupedData) {
            const categoryWrapper = document.createElement('div');
            categoryWrapper.className = 'mb-4';
            categoryWrapper.innerHTML = `<h3 class="text-lg font-semibold mb-2 text-brand-green">${kategori}</h3>`;
            const list = document.createElement('ul');
            list.className = 'space-y-2';
            groupedData[kategori].forEach(layanan => {
                const listItem = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'w-full text-left p-2 rounded-lg hover:bg-gray-100';
                button.textContent = getValueCaseInsensitive(layanan, 'jenis layanan');
                Object.assign(button.dataset, {
                    formFields: getValueCaseInsensitive(layanan, 'form') || '',
                    layananName: getValueCaseInsensitive(layanan, 'jenis layanan') || '',
                    pengolah: getValueCaseInsensitive(layanan, 'pengolah') || '',
                    jenis: getValueCaseInsensitive(layanan, 'jenis') || '',
                    sheet: getValueCaseInsensitive(layanan, 'sheet') || '',
                    sheetId: getValueCaseInsensitive(layanan, 'Sheet ID') || ''
                });
                button.addEventListener('click', (e) => {
                    quickServicesModal.classList.add('hidden');
                    const serviceType = e.currentTarget.dataset.jenis.toLowerCase();
                    if (serviceType === 'kalender') {
                        openCalendarModal({ currentTarget: e.currentTarget });
                    } else if (serviceType === 'link') {
                        const linkUrl = getValueCaseInsensitive(layanan, 'link');
                        if (linkUrl) window.open(linkUrl, '_blank');
                    } else {
                        openFormModal({ currentTarget: e.currentTarget });
                    }
                });
                listItem.appendChild(button);
                list.appendChild(listItem);
            });
            categoryWrapper.appendChild(list);
            container.appendChild(categoryWrapper);
        }
    }

    function renderInfoSlider(data) {
        const infoSlider = document.querySelector('.info-swiper');
        const infoWrapper = document.getElementById('infoContainer');
        const infoSection = document.getElementById('info-section');
        infoWrapper.innerHTML = '';
        if (!data || data.length === 0) {
            if (infoSection) infoSection.style.display = 'none';
            return;
        }
        if (infoSection) infoSection.style.display = 'block';
        data.forEach(item => {
            const infoText = getValueCaseInsensitive(item, 'info');
            const gambar = getValueCaseInsensitive(item, 'gambar');
            const link = getValueCaseInsensitive(item, 'link');
            const warna = getValueCaseInsensitive(item, 'warna');
            if (infoText && link) {
                const slide = document.createElement('div');
                slide.className = 'swiper-slide h-auto';
                let cardHtml = '';
                if (gambar) {
                    cardHtml = `<a href="${link}" target="_blank" rel="noopener noreferrer" class="block w-full h-full rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"><img src="${gambar}" alt="${infoText}" class="w-full h-full object-cover aspect-[2.35/1]" onerror="this.parentElement.style.display='none'"/><p class="hidden">${infoText}</p></a>`;
                } else {
                    let bgColorStyle = `style="background-color: ${warna || '#10b981'}"`;
                    let textColorClass = getTextColorForBg(warna);
                    let iconBgStyle = `style="background-color: rgba(0,0,0,0.2)"`;
                    cardHtml = `<a href="${link}" target="_blank" rel="noopener noreferrer" class="flex items-start p-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity duration-300 h-full ${textColorClass}" ${bgColorStyle}>
                        <div class="rounded-lg p-2.5 mr-3" ${iconBgStyle}>
                            <i class="fas fa-bullhorn text-lg"></i>
                        </div>
                        <p class="font-medium text-xs">${infoText}</p>
                    </a>`;
                }
                slide.innerHTML = cardHtml;
                infoWrapper.appendChild(slide);
            }
        });
        if (infoSlider.swiper) infoSlider.swiper.destroy(true, true);
        const isSliderActive = data.length > 1;
        const swiper = new Swiper('.info-swiper', {
            loop: isSliderActive,
            autoplay: isSliderActive ? { delay: 4000, disableOnInteraction: false } : false,
            slidesPerView: 1,
            spaceBetween: 24,
            grabCursor: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 768: { slidesPerView: data.length > 1 ? 2 : 1 } }
        });
        infoSlider.classList.toggle('info-grid', !isSliderActive);
    }

    function renderPinnedButtons(data) {
        const pinnedWrapper = document.getElementById('pinnedContainer');
        const pinnedSection = document.getElementById('pinned-section');
        pinnedWrapper.innerHTML = '';
        if (!data || data.length === 0) {
            if (pinnedSection) pinnedSection.style.display = 'none';
            return;
        }
        if (pinnedSection) pinnedSection.style.display = 'block';
        pinnedWrapper.classList.toggle('md:grid-cols-2', data.length > 1);
        data.forEach(item => {
            const infoText = getValueCaseInsensitive(item, 'info');
            const link = getValueCaseInsensitive(item, 'link');
            const icon = getValueCaseInsensitive(item, 'ikon') || 'link';
            const warna = getValueCaseInsensitive(item, 'warna');
            if (infoText && link) {
                const button = document.createElement('a');
                button.href = link;
                button.target = '_blank';
                button.rel = 'noopener noreferrer';
                let bgColor = warna || '#1a3a3a';
                button.style.backgroundColor = bgColor;
                let textColorClass = getTextColorForBg(bgColor);
                button.className = `flex items-center p-2 rounded-xl shadow-sm hover:opacity-90 transition-opacity duration-300 ${textColorClass}`;
                button.innerHTML = `
                    <div class="bg-black bg-opacity-20 rounded-lg p-2 mr-2">
                        <i class="fas fa-${icon} text-lg"></i>
                    </div>
                    <p class="font-medium text-xs">${infoText}</p>
                `;
                pinnedWrapper.appendChild(button);
            }
        });
    }

    function renderQuickLinks(data) {
        const quicklinkWrapper = document.getElementById('quicklinkContainer');
        const quicklinkSection = document.getElementById('quicklink-section');
        quicklinkWrapper.innerHTML = '';
        if (!data || data.length === 0) {
            if (quicklinkSection) quicklinkSection.style.display = 'none';
            return;
        }
        if (quicklinkSection) quicklinkSection.style.display = 'block';
        const colorPalette = [
            { bg: 'bg-blue-100', text: 'text-blue-600' },
            { bg: 'bg-green-100', text: 'text-green-600' },
            { bg: 'bg-yellow-100', text: 'text-yellow-600' },
            { bg: 'bg-purple-100', text: 'text-purple-600' },
            { bg: 'bg-pink-100', text: 'text-pink-600' },
            { bg: 'bg-indigo-100', text: 'text-indigo-600' },
            { bg: 'bg-red-100', text: 'text-red-600' },
            { bg: 'bg-orange-100', text: 'text-orange-600' }
        ];
        data.forEach((item, index) => {
            const infoText = getValueCaseInsensitive(item, 'info');
            const link = getValueCaseInsensitive(item, 'link');
            const icon = getValueCaseInsensitive(item, 'icon') || 'external-link-alt';
            const warna = getValueCaseInsensitive(item, 'warna');
            if (infoText && link) {
                const quickLink = document.createElement('a');
                quickLink.href = link;
                quickLink.target = '_blank';
                quickLink.rel = 'noopener noreferrer';
                quickLink.className = 'flex flex-col items-center space-y-2 text-gray-700 hover:opacity-80 transition-opacity';
                let bgColor = '';
                let textColor = '';
                let styleAttr = '';
                if (warna) {
                    styleAttr = `style="background-color:${warna}; color:${getTextColorForBg(warna)}"`;
                } else {
                    const randomColor = colorPalette[index % colorPalette.length];
                    bgColor = randomColor.bg;
                    textColor = randomColor.text;
                }
                quickLink.innerHTML = `
                    <div class="w-12 h-12 rounded-xl flex items-center justify-center text-xl ${bgColor} ${textColor}" ${styleAttr}>
                        <i class="fas fa-${icon}"></i>
                    </div>
                    <p class="text-xs font-medium">${infoText}</p>
                `;
                quicklinkWrapper.appendChild(quickLink);
            }
        });
    }

    function renderFooterLinks(data) {
        const footerWrapper = document.getElementById('footerLinkContainer');
        footerWrapper.innerHTML = '';
        if (!data || data.length === 0) {
            return;
        }
        data.forEach(item => {
            const infoText = getValueCaseInsensitive(item, 'info');
            const link = getValueCaseInsensitive(item, 'link');
            if (infoText && link) {
                const iconClass = getFooterIcon(infoText);
                const footerLink = document.createElement('a');
                footerLink.href = link;
                footerLink.target = '_blank';
                footerLink.rel = 'noopener noreferrer';
                footerLink.className = 'text-gray-500 hover:text-brand-green transition-colors text-xl';
                footerLink.dataset.itemName = infoText;
                footerLink.innerHTML = `<i class="${iconClass}"></i>`;
                footerWrapper.appendChild(footerLink);
            }
        });
    }

    // --- FORM RENDERING LOGIC ---
    
    // BARU: Fungsi render khusus untuk Formulir Suket Lulus
    function renderSuketLulusForm(allFields, layananName) {
        let formHtml = `
            <div class="mb-4 text-sm bg-yellow-50 border-l-4 border-yellow-400 text-yellow-800 p-4" role="alert">
                <p class="font-bold">PERSYARATAN PENERBITAN SKL:</p>
                <ol class="list-decimal list-inside mt-2">
                    <li>TRANSKRIP NILAI YG TELAH DI TANDATANGANI DAN DI STEMPEL</li>
                    <li>DAFTAR YUDICIUM MAHASISWA YG BERSANGKUTAN</li>
                    <li>IPK HARUS SAMA ANTARA TRANSKRIP DAN DAFTAR YUDICIUM</li>
                </ol>
                <p class="mt-2">PERSYARATAN TERSEBUT DIAJUKAN PADA RUANG LAYANAN AKADEMIK</p>
                <p class="mt-2 font-semibold">APABILA PERSYARATAN TERSEBUT DI ATAS TIDAK TERPENUHI, MAKA PROSES PENERBITAN SKL TIDAK DAPAT DILANJUTKAN.</p>
            </div>
        `;

        formHtml += `<input type="hidden" name="Pengolah" value="LA" />`; // Pengolah di-hardcode
        formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
        let fieldsHtml = '';

        const prodiOptions = DATA_AKADEMIK.map(item => `<option value="${item.prodi}">${item.prodi}</option>`).join('');

        allFields.forEach(field => {
            const fieldId = `form-input-${field.replace(/\s+/g, '-')}`;
            const fieldLower = field.toLowerCase().trim();
            
            // Skip "Unit Kerja Layanan" karena tidak digunakan
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
                // Field lain bisa ditambahkan kustomisasi jika perlu
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
        
        // Menambahkan field kustom sesuai permintaan
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
        
        if(prodiSelect && fakultasInput) {
            prodiSelect.addEventListener('change', function() {
                const selectedProdi = this.value;
                const match = DATA_AKADEMIK.find(item => item.prodi === selectedProdi);
                if (match) {
                    fakultasInput.value = match.fakultas;
                }
            });
        }
    }


    // DIUBAH: Fungsi ini dioptimalkan untuk menggunakan data lokal (DATA_AKADEMIK & UNIT_KERJA_LAYANAN).
    // Tidak lagi `async` karena tidak ada proses `await`.
    function renderSuketKuliahForm(allFields, pengolah, layananName) {
        
        let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
        formHtml += `<input type="hidden" name="Jenis Layanan" value="${layananName}" />`;
        let fieldsHtml = '';

        // Opsi untuk dropdown "Unit Kerja Layanan" diambil dari konstanta
        const unitKerjaOptions = UNIT_KERJA_LAYANAN.map(unit => `<option value="${unit}">${unit}</option>`).join('');

        fieldsHtml += `
            <div class="mb-4 md:col-span-2">
                <p class="text-xs text-blue-600 bg-blue-50 p-2 rounded-md mb-2">Jika diperuntukkan sebagai dasar pembayaran Tunjangan Penghasilan Orang Tua maka silakan pilih Unit Kerja Layanan "Rektorat"</p>
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
                    // Opsi prodi akan diisi oleh event listener, awalnya kosong
                    inputHtml = `<select id="${fieldId}" name="${field}" required class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white text-sm">
                                    <option value="" disabled selected>-- Pilih Unit Kerja dulu --</option>
                                </select>`;
                    break;
                case 'fakultas':
                    // Fakultas akan diisi otomatis dan dibuat readonly
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
        
        // --- Event Listeners untuk form Suket Kuliah (LOGIKA BARU) ---
        const unitKerjaSelect = permohonanForm.querySelector('#unit-kerja-layanan');
        const prodiSelect = permohonanForm.querySelector('[name="Prodi"]');
        const fakultasInput = permohonanForm.querySelector('[name="Fakultas"]');

        unitKerjaSelect.addEventListener('change', function() {
            const selectedUnit = this.value;
            const isRektorat = selectedUnit === 'Rektorat';

            // 1. Logika untuk menampilkan field Orang Tua
            const orangTuaFields = permohonanForm.querySelectorAll('[data-group="orang-tua"]');
            orangTuaFields.forEach(field => {
                field.style.display = isRektorat ? 'block' : 'none';
                const input = field.querySelector('input, select, textarea');
                if(input) {
                    input.required = isRektorat;
                }
            });

            // 2. Logika untuk memfilter prodi berdasarkan unit kerja
            prodiSelect.innerHTML = '<option value="" disabled selected>-- Pilih Prodi --</option>'; // Reset prodi
            fakultasInput.value = ''; // Reset fakultas

            if (selectedUnit && !isRektorat) {
                const filteredProdis = DATA_AKADEMIK.filter(item => item.fakultas === selectedUnit);
                filteredProdis.forEach(item => {
                    prodiSelect.innerHTML += `<option value="${item.prodi}">${item.prodi}</option>`;
                });
                prodiSelect.disabled = false;
            } else {
                 prodiSelect.innerHTML = '<option value="" disabled selected>-- Tidak ada prodi --</option>';
                 prodiSelect.disabled = true;
            }
        });

        prodiSelect.addEventListener('change', function() {
            const selectedProdi = this.value;
            const match = DATA_AKADEMIK.find(item => item.prodi === selectedProdi);
            if (match) {
                fakultasInput.value = match.fakultas;
            }
        });
        
        // Trigger sekali untuk set state awal
        unitKerjaSelect.dispatchEvent(new Event('change'));
    }

    /**
     * BARU: Fungsi terpisah untuk merender form Peminjaman
     */
    function renderPeminjamanForm(allFields, pengolah, layananName) {
        let formHtml = `<input type="hidden" name="Pengolah" value="${pengolah}" />`;
        let fieldsContainerHtml = '';

        // Mengembalikan dropdown Unit Kerja Layanan
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

        // Mengembalikan dropdown Jenis Layanan
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
        
        // Menambahkan kolom Waktu dan Jenis secara manual
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

        // Menambahkan event listener untuk menampilkan/menyembunyikan kolom Jenis
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
                    jenisBarangInput.value = ''; // Mengosongkan nilai saat disembunyikan
                }
            });
        }
    }
    
    /**
     * BARU: Fungsi terpisah untuk merender form Pengaduan
     */
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
     * Fungsi untuk form generik/umum
     */
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


    /**
     * DIPERBARUI: Fungsi ini sekarang menjadi router untuk memanggil render function yang sesuai
     */
    function openFormModal(event) {
        const card = event.currentTarget;
        const { formFields, layananName, pengolah, sheet, sheetId } = card.dataset;
        if (!formFields || !sheet) return;
        modalTitle.textContent = `Formulir ${layananName}`;
        const allFields = formFields.split(',').map(field => field.trim());
        permohonanForm.dataset.targetSheet = sheet;
        permohonanForm.dataset.targetSheetId = sheetId;
        
        const lowerLayananName = layananName.toLowerCase();

        // Router untuk menentukan fungsi render mana yang akan dipanggil
        if (lowerLayananName.includes('suket lulus')) {
            renderSuketLulusForm(allFields, layananName);
        } else if (lowerLayananName.includes('suket')) {
            renderSuketKuliahForm(allFields, pengolah, layananName);
        } else if (lowerLayananName.includes('peminjaman')) {
            renderPeminjamanForm(allFields, pengolah, layananName);
        } else if (lowerLayananName.includes('pengaduan')) {
            renderPengaduanForm(allFields, pengolah, layananName);
        } else {
            // Fallback untuk form lain yang tidak memiliki perlakuan khusus
            renderGenericForm(allFields, pengolah, layananName);
        }
    
        formModal.classList.remove('hidden');
    }

    function handlePermohonanSubmit(e) {
        e.preventDefault();
        const { targetSheet, targetSheetId } = e.target.dataset;
        const submitBtn = document.getElementById('submitPermohonanBtn');
        if (!targetSheet) {
            showNotificationModal('Error', 'Tujuan penyimpanan data tidak ditemukan.', 'error');
            return;
        }
        const formData = new FormData(e.target);
        const dataObject = Object.fromEntries(formData.entries());
        submitBtn.textContent = 'Mengirim...';
        submitBtn.disabled = true;
        const fileInput = e.target.querySelector('input[type="file"][name="File"]');
        const file = fileInput ? fileInput.files[0] : null;
        const runServerCall = (fileData = null) => {
            if (fileData) dataObject.fileData = fileData;
            delete dataObject.File;
            fetch(GAS_WEB_APP_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                    body: JSON.stringify({
                        action: 'submitPermohonan',
                        formData: dataObject,
                        sheetName: targetSheet,
                        sheetId: targetSheetId
                    })
                })
                .then(res => res.json())
                .then(onPermohonanSuccess)
                .catch(onPermohonanFailure);
        };
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const base64Data = e.target.result.split(',')[1];
                const fileData = {
                    base64Data: base64Data,
                    name: file.name,
                    type: file.type
                };
                runServerCall(fileData);
            };
            reader.onerror = function() {
                showNotificationModal('Error', 'Gagal membaca file lampiran.', 'error');
                submitBtn.textContent = 'Kirim';
                submitBtn.disabled = false;
            };
            reader.readAsDataURL(file);
        } else {
            runServerCall();
        }
    }

    function handleHelpdeskSubmit(e) {
        e.preventDefault();
        const btn = document.getElementById('submitHelpdeskBtn');
        btn.textContent = 'Mengirim...';
        btn.disabled = true;
        const formData = new FormData(e.target);
        const dataObject = Object.fromEntries(formData.entries());
        fetch(GAS_WEB_APP_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'submitHelpdesk',
                    formData: dataObject
                })
            })
            .then(res => res.json())
            .then(response => {
                helpdeskModal.classList.add('hidden');
                if (response.success) {
                    showNotificationModal('Berhasil', 'Pesan Anda telah terkirim. Terima kasih.', 'success');
                    helpdeskForm.reset();
                } else {
                    showNotificationModal('Gagal', `Gagal mengirim pesan: ${response.message}`, 'error');
                }
                btn.textContent = 'Kirim';
                btn.disabled = false;
            })
            .catch(err => {
                showNotificationModal('Error', 'Terjadi kesalahan saat mengirim pesan.', 'error');
                console.error(err);
                btn.textContent = 'Kirim';
                btn.disabled = false;
            });
    }

    function onPermohonanSuccess(response) {
        formModal.classList.add('hidden');
        if (response.success) {
            if (response.id) {
                const successMessage = `Permohonan Anda telah dikirim. Gunakan ID ini untuk melacak:
                <div class='flex items-center justify-between bg-gray-100 p-2 rounded-lg mt-4'>
                    <strong id='copy-target-id' class='text-lg font-mono tracking-wider'>${response.id}</strong>
                    <button id='copy-id-btn' type='button' class='bg-gray-200 px-3 py-1 rounded-md text-sm font-semibold hover:bg-gray-300 transition-colors'>Copy ID</button>
                </div>`;
                showNotificationModal('Berhasil!', successMessage, 'success');
            } else {
                showNotificationModal('Berhasil!', 'Permohonan Anda telah terkirim, namun ID pelacakan tidak dapat dibuat. Silakan hubungi admin.', 'success');
            }
        } else {
            showNotificationModal('Gagal', `Gagal mengirim permohonan: ${response.message || 'Terjadi kesalahan yang tidak diketahui.'}`, 'error');
        }
        document.getElementById('submitPermohonanBtn').textContent = 'Kirim';
        document.getElementById('submitPermohonanBtn').disabled = false;
    }

    function onPermohonanFailure(error) {
        showNotificationModal('Error', 'Terjadi kesalahan saat mengirim permohonan.', 'error');
        console.error('Submit Gagal:', error);
        document.getElementById('submitPermohonanBtn').textContent = 'Kirim';
        document.getElementById('submitPermohonanBtn').disabled = false;
    }

    // UPDATED: Function to handle calendar logic
    function openCalendarModal(event) {
        const { sheet, sheetId } = event.currentTarget.dataset;
        if (!sheet) {
            showNotificationModal('Error Konfigurasi', 'Sheet untuk kalender belum diatur.', 'error');
            return;
        }
        calendarModal.classList.remove('hidden');
        const isMobile = window.innerWidth < 768;
        const cacheKey = `${sheet}-${sheetId}`;
        const calendarFilter = document.getElementById('calendarFilter');

        const eventSource = (fetchInfo, successCallback, failureCallback) => {
            const processEvents = (events) => {
                const validEvents = Array.isArray(events) ? events : [];
                
                // Populate filter dropdown if not already populated
                if (calendarFilter.options.length <= 1) {
                    const pengolahSet = new Set(validEvents.map(e => getValueCaseInsensitive(e.extendedProps, 'pengolah')).filter(Boolean));
                    pengolahSet.forEach(pengolah => {
                        const option = new Option(pengolah, pengolah);
                        calendarFilter.add(option);
                    });
                }
                
                // Filter events based on dropdown
                const selectedPengolah = calendarFilter.value;
                const filteredEvents = (selectedPengolah === 'all') 
                    ? validEvents 
                    : validEvents.filter(e => getValueCaseInsensitive(e.extendedProps, 'pengolah') === selectedPengolah);
                
                successCallback(filteredEvents);
            };

            if (calendarDataCache[cacheKey]) {
                console.log(`Memuat event kalender dari cache untuk: ${sheet}`);
                processEvents(calendarDataCache[cacheKey]);
                return;
            }
            
            console.log(`Mengambil event kalender dari jaringan untuk: ${sheet}`);
            fetch(`${GAS_WEB_APP_URL}?action=getCalendarEvents&sheetName=${encodeURIComponent(sheet)}&sheetId=${encodeURIComponent(sheetId)}`)
                .then(res => res.json())
                .then(events => {
                    calendarDataCache[cacheKey] = events;
                    processEvents(events);
                })
                .catch(failureCallback);
        };

        if (!calendar) {
            calendar = new FullCalendar.Calendar(calendarEl, {
                locale: 'id',
                initialView: isMobile ? 'listWeek' : 'dayGridMonth',
                headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,listWeek' },
                titleFormat: { month: 'short', year: 'numeric' }, // UPDATED: Abbreviated month
                noEventsContent: 'Tidak ada jadwal peminjaman pada periode ini.',
                events: eventSource,
                height: '100%',
                eventClick: (info) => {
                    const props = info.event.extendedProps;
                    const fieldsInOrder = [
                        'Nama', 'Jenis Layanan', 'Perihal', 'Kegiatan', 
                        'Pengolah', 'Jenis', 'Tanggal Mulai', 'Tanggal Selesai'
                    ];

                    let detailsHtml = fieldsInOrder.map(field => {
                        const value = getValueCaseInsensitive(props, field);
                        if (value) {
                            if (field.toLowerCase().trim() === 'pengolah') {
                                return `<dt class="font-semibold">${field}</dt><dd class="mb-2 bg-yellow-100 text-yellow-800 font-bold p-1 rounded">${value}</dd>`;
                            } else {
                                return `<dt class="font-semibold">${field}</dt><dd class="mb-2">${value}</dd>`;
                            }
                        }
                        return null;
                    }).filter(Boolean).join('');

                    if (!detailsHtml) {
                        detailsHtml = "<p>Tidak ada detail untuk ditampilkan.</p>";
                    }

                    showNotificationModal('Detail Peminjaman', `<dl class="text-left">${detailsHtml}</dl>`, 'custom');
                },
                eventContent: (arg) => ({ html: `<i class="fas fa-${arg.event.extendedProps.iconName || 'calendar-alt'} mr-2"></i>${arg.event.title}` }),
                loading: (isLoading) => calendarLoader.style.display = isLoading ? 'flex' : 'none',
            });
            calendar.render();

            // Add event listener for the filter
            calendarFilter.addEventListener('change', () => {
                calendar.refetchEvents();
            });

        } else {
            calendar.refetchEvents();
        }
    }

    function handleTracking(e) {
        e.preventDefault();
        setTrackingLoading(true, 'trackButton');
        trackingResult.innerHTML = '';
        const permohonanId = document.getElementById('permohonanId').value;
        const selectedOption = trackingLayananSelect.value;
        if (!selectedOption) {
            onTrackSuccess({ error: 'Silakan pilih jenis layanan.' });
            return;
        }
        const { name: sheetName, id: sheetId } = JSON.parse(selectedOption);
        const url = `${GAS_WEB_APP_URL}?action=trackPermohonan&permohonanId=${encodeURIComponent(permohonanId)}&sheetName=${encodeURIComponent(sheetName)}&sheetId=${encodeURIComponent(sheetId)}`;
        fetch(url)
            .then(res => res.json())
            .then(onTrackSuccess)
            .catch(onTrackFailure);
    }

    function handleMobileTracking(e) {
        e.preventDefault();
        setTrackingLoading(true, 'mobileTrackButton');
        const resultContainer = document.getElementById('mobileTrackingResult');
        resultContainer.innerHTML = '';
        const permohonanId = document.getElementById('mobilePermohonanId').value;
        const selectedOption = document.getElementById('mobileTrackingLayananSelect').value;
        if (!selectedOption) {
            onTrackSuccess({ error: 'Silakan pilih jenis layanan.' }, 'mobile');
            return;
        }
        const { name: sheetName, id: sheetId } = JSON.parse(selectedOption);
        const url = `${GAS_WEB_APP_URL}?action=trackPermohonan&permohonanId=${encodeURIComponent(permohonanId)}&sheetName=${encodeURIComponent(sheetName)}&sheetId=${encodeURIComponent(sheetId)}`;
        fetch(url)
            .then(res => res.json())
            .then(result => onTrackSuccess(result, 'mobile'))
            .catch(err => onTrackFailure(err, 'mobile'));
    }

    function onTrackSuccess(result, view = 'desktop') {
        setTrackingLoading(false, view === 'desktop' ? 'trackButton' : 'mobileTrackButton');
        const resultContainer = view === 'desktop' ? trackingResult : document.getElementById('mobileTrackingResult');
        let content = '';
        if (result && result.error) {
            content = `<div class="p-4 bg-red-100 text-red-700 rounded-lg relative">${result.error}</div>`;
        } else if (result) {
            const isAnonim = (getValueCaseInsensitive(result, 'anonim') === 'on' || getValueCaseInsensitive(result, 'anonim') === true);
            const fieldsToHide = ['Nama Pelapor', 'Email Identitas Pelapor', 'Telepon Identitas Pelapor', 'No Identitas Pelapor'];
            if (isAnonim) {
                fieldsToHide.forEach(field => {
                    if (result[field]) result[field] = '*****';
                });
            }
            const status = getValueCaseInsensitive(result, 'status') || 'N/A';
            const idPermohonan = getValueCaseInsensitive(result, 'idpermohonan') || getValueCaseInsensitive(result, 'idlayanan') || 'N/A';
            const statusClasses = { disetujui: 'bg-green-100 text-green-800', diajukan: 'bg-yellow-100 text-yellow-800', ditahan: 'bg-orange-100 text-orange-800', selesai: 'bg-blue-100 text-blue-800', ditolak: 'bg-red-100 text-red-700' };
            const bgColorClass = statusClasses[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
            let detailsHtml = Object.entries(result)
                .filter(([key, value]) => !['idpermohonan', 'idlayanan', 'status'].includes(key.toLowerCase()) && value)
                .map(([key, value]) => {
                    // Logika spesifik untuk 'File'
                    if (key.toLowerCase().trim() === 'file') {
                        // Periksa apakah value adalah string dan link yang valid
                        if (typeof value === 'string' && value.startsWith('http')) {
                            // Jika ya, buat tombol
                            return `<div class="flex flex-col sm:col-span-2"><dt class="text-sm font-medium text-gray-500">${key}</dt><dd class="text-sm mt-1"><a href="${value}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm"><i class="fas fa-download mr-2"></i>Download File</a></dd></div>`;
                        } else {
                            // Jika 'File' ada tapi bukan link, jangan tampilkan apa-apa
                            return ''; 
                        }
                    }
                    
                    // Render field lainnya seperti biasa
                    return `<div class="flex flex-col"><dt class="text-sm font-medium text-gray-500">${key}</dt><dd class="text-sm">${value}</dd></div>`;
                })
                .join('');
            content = `
            <div class="p-4 ${bgColorClass} rounded-lg relative">
                <p class="font-semibold">Status untuk ID: ${idPermohonan}</p>
                <p class="text-2xl font-bold">${status}</p>
                <dl class="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">${detailsHtml}</dl>
            </div>`;
        } else {
            content = `<div class="p-4 bg-yellow-100 text-yellow-800 rounded-lg relative">ID Permohonan tidak ditemukan.</div>`;
        }
        resultContainer.innerHTML = content.replace('</div>', '<button class="js-close-track-result absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">&#215;</button></div>');
    }

    function onTrackFailure(error, view = 'desktop') {
        setTrackingLoading(false, view === 'desktop' ? 'trackButton' : 'mobileTrackButton');
        const resultContainer = view === 'desktop' ? trackingResult : document.getElementById('mobileTrackingResult');
        console.error('Gagal melacak:', error);
        resultContainer.innerHTML = `<div class="p-4 bg-red-100 text-red-700 rounded-lg relative">Terjadi kesalahan. <button class="js-close-track-result absolute top-2 right-3">&#215;</button></div>`;
    }

    function setTrackingLoading(isLoading, buttonId) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        const icon = button.querySelector('i');
        const spinner = button.querySelector('div');
        if (isLoading) {
            if (icon) icon.style.display = 'none';
            if (spinner) spinner.style.display = 'inline-block';
            button.disabled = true;
        } else {
            if (icon) icon.style.display = 'inline-block';
            if (spinner) spinner.style.display = 'none';
            button.disabled = false;
        }
    }
});
