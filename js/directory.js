const defaultDirectory = [
    { id: 'umzansi-grocers', name: 'Umzansi Grocers', category: 'Shopping & Retail', section: 'A', description: 'Everyday groceries, fresh produce and prepared favourites for the whole family.', address: 'A Section, KwaMashu, Durban', phone: '+27 (0)31 000 1001', featured: true, verified: true, delivery: true, hours: { days: [0,1,2,3,4,5,6], open: '08:00', close: '20:00' }, added: '2026-07-28', imageClass: 'one' },
    { id: 'sisonke-beauty-house', name: 'Sisonke Beauty House', category: 'Beauty & Wellness', section: 'D', description: 'A welcoming beauty studio for hair, nails and thoughtful self-care appointments.', address: 'D Section, KwaMashu, Durban', phone: '+27 (0)31 000 1002', featured: true, verified: true, delivery: false, hours: { days: [1,2,3,4,5,6], open: '09:00', close: '18:00' }, added: '2026-07-25', imageClass: 'two' },
    { id: 'mahlase-auto-care', name: 'Mahlase Auto Care', category: 'Automotive & Transport', section: 'H', description: 'Reliable vehicle repairs, servicing and diagnostics from a local team you can trust.', address: 'H Section, KwaMashu, Durban', phone: '+27 (0)31 000 1003', featured: true, verified: true, delivery: false, hours: { days: [1,2,3,4,5], open: '08:00', close: '17:00' }, added: '2026-07-18', imageClass: 'three' },
    { id: 'kwezi-learning-centre', name: 'Kwezi Learning Centre', category: 'Education', section: 'E', description: 'Tutoring, study support and skills development for learners preparing for what is next.', address: 'E Section, KwaMashu, Durban', phone: '+27 (0)31 000 1004', featured: false, verified: true, delivery: false, hours: { days: [1,2,3,4,5,6], open: '14:00', close: '19:00' }, added: '2026-07-11', imageClass: 'four' },
    { id: 'ekhaya-wellness-practice', name: 'Ekhaya Wellness Practice', category: 'Healthcare', section: 'B', description: 'Accessible, people-first wellness services close to home for individuals and families.', address: 'B Section, KwaMashu, Durban', phone: '+27 (0)31 000 1005', featured: false, verified: true, delivery: false, hours: { days: [1,2,3,4,5], open: '08:00', close: '17:00' }, added: '2026-07-04', imageClass: 'five' },
    { id: 'one-stop-hardware', name: 'One Stop Hardware', category: 'Home & Trade Services', section: 'J', description: 'Tools, materials and practical advice for every building and home improvement project.', address: 'J Section, KwaMashu, Durban', phone: '+27 (0)31 000 1006', featured: true, verified: false, delivery: true, hours: { days: [1,2,3,4,5,6], open: '07:30', close: '16:30' }, added: '2026-06-29', imageClass: 'six' },
    { id: 'inhlonipho-legal', name: 'Inhlonipho Legal Solutions', category: 'Professional Services', section: 'C', description: 'Clear, respectful guidance for the legal and administrative moments that matter.', address: 'C Section, KwaMashu, Durban', phone: '+27 (0)31 000 1007', featured: false, verified: true, delivery: false, hours: { days: [1,2,3,4,5], open: '08:30', close: '16:30' }, added: '2026-06-22', imageClass: 'seven' },
    { id: 'ikhaya-guest-house', name: 'iKhaya Guest House', category: 'Accommodation', section: 'K', description: 'A comfortable local stay with warm hospitality and easy access to the community.', address: 'K Section, KwaMashu, Durban', phone: '+27 (0)31 000 1008', featured: false, verified: true, delivery: false, hours: { days: [0,1,2,3,4,5,6], open: '00:00', close: '23:59' }, added: '2026-06-16', imageClass: 'eight' },
    { id: 'mvelo-home-services', name: 'Mvelo Home Services', category: 'Home & Trade Services', section: 'F', description: 'Practical home maintenance, repairs and improvements handled with care.', address: 'F Section, KwaMashu, Durban', phone: '+27 (0)31 000 1009', featured: false, verified: false, delivery: false, hours: { days: [1,2,3,4,5,6], open: '08:00', close: '17:00' }, added: '2026-06-08', imageClass: 'one' },
    { id: 'taste-of-kasi', name: 'Taste of Kasi', category: 'Food & Dining', section: 'G', description: 'Authentic township cuisine, shisa nyama, and local favourites made fresh daily.', address: 'G Section, KwaMashu, Durban', phone: '+27 (0)31 000 1010', featured: true, verified: true, delivery: true, hours: { days: [0,1,2,3,4,5,6], open: '10:00', close: '22:00' }, added: '2026-07-30', imageClass: 'three' }
];

// Initialize LocalStorage Data
let businessDirectory = [];
try {
    const stored = localStorage.getItem('kmo_directory');
    if (stored) {
        businessDirectory = JSON.parse(stored);
    } else {
        businessDirectory = [...defaultDirectory];
        localStorage.setItem('kmo_directory', JSON.stringify(businessDirectory));
    }
} catch (e) {
    businessDirectory = [...defaultDirectory];
}

let directoryState = { query: '', visible: 6 };

const directoryGrid = document.querySelector('#directory-business-grid');
const directoryCount = document.querySelector('#directory-results-count');
const activeFilterCount = document.querySelector('#active-filter-count');
const directoryEmpty = document.querySelector('#directory-empty');
const loadMoreButton = document.querySelector('#load-more');

const searchInput = document.querySelector('#business-search');
const searchForm = document.querySelector('#directory-search-form');
const searchPills = document.querySelectorAll('.search-pill');
const pageCategoryCards = document.querySelectorAll('.category-card');

const filterModal = document.querySelector('#filter-modal');
const openFiltersBtn = document.querySelector('#open-filters');
const closeFiltersBtn = document.querySelector('#close-filters');
const resetFiltersBtn = document.querySelector('#reset-filters');
const applyFiltersBtn = document.querySelector('#apply-filters');

const filterStatusInputs = document.querySelectorAll('input[name="filter-status"]');
const filterFeaturesInputs = document.querySelectorAll('input[name="filter-features"]');
const filterSectionInputs = document.querySelectorAll('input[name="filter-section"]');
const filterCategorySelect = document.querySelector('#modal-category');

const directionsModal = document.querySelector('#directions-modal');
const closeDirectionsBtn = document.querySelector('#close-directions');
const directionsAddressText = document.querySelector('#directions-address-text');
const openMapsLink = document.querySelector('#open-maps-link');
const copyAddressBtn = document.querySelector('#copy-address-btn');

const locationIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>';
const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h3l1.4 4.1-2 1.8a16 16 0 0 0 7.6 7.6l1.8-2L21 16v3c0 1.1-.9 2-2 2C10.2 21 3 13.8 3 5c0-1.1.9-2 2-2Z"></path></svg>';

// Helper to check if open
function isBusinessOpen(hours) {
    if (!hours) return false;
    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sunday
    const currentTime = now.getHours() * 60 + now.getMinutes();

    if (!hours.days.includes(currentDay)) return false;

    const [openH, openM] = hours.open.split(':').map(Number);
    const [closeH, closeM] = hours.close.split(':').map(Number);
    const openTime = openH * 60 + openM;
    const closeTime = closeH * 60 + closeM;

    if (closeTime < openTime) { // Over midnight
        return currentTime >= openTime || currentTime <= closeTime;
    }
    return currentTime >= openTime && currentTime <= closeTime;
}

// Get filter state from modal inputs
function getModalFilters() {
    const statuses = Array.from(filterStatusInputs).filter(i => i.checked).map(i => i.value);
    const features = Array.from(filterFeaturesInputs).filter(i => i.checked).map(i => i.value);
    const section = document.querySelector('input[name="filter-section"]:checked').value;
    const category = filterCategorySelect.value;
    return { statuses, features, section, category };
}

function updateActiveFilterBadge() {
    const filters = getModalFilters();
    let count = filters.statuses.length + filters.features.length;
    if (filters.section !== 'All') count++;
    if (filters.category !== 'All') count++;
    
    if (count > 0) {
        activeFilterCount.textContent = count;
        activeFilterCount.hidden = false;
    } else {
        activeFilterCount.hidden = true;
    }
}

function getFilteredBusinesses() {
    const normalizedQuery = directoryState.query.trim().toLowerCase();
    const filters = getModalFilters();

    const filtered = businessDirectory.filter((business) => {
        // Search
        const searchable = `${business.name} ${business.category} ${business.section} ${business.description}`.toLowerCase();
        if (normalizedQuery && !searchable.includes(normalizedQuery)) return false;

        // Modal Filters
        if (filters.section !== 'All' && business.section !== filters.section) return false;
        if (filters.category !== 'All' && business.category !== filters.category) return false;
        
        // Status
        const isOpen = isBusinessOpen(business.hours);
        if (filters.statuses.includes('open') && !isOpen) return false;
        if (filters.statuses.includes('closed') && isOpen) return false;

        // Features
        if (filters.features.includes('featured') && !business.featured) return false;
        if (filters.features.includes('verified') && !business.verified) return false;
        if (filters.features.includes('delivery') && !business.delivery) return false;

        return true;
    });

    // Default Sort: Featured first, then alphabetical
    return filtered.sort((a, b) => {
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return a.name.localeCompare(b.name);
    });
}

function cardTemplate(business) {
    const phoneHref = business.phone.replace(/[^+\d]/g, '');
    const badge = business.featured ? '<span class="directory-card-badge">Featured</span>' : '';
    const isOpen = isBusinessOpen(business.hours);
    const statusClass = isOpen ? '' : ' is-closed';
    const statusText = isOpen ? 'Open now' : 'Closed now';

    return `
        <article class="directory-card directory-card--${business.imageClass}">
            <div class="directory-card-media">
                <img class="directory-card-image" src="KwaMashu-01.webp" alt="" loading="lazy" decoding="async">
                ${badge}
            </div>
            <div class="directory-card-content">
                <div class="directory-card-topline"><span class="directory-card-category">${business.category}</span><span class="directory-card-section">Section ${business.section}</span></div>
                <h3>${business.name}</h3>
                <p class="directory-card-description">${business.description}</p>
                <div class="directory-card-meta">
                    <p>${locationIcon}<span>${business.address}</span></p>
                    <p>${phoneIcon}<a href="tel:${phoneHref}">${business.phone}</a></p>
                </div>
                <span class="business-status${statusClass}">${statusText}</span>
                <div class="directory-card-actions">
                    <button type="button" class="directions-btn" onclick="openDirections('${encodeURIComponent(business.address)}', '${encodeURIComponent(business.name)}')">Directions</button>
                    <a class="call-btn" href="tel:${phoneHref}">Call</a>
                </div>
            </div>
        </article>`;
}

function renderDirectory() {
    const filteredBusinesses = getFilteredBusinesses();
    const visibleBusinesses = filteredBusinesses.slice(0, directoryState.visible);

    directoryGrid.innerHTML = visibleBusinesses.map(cardTemplate).join('');
    directoryEmpty.hidden = filteredBusinesses.length !== 0;
    directoryCount.textContent = filteredBusinesses.length === 1 ? '1 business found' : `${filteredBusinesses.length} businesses found`;
    loadMoreButton.hidden = filteredBusinesses.length <= directoryState.visible;
    updateActiveFilterBadge();
}

function resetVisibleBusinesses() {
    directoryState.visible = 6;
}

// Search Listeners
searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    directoryState.query = searchInput.value;
    resetVisibleBusinesses();
    renderDirectory();
    document.querySelector('#businesses').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

searchInput.addEventListener('input', () => {
    directoryState.query = searchInput.value;
    resetVisibleBusinesses();
    renderDirectory();
});

searchPills.forEach(pill => {
    pill.addEventListener('click', () => {
        searchInput.value = pill.textContent;
        directoryState.query = pill.textContent;
        resetVisibleBusinesses();
        renderDirectory();
        document.querySelector('#businesses').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Category Grid Listeners
pageCategoryCards.forEach(card => {
    card.addEventListener('click', () => {
        const cat = card.dataset.category;
        filterCategorySelect.value = cat;
        resetVisibleBusinesses();
        renderDirectory();
        document.querySelector('#businesses').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

// Filter Modal Listeners
openFiltersBtn.addEventListener('click', () => {
    filterModal.showModal();
});

closeFiltersBtn.addEventListener('click', () => {
    filterModal.close();
});

filterModal.addEventListener('click', (e) => {
    if (e.target === filterModal) filterModal.close();
});

resetFiltersBtn.addEventListener('click', () => {
    filterStatusInputs.forEach(i => i.checked = false);
    filterFeaturesInputs.forEach(i => i.checked = false);
    document.querySelector('input[name="filter-section"][value="All"]').checked = true;
    filterCategorySelect.value = 'All';
    resetVisibleBusinesses();
    renderDirectory();
});

applyFiltersBtn.addEventListener('click', () => {
    resetVisibleBusinesses();
    renderDirectory();
    filterModal.close();
    document.querySelector('#businesses').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

loadMoreButton.addEventListener('click', () => {
    directoryState.visible += 3;
    renderDirectory();
});

// Directions Modal Listeners
window.openDirections = function(encodedAddress, encodedName) {
    const address = decodeURIComponent(encodedAddress);
    const name = decodeURIComponent(encodedName);
    directionsAddressText.textContent = address;
    openMapsLink.href = `https://www.google.com/maps/search/?api=1&query=${encodedAddress},%20${encodedName}`;
    directionsModal.showModal();
};

closeDirectionsBtn.addEventListener('click', () => {
    directionsModal.close();
});

directionsModal.addEventListener('click', (e) => {
    if (e.target === directionsModal) directionsModal.close();
});

copyAddressBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(directionsAddressText.textContent).then(() => {
        const originalText = copyAddressBtn.innerHTML;
        copyAddressBtn.innerHTML = 'Copied!';
        setTimeout(() => {
            copyAddressBtn.innerHTML = originalText;
        }, 2000);
    });
});

// Initial Render
renderDirectory();
