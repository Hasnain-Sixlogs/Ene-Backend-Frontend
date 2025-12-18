# Seed Scripts

This directory contains scripts to populate the database with sample data for testing and development.

## Available Scripts

### 1. Seed All Data (`seedData.js`)

Populates the database with comprehensive sample data including:
- **Users**: 1 admin user and 5 regular users
- **Churches**: 5 churches with different approval statuses
- **Events**: 6 events (worship services, Bible studies, conferences, etc.)
- **Prayer Requests**: 7 prayer requests with various statuses
- **Follow-Up Requests**: 6 follow-up requests for different types (New Visitor, Prayer Request, Counseling, Membership, Baptism, Other)
- **Videos**: 8 videos across different categories (Sermon, Worship, Teaching, Prayer, Documentary, Other)

#### Usage

```bash
npm run seed:data
```

or

```bash
node scripts/seedData.js
```

#### Sample Credentials

After running the seed script, you can use these credentials to test:

**Admin:**
- Email: `pastor.john@everynation.org`
- Password: `password123`

**Users:**
- Email: `sarah.johnson@example.com`
- Password: `password123`
- Email: `michael.chen@example.com`
- Password: `password123`
- Email: `emily.rodriguez@example.com`
- Password: `password123`
- Email: `david.williams@example.com`
- Password: `password123`
- Email: `lisa.anderson@example.com`
- Password: `password123`

### 2. Seed Chat Data (`seedChat.js`)

Populates the database with sample chat conversations between users and admins.

#### Usage

```bash
npm run seed:chat
```

or

```bash
node scripts/seedChat.js
```

## Notes

- The seed scripts will check for existing data and skip creating duplicates
- All passwords are hashed using bcrypt
- Make sure your `.env` file has the correct `MONGODB_URI` configured
- The scripts will create users, churches, events, prayer requests, follow-up requests, and videos with realistic sample data
- All dates are set relative to the current date (e.g., events are scheduled for future dates)

## Data Structure

### Churches
- 3 approved churches
- 1 rejected church
- 1 pending church

### Events
- Mix of approved and pending events
- Various event types: Worship, Teaching, Prayer, Conference, Outreach, Workshop
- Dates range from 2 days to 16 days in the future

### Prayer Requests
- Mix of approved, pending, and rejected requests
- Associated with different churches
- Some linked to users, some anonymous

### Follow-Up Requests
- Various types: New Visitor, Prayer Request, Counseling, Membership, Baptism, Other
- Different statuses: pending, in_progress, completed
- Assigned to admin user

### Videos
- Mix of published and draft videos
- Various categories: Sermon, Worship, Teaching, Prayer, Documentary, Other
- Realistic view counts and durations

