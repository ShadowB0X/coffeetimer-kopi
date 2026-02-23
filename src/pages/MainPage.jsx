import { useState } from 'react';
import styles from '../components/MainPage.module.css';
import ImageBox from './imageBox';
import IntroPopup from './IntroPopup';


export default function MainPage() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <div className={styles.container}>
      {showIntro ? (
        <IntroPopup onFinish={() => setShowIntro(false)} />
      ) : (
        <>

          {/* Main content with spacing under sticky navbar */}
          <main className={styles.contentWrapper}>
            <div className={styles.content}>
              <h1 className={styles.title}>Welcome to ShortCut</h1>
              <p className={styles.text}>
                Sharpen Your Style — ShortCut
              </p>
              <p className={styles.text}>
                ShortCut is designed to help the people, artists, and business men get their style at a deeper level.
              </p>
              <p className={styles.text}>
                Learn about our visions, and what we do.
              </p>

              <ImageBox /> 
            </div>
          </main>

          
        </>
      )}
    </div>
  );
}