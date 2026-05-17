import {
  ArrowRightIcon,
  BrainCircuitIcon,
  DatabaseIcon,
  GraduationCapIcon,
  GlobeIcon,
  LogInIcon,
  RouteIcon,
  SparklesIcon,
  UserPlusIcon,
} from 'lucide-react';

interface LandingPageProps {
  onLogin?: () => void;
  onSignup?: () => void;
}

const STEPS = [
  {
    icon: DatabaseIcon,
    title: `Share your profile`,
    description: `Upload grades, interests, goals, and activities. We store them securely in the database for personalized guidance.`,
  },
  {
    icon: BrainCircuitIcon,
    title: `AI recommends your next moves`,
    description: `Our recommendation engine reads your profile and suggests several high-impact tracks you can take right now.`,
  },
  {
    icon: GlobeIcon,
    title: `Get a web-powered action plan`,
    description: `Pick a track and receive step-by-step instructions curated from real resources on the internet.`,
  },
];

export default function LandingPage({ onLogin = () => {}, onSignup = () => {} }: LandingPageProps) {
  return (
    <div data-cmp="LandingPage" className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center shadow-custom">
              <GraduationCapIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-brand">EduPath</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onLogin}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-foreground hover:bg-muted transition-all"
            >
              <LogInIcon className="w-4 h-4" />
              Log in
            </button>
            <button
              onClick={onSignup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-all shadow-custom"
            >
              <UserPlusIcon className="w-4 h-4" />
              Sign up
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute -top-32 right-0 w-[480px] h-[480px] rounded-full opacity-20"
              style={{ background: `radial-gradient(circle, #2563eb 0%, transparent 70%)` }}
            />
            <div
              className="absolute bottom-0 left-0 w-96 h-96 rounded-full opacity-15"
              style={{ background: `radial-gradient(circle, #10b981 0%, transparent 70%)` }}
            />
          </div>

          <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 relative">
            <div className="inline-flex items-center gap-2 bg-accent text-accent-foreground text-xs px-3 py-1.5 rounded-full mb-6 border border-accent-foreground/10">
              <SparklesIcon className="w-3.5 h-3.5" />
              AWS Hackathon · Amazon Bedrock
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight max-w-3xl mb-6">
              Your AI counselor for{' '}
              <span className="text-primary">what to do next</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed mb-10">
              EduPath turns your background into clear options: save your profile, get AI track
              recommendations, then receive a practical plan built from real resources on the web.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={onSignup}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-brand text-brand-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-custom active:scale-95"
              >
                Get started free
                <ArrowRightIcon className="w-4 h-4" />
              </button>
              <button
                onClick={onLogin}
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl border-2 border-border bg-card text-foreground font-semibold text-sm hover:bg-muted transition-all active:scale-95"
              >
                I already have an account
              </button>
            </div>
          </div>
        </section>

        <section className="bg-card border-y border-border py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex items-center gap-2 mb-3">
              <RouteIcon className="w-5 h-5 text-primary" />
              <span className="text-sm font-semibold text-primary uppercase tracking-wider">How it works</span>
            </div>
            <h2 className="text-3xl font-bold text-foreground mb-12">Three steps to your personalized plan</h2>
            <div className="grid md:grid-cols-3 gap-8">
              {STEPS.map((step, i) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.title}
                    className="p-6 rounded-2xl border border-border bg-background shadow-custom relative"
                  >
                    <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-accent flex items-center justify-center mb-4">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Ready to find your path?</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
            Join students using AI to decide their next move — from research and internships to college prep.
          </p>
          <button
            onClick={onSignup}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-custom"
          >
            Create your account
            <ArrowRightIcon className="w-4 h-4" />
          </button>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">
        EduPath · Profile stored in DynamoDB · Recommendations powered by Bedrock
      </footer>
    </div>
  );
}
