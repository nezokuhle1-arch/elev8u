import styles from "@/app/v2/v2.module.css";

const ACCENT = "#305CDE";

export function Orb({ heroIn }: { heroIn: boolean }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        transform: `scale(${heroIn ? 1 : 1.05})`,
        opacity: heroIn ? 1 : 0,
        transition: "transform 1400ms cubic-bezier(0.16,1,0.3,1), opacity 1400ms cubic-bezier(0.16,1,0.3,1)",
      }}
    >
      <div className={styles.orbWrap}>
        <div
          className={`${styles.blob} ${styles.blobA}`}
          style={{ top: 40, right: 8, width: 414, height: 414, background: ACCENT, opacity: 0.85, filter: "blur(73px)" }}
        />
        <div
          className={`${styles.blob} ${styles.blobB}`}
          style={{ top: -16, left: 48, width: 366, height: 366, background: "#6B8EE8", opacity: 0.6, filter: "blur(73px)" }}
        />
        <div
          className={`${styles.blob} ${styles.blobC}`}
          style={{ bottom: 8, left: 72, width: 334, height: 334, background: "#4B3FD9", opacity: 0.7, filter: "blur(73px)" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(5,7,13,0) 0%, rgba(5,7,13,0) 58%, rgba(5,7,13,0.65) 80%, #05070D 100%)",
            pointerEvents: "none",
          }}
        />
        <div
          className={styles.glassDrift}
          style={{
            position: "absolute",
            top: "12.5%",
            left: "12.5%",
            width: "75%",
            height: "75%",
            background: "rgba(255,255,255,0.06)",
            backdropFilter: "blur(18px)",
            WebkitBackdropFilter: "blur(18px)",
            border: "1px solid rgba(255,255,255,0.22)",
            boxShadow: "0 0 90px rgba(48,92,222,0.4), inset 0 1px 1px rgba(255,255,255,0.4)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "12.5%",
            left: "12.5%",
            width: "75%",
            height: "75%",
            borderRadius: "50%",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        >
          <div
            className={styles.sheen}
            style={{
              position: "absolute",
              top: "-50%",
              left: "-50%",
              width: "200%",
              height: "200%",
              background:
                "linear-gradient(115deg, rgba(255,255,255,0) 42%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 58%)",
              backgroundSize: "60% 60%",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
        <svg
          role="img"
          aria-label="Elev8U infinity mark"
          viewBox="0 0 120 60"
          width="38.5%"
          height="38.5%"
          fill="none"
          style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)" }}
        >
          <path
            d="M60 30 C48 12 14 12 14 30 C14 48 48 48 60 30 C72 12 106 12 106 30 C106 48 72 48 60 30 Z"
            stroke="#fff"
            strokeOpacity="0.14"
            strokeWidth="2.6"
            strokeLinejoin="round"
          />
          <path
            className={styles.trace}
            pathLength={1}
            d="M60 30 C48 12 14 12 14 30 C14 48 48 48 60 30 C72 12 106 12 106 30 C106 48 72 48 60 30 Z"
            stroke="#C7D6FF"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
