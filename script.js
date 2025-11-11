// URL Web App Google Apps Script Anda (tetap diperlukan untuk tracking, submit, dll)
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycby1Z6BneYq-9yWrafQh6K8eTuqPa1q3Si_cpP-e_LJKU-UdTucH00uHF5wFPS4DlmJQgg/exec';

// --- DATA KONSTAN (akan diisi dari data.json) ---
let DATA_AKADEMIK = [];
let UNIT_KERJA_LAYANAN = [];

// --- EVENT LISTENER UTAMA ---
document.addEventListener('DOMContentLoaded', function() {

    // --- Selektor DOM ---
    const skeletonLoader = document.getElementById('skeleton-loader');
    const realContent = document.getElementById('real-content');
    // DIHAPUS: layananTabsContainer tidak lagi digunakan
    const layananContentContainer = document.getElementById('layanan-content-container');
    const trackingForm = document.getElementById('trackingForm');
    const trackingResult = document.getElementById('trackingResult');
    const trackingLayananSelect = document.getElementById('trackingLayananSelect');
    const infoContainer = document.getElementById('infoContainer');
    const pinnedContainer = document.getElementById('pinnedContainer');
    const quicklinkContainer = document.getElementById('quicklinkContainer');
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
    const helpdeskModal = document.getElementById('helpdeskModal');
    const closeHelpdeskModalBtn = document.getElementById('closeHelpdeskModalBtn');
    const quickServicesModal = document.getElementById('quickServicesModal');
    const closeQuickServicesModalBtn = document.getElementById('closeQuickServicesModalBtn');
    const helpdeskForm = document.getElementById('helpdeskForm');
    const mobileTrackingForm = document.getElementById('mobileTrackingForm');
    const fabHelpdeskBtn = document.getElementById('fabHelpdeskBtn');
    let calendar;

    // --- Selektor untuk fitur baru ---
    const navServices = document.getElementById('navServices');
    const navHelp = document.getElementById('navHelp');
    const navReport = document.getElementById('navReport');
    const serviceFilterModal = document.getElementById('serviceFilterModal');
    const closeServiceFilterModalBtn = document.getElementById('closeServiceFilterModalBtn');
    const mobileServiceFilterBtn = document.getElementById('mobileServiceFilterBtn');
    const serviceFilterContainer = document.getElementById('serviceFilterContainer');
    const mobileTrackingResult = document.getElementById('mobileTrackingResult');
    const welcomePopup = document.getElementById('welcomePopup');


    // --- State Aplikasi ---
    let semuaLayanan = [];
    let currentUserType = 'Umum';
    let calendarDataCache = {};

    // --- Inisialisasi ---
    initializePageData();
    setupEventListeners();

    function initializePageData() {
        console.log("Memuat data aplikasi dari data.json...");
        fetch('data.json')
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Gagal memuat data.json: status ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                console.log("Data berhasil dimuat. Merender halaman...");
                skeletonLoader.classList.add('hidden');
                realContent.classList.remove('hidden');
                DATA_AKADEMIK = data.konstanta?.akademik || [];
                UNIT_KERJA_LAYANAN = data.konstanta?.unitKerja || [];
                onLayananSuccess(data.layanan || []);
                onInfoSuccess(data.info || []);
                if ('requestIdleCallback' in window) {
                    requestIdleCallback(() => prefetchCalendarData(data.layanan || []));
                } else {
                    setTimeout(() => prefetchCalendarData(data.layanan || []), 1500);
                }
            })
            .catch(error => {
                console.error("Gagal total memuat data aplikasi:", error);
                skeletonLoader.classList.add('hidden');
                realContent.classList.remove('hidden');
                realContent.innerHTML = `<div class="text-center p-8">
                    <h2 class="text-xl font-bold text-red-600">Gagal Memuat Aplikasi</h2>
                    <p class="text-gray-600 mt-2">Tidak dapat mengambil data konfigurasi. Silakan coba muat ulang halaman atau hubungi administrator.</p>
                </div>`;
            });
    }

    function trackGAEvent(eventName, eventParams) {
        if (typeof gtag === 'function') {
            gtag('event', eventName, eventParams);
            console.log(`GA Event: ${eventName}`, eventParams);
        } else {
            console.warn('Google Analytics (gtag.js) tidak ditemukan. Pastikan sudah dipasang di HTML.');
        }
    }

    function setupEventListeners() {
        if (trackingForm) trackingForm.addEventListener('submit', handleTracking);
        if (mobileTrackingForm) mobileTrackingForm.addEventListener('submit', handleMobileTracking);
        
        const modalClosers = [
            { btn: closeModalBtn, modal: formModal }, { btn: cancelModalBtn, modal: formModal },
            { btn: closeHelpdeskModalBtn, modal: helpdeskModal },
            { btn: closeQuickServicesModalBtn, modal: quickServicesModal }, { btn: closeCalendarModalBtn, modal: calendarModal },
            { btn: closeServiceFilterModalBtn, modal: serviceFilterModal }
        ];
        modalClosers.forEach(item => {
            if (item && item.btn) item.btn.addEventListener('click', () => item.modal.classList.add('hidden'));
        });
        
        if (mobileServiceFilterBtn) mobileServiceFilterBtn.addEventListener('click', () => {
            serviceFilterModal.classList.remove('hidden');
        });

        if (serviceFilterContainer) serviceFilterContainer.addEventListener('click', handleServiceFilterSelection);

        if (permohonanForm) permohonanForm.addEventListener('submit', handlePermohonanSubmit);
        if (helpdeskForm) helpdeskForm.addEventListener('submit', handleHelpdeskSubmit);
        
        if (trackingResult) trackingResult.addEventListener('click', (e) => handleCloseTrackResult(e, 'desktop'));
        if (mobileTrackingResult) mobileTrackingResult.addEventListener('click', (e) => handleCloseTrackResult(e, 'mobile'));

        if (userTypeToggleContainer) userTypeToggleContainer.addEventListener('click', toggleUserType);
        if (fabHelpdeskBtn) fabHelpdeskBtn.addEventListener('click', () => helpdeskModal.classList.remove('hidden'));
        
        document.body.addEventListener('click', function(event) {
            const trackableItem = event.target.closest('[data-tipe][data-item]');
            if (trackableItem) {
                const { tipe, item } = trackableItem.dataset;
                const eventName = tipe.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
                trackGAEvent(eventName, {
                    item_clicked: item
                });
            }
        });
        
        if (navServices) navServices.addEventListener('click', () => {
            quickServicesModal.classList.remove('hidden');
            updateNavActiveState('navServices');
        });
        if (navHelp) navHelp.addEventListener('click', () => {
            helpdeskModal.classList.remove('hidden');
            updateNavActiveState('navHelp');
        });
        if (navReport) navReport.addEventListener('click', handleNavReportClick);
    }
    
    function updateNavActiveState(activeId) {
        const navButtons = document.querySelectorAll('#bottom-nav .nav-btn');
        navButtons.forEach(btn => {
            if (btn.id === activeId) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    function handleNavReportClick() {
        const layananPengaduan = semuaLayanan.find(l => {
            const namaLayanan = getValueCaseInsensitive(l, 'jenis layanan') || '';
            return namaLayanan.toLowerCase().trim() === 'pengaduan layanan';
        });

        if (layananPengaduan) {
            const dataset = {
                formFields: getValueCaseInsensitive(layananPengaduan, 'form') || '',
                layananName: getValueCaseInsensitive(layananPengaduan, 'jenis layanan') || '',
                pengolah: getValueCaseInsensitive(layananPengaduan, 'pengolah') || '',
                jenis: getValueCaseInsensitive(layananPengaduan, 'jenis') || '',
                sheet: getValueCaseInsensitive(layananPengaduan, 'sheet') || '',
                sheetId: getValueCaseInsensitive(layananPengaduan, 'Sheet ID') || ''
            };
            openFormModal({ currentTarget: { dataset: dataset } });
            updateNavActiveState('navReport');
        } else {
            showNotificationModal('Error', 'Layanan "Pengaduan Layanan" tidak ditemukan.', 'error');
        }
    }

    function renderServiceFilterModal() {
        if (!serviceFilterContainer) return;
        serviceFilterContainer.innerHTML = '';
        const trackableLayanan = semuaLayanan.filter(layanan => (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase() !== 'setting');
        
        const list = document.createElement('ul');
        list.className = 'space-y-1';

        trackableLayanan.forEach(layanan => {
            const layananName = getValueCaseInsensitive(layanan, 'jenis layanan');
            const targetSheet = getValueCaseInsensitive(layanan, 'sheet');
            const targetSheetId = getValueCaseInsensitive(layanan, 'Sheet ID') || '';
            if (layananName && targetSheet) {
                const optionValue = JSON.stringify({ name: targetSheet, id: targetSheetId });
                const listItem = document.createElement('li');
                const button = document.createElement('button');
                button.className = 'w-full text-left p-2 rounded-lg hover:bg-gray-100 service-filter-item flex justify-between items-center';
                button.dataset.value = optionValue;
                
                button.innerHTML = `
                    <span>${layananName}</span>
                    <i class="fas fa-check check-icon text-green-600"></i>
                `;
                listItem.appendChild(button);
                list.appendChild(listItem);
            }
        });
        serviceFilterContainer.appendChild(list);
    }
    
    function handleServiceFilterSelection(e) {
        const target = e.target.closest('.service-filter-item');
        if (target) {
            serviceFilterContainer.querySelectorAll('.service-filter-item').forEach(item => {
                item.classList.remove('selected');
            });
            target.classList.add('selected');

            const { value, text } = target.dataset;
            document.getElementById('mobileSelectedServiceValue').value = value;
            mobileServiceFilterBtn.classList.add('filter-selected');
            
            setTimeout(() => {
                serviceFilterModal.classList.add('hidden');
            }, 200);
        }
    }
    
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
        
        const copyBtn = document.getElementById('copy-id-btn');
        const copyTarget = document.getElementById('copy-target-id');

        if (copyBtn && copyTarget) {
            copyBtn.onclick = () => {
                const textToCopy = copyTarget.innerText;
                if (navigator.clipboard && window.isSecureContext) {
                    navigator.clipboard.writeText(textToCopy).then(() => {
                        copyBtn.textContent = 'Tersalin!';
                        copyBtn.classList.add('bg-green-200');
                        setTimeout(() => {
                            copyBtn.textContent = 'Copy ID';
                            copyBtn.classList.remove('bg-green-200');
                        }, 2000);
                    }).catch(err => {
                        console.error('Gagal menyalin:', err);
                        copyBtn.textContent = 'Gagal';
                    });
                } else {
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
                }
            };
        }
    }

    function handleCloseTrackResult(e, view) {
        if (e.target.closest('.js-close-track-result')) {
            if (view === 'desktop') {
                trackingResult.innerHTML = '';
                document.getElementById('permohonanId').value = '';
                trackingLayananSelect.selectedIndex = 0;
            } else {
                mobileTrackingResult.innerHTML = '';
                document.getElementById('mobilePermohonanId').value = '';
                document.getElementById('mobileSelectedServiceValue').value = '';
                mobileServiceFilterBtn.classList.remove('filter-selected');
                serviceFilterContainer.querySelectorAll('.service-filter-item').forEach(item => {
                    item.classList.remove('selected');
                });
            }
        }
    }

    function prefetchCalendarData(layananList = []) {
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
                            console.log(`Cache updated for calendar: ${sheet}`);
                        })
                        .catch(err => console.error(`Failed to prefetch calendar data for ${sheet}:`, err));
                }
            }
        });
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

    function onLayananSuccess(data) {
        semuaLayanan = data || [];
        if (!semuaLayanan || semuaLayanan.length === 0) {
            layananContentContainer.innerHTML = '<p class="text-gray-500 text-center p-4">Tidak ada layanan yang tersedia.</p>';
            return;
        }
        renderLayananByFilter(currentUserType);
        
        if (trackingLayananSelect) trackingLayananSelect.innerHTML = '<option value="">Pilih Jenis Layanan</option>';
        const trackableLayanan = semuaLayanan.filter(layanan => (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase() !== 'setting');
        trackableLayanan.forEach(layanan => {
            const layananName = getValueCaseInsensitive(layanan, 'jenis layanan');
            const targetSheet = getValueCaseInsensitive(layanan, 'sheet');
            const targetSheetId = getValueCaseInsensitive(layanan, 'Sheet ID') || '';
            if (layananName && targetSheet) {
                const optionValue = JSON.stringify({ name: targetSheet, id: targetSheetId });
                const option = `<option value='${optionValue}'>${layananName}</option>`;
                if (trackingLayananSelect) trackingLayananSelect.innerHTML += option;
            }
        });

        renderQuickServicesModal();
        renderServiceFilterModal();
    }
    
    function onLayananFailure(error) {
        console.error('Gagal memuat layanan:', error);
        layananContentContainer.innerHTML = '<p class="text-red-500 col-span-full p-4 text-center">Gagal memuat daftar layanan. Silakan muat ulang.</p>';
    }

    function onInfoSuccess(allData) {
        const infoItems = [],
            pinItems = [],
            linkItems = [];
        
        let popupData = null;

        (allData || []).forEach(item => {
            const jenis = (getValueCaseInsensitive(item, 'jenis') || '').toLowerCase();
            if (jenis === 'info') infoItems.push(item);
            else if (jenis === 'pin') pinItems.push(item);
            else if (jenis === 'link') linkItems.push(item);
            else if (jenis === 'pop') popupData = item;
        });

        const topWrapper = document.getElementById('top-content-wrapper');
        topWrapper.className = 'flex flex-col gap-8';

        renderInfoSlider(infoItems);
        renderPinnedButtons(pinItems);
        renderQuickLinks(linkItems);

        if (popupData) {
            handleWelcomePopup(popupData);
        }
    }

    function onInfoFailure(error) {
        console.error('Gagal memuat informasi:', error);
        document.getElementById('infoContainer').innerHTML = '';
        document.getElementById('pinnedContainer').innerHTML = '';
        document.getElementById('quicklinkContainer').innerHTML = '';
    }

    function handleWelcomePopup(popupData) {
        const popupId = getValueCaseInsensitive(popupData, 'ID Pop') || getValueCaseInsensitive(popupData, 'info');
        const durationDays = parseInt(getValueCaseInsensitive(popupData, 'Durasi'), 10) || 1;
        
        const storageKey = `seenPopup_${popupId}`;
        const expiryTimestamp = localStorage.getItem(storageKey);
        const now = new Date().getTime();

        if (expiryTimestamp && now < parseInt(expiryTimestamp, 10)) {
            console.log(`Popup ${popupId} sudah dilihat. Dilewati.`);
            return;
        }

        showWelcomePopup(popupData, storageKey, durationDays);
    }

    function showWelcomePopup(popupData, storageKey, durationDays) {
        if (!welcomePopup) return;
        
        const content = document.getElementById('welcomePopupContent');
        const image = document.getElementById('welcomePopupImage');
        const text = document.getElementById('welcomePopupText');
        const linkEl = document.getElementById('welcomePopupLink');
        const closeBtn = document.getElementById('welcomePopupCloseBtn');
        const dismissBtn = document.getElementById('welcomePopupDismissBtn');

        let linkUrl = getValueCaseInsensitive(popupData, 'link') || '#';
        if (linkUrl && !linkUrl.startsWith('http')) {
            linkUrl = 'https://' + linkUrl;
        }

        image.src = getValueCaseInsensitive(popupData, 'gambar') || '';
        text.textContent = getValueCaseInsensitive(popupData, 'info') || '';
        linkEl.href = linkUrl;

        const hideAndSetSeen = () => {
            content.classList.remove('scale-100', 'opacity-100');
            content.classList.add('scale-95', 'opacity-0');
            setTimeout(() => {
                welcomePopup.classList.add('hidden');
                const now = new Date().getTime();
                const expiry = now + durationDays * 24 * 60 * 60 * 1000;
                localStorage.setItem(storageKey, expiry.toString());
            }, 300);
        };

        closeBtn.onclick = hideAndSetSeen;
        dismissBtn.onclick = hideAndSetSeen;
        linkEl.onclick = hideAndSetSeen;

        welcomePopup.classList.remove('hidden');
        setTimeout(() => {
            content.classList.add('scale-100', 'opacity-100');
        }, 10);
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

    // --- FUNGSI RENDER LAYANAN (DIMODIFIKASI) ---
    function renderLayananByFilter(filterType) {
        layananContentContainer.innerHTML = ''; // Membersihkan kontainer utama
        
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
                if (!acc[kategori]) acc[kategori] = [];
                acc[kategori].push(layanan);
            });
            return acc;
        }, {});

        // Loop melalui setiap kategori dan render sebagai blok terpisah
        for (const kategori in groupedLayananData) {
            // 1. Buat kontainer untuk blok kategori
            const categoryBlock = document.createElement('div');
            categoryBlock.className = 'mb-8';

            // 2. Buat dan tambahkan judul kategori
            const categoryTitle = document.createElement('h2');
            // PERUBAHAN: Menyamakan ukuran font dengan Quick Links
            categoryTitle.className = 'text-base font-semibold text-brand-green mb-4 border-b pb-2';
            categoryTitle.textContent = kategori;
            categoryBlock.appendChild(categoryTitle);

            // 3. Buat grid untuk ikon-ikon layanan
            const iconsGrid = document.createElement('div');
            iconsGrid.className = "grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 text-center";

            const colorPalette = [
                { bg: '#eff6ff', text: '#1d4ed8' }, { bg: '#f0fdf4', text: '#15803d' },
                { bg: '#fffbeb', text: '#b45309' }, { bg: '#f5f3ff', text: '#6d28d9' },
                { bg: '#fff1f2', text: '#be123c' }, { bg: '#eef2ff', text: '#4338ca' }
            ];

            // 4. Loop melalui setiap layanan dalam kategori dan buat ikonnya
            groupedLayananData[kategori].forEach((layanan, i) => {
                const jenisLayanan = (getValueCaseInsensitive(layanan, 'jenis') || '').toLowerCase();
                const linkUrl = getValueCaseInsensitive(layanan, 'link');
                const layananNama = getValueCaseInsensitive(layanan, 'jenis layanan');
                
                const serviceItem = document.createElement(jenisLayanan === 'link' && linkUrl ? 'a' : 'div');
                serviceItem.className = "flex flex-col items-center space-y-2 cursor-pointer group";
                
                serviceItem.dataset.item = layananNama;
                if (jenisLayanan === 'link' && linkUrl) {
                    serviceItem.href = linkUrl;
                    serviceItem.target = '_blank';
                    serviceItem.rel = 'noopener noreferrer';
                    serviceItem.dataset.tipe = "Klik Layanan (Link)";
                } else {
                    serviceItem.dataset.tipe = "Buka Form Layanan";
                }
                
                const customColor = getValueCaseInsensitive(layanan, 'warna');
                let bgColor, textColor;

                if (customColor) {
                    bgColor = customColor;
                    textColor = getTextColorForBg(customColor);
                } else {
                    const randomColor = colorPalette[i % colorPalette.length];
                    bgColor = randomColor.bg;
                    textColor = randomColor.text;
                }

                serviceItem.innerHTML = `
                    <div class="w-16 h-16 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110" style="background-color:${bgColor}; color:${textColor};">
                        <i class="fas fa-${getIconForLayanan(layanan)}"></i>
                    </div>
                    <h3 class="font-medium text-xs text-gray-700">${layananNama}</h3>`;
                
                if (jenisLayanan !== 'link') {
                    Object.assign(serviceItem.dataset, {
                        formFields: getValueCaseInsensitive(layanan, 'form') || '',
                        layananName: layananNama || '',
                        pengolah: getValueCaseInsensitive(layanan, 'pengolah') || '',
                        jenis: jenisLayanan || '',
                        sheet: getValueCaseInsensitive(layanan, 'sheet') || '',
                        sheetId: getValueCaseInsensitive(layanan, 'Sheet ID') || '',
                        keterangan: getValueCaseInsensitive(layanan, 'keterangan') || ''
                    });
                    if (serviceItem.dataset.jenis.toLowerCase() === 'kalender') {
                        serviceItem.addEventListener('click', openCalendarModal);
                    } else {
                        serviceItem.addEventListener('click', openFormModal);
                    }
                }
                iconsGrid.appendChild(serviceItem);
            });

            // 5. Tambahkan grid ikon ke blok kategori, dan blok kategori ke kontainer utama
            categoryBlock.appendChild(iconsGrid);
            layananContentContainer.appendChild(categoryBlock);
        }
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
                const layananNama = getValueCaseInsensitive(layanan, 'jenis layanan');
                button.textContent = layananNama;

                button.dataset.tipe = "Buka Form Layanan (Cepat)";
                button.dataset.item = layananNama;
                
                Object.assign(button.dataset, {
                    formFields: getValueCaseInsensitive(layanan, 'form') || '',
                    layananName: layananNama || '',
                    pengolah: getValueCaseInsensitive(layanan, 'pengolah') || '',
                    jenis: getValueCaseInsensitive(layanan, 'jenis') || '',
                    sheet: getValueCaseInsensitive(layanan, 'sheet') || '',
                    sheetId: getValueCaseInsensitive(layanan, 'Sheet ID') || '',
                    keterangan: getValueCaseInsensitive(layanan, 'keterangan') || ''
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
                
                const dataAttrs = `data-tipe="Klik Info" data-item="${infoText}"`;

                let cardHtml = '';
                if (gambar) {
                    cardHtml = `<a href="${link}" ${dataAttrs} target="_blank" rel="noopener noreferrer" class="block w-full h-full rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"><img src="${gambar}" alt="${infoText}" class="w-full h-full object-cover aspect-[2.35/1]" onerror="this.parentElement.style.display='none'"/><p class="hidden">${infoText}</p></a>`;
                } else {
                    let bgColorStyle = `style="background-color: ${warna || '#10b981'}"`;
                    let textColorClass = getTextColorForBg(warna);
                    let iconBgStyle = `style="background-color: rgba(0,0,0,0.2)"`;
                    cardHtml = `<a href="${link}" ${dataAttrs} target="_blank" rel="noopener noreferrer" class="flex items-start p-3 rounded-xl shadow-sm hover:opacity-90 transition-opacity duration-300 h-full ${textColorClass}" ${bgColorStyle}>
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
        new Swiper('.info-swiper', {
            loop: isSliderActive,
            autoplay: isSliderActive ? { delay: 4000, disableOnInteraction: false } : false,
            slidesPerView: 1,
            spaceBetween: 24,
            grabCursor: true,
            pagination: { el: '.swiper-pagination', clickable: true },
            breakpoints: { 768: { slidesPerView: 1 } }
        });
        infoSlider.classList.toggle('info-grid', !isSliderActive);
    }
    function renderPinnedButtons(data) { 
        const pinnedWrapper = document.getElementById('pinnedContainer');
        const pinnedSection = document.getElementById('pinned-section');
        const pinnedTitle = document.getElementById('pinned-section-title');
        pinnedWrapper.innerHTML = '';

        if (!data || data.length === 0) {
            if (pinnedSection) pinnedSection.style.display = 'none';
            return;
        }
        if (pinnedSection) pinnedSection.style.display = 'block';
        if (pinnedTitle) pinnedTitle.classList.remove('hidden');

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
                
                button.dataset.tipe = "Klik Pin";
                button.dataset.item = infoText;

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
                
                quickLink.dataset.tipe = "Klik Quicklink";
                quickLink.dataset.item = infoText;

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
    
    function openFormModal(event) { 
        const card = event.currentTarget;
        const { formFields, layananName, pengolah, sheet, sheetId, keterangan } = card.dataset;
        if (!formFields || !sheet) return;
        modalTitle.textContent = `Formulir ${layananName}`;
        const allFields = formFields.split(',').map(field => field.trim());
        permohonanForm.dataset.targetSheet = sheet;
        permohonanForm.dataset.targetSheetId = sheetId;
        
        const lowerLayananName = layananName.toLowerCase();

        // ROUTER UNTUK MEMANGGIL FUNGSI RENDER YANG TEPAT
        if (lowerLayananName.includes('suket alumni')) { // PERUBAHAN: Kondisi spesifik untuk 'Suket Alumni'
            renderSuketAlumniForm(allFields, layananName);
        } else if (lowerLayananName.includes('suket lulus')) {
            renderSuketLulusForm(allFields, layananName);
        } else if (lowerLayananName.includes('bebas beasiswa')) {
            renderBebasBeasiswaForm(allFields, layananName);
        } else if (lowerLayananName.includes('lacak sk')) {
            renderLacakSkSeForm(allFields, pengolah, layananName);
        } else if (lowerLayananName.includes('suket')) { // Kondisi umum untuk 'suket' lainnya
            renderSuketKuliahForm(allFields, pengolah, layananName);
        } else if (lowerLayananName.includes('peminjaman')) {
            renderPeminjamanForm(allFields, pengolah, layananName);
        } else if (lowerLayananName.includes('pengaduan')) {
            renderPengaduanForm(allFields, pengolah, layananName);
        } else {
            renderGenericForm(allFields, pengolah, layananName);
        }

        if (keterangan && keterangan.trim() !== '') {
            const keteranganHtml = `
                <div class="mb-6 text-sm bg-blue-50 border-l-4 border-blue-400 text-blue-800 p-4 rounded-r-lg" role="alert">
                    <p class="font-bold mb-2">Informasi:</p>
                    <div>${keterangan.replace(/\n/g, '<br>')}</div>
                </div>
            `;
            permohonanForm.insertAdjacentHTML('afterbegin', keteranganHtml);
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

        const jenisLayanan = dataObject['Jenis Layanan'] || '';
        const unitKerja = dataObject['Unit Kerja Layanan'] || '';

        if (jenisLayanan.toLowerCase().includes('suket kuliah') && unitKerja === 'Rektorat') {
            dataObject['Pengolah'] = 'LA';
        }

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

                    // --- TAMBAHAN UNTUK REDIRECT WA ---
                    try {
                        const waNumber = '6285117769733'; // Nomor tujuan WA Anda
                        
                        // Ambil data dari variabel 'dataObject' yang ada di scope atas fungsi ini
                        // CATATAN: Pastikan name="" di HTML Anda sesuai (lihat penjelasan di bawah)
                        const nama = dataObject['Nama'] || '[Nama tidak diisi]';
                        const kontak = dataObject['Kontak'] || '[Kontak tidak diisi]';
                        const pesan = dataObject['Pesan'] || '[Pesan tidak diisi]';

                        // Format pesan (\n adalah untuk baris baru)
                       const waMessageText = `--- Laporan Help Desk ---\n\n` +
                            `Nama: ${nama}\n` +
                            `Kontak: ${kontak}\n\n` +
                            `Pesan:\n${pesan}`;
                        
                        // Buat URL dan encode pesannya agar aman di URL
                        const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessageText)}`;
                        
                        // Buka WA di tab baru
                        window.open(waUrl, '_blank');

                    } catch (waError) {
                        console.error("Gagal mengarahkan ke WA:", waError);
                    }
                    // --- AKHIR TAMBAHAN ---

                    // Pesan notifikasi diubah sedikit untuk memberitahu pengguna
                    showNotificationModal('Berhasil', 'Pesan Anda telah terkirim. Anda akan diarahkan ke WhatsApp.', 'success');
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
                
                if (calendarFilter.options.length <= 1) {
                    const pengolahSet = new Set(validEvents.map(e => getValueCaseInsensitive(e.extendedProps, 'pengolah')).filter(Boolean));
                    pengolahSet.forEach(pengolah => {
                        const option = new Option(pengolah, pengolah);
                        calendarFilter.add(option);
                    });
                }
                
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
                titleFormat: { month: 'short', year: 'numeric' },
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
                        let value;
                        const fieldLower = field.toLowerCase().trim();

                        if (fieldLower === 'tanggal mulai') {
                            const startDate = info.event.start;
                            if (startDate) {
                                const day = String(startDate.getDate()).padStart(2, '0');
                                const month = String(startDate.getMonth() + 1).padStart(2, '0');
                                const year = startDate.getFullYear();
                                value = `${day}/${month}/${year}`;
                            } else {
                                value = getValueCaseInsensitive(props, field); // Fallback
                            }
                        } else if (fieldLower === 'tanggal selesai') {
                            const endDate = info.event.end;
                            if (endDate) {
                                const correctedEndDate = new Date(endDate.getTime());
                                correctedEndDate.setDate(correctedEndDate.getDate() - 1);

                                const day = String(correctedEndDate.getDate()).padStart(2, '0');
                                const month = String(correctedEndDate.getMonth() + 1).padStart(2, '0');
                                const year = correctedEndDate.getFullYear();
                                value = `${day}/${month}/${year}`;
                            } else {
                                value = getValueCaseInsensitive(props, field); // Fallback
                            }
                        } else {
                            value = getValueCaseInsensitive(props, field);
                        }

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
        mobileTrackingResult.innerHTML = '';
        const permohonanId = document.getElementById('mobilePermohonanId').value;
        const selectedOption = document.getElementById('mobileSelectedServiceValue').value;

        if (!selectedOption) {
            onTrackSuccess({ error: 'Silakan pilih jenis layanan melalui tombol filter.' }, 'mobile');
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
        const resultContainer = view === 'desktop' ? trackingResult : mobileTrackingResult;
        let content = '';

        if (!result) {
            content = `<div class="p-4 bg-yellow-100 text-yellow-800 rounded-lg relative">ID Permohonan tidak ditemukan.</div>`;
        } else if (result.error) {
            content = `<div class="p-4 bg-red-100 text-red-700 rounded-lg relative">${result.error}</div>`;
        } else {
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
                    if (key.toLowerCase().trim() === 'file') {
                        if (typeof value === 'string' && value.startsWith('http')) {
                            return `<div class="flex flex-col sm:col-span-2"><dt class="text-sm font-medium text-gray-500">${key}</dt><dd class="text-sm mt-1"><a href="${value}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center px-4 py-2 bg-brand-green text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity shadow-sm"><i class="fas fa-download mr-2"></i>Download File</a></dd></div>`;
                        } else {
                            return ''; 
                        }
                    }
                    
                    return `<div class="flex flex-col"><dt class="text-sm font-medium text-gray-500">${key}</dt><dd class="text-sm">${value}</dd></div>`;
                })
                .join('');
            content = `
            <div class="p-4 ${bgColorClass} rounded-lg relative">
                <p class="font-semibold">Status untuk ID: ${idPermohonan}</p>
                <p class="text-2xl font-bold">${status}</p>
                <dl class="mt-4 border-t border-gray-200 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">${detailsHtml}</dl>
            </div>`;
        }
        resultContainer.innerHTML = content.replace('</div>', '<button class="js-close-track-result absolute top-2 right-3 text-gray-500 hover:text-gray-800 text-2xl font-bold">&#215;</button></div>');
    }
    function onTrackFailure(error, view = 'desktop') { 
        setTrackingLoading(false, view === 'desktop' ? 'trackButton' : 'mobileTrackButton');
        const resultContainer = view === 'desktop' ? trackingResult : mobileTrackingResult;
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

