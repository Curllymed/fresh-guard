'use client';

import React, { useState } from 'react';
import {
  FlaskConical,
  X,
  Play,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { IoTTestScenario, IOT_TEST_SCENARIOS } from '@/lib/data';

interface IoTTestMatrixModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunScenario: (scenario: IoTTestScenario) => void;
  onResetNormal: () => void;
}

export const IoTTestMatrixModal: React.FC<IoTTestMatrixModalProps> = ({
  isOpen,
  onClose,
  onRunScenario,
  onResetNormal,
}) => {
  const [activeTestId, setActiveTestId] = useState<string>('test-1-normal');
  const [executedTests, setExecutedTests] = useState<Record<string, 'PASSED' | 'PENDING'>>({
    'test-1-normal': 'PASSED',
  });

  if (!isOpen) return null;

  const handleExecute = (sc: IoTTestScenario) => {
    setActiveTestId(sc.id);
    onRunScenario(sc);
    setExecutedTests((prev) => ({ ...prev, [sc.id]: 'PASSED' }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-4xl glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                FreshGuard IoT Test Matrix Suite (§1.6.xxi)
              </h2>
              <p className="text-xs text-slate-400">
                Official SRS Test Matrix Verification & Scenario Simulation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Info banner */}
        <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/20 text-xs text-purple-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-purple-400 shrink-0" />
            <span>
              Executing a test scenario injects live test parameters into the DHT-11, MQ-135, Reed Switch,
              and LCD mirror to verify hardware alerts and the Freshness Decision Engine.
            </span>
          </div>
          <button
            onClick={onResetNormal}
            className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer transition-all"
          >
            Reset All to Normal
          </button>
        </div>

        {/* Test Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-slate-950/60">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-slate-900 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
                <th className="py-3 px-4">Test Scenario</th>
                <th className="py-3 px-4">SRS Section</th>
                <th className="py-3 px-4">Condition & Behavior</th>
                <th className="py-3 px-4">Pass Status</th>
                <th className="py-3 px-4 text-right">Execute</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {IOT_TEST_SCENARIOS.map((scenario) => {
                const isCurrent = activeTestId === scenario.id;
                const status = executedTests[scenario.id] || 'PENDING';

                return (
                  <tr
                    key={scenario.id}
                    className={`hover:bg-slate-800/30 transition-colors ${
                      isCurrent ? 'bg-purple-950/20' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{scenario.name}</div>
                      <div className="text-[10px] font-mono text-purple-300 mt-0.5">
                        {scenario.category}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono text-cyan-400 text-[11px]">
                      {scenario.srsSection}
                    </td>

                    <td className="py-3 px-4 text-slate-300 text-xs max-w-sm">
                      {scenario.description}
                    </td>

                    <td className="py-3 px-4">
                      {status === 'PASSED' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          VERIFIED
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-800 text-slate-400">
                          READY
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleExecute(scenario)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-slate-800 hover:bg-purple-900/60 text-slate-300 hover:text-white border border-white/5'
                        }`}
                      >
                        <Play className="w-3 h-3" />
                        Run Test
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-white/10 pt-4">
          
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs hover:bg-slate-700 cursor-pointer"
          >
            Close Matrix Suite
          </button>
        </div>
      </div>
    </div>
  );
};
