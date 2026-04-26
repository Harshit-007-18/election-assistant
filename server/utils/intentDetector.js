const intents = {
  eligibility: [
    'eligible', 'can i vote', 'vote age', 'am i eligible', 'eligibility',
    'check eligibility', 'qualify', 'old enough', 'voter eligible', 'age to vote',
  ],
  registration: [
    'register', 'sign up', 'enroll', 'registration', 'register to vote',
    'how to register', 'voter id', 'epic card', 'voter card', 'form 6',
  ],
  timeline: [
    'date', 'schedule', 'election when', 'timeline', 'election date',
    'when is election', 'deadline', 'upcoming election', 'next election',
    'result date', 'registration deadline',
  ],
  voting_day: [
    'how to vote', 'voting process', 'voting day', 'cast vote', 'voting steps',
    'polling', 'booth', 'evm', 'ballot', 'vote day', 'election day',
  ],
  greeting: [
    'hi', 'hello', 'hey', 'good morning', 'good evening', 'namaste',
    'good afternoon', 'sup', 'howdy',
  ],
  help: [
    'help', 'what can you do', 'options', 'menu', 'start over', 'restart',
    'go back', 'main menu', 'back',
  ],
};

function detectIntent(message) {
  const lower = message.toLowerCase().trim();

  // Check multi-word phrases first (longer matches are more specific)
  const sortedIntents = Object.entries(intents).map(([intent, keywords]) => [
    intent,
    [...keywords].sort((a, b) => b.length - a.length),
  ]);

  for (const [intent, keywords] of sortedIntents) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return intent;
      }
    }
  }

  return 'unknown';
}

module.exports = { detectIntent };
