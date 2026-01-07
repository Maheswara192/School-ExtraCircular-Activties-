import React, { useEffect, useState } from 'react';
import adminApi from '../utils/api';
import '../admin.css';

const Events = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null); // null for add, object for edit

    const [formData, setFormData] = useState({
        eventName: '',
        category: '',
        startDate: '',
        endDate: '',
        time: '',
        venue: '',
        description: '',
        subActivities: '', // as comma separated string
        eventType: 'individual',
        minPlayers: 1,
        maxPlayers: 1,
        maxSubstitutes: 0,
        capacity: '', // empty string for unlimited/null
        icon: '',
        image: ''
    });

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const res = await adminApi.get('/events?limit=100');
            let data = Array.isArray(res.data) ? res.data : (res.data.data || []);

            // Sort logic based on Start Date
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            data.sort((a, b) => {
                const dateA = new Date(a.startDate);
                const dateB = new Date(b.startDate);

                // Simple sort: Nearest future first, then recent past
                return dateA - dateB;
            });

            setEvents(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this event?")) {
            try {
                await adminApi.delete(`/events/${id}`);
                setEvents(events.filter(e => e._id !== id));
            } catch (error) {
                alert("Failed to delete event: " + (error.response?.data?.message || "Unknown error"));
            }
        }
    };

    const openModal = (event = null) => {
        if (event) {
            setCurrentEvent(event);
            setFormData({
                eventName: event.eventName || '',
                category: event.category || '',
                startDate: event.startDate ? event.startDate.split('T')[0] : '',
                endDate: event.endDate ? event.endDate.split('T')[0] : '',
                time: event.time || '',
                venue: event.venue || '',
                description: event.description || '',
                subActivities: event.subActivities ? event.subActivities.join(', ') : '',
                eventType: event.eventType || 'individual',
                minPlayers: event.participationConfig?.minPlayers || 1,
                maxPlayers: event.participationConfig?.maxPlayers || 1,
                maxSubstitutes: event.participationConfig?.maxSubstitutes || 0,
                capacity: event.capacity || '',
                icon: event.icon || '',
                image: event.image || ''
            });
        } else {
            setCurrentEvent(null);
            setFormData({
                eventName: '', category: '', startDate: '', endDate: '', time: '', venue: '',
                description: '', subActivities: '', eventType: 'individual',
                minPlayers: 1, maxPlayers: 1, maxSubstitutes: 0, capacity: '',
                icon: '', image: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare Payload
        const payload = {
            eventName: formData.eventName,
            category: formData.category,
            startDate: formData.startDate,
            endDate: formData.endDate,
            date: formData.startDate, // Backward compatibility
            time: formData.time,
            venue: formData.venue,
            description: formData.description,
            subActivities: formData.subActivities.split(',').map(s => s.trim()).filter(s => s !== ''),
            eventType: formData.eventType,
            participationConfig: {
                minPlayers: parseInt(formData.minPlayers),
                maxPlayers: parseInt(formData.maxPlayers),
                maxSubstitutes: parseInt(formData.maxSubstitutes)
            },
            capacity: formData.capacity ? parseInt(formData.capacity) : null,
            icon: formData.icon,
            image: formData.image
        };

        try {
            if (currentEvent) {
                // Edit
                await adminApi.put(`/events/${currentEvent._id}`, payload);
            } else {
                // Add
                await adminApi.post('/events', payload);
            }
            setIsModalOpen(false);
            fetchEvents();
        } catch (error) {
            alert("Failed to save event: " + (error.response?.data?.message || error.message));
            console.error(error);
        }
    };

    const handlePrivateChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Filter Logic Helpers
    const isFuture = (e) => new Date(e.startDate).setHours(0, 0, 0, 0) > new Date().setHours(0, 0, 0, 0);
    const isPresent = (e) => {
        const today = new Date().setHours(0, 0, 0, 0);
        const start = new Date(e.startDate).setHours(0, 0, 0, 0);
        const end = new Date(e.endDate).setHours(0, 0, 0, 0);
        return start <= today && end >= today;
    };
    const isPast = (e) => new Date(e.endDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0);

    // Filter State
    const [filter, setFilter] = useState('future'); // 'future', 'present', 'past', 'all'

    const filteredEvents = events.filter(event => {
        if (filter === 'future') return isFuture(event);
        if (filter === 'present') return isPresent(event);
        if (filter === 'past') return isPast(event);
        return true;
    });

    // Counts for tabs
    const futureCount = events.filter(isFuture).length;
    const presentCount = events.filter(isPresent).length;
    const pastCount = events.filter(isPast).length;

    return (
        <div>
            {/* Events Sub-Navigation (Tabs) */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-light)', display: 'flex', gap: '2rem' }}>
                <button
                    onClick={() => setFilter('future')}
                    style={{
                        padding: '0 0 0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'future' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: filter === 'future' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'future' ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                    }}
                >
                    🚀 Future Events ({futureCount})
                </button>
                <button
                    onClick={() => setFilter('present')}
                    style={{
                        padding: '0 0 0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'present' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: filter === 'present' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'present' ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                    }}
                >
                    🎁 Present Events ({presentCount})
                </button>
                <button
                    onClick={() => setFilter('past')}
                    style={{
                        padding: '0 0 0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'past' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: filter === 'past' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'past' ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                    }}
                >
                    🕰️ Past Events ({pastCount})
                </button>
                <button
                    onClick={() => setFilter('all')}
                    style={{
                        padding: '0 0 0.75rem 0',
                        background: 'none',
                        border: 'none',
                        borderBottom: filter === 'all' ? '2px solid var(--primary)' : '2px solid transparent',
                        color: filter === 'all' ? 'var(--primary)' : 'var(--text-muted)',
                        fontWeight: filter === 'all' ? '600' : '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.95rem'
                    }}
                >
                    📋 All Events ({events.length})
                </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1>Manage Events</h1>
                <button className="btn btn-primary" onClick={() => openModal()}>+ Add Event</button>
            </div>

            <div className="table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Category</th>
                            <th>Type</th>
                            <th>Date Range</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" style={{ textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredEvents.map(event => {
                            const isFut = isFuture(event);
                            const isPres = isPresent(event);
                            let statusColor = '#94a3b8'; // gray
                            let statusTitle = 'Past';
                            if (isFut) { statusColor = '#10b981'; statusTitle = 'Future'; }
                            if (isPres) { statusColor = '#3b82f6'; statusTitle = 'Present'; }

                            return (
                                <tr key={event._id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: statusColor, display: 'inline-block' }} title={statusTitle}></span>
                                            {event.eventName}
                                        </div>
                                    </td>
                                    <td>{event.category}</td>
                                    <td>
                                        <span className={`badge ${event.eventType === 'team' ? 'badge-warning' : 'badge-success'}`}
                                            style={{ padding: '0.2rem 0.6rem', borderRadius: '4px', background: event.eventType === 'team' ? '#fef3c7' : '#d1fae5', color: event.eventType === 'team' ? '#92400e' : '#065f46', fontSize: '0.85rem' }}>
                                            {event.eventType === 'team' ? 'Team' : 'Individual'}
                                        </span>
                                    </td>
                                    <td>
                                        <span style={{ fontSize: '0.9em' }}>{event.startDate} ⮕ {event.endDate}</span>
                                    </td>
                                    <td>
                                        <button className="btn btn-sm" style={{ marginRight: '0.5rem', border: '1px solid var(--admin-border)' }} onClick={() => openModal(event)}>Edit</button>
                                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(event._id)}>Delete</button>
                                    </td>
                                </tr>
                            )
                        })}
                        {!loading && filteredEvents.length === 0 && (
                            <tr>
                                <td colSpan="5" style={{ textAlign: 'center', color: 'var(--admin-text-light)' }}>
                                    No {filter} events found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '700px', width: '90%', maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="modal-header">
                            <span>{currentEvent ? 'Edit Event' : 'Add New Event'}</span>
                            <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem' }}>&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Event Name *</label>
                                    <input name="eventName" className="form-input" value={formData.eventName} onChange={handlePrivateChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Category *</label>
                                    <input name="category" className="form-input" value={formData.category} onChange={handlePrivateChange} required />
                                </div>
                            </div>

                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input type="date" name="startDate" className="form-input" value={formData.startDate} onChange={handlePrivateChange} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">End Date *</label>
                                    <input type="date" name="endDate" className="form-input" value={formData.endDate} onChange={handlePrivateChange} required />
                                </div>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Time *</label>
                                <input type="time" name="time" className="form-input" value={formData.time} onChange={handlePrivateChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Venue *</label>
                                <input name="venue" className="form-input" value={formData.venue} onChange={handlePrivateChange} required />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea name="description" className="form-input" rows="3" value={formData.description} onChange={handlePrivateChange}></textarea>
                            </div>

                            {/* Visuals */}
                            <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Icon (Emoji or URL)</label>
                                    <input name="icon" className="form-input" placeholder="e.g. 🏆 or https://..." value={formData.icon} onChange={handlePrivateChange} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input name="image" className="form-input" placeholder="https://unsplash.com/..." value={formData.image} onChange={handlePrivateChange} />
                                </div>
                            </div>

                            {/* Configuration Section */}
                            <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                                <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: '#475569' }}>Participation Configuration</h4>

                                <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                    <div className="form-group">
                                        <label className="form-label">Event Type</label>
                                        <select name="eventType" className="form-input" value={formData.eventType} onChange={handlePrivateChange}>
                                            <option value="individual">Individual</option>
                                            <option value="team">Team</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Capacity (Max Applications)</label>
                                        <input type="number" name="capacity" className="form-input" placeholder="Leave empty for unlimited" value={formData.capacity} onChange={handlePrivateChange} />
                                    </div>
                                </div>

                                {formData.eventType === 'team' && (
                                    <div className="grid-3" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                        <div className="form-group">
                                            <label className="form-label">Min Players</label>
                                            <input type="number" name="minPlayers" className="form-input" value={formData.minPlayers} onChange={handlePrivateChange} min="1" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Max Players</label>
                                            <input type="number" name="maxPlayers" className="form-input" value={formData.maxPlayers} onChange={handlePrivateChange} min="1" />
                                        </div>
                                        <div className="form-group">
                                            <label className="form-label">Max Substitutes</label>
                                            <input type="number" name="maxSubstitutes" className="form-input" value={formData.maxSubstitutes} onChange={handlePrivateChange} min="0" />
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="form-group">
                                <label className="form-label">Sub Activities (comma separated)</label>
                                <input name="subActivities" className="form-input" placeholder="e.g. Football, Basketball" value={formData.subActivities} onChange={handlePrivateChange} />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn" style={{ border: '1px solid var(--admin-border)' }} onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Events;
