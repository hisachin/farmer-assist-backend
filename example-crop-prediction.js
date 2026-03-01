/**
 * Example Usage of AWS Bedrock Crop Prediction Service
 * 
 * This file demonstrates how to use the crop prediction API in various scenarios.
 * Run this with: node example-crop-prediction.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Helper function to make API calls
async function callAPI(endpoint, method = 'GET', data = null) {
    try {
        const config = {
            method,
            url: `${BASE_URL}${endpoint}`,
            headers: { 'Content-Type': 'application/json' }
        };

        if (data) {
            config.data = data;
        }

        const response = await axios(config);
        return response.data;
    } catch (error) {
        console.error(`Error calling ${endpoint}:`, error.response?.data || error.message);
        throw error;
    }
}

// Example 1: Single Crop Analysis
async function exampleSingleCropAnalysis() {
    console.log('\n=== Example 1: Single Crop Analysis ===');
    console.log('Analyzing wheat crop in Bengaluru...');

    const result = await callAPI('/crop-prediction/analyze?cropType=wheat&lat=12.9716&lon=77.5946&locationName=Bengaluru');
    
    console.log('Crop:', result.data.crop);
    console.log('Region:', result.data.region);
    console.log('Weather Summary:', result.data.weatherSummary);
    console.log('Crop Health Score:', result.data.analysis.cropHealth.score);
    console.log('Health Status:', result.data.analysis.cropHealth.overall);
    console.log('Recommendations:', result.data.analysis.recommendations);
    console.log('Risk Factors:', result.data.analysis.riskFactors);

    return result;
}

// Example 2: Compare Multiple Crops
async function exampleCompareCrops() {
    console.log('\n=== Example 2: Compare Multiple Crops ===');
    console.log('Comparing wheat, rice, and cotton in Punjab...');

    const result = await callAPI('/crop-prediction/compare', 'POST', {
        crops: ['wheat', 'rice', 'cotton'],
        lat: 31.17,      // Punjab, India
        lon: 74.87,
        locationName: 'Punjab, India'
    });

    console.log('Location:', result.location);
    console.log('Number of crops analyzed:', result.predictions.length);

    result.predictions.forEach(prediction => {
        console.log(`\n${prediction.crop.toUpperCase()}:`);
        console.log(`  Health Score: ${prediction.analysis.cropHealth.score}/100`);
        console.log(`  Status: ${prediction.analysis.cropHealth.overall}`);
    });

    return result;
}

// Example 3: Get Crop Recommendation
async function exampleCropRecommendation() {
    console.log('\n=== Example 3: Crop Recommendation ===');
    console.log('Getting crop recommendation for a farmer in Maharashtra...');

    const result = await callAPI('/crop-prediction/recommend', 'POST', {
        availableCrops: ['wheat', 'rice', 'corn', 'potato', 'cotton'],
        lat: 19.76,      // Maharashtra, India
        lon: 75.71,
        locationName: 'Maharashtra, India'
    });

    console.log('Location:', result.location);
    const bestCrop = result.recommendation.bestCrop;
    console.log('\nRECOMMENDED CROP:');
    console.log(`  Crop: ${bestCrop.crop}`);
    console.log(`  Health Score: ${bestCrop.analysis.cropHealth.score}/100`);
    console.log(`  Reasoning: ${bestCrop.analysis.cropHealth.reasoning}`);
    console.log(`  Top Recommendation: ${bestCrop.analysis.recommendations[0]}`);

    console.log('\nAll analyzed crops (ranked by health score):');
    result.recommendation.allAnalyses.forEach((analysis, index) => {
        console.log(`  ${index + 1}. ${analysis.crop.toUpperCase()} - Score: ${analysis.analysis.cropHealth.score}`);
    });

    return result;
}

// Example 4: Advanced Prediction with Historical Data
async function exampleAdvancedPrediction() {
    console.log('\n=== Example 4: Advanced Prediction with Historical Data ===');
    console.log('Advanced analysis of wheat with historical comparison...');

    const result = await callAPI('/crop-prediction/advanced', 'POST', {
        cropType: 'wheat',
        lat: 28.70,      // Uttar Pradesh, India
        lon: 77.10,
        locationName: 'Uttar Pradesh, India',
        historicalData: {
            averageYield: '50 kg/hectare',
            lastYearYield: '48 kg/hectare',
            lastYearYieldVariation: '-4%',
            averageRainfall: '800mm',
            lastYearRainfall: '750mm',
            typicalPestIssues: ['armyworm', 'Hessian fly', 'aphids'],
            bestHarvestMonth: 'April',
            averageGrowingDays: '120',
            soilType: 'Loamy',
            irrigationMethod: 'Flood irrigation'
        }
    });

    console.log('Crop:', result.data.crop);
    console.log('Region:', result.data.region);
    console.log('\nCrop Health Analysis:', result.data.analysis.cropHealth);
    console.log('\nHarvest Prediction:', result.data.analysis.harvestPrediction);
    console.log('\nMarket Insights:', result.data.analysis.marketInsights);

    if (result.data.historicalComparison) {
        console.log('\nHistorical Comparison:', result.data.historicalComparison);
    }

    return result;
}

// Example 5: Seasonal Crop Selection
async function exampleSeasonalSelection() {
    console.log('\n=== Example 5: Seasonal Crop Selection ===');
    console.log('Finding best winter crops in Tamil Nadu...');

    // Winter crops typically grown in India
    const winterCrops = ['wheat', 'rice', 'pulses', 'groundnut', 'tobacco'];

    const result = await callAPI('/crop-prediction/recommend', 'POST', {
        availableCrops: winterCrops,
        lat: 11.87,      // Tamil Nadu, India
        lon: 79.86,
        locationName: 'Tamil Nadu, India'
    });

    console.log('Season: Winter Crops');
    console.log('Location:', result.location);
    console.log(`\nTop ${Math.min(3, result.recommendation.allAnalyses.length)} Crops for This Season:`);

    result.recommendation.allAnalyses.slice(0, 3).forEach((crop, index) => {
        console.log(`\n${index + 1}. ${crop.crop.toUpperCase()}`);
        console.log(`   Score: ${crop.analysis.cropHealth.score}/100`);
        console.log(`   Status: ${crop.analysis.cropHealth.overall}`);
        console.log(`   Reason: ${crop.analysis.cropHealth.reasoning}`);
    });

    return result;
}

// Main execution
async function runExamples() {
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║     AWS Bedrock Crop Prediction - Usage Examples           ║');
    console.log('╚════════════════════════════════════════════════════════════╝');

    try {
        // Run examples sequentially to avoid overwhelming the API
        
        // Example 1: Single Crop
        await exampleSingleCropAnalysis();
        console.log('\n[✓] Example 1 completed');

        // Wait a moment between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Example 2: Multiple Crops
        await exampleCompareCrops();
        console.log('\n[✓] Example 2 completed');

        // Wait a moment between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Example 3: Recommendation
        await exampleCropRecommendation();
        console.log('\n[✓] Example 3 completed');

        // Wait a moment between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Example 4: Advanced Prediction
        await exampleAdvancedPrediction();
        console.log('\n[✓] Example 4 completed');

        // Wait a moment between requests
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Example 5: Seasonal Selection
        await exampleSeasonalSelection();
        console.log('\n[✓] Example 5 completed');

        console.log('\n╔════════════════════════════════════════════════════════════╗');
        console.log('║            All Examples Completed Successfully!           ║');
        console.log('╚════════════════════════════════════════════════════════════╝');

    } catch (error) {
        console.error('\n✗ Error running examples:', error.message);
        console.error('\nMake sure:');
        console.error('1. Backend server is running on http://localhost:3000');
        console.error('2. AWS credentials are configured');
        console.error('3. Bedrock models are enabled in your AWS account');
        process.exit(1);
    }
}

// Run the examples
runExamples();
