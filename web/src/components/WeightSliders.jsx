const SLIDERS = [
    { key: "heat", label: "Heat", hint: "Hotter ground ranks higher" },
    { key: "pollution", label: "Dust and pollution", hint: "Bare soil and dust exposure" },
    { key: "population", label: "People living there", hint: "More residents rank higher" },
    { key: "equity", label: "Fairness", hint: "Little greenery and more schools" },
];

export default function WeightSliders({ weights, onChange }) {
    return (
        <section>
            <h2 className="mb-3 mt-6 text-sm font-bold">What matters most</h2>
            {SLIDERS.map(({ key, label, hint }) => (
                <label key={key} className="mb-4 block">
                    <span className="mb-1 flex justify-between font-medium">
                        <span>{label}</span>
                        <output>{Math.round(weights[key] * 100)}</output>
                    </span>
                    <input
                        className="w-full"
                        type="range" min={0} max={1} step={0.05}
                        value={weights[key]}
                        onChange={(e) => onChange({ ...weights, [key]: Number(e.target.value) })}
                    />
                    <span className="block text-sm text-gray-500">{hint}</span>
                </label>
            ))}
        </section>
    );
}