import type {
  ActionGuide,
  GuideStep,
  SavedPlan,
  StepDetail,
  StudentProfile,
  TrackRecommendation,
} from '../types';
import { getGradeLabel } from '../lib/grades';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function primaryInterest(profile: StudentProfile): string {
  return profile.interests[0] ?? `academic`;
}

function growthNote(pastPlans: SavedPlan[]): string {
  if (pastPlans.length === 0) return ``;
  const latest = pastPlans[0];
  const date = new Date(latest.createdAt).toLocaleDateString(undefined, {
    month: `short`,
    day: `numeric`,
    year: `numeric`,
  });
  return ` Building on your past plan "${latest.track.title}" (${date}), we're suggesting your next step forward.`;
}

export async function generateTrackRecommendations(
  profile: StudentProfile,
  pastPlans: SavedPlan[] = []
): Promise<TrackRecommendation[]> {
  await delay(2200);
  const interest = primaryInterest(profile);
  const name = profile.name || `Student`;
  const growth = growthNote(pastPlans);

  return [
    {
      id: `track-research`,
      title: `Launch a ${interest}-focused research project`,
      summary: `Design and start a small independent or mentor-led research project you can complete before senior year.`,
      matchReason: `${name}, your strengths in ${profile.strengths.slice(0, 2).join(' and ') || 'academics'} pair well with a structured research portfolio for "${profile.goals[0]?.slice(0, 80) ?? 'your goals'}".${growth}`,
      timeHorizon: `8–12 weeks`,
      difficulty: `intermediate`,
      category: `research`,
      tags: [interest, `Portfolio`, `Pre-college`],
    },
    {
      id: `track-internship`,
      title: `Apply to a competitive summer program or internship`,
      summary: `Target one high-impact program (NIH SIP, RSI, or a local lab) aligned with your grade and interests.`,
      matchReason: `${getGradeLabel(profile.grade)} is the ideal window to secure hands-on experience that admissions readers recognize.`,
      timeHorizon: `4–6 weeks to apply`,
      difficulty: `advanced`,
      category: `internship`,
      tags: [`Summer`, interest, `Application`],
    },
    {
      id: `track-leadership`,
      title: `Level up leadership in an existing activity`,
      summary: `Turn ${profile.extracurriculars[0] ?? 'one extracurricular'} into a measurable impact story with clear outcomes.`,
      matchReason: `You already participate in ${profile.extracurriculars.length} activities — deepening one beats adding many shallow ones.`,
      timeHorizon: `This semester`,
      difficulty: `beginner`,
      category: `extracurricular`,
      tags: [`Leadership`, `Impact`, `Story`],
    },
    {
      id: `track-college-prep`,
      title: `Build your college list & application timeline`,
      summary: `Research fit schools, map deadlines, and create a semester plan tied to your goals.`,
      matchReason: `Your stated goal — "${(profile.goals[0] ?? '').slice(0, 60)}${(profile.goals[0]?.length ?? 0) > 60 ? '…' : ''}" — needs a concrete school and deadline strategy now.`,
      timeHorizon: `2–3 weeks`,
      difficulty: `intermediate`,
      category: `college`,
      tags: [`College list`, `Deadlines`, `Planning`],
    },
  ];
}

export async function generateActionGuide(
  profile: StudentProfile,
  track: TrackRecommendation,
  pastPlans: SavedPlan[] = []
): Promise<ActionGuide> {
  await delay(2800);
  const prior = pastPlans[0];
  const continuity =
    prior && prior.track.id !== track.id
      ? ` This plan follows your earlier work on "${prior.track.title}" — use what you learned there as a foundation.`
      : ``;

  const guides: Record<string, Partial<ActionGuide>> = {
    'track-research': {
      overview: `A step-by-step path to start a credible ${primaryInterest(profile)} research project, from topic selection through a shareable output.`,
      estimatedDuration: `8–12 weeks`,
      prerequisites: [`Stable weekly time block (4–6 hrs)`, `Faculty or mentor contact`, `Basic lab safety if wet lab`],
    },
    'track-internship': {
      overview: `How to identify, apply to, and follow up on competitive programs matched to ${getGradeLabel(profile.grade)} students.`,
      estimatedDuration: `4–6 weeks (application cycle)`,
      prerequisites: [`Updated resume/activities list`, `2 recommenders identified`, `Transcript request plan`],
    },
    'track-leadership': {
      overview: `Transform ${profile.extracurriculars[0] ?? 'your main activity'} into a leadership narrative with metrics admissions teams understand.`,
      estimatedDuration: `One semester`,
      prerequisites: [`Current role documented`, `Advisor/coach buy-in`, `SMART goal drafted`],
    },
    'track-college-prep': {
      overview: `Research-backed process to build a balanced college list and backward-plan from application deadlines.`,
      estimatedDuration: `2–3 weeks`,
      prerequisites: [`Family budget/financial aid conversation`, `Test policy research`, `Initial GPA/rigor snapshot`],
    },
  };

  const base = guides[track.id] ?? guides['track-college-prep'];

  return {
    trackId: track.id,
    trackTitle: track.title,
    overview: `${base.overview ?? track.summary}${continuity}`,
    estimatedDuration: base.estimatedDuration ?? track.timeHorizon,
    prerequisites: base.prerequisites ?? [],
    steps: buildSteps(track, profile),
    resources: buildResources(track, profile),
    weeklyMilestones: buildMilestones(track),
  };
}

function buildSteps(track: TrackRecommendation, profile: StudentProfile) {
  const interest = primaryInterest(profile);
  if (track.id === `track-research`) {
    return [
      { id: `s1`, order: 1, title: `Define a narrow research question`, description: `Pick one question answerable in 8–12 weeks. Example: "How does X affect Y in ${interest}?"`, tips: [`Search Google Scholar for 5 recent papers`, `Ask a teacher if the question is feasible`] },
      { id: `s2`, order: 2, title: `Find a mentor`, description: `Email 3 teachers or local university faculty with a 150-word intro and your question.`, tips: [`Attach a one-page resume`, `Propose a 30-min meeting, not a long commitment yet`] },
      { id: `s3`, order: 3, title: `Create a methods plan`, description: `Document data sources, tools, and weekly milestones.`, tips: [`Use a simple lab notebook or Notion template`] },
      { id: `s4`, order: 4, title: `Execute & document weekly`, description: `Log hours, setbacks, and results. Aim for a poster, blog post, or competition submission.`, tips: [`Science fairs and Regeneron ISEF pathways are common outlets`] },
    ];
  }
  if (track.id === `track-internship`) {
    return [
      { id: `s1`, order: 1, title: `Shortlist 3 programs`, description: `Match grade requirements and deadlines to your profile.`, tips: [`NIH SIP, RSI, and local hospital labs are strong for pre-med`] },
      { id: `s2`, order: 2, title: `Prepare application packet`, description: `Resume, transcript, essays, and recommender requests — start 6 weeks before deadline.`, tips: [`Give recommenders 3 weeks minimum`] },
      { id: `s3`, order: 3, title: `Submit & track confirmations`, description: `Submit early; confirm portal receipts and follow up politely if needed.`, tips: [] },
    ];
  }
  if (track.id === `track-leadership`) {
    return [
      { id: `s1`, order: 1, title: `Audit your current impact`, description: `List hours, role, and outcomes from ${profile.extracurriculars[0] ?? 'your activity'}.`, tips: [] },
      { id: `s2`, order: 2, title: `Propose one measurable initiative`, description: `e.g. recruit 5 members, run 3 events, raise $500, publish an issue.`, tips: [`Get advisor sign-off in writing`] },
      { id: `s3`, order: 3, title: `Execute & collect proof`, description: `Photos, attendance sheets, and testimonials for your activities list.`, tips: [] },
    ];
  }
  return [
    { id: `s1`, order: 1, title: `Clarify priorities with family`, description: `Discuss budget, location, and size preferences.`, tips: [] },
    { id: `s2`, order: 2, title: `Build a balanced list (reach/match/safety)`, description: `Aim for 8–12 schools using Common Data Set and net price calculators.`, tips: [] },
    { id: `s3`, order: 3, title: `Map deadlines on a calendar`, description: `ED/EA/RD, FAFSA/CSS, and scholarship dates in one view.`, tips: [] },
  ];
}

function buildResources(track: TrackRecommendation, profile: StudentProfile) {
  const interest = encodeURIComponent(primaryInterest(profile));
  const common = [
    { title: `College Board BigFuture`, url: `https://bigfuture.collegeboard.org/`, description: `College search and planning tools` },
    { title: `Common App`, url: `https://www.commonapp.org/`, description: `Application portal for 1000+ schools` },
  ];
  if (track.category === `research`) {
    return [
      { title: `Google Scholar`, url: `https://scholar.google.com/`, description: `Find papers on ${profile.interests[0] ?? 'your topic'}` },
      { title: `Regeneron ISEF`, url: `https://www.societyforscience.org/isef/`, description: `Science fair competition pathway` },
      ...common,
    ];
  }
  if (track.category === `internship`) {
    return [
      { title: `NIH Summer Internship Program`, url: `https://www.training.nih.gov/programs/sip`, description: `Biomedical research for high school students` },
      { title: `RSI at MIT`, url: `https://www.cee.org/research-science-institute`, description: `Elite summer research program` },
      ...common,
    ];
  }
  if (track.category === `extracurricular`) {
    return [
      { title: `Harvard Making Caring Common`, url: `https://mcc.gse.harvard.edu/`, description: `Service and leadership frameworks` },
      ...common,
    ];
  }
  return [
    { title: `US News College Search`, url: `https://www.usnews.com/best-colleges`, description: `Compare programs and rankings` },
    { title: `Net Price Calculator (Federal)`, url: `https://collegecost.ed.gov/net-price`, description: `Estimate financial aid by school` },
    { title: `Niche — ${profile.interests[0] ?? 'programs'}`, url: `https://www.niche.com/colleges/search/?q=${interest}`, description: `Student reviews and fit signals` },
    ...common,
  ];
}

const STEP_DETAIL_LIBRARY: Record<string, Omit<StepDetail, 'generatedAt'>> = {
  'track-internship:s1': {
    overview: `Amazon Bedrock analyzed your profile and mapped three program tiers: national research internships (NIH SIP, RSI), regional hospital/university labs, and virtual or part-time opportunities. The goal this week is a realistic shortlist with deadlines you can actually hit — not a list of dream programs you will miss.`,
    estimatedTime: `4–6 hours over 5–7 days`,
    actionItems: [
      `Create a spreadsheet with columns: Program name, URL, Grade eligibility, Deadline (date + timezone), Materials required, Recommenders needed, Status.`,
      `Tier A (reach): Add 1 national program — e.g. NIH Summer Internship Program or Research Science Institute if you meet grade/age rules.`,
      `Tier B (target): Add 1–2 regional options — hospital volunteer research, university faculty lab, or city science consortium programs.`,
      `Tier C (safety): Add 1 local or virtual program with rolling or later deadlines so you still gain experience if Tier A/B are competitive.`,
      `For each program, copy the official eligibility page and highlight requirements you already meet vs. gaps (GPA, coursework, citizenship).`,
      `Email your school counselor or science teacher: ask if past students attended these programs and whether the school has a recommender workflow.`,
    ],
    tips: [
      `Deadlines often fall in January–March for summer — note whether materials must be submitted by 11:59pm local or Eastern time.`,
      `Many programs use separate portals (not Common App) — create accounts early to avoid last-day crashes.`,
      `If you are under 16, filter for programs that explicitly accept your age — some labs require 16+ for safety/legal reasons.`,
    ],
  },
  'track-internship:s2': {
    overview: `Bedrock recommends treating your application packet as a small project: each document should tell the same story (your interest, preparation, and reliability) with different evidence. Start six weeks before the earliest deadline on your shortlist.`,
    estimatedTime: `2–3 weeks (spread across 6 weeks before deadline)`,
    actionItems: [
      `Resume (1 page): Lead with education, then Research/STEM experience, then Activities. Quantify where possible (hours/week, outcomes).`,
      `Activities list: Mirror language you will use in essays — one theme (e.g. pre-med, engineering) across all items.`,
      `Transcript: Request official or unofficial copy per program rules; allow 5–10 school days for processing.`,
      `Essays: Draft 2 versions — (1) why this program, (2) what you will contribute. Use specific examples from classes and extracurriculars.`,
      `Recommenders: Ask 2 teachers (science + another) at least 3 weeks before deadline; provide resume, brag sheet, and program description.`,
      `Create a shared folder (Google Drive) with PDFs named ProgramName_LastName_2025.pdf for each submission.`,
    ],
    tips: [
      `Give recommenders a table: Program | Deadline | Portal link | What they need to upload.`,
      `Avoid generic essays — name the program's mission and one unique opportunity (lab, mentor model, location).`,
    ],
  },
  'track-internship:s3': {
    overview: `Submission week is about confirmation and professionalism. Programs receive hundreds of applications; a complete, early file with proof of receipt reduces stress and shows maturity.`,
    estimatedTime: `3–5 days around each deadline`,
    actionItems: [
      `Submit at least 48 hours before the listed deadline when the portal allows early submission.`,
      `Screenshot or PDF the confirmation page immediately after each submit — include application ID if shown.`,
      `Send a brief thank-you email to recommenders the day they submit (or when you see portal status "received").`,
      `If status stays "incomplete" after 72 hours, email the program coordinator with your name, ID, and missing item.`,
      `Log outcomes in your spreadsheet: Submitted date, Confirmation saved (Y/N), Follow-up sent (Y/N).`,
    ],
    tips: [
      `Never pay an application fee unless you are certain the program is legitimate — verify .edu or .gov domains.`,
      `Keep a single "master answers" doc for repeated essay prompts to speed secondary applications.`,
    ],
  },
};

function detailForStep(
  profile: StudentProfile,
  track: TrackRecommendation,
  step: GuideStep
): Omit<StepDetail, 'generatedAt'> {
  const key = `${track.id}:${step.id}`;
  const preset = STEP_DETAIL_LIBRARY[key];
  if (preset) return preset;

  const name = profile.name || `Student`;
  const interest = primaryInterest(profile);
  const activity = profile.extracurriculars[0] ?? `your main activity`;

  return {
    overview: `Amazon Bedrock generated this guidance for ${name} (${getGradeLabel(profile.grade)}) on the step "${step.title}" within the track "${track.title}". It connects your interests in ${interest}, your goal ("${(profile.goals[0] ?? '').slice(0, 100)}${(profile.goals[0]?.length ?? 0) > 100 ? '…' : ''}"), and practical actions you can take this week.`,
    estimatedTime: `3–5 hours`,
    actionItems: [
      `Block 90 minutes on your calendar this week dedicated only to this step.`,
      `Write a one-paragraph success definition: what does "done" look like for "${step.title}"?`,
      `List 3 obstacles (time, materials, people) and one mitigation for each.`,
      step.description,
      ...(step.tips ?? []).map((t) => `Tip: ${t}`),
      track.id === `track-leadership`
        ? `Document baseline metrics for ${activity} before you change anything (member count, events, funds).`
        : `Save drafts and screenshots in one folder so you can reuse them for college applications.`,
    ],
    tips: [
      `Share progress with a mentor or family member — accountability improves follow-through.`,
      `If stuck for 20+ minutes, switch to a smaller sub-task and return to the main goal.`,
      ...(step.tips ?? []),
    ],
  };
}

export async function generateStepDetail(
  profile: StudentProfile,
  track: TrackRecommendation,
  step: GuideStep,
  _guide: ActionGuide
): Promise<StepDetail> {
  await delay(1400);
  const body = detailForStep(profile, track, step);
  return {
    ...body,
    generatedAt: new Date().toISOString(),
  };
}

function buildMilestones(track: TrackRecommendation): string[] {
  if (track.id === `track-research`) {
    return [`Week 1: Finalize question & mentor`, `Week 3: Methods approved`, `Week 6: Data collection midpoint`, `Week 10: Draft poster or paper`, `Week 12: Present or submit`];
  }
  if (track.id === `track-internship`) {
    return [`Week 1: Program shortlist`, `Week 2: Recommenders asked`, `Week 4: Essays drafted`, `Week 5: Submit applications`];
  }
  if (track.id === `track-leadership`) {
    return [`Week 2: Initiative proposal approved`, `Week 6: Mid-semester check-in`, `Week 12: Impact summary for applications`];
  }
  return [`Week 1: Family priorities doc`, `Week 2: Draft college list`, `Week 3: Deadline calendar + test plan`];
}
