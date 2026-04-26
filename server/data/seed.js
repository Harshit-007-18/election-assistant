const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

const ElectionTimeline = require('../models/ElectionTimeline');
const Guide = require('../models/Guide');
const ResponseVariation = require('../models/ResponseVariation');

const timelines = [
  { state: 'Maharashtra', registrationDeadline: new Date('2026-09-15'), electionDate: new Date('2026-10-20'), resultDate: new Date('2026-10-25'), notes: 'State Assembly Elections' },
  { state: 'Delhi', registrationDeadline: new Date('2026-11-01'), electionDate: new Date('2026-12-05'), resultDate: new Date('2026-12-08'), notes: 'Municipal Corporation Elections' },
  { state: 'Karnataka', registrationDeadline: new Date('2026-08-20'), electionDate: new Date('2026-09-25'), resultDate: new Date('2026-09-28'), notes: 'Local Body Elections' },
  { state: 'Tamil Nadu', registrationDeadline: new Date('2026-10-10'), electionDate: new Date('2026-11-15'), resultDate: new Date('2026-11-18'), notes: 'Urban Local Body Elections' },
  { state: 'Uttar Pradesh', registrationDeadline: new Date('2026-07-15'), electionDate: new Date('2026-08-20'), resultDate: new Date('2026-08-25'), notes: 'Panchayat Elections' },
  { state: 'Kerala', registrationDeadline: new Date('2026-09-01'), electionDate: new Date('2026-10-10'), resultDate: new Date('2026-10-13'), notes: 'Local Self Government Elections' },
  { state: 'Gujarat', registrationDeadline: new Date('2026-10-25'), electionDate: new Date('2026-11-28'), resultDate: new Date('2026-12-01'), notes: 'Municipal Elections' },
  { state: 'Rajasthan', registrationDeadline: new Date('2026-08-10'), electionDate: new Date('2026-09-15'), resultDate: new Date('2026-09-18'), notes: 'Panchayati Raj Elections' },
  { state: 'West Bengal', registrationDeadline: new Date('2026-06-20'), electionDate: new Date('2026-07-25'), resultDate: new Date('2026-07-28'), notes: 'Municipal Elections' },
  { state: 'Punjab', registrationDeadline: new Date('2026-11-15'), electionDate: new Date('2026-12-18'), resultDate: new Date('2026-12-21'), notes: 'Local Body Elections' },
  { state: 'Bihar', registrationDeadline: new Date('2026-07-01'), electionDate: new Date('2026-08-05'), resultDate: new Date('2026-08-10'), notes: 'Panchayat Elections' },
  { state: 'Madhya Pradesh', registrationDeadline: new Date('2026-09-20'), electionDate: new Date('2026-10-25'), resultDate: new Date('2026-10-28'), notes: 'Urban Body Elections' },
];

const guides = [
  {
    type: 'registration',
    steps: [
      'Visit the National Voters\' Service Portal (NVSP) at nvsp.in or download the Voter Helpline App.',
      'Click on "Apply Online for Registration of New Voter" to access Form 6.',
      'Fill in your personal details — name, date of birth, address, and family member info.',
      'Upload a recent passport-size photograph (max 50KB, JPEG format).',
      'Upload age proof — birth certificate, Class 10 marksheet, or passport.',
      'Upload address proof — Aadhaar card, ration card, utility bill, or bank passbook.',
      'Review all details carefully, then submit the form. Note your Reference ID.',
      'Your application will be verified by a BLO (Booth Level Officer) who may visit your address.',
      'Track your application status using the Reference ID on NVSP or the Voter Helpline App.',
      'Once approved, download your e-EPIC (Digital Voter ID) from the NVSP portal.',
    ],
  },
  {
    type: 'voting_day',
    steps: [
      'Check your name in the voter list at electoralsearch.eci.gov.in or the Voter Helpline App.',
      'Find your polling booth — your Voter Information Slip (VIS) has the details.',
      'Carry a valid photo ID — Voter ID (EPIC), Aadhaar, passport, driving license, or PAN card.',
      'Arrive at your polling booth during voting hours (usually 7:00 AM to 6:00 PM).',
      'Stand in the queue. Separate queues may be available for senior citizens and women.',
      'Show your ID to the polling officer at the entry desk for verification.',
      'Get your left index finger marked with indelible ink.',
      'Proceed to the EVM (Electronic Voting Machine). The presiding officer will activate it.',
      'Press the button next to your chosen candidate\'s name and symbol on the EVM.',
      'Verify your vote on the VVPAT (Voter Verified Paper Audit Trail) slip displayed for 7 seconds.',
      'Collect your voter slip from the polling officer as you exit. Your vote is complete! 🎉',
    ],
  },
];

const responseVariations = [
  {
    key: 'greeting',
    messages: [
      "Hello! 👋 I'm your Election Assistant. Let me help you navigate the voting process!",
      "Namaste! 🙏 Welcome to Election Assistant. I'm here to guide you through everything election-related.",
      "Hi there! 🗳️ Ready to learn about voting? I'm your personal election guide!",
      "Welcome! 👋 I can help you check eligibility, register to vote, and much more!",
    ],
  },
  {
    key: 'fallback',
    messages: [
      "Hmm, I didn't quite catch that. Let me show you what I can help with! 🤔",
      "I'm not sure about that, but here's what I'm great at! 💡",
      "Let me redirect you to the things I can help with. 😊",
      "I didn't understand that, but no worries! Here are some options:",
    ],
  },
  {
    key: 'eligibility_start',
    messages: [
      "Let's check if you're eligible to vote! This will only take a moment. 🎯",
      "Great choice! Let's quickly verify your voting eligibility. 📋",
      "Sure! I'll ask you a couple of quick questions to check your eligibility. ✅",
    ],
  },
  {
    key: 'eligible_yes',
    messages: [
      "Congratulations! 🎉 You are eligible to vote! Your voice matters in shaping India's future.",
      "Great news! ✅ You meet all the requirements to vote. Democracy needs you!",
      "Awesome! 🗳️ You're eligible! Make sure you're registered and ready to make your vote count!",
    ],
  },
  {
    key: 'registration_start',
    messages: [
      "Let me walk you through voter registration step by step! 📝",
      "Great! Here's how to register as a voter. I'll guide you through each step. 🚀",
      "Registration is easy! Let me break it down for you step by step. ✨",
    ],
  },
  {
    key: 'voting_day_start',
    messages: [
      "Here's your complete voting day guide! Follow these steps for a smooth experience. 🗳️",
      "Voting day can feel overwhelming, but I've got you covered! Here's what to do. 📋",
      "Let me walk you through voting day from start to finish! 🎯",
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/election-assistant');
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await ElectionTimeline.deleteMany({});
    await Guide.deleteMany({});
    await ResponseVariation.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert seed data
    await ElectionTimeline.insertMany(timelines);
    console.log(`📅 Inserted ${timelines.length} election timelines`);

    await Guide.insertMany(guides);
    console.log(`📋 Inserted ${guides.length} guides`);

    await ResponseVariation.insertMany(responseVariations);
    console.log(`💬 Inserted ${responseVariations.length} response variations`);

    console.log('\n🎉 Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
