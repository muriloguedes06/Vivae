import { useMemo, useState } from "react";
import type { Seat } from "../types";

export function useSeatSelection(rows = 6, columns = 10, maximum = 6) {
  const seats = useMemo<Seat[]>(
    () =>
      Array.from({ length: rows * columns }, (_, index) => ({
        id: `${String.fromCharCode(65 + Math.floor(index / columns))}${(index % columns) + 1}`,
        row: String.fromCharCode(65 + Math.floor(index / columns)),
        number: (index % columns) + 1,
        occupied: [1, 7, 12, 28, 35, 48].includes(index),
      })),
    [rows, columns],
  );
  const [selected, setSelected] = useState<string[]>(["A3", "A4"]);

  function toggle(id: string) {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((seat) => seat !== id)
        : current.length < maximum
          ? [...current, id].sort()
          : current,
    );
  }

  return { seats, selected, toggle };
}
