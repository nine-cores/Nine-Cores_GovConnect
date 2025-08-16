"use client"

import type React from "react"
import { appointmentAPI, clearAuthToken } from "../lib/api"
import { useRouter } from "next/navigation"
import { isUserLoggedIn, getUserData, clearUserData } from "../lib/utils"

import { useState, useEffect } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Textarea } from "./ui/textarea"
import { Checkbox } from "./ui/checkbox"
import { CalendarIcon, FileText, Clock, CheckCircle, User, LogOut, Download, Eye, CreditCard, Car } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageSwitcher from "./LanguageSwitcher"

export default function CitizenPortal() {
  const { t } = useLanguage()
  const router = useRouter()
  const [appointments, setAppointments] = useState<any[]>([])
  const [certificateRequests, setCertificateRequests] = useState<any[]>([])
  const [availableSlots, setAvailableSlots] = useState<any[]>([])
  const [dataLoading, setDataLoading] = useState(true)
  const [userData, setUserData] = useState<any>(null)

  // Appointment booking form
  const [bookingForm, setBookingForm] = useState({
    purpose: "",
    selectedSlot: "",
    notes: "",
  })

  // Certificate request form
  const [certificateForm, setCertificateForm] = useState({
    type: "",
    purpose: "",
    married: "",
    sriLankan: "",
    religion: "",
    occupation: "",
    residencePeriod: "",
    fatherName: "",
    fatherAddress: "",
    hasOriginalBirthCert: false,
    hasPoliceReport: false,
    hasStudioSlip: false,
  })

  const [nicForm, setNicForm] = useState({
    applicationType: "",
    reason: "",
    hasOriginalBirthCert: false,
    hasStudioSlip: false,
    hasPreviousNIC: false,
    hasPoliceReport: false,
    previousNICNumber: "",
  })

  const [motorForm, setMotorForm] = useState({
    serviceType: "",
    vehicleNumber: "",
    chassisNumber: "",
    engineNumber: "",
    licenseClass: "",
    previousLicenseNumber: "",
    reason: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setDataLoading(true)
      
      // Load user data
      if (isUserLoggedIn()) {
        const user = getUserData()
        setUserData(user)
      }
      
      // Load available slots
      const slotsResponse = await appointmentAPI.getAvailableSlots()
      setAvailableSlots(slotsResponse.slots || [])

      setDataLoading(false)
    } catch (error) {
      console.error(" Error loading initial data:", error)
      setDataLoading(false)
    }
  }

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!bookingForm.purpose) {
      newErrors.purpose = "Please select a purpose"
    }
    if (!bookingForm.selectedSlot) {
      newErrors.selectedSlot = "Please select a time slot"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const appointmentData = {
        gnServiceId: "GNS001", // Default service ID
        purpose: bookingForm.purpose,
        availabilityId: Number.parseInt(bookingForm.selectedSlot),
      }

      const response = await appointmentAPI.makeAppointment(appointmentData)

      // Add to local appointments list
      const newAppointment = {
        id: appointments.length + 1,
        ...response.appointment,
        status: "pending",
      }
      setAppointments([...appointments, newAppointment])
      setBookingForm({ purpose: "", selectedSlot: "", notes: "" })
      setLoading(false)
      console.log(" Appointment booked successfully")
    } catch (error) {
      console.error(" Error booking appointment:", error)
      setErrors({ general: "Failed to book appointment. Please try again." })
      setLoading(false)
    }
  }

  const handleCertificateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!certificateForm.type) {
      newErrors.type = "Please select certificate type"
    }
    if (!certificateForm.purpose) {
      newErrors.purpose = "Please specify the purpose"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    // Simulate API call for certificate request
    setTimeout(() => {
      const newRequest = {
        id: certificateRequests.length + 1,
        type: certificateForm.type,
        requestDate: new Date().toISOString().split("T")[0],
        status: "processing",
        purpose: certificateForm.purpose,
        downloadUrl: null,
      }
      setCertificateRequests([...certificateRequests, newRequest])
      setCertificateForm({
        type: "",
        purpose: "",
        married: "",
        sriLankan: "",
        religion: "",
        occupation: "",
        residencePeriod: "",
        fatherName: "",
        fatherAddress: "",
        hasOriginalBirthCert: false,
        hasPoliceReport: false,
        hasStudioSlip: false,
      })
      setLoading(false)
      console.log(" Certificate request submitted successfully")
    }, 1500)
  }

  const handleNICApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!nicForm.applicationType) {
      newErrors.applicationType = t("form.selectService")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: certificateRequests.length + 1,
        type: `NIC - ${nicForm.applicationType}`,
        requestDate: new Date().toISOString().split("T")[0],
        status: "processing",
        purpose: nicForm.reason,
        downloadUrl: null,
      }
      setCertificateRequests([...certificateRequests, newRequest])
      setNicForm({
        applicationType: "",
        reason: "",
        hasOriginalBirthCert: false,
        hasStudioSlip: false,
        hasPreviousNIC: false,
        hasPoliceReport: false,
        previousNICNumber: "",
      })
      setLoading(false)
    }, 1500)
  }

  const handleMotorApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!motorForm.serviceType) {
      newErrors.serviceType = t("form.selectService")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    // Simulate API call
    setTimeout(() => {
      const newRequest = {
        id: certificateRequests.length + 1,
        type: `Motor Traffic - ${motorForm.serviceType}`,
        requestDate: new Date().toISOString().split("T")[0],
        status: "processing",
        purpose: motorForm.reason,
        downloadUrl: null,
      }
      setCertificateRequests([...certificateRequests, newRequest])
      setMotorForm({
        serviceType: "",
        vehicleNumber: "",
        chassisNumber: "",
        engineNumber: "",
        licenseClass: "",
        previousLicenseNumber: "",
        reason: "",
      })
      setLoading(false)
    }, 1500)
  }

  const cancelAppointment = (id: number) => {
    setAppointments(appointments.map((apt) => (apt.id === id ? { ...apt, status: "cancelled" } : apt)))
  }

  const handleLogout = () => {
    clearAuthToken()
    clearUserData()
    setUserData(null)
    window.location.href = "/login"
  }

  const handleProfile = () => {
    router.push("/citizen/profile")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-primary text-primary-foreground">Confirmed</Badge>
      case "pending":
        return <Badge variant="secondary">Pending</Badge>
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      case "approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "processing":
        return <Badge variant="secondary">Processing</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">{t("common.loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">{t("dashboard.citizen")}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <LanguageSwitcher />
              <span className="text-sm text-muted-foreground">
                {t("nav.welcome")}, {userData?.displayName || userData?.name || t("nav.user")}
              </span>
              <Button variant="ghost" size="sm" onClick={handleProfile}>
                <User className="h-4 w-4 mr-2" />
                {t("nav.profile")}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                {t("nav.logout")}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.appointments")}</CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointments.filter((apt) => apt.status === "confirmed" || apt.status === "pending").length}
              </div>
              <p className="text-xs text-muted-foreground">Scheduled appointments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.certificates")}</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{certificateRequests.length}</div>
              <p className="text-xs text-muted-foreground">Total requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificateRequests.filter((req) => req.status === "processing").length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting processing</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificateRequests.filter((req) => req.status === "approved").length}
              </div>
              <p className="text-xs text-muted-foreground">Ready for download</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="appointments">My Appointments</TabsTrigger>
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="certificates">My Certificates</TabsTrigger>
            <TabsTrigger value="request">Request Certificate</TabsTrigger>
            <TabsTrigger value="nic">NIC Services</TabsTrigger>
            <TabsTrigger value="motor">Motor Traffic</TabsTrigger>
          </TabsList>

          {/* ... existing code for appointments, book, certificates, request tabs ... */}
          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment History</CardTitle>
                <CardDescription>View your past and upcoming appointments</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        {t("common.date")} & {t("common.time")}
                      </TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell>
                          {appointment.date} at {appointment.time}
                        </TableCell>
                        <TableCell>{appointment.purpose}</TableCell>
                        <TableCell>{getStatusBadge(appointment.status)}</TableCell>
                        <TableCell>
                          {(appointment.status === "confirmed" || appointment.status === "pending") && (
                            <Button size="sm" variant="destructive" onClick={() => cancelAppointment(appointment.id)}>
                              {t("common.cancel")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {appointments.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                          No appointments found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="book">
            <Card>
              <CardHeader>
                <CardTitle>Book New Appointment</CardTitle>
                <CardDescription>Schedule an appointment with the Gramaniladhari</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBookAppointment} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purpose">Purpose of Visit</Label>
                      <Select
                        value={bookingForm.purpose}
                        onValueChange={(value) => setBookingForm({ ...bookingForm, purpose: value })}
                      >
                        <SelectTrigger className={errors.purpose ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select purpose" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Character Certificate">Character Certificate</SelectItem>
                          <SelectItem value="Residence Certificate">Residence Certificate</SelectItem>
                          <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                          <SelectItem value="Document Verification">Document Verification</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.purpose && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.purpose}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="slot">Available Time Slots</Label>
                      <Select
                        value={bookingForm.selectedSlot}
                        onValueChange={(value) => setBookingForm({ ...bookingForm, selectedSlot: value })}
                      >
                        <SelectTrigger className={errors.selectedSlot ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSlots.map((slot: any) => (
                            <SelectItem key={slot.id} value={slot.id.toString()}>
                              {slot.availableDate} at {slot.startTime}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.selectedSlot && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.selectedSlot}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Additional Notes (Optional)</Label>
                    <Textarea
                      id="notes"
                      placeholder="Any additional information or special requirements"
                      value={bookingForm.notes}
                      onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                    />
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Booking Appointment..." : "Book Appointment"}
                  </Button>

                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>My Certificate Requests</CardTitle>
                <CardDescription>Track your certificate requests and download approved certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Certificate Type</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>{t("common.status")}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">{request.type}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell>{request.purpose}</TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {request.status === "approved" && (
                              <Button size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                    {certificateRequests.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                          No certificate requests found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle>Request New Certificate</CardTitle>
                <CardDescription>Apply for character, residence, or other certificates</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCertificateRequest} className="space-y-4">
                  {/* ... existing certificate form code ... */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cert-type">Certificate Type</Label>
                      <Select
                        value={certificateForm.type}
                        onValueChange={(value) => setCertificateForm({ ...certificateForm, type: value })}
                      >
                        <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                          <SelectValue placeholder="Select certificate type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="character">Character Certificate</SelectItem>
                          <SelectItem value="residence">Residence Certificate</SelectItem>
                          <SelectItem value="income">Income Certificate</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.type}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cert-purpose">Purpose</Label>
                      <Input
                        id="cert-purpose"
                        placeholder="e.g., Employment, Bank Account, Visa Application"
                        value={certificateForm.purpose}
                        onChange={(e) => setCertificateForm({ ...certificateForm, purpose: e.target.value })}
                        className={errors.purpose ? "border-destructive" : ""}
                      />
                      {errors.purpose && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.purpose}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  </div>

                  {/* Additional fields for character certificate */}
                  {certificateForm.type === "character" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Marital Status</Label>
                          <Select
                            value={certificateForm.married}
                            onValueChange={(value) => setCertificateForm({ ...certificateForm, married: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select marital status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="married">Married</SelectItem>
                              <SelectItem value="unmarried">Unmarried</SelectItem>
                              <SelectItem value="divorced">Divorced</SelectItem>
                              <SelectItem value="widowed">Widowed</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>Sri Lankan Citizen</Label>
                          <Select
                            value={certificateForm.sriLankan}
                            onValueChange={(value) => setCertificateForm({ ...certificateForm, sriLankan: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select citizenship" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="religion">Religion</Label>
                          <Input
                            id="religion"
                            placeholder="Enter religion"
                            value={certificateForm.religion}
                            onChange={(e) => setCertificateForm({ ...certificateForm, religion: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="occupation">Occupation</Label>
                          <Input
                            id="occupation"
                            placeholder="Enter occupation"
                            value={certificateForm.occupation}
                            onChange={(e) => setCertificateForm({ ...certificateForm, occupation: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="residence-period">Period of Residence in Village</Label>
                          <Input
                            id="residence-period"
                            placeholder="e.g., 10 years"
                            value={certificateForm.residencePeriod}
                            onChange={(e) =>
                              setCertificateForm({ ...certificateForm, residencePeriod: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="father-name">Father's Name</Label>
                          <Input
                            id="father-name"
                            placeholder="Enter father's name"
                            value={certificateForm.fatherName}
                            onChange={(e) => setCertificateForm({ ...certificateForm, fatherName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="father-address">Father's Address</Label>
                        <Input
                          id="father-address"
                          placeholder="Enter father's address"
                          value={certificateForm.fatherAddress}
                          onChange={(e) => setCertificateForm({ ...certificateForm, fatherAddress: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>Required Documents</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="birth-cert"
                              checked={certificateForm.hasOriginalBirthCert}
                              onCheckedChange={(checked) =>
                                setCertificateForm({ ...certificateForm, hasOriginalBirthCert: checked as boolean })
                              }
                            />
                            <Label htmlFor="birth-cert">Original Birth Certificate</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="police-report"
                              checked={certificateForm.hasPoliceReport}
                              onCheckedChange={(checked) =>
                                setCertificateForm({ ...certificateForm, hasPoliceReport: checked as boolean })
                              }
                            />
                            <Label htmlFor="police-report">Police Report (if applicable)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="studio-slip"
                              checked={certificateForm.hasStudioSlip}
                              onCheckedChange={(checked) =>
                                setCertificateForm({ ...certificateForm, hasStudioSlip: checked as boolean })
                              }
                            />
                            <Label htmlFor="studio-slip">Photo Studio Slip</Label>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Submitting Request..." : t("common.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nic">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {t("service.nic")}
                </CardTitle>
                <CardDescription>Apply for new NIC, remake existing, or replace lost NIC</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleNICApplication} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="nic-type">{t("form.selectService")}</Label>
                    <Select
                      value={nicForm.applicationType}
                      onValueChange={(value) => setNicForm({ ...nicForm, applicationType: value })}
                    >
                      <SelectTrigger className={errors.applicationType ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("form.selectService")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">{t("service.nic.new")}</SelectItem>
                        <SelectItem value="remake">{t("service.nic.remake")}</SelectItem>
                        <SelectItem value="lost">{t("service.nic.lost")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.applicationType && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.applicationType}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {nicForm.applicationType && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="nic-reason">{t("form.reason")}</Label>
                        <Textarea
                          id="nic-reason"
                          placeholder="Reason for application"
                          value={nicForm.reason}
                          onChange={(e) => setNicForm({ ...nicForm, reason: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>{t("service.nic.requirements")}</Label>
                        <div className="bg-muted/50 p-4 rounded-lg">
                          <p className="text-sm font-medium mb-2">
                            {nicForm.applicationType === "new" && t("service.nic.new.docs")}
                            {nicForm.applicationType === "remake" && t("service.nic.remake.docs")}
                            {nicForm.applicationType === "lost" && t("service.nic.lost.docs")}
                          </p>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="nic-birth-cert"
                              checked={nicForm.hasOriginalBirthCert}
                              onCheckedChange={(checked) =>
                                setNicForm({ ...nicForm, hasOriginalBirthCert: checked as boolean })
                              }
                            />
                            <Label htmlFor="nic-birth-cert">Original Birth Certificate</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="nic-studio-slip"
                              checked={nicForm.hasStudioSlip}
                              onCheckedChange={(checked) =>
                                setNicForm({ ...nicForm, hasStudioSlip: checked as boolean })
                              }
                            />
                            <Label htmlFor="nic-studio-slip">Studio Photo Slip</Label>
                          </div>

                          {nicForm.applicationType === "remake" && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="nic-previous"
                                checked={nicForm.hasPreviousNIC}
                                onCheckedChange={(checked) =>
                                  setNicForm({ ...nicForm, hasPreviousNIC: checked as boolean })
                                }
                              />
                              <Label htmlFor="nic-previous">Previous NIC</Label>
                            </div>
                          )}

                          {nicForm.applicationType === "lost" && (
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="nic-police-report"
                                checked={nicForm.hasPoliceReport}
                                onCheckedChange={(checked) =>
                                  setNicForm({ ...nicForm, hasPoliceReport: checked as boolean })
                                }
                              />
                              <Label htmlFor="nic-police-report">Police Report</Label>
                            </div>
                          )}
                        </div>

                        {nicForm.applicationType === "remake" && (
                          <div className="space-y-2">
                            <Label htmlFor="previous-nic">Previous NIC Number</Label>
                            <Input
                              id="previous-nic"
                              placeholder="Enter previous NIC number"
                              value={nicForm.previousNICNumber}
                              onChange={(e) => setNicForm({ ...nicForm, previousNICNumber: e.target.value })}
                            />
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Submitting Application..." : t("common.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="motor">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  {t("service.motor")}
                </CardTitle>
                <CardDescription>Vehicle registration, driving licenses, and motor traffic services</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMotorApplication} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="motor-service">{t("form.selectService")}</Label>
                    <Select
                      value={motorForm.serviceType}
                      onValueChange={(value) => setMotorForm({ ...motorForm, serviceType: value })}
                    >
                      <SelectTrigger className={errors.serviceType ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("form.selectService")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="first-registration">{t("service.motor.firstReg")}</SelectItem>
                        <SelectItem value="ownership-transfer">{t("service.motor.transfer")}</SelectItem>
                        <SelectItem value="new-license">{t("service.motor.newLicense")}</SelectItem>
                        <SelectItem value="license-renewal">{t("service.motor.renewal")}</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.serviceType && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.serviceType}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {motorForm.serviceType && (
                    <>
                      {(motorForm.serviceType === "first-registration" ||
                        motorForm.serviceType === "ownership-transfer") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="vehicle-number">{t("form.vehicleNumber")}</Label>
                            <Input
                              id="vehicle-number"
                              placeholder="e.g., ABC-1234"
                              value={motorForm.vehicleNumber}
                              onChange={(e) => setMotorForm({ ...motorForm, vehicleNumber: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="chassis-number">{t("form.chassisNumber")}</Label>
                            <Input
                              id="chassis-number"
                              placeholder="Enter chassis number"
                              value={motorForm.chassisNumber}
                              onChange={(e) => setMotorForm({ ...motorForm, chassisNumber: e.target.value })}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="engine-number">{t("form.engineNumber")}</Label>
                            <Input
                              id="engine-number"
                              placeholder="Enter engine number"
                              value={motorForm.engineNumber}
                              onChange={(e) => setMotorForm({ ...motorForm, engineNumber: e.target.value })}
                            />
                          </div>
                        </div>
                      )}

                      {(motorForm.serviceType === "new-license" || motorForm.serviceType === "license-renewal") && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="license-class">{t("form.licenseClass")}</Label>
                            <Select
                              value={motorForm.licenseClass}
                              onValueChange={(value) => setMotorForm({ ...motorForm, licenseClass: value })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select license class" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="A">Class A - Motorcycle</SelectItem>
                                <SelectItem value="B">Class B - Light Vehicle</SelectItem>
                                <SelectItem value="C">Class C - Heavy Vehicle</SelectItem>
                                <SelectItem value="D">Class D - Passenger Vehicle</SelectItem>
                                <SelectItem value="G">Class G - Goods Vehicle</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {motorForm.serviceType === "license-renewal" && (
                            <div className="space-y-2">
                              <Label htmlFor="previous-license">{t("form.previousLicense")}</Label>
                              <Input
                                id="previous-license"
                                placeholder="Enter previous license number"
                                value={motorForm.previousLicenseNumber}
                                onChange={(e) => setMotorForm({ ...motorForm, previousLicenseNumber: e.target.value })}
                              />
                            </div>
                          )}
                        </div>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="motor-reason">{t("form.reason")}</Label>
                        <Textarea
                          id="motor-reason"
                          placeholder="Reason for application"
                          value={motorForm.reason}
                          onChange={(e) => setMotorForm({ ...motorForm, reason: e.target.value })}
                        />
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Submitting Application..." : t("common.submit")}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
