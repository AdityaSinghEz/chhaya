const BASE = import.meta.env.VITE_API_URL;

function withRank(data) {
  if (data.features.every((f) => Number.isFinite(f.properties.priority_rank))) return data;
  const order = [...data.features].sort((a, b) => b.properties.priority - a.properties.priority);
  const rank = new Map(order.map((f, i) => [f.properties.h3_index, i + 1]));
  return {
    ...data,
    features: data.features.map((f) => ({
      ...f,
      properties: { ...f.properties, priority_rank: rank.get(f.properties.h3_index) },
    })),
  };
}

export async function getCells() {
  const res = await fetch(BASE ? `${BASE}/cells` : "/mock/cells.geojson");
  if (!res.ok) throw new Error(`Could not load the map data (status ${res.status})`);
  return withRank(await res.json());
}

function localEstimate(cell, hectares) {
  const cooling = (0.5 * hectares * (0.4 + (1 - cell.ndvi))) / (1 + 0.2 * hectares);
  return {
    delta_c: -Number(cooling.toFixed(2)),
    people_benefited: Math.round(cell.population * Math.min(1, hectares / 4) * 0.6),
  };
}

export async function whatIf(cell, hectares) {
  if (!BASE) return localEstimate(cell, hectares);
  const res = await fetch(`${BASE}/whatif`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ h3_index: cell.h3_index, canopy_ha: hectares }),
  });
  if (!res.ok) throw new Error(`Estimate unavailable (status ${res.status})`);
  return res.json();
}