/**
 * Landing Page
 * Introduction and entry point to the application
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  Target,
  BookOpen,
  TrendingUp,
} from 'lucide-react';
import { JsonLd } from '@/components';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'NextRole - AI Career Strategy Copilot',
  description:
    'AI career copilot for strategic planning: resume analysis, career paths, skill gaps, and actionable roadmaps.',
  openGraph: {
    title: 'NextRole - AI Career Strategy Copilot',
    description:
      'AI career copilot for strategic planning: resume analysis, career paths, skill gaps, and actionable roadmaps.',
    type: 'website',
  },
};

export default function Home() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://my-next-role.vercel.app';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'NextRole',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    description:
      'AI-powered career strategy copilot that analyzes resumes, generates personalized career paths, identifies skill gaps, and creates actionable month-by-month roadmaps.',
    url: siteUrl,
    featureList: [
      'AI-Powered Resume Analysis',
      'Strategic Career Path Generation',
      'Skill Gap Identification',
      'Personalized Career Roadmaps',
    ],
    screenshot: `${siteUrl}/android-chrome-512x512.png`,
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Analysis',
      description:
        'Your resume analyzed by advanced AI to extract your unique career profile',
    },
    {
      icon: Target,
      title: 'Strategic Paths',
      description:
        'Discover 4-6 thoughtfully curated career paths aligned with your goals',
    },
    {
      icon: BookOpen,
      title: 'Skill Gaps',
      description:
        'Understand exactly what you need to learn for your next role',
    },
    {
      icon: TrendingUp,
      title: 'Actionable Roadmap',
      description: 'Month-by-month plan with concrete projects and milestones',
    },
  ];

  return (
    <main className="min-h-screen flex flex-col">
      <JsonLd data={jsonLd} />

      {/* Navigation */}
      <nav
        className="bg-white border-b border-slate-200 sticky top-0 z-40"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="container flex items-center justify-between h-14 sm:h-16 md:h-20">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-emerald-600">
            NextRole
          </h1>
          <Link href="/upload" className="btn btn-primary btn-sm">
            Get Started
            <ArrowRight className="w-3 sm:w-4 h-3 sm:h-4" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="section container flex flex-col items-center text-center space-y-4 sm:space-y-6 flex-1">
        <div className="space-y-3 sm:space-y-4 max-w-3xl px-2 sm:px-0">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-100 text-emerald-700 rounded-full text-xs sm:text-sm font-semibold">
            <Sparkles className="w-3 sm:w-4 h-3 sm:h-4" />
            AI-Powered Career Strategy
          </div>

          <h2 className="heading-1">
            Your Next Role,
            <br />
            Planned with Clarity
          </h2>

          <p className="text-subtitle text-slate-600 max-w-2xl mx-auto">
            Stop wondering about your career direction. Upload your resume and
            let AI analyze your profile, suggest strategic career paths, and
            generate a personalized roadmap tailored to your skill gaps.
          </p>

          <div className="pt-2 sm:pt-4 space-y-2 sm:space-y-3">
            <Link href="/upload" className="btn btn-primary btn-lg mx-auto">
              Analyze Your Resume
              <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
            </Link>
            <p className="text-small text-slate-500">
              Takes 2-3 minutes. No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section bg-white border-t border-slate-200">
        <div className="container space-y-8 sm:space-y-12">
          <div className="text-center space-y-2 sm:space-y-3">
            <h3 className="heading-2">How It Works</h3>
            <p className="text-subtitle text-slate-600 max-w-2xl mx-auto">
              Four intelligent steps to clarify your career strategy
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card space-y-4">
                  <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="heading-4">{feature.title}</h4>
                    <p className="text-small text-slate-600 mt-2">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="section container">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 md:gap-12 items-center">
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            <h3 className="heading-2">Not a Job Portal</h3>
            <p className="text-body text-slate-600">
              NextRole is a{' '}
              <strong>career intelligence and planning tool</strong> designed
              for professionals who want clarity on their future. We&apos;re not
              here to find you jobs&mdash;we&apos;re here to help you become the
              person who naturally attracts the right opportunities.
            </p>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">
                    Strategic Thinking
                  </p>
                  <p className="text-small text-slate-600">
                    Guidance based on market demand, effort, and reward
                    potential
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">
                    Actionable Plans
                  </p>
                  <p className="text-small text-slate-600">
                    Concrete projects, milestones, and learning paths
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-emerald-600 font-bold text-sm">✓</span>
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm sm:text-base">
                    Personal Growth
                  </p>
                  <p className="text-small text-slate-600">
                    Focus on becoming, not applying
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 sm:p-8 md:p-12 border border-emerald-200 flex flex-col items-center justify-center min-h-80 sm:min-h-96">
            <div className="text-center space-y-3 sm:space-y-4">
              <div className="text-5xl sm:text-6xl">🎯</div>
              <p className="heading-3 text-slate-900">Clarity Over Confusion</p>
              <p className="text-body text-slate-600 max-w-sm text-sm sm:text-base">
                Every professional deserves a clear, strategic plan for their
                next move. That&apos;s what we provide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section bg-emerald-600 text-white">
        <div className="container text-center space-y-4 sm:space-y-6 px-3 sm:px-0">
          <h3 className="heading-2 text-white">
            Ready to Plan Your Next Role?
          </h3>
          <p className="text-subtitle text-emerald-100 max-w-2xl mx-auto text-sm sm:text-base">
            Upload your resume now and get your personalized career strategy in
            minutes.
          </p>
          <Link
            href="/upload"
            className="btn bg-white text-emerald-600 hover:bg-slate-100 btn-lg mx-auto"
          >
            Get Started Now
            <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
