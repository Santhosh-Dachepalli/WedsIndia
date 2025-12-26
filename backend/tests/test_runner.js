const aiPricingService = require('../src/services/aiPricingService');
const paymentService = require('../src/services/paymentService');

console.log('--- STARTING SYSTEM TESTS ---\n');

// TEST 1: AI Pricing
console.log('TEST 1: AI Pricing Logic');
const basePrice = 100000;
const peakDate = '2025-12-15'; // December (Peak Season)
const result = aiPricingService.analyzePrice(basePrice, peakDate);

if (result.finalPrice > basePrice) {
    console.log(`✅ PASSED: Price increased for Peak Season (${peakDate}).`);
    console.log(`   Base: ${basePrice}, Final: ${result.finalPrice} (${result.factors.join(', ')})`);
} else {
    console.error('❌ FAILED: Price did not increase for Peak Season.');
}
console.log('');

// TEST 2: Commission Split
console.log('TEST 2: Payment Commission Logic');
const payment = paymentService.calculateSplit(100000);
if (payment.commission === 10000 && payment.ownerPayout === 90000) {
    console.log('✅ PASSED: Commission calculated correctly (10%).');
} else {
    console.error('❌ FAILED: Commission calculation error.');
}
console.log('');

// TEST 3: Refund Policy (Strict)
console.log('TEST 3: Refund Policy (Last Minute Cancellation)');
const bookingDate = '2025-05-10';
const cancelDate = '2025-05-09'; // 1 day before
const refund = paymentService.calculateRefund(bookingDate, cancelDate, 50000);

if (refund.refundAmount === 0) {
    console.log('✅ PASSED: No refund given for last-minute cancellation.');
} else {
    console.error(`❌ FAILED: Refund should be 0, got ${refund.refundAmount}`);
}
console.log('');

console.log('--- ALL TESTS COMPLETED ---');
