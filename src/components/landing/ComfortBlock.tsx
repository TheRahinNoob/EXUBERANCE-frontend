import Image from "next/image";
import Link from "next/link";
import styles from "./ComfortBlock.module.css";

export default function ComfortBlock() {
  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        {/* LEFT CONTENT */}
        <div className={styles.content}>
          <h2 className={styles.brand}>
            Fabrilife <span className={styles.arrow}>›</span>
          </h2>

          <p className={styles.subtitle}>
            Because comfort and confidence go hand in hand.
          </p>

          <p className={styles.description}>
            We focus on carefully selecting the best clothing that is comfortable,
            looks great, and makes you confident. Apart from the fabric, design
            and fit, we go through strict quality control parameters to give you
            what you truly deserve. The power of a good outfit is how it can
            influence your perception of yourself.
          </p>
        </div>

        {/* RIGHT IMAGE */}
        <div className={styles.imageWrap}>
          <Image
            src="/images/comfort-fabric.png"
            alt="Premium fabric shades"
            fill
            priority
            className={styles.image}
          />
        </div>
      </div>
    </section>
  );
}
