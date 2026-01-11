import { useState } from 'react';
// ... rest of your import statements

function App() {
  // ... rest of your state and props declarations
  
  const [showDegrees, setShowDegrees] = useState(false);

  return (
    <div className={styles.app}>
      {/* ... rest of your JSX */}
      <main className={styles.main}>
        <div className={styles.controls}>
          {/* ... rest of your controls */}
          <button onClick={() => setShowDegrees(!showDegrees)}>
            {showDegrees ? 'Hide' : 'Show'} Degrees
          </button>
        </div>
        {/* ... rest of your JSX */}
      </main>
    </div>
  );
}

export default App;
