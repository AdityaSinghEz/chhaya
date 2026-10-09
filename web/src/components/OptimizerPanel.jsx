import { useEffect, useState } from "react";
import { optimize } from "../lib/api";

export default function OptimizerPanel({ data, active, onActiveChange, onPlan, onPick }) {
    const [budget, setBudget] = useState(20);
    const [rows, setRows] = useState(null);

    // While planning is on, recompute whenever the budget or the priorities (data) change
    useEffect(() => {
        if (!active) return;
        let outdated = false; // ignore an answer that arrives after a newer request started
        optimize(budget, data).then((result) => {
            if (outdated) return;
            setRows(result);
            onPlan(result.map((r) => r.h3_index));
        });
        return () => {
            outdated = true;
        };
    }, [active, budget, data]);

    const totalPeople = rows ? rows.reduce((sum, r) => sum + r.people_benefited, 0) : 0;

    return (
        <section className="mt-6">
            <h2 className="mb-3 text-sm font-bold">Budget planner</h2>

            <label className="block">
                <span className="mb-1 flex justify-between font-medium">
                    <span>Hectares to plant</span>
                    <output>{budget}</output>
                </span>
                <input
                    className="w-full"
                    type="range" min={1} max={100} step={1}
                    value={budget}
                    onChange={(e) => setBudget(Number(e.target.value))}
                />
            </label>

            <button
                type="button"
                onClick={() => onActiveChange(!active)}
                className={
                    "mt-2 w-full rounded px-3 py-2 font-medium " +
                    (active
                        ? "border border-teal-700 bg-white text-teal-700 hover:bg-teal-50"
                        : "bg-teal-700 text-white hover:bg-teal-800")
                }
            >
                {active ? "Stop planning" : "Plan where to plant first"}
            </button>

            {active && rows && (
                <div className="mt-3">
                    <p className="mb-2">
                        <strong>{rows.length}</strong> areas, about <strong>{totalPeople.toLocaleString("en-IN")}</strong> people helped.
                    </p>
                    <ol className="max-h-64 overflow-y-auto border border-stone-300 bg-white">
                        {rows.map((r, i) => (
                            <li key={r.h3_index}>
                                <button
                                    type="button"
                                    onClick={() => onPick(r.h3_index)}
                                    className="flex w-full justify-between gap-2 border-b border-stone-200 px-2 py-1.5 text-left hover:bg-stone-100"
                                >
                                    <span>{i + 1}. {r.ward ?? `Cell ${r.h3_index.slice(2, 10)}`}</span>
                                    <span className="text-gray-500">
                                        {r.ha} hectare{r.ha === 1 ? "" : "s"} · {r.people_benefited.toLocaleString("en-IN")} people
                                    </span>
                                </button>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </section>
    );
}