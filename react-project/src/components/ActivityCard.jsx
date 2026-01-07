import React from 'react';
import { Link } from 'react-router-dom';

const ActivityCard = ({ name, count, icon, onClick }) => {
    return (
        <div className="card fade-in" onClick={onClick} style={{ cursor: 'pointer' }}>
            <div style={{
                height: '120px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f8fafc, #e2e8f0)',
                borderRadius: '0.5rem',
                marginBottom: '1rem'
            }}>
                <span style={{ fontSize: '3.5rem', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}>
                    {icon || '✨'}
                </span>
            </div>
            <h3 className="text-center">{name}</h3>
            {count !== undefined && (
                <p className="text-center text-muted">{count} Clubs Available</p>
            )}
            <div className="text-center" style={{ marginTop: '1rem' }}>
                <Link to="/apply" state={{ category: name }} className="btn btn-secondary" style={{ width: '100%', fontSize: '0.9rem' }}>
                    Apply
                </Link>
            </div>
        </div>
    );
};

export default ActivityCard;
