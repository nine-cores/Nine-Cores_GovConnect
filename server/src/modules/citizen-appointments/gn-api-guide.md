# GN Appointments API Guide

## GN Officer Endpoints

### Get GN's Appointments with Query Options

**Endpoint:** `GET /api/v1/citizen-appointments/gn/appointments`

**Authentication:** Bearer token (GN officer authentication required)

**Query Parameters:**
- `dateFrom` (optional): Start date filter (YYYY-MM-DD format)
- `dateTo` (optional): End date filter (YYYY-MM-DD format)
- `status` (optional): Filter by appointment status (`Pending`, `Confirmed`, `Completed`, `Cancelled`)
- `citizenNic` (optional): Filter by specific citizen NIC
- `limit` (optional): Number of results per page (1-100, default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Example Requests:**

```bash
# Get all appointments for the GN officer
curl -X GET "http://localhost:4601/api/v1/citizen-appointments/gn/appointments" \
  -H "Authorization: Bearer $GN_TOKEN"

# Get appointments for a specific date range
curl -X GET "http://localhost:4601/api/v1/citizen-appointments/gn/appointments?dateFrom=2025-08-20&dateTo=2025-08-25" \
  -H "Authorization: Bearer $GN_TOKEN"

# Get pending appointments only
curl -X GET "http://localhost:4601/api/v1/citizen-appointments/gn/appointments?status=Pending" \
  -H "Authorization: Bearer $GN_TOKEN"

# Get appointments for a specific citizen
curl -X GET "http://localhost:4601/api/v1/citizen-appointments/gn/appointments?citizenNic=123456789V" \
  -H "Authorization: Bearer $GN_TOKEN"

# Get appointments with pagination
curl -X GET "http://localhost:4601/api/v1/citizen-appointments/gn/appointments?limit=20&offset=40" \
  -H "Authorization: Bearer $GN_TOKEN"

# Complex query: Recent confirmed appointments
curl -X GET "http://localhost:4601/api/v1/citizen-appointments/gn/appointments?dateFrom=2025-08-01&status=Confirmed&limit=10" \
  -H "Authorization: Bearer $GN_TOKEN"
```

**Response Format:**

```json
{
  "success": true,
  "message": "GN appointments retrieved successfully",
  "data": {
    "appointments": [
      {
        "gnAppointmentId": 1,
        "citizenNic": "123456789V",
        "userId": "GN001",
        "gnServiceId": "GNS001",
        "appointmentDate": "2025-08-21",
        "startTime": "10:00:00",
        "endTime": "10:30:00",
        "purpose": "Identity verification",
        "status": "Confirmed",
        "createdAt": "2025-08-14T10:00:00.000Z",
        "updatedAt": "2025-08-14T10:00:00.000Z",
        "citizen": {
          "nic": "123456789V",
          "firstName": "John",
          "lastName": "Doe",
          "email": "john.doe@example.com",
          "phoneNumber": "+94771234567"
        },
        "gnService": {
          "gnServiceId": "GNS001",
          "serviceName": "Identity Verification",
          "description": "Verification of citizen identity documents"
        }
      }
    ],
    "total": 25
  }
}
```

**Features:**
- ✅ **Authentication Required:** Only GN officers can access their own appointments
- ✅ **Flexible Filtering:** Filter by date range, status, or specific citizen
- ✅ **Pagination Support:** Handle large datasets with limit/offset
- ✅ **Rich Relations:** Includes citizen and service details
- ✅ **Sorted Results:** Ordered by date (newest first) and time

**Status Values:**
- `Pending`: Newly created appointment waiting for confirmation
- `Confirmed`: Appointment confirmed by GN officer
- `Completed`: Appointment has been completed
- `Cancelled`: Appointment was cancelled

**Use Cases:**
1. **Daily Schedule:** Get today's appointments
2. **Appointment Management:** Filter pending appointments for confirmation
3. **Citizen Lookup:** Find all appointments for a specific citizen
4. **Reporting:** Get completed appointments for a date range
5. **Dashboard:** Get recent appointments with pagination
