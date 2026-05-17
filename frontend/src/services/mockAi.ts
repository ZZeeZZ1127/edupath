import type { ActionGuide, SavedPlan, StudentProfile, TrackRecommendation } from '../types';

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
      matchReason: `${name}, your strengths in ${profile.strengths.slice(0, 2).join(' and ') || 'academics'} pair well with a structured research portfolio for "${profile.goals.slice(0, 80)}…".${growth}`,
      timeHorizon: `8–12 weeks`,
      difficulty: `intermediate`,
      category: `research`,
      tags: [interest, `Portfolio`, `Pre-college`],
    },
    {
      id: `track-internship`,
      title: `Apply to a competitive summer program or internship`,
      summary: `Target one high-impact program (NIH SIP, RSI, or a local lab) aligned with your grade and interests.`,
      matchReason: `Grade ${profile.grade} is the ideal window to secure hands-on experience that admissions readers recognize.`,
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
      matchReason: `Your stated goal — "${profile.goals.slice(0, 60)}${profile.goals.length > 60 ? '…' : ''}" — needs a concrete school and deadline strategy now.`,
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
      overview: `How to identify, apply to, and follow up on competitive programs matched to Grade ${profile.grade} students.`,
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
