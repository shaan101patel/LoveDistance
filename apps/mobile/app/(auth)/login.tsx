import { Redirect } from 'expo-router';

/** Alias for sign-in (`/(auth)/sign-in`). */
export default function LoginRedirectScreen() {
  return <Redirect href="/(auth)/sign-in" />;
}
