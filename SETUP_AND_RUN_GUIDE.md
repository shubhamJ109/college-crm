# Setup and Run Guide - Faculty Course Assignments

## Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn package manager

## Initial Setup

### 1. Backend Setup

```bash
# Navigate to backend
cd a:\college-crm\backend

# Install dependencies (if not already done)
npm install

# Create .env file with the following variables:
# PORT=5000
# MONGO_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret_key
# JWT_EXPIRE=30d
# MAIL_USER=your_email@gmail.com
# MAIL_PASS=your_email_app_password
# NODE_ENV=development

# Start backend server
npm start
# OR for development with auto-reload
npm run dev
```

**Expected Output:**
```
🚀 Server running in development mode on port 5000
MongoDB connected: <database-name>
```

### 2. Frontend Setup

```bash
# Navigate to frontend
cd a:\college-crm\frontend

# Install dependencies (if not already done)
npm install

# Install react-router-dom if missing
npm install react-router-dom axios

# Start frontend development server
npm run dev
```

**Expected Output:**
```
VITE v7.x.x ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

## Running the Application

### Step 1: Start Backend
```bash
cd a:\college-crm\backend
npm start
```
Keep this terminal open.

### Step 2: Start Frontend (in new terminal)
```bash
cd a:\college-crm\frontend
npm run dev
```
Keep this terminal open.

### Step 3: Open Browser
Navigate to: `http://localhost:5173`

## Testing Faculty Course Assignments

### Phase 1: Setup Users and Courses (as Admin)

1. **Login as Admin/Super Admin**
   - Navigate to `http://localhost:5173/login`
   - Login with admin credentials

2. **Create Departments** (if not exists)
   - Go to Admin Dashboard → Departments
   - Add departments (CSE, ECE, etc.)

3. **Create Courses**
   - Go to Admin Dashboard → Courses
   - Add courses for each department
   - Example: CS101, CS102, etc.

4. **Approve HOD** (if pending)
   - Go to Admin Dashboard → Faculty/Users
   - Approve HOD registration

5. **Approve Faculty** (if pending)
   - Go to Admin Dashboard → Faculty/Users
   - Approve faculty registrations

### Phase 2: Assign Courses (as HOD)

1. **Login as HOD**
   - Logout from admin
   - Login with HOD credentials
   - Navigate to HOD Dashboard

2. **Go to Faculty Management**
   - Click "Faculty Management" from dashboard
   - You should see list of faculty in your department

3. **Assign Work to Faculty**
   - Click "Assign Work" button on any faculty card
   - Fill in the assignment form:
     - **Year:** Select FY, SY, or TY
     - **Divisions:** Select one or more (A, B, C, etc.)
     - **Courses:** Select one or more courses
     - **Description:** (Optional) Add notes
   - Click "Add to Assignment List"
   - You can add multiple assignments for different years/divisions
   - Click "Submit All Assignments"

4. **Verify Assignment**
   - You should see success message
   - Click "View Work" on the same faculty to see assignments

### Phase 3: View Courses (as Faculty)

1. **Login as Faculty**
   - Logout from HOD
   - Login with faculty credentials (the one who was assigned work)

2. **View My Courses**
   - From Faculty Dashboard, click "My Courses" card
   - OR click "View All Assignments" from the work assignments banner
   - You should be redirected to `/dashboard/faculty/courses`

3. **Expected Result**
   - You should see assignment cards showing:
     - Year level
     - Divisions assigned
     - List of courses with details
     - Who assigned and when
   - Click "View Full Details" to see complete information

## Debugging

### Check Browser Console
Press F12 in browser and check Console tab for:

**When HOD assigns work:**
```
Submitting assignments for faculty: 6xxxxxxxxxxxxx
Assignments to submit: [{...}]
Assignment submission response: {success: true, ...}
```

**When Faculty views courses:**
```
Fetching assignments for faculty...
Assignments response: {success: true, data: [...]}
Assignments data: [{...}]
```

### Check Backend Console
Look for:

**When HOD assigns work:**
```
Creating work assignments...
Faculty ID: 6xxxxxxxxxxxxx
Department: CSE
Number of assignments: 1
Creating assignment: {...}
Assignment created: 6xxxxxxxxxxxxx
All assignments created successfully: 1
```

**When Faculty views courses:**
```
Fetching assignments for faculty: 6xxxxxxxxxxxxx
Faculty name: John Doe
Found assignments: 1
Assignments: [{...}]
```

### Check Network Tab (F12)
1. Open DevTools → Network tab
2. Filter: XHR
3. When HOD submits: Look for POST request to `/api/work-assignments`
   - Status should be 201
   - Response should show created assignments
4. When Faculty views: Look for GET request to `/api/work-assignments/my-assignments`
   - Status should be 200
   - Response should show array of assignments

## Common Issues

### Issue: "Cannot connect to MongoDB"
**Solution:**
- Check MONGO_URI in backend/.env
- Ensure MongoDB is running (if local)
- Check internet connection (if using Atlas)

### Issue: "401 Unauthorized" errors
**Solution:**
- Clear browser localStorage
- Logout and login again
- Check JWT_SECRET is set in backend/.env

### Issue: Faculty sees "No Courses Assigned Yet"
**Possible causes:**
1. Backend not running
2. Assignments not saved to database
3. Wrong faculty ID
4. Assignments have status other than 'Active'

**Debug steps:**
1. Check backend console for errors
2. Check browser console for API errors
3. Verify assignments exist in database
4. Verify faculty user ID matches assignment

### Issue: Courses list is empty when HOD tries to assign
**Solution:**
- Login as admin
- Go to Courses management
- Add courses for the HOD's department
- Logout and login as HOD again

## Database Verification

### Using MongoDB Compass or CLI

**Connect to database:**
```javascript
use college-crm  // or your database name
```

**Check assignments:**
```javascript
db.workassignments.find().pretty()
```

**Check for specific faculty:**
```javascript
db.workassignments.find({
  faculty: ObjectId("REPLACE_WITH_FACULTY_ID")
}).pretty()
```

**Count active assignments:**
```javascript
db.workassignments.countDocuments({status: "Active"})
```

## API Endpoints Reference

### Work Assignments
- **POST** `/api/work-assignments` - Create assignments (HOD only)
- **GET** `/api/work-assignments/my-assignments` - Get logged-in faculty's assignments
- **GET** `/api/work-assignments/faculty/:facultyId` - Get specific faculty's assignments
- **GET** `/api/work-assignments/department/:department` - Get department's assignments (HOD only)
- **DELETE** `/api/work-assignments/:id` - Delete assignment (HOD only)
- **PATCH** `/api/work-assignments/:id/status` - Update status (HOD only)

### Expected Data Flow

```
1. HOD Assignment Flow:
   Frontend → POST /api/work-assignments
   Backend → WorkAssignment.create()
   MongoDB → Save document
   Backend → Populate courses
   Frontend → Show success

2. Faculty View Flow:
   Frontend → GET /api/work-assignments/my-assignments
   Backend → Find by faculty ID and status='Active'
   Backend → Populate courses and HOD
   Frontend → Display assignments
```

## Success Criteria

✅ Backend server starts without errors
✅ Frontend connects to backend successfully  
✅ HOD can see faculty list
✅ HOD can see courses list
✅ HOD can assign courses to faculty
✅ Assignment success message appears
✅ Faculty can login
✅ Faculty can navigate to "My Courses"
✅ Faculty sees assigned courses with details
✅ All course information displays correctly

## Quick Start Commands

```bash
# Terminal 1 - Backend
cd a:\college-crm\backend
npm start

# Terminal 2 - Frontend  
cd a:\college-crm\frontend
npm run dev

# Then open http://localhost:5173 in browser
```

## Notes

- Assignments persist in MongoDB until HOD deletes them
- Only assignments with status='Active' are shown to faculty
- Faculty can only see their own assignments
- HOD can see all assignments for their department
- Courses must exist in database before assignment
- Faculty must be approved before receiving assignments
