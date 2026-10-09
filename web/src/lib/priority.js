export const DEFAULT_WEIGHTS = { heat: 0.6, pollution: 0.3, population: 0.5, equity: 0.4 };

// Turns any list of numbers into a 0 to 1 scale, using the lowest and highest values.
function normaliser(values) {
  const min = Math.min(...values);
  const span = Math.max(...values) - min || 1;
  return (v) => (v - min) / span;
}

export function withLivePriority(data, w) {
  const props = data.features.map((f) => f.properties);
  const heat = normaliser(props.map((p) => p.lst_c));
  const dust = normaliser(props.map((p) => p.dust_idx));
  const pop = normaliser(props.map((p) => p.population));
  const green = normaliser(props.map((p) => p.ndvi));
  const schools = normaliser(props.map((p) => p.school_count));
  const total = w.heat + w.pollution + w.population + w.equity || 1;

  return {
    ...data,
    features: data.features.map((f) => {
      const p = f.properties;
      const equity = 0.6 * (1 - green(p.ndvi)) + 0.4 * schools(p.school_count);
      const score =
        (w.heat * heat(p.lst_c) + w.pollution * dust(p.dust_idx) + w.population * pop(p.population) + w.equity * equity) / total;
      return { ...f, properties: { ...p, priority: Number(score.toFixed(4)) } };
    }),
  };
}