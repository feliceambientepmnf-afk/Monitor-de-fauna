/**
 * Data Persistence Layer
 */

const STORAGE_KEYS = {
    CAMERAS: 'wildlife_cameras',
    VISITS: 'wildlife_visits',
    SIGHTINGS: 'wildlife_sightings',
    SPECIES: 'wildlife_species_v2',
    LOCATIONS: 'wildlife_locations'
};

const DEFAULT_SPECIES = [
    { scientific: 'Tetragonisca angustula', common: 'Jataí' },
    { scientific: 'Melipona quadrifasciata', common: 'Mandaçaia' },
    { scientific: 'Diaethria sp.', common: 'Borboleta 88' },
    { scientific: 'Phoneutria sp.', common: 'Aranha-armadeira' },
    { scientific: 'Eira barbara', common: 'Irara' },
    { scientific: 'Galictis cuja', common: 'Furão-pequeno' },
    { scientific: 'Lontra longicaudis', common: 'Lontra' },
    { scientific: 'Cerdocyon thous', common: 'Cachorro-do-mato' },
    { scientific: 'Herpailurus yagouaroundi', common: 'Gato-mourisco' },
    { scientific: 'Puma concolor', common: 'Onça-parda' },
    { scientific: 'Leopardus pardalis', common: 'Jaguatirica' },
    { scientific: 'Leopardus guttulus', common: 'Gato-do-mato-pequeno' },
    { scientific: 'Leopardus wiedii', common: 'Gato-maracajá' },
    { scientific: 'Nasua nasua', common: 'Quati-de-cauda-anelada' },
    { scientific: 'Procyon cancrivorus', common: 'Mão-pelada' },
    { scientific: 'Didelphis aurita', common: 'Gambá-de-orelha-preta' },
    { scientific: 'Guerlinguetus brasiliensis', common: 'Esquilo-caxinguelê' },
    { scientific: 'Coendou prehensilis', common: 'Ouriço-cacheiro' },
    { scientific: 'Hydrochoerus hydrochaeris', common: 'Capivara' },
    { scientific: 'Cuniculus paca', common: 'Paca' },
    { scientific: 'Sylvilagus sp.', common: 'Tapiti' },
    { scientific: 'Tamandua tetradactyla', common: 'Tamanduá-mirim' },
    { scientific: 'Callithrix aurita', common: 'Sagui-da-serra-escuro' },
    { scientific: 'Salvator merianae', common: 'Teiú' },
    { scientific: 'Procnias nudicollis', common: 'Araponga' },
    { scientific: 'Cyanoloxia brissonii', common: 'Azulão' },
    { scientific: 'Tangara seledon', common: 'Saíra-sete-cores' },
    { scientific: 'Ramphastos dicolorus', common: 'Tucano-de-bico-verde' },
    { scientific: 'Penelope obscura', common: 'Jacuaçu' },
    { scientific: 'Crypturellus tataupa', common: 'Inhambu-chintã' },
    { scientific: 'Tinamus solitarius', common: 'Macuco' },
    { scientific: 'Caracara plancus', common: 'Carcará' },
    { scientific: 'Rupornis magnirostris', common: 'Gavião-carijó' },
    { scientific: 'Vanellus chilensis', common: 'Quero-quero' },
    { scientific: 'Cariama cristata', common: 'Seriema' }
];

class DataStore {
    constructor() {
        this.init();
    }

    init() {
        if (!localStorage.getItem(STORAGE_KEYS.SPECIES)) {
            localStorage.setItem(STORAGE_KEYS.SPECIES, JSON.stringify(DEFAULT_SPECIES));
        }
        if (!localStorage.getItem(STORAGE_KEYS.CAMERAS)) localStorage.setItem(STORAGE_KEYS.CAMERAS, JSON.stringify([]));
        if (!localStorage.getItem(STORAGE_KEYS.VISITS)) localStorage.setItem(STORAGE_KEYS.VISITS, JSON.stringify([]));
        if (!localStorage.getItem(STORAGE_KEYS.SIGHTINGS)) localStorage.setItem(STORAGE_KEYS.SIGHTINGS, JSON.stringify([]));
        if (!localStorage.getItem(STORAGE_KEYS.LOCATIONS)) localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify([]));
    }

    _get(key) {
        return JSON.parse(localStorage.getItem(key) || '[]');
    }

    _save(key, data) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    // --- Locations ---
    getLocations() {
        return this._get(STORAGE_KEYS.LOCATIONS);
    }
    addLocation(location) {
        const locations = this.getLocations();
        const newLoc = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...location };
        locations.push(newLoc);
        this._save(STORAGE_KEYS.LOCATIONS, locations);
        return newLoc;
    }
    updateLocation(id, updates) {
        let locations = this.getLocations();
        const idx = locations.findIndex(l => l.id === id);
        if (idx !== -1) {
            locations[idx] = { ...locations[idx], ...updates };
            this._save(STORAGE_KEYS.LOCATIONS, locations);
        }
    }
    deleteLocation(id) {
        let locations = this.getLocations();
        locations = locations.filter(l => l.id !== id);
        this._save(STORAGE_KEYS.LOCATIONS, locations);
        let cameras = this.getCameras();
        cameras.forEach(c => { if (c.locationId === id) delete c.locationId; });
        this._save(STORAGE_KEYS.CAMERAS, cameras);
    }
    getLocation(id) {
        return this.getLocations().find(l => l.id === id);
    }

    // --- Cameras ---
    getCameras() {
        return this._get(STORAGE_KEYS.CAMERAS);
    }
    addCamera(camera) {
        const cameras = this.getCameras();
        const newCamera = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...camera };
        cameras.push(newCamera);
        this._save(STORAGE_KEYS.CAMERAS, cameras);
        return newCamera;
    }
    updateCamera(id, updates) {
        let cameras = this.getCameras();
        const idx = cameras.findIndex(c => c.id === id);
        if (idx !== -1) {
            cameras[idx] = { ...cameras[idx], ...updates };
            this._save(STORAGE_KEYS.CAMERAS, cameras);
        }
    }
    deleteCamera(id) {
        let cameras = this.getCameras();
        cameras = cameras.filter(c => c.id !== id);
        this._save(STORAGE_KEYS.CAMERAS, cameras);
    }
    getCamera(id) {
        return this.getCameras().find(c => c.id === id);
    }

    // --- Visits ---
    getVisits(cameraId) {
        const visits = this._get(STORAGE_KEYS.VISITS);
        if (cameraId) return visits.filter(v => v.trapId === cameraId);
        return visits;
    }
    addVisit(visit) {
        const visits = this.getVisits();
        const newVisit = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...visit };
        visits.push(newVisit);
        this._save(STORAGE_KEYS.VISITS, visits);
        return newVisit;
    }
    updateVisit(id, updates) {
        let visits = this.getVisits();
        const idx = visits.findIndex(v => v.id === id);
        if (idx !== -1) {
            visits[idx] = { ...visits[idx], ...updates };
            this._save(STORAGE_KEYS.VISITS, visits);
        }
    }
    deleteVisit(id) {
        let visits = this.getVisits();
        visits = visits.filter(v => v.id !== id);
        this._save(STORAGE_KEYS.VISITS, visits);
    }
    getVisit(id) {
        return this.getVisits().find(v => v.id === id);
    }

    // --- Sightings ---
    getSightings(visitId) {
        const sightings = this._get(STORAGE_KEYS.SIGHTINGS);
        if (visitId) return sightings.filter(s => s.visitId === visitId);
        return sightings;
    }
    addSighting(sighting) {
        const sightings = this.getSightings();
        const newSighting = { id: crypto.randomUUID(), createdAt: new Date().toISOString(), ...sighting };
        sightings.push(newSighting);
        this._save(STORAGE_KEYS.SIGHTINGS, sightings);
        return newSighting;
    }
    updateSighting(id, updates) {
        let sightings = this.getSightings();
        const idx = sightings.findIndex(s => s.id === id);
        if (idx !== -1) {
            sightings[idx] = { ...sightings[idx], ...updates };
            this._save(STORAGE_KEYS.SIGHTINGS, sightings);
        }
    }
    deleteSighting(id) {
        let sightings = this.getSightings();
        sightings = sightings.filter(s => s.id !== id);
        this._save(STORAGE_KEYS.SIGHTINGS, sightings);
    }
    getSighting(id) {
        return this.getSightings().find(s => s.id === id);
    }

    // --- Species ---
    getSpeciesList() {
        let list = this._get(STORAGE_KEYS.SPECIES);
        list.sort((a, b) => a.common.localeCompare(b.common));
        return list;
    }
    addSpecies(common, scientific) {
        const list = this.getSpeciesList();
        const exists = list.some(s => s.common.toLowerCase() === common.toLowerCase());
        if (!exists) {
            list.push({ common, scientific });
            this._save(STORAGE_KEYS.SPECIES, list);
        }
    }
    updateSpecies(common, updates) {
        let list = this.getSpeciesList();
        const idx = list.findIndex(s => s.common === common);
        if (idx !== -1) {
            list[idx] = { ...list[idx], ...updates };
            this._save(STORAGE_KEYS.SPECIES, list);
        }
    }

    // --- Backup & Restore ---
    exportBackup() {
        const backup = {};
        for (let key in STORAGE_KEYS) {
            backup[STORAGE_KEYS[key]] = JSON.parse(localStorage.getItem(STORAGE_KEYS[key]) || '[]');
        }
        return JSON.stringify(backup, null, 2);
    }

    restoreBackup(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            for (let key in STORAGE_KEYS) {
                if (data[STORAGE_KEYS[key]]) {
                    localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data[STORAGE_KEYS[key]]));
                }
            }
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // --- Reporting ---
    querySightings(filters) {
        const allSightings = this.getSightings();
        const allVisits = this.getVisits();
        const allCameras = this.getCameras();
        const allLocations = this.getLocations();

        let results = allSightings.map(s => {
            const visit = allVisits.find(v => v.id === s.visitId);
            if (!visit) return null;
            const camera = allCameras.find(c => c.id === visit.trapId);
            if (!camera) return null;
            const location = camera.locationId ? allLocations.find(l => l.id === camera.locationId) : null;

            return {
                ...s,
                visitDate: visit.timestamp,
                cameraName: camera.name,
                cameraId: camera.id,
                locationName: location ? location.name : 'Sem Localidade',
                locationId: location ? location.id : null
            };
        }).filter(r => r !== null);

        if (filters.species && filters.species !== 'all') results = results.filter(r => r.species === filters.species);
        if (filters.locationId && filters.locationId !== 'all') results = results.filter(r => r.locationId === filters.locationId);
        if (filters.cameraId && filters.cameraId !== 'all') results = results.filter(r => r.cameraId === filters.cameraId);
        if (filters.startDate) results = results.filter(r => new Date(r.visitDate).getTime() >= new Date(filters.startDate).getTime());
        if (filters.endDate) {
            const end = new Date(filters.endDate);
            end.setHours(23, 59, 59, 999);
            results = results.filter(r => new Date(r.visitDate).getTime() <= end.getTime());
        }

        return results;
    }
}

const store = new DataStore();

/**
 * Application Logic
 */

const appState = {
    currentView: 'dashboard',
    selectedCameraId: null,
    selectedVisitId: null,
    selectedLocationId: null,
    dashboardLocationFilter: 'all',
    lastReportResults: []
};

let dom = {};
let mapInstance = null;
let charts = [];

function init() {
    dom = {
        mainContent: document.getElementById('main-content'),
        navBtns: document.querySelectorAll('.nav-btn'),
        fab: document.getElementById('fab-add'),
        modalContainer: document.getElementById('modal-container')
    };

    setupEventListeners();
    renderView('dashboard');
}

function setupEventListeners() {
    dom.navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.target.closest('.nav-btn');
            const view = target.dataset.view;
            switchView(view);
        });
    });

    dom.fab.addEventListener('click', () => {
        handleMainAction();
    });

    dom.modalContainer.addEventListener('click', (e) => {
        if (e.target === dom.modalContainer) closeModal();
    });

    document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;

        if (btn.classList.contains('close-modal')) closeModal();
        if (btn.classList.contains('view-visits-btn')) renderCameraVisits(btn.dataset.id);
        if (btn.dataset.to === 'cameras') switchView('cameras');
        if (btn.dataset.to === 'locations') switchView('locations');
        if (btn.classList.contains('delete-btn')) {
            e.stopPropagation();
            confirmDelete(btn.dataset.type, btn.dataset.id);
        }
        if (btn.classList.contains('edit-btn')) {
            e.stopPropagation();
            openEditModal(btn.dataset.type, btn.dataset.id);
        }
    });

    document.addEventListener('change', (e) => {
        if (e.target.id === 'dashboard-loc-filter') {
            appState.dashboardLocationFilter = e.target.value;
            renderDashboard();
        }
    });
}

function switchView(viewName) {
    appState.currentView = viewName;
    appState.selectedLocationId = null;

    dom.navBtns.forEach(btn => {
        if (btn.dataset.view === viewName) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Hide FAB on settings, reports and gallery
    dom.fab.style.display = (['settings', 'reports', 'gallery'].includes(viewName)) ? 'none' : 'flex';

    renderView(viewName);
}

function renderView(viewName) {
    dom.mainContent.innerHTML = '';

    // Cleanup
    if (mapInstance) { mapInstance.remove(); mapInstance = null; }
    charts.forEach(c => c.destroy());
    charts = [];

    if (viewName === 'dashboard') renderDashboard();
    else if (viewName === 'cameras') renderCameraList();
    else if (viewName === 'locations') renderLocationList();
    else if (viewName === 'gallery') renderGallery();
    else if (viewName === 'reports') renderReports();
    else if (viewName === 'settings') renderSettings();
}

// --- Species Gallery ---

function renderGallery() {
    const species = store.getSpeciesList();
    let html = `
        <h1 style="font-size: 2rem; margin-bottom: 24px;">Galeria de Espécies</h1>
        <div class="grid">
    `;

    species.forEach(sp => {
        let imgHtml = '';
        if (sp.imageUrl) {
            imgHtml = `<div class="species-image" style="background-image: url('${sp.imageUrl}')"></div>`;
        } else {
            imgHtml = `<div class="species-placeholder"><ion-icon name="image-outline"></ion-icon></div>`;
        }

        html += `
            <div class="card">
                <div class="species-image-container">
                    ${imgHtml}
                </div>
                <div class="species-card-header">
                    <div>
                        <h3 style="margin-bottom: 4px;">${sp.common}</h3>
                        <p style="font-style: italic; color: var(--text-secondary); margin-bottom: 0;">${sp.scientific || ''}</p>
                    </div>
                    <button class="btn btn-secondary btn-icon-sm" onclick="window.editSpecies('${sp.common}')">
                        <ion-icon name="pencil-outline"></ion-icon>
                    </button>
                </div>
            </div>
        `;
    });

    html += `</div>`;
    dom.mainContent.innerHTML = html;
}

window.editSpecies = (common) => {
    const sp = store.getSpeciesList().find(s => s.common === common);
    if (!sp) return;

    dom.modalContainer.innerHTML = `
        <div class="modal-content">
            <h2>Editar Espécie</h2>
            <form id="f">
                <div class="form-group">
                    <label>Nome Popular</label>
                    <input value="${sp.common}" class="form-control" disabled>
                </div>
                <div class="form-group">
                    <label>Nome Científico</label>
                    <input name="sci" value="${sp.scientific || ''}" class="form-control">
                </div>
                
                <div class="form-group">
                    <label>Imagem</label>
                    <div id="drop-zone" class="drop-zone">
                        <ion-icon name="cloud-upload-outline"></ion-icon>
                        <p id="drop-text">Arraste uma imagem ou clique para selecionar</p>
                        <input type="file" id="file-input" accept="image/*" style="display: none;">
                    </div>
                </div>

                <div class="form-group">
                    <label>Ou URL da Imagem</label>
                    <input name="img" value="${sp.imageUrl || ''}" placeholder="https://..." class="form-control">
                </div>
                <button type="submit" class="btn btn-primary" id="save-btn">Salvar</button>
            </form>
        </div>
    `;
    dom.modalContainer.classList.remove('hidden');

    // Drag and Drop Logic
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const dropText = document.getElementById('drop-text');
    let selectedFile = null;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileSelect(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleFileSelect(fileInput.files[0]);
        }
    });

    function handleFileSelect(file) {
        if (!file.type.startsWith('image/')) {
            alert('Por favor, selecione uma imagem.');
            return;
        }
        selectedFile = file;
        dropText.textContent = `Arquivo selecionado: ${file.name}`;
        dropText.style.color = 'var(--accent-color)';
    }

    document.getElementById('f').onsubmit = async (e) => {
        e.preventDefault();
        const btn = document.getElementById('save-btn');
        const urlInput = e.target.img;

        btn.disabled = true;
        btn.textContent = 'Processando...';

        let finalImageUrl = urlInput.value;

        if (selectedFile) {
            try {
                finalImageUrl = await compressImage(selectedFile);
            } catch (err) {
                console.error("Erro ao processar imagem", err);
                alert("Erro ao processar a imagem.");
                btn.disabled = false;
                btn.textContent = 'Salvar';
                return;
            }
        }

        store.updateSpecies(common, {
            scientific: e.target.sci.value,
            imageUrl: finalImageUrl
        });

        closeModal();
        renderGallery();
    };
};

function compressImage(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
            };
            img.onerror = reject;
            img.src = event.target.result;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// --- Dashboard ---

function renderDashboard() {
    const locations = store.getLocations();
    let cameras = store.getCameras();
    let visits = store.getVisits();
    let allSightings = store.querySightings({
        species: 'all', locationId: appState.dashboardLocationFilter, startDate: null, endDate: null
    });

    if (appState.dashboardLocationFilter !== 'all') {
        cameras = cameras.filter(c => c.locationId === appState.dashboardLocationFilter);
        const camIds = cameras.map(c => c.id);
        visits = visits.filter(v => camIds.includes(v.trapId));
    }

    const uniqueSpecies = [...new Set(allSightings.map(s => s.species))];

    // --- Stats Logic ---
    const richnessLabels = [];
    const richnessData = [];
    let richnessTitle = '';

    if (appState.dashboardLocationFilter === 'all') {
        richnessTitle = 'Riqueza Spp. por Localidade';
        locations.forEach(loc => {
            const locSightings = store.querySightings({ locationId: loc.id, species: 'all' });
            const spp = new Set(locSightings.map(s => s.species));
            if (spp.size > 0) { richnessLabels.push(loc.name); richnessData.push(spp.size); }
        });
        // Orphaned
        const orphanSightings = store.querySightings({ species: 'all' }).filter(s => !s.locationId);
        if (orphanSightings.length > 0) {
            const orphanSpp = new Set(orphanSightings.map(s => s.species));
            if (orphanSpp.size > 0) { richnessLabels.push('Sem Local'); richnessData.push(orphanSpp.size); }
        }

    } else {
        richnessTitle = 'Riqueza Spp. por Câmera';
        cameras.forEach(cam => {
            const camSightings = allSightings.filter(s => s.cameraId === cam.id);
            const spp = new Set(camSightings.map(s => s.species));
            if (spp.size > 0) { richnessLabels.push(cam.name); richnessData.push(spp.size); }
        });
    }

    const speciesCounts = {};
    allSightings.forEach(s => { speciesCounts[s.species] = (speciesCounts[s.species] || 0) + s.count; });
    const sortedSpecies = Object.entries(speciesCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    const compLabels = sortedSpecies.map(x => x[0]);
    const compData = sortedSpecies.map(x => x[1]);

    // --- Temporal Stats (Visits per Month) ---
    const visitsByMonth = {};
    const sightingsByMonth = {};

    visits.forEach(v => {
        const d = new Date(v.timestamp);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        visitsByMonth[key] = (visitsByMonth[key] || 0) + 1;
    });

    allSightings.forEach(s => {
        const d = new Date(s.visitDate);
        if (!isNaN(d.getTime())) {
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            sightingsByMonth[key] = (sightingsByMonth[key] || 0) + s.count;
        }
    });

    const sortedMonths = Object.keys(visitsByMonth).sort();
    // Merge months from sightings too in case there are sightings without visits (unlikely but safe)
    const allMonths = new Set([...sortedMonths, ...Object.keys(sightingsByMonth)]);
    const finalMonths = [...allMonths].sort();

    const tempLabels = finalMonths;
    const tempDataVisits = finalMonths.map(m => visitsByMonth[m] || 0);
    const tempDataSightings = finalMonths.map(m => sightingsByMonth[m] || 0);

    const locOptions = locations.map(l => `<option value="${l.id}" ${appState.dashboardLocationFilter === l.id ? 'selected' : ''}>${l.name}</option>`).join('');

    const html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
            <h1 style="font-size: 2rem; margin:0;">Painel</h1>
            <select id="dashboard-loc-filter" class="form-control" style="width: auto;">
                <option value="all">Todas as Localidades</option>
                ${locOptions}
            </select>
        </div>
        
        <div class="grid">
            <div class="card"><h3>Câmeras</h3><p style="font-size: 2.5rem; color: var(--accent-color); font-weight: bold;">${cameras.length}</p></div>
            <div class="card"><h3>Visitas Total</h3><p style="font-size: 2.5rem; color: var(--text-primary); font-weight: bold;">${visits.length}</p></div>
            <div class="card"><h3>Espécies Totais</h3><p style="font-size: 2.5rem; color: #FF9800; font-weight: bold;">${uniqueSpecies.length}</p></div>
            
            <div class="card" style="grid-column: span 1 / span 2; min-height:300px;">
                <h3>Visitas por Mês</h3>
                <div style="height:250px; display:flex; justify-content:center;"><canvas id="chart-temporal"></canvas></div>
            </div>

            <div class="card" style="grid-column: span 1 / span 1; min-height:300px;">
                <h3>${richnessTitle}</h3>
                <div style="height:250px; display:flex; justify-content:center;"><canvas id="chart-richness"></canvas></div>
            </div>
             <div class="card" style="grid-column: span 1 / span 1; min-height:300px;">
                <h3>Top 5 Espécies (Abundância)</h3>
                <div style="height:250px; display:flex; justify-content:center;"><canvas id="chart-comp"></canvas></div>
            </div>

            <div class="card" style="grid-column: 1 / -1; height: 500px; padding: 0; overflow: hidden; position: relative;">
                <div id="map" style="width: 100%; height: 100%;"></div>
            </div>
        </div>
    `;
    dom.mainContent.innerHTML = html;

    setTimeout(() => { initCharts(richnessLabels, richnessData, compLabels, compData, tempLabels, tempDataVisits, tempDataSightings); initMap(cameras); }, 100);
}

function initCharts(richLabels, richData, compLabels, compData, tempLabels, visitData, sightingData) {
    Chart.defaults.color = '#9aa0a6';
    Chart.defaults.borderColor = '#2f343e';

    const tempChartEl = document.getElementById('chart-temporal');
    if (tempChartEl && tempLabels && tempLabels.length > 0) {
        charts.push(new Chart(tempChartEl, {
            type: 'line',
            data: {
                labels: tempLabels,
                datasets: [
                    {
                        label: 'Visitas',
                        data: visitData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        fill: true,
                        tension: 0.3
                    },
                    {
                        label: 'Avistamentos (Qtd)',
                        data: sightingData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        fill: true,
                        tension: 0.3
                    }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#9aa0a6' } } }, scales: { y: { beginAtZero: true, ticks: { precision: 0 } } } }
        }));
    } else if (tempChartEl) {
        tempChartEl.parentElement.innerHTML = "<p style='align-self:center; color:gray;'>Sem dados suficientes.</p>";
    }

    const richChartEl = document.getElementById('chart-richness');
    if (richChartEl && richLabels.length > 0) {
        charts.push(new Chart(richChartEl, {
            type: 'pie', data: { labels: richLabels, datasets: [{ data: richData, backgroundColor: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }
        }));
    } else if (richChartEl) {
        richChartEl.parentElement.innerHTML = "<p style='align-self:center; color:gray;'>Sem dados suficientes.</p>";
    }

    const compChartEl = document.getElementById('chart-comp');
    if (compChartEl && compLabels.length > 0) {
        charts.push(new Chart(compChartEl, {
            type: 'doughnut', data: { labels: compLabels, datasets: [{ data: compData, backgroundColor: ['#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50'] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right', labels: { boxWidth: 12 } } } }
        }));
    } else if (compChartEl) {
        compChartEl.parentElement.innerHTML = "<p style='align-self:center; color:gray;'>Sem dados suficientes.</p>";
    }
}

function initMap(cameras) {
    if (!cameras || cameras.length === 0) return;
    const mapEl = document.getElementById('map');
    if (!mapEl) return;

    mapInstance = L.map('map').setView([-14.2350, -51.9253], 4);
    L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', { maxZoom: 20, subdomains: ['mt0', 'mt1', 'mt2', 'mt3'], attribution: '&copy; Google Maps' }).addTo(mapInstance);
    const bounds = [];
    cameras.forEach(cam => {
        if (cam.easting && cam.northing && cam.utmZone) {
            try {
                const match = cam.utmZone.match(/(\d+)([a-zA-Z]+)/);
                if (match) {
                    const uStr = `+proj=utm +zone=${match[1]} ${match[2].toUpperCase() < 'N' ? '+south' : ''} +ellps=WGS84 +datum=WGS84 +units=m +no_defs`;
                    const [lng, lat] = proj4(uStr, 'EPSG:4326', [parseFloat(cam.easting), parseFloat(cam.northing)]);
                    if (lat && lng) { L.marker([lat, lng]).addTo(mapInstance).bindPopup(`<b>${cam.name}</b><br>${cam.model}`); bounds.push([lat, lng]); }
                }
            } catch (e) { }
        }
    });
    if (bounds.length > 0) mapInstance.fitBounds(bounds, { padding: [50, 50] });
}


// --- Reports ---

function renderReports() {
    const locations = store.getLocations();
    const cameras = store.getCameras();
    const speciesList = store.getSpeciesList();

    let html = `
        <h1 style="font-size: 2rem; margin-bottom: 24px;">Relatórios Avançados</h1>
        <div class="card" style="margin-bottom: 24px;">
            <h3>Filtros</h3>
            <form id="report-form" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-top: 16px;">
                <div class="form-group"><label>Espécie</label><select name="species" class="form-control"><option value="all">Todas</option>${speciesList.map(s => `<option value="${s.common}">${s.common}</option>`).join('')}</select></div>
                <div class="form-group"><label>Localidade</label><select name="locationId" class="form-control"><option value="all">Todas</option>${locations.map(l => `<option value="${l.id}">${l.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Câmera</label><select name="cameraId" class="form-control"><option value="all">Todas</option>${cameras.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
                <div class="form-group"><label>Data Início</label><input type="date" name="startDate" class="form-control"></div>
                <div class="form-group"><label>Data Fim</label><input type="date" name="endDate" class="form-control"></div>
                <div style="grid-column: 1/-1; display:flex; justify-content:flex-end;"><button type="submit" class="btn btn-primary">Gerar Relatório</button></div>
            </form>
        </div>
        <div id="report-results"></div>
    `;

    dom.mainContent.innerHTML = html;
    document.getElementById('report-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const fd = new FormData(e.target);
        renderReportResults(store.querySightings({
            species: fd.get('species'),
            locationId: fd.get('locationId'),
            cameraId: fd.get('cameraId'),
            startDate: fd.get('startDate'),
            endDate: fd.get('endDate')
        }));
    });
}

function renderReportResults(results) {
    appState.lastReportResults = results;
    const container = document.getElementById('report-results');
    if (results.length === 0) { container.innerHTML = `<div class="card" style="text-align:center; padding:40px;">Nenhum resultado encontrado.</div>`; return; }
    let html = `
        <div class="card">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                <h3 style="margin:0;">Resultados (${results.length})</h3>
                <button onclick="window.exportReportToExcel()" class="btn btn-secondary" style="display:flex; align-items:center; gap:8px;"><ion-icon name="download-outline"></ion-icon> Baixar Excel</button>
            </div>
            <div style="overflow-x: auto;">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead><tr style="border-bottom: 2px solid var(--border-color);"><th style="padding: 12px;">Data</th><th style="padding: 12px;">Espécie</th><th style="padding: 12px;">Nome Científico</th><th style="padding: 12px;">Qtd</th><th style="padding: 12px;">Câmera</th><th style="padding: 12px;">Local</th></tr></thead>
                    <tbody>${results.map(r => `<tr style="border-bottom: 1px solid var(--border-color);"><td style="padding: 12px;">${new Date(r.visitDate).toLocaleString('pt-BR')}</td><td style="padding: 12px;">${r.species}</td><td style="padding: 12px; font-style:italic; color:var(--text-secondary);">${r.scientific || '-'}</td><td style="padding: 12px;">${r.count}</td><td style="padding: 12px;">${r.cameraName}</td><td style="padding: 12px;">${r.locationName}</td></tr>`).join('')}</tbody>
                </table>
            </div>
        </div>`;
    container.innerHTML = html;
}

window.exportReportToExcel = () => {
    const data = appState.lastReportResults.map(r => ({ 'Data da Visita': new Date(r.visitDate).toLocaleString('pt-BR'), 'Espécie (Popular)': r.species, 'Espécie (Científico)': r.scientific || '', 'Quantidade': r.count, 'Câmera': r.cameraName, 'Localidade': r.locationName, 'Foto URL': r.photoUrl || '' }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Relatório");
    XLSX.writeFile(wb, `Relatorio_Fauna_${new Date().toISOString().slice(0, 10)}.xlsx`);
};

// --- Settings (Backup/Restore) ---

function renderSettings() {
    dom.mainContent.innerHTML = `
        <h1 style="font-size: 2rem; margin-bottom: 24px;">Configurações</h1>
        <div class="card">
            <h3>Gerenciamento de Dados</h3>
            <p style="color:var(--text-secondary); margin-bottom:16px;">Faça backup dos seus dados para não perder informações ao limpar o navegador.</p>
            
            <div style="display:flex; gap:16px; flex-wrap:wrap;">
                <button class="btn btn-primary" onclick="window.downloadBackup()">
                    <ion-icon name="cloud-download-outline"></ion-icon> Fazer Backup (JSON)
                </button>
                <div style="position:relative;">
                    <input type="file" id="restore-file" style="display:none;" onchange="window.restoreBackup(this)">
                    <button class="btn btn-secondary" onclick="document.getElementById('restore-file').click()">
                        <ion-icon name="cloud-upload-outline"></ion-icon> Restaurar Backup
                    </button>
                </div>
            </div>
        </div>
    `;
}

window.downloadBackup = () => {
    const json = store.exportBackup();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wildlife_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
};

window.restoreBackup = (input) => {
    const file = input.files[0];
    if (!file) return;
    if (!confirm("ATENÇÃO: Isso irá substituir TODOS os seus dados atuais pelos dados do arquivo. Deseja continuar?")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        if (store.restoreBackup(e.target.result)) {
            alert("Backup restaurado com sucesso!");
            location.reload();
        } else {
            alert("Erro ao restaurar arquivo. Verifique o formato.");
        }
    };
    reader.readAsText(file);
};


// --- Common Rendering ---

function renderLocationList() {
    const locations = store.getLocations();
    let html = `<h1 style="font-size: 2rem; margin-bottom: 24px;">Localidades</h1><div class="grid">`;
    if (locations.length === 0) html += `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;"><p>Nenhuma localidade.</p></div>`;
    else {
        locations.forEach(loc => {
            const cams = store.getCameras().filter(c => c.locationId === loc.id).length;
            html += `
                <div class="card cursor-pointer" onclick="window.filterCamerasByLocation('${loc.id}')">
                    <div style="display:flex; justify-content:space-between;"><h3>${loc.name}</h3><div>
                        <button class="btn edit-btn" style="background:transparent; color:var(--text-primary); margin-right:8px;" data-type="location" data-id="${loc.id}"><ion-icon name="create-outline"></ion-icon></button>
                        <button class="btn delete-btn" style="background:transparent; color:#ff4444;" data-type="location" data-id="${loc.id}"><ion-icon name="trash-outline"></ion-icon></button>
                    </div></div>
                    <p style="margin-top:8px; font-size:0.9rem; color:var(--text-secondary);">${cams} câmeras</p>
                </div>`;
        });
    }
    html += `</div>`;
    dom.mainContent.innerHTML = html;
}
window.filterCamerasByLocation = (locId) => { appState.selectedLocationId = locId; switchView('cameras'); };

function renderCameraList() {
    let cameras = store.getCameras();
    let title = "Câmeras";
    if (appState.selectedLocationId) { const loc = store.getLocation(appState.selectedLocationId); if (loc) { title = `Câmeras em: ${loc.name}`; cameras = cameras.filter(c => c.locationId === loc.id); } }
    let html = `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;"><h1 style="font-size: 2rem;">${title}</h1>${appState.selectedLocationId ? `<button class="btn btn-secondary" onclick="window.clearLocationFilter()">Ver Todas</button>` : ''}</div><div class="grid" id="camera-grid">`;

    if (cameras.length === 0) html += `<div style="grid-column: 1/-1; text-align: center; color: var(--text-secondary); padding: 40px;"><p>Nenhuma câmera encontrada.</p></div>`;
    else {
        cameras.forEach(cam => {
            const locName = cam.locationId ? (store.getLocation(cam.locationId)?.name || 'Local desconhecido') : 'Sem Localidade';
            html += `
                <div class="card">
                     <div style="display:flex; justify-content:space-between;"><h3>${cam.name}</h3><div>
                        <button class="btn edit-btn" style="background:transparent; color:var(--text-primary); margin-right:8px;" data-type="camera" data-id="${cam.id}"><ion-icon name="create-outline"></ion-icon></button>
                        <button class="btn delete-btn" style="background:transparent; color:#ff4444;" data-type="camera" data-id="${cam.id}"><ion-icon name="trash-outline"></ion-icon></button>
                    </div></div>
                    <p style="font-size:0.9rem; margin-top:4px; color:var(--accent-color);">${locName}</p>
                    <div style="margin-top: 16px;"><button class="btn btn-secondary view-visits-btn" style="width:100%" data-id="${cam.id}">Ver Visitas</button></div>
                </div>`;
        });
    }
    html += `</div>`;
    dom.mainContent.innerHTML = html;
}
window.clearLocationFilter = () => { appState.selectedLocationId = null; renderCameraList(); }

function renderCameraVisits(cameraId) {
    appState.currentView = 'camera-visits';
    appState.selectedCameraId = cameraId;
    dom.navBtns.forEach(b => b.classList.remove('active'));
    const camera = store.getCamera(cameraId);
    const visits = store.getVisits(cameraId);
    let html = `<div style="margin-bottom: 24px;"><button class="btn btn-secondary back-btn" data-to="cameras"><ion-icon name="arrow-back"></ion-icon> Voltar</button></div><h1 style="font-size: 2rem; margin-bottom: 8px;">${camera.name}</h1><div class="grid">`;
    if (visits.length === 0) html += `<div style="grid-column: 1/-1; padding: 40px;"><p>Nenhuma visita.</p></div>`;
    else {
        visits.forEach(visit => {
            html += `
                <div class="card cursor-pointer visit-card" onclick="window.viewVisit('${visit.id}')">
                    <div style="display:flex; justify-content:space-between;"><h3>${new Date(visit.timestamp).toLocaleDateString('pt-BR')} ${new Date(visit.timestamp).toLocaleTimeString('pt-BR')}</h3><div>
                        <button class="btn edit-btn" style="background:transparent; color:var(--text-primary); margin-right:8px;" data-type="visit" data-id="${visit.id}"><ion-icon name="create-outline"></ion-icon></button>
                        <button class="btn delete-btn" style="background:transparent; color:#ff4444;" data-type="visit" data-id="${visit.id}"><ion-icon name="trash-outline"></ion-icon></button>
                    </div></div>
                    <p>${visit.weather}</p>
                </div>`;
        });
    }
    html += `</div>`;
    dom.mainContent.innerHTML = html;
}
window.viewVisit = (id) => renderVisitDetails(id);

function renderVisitDetails(visitId) {
    appState.currentView = 'visit-details';
    appState.selectedVisitId = visitId;
    const visit = store.getVisits().find(v => v.id === visitId);
    if (!visit) return renderCameraVisits(appState.selectedCameraId);
    const sightings = store.getSightings(visitId);
    let html = `<div style="margin-bottom: 24px;"><button class="btn btn-secondary back-btn" onclick="window.renderVisitsForCam('${visit.trapId}')"><ion-icon name="arrow-back"></ion-icon> Voltar</button></div><h1>Detalhes da Visita</h1><div class="grid">`;
    if (sightings.length === 0) html += `<p style="grid-column:1/-1;">Sem avistamentos.</p>`;
    else {
        sightings.forEach(s => {
            html += `
                <div class="card">
                    <div style="display:flex; justify-content:space-between;"><h3>${s.species} (Qtd: ${s.count})</h3><div>
                        <button class="btn edit-btn" style="background:transparent; color:var(--text-primary); margin-right:8px;" data-type="sighting" data-id="${s.id}"><ion-icon name="create-outline"></ion-icon></button>
                        <button class="btn delete-btn" style="background:transparent; color:#ff4444;" data-type="sighting" data-id="${s.id}"><ion-icon name="trash-outline"></ion-icon></button>
                    </div></div>
                    ${s.photoUrl ? `<img src="${s.photoUrl}" style="width:100%; height:150px; object-fit:cover; margin-top:8px;" onerror="this.style.display='none'">` : ''}
                </div>`;
        });
    }
    html += `</div>`;
    dom.mainContent.innerHTML = html;
}
window.renderVisitsForCam = (id) => renderCameraVisits(id);

// --- Modals (Create & Edit) ---

function handleMainAction() {
    if (appState.currentView === 'locations') openAddLocationModal();
    else if (appState.currentView === 'cameras' || appState.currentView === 'dashboard') openAddCameraModal();
    else if (appState.currentView === 'camera-visits') openAddVisitModal(appState.selectedCameraId);
    else if (appState.currentView === 'visit-details') openAddSightingModal(appState.selectedVisitId);
}

function confirmDelete(type, id) {
    if (confirm("Tem certeza que deseja excluir?")) {
        if (type === 'camera') { store.deleteCamera(id); if (['cameras', 'dashboard'].includes(appState.currentView)) renderView(appState.currentView); }
        else if (type === 'location') { store.deleteLocation(id); renderLocationList(); }
        else if (type === 'visit') { store.deleteVisit(id); renderCameraVisits(appState.selectedCameraId); }
        else if (type === 'sighting') { store.deleteSighting(id); renderVisitDetails(appState.selectedVisitId); }
    }
}

// EDIT Handlers
function openEditModal(type, id) {
    if (type === 'location') {
        const l = store.getLocation(id);
        if (!l) return;
        dom.modalContainer.innerHTML = `<div class="modal-content"><h2>Editar Localidade</h2><form id="f"><input name="n" value="${l.name}" class="form-control" required><br><button class="btn btn-primary">Atualizar</button></form></div>`;
        dom.modalContainer.classList.remove('hidden');
        document.getElementById('f').onsubmit = (e) => { e.preventDefault(); store.updateLocation(id, { name: e.target.n.value }); closeModal(); renderLocationList(); };
    }
    else if (type === 'camera') {
        const c = store.getCamera(id);
        const locs = store.getLocations().map(l => `<option value="${l.id}" ${l.id === c.locationId ? 'selected' : ''}>${l.name}</option>`).join('');
        dom.modalContainer.innerHTML = `
            <div class="modal-content"><h2>Editar Câmera</h2><form id="f">
                <input name="n" value="${c.name}" class="form-control" required><br>
                <select name="l" class="form-control"><option value="">Sem Local</option>${locs}</select><br>
                <input name="m" value="${c.model}" class="form-control"><br>
                <input name="z" value="${c.utmZone}" class="form-control" required><br>
                <input name="e" value="${c.easting}" class="form-control" required><br>
                <input name="no" value="${c.northing}" class="form-control" required><br>
                <button class="btn btn-primary">Atualizar</button>
            </form></div>`;
        dom.modalContainer.classList.remove('hidden');
        document.getElementById('f').onsubmit = (e) => {
            e.preventDefault();
            store.updateCamera(id, { name: e.target.n.value, locationId: e.target.l.value, model: e.target.m.value, utmZone: e.target.z.value, easting: e.target.e.value, northing: e.target.no.value });
            closeModal(); renderView(appState.currentView);
        };
    }
    else if (type === 'visit') {
        const v = store.getVisits().find(x => x.id === id);
        dom.modalContainer.innerHTML = `
            <div class="modal-content"><h2>Editar Visita</h2><form id="f">
                <input type="datetime-local" name="d" value="${v.timestamp}" class="form-control" required><br>
                <input name="w" value="${v.weather}" class="form-control"><br>
                <button class="btn btn-primary">Atualizar</button>
            </form></div>`;
        dom.modalContainer.classList.remove('hidden');
        document.getElementById('f').onsubmit = (e) => {
            e.preventDefault();
            store.updateVisit(id, { timestamp: e.target.d.value, weather: e.target.w.value });
            closeModal(); renderCameraVisits(v.trapId);
        };
    }
    else if (type === 'sighting') {
        const s = store.getSighting(id);
        const opts = store.getSpeciesList().map(sp => `<option value="${sp.common}" ${sp.common === s.species ? 'selected' : ''}>${sp.common}</option>`).join('');
        dom.modalContainer.innerHTML = `
            <div class="modal-content"><h2>Editar Avistamento</h2><form id="f">
                <select name="s" class="form-control">${opts}</select><br>
                <input type="number" name="c" value="${s.count}" class="form-control"><br>
                <input name="p" value="${s.photoUrl || ''}" placeholder="Foto URL" class="form-control"><br>
                <button class="btn btn-primary">Atualizar</button>
            </form></div>`;
        dom.modalContainer.classList.remove('hidden');
        document.getElementById('f').onsubmit = (e) => {
            e.preventDefault();
            store.updateSighting(id, { species: e.target.s.value, count: e.target.c.value, photoUrl: e.target.p.value });
            closeModal(); renderVisitDetails(s.visitId);
        };
    }
}


function openAddLocationModal() {
    dom.modalContainer.innerHTML = `
        <div class="modal-content"><h2>Nova Localidade</h2><form id="f"><input name="n" placeholder="Nome" class="form-control" required><br><button class="btn btn-primary">Salvar</button></form></div>`;
    dom.modalContainer.classList.remove('hidden');
    document.getElementById('f').onsubmit = (e) => { e.preventDefault(); store.addLocation({ name: e.target.n.value }); closeModal(); renderLocationList(); };
}

function openAddCameraModal() {
    const locs = store.getLocations().map(l => `<option value="${l.id}">${l.name}</option>`).join('');
    dom.modalContainer.innerHTML = `
        <div class="modal-content"><h2>Nova Câmera</h2><form id="f">
            <input name="n" placeholder="Nome" class="form-control" required><br>
            <select name="l" class="form-control"><option value="">Sem Local</option>${locs}</select><br>
            <input name="m" placeholder="Modelo" class="form-control"><br>
            <input name="z" placeholder="UTM Zone" class="form-control" required><br>
            <input name="e" placeholder="Easting" class="form-control" required><br>
            <input name="no" placeholder="Northing" class="form-control" required><br>
            <button class="btn btn-primary">Salvar</button>
        </form></div>`;
    dom.modalContainer.classList.remove('hidden');
    document.getElementById('f').onsubmit = (e) => {
        e.preventDefault();
        store.addCamera({ name: e.target.n.value, locationId: e.target.l.value, model: e.target.m.value, utmZone: e.target.z.value, easting: e.target.e.value, northing: e.target.no.value });
        closeModal(); renderView(appState.currentView);
    };
}

function openAddVisitModal(cid) {
    dom.modalContainer.innerHTML = `
        <div class="modal-content"><h2>Registrar Visita</h2><form id="f">
            <input type="datetime-local" name="d" class="form-control" required><br>
            <input name="w" placeholder="Clima" class="form-control"><br>
            <button class="btn btn-primary">Salvar</button>
        </form></div>`;
    dom.modalContainer.classList.remove('hidden');
    document.getElementById('f').onsubmit = (e) => {
        e.preventDefault();
        store.addVisit({ trapId: cid, timestamp: e.target.d.value, weather: e.target.w.value });
        closeModal(); renderCameraVisits(cid);
    };
}

function openAddSightingModal(vid) {
    const opts = store.getSpeciesList().map(s => `<option value="${s.common}">${s.common}</option>`).join('');
    dom.modalContainer.innerHTML = `
        <div class="modal-content"><h2>Adicionar Avistamento</h2><form id="f">
            <div id="species-preview" style="display:none;"></div>
            <select name="s" id="species-select" class="form-control">${opts}</select><br>
            <input type="number" name="c" value="1" class="form-control"><br>
            <input name="p" placeholder="Foto URL" class="form-control"><br>
            <button class="btn btn-primary">Salvar</button>
        </form></div>`;
    dom.modalContainer.classList.remove('hidden');
    function updateImagePreview(common) {
        const sp = store.getSpeciesList().find(s => s.common === common);
        const previewEl = document.getElementById('species-preview');
        if (sp && sp.imageUrl) {
            previewEl.innerHTML = `<img src="${sp.imageUrl}" style="width:100%; height:200px; object-fit:cover; border-radius:8px; margin-bottom:16px;">`;
            previewEl.style.display = 'block';
        } else {
            previewEl.style.display = 'none';
        }
    }

    document.getElementById('species-select').addEventListener('change', (e) => updateImagePreview(e.target.value));
    updateImagePreview(document.getElementById('species-select').value);

    document.getElementById('f').onsubmit = (e) => {
        e.preventDefault();
        store.addSighting({ visitId: vid, species: e.target.s.value, count: e.target.c.value, photoUrl: e.target.p.value });
        closeModal(); renderVisitDetails(vid);
    };
}

function closeModal() { dom.modalContainer.classList.add('hidden'); }
document.addEventListener('DOMContentLoaded', init);
