"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from "react";

export type HeaderPhase = 0 | 1 | 2 | 3;

type CatalogHeaderActions = {
  setSearch: (value: string) => void;
  openCart: () => void;
};

type HeaderState = {
  homePhase: HeaderPhase;
  setHomePhase: Dispatch<SetStateAction<HeaderPhase>>;
  catalogSearch: string;
  cartCount: number;
  setCatalogSearch: (value: string) => void;
  setCartCount: (value: number) => void;
  registerCatalogActions: (actions: CatalogHeaderActions | null) => void;
  changeCatalogSearch: (value: string) => void;
  openCatalogCart: () => void;
};

const HeaderContext = createContext<HeaderState | null>(null);

export function HeaderStateProvider({ children }: { children: ReactNode }) {
  const [homePhase, setHomePhase] = useState<HeaderPhase>(0);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const catalogActionsRef = useRef<CatalogHeaderActions | null>(null);

  const registerCatalogActions = useCallback((actions: CatalogHeaderActions | null) => {
    catalogActionsRef.current = actions;
  }, []);

  const changeCatalogSearch = useCallback((value: string) => {
    setCatalogSearch(value);
    catalogActionsRef.current?.setSearch(value);
  }, []);

  const openCatalogCart = useCallback(() => {
    catalogActionsRef.current?.openCart();
  }, []);

  const state = useMemo<HeaderState>(
    () => ({
      homePhase,
      setHomePhase,
      catalogSearch,
      cartCount,
      setCatalogSearch,
      setCartCount,
      registerCatalogActions,
      changeCatalogSearch,
      openCatalogCart,
    }),
    [homePhase, catalogSearch, cartCount, registerCatalogActions, changeCatalogSearch, openCatalogCart],
  );

  return <HeaderContext.Provider value={state}>{children}</HeaderContext.Provider>;
}

export function useHeaderState(): HeaderState {
  const state = useContext(HeaderContext);

  if (!state) {
    throw new Error("HeaderStateProvider is required for shared site navigation");
  }

  return state;
}
