import { useEffect, useState } from 'react';
import RestaurantList from './components/RestaurantList';
import RestaurantDetail from './components/RestaurantDetail';
import './App.css';

function App() {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);

  // --- Sync with URL hash: #/restaurant/ID or no hash for home
  useEffect(() => {
  const applyHash = () => {
    const hash = window.location.hash || '';
    const match = hash.match(/^#\/restaurant\/(\d+)$/);
    const nextId = match ? parseInt(match[1], 10) : null;

    //  อัปเดต state เฉพาะเมื่อค่าจริงๆ เปลี่ยน
    setSelectedRestaurantId(prev => (prev === nextId ? prev : nextId));
  };

   applyHash();
  window.addEventListener('hashchange', applyHash);
  return () => window.removeEventListener('hashchange', applyHash);
}, []);

  // --- Update page title
  useEffect(() => {
    if (selectedRestaurantId) {
      document.title = `ร้าน #${selectedRestaurantId} | Restaurant Review`;
    } else {
      document.title = 'Restaurant Review – ค้นหาและรีวิวร้านอาหาร';
    }
  }, [selectedRestaurantId]);

  const handleSelectRestaurant = (id) => {
    // push hash to enable back/forward
    window.location.hash = `#/restaurant/${id}`;
    // scroll to top for better UX
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBack = () => {
    // go back to list (clear hash)
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>🍜 Restaurant Review</h1>
        <p>ค้นหาและรีวิวร้านอาหารโปรดของคุณ</p>
      </header>

      <main className="app-main">
        {selectedRestaurantId ? (
          <RestaurantDetail
            restaurantId={selectedRestaurantId}
            onBack={handleBack}
          />
        ) : (
          <RestaurantList onSelectRestaurant={handleSelectRestaurant} />
        )}
      </main>

      <footer className="app-footer">
        <p>&copy; 2024 Restaurant Review App | สร้างด้วย React + Express</p>
      </footer>
    </div>
  );
}

export default App;
