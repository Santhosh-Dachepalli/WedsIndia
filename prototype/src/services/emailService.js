
export const sendConfirmationEmail = (booking) => {
    console.log("--- SIMULATED EMAIL SERVICE ---");
    console.log(`To: ${booking.userEmail}`);
    console.log(`Subject: Booking Condirmed: ${booking.hallName}`);
    console.log(`Body: Hello ${booking.userName}, your booking for ${booking.hallName} on ${booking.date} is confirmed!`);
    console.log("-------------------------------");

    // In a real app, this would be an API call to a backend (e.g., SendGrid, Mailgun)
    // For prototype, we trigger a UI visual cue

    // Check if we can show a toast (assuming simple alert for now if no toast lib)
    // We will let the UI component handle the visual Toast, this service just logs 
    // and returns a Promise to simulate async network request.

    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true, message: "Email Sent Successfully" });
        }, 1000); // Simulate network delay
    });
};
