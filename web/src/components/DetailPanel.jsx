import { useEffect, useRef, useState } from "react";
import { whatIf } from "../lib/api";
import { BANDS } from "../lib/palette";

export default function DetailPanel({ cell, total, onClose }) {
    const [hectares, setHectares] = useState(1);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const last = useRef(cell);
    if (cell) last.current = cell;
    const c = last.current;

    useEffect(() => {
        if (!cell) return;
        let outdated = false;
        setError(null);
        whatIf(cell, hectares)
            .then((r) => {
                if (!outdated) setResult(r);
            })
            .catch((e) => {
                if (outdated) return;
                setResult(null);
                setError(e.message);
            });
        return () => {
            outdated = true;
        };
    }, [cell, hectares]);

    const band = c ? BANDS.find((b) => (c.priority_rank - 1) / Math.max(total - 1, 1) < b.upTo) : null;

    const facts = c
        ? [
            ["Surface temperature", `${c.lst_c.toFixed(1)} °C`],
            ["Greenery", `${Math.round(c.ndvi * 100)}%`],
            ["Built up", `${Math.round(c.built_frac * 100)}%`],
            ["Dust index", c.dust_idx.toFixed(2)],
            ["People", c.population.toLocaleString("en-IN")],
            ["Schools", c.school_count],
            ...(Number.isFinite(c.aqi) ? [["Air Quality Index", c.aqi]] : []),
        ]
        : [];

    return (
        <aside
            aria-hidden={!cell}
            className={
                "fixed right-0 top-0 z-20 h-full w-full overflow-y-auto bg-white shadow-2xl transition-transform duration-300 ease-out sm:w-[380px] " +
                (cell ? "translate-x-0" : "pointer-events-none translate-x-full")
            }
        >
            {c && (
                <>
                    <div className="h-1.5" style={{ background: band.colour }} />
                    <div className="p-6">
                        <button
                            type="button"
                            onClick={onClose}
                            aria-label="Close"
                            className="absolute right-4 top-5 rounded-full px-3 py-1 text-2xl leading-none text-muted hover:bg-wash"
                        >
                            ×
                        </button>

                        <p className="text-sm text-muted">{c.area_name ?? c.ward ?? "Area name not available yet"}</p>
                        <p className="mt-3 text-sm font-medium text-muted">Priority rank</p>
                        <p className="text-5xl font-bold tracking-tight">
                            {c.priority_rank.toLocaleString("en-IN")}
                            <span className="ml-2 text-lg font-medium text-muted">of {total.toLocaleString("en-IN")}</span>
                        </p>
                        <p className="mt-2 flex items-center gap-2 font-medium">
                            <span className="inline-block h-3 w-3 rounded-full ring-1 ring-black/10" style={{ background: band.colour }} />
                            {band.label}
                        </p>
                        <p className="text-sm text-muted">Rank 1 is the most urgent area in Delhi.</p>

                        <dl className="mt-6 grid grid-cols-[1fr_auto] gap-x-3 gap-y-2.5 border-t border-line pt-4">
                            {facts.map(([label, value]) => (
                                <div key={label} className="contents">
                                    <dt className="text-muted">{label}</dt>
                                    <dd className="text-right font-medium">{value}</dd>
                                </div>
                            ))}
                        </dl>

                        <div className="mt-6 border-t border-line pt-4">
                            <label className="block">
                                <span className="mb-1 flex justify-between font-medium">
                                    <span>If we add tree canopy</span>
                                    <output>{hectares} hectare{hectares === 1 ? "" : "s"}</output>
                                </span>
                                <input
                                    className="w-full accent-accent"
                                    type="range" min={0.5} max={5} step={0.5}
                                    value={hectares}
                                    onChange={(e) => setHectares(Number(e.target.value))}
                                />
                            </label>
                            {error && <p className="mt-2 text-red-700">{error}</p>}
                            {result && !error && (
                                <p className="mt-3 rounded-r-lg border-l-4 border-accent bg-wash p-3">
                                    About <strong>{Math.abs(result.delta_c).toFixed(2)} °C cooler</strong>, helping{" "}
                                    <strong>{result.people_benefited.toLocaleString("en-IN")}</strong> people.
                                    <span className="block text-sm text-muted">Model estimate, not a measurement.</span>
                                </p>
                            )}
                        </div>
                    </div>
                </>
            )}
        </aside>
    );
}