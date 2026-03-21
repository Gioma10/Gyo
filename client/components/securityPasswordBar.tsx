import { match } from "ts-pattern";

export const SecurityPasswordBar = ({score, error}:{score: number, error: string | null}) => {

  const effectiveScore = error?.includes("data breach") ? 1 : score
  return (
    <div className="space-y-1 mt-1">
    <div className="flex gap-1">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-1 flex-1 rounded-full transition-all duration-300"
          style={{
            backgroundColor:
              i < effectiveScore
                ? match(effectiveScore)
                    .with(1, () => "#E24B4A")
                    .with(2, () => "#BA7517")
                    .with(3, () => "#1D9E75")
                    .with(4, () => "#1D9E75")
                    .otherwise(() => "#2a2a2a")
                : "#2a2a2a",
          }}
        />
      ))}
    </div>
    <p
      className="text-xs"
      style={{
        color: match(effectiveScore)
          .with(1, () => "#E24B4A")
          .with(2, () => "#BA7517")
          .with(3, () => "#1D9E75")
          .with(4, () => "#1D9E75")
          .otherwise(() => "#888"),
      }}
    >
        {match(effectiveScore)
        .with(0, () => "")
        .with(1, () => "Debole")
        .with(2, () => "Mediocre")
        .with(3, () => "Buona")
        .with(4, () => "Ottima")
        .otherwise(() => "")}
    </p>
  </div>
  );
};