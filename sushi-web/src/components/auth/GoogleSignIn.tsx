import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { loadGoogleIdentity, renderGoogleButton } from '../../lib/googleIdentity';

export function GoogleSignIn() {
  const { t } = useTranslation();
  const language = useLanguageStore((state) => state.language);
  const signIn = useAuthStore((state) => state.signInGoogle);
  const host = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [attempt, setAttempt] = useState(0);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID?.trim();

  useEffect(() => {
    if (!clientId) {
      return;
    }
    let active = true;
    let cleanup: (() => void) | undefined;
    setState('loading');
    void loadGoogleIdentity()
      .then((identity) => {
        if (!active || !host.current) {
          return;
        }
        cleanup = renderGoogleButton(identity, host.current, clientId, language, (token) => {
          void signIn(token);
        });
        setState('ready');
      })
      .catch(() => {
        if (active) {
          setState('error');
        }
      });
    return () => {
      active = false;
      cleanup?.();
    };
  }, [clientId, language, signIn, attempt]);

  if (!clientId) {
    return <p className="muted auth-note">{t('auth.googleUnavailable')}</p>;
  }
  return (
    <div className="google-sign-in">
      <div ref={host} />
      {state === 'loading' && (
        <p role="status" className="muted">
          {t('auth.googleLoading')}
        </p>
      )}
      {state === 'error' && (
        <div role="alert">
          <p>{t('auth.googleLoadError')}</p>
          <button className="text-button" type="button" onClick={() => setAttempt(attempt + 1)}>
            {t('common.retry')}
          </button>
        </div>
      )}
    </div>
  );
}
