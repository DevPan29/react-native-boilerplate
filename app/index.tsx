import { Redirect } from 'expo-router';
import { useIsAuthenticated } from '../src/store/authStore';

export default function Index() {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    return <Redirect href="/(app)" />;
  }

  return <Redirect href="/(auth)/login" />;
}
