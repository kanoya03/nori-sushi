type GoogleCredential = { credential: string };
type GoogleIdentity = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredential) => void;
    auto_select: boolean;
    ux_mode: 'popup';
  }) => void;
  renderButton: (
    element: HTMLElement,
    options: { type: 'standard'; theme: 'outline'; size: 'large'; width: number; locale: string },
  ) => void;
  disableAutoSelect: () => void;
};
declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdentity } };
  }
}

let loading: Promise<GoogleIdentity> | undefined;
let initialized = false;
let receiver: ((credential: string) => void) | undefined;

export function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google?.accounts.id) {
    return Promise.resolve(window.google.accounts.id);
  }
  if (loading) {
    return loading;
  }
  loading = new Promise<GoogleIdentity>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    const fail = () => {
      window.clearTimeout(timer);
      script.remove();
      loading = undefined;
      reject(new Error('Google sign-in could not load.'));
    };
    const timer = window.setTimeout(fail, 15_000);
    script.onerror = fail;
    script.onload = () => {
      window.clearTimeout(timer);
      if (window.google?.accounts.id) {
        resolve(window.google.accounts.id);
      } else {
        fail();
      }
    };
    document.head.append(script);
  });
  return loading;
}

export function renderGoogleButton(
  identity: GoogleIdentity,
  element: HTMLElement,
  clientId: string,
  language: string,
  onCredential: (credential: string) => void,
): () => void {
  if (!initialized) {
    identity.initialize({
      client_id: clientId,
      auto_select: false,
      ux_mode: 'popup',
      callback: ({ credential }) => {
        if (credential) {
          receiver?.(credential);
        }
      },
    });
    initialized = true;
  }
  receiver = onCredential;
  element.replaceChildren();
  identity.renderButton(element, {
    type: 'standard',
    theme: 'outline',
    size: 'large',
    width: Math.min(340, element.clientWidth || 260),
    locale: language,
  });
  return () => {
    if (receiver === onCredential) {
      receiver = undefined;
    }
  };
}

export function disableGoogleAutoSelect() {
  window.google?.accounts.id.disableAutoSelect();
}
