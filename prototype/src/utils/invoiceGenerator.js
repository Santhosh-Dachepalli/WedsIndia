import jsPDF from 'jspdf';
import 'jspdf-autotable';
import logo from '../assets/bookmyvenue_logo.png'; // Make sure this path is correct or use a public URL fallback


export const generateInvoice = (booking) => {
    try {
        console.log("Generating invoice for:", booking);

        // Handle different import structures (ESM vs CommonJS/Vite bundle)
        const doc = new (jsPDF.default || jsPDF)();

        // -- Header --
        doc.setFontSize(22);
        doc.setTextColor(30, 58, 138); // Primary Blue
        doc.text("BookMyVenue", 14, 20);

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Invoice / Receipt", 14, 28);
        doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 34);
        doc.text(`Invoice #: INV-${Date.now().toString().slice(-6)}`, 14, 40);

        // -- Booking Details --
        doc.setDrawColor(200);
        doc.line(14, 45, 196, 45); // Horizontal Line

        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Billed To:", 14, 55);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(booking.userName || "Guest User", 14, 62);
        doc.text(booking.userEmail || "No Email Provided", 14, 68);
        if (booking.userPhone) doc.text(booking.userPhone, 14, 74);

        // -- Venue Details --
        doc.setFontSize(12);
        doc.setTextColor(0);
        doc.text("Venue Details:", 110, 55);
        doc.setFontSize(10);
        doc.setTextColor(80);
        doc.text(booking.hallName || "Venue Name", 110, 62);
        doc.text(`Event Date: ${new Date(booking.date).toDateString()}`, 110, 68);
        doc.text(`Location: ${booking.hallLocation || "India"}`, 110, 74);

        // -- Items Table --
        // Check if autoTable exists
        if (doc.autoTable) {
            doc.autoTable({
                startY: 85,
                head: [['Description', 'Qty', 'Price']],
                body: [
                    [`Venue Booking: ${booking.hallName}`, '1', `Rs ${booking.amount ? booking.amount.toLocaleString() : '0'}`],
                    ['Taxes & Fees (Included)', '-', 'Rs 0'],
                ],
                theme: 'striped',
                headStyles: { fillColor: [30, 58, 138] },
                foot: [['Total', '', `Rs ${booking.amount ? booking.amount.toLocaleString() : '0'}`]],
                footStyles: { fillColor: [243, 244, 246], textColor: [0, 0, 0], fontStyle: 'bold' }
            });
        } else {
            console.error("autoTable plugin not found");
            doc.text("Total Amount: Rs " + (booking.amount ? booking.amount.toLocaleString() : '0'), 14, 90);
        }

        // -- Footer --
        const finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY : 100;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text("Thank you for choosing BookMyVenue!", 14, finalY + 10);
        doc.text("For support, contact support@bookmyvenue.com", 14, finalY + 16);

        // -- Save --
        const filename = `Invoice_${(booking.hallName || "Booking").replace(/\s+/g, '_')}_${booking.date || "Date"}.pdf`;
        doc.save(filename);
        console.log("Invoice saved:", filename);

    } catch (error) {
        console.error("Invoice generation failed:", error);
        alert("Failed to generate invoice. Please try again or contact support.");
    }
};
