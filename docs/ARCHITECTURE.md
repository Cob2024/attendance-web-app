# SmartAttend — System Architecture & Technical Specifications

SmartAttend is an enterprise-grade university attendance management system engineered for **Takoradi Technical University (TTU)**. It features a multi-tiered security pipeline designed to eliminate proxy attendance in large lecture halls.

---

## 1. System Architecture

```mermaid
graph TD
    subgraph Client Tier
        SA[Student Mobile / Web App]
        LA[Lecturer Dashboard]
        AA[Admin Console]
    end

    subgraph Security & API Gateway
        RL[Rate Limiter - 300 req/15m]
        HM[Helmet HTTP Protection]
        JWT[JWT Authentication & RBAC]
        WS[Socket.io Real-Time Hub]
    end

    subgraph Service Layer
        AUTH[Auth & Device Fingerprint Service]
        GEO[GPS Geofencing & Haversine Engine]
        ATT[Attendance & Session Manager]
        NOTIF[75% Compliance & Risk Engine]
        EXP[PDF & CSV Export Engine]
    end

    subgraph Data Tier
        DB[(Prisma ORM & SQLite / PostgreSQL)]
    end

    SA -->|HTTPS / WSS| RL
    LA -->|HTTPS / WSS| RL
    AA -->|HTTPS| RL

    RL --> HM --> JWT
    JWT --> AUTH
    JWT --> GEO
    JWT --> ATT
    JWT --> NOTIF
    JWT --> EXP
    JWT --> WS

    AUTH --> DB
    GEO --> DB
    ATT --> DB
    NOTIF --> DB
    EXP --> DB
    WS -.->|Live Feed Broadcast| LA
```

---

## 2. Multi-Layer Anti-Proxy Verification Pipeline

Every attendance submission undergoes a **4-stage cryptographic and geospatial verification process** before a record is created:

```mermaid
sequenceDiagram
    autonumber
    actor Student as Student Phone
    actor Lecturer as Lecturer Console
    participant Server as SmartAttend API
    participant DB as Database

    Lecturer->>Server: Start Session (GPS coords, 50m radius, Timer)
    Server->>DB: Create Session record + OTP Code
    Server-->>Lecturer: Session Started (Live timer & Socket room active)

    Student->>Server: POST /api/attendance/mark (GPS Lat/Lon, Device Fingerprint, OTP)
    
    rect rgb(240, 248, 255)
        Note over Server: Stage 1: Active Session Check
        Server->>DB: Query active non-expired session for course
    end

    rect rgb(255, 248, 240)
        Note over Server: Stage 2: Device Fingerprint Binding Check
        Server->>DB: Verify student device matches registered hardware
    end

    rect rgb(240, 255, 240)
        Note over Server: Stage 3: Haversine GPS Geofence Verification
        Server->>Server: Calculate distance = Haversine(student_coords, lecturer_coords)
        alt Distance > 50 meters
            Server-->>Student: 400 Bad Request ("Out of range: XXm away")
        end
    end

    rect rgb(255, 240, 245)
        Note over Server: Stage 4: Record Upsert & Real-Time Broadcast
        Server->>DB: Upsert AttendanceRecord (status: present, distance, timestamp)
        Server->>Lecturer: Socket.io Emit ("attendance:marked", studentName, distance)
        Server-->>Student: 200 OK ("Attendance marked successfully!")
    end
```

---

## 3. Database Entity-Relationship Diagram

```mermaid
erDiagram
    User ||--o{ Course : "teaches"
    User ||--o{ AttendanceRecord : "submits"
    User ||--o{ AttendanceSession : "creates"
    User ||--o{ Enrollment : "enrolls in"
    User ||--o| DeviceBinding : "locks to hardware"

    Course ||--o{ AttendanceSession : "has"
    Course ||--o{ AttendanceRecord : "records"
    Course ||--o{ Enrollment : "contains"

    AttendanceSession ||--o{ AttendanceRecord : "groups"

    User {
        string id PK
        string email UK
        string passwordHash
        string name
        string role "student | lecturer | admin"
        string studentId UK
        string programme
        string level
        string profilePicture
        datetime createdAt
    }

    Course {
        string id PK
        string courseCode UK
        string courseName
        string programme
        string level
        string semester
        string lecturerId FK
    }

    AttendanceSession {
        string id PK
        string courseId FK
        string lecturerId FK
        float latitude
        float longitude
        float radiusMeters
        string otpCode
        boolean isActive
        int durationMinutes
        datetime expiresAt
        datetime endedAt
    }

    AttendanceRecord {
        string id PK
        string studentId FK
        string courseId FK
        string sessionId FK
        string date "YYYY-MM-DD"
        datetime timestamp
        string status "present | absent"
        boolean isManual
        float latitude
        float longitude
        float distance
    }

    Enrollment {
        string id PK
        string studentId FK
        string courseId FK
        datetime enrolledAt
    }

    DeviceBinding {
        string id PK
        string studentId FK
        string fingerprint UK
        datetime registeredAt
        string userAgent
    }
```

---

## 4. Geospatial Verification Engine (Haversine Formula)

The server calculates the precise geodesic distance between student coordinates $(\phi_1, \lambda_1)$ and lecturer session coordinates $(\phi_2, \lambda_2)$ using the Earth radius $R = 6,371,000\text{ m}$:

$$\Delta\phi = \phi_2 - \phi_1, \quad \Delta\lambda = \lambda_2 - \lambda_1$$

$$a = \sin^2\left(\frac{\Delta\phi}{2}\right) + \cos(\phi_1)\cos(\phi_2)\sin^2\left(\frac{\Delta\lambda}{2}\right)$$

$$c = 2 \cdot \text{atan2}\left(\sqrt{a}, \sqrt{1 - a}\right)$$

$$d = R \cdot c$$

If $d \le 50\text{ meters}$, attendance is accepted; otherwise, it is strictly rejected.
