import { useState, useEffect, useCallback } from 'react';
// Navbar removed
import api from '../api';
import { useSocket } from '../context/SocketContext';
import { FaMedal, FaTrophy, FaSearch, FaFilter } from 'react-icons/fa';

const Leaderboard = () => {
    const socket = useSocket();
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState('');
    const [level, setLevel] = useState('Class'); // Class, School, Zonal
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Events for Dropdown
    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const { data } = await api.get('/events?limit=100');
                const list = Array.isArray(data) ? data : (data.data || []);
                setEvents(list);
                if (list.length > 0) setSelectedEvent(list[0]._id);
            } catch (err) {
                console.error(err);
            }
        };
        fetchEvents();
    }, []);

    // Fetch Leaderboard Data
    const fetchLeaderboard = useCallback(async () => {
        if (!selectedEvent) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/performance/leaderboard`, {
                params: { eventId: selectedEvent, level }
            });
            setLeaderboard(data);
        } catch (err) {
            console.error("Failed to load leaderboard", err);
        } finally {
            setLoading(false);
        }
    }, [selectedEvent, level]);

    // Initial Fetch & Dependency on Selection
    useEffect(() => {
        fetchLeaderboard();
    }, [fetchLeaderboard]);

    // Real-time Updates via Socket.IO
    useEffect(() => {
        if (!socket) return;

        const handleUpdate = (data) => {
            // Only refresh if the update is for the current view
            if (data.eventId === selectedEvent && data.level === level) {
                console.log("Real-time Leaderboard Update Received!");
                fetchLeaderboard();
            }
        };

        socket.on('leaderboard_update', handleUpdate);

        return () => {
            socket.off('leaderboard_update', handleUpdate);
        };
    }, [socket, selectedEvent, level, fetchLeaderboard]);

    const getMedal = (rank) => {
        switch (rank) {
            case 0: return <FaMedal color="#FFD700" size={24} title="Gold" />; // Gold
            case 1: return <FaMedal color="#C0C0C0" size={24} title="Silver" />; // Silver
            case 2: return <FaMedal color="#CD7F32" size={24} title="Bronze" />; // Bronze
            default: return <span style={{ fontWeight: 'bold', marginLeft: '0.4rem' }}>#{rank + 1}</span>;
        }
    };

    return (
        <>
            {/* Navbar handled by Layout */}
            <div className="container section-padding">
                <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                    <h1 style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <FaTrophy color="#F59E0B" /> Live Leaderboard
                    </h1>
                    <p className="text-muted">Track top performers across Class, School, and Zonal levels.</p>
                </div>

                {/* Controls */}
                <div className="card fade-in" style={{ marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Event</label>
                        <div style={{ position: 'relative' }}>
                            <FaSearch style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                            <select
                                className="form-control"
                                style={{ paddingLeft: '2.5rem' }}
                                value={selectedEvent}
                                onChange={(e) => setSelectedEvent(e.target.value)}
                            >
                                <option value="">Select Event...</option>
                                {events.map(ev => (
                                    <option key={ev._id} value={ev._id}>{ev.eventName} ({ev.category})</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div style={{ flex: 1, minWidth: '200px' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>Select Level</label>
                        <div style={{ position: 'relative' }}>
                            <FaFilter style={{ position: 'absolute', left: '10px', top: '12px', color: '#94a3b8' }} />
                            <select
                                className="form-control"
                                style={{ paddingLeft: '2.5rem' }}
                                value={level}
                                onChange={(e) => setLevel(e.target.value)}
                            >
                                <option value="Class">Class Level</option>
                                <option value="School">School Level</option>
                                <option value="Zonal">Zonal Level</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Rankings */}
                <div className="card fade-in">
                    {loading ? (
                        <div className="text-center">Loading rankings...</div>
                    ) : leaderboard.length === 0 ? (
                        <div className="text-center text-muted" style={{ padding: '2rem' }}>
                            No performance records found for this event/level.
                        </div>
                    ) : (
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                                    <th style={{ padding: '1rem' }}>Rank</th>
                                    <th style={{ padding: '1rem' }}>Student</th>
                                    <th style={{ padding: '1rem' }}>Class</th>
                                    <th style={{ padding: '1rem' }}>Score/Metric</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaderboard.map((entry, index) => (
                                    <tr key={entry._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem', display: 'flex', alignItems: 'center' }}>
                                            {getMedal(index)}
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: '600' }}>
                                            {entry.studentName} <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.9rem' }}>({entry.rollNumber})</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>{entry.class}</td>
                                        <td style={{ padding: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                                            {entry.score} <span style={{ fontSize: '0.8rem', fontWeight: 'normal' }}>{entry.metricType}</span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span className={`badge badge-${entry.status?.toLowerCase() || 'pending'}`}>
                                                {entry.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </>
    );
};

export default Leaderboard;
