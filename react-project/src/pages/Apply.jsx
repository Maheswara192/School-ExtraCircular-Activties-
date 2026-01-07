import React from 'react';
// Navbar removed
import ApplicationForm from '../components/ApplicationForm';

const Apply = () => {
    return (
        <>
            {/* Navbar handled by Layout */}
            <div className="container section-padding">
                <ApplicationForm />
            </div>
        </>
    );
};

export default Apply;
