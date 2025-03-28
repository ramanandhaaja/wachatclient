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

### Events Management
```typescript
// List Events
GET /api/calendar/events?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
Response: { events: Array<Event> }

// Create Event
POST /api/calendar/events
Body: {
  startTime: string;  // ISO datetime
  clientName: string;
}
Response: { event: Event }
```

### Individual Event Operations
```typescript
// Get Event
GET /api/calendar/events/[eventId]
Response: { event: Event }

// Update Event
PUT /api/calendar/events/[eventId]
Body: {
  startTime?: string;  // ISO datetime
  clientName?: string;
}
Response: { event: Event }

// Delete Event
DELETE /api/calendar/events/[eventId]
Response: { message: string }
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
