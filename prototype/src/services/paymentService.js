export const initializePayment = (bookingDetails, onSuccess, onFailure) => {
    // User Provided Test Key
    const RAZORPAY_KEY_ID = "rzp_test_S7ybNnFwassSXa";

    const options = {
        key: RAZORPAY_KEY_ID,
        amount: bookingDetails.amount * 100, // Amount in paise
        currency: "INR",
        name: "BookMyVenue",
        description: `Booking for ${bookingDetails.hallName}`,
        image: "https://bookmyvenue-prototype.web.app/assets/bookmyvenue_icon_final.png",
        handler: function (response) {
            // Success Callback
            console.log("Payment Success:", response);
            onSuccess(response);
        },
        prefill: {
            name: bookingDetails.userName,
            email: bookingDetails.userEmail,
            contact: bookingDetails.userPhone || ""
        },
        notes: {
            bookingId: "temp_booking_id"
        },
        theme: {
            color: "#1e3a8a" // Royal Blue (Primary)
        }
    };

    try {
        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            // Failure Callback
            console.error("Payment Failed:", response.error);
            onFailure(response.error);
        });
        rzp1.open();
    } catch (error) {
        console.error("Razorpay Error:", error);
        alert("Payment Gateway failed to load. Are you online?");
    }
};
