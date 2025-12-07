# Quick Reference - Faculty Course Assignments

## ✅ YES - Courses ARE Saved and Persist!

### Where is the data stored?
- **MongoDB database** in the `workassignments` collection
- **NOT** in browser localStorage or sessionStorage
- **NOT** temporary - persists until HOD deletes it

### How long does data persist?
- **Forever** (or until HOD explicitly removes it)
- Survives browser refresh
- Survives logout/login
- Survives server restart (data is in database)

### When will assignments disappear?
Only when:
1. HOD deletes the assignment permanently
2. HOD changes status to 'Completed' or 'Cancelled'
3. Database is manually cleared

## Quick Commands

### Start the Application
```bash
# Terminal 1 - Backend
cd a:\college-crm\backend
npm start

# Terminal 2 - Frontend
cd a:\college-crm\frontend
npm run dev

# Open http://localhost:5173
```

### Check if Assignments Exist in Database
```javascript
// In MongoDB shell or Compass
use college-crm
db.workassignments.find().pretty()

// Count assignments
db.workassignments.countDocuments({status: "Active"})

// Find specific faculty's assignments
db.workassignments.find({
  faculty: ObjectId("YOUR_FACULTY_ID_HERE")
})
```

## Data Flow Diagram

```
HOD Assigns Courses
        ↓
Frontend (POST /api/work-assignments)
        ↓
Backend (WorkAssignment.create())
        ↓
MongoDB (Saves document)
        ↓
✅ DATA PERSISTED
        ↓
Faculty Views Courses
        ↓
Frontend (GET /api/work-assignments/my-assignments)
        ↓
Backend (Find assignments from MongoDB)
        ↓
MongoDB (Returns saved data)
        ↓
Frontend (Displays courses)
```

## Debugging Checklist

When assignments don't show up:

**Backend Issues:**
- [ ] Backend server is running
- [ ] MongoDB is connected (check console: "MongoDB connected")
- [ ] No errors in backend console
- [ ] Backend logs show "Assignment created: ..."

**Assignment Issues:**
- [ ] HOD successfully submitted (got success message)
- [ ] Assignment status is 'Active' (not Completed/Cancelled)
- [ ] Courses exist in database
- [ ] Faculty ID is correct

**Frontend Issues:**
- [ ] Frontend is running
- [ ] Faculty is logged in
- [ ] Network tab shows successful API call (200 status)
- [ ] Console shows "Assignments data: [...]"
- [ ] No JavaScript errors

**Database Issues:**
- [ ] MongoDB is running
- [ ] Database connection string is correct
- [ ] Database has data (check with MongoDB Compass)
- [ ] Collection name is 'workassignments'

## Console Logs to Look For

### When HOD Assigns (Backend Console)
```
Creating work assignments...
Faculty ID: 6xxxxxxxxxxxxx
Department: CSE
Number of assignments: 1
Creating assignment: {...}
Assignment created: 6xxxxxxxxxxxxx
All assignments created successfully: 1
```

### When HOD Assigns (Browser Console)
```
Submitting assignments for faculty: 6xxxxxxxxxxxxx
Assignments to submit: [...]
Assignment submission response: {success: true, ...}
```

### When Faculty Views (Backend Console)
```
Fetching assignments for faculty: 6xxxxxxxxxxxxx
Faculty name: John Doe
Found assignments: 1
Assignments: [...]
```

### When Faculty Views (Browser Console)
```
Fetching assignments for faculty...
Assignments response: {success: true, data: [...]}
Assignments data: [...]
```

## API Endpoints

### Create Assignment (HOD)
```
POST /api/work-assignments
Body: {
  facultyId: "6xxxxx",
  assignments: [{
    year: "FY",
    divisions: ["A", "B"],
    courses: ["courseId1", "courseId2"],
    description: "..."
  }]
}
```

### Get My Assignments (Faculty)
```
GET /api/work-assignments/my-assignments
Response: {
  success: true,
  data: [...]
}
```

### Delete Assignment (HOD)
```
DELETE /api/work-assignments/:assignmentId
```

## File Locations

### Frontend
- Routes: `frontend/src/App.jsx`
- Faculty Dashboard: `frontend/src/components/dashboards/FacultyDashboard.jsx`
- My Courses Page: `frontend/src/components/dashboards/FacultyMyCourses.jsx`
- HOD Management: `frontend/src/components/dashboards/HODFacultyManagement.jsx`

### Backend
- Routes: `backend/routes/workAssignmentRoutes.js`
- Model: `backend/models/WorkAssignment.js`
- Server: `backend/server.js`

### Documentation
- Setup Guide: `SETUP_AND_RUN_GUIDE.md`
- Troubleshooting: `TROUBLESHOOTING_FACULTY_COURSES.md`
- Feature Docs: `FACULTY_MY_COURSES_SETUP.md`
- Changes Summary: `CHANGES_SUMMARY.md`

## Important URLs

- Login: `http://localhost:5173/login`
- Faculty Dashboard: `http://localhost:5173/dashboard/faculty`
- My Courses: `http://localhost:5173/dashboard/faculty/courses`
- HOD Dashboard: `http://localhost:5173/dashboard/hod`
- HOD Faculty Management: `http://localhost:5173/dashboard/hod/faculty`

## Need Help?

1. Check console logs (both frontend F12 and backend terminal)
2. Check Network tab in browser DevTools
3. Verify data in MongoDB using Compass or CLI
4. Read `TROUBLESHOOTING_FACULTY_COURSES.md` for detailed steps
5. Read `SETUP_AND_RUN_GUIDE.md` for setup instructions

## Key Points to Remember

✅ Assignments ARE saved to MongoDB
✅ Data persists until HOD deletes it
✅ Faculty can only see Active assignments
✅ Both backend and frontend must be running
✅ MongoDB must be connected
✅ Console logs help debug issues
✅ Check Network tab for API errors
