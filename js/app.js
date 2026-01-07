/**
 * app.js
 * Handles logic for the public side of the website.
 * NOW WITH BACKEND API INTEGRATION
 */

const API_BASE = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {

    // Check which page we are on
    const path = window.location.pathname;

    if (path.includes('index.html') || path === '/' || path.endsWith('/')) {
        loadFeaturedEvents();
    }

    if (path.includes('activities.html')) {
        loadActivitiesGrid();
    }

    if (path.includes('apply.html')) {
        setupApplicationForm();
    }
});

/* Index Page Logic - UPCOMING EVENTS */
async function loadFeaturedEvents() {
    const container = document.getElementById('featured-events');
    if (!container) return; // Guard clause

    try {
        // Fetch UPCOMING events
        const res = await fetch(`${API_BASE}/events?status=upcoming&limit=6`); // Limit 6
        if (!res.ok) throw new Error('Failed to fetch upcoming events');

        const result = await res.json();
        const events = Array.isArray(result.data) ? result.data : [];

        if (events.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center;">No upcoming events listed. Check back soon!</p>';
            return;
        }

        container.innerHTML = events.map(evt => {
            const icon = evt.icon || '📅'; // Default notification/cal icon
            return `
            <div class="card fade-in" style="border-left: 4px solid var(--secondary-color);">
                <span class="badge" style="background:var(--text-muted); color:white; margin-bottom: 0.5rem; display:inline-block;">Upcoming</span>
                <span style="float:right; font-size: 1.5rem;">${icon}</span>
                <h3>${evt.eventName}</h3>
                <p style="color: var(--text-muted); margin-bottom: 0.5rem; font-size: 0.9em;">
                    📅 Starts: ${evt.startDate} <br>
                    ⏳ Ends: ${evt.endDate}
                </p>
                <p style="font-size: 0.9rem;"><strong>Venue:</strong> ${evt.venue}</p>
                <p style="font-style: italic; color: #666;">${evt.description || 'Coming soon...'}</p>
                <!-- NO APPLY BUTTON FOR UPCOMING -->
            </div>
            `;
        }).join('');
    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-danger">Failed to load events.</p>';
    }
}

const ICON_MAP = {
    "Sports & Physical Activities": "⚽",
    "Arts & Creative Expression": "🎨",
    "Music": "🎵",
    "Dance": "💃",
    "Literature & Language": "📘",
    "Science & Technology": "💻",
    "STEM & Research": "🔬",
    "Leadership & Service": "🤝",
    "Lifestyle & Wellness": "🧘",
    "Cultural & Global Awareness": "🌍",
    "Miscellaneous & Fun": "🎭",
    "Outdoor & Nature": "🌲",
    "Literary & Media": "📚"
};

/* Activities Page Logic - PRESENT ACTIVITIES */
// Store globally for modal access
let cachedCategories = {};

async function loadActivitiesGrid() {
    const container = document.getElementById('activities-grid');
    if (!container) return;

    try {
        // Fetch PRESENT activities (Active)
        const res = await fetch(`${API_BASE}/events?status=present&limit=100`);
        if (!res.ok) throw new Error('Failed to fetch activities');

        const result = await res.json();
        const events = Array.isArray(result.data) ? result.data : [];

        // Group by Category to form "Activities"
        const catMap = {};
        events.forEach(evt => {
            if (!catMap[evt.category]) {
                catMap[evt.category] = {
                    events: [],
                    subActivities: new Set(),
                    icon: evt.icon || ICON_MAP[evt.category] || "✨"
                };
            }
            catMap[evt.category].events.push(evt);

            // Collect subs
            if (evt.subActivities && evt.subActivities.length > 0) {
                evt.subActivities.forEach(sub => catMap[evt.category].subActivities.add(sub));
            } else {
                catMap[evt.category].subActivities.add(evt.eventName);
            }
        });

        // Convert for display
        cachedCategories = {}; // map catName -> subActivities Array
        const displayList = Object.keys(catMap).map(catName => {
            cachedCategories[catName] = Array.from(catMap[catName].subActivities);
            const count = catMap[catName].events.length; // Active events count
            const icon = catMap[catName].icon;

            return `
            <div class="card fade-in" style="cursor: pointer; border-top: 4px solid var(--primary-color);" onclick="openActivityModal('${catName}')">
                <div style="height: 100px; display: flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #e3f2fd, #bbdefb); border-radius: 0.5rem; margin-bottom: 1rem;">
                    <span style="font-size: 4rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); transition: transform 0.2s;">${icon}</span>
                </div>
                <h3 style="text-align: center;">${catName}</h3>
                <p style="text-align: center; color: var(--primary-color); font-weight: bold;">
                    ${count} Active Event${count > 1 ? 's' : ''}
                </p>
                <div style="text-align: center; margin-top: 1rem;">
                     <button class="btn btn-primary" style="padding: 0.4rem 1rem; font-size: 0.9rem;">View & Apply</button>
                </div>
            </div>
            `;
        });

        if (displayList.length === 0) {
            container.innerHTML = '<p class="text-muted" style="text-align:center;">No active activities at the moment. Check Upcoming Events!</p>';
            return;
        }

        container.innerHTML = displayList.join('');

    } catch (err) {
        console.error(err);
        container.innerHTML = '<p class="text-danger">Error loading activities.</p>';
    }
}

// Global scope for onclick
window.openActivityModal = function (categoryName) {
    const modal = document.getElementById('activity-modal');
    const title = document.getElementById('modal-title');
    const list = document.getElementById('modal-list');

    // access cachedCategories
    if (!cachedCategories[categoryName]) return;

    title.textContent = categoryName;
    list.innerHTML = cachedCategories[categoryName].map(sub => `<li>${sub}</li>`).join('');

    modal.style.display = 'flex';
}

/* Application Form Logic */
async function setupApplicationForm() {
    const categorySelect = document.getElementById('category');
    const subActivitySelect = document.getElementById('sub-activity');
    const eventSelect = document.getElementById('event-pref');
    const form = document.getElementById('application-form');

    if (!categorySelect || !form) return;

    try {
        // Fetch Events to populate dropdowns
        const res = await fetch(`${API_BASE}/events?limit=100`);
        const events = await res.json(); // Handling error implicitly via catch

        const catMap = {};
        events.forEach(evt => {
            if (!catMap[evt.category]) catMap[evt.category] = new Set();
            if (evt.subActivities && evt.subActivities.length > 0) {
                evt.subActivities.forEach(sub => catMap[evt.category].add(sub));
            } else {
                catMap[evt.category].add(evt.eventName);
            }
        });

        // Populate Categories
        Object.keys(catMap).forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categorySelect.appendChild(option);
        });

        // Populate Events (Optional - just listing all for preference)
        const futureEvents = events.filter(e => new Date(e.date) >= new Date());
        futureEvents.forEach(evt => {
            const option = document.createElement('option');
            option.value = evt._id; // Use ID for backend linking, or name if preferred
            option.textContent = `${evt.eventName} (${evt.date})`;
            eventSelect.appendChild(option);
        });

        // Handle Category Change -> Update Sub-Activity
        categorySelect.addEventListener('change', (e) => {
            const selected = e.target.value;
            subActivitySelect.innerHTML = '<option value="">Select Club...</option>';

            if (selected && catMap[selected]) {
                subActivitySelect.disabled = false;
                catMap[selected].forEach(sub => {
                    const opt = document.createElement('option');
                    opt.value = sub;
                    opt.textContent = sub;
                    subActivitySelect.appendChild(opt);
                });
            } else {
                subActivitySelect.disabled = true;
            }
        });

        // Handle Submit
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const formData = {
                studentName: document.getElementById('name').value, // Matches schema
                email: document.getElementById('email').value,
                class: document.getElementById('grade').value, // Schema uses 'class'
                rollNumber: document.getElementById('roll').value,
                phone: document.getElementById('phone').value,
                activity: document.getElementById('sub-activity').value, // 'activity' in schema
                // Handle eventId linking if an event is selected
                eventId: document.getElementById('event-pref').value || null,
                notes: document.getElementById('notes').value
            };

            // Note: Schema expects 'eventId' strictly if provided, or 'activity' string.
            // If the user selected an Event Preference, we might want to send that. 
            // The schema 'activity' field is required.

            try {
                const subRes = await fetch(`${API_BASE}/applications`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });

                if (subRes.ok) {
                    alert('Application Submitted Successfully!');
                    form.reset();
                    window.location.href = 'index.html';
                } else {
                    const err = await subRes.json();
                    alert('Error: ' + (err.message || 'Submission failed'));
                }
            } catch (err) {
                console.error(err);
                alert('Server Error during submission.');
            }
        });

    } catch (err) {
        console.error("Error setting up form:", err);
    }
}
