import { createRoot } from 'react-dom/client';

import RootApp from './RootApp';
// import './utils/testAppwrite'; // Commented out to prevent auto-execution

const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);
