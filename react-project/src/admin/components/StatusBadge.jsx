
import React from 'react';

const StatusBadge = ({ status }) => {
    let badgeClass = 'badge-neutral';

    // Safety check if status is undefined or null
    const safeStatus = status ? status.toLowerCase() : 'unknown';

    switch (safeStatus) {
        case 'accepted':
        case 'approved':
            badgeClass = 'badge-success';
            break;
        case 'rejected':
        case 'declined':
            badgeClass = 'badge-danger';
            break;
        case 'pending':
            badgeClass = 'badge-warning';
            break;
        default:
            badgeClass = 'badge-neutral';
    }

    return (
        <span className={`badge ${badgeClass}`}>
            {status || 'Unknown'}
        </span>
    );
};

export default StatusBadge;
