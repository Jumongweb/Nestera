'use client';

import React from 'react';
import { TrendingUp, RefreshCcw, Layers } from 'lucide-react';

const steps = [
  {
    icon: Layers,
    color: 'text-cyan-400',
    title: 'Deposit',
    body: 'You deposit any supported stablecoin into a Nestera vault. Funds are held securely on-chain.',
  },
  {
    icon: RefreshCcw,
    color: 'text-teal-400',
    title: 'Auto-Route',
    body: 'The Yield Oracle scans live APY data across Stellar DeFi protocols and routes your funds to the highest-yielding option.',
  },
  {
    icon: TrendingUp,
    color: 'text-emerald-400',
    title: 'Compound',
    body: 'Earned yield is automatically re-invested every ledger close (~5 seconds), maximizing compounding with no manual effort.',
  },
];

const YieldSection: React.FC = () => {
  return (
    <section className="w-full py-24 bg-[#061a1a]">
      <div className="max-w-[1200px] mx-auto px-12 max-md:px-6">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest mb-6">
            <TrendingUp size={13} /> Yield Optimization
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Your money, always working at peak efficiency.
          </h2>
          <p className="text-[1rem] text-[rgba(180,210,210,0.65)] max-w-2xl mx-auto">
            Manual yield farming is a full-time job. Nestera automates it completely — so you earn more while doing less.
          </p>
        </div>

        {/* Flow diagram */}
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-0">
          {steps.map((step, i) => (
            <React.Fragment key={step.title}>
              <div className="flex-1 flex flex-col items-center text-center p-8 rounded-2xl bg-white/[0.04] border border-white/[0.08] min-w-0">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] flex items-center justify-center mb-5">
                  <step.icon className={step.color} size={28} />
                </div>
                <div className="text-xs font-bold uppercase tracking-widest text-[rgba(180,210,210,0.4)] mb-2">
                  Step {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm leading-relaxed text-[rgba(180,210,210,0.6)]">{step.body}</p>
              </div>
              {i < steps.length - 1 && (
                <div className="flex md:flex-col items-center justify-center shrink-0 mx-2 my-2 md:my-0">
                  <svg width="32" height="32" viewBox="0 0 32 32" className="text-[rgba(0,212,192,0.3)] rotate-90 md:rotate-0" fill="none">
                    <path d="M8 16h16M20 10l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* APY comparison strip */}
        <div className="mt-16 p-8 rounded-3xl bg-gradient-to-r from-emerald-500/10 via-cyan-500/5 to-transparent border border-white/[0.08] flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[rgba(180,210,210,0.4)] mb-2">Current Strategy</div>
            <div className="text-3xl font-extrabold text-white">12.4% <span className="text-emerald-400 text-lg">APY</span></div>
            <div className="text-sm text-[rgba(180,210,210,0.5)] mt-1">USDC · Stellar Liquidity Pool #3</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/10" />
          <div>
            <div className="text-xs font-bold uppercase tracking-widest text-[rgba(180,210,210,0.4)] mb-2">Traditional Savings</div>
            <div className="text-3xl font-extrabold text-white/30">0.5% <span className="text-white/30 text-lg">APY</span></div>
            <div className="text-sm text-[rgba(180,210,210,0.3)] mt-1">Average bank savings rate (2025)</div>
          </div>
          <div className="hidden md:block w-px h-16 bg-white/10" />
          <div className="text-right max-md:text-center">
            <div className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">You earn</div>
            <div className="text-3xl font-extrabold text-emerald-400">24× more</div>
            <div className="text-sm text-[rgba(180,210,210,0.5)] mt-1">with automated DeFi yield</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default YieldSection;
