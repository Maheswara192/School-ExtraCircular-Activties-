import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaRunning, FaPen, FaUserShield, FaTrophy } from 'react-icons/fa';

const Navbar = () => {
    const location = useLocation();

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <nav className="navbar">
            <div className="container nav-container">
                <Link to="/" className="logo">
                    <span style={{ marginRight: '0.5rem' }}>🎓</span>EduActive
                </Link>

                <div className="nav-links">
                    <Link to="/" className={`nav-link ${isActive('/')}`}>
                        <FaHome style={{ marginRight: '0.4rem', marginBottom: '-2px' }} />Home
                    </Link>
                    <Link to="/activities" className={`nav-link ${isActive('/activities')}`}>
                        <FaRunning style={{ marginRight: '0.4rem', marginBottom: '-2px' }} />Activities
                    </Link>
                    <Link to="/leaderboard" className={`nav-link ${isActive('/leaderboard')}`}>
                        <FaTrophy style={{ marginRight: '0.4rem', marginBottom: '-2px' }} />Leaderboard
                    </Link>
                    <Link to="/apply" className={`nav-link ${isActive('/apply')}`}>
                        <FaPen style={{ marginRight: '0.4rem', marginBottom: '-2px' }} />Apply Now
                    </Link>
                    <Link to="/admin/login" className={`btn btn-secondary`} style={{ marginLeft: '1rem', padding: '0.5rem 1rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <FaUserShield /> Admin
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
