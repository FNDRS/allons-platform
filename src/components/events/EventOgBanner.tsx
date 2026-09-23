export type EventOgBannerProps = {
  title: string;
  when: string | null;
  city: string | null;
  provider: string | null;
  logoSrc: string;
  month: string | null;
  day: string | null;
  time: string | null;
};

/** Two balanced lines, or one when the title already fits the banner. */
export function splitOgTitle(title: string, maxChars: number): string[] {
  const clean = title.replace(/\s+/g, " ").trim() || "Evento";
  if (clean.length <= maxChars) return [clean];
  const words = clean.split(" ");
  let best = 1;
  let bestScore = Number.POSITIVE_INFINITY;
  let found = false;
  for (let i = 1; i < words.length; i++) {
    const left = words.slice(0, i).join(" ");
    const right = words.slice(i).join(" ");
    if (left.length > maxChars || right.length > maxChars) continue;
    const score = Math.abs(left.length - right.length);
    if (score < bestScore) {
      bestScore = score;
      best = i;
      found = true;
    }
  }
  if (!found) {
    return [clean.slice(0, maxChars - 3).trimEnd() + "..."];
  }
  return [words.slice(0, best).join(" "), words.slice(best).join(" ")];
}

export function EventOgBanner({
  title,
  when,
  city,
  provider,
  logoSrc,
  month,
  day,
  time,
}: EventOgBannerProps) {
  const lines = splitOgTitle(title, 18);
  const titleSize = lines.length > 1 ? 58 : title.length > 16 ? 64 : 76;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "#050505",
        color: "#FAFAF7",
        fontFamily: "Urbanist",
        padding: "0 72px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          right: -20,
          top: -60,
          width: 520,
          height: 520,
          borderRadius: 520,
          background:
            "radial-gradient(circle, rgba(246,112,16,0.32) 0%, rgba(246,112,16,0) 68%)",
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          width: 640,
          height: 500,
        }}
      >
        <img src={logoSrc} width={168} height={60} alt="" />
        {provider ? (
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 22,
              fontWeight: 500,
              color: "rgba(250,250,247,0.55)",
            }}
          >
            {provider}
          </div>
        ) : (
          <div style={{ display: "flex", height: 28 }} />
        )}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: provider ? 8 : 24,
            fontSize: titleSize,
            lineHeight: 1.02,
            fontWeight: 600,
            letterSpacing: "-0.045em",
          }}
        >
          {lines.map((line, index) => (
            <div key={`${index}-${line}`} style={{ display: "flex" }}>
              {line}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            width: 56,
            height: 4,
            marginTop: 22,
            borderRadius: 4,
            background: "#F67010",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 18,
            gap: 6,
            fontSize: 26,
            fontWeight: 500,
            color: "rgba(250,250,247,0.74)",
          }}
        >
          {when ? <div style={{ display: "flex" }}>{when}</div> : null}
          {city ? <div style={{ display: "flex" }}>{city}</div> : null}
        </div>
      </div>

      {day ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 300,
            height: 380,
            borderRadius: 44,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: "0.18em",
              color: "#F67010",
            }}
          >
            {month}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 4,
              fontSize: 128,
              lineHeight: 0.9,
              fontWeight: 600,
              letterSpacing: "-0.05em",
            }}
          >
            {day}
          </div>
          {time ? (
            <div
              style={{
                display: "flex",
                marginTop: 14,
                fontSize: 24,
                fontWeight: 500,
                color: "rgba(250,250,247,0.62)",
              }}
            >
              {time}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
