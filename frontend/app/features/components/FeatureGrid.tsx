'use client';

import React from 'react';
import { ShieldCheck, Zap, Globe2, Target, BarChart3, Lock } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    color: 'text-cyan-400',
    bg: 'bg-cyan-400/10',
    title: 'Non-Custodial Security',
    description: 'Your keys, your crypto. Nestera never holds your funds — everything is managed directly by audited Soroban smart contracts.',
  },
  {
    icon: Zap,
    color: 'text-yellow-400',
    bg: 'bg-yellow-400/10',
    title: 'Auto Yield Optimization',
    description: 'Our protocol continuously routes deposits to the highest-yielding strategies on Stellar — no manual rebalancing required.',
  },
  {
    icon: Globe2,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10',
    title: 'Multi-Asset Support',
    description: 'Save in USDC, USDT, XLM and more. Seamlessly switch between assets without leaving the Nestera interface.',
  },
  {
    icon: Target,
    color: 'text-purple-400',
    bg: 'bg-purple-400/10',
    title: 'Goal-Based Savings',
    description: 'Create named goals with deadlines. Track your progress in real time and celebrate milestones as you hit them.',
  },
  {
    icon: BarChart3,
    color: 'text-blue-400',
    bg: 'bg-blue-400/10',
    title: 'Live Analytics',
    description: 'Full-history charts, per-goal breakdowns, and yield projections — all visible on your personal dashboard.',
  },
  {
    icon: Lock,
    color: 'text-rose-400',
    bg: 'bg-rose-400/10',
    title: 'Flexible Lock Options',
    description: 'Choose between flexible withdrawals or time-locked vaults for higher APY. You decide the risk-reward balance.',
  },
];

const FeatureGrid: React.FC = () => {
  return (
    <section className="w-full py-20 bg-[#061a1a]">
      <div className="max-w-[1200px] mx-auto px-12 max-md:px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-white mb-4">Core Features</h2>
          <p className="text-[1rem] text-[rgba(180,210,210,0.65)] max-w-xl mx-auto">
            A complete toolkit for decentralized savings — from first deposit to financial freedom.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="group p-7 rounded-2xl bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.07] hover:border-white/[0.16] transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <f.icon className={f.color} size={24} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
              <p className="text-sm leading-relaxed text-[rgba(180,210,210,0.6)]">{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeatureGrid;
