require('dotenv').config();
const axios = require('axios');
const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev';
const token = jwt.sign({ userId: 'e2e-tester', name: 'E2E Tester' }, secret, { expiresIn: '1h' });
const baseUrl = `http://localhost:${process.env.PORT || 3000}/api/v1/weather`;

async function runTests() {
    console.log('🚀 Starting End-to-End Tests for Weather API...\n');

    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    try {
        // 1. Test Default Location (Bengaluru)
        console.log('Test 1: Default Location (Bengaluru)');
        const resDefault = await axios.get(baseUrl, config);
        if (resDefault.status === 200 && resDefault.data.success) {
            console.log('✅ Success: Default location returned weather data.');
            console.log(`   Location: ${resDefault.data.data.locationName}`);
            if (resDefault.data.data.locationName === 'Bengaluru, India') {
                console.log('   ✅ Sub-test: Correct default location name returned.');
            } else {
                throw new Error(`Wrong location name: ${resDefault.data.data.locationName}`);
            }
            console.log(`   Temperature: ${resDefault.data.data.temperature}`);
            if (Array.isArray(resDefault.data.data.forecast) && resDefault.data.data.forecast.length === 7) {
                console.log('   ✅ Sub-test: Correct 7-day forecast array returned.');
            } else {
                throw new Error(`Invalid forecast data: expected 7 items, got ${resDefault.data.data.forecast?.length}`);
            }
        } else {
            throw new Error(`Unexpected response: ${resDefault.status}`);
        }

        console.log('\n-------------------------------------------\n');

        // 2. Test Specific Location (e.g., San Francisco: 37.77, -122.41)
        const lat = 37.77;
        const lon = -122.41;
        console.log(`Test 2: Specific Location (Lat: ${lat}, Lon: ${lon})`);
        const resSpecific = await axios.get(`${baseUrl}?lat=${lat}&lon=${lon}`, config);
        if (resSpecific.status === 200 && resSpecific.data.success) {
            console.log('✅ Success: Specific location returned weather data.');
            console.log(`   Location: ${resSpecific.data.data.locationName}`);
            if (resSpecific.data.data.locationName.includes('Location (')) {
                console.log('   ✅ Sub-test: Correct coordinate-based fallback returned.');
            }
            console.log(`   Temperature: ${resSpecific.data.data.temperature}`);
        } else {
            throw new Error(`Unexpected response: ${resSpecific.status}`);
        }

        console.log('\n-------------------------------------------\n');

        // 3. Test Custom Location Name
        const customName = 'Mysuru, India';
        console.log(`Test 3: Custom Location Name (${customName})`);
        const resCustom = await axios.get(`${baseUrl}?lat=${lat}&lon=${lon}&locationName=${encodeURIComponent(customName)}`, config);
        if (resCustom.status === 200 && resCustom.data.success) {
            console.log('✅ Success: Custom location name reflected in response.');
            console.log(`   Location: ${resCustom.data.data.locationName}`);
            if (resCustom.data.data.locationName === customName) {
                console.log('   ✅ Sub-test: Correct custom location name returned.');
            } else {
                throw new Error(`Wrong location name: ${resCustom.data.data.locationName}`);
            }
        } else {
            throw new Error(`Unexpected response: ${resCustom.status}`);
        }

        console.log('\n✨ All tests passed successfully!');
    } catch (error) {
        console.error('❌ E2E Test Failed:');
        if (error.response) {
            console.error(`   Status: ${error.response.status}`);
            console.error(`   Message: ${error.response.data.message || error.response.statusText}`);
        } else {
            console.error(`   Error: ${error.message}`);
        }
        process.exit(1);
    }
}

runTests();
