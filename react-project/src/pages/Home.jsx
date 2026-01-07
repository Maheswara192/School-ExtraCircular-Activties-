import React, { useState, useEffect } from 'react';
// Navbar removed
import { Link } from 'react-router-dom';
import api from '../api';
import { FaArrowRight } from 'react-icons/fa';

const Home = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        const fetchEvents = async () => {
            try {
                const response = await api.get('/events?status=upcoming');
                const eventsList = Array.isArray(response.data) ? response.data : (response.data.data || []);
                setEvents(eventsList.slice(0, 15));
            } catch (error) {
                console.error("Failed to load events", error);
            }
        };
        fetchEvents();
    }, []);

    return (
        <>
            {/* Navbar handled by Layout */}

            {/* Hero */}
            {/* Hero Section - Enterprise Grade */}
            <header style={{
                background: 'radial-gradient(circle at top right, rgba(79, 70, 229, 0.1), transparent 40%), linear-gradient(180deg, #F8FAFC 0%, #FFFFFF 100%)',
                paddingTop: '6rem',
                paddingBottom: '4rem',
                borderBottom: '1px solid var(--border-light)'
            }}>
                <div className="container" style={{ textAlign: 'center' }}>
                    <div className="fade-in">
                        <span className="badge badge-promoted" style={{ marginBottom: '1.5rem', display: 'inline-block', fontSize: '0.85rem' }}>
                            ✨ Premium Extracurricular Management
                        </span>
                        <h1 style={{
                            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
                            lineHeight: '1.1',
                            marginBottom: '1.5rem',
                            fontWeight: '800',
                            letterSpacing: '-0.02em',
                            color: '#0F172A'
                        }}>
                            Unlock Your Potential <br />
                            <span style={{ color: 'var(--primary)' }}>Beyond the Classroom</span>
                        </h1>
                        <p style={{
                            fontSize: '1.25rem',
                            color: 'var(--text-muted)',
                            marginBottom: '2.5rem',
                            maxWidth: '700px',
                            marginLeft: 'auto',
                            marginRight: 'auto',
                            lineHeight: '1.7'
                        }}>
                            Join a vibrant community of achievers. Manage events, track performance, and climb the leaderboard with our state-of-the-art platform.
                        </p>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginBottom: '4rem' }}>
                            <Link to="/activities" className="btn btn-primary" style={{ padding: '0.875rem 2rem', fontSize: '1.1rem' }}>
                                Explore Activities <FaArrowRight style={{ marginLeft: '0.5rem' }} />
                            </Link>
                            <Link to="/apply" className="btn btn-secondary" style={{ padding: '0.875rem 2rem', fontSize: '1.1rem' }}>
                                Join Now
                            </Link>
                        </div>
                    </div>

                    {/* Hero Image with Glassmorphism Effect */}
                    <div className="fade-in" style={{
                        maxWidth: '1000px',
                        margin: '0 auto',
                        borderRadius: '1rem',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        border: '8px solid rgba(255,255,255,0.5)'
                    }}>
                        <img
                            src="https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=85"
                            alt="Students collaborating"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
                        />
                    </div>
                </div>
            </header>

            {/* Featured Events */}
            <section className="section-padding container">
                <h2 className="text-center mb-8" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                    <span role="img" aria-label="calendar">📅</span> Upcoming Events
                </h2>
                <div className="grid-auto">
                    {events.map(evt => (
                        <div key={evt._id} className="card fade-in" style={{ display: 'flex', flexDirection: 'column' }}>
                            {evt.image && (
                                <div style={{ height: '160px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '1rem' }}>
                                    <img src={evt.image} alt={evt.eventName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                </div>
                            )}
                            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span className="badge badge-accepted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                                    <span>{evt.icon || '📅'}</span> {evt.category}
                                </span>
                            </div>
                            <h3 style={{ marginBottom: '0.5rem', flex: 1 }}>{evt.eventName}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                                <span>📅 {evt.date}</span>
                                <span>⏰ {evt.time}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                <span>📍 {evt.venue}</span>
                            </div>
                            <p style={{ marginTop: 'auto' }}>{evt.description}</p>
                        </div>
                    ))}
                </div>
            </section>
        </>
    );
};

export default Home;
