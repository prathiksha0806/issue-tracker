import './globals.css';
import AuthProvider from '../components/AuthProvider';
import Nav from '../components/Nav';

export const metadata = { title: 'Issue Tracker', description: 'Track, assign and discuss issues' };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Nav />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
