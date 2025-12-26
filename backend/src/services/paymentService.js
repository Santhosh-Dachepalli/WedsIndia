/**
 * Payment & Commission Service
 * Handles Payout calculations and Refunds.
 */

const COMMISSION_RATE = 0.10; // 10%

exports.calculateSplit = (totalAmount) => {
    const commission = totalAmount * COMMISSION_RATE;
    const ownerPayout = totalAmount - commission;

    return {
        total: totalAmount,
        commission: commission,
        ownerPayout: ownerPayout
    };
};

exports.calculateRefund = (bookingDate, cancellationDate, totalAmount) => {
    const start = new Date(bookingDate);
    const cancel = new Date(cancellationDate);

    // Difference in days
    const diffTime = Math.abs(start - cancel);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let refundPercentage = 0;
    let refundAmount = 0;

    if (diffDays > 30) {
        refundPercentage = 100;
        refundAmount = totalAmount;
    } else if (diffDays >= 7) {
        refundPercentage = 50;
        refundAmount = totalAmount * 0.5;
    } else {
        refundPercentage = 0;
        refundAmount = 0;
    }

    return {
        daysUntilBooking: diffDays,
        refundPercentage: refundPercentage,
        refundAmount: refundAmount,
        message: refundPercentage > 0 ? 'Refund Processed' : 'No Refund per Policy'
    };
};
