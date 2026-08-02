const businessDirectory = [
    { id: 'umzansi-grocers', name: 'Umzansi Grocers', category: 'Restaurants & Food', section: 'A', description: 'Everyday groceries, fresh produce and prepared favourites for the whole family.', address: 'A Section, KwaMashu, Durban', phone: '+27 (0)31 000 1001', featured: true, open: true, rating: 4.9, added: '2026-07-28', imageClass: 'one' },
    { id: 'sisonke-beauty-house', name: 'Sisonke Beauty House', category: 'Beauty & Hair', section: 'D', description: 'A welcoming beauty studio for hair, nails and thoughtful self-care appointments.', address: 'D Section, KwaMashu, Durban', phone: '+27 (0)31 000 1002', featured: true, open: true, rating: 4.8, added: '2026-07-25', imageClass: 'two' },
    { id: 'mahlase-auto-care', name: 'Mahlase Auto Care', category: 'Automotive', section: 'H', description: 'Reliable vehicle repairs, servicing and diagnostics from a local team you can trust.', address: 'H Section, KwaMashu, Durban', phone: '+27 (0)31 000 1003', featured: true, open: false, rating: 4.9, added: '2026-07-18', imageClass: 'three' },
    { id: 'kwezi-learning-centre', name: 'Kwezi Learning Centre', category: 'Education', section: 'E', description: 'Tutoring, study support and skills development for learners preparing for what is next.', address: 'E Section, KwaMashu, Durban', phone: '+27 (0)31 000 1004', featured: false, open: true, rating: 4.7, added: '2026-07-11', imageClass: 'four' },
    { id: 'ekhaya-wellness-practice', name: 'Ekhaya Wellness Practice', category: 'Healthcare', section: 'B', description: 'Accessible, people-first wellness services close to home for individuals and families.', address: 'B Section, KwaMashu, Durban', phone: '+27 (0)31 000 1005', featured: false, open: true, rating: 4.8, added: '2026-07-04', imageClass: 'five' },
    { id: 'one-stop-hardware', name: 'One Stop Hardware', category: 'Construction', section: 'J', description: 'Tools, materials and practical advice for every building and home improvement project.', address: 'J Section, KwaMashu, Durban', phone: '+27 (0)31 000 1006', featured: true, open: true, rating: 4.6, added: '2026-06-29', imageClass: 'six' },
    { id: 'inhlonipho-legal', name: 'Inhlonipho Legal Solutions', category: 'Professional Services', section: 'C', description: 'Clear, respectful guidance for the legal and administrative moments that matter.', address: 'C Section, KwaMashu, Durban', phone: '+27 (0)31 000 1007', featured: false, open: false, rating: 4.7, added: '2026-06-22', imageClass: 'seven' },
    { id: 'ikhaya-guest-house', name: 'iKhaya Guest House', category: 'Accommodation', section: 'K', description: 'A comfortable local stay with warm hospitality and easy access to the community.', address: 'K Section, KwaMashu, Durban', phone: '+27 (0)31 000 1008', featured: false, open: true, rating: 4.8, added: '2026-06-16', imageClass: 'eight' },
    { id: 'mvelo-home-services', name: 'Mvelo Home Services', category: 'Home Services', section: 'F', description: 'Practical home maintenance, repairs and improvements handled with care.', address: 'F Section, KwaMashu, Durban', phone: '+27 (0)31 000 1009', featured: false, open: true, rating: 4.6, added: '2026-06-08', imageClass: 'one' }
];

const directoryState = { query: '', category: 'All', section: 'All', sort: 'featured', openNow: false, visible: 6 };
const directoryGrid = document.querySelector('#directory-business-grid');
const directoryCount = document.querySelector('#directory-results-count');
const directoryEmpty = document.querySelector('#directory-empty');
const loadMoreButton = document.querySelector('#load-more');
const searchInput = document.querySelector('#business-search');
const searchForm = document.querySelector('#directory-search-form');
const sectionButtons = document.querySelectorAll('[data-section]');
const categoryButtons = document.querySelectorAll('[data-category]');
const sortSelect = document.querySelector('#sort-businesses');
const openNowInput = document.querySelector('#open-now');

const locationIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle></svg>';
const phoneIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h3l1.4 4.1-2 1.8a16 16 0 0 0 7.6 7.6l1.8-2L21 16v3c0 1.1-.9 2-2 2C10.2 21 3 13.8 3 5c0-1.1.9-2 2-2Z"></path></svg>';

function getFilteredBusinesses() {
    const normalizedQuery = directoryState.query.trim().toLowerCase();
    const filtered = businessDirectory.filter((business) => {
        const searchable = `${business.name} ${business.category} ${business.section} ${business.description}`.toLowerCase();
        return (!normalizedQuery || searchable.includes(normalizedQuery))
            && (directoryState.category === 'All' || business.category === directoryState.category)
            && (directoryState.section === 'All' || business.section === directoryState.section)
            && (!directoryState.openNow || business.open);
    });

    return filtered.sort((a, b) => {
        if (directoryState.sort === 'newest') return new Date(b.added) - new Date(a.added);
        if (directoryState.sort === 'alphabetical') return a.name.localeCompare(b.name);
        if (directoryState.sort === 'rated') return b.rating - a.rating;
        return Number(b.featured) - Number(a.featured) || b.rating - a.rating;
    });
}

function cardTemplate(business) {
    const directionsQuery = encodeURIComponent(`${business.address}, ${business.name}`);
    const phoneHref = business.phone.replace(/[^+\d]/g, '');
    const badge = business.featured ? '<span class="directory-card-badge">Featured</span>' : '';
    const statusClass = business.open ? '' : ' is-closed';
    const statusText = business.open ? 'Open now' : 'Closed now';

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
                    <a class="profile-link" href="/directory/${business.id}">View profile</a>
                    <a class="directions-link" href="https://www.google.com/maps/search/?api=1&query=${directionsQuery}" target="_blank" rel="noopener noreferrer">Directions</a>
                </div>
            </div>
        </article>`;
}

function syncActiveButton(buttons, value, attribute) {
    buttons.forEach((button) => {
        const active = button.dataset[attribute] === value;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
    });
}

function renderDirectory() {
    const filteredBusinesses = getFilteredBusinesses();
    const visibleBusinesses = filteredBusinesses.slice(0, directoryState.visible);

    directoryGrid.innerHTML = visibleBusinesses.map(cardTemplate).join('');
    directoryEmpty.hidden = filteredBusinesses.length !== 0;
    directoryCount.textContent = filteredBusinesses.length === 1 ? '1 business found' : `${filteredBusinesses.length} businesses found`;
    loadMoreButton.hidden = filteredBusinesses.length <= directoryState.visible;
}

function resetVisibleBusinesses() {
    directoryState.visible = 6;
}

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    directoryState.query = searchInput.value;
    resetVisibleBusinesses();
    renderDirectory();
});

searchInput.addEventListener('input', () => {
    directoryState.query = searchInput.value;
    resetVisibleBusinesses();
    renderDirectory();
});

categoryButtons.forEach((button) => {
    button.addEventListener('click', () => {
        directoryState.category = directoryState.category === button.dataset.category ? 'All' : button.dataset.category;
        syncActiveButton(categoryButtons, directoryState.category, 'category');
        resetVisibleBusinesses();
        renderDirectory();
        document.querySelector('#businesses').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

sectionButtons.forEach((button) => {
    button.addEventListener('click', () => {
        directoryState.section = button.dataset.section;
        syncActiveButton(sectionButtons, directoryState.section, 'section');
        resetVisibleBusinesses();
        renderDirectory();
    });
});

sortSelect.addEventListener('change', () => {
    directoryState.sort = sortSelect.value;
    renderDirectory();
});

openNowInput.addEventListener('change', () => {
    directoryState.openNow = openNowInput.checked;
    resetVisibleBusinesses();
    renderDirectory();
});

loadMoreButton.addEventListener('click', () => {
    directoryState.visible += 3;
    renderDirectory();
});

renderDirectory();
