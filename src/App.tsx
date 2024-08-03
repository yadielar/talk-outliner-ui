import { PWABadge } from './components/pwa-badge/PWABadge';

export default function App() {
  return (
    <div>
      <h1 className="text-3xl text-center font-bold my-4">Talk Outliner</h1>
      <p className="text-center">
        Edit <code>src/App.tsx</code> and save to test HMR
      </p>
      <PWABadge />
    </div>
  );
}
