import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Home } from 'lucide-react';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2, type: 'spring', stiffness: 120 }}
          className="relative inline-block"
        >
          <h1 className="text-8xl md:text-9xl font-extrabold text-gray-900 dark:text-white tracking-tighter">
            404
          </h1>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400/30 dark:bg-blue-500/30 rounded-full blur-3xl -z-10"></div>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-200 mt-4"
        >
          Page Not Found
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="text-gray-600 dark:text-gray-400 mt-2 max-w-sm mx-auto"
        >
          Sorry, we couldn't find the page you're looking for. It might have been moved or deleted.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.0 }}
          className="mt-8"
        >
          <Button asChild size="lg">
            <Link to="/" className="inline-flex items-center gap-2">
              <Home className="h-5 w-5" />
              <span>Go back home</span>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
