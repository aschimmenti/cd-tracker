import CreditTracker from './components/CreditTracker';
import './App.css';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <CreditTracker />
      </div>
    </div>
  );
}

export default App;