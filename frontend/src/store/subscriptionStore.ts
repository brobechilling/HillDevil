import { create } from "zustand";
import { SubscriptionResponse } from "@/dto/subscription.dto";
import { SubscriptionPaymentResponse } from "@/dto/subscriptionPayment.dto";

interface SubscriptionUIState {
  selectedSubscription?: SubscriptionResponse;
  currentPayment?: SubscriptionPaymentResponse;
  isPaymentModalOpen: boolean;

  setSelectedSubscription: (sub?: SubscriptionResponse) => void;
  setCurrentPayment: (pay?: SubscriptionPaymentResponse) => void;
  setPaymentModalOpen: (open: boolean) => void;
}

export const useSubscriptionStore = create<SubscriptionUIState>((set) => ({
  selectedSubscription: undefined,
  currentPayment: undefined,
  isPaymentModalOpen: false,

  setSelectedSubscription: (sub) => set({ selectedSubscription: sub }),
  setCurrentPayment: (pay) => set({ currentPayment: pay }),
  setPaymentModalOpen: (open) => set({ isPaymentModalOpen: open }),
}));
