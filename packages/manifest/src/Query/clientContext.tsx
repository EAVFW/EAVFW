import { createContext, PropsWithChildren, useContext } from 'react';

const ClientContext = createContext<Partial<EAVClientProviderProps>>({
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
});

/**
 * Returns the current EAVFW client configuration (base URL and request
 * interceptor). Must be used inside an {@link EAVClientProvider}.
 *
 * @returns The client context value.
 *
 * @example
 * ```tsx
 * const { baseUrl } = useClientContext();
 * ```
 */
export const useClientContext = () => useContext(ClientContext) as EAVClientProviderProps;

/**
 * Props for {@link EAVClientProvider}.
 */
export type EAVClientProviderProps = {
  /** Base URL for EAVFW API requests. Defaults to `NEXT_PUBLIC_API_BASE_URL`. */
  baseUrl?: string;
  /** Optional interceptor to modify every outgoing `RequestInit`. */
  onRequestInit?: (a: RequestInit) => RequestInit;
};

/**
 * Provides the EAVFW API client configuration to all descendant query
 * hooks (e.g. {@link useSWRFetch}, {@link queryEntitySWR}).
 *
 * @example
 * ```tsx
 * <EAVClientProvider baseUrl="/api">
 *   <App />
 * </EAVClientProvider>
 * ```
 */
export const EAVClientProvider = ({
  children,
  ...props
}: PropsWithChildren<EAVClientProviderProps>) => (
  <ClientContext.Provider value={props}>{children}</ClientContext.Provider>
);

EAVClientProvider.defaultProps = { baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL };
