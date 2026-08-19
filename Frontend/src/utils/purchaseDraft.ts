import type { PurchaseDraft } from "../types";

const PURCHASE_DRAFT_KEY = "vivae:purchase-draft";

export function savePurchaseDraft(draft: PurchaseDraft) {
  sessionStorage.setItem(PURCHASE_DRAFT_KEY, JSON.stringify(draft));
}

export function getPurchaseDraft(eventId?: string | null) {
  const storedDraft = sessionStorage.getItem(PURCHASE_DRAFT_KEY);

  if (!storedDraft) return undefined;

  try {
    const draft = JSON.parse(storedDraft) as PurchaseDraft;
    return !eventId || draft.event.id === eventId ? draft : undefined;
  } catch {
    sessionStorage.removeItem(PURCHASE_DRAFT_KEY);
    return undefined;
  }
}

export function clearPurchaseDraft() {
  sessionStorage.removeItem(PURCHASE_DRAFT_KEY);
}
