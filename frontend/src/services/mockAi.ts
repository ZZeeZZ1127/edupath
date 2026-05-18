import type {
  ActionGuide,
  CollegeFitSchool,
  PlanTask,
  SavedPlan,
  StudentProfile,
  TaskDetail,
  TrackRecommendation,
  TrackTask,
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
  return ` Building on your past plan "${latest.track.label}" (${date}).`;
}

// ── Track recommendations ──────────────────────────

export async function generateTrackRecommendations(
  profile: StudentProfile,
  pastPlans: SavedPlan[] = []
): Promise<TrackRecommendation[]> {
  await delay(2200);
  const interest = primaryInterest(profile);
  const name = profile.name || `Student`;
  const grade = profile.grade;
  const growth = growthNote(pastPlans);

  const tracks: TrackRecommendation[] = [
    {
      track_id: `track-research`,
      label: `Launch a ${interest}-focused research project`,
      description: `${name}, your strengths in ${profile.strengths.slice(0, 2).join(' and ') || 'academics'} pair well with a structured research portfolio.${growth}`,
      difficulty: 50,
      tasks: [
        { task_id: `s1`, label: `Define a narrow research question`, category: `research`, difficulty: 25, description: `Pick one question answerable in 8–12 weeks within ${interest}.`, deadline: null },
        { task_id: `s2`, label: `Find a mentor`, category: `research`, difficulty: 35, description: `Email 3 teachers or local university faculty with a 150-word intro.`, deadline: null },
        { task_id: `s3`, label: `Create a methods plan`, category: `research`, difficulty: 30, description: `Document data sources, tools, and weekly milestones.`, deadline: null },
        { task_id: `s4`, label: `Execute and document weekly`, category: `research`, difficulty: 60, description: `Log hours, setbacks, results. Aim for a poster or competition submission.`, deadline: null },
      ],
    },
    {
      track_id: `track-internship`,
      label: `Apply to a competitive summer program`,
      description: `${getGradeLabel(grade)} is the ideal window to secure hands-on experience that admissions readers recognize.`,
      difficulty: 65,
      tasks: [
        { task_id: `s5`, label: `Shortlist 3 programs`, category: `internship`, difficulty: 40, description: `Match grade requirements and deadlines to your profile. NIH SIP, RSI, or local labs.`, deadline: null },
        { task_id: `s6`, label: `Prepare application packet`, category: `internship`, difficulty: 60, description: `Resume, transcript, essays, recommender requests — start 6 weeks before deadline.`, deadline: null },
        { task_id: `s7`, label: `Submit and track confirmations`, category: `internship`, difficulty: 30, description: `Submit early; confirm portal receipts and follow up if needed.`, deadline: null },
      ],
    },
    {
      track_id: `track-leadership`,
      label: `Level up leadership in an existing activity`,
      description: `You participate in ${profile.extracurriculars.length} activities — deepening one beats adding many shallow ones.`,
      difficulty: 35,
      tasks: [
        { task_id: `s8`, label: `Audit your current impact`, category: `extracurricular`, difficulty: 15, description: `List hours, role, and outcomes from ${profile.extracurriculars[0] ?? 'your activity'}.`, deadline: null },
        { task_id: `s9`, label: `Propose one measurable initiative`, category: `extracurricular`, difficulty: 35, description: `e.g. recruit 5 members, run 3 events, raise $500.`, deadline: null },
        { task_id: `s10`, label: `Execute and collect proof`, category: `extracurricular`, difficulty: 25, description: `Photos, attendance sheets, testimonials for your activities list.`, deadline: null },
      ],
    },
  ];

  if (grade >= 9) {
    tracks.push({
      track_id: `track-college-prep`,
      label: `Build your college list and application timeline`,
      description: `Research fit schools, map deadlines, and create a semester plan tied to your goals.`,
      difficulty: 40,
      tasks: [
        { task_id: `s11`, label: `Clarify priorities with family`, category: `college`, difficulty: 15, description: `Discuss budget, location, and size preferences.`, deadline: null },
        { task_id: `s12`, label: `Build a balanced list (reach/match/safety)`, category: `college`, difficulty: 45, description: `Aim for 8–12 schools using Common Data Set and net price calculators.`, deadline: null },
        { task_id: `s13`, label: `Map deadlines on a calendar`, category: `college`, difficulty: 20, description: `ED/EA/RD, FAFSA/CSS, and scholarship dates in one view.`, deadline: null },
      ],
    });
  }

  // Compute difficulty as average of task difficulties
  for (const track of tracks) {
    track.difficulty = Math.round(track.tasks.reduce((s, t) => s + t.difficulty, 0) / track.tasks.length);
  }

  return tracks;
}

// ── Action guide / plan ────────────────────────────

function buildPlanTasks(track: TrackRecommendation, profile: StudentProfile): PlanTask[] {
  const name = profile.name || `Student`;
  const interest = primaryInterest(profile);

  return track.tasks.map((task) => ({
    task_id: task.task_id,
    label: task.label,
    materials_needed: task.category === `internship`
      ? [`Resume`, `Transcript`, `Personal statement`, `2 letters of recommendation`]
      : task.category === `research`
        ? [`Research proposal`, `Lab notebook`, `Literature review`]
        : [`Notebook`, `Calendar`, `Goal tracker`],
    deadlines: {
      application: task.deadline,
      financial_aid: null,
    },
    action_items: [
      `Research requirements and eligibility for "${task.label}"`,
      `Gather all required materials`,
      `Reach out to a mentor or advisor for guidance`,
      `Set a weekly schedule and track progress`,
      `Submit or complete by the target deadline`,
    ],
    match_reasoning: `${task.label} aligns with ${name}'s interest in ${interest} and their ${getGradeLabel(profile.grade)} goals.`,
    status: `pending` as const,
  }));
}

export function buildCollegeFitChart(profile: StudentProfile): CollegeFitSchool[] | null {
  if (profile.grade < 11) return null;

  const interest = primaryInterest(profile);
  return [
    {
      school: `University of Michigan`,
      fit_type: `reach`,
      why_it_fits: `Strong programs in areas related to ${interest} and research opportunities for undergraduates.`,
      requirements: { gpa: `3.8+`, test_scores: `SAT 1450+ or ACT 33+`, notable_requirements: [`Personal essay`, `2 teacher recommendations`, `Activities list`] },
      application_deadline: `2026-01-15`,
      financial_aid_deadline: `2026-02-01`,
    },
    {
      school: `University of Washington`,
      fit_type: `match`,
      why_it_fits: `Excellent ${interest} department with undergraduate research and internship pathways.`,
      requirements: { gpa: `3.6+`, test_scores: `SAT 1350+ or ACT 30+`, notable_requirements: [`Common App essay`, `Activities resume`] },
      application_deadline: `2026-01-15`,
      financial_aid_deadline: `2026-02-28`,
    },
    {
      school: `Purdue University`,
      fit_type: `match`,
      why_it_fits: `Strong STEM reputation with hands-on learning and co-op programs tied to ${interest}.`,
      requirements: { gpa: `3.5+`, test_scores: `SAT 1300+ or ACT 28+`, notable_requirements: [`Common App essay`, `Letter of recommendation`] },
      application_deadline: `2026-01-15`,
      financial_aid_deadline: `2026-03-01`,
    },
    {
      school: `Arizona State University`,
      fit_type: `safety`,
      why_it_fits: `Solid programs with strong merit aid for students interested in ${interest}. Rolling admissions.`,
      requirements: { gpa: `3.0+`, test_scores: `SAT 1180+`, notable_requirements: [`Application form`, `Transcript`] },
      application_deadline: `2026-05-01`,
      financial_aid_deadline: `2026-03-01`,
    },
    {
      school: `University of Oregon`,
      fit_type: `safety`,
      why_it_fits: `Growing ${interest} programs with generous automatic merit scholarships based on GPA.`,
      requirements: { gpa: `3.2+`, test_scores: `SAT 1150+`, notable_requirements: [`Application`, `Personal statement`] },
      application_deadline: `2026-04-01`,
      financial_aid_deadline: `2026-03-01`,
    },
    {
      school: `Michigan State University`,
      fit_type: `safety`,
      why_it_fits: `Large research university with strong ${interest} offerings and extensive alumni network.`,
      requirements: { gpa: `3.0+`, test_scores: `SAT 1100+`, notable_requirements: [`Application`, `Transcript`] },
      application_deadline: `2026-02-01`,
      financial_aid_deadline: `2026-03-01`,
    },
  ];
}

export async function generateActionGuide(
  profile: StudentProfile,
  track: TrackRecommendation,
  _pastPlans: SavedPlan[] = []
): Promise<ActionGuide> {
  await delay(2800);

  return {
    track_id: track.track_id,
    label: track.label,
    tasks: buildPlanTasks(track, profile),
    college_fit_chart: buildCollegeFitChart(profile),
  };
}

// ── Task detail (deep-dive) ────────────────────────

export async function generateTaskDetail(
  profile: StudentProfile,
  track: TrackRecommendation,
  task: PlanTask
): Promise<TaskDetail> {
  await delay(1400);
  const name = profile.name || `Student`;
  const interest = primaryInterest(profile);

  return {
    overview: `Amazon Bedrock analyzed your profile and generated this deep-dive for "${task.label}" within the track "${track.label}". It connects your interests in ${interest}, your goals, and practical actions you can take as a ${getGradeLabel(profile.grade)} student.`,
    estimatedTime: track.difficulty > 60 ? `4–6 weeks` : track.difficulty > 30 ? `2–4 weeks` : `1–2 weeks`,
    actionItems: [
      `Block dedicated time on your calendar for "${task.label}"`,
      `Research requirements and gather all necessary materials`,
      `Identify one mentor, teacher, or advisor to consult`,
      `Set a concrete completion date and work backward`,
      `Document your progress — save everything for college applications`,
    ],
    tips: [
      `Break this task into smaller 30-minute chunks to avoid feeling overwhelmed`,
      `Share your progress with a friend or family member for accountability`,
      `If stuck, reach out to someone who has done this before`,
    ],
    generatedAt: new Date().toISOString(),
  };
}
