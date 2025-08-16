"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "si"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

// Translation data
const translations = {
  en: {
    // Navigation
    "nav.title": "GovConnect",
    "nav.profile": "Profile",
    "nav.calendar": "Calendar",
    "nav.login": "Login",
    "nav.logout": "Logout",
    "nav.welcome": "Welcome",
    "nav.user": "User",

    // Login
    "login.title": "Sign In",
    "login.description": "Access your government services account",
    "login.citizen": "Citizen",
    "login.staff": "Staff",
    "login.password": "Password",
    "login.otp": "OTP",
    "login.username": "Username",
    "login.emailAddress": "Email Address",
    "login.enterPassword": "Enter your password",
    "login.sendOTP": "Send OTP",
    "login.enterOTP": "Enter OTP",
    "login.signIn": "Sign In",
    "login.forgotPassword": "Forgot Password?",
    "login.role": "Role",
    "login.selectRole": "Select your role",
    "login.contactIT": "Contact IT Support",
    "login.securityNotice": "This is a secure government portal. Unauthorized access is prohibited.",
    "login.backToServices": "Back to Services",
    "login.usernameRequired": "Username is required",
    "login.passwordRequired": "Password is required",
    "login.roleRequired": "Role is required",
    "login.otpRequired": "OTP is required",
    "login.emailRequired": "Email is required for OTP login",
    "login.invalidEmail": "Please enter a valid email address",
    "login.otpFailed": "Failed to send OTP. Please try again.",
    "login.loginFailed": "Login failed. Please check your credentials.",
    "login.staffLoginFailed": "Login failed. Please check your credentials and role.",
    "login.signingIn": "Signing in...",
    "login.sending": "Sending...",
    "login.changeEmail": "Change email",
    "login.otpSentTo": "OTP sent to",

    // Common
    "common.backToServices": "Back to Services",
    "common.submit": "Submit",
    "common.success": "Success! Your application has been submitted.",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.edit": "Edit",
    "common.delete": "Delete",
    "common.loading": "Loading...",
    "common.status": "Status",
    "common.actions": "Actions",
    "common.download": "Download",
    "common.view": "View",
    "common.approve": "Approve",
    "common.reject": "Reject",
    "common.pending": "Pending",
    "common.completed": "Completed",
    "common.inProgress": "In Progress",
    "common.cancelled": "Cancelled",
    "common.confirmed": "Confirmed",
    "common.processing": "Processing",
    "common.ready": "Ready",
    "common.requestHistory": "Request History",
    "common.date": "Date",
    "common.time": "Time",
    "common.yes": "Yes",
    "common.no": "No",
    "common.logout": "Logout",
    "common.uploading": "Uploading...",
    "common.refresh": "Refresh",

    // Form validation and errors
    "form.selectService": "Select Service",
    "form.selectPurpose": "Select purpose",
    "form.selectTimeSlot": "Select time slot",
    "form.selectCertificateType": "Select certificate type",
    "form.selectMaritalStatus": "Select marital status",
    "form.purposeRequired": "Please select a purpose",
    "form.timeSlotRequired": "Please select a time slot",
    "form.certificateTypeRequired": "Please select certificate type",
    "form.purposeSpecifyRequired": "Please specify the purpose",
    "form.serviceTypeRequired": "Service type is required",
    "form.bookingFailed": "Failed to book appointment. Please try again.",
    "form.submittingRequest": "Submitting Request...",
    "form.bookingAppointment": "Booking Appointment...",
    "form.submittingApplication": "Submitting Application...",

    // Additional form fields
    "form.date": "Date",
    "form.time": "Time",
    "form.description": "Description",
    "form.actions": "Actions",
    "form.status": "Status",
    "form.requestDate": "Request Date",
    "form.enterReligion": "Enter religion",
    "form.enterOccupation": "Enter occupation",
    "form.enterFatherName": "Enter father's name",
    "form.enterMotherName": "Enter mother's name",
    "form.enterFatherAddress": "Enter father's address",
    "form.residencePeriodPlaceholder": "e.g., 10 years",
    "form.purposePlaceholder": "e.g., Employment, Bank Account, Visa Application",
    "form.reasonForApplication": "Reason for application",
    "form.selectAvailableDate": "Select available date",
    "form.selectAvailableTime": "Select available time",
    "form.selectDateFirst": "Select date first",
    "form.selectCitizenship": "Select citizenship",
    "form.loadingDates": "Loading dates...",
    "form.loadingTimes": "Loading times...",
    "form.noAvailableDates": "No available dates",
    "form.noAvailableTimes": "No available times",
    "form.scheduleGramaniladhari": "Schedule appointment with Gramaniladhari",
    "form.scheduledPastAppointments": "Your scheduled and past appointments",
    "form.trackCertificateRequests": "Track your certificate requests and download approved certificates",
    "form.applyForCertificates": "Apply for character, residence, or other certificates",
    "form.applicationTypeRequired": "Please select an application type",
    "form.booking": "Booking...",
    "form.additionalDetails": "Additional details",

    // Form fields
    "form.purposeOfVisit": "Purpose of Visit",
    "form.availableTimeSlots": "Available Time Slots",
    "form.additionalNotes": "Additional Notes (Optional)",
    "form.additionalNotesPlaceholder": "Any additional information or special requirements",
    "form.certificateType": "Certificate Type",
    "form.maritalStatus": "Marital Status",
    "form.sriLankanCitizen": "Sri Lankan Citizen",
    "form.religion": "Religion",
    "form.occupation": "Occupation",
    "form.residencePeriod": "Period of Residence in Village",
    "form.fatherName": "Father's Name",
    "form.motherName": "Mother's Name",
    "form.fatherAddress": "Father's Address",
    "form.requiredDocuments": "Required Documents",
    "form.originalBirthCertificate": "Original Birth Certificate",
    "form.policeReportOptional": "Police Report (if applicable)",
    "form.studioSlip": "Photo Studio Slip",
    "form.vehicleNumber": "Vehicle Number",
    "form.chassisNumber": "Chassis Number",
    "form.engineNumber": "Engine Number",
    "form.licenseClass": "License Class",
    "form.previousLicense": "Previous License Number",
    "form.reason": "Reason",
    "form.purpose": "Purpose",

    // Placeholders
    "placeholder.enterReligion": "Enter religion",
    "placeholder.enterOccupation": "Enter occupation",
    "placeholder.residencePeriodExample": "e.g., 10 years",
    "placeholder.enterFatherName": "Enter father's name",
    "placeholder.enterFatherAddress": "Enter father's address",
    "placeholder.purposeExample": "e.g., Employment, Bank Account, Visa Application",
    "placeholder.vehicleNumberExample": "e.g., ABC-1234",
    "placeholder.chassisNumber": "Enter chassis number",
    "placeholder.engineNumber": "Enter engine number",
    "placeholder.previousLicenseNumber": "Enter previous license number",
    "placeholder.reasonForApplication": "Reason for application",
    "placeholder.selectLicenseClass": "Select license class",
    "placeholder.selectCitizenship": "Select citizenship",

    // Certificate types
    "certificate.character": "Character Certificate",
    "certificate.residence": "Residence Certificate",
    "certificate.income": "Income Certificate",

    // Marital status options
    "marital.married": "Married",
    "marital.unmarried": "Unmarried",
    "marital.divorced": "Divorced",
    "marital.widowed": "Widowed",

    // Citizenship options
    "citizenship.yes": "Yes",
    "citizenship.no": "No",

    // License classes
    "license.classA": "Class A - Motorcycle",
    "license.classB": "Class B - Light Vehicle",
    "license.classC": "Class C - Heavy Vehicle",
    "license.classD": "Class D - Passenger Vehicle",
    "license.classG": "Class G - Goods Vehicle",

    // Motor Traffic specific
    "motorTraffic.vehicleServices": "Vehicle Services",
    "motorTraffic.drivingLicense": "Driving License Services",
    "motorTraffic.vehicleServicesDesc": "Vehicle registration and ownership transfer services",
    "motorTraffic.drivingLicenseDesc": "New driving license and renewal services",

    // Appointment and certificate management
    "appointment.history": "Appointment History",
    "appointment.bookNew": "Book New Appointment",
    "appointment.myAppointments": "My Appointments",
    "appointment.bookAppointment": "Book Appointment",
    "certificate.myRequests": "My Certificate Requests",
    "certificate.requestNew": "Request New Certificate",
    "certificate.trackRequests": "Track your certificate requests and download approved certificates",
    "certificate.applyFor": "Apply for character, residence, or other certificates",

    // Table headers
    "table.certificateType": "Certificate Type",
    "table.requestDate": "Request Date",
    "table.purpose": "Purpose",
    "table.serviceType": "Service Type",
    "table.submittedDate": "Submitted Date",
    "table.completedDate": "Completed Date",
    "table.vehicleNumber": "Vehicle Number",
    "table.licenseClass": "License Class",

    // Loading and status messages
    "loading.requestHistory": "Loading request history...",
    "message.noRequests": "No previous requests found.",
    "message.scheduledAppointments": "Scheduled appointments",
    "message.totalRequests": "Total requests",
    "message.awaitingProcessing": "Awaiting processing",
    "message.readyForDownload": "Ready for download",

    // Profile
    "profile.myProfile": "My Profile",
    "profile.personalInfo": "Personal Information",
    "profile.personalInfoDesc": "Update your personal details and contact information",
    "profile.documents": "Documents",
    "profile.documentManagement": "Document Management",
    "profile.documentManagementDesc": "Upload and manage your official documents",
    "profile.settings": "Settings",
    "profile.accountSettings": "Account Settings",
    "profile.accountSettingsDesc": "Manage your account preferences and security",
    "profile.nameEnglish": "Name (English)",
    "profile.nameSinhala": "Name (Sinhala)",
    "profile.email": "Email Address",
    "profile.phone": "Phone Number",
    "profile.birthday": "Date of Birth",
    "profile.gender": "Gender",
    "profile.address": "Address",
    "profile.street": "Street Address",
    "profile.city": "City",
    "profile.district": "District",
    "profile.postalCode": "Postal Code",
    "profile.uploadBirthCertificate": "Upload Birth Certificate",
    "profile.uploadPoliceReport": "Upload Police Report",
    "profile.uploadNIC": "Upload National Identity Card",
    "profile.uploadOther": "Upload Other Document",
    "profile.uploadFile": "Upload File",
    "profile.uploadedDocuments": "Uploaded Documents",
    "profile.noDocuments": "No documents uploaded yet",
    "profile.selectFromUploaded": "Select from previously uploaded documents:",
    "profile.uploadNewDocument": "Upload New Document",
    "profile.birthCertificate": "Birth Certificate",
    "profile.policeReport": "Police Report",
    "profile.identityCard": "Identity Card",
    "profile.other": "Other",
    "profile.verified": "Verified",
    "profile.pending": "Pending",
    "profile.rejected": "Rejected",
    "profile.changePassword": "Change Password",
    "profile.changePasswordDesc": "Update your account password",
    "profile.notifications": "Notifications",
    "profile.notificationsDesc": "Manage your notification preferences",
    "profile.privacy": "Privacy Settings",
    "profile.privacyDesc": "Control your privacy and data sharing preferences",
    "profile.change": "Change",
    "profile.manage": "Manage",

    // Service Overview
    "home.welcome": "Welcome to Sri Lanka Government Services",
    "home.description":
      "Access essential government services online. Apply for certificates, book appointments, and manage your documents from the comfort of your home.",
    "home.search": "Search services...",
    "home.systemStatus": "System Status:",
    "home.statusMessage": "3 services are currently available. Additional services will be launched progressively.",
    "home.accessService": "Access Service",
    "home.comingSoon": "Coming Soon",

    // Services
    "services.gramaniladhari": "Gramaniladhari Services",
    "services.nicServices": "NIC Services",
    "services.certificates": "Certificates",
    "services.certificatesDesc":
      "Apply for character certificates, residence certificates, and other official documents.",
    "services.nicApplication": "National Identity Card Application",
    "service.gramaniladhari": "Gramaniladhari Services",
    "service.gramaniladhari.desc": "Character certificates, residence certificates, and appointments",
    "service.nic": "National Identity Card",
    "service.nic.desc": "Apply for new NIC or replace existing card",
    "service.motor": "Motor Traffic Services",
    "service.motor.desc": "Driving licenses, vehicle registration, and permits",
    "service.land": "Land Registry",
    "service.land.desc": "Property deeds, land certificates, and ownership transfers",
    "service.civil": "Civil Registration",
    "service.civil.desc": "Birth, death, and marriage certificates",
    "service.police": "Police Services",
    "service.police.desc": "Police clearance certificates and reports",
    "service.municipal": "Municipal Services",
    "service.municipal.desc": "Building permits, trade licenses, and municipal certificates",
    "service.tax": "Tax Services",
    "service.tax.desc": "Income tax, property tax, and tax clearance certificates",
    "service.education": "Education Services",
    "service.education.desc": "School admissions, certificates, and educational documents",
    "service.health": "Health Services",
    "service.health.desc": "Medical certificates, health records, and clinic appointments",
    "services.newLicense": "New Driving License",

    // Service specific
    "service.motorTraffic": "Motor Traffic Services",
    "service.nic.applyDescription": "Apply for new NIC or replace existing card",

    // New Service Flows
    "service.nic.new": "New National Identity Card",
    "service.nic.remake": "Remake National Identity Card",
    "service.nic.lost": "Lost National Identity Card",
    "service.nic.requirements": "Required Documents",
    "service.nic.new.docs": "Original Birth Certificate, Studio Photo Slip",
    "service.nic.remake.docs": "Previous NIC, Original Birth Certificate, Studio Photo Slip",
    "service.nic.lost.docs": "Birth Certificate, Police Report",

    // Motor Traffic Services
    "service.motor.vehicle": "Vehicle Services",
    "service.motor.license": "Driving License Services",
    "service.motor.firstReg": "First Registration",
    "service.motor.transfer": "Registration of Ownership Transfer",
    "service.motor.newLicense": "New Driving License",
    "service.motor.renewal": "Renewal of Validity and Extension",

    // Forms
    "forms.applicationType": "Application Type",
    "forms.newNIC": "New National Identity Card",
    "forms.remakeNIC": "Remake National Identity Card",
    "forms.lostNIC": "Lost National Identity Card",
    "forms.requiredDocuments": "Required Documents",
    "forms.originalBirthCertificate": "Original Birth Certificate",
    "forms.studioSlip": "Studio Photo Slip",
    "forms.existingNIC": "Existing National Identity Card",
    "forms.policeReport": "Police Report",
    "forms.fullName": "Full Name",
    "forms.nic": "National Identity Card Number",
    "forms.address": "Address",
    "forms.phoneNumber": "Phone Number",
    "forms.purpose": "Purpose",
    "forms.applicantName": "Applicant Name",
    "forms.serviceType": "Service Type",
    "forms.status": "Status",
    "forms.date": "Date",

    // Dashboard
    "dashboard.motorTrafficDashboard": "Motor Traffic Dashboard",
    "dashboard.overview": "Overview",
    "dashboard.vehicleManagement": "Vehicle Management",
    "dashboard.licenseManagement": "License Management",
    "dashboard.vehicleRegistrations": "Vehicle Registrations",
    "dashboard.licenseApplications": "License Applications",
    "dashboard.pendingApprovals": "Pending Approvals",
    "dashboard.completedToday": "Completed Today",
    "dashboard.recentApplications": "Recent Applications",
    "dashboard.vehicleManagementDesc": "Manage vehicle registrations, transfers, and related services.",
    "dashboard.licenseManagementDesc": "Process driving license applications, renewals, and extensions.",

    // Status
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
    "status.completed": "Completed",

    // Citizen Portal
    "citizen.appointments": "Appointments",
    "citizen.certificates": "Certificates",
    "citizen.requestCertificate": "Request Certificate",
    "citizen.bookAppointment": "Book Appointment",
    "citizen.appointmentHistory": "Appointment History",
    "citizen.certificateHistory": "Certificate History",
    "citizen.requestNewCertificate": "Request New Certificate",

    // Dashboard
    "dashboard.citizen": "Citizen Dashboard",
    "dashboard.welcome": "Welcome",
    "dashboard.appointments": "Appointments",
    "dashboard.certificates": "Certificates",

    "footer.title": "GovConnect",
    "footer.description": "Access essential government services online. Apply for certificates, book appointments, and manage your documents from the comfort of your home.",
    "footer.contact": "Contact Us",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.cookies": "Cookies Policy",
    "footer.legal": "Legal",
    "footer.copyright": "© 2025 Government Services. All rights reserved."

  },
  si: {
    // Navigation
    "nav.title": "රජයේ සේවා ද්වාරය",
    "nav.profile": "පැතිකඩ",
    "nav.calendar": "දිනදර්ශනය",
    "nav.login": "පිවිසීම",
    "nav.logout": "ඉවත්වීම",
    "nav.welcome": "ආයුබෝවන්",
    "nav.user": "පරිශීලකයා",

    // Login
    "login.title": "පිවිසෙන්න",
    "login.description": "ඔබේ රජයේ සේවා ගිණුමට ප්‍රවේශ වන්න",
    "login.citizen": "පුරවැසියා",
    "login.staff": "කාර්ය මණ්ඩලය",
    "login.password": "මුරපදය",
    "login.otp": "OTP",
    "login.username": "පරිශීලක නාමය",
    "login.emailAddress": "විද්‍යුත් ලිපිනය",
    "login.enterPassword": "ඔබේ මුරපදය ඇතුළත් කරන්න",
    "login.sendOTP": "OTP යවන්න",
    "login.enterOTP": "OTP ඇතුළත් කරන්න",
    "login.signIn": "පිවිසෙන්න",
    "login.forgotPassword": "මුරපදය අමතකද?",
    "login.role": "භූමිකාව",
    "login.selectRole": "ඔබේ භූමිකාව තෝරන්න",
    "login.contactIT": "IT සහාය අමතන්න",
    "login.securityNotice": "මෙය ආරක්ෂිත රජයේ ද්වාරයකි. අනවසර ප්‍රවේශය තහනම්ය.",
    "login.backToServices": "සේවාවන් වෙත ආපසු",
    "login.usernameRequired": "පරිශීලක නාමය අවශ්‍යයි",
    "login.passwordRequired": "මුරපදය අවශ්‍යයි",
    "login.roleRequired": "භූමිකාව අවශ්‍යයි",
    "login.otpRequired": "OTP අවශ්‍යයි",
    "login.emailRequired": "OTP පිවිසීම සඳහා විද්‍යුත් ලිපිනය අවශ්‍යයි",
    "login.invalidEmail": "කරුණාකර වලංගු විද්‍යුත් ලිපිනයක් ඇතුළත් කරන්න",
    "login.otpFailed": "OTP යැවීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.",
    "login.loginFailed": "පිවිසීම අසාර්ථකයි. කරුණාකර ඔබේ අක්තපත්‍ර පරීක්ෂා කරන්න.",
    "login.staffLoginFailed": "පිවිසීම අසාර්ථකයි. කරුණාකර ඔබේ අක්තපත්‍ර සහ භූමිකාව පරීක්ෂා කරන්න.",
    "login.signingIn": "පිවිසෙමින්...",
    "login.sending": "යවමින්...",
    "login.changeEmail": "විද්‍යුත් ලිපිනය වෙනස් කරන්න",
    "login.otpSentTo": "OTP යවන ලද්දේ",

    // Common
    "common.backToServices": "සේවාවන් වෙත ආපසු",
    "common.submit": "යාවත්කාලීන කරන්න",
    "common.success": "සාර්ථකයි! ඔබේ අයදුම්පත ඉදිරිපත් කර ඇත.",
    "common.cancel": "අවලංගු කරන්න",
    "common.save": "සාර්ථකයි! ඔබේ අයදුම්පත ඉදිරිපත් කර ඇත.",
    "common.edit": "යාවත්කාලීන කරන්න",
    "common.delete": "මකන්න",
    "common.loading": "පූරණය කරමින්...",
    "common.status": "තත්ත්වය",
    "common.actions": "ක්‍රියාමාර්ග",
    "common.download": "බාගත කරන්න",
    "common.view": "බලන්න",
    "common.approve": "අනුමත කරන්න",
    "common.reject": "ප්‍රතික්ෂේප කරන්න",
    "common.pending": "අපේක්ෂාවෙන්",
    "common.completed": "සම්පූර්ණ",
    "common.inProgress": "ක්‍රියාත්මක වෙමින්",
    "common.cancelled": "අවලංගු",
    "common.confirmed": "තහවුරු",
    "common.processing": "ක්‍රියාත්මක කරමින්",
    "common.ready": "සූදානම්",
    "common.requestHistory": "ඉල්ලීම් ඉතිහාසය",
    "common.date": "දිනය",
    "common.time": "වේලාව",
    "common.yes": "ඔව්",
    "common.no": "නැත",
    "common.logout": "ඉවත්වීම",
    "common.uploading": "උඩුගත කරමින්...",
    "common.refresh": "නැවුම් කරන්න",

    // Profile
    "profile.myProfile": "මගේ පැතිකඩ",
    "profile.personalInfo": "පුද්ගලික තොරතුරු",
    "profile.personalInfoDesc": "ඔබේ පුද්ගලික විස්තර සහ සම්බන්ධතා තොරතුරු යාවත්කාලීන කරන්න",
    "profile.documents": "ලේඛන",
    "profile.documentManagement": "ලේඛන කළමනාකරණය",
    "profile.documentManagementDesc": "ඔබේ නිල ලේඛන උඩුගත කර කළමනාකරණය කරන්න",
    "profile.settings": "සැකසුම්",
    "profile.accountSettings": "ගිණුම් සැකසුම්",
    "profile.accountSettingsDesc": "ඔබේ ගිණුම් මනාපයන් සහ ආරක්ෂාව කළමනාකරණය කරන්න",
    "profile.nameEnglish": "නම (ඉංග්‍රීසි)",
    "profile.nameSinhala": "නම (සිංහල)",
    "profile.email": "විද්‍යුත් ලිපිනය",
    "profile.phone": "දුරකථන අංකය",
    "profile.birthday": "උපන් දිනය",
    "profile.gender": "ස්ත්‍රී පුරුෂ භාවය",
    "profile.address": "ලිපිනය",
    "profile.street": "වීදි ලිපිනය",
    "profile.city": "නගරය",
    "profile.district": "දිස්ත්‍රික්කය",
    "profile.postalCode": "තැපැල් කේතය",
    "profile.uploadBirthCertificate": "උප්පැන්න සහතිකය උඩුගත කරන්න",
    "profile.uploadPoliceReport": "පොලිස් වාර්තාව උඩුගත කරන්න",
    "profile.uploadNIC": "ජාතික හැඳුනුම්පත උඩුගත කරන්න",
    "profile.uploadOther": "වෙනත් ලේඛනයක් උඩුගත කරන්න",
    "profile.uploadFile": "ගොනුව උඩුගත කරන්න",
    "profile.uploadedDocuments": "උඩුගත කළ ලේඛන",
    "profile.noDocuments": "තවම ලේඛන උඩුගත කර නැත",
    "profile.selectFromUploaded": "කලින් උඩුගත කළ ලේඛනවලින් තෝරන්න:",
    "profile.uploadNewDocument": "නව ලේඛනයක් උඩුගත කරන්න",
    "profile.birthCertificate": "උප්පැන්න සහතිකය",
    "profile.policeReport": "පොලිස් වාර්තාව",
    "profile.identityCard": "හැඳුනුම්පත",
    "profile.other": "වෙනත්",
    "profile.verified": "සත්‍යාපිත",
    "profile.pending": "අපේක්ෂාවෙන්",
    "profile.rejected": "ප්‍රතික්ෂේප",
    "profile.changePassword": "මුරපදය වෙනස් කරන්න",
    "profile.changePasswordDesc": "ඔබේ ගිණුම් මුරපදය යාවත්කාලීන කරන්න",
    "profile.notifications": "දැනුම්දීම්",
    "profile.notificationsDesc": "ඔබේ දැනුම්දීම් මනාපයන් කළමනාකරණය කරන්න",
    "profile.privacy": "පෞද්ගලිකත්ව සැකසුම්",
    "profile.privacyDesc": "ඔබේ පෞද්ගලිකත්වය සහ දත්ත බෙදාගැනීමේ මනාපයන් පාලනය කරන්න",
    "profile.change": "වෙනස් කරන්න",
    "profile.manage": "කළමනාකරණය",

    // Service Overview
    "home.welcome": "ශ්‍රී ලංකා රජයේ සේවාවන්ට සාදරයෙන් පිළිගනිමු",
    "home.description":
      "අත්‍යවශ්‍ය රජයේ සේවාවන් අන්තර්ජාලය හරහා ලබා ගන්න. සහතික සඳහා අයදුම් කරන්න, හමුවීම් වෙන්කරවා ගන්න, සහ ඔබේ ගෙදරින්ම ඔබේ ලේඛන කළමනාකරණය කරන්න.",
    "home.search": "සේවාවන් සොයන්න...",
    "home.systemStatus": "පද්ධති තත්ත්වය:",
    "home.statusMessage": "සේවාවන් 3ක් දැනට ලබා ගත හැකිය. අතිරේක සේවාවන් ක්‍රමානුකූලව දියත් කරනු ලැබේ.",
    "home.accessService": "සේවාව ලබා ගන්න",
    "home.comingSoon": "ඉදිරියේදී",

    // Services
    "services.gramaniladhari": "ග්‍රාමනිලධාරී සේවාවන්",
    "services.nicServices": "ජාහැ සේවාවන්",
    "services.certificates": "සහතික",
    "services.certificatesDesc": "චරිත සහතික, පදිංචි සහතික සහ වෙනත් නිල ලේඛන සඳහා අයදුම් කරන්න.",
    "services.nicApplication": "ජාතික හැඳුනුම්පත අයදුම්පත",
    "service.gramaniladhari": "ග්‍රාමනිලධාරී සේවාවන්",
    "service.gramaniladhari.desc": "චරිත සහතික, පදිංචි සහතික සහ හමුවීම්",
    "service.nic": "ජාතික හැඳුනුම්පත",
    "service.nic.desc": "නව ජාතික හැඳුනුම්පත අංකය අයදුම් කරන්න හෝ පවතින කාඩ්පත ප්‍රතිස්ථාපනය කරන්න",
    "service.motor": "මෝටර් රථ සේවාවන්",
    "service.motor.desc": "රියදුරු බලපත්‍ර, වාහන ලියාපදිංචිකරණය සහ අවසර පත්‍ර",
    "service.land": "ඉඩම් ලේඛනාගාරය",
    "service.land.desc": "දේපල ඔප්පු, ඉඩම් සහතික සහ හිමිකාරිත්ව මාරුකිරීම්",
    "service.civil": "සිවිල් ලියාපදිංචිකරණය",
    "service.civil.desc": "උප්පැන්න, මරණ සහ විවාහ සහතික",
    "service.police": "පොලිස් සේවාවන්",
    "service.police.desc": "පොලිස් නිදහස් කිරීමේ සහතික සහ වාර්තා",
    "service.municipal": "නගර සභා සේවාවන්",
    "service.municipal.desc": "ගොඩනැගිලි අවසර පත්‍ර, වෙළඳ බලපත්‍ර සහ නගර සභා සහතික",
    "service.tax": "බදු සේවාවන්",
    "service.tax.desc": "ආදායම් බදු, දේපල බදු සහ බදු නිදහස් කිරීමේ සහතික",
    "service.education": "අධ්‍යාපන සේවාවන්",
    "service.education.desc": "පාසල් ඇතුළත් කිරීම්, සහතික සහ අධ්‍යාපනික ලේඛන",
    "service.health": "සෞඛ්‍ය සේවාවන්",
    "service.health.desc": "වෛද්‍ය සහතික, සෞඛ්‍ය වාර්තා සහ සායන හමුවීම්",
    "services.newLicense": "නව රියදුරු බලපත්‍රය",

    // Service specific
    "service.motorTraffic": "මෝටර් රථ සේවාවන්",
    "service.nic.applyDescription": "නව ජාතික හැඳුනුම්පත අයදුම් කරන්න හෝ පවතින කාඩ්පත ප්‍රතිස්ථාපනය කරන්න",

    // New Service Flows
    "service.nic.new": "නව ජාතික හැඳුනුම්පත",
    "service.nic.remake": "ජාතික හැඳුනුම්පත නැවත සෑදීම",
    "service.nic.lost": "නැතිවූ ජාතික හැඳුනුම්පත",
    "service.nic.requirements": "අවශ්‍ය ලේඛන",
    "service.nic.new.docs": "මුල් උප්පැන්න සහතිකය, ස්ටුඩියෝ ඡායාරූප ස්ලිප්",
    "service.nic.remake.docs": "පවතින ජාතික හැඳුනුම්පත, මුල් උප්පැන්න සහතිකය, ස්ටුඩියෝ ඡායාරූප ස්ලිප්",
    "service.nic.lost.docs": "උප්පැන්න සහතිකය, පොලිස් වාර්තාව",

    // Motor Traffic Services
    "service.motor.vehicle": "වාහන සේවාවන්",
    "service.motor.license": "බලපත්‍ර සේවාවන්",
    "service.motor.firstReg": "පළමු ලියාපදිංචිකරණය",
    "service.motor.transfer": "හිමිකාරිත්ව මාරුකිරීමේ ලියාපදිංචිකරණය",
    "service.motor.newLicense": "නව රියදුරු බලපත්‍රය",
    "service.motor.renewal": "වලංගුභාවය අලුත් කිරීම සහ දීර්ඝ කිරීම",

    // Forms
    "forms.applicationType": "අයදුම්පත්‍ර වර්ගය",
    "forms.newNIC": "නව ජාතික හැඳුනුම්පත",
    "forms.remakeNIC": "ජාතික හැඳුනුම්පත නැවත සෑදීම",
    "forms.lostNIC": "නැතිවූ ජාතික හැඳුනුම්පත",
    "forms.requiredDocuments": "අවශ්‍ය ලේඛන",
    "forms.originalBirthCertificate": "මුල් උප්පැන්න සහතිකය",
    "forms.studioSlip": "ස්ටුඩියෝ ඡායාරූප ස්ලිප්",
    "forms.existingNIC": "පවතින ජාතික හැඳුනුම්පත",
    "forms.policeReport": "පොලිස් වාර්තාව",
    "forms.fullName": "සම්පූර්ණ නම",
    "forms.nic": "ජාතික හැඳුනුම්පත් අංකය",
    "forms.address": "ලිපිනය",
    "forms.phoneNumber": "දුරකථන අංකය",
    "forms.purpose": "අරමුණ",
    "forms.applicantName": "අයදුම්කරුගේ නම",
    "forms.serviceType": "සේවා වර්ගය",
    "forms.status": "තත්ත්වය",
    "forms.date": "දිනය",
    "form.selectService": "සේවාව තෝරන්න",
    "form.selectPurpose": "අරමුණ තෝරන්න",
    "form.selectTimeSlot": "කාල පරාසය තෝරන්න",
    "form.selectCertificateType": "සහතික වර්ගය තෝරන්න",
    "form.selectMaritalStatus": "විවාහක තත්ත්වය තෝරන්න",
    "form.purposeRequired": "කරුණාකර අරමුණක් තෝරන්න",
    "form.timeSlotRequired": "කරුණාකර කාල පරාසයක් තෝරන්න",
    "form.certificateTypeRequired": "කරුණාකර සහතික වර්ගය තෝරන්න",
    "form.purposeSpecifyRequired": "කරුණාකර අරමුණ සඳහන් කරන්න",
    "form.serviceTypeRequired": "සේවා වර්ගය අවශ්‍යයි",
    "form.bookingFailed": "හමුවීම වෙන්කරවා ගැනීම අසාර්ථකයි. කරුණාකර නැවත උත්සාහ කරන්න.",
    "form.submittingRequest": "ඉල්ලීම ඉදිරිපත් කරමින්...",
    "form.bookingAppointment": "හමුවීම වෙන්කරවා ගනිමින්...",
    "form.submittingApplication": "අයදුම්පත ඉදිරිපත් කරමින්...",

    // Additional form fields
    "form.date": "දිනය",
    "form.time": "වේලාව",
    "form.description": "විස්තරය",
    "form.actions": "ක්‍රියාමාර්ග",
    "form.status": "තත්ත්වය",
    "form.requestDate": "ඉල්ලීම් දිනය",
    "form.enterReligion": "ආගම ඇතුළත් කරන්න",
    "form.enterOccupation": "රැකියාව ඇතුළත් කරන්න",
    "form.enterFatherName": "පියාගේ නම ඇතුළත් කරන්න",
    "form.enterMotherName": "මාතාගේ නම ඇතුළත් කරන්න",
    "form.enterFatherAddress": "පියාගේ ලිපිනය ඇතුළත් කරන්න",
    "form.residencePeriodPlaceholder": "උදා: වසර 10",
    "form.purposePlaceholder": "උදා: රැකියාව, බැංකු ගිණුම, වීසා අයදුම්පත",
    "form.reasonForApplication": "අයදුම්පතේ හේතුව",
    "form.selectAvailableDate": "ලබා ගත හැකි දිනය තෝරන්න",
    "form.selectAvailableTime": "ලබා ගත හැකි වේලාව තෝරන්න",
    "form.selectDateFirst": "කලින් දිනය තෝරන්න",
    "form.selectCitizenship": "පුරවැසිභාවය තෝරන්න",
    "form.loadingDates": "දින පූරණය කරමින්...",
    "form.loadingTimes": "වේලාවන් පූරණය කරමින්...",
    "form.noAvailableDates": "ලබා ගත හැකි දින නැත",
    "form.noAvailableTimes": "ලබා ගත හැකි වේලාවන් නැත",
    "form.scheduleGramaniladhari": "ග්‍රාමනිලධාරී සමඟ හමුවීමක් නියම කරන්න",
    "form.scheduledPastAppointments": "ඔබේ නියමිත සහ අතීත හමුවීම්",
    "form.trackCertificateRequests": "ඔබේ සහතික ඉල්ලීම් නිරීක්ෂණය කර අනුමත සහතික බාගත කරන්න",
    "form.applyForCertificates": "චරිත, පදිංචි හෝ වෙනත් සහතික සඳහා අයදුම් කරන්න",
    "form.applicationTypeRequired": "කරුණාකර අයදුම්පත්‍ර වර්ගයක් තෝරන්න",
    "form.booking": "වෙන්කරවා ගනිමින්...",
    "form.additionalDetails": "අතිරේක විස්තර",

    // Form fields
    "form.purposeOfVisit": "සංචාරයේ අරමුණ",
    "form.availableTimeSlots": "ලබා ගත හැකි කාල පරාස",
    "form.additionalNotes": "අතිරේක සටහන් (විකල්ප)",
    "form.additionalNotesPlaceholder": "ඕනෑම අතිරේක තොරතුරු හෝ විශේෂ අවශ්‍යතා",
    "form.certificateType": "සහතික වර්ගය",
    "form.maritalStatus": "විවාහක තත්ත්වය",
    "form.sriLankanCitizen": "ශ්‍රී ලංකික පුරවැසියා",
    "form.religion": "ආගම",
    "form.occupation": "රැකියාව",
    "form.residencePeriod": "ගම්මානයේ පදිංචි කාලය",
    "form.fatherName": "පියාගේ නම",
    "form.motherName": "මාතාගේ නම",
    "form.fatherAddress": "පියාගේ ලිපිනය",
    "form.requiredDocuments": "අවශ්‍ය ලේඛන",
    "form.originalBirthCertificate": "මුල් උප්පැන්න සහතිකය",
    "form.policeReportOptional": "පොලිස් වාර්තාව (අවශ්‍ය නම්)",
    "form.studioSlip": "ඡායාරූප ස්ටුඩියෝ ස්ලිප්",
    "form.vehicleNumber": "වාහන අංකය",
    "form.chassisNumber": "චැසි අංකය",
    "form.engineNumber": "එන්ජින් අංකය",
    "form.licenseClass": "බලපත්‍ර පන්තිය",
    "form.previousLicense": "පෙර බලපත්‍ර අංකය",
    "form.reason": "හේතුව",
    "form.purpose": "අරමුණ",

    // Placeholders
    "placeholder.enterReligion": "ආගම ඇතුළත් කරන්න",
    "placeholder.enterOccupation": "රැකියාව ඇතුළත් කරන්න",
    "placeholder.residencePeriodExample": "උදා: වසර 10",
    "placeholder.enterFatherName": "පියාගේ නම ඇතුළත් කරන්න",
    "placeholder.enterFatherAddress": "පියාගේ ලිපිනය ඇතුළත් කරන්න",
    "placeholder.purposeExample": "උදා: රැකියාව, බැංකු ගිණුම, වීසා අයදුම්පත",
    "placeholder.vehicleNumberExample": "උදා: ABC-1234",
    "placeholder.chassisNumber": "චැසි අංකය ඇතුළත් කරන්න",
    "placeholder.engineNumber": "එන්ජින් අංකය ඇතුළත් කරන්න",
    "placeholder.previousLicenseNumber": "පෙර බලපත්‍ර අංකය ඇතුළත් කරන්න",
    "placeholder.reasonForApplication": "අයදුම්පතේ හේතුව",
    "placeholder.selectLicenseClass": "බලපත්‍ර පන්තිය තෝරන්න",
    "placeholder.selectCitizenship": "පුරවැසිභාවය තෝරන්න",

    // Certificate types
    "certificate.character": "චරිත සහතිකය",
    "certificate.residence": "පදිංචි සහතිකය",
    "certificate.income": "ආදායම් සහතිකය",

    // Marital status options
    "marital.married": "විවාහක",
    "marital.unmarried": "අවිවාහක",
    "marital.divorced": "දික්කසාද",
    "marital.widowed": "වැන්දඹු",

    // Citizenship options
    "citizenship.yes": "ඔව්",
    "citizenship.no": "නැත",

    // License classes
    "license.classA": "A පන්තිය - යතුරුපැදිය",
    "license.classB": "B පන්තිය - සැහැල්ලු වාහනය",
    "license.classC": "C පන්තිය - බර වාහනය",
    "license.classD": "D පන්තිය - මගී වාහනය",
    "license.classG": "G පන්තිය - භාණ්ඩ වාහනය",

    // Motor Traffic specific
    "motorTraffic.vehicleServices": "වාහන සේවාවන්",
    "motorTraffic.drivingLicense": "රියදුරු බලපත්‍ර සේවාවන්",
    "motorTraffic.vehicleServicesDesc": "වාහන ලියාපදිංචිකරණය සහ හිමිකාරිත්ව මාරුකිරීමේ සේවාවන්",
    "motorTraffic.drivingLicenseDesc": "නව රියදුරු බලපත්‍ර සහ අලුත් කිරීමේ සේවාවන්",

    // Appointment and certificate management
    "appointment.history": "හමුවීම් ඉතිහාසය",
    "appointment.bookNew": "නව හමුවීමක් වෙන්කරවා ගන්න",
    "appointment.myAppointments": "මගේ හමුවීම්",
    "appointment.bookAppointment": "හමුවීම වෙන්කරවා ගන්න",
    "certificate.myRequests": "මගේ සහතික ඉල්ලීම්",
    "certificate.requestNew": "නව සහතිකයක් ඉල්ලන්න",
    "certificate.trackRequests": "ඔබේ සහතික ඉල්ලීම් නිරීක්ෂණය කර අනුමත සහතික බාගත කරන්න",
    "certificate.applyFor": "චරිත, පදිංචි හෝ වෙනත් සහතික සඳහා අයදුම් කරන්න",

    // Table headers
    "table.certificateType": "සහතික වර්ගය",
    "table.requestDate": "ඉල්ලීම් දිනය",
    "table.purpose": "අරමුණ",
    "table.serviceType": "සේවා වර්ගය",
    "table.submittedDate": "ඉදිරිපත් කළ දිනය",
    "table.completedDate": "සම්පූර්ණ කළ දිනය",
    "table.vehicleNumber": "වාහන අංකය",
    "table.licenseClass": "බලපත්‍ර පන්තිය",

    // Loading and status messages
    "loading.requestHistory": "ඉල්ලීම් ඉතිහාසය පූරණය කරමින්...",
    "message.noRequests": "පෙර ඉල්ලීම් හමු නොවීය.",
    "message.scheduledAppointments": "නියමිත හමුවීම්",
    "message.totalRequests": "මුළු ඉල්ලීම්",
    "message.awaitingProcessing": "ක්‍රියාත්මක කිරීම බලාපොරොත්තුවෙන්",
    "message.readyForDownload": "බාගත කිරීමට සූදානම්",

    // Dashboard
    "dashboard.motorTrafficDashboard": "මෝටර් රථ ප්‍රවාහන උපකරණ පුවරුව",
    "dashboard.overview": "සමාලෝචනය",
    "dashboard.vehicleManagement": "වාහන කළමනාකරණය",
    "dashboard.licenseManagement": "බලපත්‍ර කළමනාකරණය",
    "dashboard.vehicleRegistrations": "වාහන ලියාපදිංචිකරණ",
    "dashboard.licenseApplications": "බලපත්‍ර අයදුම්පත්",
    "dashboard.pendingApprovals": "අනුමැතිය බලාපොරොත්තුවෙන්",
    "dashboard.completedToday": "අද සම්පූර්ණ කළ",
    "dashboard.recentApplications": "මෑත අයදුම්පත්",
    "dashboard.vehicleManagementDesc": "වාහන ලියාපදිංචිකරණ, මාරුකිරීම් සහ අදාළ සේවාවන් කළමනාකරණය කරන්න.",
    "dashboard.licenseManagementDesc": "රියදුරු බලපත්‍ර අයදුම්පත්, අලුත් කිරීම් සහ දීර්ඝ කිරීම් ක්‍රියාත්මක කරන්න.",

    // Status
    "status.pending": "අපේක්ෂාවෙන්",
    "status.approved": "අනුමත",
    "status.rejected": "ප්‍රතික්ෂේප",
    "status.completed": "සම්පූර්ණ",

    // Citizen Portal
    "citizen.appointments": "හමුවීම්",
    "citizen.certificates": "සහතික",
    "citizen.requestCertificate": "සහතිකය ඉල්ලන්න",
    "citizen.bookAppointment": "හමුවීම වෙන්කරවා ගන්න",
    "citizen.appointmentHistory": "හමුවීම් ඉතිහාසය",
    "citizen.certificateHistory": "සහතික ඉතිහාසය",
    "citizen.requestNewCertificate": "නව සහතිකයක් ඉල්ලන්න",

    // Dashboard
    "dashboard.citizen": "පුරවැසි උපකරණ පුවරුව",
    "dashboard.welcome": "සාදරයෙන් පිළිගනිමු",
    "dashboard.appointments": "හමුවීම්",
    "dashboard.certificates": "සහතික",

    "footer.title": "රජයේ සේවා ද්වාරය",
    "footer.description": "අත්‍යවශ්‍ය රජයේ සේවා අන්තර්ජාලය හරහා ප්‍රවේශය. සහතික සඳහා අයදුම් කරන්න, හමුවීම් වෙන්කරවා ගන්න, සහ ඔබේ ලේඛන කළමනාකරණය කරන්න.",
    "footer.contact": "අප හා සම්බන්ධ වන්න",
    "footer.privacy": "පෞද්ගලිකත්ව ප්‍රතිපත්තිය",
    "footer.terms": "සේවා කොන්දේසි",
    "footer.cookies": "cookies ප්‍රතිපත්තිය",
    "footer.legal": "නීතිමය",
    "footer.copyright": "අයිතිය © 2025 රජයේ සේවා. සියලුම හිමිකම් ඇවිරිණි."

  },
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem("language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "si")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Save language preference
  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  // Translation function
  const t = (key: string): string => {
    return (translations[language] as Record<string, string>)[key] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
