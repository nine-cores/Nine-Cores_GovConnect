"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useLanguage } from "../contexts/LanguageContext"
import { Button } from "./ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card"
import { Badge } from "./ui/badge"
import { Alert, AlertDescription } from "./ui/alert"
import { FileText, Upload, Check, Plus, RefreshCw, AlertCircle } from "lucide-react"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
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

interface DocumentSelectorProps {
  documentType: "BirthCertificate" | "Policereport" | "NIC" | "Other"
  selectedDocument?: string | null
  onDocumentSelect: (documentId: string | null) => void
  required?: boolean
  label?: string
}

export default function DocumentSelector({
  documentType,
  selectedDocument,
  onDocumentSelect,
  required = false,
  label,
}: DocumentSelectorProps) {
  const { t } = useLanguage()
  const [showUpload, setShowUpload] = useState(false)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const userData = getUserData()
      if (!userData?.citizen?.nic) {
        setError("User not found")
        return
      }

      const response = await documentAPI.getCitizenDocuments(userData.citizen.nic)
      
      // Handle different response formats like in CitizenProfile
      let documentsArray = []
      if (response && Array.isArray(response)) {
        documentsArray = response
      } else if (response && response.documents && Array.isArray(response.documents)) {
        documentsArray = response.documents
      } else if (response && response.data && Array.isArray(response.data)) {
        documentsArray = response.data
      } else if (response && response.success && response.documents) {
        documentsArray = response.documents
      }
      
      if (documentsArray.length > 0) {
        const formattedDocs = documentsArray.map((doc: any) => ({
          id: doc.id || doc._id,
          type: doc.documentType || "Other",
          name: doc.originalName || doc.filename || doc.name || "Unknown Document",
          uploadDate: doc.uploadDate ? new Date(doc.uploadDate).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
          status: doc.status || "pending",
          size: doc.size ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB` : "Unknown",
          filename: doc.filename,
        }))
        
        setDocuments(formattedDocs)
      } else {
        setDocuments([])
      }
    } catch (error) {
      console.error("Error loading documents:", error)
      setError("Failed to load documents")
      setDocuments([])
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
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
        
        setShowUpload(false)
        
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
    } finally {
      setUploading(false)
    }
  }

  const relevantDocuments = documents.filter((doc) => doc.type === documentType)

  const getDocumentTypeLabel = (type: string) => {
    if (label) return label
    
    const typeLabels = {
      BirthCertificate: t("profile.birthCertificate"),
      Policereport: t("profile.policeReport"),
      NIC: t("profile.identityCard"),
      Other: t("profile.other"),
    }
    return typeLabels[type as keyof typeof typeLabels] || type.replace("_", " ")
  }

  const getStatusBadge = (status: Document["status"]) => {
    const statusConfig = {
      verified: { color: "bg-green-100 text-green-800", text: t("profile.verified") },
      pending: { color: "bg-yellow-100 text-yellow-800", text: t("profile.pending") },
      rejected: { color: "bg-red-100 text-red-800", text: t("profile.rejected") },
    }
    return statusConfig[status]
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>{getDocumentTypeLabel(documentType)}</span>
          <div className="flex items-center gap-2">
            {required && (
              <Badge variant="destructive" className="text-xs">
                Required
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={loadDocuments}
              disabled={loading}
            >
              <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Error and Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <Check className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {loading ? (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 mx-auto animate-spin mb-2" />
            <p className="text-sm text-gray-500">{t("common.loading")}</p>
          </div>
        ) : (
          <>
            {/* Previously Uploaded Documents Section */}
            {relevantDocuments.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-emerald-600" />
                  <Label className="text-sm font-medium text-emerald-700">{t("profile.selectFromUploaded")}</Label>
                </div>
                <div className="space-y-2 pl-6">
                  {relevantDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedDocument === doc.id
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-gray-200 hover:border-emerald-300 hover:shadow-sm"
                      }`}
                      onClick={() => onDocumentSelect(selectedDocument === doc.id ? null : doc.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                selectedDocument === doc.id ? "bg-emerald-100" : "bg-gray-100"
                              }`}
                            >
                              <FileText
                                className={`h-4 w-4 ${
                                  selectedDocument === doc.id ? "text-emerald-600" : "text-gray-500"
                                }`}
                              />
                            </div>
                            <div>
                              <p className="font-medium text-sm">{doc.name}</p>
                              <p className="text-xs text-gray-500">
                                {doc.size} • Uploaded {doc.uploadDate}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusBadge(doc.status).color}>
                              {getStatusBadge(doc.status).text}
                            </Badge>
                            {selectedDocument === doc.id && (
                              <div className="bg-emerald-500 rounded-full p-1">
                                <Check className="h-3 w-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Divider */}
            {relevantDocuments.length > 0 && (
              <div className="flex items-center space-x-4">
                <div className="flex-1 border-t border-gray-200"></div>
                <span className="text-xs text-gray-500 bg-white px-2">OR</span>
                <div className="flex-1 border-t border-gray-200"></div>
              </div>
            )}

            {/* Upload New Document Section */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Plus className="h-4 w-4 text-blue-600" />
                <Label className="text-sm font-medium text-blue-700">{t("profile.uploadNewDocument")}</Label>
              </div>

              <div className="pl-6">
                {!showUpload ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowUpload(true)}
                    className="w-full flex items-center justify-center space-x-2 border-dashed border-2 border-gray-300 hover:border-blue-400 hover:bg-blue-50 py-6"
                    disabled={uploading}
                  >
                    <Upload className="h-5 w-5 text-gray-400" />
                    <span className="text-gray-600">Click to upload {getDocumentTypeLabel(documentType)}</span>
                  </Button>
                ) : (
                  <div className="space-y-3 p-4 border-2 border-dashed border-blue-300 rounded-lg bg-blue-50">
                    <Label className="text-sm font-medium">Select file to upload:</Label>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.doc,.docx"
                      onChange={handleFileUpload}
                      className="w-full bg-white"
                      disabled={uploading}
                    />
                    <div className="flex justify-end space-x-2">
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowUpload(false)}
                        disabled={uploading}
                      >
                        {t("common.cancel")}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500">
                      Supported formats: PDF, JPG, PNG, GIF, Word (Max 10MB)
                    </p>
                    {uploading && (
                      <div className="flex items-center gap-2 text-blue-600">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        <span className="text-sm">{t("common.uploading")}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {relevantDocuments.length === 0 && !loading && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600">
                  No {getDocumentTypeLabel(documentType)?.toLowerCase() || "document"} found in your profile. Please upload
                  one to continue.
                </p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
