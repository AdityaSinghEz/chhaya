import { useEffect, useMemo, useState } from "react";
import MapView from "./components/MapView";
import WeightSliders from "./components/WeightSliders";
import { DEFAULT_WEIGHTS, withLivePriority } from "./lib/priority";

export default function App() {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);

  useEffect(() => {
    fetch("/mock/cells.geojson")
      .then((res) => res.json())
      .then(setRaw)
      .catch((e) => setError(e.message));
  }, []);

  const data = useMemo(() => (raw ? withLivePriority(raw, weights) : null), [raw, weights]);

  return (
    <div className="grid h-full grid-cols-[340px_1fr]">
      <aside className="overflow-y-auto bg-stone-100 p-5">
        <h1 className="text-3xl font-bold">Chhaya</h1>
        <p className="text-gray-500">Where in Delhi would shade help the most people first?</p>
        <WeightSliders weights={weights} onChange={setWeights} />
      </aside>
      <main className="relative">
        {error && <p className="absolute left-4 top-4 z-10 bg-white p-2 text-red-700">{error}</p>}
        {!data && !error && <p className="absolute left-4 top-4 z-10 bg-white p-2">Loading Delhi…</p>}
        {data && <MapView data={data} />}
      </main>
    </div>
  );
}