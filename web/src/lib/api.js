// Fake estimate with diminishing returns. Do not show these numbers in the demo video.
// The real version will call Hitesh's server (POST /whatif).
function estimate(cell, canopyHectares) {
  const cooling = (0.5 * canopyHectares * (0.4 + (1 - cell.ndvi))) / (1 + 0.2 * canopyHectares);
  const peopleBenefited = Math.round(cell.population * Math.min(1, canopyHectares / 4) * 0.6);
  return { delta_c: -Number(cooling.toFixed(2)), people_benefited: peopleBenefited };
}

export async function whatIf(cell, canopyHectares) {
  return estimate(cell, canopyHectares);
}

const MAX_HECTARES_PER_CELL = 2;

// Greedy planner. The real version will call POST /optimize on Hitesh's server.
export async function optimize(budgetHectares, data) {
  const ranked = data.features
    .map((f) => ({
      cell: f.properties,
      value: f.properties.priority * estimate(f.properties, 1).people_benefited,
    }))
    .sort((a, b) => b.value - a.value);

  const rows = [];
  let left = budgetHectares;
  for (const { cell } of ranked) {
    if (left <= 0) break;
    const hectares = Math.min(MAX_HECTARES_PER_CELL, left);
    rows.push({ h3_index: cell.h3_index, ward: cell.ward, ha: hectares, ...estimate(cell, hectares) });
    left -= hectares;
  }
  return rows;
}