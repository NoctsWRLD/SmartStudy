import { getDayOfYear, getSlovenianDateKey } from '../utils/dates';

const TIPS = [
  { title: 'Preverjaj spomin', copy: 'Po branju zapri zapiske in si z lastnimi besedami razloži tri glavne ideje.', tag: 'Aktivni priklic' },
  { title: 'Uči se v kratkih rundah', copy: 'Razdeli večjo snov na manjše sklope in med njimi naredi kratek odmor.', tag: 'Ritem učenja' },
  { title: 'Povej na glas', copy: 'Snov razloži, kot da jo učiš prijatelja. Tako hitro odkriješ, kaj še ni jasno.', tag: 'Feynmanova tehnika' },
  { title: 'Začni z enim vprašanjem', copy: 'Pred učenjem si zapiši, kaj želiš razumeti. Med delom se vračaj k temu vprašanju.', tag: 'Jasen cilj' },
  { title: 'Ponavljaj z razmikom', copy: 'K snovi se vrni čez dan, nekaj dni in nato še čez teden. Kratko ponavljanje se sešteva.', tag: 'Razporejeno ponavljanje' },
  { title: 'Zamenjaj način vaje', copy: 'Izmenjuj branje, reševanje nalog in razlago. Različni pristopi utrdijo razumevanje.', tag: 'Raznolika vaja' },
  { title: 'Najprej naredi osnutek', copy: 'Težko nalogo začni z grobim načrtom. Prvi korak naj bo dovolj majhen, da ga lahko narediš takoj.', tag: 'Premagaj odlašanje' },
];

export default function StudyTipCard() {
  const tip = TIPS[getDayOfYear(getSlovenianDateKey()) % TIPS.length];

  return (
    <section className="glass-card overflow-hidden p-5" aria-labelledby="study-tip-title">
      <div className="flex items-center gap-2 text-rp-gold">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-rp-gold/10" aria-hidden="true">✦</span>
        <p className="text-xs font-semibold uppercase tracking-[.16em]">Namig za danes</p>
      </div>
      <h2 id="study-tip-title" className="mt-4 text-lg font-semibold text-rp-text">{tip.title}</h2>
      <p className="mt-2 text-sm leading-6 text-rp-subtle">{tip.copy}</p>
      <span className="mt-4 inline-flex rounded-full border border-rp-gold/20 bg-rp-gold/5 px-2.5 py-1 text-[11px] font-medium text-rp-gold">{tip.tag}</span>
    </section>
  );
}
