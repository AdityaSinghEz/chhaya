import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { RAMP } from "../lib/palette";

const BASEMAP = "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json";
const DELHI = [[76.83, 28.4], [77.35, 28.88]];
const PANEL_SPACE = 460;

function boundsOf(feature) {
    const ring = feature.geometry.coordinates[0];
    const lngs = ring.map((p) => p[0]);
    const lats = ring.map((p) => p[1]);
    return [[Math.min(...lngs), Math.min(...lats)], [Math.max(...lngs), Math.max(...lats)]];
}

function colourRule(count) {
    const at = (t) => 1 + t * (count - 1);
    return [
        "interpolate", ["linear"], ["get", "priority_rank"],
        ...RAMP.flatMap((colour, i) => [at(i / (RAMP.length - 1)), colour]),
    ];
}

export default function MapView({ data, selected, onSelect }) {
    const container = useRef(null);
    const mapRef = useRef(null);
    const ready = useRef(false);
    const latest = useRef({ data, onSelect });
    latest.current = { data, onSelect };

    useEffect(() => {
        const map = new maplibregl.Map({
            container: container.current,
            style: BASEMAP,
            bounds: DELHI,
            fitBoundsOptions: { padding: 40 },
            maxBounds: [[76.3, 28.1], [77.9, 29.2]],
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
        map.on("error", (e) => console.error("Map error:", e.error));

        map.on("load", () => {
            const firstLabel = map.getStyle().layers.find((l) => l.type === "symbol")?.id;
            map.addSource("cells", { type: "geojson", data: latest.current.data });
            map.addLayer(
                {
                    id: "cells-fill",
                    type: "fill",
                    source: "cells",
                    paint: { "fill-opacity": 0.7, "fill-color": colourRule(latest.current.data.features.length) },
                },
                firstLabel,
            );
            map.addLayer(
                {
                    id: "cells-line",
                    type: "line",
                    source: "cells",
                    paint: { "line-color": "#ffffff", "line-width": 0.5, "line-opacity": 0.6 },
                },
                firstLabel,
            );
            map.addLayer(
                {
                    id: "cells-selected",
                    type: "line",
                    source: "cells",
                    filter: ["==", ["get", "h3_index"], ""],
                    paint: { "line-color": "#12212b", "line-width": 3 },
                },
                firstLabel,
            );
            ready.current = true;
        });

        map.on("click", (e) => {
            if (!ready.current) return;
            const hit = map.queryRenderedFeatures(e.point, { layers: ["cells-fill"] })[0];
            latest.current.onSelect(hit ? hit.properties.h3_index : null);
        });

        map.on("mousemove", (e) => {
            if (!ready.current) return;
            const over = map.queryRenderedFeatures(e.point, { layers: ["cells-fill"] }).length > 0;
            map.getCanvas().style.cursor = over ? "pointer" : "";
        });

        return () => {
            ready.current = false;
            map.remove();
        };
    }, []);

    useEffect(() => {
        if (!ready.current) return;
        const map = mapRef.current;
        map.setFilter("cells-selected", ["==", ["get", "h3_index"], selected ?? ""]);
        const feature = latest.current.data.features.find((f) => f.properties.h3_index === selected);
        if (feature) {
            map.fitBounds(boundsOf(feature), {
                padding: { top: 80, bottom: 80, left: 80, right: window.innerWidth > 640 ? PANEL_SPACE : 80 },
                maxZoom: 14.5,
                duration: 900,
            });
        } else {
            map.fitBounds(DELHI, { padding: 40, duration: 900 });
        }
    }, [selected]);

    return <div ref={container} style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} />;
}