export interface GuestCartItem {
  productId: number;
  quantity: number;
}

export interface GuestCartDraft {
  paymentMethod: string;
  description: string;
}

const GUEST_CART_KEY = 'guest_cart_items';
const GUEST_CART_DRAFT_KEY = 'guest_cart_draft';
const POST_LOGIN_REDIRECT_KEY = 'post_login_redirect';

const parseItems = (value: string | null): GuestCartItem[] => {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item) => typeof item?.productId === 'number' && typeof item?.quantity === 'number')
      : [];
  } catch {
    return [];
  }
};

const getDefaultDraft = (): GuestCartDraft => ({
  paymentMethod: 'CASH',
  description: '',
});

const parseDraft = (value: string | null): GuestCartDraft => {
  if (!value) return getDefaultDraft();

  try {
    const parsed = JSON.parse(value);
    return {
      paymentMethod: typeof parsed?.paymentMethod === 'string' && parsed.paymentMethod.trim() ? parsed.paymentMethod : 'CASH',
      description: typeof parsed?.description === 'string' ? parsed.description : '',
    };
  } catch {
    return getDefaultDraft();
  }
};

export const guestCartService = {
  getItems(): GuestCartItem[] {
    if (typeof window === 'undefined') return [];
    return parseItems(localStorage.getItem(GUEST_CART_KEY));
  },

  saveItems(items: GuestCartItem[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
  },

  addItem(productId: number, quantity = 1) {
    const items = this.getItems();
    const existing = items.find((item) => item.productId === productId);

    if (existing) {
      this.saveItems(
        items.map((item) =>
          item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item,
        ),
      );
      return;
    }

    this.saveItems([...items, { productId, quantity }]);
  },

  updateItem(productId: number, quantity: number) {
    if (quantity <= 0) {
      this.removeItem(productId);
      return;
    }

    this.saveItems(
      this.getItems().map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  },

  removeItem(productId: number) {
    this.saveItems(this.getItems().filter((item) => item.productId !== productId));
  },

  clear() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(GUEST_CART_KEY);
    localStorage.removeItem(GUEST_CART_DRAFT_KEY);
  },

  hasItems() {
    return this.getItems().length > 0;
  },

  getCount() {
    return this.getItems().reduce((total, item) => total + item.quantity, 0);
  },

  setPostLoginRedirect(path: string) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(POST_LOGIN_REDIRECT_KEY, path);
  },

  consumePostLoginRedirect() {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem(POST_LOGIN_REDIRECT_KEY);
    localStorage.removeItem(POST_LOGIN_REDIRECT_KEY);
    return value;
  },

  getDraft(): GuestCartDraft {
    if (typeof window === 'undefined') return getDefaultDraft();
    return parseDraft(localStorage.getItem(GUEST_CART_DRAFT_KEY));
  },

  saveDraft(draft: Partial<GuestCartDraft>) {
    if (typeof window === 'undefined') return;

    const current = this.getDraft();
    const nextDraft: GuestCartDraft = {
      paymentMethod: typeof draft.paymentMethod === 'string' && draft.paymentMethod.trim() ? draft.paymentMethod : current.paymentMethod,
      description: typeof draft.description === 'string' ? draft.description : current.description,
    };

    localStorage.setItem(GUEST_CART_DRAFT_KEY, JSON.stringify(nextDraft));
  },
};