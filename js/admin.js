/**
 * admin.js
 * Handles authentication and admin dashboard operations via Backend API.
 */

const API_BASE = 'http://localhost:5000/api';

/* --- Categories (Static for now) --- */
const CATEGORIES = [
    "Sports & Physical Education",
    "Arts & Crafts",
    "Music",
    "Dance",
    "Literature & Language",
    "Science & Technology",
    "Social Service & Leadership",
    "Wellness & Mindfulness",
    "Cultural & Heritage",
    "Drama & Theatre",
    "Environmental & Sustainability",
    "Culinary Arts",
    "Digital & Media",
    "Outdoor & Adventure",
    "Academic Clubs"
];

// DOM Elements & Routing
document.addEventListener('DOMContentLoaded', () => {
    const path = window.location.pathname;

    // Login Page Logic
    if (path.includes('admin-login.html')) {
        const form = document.getElementById('admin-login-form');
        if (form) {
            form.addEventListener('submit', handleLogin);
        }
    }

    // Dashboard Logic
    if (path.includes('admin-dashboard.html')) {
        if (!checkAuth()) return;

        // Load Initial Data
        loadApplicationsTable();
        loadEventsTable();
        loadActivitiesTable();
        populateEventCategories();
        loadDashboardStats(); // Load Counts

        // Event Listeners
        const evtForm = document.getElementById('event-form');
        if (evtForm) evtForm.addEventListener('submit', handleEventSave);

        // Sidebar / Navigation
        // Ensure switchTab is available
    }
});

async function loadDashboardStats() {
    try {
        const res = await fetch(`${API_BASE}/events/counts`);
        if (!res.ok) return;
        const data = await res.json();

        const totalEl = document.getElementById('stats-total');
        const presentEl = document.getElementById('stats-present');
        const upcomingEl = document.getElementById('stats-upcoming');

        if (totalEl) totalEl.textContent = data.totalEvents;
        if (presentEl) presentEl.textContent = data.presentCount;
        if (upcomingEl) upcomingEl.textContent = data.upcomingCount;

    } catch (err) {
        console.error("Failed to load stats:", err);
    }
}

/* --- Authentication --- */

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('error-msg');

    try {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (res.ok) {
            sessionStorage.setItem('admin_token', data.token);
            sessionStorage.setItem('admin_user', JSON.stringify(data));
            window.location.href = 'admin-dashboard.html';
        } else {
            errorMsg.textContent = data.message || 'Invalid credentials';
            errorMsg.style.display = 'block';
        }
    } catch (err) {
        console.error(err);
        errorMsg.textContent = 'Server Error. Please check backend.';
        errorMsg.style.display = 'block';
    }
}

function checkAuth() {
    const token = sessionStorage.getItem('admin_token');
    if (!token) {
        window.location.href = 'admin-login.html';
        return false;
    }
    return true;
}

// Global scope for onclick
window.adminLogout = function () {
    sessionStorage.clear();
    window.location.href = 'admin-login.html';
}

function getAuthHeaders() {
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('admin_token')}`
    };
}

/* --- Applications Management --- */

async function loadApplicationsTable() {
    const tbody = document.getElementById('applications-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/applications`, {
            headers: getAuthHeaders()
        });
        if (!res.ok) throw new Error('Failed to fetch applications');

        const apps = await res.json();

        if (apps.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;">No applications yet.</td></tr>';
            return;
        }

        tbody.innerHTML = apps.map(app => `
            <tr>
                <td>
                    <strong>${app.studentName}</strong><br>
                    <span class="text-muted" style="font-size:0.85em;">${app.class}-${app.section} | ${app.rollNumber}</span>
                </td>
                <td>
                    ${app.activity || (app.eventId ? app.eventId.eventName : 'Unknown')}<br>
                    <span class="text-muted" style="font-size:0.85em;">${app.eventId ? app.eventId.category : ''}</span>
                </td>
                <td>${new Date(app.createdAt).toLocaleDateString()}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(app.status)}">${app.status}</span>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem;" onclick="updateAppStatus('${app._id}', 'Accepted')">✅</button>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem;" onclick="updateAppStatus('${app._id}', 'Rejected')">❌</button>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; color: var(--danger);" onclick="deleteApp('${app._id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:red;">Error loading data</td></tr>';
    }
}

function getStatusBadgeClass(status) {
    if (status === 'Accepted') return 'badge-accepted';
    if (status === 'Rejected') return 'badge-rejected';
    return 'badge-pending';
}

// Global scope
window.updateAppStatus = async function (id, status) {
    if (!confirm(`Mark application as ${status}?`)) return;

    try {
        const res = await fetch(`${API_BASE}/applications/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status })
        });
        if (res.ok) {
            loadApplicationsTable();
        } else {
            alert('Failed to update status');
        }
    } catch (err) {
        console.error(err);
    }
}

window.deleteApp = async function (id) {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
        const res = await fetch(`${API_BASE}/applications/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            loadApplicationsTable();
        } else {
            alert('Failed to delete');
        }
    } catch (err) {
        console.error(err);
    }
}

/* --- Events Management --- */

let currentEvents = []; // Store locally for editing

async function loadEventsTable() {
    const tbody = document.getElementById('events-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/events`);
        if (!res.ok) throw new Error('Failed to fetch events');

        const events = await res.json();
        currentEvents = Array.isArray(events) ? events : (events.data || []);

        if (currentEvents.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No events create yet.</td></tr>';
            return;
        }

        tbody.innerHTML = currentEvents.map(evt => `
            <tr>
                <td><strong>${evt.eventName}</strong></td>
                <td>
                    ${evt.startDate} to ${evt.endDate}<br>
                    <span class="text-muted" style="font-size:0.85em;">@ ${evt.time}</span><br>
                    <span class="text-muted" style="font-size:0.85em;">${evt.venue}</span>
                </td>
                <td>
                    ${evt.category}<br>
                    <span class="badge ${evt.status === 'present' ? 'badge-accepted' : 'badge-pending'}">${evt.status || 'Planned'}</span>
                </td>
                <td>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem;" onclick="editEvent('${evt._id}')">✏️</button>
                    <button class="btn btn-secondary" style="padding: 0.25rem 0.5rem; color: var(--danger);" onclick="deleteEvent('${evt._id}')">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center; color:red;">Error loading events</td></tr>';
    }
}

window.openEventModal = function () {
    document.getElementById('event-form').reset();
    document.getElementById('evt-id').value = '';
    document.getElementById('event-modal-title').textContent = 'Add Event';
    document.getElementById('event-modal').style.display = 'flex';
}

window.closeEventModal = function () {
    document.getElementById('event-modal').style.display = 'none';
}

window.editEvent = function (id) {
    const evt = currentEvents.find(e => e._id === id);
    if (evt) {
        document.getElementById('evt-id').value = evt._id;
        document.getElementById('evt-name').value = evt.eventName;
        document.getElementById('evt-time').value = evt.time;

        // Handle Start/End Date
        let s = evt.startDate;
        let e = evt.endDate;
        if (s && s.includes('T')) s = s.split('T')[0];
        if (e && e.includes('T')) e = e.split('T')[0];

        document.getElementById('evt-start-date').value = s || '';
        document.getElementById('evt-end-date').value = e || '';


        document.getElementById('evt-venue').value = evt.venue;
        document.getElementById('evt-category').value = evt.category;
        document.getElementById('evt-desc').value = evt.description || '';

        document.getElementById('event-modal-title').textContent = 'Edit Event';
        document.getElementById('event-modal').style.display = 'flex';
    }
}

async function handleEventSave(e) {
    e.preventDefault();

    const id = document.getElementById('evt-id').value;
    const eventData = {
        eventName: document.getElementById('evt-name').value,
        startDate: document.getElementById('evt-start-date').value,
        endDate: document.getElementById('evt-end-date').value,
        // Backward compatibility
        date: document.getElementById('evt-start-date').value,
        time: document.getElementById('evt-time').value,
        venue: document.getElementById('evt-venue').value,
        category: document.getElementById('evt-category').value,
        description: document.getElementById('evt-desc').value
    };

    try {
        let res;
        if (id) {
            // Update
            res = await fetch(`${API_BASE}/events/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(eventData)
            });
        } else {
            // Create
            res = await fetch(`${API_BASE}/events`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(eventData)
            });
        }

        if (res.ok) {
            closeEventModal();
            loadEventsTable();
            loadDashboardStats(); // Refresh counts
        } else {
            const err = await res.json();
            alert('Error: ' + (err.message || 'Failed to save event'));
        }
    } catch (err) {
        console.error(err);
        alert('Server Error');
    }
}

window.deleteEvent = async function (id) {
    if (!confirm('Delete this event?')) return;

    try {
        const res = await fetch(`${API_BASE}/events/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        if (res.ok) {
            loadEventsTable();
            loadDashboardStats(); // Refresh counts
        } else {
            alert('Failed to delete event');
        }
    } catch (err) {
        console.error(err);
    }
}


function populateEventCategories() {
    const select = document.getElementById('evt-category');
    if (select) {
        select.innerHTML = CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('');
    }
}

/* --- Activities (Static View) --- */
async function loadActivitiesTable() {
    const tbody = document.getElementById('activities-table-body');
    if (!tbody) return;

    try {
        const res = await fetch(`${API_BASE}/events?limit=100`);
        if (!res.ok) throw new Error('Failed to fetch events for activities');

        const data = await res.json();
        const events = Array.isArray(data) ? data : (data.data || []);

        if (events.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" style="text-align:center;">No activities found. Create events to see categories here.</td></tr>';
            return;
        }

        // Group by Category
        const catMap = {};
        events.forEach(evt => {
            if (!catMap[evt.category]) {
                catMap[evt.category] = new Set();
            }
            // Add sub-activities or event Name if no sub-activities
            if (evt.subActivities && evt.subActivities.length > 0) {
                evt.subActivities.forEach(sub => catMap[evt.category].add(sub));
            } else {
                catMap[evt.category].add(evt.eventName);
            }
        });

        const sortedCategories = Object.keys(catMap).sort();

        tbody.innerHTML = sortedCategories.map(cat => {
            const subs = Array.from(catMap[cat]);
            const count = subs.length;
            const subsStr = subs.join(', ');

            return `
            <tr>
                <td><strong>${cat}</strong></td>
                <td>
                    <span class="badge badge-primary" style="margin-bottom: 0.5rem; display: inline-block;">${count} Clubs/Activities</span><br>
                    ${subsStr}
                </td>
                <td>
                    <button class="btn btn-secondary" disabled title="Categories are managed via Events">🔒 Generated</button>
                </td>
            </tr>
            `;
        }).join('');

    } catch (err) {
        console.error(err);
        tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:red;">Error loading activities</td></tr>';
    }
}

/* --- Navigation --- */
window.switchTab = function (tabName) {
    // Hide all views
    const views = ['view-applications', 'view-events', 'view-activities'];
    views.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = 'none';
    });

    // Deactivate all tabs
    const tabs = ['tab-applications', 'tab-events', 'tab-activities'];
    tabs.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active')
    });

    // Show selected
    const view = document.getElementById(`view-${tabName}`);
    if (view) view.style.display = 'block';

    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) tab.classList.add('active');

    let title = 'Applications';
    if (tabName === 'events') title = 'Events Manager';
    if (tabName === 'activities') title = 'Activities Manager';

    const pageTitle = document.getElementById('page-title');
    if (pageTitle) pageTitle.textContent = title;
}
