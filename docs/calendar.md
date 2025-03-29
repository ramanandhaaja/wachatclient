# Calendar Module Documentation

## Overview
The calendar module provides a reservation system for WhatsApp business users to manage appointments and bookings.

### Key Features
- **Fixed Duration Events**: Each user can set their preferred event duration (30 or 60 minutes)
- **Recurring Availability**: Users can set their weekly availability schedule
- **Simple Booking System**: Clients can book available time slots

## Database Schema
The calendar module uses the following database schema implemented in Prisma:

### 1. User Model (Updated)
```prisma
model User {
  // ... existing fields ...
  eventDuration Int            @default(30) // 30 or 60 minutes
  availability  Availability[]
  events       Event[]
}
```

### 2. Availability Model
```prisma
model Availability {
  id        String   @id @default(cuid())
  userId    String
  dayOfWeek Int      // 0-6 (Sunday to Saturday)
  startTime String   // Format: "HH:mm"
  endTime   String   // Format: "HH:mm"
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([userId])
}
```

### 3. Event Model
```prisma
model Event {
  id         String   @id @default(cuid())
  userId     String
  startTime  DateTime
  endTime    DateTime
  clientName String
  user       User     @relation(fields: [userId], references: [id])
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([userId])
}
```

## API Endpoints

### Available Slots
```typescript
GET /api/calendar/available-slots?date=YYYY-MM-DD

Response: {
  slots: Array<{ start: Date; end: Date }>
}
```
- Returns available time slots for the authenticated user on a specific date
- Validates date format (YYYY-MM-DD)
- Considers user's event duration and availability settings
- Filters out booked slots
- Validates against user's availability schedule
- Returns error if user has no availability set for the day

### Events Management
```typescript
// List Events
GET /api/calendar/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: { events: Array<Event> }

// Create Event
POST /api/calendar/events
Body: {
  startTime: string;  // ISO datetime
  clientName: string;  // Min length: 1
}
Response: { 
  event: {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

Validation:
- startTime must be a valid ISO datetime
- clientName must not be empty
- Event must be within user's availability hours
- Time slot must be available (no overlapping events)
```

### Individual Event Operations
```typescript
// Get Event
GET /api/calendar/events/[eventId]
Response: { 
  event: {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

// Update Event
PUT /api/calendar/events/[eventId]
Body: {
  startTime?: string;  // ISO datetime
  clientName?: string;  // Min length: 1
}
Response: { 
  event: {
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date;
    clientName: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

Validation:
- If startTime is provided, must be a valid ISO datetime
- If clientName is provided, must not be empty
- New time slot must be available (no overlapping events)
- New time must be within user's availability hours

// Delete Event
DELETE /api/calendar/events/[eventId]
Response: { success: true }

Validation:
- Event must exist and belong to the authenticated user
```

### Availability Management
```typescript
// List Availability
GET /api/calendar/availability
Response: {
  availability: Array<{
    id: string;
    userId: string;
    dayOfWeek: number;  // 0-6 (Sunday to Saturday)
    startTime: string;  // Format: "HH:mm"
    endTime: string;    // Format: "HH:mm"
    createdAt: Date;
    updatedAt: Date;
  }>
}

// Create/Update Availability
POST /api/calendar/availability
Body: {
  dayOfWeek: number;  // 0-6 (Sunday to Saturday)
  startTime: string;  // Format: "HH:mm" (24-hour)
  endTime: string;    // Format: "HH:mm" (24-hour)
}
Response: {
  availability: {
    id: string;
    userId: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    createdAt: Date;
    updatedAt: Date;
  }
}

Validation:
- dayOfWeek must be between 0 and 6
- startTime and endTime must be in HH:mm format (24-hour)
- startTime must be before endTime
- Cannot overlap with existing availability for the same day
```

## Implementation Details
- All endpoints use NextAuth for authentication
- Input validation with Zod schemas
- Automatic event duration calculation based on user settings
- Overlap prevention for event creation/updates
- UTC time handling
- Error responses follow standard HTTP status codes
  - 400: Invalid input
  - 401: Unauthorized
  - 404: Resource not found
  - 409: Conflict (overlapping events)
  - 500: Server error

## Next Steps
1. Implement the calendar UI components using Shadcn UI
2. Add TanStack Query for frontend data fetching
3. Implement booking validation logic
4. Integrate with WhatsApp notifications
