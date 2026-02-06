const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
const testResults = [];

// Helper to log test results
function logTest(testName, type, passed, details) {
    const result = { testName, type, passed, details };
    testResults.push(result);
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} [${type}] ${testName}`);
    if (details) console.log(`   Details: ${details}`);
}

// Test Events API
async function testEventsAPI() {
    console.log('\n=== Testing Events API ===\n');

    // Normal: Fetch all events
    try {
        const res = await axios.get(`${BASE_URL}/events`);
        const passed = res.status === 200 && res.data.data && res.data.data.length > 0;
        logTest('Fetch all events', 'Normal', passed, `Got ${res.data.data?.length || 0} events`);
    } catch (e) {
        logTest('Fetch all events', 'Normal', false, e.message);
    }

    // Normal: Fetch with limit
    try {
        const res = await axios.get(`${BASE_URL}/events?limit=5`);
        const passed = res.status === 200 && res.data.data && res.data.data.length <= 5;
        logTest('Fetch with limit=5', 'Normal', passed, `Got ${res.data.data?.length || 0} events`);
    } catch (e) {
        logTest('Fetch with limit=5', 'Normal', false, e.message);
    }

    // Normal: Fetch with pagination
    try {
        const res = await axios.get(`${BASE_URL}/events?page=2&limit=10`);
        const passed = res.status === 200 && res.data.page === 2;
        logTest('Fetch with pagination', 'Normal', passed, `Page ${res.data.page}`);
    } catch (e) {
        logTest('Fetch with pagination', 'Normal', false, e.message);
    }

    // Edge: Invalid event ID
    try {
        await axios.get(`${BASE_URL}/events/invalid-id-12345`);
        logTest('Invalid event ID', 'Edge', false, 'Should have returned 404');
    } catch (e) {
        const passed = e.response?.status === 404 || e.response?.status === 400;
        logTest('Invalid event ID', 'Edge', passed, `Status: ${e.response?.status}`);
    }

    // Boundary: Zero limit
    try {
        const res = await axios.get(`${BASE_URL}/events?limit=0`);
        logTest('Zero limit', 'Boundary', true, `Handled gracefully, got ${res.data.data?.length || 0} events`);
    } catch (e) {
        logTest('Zero limit', 'Boundary', false, e.message);
    }

    // Boundary: Negative limit
    try {
        const res = await axios.get(`${BASE_URL}/events?limit=-1`);
        logTest('Negative limit', 'Boundary', true, `Handled gracefully, got ${res.data.data?.length || 0} events`);
    } catch (e) {
        logTest('Negative limit', 'Boundary', false, e.message);
    }
}

// Test Applications API
async function testApplicationsAPI() {
    console.log('\n=== Testing Applications API ===\n');

    // First, get an event ID for testing
    let eventId;
    try {
        const res = await axios.get(`${BASE_URL}/events?limit=1`);
        eventId = res.data.data[0]._id;
    } catch (e) {
        console.log('Could not fetch event for testing');
        return;
    }

    // Normal: Valid individual application
    try {
        const appData = {
            studentName: 'Test Student',
            class: '10',
            section: 'A',
            rollNumber: `TEST${Date.now()}`,
            phone: '9876543210',
            eventId: eventId,
            activity: 'Test Activity'
        };
        const res = await axios.post(`${BASE_URL}/applications`, appData);
        const passed = res.status === 201;
        logTest('Valid individual application', 'Normal', passed, `Application ID: ${res.data._id}`);
    } catch (e) {
        logTest('Valid individual application', 'Normal', false, e.response?.data?.message || e.message);
    }

    // Edge: Duplicate application (same roll number, same event)
    try {
        const appData = {
            studentName: 'Duplicate Student',
            class: '10',
            section: 'A',
            rollNumber: 'DUPLICATE001',
            phone: '9876543210',
            eventId: eventId,
            activity: 'Test Activity'
        };
        // Submit first time
        await axios.post(`${BASE_URL}/applications`, appData);
        // Try to submit again
        await axios.post(`${BASE_URL}/applications`, appData);
        logTest('Duplicate application', 'Edge', false, 'Should have rejected duplicate');
    } catch (e) {
        const passed = e.response?.status === 400 && e.response?.data?.message?.includes('already applied');
        logTest('Duplicate application', 'Edge', passed, e.response?.data?.message);
    }

    // Boundary: Missing required fields
    try {
        const appData = {
            studentName: 'Incomplete Student'
            // Missing required fields
        };
        await axios.post(`${BASE_URL}/applications`, appData);
        logTest('Missing required fields', 'Boundary', false, 'Should have rejected incomplete data');
    } catch (e) {
        const passed = e.response?.status === 400;
        logTest('Missing required fields', 'Boundary', passed, `Status: ${e.response?.status}`);
    }
}

// Test Authentication API
async function testAuthAPI() {
    console.log('\n=== Testing Authentication API ===\n');

    // Normal: Valid admin login
    try {
        const res = await axios.post(`${BASE_URL}/auth/login`, {
            email: 'mahisince2002@gmail.com',
            password: 'admin123'
        });
        const passed = res.status === 200 && res.data.token;
        logTest('Valid admin login', 'Normal', passed, 'Token received');
    } catch (e) {
        logTest('Valid admin login', 'Normal', false, e.response?.data?.message || e.message);
    }

    // Edge: Invalid password
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'mahisince2002@gmail.com',
            password: 'wrongpassword'
        });
        logTest('Invalid password', 'Edge', false, 'Should have rejected');
    } catch (e) {
        const passed = e.response?.status === 401;
        logTest('Invalid password', 'Edge', passed, e.response?.data?.message);
    }

    // Edge: Non-existent user
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: 'nonexistent@example.com',
            password: 'password123'
        });
        logTest('Non-existent user', 'Edge', false, 'Should have rejected');
    } catch (e) {
        const passed = e.response?.status === 401;
        logTest('Non-existent user', 'Edge', passed, e.response?.data?.message);
    }

    // Boundary: Empty credentials
    try {
        await axios.post(`${BASE_URL}/auth/login`, {
            email: '',
            password: ''
        });
        logTest('Empty credentials', 'Boundary', false, 'Should have rejected');
    } catch (e) {
        const passed = e.response?.status === 400 || e.response?.status === 401;
        logTest('Empty credentials', 'Boundary', passed, `Status: ${e.response?.status}`);
    }
}

// Run all tests
async function runAllTests() {
    console.log('Starting Backend API Tests...\n');
    console.log('Backend URL:', BASE_URL);

    await testEventsAPI();
    await testApplicationsAPI();
    await testAuthAPI();

    console.log('\n=== Test Summary ===\n');
    const passed = testResults.filter(r => r.passed).length;
    const failed = testResults.filter(r => r.passed === false).length;
    console.log(`Total: ${testResults.length} | Passed: ${passed} | Failed: ${failed}`);

    if (failed > 0) {
        console.log('\nFailed Tests:');
        testResults.filter(r => !r.passed).forEach(r => {
            console.log(`  - [${r.type}] ${r.testName}: ${r.details}`);
        });
    }
}

runAllTests().catch(console.error);
