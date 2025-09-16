import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import styles from '../components/IntroPopup.module.css';

export default function IntroPopup({ onFinish }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false); // Trigger exit animation
      setTimeout(onFinish, 1000); // Finish after fade out
    }, 3000);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
        >
          
          <div className={styles.waveContainer}>
            <svg
              className={styles.waveSvg}
              viewBox="0 0 1200 120"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#00d4ff" />
                  <stop offset="100%" stopColor="#0070f3" />
                </linearGradient>
              </defs>
              <path d="M0,60 C300,120 900,0 1200,60 L1200,120 L0,120 Z" />
            </svg>
          </div>

         
          <motion.h1
            className={styles.text}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 1 }}
          >
            Welcome to <span className={styles.highlight}>SoundAPI</span>
          </motion.h1>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

IntroPopup.propTypes = {
  onFinish: PropTypes.func.isRequired,
};