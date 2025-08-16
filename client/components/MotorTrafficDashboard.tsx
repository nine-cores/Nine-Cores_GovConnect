"use client"

import { useState, useEffect } from "react"
import { useLanguage } from "@/contexts/LanguageContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import {
  FileText,
  MessageSquare,
  Eye,
  AlertTriangle,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  Car,
  CreditCard,
  Users,
} from "lucide-react"

const MotorTrafficDashboard = () => {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("overview")
  const [appointments, setAppointments] = useState<any[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [communicationMessage, setCommunicationMessage] = useState("")

  useEffect(() => {
    setAppointments([
      {
        id: 1,
        citizenNic: "200123456789",
        citizenName: "Kamal Perera",
        appointmentDate: "2024-01-20",
        appointmentTime: "10:00 AM",
        serviceType: "New Driving License",
        status: "Document Review Pending",
        documents: [
          { name: "Medical Certificate", status: "Submitted", url: "/docs/medical.pdf" },
          { name: "Vision Test Report", status: "Missing", url: null },
          {
            name: "Application Form",
            status: "Needs Correction",
            url: "/docs/form.pdf",
            issue: "Signature missing on page 2",
          },
        ],
        communications: [
          { date: "2024-01-18", message: "Please complete the vision test and submit the report", sender: "staff" },
          { date: "2024-01-19", message: "I will complete the test tomorrow", sender: "citizen" },
        ],
      },
      {
        id: 2,
        citizenNic: "199987654321",
        citizenName: "Saman Silva",
        appointmentDate: "2024-01-21",
        appointmentTime: "2:00 PM",
        serviceType: "Vehicle Registration",
        status: "Documents Approved",
        documents: [
          { name: "Vehicle Import Permit", status: "Approved", url: "/docs/import.pdf" },
          { name: "Insurance Certificate", status: "Approved", url: "/docs/insurance.pdf" },
          { name: "Customs Clearance", status: "Approved", url: "/docs/customs.pdf" },
        ],
        communications: [],
      },
    ])
  }, [])

  const updateDocumentStatus = (appointmentId: number, documentName: string, newStatus: string, issue?: string) => {
    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              documents: appointment.documents.map((doc) =>
                doc.name === documentName ? { ...doc, status: newStatus, issue: issue || doc.issue } : doc,
              ),
            }
          : appointment,
      ),
    )
  }

  const sendCommunication = (appointmentId: number) => {
    if (!communicationMessage.trim()) return

    setAppointments((prev) =>
      prev.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              communications: [
                ...appointment.communications,
                {
                  date: new Date().toISOString().split("T")[0],
                  message: communicationMessage,
                  sender: "staff",
                },
              ],
            }
          : appointment,
      ),
    )
    setCommunicationMessage("")
  }

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>
      case "Submitted":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>
      case "Missing":
        return <Badge variant="destructive">Missing</Badge>
      case "Needs Correction":
        return <Badge className="bg-yellow-100 text-yellow-800">Needs Correction</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "Documents Approved":
        return <Badge className="bg-green-100 text-green-800">Documents Approved</Badge>
      case "Document Review Pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Review Pending</Badge>
      case "Confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <h1 className="text-xl font-semibold text-gray-900">{t("dashboard.motorTrafficDashboard")}</h1>
            <button onClick={() => (window.location.href = "/login")} className="text-red-600 hover:text-red-700">
              {t("common.logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.vehicleRegistrations")}</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.licenseApplications")}</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">18</div>
              <p className="text-xs text-muted-foreground">Pending review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.pendingApprovals")}</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Awaiting action</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{t("dashboard.completedToday")}</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Services completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Tabs with Document Review */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">{t("dashboard.overview")}</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="vehicles">{t("dashboard.vehicleManagement")}</TabsTrigger>
            <TabsTrigger value="licenses">{t("dashboard.licenseManagement")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.recentApplications")}</CardTitle>
                <CardDescription>Recent service applications and their status</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("forms.applicantName")}</TableHead>
                      <TableHead>{t("forms.serviceType")}</TableHead>
                      <TableHead>{t("forms.status")}</TableHead>
                      <TableHead>{t("forms.date")}</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {appointments.map((appointment) => (
                      <TableRow key={appointment.id}>
                        <TableCell className="font-medium">{appointment.citizenName}</TableCell>
                        <TableCell>{appointment.serviceType}</TableCell>
                        <TableCell>{getAppointmentStatusBadge(appointment.status)}</TableCell>
                        <TableCell>{appointment.appointmentDate}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => setActiveTab("appointments")}>
                            <Eye className="h-4 w-4 mr-1" />
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>Review appointments and verify submitted documents</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {appointments.map((appointment) => (
                    <Card key={appointment.id} className="border-l-4 border-l-emerald-500">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">{appointment.citizenName}</CardTitle>
                            <CardDescription>
                              {appointment.serviceType} • {appointment.appointmentDate} at {appointment.appointmentTime}
                            </CardDescription>
                          </div>
                          {getAppointmentStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Document Review Section */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Document Review
                            </h4>
                            <div className="space-y-3">
                              {appointment.documents.map((doc, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <FileText className="h-4 w-4 text-muted-foreground" />
                                    <div>
                                      <p className="font-medium">{doc.name}</p>
                                      {doc.issue && (
                                        <p className="text-sm text-red-600 flex items-center">
                                          <AlertTriangle className="h-3 w-3 mr-1" />
                                          {doc.issue}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {getDocumentStatusBadge(doc.status)}
                                    {doc.url && (
                                      <Button size="sm" variant="outline">
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    {doc.status === "Submitted" && (
                                      <div className="flex space-x-1">
                                        <Button
                                          size="sm"
                                          onClick={() => updateDocumentStatus(appointment.id, doc.name, "Approved")}
                                        >
                                          <CheckCircle className="h-4 w-4" />
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          onClick={() =>
                                            updateDocumentStatus(
                                              appointment.id,
                                              doc.name,
                                              "Needs Correction",
                                              "Please resubmit with corrections",
                                            )
                                          }
                                        >
                                          <XCircle className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Communication Section */}
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Communication
                            </h4>
                            <div className="space-y-3">
                              <div className="max-h-40 overflow-y-auto space-y-2">
                                {appointment.communications.map((comm, index) => (
                                  <div
                                    key={index}
                                    className={`p-2 rounded-lg text-sm ${
                                      comm.sender === "staff"
                                        ? "bg-emerald-100 text-emerald-800 ml-4"
                                        : "bg-gray-100 text-gray-800 mr-4"
                                    }`}
                                  >
                                    <p>{comm.message}</p>
                                    <p className="text-xs opacity-70 mt-1">{comm.date}</p>
                                  </div>
                                ))}
                              </div>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Type your message..."
                                  value={communicationMessage}
                                  onChange={(e) => setCommunicationMessage(e.target.value)}
                                  onKeyPress={(e) => e.key === "Enter" && sendCommunication(appointment.id)}
                                />
                                <Button onClick={() => sendCommunication(appointment.id)}>
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.vehicleManagement")}</CardTitle>
                <CardDescription>Manage vehicle registrations and transfers</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("dashboard.vehicleManagementDesc")}</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="licenses">
            <Card>
              <CardHeader>
                <CardTitle>{t("dashboard.licenseManagement")}</CardTitle>
                <CardDescription>Manage driving license applications and renewals</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{t("dashboard.licenseManagementDesc")}</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default MotorTrafficDashboard
