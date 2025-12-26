/**
 * AI Pricing Engine
 * Analyzes dates and suggests dynamic pricing based on Indian Wedding Seasons and Weekends.
 */

// Wedding "Muhurtham" Seasons (simplified)
const HIGH_DEMAND_MONTHS = [0, 1, 4, 5, 10, 11]; // Jan, Feb, May, Jun, Nov, Dec

exports.analyzePrice = (basePrice, dateString) => {
    const date = new Date(dateString);
    const month = date.getMonth();
    const day = date.getDay(); // 0 = Sun, 6 = Sat

    let multiplier = 1.0;
    let factors = [];

    // 1. Seasonality Check
    if (HIGH_DEMAND_MONTHS.includes(month)) {
        multiplier += 0.20; // +20%
        factors.push('Peak Wedding Season (+20%)');
    }

    // 2. Weekend Check
    if (day === 0 || day === 6) {
        multiplier += 0.15; // +15%
        factors.push('Weekend Surcharge (+15%)');
    }

    // 3. Demand (Simulated)
    // In real app, check DB for search density
    const isHighDemandDay = Math.random() > 0.7;
    if (isHighDemandDay) {
        multiplier += 0.10; // +10%
        factors.push('High Demand Alert (+10%)');
    }

    const finalPrice = Math.round(basePrice * multiplier);

    return {
        originalPrice: basePrice,
        finalPrice: finalPrice,
        multiplier: multiplier.toFixed(2),
        factors: factors
    };
};
