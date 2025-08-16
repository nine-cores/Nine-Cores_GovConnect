"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Badge } from "./ui/badge"
import { ArrowLeft, Upload, Download, Eye, Trash2, User, Settings, FileText, Camera, AlertCircle, RefreshCw } from "lucide-react"
import { Alert, AlertDescription } from "./ui/alert"
import Link from "next/link"
import { documentAPI } from "../lib/api"
import { getUserData } from "../lib/utils"

interface Document {
  id: string
  type: "BirthCertificate" | "Policereport" | "NIC" | "Other"
  name: string
  uploadDate: string
  status: "verified" | "pending" | "rejected"
  size: string
  filename?: string
}

interface CitizenProfile {
  nic: string
  name: {
    sinhala: string
    english: string
    tamil: string
  }
  email: string
  phone: string
  address: {
    street: string
    city: string
    district: string
    postalCode: string
  }
  birthday: string
  gender: string
  profilePicture?: string
}

export default function CitizenProfile() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [profile, setProfile] = useState<CitizenProfile>({
    nic: "199512345678",
    name: {
      sinhala: "ආරියසිංහ මුදියන්සේලාගේ ජනක බන්ඩාර",
      english: "Janaka Bandara Ariyasinghe",
      tamil: "",
    },
    email: "janaka.bandara@email.com",
    phone: "+94771234567",
    address: {
      street: "123, Main Street",
      city: "Colombo",
      district: "Colombo",
      postalCode: "00300",
    },
    birthday: "1995-05-12",
    gender: "Male",
  })

  useEffect(() => {
    loadUserProfile()
    loadDocuments()
  }, [])

  const loadUserProfile = () => {
    // Load user profile from localStorage or API
    const userData = getUserData()
    if (userData?.citizen) {
      setProfile(prev => ({
        ...prev,
        nic: userData.citizen?.nic || prev.nic,
        name: {
          ...prev.name,
          english: userData.citizen?.displayName || prev.name.english,
        },
        email: userData.citizen?.email || prev.email,
      }))
    }
  }

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = getUserData()
      if (!userData?.citizen?.nic) {
        setError("User NIC not found. Please log in again.")
        return
      }

      const response = await documentAPI.getCitizenDocuments(userData.citizen.nic)
      
      console.log("Documents response:", response)
      
      // Handle different response formats
      let documents = []
      if (response && Array.isArray(response)) {
        // Direct array response
        documents = response
      } else if (response && response.documents && Array.isArray(response.documents)) {
        // Response with documents property
        documents = response.documents
      } else if (response && response.data && Array.isArray(response.data)) {
        // Response with data property
        documents = response.data
      } else if (response && response.success && response.documents) {
        // Success response with documents
        documents = response.documents
      }
      
      if (documents.length > 0) {
        const formattedDocs = documents.map((doc: any) => ({
          id: doc.id || doc._id,
          type: doc.documentType || "Other",
          name: doc.originalName || doc.filename || doc.name || "Unknown Document",
          uploadDate: doc.uploadDate ? new Date(doc.uploadDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          status: doc.status || "pending",
          size: doc.size ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB` : "Unknown",
          filename: doc.filename,
        }))
        
        setDocuments(formattedDocs)
        console.log("Formatted documents:", formattedDocs)
      } else {
        // No documents found
        setDocuments([])
        console.log("No documents found")
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      setError("Failed to load documents. Please try again.")
      setDocuments([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const forceRefreshDocuments = async () => {
    console.log("Force refreshing documents...")
    setError(null)
    setSuccess(null)
    await loadDocuments()
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, documentType: string) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (!allowedTypes.includes(file.type)) {
      setError("Only PDF, JPEG, PNG, GIF, and Word documents are allowed")
      return
    }

    try {
      setUploading(true)
      setError(null)
      setSuccess(null)

      const userData = getUserData()
      if (!userData?.citizen?.nic) {
        setError("User NIC not found")
        return
      }

      const response = await documentAPI.uploadDocument(userData.citizen.nic, file, documentType)
      
      console.log("Upload response:", response)
      
      // Handle different upload response formats
      const isSuccess = response && (
        response.success === true || 
        response.status === 'success' || 
        response.message?.includes('success') ||
        (response.data && response.data.success) ||
        response.statusCode === 200 ||
        response.statusCode === 201
      )
      
      if (isSuccess) {
        setSuccess(`Document uploaded successfully: ${file.name}`)
        
        // Clear the file input
        if (event.target) {
          event.target.value = ""
        }
        
        // Refresh the documents list
        await loadDocuments()
        
        // Auto-clear success message after 3 seconds
        setTimeout(() => setSuccess(null), 3000)
      } else {
        const errorMessage = response?.message || response?.error || "Unknown error occurred"
        setError("Upload failed: " + errorMessage)
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError(`Failed to upload document: ${error instanceof Error ? error.message : "Unknown error"}`)
      
      // Still try to refresh documents in case the upload actually succeeded
      try {
        await loadDocuments()
      } catch (refreshError) {
        console.error("Failed to refresh documents after upload error:", refreshError)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteDocument = async (documentId: string) => {
    try {
      setError(null)
      await documentAPI.deleteDocument(documentId)
      setSuccess("Document deleted successfully")
      await loadDocuments() // Refresh the documents list
    } catch (error) {
      console.error("Delete error:", error)
      setError("Failed to delete document")
    }
  }

  const handleDownloadDocument = async (documentId: string, filename: string) => {
    try {
      setError(null)
      const blob = await documentAPI.downloadDocument(documentId)
      
      // Create download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error("Download error:", error)
      setError("Failed to download document")
    }
  }

  const handleViewDocument = (documentId: string) => {
    // Open document in new tab for viewing
    const fileUrl = documentAPI.getFileUrl(documentId)
    window.open(fileUrl, '_blank')
  }

  const handleSaveProfile = () => {
    // API call to save profile
    console.log(" Saving profile:", profile)
    setIsEditing(false)
  }

  const getStatusBadge = (status: Document["status"]) => {
    const statusConfig = {
      verified: { color: "bg-green-100 text-green-800", text: t("profile.verified") },
      pending: { color: "bg-yellow-100 text-yellow-800", text: t("profile.pending") },
      rejected: { color: "bg-red-100 text-red-800", text: t("profile.rejected") },
    }
    return statusConfig[status]
  }

  const getDocumentTypeLabel = (type: Document["type"]) => {
    const typeLabels = {
      BirthCertificate: t("profile.birthCertificate"),
      Policereport: t("profile.policeReport"),
      NIC: t("profile.identityCard"),
      Other: t("profile.other"),
    }
    return typeLabels[type] || t("profile.other")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/services/gramaniladhari" className="flex items-center text-gray-600 hover:text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                {t("common.backToServices")}
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <h1 className="text-xl font-semibold text-gray-900">{t("profile.myProfile")}</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>{t("profile.personalInfo")}</span>
            </TabsTrigger>
            <TabsTrigger value="documents" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>{t("profile.documents")}</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Settings className="h-4 w-4" />
              <span>{t("profile.settings")}</span>
            </TabsTrigger>
          </TabsList>

          {/* Personal Information Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{t("profile.personalInfo")}</CardTitle>
                    <CardDescription>{t("profile.personalInfoDesc")}</CardDescription>
                  </div>
                  <Button
                    variant={isEditing ? "default" : "outline"}
                    onClick={() => (isEditing ? handleSaveProfile() : setIsEditing(true))}
                  >
                    {isEditing ? t("common.save") : t("common.edit")}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Profile Picture */}
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center">
                      {profile.profilePicture ? (
                        <img
                          src={profile.profilePicture || "/placeholder.svg"}
                          alt="Profile"
                          className="w-24 h-24 rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-12 w-12 text-gray-400" />
                      )}
                    </div>
                    {isEditing && (
                      <button className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-2 hover:bg-emerald-700">
                        <Camera className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">{profile.name.english}</h3>
                    <p className="text-sm text-gray-500">{profile.nic}</p>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="nameEnglish">{t("profile.nameEnglish")}</Label>
                    <Input
                      id="nameEnglish"
                      value={profile.name.english}
                      onChange={(e) => setProfile({ ...profile, name: { ...profile.name, english: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nameSinhala">{t("profile.nameSinhala")}</Label>
                    <Input
                      id="nameSinhala"
                      value={profile.name.sinhala}
                      onChange={(e) => setProfile({ ...profile, name: { ...profile.name, sinhala: e.target.value } })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">{t("profile.email")}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">{t("profile.phone")}</Label>
                    <Input
                      id="phone"
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="birthday">{t("profile.birthday")}</Label>
                    <Input
                      id="birthday"
                      type="date"
                      value={profile.birthday}
                      onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">{t("profile.gender")}</Label>
                    <Input
                      id="gender"
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="space-y-4">
                  <h4 className="text-lg font-medium">{t("profile.address")}</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="street">{t("profile.street")}</Label>
                      <Input
                        id="street"
                        value={profile.address.street}
                        onChange={(e) =>
                          setProfile({ ...profile, address: { ...profile.address, street: e.target.value } })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="city">{t("profile.city")}</Label>
                      <Input
                        id="city"
                        value={profile.address.city}
                        onChange={(e) =>
                          setProfile({ ...profile, address: { ...profile.address, city: e.target.value } })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="district">{t("profile.district")}</Label>
                      <Input
                        id="district"
                        value={profile.address.district}
                        onChange={(e) =>
                          setProfile({ ...profile, address: { ...profile.address, district: e.target.value } })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="postalCode">{t("profile.postalCode")}</Label>
                      <Input
                        id="postalCode"
                        value={profile.address.postalCode}
                        onChange={(e) =>
                          setProfile({ ...profile, address: { ...profile.address, postalCode: e.target.value } })
                        }
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.documentManagement")}</CardTitle>
                <CardDescription>{t("profile.documentManagementDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Error and Success Messages */}
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                {success && (
                  <Alert className="border-green-200 bg-green-50">
                    <AlertCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">{success}</AlertDescription>
                  </Alert>
                )}

                {/* Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>{t("profile.uploadBirthCertificate")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "BirthCertificate")}
                        className="hidden"
                        id="birth-cert-upload"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("birth-cert-upload")?.click()}
                        className="flex items-center space-x-2"
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? t("common.uploading") : t("profile.uploadFile")}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.uploadPoliceReport")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "Policereport")}
                        className="hidden"
                        id="police-report-upload"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("police-report-upload")?.click()}
                        className="flex items-center space-x-2"
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? t("common.uploading") : t("profile.uploadFile")}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.uploadNIC")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "NIC")}
                        className="hidden"
                        id="nic-upload"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("nic-upload")?.click()}
                        className="flex items-center space-x-2"
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? t("common.uploading") : t("profile.uploadFile")}</span>
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>{t("profile.uploadOther")}</Label>
                    <div className="flex items-center space-x-2">
                      <Input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, "Other")}
                        className="hidden"
                        id="other-upload"
                        disabled={uploading}
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById("other-upload")?.click()}
                        className="flex items-center space-x-2"
                        disabled={uploading}
                      >
                        <Upload className="h-4 w-4" />
                        <span>{uploading ? t("common.uploading") : t("profile.uploadFile")}</span>
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Documents List */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-medium">{t("profile.uploadedDocuments")}</h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={forceRefreshDocuments}
                      disabled={loading}
                      className="flex items-center gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                      {t("common.refresh")}
                    </Button>
                  </div>
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">
                      <RefreshCw className="h-8 w-8 mx-auto mb-4 animate-spin" />
                      <p>{t("common.loading")}</p>
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>{t("profile.noDocuments")}</p>
                      <p className="text-xs mt-2">Debug: Documents array length: {documents.length}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center space-x-4">
                            <FileText className="h-8 w-8 text-gray-400" />
                            <div>
                              <p className="font-medium">{doc.name}</p>
                              <p className="text-sm text-gray-500">
                                {getDocumentTypeLabel(doc.type)} • {doc.size} • {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <Badge className={getStatusBadge(doc.status).color}>
                              {getStatusBadge(doc.status).text}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewDocument(doc.filename || doc.id)}
                                title="View document"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDownloadDocument(doc.id, doc.name)}
                                title="Download document"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600 hover:text-red-700"
                                title="Delete document"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("profile.accountSettings")}</CardTitle>
                <CardDescription>{t("profile.accountSettingsDesc")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t("profile.changePassword")}</h4>
                      <p className="text-sm text-gray-500">{t("profile.changePasswordDesc")}</p>
                    </div>
                    <Button variant="outline">{t("profile.change")}</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t("profile.notifications")}</h4>
                      <p className="text-sm text-gray-500">{t("profile.notificationsDesc")}</p>
                    </div>
                    <Button variant="outline">{t("profile.manage")}</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{t("profile.privacy")}</h4>
                      <p className="text-sm text-gray-500">{t("profile.privacyDesc")}</p>
                    </div>
                    <Button variant="outline">{t("profile.manage")}</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
