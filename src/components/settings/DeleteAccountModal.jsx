import { useEffect, useState } from 'react';
import Modal from '../Modal';
import { useAuth } from '../../contexts/AuthContext';
import { authErrorMessage } from '../../utils/authErrors';

/**
 * Deleting an account cannot be undone, so the student types their name and
 * their password. The list of what disappears is part of the confirmation —
 * not as a warning, but as a fact.
 */
export default function DeleteAccountModal({ isOpen, onClose, onConfirm, displayName }) {
  const { currentUser } = useAuth();
  const [typedName, setTypedName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setTypedName('');
    setPassword('');
    setError(null);
    setBusy(false);
  }, [isOpen]);

  const nameMatches = typedName.trim().toLowerCase() === (displayName || '').trim().toLowerCase();

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
      title="Izbriši račun"
      description="Z izbrisom odidejo vsi tvoji predmeti, naloge, preverjanja, kartice in klepeti."
      size="sm"
    >
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="username"
          value={currentUser?.email || ''}
          readOnly
          autoComplete="username"
          hidden
        />
        <p className="text-small leading-5 text-rp-muted">
          Tega ni mogoče razveljaviti. Za varnost vpiši svoje ime in geslo.
        </p>

        <div className="mt-4">
          <label className="field-label" htmlFor="delete-name">Ime računa</label>
          <input
            id="delete-name"
            value={typedName}
            onChange={(event) => setTypedName(event.target.value)}
            placeholder={displayName || 'Ime'}
            className="field"
          />
          {typedName && !nameMatches && (
            <p className="mt-1.5 text-small text-rp-muted">Ime se mora ujemati z imenom računa.</p>
          )}
        </div>

        <div className="mt-4">
          <label className="field-label" htmlFor="delete-password">Geslo</label>
          <input
            id="delete-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="field"
          />
        </div>

        {error && (
          <p className="mt-3 text-small text-rp-danger" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="btn">Prekliči</button>
          <button
            type="submit"
            disabled={busy || !nameMatches || !password}
            className="btn btn-danger"
          >
            {busy ? 'Brišem…' : 'Izbriši račun'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
