require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/user.model');
const Church = require('../models/church.model');
const Event = require('../models/event.model');
const PrayerRequest = require('../models/prayerRequest.model');
const FollowUpRequest = require('../models/followUpRequest.model');
const Video = require('../models/video.model');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/ene_backend';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✓ MongoDB Connected');
  } catch (error) {
    console.error('✗ MongoDB Connection Error:', error.message);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    console.log('\n=== Starting Data Seeding ===\n');

    // Step 1: Create or find users
    console.log('Step 1: Creating/Checking Users...');
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    let admin = await User.findOne({ role: 'admin', deleted_at: null });
    if (!admin) {
      admin = await User.create({
        name: 'Pastor John Smith',
        email: 'pastor.john@everynation.org',
        mobile: '1234567890',
        country_code: '+1',
        password: hashedPassword,
        role: 'admin',
        app_language: 'en',
        location: {
          address: '123 Church Street',
          city: 'New York',
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        }
      });
      console.log('  ✓ Created admin user: Pastor John Smith');
    } else {
      console.log('  ✓ Found existing admin: ' + admin.name);
    }

    // Create regular users
    const userData = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        mobile: '2345678901',
        country_code: '+1',
        password: hashedPassword,
        role: 'user',
        gender: 'female',
        app_language: 'en',
        location: {
          address: '456 Main Avenue',
          city: 'Los Angeles',
          type: 'Point',
          coordinates: [-118.2437, 34.0522]
        }
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        mobile: '3456789012',
        country_code: '+1',
        password: hashedPassword,
        role: 'user',
        gender: 'male',
        app_language: 'en',
        location: {
          address: '789 Oak Boulevard',
          city: 'Chicago',
          type: 'Point',
          coordinates: [-87.6298, 41.8781]
        }
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        mobile: '4567890123',
        country_code: '+1',
        password: hashedPassword,
        role: 'user',
        gender: 'female',
        app_language: 'es',
        location: {
          address: '321 Pine Street',
          city: 'Houston',
          type: 'Point',
          coordinates: [-95.3698, 29.7604]
        }
      },
      {
        name: 'David Williams',
        email: 'david.williams@example.com',
        mobile: '5678901234',
        country_code: '+1',
        password: hashedPassword,
        role: 'user',
        gender: 'male',
        app_language: 'en',
        location: {
          address: '654 Elm Drive',
          city: 'Phoenix',
          type: 'Point',
          coordinates: [-112.0740, 33.4484]
        }
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        mobile: '6789012345',
        country_code: '+1',
        password: hashedPassword,
        role: 'user',
        gender: 'female',
        app_language: 'en',
        location: {
          address: '987 Maple Lane',
          city: 'Philadelphia',
          type: 'Point',
          coordinates: [-75.1652, 39.9526]
        }
      }
    ];

    const users = [];
    for (const userInfo of userData) {
      let user = await User.findOne({ mobile: userInfo.mobile, deleted_at: null });
      if (!user) {
        user = await User.create(userInfo);
        console.log(`  ✓ Created user: ${user.name}`);
      } else {
        console.log(`  ✓ Found existing user: ${user.name}`);
      }
      users.push(user);
    }

    // Step 2: Create Churches
    console.log('\nStep 2: Creating Churches...');
    const churchData = [
      {
        user_id: admin._id,
        name: 'Every Nation Church - New York',
        location: {
          address: '123 Church Street, Manhattan',
          city: 'New York',
          type: 'Point',
          coordinates: [-74.006, 40.7128]
        },
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        is_availability: 1,
        church_status: 1,
        approve_status: 2 // approved
      },
      {
        user_id: admin._id,
        name: 'Every Nation Church - Los Angeles',
        location: {
          address: '456 Main Avenue, Downtown LA',
          city: 'Los Angeles',
          type: 'Point',
          coordinates: [-118.2437, 34.0522]
        },
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        is_availability: 1,
        church_status: 1,
        approve_status: 2 // approved
      },
      {
        user_id: admin._id,
        name: 'Every Nation Church - Chicago',
        location: {
          address: '789 Oak Boulevard, Loop District',
          city: 'Chicago',
          type: 'Point',
          coordinates: [-87.6298, 41.8781]
        },
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        is_availability: 1,
        church_status: 1,
        approve_status: 1 // rejected
      },
      {
        user_id: admin._id,
        name: 'Every Nation Church - Houston',
        location: {
          address: '321 Pine Street, Midtown',
          city: 'Houston',
          type: 'Point',
          coordinates: [-95.3698, 29.7604]
        },
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        is_availability: 1,
        church_status: 1,
        approve_status: 0 // pending
      },
      {
        user_id: admin._id,
        name: 'Every Nation Church - Phoenix',
        location: {
          address: '654 Elm Drive, Central Phoenix',
          city: 'Phoenix',
          type: 'Point',
          coordinates: [-112.0740, 33.4484]
        },
        place_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        is_availability: 1,
        church_status: 1,
        approve_status: 2 // approved
      }
    ];

    const churches = [];
    for (const churchInfo of churchData) {
      let church = await Church.findOne({ name: churchInfo.name });
      if (!church) {
        church = await Church.create(churchInfo);
        console.log(`  ✓ Created church: ${church.name} (Status: ${church.approve_status === 2 ? 'Approved' : church.approve_status === 1 ? 'Rejected' : 'Pending'})`);
      } else {
        console.log(`  ✓ Found existing church: ${church.name}`);
      }
      churches.push(church);
    }

    // Step 3: Create Events
    console.log('\nStep 3: Creating Events...');
    const eventData = [
      {
        event_name: 'Sunday Morning Worship Service',
        description: 'Join us for an inspiring Sunday morning worship service with powerful messages and uplifting music.',
        event_type: 'Worship',
        start_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        start_time: '10:00 AM',
        end_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        end_time: '12:00 PM',
        status: 'approved',
        virtual_link_or_location: 'https://zoom.us/j/123456789'
      },
      {
        event_name: 'Midweek Bible Study',
        description: 'Deep dive into God\'s word with our weekly Bible study session.',
        event_type: 'Teaching',
        start_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        start_time: '7:00 PM',
        end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        end_time: '8:30 PM',
        status: 'approved',
        virtual_link_or_location: 'Church Main Hall'
      },
      {
        event_name: 'Prayer Meeting',
        description: 'Corporate prayer time for the church community.',
        event_type: 'Prayer',
        start_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        start_time: '6:00 AM',
        end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        end_time: '7:00 AM',
        status: 'approved',
        virtual_link_or_location: 'Online via Zoom'
      },
      {
        event_name: 'Youth Conference 2024',
        description: 'Annual youth conference with guest speakers and worship.',
        event_type: 'Conference',
        start_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        start_time: '9:00 AM',
        end_date: new Date(Date.now() + 16 * 24 * 60 * 60 * 1000), // 16 days from now
        end_time: '5:00 PM',
        status: 'pending',
        virtual_link_or_location: 'Convention Center, Downtown'
      },
      {
        event_name: 'Community Outreach',
        description: 'Serving the local community through various outreach activities.',
        event_type: 'Outreach',
        start_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        start_time: '2:00 PM',
        end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        end_time: '5:00 PM',
        status: 'approved',
        virtual_link_or_location: 'Local Community Center'
      },
      {
        event_name: 'Marriage Enrichment Workshop',
        description: 'A workshop designed to strengthen marriages through biblical principles.',
        event_type: 'Workshop',
        start_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        start_time: '10:00 AM',
        end_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        end_time: '3:00 PM',
        status: 'pending',
        virtual_link_or_location: 'Church Fellowship Hall'
      }
    ];

    const events = [];
    for (const eventInfo of eventData) {
      let event = await Event.findOne({ event_name: eventInfo.event_name });
      if (!event) {
        event = await Event.create(eventInfo);
        console.log(`  ✓ Created event: ${event.event_name} (Status: ${event.status})`);
      } else {
        console.log(`  ✓ Found existing event: ${event.event_name}`);
      }
      events.push(event);
    }

    // Step 4: Create Prayer Requests
    console.log('\nStep 4: Creating Prayer Requests...');
    const prayerRequestData = [
      {
        church_id: churches[0]._id, // New York church
        date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        time: '10:00 AM',
        name: 'Sarah Johnson',
        dial_code: '+1',
        mobile_number: '2345678901',
        description: 'Please pray for healing from a recent surgery. Thank you for your prayers and support.',
        status: 'approved',
        user_id: users[0]._id
      },
      {
        church_id: churches[0]._id,
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        time: '2:00 PM',
        name: 'Michael Chen',
        dial_code: '+1',
        mobile_number: '3456789012',
        description: 'Prayer request for job opportunities and career guidance. Seeking God\'s direction in my professional life.',
        status: 'pending',
        user_id: users[1]._id
      },
      {
        church_id: churches[1]._id, // Los Angeles church
        date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now
        time: '11:00 AM',
        name: 'Emily Rodriguez',
        dial_code: '+1',
        mobile_number: '4567890123',
        description: 'Please pray for my family\'s financial situation. We are trusting God for provision and breakthrough.',
        status: 'approved',
        user_id: users[2]._id
      },
      {
        church_id: churches[1]._id,
        date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 days from now
        time: '3:00 PM',
        name: 'David Williams',
        dial_code: '+1',
        mobile_number: '5678901234',
        description: 'Prayer for wisdom and guidance in making important life decisions. Need clarity from the Lord.',
        status: 'pending',
        user_id: users[3]._id
      },
      {
        church_id: churches[4]._id, // Phoenix church
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        time: '9:00 AM',
        name: 'Lisa Anderson',
        dial_code: '+1',
        mobile_number: '6789012345',
        description: 'Please pray for my daughter\'s health and recovery. She is going through a difficult time.',
        status: 'approved',
        user_id: users[4]._id
      },
      {
        church_id: churches[0]._id,
        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        time: '4:00 PM',
        name: 'John Doe',
        dial_code: '+1',
        mobile_number: '7890123456',
        description: 'Prayer request for peace and comfort during a challenging season. Trusting in God\'s faithfulness.',
        status: 'rejected',
        user_id: null
      },
      {
        church_id: churches[2]._id, // Chicago church
        date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 days from now
        time: '1:00 PM',
        name: 'Maria Garcia',
        dial_code: '+1',
        mobile_number: '8901234567',
        description: 'Please pray for my marriage restoration. Believing God for reconciliation and healing.',
        status: 'pending',
        user_id: null
      }
    ];

    const prayerRequests = [];
    for (const prInfo of prayerRequestData) {
      let pr = await PrayerRequest.findOne({
        church_id: prInfo.church_id,
        name: prInfo.name,
        date: prInfo.date
      });
      if (!pr) {
        pr = await PrayerRequest.create(prInfo);
        console.log(`  ✓ Created prayer request: ${pr.name} (Status: ${pr.status})`);
      } else {
        console.log(`  ✓ Found existing prayer request: ${pr.name}`);
      }
      prayerRequests.push(pr);
    }

    // Step 5: Create Follow-Up Requests
    console.log('\nStep 5: Creating Follow-Up Requests...');
    const followUpRequestData = [
      {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@example.com',
        phone: '+1-234-567-8901',
        contact: 'sarah.johnson@example.com, +1-234-567-8901',
        type: 'New Visitor',
        assigned_to: 'Pastor John Smith',
        assigned_to_id: admin._id,
        due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        status: 'pending',
        description: 'New visitor attended Sunday service. Interested in joining a small group.',
        notes: 'Very engaged during service, asked questions about baptism.',
        user_id: users[0]._id,
        created_by: admin._id
      },
      {
        name: 'Michael Chen',
        email: 'michael.chen@example.com',
        phone: '+1-345-678-9012',
        contact: 'michael.chen@example.com, +1-345-678-9012',
        type: 'Prayer Request',
        assigned_to: 'Pastor John Smith',
        assigned_to_id: admin._id,
        due_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        status: 'in_progress',
        description: 'Follow up on prayer request for job opportunities. Needs career counseling.',
        notes: 'Scheduled a meeting for next week. Very open to guidance.',
        user_id: users[1]._id,
        created_by: admin._id
      },
      {
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@example.com',
        phone: '+1-456-789-0123',
        contact: 'emily.rodriguez@example.com, +1-456-789-0123',
        type: 'Counseling',
        assigned_to: 'Pastor John Smith',
        assigned_to_id: admin._id,
        due_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        status: 'pending',
        description: 'Requested counseling session for family issues. Needs pastoral care.',
        notes: 'Prefer Spanish-speaking counselor if available.',
        user_id: users[2]._id,
        created_by: admin._id
      },
      {
        name: 'David Williams',
        email: 'david.williams@example.com',
        phone: '+1-567-890-1234',
        contact: 'david.williams@example.com, +1-567-890-1234',
        type: 'Membership',
        assigned_to: 'Pastor John Smith',
        assigned_to_id: admin._id,
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        status: 'in_progress',
        description: 'Interested in becoming a member. Needs membership class information.',
        notes: 'Attended church for 6 months. Very committed and involved.',
        user_id: users[3]._id,
        created_by: admin._id
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@example.com',
        phone: '+1-678-901-2345',
        contact: 'lisa.anderson@example.com, +1-678-901-2345',
        type: 'Baptism',
        assigned_to: 'Pastor John Smith',
        assigned_to_id: admin._id,
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
        status: 'pending',
        description: 'Wants to be baptized. Needs baptism class and scheduling.',
        notes: 'Accepted Christ 3 months ago. Ready for next step.',
        user_id: users[4]._id,
        created_by: admin._id
      },
      {
        name: 'Robert Martinez',
        email: 'robert.martinez@example.com',
        phone: '+1-789-012-3456',
        contact: 'robert.martinez@example.com, +1-789-012-3456',
        type: 'Other',
        assigned_to: 'Pastor John Smith',
        assigned_to_id: admin._id,
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        status: 'completed',
        description: 'Follow up completed. Visitor joined small group successfully.',
        notes: 'Very satisfied with follow-up process. Now actively involved.',
        user_id: null,
        created_by: admin._id
      }
    ];

    const followUpRequests = [];
    for (const furInfo of followUpRequestData) {
      let fur = await FollowUpRequest.findOne({
        name: furInfo.name,
        email: furInfo.email,
        type: furInfo.type
      });
      if (!fur) {
        fur = await FollowUpRequest.create(furInfo);
        console.log(`  ✓ Created follow-up request: ${fur.name} (Type: ${fur.type}, Status: ${fur.status})`);
      } else {
        console.log(`  ✓ Found existing follow-up request: ${fur.name}`);
      }
      followUpRequests.push(fur);
    }

    // Step 6: Create Videos
    console.log('\nStep 6: Creating Videos...');
    const videoData = [
      {
        title: 'Sunday Sermon - Faith in Action',
        category: 'Sermon',
        video_url: 'https://example.com/videos/sermon-faith-in-action.mp4',
        thumbnail_url: 'https://example.com/thumbnails/sermon-faith-in-action.jpg',
        description: 'A powerful message about living out your faith in everyday life. Pastor John shares practical insights on how to apply biblical principles to modern challenges.',
        duration: '45:30',
        views: 1250,
        status: 'published',
        uploaded_by: admin._id
      },
      {
        title: 'Worship Night - Praise and Adoration',
        category: 'Worship',
        video_url: 'https://example.com/videos/worship-night.mp4',
        thumbnail_url: 'https://example.com/thumbnails/worship-night.jpg',
        description: 'Join us for an evening of powerful worship and praise. Experience the presence of God through uplifting songs and heartfelt prayers.',
        duration: '60:00',
        views: 890,
        status: 'published',
        uploaded_by: admin._id
      },
      {
        title: 'Bible Study Series - Book of Romans',
        category: 'Teaching',
        video_url: 'https://example.com/videos/bible-study-romans.mp4',
        thumbnail_url: 'https://example.com/thumbnails/bible-study-romans.jpg',
        description: 'Deep dive into the Book of Romans. Part 1 of a 12-part series exploring Paul\'s letter to the Romans and its relevance today.',
        duration: '35:20',
        views: 650,
        status: 'published',
        uploaded_by: admin._id
      },
      {
        title: 'Prayer Meeting - Corporate Intercession',
        category: 'Prayer',
        video_url: 'https://example.com/videos/prayer-meeting.mp4',
        thumbnail_url: 'https://example.com/thumbnails/prayer-meeting.jpg',
        description: 'Recorded prayer meeting where we intercede for our community, nation, and world. Join us in prayer.',
        duration: '30:15',
        views: 420,
        status: 'published',
        uploaded_by: admin._id
      },
      {
        title: 'Church History Documentary - Our Journey',
        category: 'Documentary',
        video_url: 'https://example.com/videos/church-history.mp4',
        thumbnail_url: 'https://example.com/thumbnails/church-history.jpg',
        description: 'A documentary chronicling the history of Every Nation Church, from its humble beginnings to where we are today.',
        duration: '25:45',
        views: 320,
        status: 'published',
        uploaded_by: admin._id
      },
      {
        title: 'Youth Conference 2024 - Highlights',
        category: 'Other',
        video_url: 'https://example.com/videos/youth-conference.mp4',
        thumbnail_url: 'https://example.com/thumbnails/youth-conference.jpg',
        description: 'Highlights from our annual youth conference featuring powerful testimonies, worship, and messages.',
        duration: '50:00',
        views: 1100,
        status: 'published',
        uploaded_by: admin._id
      },
      {
        title: 'Upcoming Sermon - Grace and Mercy',
        category: 'Sermon',
        video_url: 'https://example.com/videos/sermon-grace-mercy.mp4',
        thumbnail_url: 'https://example.com/thumbnails/sermon-grace-mercy.jpg',
        description: 'An upcoming sermon about God\'s grace and mercy. This message will be available soon.',
        duration: '42:10',
        views: 0,
        status: 'draft',
        uploaded_by: admin._id
      },
      {
        title: 'Teaching Series - Parables of Jesus',
        category: 'Teaching',
        video_url: 'https://example.com/videos/parables-jesus.mp4',
        thumbnail_url: 'https://example.com/thumbnails/parables-jesus.jpg',
        description: 'Exploring the parables of Jesus and their deep spiritual meanings. Part 1: The Parable of the Sower.',
        duration: '38:25',
        views: 750,
        status: 'published',
        uploaded_by: admin._id
      }
    ];

    const videos = [];
    for (const videoInfo of videoData) {
      let video = await Video.findOne({ title: videoInfo.title, deleted_at: null });
      if (!video) {
        video = await Video.create(videoInfo);
        console.log(`  ✓ Created video: ${video.title} (Status: ${video.status}, Views: ${video.views})`);
      } else {
        console.log(`  ✓ Found existing video: ${video.title}`);
      }
      videos.push(video);
    }

    // Summary
    console.log('\n=== Seeding Complete ===\n');
    console.log('Summary:');
    console.log(`  ✓ Users: ${users.length + 1} (1 admin + ${users.length} regular users)`);
    console.log(`  ✓ Churches: ${churches.length}`);
    console.log(`  ✓ Events: ${events.length}`);
    console.log(`  ✓ Prayer Requests: ${prayerRequests.length}`);
    console.log(`  ✓ Follow-Up Requests: ${followUpRequests.length}`);
    console.log(`  ✓ Videos: ${videos.length}`);
    console.log('\n✓ All sample data has been created successfully!\n');

    console.log('Test Credentials:');
    console.log('  Admin: pastor.john@everynation.org / password123');
    console.log('  User: sarah.johnson@example.com / password123');
    console.log('  User: michael.chen@example.com / password123\n');

    process.exit(0);
  } catch (error) {
    console.error('✗ Error seeding data:', error);
    console.error(error.stack);
    process.exit(1);
  }
};

// Run seed
seedData();

