import { useEffect, useState } from 'react';

function App() {
  const [foundationStatus, setFoundationStatus] = useState('Checking desktop connection…');
  const [ipcMessage, setIpcMessage] = useState('');

  useEffect(() => {
    window.desktop.getFoundationStatus()
      .then(({ message }) => setFoundationStatus(message))
      .catch(() => setFoundationStatus('Desktop connection could not be established.'));
  }, []);

  async function handleIpcTest() {
    setIpcMessage('Waiting for a response from the main process…');

    try {
      const response = await window.desktop.testElectronIpc();
      setIpcMessage(response.message);
    } catch {
      setIpcMessage('The Electron IPC test failed. Check the main-process console.');
    }
  }

  return (
    <main className="app-shell">
      <p className="eyebrow">Application foundation</p>
      <h1>Tech Learning Hub</h1>
      <p>Software House + Training Academy Management System</p>
      <p className="status">{foundationStatus}</p>
      <button type="button" onClick={handleIpcTest}>Test Electron IPC</button>
      {ipcMessage && <p className="status">{ipcMessage}</p>}
    </main>
  );
}

export default App;
