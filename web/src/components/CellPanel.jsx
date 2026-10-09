import { useEffect, useState } from "react";
import { whatIf } from "../lib/api";

export default function CellPanel({ cell }) {
    const [hectares, setHectares] = useState(1);
    const [result, setResult] = useState(null);

    useEffect(() => {
        if (!cell) return;
        let outdated = false;
        whatIf(cell, hectares).then((r) => {
            if (!outdated) setResult(r);
        });
        return () => {
            outdated = true;
        };
    }, [cell, hectares]);

    if (!cell) {
        return <p className="mt-6 text-gray-500">Click a hexagon on the map to see its numbers.</p>;
    }

    const facts = [
        ["Priority", `${Math.round(cell.priority * 100)} out of 100`],
        ["Surface temperature", `${cell.lst_c.toFixed(1)} °C`],
        ["Greenery", `${Math.round(cell.ndvi * 100)}%`],
        ["Built up", `${Math.round(cell.built_frac * 100)}%`],
        ["People", cell.population.toLocaleString("en-IN")],
        ["Schools", cell.school_count],
    ];

    return (
        <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold">{cell.ward ?? "Ward not assigned yet"}</h2>

            <dl className="mb-4 grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                {facts.map(([label, value]) => (
                    <div key={label} className="contents">
                        <dt className="text-gray-500">{label}</dt>
                        <dd className="text-right font-medium">{value}</dd>
                    </div>
                ))}
            </dl>

            <label className="block">
                <span className="mb-1 flex justify-between font-medium">
                    <span>Add tree canopy</span>
                    <output>{hectares} hectare{hectares === 1 ? "" : "s"}</output>
                </span>
                <input
                    className="w-full"
                    type="range" min={0.5} max={5} step={0.5}
                    value={hectares}
                    onChange={(e) => setHectares(Number(e.target.value))}
                />
            </label>

            {result && (
                <p className="mt-3 border-l-4 border-teal-700 bg-white p-3">
                    About <strong>{Math.abs(result.delta_c).toFixed(2)} °C cooler</strong>, helping{" "}
                    <strong>{result.people_benefited.toLocaleString("en-IN")}</strong> people.
                    <span className="block text-sm text-gray-500">Model estimate, not a measurement.</span>
                </p>
            )}
        </section>
    );
}