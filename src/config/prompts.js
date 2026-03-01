/**
 * AI Prompts Configuration
 * 
 * Central repository for all Bedrock AI prompts
 * Used by crop-prediction service for consistent prompt engineering
 */

module.exports = {
  /**
   * Main crop analysis prompt template
   * Used for detailed crop health and prediction analysis
   * 
   * @param {string} weatherContext - Formatted weather data and forecast
   * @param {string} cropType - Type of crop (e.g., "wheat", "rice")
   * @param {string} region - Agricultural region/location
   * @returns {string} Formatted prompt for Bedrock
   */
  CROP_ANALYSIS: (weatherContext, cropType, region) => {
    return `You are an agricultural expert AI assistant specializing in crop prediction and analysis.

Based on the following weather forecast and agricultural data, provide predictive analysis for ${cropType} cultivation in ${region}.

${weatherContext}

Please provide a detailed analysis in JSON format with the following structure:
{
    "cropHealth": {
        "overall": "excellent/good/fair/poor",
        "score": 0-100,
        "reasoning": "brief explanation"
    },
    "riskFactors": [
        {
            "risk": "risk name",
            "severity": "high/medium/low",
            "description": "detailed description",
            "mitigation": "suggested action"
        }
    ],
    "recommendations": [
        "specific recommendation 1",
        "specific recommendation 2",
        "specific recommendation 3"
    ],
    "harvestPrediction": {
        "estimatedYield": "prediction with explanation",
        "optimalHarvestTime": "timeline and conditions",
        "qualityPrediction": "predicted quality indicators"
    },
    "marketInsights": {
        "expectedDemand": "prediction based on season and crop",
        "priceOutlook": "price trend prediction",
        "marketTiming": "optimal selling period"
    },
    "waterRequirements": {
        "irrigation": "recommended irrigation schedule",
        "rainfall": "analysis of expected rainfall"
    }
}

Provide accurate, actionable insights based on agricultural science and the given weather forecast.`;
  },

  /**
   * Historical comparison prompt template
   * Used for comparing current season with historical patterns
   * 
   * @param {string} weatherContext - Formatted weather data
   * @param {string} cropType - Type of crop
   * @param {string} region - Agricultural region
   * @param {Object} historicalData - Past season data for comparison
   * @returns {string} Formatted prompt for Bedrock
   */
  CROP_COMPARISON: (weatherContext, cropType, region, historicalData) => {
    return `As an agricultural expert, compare the current season's weather forecast for ${cropType} in ${region} with historical patterns.

Current Weather Forecast:
${weatherContext}

Historical Data:
${JSON.stringify(historicalData, null, 2)}

Provide analysis in JSON format:
{
    "comparison": {
        "isNormalSeason": boolean,
        "deviations": ["deviation 1", "deviation 2"],
        "confidenceLevel": "high/medium/low"
    },
    "seasonalTrends": "analysis of how this season compares",
    "yieldAdjustment": "estimated yield change vs historical average",
    "recommendations": ["adjusted recommendation 1", "adjusted recommendation 2"]
}`;
  },

  /**
   * Crop recommendation prompt template
   * Returns a string that can be used directly as a prompt
   * Used for recommending best crops based on weather conditions
   * 
   * @returns {string} Formatted prompt for Bedrock
   */
  CROP_RECOMMENDATION: `You are an agricultural expert AI assistant specializing in crop recommendations.

Based on weather data and regional information, recommend the best crops to plant.

Provide recommendations in JSON format:
{
    "recommendations": [
        {
            "crop": "crop name",
            "suitability": "excellent/good/fair",
            "score": 0-100,
            "reasoning": "why this crop is recommended",
            "optimalPlantingTime": "when to plant",
            "expectedYield": "estimated yield potential"
        }
    ],
    "summary": "overall summary of recommendations"
}

Consider factors like temperature, rainfall, soil conditions, and market demand.`,

  /**
   * Multi-crop comparison prompt template
   * Used for comparing multiple crops in the same conditions
   * Returns a string template with placeholders
   * 
   * @returns {string} Formatted prompt for Bedrock
   */
  MULTI_CROP_COMPARISON: `You are an agricultural expert specializing in comparative crop analysis.

I need you to compare multiple crops and recommend the best options based on the given conditions.

Provide a comparative analysis in JSON format:
{
    "comparisonMatrix": {
        "crops": ["crop1", "crop2", "crop3"],
        "factors": ["yield_potential", "water_requirement", "market_demand", "risk_level"],
        "scores": {
            "crop1": [score1, score2, score3, score4],
            "crop2": [score1, score2, score3, score4]
        }
    },
    "recommendations": {
        "bestOverall": "crop name",
        "bestForYield": "crop name",
        "bestForMarket": "crop name",
        "lowestRisk": "crop name"
    },
    "reasoning": "detailed explanation of recommendations"
}

Ensure scores are on a 0-100 scale for consistency.`,

  /**
   * Risk analysis prompt template
   * Used for getting detailed risk assessments
   * 
   * @returns {string} Formatted prompt for Bedrock
   */
  RISK_ANALYSIS: `You are an agricultural risk assessment expert.

Analyze the following conditions and provide a comprehensive risk assessment.

Return analysis in JSON format:
{
    "riskAssessment": {
        "overallRisk": "critical/high/medium/low",
        "riskScore": 0-100
    },
    "identifiedRisks": [
        {
            "type": "disease/weather/market/pest",
            "name": "specific risk",
            "probability": "high/medium/low",
            "impact": "significant/moderate/minor",
            "mitigation": "specific action to reduce risk"
        }
    ],
    "recommendedActions": ["action 1", "action 2", "action 3"],
    "timeline": "urgent/within week/within month"
}`,

  /**
   * Advanced analysis prompt template
   * Used for in-depth multi-factor analysis
   * 
   * @returns {string} Formatted prompt for Bedrock
   */
  ADVANCED_ANALYSIS: `You are an advanced agricultural AI analyst with expertise in crop science, meteorology, and market dynamics.

Provide a comprehensive, multi-dimensional analysis of the given agricultural scenario.

Return detailed analysis in JSON format with the following structure:
{
    "executiveSummary": "brief overview",
    "weatherAnalysis": "detailed weather impact assessment",
    "cropHealthProjection": "health forecast with timeline",
    "yieldForecast": "production estimate",
    "marketOutlook": "demand and pricing",
    "resourceRequirements": "water, fertilizer, labor needs",
    "criticalDecisionPoints": ["key decision 1", "key decision 2"],
    "scenarioPlanning": {
        "optimisticScenario": "best case with probability",
        "realisticScenario": "most likely outcome",
        "pessimisticScenario": "worst case with mitigation"
    },
    "topPriorities": ["priority 1", "priority 2", "priority 3"],
    "expectedOutcomes": {
        "harvest": "estimated harvest date and yield",
        "profitability": "revenue outlook",
        "sustainability": "environmental impact"
    }
}

Provide scientifically accurate, actionable insights.`
};
