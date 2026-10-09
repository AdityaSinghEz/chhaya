import { useEffect, useState } from "react";
import MapView from "./components/MapView";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/mock/cells.geojson")
      .then((res) => res.json())
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  return (
    <div className="grid h-full grid-cols-[340px_1fr]">
      <aside className="bg-stone-100 p-5">
        <h1 className="text-3xl font-bold">Chhaya</h1>
        <p className="text-gray-500">Where in Delhi would shade help the most people first?</p>
      </aside>
      <main className="relative">
        {error && <p className="absolute left-4 top-4 z-10 bg-white p-2 text-red-700">{error}</p>}
        {!data && !error && <p className="absolute left-4 top-4 z-10 bg-white p-2">Loading Delhi…</p>}
        {data && <MapView data={data} />}
      </main>
    </div>
  );
}