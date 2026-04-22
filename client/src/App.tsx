import { MapView } from './components/MapView';
import { Sidebar } from './components/Sidebar';
import { useBerths } from './hooks/useBerths';
import { useWebSocket } from './hooks/useWebSocket';
import { BerthStatus } from './types';

function App() {
  const { berths, stats, isLoading, error, updateBerthStatus } = useBerths();
  const { isConnected, ships } = useWebSocket();

  const handleBerthStatusChange = async (id: number, status: BerthStatus) => {
    await updateBerthStatus(id, status);
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="mt-4 text-gray-600">Loading data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠</div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Error</h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Reload
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      <Sidebar
        berths={berths}
        ships={ships}
        stats={stats}
        isConnected={isConnected}
      />
      
      <main className="flex-1 relative">
        <MapView
          berths={berths}
          ships={ships}
          onBerthStatusChange={handleBerthStatusChange}
        />
      </main>
    </div>
  );
}

export default App;
