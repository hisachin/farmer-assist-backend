const { BedrockRuntimeClient, InvokeModelCommand } = require('@aws-sdk/client-bedrock-runtime');
const ApiError = require('../utils/ApiError');
const config = require('../config');
const logger = require('../config/logger');

class CropPredictionService {
    constructor() {
        // Initialize Bedrock client with AWS credentials from config
        this.client = new BedrockRuntimeClient({ 
            region: config.aws.REGION,
            credentials: config.aws.CREDENTIALS
        });
        
        this.modelId = config.aws.MODEL.ID;
    }

    /**
     * Get crop predictions based on weather forecast and crop information
     * @param {Object} weatherData - Current weather and forecast data
     * @param {string} cropType - Type of crop (e.g., "wheat", "rice", "cotton")
     * @param {string} region - Agricultural region/location
     * @returns {Promise<Object>} Crop prediction analysis
     */
    async getPredictiveAnalysis(weatherData, cropType, region) {
        try {
            // Validate inputs
            if (!weatherData || !cropType || !region) {
                throw new ApiError(400, 'Missing required parameters: weatherData, cropType, region');
            }

            // Format weather data for the prompt
            const weatherContext = this.formatWeatherData(weatherData);

            // Create a comprehensive prompt for Bedrock using config
            const prompt = config.prompts.CROP_ANALYSIS(weatherContext, cropType, region);

            logger.info(`Requesting crop prediction for ${cropType} in ${region} from Bedrock`);

            // Invoke the Bedrock model
            const response = await this.invokeBedrock(prompt);

            // Parse and structure the response
            const analysis = this.parsePredictiveAnalysis(response);

            return {
                success: true,
                crop: cropType,
                region: region,
                weatherSummary: {
                    temperature: weatherData.temperature,
                    humidity: weatherData.humidity,
                    windSpeed: weatherData.windSpeed,
                    precipitation: weatherData.precipitation
                },
                analysis: analysis
            };
        } catch (error) {
            logger.error(`Crop prediction error: ${error.message}`);
            throw error;
        }
    }

    /**
     * Format weather data for better readability in prompts
     */
    formatWeatherData(weatherData) {
        let formatted = `Current Weather:\n`;
        formatted += `- Temperature: ${weatherData.temperature}\n`;
        formatted += `- Humidity: ${weatherData.humidity}\n`;
        formatted += `- Wind Speed: ${weatherData.windSpeed}\n`;
        formatted += `- Precipitation: ${weatherData.precipitation}\n`;

        if (weatherData.forecast && Array.isArray(weatherData.forecast)) {
            formatted += `\n7-Day Forecast:\n`;
            weatherData.forecast.slice(0, 7).forEach((day, index) => {
                formatted += `Day ${index + 1}: High ${day.maxTemp}, Low ${day.minTemp}\n`;
            });
        }

        return formatted;
    }

    /**
     * Invoke AWS Bedrock with the prompt
     */
    async invokeBedrock(prompt) {
        const payload = {
            anthropic_version: "bedrock-2023-06-01",
            max_tokens: config.aws.MODEL.MAX_TOKENS,
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        };

        const command = new InvokeModelCommand({
            modelId: this.modelId,
            body: JSON.stringify(payload),
            contentType: 'application/json',
            accept: 'application/json'
        });

        const response = await this.client.send(command);
        
        // Parse the response body
        const responseBody = JSON.parse(Buffer.from(response.body).toString('utf-8'));
        
        // Log complete response body to console for debugging
        console.log('\n=== BEDROCK RESPONSE ===');
        console.log(JSON.stringify(responseBody, null, 2));
        console.log('=== END RESPONSE ===\n');
        
        logger.info(`Bedrock response received. Keys: ${Object.keys(responseBody).join(', ')}`);
        
        // Try multiple response formats
        let extractedText = null;

        // Claude format: responseBody.content[0].text
        if (responseBody.content && Array.isArray(responseBody.content) && responseBody.content[0]) {
            extractedText = responseBody.content[0].text;
            logger.info('✓ Extracted from Claude content format');
            return extractedText;
        }
        
        // Alternative format: responseBody.text
        if (responseBody.text) {
            logger.info('✓ Extracted from text field');
            return responseBody.text;
        }
        
        // OpenAI-like format: responseBody.choices[0].message.content
        if (responseBody.choices && responseBody.choices[0] && responseBody.choices[0].message) {
            extractedText = responseBody.choices[0].message.content;
            logger.info('✓ Extracted from OpenAI-like format');
            return extractedText;
        }

        // If nothing matches, log all available keys for debugging
        logger.warn(`Could not extract text. Response keys: ${Object.keys(responseBody).join(', ')}`);
        logger.warn(`Full response structure: ${JSON.stringify(responseBody)}`);
        
        // Return entire response as string for fallback
        return JSON.stringify(responseBody);
    }

    /**
     * Intelligently repair truncated JSON by finding the last valid key-value pair
     */
    repairTruncatedJSON(jsonStr) {
        // Strategy: Remove incomplete last value and close structure
        // Works backwards from the end to find a valid stopping point
        
        let repaired = jsonStr;
        let depth = 0;
        let inString = false;
        let escapeNext = false;
        let lastValidIndex = 0;
        
        // Track brace/bracket depth and find last valid point
        for (let i = 0; i < repaired.length; i++) {
            const char = repaired[i];
            
            // Handle string escaping
            if (escapeNext) {
                escapeNext = false;
                continue;
            }
            if (char === '\\') {
                escapeNext = true;
                continue;
            }
            
            // Track string state
            if (char === '"' && !escapeNext) {
                inString = !inString;
                continue;
            }
            
            // If we're in a string, skip everything
            if (inString) continue;
            
            // Track structural depth
            if (char === '{' || char === '[') {
                depth++;
                lastValidIndex = i;
            } else if (char === '}' || char === ']') {
                if (depth > 0) depth--;
                lastValidIndex = i;
            }
            
            // Commas at current depth indicate valid structure
            if (char === ',' && depth > 0) {
                lastValidIndex = i;
            }
        }
        
        // Truncate at the last valid position and close properly
        repaired = repaired.substring(0, lastValidIndex + 1);
        
        // Count unclosed braces and brackets
        const openBraces = (repaired.match(/\{/g) || []).length;
        const closeBraces = (repaired.match(/\}/g) || []).length;
        const openBrackets = (repaired.match(/\[/g) || []).length;
        const closeBrackets = (repaired.match(/\]/g) || []).length;
        
        // Close unclosed structures
        repaired += ']'.repeat(Math.max(0, openBrackets - closeBrackets));
        repaired += '}'.repeat(Math.max(0, openBraces - closeBraces));
        
        logger.info(`JSON repair: added ${openBraces - closeBraces} braces, ${openBrackets - closeBrackets} brackets`);
        return repaired;
    }

    /**
     * Parse the Bedrock response into structured data
     */
    parsePredictiveAnalysis(responseText) {
        try {
            logger.info('Attempting to parse response...');

            // Step 1: Try to extract from markdown code blocks
            const codeBlockMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (codeBlockMatch) {
                logger.info('Found markdown code block');
                let jsonText = codeBlockMatch[1].trim();
                
                // Try to parse, with repair if needed
                try {
                    const analysis = JSON.parse(jsonText);
                    logger.info('✓ Successfully parsed JSON from code block');
                    return { ...analysis, parsed: true };
                } catch (e) {
                    logger.warn(`Code block JSON invalid: ${e.message}. Attempting repair...`);
                    try {
                        const repaired = this.repairTruncatedJSON(jsonText);
                        const analysis = JSON.parse(repaired);
                        logger.info('✓ Successfully parsed repaired code block JSON');
                        return { ...analysis, parsed: true, repaired: true };
                    } catch (repairError) {
                        logger.warn(`Failed to repair code block: ${repairError.message}`);
                    }
                }
            }

            // Step 2: Remove reasoning tags if present
            let cleanText = responseText.replace(/<reasoning>[\s\S]*?<\/reasoning>/g, '').trim();
            
            // Step 3: Try to extract JSON object
            const jsonMatch = cleanText.match(/\{[\s\S]*\}(?:\s*[\]\}]*)?/);
            if (jsonMatch) {
                logger.info('Found JSON object in text');
                let jsonStr = jsonMatch[0];
                
                try {
                    const analysis = JSON.parse(jsonStr);
                    logger.info('✓ Successfully parsed JSON from text');
                    return { ...analysis, parsed: true };
                } catch (e) {
                    logger.warn(`Text JSON invalid at position ${e.message}. Attempting repair...`);
                    
                    try {
                        // Remove any trailing garbage characters
                        jsonStr = jsonStr.replace(/[\]\}]*$/, '');
                        const repaired = this.repairTruncatedJSON(jsonStr);
                        const analysis = JSON.parse(repaired);
                        logger.info('✓ Successfully parsed repaired text JSON');
                        return { ...analysis, parsed: true, repaired: true };
                    } catch (repairError) {
                        logger.warn(`Failed to repair text JSON: ${repairError.message}`);
                    }
                }
            }

            // Step 4: Try to extract just the first valid key's data (partial parsing)
            logger.warn('Full JSON parsing failed. Attempting partial parsing...');
            const cropHealthMatch = cleanText.match(/"cropHealth"\s*:\s*\{[^}]+\}/);
            if (cropHealthMatch) {
                try {
                    // Extract just valid portions
                    const partial = {
                        cropHealth: /"overall"\s*:\s*"([^"]+)"/.test(cropHealthMatch[0]) ? 
                            { overall: RegExp.$1, score: 70 } : { overall: 'fair', score: 65 },
                        parsed: false,
                        partial: true,
                        reason: 'Extracted from truncated response'
                    };
                    logger.info('✓ Created partial analysis from response fragments');
                    return partial;
                } catch (e) {
                    logger.warn(`Partial parsing also failed: ${e.message}`);
                }
            }

            // Step 5: If all parsing fails, create a synthetic response from the text
            logger.warn('Could not parse JSON. Creating synthetic response from text analysis...');
            
            const hasGood = /excellent|very good|strong|optimal|good/i.test(responseText) && !/not|poor|bad|issue/i.test(responseText);
            const hasFair = /(fair|moderate|adequate|acceptable)/i.test(responseText);
            const hasHeat = /heat|temperature|warm|hot|elevated/i.test(responseText);
            const hasDrought = /drought|water|rain|precipitation|moisture/i.test(responseText);
            const hasDisease = /disease|pest|infestation|pathogen|fungal|bacterial/i.test(responseText);
            const hasIrrigation = /irrigation|watering|water management/i.test(responseText);
            const hasNutrient = /nutrient|nitrogen|phosphorus|fertilizer/i.test(responseText);
            
            const overallHealth = hasGood ? 'excellent' : (hasFair ? 'fair' : 'good');
            const healthScore = hasGood ? 85 : (hasFair && (hasHeat || hasDrought) ? 55 : 70);
            
            return {
                parsed: false,
                synthetic: true,
                cropHealth: {
                    overall: overallHealth,
                    score: healthScore,
                    reasoning: 'Generated from AI analysis patterns'
                },
                riskFactors: [
                    hasHeat ? {
                        risk: 'Heat Stress',
                        severity: 'high',
                        description: 'Elevated temperatures detected in forecast',
                        mitigation: 'Implement irrigation and shade management'
                    } : null,
                    hasDrought ? {
                        risk: 'Drought/Water Stress',
                        severity: hasIrrigation ? 'medium' : 'high',
                        description: 'Low moisture/precipitation expected',
                        mitigation: 'Priority irrigation scheduling recommended'
                    } : null,
                    hasDisease ? {
                        risk: 'Disease Pressure',
                        severity: 'high',
                        description: 'Conditions favorable for disease development',
                        mitigation: 'Monitor closely and apply preventive treatments'
                    } : null
                ].filter(Boolean),
                recommendations: [
                    hasIrrigation ? '⚠️ Apply immediate irrigation' : '💧 Monitor water availability',
                    hasNutrient ? '🌱 Ensure adequate nutrient supply' : '📊 Monitor crop nutrient status',
                    hasDisease ? '🔍 Scout frequently for disease symptoms' : '🔍 Scout for pest/disease signs',
                    'Maintain regular crop observation schedule'
                ],
                harvestPrediction: {
                    estimatedYield: hasGood ? '4.0-4.5' : (hasFair ? '3.0-3.5' : '3.5-4.0') + ' tonnes/hectare',
                    optimalHarvestTime: '12-16 days (monitor closely)',
                    qualityPrediction: 'Monitor closely - ' + (hasGood ? 'Good quality expected' : 'Quality may be affected by conditions')
                },
                dataQuality: {
                    source: 'Truncated response - limited data',
                    confidence: 'Low to Medium'
                }
            };
        } catch (error) {
            logger.error(`Critical error in parsePredictiveAnalysis: ${error.message}`);
            return {
                rawAnalysis: responseText.substring(0, 500),
                parsed: false,
                synthetic: true,
                error: 'Failed to parse response',
                cropHealth: { overall: 'unknown', score: 0 },
                recommendations: ['Unable to generate predictions - API error']
            };
        }
    }

    /**
     * Get advanced predictions with historical data comparison
     */
    async getAdvancedPrediction(weatherData, cropType, region, historicalData = null) {
        try {
            // Get standard analysis
            const standardAnalysis = await this.getPredictiveAnalysis(weatherData, cropType, region);

            // If historical data is provided, get comparison analysis
            if (historicalData) {
                const weatherContext = this.formatWeatherData(weatherData);
                const comparisonPrompt = config.prompts.CROP_COMPARISON(weatherContext, cropType, region, historicalData);
                const comparisonResponse = await this.invokeBedrock(comparisonPrompt);
                standardAnalysis.historicalComparison = this.parsePredictiveAnalysis(comparisonResponse);
            }

            return standardAnalysis;
        } catch (error) {
            logger.error(`Advanced prediction error: ${error.message}`);
            throw error;
        }
    }

}

module.exports = new CropPredictionService();
