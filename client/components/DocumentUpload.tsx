"use client"

import React, { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"
import { Upload, AlertCircle, CheckCircle } from "lucide-react"
import { useLanguage } from "../contexts/LanguageContext"
import { documentAPI } from "../lib/api"
import { getUserData } from "../lib/utils"

interface DocumentUploadProps {
  onUploadSuccess?: (document: any) => void
  allowedTypes?: string[]
  documentTypeFilter?: string[]
  showDocumentTypeSelector?: boolean
  className?: string
}

const documentTypes = [
  { value: "BirthCertificate", label: "Birth Certificate" },
  { value: "Policereport", label: "Police Report" },
  { value: "NIC", label: "National Identity Card" },
  { value: "Other", label: "Other" },
]

export default function DocumentUpload({
  onUploadSuccess,
  allowedTypes = [".pdf", ".jpg", ".jpeg", ".png", ".gif", ".doc", ".docx"],
  documentTypeFilter,
  showDocumentTypeSelector = true,
  className = "",
}: DocumentUploadProps) {
  const { t } = useLanguage()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [documentType, setDocumentType] = useState<string>("")
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const filteredDocumentTypes = documentTypeFilter
    ? documentTypes.filter(type => documentTypeFilter.includes(type.value))
    : documentTypes

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB")
      return
    }

    // Validate file type
    const allowedMimeTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]
    
    if (!allowedMimeTypes.includes(file.type)) {
      setError("Only PDF, JPEG, PNG, GIF, and Word documents are allowed")
      return
    }

    setSelectedFile(file)
    setError(null)
    setSuccess(null)
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload")
      return
    }

    if (showDocumentTypeSelector && !documentType) {
      setError("Please select a document type")
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

      const response = await documentAPI.uploadDocument(
        userData.citizen.nic,
        selectedFile,
        showDocumentTypeSelector && documentType ? documentType : "Other"
      )

      if (response.success) {
        setSuccess("Document uploaded successfully")
        setSelectedFile(null)
        setDocumentType("")
        
        // Clear file input
        const fileInput = document.getElementById("document-upload-input") as HTMLInputElement
        if (fileInput) {
          fileInput.value = ""
        }

        // Notify parent component
        if (onUploadSuccess) {
          onUploadSuccess(response.document)
        }
      }
    } catch (error) {
      console.error("Upload error:", error)
      setError("Failed to upload document. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="space-y-2">
        <Label htmlFor="document-upload-input">Select Document</Label>
        <Input
          id="document-upload-input"
          type="file"
          accept={allowedTypes.join(",")}
          onChange={handleFileSelect}
          disabled={uploading}
        />
        {selectedFile && (
          <p className="text-sm text-gray-600">
            Selected: {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(1)} MB)
          </p>
        )}
      </div>

      {showDocumentTypeSelector && (
        <div className="space-y-2">
          <Label htmlFor="document-type">Document Type</Label>
          <Select value={documentType} onValueChange={setDocumentType} disabled={uploading}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              {filteredDocumentTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Button
        onClick={handleUpload}
        disabled={uploading || !selectedFile}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {uploading ? t("common.uploading") : "Upload Document"}
      </Button>
    </div>
  )
}
