import { useState } from 'react';
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
  TagIcon,
  CalendarIcon,
  ChevronDownIcon,
} from 'lucide-react';
import type { Recommendation, ChatMessage, StudentProfile, CollegeFitItem } from '../types';
import { mockRecommendations, mockCollegeFit, mockChatHistory } from '../data/mockData';
import { getGradeShortLabel } from '../lib/grades';

interface RecommendationsPanelProps {
  profile?: StudentProfile;
  onBuildPlan?: (rec: Recommendation | CollegeFitItem) => void;
}

const CATEGORY_CONFIG = {
  research: { icon: FlaskConicalIcon, label: `Research Program`, color: `bg-emerald-muted text-emerald border-emerald/20` },
  internship: { icon: BriefcaseIcon, label: `Internship`, color: `bg-amber-muted text-amber border-amber/20` },
  college: { icon: SchoolIcon, label: `College`, color: `bg-accent text-accent-foreground border-accent-foreground/20` },
  competition: { icon: TrophyIcon, label: `Competition`, color: `bg-rose-muted text-rose border-rose/20` },
  extracurricular: { icon: UsersIcon, label: `Extracurricular`, color: `bg-secondary text-secondary-foreground border-border` },
};

const FIT_CONFIG = {
  reach: { color: `bg-rose-muted text-rose border-rose/20`, label: `Reach` },
  match: { color: `bg-amber-muted text-amber border-amber/20`, label: `Match` },
  safety: { color: `bg-emerald-muted text-emerald border-emerald/20`, label: `Safety` },
};

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
      return (
        <p key={i} className={i > 0 ? `mt-2` : ``} dangerouslySetInnerHTML={{ __html: boldReplaced }} />
      );
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
          M
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

export default function RecommendationsPanel({
  profile = { name: `Maria`, grade: 11, age: 17, interests: [`Biology`, `Debate`], strengths: [], goals: ``, extracurriculars: [] },
  onBuildPlan = () => {},
}: RecommendationsPanelProps) {
  const [subTab, setSubTab] = useState<SubTab>(`chat`);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatHistory);
  const [inputValue, setInputValue] = useState(``);
  const [isTyping, setIsTyping] = useState(false);
  const [expandedRec, setExpandedRec] = useState<string | null>(null);

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
        <div className="flex flex-col gap-4">
          {mockRecommendations.map((rec) => {
            const config = CATEGORY_CONFIG[rec.category];
            const Icon = config.icon;
            const isExpanded = expandedRec === rec.id;
            return (
              <div key={rec.id} className="bg-card rounded-2xl border border-border shadow-custom overflow-hidden fade-in">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-foreground text-sm leading-tight">{rec.title}</h3>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <BuildingIcon className="w-3 h-3 text-muted-foreground shrink-0" />
                          <span className="text-xs text-muted-foreground truncate">{rec.organization}</span>
                        </div>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${config.color}`}>
                      {config.label}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground leading-relaxed mb-3">{rec.description}</p>

                  {/* Match reason */}
                  <div className="p-3 rounded-xl bg-accent border border-accent-foreground/10 mb-3">
                    <div className="flex items-start gap-2">
                      <SparklesIcon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-accent-foreground leading-relaxed">{rec.matchReason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {rec.deadline && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{rec.deadline}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <ClockIcon className="w-3.5 h-3.5" />
                        <span>{rec.gradeRange}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setExpandedRec(isExpanded ? null : rec.id)}
                        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-all"
                      >
                        Tags
                        <ChevronDownIcon className={`w-3.5 h-3.5 transition-transform ${isExpanded ? `rotate-180` : ``}`} />
                      </button>
                      <button
                        onClick={() => onBuildPlan(rec)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:opacity-90 transition-all"
                      >
                        Build a Plan
                        <ArrowRightIcon className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {/* Tags expanded */}
                  <div className={`mt-3 flex flex-wrap gap-1.5 ${isExpanded ? `` : `hidden`}`}>
                    {rec.tags.map((tag) => (
                      <span key={tag} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground border border-border">
                        <TagIcon className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* College Fit tab */}
      <div className={`flex-1 overflow-y-auto px-6 py-4 scrollbar-thin ${subTab === `colleges` ? `` : `hidden`}`}>
        <div className="mb-4 p-4 rounded-xl bg-accent border border-accent-foreground/10">
          <div className="flex items-start gap-3">
            <SparklesIcon className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <p className="text-sm text-foreground">
              <strong>Fit chart for {profile.name}</strong> — 6 colleges matched to your biology interest, pre-med goals, and first-gen background. Includes reach, match, and safety options.
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          {mockCollegeFit.map((college) => {
            const fitConfig = FIT_CONFIG[college.type];
            return (
              <div key={college.id} className="bg-card rounded-2xl border border-border shadow-custom overflow-hidden fade-in">
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground">{college.name}</h3>
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${fitConfig.color}`}>
                          {fitConfig.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{college.location}</p>
                    </div>
                    <button
                      onClick={() => onBuildPlan(college)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-white text-xs font-semibold hover:opacity-90 transition-all shrink-0"
                    >
                      Build Plan
                      <ArrowRightIcon className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Match reason */}
                  <div className="p-3 rounded-xl bg-accent border border-accent-foreground/10 mb-3">
                    <div className="flex items-start gap-2">
                      <SparklesIcon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-accent-foreground leading-relaxed">{college.matchReason}</p>
                    </div>
                  </div>

                  {/* Stats row */}
                  <div className="flex flex-wrap gap-4 mb-3">
                    <div>
                      <div className="text-xs text-muted-foreground">Acceptance Rate</div>
                      <div className="text-sm font-semibold text-foreground">{college.acceptanceRate}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">SAT Range</div>
                      <div className="text-sm font-semibold text-foreground">{college.satRange}</div>
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground">Deadline</div>
                      <div className="text-sm font-semibold text-foreground">{college.deadline}</div>
                    </div>
                  </div>

                  {/* Programs */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {college.programs.map((prog) => (
                      <span key={prog} className="text-xs px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground border border-border">
                        {prog}
                      </span>
                    ))}
                  </div>

                  {/* Notes */}
                  <p className="text-xs text-muted-foreground leading-relaxed">{college.notes}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
