import {
  createContext,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';
import { useNavigate, type NavigateFunction } from 'react-router-dom';
import { toast } from 'sonner';

export type NotificationService = {
  success: (s: string) => void;
  error: (s: string) => void;
  message: (s: string) => void;
  unknownError: () => void;
};

export type NavigationService = {
  navigate: NavigateFunction;
};

export type AppServices = {
  notify: NotificationService;
  navigation: NavigationService;
};

const defaultNotify: NotificationService = {
  success: toast.success,
  error: toast.error,
  unknownError: () => {
    toast.error("Something weird has happened, we don't know what.");
  },
  message: toast.message,
};

const AppServicesContext = createContext<AppServices | null>(null);

export function AppServicesProvider({ children }: PropsWithChildren) {
  const navigate = useNavigate();
  const services = useMemo<AppServices>(
    () => ({
      notify: defaultNotify,
      navigation: { navigate },
    }),
    [navigate],
  );

  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function AppServicesOverrideProvider({
  children,
  services,
}: PropsWithChildren<{ services: AppServices }>) {
  return (
    <AppServicesContext.Provider value={services}>
      {children}
    </AppServicesContext.Provider>
  );
}

export function useAppServices() {
  const services = useContext(AppServicesContext);
  if (!services) {
    throw new Error('useAppServices must be used within AppServicesProvider');
  }
  return services;
}

export function emptyToast(message: string) {
  return message;
}

export function createTestAppServices(
  overrides: Partial<{
    notify: Partial<NotificationService>;
    navigation: Partial<NavigationService>;
  }> = {},
): AppServices {
  return {
    notify: {
      success: emptyToast,
      error: emptyToast,
      message: emptyToast,
      unknownError: () => emptyToast('err.'),
      ...overrides.notify,
    },
    navigation: {
      navigate: (() => undefined) as NavigationService['navigate'],
      ...overrides.navigation,
    },
  };
}
