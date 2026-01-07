import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaGithub } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer style={{
            backgroundColor: '#1e293b',
            color: '#f8fafc',
            paddingTop: '3rem',
            paddingBottom: '1.5rem',
            marginTop: 'auto'
        }}>
            <div className="container">
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '2rem',
                    marginBottom: '2rem'
                }}>
                    {/* Brand */}
                    <div>
                        <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.8rem' }}>🎓</span> EduActive
                        </h3>
                        <p style={{ color: '#94a3b8', lineHeight: '1.6' }}>
                            empowering students to explore their potential through diverse extracurricular activities. Join us to learn, compete, and grow.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#fff' }}>Quick Links</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                            <li><Link to="/" style={{ color: '#cbd5e1', textDecoration: 'none', transition: 'color 0.2s' }} className="hover:text-primary">Home</Link></li>
                            <li><Link to="/activities" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Activities</Link></li>
                            <li><Link to="/leaderboard" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Leaderboard</Link></li>
                            <li><Link to="/apply" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Apply Now</Link></li>
                            <li><Link to="/admin" style={{ color: '#cbd5e1', textDecoration: 'none' }}>Admin Login</Link></li>
                        </ul>
                    </div>

                    {/* Contact or Socials */}
                    <div>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: '#fff' }}>Connect With Us</h4>
                        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Stay updated with new events and announcements.</p>
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <a href="#" style={{ color: '#fff', fontSize: '1.5rem' }}><FaFacebook /></a>
                            <a href="#" style={{ color: '#fff', fontSize: '1.5rem' }}><FaTwitter /></a>
                            <a href="#" style={{ color: '#fff', fontSize: '1.5rem' }}><FaInstagram /></a>
                            <a href="#" style={{ color: '#fff', fontSize: '1.5rem' }}><FaLinkedin /></a>
                        </div>
                    </div>
                </div>

                <div style={{
                    borderTop: '1px solid #334155',
                    paddingTop: '1.5rem',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem'
                }}>
                    &copy; {new Date().getFullYear()} EduActive School Portal. All rights reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
