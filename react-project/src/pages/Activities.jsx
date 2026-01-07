import React, { useState, useEffect } from 'react';
// Navbar removed
import ActivityCard from '../components/ActivityCard';
import api from '../api';

import { FaGraduationCap, FaPalette, FaRunning, FaHandsHelping, FaLaptopCode, FaHeart, FaGlobe, FaTheaterMasks, FaMicroscope, FaTree, FaBookOpen, FaUsers, FaMusic, FaCamera, FaUtensils } from 'react-icons/fa';

// Icon mapping using React Icons for a premium look
const ICONS = {
    "Academic Clubs": <FaGraduationCap size={40} color="#4F46E5" />,
    "Arts & Crafts": <FaPalette size={40} color="#EC4899" />,
    "Sports & Physical Education": <FaRunning size={40} color="#F59E0B" />,
    "Social Service & Leadership": <FaHandsHelping size={40} color="#10B981" />,
    "Science & Technology": <FaLaptopCode size={40} color="#3B82F6" />,
    "Wellness & Mindfulness": <FaHeart size={40} color="#EF4444" />,
    "Cultural & Heritage": <FaGlobe size={40} color="#8B5CF6" />,
    "Drama & Theatre": <FaTheaterMasks size={40} color="#F97316" />,
    "Music": <FaMusic size={40} color="#DB2777" />,
    "Dance": <FaRunning size={40} color="#BE185D" />, // Reusing running or finding dance icon
    "Literature & Language": <FaBookOpen size={40} color="#6366F1" />,
    "Environmental & Sustainability": <FaTree size={40} color="#22C55E" />,
    "Culinary Arts": <FaUtensils size={40} color="#D97706" />,
    "Digital & Media": <FaCamera size={40} color="#60A5FA" />,
    "Outdoor & Adventure": <FaTree size={40} color="#059669" />,
    "Sports & Yoga": <FaRunning size={40} color="#F59E0B" /> // Added for Sports & Yoga
};

const Activities = () => {
    const [categories, setCategories] = useState({});
    const [selectedCategory, setSelectedCategory] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch up to 100 events to cover all categories
                const response = await api.get('/events?status=present&limit=100');
                // Support both Paginated and Array formats
                const eventsList = Array.isArray(response.data) ? response.data : (response.data.data || []);

                const catMap = {};
                eventsList.forEach(evt => {
                    const cat = evt.category;
                    if (!catMap[cat]) {
                        catMap[cat] = [];
                    }
                    // Store the full event object to show details
                    catMap[cat].push(evt);
                });
                setCategories(catMap);
            } catch (error) {
                console.error("Failed to load categories", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <>
            {/* Navbar handled by Layout */}
            <div className="container section-padding">
                <header className="text-center mb-8 fade-in">
                    <h1 className="mb-4" style={{ fontSize: '2.5rem', fontWeight: '800' }}>Explore Our Activities</h1>
                    <p className="text-muted" style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                        Discover 15+ diverse categories tailored to spark your passion and potential.
                    </p>
                </header>

                <div className="grid-auto fade-in">
                    {Object.keys(categories).length > 0 ? (
                        Object.keys(categories).map(cat => (
                            <ActivityCard
                                key={cat}
                                name={cat}
                                count={categories[cat].length}
                                icon={ICONS[cat] || <FaGraduationCap size={40} color="#ccc" />}
                                onClick={() => setSelectedCategory(cat)}
                            />
                        ))
                    ) : (
                        <p className="text-center w-full">Loading activities...</p>
                    )}
                </div>
            </div>

            {/* Event Details Modal */}
            {selectedCategory && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000,
                    backdropFilter: 'blur(5px)'
                }} onClick={() => setSelectedCategory(null)}>
                    <div className="card fade-in-up"
                        style={{ width: '90%', maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto', position: 'relative', padding: '2rem' }}
                        onClick={e => e.stopPropagation()}>

                        <button onClick={() => setSelectedCategory(null)}
                            style={{ position: 'absolute', top: '1rem', right: '1rem', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#64748b' }}>
                            &times;
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
                            {ICONS[selectedCategory]}
                            <h2 style={{ margin: 0 }}>{selectedCategory}</h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {categories[selectedCategory].map(evt => (
                                <div key={evt._id} style={{
                                    border: '1px solid #e2e8f0', borderRadius: '0.75rem', padding: '1rem',
                                    display: 'flex', flexDirection: 'column', gap: '0.5rem', backgroundColor: '#f8fafc'
                                }}>
                                    {evt.image && (
                                        <div style={{ height: '140px', overflow: 'hidden', borderRadius: '0.5rem', marginBottom: '0.5rem' }}>
                                            <img src={evt.image} alt={evt.eventName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <h3 style={{ fontSize: '1.1rem', margin: 0, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span>{evt.icon}</span> {evt.eventName}
                                        </h3>
                                        {evt.eventType === 'team' && <span className="badge badge-promoted">Team Event</span>}
                                    </div>
                                    <p style={{ margin: 0, fontSize: '0.95rem', color: '#475569' }}>{evt.description}</p>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        {evt.subActivities.map(sub => (
                                            <span key={sub} style={{ background: '#e0e7ff', color: '#4338ca', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                            <a href="/apply" className="btn btn-primary" style={{ width: '100%', display: 'block', padding: '1rem' }}>
                                Apply for {selectedCategory} Activities
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Activities;
