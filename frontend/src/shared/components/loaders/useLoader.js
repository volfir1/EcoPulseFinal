  // shared/components/LoaderLogic.js
  import { create } from 'zustand';

  export const useLoaderStore = create((set) => ({
    isLoading: false,
    startLoading: () => set({ isLoading: true }),
    stopLoading: () => set({ isLoading: false }),
  }));

  export const useLoader = () => {
    const { isLoading, startLoading, stopLoading } = useLoaderStore();
    return { isLoading, startLoading, stopLoading };
  };