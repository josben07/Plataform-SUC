let allMentors = [];
let searchText = '';

const mentorsGrid = document.getElementById('mentorsGrid');
const mentorSearchInput = document.querySelector('.mentors-search input');

const mentorModal = document.querySelector('.mentor-modal');
const closeModal = document.querySelector('.close-modal');
const modalImage = document.getElementById('modalImage');
const modalName = document.getElementById('modalName');
const modalRole = document.getElementById('modalRole');
const modalDescription = document.getElementById('modalDescription');
const modalTags = document.getElementById('modalTags');

async function loadMentors() {
    try {
        const res = await fetch(`${API_URL}/api/mentor-profiles`);
        if (!res.ok) throw new Error('Error al cargar mentores');
        const data = await res.json();
        allMentors = data.filter(m => m.profile);
        renderMentors();
    } catch (err) {
        console.error(err);
        mentorsGrid.innerHTML = '<div class="empty-mentors"><h3>Error al cargar mentores</h3><p>Intenta nuevamente más tarde.</p></div>';
    }
}

function renderMentors() {
    const searchLower = searchText.toLowerCase();
    const filtered = allMentors.filter(m =>
        !searchLower ||
        (m.full_name && m.full_name.toLowerCase().includes(searchLower)) ||
        (m.profile.position && m.profile.position.toLowerCase().includes(searchLower)) ||
        (m.profile.company && m.profile.company.toLowerCase().includes(searchLower))
    );

    if (filtered.length === 0) {
        mentorsGrid.innerHTML = '<div class="empty-mentors"><h3>No se encontraron mentores</h3><p>Prueba otra búsqueda o categoría.</p></div>';
        return;
    }

    mentorsGrid.innerHTML = filtered.map(m => {
        const profile = m.profile;
        const tags = [];
        if (profile.specialties) {
            const items = Array.isArray(profile.specialties) ? profile.specialties : profile.specialties.split(',').map(s => s.trim());
            tags.push(...items.filter(Boolean));
        }
        if (profile.areas) {
            const items = Array.isArray(profile.areas) ? profile.areas : profile.areas.split(',').map(s => s.trim());
            tags.push(...items.filter(Boolean));
        }

        const imgSrc = profile.photo_url || '';
        const companyText = profile.company ? ` · ${profile.company}` : '';

        return `
            <div class="mentor-card" data-mentor-id="${m.id}">
                <div class="mentor-image">
                    <img src="${imgSrc}" alt="${m.full_name || 'Mentor'}">
                </div>
                <div class="mentor-info">
                    <div class="mentor-top">
                        <div>
                            <h3>${m.full_name || 'Mentor'}</h3>
                            <span>${profile.position || ''}${companyText}</span>
                        </div>
                    </div>
                    <p class="mentor-description">${profile.description || ''}</p>
                    <div class="mentor-tags">
                        ${tags.slice(0, 4).map(t => `<span>${t}</span>`).join('')}
                    </div>
                    <div class="mentor-footer">
                        <button class="mentor-btn" data-mentor-id="${m.id}">Ver perfil</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    mentorsGrid.querySelectorAll('.mentor-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.mentorId;
            const mentor = allMentors.find(m => m.id == id);
            if (mentor) openModal(mentor);
        });
    });
}

function openModal(mentor) {
    const profile = mentor.profile;
    modalImage.src = profile.photo_url || '';
    modalName.textContent = mentor.full_name || 'Mentor';
    modalRole.textContent = profile.position || '';

    const descParts = [profile.description || ''];
    if (profile.company) descParts.push(`Trabaja en ${profile.company}`);
    if (profile.experience_years) descParts.push(`${profile.experience_years} años de experiencia`);
    modalDescription.textContent = descParts.join('. ');

    const tags = [];
    if (profile.specialties) {
        const items = Array.isArray(profile.specialties) ? profile.specialties : profile.specialties.split(',').map(s => s.trim());
        tags.push(...items.filter(Boolean));
    }
    if (profile.areas) {
        const items = Array.isArray(profile.areas) ? profile.areas : profile.areas.split(',').map(s => s.trim());
        tags.push(...items.filter(Boolean));
    }
    modalTags.innerHTML = tags.map(t => `<span>${t}</span>`).join('');

    const statsEl = document.querySelector('.modal-stats');
    if (statsEl) {
        statsEl.innerHTML = `
            <div><strong>${profile.experience_years || '—'}</strong><span>Años exp.</span></div>
        `;
        if (profile.company) {
            statsEl.innerHTML += `<div><strong>${profile.company}</strong><span>Empresa</span></div>`;
        }
    }

    mentorModal.classList.add('active-modal');
}

if (closeModal) {
    closeModal.addEventListener('click', () => mentorModal.classList.remove('active-modal'));
}
if (mentorModal) {
    mentorModal.addEventListener('click', (e) => {
        if (e.target === mentorModal) mentorModal.classList.remove('active-modal');
    });
}

if (mentorSearchInput) {
    mentorSearchInput.addEventListener('input', () => {
        searchText = mentorSearchInput.value;
        renderMentors();
    });
}

loadMentors();
