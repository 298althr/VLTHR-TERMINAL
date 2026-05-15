'use client';

import { AppShell } from './AppShell';
import { useState } from 'react';

export function PrivacyPage() {
  const [biometrics, setBiometrics] = useState(true);
  const [stealth, setStealth] = useState(false);

  const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
    <button 
      onClick={onToggle}
      style={{ backgroundColor: active ? '#0a84ff' : 'rgba(255,255,255,0.1)' }}
      className={`w-12 h-7 rounded-full transition-all duration-300 relative shadow-inner ${active ? 'shadow-accent/20' : ''}`}
    >
      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-medium ${active ? 'left-6' : 'left-1'}`} />
    </button>
  );

  return (
    <AppShell title="Privacy & Security">
      <div className="flex flex-col gap-6">
        <section className="glass-liquid rounded-[28px] overflow-hidden divide-y divide-white/5">
          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white text-sm">Biometric Lock</span>
              <span className="text-white/40 text-[10px]">Require FaceID for all apps</span>
            </div>
            <Toggle active={biometrics} onToggle={() => setBiometrics(!biometrics)} />
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-white text-sm">Stealth Mode</span>
              <span className="text-white/40 text-[10px]">Mask network signature</span>
            </div>
            <Toggle active={stealth} onToggle={() => setStealth(!stealth)} />
          </div>
        </section>

        <section>
          <h2 className="text-white/40 text-xs font-bold uppercase tracking-widest px-4 mb-4">Authorized Nodes</h2>
          <div className="space-y-2">
            {['Nexus 7', 'Terminal Alpha', 'Ghost Shell'].map((node, i) => (
              <div key={i} className="flex items-center justify-between p-4 glass-liquid rounded-2xl">
                <span className="text-white text-sm font-medium">{node}</span>
                <button className="text-red-400 text-xs font-medium">Revoke</button>
              </div>
            ))}
          </div>
        </section>

        <p className="text-white/20 text-[10px] px-4 leading-relaxed mt-4">
          All privacy settings are encrypted and stored locally on your device's Secure Enclave. Ortho'M8 never sees your keys.
        </p>
      </div>
    </AppShell>
  );
}
