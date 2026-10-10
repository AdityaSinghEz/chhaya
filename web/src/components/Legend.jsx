import { GRADIENT } from "../lib/palette";

export default function Legend({ total }) {
    return (
        <div className="absolute bottom-8 left-4 z-10 w-64 rounded-xl bg-white/90 p-3 text-sm shadow-lg backdrop-blur">
            <div className="h-2.5 rounded-full" style={{ background: GRADIENT }} />
            <div className="mt-1.5 flex justify-between text-muted">
                <span>Rank 1, most urgent</span>
                <span>Rank {total.toLocaleString("en-IN")}</span>
            </div>
        </div>
    );
}