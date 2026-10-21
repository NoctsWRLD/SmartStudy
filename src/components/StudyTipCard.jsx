import { getDayOfYear, getSlovenianDateKey } from '../utils/dates';

const TIPS = [
  { title: 'Preverjaj spomin', copy: 'Zapri zapiske in si z lastnimi besedimi razloži tri glavne ideje.' },
  { title: 'Uči se v rundah', copy: 'Razdeli snov na manjše sklope in vmes naredi kratek odmor.' },
  { title: 'Povej na glas', copy: 'Razloži snov, kot da jo učiš prijatelja.' },
  { title: 'Začni z vprašanjem', copy: 'Zapiši si, kaj želiš razumeti, preden začneš.' },
  { title: 'Ponavljaj z razmikom', copy: 'Vrni se čez dan, čez nekaj dni in čez teden.' },
  { title: 'Menjaj način', copy: 'Izmenjuj branje, naloge in razlago.' },
  { title: 'Najprej osnutek', copy: 'Težko nalogo začni z grobim načrtom.' },
];

export default function StudyTipCard() {
  const tip = TIPS[getDayOfYear(getSlovenianDateKey()) % TIPS.length];
  return (
    <section className="card p-5" aria-labelledby="study-tip-title">
      <p className="text-label text-rp-muted">Namig za danes</p>
      <h2 id="study-tip-title" className="mt-1.5 text-title text-rp-text">{tip.title}</h2>
      <p className="mt-2 text-body text-rp-muted">{tip.copy}</p>
    </section>
  );
}
