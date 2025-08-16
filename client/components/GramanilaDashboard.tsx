"use client";

import type React from "react";
import { citizenAPI, appointmentAPI, clearAuthToken } from "../lib/api";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Calendar } from "./ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import {
  Users,
  CalendarIcon,
  Edit,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  LogOut,
  Award,
  Download,
  FileText,
  MessageSquare,
  Eye,
  AlertTriangle,
  Send,
} from "lucide-react";
import { formatYmdLocal, groupByDate, ymdToLocalDate } from "@/lib/utils";
import { toast } from "./ui/use-toast";

export default function GramanilaDashboard() {
  const [citizens, setCitizens] = useState<any[]>([]);
  const [citizensPagination, setCitizensPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: 20
  });
  const [selectedCitizen, setSelectedCitizen] = useState<any>(null);
  const [showCitizenModal, setShowCitizenModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [certificateRequests, setCertificateRequests] = useState<any[]>([]);
  const [appointmentsWithDocuments, setAppointmentsWithDocuments] = useState<
    any[]
  >([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [defaultMonth, setDefaultMonth] = useState<Date | undefined>(undefined);
  const [communicationMessage, setCommunicationMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [availabilitySlots, setAvailabilitySlots] = useState<any[]>([]);
  const [availabilityDetails, setAvailabilityDetails] = useState<Record<string, {
    startTime: string;
    endTime: string;
    slotDuration: number;
    date: string;
  }>>({});
  const [showAvailabilityDialog, setShowAvailabilityDialog] = useState(false);
  const [showSlotManagementDialog, setShowSlotManagementDialog] = useState(false);
  const [selectedDateSlots, setSelectedDateSlots] = useState<any[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [availabilityForm, setAvailabilityForm] = useState({
    startTime: "09:00",
    endTime: "17:00",
    slotDuration: 30,
  });
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [newCitizen, setNewCitizen] = useState({
    nic: "",
    displayName: "",
    phoneNumber: "",
    email: "",
    address: "",
  });
  const [loadedCitizenData, setLoadedCitizenData] = useState<any>(null);
  const [showVerification, setShowVerification] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    getMyAvailability();
  }, []);

  const loadInitialData = async () => {
    try {
      setDataLoading(true);
      const citizensResponse = await citizenAPI.getMyDivisionCitizens({
        page: citizensPagination.page,
        limit: citizensPagination.limit
      });
      
      console.log("Citizens API Response:", citizensResponse);
      
      if (citizensResponse.statusCode === 200 && citizensResponse.data) {
        setCitizens(citizensResponse.data.citizens || []);
        setCitizensPagination(prev => ({
          ...prev,
          total: citizensResponse.data.total || 0,
          totalPages: citizensResponse.data.totalPages || 1
        }));
      } else {
        setCitizens([]);
      }

      setAppointmentsWithDocuments([
        {
          id: 1,
          citizenNic: "200123456789",
          citizenName: "John Doe",
          appointmentDate: "2024-01-20",
          appointmentTime: "10:00 AM",
          serviceType: "Character Certificate",
          status: "Document Review Pending",
          documents: [
            {
              name: "Birth Certificate",
              status: "Submitted",
              url: "/docs/birth-cert.pdf",
            },
            { name: "Police Report", status: "Missing", url: null },
            {
              name: "Studio Photo",
              status: "Needs Correction",
              url: "/docs/photo.jpg",
              issue: "Photo quality too low",
            },
          ],
          communications: [
            {
              date: "2024-01-18",
              message: "Please submit a clearer photo",
              sender: "staff",
            },
            {
              date: "2024-01-19",
              message: "I will bring a new photo tomorrow",
              sender: "citizen",
            },
          ],
        },
        {
          id: 2,
          citizenNic: "199987654321",
          citizenName: "Jane Smith",
          appointmentDate: "2024-01-21",
          appointmentTime: "2:00 PM",
          serviceType: "Residence Certificate",
          status: "Documents Approved",
          documents: [
            {
              name: "Utility Bill",
              status: "Approved",
              url: "/docs/utility.pdf",
            },
            {
              name: "Lease Agreement",
              status: "Approved",
              url: "/docs/lease.pdf",
            },
          ],
          communications: [],
        },
      ]);

      setCertificateRequests([
        {
          id: 1,
          citizenNic: "200123456789",
          citizenName: "John Doe",
          certificateType: "Character Certificate",
          requestDate: "2024-01-15",
          status: "Pending",
          purpose: "Job Application",
          documents: ["Birth Certificate", "Police Report"],
        },
        {
          id: 2,
          citizenNic: "199987654321",
          citizenName: "Jane Smith",
          certificateType: "Residence Certificate",
          requestDate: "2024-01-14",
          status: "In Progress",
          purpose: "Bank Account Opening",
          documents: ["Utility Bill", "Lease Agreement"],
        },
        {
          id: 3,
          citizenNic: "198765432109",
          citizenName: "Bob Wilson",
          certificateType: "Income Certificate",
          requestDate: "2024-01-13",
          status: "Ready",
          purpose: "Scholarship Application",
          documents: ["Salary Slips", "Bank Statements"],
        },
      ]);

      setDataLoading(false);
    } catch (error) {
      console.error(" Error loading initial data:", error);
      setDataLoading(false);
    }
  };

  const filteredCitizens = citizens;

  const handleAddCitizen = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!newCitizen.nic || !/^[0-9]{12}$/.test(newCitizen.nic)) {
      newErrors.nic = "Please enter a valid 12-digit NIC number";
    }
    if (!newCitizen.displayName.trim()) {
      newErrors.displayName = "Name is required";
    }
    if (
      !newCitizen.phoneNumber ||
      !/^\+94[0-9]{9}$/.test(newCitizen.phoneNumber)
    ) {
      newErrors.phoneNumber =
        "Please enter a valid phone number (+94xxxxxxxxx)";
    }
    if (!newCitizen.email || !/\S+@\S+\.\S+/.test(newCitizen.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!newCitizen.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      const response = await citizenAPI.createCitizen(newCitizen);
      setCitizens([...citizens, response.citizen]);
      setNewCitizen({
        nic: "",
        displayName: "",
        phoneNumber: "",
        email: "",
        address: "",
      });
      setLoading(false);
      console.log(" Citizen added successfully");
    } catch (error) {
      console.error(" Error adding citizen:", error);
      setErrors({ general: "Failed to add citizen. Please try again." });
      setLoading(false);
    }
  };

  const loadCitizenByNIC = async () => {
    if (!newCitizen.nic || !/^[0-9]{12}$/.test(newCitizen.nic)) {
      setErrors({ nic: "Please enter a valid 12-digit NIC number" });
      return;
    }

    setVerificationLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      // Call the real API endpoint to get citizen preview
      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"
        }/citizens/preview/${newCitizen.nic}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode === 200 && data.data?.citizen) {
        setLoadedCitizenData(data.data.citizen);
        // Pre-populate display name with English name
        setNewCitizen((prev) => ({
          ...prev,
          displayName: data.data.citizen.name.english,
        }));
        setShowVerification(true);
        setVerificationLoading(false);
        console.log(" Citizen data loaded from national database");
      } else {
        throw new Error(data.message || "Failed to load citizen data");
      }
    } catch (error) {
      console.error(
        " Error loading citizen from national database:",
        error
      );
      setErrors({
        nic: "Citizen not found in national database or error loading data",
      });
      setVerificationLoading(false);
    }
  };

  const verifyCitizenAndAdd = async () => {
    if (!loadedCitizenData) return;

    // Validate required contact fields
    const newErrors: Record<string, string> = {};
    if (!newCitizen.displayName.trim()) {
      newErrors.displayName = "Display name is required";
    }
    if (
      !newCitizen.phoneNumber ||
      !/^\+94[0-9]{9}$/.test(newCitizen.phoneNumber)
    ) {
      newErrors.phoneNumber =
        "Please enter a valid phone number (+94xxxxxxxxx)";
    }
    if (!newCitizen.email || !/\S+@\S+\.\S+/.test(newCitizen.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Prepare citizen data for registration
      const citizenToAdd = {
        nic: loadedCitizenData.NIC,
        displayName: newCitizen.displayName,
        phoneNumber: newCitizen.phoneNumber,
        email: newCitizen.email,
        address: `${loadedCitizenData.address.street}, ${loadedCitizenData.address.city}, ${loadedCitizenData.address.postal_code}`,
      };

      // Call the real API endpoint to register citizen
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL || "/api/v1"}/citizens`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(citizenToAdd),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.statusCode === 201 && data.data) {
        // Add the new citizen to the local state
        setCitizens([...citizens, data.data]);

        // Reset form
        setNewCitizen({
          nic: "",
          displayName: "",
          phoneNumber: "",
          email: "",
          address: "",
        });
        setLoadedCitizenData(null);
        setShowVerification(false);
        setLoading(false);
        setSuccessMessage(
          `Citizen ${data.data.displayName} has been successfully added to your division!`
        );

        console.log(" Citizen verified and added successfully", data.data);
      } else {
        throw new Error(data.message || "Failed to add citizen");
      }
    } catch (error: any) {
      console.error(" Error adding verified citizen:", error);
      setErrors({
        general: error.message || "Failed to add citizen. Please try again.",
      });
      setLoading(false);
    }
  };

  const cancelVerification = () => {
    setLoadedCitizenData(null);
    setShowVerification(false);
    setNewCitizen({
      nic: "",
      displayName: "",
      phoneNumber: "",
      email: "",
      address: "",
    });
    setErrors({});
    setSuccessMessage("");
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadInitialData();
      return;
    }

    try {
      const response = await citizenAPI.searchCitizens(searchTerm, {
        page: 1,
        limit: citizensPagination.limit
      });
      
      if (response.statusCode === 200 && response.data) {
        setCitizens(response.data.citizens || []);
        setCitizensPagination(prev => ({
          ...prev,
          page: 1,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        }));
      } else {
        setCitizens([]);
      }
    } catch (error) {
      console.error(" Error searching citizens:", error);
      setCitizens([]);
    }
  };

  const viewCitizenDetails = async (nic: string) => {
    try {
      setLoading(true);
      const response = await citizenAPI.getCitizen(nic);
      
      if (response.statusCode === 200 && response.data) {
        setSelectedCitizen(response.data);
        setShowCitizenModal(true);
      } else {
        toast({
          title: "Error",
          description: "Failed to load citizen details",
          variant: "destructive",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error loading citizen details:", error);
      toast({
        title: "Error",
        description: "Failed to load citizen details",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCitizensPage = async (page: number) => {
    try {
      setLoading(true);
      const response = await citizenAPI.getMyDivisionCitizens({
        page: page,
        limit: citizensPagination.limit
      });
      
      if (response.statusCode === 200 && response.data) {
        setCitizens(response.data.citizens || []);
        setCitizensPagination(prev => ({
          ...prev,
          page: page,
          total: response.data.total || 0,
          totalPages: response.data.totalPages || 1
        }));
      }
    } catch (error) {
      console.error("Error loading citizens page:", error);
    } finally {
      setLoading(false);
    }
  };

  const verifyCitizen = async (
    nic: string,
    status: "Verified" | "Rejected"
  ) => {
    try {
      await citizenAPI.verifyCitizen(nic, status);
      loadInitialData();
      console.log(" Citizen verification updated");
    } catch (error) {
      console.error(" Error verifying citizen:", error);
    }
  };

  const setAvailability = async () => {
    if (!selectedDate) return;
    
    const dateKey = formatYmdLocal(selectedDate);
    
    try {
      const availabilityData = {
        availableDate: dateKey,
        startTime: availabilityForm.startTime,
        endTime: availabilityForm.endTime,
        slotDuration: availabilityForm.slotDuration,
      };
      
      const response = await appointmentAPI.setAvailability(availabilityData);
      
      if (response.statusCode === 200 || response.statusCode === 201) {
        // Refresh the availability data
        await getMyAvailability();
        
        // Store the availability details
        setAvailabilityDetails(prev => ({
          ...prev,
          [dateKey]: {
            startTime: availabilityForm.startTime,
            endTime: availabilityForm.endTime,
            slotDuration: availabilityForm.slotDuration,
            date: selectedDate.toDateString(),
          }
        }));
        
        setShowAvailabilityDialog(false);
        
        toast({
          title: "Availability saved",
          description: `${selectedDate.toLocaleDateString()} from ${availabilityForm.startTime} to ${availabilityForm.endTime} with ${availabilityForm.slotDuration} min slots`,
          variant: "default",
          duration: 5000,
        });
      } else {
        toast({
          title: "Failed to save availability",
          description:
            response.message ||
            "An error occurred while saving availability. Please try again.",
          variant: "destructive",
          duration: 7000,
        });
      }
      
      console.log(" Availability set successfully");
    } catch (error) {
      console.error(" Error setting availability:", error);
      toast({
        title: "Error",
        description: "Failed to set availability. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };

  const openAvailabilityDialog = () => {
    if (!selectedDate) return;
    
    const dateKey = formatYmdLocal(selectedDate);
    const existingDetails = availabilityDetails[dateKey];
    
    if (existingDetails) {
      setAvailabilityForm({
        startTime: existingDetails.startTime,
        endTime: existingDetails.endTime,
        slotDuration: existingDetails.slotDuration,
      });
    } else {
      setAvailabilityForm({
        startTime: "09:00",
        endTime: "17:00",
        slotDuration: 30,
      });
    }
    
    setShowAvailabilityDialog(true);
  };

  const removeAvailability = async (dateToRemove: Date) => {
    const dateKey = formatYmdLocal(dateToRemove);
    const slotsForDate = availabilitySlots.filter(slot => slot.availableDate === dateKey);
    
    if (slotsForDate.length === 0) return;
    
    // Filter out any slots with undefined IDs
    const validSlots = slotsForDate.filter(slot => slot.gnAvailabilityId !== undefined && slot.gnAvailabilityId !== null);
    
    if (validSlots.length === 0) {
      console.error("No valid slots found for date:", dateKey);
      toast({
        title: "Error",
        description: "No valid slots found for this date",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }
    
    try {
      // Cancel all valid slots for this date
      const promises = validSlots.map(slot => 
        appointmentAPI.updateAvailability(slot.gnAvailabilityId, "Cancelled")
      );
      
      await Promise.all(promises);
      
      // Remove from local state
      setAvailableDates(availableDates.filter(
        date => formatYmdLocal(date) !== dateKey
      ));
      
      setAvailabilitySlots(prev => 
        prev.filter(slot => slot.availableDate !== dateKey)
      );
      
      setAvailabilityDetails(prev => {
        const updated = { ...prev };
        delete updated[dateKey];
        return updated;
      });
      
      toast({
        title: "Availability removed",
        description: `${dateToRemove.toDateString()} - ${validSlots.length} slots cancelled`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error removing availability:", error);
      toast({
        title: "Error",
        description: "Failed to remove availability",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const generateTimeSlots = (startTime: string, endTime: string, slotDuration: number): string[] => {
    const slots = [];
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    let current = new Date(start);
    
    while (current < end) {
      const timeString = current.toTimeString().substring(0, 5);
      slots.push(timeString);
      current.setMinutes(current.getMinutes() + slotDuration);
    }
    
    return slots;
  };

  const openSlotManagement = (date: Date) => {
    const dateKey = formatYmdLocal(date);
    const slotsForDate = availabilitySlots.filter(
      slot => slot.availableDate === dateKey
    );
    setSelectedDateSlots(slotsForDate);
    setSelectedSlots([]);
    setShowSlotManagementDialog(true);
  };

  const updateSlotStatus = async (gnAvailabilityId: number, status: string) => {
    if (!gnAvailabilityId || gnAvailabilityId === undefined) {
      console.error("Invalid gnAvailabilityId:", gnAvailabilityId);
      toast({
        title: "Error",
        description: "Invalid slot ID. Please refresh and try again.",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await appointmentAPI.updateAvailability(gnAvailabilityId, status);
      if (response.statusCode === 200) {
        // Update local state
        setAvailabilitySlots(prev => 
          prev.map(slot => 
            slot.gnAvailabilityId === gnAvailabilityId 
              ? { ...slot, status } 
              : slot
          )
        );
        
        setSelectedDateSlots(prev => 
          prev.map(slot => 
            slot.gnAvailabilityId === gnAvailabilityId 
              ? { ...slot, status } 
              : slot
          )
        );

        toast({
          title: "Slot updated",
          description: `Slot status changed to ${status}`,
          variant: "default",
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error updating slot status:", error);
      toast({
        title: "Error",
        description: "Failed to update slot status",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const bulkUpdateSlotStatus = async (status: string) => {
    if (selectedSlots.length === 0) return;

    // Filter out any undefined or invalid IDs
    const validSlotIds = selectedSlots.filter(id => id !== undefined && id !== null);
    
    if (validSlotIds.length === 0) {
      toast({
        title: "Error",
        description: "No valid slots selected",
        variant: "destructive",
        duration: 3000,
      });
      return;
    }

    try {
      const promises = validSlotIds.map(gnAvailabilityId => 
        appointmentAPI.updateAvailability(gnAvailabilityId, status)
      );
      
      await Promise.all(promises);
      
      // Update local state
      setAvailabilitySlots(prev => 
        prev.map(slot => 
          validSlotIds.includes(slot.gnAvailabilityId)
            ? { ...slot, status } 
            : slot
        )
      );
      
      setSelectedDateSlots(prev => 
        prev.map(slot => 
          validSlotIds.includes(slot.gnAvailabilityId)
            ? { ...slot, status } 
            : slot
        )
      );

      setSelectedSlots([]);
      
      toast({
        title: "Slots updated",
        description: `${validSlotIds.length} slots updated to ${status}`,
        variant: "default",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error updating slots:", error);
      toast({
        title: "Error",
        description: "Failed to update slots",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const toggleSlotSelection = (gnAvailabilityId: number) => {
    setSelectedSlots(prev => 
      prev.includes(gnAvailabilityId)
        ? prev.filter(id => id !== gnAvailabilityId)
        : [...prev, gnAvailabilityId]
    );
  };

  const selectAllSlots = () => {
    const validSlots = selectedDateSlots.filter(slot => slot.gnAvailabilityId);
    
    if (selectedSlots.length === validSlots.length) {
      setSelectedSlots([]);
    } else {
      setSelectedSlots(validSlots.map(slot => slot.gnAvailabilityId));
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Available":
        return "default";
      case "Booked":
        return "secondary";
      case "Cancelled":
        return "destructive";
      default:
        return "outline";
    }
  };

  const toDate = (v: number | string) => {
    const n = typeof v === "number" ? v : Number(v);
    const ms = n < 1e12 ? n * 1000 : n;
    const d = new Date(ms);
    return isNaN(d.getTime()) ? null : d;
  };

  const LIMIT = 7;

  const getMyAvailability = async () => {
    try {
      const today = new Date();
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      const res = await appointmentAPI.getAvailability({
        dateFrom: formatYmdLocal(today),
        dateTo: formatYmdLocal(nextMonth),
        status: 'Available',
        page: 1,
        limit: 100
      });
      
      console.log("Availability API Response:", res);
      
      if (res.statusCode === 200 && res.data) {
        console.log("Slots data:", res.data);
        
        // Validate that each slot has a gnAvailabilityId
        const validSlots = res.data.filter((slot: any) => {
          if (!slot.gnAvailabilityId) {
            console.warn("Slot missing gnAvailabilityId:", slot);
            return false;
          }
          return true;
        });
        
        setAvailabilitySlots(validSlots);
        
        // Extract unique dates
        const uniqueDates = new Map();
        validSlots.forEach((slot: any) => {
          const date = new Date(slot.availableDate);
          const dateKey = formatYmdLocal(date);
          if (!uniqueDates.has(dateKey)) {
            uniqueDates.set(dateKey, date);
          }
        });
        
        setAvailableDates(Array.from(uniqueDates.values()));
        
        console.log("Processed availability slots:", validSlots.length);
        console.log("Unique dates:", Array.from(uniqueDates.keys()));
      } else {
        console.log("No availability data or unexpected response structure");
        setAvailabilitySlots([]);
        setAvailableDates([]);
      }
    } catch (error) {
      console.error(" Error fetching availability:", error);
      setAvailabilitySlots([]);
      setAvailableDates([]);
    }
  };

  const handleLogout = () => {
    clearAuthToken();
    window.location.href = "/login";
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Verified":
        return <Badge className="bg-green-100 text-green-800">Verified</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const updateCertificateStatus = async (
    requestId: number,
    newStatus: string
  ) => {
    try {
      setCertificateRequests((prev) =>
        prev.map((request) =>
          request.id === requestId ? { ...request, status: newStatus } : request
        )
      );
      console.log(" Certificate status updated to:", newStatus);
    } catch (error) {
      console.error(" Error updating certificate status:", error);
    }
  };

  const updateDocumentStatus = (
    appointmentId: number,
    documentName: string,
    newStatus: string,
    issue?: string
  ) => {
    setAppointmentsWithDocuments((prev) =>
      prev.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              documents: appointment.documents.map((doc: any) =>
                doc.name === documentName
                  ? { ...doc, status: newStatus, issue: issue || doc.issue }
                  : doc
              ),
            }
          : appointment
      )
    );
  };

  const sendCommunication = (appointmentId: number) => {
    if (!communicationMessage.trim()) return;

    setAppointmentsWithDocuments((prev) =>
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
          : appointment
      )
    );
    setCommunicationMessage("");
  };

  const getCertificateStatusBadge = (status: string) => {
    switch (status) {
      case "Ready":
        return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "Rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentStatusBadge = (status: string) => {
    switch (status) {
      case "Approved":
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case "Submitted":
        return <Badge className="bg-blue-100 text-blue-800">Submitted</Badge>;
      case "Missing":
        return <Badge variant="destructive">Missing</Badge>;
      case "Needs Correction":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Needs Correction
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getAppointmentStatusBadge = (status: string) => {
    switch (status) {
      case "Documents Approved":
        return (
          <Badge className="bg-green-100 text-green-800">
            Documents Approved
          </Badge>
        );
      case "Document Review Pending":
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            Review Pending
          </Badge>
        );
      case "Confirmed":
        return <Badge className="bg-blue-100 text-blue-800">Confirmed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-foreground">
                Gramaniladhari Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, Gramaniladhari Officer
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Citizens
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{citizens.length}</div>
              <p className="text-xs text-muted-foreground">
                Registered in division
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Today's Appointments
              </CardTitle>
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {appointmentsWithDocuments.length}
              </div>
              <p className="text-xs text-muted-foreground">
                Scheduled for today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Verification
              </CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {
                  citizens.filter(
                    (citizen) => citizen.verificationStatus === "Pending"
                  ).length
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Awaiting verification
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Certificate Requests
              </CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {certificateRequests.length}
              </div>
              <p className="text-xs text-muted-foreground">Total requests</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="citizens" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="citizens">Citizens</TabsTrigger>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="certificates">Certificate Requests</TabsTrigger>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="add-citizen">Add Citizen</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments">
            <Card>
              <CardHeader>
                <CardTitle>Appointment Management</CardTitle>
                <CardDescription>
                  Review appointments and verify submitted documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {appointmentsWithDocuments.map((appointment) => (
                    <Card
                      key={appointment.id}
                      className="border-l-4 border-l-blue-500"
                    >
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg">
                              {appointment.citizenName}
                            </CardTitle>
                            <CardDescription>
                              {appointment.serviceType} •{" "}
                              {appointment.appointmentDate} at{" "}
                              {appointment.appointmentTime}
                            </CardDescription>
                          </div>
                          {getAppointmentStatusBadge(appointment.status)}
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              Document Review
                            </h4>
                            <div className="space-y-3">
                              {appointment.documents.map((doc: any, index: number) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-3 border rounded-lg"
                                >
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
                                          onClick={() =>
                                            updateDocumentStatus(
                                              appointment.id,
                                              doc.name,
                                              "Approved"
                                            )
                                          }
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
                                              "Please resubmit wi</div>th corrections"
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

                          <div>
                            <h4 className="font-semibold mb-3 flex items-center">
                              <MessageSquare className="h-4 w-4 mr-2" />
                              Communication
                            </h4>
                            <div className="space-y-3">
                              <div className="max-h-40 overflow-y-auto space-y-2">
                                {appointment.communications.map(
                                  (comm: { date: string; message: string; sender: string }, index: number) => (
                                    <div
                                      key={index}
                                      className={`p-2 rounded-lg text-sm ${
                                        comm.sender === "staff"
                                          ? "bg-blue-100 text-blue-800 ml-4"
                                          : "bg-gray-100 text-gray-800 mr-4"
                                      }`}
                                    >
                                      <p>{comm.message}</p>
                                      <p className="text-xs opacity-70 mt-1">
                                        {comm.date}
                                      </p>
                                    </div>
                                  )
                                )}
                              </div>
                              <div className="flex space-x-2">
                                <Input
                                  placeholder="Type your message..."
                                  value={communicationMessage}
                                  onChange={(e) =>
                                    setCommunicationMessage(e.target.value)
                                  }
                                  onKeyPress={(e) =>
                                    e.key === "Enter" &&
                                    sendCommunication(appointment.id)
                                  }
                                />
                                <Button
                                  onClick={() =>
                                    sendCommunication(appointment.id)
                                  }
                                >
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

          <TabsContent value="citizens">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>Citizen Overview</CardTitle>
                  <CardDescription>
                    Manage citizens in your division ({citizensPagination.total} total)
                  </CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Search by name or NIC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    className="w-64"
                  />
                  <Button onClick={handleSearch}>
                    Search
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>NIC</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCitizens.map((citizen) => (
                      <TableRow key={citizen.nic}>
                        <TableCell className="font-medium">
                          {citizen.nic}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{citizen.displayName}</div>
                            {citizen.gender && (
                              <div className="text-sm text-muted-foreground">{citizen.gender}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {citizen.phoneNumber}
                            </div>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Mail className="h-3 w-3" />
                              {citizen.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {citizen.address}
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {getStatusBadge(citizen.verificationStatus)}
                            <div className="text-xs text-muted-foreground">
                              {citizen.accountStatus}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewCitizenDetails(citizen.nic)}
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {citizen.verificationStatus === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() =>
                                    verifyCitizen(citizen.nic, "Verified")
                                  }
                                >
                                  <CheckCircle className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() =>
                                    verifyCitizen(citizen.nic, "Rejected")
                                  }
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                
                {/* Pagination */}
                {citizensPagination.totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <div className="text-sm text-muted-foreground">
                      Showing {((citizensPagination.page - 1) * citizensPagination.limit) + 1} to{' '}
                      {Math.min(citizensPagination.page * citizensPagination.limit, citizensPagination.total)} of{' '}
                      {citizensPagination.total} citizens
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadCitizensPage(citizensPagination.page - 1)}
                        disabled={citizensPagination.page <= 1 || loading}
                      >
                        Previous
                      </Button>
                      <div className="flex items-center space-x-1">
                        {Array.from({ length: Math.min(5, citizensPagination.totalPages) }, (_, i) => {
                          const pageNum = i + 1;
                          return (
                            <Button
                              key={pageNum}
                              variant={pageNum === citizensPagination.page ? "default" : "outline"}
                              size="sm"
                              onClick={() => loadCitizensPage(pageNum)}
                              disabled={loading}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                        {citizensPagination.totalPages > 5 && (
                          <>
                            <span className="text-muted-foreground">...</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadCitizensPage(citizensPagination.totalPages)}
                              disabled={loading}
                            >
                              {citizensPagination.totalPages}
                            </Button>
                          </>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadCitizensPage(citizensPagination.page + 1)}
                        disabled={citizensPagination.page >= citizensPagination.totalPages || loading}
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <CardTitle>Certificate Requests</CardTitle>
                <CardDescription>
                  Manage certificate requests from citizens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Request ID</TableHead>
                      <TableHead>Citizen</TableHead>
                      <TableHead>Certificate Type</TableHead>
                      <TableHead>Request Date</TableHead>
                      <TableHead>Purpose</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {certificateRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell className="font-medium">
                          #{request.id}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {request.citizenName}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {request.citizenNic}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{request.certificateType}</TableCell>
                        <TableCell>{request.requestDate}</TableCell>
                        <TableCell className="max-w-xs truncate">
                          {request.purpose}
                        </TableCell>
                        <TableCell>
                          {getCertificateStatusBadge(request.status)}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            {request.status === "Pending" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  updateCertificateStatus(
                                    request.id,
                                    "In Progress"
                                  )
                                }
                              >
                                Start Processing
                              </Button>
                            )}
                            {request.status === "In Progress" && (
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() =>
                                  updateCertificateStatus(request.id, "Ready")
                                }
                              >
                                <Award className="h-4 w-4 mr-1" />
                                Mark Ready
                              </Button>
                            )}
                            {request.status === "Ready" && (
                              <Button size="sm" variant="outline">
                                <Download className="h-4 w-4 mr-1" />
                                Download
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() =>
                                updateCertificateStatus(request.id, "Rejected")
                              }
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Availability Calendar</CardTitle>
                  <CardDescription>
                    Mark your available dates for appointments with time slots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border"
                  />
                  <div className="mt-4 space-y-2">
                    <Dialog open={showAvailabilityDialog} onOpenChange={setShowAvailabilityDialog}>
                      <DialogTrigger asChild>
                        <Button
                          onClick={openAvailabilityDialog}
                          className="w-full"
                          disabled={!selectedDate}
                        >
                          {selectedDate && availabilityDetails[formatYmdLocal(selectedDate)] 
                            ? "Update Availability" 
                            : "Mark Selected Date as Available"
                          }
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Set Availability</DialogTitle>
                          <DialogDescription>
                            Configure your availability for {selectedDate?.toDateString()}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="startTime">Start Time</Label>
                              <Select 
                                value={availabilityForm.startTime} 
                                onValueChange={(value) => setAvailabilityForm(prev => ({ ...prev, startTime: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select start time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return [
                                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>,
                                      <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</SelectItem>
                                    ];
                                  }).flat()}
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="endTime">End Time</Label>
                              <Select 
                                value={availabilityForm.endTime} 
                                onValueChange={(value) => setAvailabilityForm(prev => ({ ...prev, endTime: value }))}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select end time" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 24 }, (_, i) => {
                                    const hour = i.toString().padStart(2, '0');
                                    return [
                                      <SelectItem key={`${hour}:00`} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>,
                                      <SelectItem key={`${hour}:30`} value={`${hour}:30`}>{`${hour}:30`}</SelectItem>
                                    ];
                                  }).flat()}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="slotDuration">Slot Duration (minutes)</Label>
                            <Select 
                              value={availabilityForm.slotDuration.toString()} 
                              onValueChange={(value) => setAvailabilityForm(prev => ({ ...prev, slotDuration: parseInt(value) }))}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select slot duration" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5 minutes</SelectItem>
                                <SelectItem value="15">15 minutes</SelectItem>
                                <SelectItem value="20">20 minutes</SelectItem>
                                <SelectItem value="30">30 minutes</SelectItem>
                                <SelectItem value="45">45 minutes</SelectItem>
                                <SelectItem value="60">1 hour</SelectItem>
                                <SelectItem value="90">1.5 hours</SelectItem>
                                <SelectItem value="120">2 hours</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          {/* Preview of time slots */}
                          {availabilityForm.startTime && availabilityForm.endTime && availabilityForm.slotDuration && (
                            <div className="space-y-2">
                              <Label>Preview Time Slots</Label>
                              <div className="max-h-32 overflow-y-auto bg-gray-50 p-2 rounded border">
                                <div className="grid grid-cols-3 gap-1 text-xs">
                                  {generateTimeSlots(availabilityForm.startTime, availabilityForm.endTime, availabilityForm.slotDuration).map((slot, index) => (
                                    <Badge key={index} variant="outline" className="text-xs py-1">
                                      {slot}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                Total slots: {generateTimeSlots(availabilityForm.startTime, availabilityForm.endTime, availabilityForm.slotDuration).length}
                              </p>
                            </div>
                          )}
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowAvailabilityDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={setAvailability}>
                            Save Availability
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    {selectedDate && (
                      <div className="text-sm text-muted-foreground text-center">
                        Selected: {selectedDate.toDateString()}
                        {availabilityDetails[formatYmdLocal(selectedDate)] && (
                          <span className="block text-green-600 font-medium">
                            ✓ Available with time slots configured
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Available Dates</CardTitle>
                  <CardDescription>
                    Your current availability schedule with time slots
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {availableDates.map((date, index) => {
                      const dateKey = formatYmdLocal(date);
                      const slotsForDate = availabilitySlots.filter(slot => slot.availableDate === dateKey);
                      const availableCount = slotsForDate.filter(slot => slot.status === 'Available').length;
                      const bookedCount = slotsForDate.filter(slot => slot.status === 'Booked').length;
                      const cancelledCount = slotsForDate.filter(slot => slot.status === 'Cancelled').length;
                      
                      return (
                        <Card key={index} className="border-l-4 border-l-green-500">
                          <CardContent className="pt-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{date.toDateString()}</h4>
                                <div className="flex gap-2 mt-1">
                                  <Badge variant="default" className="text-xs">
                                    {availableCount} Available
                                  </Badge>
                                  {bookedCount > 0 && (
                                    <Badge variant="secondary" className="text-xs">
                                      {bookedCount} Booked
                                    </Badge>
                                  )}
                                  {cancelledCount > 0 && (
                                    <Badge variant="destructive" className="text-xs">
                                      {cancelledCount} Cancelled
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openSlotManagement(date)}
                                >
                                  <Edit className="h-4 w-4 mr-1" />
                                  Manage Slots
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => removeAvailability(date)}
                                >
                                  Remove
                                </Button>
                              </div>
                            </div>
                            
                            {slotsForDate.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-muted-foreground mb-2">
                                  Time Slots ({slotsForDate.length} total):
                                </p>
                                <div className="flex flex-wrap gap-1">
                                  {slotsForDate.slice(0, 8).map((slot, slotIndex) => (
                                    <Badge 
                                      key={slotIndex} 
                                      variant={getStatusBadgeVariant(slot.status)} 
                                      className="text-xs"
                                    >
                                      {slot.startTime} - {slot.endTime}
                                    </Badge>
                                  ))}
                                  {slotsForDate.length > 8 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{slotsForDate.length - 8} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}
                    {availableDates.length === 0 && (
                      <div className="text-center py-8">
                        <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                        <p className="text-muted-foreground">No available dates set</p>
                        <p className="text-sm text-muted-foreground">
                          Select a date on the calendar and click "Mark Selected Date as Available" to get started.
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Slot Management Dialog */}
            <Dialog open={showSlotManagementDialog} onOpenChange={setShowSlotManagementDialog}>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
                <DialogHeader>
                  <DialogTitle>Manage Time Slots</DialogTitle>
                  <DialogDescription>
                    Update the status of individual time slots or manage them in bulk
                  </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto py-4">
                  {selectedDateSlots.length > 0 && (
                    <div className="space-y-4">
                      {/* Bulk Actions */}
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            checked={selectedSlots.length === selectedDateSlots.filter(slot => slot.gnAvailabilityId).length && selectedDateSlots.filter(slot => slot.gnAvailabilityId).length > 0}
                            onCheckedChange={selectAllSlots}
                          />
                          <span className="text-sm font-medium">
                            Select All ({selectedSlots.length} of {selectedDateSlots.filter(slot => slot.gnAvailabilityId).length} valid slots selected)
                          </span>
                        </div>
                        {selectedSlots.length > 0 && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => bulkUpdateSlotStatus("Available")}
                            >
                              Mark Available
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => bulkUpdateSlotStatus("Booked")}
                            >
                              Mark Booked
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => bulkUpdateSlotStatus("Cancelled")}
                            >
                              Mark Cancelled
                            </Button>
                          </div>
                        )}
                      </div>

                      {/* Individual Slots */}
                      <div className="space-y-2 max-h-96 overflow-y-auto">
                        {selectedDateSlots.map((slot) => (
                          <Card key={slot.gnAvailabilityId || `invalid-${Math.random()}`} className="p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <Checkbox
                                  checked={slot.gnAvailabilityId && selectedSlots.includes(slot.gnAvailabilityId)}
                                  onCheckedChange={() => slot.gnAvailabilityId && toggleSlotSelection(slot.gnAvailabilityId)}
                                  disabled={!slot.gnAvailabilityId}
                                />
                                <div>
                                  <div className="font-medium">
                                    {slot.startTime} - {slot.endTime}
                                    {!slot.gnAvailabilityId && <span className="text-red-500 ml-2">(Invalid)</span>}
                                  </div>
                                  <div className="text-sm text-muted-foreground">
                                    Service: {slot.gnService?.serviceName || 'General'}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Badge variant={getStatusBadgeVariant(slot.status)}>
                                  {slot.status}
                                </Badge>
                                <div className="flex gap-1">
                                  {slot.status !== 'Available' && slot.gnAvailabilityId && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => updateSlotStatus(slot.gnAvailabilityId, "Available")}
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {slot.status !== 'Cancelled' && slot.gnAvailabilityId && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={() => updateSlotStatus(slot.gnAvailabilityId, "Cancelled")}
                                    >
                                      <XCircle className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {!slot.gnAvailabilityId && (
                                    <Badge variant="destructive" className="text-xs">
                                      Invalid Slot
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowSlotManagementDialog(false)}
                  >
                    Close
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="add-citizen">
            <Card>
              <CardHeader>
                <CardTitle>Add New Citizen</CardTitle>
                <CardDescription>
                  Register a new citizen in your division
                </CardDescription>
              </CardHeader>
              <CardContent>
                {successMessage && (
                  <Alert className="mb-6 border-green-200 bg-green-50">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800">
                      {successMessage}
                    </AlertDescription>
                  </Alert>
                )}

                {showVerification && loadedCitizenData ? (
                  <div className="space-y-6">
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Citizen data found in national database. Please verify
                        the information below before adding to your division.
                      </AlertDescription>
                    </Alert>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="border-2 border-blue-200">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Personal Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              NIC Number
                            </Label>
                            <p className="text-lg font-semibold">
                              {loadedCitizenData.NIC}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Name (English)
                            </Label>
                            <p className="text-lg">
                              {loadedCitizenData.name.english}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Name (Sinhala)
                            </Label>
                            <p className="text-lg">
                              {loadedCitizenData.name.sinhala ||
                                "Not available"}
                            </p>
                          </div>

                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Name (Tamil)
                            </Label>
                            <p className="text-lg">
                              {loadedCitizenData.name.tamil || "Not available"}
                            </p>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                Birthday
                              </Label>
                              <p>{loadedCitizenData.birthday}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                Gender
                              </Label>
                              <p>{loadedCitizenData.gender}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                District
                              </Label>
                              <p>{loadedCitizenData.district}</p>
                            </div>
                            <div>
                              <Label className="text-sm font-medium text-muted-foreground">
                                Division Code
                              </Label>
                              <p>
                                {loadedCitizenData.grama_sewa_division_code}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-2 border-green-200">
                        <CardHeader>
                          <CardTitle className="text-lg">
                            Address & Contact
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">
                              Address
                            </Label>
                            <p className="text-sm">
                              {loadedCitizenData.address.street}
                              <br />
                              {loadedCitizenData.address.city}
                              <br />
                              Postal Code:{" "}
                              {loadedCitizenData.address.postal_code}
                            </p>
                          </div>

                          <div className="space-y-3">
                            <div>
                              <Label htmlFor="displayName">
                                Display Name *
                              </Label>
                              <div className="space-y-2">
                                <Input
                                  id="displayName"
                                  placeholder="Enter display name for the citizen"
                                  value={newCitizen.displayName}
                                  onChange={(e) =>
                                    setNewCitizen({
                                      ...newCitizen,
                                      displayName: e.target.value,
                                    })
                                  }
                                  className={
                                    errors.displayName
                                      ? "border-destructive"
                                      : ""
                                  }
                                />
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={() =>
                                      setNewCitizen({
                                        ...newCitizen,
                                        displayName:
                                          loadedCitizenData.name.english,
                                      })
                                    }
                                  >
                                    Use English
                                  </Button>
                                  {loadedCitizenData.name.sinhala && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setNewCitizen({
                                          ...newCitizen,
                                          displayName:
                                            loadedCitizenData.name.sinhala,
                                        })
                                      }
                                    >
                                      Use Sinhala
                                    </Button>
                                  )}
                                  {loadedCitizenData.name.tamil && (
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="outline"
                                      onClick={() =>
                                        setNewCitizen({
                                          ...newCitizen,
                                          displayName:
                                            loadedCitizenData.name.tamil,
                                        })
                                      }
                                    >
                                      Use Tamil
                                    </Button>
                                  )}
                                </div>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                This will be used as the citizen's preferred
                                name in the system
                              </p>
                              {errors.displayName && (
                                <Alert variant="destructive">
                                  <AlertDescription>
                                    {errors.displayName}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="phoneNumber">
                                Phone Number *
                              </Label>
                              <Input
                                id="phoneNumber"
                                placeholder="Enter phone number (+94xxxxxxxxx)"
                                value={newCitizen.phoneNumber}
                                onChange={(e) =>
                                  setNewCitizen({
                                    ...newCitizen,
                                    phoneNumber: e.target.value,
                                  })
                                }
                                className={
                                  errors.phoneNumber ? "border-destructive" : ""
                                }
                              />
                              {errors.phoneNumber && (
                                <Alert variant="destructive">
                                  <AlertDescription>
                                    {errors.phoneNumber}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>

                            <div>
                              <Label htmlFor="email">Email Address *</Label>
                              <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={newCitizen.email}
                                onChange={(e) =>
                                  setNewCitizen({
                                    ...newCitizen,
                                    email: e.target.value,
                                  })
                                }
                                className={
                                  errors.email ? "border-destructive" : ""
                                }
                              />
                              {errors.email && (
                                <Alert variant="destructive">
                                  <AlertDescription>
                                    {errors.email}
                                  </AlertDescription>
                                </Alert>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="flex space-x-4 pt-4">
                      <Button
                        onClick={verifyCitizenAndAdd}
                        disabled={
                          loading ||
                          !newCitizen.displayName.trim() ||
                          !newCitizen.phoneNumber ||
                          !newCitizen.email
                        }
                        className="flex-1"
                      >
                        {loading ? "Adding Citizen..." : "Verify & Add Citizen"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={cancelVerification}
                        className="flex-1 bg-transparent"
                      >
                        Cancel & Start Over
                      </Button>
                    </div>

                    {errors.general && (
                      <Alert variant="destructive">
                        <AlertDescription>{errors.general}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => e.preventDefault()}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <Label htmlFor="nic">NIC Number</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="nic"
                          placeholder="Enter 12-digit NIC to load citizen data"
                          value={newCitizen.nic}
                          onChange={(e) => {
                            setNewCitizen({
                              ...newCitizen,
                              nic: e.target.value,
                            });
                            setSuccessMessage("");
                            setErrors({});
                          }}
                          className={errors.nic ? "border-destructive" : ""}
                          maxLength={12}
                        />
                        <Button
                          type="button"
                          onClick={loadCitizenByNIC}
                          disabled={verificationLoading || !newCitizen.nic}
                        >
                          {verificationLoading ? "Loading..." : "Load Data"}
                        </Button>
                      </div>
                      {errors.nic && (
                        <Alert variant="destructive">
                          <AlertDescription>{errors.nic}</AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <Alert>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        Enter a valid 12-digit NIC number to load citizen
                        information from the national database for verification.
                      </AlertDescription>
                    </Alert>
                  </form>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Citizen Details Modal */}
        <Dialog open={showCitizenModal} onOpenChange={setShowCitizenModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Citizen Details</DialogTitle>
              <DialogDescription>
                Complete information for the selected citizen
              </DialogDescription>
            </DialogHeader>
            {selectedCitizen && (
              <div className="flex-1 overflow-y-auto py-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Personal Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">NIC Number</Label>
                        <p className="text-lg font-semibold">{selectedCitizen.nic}</p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                        <p className="text-lg">{selectedCitizen.displayName}</p>
                      </div>
                      {selectedCitizen.gender && (
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Gender</Label>
                          <p>{selectedCitizen.gender}</p>
                        </div>
                      )}
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Address</Label>
                        <p className="text-sm">{selectedCitizen.address}</p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Contact & Status Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Contact & Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone Number</Label>
                        <p className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {selectedCitizen.phoneNumber}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email Address</Label>
                        <p className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {selectedCitizen.email}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Verification Status</Label>
                        <div className="mt-1">
                          {getStatusBadge(selectedCitizen.verificationStatus)}
                        </div>
                        {selectedCitizen.verificationDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Verified on: {new Date(selectedCitizen.verificationDate).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Account Status</Label>
                        <Badge variant={selectedCitizen.accountStatus === 'Active' ? 'default' : 'secondary'}>
                          {selectedCitizen.accountStatus}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Division Information */}
                  {selectedCitizen.division && (
                    <Card className="md:col-span-2">
                      <CardHeader>
                        <CardTitle className="text-lg">Division Information</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Division</Label>
                            <p>{selectedCitizen.division.divisionName}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">District</Label>
                            <p>{selectedCitizen.division.district}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Province</Label>
                            <p>{selectedCitizen.division.province}</p>
                          </div>
                          <div>
                            <Label className="text-sm font-medium text-muted-foreground">Division ID</Label>
                            <p className="font-mono text-sm">{selectedCitizen.division.divisionId}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* Registration Information */}
                  <Card className="md:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-lg">Registration Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Registered On</Label>
                          <p>{new Date(selectedCitizen.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-muted-foreground">Last Updated</Label>
                          <p>{new Date(selectedCitizen.updatedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Buttons */}
                {selectedCitizen.verificationStatus === "Pending" && (
                  <div className="flex justify-center space-x-4 mt-6 pt-4 border-t">
                    <Button
                      onClick={() => {
                        verifyCitizen(selectedCitizen.nic, "Verified");
                        setShowCitizenModal(false);
                      }}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Citizen
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        verifyCitizen(selectedCitizen.nic, "Rejected");
                        setShowCitizenModal(false);
                      }}
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Verification
                    </Button>
                  </div>
                )}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCitizenModal(false)}
              >
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
