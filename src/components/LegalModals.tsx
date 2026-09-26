import React from 'react';
import { X, ShieldCheck, Lock, FileText, CheckCircle2 } from 'lucide-react';

interface LegalModalProps {
  type: 'privacy' | 'terms' | null;
  onClose: () => void;
}

export const LegalModal: React.FC<LegalModalProps> = ({ type, onClose }) => {
  if (!type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg bg-stone-50 dark:bg-stone-900 rounded-3xl border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between bg-amber-50/70 dark:bg-stone-900/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-800 text-white flex items-center justify-center font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <h3 className="font-display text-lg font-bold text-stone-900 dark:text-stone-100">
              {type === 'privacy' ? 'Privacy Policy' : 'Terms of Service'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 min-h-[44px] min-w-[44px] rounded-full hover:bg-stone-200 dark:hover:bg-stone-800 text-stone-500"
            aria-label="Close legal modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-4 text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
          {type === 'privacy' ? (
            <>
              <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40 font-medium text-amber-900 dark:text-amber-300">
                ILAHI Privacy Commitment for Travelers & Local Hosts (Gujarat & Rajasthan)
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  1. Information We Collect
                </h4>
                <p>
                  To facilitate genuine local guide matching, ILAHI collects tourist contact information (phone number, travel dates, trip preferences) and guide credentials (full name, verified phone number, state tourism certificates, and government-issued ID proofs).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  2. Contact Number Security & RLS Masking
                </h4>
                <p>
                  In accordance with Row-Level Security (RLS) policies, guide phone numbers and private KYC credential URLs are strictly masked from public queries. Guide phone numbers are revealed exclusively to tourists with a confirmed escrow deposit status (held or released).
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  3. Emergency SOS & Location Data
                </h4>
                <p>
                  When a traveler triggers the SOS alert, approximate trip coordinates and guide identity are transmitted exclusively to verified state tourism authorities and designated emergency contacts.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  4. Data Retention
                </h4>
                <p>
                  User session data and mock escrow records are maintained for prototype verification purposes and may be edited or deleted via the administrative Table Editor.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="p-3 rounded-xl bg-amber-100/60 dark:bg-amber-950/40 border border-amber-300/40 font-medium text-amber-900 dark:text-amber-300">
                Terms of Service & Escrow Guarantee (SIH 2026 Prototype)
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  1. Local Guide Verification
                </h4>
                <p>
                  Guides registered on ILAHI across Gujarat and Rajasthan are verified through a two-tier registration process. Tier 1 captures geographic district and contact validity; Tier 2 requires cultural specialization, spoken language proficiencies, and tourism accreditation.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  2. Escrow Protection Mechanism
                </h4>
                <p>
                  All bookings transition through a two-phase escrow workflow: funds are locked in "HELD" status upon booking confirmation and are released to the guide only upon the traveler's explicit confirmation or completion of the guided experience.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-stone-900 dark:text-stone-100 text-sm mb-1">
                  3. Code of Conduct & Heritage Preservation
                </h4>
                <p>
                  Both travelers and hosts agree to respect local community norms, sacred heritage sites, wildlife sanctum boundaries in Gir and Ranthambore, and traditional artisan workshops in Kutch and Bagru.
                </p>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-stone-200 dark:border-stone-800 bg-stone-100/80 dark:bg-stone-900 text-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white font-semibold text-xs min-h-[44px]"
          >
            I Understand & Accept
          </button>
        </div>
      </div>
    </div>
  );
};
