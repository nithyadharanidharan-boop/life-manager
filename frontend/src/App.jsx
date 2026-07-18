import { AnimatePresence, motion } from 'framer-motion';
import AuthScreen from './components/AuthScreen.jsx';
import Dashboard from './components/Dashboard.jsx';
import { useLocalStorage } from './hooks/useLocalStorage.js';

function App() {
  const [user, setUser] = useLocalStorage('nexus-user', null);

  return (
    <AnimatePresence mode="wait">
      {user ? (
        <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <Dashboard user={user} onLogout={() => setUser(null)} />
        </motion.div>
      ) : (
        <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
          <AuthScreen onAuthenticated={setUser} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default App;
