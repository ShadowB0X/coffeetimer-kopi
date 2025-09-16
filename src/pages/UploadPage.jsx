import { useState } from 'react';
import styles from '../components/UploadPage.module.css';
import WaveBackground from './WaveBackground';

export default function UploadPage({ token }) {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleUpload = async (e) => {
    e.preventDefault();
    setIsComplete(false);
    setIsUploading(true);
    setMessage('');

    if (!file) {
      setIsUploading(false);
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();
    formData.append('audio', file);

    try {
      const res = await fetch('https://api.powersurge.dk/api//audio/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (res.ok) {
        setMessage(" Upload successful!");
        setIsComplete(true);
      } else {
        setMessage(" Upload failed.");
      }
    } catch (err) {
      setMessage(` Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className={styles.container}>
      <WaveBackground />

      <form onSubmit={handleUpload} className={styles.uploadBox}>
        <h2>Upload Audio</h2>
        <input
          type="file"
          className={styles.fileInput}
          onChange={e => setFile(e.target.files[0])}
        />
        <button type="submit" className={styles.button}>Upload</button>

        {isUploading && (
          <div className={styles.loader}>
            <svg viewBox="0 0 50 50" className={styles.spinner}>
              <circle cx="25" cy="25" r="20" fill="none" strokeWidth="4" />
            </svg>
            <span>Uploading...</span>
          </div>
        )}

        {isComplete && !isUploading && (
          <div className={styles.complete}>
            <svg viewBox="0 0 24 24" className={styles.check}>
              <path
                fill="currentColor"
                d="M9 16.2l-3.5-3.5L4 14.2l5 5 12-12-1.5-1.4z"
              />
            </svg>
            <span>Upload Complete</span>
          </div>
        )}

        {message && <p className={styles.message}>{message}</p>}
      </form>
    </div>
  );
}