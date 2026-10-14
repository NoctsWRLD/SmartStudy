import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../hooks/useFirestore';
import { useFlashcards } from '../hooks/useStudy';
import FlashcardModal from '../components/FlashcardModal';

function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { cards, loading, addCard, updateCard, deleteCard } = useFlashcards();
  const [deckId, setDeckId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [studying, setStudying] = useState(false);
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const activeDeckId = deckId || subjects[0]?.id || '';
  const deckCards = useMemo(() => cards.filter((c) => c.subjectId === activeDeckId), [cards, activeDeckId]);
  const knownCount = deckCards.filter((c) => c.known).length;
  const activeSubject = subjects.find((s) => s.id === activeDeckId);

  function openNew() {
    if (subjectsLoading) return;
    if (!subjects.length) { navigate('/subjects?create=1&from=task'); return; }
    setEditCard(null);
    setModalOpen(true);
  }

  function startStudy() {
    if (!deckCards.length) return;
    setOrder(shuffle(deckCards.map((c) => c.id)));
    setIndex(0);
    setFlipped(false);
    setStudying(true);
  }

  function currentCard() {
    return deckCards.find((c) => c.id === order[index]) || null;
  }

  function mark(known) {
    const card = currentCard();
    if (!card) return;
    if (card.known !== known) updateCard(card.id, { known });
    setFlipped(false);
    if (index + 1 >= order.length) {
      setStudying(false);
    } else {
      setIndex(index + 1);
    }
  }

  const card = studying ? currentCard() : null;

  return (
    <div className="space-y-7">
      <section className="rise">
        <h1 className="page-title">Kartice</h1>
        <p className="body-quiet mt-2">Učenje s karticami utrdi spomin: preberi vprašanje, odgovori na glas, nato preveri.</p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select value={activeDeckId} onChange={(e) => { setDeckId(e.target.value); setStudying(false); }} className="field !w-auto" aria-label="Izberi predmet">
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button type="button" onClick={openNew} className="btn-ghost">Nova kartica</button>
          <button type="button" onClick={startStudy} disabled={!deckCards.length} className="btn-primary disabled:opacity-50">
            Uči se ({deckCards.length})
          </button>
        </div>
      </section>

      {loading || subjectsLoading ? (
        <div className="card grid min-h-40 place-items-center" role="status">
          <span className="h-7 w-7 animate-spin rounded-full border-2 border-rp-iris border-t-transparent" />
        </div>
      ) : studying && card ? (
        <section className="rise mx-auto max-w-xl" aria-label="Učenje">
          <div className="mb-3 flex items-center justify-between text-sm text-rp-muted">
            <span>Kartica {index + 1} od {order.length}</span>
            <span>{knownCount} od {deckCards.length} osvojenih</span>
          </div>
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-rp-overlay" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={order.length}>
            <div className="h-full rounded-full bg-rp-iris transition-[width]" style={{ width: `${((index + 1) / order.length) * 100}%` }} />
          </div>
          <button
            type="button"
            onClick={() => setFlipped((f) => !f)}
            className="card grid min-h-64 w-full cursor-pointer place-items-center p-8 text-center transition-transform active:scale-[.99]"
            aria-label={flipped ? 'Pokaži vprašanje' : 'Pokaži odgovor'}
          >
            <div className={`flip-inner ${flipped ? 'flipped' : ''} grid w-full place-items-center`}>
              {!flipped ? (
                <div className="flip-face">
                  <p className="text-xs font-semibold text-rp-muted">{activeSubject?.name}</p>
                  <p className="font-display mt-2 text-2xl font-bold leading-snug">{card.front}</p>
                  <p className="mt-4 text-sm text-rp-muted">Klikni za odgovor</p>
                </div>
              ) : (
                <div className="flip-face flip-back">
                  <p className="text-xs font-semibold text-rp-muted">Odgovor</p>
                  <p className="mt-2 text-lg leading-relaxed">{card.back}</p>
                </div>
              )}
            </div>
          </button>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={() => mark(false)} className="btn-ghost !py-3">Še ne znam</button>
            <button type="button" onClick={() => mark(true)} className="btn-primary !py-3">Znam</button>
          </div>
          <button type="button" onClick={() => setStudying(false)} className="link-signal mt-4">Končaj učenje</button>
        </section>
      ) : (
        <section aria-label="Seznam kartic">
          <h2 className="section-title mb-3">
            {activeSubject ? `${activeSubject.name} — ${deckCards.length} kartic` : 'Kartice'}
            {deckCards.length > 0 && <span className="ml-2 text-sm font-medium text-rp-muted">({knownCount} osvojenih)</span>}
          </h2>
          {deckCards.length === 0 ? (
            <div className="card rise p-6">
              <h3 className="section-title">Začni zbirko za ta predmet.</h3>
              <p className="body-quiet mt-2 text-sm">Dodaj 5–10 kartic z vprašanji, ki se največkrat pojavijo na testih.</p>
              <button type="button" onClick={openNew} className="btn-ghost mt-4">Dodaj kartico</button>
            </div>
          ) : (
            <div className="stagger grid gap-2.5 sm:grid-cols-2">
              {deckCards.map((c) => (
                <div key={c.id} className={`card card-hover rise p-4 ${c.known ? 'opacity-70' : ''}`}>
                  <p className="text-[14.5px] font-bold leading-snug">{c.front}</p>
                  <p className="mt-1 line-clamp-2 text-[13px] text-rp-muted">{c.back}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${c.known ? 'bg-rp-iris/10 text-rp-iris' : 'bg-rp-overlay text-rp-muted'}`}>
                      {c.known ? 'Osvojeno' : 'V učenju'}
                    </span>
                    <div className="flex items-center">
                      <button onClick={() => { setEditCard(c); setModalOpen(true); }} aria-label="Uredi kartico" className="rounded-lg p-2 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button onClick={() => { if (window.confirm('Izbrišem kartico?')) deleteCard(c.id); }} aria-label="Izbriši kartico" className="rounded-lg p-2 text-rp-muted transition-colors hover:bg-rp-love/10 hover:text-rp-love">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <FlashcardModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditCard(null); }}
        onSave={(data) => { if (editCard) updateCard(editCard.id, data); else addCard(data); setEditCard(null); }}
        subjects={subjects}
        card={editCard}
        defaultSubjectId={activeDeckId}
      />
    </div>
  );
}
