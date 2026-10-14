import { getDayOfYear, getSlovenianDateKey } from '../utils/dates';

const TIPS = [
  { title: 'Preverjaj spomin', copy: 'Zapri zapiske in si z lastnimi besedami razloži tri glavne ideje.', tag: 'Aktivni priklic' },
  { title: 'Uči se v rundah', copy: 'Razdeli snov na manjše sklope in vmes naredi kratek odmor.', tag: 'Ritem' },
  { title: 'Povej na glas', copy: 'Razloži snov, kot da jo učiš prijatelja.', tag: 'Feynman' },
  { title: 'Začni z vprašanjem', copy: 'Zapiši si, kaj želiš razumeti, preden začneš.', tag: 'Cilj' },
  { title: 'Ponavljaj z razmikom', copy: 'Vrni se čez dan, čez nekaj dni in čez teden.', tag: 'Spomin' },
  { title: 'Menjaj način', copy: 'Izmenjuj branje, naloge in razlago.', tag: 'Vaja' },
  { title: 'Najprej osnutek', copy: 'Težko nalogo začni z grobim načrtom.', tag: 'Start' },
];

export default function StudyTipCard() {
  const tip = TIPS[getDayOfYear(getSlovenianDateKey()) % TIPS.length];
  return (
    <section className="card rise relative overflow-hidden p-5" aria-labelledby="study-tip-title">
      <div className="absolute inset-x-0 top-0 h-1.5 bg-[var(--ss-marker)]" aria-hidden="true" />
      <p className="font-hand text-xl leading-none text-rp-muted">namig za danes *</p>
      <h2 id="study-tip-title" className="font-display mt-2 text-lg font-bold leading-snug">{tip.title}</h2>
      <p className="mt-1.5 text-sm leading-6 text-rp-muted">{tip.copy}</p>
      <span className="mt-3 inline-flex rounded-full bg-rp-overlay px-2.5 py-1 text-[11px] font-semibold text-rp-subtle">{tip.tag}</span>
    </section>
  );
}
