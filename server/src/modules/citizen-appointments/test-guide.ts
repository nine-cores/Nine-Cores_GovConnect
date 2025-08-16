/**
 * Test script for Citizen Appointments API
 * 
 * This script demonstrates the complete flow:
 * 1. View available time slots for a citizen's division GN
 * 2. Create an appointment
 * 3. Book a specific time slot for the appointment
 * 4. View citizen's appointments
 * 5. Cancel an appointment
 */

const baseURL = 'http://localhost:3000/api/v1';

// Test data
const testCitizenNic = '200156789012'; // This should be a verified citizen in the system
const testGNServiceId = 'GNS001'; // Identity Verification service
const testAppointmentDate = '2025-08-20'; // Future date

console.log('🔍 Citizen Appointments API Test Guide');
console.log('=====================================\n');

console.log('1. Get Available GN Services:');
console.log(`GET ${baseURL}/citizen-appointments/services`);
console.log('');

console.log('2. View Available Time Slots for Citizen:');
console.log(`GET ${baseURL}/citizen-appointments/available-slots/${testCitizenNic}?dateFrom=2025-08-15&dateTo=2025-08-25`);
console.log('');

console.log('3. Create Appointment (Step 1):');
console.log(`POST ${baseURL}/citizen-appointments/appointments`);
console.log('Body:');
console.log(JSON.stringify({
    citizenNic: testCitizenNic,
    gnServiceId: testGNServiceId,
    appointmentDate: testAppointmentDate,
    purpose: 'Need identity verification for passport application'
}, null, 2));
console.log('');

console.log('4. Book Time Slot (Step 2):');
console.log(`POST ${baseURL}/citizen-appointments/book-slot`);
console.log('Body:');
console.log(JSON.stringify({
    gnAppointmentId: 1, // Use the ID from step 3 response
    gnAvailabilityId: 5  // Use an available slot ID from step 2
}, null, 2));
console.log('');

console.log('5. View Citizen Appointments:');
console.log(`GET ${baseURL}/citizen-appointments/appointments/${testCitizenNic}`);
console.log('');

console.log('6. Cancel Appointment:');
console.log(`POST ${baseURL}/citizen-appointments/appointments/${testCitizenNic}/cancel`);
console.log('Body:');
console.log(JSON.stringify({
    gnAppointmentId: 1
}, null, 2));
console.log('');

console.log('📋 Prerequisites:');
console.log('- Citizen must be verified and assigned to a division');
console.log('- Division must have an assigned GN');
console.log('- GN must have available time slots');
console.log('- GN services must be enabled');
console.log('');

console.log('🏗️  Complete User Flow:');
console.log('1. Citizen views available services');
console.log('2. Citizen checks available time slots for their division GN');
console.log('3. Citizen creates appointment for specific service and date');
console.log('4. Citizen books specific time slot for the appointment');
console.log('5. Appointment is confirmed and time slot is marked as booked');
console.log('6. Citizen can view their appointments');
console.log('7. Citizen can cancel appointment (frees up time slot)');
console.log('');

console.log('💡 Key Features:');
console.log('- Two-step booking: Create appointment → Book time slot');
console.log('- Automatic GN assignment based on citizen division');
console.log('- Time slot conflict prevention');
console.log('- Appointment status tracking');
console.log('- Automatic time slot release on cancellation');

export const testEndpoints = {
    getServices: `${baseURL}/citizen-appointments/services`,
    getAvailableSlots: `${baseURL}/citizen-appointments/available-slots/${testCitizenNic}`,
    createAppointment: `${baseURL}/citizen-appointments/appointments`,
    bookTimeSlot: `${baseURL}/citizen-appointments/book-slot`,
    getAppointments: `${baseURL}/citizen-appointments/appointments/${testCitizenNic}`,
    cancelAppointment: `${baseURL}/citizen-appointments/appointments/${testCitizenNic}/cancel`
};
