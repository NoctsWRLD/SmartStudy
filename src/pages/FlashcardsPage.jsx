import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSubjects } from '../hooks/useFirestore';
import { useFlashcards } from '../hooks/useStudy';
import FlashcardModal from '../components/FlashcardModal';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { CardIcon, EditIcon, TrashIcon } from '../components/icons';
import { getSubjectColor } from '../utils/colors';
import { countedNoun } from '../utils/slovenian';

function shuffle(list) {
  const array = [...list];
  for (let index = array.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(Math.random() * (index + 1));
    [array[index], array[swap]] = [array[swap], array[index]];
  }
  return array;
}

export default function FlashcardsPage() {
  const navigate = useNavigate();
  const { subjects, loading: subjectsLoading } = useSubjects();
  const { cards, loading, error, addCard, updateCard, deleteCard } = useFlashcards();
  const [deckId, setDeckId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [studying, setStudying] = useState(false);
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const activeDeckId = deckId || subjects[0]?.id || '';
  const deckCards = useMemo(
    () => cards.filter((card) => card.subjectId === activeDeckId),
    [cards, activeDeckId],
  );
  const knownCount = deckCards.filter((card) => card.known).length;
  const activeSubject = subjects.find((subject) => subject.id === activeDeckId);
  const activeColor = activeSubject ? getSubjectColor(activeSubject.colorIndex) : null;

  function openNew() {
    if (subjectsLoading) return;
    if (!subjects.length) {
      navigate('/subjects?create=1&from=task');
      return;
    }
    setEditCard(null);
    setModalOpen(true);
  }

  function startStudy() {
    if (!deckCards.length) return;
    setOrder(shuffle(deckCards.map((card) => card.id)));
    setIndex(0);
    setFlipped(false);
    setStudying(true);
  }

  function currentCard() {
    return deckCards.find((card) => card.id === order[index]) || null;
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
    <div className="space-y-6">
      <section className="rise margin-rule">
        <h1 className="text-page text-rp-text">Kartice</h1>
        <p className="mt-2 max-w-xl text-body text-rp-muted">
          Učenje s karticami utrdi spomin: preberi vprašanje, odgovori na glas, nato preveri.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <select
            value={activeDeckId}
            onChange={(event) => { setDeckId(event.target.value); setStudying(false); }}
            className="field !w-auto"
            aria-label="Izberi predmet"
          >
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </select>
          <button type="button" onClick={openNew} className="btn-ghost">Nova kartica</button>
          <button
            type="button"
            onClick={startStudy}
            disabled={!deckCards.length}
            className="btn-primary disabled:opacity-50"
          >
            Uči se ({deckCards.length})
          </button>
        </div>
      </section>

      {error ? (
        <ErrorState message={error} />
      ) : loading || subjectsLoading ? (
        <div className="card p-4"><Skeleton lines={4} /></div>
      ) : studying && card ? (
        <section className="mx-auto max-w-xl" aria-label="Učenje">
          <div className="mb-3 flex items-center justify-between text-small text-rp-muted">
            <span className="mono">Kartica {index + 1} / {order.length}</span>
            <span className="mono">{knownCount} / {deckCards.length} osvojenih</span>
          </div>
          <div
            className="mb-3 h-1.5 overflow-hidden rounded-full bg-rp-fill"
            role="progressbar"
            aria-valuenow={index + 1}
            aria-valuemin={1}
            aria-valuemax={order.length}
            aria-label="Potek učenja"
          >
            <div
              className="h-full rounded-full transition-[width] duration-300"
              style={{ width: `${((index + 1) / order.length) * 100}%`, background: 'var(--rp-accent)' }}
            />
          </div>

          <button
            type="button"
            onClick={() => setFlipped((value) => !value)}
            className="card grid min-h-64 w-full cursor-pointer place-items-center p-8 text-center transition-transform active:scale-[.99]"
            aria-label={flipped ? 'Pokaži vprašanje' : 'Pokaži odgovor'}
          >
            <div className={`flip-inner ${flipped ? 'flipped' : ''} grid w-full place-items-center`}>
              {!flipped ? (
                <div className="flip-face">
                  {activeSubject && (
                    <p className={`text-label ${activeColor?.text || 'text-rp-muted'}`}>{activeSubject.name}</p>
                  )}
                  <p className="font-display mt-2 text-2xl font-bold leading-snug text-rp-text">{card.front}</p>
                  <p className="mt-4 text-small text-rp-muted">Klikni za odgovor</p>
                </div>
              ) : (
                <div className="flip-face flip-back">
                  <p className="text-label text-rp-muted">Odgovor</p>
                  <p className="mt-2 text-lg leading-relaxed text-rp-text">{card.back}</p>
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
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-title text-rp-text">
              {activeSubject ? activeSubject.name : 'Kartice'}
            </h2>
            {deckCards.length > 0 && (
              <p className="text-small text-rp-muted">
                {countedNoun(deckCards.length, 'kartica', 'kartici', 'kartice', 'kartic')} ·{' '}
                {knownCount} osvojenih
              </p>
            )}
          </div>

          {deckCards.length === 0 ? (
            <EmptyState
              icon={<CardIcon className="h-6 w-6" />}
              title="Začni zbirko za ta predmet"
              description="Dodaj 5–10 kartic z vprašanji, ki se največkrat pojavijo na testih."
              action={<button type="button" onClick={openNew} className="btn-primary">Dodaj kartico</button>}
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {deckCards.map((deckCard) => (
                <div key={deckCard.id} className={`card card-hover p-4 ${deckCard.known ? 'opacity-75' : ''}`}>
                  <p className="text-body font-semibold leading-snug text-rp-text">{deckCard.front}</p>
                  <p className="mt-1 line-clamp-2 text-small text-rp-muted">{deckCard.back}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`chip ${deckCard.known ? 'chip-accent' : ''}`}>
                      {deckCard.known ? 'Osvojeno' : 'V učenju'}
                    </span>
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => { setEditCard(deckCard); setModalOpen(true); }}
                        aria-label={`Uredi kartico ${deckCard.front}`}
                        className="rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-overlay hover:text-rp-text"
                      >
                        <EditIcon className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { if (window.confirm('Izbrišem kartico?')) deleteCard(deckCard.id); }}
                        aria-label={`Izbriši kartico ${deckCard.front}`}
                        className="rounded-md p-2 text-rp-muted transition-colors hover:bg-rp-danger/10 hover:text-rp-danger"
                      >
                        <TrashIcon className="h-4 w-4" />
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
