"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { useLanguage } from "../contexts/LanguageContext"
import LanguageSwitcher from "./LanguageSwitcher"
import { authAPI, setAuthToken } from "../lib/api"
import { setUserData, type UserData } from "../lib/utils"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Alert, AlertDescription } from "./ui/alert"
import { ArrowLeft, User, Lock, Phone, Shield } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [citizenAuthMethod, setCitizenAuthMethod] = useState<"password" | "otp">("password")
  const [citizenForm, setCitizenForm] = useState({
    username: "",
    email: "",
    password: "",
    mobile: "",
    otp: "",
  })
  const [staffForm, setStaffForm] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [otpSent, setOtpSent] = useState(false)
  const { t } = useLanguage()

  const handleCitizenLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}

    if (citizenAuthMethod === "password") {
      if (!citizenForm.username && !citizenForm.email) {
        newErrors.username = t("login.usernameRequired")
      }
      if (!citizenForm.password) {
        newErrors.password = t("login.passwordRequired")
      }
    } else {
      if (!citizenForm.email) {
        newErrors.email = t("login.emailRequired")
      } else if (!/\S+@\S+\.\S+/.test(citizenForm.email)) {
        newErrors.email = t("login.invalidEmail")
      }
      if (otpSent && !citizenForm.otp) {
        newErrors.otp = t("login.otpRequired")
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      if (citizenAuthMethod === "otp" && otpSent) {
        const response = await authAPI.citizenOTPLogin(citizenForm.email, citizenForm.otp)
        
        // Check if response has the expected structure
        if (response.statusCode === 200 && response.data?.accessToken) {
          // Store the access token
          setAuthToken(response.data.accessToken)
          
          // Store user data using utility function
          const userData: UserData = {
            citizen: response.data.citizen,
            refreshToken: response.data.refreshToken,
            loginMethod: response.data.loginMethod
          }
          setUserData(userData)
          
          console.log(" Citizen OTP login successful", response.data.citizen)
          
          // Redirect to main page
          router.push("/")
        } else {
          // Handle unexpected response structure or error response
          console.error(" Login failed:", response)
          const errorMessage = response.message || t("login.loginFailed")
          setErrors({ general: errorMessage })
        }
      }
      setLoading(false)
    } catch (error: any) {
      console.error(" Login error:", error)
      // Handle network errors or API errors
      const errorMessage = error.message || t("login.loginFailed")
      setErrors({ general: errorMessage })
      setLoading(false)
    }
  }

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})

    // Validation
    const newErrors: Record<string, string> = {}
    if (!staffForm.email) {
      newErrors.staffEmail = t("login.emailRequired")
    }
    if (!staffForm.password) {
      newErrors.staffPassword = t("login.passwordRequired")
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      setLoading(false)
      return
    }

    try {
      const response = await authAPI.staffLogin(staffForm.email, staffForm.password)
      
      // Handle the new API response structure
      if (response.statusCode === 200 && response.data?.accessToken) {
        // Store the access token
        setAuthToken(response.data.accessToken)
        
        // Store user data
        const userData = {
          user: response.data.user,
          refreshToken: response.data.refreshToken,
          loginMethod: 'staff'
        }
        setUserData(userData)
        
        console.log(" Staff login successful, user role:", response.data.user.role)

        // Redirect based on user role from API response
        if (response.data.user.role === "GN") {
          router.push("/gramaniladhari")
        } else if (response.data.user.role === "MT") {
          router.push("/staff/motor-traffic")
        } else if (response.data.user.role === "Admin") {
          router.push("/admin")
        } else {
          // Default dashboard for other roles
          router.push("/dashboard")
        }
      } else {
        // Handle error response
        const errorMessage = response.message || t("login.staffLoginFailed")
        setErrors({ staffGeneral: errorMessage })
      }
      setLoading(false)
    } catch (error: any) {
      console.error(" Staff login error:", error)
      const errorMessage = error.message || t("login.staffLoginFailed")
      setErrors({ staffGeneral: errorMessage })
      setLoading(false)
    }
  }

  const sendOTP = async () => {
    if (!citizenForm.email || !/\S+@\S+\.\S+/.test(citizenForm.email)) {
      setErrors({ email: t("login.invalidEmail") })
      return
    }

    setLoading(true)
    try {
      await authAPI.requestCitizenOTP(citizenForm.email)
      setOtpSent(true)
      setLoading(false)
      setErrors({})
      console.log(" OTP sent successfully")
    } catch (error) {
      console.error(" OTP request error:", error)
      setErrors({ email: t("login.otpFailed") })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button variant="ghost" className="mb-6 p-2 h-auto" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t("login.backToServices")}
        </Button>

        {/* Login Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <LanguageSwitcher />
            </div>
            <CardTitle className="text-2xl font-bold">{t("login.title")}</CardTitle>
            <CardDescription>{t("login.description")}</CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs defaultValue="citizen" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="citizen" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  {t("login.citizen")}
                </TabsTrigger>
                <TabsTrigger value="staff" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  {t("login.staff")}
                </TabsTrigger>
              </TabsList>

              {/* Citizen Login */}
              <TabsContent value="citizen" className="space-y-4">
                <div className="flex justify-center space-x-2 mb-4">
                  <Button
                    variant={citizenAuthMethod === "password" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCitizenAuthMethod("password")
                      setOtpSent(false)
                      setErrors({})
                    }}
                  >
                    <Lock className="h-4 w-4 mr-2" />
                    {t("login.password")}
                  </Button>
                  <Button
                    variant={citizenAuthMethod === "otp" ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      setCitizenAuthMethod("otp")
                      setErrors({})
                    }}
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    {t("login.otp")}
                  </Button>
                </div>

                <form onSubmit={handleCitizenLogin} className="space-y-4">
                  {citizenAuthMethod === "password" ? (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="username">{t("login.username")}</Label>
                        <Input
                          id="username"
                          type="text"
                          placeholder={t("login.username")}
                          value={citizenForm.username}
                          onChange={(e) => setCitizenForm({ ...citizenForm, username: e.target.value })}
                          className={errors.username ? "border-destructive" : ""}
                        />
                        {errors.username && (
                          <Alert variant="destructive">
                            <AlertDescription>{errors.username}</AlertDescription>
                          </Alert>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">{t("login.password")}</Label>
                        <Input
                          id="password"
                          type="password"
                          placeholder={t("login.enterPassword")}
                          value={citizenForm.password}
                          onChange={(e) => setCitizenForm({ ...citizenForm, password: e.target.value })}
                          className={errors.password ? "border-destructive" : ""}
                        />
                        {errors.password && (
                          <Alert variant="destructive">
                            <AlertDescription>{errors.password}</AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="email">{t("login.emailAddress")}</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder={t("login.emailAddress")}
                          value={citizenForm.email}
                          onChange={(e) => setCitizenForm({ ...citizenForm, email: e.target.value })}
                          className={errors.email ? "border-destructive" : ""}
                        />
                        {errors.email && (
                          <Alert variant="destructive">
                            <AlertDescription>{errors.email}</AlertDescription>
                          </Alert>
                        )}
                      </div>

                      {!otpSent ? (
                        <Button type="button" onClick={sendOTP} disabled={loading} className="w-full">
                          {loading ? t("login.sending") : t("login.sendOTP")}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <Label htmlFor="otp">{t("login.enterOTP")}</Label>
                          <Input
                            id="otp"
                            type="text"
                            placeholder={t("login.enterOTP")}
                            value={citizenForm.otp}
                            onChange={(e) => setCitizenForm({ ...citizenForm, otp: e.target.value })}
                            className={errors.otp ? "border-destructive" : ""}
                            maxLength={6}
                          />
                          {errors.otp && (
                            <Alert variant="destructive">
                              <AlertDescription>{errors.otp}</AlertDescription>
                            </Alert>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {t("login.otpSentTo")} {citizenForm.email}
                            <Button
                              type="button"
                              variant="link"
                              size="sm"
                              className="p-0 h-auto ml-2"
                              onClick={() => setOtpSent(false)}
                            >
                              {t("login.changeEmail")}
                            </Button>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {(citizenAuthMethod === "password" || otpSent) && (
                    <Button type="submit" disabled={loading} className="w-full">
                      {loading ? t("login.signingIn") : t("login.signIn")}
                    </Button>
                  )}

                  {errors.general && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.general}</AlertDescription>
                    </Alert>
                  )}
                </form>

                <div className="text-center">
                  <Button variant="link" size="sm">
                    {t("login.forgotPassword")}
                  </Button>
                </div>
              </TabsContent>

              {/* Staff Login */}
              <TabsContent value="staff" className="space-y-4">
                <form onSubmit={handleStaffLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="staff-email">{t("login.emailAddress")}</Label>
                    <Input
                      id="staff-email"
                      type="email"
                      placeholder={t("login.emailAddress")}
                      value={staffForm.email}
                      onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
                      className={errors.staffEmail ? "border-destructive" : ""}
                    />
                    {errors.staffEmail && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.staffEmail}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="staff-password">{t("login.password")}</Label>
                    <Input
                      id="staff-password"
                      type="password"
                      placeholder={t("login.enterPassword")}
                      value={staffForm.password}
                      onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
                      className={errors.staffPassword ? "border-destructive" : ""}
                    />
                    {errors.staffPassword && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.staffPassword}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? t("login.signingIn") : t("login.signIn")}
                  </Button>

                  {errors.staffGeneral && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.staffGeneral}</AlertDescription>
                    </Alert>
                  )}
                </form>

                <div className="text-center">
                  <Button variant="link" size="sm">
                    {t("login.contactIT")}
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Security Notice */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">{t("login.securityNotice")}</p>
        </div>
      </div>
    </div>
  )
}
