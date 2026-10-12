import type { Metadata } from 'next';
import Page from '../page';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to access your Oit real-time channels and voice rooms.',
  robots: {
    index: false,
    follow: true,
  },
};

export default function LoginPage() {
  return <Page />;
}
