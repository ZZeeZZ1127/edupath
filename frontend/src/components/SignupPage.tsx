import { useState } from 'react';
import { ArrowLeftIcon, GraduationCapIcon, SparklesIcon } from 'lucide-react';

interface SignupPageProps {
  onSignup?: (email: string) => void;
  onBack?: () => void;
}

export default function SignupPage({ onSignup = () => {}, onBack = () => {} }: SignupPageProps) {
  const [email, setEmail] = useState(``);
  const [password, setPassword] = useState(``);
  const [name, setName] = useState(``);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignup(email.trim() || `student@edupath.demo`);
  };

  return (
    <div data-cmp="SignupPage" className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Back to home
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-brand flex items-center justify-center">
            <GraduationCapIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-brand">EduPath</span>
        </div>

        <div className="shadow-custom rounded-2xl bg-card p-8 border border-border">
          <h2 className="text-2xl font-bold text-foreground mb-1">Create your account</h2>
          <p className="text-muted-foreground text-sm mb-8">
            Sign up to save your profile and get AI-powered recommendations
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@school.edu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="••••••••"
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 mt-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-all shadow-custom"
            >
              <SparklesIcon className="w-4 h-4 inline mr-2 -mt-0.5" />
              Create account & continue
            </button>
          </form>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Protected by AWS Cognito · Profile stored in DynamoDB
          </p>
        </div>
      </div>
    </div>
  );
}
