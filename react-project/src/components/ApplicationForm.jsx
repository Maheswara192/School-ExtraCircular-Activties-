import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaIdCard, FaPhone, FaShapes, FaRunning, FaPen, FaUsers, FaPlus, FaTrash, FaInfoCircle, FaTicketAlt } from 'react-icons/fa';
import { useSocket } from '../context/SocketContext';

/**
 * ApplicationForm Component (Dynamic Team/Individual)
 */
const ApplicationForm = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const socket = useSocket();
    const preSelectedCategory = location.state?.category || '';

    const [events, setEvents] = useState([]);
    const [categories, setCategories] = useState({});

    // Dynamic Configuration based on selected "SubActivity" (which maps to an Event Name now)
    const [currentEventConfig, setCurrentEventConfig] = useState(null);
    const [availability, setAvailability] = useState({ available: true, remaining: null, total: null });

    // Form State
    const [formData, setFormData] = useState({
        // Primary Applicant (Captain/Individual)
        name: '', phone: '', grade: '', section: '', rollNumber: '',
        category: preSelectedCategory,
        subActivity: '',
        eventId: '',
        // Team Details
        teamName: '',
        teamMembers: [] // Array of { name, rollNumber, isSubstitute }
    });

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events?limit=100');
                const eventsList = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setEvents(eventsList);

                // Map Categories -> Events
                const catMap = {};
                eventsList.forEach(evt => {
                    const cat = evt.category;
                    if (!catMap[cat]) catMap[cat] = [];
                    // Using eventName as the unique identifier for selection
                    if (!catMap[cat].some(e => e.eventName === evt.eventName)) {
                        catMap[cat].push(evt);
                    }
                });
                setCategories(catMap);
            } catch (error) {
                console.error("Failed to fetch events", error);
            }
        };
        fetchEvents();
    }, []);

    // Real-time Slot Updates
    useEffect(() => {
        if (!socket || !formData.eventId) return;

        const handleNewApplication = (app) => {
            if (app.eventId === formData.eventId && availability.remaining !== null) {
                setAvailability(prev => {
                    if (prev.remaining === null) return prev;
                    const newRemaining = Math.max(0, prev.remaining - 1);
                    return { ...prev, remaining: newRemaining, available: newRemaining > 0 };
                });
            }
        };

        socket.on('new_application', handleNewApplication);

        return () => {
            socket.off('new_application', handleNewApplication);
        };
    }, [socket, formData.eventId, availability.remaining]);

    const fetchAvailability = async (eventId) => {
        try {
            const res = await api.get(`/events/${eventId}/availability`);
            setAvailability(res.data);
        } catch (error) {
            console.error("Failed to fetch availability", error);
        }
    };

    // Handle Category/Activity Selection changes
    const handleActivityChange = (e) => {
        const { name, value } = e.target;

        if (name === 'category') {
            setFormData(prev => ({ ...prev, category: value, subActivity: '', eventId: '', teamMembers: [] }));
            setCurrentEventConfig(null);
            setAvailability({ available: true, remaining: null, total: null });
        } else if (name === 'subActivity') {
            // Find the specific event object
            const selectedEvent = events.find(ev => ev.eventName === value);

            if (selectedEvent) {
                setFormData(prev => ({
                    ...prev,
                    subActivity: value,
                    eventId: selectedEvent._id,
                    teamMembers: [] // Reset team on change
                }));
                // Set Config
                setCurrentEventConfig({
                    type: selectedEvent.eventType || 'individual',
                    minPlayers: selectedEvent.participationConfig?.minPlayers || 1,
                    maxPlayers: selectedEvent.participationConfig?.maxPlayers || 1,
                    maxSubstitutes: selectedEvent.participationConfig?.maxSubstitutes || 0
                });

                // Fetch Availability
                fetchAvailability(selectedEvent._id);
            }
        }
    };

    const handlePrivateChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Team Management
    const addTeamMember = () => {
        if (!currentEventConfig) return;
        const currentCount = formData.teamMembers.length;
        // Check Limits (accounting for Main Applicant being Player 1 in logic, OR enforcing only teamMembers array)
        // Let's assume Main Applicant is Captain, teamMembers are *additional* players
        const maxAdditional = (currentEventConfig.maxPlayers - 1) + currentEventConfig.maxSubstitutes;

        if (currentCount < maxAdditional) {
            setFormData(prev => ({
                ...prev,
                teamMembers: [...prev.teamMembers, { name: '', rollNumber: '', isSubstitute: false }]
            }));
        } else {
            toast.error(`Maximum limit reached! (${currentEventConfig.maxPlayers} players + ${currentEventConfig.maxSubstitutes} subs)`);
        }
    };

    const updateTeamMember = (index, field, value) => {
        const updated = [...formData.teamMembers];
        updated[index][field] = value;
        setFormData(prev => ({ ...prev, teamMembers: updated }));
    };

    const removeTeamMember = (index) => {
        const updated = formData.teamMembers.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, teamMembers: updated }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (availability.remaining !== null && availability.remaining <= 0) {
            toast.error("Sorry, this event is full!");
            return;
        }

        // Validation
        if (currentEventConfig && currentEventConfig.type === 'team') {
            const totalPlayers = 1 + formData.teamMembers.filter(m => !m.isSubstitute).length;
            if (totalPlayers < currentEventConfig.minPlayers) {
                toast.error(`Minimum ${currentEventConfig.minPlayers} players are required for this team event.`);
                return;
            }
        }

        const payload = {
            studentName: formData.name,
            class: formData.grade,
            section: formData.section,
            rollNumber: formData.rollNumber,
            phone: formData.phone,
            activity: formData.subActivity,
            eventId: formData.eventId || undefined,
            // Team Data
            teamName: formData.teamName,
            teamMembers: formData.teamMembers
        };

        try {
            await api.post('/applications', payload);
            toast.success('Application Submitted Successfully!');
            navigate('/');
        } catch (error) {
            console.error("Application failed", error);
            toast.error('Failed to submit application: ' + (error.response?.data?.message || 'Server Error'));
        }
    };

    const availableActivites = formData.category ? categories[formData.category] || [] : [];
    const isTeamEvent = currentEventConfig?.type === 'team';

    return (
        <form onSubmit={handleSubmit} className="card fade-in" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <h2 className="text-center mb-8" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <FaPen /> {isTeamEvent ? 'Team Registration Form' : 'Student Application Form'}
            </h2>

            {/* Event Selection First - To Drive Dynamic Fields */}
            <div className="grid-auto" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem', backgroundColor: '#f8fafc', padding: '1.5rem', borderRadius: '0.5rem' }}>
                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaShapes /> Category *</label>
                    <select name="category" required className="form-control" value={formData.category} onChange={handleActivityChange}>
                        <option value="">Select Category...</option>
                        {Object.keys(categories).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><FaRunning /> Activity/Event *</label>
                    <select name="subActivity" required className="form-control" value={formData.subActivity} onChange={handleActivityChange} disabled={!formData.category}>
                        <option value="">Select Activity...</option>
                        {availableActivites.map(evt => (
                            <option key={evt._id} value={evt.eventName}>{evt.eventName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Dynamic Event Info Banner */}
            {currentEventConfig && (
                <div style={{ marginBottom: '2rem', padding: '1rem', borderLeft: '4px solid var(--primary)', background: '#e0e7ff', borderRadius: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h4 style={{ margin: 0, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {currentEventConfig.type === 'team' ? <FaUsers /> : <FaUser />}
                                {currentEventConfig.type === 'team' ? 'Team Event Configuration' : 'Individual Event'}
                            </h4>
                            {isTeamEvent && (
                                <div style={{ fontSize: '0.9rem', marginTop: '0.5rem', color: '#4338ca' }}>
                                    Requires {currentEventConfig.minPlayers}-{currentEventConfig.maxPlayers} Main Players.
                                    {currentEventConfig.maxSubstitutes > 0 && ` Up to ${currentEventConfig.maxSubstitutes} Substitutes allowed.`}
                                </div>
                            )}
                        </div>

                        {/* Real-time Availability Badge */}
                        {availability.total !== null && (
                            <div style={{
                                background: availability.available ? '#dcfce7' : '#fee2e2',
                                color: availability.available ? '#166534' : '#991b1b',
                                padding: '0.5rem 1rem',
                                borderRadius: '2rem',
                                fontSize: '0.9rem',
                                fontWeight: 'bold',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                border: `1px solid ${availability.available ? '#bbf7d0' : '#fecaca'}`
                            }}>
                                <FaTicketAlt />
                                {availability.remaining <= 0 ? (
                                    <span>Event Full</span>
                                ) : (
                                    <span>{availability.remaining} Slots Remaining</span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Core Applicant / Team Captain Details */}
            <h4 className="mb-4">{isTeamEvent ? 'Team Captain Details' : 'Applicant Details'}</h4>
            <div className="grid-auto" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label className="form-label"><FaUser /> Name *</label>
                    <input name="name" required className="form-control" value={formData.name} onChange={handlePrivateChange} />
                </div>
            </div>
            <div className="grid-auto" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div className="form-group"><label className="form-label">Grade *</label><input name="grade" required className="form-control" value={formData.grade} onChange={handlePrivateChange} /></div>
                <div className="form-group"><label className="form-label">Section *</label><input name="section" required className="form-control" value={formData.section} onChange={handlePrivateChange} /></div>
                <div className="form-group"><label className="form-label">Roll No. *</label><input name="rollNumber" required className="form-control" value={formData.rollNumber} onChange={handlePrivateChange} /></div>
                <div className="form-group"><label className="form-label">Phone *</label><input name="phone" required className="form-control" value={formData.phone} onChange={handlePrivateChange} /></div>
            </div>

            {/* TEAM SECTION */}
            {isTeamEvent && (
                <div className="section-padding" style={{ borderTop: '2px dashed #cbd5e1', marginTop: '1rem' }}>
                    <div className="form-group" style={{ maxWidth: '50%;', marginBottom: '1.5rem' }}>
                        <label className="form-label"><FaUsers /> Team Name *</label>
                        <input name="teamName" required className="form-control" value={formData.teamName} onChange={handlePrivateChange} placeholder="e.g. The Avengers" />
                    </div>

                    <h4 className="mb-4">Team Members</h4>

                    {formData.teamMembers.length === 0 && (
                        <p className="text-muted" style={{ fontStyle: 'italic', marginBottom: '1rem' }}>No additional members added yet. Click the button below.</p>
                    )}

                    {formData.teamMembers.map((member, index) => (
                        <div key={index} className="fade-in" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '1rem', alignItems: 'end', marginBottom: '1rem', background: '#f1f5f9', padding: '1rem', borderRadius: '0.5rem', borderLeft: member.isSubstitute ? '4px solid #f59e0b' : '4px solid #3b82f6' }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Player Name</label>
                                <input required className="form-control" value={member.name} onChange={e => updateTeamMember(index, 'name', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Roll No.</label>
                                <input required className="form-control" value={member.rollNumber} onChange={e => updateTeamMember(index, 'rollNumber', e.target.value)} />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label" style={{ fontSize: '0.8rem' }}>Role</label>
                                <select className="form-control" value={member.isSubstitute ? 'sub' : 'main'} onChange={e => updateTeamMember(index, 'isSubstitute', e.target.value === 'sub')}>
                                    <option value="main">Main Player</option>
                                    <option value="sub">Substitute</option>
                                </select>
                            </div>
                            <button type="button" onClick={() => removeTeamMember(index)} className="btn btn-danger" style={{ padding: '0.6rem' }}><FaTrash /></button>
                        </div>
                    ))}

                    <button type="button" className="btn btn-secondary" onClick={addTeamMember} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaPlus /> Add Player / Substitute
                    </button>
                    <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaInfoCircle />
                        Limit: {currentEventConfig.maxPlayers - 1} more main players + {currentEventConfig.maxSubstitutes} substitutes.
                    </p>
                </div>
            )}

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
                <label className="form-label">Additional Notes</label>
                <textarea name="notes" className="form-control" rows="4" value={formData.notes} onChange={handlePrivateChange}></textarea>
            </div>

            <hr className="mb-8" style={{ borderColor: '#e2e8f0', marginTop: '2rem' }} />

            <button
                type="submit"
                className="btn btn-primary"
                disabled={availability.remaining !== null && availability.remaining <= 0}
                style={{ width: '100%', fontSize: '1.1rem', padding: '1rem', opacity: (availability.remaining !== null && availability.remaining <= 0) ? 0.6 : 1 }}
            >
                {availability.remaining !== null && availability.remaining <= 0 ? 'Event Full' : 'Submit Application'}
            </button>
        </form>
    );
};

export default ApplicationForm;
