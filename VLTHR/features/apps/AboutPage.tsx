'use client';

import { AppShell } from './AppShell';

export function AboutPage() {
  return (
    <AppShell title="About Ortho'M8">
      <div className="flex flex-col gap-8">
        <section>
          <h2 className="text-accent text-xs font-bold uppercase tracking-widest mb-4">Vision</h2>
          <p className="text-white/80 leading-relaxed">
            Ortho'M8 OS is the world's first identity-centric operating system. We believe that your digital self should be as sovereign, secure, and intuitive as your physical self.
          </p>
        </section>

        <section className="glass rounded-3xl p-6 border border-white/5 shadow-medium">
          <h2 className="text-white font-bold mb-2">Immutable Identity</h2>
          <p className="text-white/60 text-sm">
            Leveraging decentralized protocols to ensure your data stays yours. No central server, no tracking, no compromise.
          </p>
        </section>

        <section>
          <h2 className="text-accent text-xs font-bold uppercase tracking-widest mb-4">Security Stack</h2>
          <ul className="space-y-4">
            {[
              { title: 'Zero-Knowledge Proofs', desc: 'Verify your age or status without revealing private data.' },
              { title: 'Biometric Sharding', desc: 'Identity keys split across hardware secure enclaves.' },
              { title: 'Quantum Resistance', desc: 'Encryption built for the next century of computing.' }
            ].map((item, i) => (
              <li key={i} className="flex flex-col gap-1">
                <span className="text-white font-medium">{item.title}</span>
                <span className="text-white/40 text-xs">{item.desc}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="text-center py-10 opacity-20">
          <p className="text-xs">Version 1.0.0 (Build 2026.05)</p>
          <p className="text-[10px] mt-1">© 2026 Ortho'M8 OS. All rights reserved.</p>
        </div>
      </div>
    </AppShell>
  );
}
