import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ExternalLink, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store/authStore';
import { startTelegramAuth } from '../../api/authApi';
import { ApiError } from '../../api/client';
import type { TelegramSession } from '../../types/auth';
import { GoogleSignIn } from './GoogleSignIn';

export function AuthPanel() {
  const { t } = useTranslation();
  const { status, error, signInTelegram, clearError } = useAuthStore();
  const [session, setSession] = useState<TelegramSession | null>(null);
  const [code, setCode] = useState('');
  const [starting, setStarting] = useState(false);
  const [startError, setStartError] = useState<'telegramStartError' | 'rateLimited' | null>(null);
  const controller = useRef<AbortController | null>(null);
  const busy = starting || status === 'authenticating';

  useEffect(() => () => controller.current?.abort(), []);

  async function start() {
    controller.current?.abort();
    const request = new AbortController();
    controller.current = request;
    setStarting(true);
    setStartError(null);
    clearError();
    try {
      const result = await startTelegramAuth(request.signal);
      if (!request.signal.aborted) {
        setSession(result);
        setCode('');
      }
    } catch (error) {
      if (!request.signal.aborted) {
        setStartError(
          error instanceof ApiError && error.status === 429 ? 'rateLimited' : 'telegramStartError',
        );
      }
    } finally {
      if (!request.signal.aborted) {
        setStarting(false);
      }
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (session && /^\d{6}$/.test(code) && !busy) {
      void signInTelegram(session.sessionToken, code);
    }
  }

  return (
    <div className="panel auth-panel">
      <h2>{t('auth.signIn')}</h2>
      <p className="muted">{t('auth.description')}</p>
      {error && (
        <p className="inline-error" role="alert">
          {t(`auth.${error}`)}
        </p>
      )}
      {status === 'authenticating' && <p role="status">{t('auth.signingIn')}</p>}
      <div className={busy ? 'auth-provider auth-provider-busy' : 'auth-provider'} inert={busy}>
        <GoogleSignIn />
      </div>
      <div className="auth-divider">
        <span>{t('auth.or')}</span>
      </div>
      {!session ? (
        <button
          className="button button-dark"
          type="button"
          disabled={busy}
          onClick={() => void start()}
        >
          <Send size={18} aria-hidden="true" />
          {t(starting ? 'auth.starting' : 'auth.telegram')}
        </button>
      ) : (
        <form onSubmit={submit} className="telegram-form">
          <p className="muted">{t('auth.telegramInstructions')}</p>
          <a
            className="button button-light"
            href={session.telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t('auth.openTelegram')}
            <ExternalLink size={16} aria-hidden="true" />
          </a>
          <label htmlFor="telegram-code">{t('auth.code')}</label>
          <input
            id="telegram-code"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="[0-9]{6}"
            maxLength={6}
            value={code}
            onChange={(event) => setCode(event.target.value.replace(/\D/g, ''))}
            placeholder="000000"
            required
            disabled={busy}
          />
          <button className="button button-dark" type="submit" disabled={busy || code.length !== 6}>
            {t('auth.verify')}
          </button>
          <button
            className="text-button"
            type="button"
            disabled={busy}
            onClick={() => void start()}
          >
            {t(starting ? 'auth.starting' : 'auth.newCode')}
          </button>
        </form>
      )}
      {startError && (
        <p role="alert" className="inline-error">
          {t(`auth.${startError}`)}
        </p>
      )}
      <p className="auth-note muted">{t('auth.sessionNote')}</p>
    </div>
  );
}
