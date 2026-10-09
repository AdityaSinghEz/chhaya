import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

const BASEMAP = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default function MapView({ data }) {
    const container = useRef(null);
    const mapRef = useRef(null);
    const ready = useRef(false);
    useEffect(() => {
        const map = new maplibregl.Map({
            container: container.current,
            style: BASEMAP,
            center: [77.09, 28.64],
            zoom: 9.4,
        });
        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl(), "top-right");
        map.on("error", (e) => console.error("Map error:", e.error));

        map.on("load", () => {
            map.addSource("cells", { type: "geojson", data });
            map.addLayer({
                id: "cells-fill",
                type: "fill",
                source: "cells",
                paint: {
                    "fill-opacity": 0.72,
                    "fill-color": [
                        "interpolate", ["linear"], ["get", "priority"],
                        0, "#e6efe3",
                        0.35, "#f1d98b",
                        0.65, "#e8843c",
                        1, "#a1173b",
                    ],
                },
            });
            ready.current = true;
        });

        return () => {
            ready.current = false;
            map.remove();
        };
    }, []);

    useEffect(() => {
        if (ready.current) mapRef.current.getSource("cells").setData(data);
    }, [data]);

    return <div ref={container} style={{ position: "absolute", top: 0, right: 0, bottom: 0, left: 0 }} />;
}