const SELECTED_ADDRESS_KEY = 'nori-web-selected-address';

let selectedAddressId: number | null = null;

export function readSelectedAddressId(): number | null {
  if (selectedAddressId !== null) {
    return selectedAddressId;
  }

  try {
    const value = Number(sessionStorage.getItem(SELECTED_ADDRESS_KEY));
    return Number.isSafeInteger(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function saveSelectedAddressId(id: number): void {
  selectedAddressId = id;

  try {
    sessionStorage.setItem(SELECTED_ADDRESS_KEY, String(id));
  } catch {
    // Keep the selection available during navigation when browser storage is blocked.
  }
}
