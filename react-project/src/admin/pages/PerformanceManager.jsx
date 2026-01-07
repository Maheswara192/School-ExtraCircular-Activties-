import React, { useState, useEffect } from 'react';
import adminApi from '../utils/api';
import '../admin.css';

const PerformanceManager = () => {
    const [events, setEvents] = useState([]);
    const [selectedEventId, setSelectedEventId] = useState('');
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [students, setStudents] = useState([]);
    const [scores, setScores] = useState({}); // { rollNumber: score }
    const [loading, setLoading] = useState(false);

    // Fetch Events on Mount
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const res = await adminApi.get('/events?limit=100');
                const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
                setEvents(list);
            } catch (err) {
                console.error("Failed to load events", err);
            }
        };
        fetchEvents();
    }, []);

    // Fetch Participants when Event Selected
    useEffect(() => {
        if (!selectedEventId) {
            setStudents([]);
            return;
        }

        const fetchParticipants = async () => {
            setLoading(true);
            try {
                // 1. Get Event Details to know Metric Type
                const eventRes = await adminApi.get(`/events/${selectedEventId}`);
                setSelectedEvent(eventRes.data);

                // 2. Get Accepted Applications
                const appsRes = await adminApi.get('/applications');
                const allApps = Array.isArray(appsRes.data) ? appsRes.data : (appsRes.data.data || []);

                // Filter only 'Accepted' for this event
                const participants = allApps.filter(app =>
                    (app.eventId._id === selectedEventId || app.eventId === selectedEventId) &&
                    app.status === 'Accepted'
                );

                setStudents(participants);

                // 3. Load Existing Scores (Leaderboard) for pre-filling
                try {
                    const perfRes = await adminApi.get(`/performance/leaderboard?eventId=${selectedEventId}&level=School`);
                    const existingScores = {};
                    if (perfRes.data && Array.isArray(perfRes.data)) {
                        perfRes.data.forEach(p => {
                            existingScores[p.rollNumber] = p.score;
                        });
                    }
                    setScores(existingScores);
                } catch (e) {
                    console.warn("No existing scores loaded");
                }

            } catch (err) {
                console.error(err);
                alert("Failed to load participants");
            } finally {
                setLoading(false);
            }
        };

        fetchParticipants();
    }, [selectedEventId]);

    const handleScoreChange = (roll, val) => {
        setScores(prev => ({ ...prev, [roll]: val }));
    };

    const saveScore = async (student) => {
        const scoreVal = scores[student.rollNumber];
        if (scoreVal === undefined || scoreVal === '') {
            alert("Please enter a score");
            return;
        }

        try {
            await adminApi.post('/performance', {
                eventId: selectedEventId,
                studentName: student.studentName,
                rollNumber: student.rollNumber,
                class: student.class,
                score: Number(scoreVal),
                level: 'School' // Defaulting to School Level entry for now
            });
            alert(`Score saved for ${student.studentName}!`);
        } catch (err) {
            alert("Failed to save score");
            console.error(err);
        }
    };

    const handlePromote = async () => {
        if (!window.confirm("Promote Top 5 Students to Zonal Level?")) return;
        try {
            const res = await adminApi.post('/performance/promote', {
                eventId: selectedEventId,
                currentLevel: 'School',
                nextLevel: 'Zonal',
                limit: 5
            });
            alert(`Promotion Complete! Promoted: ${res.data.stats.promoted}`);
        } catch (err) {
            alert("Promotion Failed: " + (err.response?.data?.message || err.message));
        }
    };

    return (
        <div className="fade-in">
            <h1>🏆 Performance Management</h1>
            <p className="description" style={{ marginBottom: '2rem' }}>Enter scores and manage promotions for events.</p>

            <div className="card" style={{ marginBottom: '2rem' }}>
                <label className="form-label">Select Event to Manage</label>
                <select
                    className="form-control"
                    value={selectedEventId}
                    onChange={(e) => setSelectedEventId(e.target.value)}
                >
                    <option value="">-- Choose Event --</option>
                    {events.map(ev => (
                        <option key={ev._id} value={ev._id}>{ev.eventName} ({ev.category})</option>
                    ))}
                </select>
            </div>

            {selectedEventId && (
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                        <h3>Participants ({students.length})</h3>
                        {students.length > 0 && (
                            <button className="btn btn-primary" onClick={handlePromote} style={{ backgroundColor: '#8b5cf6' }}>
                                🚀 Promote Top 5 to Zonal
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <p>Loading participants...</p>
                    ) : students.length === 0 ? (
                        <p className="text-muted">No accepted participants found for this event.</p>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Class</th>
                                    <th>Score / Metric ({selectedEvent?.metricConfig?.unit || 'pts'})</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {students.map(student => (
                                    <tr key={student._id}>
                                        <td>{student.studentName} <br /><small>{student.rollNumber}</small></td>
                                        <td>{student.class}</td>
                                        <td>
                                            <input
                                                type="number"
                                                className="form-control"
                                                style={{ width: '120px' }}
                                                placeholder={selectedEvent?.metricConfig?.metricLabel || 'Score'}
                                                value={scores[student.rollNumber] || ''}
                                                onChange={(e) => handleScoreChange(student.rollNumber, e.target.value)}
                                            />
                                        </td>
                                        <td>
                                            <button className="btn btn-sm" onClick={() => saveScore(student)}>
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
    );
};

export default PerformanceManager;
