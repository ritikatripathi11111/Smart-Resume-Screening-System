// Mock AI service — simulates Gemini API responses with realistic latency.
// In production, swap these implementations with actual Gemini API calls.

import type { Candidate, Job } from './supabase';

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SKILL_UNIVERSE = [
  'React', 'TypeScript', 'Next.js', 'Vue', 'Angular', 'Svelte', 'Node.js',
  'GraphQL', 'REST', 'Tailwind CSS', 'CSS', 'HTML', 'JavaScript', 'Python',
  'Java', 'Go', 'Rust', 'AWS', 'Docker', 'Kubernetes', 'PostgreSQL', 'MongoDB',
  'Redis', 'Jest', 'Cypress', 'Storybook', 'Figma', 'Webpack', 'Vite',
  'Express', 'NestJS', 'Prisma', 'Redux', 'Three.js', 'WebGL', 'CI/CD',
  'Terraform', 'Linux', 'Git', 'Microservices', 'System Design',
];

const FIRST_NAMES = ['Emma','Michael','Olivia','Daniel','Sophia','Ethan','Ava','Noah','Isabella','Liam','Mia','Lucas','Charlotte','Mason','Amelia','Logan','Harper','Henry','Evelyn','Jack'];
const LAST_NAMES = ['Anderson','Thompson','Garcia','Martinez','Robinson','Clark','Lewis','Walker','Hall','Young','King','Wright','Lopez','Hill','Scott','Green','Adams','Baker','Nelson','Carter'];
const COMPANIES = ['TechCorp','StartupX','BigTech Inc','EnterpriseSoft','FintechCo','CloudWave','DataMine','ByteForge','NexusLabs','QuantumIO','DevHub','PixelPush'];
const SCHOOLS = ['MIT','Stanford','UC Berkeley','Georgia Tech','Carnegie Mellon','UT Austin','Univ. of Washington','Columbia','Cornell','UIUC'];
const LOCATIONS = ['San Francisco, CA','New York, NY','Austin, TX','Seattle, WA','Remote','Boston, MA','Denver, CO','Chicago, IL','Portland, OR','Atlanta, GA'];
const SOURCES = ['LinkedIn','Indeed','Referral','AngelList','Company Website','Hacker News','Glassdoor'];
const STATUSES = ['new','reviewing','shortlisted','interview','offer','rejected'];

function rand<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function sample<T>(arr: T[], n: number): T[] {
  const copy = [...arr];
  const out: T[] = [];
  for (let i = 0; i < n && copy.length; i++) {
    out.push(copy.splice(Math.floor(Math.random() * copy.length), 1)[0]);
  }
  return out;
}

// ---------- Resume Parsing ----------
export type ParsedResume = {
  name: string;
  email: string;
  phone: string;
  location: string;
  job_title: string;
  current_company: string;
  years_experience: number;
  education: string;
  skills: string[];
  confidence: number;
};

export async function parseResume(fileName: string): Promise<ParsedResume> {
  await delay(1400 + randInt(0, 1600));
  const first = rand(FIRST_NAMES);
  const last = rand(LAST_NAMES);
  return {
    name: `${first} ${last}`,
    email: `${first.toLowerCase()}.${last.toLowerCase()}@email.com`,
    phone: `+1 (${randInt(200,989)}) ${randInt(200,989)}-${randInt(1000,9999)}`,
    location: rand(LOCATIONS),
    job_title: rand(['Senior Frontend Engineer','Software Engineer','Full Stack Developer','Frontend Developer','Lead Engineer','Staff Engineer']),
    current_company: rand(COMPANIES),
    years_experience: randInt(2, 12),
    education: rand(SCHOOLS) + ', ' + rand(['BS Computer Science','MS Software Engineering','BS Information Systems','MS Computer Engineering','BS Computer Engineering']),
    skills: sample(SKILL_UNIVERSE, randInt(6, 14)),
    confidence: randInt(78, 99),
  };
}

// ---------- Candidate Intelligence ----------
export async function generateCandidateIntelligence(resume: ParsedResume, job?: Job | null) {
  await delay(900 + randInt(0, 1200));
  const skillsMatch = randInt(60, 99);
  const expMatch = randInt(60, 99);
  const eduMatch = randInt(55, 98);
  const domainMatch = randInt(60, 97);
  const softMatch = randInt(65, 99);
  const matchScore = Math.round((skillsMatch + expMatch + eduMatch + domainMatch + softMatch) / 5);

  const strengths = [
    `Strong proficiency in ${resume.skills.slice(0, 2).join(' and ')}`,
    rand(['Excellent problem-solving track record','Clear, structured communication','Proven mentorship ability','Adapts quickly to new stacks','Strong product sensibility']),
    rand(['Reliable delivery on large projects','Cross-functional collaboration','Data-driven decision making','Ownership mindset']),
  ];
  const weaknesses = [
    rand(['Limited experience with large-scale systems','Could deepen testing practices','Few public contributions','Gaps in distributed systems knowledge','Junior in system design']),
    `Less depth in ${sample(SKILL_UNIVERSE.filter(s => !resume.skills.includes(s)), 1)[0]}`,
  ];

  return {
    skills: resume.skills,
    match_score: matchScore,
    match_breakdown: { skills: skillsMatch, experience: expMatch, education: eduMatch, domain: domainMatch, soft: softMatch },
    ai_summary: `${resume.name} is a ${resume.years_experience}-year ${resume.job_title.toLowerCase()} currently at ${resume.current_company}. ` +
      `They demonstrate solid expertise in ${resume.skills.slice(0,3).join(', ')}, with a ${matchScore >= 85 ? 'strong' : matchScore >= 70 ? 'reasonable' : 'developing'} ` +
      `alignment to the role. ${matchScore >= 85 ? 'A high-impact hire with clear growth runway.' : 'Would benefit from targeted upskilling.'}`,
    strengths,
    weaknesses,
    career_growth_prediction: `${matchScore >= 85 ? 'High trajectory toward staff/principal within 2-3 years.' : matchScore >= 70 ? 'On track for senior role within 18-24 months with focused growth.' : 'Growth path needs mentoring and structured development.'}`,
    leadership_potential: randInt(50, 95),
    communication_score: randInt(60, 95),
    learning_ability_score: randInt(65, 95),
    culture_fit_score: randInt(60, 92),
    job_switch_probability: randInt(30, 75),
    risk_indicators: randInt(0,100) > 70 ? [{ type: 'skill_inflation', detail: `Skill depth claims exceed project tenure for 2 skills`, severity: 'medium' }] : [],
    fraud_risk_score: randInt(3, 28),
    salary_expectation: randInt(110, 190) * 1000,
    source: rand(SOURCES),
    status: 'new',
  };
}

// ---------- Job Description Builder ----------
export type JDInput = {
  role: string;
  experience: string;
  skills: string[];
  location: string;
  salary: string;
};

export async function generateJobDescription(input: JDInput): Promise<{
  title: string;
  description: string;
  responsibilities: string[];
  required_skills: string[];
  preferred_skills: string[];
}> {
  await delay(1200 + randInt(0, 1400));
  const skillsList = input.skills.length ? input.skills : ['React','TypeScript','Node.js'];
  const role = input.role || 'Senior Software Engineer';
  const level = input.experience || '5+ years';

  return {
    title: `${role}`,
    description: `We are seeking an exceptional ${role} to join our growing team. In this ${level} role, you will ` +
      `architect and build high-impact features, collaborate with cross-functional teams, and shape our technical ` +
      `direction. This is an opportunity to work with modern technologies (${skillsList.slice(0,4).join(', ')}) ` +
      `in ${input.location || 'a flexible location'} and make a meaningful difference for our customers. ` +
      `${input.salary ? `Compensation range: ${input.salary}.` : ''}`,
    responsibilities: [
      `Design, develop, and ship core ${role.toLowerCase()} features end-to-end`,
      'Collaborate with product, design, and backend teams to define and deliver roadmap',
      'Write clean, well-tested, maintainable code with strong documentation',
      'Mentor junior engineers and contribute to code review culture',
      'Drive technical decisions and architecture for your domain',
      'Participate in on-call rotation and incident response',
    ],
    required_skills: skillsList.slice(0, Math.min(6, skillsList.length)),
    preferred_skills: sample(SKILL_UNIVERSE.filter(s => !skillsList.includes(s)), 4),
  };
}

// ---------- Interview Question Generation ----------
export type InterviewQuestionResult = {
  category: string;
  difficulty: string;
  question: string;
  ideal_answer: string;
  follow_ups: string[];
};

const QUESTION_BANK: { category: string; difficulty: string; question: string; ideal_answer: string; follow_ups: string[] }[] = [
  { category: 'technical', difficulty: 'easy', question: `Walk me through how the virtual DOM works in React and why it matters.`,
    ideal_answer: `The virtual DOM is an in-memory representation of the real DOM. React diffs the new tree against the old one, computes the minimal set of changes, and applies only those to the real DOM. This avoids expensive direct DOM manipulation and improves rendering performance.`,
    follow_ups: [`How does this compare to reconciliation?`, `When might the virtual DOM not help performance?`] },
  { category: 'technical', difficulty: 'medium', question: `Design the data flow for a real-time collaborative document editor.`,
    ideal_answer: `A strong answer covers CRDTs or OT for conflict resolution, WebSocket transport, presence/awareness, a server to broker updates, debounced persistence, and handling offline edits with a local queue. Mention backpressure and ordering guarantees.`,
    follow_ups: [`How would you handle offline edits?`, `Why CRDTs over operational transform?`] },
  { category: 'technical', difficulty: 'hard', question: `You ship a feature and page load time regresses by 2s. Walk me through your debugging approach.`,
    ideal_answer: `Measure first with Lighthouse/DevTools. Check bundle size, waterfalls, long tasks. Identify the largest contributors (chunk size, blocking scripts, images, API waterfalls). Apply code-splitting, lazy loading, caching, or SSR. Re-measure and set a perf budget.`,
    follow_ups: [`How do you set a performance budget?`, `What metrics beyond load time matter?`] },
  { category: 'behavioral', difficulty: 'medium', question: `Tell me about a time you disagreed with a technical decision your team made.`,
    ideal_answer: `STAR format. Situation: describe the project. Task: the decision in question. Action: how you raised concerns constructively, sought data, proposed alternatives, and committed once decided. Result: positive outcome and what was learned.`,
    follow_ups: [`What would you do differently?`, `How do you decide when to push vs commit?`] },
  { category: 'behavioral', difficulty: 'easy', question: `Describe a project you're proud of and why.`,
    ideal_answer: `Pick a project with clear impact. Explain the problem, your specific role, the technical challenges, and measurable outcomes. Show ownership and learning.`,
    follow_ups: [`What was the hardest part?`, `What would you build differently?`] },
  { category: 'hr', difficulty: 'easy', question: `Why are you looking to leave your current role?`,
    ideal_answer: `A constructive, forward-looking answer focused on growth, new challenges, or alignment with the company mission — never disparaging the current employer.`,
    follow_ups: [`What's your ideal next role?`, `Where do you see yourself in 3 years?`] },
  { category: 'scenario', difficulty: 'medium', question: `A stakeholder asks for a feature that conflicts with an existing architectural decision. How do you handle it?`,
    ideal_answer: `Acknowledge the need, analyze the trade-off against the existing decision, document options with pros/cons and impact, engage the original decision-makers, and drive to alignment — escalating only if needed.`,
    follow_ups: [`How do you communicate technical trade-offs to non-technical stakeholders?`, `When do you escalate?`] },
  { category: 'technical', difficulty: 'medium', question: `Explain how you would implement a debounce function from scratch.`,
    ideal_answer: `A debounce returns a wrapper that delays invoking the function until a quiet period elapses, resetting the timer on each call. Use a closure to hold the timer, clear it on each call, and set a new setTimeout.`,
    follow_ups: [`How does this differ from throttle?`, `How would you implement leading-edge debounce?`] },
  { category: 'behavioral', difficulty: 'hard', question: `Tell me about a time you failed at something important. What did you learn?`,
    ideal_answer: `Genuine failure with real stakes, ownership of the mistake, specific lessons, and changed behavior. Avoid humblebrags.`,
    follow_ups: [`How do you create psychological safety for failure on your team?`, `How do you decide what to escalate?`] },
  { category: 'scenario', difficulty: 'hard', question: `You inherit a codebase with no tests and recurring production bugs. What's your 90-day plan?`,
    ideal_answer: `Weeks 1-2: observe, instrument, write characterization tests around hotspots. Weeks 3-6: add tests to the most-broken areas, set up CI gates. Weeks 7-12: refactor incrementally, introduce test coverage thresholds, and establish a quality culture.`,
    follow_ups: [`How do you balance features vs quality?`, `How do you measure progress?`] },
];

export async function generateInterviewQuestions(opts: {
  category: string;
  difficulty: string;
  count?: number;
}): Promise<InterviewQuestionResult[]> {
  await delay(1000 + randInt(0, 1200));
  const { category, difficulty, count = 3 } = opts;
  const pool = QUESTION_BANK.filter(q =>
    (category === 'all' || q.category === category) &&
    (difficulty === 'all' || q.difficulty === difficulty)
  );
  const selected = pool.length >= count ? sample(pool, count) : [...pool, ...sample(QUESTION_BANK, count - pool.length)];
  return selected.map(q => ({ ...q }));
}

// ---------- Skill Gap Analysis ----------
export async function generateSkillGap(candidate: Candidate, job: Job | null): Promise<{
  missing_skills: string[];
  weak_skills: string[];
  suggested_certifications: string[];
  learning_roadmap: { phase: string; duration: string; focus: string }[];
  recommendations: string[];
}> {
  await delay(900 + randInt(0, 1000));
  const required = job?.skills || ['React','TypeScript','Next.js','GraphQL'];
  const requiredSkills = required.length ? required : ['React','TypeScript','Next.js','GraphQL'];
  const missing = requiredSkills.filter(s => !candidate.skills.includes(s));
  const weak = candidate.skills.filter(s => requiredSkills.includes(s) && randInt(0,100) > 65).slice(0, 2);
  return {
    missing_skills: missing.length ? missing : sample(SKILL_UNIVERSE, 1),
    weak_skills: weak.length ? weak : [rand(SKILL_UNIVERSE)],
    suggested_certifications: ['AWS Certified Developer Associate','Advanced React Patterns (Frontend Masters)','System Design Fundamentals','Testing JavaScript by Kent C. Dodds'].slice(0, 3),
    learning_roadmap: [
      { phase: 'Phase 1: Foundations', duration: '2-4 weeks', focus: `Deepen ${missing[0] || 'core skills'} fundamentals through structured courses and small projects` },
      { phase: 'Phase 2: Applied Practice', duration: '4-6 weeks', focus: 'Build production-grade projects integrating the new skills' },
      { phase: 'Phase 3: Advanced Topics', duration: '6-8 weeks', focus: 'System design, performance, and architectural patterns' },
    ],
    recommendations: [
      `Pair ${candidate.name} with a mentor skilled in ${missing[0] || 'the gap area'}`,
      'Assign a stretch project to develop the missing skills in a real context',
      'Encourage participation in code reviews to build depth across the stack',
      'Re-assess in 90 days with a practical evaluation',
    ],
  };
}

// ---------- AI Career Twin ----------
export async function generateCareerTwin(candidate: Candidate): Promise<{
  one_year: { role: string; probability: number; focus: string };
  three_year: { role: string; probability: number; focus: string };
  leadership: { trajectory: string; readiness: number };
  insights: string[];
}> {
  await delay(900 + randInt(0, 1000));
  const baseScore = candidate.match_score || 75;
  return {
    one_year: {
      role: baseScore >= 85 ? 'Senior Engineer / Tech Lead' : 'Mid-Senior Engineer',
      probability: randInt(70, 95),
      focus: baseScore >= 85 ? 'Ownership of a critical product line' : 'Lead a feature team and own delivery',
    },
    three_year: {
      role: baseScore >= 85 ? 'Staff / Principal Engineer' : 'Senior Engineer / Team Lead',
      probability: randInt(55, 88),
      focus: baseScore >= 85 ? 'Architecture & org-wide technical influence' : 'System design and mentorship',
    },
    leadership: {
      trajectory: baseScore >= 85 ? 'Strong IC leadership trajectory; potential move to staff or management' : 'Developing leadership; pair with senior mentors',
      readiness: randInt(55, 92),
    },
    insights: [
      `Based on skill velocity, ${candidate.name} is in the top ${baseScore >= 85 ? '15' : '35'}% for growth trajectory.`,
      'Adjacent skill clusters suggest strong potential in ' + rand(['developer tooling','performance engineering','developer experience','platform engineering']),
      'Current trajectory suggests readiness for expanded scope within 12-18 months.',
    ],
  };
}

// ---------- Recruiter Copilot ----------
export async function recruiterCopilotQuery(query: string, candidates: Candidate[]): Promise<string> {
  await delay(700 + randInt(0, 900));
  const q = query.toLowerCase();

  if (q.includes('top') && q.includes('react')) {
    const top = [...candidates].filter(c => c.skills.some(s => s.toLowerCase().includes('react')))
      .sort((a,b) => b.match_score - a.match_score).slice(0,3);
    if (!top.length) return "I couldn't find any candidates with React experience in the current pool.";
    return `Here are the top ${top.length} React candidates:\n\n` +
      top.map((c,i) => `${i+1}. **${c.name}** — Match score ${c.match_score}, ${c.years_experience}y exp, $${(c.salary_expectation||150000).toLocaleString()} expected`).join('\n');
  }
  if (q.includes('compare') && q.includes('docker')) {
    const withDocker = candidates.filter(c => c.skills.some(s => s.toLowerCase().includes('docker')));
    return `Found ${withDocker.length} candidates with Docker experience: ${withDocker.map(c=>c.name).join(', ') || 'none'}. Use the Comparison Matrix to view their detailed breakdowns side by side.`;
  }
  if (q.includes('budget') || q.includes('under')) {
    const budgetMatch = query.match(/\$?(\d{3,})/);
    if (budgetMatch) {
      const budget = parseInt(budgetMatch[1]) * 1000;
      const under = candidates.filter(c => (c.salary_expectation||0) <= budget)
        .sort((a,b)=> (b.match_score)-(a.match_score));
      if (!under.length) return `No candidates found under $${budget.toLocaleString()}. The lowest expectation is $${Math.min(...candidates.map(c=>c.salary_expectation||999999)).toLocaleString()}.`;
      return `Best candidate under $${budget.toLocaleString()}:\n\n**${under[0].name}** — Score ${under[0].match_score}, $${(under[0].salary_expectation||0).toLocaleString()} (${under[0].years_experience} years experience, ${under[0].skills.length} skills).`;
    }
  }
  if (q.includes('shortlist') || q.includes('strong')) {
    const strong = [...candidates].filter(c => c.match_score >= 85).sort((a,b)=> b.match_score-a.match_score);
    if (!strong.length) return 'No candidates currently meet the 85+ strong-match threshold.';
    return `${strong.length} candidates are strong matches (85+):\n\n` +
      strong.map(c=>`• **${c.name}** — ${c.match_score}, strengths: ${(c.strengths||[])[0] || 'n/a'}`).join('\n');
  }
  if (q.includes('risk') || q.includes('fraud')) {
    const risky = candidates.filter(c => (c.fraud_risk_score||0) > 20);
    if (!risky.length) return 'No candidates currently have elevated fraud risk scores.';
    return `${risky.length} candidate(s) have elevated fraud/risk indicators:\n\n` +
      risky.map(c=>`• **${c.name}** — Risk ${c.fraud_risk_score}, ${(c.risk_indicators||[])[0]?.detail || 'review needed'}`).join('\n');
  }
  return `I can help with questions like:\n• "Show top React candidates"\n• "Compare candidates with Docker experience"\n• "Find best candidate under $160k"\n• "Who are the strongest matches?"\n• "Any candidates with fraud risk?"\n\nTry asking about your pool of ${candidates.length} candidates.`;
}

// ---------- Resume Enhancer ----------
export async function analyzeResumeATS(fileName: string): Promise<{
  ats_score: number;
  formatting: string[];
  keywords: { missing: string[]; present: string[] };
  suggestions: string[];
}> {
  await delay(1100 + randInt(0, 1000));
  return {
    ats_score: randInt(62, 94),
    formatting: [
      'Use a single-column layout — multi-column resumes break ATS parsing',
      'Avoid text inside images or graphics; ATS cannot read them',
      'Use standard section headers: Experience, Education, Skills',
      'Ensure consistent date formatting (MM/YYYY)',
    ],
    keywords: {
      missing: sample(SKILL_UNIVERSE, randInt(2,4)),
      present: sample(SKILL_UNIVERSE, randInt(3,6)),
    },
    suggestions: [
      'Add a concise summary at the top with 3-4 key skills',
      'Quantify achievements with metrics (e.g., "reduced load time by 40%")',
      'Mirror job description keywords naturally throughout the resume',
      'Keep to 1-2 pages maximum with 10-12pt readable font',
      'Save as PDF with selectable, parsable text',
    ],
  };
}

// ---------- Voice Interview Analyzer ----------
export async function analyzeVoiceInterview(fileName: string): Promise<{
  confidence: number;
  fluency: number;
  clarity: number;
  leadership_signals: number;
  pace_wpm: number;
  filler_count: number;
  summary: string;
  insights: string[];
}> {
  await delay(1400 + randInt(0, 1400));
  const conf = randInt(60, 95);
  return {
    confidence: conf,
    fluency: randInt(65, 95),
    clarity: randInt(68, 96),
    leadership_signals: randInt(50, 90),
    pace_wpm: randInt(120, 175),
    filler_count: randInt(3, 22),
    summary: conf >= 80
      ? `Strong delivery. The candidate spoke with clear structure, appropriate pace, and conveyed authority. Minor filler words used occasionally. Recommended to proceed to next stage.`
      : `Decent delivery with room for improvement. Candidate showed hesitation in technical explanation sections. Recommend coaching on structuring answers with the STAR method.`,
    insights: [
      'Used "I" statements frequently — high ownership signal',
      'Pace slightly above ideal range — consider pausing before key points',
      'Strong closure on behavioral answers',
    ],
  };
}
