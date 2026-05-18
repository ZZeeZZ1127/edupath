import { useState, useEffect, useCallback } from 'react';
import {
  SparklesIcon,
  SendIcon,
  FlaskConicalIcon,
  BriefcaseIcon,
  SchoolIcon,
  TrophyIcon,
  UsersIcon,
  ArrowRightIcon,
  BuildingIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CircleIcon,
  TargetIcon,
} from 'lucide-react';
import type { ChatMessage, StudentProfile, TrackRecommendation, CollegeFitSchool, TrackTask } from '../types';
import { mockChatHistory } from '../data/mockData';
import { generateTrackRecommendations, buildCollegeFitChart } from '../services/mockAi';
import { getGradeShortLabel } from '../lib/grades';

interface RecommendationsPanelProps {
  profile?: StudentProfile;
  onBuildPlan?: (track: TrackRecommendation) => void;
}

const CATEGORY_CONFIG: Record<string, { icon: typeof FlaskConicalIcon; label: string; color: string }> = {
  research: { icon: FlaskConicalIcon, label: `Research`, color: `bg-emerald-muted text-emerald border-emerald/20` },
  internship: { icon: BriefcaseIcon, label: `Internship`, color: `bg-amber-muted text-amber border-amber/20` },
  college: { icon: SchoolIcon, label: `College`, color: `bg-accent text-accent-foreground border-accent-foreground/20` },
  competition: { icon: TrophyIcon, label: `Competition`, color: `bg-rose-muted text-rose border-rose/20` },
  extracurricular: { icon: UsersIcon, label: `Extracurricular`, color: `bg-secondary text-secondary-foreground border-border` },
};

const FIT_CONFIG: Record<string, { color: string; label: string }> = {
  reach: { color: `bg-rose-muted text-rose border-rose/20`, label: `Reach` },
  match: { color: `bg-amber-muted text-amber border-amber/20`, label: `Match` },
  safety: { color: `bg-emerald-muted text-emerald border-emerald/20`, label: `Safety` },
};

const DIFFICULTY_COLOR = (d: number) =>
  d >= 60 ? `text-rose` : d >= 35 ? `text-amber` : `text-emerald`;

type SubTab = 'chat' | 'opportunities' | 'colleges';

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
        <SparklesIcon className="w-4 h-4 text-white" />
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-card border border-border shadow-custom">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground typing-dot" />
        </div>
      </div>
    </div>
  );
}

function ChatBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === `user`;

  const renderContent = (text: string) => {
    const lines = text.split(`\n`);
    return lines.map((line, i) => {
      const boldReplaced = line.replace(/\*\*(.+?)\*\*/g, `<strong>$1</strong>`);
      return <p key={i} className={i > 0 ? `mt-2` : ``} dangerouslySetInnerHTML={{ __html: boldReplaced }} />;
    });
  };

  return (
    <div className={`flex items-end gap-2 mb-4 fade-in ${isUser ? `flex-row-reverse` : `flex-row`}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mb-0.5">
          <SparklesIcon className="w-4 h-4 text-white" />
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-brand flex items-center justify-center shrink-0 mb-0.5 text-white text-xs font-bold">
          {message.content.charAt(0)}
        </div>
      )}
      <div
        className={`max-w-lg px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? `bg-primary text-primary-foreground rounded-br-sm`
            : `bg-card border border-border shadow-custom text-foreground rounded-bl-sm`
        }`}
      >
        {renderContent(message.content)}
      </div>
    </div>
  );
}

function TrackCard({ track, onBuildPlan }: { track: TrackRecommendation; onBuildPlan: (track: TrackRecommendation) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card rounded-2xl border border-border shadow-custom overflow-hidden fade-in">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <TargetIcon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-foreground text-sm leading-tight">{track.label}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold ${DIFFICULTY_COLOR(track.difficulty)}`}>
                  Difficulty: {track.difficulty}%
                </span>
                <span className="text-xs text-muted-foreground">{track.tasks.length} tasks</span>
              </div>
            </div>
          </div>
          <button
            onClick={() => onBuildPlan(track)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all shrink-0"
          >
            Build a Plan
            <ArrowRightIcon className="w-3 h-3" />
          </button>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed mb-3">{track.description}</p>

        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all"
        >
          {track.tasks.length} tasks
          {expanded ? <ChevronUpIcon className="w-3.5 h-3.5" /> : <ChevronDownIcon className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-3 space-y-2">
            {track.tasks.map((task) => {
              const cat = CATEGORY_CONFIG[task.category] ?? CATEGORY_CONFIG.extracurricular;
              const CatIcon = cat.icon;
              return (
                <div key={task.task_id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50 border border-border">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${cat.color} border`}>
                    <CatIcon className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">{task.label}</span>
                      <span className={`text-xs ${DIFFICULTY_COLOR(task.difficulty)}`}>{task.difficulty}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CollegeFitCard({ school }: { school: CollegeFitSchool }) {
  const fitConfig = FIT_CONFIG[school.fit_type] ?? FIT_CONFIG.match;
  return (
    <div className="bg-card rounded-2xl border border-border shadow-custom overflow-hidden fade-in">
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-foreground">{school.school}</h3>
              <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${fitConfig.color}`}>
                {fitConfig.label}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-accent border border-accent-foreground/10 mb-3">
          <div className="flex items-start gap-2">
            <SparklesIcon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-accent-foreground leading-relaxed">{school.why_it_fits}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-3">
          <div>
            <div className="text-xs text-muted-foreground">GPA</div>
            <div className="text-sm font-semibold text-foreground">{school.requirements.gpa}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Test Scores</div>
            <div className="text-sm font-semibold text-foreground">{school.requirements.test_scores}</div>
          </div>
          {school.application_deadline && (
            <div>
              <div className="text-xs text-muted-foreground">Deadline</div>
              <div className="text-sm font-semibold text-foreground">{school.application_deadline}</div>
            </div>
          )}
        </div>

        {school.requirements.notable_requirements.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {school.requirements.notable_requirements.map((req) => (
              <span key={req} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                {req}
              </span>
            ))}
          </div>
        )}

        {school.financial_aid_deadline && (
          <p className="text-xs text-muted-foreground">Financial aid deadline: {school.financial_aid_deadline}</p>
        )}
      </div>
    </div>
  );
}

export default function RecommendationsPanel({
  profile = { name: `Maria`, grade: 11, age: 17, interests: [`Biology`, `Debate`], strengths: [], goals: [], extracurriculars: [] },
  onBuildPlan = () => {},
}: RecommendationsPanelProps) {
  const [subTab, setSubTab] = useState<SubTab>(`chat`);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [inputValue, setInputValue] = useState(``);
  const [isTyping, setIsTyping] = useState(false);
  const [tracks, setTracks] = useState<TrackRecommendation[]>([]);
  const [collegeFit, setCollegeFit] = useState<CollegeFitSchool[] | null>(null);
  const [isLoadingTracks, setIsLoadingTracks] = useState(false);

  const loadTracks = useCallback(async () => {
    setIsLoadingTracks(true);
    const data = await generateTrackRecommendations(profile);
    setTracks(data);
    setIsLoadingTracks(false);
  }, [profile]);

  const loadCollegeFit = useCallback(() => {
    const data = buildCollegeFitChart(profile);
    setCollegeFit(data);
  }, [profile]);

  useEffect(() => {
    if (subTab === `opportunities` && tracks.length === 0) {
      loadTracks();
    }
  }, [subTab, tracks.length, loadTracks]);

  useEffect(() => {
    if (subTab === `colleges` && collegeFit === null) {
      loadCollegeFit();
    }
  }, [subTab, collegeFit, loadCollegeFit]);

  const aiResponses = [
    `Based on your interest in biology and your role as debate team captain, I have a few strong suggestions for this semester.\n\n**Top priority:** Apply to the NIH Summer Internship Program before March 2026. Your biology background and research interest make you a competitive applicant, and NIH experience is a standout credential for pre-med applicants.\n\n**For debate:** Push for a nationals qualification this season. As captain, a nationals bid becomes the headline of your leadership story on applications.\n\nWant me to build a full application plan for any of these opportunities?`,
    `Great question, Maria! Given that you're in Grade 11, this is the most important year for building your college narrative.\n\nHere's what I'd prioritize:\n\n1. **Research experience** — Johns Hopkins and similar schools love to see real lab time. The RSI program at MIT is perfect for your profile.\n2. **Debate nationals** — Your captaincy already stands out; a nationals appearance seals it.\n3. **Hospital leadership** — Ask about a patient liaison role at your hospital. Sustained commitment to medicine matters.\n\nYour biology + debate combination is genuinely rare and compelling. Let me know if you want to explore the college list I've put together for you.`,
    `That's a smart focus, Maria. Based on your interest in pre-medicine and your debate background, here are the colleges I'd add to your list right now...\n\nI've put together a fit chart for you in the **College Fit** tab — 6 schools ranging from reach to safety, each with specific match reasoning tied to your biology interest and first-gen background.\n\nJohns Hopkins is your top reach — their pre-med pipeline and research culture match your profile almost exactly. Want me to build a full application plan for JHU?`,
  ];

  const [aiResponseIndex, setAiResponseIndex] = useState(0);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: `user`,
      content: inputValue,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputValue(``);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: `assistant`,
        content: aiResponses[aiResponseIndex % aiResponses.length],
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setAiResponseIndex((i) => i + 1);
    }, 1800);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === `Enter` && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const SUB_TABS: { key: SubTab; label: string }[] = [
    { key: `chat`, label: `AI Chat` },
    { key: `opportunities`, label: `Opportunities` },
    { key: `colleges`, label: `College Fit Chart` },
  ];

  return (
    <div data-cmp="RecommendationsPanel" className="flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
            <SparklesIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Recommendations</h1>
            <p className="text-xs text-muted-foreground">
              Personalized for {profile.name} · {getGradeShortLabel(profile.grade)}
            </p>
          </div>
        </div>
        {/* Sub tabs */}
        <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSubTab(tab.key)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                subTab === tab.key
                  ? `bg-card text-foreground shadow-custom`
                  : `text-muted-foreground hover:text-foreground`
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat tab */}
      <div className={`flex-1 flex flex-col overflow-hidden ${subTab === `chat` ? `` : `hidden`}`}>
        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-thin">
          {messages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {isTyping && <TypingIndicator />}
        </div>
        <div className="px-6 py-4 border-t border-border bg-card shrink-0">
          <div className="flex gap-3">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`Ask EduPath anything about your college journey, ${profile.name}...`}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
            />
            <button
              onClick={handleSend}
              disabled={!inputValue.trim() || isTyping}
              className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:opacity-90 transition-all disabled:opacity-40 shadow-custom shrink-0"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2 text-center">
            EduPath references your profile for every response · Powered by Amazon Bedrock
          </p>
        </div>
      </div>

      {/* Opportunities tab */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 scrollbar-thin ${subTab === `opportunities` ? `` : `hidden`}`}>
        {isLoadingTracks ? (
          <div className="flex flex-col items-center justify-center h-full">
            <SparklesIcon className="w-10 h-10 text-primary animate-pulse mb-3" />
            <p className="text-sm text-muted-foreground">Generating recommendations for {profile.name}...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {tracks.map((track) => (
              <TrackCard key={track.track_id} track={track} onBuildPlan={onBuildPlan} />
            ))}
          </div>
        )}
      </div>

      {/* College Fit tab */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 scrollbar-thin ${subTab === `colleges` ? `` : `hidden`}`}>
        {collegeFit === null ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <BuildingIcon className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">College fit chart is available starting in Grade 11.</p>
            <p className="text-xs text-muted-foreground mt-1">Generate a plan to see personalized college matches.</p>
          </div>
        ) : (
          <>
            <div className="mb-4 p-4 rounded-xl bg-accent border border-accent-foreground/10">
              <div className="flex items-start gap-3">
                <SparklesIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="text-sm text-foreground">
                  <strong>Fit chart for {profile.name}</strong> — {collegeFit.length} colleges matched to your interests and goals. Includes reach, match, and safety options.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              {collegeFit.map((school) => (
                <CollegeFitCard key={school.school} school={school} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
