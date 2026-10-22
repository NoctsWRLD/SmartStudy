import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { authErrorMessage } from '../../utils/authErrors';

/**
 * Confirming a sensitive change. The password is checked here so the student
 * is never asked to type it into a form they might not recognise.
 */
export default function ReauthModal({ isOpen, onClose, onConfirm, title, description, confirmLabel = 'Potrdi' }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setPassword('');
    setError(null);
    setBusy(false);
  }, [isOpen]);

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await onConfirm(password);
    } catch (err) {
      setError(authErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="reauth-password">Trenutno geslo</label>
        <input
          id="reauth-password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          className="field"
        />

        {error && (
          <p className="mt-3 text-small text-rp-danger" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn-ghost">Prekliči</button>
          <button type="submit" disabled={busy || !password} className="btn-primary">
            {busy ? 'Preverjam…' : confirmLabel}
          </button>
        </div>
      </form>
    </Modal>
  );
}
