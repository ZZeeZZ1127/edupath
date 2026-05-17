import { useState } from 'react';
import { ArrowLeftIcon, SparklesIcon, ShieldCheckIcon, UsersIcon } from 'lucide-react';
import EduPathBrand from './EduPathBrand';

interface LoginPageProps {
  onLogin?: (email: string) => void;
  onSignup?: () => void;
  onBack?: () => void;
}

export default function LoginPage({ onLogin = () => {}, onSignup = () => {}, onBack = () => {} }: LoginPageProps) {
  const [email, setEmail] = useState(`maria@edupath.demo`);

  const handleLogin = () => onLogin(email.trim() || `maria@edupath.demo`);

  return (
    <div data-cmp="LoginPage" className="min-h-screen bg-brand flex">
      {/* Left hero panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden select-none">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, #2563eb 0%, transparent 70%)` }}
          />
          <div
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full opacity-10"
            style={{ background: `radial-gradient(circle, #10b981 0%, transparent 70%)` }}
          />
        </div>

        <EduPathBrand onHome={onBack} variant="dark" className="relative" />

        {/* Hero text */}
        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs px-3 py-1.5 rounded-full mb-6 border border-white/20">
            <SparklesIcon className="w-3.5 h-3.5" />
            <span>AWS Hackathon 2025 — Powered by Amazon Bedrock</span>
          </div>
          <h1 className="text-5xl font-bold text-white leading-tight mb-6">
            Every student deserves a{' '}
            <span className="text-blue-300">world-class</span>{' '}
            counselor.
          </h1>
          <p className="text-white/70 text-lg leading-relaxed max-w-md">
            EduPath gives first-generation students the same quality of academic
            guidance that wealthy families pay thousands of dollars for — powered
            by AI that remembers who you are.
          </p>

          {/* Stats row */}
          <div className="flex gap-8 mt-10">
            {[
              { value: `1:400`, label: `Counselor ratio in public schools` },
              { value: `$8K+`, label: `Private counselor cost` },
              { value: `$0`, label: `Cost with EduPath` },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-white/50 text-xs mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative flex gap-4">
          {[
            { icon: ShieldCheckIcon, label: `Secure & Private` },
            { icon: UsersIcon, label: `Built for First-Gen Students` },
            { icon: SparklesIcon, label: `AI-Powered Memory` },
          ].map((badge) => (
            <div key={badge.label} className="flex items-center gap-2 text-white/60 text-sm">
              <badge.icon className="w-4 h-4" />
              <span>{badge.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right auth panel */}
      <div className="flex-1 flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Back to home
          </button>
          <EduPathBrand onHome={onBack} className="flex lg:hidden mb-6" iconSize="sm" />

          <div className="shadow-custom rounded-2xl bg-card p-8 border border-border">
            <h2 className="text-2xl font-bold text-foreground mb-1">Welcome back</h2>
            <p className="text-muted-foreground text-sm mb-8">Sign in to continue your EduPath journey</p>

            <div className="flex flex-col gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Email address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="you@school.edu"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
                <input
                  type="password"
                  defaultValue="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded" />
                Remember me
              </label>
              <button className="text-sm text-primary font-medium hover:underline">Forgot password?</button>
            </div>

            <button
              onClick={handleLogin}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-custom active:scale-95"
            >
              Sign in with Cognito
            </button>

            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground">or</span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <button
              onClick={onSignup}
              className="w-full py-3 rounded-xl border-2 border-brand text-brand font-semibold text-sm hover:bg-brand-muted transition-all active:scale-95"
            >
              Create a new account
            </button>

            <p className="text-center text-xs text-muted-foreground mt-6">
              Protected by AWS Cognito · FERPA-aligned data practices
            </p>
          </div>

          {/* Demo shortcut */}
          <div className="mt-4 p-4 rounded-xl bg-accent border border-accent-foreground/10 text-center">
            <p className="text-xs text-muted-foreground mb-2">Demo mode — sign in as Maria (Grade 11)</p>
            <button
              onClick={handleLogin}
              className="text-xs font-semibold text-accent-foreground hover:underline"
            >
              Continue as Maria →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
