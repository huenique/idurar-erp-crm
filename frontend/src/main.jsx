import { createRoot } from 'react-dom/client';

import RootApp from './RootApp';
import './utils/testAppwrite';

const root = createRoot(document.getElementById('root'));
root.render(<RootApp />);
