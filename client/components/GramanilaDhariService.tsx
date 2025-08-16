"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Calendar, CreditCard, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import DocumentSelector from "./DocumentSelector"
import { apiRequest } from "../lib/api"
import { toast } from "./ui/use-toast"

const GramanilaDhariService = () => {
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null
    message: string
  }>({ type: null, message: '' })

  // Certificate form state
  const [certificateForm, setCertificateForm] = useState({
    type: "",
    purpose: "",
    married: "",
    sriLankan: "",
    occupation: "",
    residencePeriod: "",
    fatherName: "",
    fatherAddress: "",
    motherName: "",
    appointmentId: "none", // Optional appointment selection
    selectedDocuments: {
      birthCertificate: null as string | null,
      nic: null as string | null,
    },
  })

  // NIC form state
  const [nicForm, setNicForm] = useState({
    applicationType: "",
    reason: "",
    selectedDocuments: {
      birthCertificate: null as string | null,
      studioSlip: null as string | null,
      previousNIC: null as string | null,
      policeReport: null as string | null,
    },
  })

  // Appointment form state
  const [appointmentForm, setAppointmentForm] = useState({
    date: "",
    timeSlotId: "",
    gnServiceId: "",
    purpose: "",
    description: "",
  })

  const [availableDates, setAvailableDates] = useState<string[]>([])
  const [availableTimes, setAvailableTimes] = useState<any[]>([])
  const [availableServices, setAvailableServices] = useState<any[]>([])
  const [myAppointments, setMyAppointments] = useState<any[]>([])
  const [loadingAvailability, setLoadingAvailability] = useState(false)
  const [loadingServices, setLoadingServices] = useState(false)
  const [loadingAppointments, setLoadingAppointments] = useState(false)

  // Mock data for certificates
  const [certificates] = useState([
    {
      id: 1,
      type: "Character Certificate",
      requestDate: "2024-01-10",
      status: "approved",
      downloadUrl: "#",
    },
    {
      id: 2,
      type: "Residence Certificate",
      requestDate: "2024-01-12",
      status: "processing",
      downloadUrl: null,
    },
  ])

  useEffect(() => {
    fetchAvailableDates()
    fetchAvailableServices()
    fetchMyAppointments()
  }, [])

  useEffect(() => {
    if (appointmentForm.date) {
      fetchAvailableTimes(appointmentForm.date)
    } else {
      setAvailableTimes([])
    }
  }, [appointmentForm.date])

  const fetchMyAppointments = async () => {
    setLoadingAppointments(true)
    try {
      // Try direct fetch first to debug
      const token = localStorage.getItem("authToken")
      
      const directResponse = await fetch("/api/v1/citizen-appointments/my-appointments", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      
      if (directResponse.ok) {
        const directData = await directResponse.json()
        
        // Handle the specific API response structure
        if (directData.statusCode === 200 && directData.data && Array.isArray(directData.data)) {
          setMyAppointments(directData.data)
        } else {
          setMyAppointments([])
        }
      } else {
        console.error("Direct fetch failed:", directResponse.statusText)
        setMyAppointments([])
      }
      
    } catch (error) {
      console.error("Error fetching appointments:", error)
      setMyAppointments([])
    } finally {
      setLoadingAppointments(false)
    }
  }

  const fetchAvailableServices = async () => {
    setLoadingServices(true)
    try {
      const result = await apiRequest("/citizen-appointments/services")
      
      if (result.statusCode === 200 && result.data) {
        setAvailableServices(result.data.filter((service: any) => service.isEnabled))
      } else {
        console.error("Failed to fetch available services:", result.message)
        setAvailableServices([])
      }
    } catch (error) {
      console.error("Error fetching available services:", error)
      setAvailableServices([])
    } finally {
      setLoadingServices(false)
    }
  }

  const fetchAvailableDates = async () => {
    setLoadingAvailability(true)
    try {
      const result = await apiRequest("/citizen-appointments/available-slots")
      
      if (result.statusCode === 200 && result.data) {
        // Extract unique dates from the available slots
        const uniqueDates = [...new Set(result.data.map((slot: any) => slot.availableDate))] as string[]
        setAvailableDates(uniqueDates.sort())
      } else {
        console.error("Failed to fetch available dates:", result.message)
        setAvailableDates([])
      }
    } catch (error) {
      console.error("Error fetching available dates:", error)
      setAvailableDates([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  const fetchAvailableTimes = async (selectedDate: string) => {
    setLoadingAvailability(true)
    try {
      const result = await apiRequest("/citizen-appointments/available-slots")
      
      if (result.statusCode === 200 && result.data) {
        // Filter slots for the selected date and format time slots
        const slotsForDate = result.data
          .filter((slot: any) => slot.availableDate === selectedDate && slot.status === "Available")
          .map((slot: any) => ({
            id: slot.gnAvailabilityId,
            time: `${slot.startTime.slice(0, 5)} - ${slot.endTime.slice(0, 5)}`,
            startTime: slot.startTime,
            endTime: slot.endTime,
            gnOfficer: slot.user.displayName,
          }))
        
        setAvailableTimes(slotsForDate)
      } else {
        console.error("Failed to fetch available times:", result.message)
        setAvailableTimes([])
      }
    } catch (error) {
      console.error("Error fetching available times:", error)
      setAvailableTimes([])
    } finally {
      setLoadingAvailability(false)
    }
  }

  const handleDateChange = (date: string) => {
    setAppointmentForm({
      ...appointmentForm,
      date: date,
      timeSlotId: "", // Reset time slot when date changes
    })
  }

  const handleCertificateRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setSubmitStatus({ type: null, message: '' })

    // Validation
    const newErrors: Record<string, string> = {}
    if (!certificateForm.type) newErrors.type = "Certificate type is required"
    if (!certificateForm.purpose) newErrors.purpose = "Purpose is required"
    if (!certificateForm.selectedDocuments.birthCertificate) newErrors.birthCertificate = "Birth certificate is required"
    if (!certificateForm.selectedDocuments.nic) newErrors.nic = "NIC copy is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      // Prepare certificate request data
      const requestData = {
        certificateType: certificateForm.type,
        purpose: certificateForm.purpose,
        personalDetails: {
          married: certificateForm.married,
          sriLankan: certificateForm.sriLankan,
          occupation: certificateForm.occupation,
          residencePeriod: certificateForm.residencePeriod,
          fatherName: certificateForm.fatherName,
          fatherAddress: certificateForm.fatherAddress,
          motherName: certificateForm.motherName,
        },
        documents: [
          certificateForm.selectedDocuments.birthCertificate,
          certificateForm.selectedDocuments.nic,
        ].filter(Boolean), // Remove null values
        appointmentId: certificateForm.appointmentId === "none" ? null : certificateForm.appointmentId, // Optional appointment linking
      }

      console.log("Submitting Certificate Request:", JSON.stringify(requestData, null, 2))

      // Call the actual API
      const response = await apiRequest("/certificate-requests", {
        method: "POST",
        body: JSON.stringify(requestData),
      })

      console.log("API Response:", response)

      // Check for success based on status code and message content
      if (response.statusCode === 201 || 
          (response.message && response.message.includes("successfully")) ||
          response.success === true) {
        // Success response
        setSubmitStatus({
          type: 'success',
          message: `Certificate request submitted successfully! ${response.data?.id ? `Request ID: ${response.data.id}` : ''}`
        })
        
        // Reset form on success
        setCertificateForm({
          type: "",
          purpose: "",
          married: "",
          sriLankan: "",
          occupation: "",
          residencePeriod: "",
          fatherName: "",
          fatherAddress: "",
          motherName: "",
          appointmentId: "none",
          selectedDocuments: {
            birthCertificate: null,
            nic: null,
          },
        })
      } else {
        // Handle error response from API
        console.error("API Error Response:", response)
        setSubmitStatus({
          type: 'error',
          message: response.message || "Failed to submit certificate request"
        })
      }
    } catch (error: any) {
      console.error("Certificate request error:", error)
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        response: error.response
      })
      
      // Show user-friendly error message
      setSubmitStatus({
        type: 'error',
        message: error.message || "Failed to submit certificate request"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleNICApplication = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!nicForm.applicationType) newErrors.applicationType = "Application type is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      toast({
        title: "Success",
        description: t("common.success"),
        variant: "default",
        duration: 3000,
      })
      setNicForm({
        applicationType: "",
        reason: "",
        selectedDocuments: {
          birthCertificate: null,
          studioSlip: null,
          previousNIC: null,
          policeReport: null,
        },
      })
    } catch (error) {
      console.error("NIC application error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAppointmentBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Prepare the appointment booking data
      const bookingData = {
        gnServiceId: appointmentForm.gnServiceId,
        purpose: appointmentForm.purpose,
        availabilityId: parseInt(appointmentForm.timeSlotId)
      }
      
      const result = await apiRequest("/citizen-appointments/appointments", {
        method: "POST",
        body: JSON.stringify(bookingData)
      })
      
      if (result.success) {
        toast({
          title: "Success",
          description: t("common.success"),
          variant: "default",
          duration: 3000,
        })
        setAppointmentForm({
          date: "",
          timeSlotId: "",
          gnServiceId: "",
          purpose: "",
          description: "",
        })
        // Refresh appointments list and availability
        fetchMyAppointments()
        fetchAvailableDates()
      } else {
        toast({
          title: "Booking Failed",
          description: result.message || "Booking failed",
          variant: "destructive",
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Appointment booking error:", error)
      toast({
        title: "Error",
        description: "An error occurred while booking the appointment",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-primary font-semibold flex items-center gap-2"
            >
              ← {t("common.backToServices")}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{t("services.gramaniladhari")}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        <Tabs defaultValue="appointments" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="appointments" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t("citizen.appointments")}
            </TabsTrigger>
            <TabsTrigger value="certificates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("citizen.certificates")}
            </TabsTrigger>
            <TabsTrigger value="request" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t("citizen.requestCertificate")}
            </TabsTrigger>
            <TabsTrigger value="nic" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("service.nic")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>{t("citizen.bookAppointment")}</CardTitle>
                  <CardDescription>{t("form.scheduleGramaniladhari")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAppointmentBooking} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="service">{t("form.selectService")}</Label>
                      <Select
                        value={appointmentForm.gnServiceId}
                        onValueChange={(value) => setAppointmentForm({ ...appointmentForm, gnServiceId: value })}
                        disabled={loadingServices}
                      >
                        <SelectTrigger>
                          <SelectValue
                            placeholder={loadingServices ? "Loading services..." : "Select a service"}
                          />
                        </SelectTrigger>
                        <SelectContent>
                          {availableServices.map((service) => (
                            <SelectItem key={service.gnServiceId} value={service.gnServiceId}>
                              <div className="flex flex-col">
                                <span className="font-medium">{service.serviceName}</span>
                                <span className="text-xs text-gray-500">{service.description}</span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {availableServices.length === 0 && !loadingServices && (
                        <p className="text-sm text-muted-foreground">No services available</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="purpose">{t("form.purpose")}</Label>
                      <Input
                        id="purpose"
                        placeholder="Enter the purpose for your appointment"
                        value={appointmentForm.purpose}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, purpose: e.target.value })}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">{t("form.date")}</Label>
                        <Select
                          value={appointmentForm.date}
                          onValueChange={handleDateChange}
                          disabled={loadingAvailability}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={loadingAvailability ? t("form.loadingDates") : t("form.selectAvailableDate")}
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableDates.map((date) => {
                              const dateObj = new Date(date)
                              const formattedDate = dateObj.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })
                              return (
                                <SelectItem key={date} value={date}>
                                  {formattedDate}
                                </SelectItem>
                              )
                            })}
                          </SelectContent>
                        </Select>
                        {availableDates.length === 0 && !loadingAvailability && (
                          <p className="text-sm text-muted-foreground">{t("form.noAvailableDates")}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="time">{t("form.time")}</Label>
                        <Select
                          value={appointmentForm.timeSlotId}
                          onValueChange={(value) => setAppointmentForm({ ...appointmentForm, timeSlotId: value })}
                          disabled={!appointmentForm.date || loadingAvailability}
                        >
                          <SelectTrigger>
                            <SelectValue
                              placeholder={
                                !appointmentForm.date
                                  ? t("form.selectDateFirst")
                                  : loadingAvailability
                                    ? t("form.loadingTimes")
                                    : t("form.selectAvailableTime")
                              }
                            />
                          </SelectTrigger>
                          <SelectContent>
                            {availableTimes.map((timeSlot) => (
                              <SelectItem key={timeSlot.id} value={timeSlot.id.toString()}>
                                <div className="flex flex-col">
                                  <span>{timeSlot.time}</span>
                                  <span className="text-xs text-gray-500">with {timeSlot.gnOfficer}</span>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {appointmentForm.date && availableTimes.length === 0 && !loadingAvailability && (
                          <p className="text-sm text-muted-foreground">{t("form.noAvailableTimes")}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">{t("form.description")}</Label>
                      <Textarea
                        id="description"
                        placeholder={t("form.additionalDetails")}
                        value={appointmentForm.description}
                        onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })}
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={loading || !appointmentForm.gnServiceId || !appointmentForm.purpose || !appointmentForm.date || !appointmentForm.timeSlotId}
                      className="w-full"
                    >
                      {loading ? t("form.booking") : t("citizen.bookAppointment")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>{t("citizen.appointmentHistory")}</CardTitle>
                  <CardDescription>{t("form.scheduledPastAppointments")}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {loadingAppointments ? (
                      <div className="text-center py-4">
                        <p className="text-sm text-muted-foreground">Loading appointments...</p>
                      </div>
                    ) : myAppointments && myAppointments.length > 0 ? (
                      myAppointments.map((appointment: any) => {
                        // Check for the actual field names from your API
                        if (!appointment || !appointment.gnAppointmentId) {
                          return null
                        }
                        
                        // Map the API fields to display values
                        let formattedDate = 'Date not available'
                        let timeSlot = 'Time not available'
                        
                        if (appointment.appointmentDate) {
                          const appointmentDate = new Date(appointment.appointmentDate)
                          formattedDate = appointmentDate.toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        }
                        
                        if (appointment.startTime && appointment.endTime) {
                          timeSlot = `${appointment.startTime.slice(0, 5)} - ${appointment.endTime.slice(0, 5)}`
                        }
                        
                        const getStatusColor = (status: string) => {
                          switch (status.toLowerCase()) {
                            case 'confirmed': return 'default'
                            case 'completed': return 'default'
                            case 'pending': return 'secondary'
                            case 'cancelled': return 'destructive'
                            default: return 'secondary'
                          }
                        }

                        return (
                          <div key={appointment.gnAppointmentId} className="border rounded-lg p-4 space-y-3">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-medium text-lg">{appointment.gnService?.serviceName || 'Unknown Service'}</h4>
                                <p className="text-sm text-muted-foreground">{appointment.gnService?.description || 'No description'}</p>
                              </div>
                              <Badge variant={getStatusColor(appointment.status || 'pending')}>
                                {appointment.status || 'PENDING'}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>{formattedDate} at {timeSlot}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>ID: {appointment.gnAppointmentId}</span>
                              </div>
                            </div>
                            
                            <div className="border-t pt-2">
                              <p className="text-sm">
                                <span className="font-medium">Purpose:</span> {appointment.purpose || 'No purpose specified'}
                              </p>
                              <p className="text-sm text-muted-foreground mt-1">
                                <span className="font-medium">GN Officer:</span> {appointment.user?.displayName || 'Not assigned'}
                              </p>
                            </div>
                          </div>
                        )
                      }).filter(Boolean) // Remove any null entries
                    ) : (
                      <div className="text-center py-8">
                        <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">No appointments found</p>
                        <p className="text-sm text-muted-foreground">Book your first appointment above</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>{t("citizen.certificateHistory")}</CardTitle>
                <CardDescription>{t("form.trackCertificateRequests")}</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("form.certificateType")}</TableHead>
                      <TableHead>{t("form.requestDate")}</TableHead>
                      <TableHead>{t("form.status")}</TableHead>
                      <TableHead>{t("form.actions")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificates.map((cert) => (
                      <TableRow key={cert.id}>
                        <TableCell className="font-medium">{cert.type}</TableCell>
                        <TableCell>{cert.requestDate}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              cert.status === "approved"
                                ? "default"
                                : cert.status === "processing"
                                  ? "secondary"
                                  : "destructive"
                            }
                          >
                            {cert.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                            {cert.status === "processing" && <Clock className="h-3 w-3 mr-1" />}
                            {cert.status === "rejected" && <XCircle className="h-3 w-3 mr-1" />}
                            {cert.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {cert.status === "approved" && cert.downloadUrl && (
                            <Button size="sm" variant="outline">
                              {t("common.download")}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="request">
            <Card>
              <CardHeader>
                <CardTitle>{t("citizen.requestNewCertificate")}</CardTitle>
                <CardDescription>{t("form.applyForCertificates")}</CardDescription>
              </CardHeader>
              <CardContent>
                {submitStatus.type && (
                  <Alert variant={submitStatus.type === 'success' ? 'default' : 'destructive'} className="mb-4">
                    <AlertDescription>{submitStatus.message}</AlertDescription>
                  </Alert>
                )}
                <form onSubmit={handleCertificateRequest} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="cert-type">{t("form.certificateType")}</Label>
                      <Select
                        value={certificateForm.type}
                        onValueChange={(value) => setCertificateForm({ ...certificateForm, type: value })}
                      >
                        <SelectTrigger className={errors.type ? "border-destructive" : ""}>
                          <SelectValue placeholder={t("form.selectCertificateType")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="character">{t("certificate.character")}</SelectItem>
                          <SelectItem value="residence">{t("certificate.residence")}</SelectItem>
                          <SelectItem value="income">{t("certificate.income")}</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.type && (
                        <Alert variant="destructive">
                          <AlertDescription>{t("form.certificateTypeRequired")}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cert-purpose">{t("form.purpose")}</Label>
                      <Input
                        id="cert-purpose"
                        placeholder={t("form.purposePlaceholder")}
                        value={certificateForm.purpose}
                        onChange={(e) => setCertificateForm({ ...certificateForm, purpose: e.target.value })}
                        className={errors.purpose ? "border-destructive" : ""}
                      />
                      {errors.purpose && (
                        <Alert variant="destructive">
                          <AlertDescription>{t("form.purposeRequired")}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="appointment-select">Select Appointment (Optional)</Label>
                      <Select
                        value={String(certificateForm.appointmentId)}
                        onValueChange={(value) => setCertificateForm({ ...certificateForm, appointmentId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select an existing appointment (optional)" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">No appointment selected</SelectItem>
                          {myAppointments && myAppointments.length > 0 ? (
                            myAppointments.map((appointment: any) => {
                              const appointmentId = String(appointment.gnAppointmentId) // Convert to string
                              const displayText = `${appointment.gnService?.serviceName || 'Unknown Service'} - ${appointment.appointmentDate} at ${appointment.startTime}`
                              return (
                                <SelectItem key={appointmentId} value={appointmentId}>
                                  {displayText}
                                </SelectItem>
                              )
                            })
                          ) : (
                            <SelectItem value="no-appointments" disabled>No appointments available</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        {myAppointments && myAppointments.length > 0 
                          ? "You can link this certificate request to an existing appointment"
                          : "No appointments available to link. You can create one in the Appointment Booking section."
                        }
                      </p>
                    </div>
                  </div>

                  {/* Additional fields for character certificate */}
                  {certificateForm.type === "character" && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>{t("form.maritalStatus")}</Label>
                          <Select
                            value={certificateForm.married}
                            onValueChange={(value) => setCertificateForm({ ...certificateForm, married: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("form.selectMaritalStatus")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="married">{t("marital.married")}</SelectItem>
                              <SelectItem value="unmarried">{t("marital.unmarried")}</SelectItem>
                              <SelectItem value="divorced">{t("marital.divorced")}</SelectItem>
                              <SelectItem value="widowed">{t("marital.widowed")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label>{t("form.sriLankanCitizen")}</Label>
                          <Select
                            value={certificateForm.sriLankan}
                            onValueChange={(value) => setCertificateForm({ ...certificateForm, sriLankan: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={t("form.selectCitizenship")} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">{t("common.yes")}</SelectItem>
                              <SelectItem value="no">{t("common.no")}</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="occupation">{t("form.occupation")}</Label>
                          <Input
                            id="occupation"
                            placeholder={t("form.enterOccupation")}
                            value={certificateForm.occupation}
                            onChange={(e) => setCertificateForm({ ...certificateForm, occupation: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="residence-period">{t("form.residencePeriod")}</Label>
                          <Input
                            id="residence-period"
                            placeholder={t("form.residencePeriodPlaceholder")}
                            value={certificateForm.residencePeriod}
                            onChange={(e) =>
                              setCertificateForm({ ...certificateForm, residencePeriod: e.target.value })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="father-name">{t("form.fatherName")}</Label>
                          <Input
                            id="father-name"
                            placeholder={t("form.enterFatherName")}
                            value={certificateForm.fatherName}
                            onChange={(e) => setCertificateForm({ ...certificateForm, fatherName: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="mother-name">{t("form.motherName")}</Label>
                          <Input
                            id="mother-name"
                            placeholder={t("form.enterMotherName")}
                            value={certificateForm.motherName}
                            onChange={(e) => setCertificateForm({ ...certificateForm, motherName: e.target.value })}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="father-address">{t("form.fatherAddress")}</Label>
                        <Input
                          id="father-address"
                          placeholder={t("form.enterFatherAddress")}
                          value={certificateForm.fatherAddress}
                          onChange={(e) => setCertificateForm({ ...certificateForm, fatherAddress: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <Label>{t("form.requiredDocuments")}</Label>
                        <div className="space-y-4">
                          <DocumentSelector
                            documentType="BirthCertificate"
                            onDocumentSelect={(docId) =>
                              setCertificateForm({
                                ...certificateForm,
                                selectedDocuments: {
                                  ...certificateForm.selectedDocuments,
                                  birthCertificate: docId,
                                },
                              })
                            }
                            selectedDocument={certificateForm.selectedDocuments.birthCertificate}
                            required={true}
                            label={t("profile.birthCertificate")}
                          />

                          <DocumentSelector
                            documentType="NIC"
                            onDocumentSelect={(docId) =>
                              setCertificateForm({
                                ...certificateForm,
                                selectedDocuments: {
                                  ...certificateForm.selectedDocuments,
                                  nic: docId,
                                },
                              })
                            }
                            selectedDocument={certificateForm.selectedDocuments.nic}
                            required={true}
                            label="National Identity Card"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? t("form.submittingRequest") : t("common.submit")}
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
                <CardDescription>{t("service.nic.applyDescription")}</CardDescription>
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
                        <AlertDescription>{t("form.applicationTypeRequired")}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {nicForm.applicationType && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="nic-reason">{t("form.reason")}</Label>
                        <Textarea
                          id="nic-reason"
                          placeholder={t("form.reasonForApplication")}
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

                        <div className="space-y-4">
                          <DocumentSelector
                            documentType="BirthCertificate"
                            onDocumentSelect={(docId) =>
                              setNicForm({
                                ...nicForm,
                                selectedDocuments: {
                                  ...nicForm.selectedDocuments,
                                  birthCertificate: docId,
                                },
                              })
                            }
                            selectedDocument={nicForm.selectedDocuments.birthCertificate}
                          />

                          <DocumentSelector
                            documentType="Other"
                            onDocumentSelect={(docId) =>
                              setNicForm({
                                ...nicForm,
                                selectedDocuments: {
                                  ...nicForm.selectedDocuments,
                                  studioSlip: docId,
                                },
                              })
                            }
                            selectedDocument={nicForm.selectedDocuments.studioSlip}
                          />

                          {nicForm.applicationType === "remake" && (
                            <DocumentSelector
                              documentType="NIC"
                              onDocumentSelect={(docId) =>
                                setNicForm({
                                  ...nicForm,
                                  selectedDocuments: {
                                    ...nicForm.selectedDocuments,
                                    previousNIC: docId,
                                  },
                                })
                              }
                              selectedDocument={nicForm.selectedDocuments.previousNIC}
                            />
                          )}

                          {nicForm.applicationType === "lost" && (
                            <DocumentSelector
                              documentType="Policereport"
                              onDocumentSelect={(docId) =>
                                setNicForm({
                                  ...nicForm,
                                  selectedDocuments: {
                                    ...nicForm.selectedDocuments,
                                    policeReport: docId,
                                  },
                                })
                              }
                              selectedDocument={nicForm.selectedDocuments.policeReport}
                            />
                          )}
                        </div>
                      </div>

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? t("form.submittingApplication") : t("common.submit")}
                      </Button>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default GramanilaDhariService
