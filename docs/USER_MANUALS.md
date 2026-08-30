# SmartAttend — Role-Based User Manuals

---

## 📱 1. Student Quick-Start Guide

### How to Install SmartAttend as an App (PWA)
1. Open Chrome (Android) or Safari (iOS) and navigate to the SmartAttend URL.
2. Tap the **Share** icon (iOS) or the **Menu ⋮** button (Android).
3. Select **"Add to Home Screen"** or tap the install prompt.
4. SmartAttend will appear on your phone's home screen with full offline access.

### How to Mark Daily Class Attendance
1. **Sign In**: Enter your university email and password. On first sign-in, your phone is permanently registered to your student account.
2. **Turn on Location (GPS)**: Ensure device location services are enabled.
3. **Open Active Session**: On your dashboard, look for the **"Live Session Active"** card for your course.
4. **1-Tap Check-In**: Tap **"Mark Attendance"**.
   - If within 50 meters of the lecturer, you will see a green **"Attendance Marked ✓"** badge.
   - If outside the lecture hall, an alert will notify you of your exact distance.

### Monitoring Exam Eligibility
- University regulations require **$\ge 75\%$ attendance** to sit for end-of-semester exams.
- If your attendance in any course drops below 75%, an orange warning banner will display on your dashboard indicating how many sessions you need to attend to regain eligibility.

---

## 🎓 2. Lecturer Quick-Start Guide

### How to Start a Live Attendance Session
1. **Sign In**: Navigate to your **Lecturer Portal**.
2. **Select Course**: Choose the class currently in session.
3. **Configure Duration**: Set the timer (**15m, 30m, 45m, 1h, or Until Stopped**).
4. **Start Session**: Click **"Start Session"**.
   - Your current GPS location is captured as the center of the 50m geofence.
   - The real-time countdown timer starts on your screen.

### Real-Time Live Feed Ticker
- As students mark attendance, their names, student IDs, and exact distance appear instantly on the **Live Attendance Feed** without page refreshes.

### Exporting Reports & Manual Overrides
1. **PDF Export**: Click **"PDF"** to generate an official branded attendance sheet with statistics.
2. **CSV Export**: Click **"CSV"** for Microsoft Excel spreadsheets.
3. **Manual Override**: If a student experienced hardware issues, click on their name under **Daily Summary** to toggle between Present and Absent.

---

## 🛠️ 3. Administrator Quick-Start Guide

### Managing Academic Catalog
- **Create Course**: Navigate to **Courses** $\rightarrow$ Click **"Create New Course"** $\rightarrow$ Enter Course Code, Name, Programme, Level, and assign a Lecturer.
- **Bulk Enrollment**: Auto-enroll students into courses by matching their registered Programme and Level with one click.

### Resetting Student Device Locks
- If a student buys a new phone or resets their browser:
  1. Go to **Manage Devices** or **Students**.
  2. Search for the student by name or Student ID.
  3. Click **"Reset Device"**.
  4. The student can now sign in on their new device immediately.

### Attendance Risk & Compliance Monitoring
- View the **Attendance Risk & Compliance** dashboard card to see all students with $< 75\%$ attendance across the entire institution, categorized by Critical ($< 50\%$) and Warning ($50-74\%$).
