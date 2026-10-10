import { useEffect, useState } from "react";
import MapView from "./components/MapView";
import DetailPanel from "./components/DetailPanel";
import Legend from "./components/Legend";
import { getCells } from "./lib/api";
import { GRADIENT } from "./lib/palette";

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getCells().then(setData).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const cell = data?.features.find((f) => f.properties.h3_index === selected)?.properties ?? null;
  const total = data?.features.length ?? 0;
  const notice = "absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white px-5 py-3 shadow-lg";

  return (
    <div className="relative h-full w-full overflow-hidden">
      {data && <MapView data={data} selected={selected} onSelect={setSelected} />}

      <div className="absolute left-4 top-4 z-10 overflow-hidden rounded-xl bg-white/90 shadow-lg backdrop-blur">
        <div className="px-4 py-3">
          <h1 className="text-xl font-bold tracking-tight">Chhaya</h1>
          <p className="text-sm text-muted">Where in Delhi should trees go first?</p>
        </div>
        <div className="h-1" style={{ background: GRADIENT }} />
      </div>

      {data && <Legend total={total} />}
      {!data && !error && <p className={notice}>Loading Delhi…</p>}
      {error && <p className={notice + " text-red-700"}>{error}</p>}

      <DetailPanel cell={cell} total={total} onClose={() => setSelected(null)} />
    </div>
  );
}