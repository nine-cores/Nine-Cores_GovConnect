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
import { Badge } from "@/components/ui/badge"
import { Car, CreditCard, History } from "lucide-react"
import DocumentSelector from "./DocumentSelector"

const MotorTrafficService = () => {
  const { t } = useLanguage()

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [previousRequests, setPreviousRequests] = useState<any[]>([])
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [selectedDocuments, setSelectedDocuments] = useState<Record<string, string>>({})

  const [motorForm, setMotorForm] = useState({
    serviceType: "",
    vehicleNumber: "",
    chassisNumber: "",
    engineNumber: "",
    licenseClass: "",
    previousLicenseNumber: "",
    reason: "",
  })

  useEffect(() => {
    fetchPreviousRequests()
  }, [])

  const fetchPreviousRequests = async () => {
    setLoadingHistory(true)
    try {
      const mockRequests = [
        {
          id: "MT001",
          type: "Vehicle Registration",
          serviceType: "first-registration",
          vehicleNumber: "ABC-1234",
          submittedDate: "2024-01-15",
          status: "Completed",
          completedDate: "2024-01-20",
        },
        {
          id: "MT002",
          type: "Driving License",
          serviceType: "license-renewal",
          licenseClass: "B",
          submittedDate: "2024-02-10",
          status: "In Progress",
          completedDate: null,
        },
        {
          id: "MT003",
          type: "Ownership Transfer",
          serviceType: "ownership-transfer",
          vehicleNumber: "XYZ-5678",
          submittedDate: "2024-03-05",
          status: "Pending",
          completedDate: null,
        },
      ]
      setPreviousRequests(mockRequests)
    } catch (error) {
      console.error("Error fetching previous requests:", error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Pending":
        return "outline"
      case "Rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const handleMotorTrafficSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    const newErrors: Record<string, string> = {}
    if (!motorForm.serviceType) newErrors.serviceType = "Service type is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      console.log("Motor Traffic application:", { ...motorForm, documents: selectedDocuments })
      alert(t("common.success"))
      setMotorForm({
        serviceType: "",
        vehicleNumber: "",
        chassisNumber: "",
        engineNumber: "",
        licenseClass: "",
        previousLicenseNumber: "",
        reason: "",
      })
      setSelectedDocuments({})
      fetchPreviousRequests()
    } catch (error) {
      console.error("Motor Traffic application error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDocumentSelect = (documentType: string, documentId: string) => {
    setSelectedDocuments((prev) => ({
      ...prev,
      [documentType]: documentId,
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => (window.location.href = "/")}
              className="text-emerald-600 hover:text-emerald-700 flex items-center gap-2"
            >
              ← {t("common.backToServices")}
            </button>
            <h1 className="text-xl font-semibold text-gray-900">{t("service.motorTraffic")}</h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        <Tabs defaultValue="vehicle" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="vehicle" className="flex items-center gap-2">
              <Car className="h-4 w-4" />
              {t("motorTraffic.vehicleServices")}
            </TabsTrigger>
            <TabsTrigger value="license" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              {t("motorTraffic.drivingLicense")}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              {t("common.requestHistory")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicle">
            <Card>
              <CardHeader>
                <CardTitle>{t("motorTraffic.vehicleServices")}</CardTitle>
                <CardDescription>Vehicle registration and ownership transfer services</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMotorTrafficSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vehicle-service-type">{t("form.selectService")}</Label>
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
                      </SelectContent>
                    </Select>
                    {errors.serviceType && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.serviceType}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {(motorForm.serviceType === "first-registration" ||
                    motorForm.serviceType === "ownership-transfer") && (
                    <>
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

                      <div className="space-y-2">
                        <Label htmlFor="vehicle-reason">{t("form.reason")}</Label>
                        <Textarea
                          id="vehicle-reason"
                          placeholder="Reason for application"
                          value={motorForm.reason}
                          onChange={(e) => setMotorForm({ ...motorForm, reason: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Required Documents:</h4>

                        <DocumentSelector
                          documentType="nic"
                          label="Valid National Identity Card"
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("nic", docId)}
                        />

                        <DocumentSelector
                          documentType="vehicle-permit"
                          label={
                            motorForm.serviceType === "first-registration"
                              ? "Vehicle Import Permit"
                              : "Previous Registration Certificate"
                          }
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("vehicle-permit", docId)}
                        />

                        <DocumentSelector
                          documentType="insurance"
                          label="Insurance Certificate"
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("insurance", docId)}
                        />

                        <DocumentSelector
                          documentType="revenue-license"
                          label="Revenue License"
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("revenue-license", docId)}
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Submitting Application..." : t("common.submit")}
                      </Button>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="license">
            <Card>
              <CardHeader>
                <CardTitle>{t("motorTraffic.drivingLicense")}</CardTitle>
                <CardDescription>New driving license and renewal services</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleMotorTrafficSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="license-service-type">{t("form.selectService")}</Label>
                    <Select
                      value={motorForm.serviceType}
                      onValueChange={(value) => setMotorForm({ ...motorForm, serviceType: value })}
                    >
                      <SelectTrigger className={errors.serviceType ? "border-destructive" : ""}>
                        <SelectValue placeholder={t("form.selectService")} />
                      </SelectTrigger>
                      <SelectContent>
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

                  {(motorForm.serviceType === "new-license" || motorForm.serviceType === "license-renewal") && (
                    <>
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

                      <div className="space-y-2">
                        <Label htmlFor="license-reason">{t("form.reason")}</Label>
                        <Textarea
                          id="license-reason"
                          placeholder="Reason for application"
                          value={motorForm.reason}
                          onChange={(e) => setMotorForm({ ...motorForm, reason: e.target.value })}
                        />
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-medium">Required Documents:</h4>

                        <DocumentSelector
                          documentType="nic"
                          label="Valid National Identity Card"
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("nic", docId)}
                        />

                        <DocumentSelector
                          documentType="medical-certificate"
                          label="Medical Certificate"
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("medical-certificate", docId)}
                        />

                        {motorForm.serviceType === "new-license" && (
                          <DocumentSelector
                            documentType="learners-permit"
                            label="Learner's Permit"
                            required={true}
                            onDocumentSelect={(docId) => handleDocumentSelect("learners-permit", docId)}
                          />
                        )}

                        {motorForm.serviceType === "license-renewal" && (
                          <DocumentSelector
                            documentType="previous-license"
                            label="Previous License"
                            required={true}
                            onDocumentSelect={(docId) => handleDocumentSelect("previous-license", docId)}
                          />
                        )}

                        <DocumentSelector
                          documentType="passport-photos"
                          label="Passport-size Photographs"
                          required={true}
                          onDocumentSelect={(docId) => handleDocumentSelect("passport-photos", docId)}
                        />
                      </div>

                      <Button type="submit" disabled={loading} className="w-full">
                        {loading ? "Submitting Application..." : t("common.submit")}
                      </Button>
                    </>
                  )}
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>{t("common.requestHistory")}</CardTitle>
                <CardDescription>View your previous Motor Traffic service requests</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingHistory ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading request history...</p>
                  </div>
                ) : previousRequests.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No previous requests found.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previousRequests.map((request) => (
                      <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="font-medium text-gray-900">#{request.id}</span>
                            <Badge variant={getStatusBadgeVariant(request.status)}>{request.status}</Badge>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(request.submittedDate).toLocaleDateString()}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Service Type:</span>
                            <p className="text-gray-600">{request.type}</p>
                          </div>

                          {request.vehicleNumber && (
                            <div>
                              <span className="font-medium text-gray-700">Vehicle Number:</span>
                              <p className="text-gray-600">{request.vehicleNumber}</p>
                            </div>
                          )}

                          {request.licenseClass && (
                            <div>
                              <span className="font-medium text-gray-700">License Class:</span>
                              <p className="text-gray-600">Class {request.licenseClass}</p>
                            </div>
                          )}

                          {request.completedDate && (
                            <div>
                              <span className="font-medium text-gray-700">Completed Date:</span>
                              <p className="text-gray-600">{new Date(request.completedDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>

                        {request.status === "Completed" && (
                          <div className="mt-3 pt-3 border-t">
                            <Button size="sm" variant="outline">
                              Download Certificate
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default MotorTrafficService
