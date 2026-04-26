const User = require('../models/User');
const Guide = require('../models/Guide');
const ElectionTimeline = require('../models/ElectionTimeline');
const ResponseVariation = require('../models/ResponseVariation');

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu and Kashmir',
];

async function getVariation(key) {
  try {
    const variation = await ResponseVariation.findOne({ key });
    if (variation && variation.messages.length > 0) {
      return variation.messages[Math.floor(Math.random() * variation.messages.length)];
    }
  } catch (e) {
    /* fallback below */
  }
  return null;
}

function makeResponse(messages, quickReplies = null, progress = null) {
  return { messages: Array.isArray(messages) ? messages : [messages], quickReplies, progress };
}

function getMainMenu() {
  return ['✅ Check eligibility', '📋 Register to vote', '📅 Election timeline', '🗳️ Voting day steps'];
}

async function getGreetingResponse() {
  const variation = await getVariation('greeting');
  const msg = variation || "Hi there! 👋 I'm your Election Assistant. I can help you with voter eligibility, registration, election timelines, and voting day guidance.";
  return makeResponse([msg, 'What would you like to do?'], getMainMenu());
}

async function getHelpResponse() {
  const msg = "Here's what I can help you with:";
  return makeResponse(msg, getMainMenu());
}

async function getFallbackResponse() {
  const variation = await getVariation('fallback');
  const msg = variation || "I'm not sure I understood that. Let me show you what I can help with!";
  return makeResponse(msg, getMainMenu());
}

// ── Eligibility Flow ──
async function startEligibilityFlow(user) {
  user.currentFlow = 'eligibility';
  user.currentStep = 0;
  user.age = null;
  user.citizenship = null;
  user.isEligible = null;
  await user.save();

  const variation = await getVariation('eligibility_start');
  const msg = variation || "Let's check if you're eligible to vote! 🎯";
  return makeResponse([msg, 'What is your age?'], null, { current: 1, total: 3, label: 'Eligibility Check' });
}

async function continueEligibilityFlow(user, message) {
  const step = user.currentStep;

  if (step === 0) {
    const age = parseInt(message, 10);
    if (isNaN(age) || age < 1 || age > 150) {
      return makeResponse('Please enter a valid age (a number between 1 and 150).', null, { current: 1, total: 3, label: 'Eligibility Check' });
    }
    user.age = age;
    user.currentStep = 1;
    await user.save();
    return makeResponse('Are you a citizen of India?', ['Yes', 'No'], { current: 2, total: 3, label: 'Eligibility Check' });
  }

  if (step === 1) {
    const lower = message.toLowerCase().trim();
    const isYes = ['yes', 'y', 'yeah', 'yep', 'haan', 'ha'].includes(lower);
    const isNo = ['no', 'n', 'nope', 'nahi'].includes(lower);

    if (!isYes && !isNo) {
      return makeResponse('Please answer with Yes or No.', ['Yes', 'No'], { current: 2, total: 3, label: 'Eligibility Check' });
    }

    user.citizenship = isYes ? 'Indian' : 'Non-Indian';
    const eligible = user.age >= 18 && isYes;
    user.isEligible = eligible;
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();

    if (eligible) {
      const variation = await getVariation('eligible_yes');
      const msg = variation || `Great news! 🎉 At ${user.age} years old and as an Indian citizen, you are eligible to vote!`;
      return makeResponse(
        [msg, 'Would you like to register to vote or check your election timeline?'],
        ['📋 Register to vote', '📅 Election timeline', '🏠 Main menu'],
        { current: 3, total: 3, label: 'Eligibility Check' }
      );
    } else {
      let reason = '';
      if (user.age < 18) reason = `You need to be at least 18 years old. You are currently ${user.age}.`;
      if (!isYes) reason += (reason ? ' Also, o' : 'O') + 'nly Indian citizens are eligible to vote in Indian elections.';
      return makeResponse(
        [`Unfortunately, you are not eligible to vote at this time. ${reason}`, 'Is there anything else I can help you with?'],
        getMainMenu(),
        { current: 3, total: 3, label: 'Eligibility Check' }
      );
    }
  }

  user.currentFlow = null;
  user.currentStep = 0;
  await user.save();
  return getHelpResponse();
}

// ── Registration Flow ──
async function startRegistrationFlow(user) {
  user.currentFlow = 'registration';
  user.currentStep = 0;
  await user.save();

  const guide = await Guide.findOne({ type: 'registration' });
  if (!guide || guide.steps.length === 0) {
    user.currentFlow = null;
    await user.save();
    return makeResponse("I don't have registration steps available right now. Please try again later.", getMainMenu());
  }

  const variation = await getVariation('registration_start');
  const msg = variation || "Let me walk you through the voter registration process step by step! 📝";
  return makeResponse(
    [msg, `**Step 1 of ${guide.steps.length}:** ${guide.steps[0]}`],
    guide.steps.length > 1 ? ['Next step ➡️', '⏭️ Show all steps', '🏠 Main menu'] : ['🏠 Main menu'],
    { current: 1, total: guide.steps.length, label: 'Voter Registration' }
  );
}

async function continueRegistrationFlow(user, message) {
  const guide = await Guide.findOne({ type: 'registration' });
  if (!guide) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    return makeResponse('Guide data not available.', getMainMenu());
  }

  const lower = message.toLowerCase().trim();

  if (lower.includes('show all') || lower.includes('all steps')) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    const allSteps = guide.steps.map((s, i) => `**Step ${i + 1}.** ${s}`).join('\n\n');
    return makeResponse(
      [`Here are all the registration steps:\n\n${allSteps}`, 'Would you like help with anything else?'],
      getMainMenu()
    );
  }

  if (lower.includes('main menu') || lower.includes('back') || lower.includes('menu')) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    return getHelpResponse();
  }

  const nextStep = user.currentStep + 1;
  if (nextStep < guide.steps.length) {
    user.currentStep = nextStep;
    await user.save();
    const isLast = nextStep === guide.steps.length - 1;
    return makeResponse(
      `**Step ${nextStep + 1} of ${guide.steps.length}:** ${guide.steps[nextStep]}`,
      isLast ? ['✅ Done!', '🏠 Main menu'] : ['Next step ➡️', '⏭️ Show all steps', '🏠 Main menu'],
      { current: nextStep + 1, total: guide.steps.length, label: 'Voter Registration' }
    );
  }

  user.currentFlow = null;
  user.currentStep = 0;
  await user.save();
  return makeResponse(
    ["That's all the steps! 🎉 You're now ready to register as a voter.", 'Is there anything else I can help with?'],
    getMainMenu()
  );
}

// ── Timeline Flow ──
async function startTimelineFlow(user) {
  user.currentFlow = 'timeline';
  user.currentStep = 0;
  await user.save();

  const msg = 'Which state would you like to see the election timeline for? Type your state name.';
  const popularStates = ['Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh', 'Kerala'];
  return makeResponse(msg, popularStates);
}

async function continueTimelineFlow(user, message) {
  const lower = message.toLowerCase().trim();

  if (lower.includes('main menu') || lower.includes('back') || lower.includes('menu')) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    return getHelpResponse();
  }

  const matched = INDIAN_STATES.find((s) => s.toLowerCase() === lower);

  if (!matched) {
    const suggestion = INDIAN_STATES.find((s) => s.toLowerCase().includes(lower));
    if (suggestion) {
      return makeResponse(`Did you mean **${suggestion}**?`, [suggestion, '🏠 Main menu']);
    }
    return makeResponse("I couldn't find that state. Please type a valid Indian state name.", ['🏠 Main menu']);
  }

  user.state = matched;
  user.currentFlow = null;
  user.currentStep = 0;
  await user.save();

  const timeline = await ElectionTimeline.findOne({ state: matched });
  if (!timeline) {
    return makeResponse(`I don't have timeline data for ${matched} yet. Check back later!`, getMainMenu());
  }

  const fmt = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD');

  const info = [
    `📅 **Election Timeline for ${matched}**`,
    '',
    `📝 **Registration Deadline:** ${fmt(timeline.registrationDeadline)}`,
    `🗳️ **Election Date:** ${fmt(timeline.electionDate)}`,
    `📊 **Result Date:** ${fmt(timeline.resultDate)}`,
    timeline.notes ? `\n📌 **Note:** ${timeline.notes}` : '',
  ].filter(Boolean).join('\n');

  return makeResponse([info, 'Would you like to check another state or anything else?'], getMainMenu());
}

// ── Voting Day Flow ──
async function startVotingDayFlow(user) {
  user.currentFlow = 'voting_day';
  user.currentStep = 0;
  await user.save();

  const guide = await Guide.findOne({ type: 'voting_day' });
  if (!guide || guide.steps.length === 0) {
    user.currentFlow = null;
    await user.save();
    return makeResponse("Voting day guide isn't available right now.", getMainMenu());
  }

  const variation = await getVariation('voting_day_start');
  const msg = variation || "Here's your step-by-step voting day guide! 🗳️";
  return makeResponse(
    [msg, `**Step 1 of ${guide.steps.length}:** ${guide.steps[0]}`],
    guide.steps.length > 1 ? ['Next step ➡️', '⏭️ Show all steps', '🏠 Main menu'] : ['🏠 Main menu'],
    { current: 1, total: guide.steps.length, label: 'Voting Day Guide' }
  );
}

async function continueVotingDayFlow(user, message) {
  const guide = await Guide.findOne({ type: 'voting_day' });
  if (!guide) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    return makeResponse('Guide data not available.', getMainMenu());
  }

  const lower = message.toLowerCase().trim();

  if (lower.includes('show all') || lower.includes('all steps')) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    const allSteps = guide.steps.map((s, i) => `**Step ${i + 1}.** ${s}`).join('\n\n');
    return makeResponse(
      [`Here are all the voting day steps:\n\n${allSteps}`, 'Is there anything else I can help with?'],
      getMainMenu()
    );
  }

  if (lower.includes('main menu') || lower.includes('back') || lower.includes('menu')) {
    user.currentFlow = null;
    user.currentStep = 0;
    await user.save();
    return getHelpResponse();
  }

  const nextStep = user.currentStep + 1;
  if (nextStep < guide.steps.length) {
    user.currentStep = nextStep;
    await user.save();
    const isLast = nextStep === guide.steps.length - 1;
    return makeResponse(
      `**Step ${nextStep + 1} of ${guide.steps.length}:** ${guide.steps[nextStep]}`,
      isLast ? ['✅ Done!', '🏠 Main menu'] : ['Next step ➡️', '⏭️ Show all steps', '🏠 Main menu'],
      { current: nextStep + 1, total: guide.steps.length, label: 'Voting Day Guide' }
    );
  }

  user.currentFlow = null;
  user.currentStep = 0;
  await user.save();
  return makeResponse(
    ["You're all set for voting day! 🎉 Remember: every vote counts!", 'Anything else I can help with?'],
    getMainMenu()
  );
}

// ── Main Process ──
async function processMessage(sessionId, message, intent) {
  let user = await User.findOne({ sessionId });
  if (!user) {
    user = await User.create({ sessionId });
  }

  // If user is in a flow, continue it
  if (user.currentFlow) {
    // Allow user to break out of flow with help/menu
    if (intent === 'help') {
      user.currentFlow = null;
      user.currentStep = 0;
      await user.save();
      return getHelpResponse();
    }

    switch (user.currentFlow) {
      case 'eligibility': return continueEligibilityFlow(user, message);
      case 'registration': return continueRegistrationFlow(user, message);
      case 'timeline': return continueTimelineFlow(user, message);
      case 'voting_day': return continueVotingDayFlow(user, message);
      default:
        user.currentFlow = null;
        user.currentStep = 0;
        await user.save();
        return getHelpResponse();
    }
  }

  // Start new flow based on intent
  switch (intent) {
    case 'eligibility': return startEligibilityFlow(user);
    case 'registration': return startRegistrationFlow(user);
    case 'timeline': return startTimelineFlow(user);
    case 'voting_day': return startVotingDayFlow(user);
    case 'greeting': return getGreetingResponse();
    case 'help': return getHelpResponse();
    default: return getFallbackResponse();
  }
}

module.exports = { processMessage };
