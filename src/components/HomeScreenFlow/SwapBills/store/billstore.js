// stores/billStore.js
import { create } from 'zustand';

export const useBillStore = create(set => ({
  billData: {},
  setBillData: (data) =>
    set(state => ({
      billData: {
        ...state.billData,
        ...data,
      },
    })),
}));
