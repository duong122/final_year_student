import { create } from 'zustand';

interface ModalState {
  isComposerOpen: boolean;
  openComposer: () => void;
  closeComposer: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isComposerOpen: false,
  openComposer: () => set({ isComposerOpen: true }),
  closeComposer: () => set({ isComposerOpen: false }),
}));
