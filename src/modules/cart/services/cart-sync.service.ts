import { authService } from '@/modules/auth/services/auth.service';
import { clientService } from '@/modules/clients/services/client.service';
import { saleService } from '@/modules/sales/services/sale.service';
import { SaleDetail } from '@/modules/sales/types/sale.types';
import { guestCartService } from './guest-cart.service';

export const cartSyncService = {
  async resolveClientForCurrentUser() {
    const user = authService.getCurrentUser();
    if (!user?.email) return null;

    const clients = await clientService.getAll();
    return clients.find((client) => client.email.toLowerCase() === user.email.toLowerCase()) ?? null;
  },

  async syncGuestCartToBackend() {
    const client = await this.resolveClientForCurrentUser();
    if (!client) {
      throw new Error('No existe un cliente asociado a este usuario.');
    }

    const guestItems = guestCartService.getItems();
    const guestDraft = guestCartService.getDraft();
    let cart = await saleService.getCurrentCart(client.id);

    if (guestItems.length === 0) {
      return cart;
    }

    if (!cart) {
      cart = await saleService.getOrCreateCart(client.id, client.userId);
    }

    const quantitiesByProduct = guestItems.reduce<Map<number, number>>((accumulator, item) => {
      accumulator.set(item.productId, (accumulator.get(item.productId) ?? 0) + item.quantity);
      return accumulator;
    }, new Map());

    for (const [productId, quantity] of quantitiesByProduct.entries()) {
      const existingDetail: SaleDetail | undefined = cart.details.find((detail) => detail.productId === productId);

      cart = existingDetail?.id
        ? await saleService.updateItem(cart.id, existingDetail.id, existingDetail.quantity + quantity)
        : await saleService.addItem(cart.id, { productId, quantity });
    }

    cart = await saleService.update(cart.id, {
      clientId: cart.clientId ?? client.id,
      userId: cart.userId,
      paymentMethod: guestDraft.paymentMethod,
      description: guestDraft.description.trim() || undefined,
    });

    guestCartService.clear();
    return cart;
  },
};