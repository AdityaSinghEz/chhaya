import { useEffect, useMemo, useState } from "react";
import MapView from "./components/MapView";
import WeightSliders from "./components/WeightSliders";
import OptimizerPanel from "./components/OptimizerPanel";
import CellPanel from "./components/CellPanel";
import { DEFAULT_WEIGHTS, withLivePriority } from "./lib/priority";

const NO_PLAN = [];

export default function App() {
  const [raw, setRaw] = useState(null);
  const [error, setError] = useState(null);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  const [selected, setSelected] = useState(null);
  const [plan, setPlan] = useState([]);
  const [planOn, setPlanOn] = useState(false);

  useEffect(() => {
    fetch("/mock/cells.geojson")
      .then((res) => res.json())
      .then(setRaw)
      .catch((e) => setError(e.message));
  }, []);

  const data = useMemo(() => (raw ? withLivePriority(raw, weights) : null), [raw, weights]);
  const cell = data?.features.find((f) => f.properties.h3_index === selected)?.properties ?? null;

  // Clicking the selected hexagon again deselects it
  const toggleSelected = (id) => setSelected((current) => (current === id ? null : id));

  const clearAll = () => {
    setSelected(null);
    setPlanOn(false);
  };

  return (
    <div className="grid h-full grid-cols-[340px_1fr]">
      <aside className="overflow-y-auto bg-stone-100 p-5">
        <h1 className="text-3xl font-bold">Chhaya</h1>
        <p className="text-gray-500">Where in Delhi would shade help the most people first?</p>
        <WeightSliders weights={weights} onChange={setWeights} />
        {data && (
          <OptimizerPanel
            data={data}
            active={planOn}
            onActiveChange={setPlanOn}
            onPlan={setPlan}
            onPick={setSelected}
          />
        )}
        <CellPanel cell={cell} />
      </aside>
      <main className="relative">
        {error && <p className="absolute left-4 top-4 z-10 bg-white p-2 text-red-700">{error}</p>}
        {!data && !error && <p className="absolute left-4 top-4 z-10 bg-white p-2">Loading Delhi…</p>}
        {data && (selected || planOn) && (
          <button
            type="button"
            onClick={clearAll}
            className="absolute left-4 top-4 z-10 rounded bg-white px-3 py-2 font-medium shadow hover:bg-stone-100"
          >
            Clear selection and plan
          </button>
        )}
        {data && (
          <MapView data={data} selected={selected} onSelect={toggleSelected} plan={planOn ? plan : NO_PLAN} />
        )}
      </main>
    </div>
  );
}