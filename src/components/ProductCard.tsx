import Link from "next/link";
import styles from "./ProductCard.module.css";

type ProductCardProps = {
  slug: string;
  name: string;
  price: number | string;
  old_price?: number | string | null;
  image?: string | null;
};

function toNumber(val: number | string) {
  return typeof val === "string" ? Number(val) : val;
}

function formatPrice(value: number | string) {
  return toNumber(value).toFixed(0);
}

export default function ProductCard({
  slug,
  name,
  price,
  old_price,
  image,
}: ProductCardProps) {
  const imageSrc =
    image && image.length > 0 ? image : "/placeholder.png";

  const numericPrice = toNumber(price);
  const numericOld = old_price ? toNumber(old_price) : null;

  const hasDiscount =
    numericOld !== null && numericOld > numericPrice;

  const saveAmount = hasDiscount
    ? numericOld! - numericPrice
    : 0;

  return (
<Link href={`/products/${slug}`} className={styles.card}>
  <div className={styles.imageWrap}>
    <img
      src={imageSrc}
      alt={name}
      loading="lazy"
      className={styles.image}
    />
    {hasDiscount && (
      <span className={styles.saleBadge}>SALE</span>
    )}
  </div>

  <div className={styles.content}>
    <h3 className={styles.name}>{name}</h3>

    {hasDiscount ? (
      <div className={styles.saveTag}>
        Save Tk. {formatPrice(saveAmount)}
      </div>
    ) : (
      <div className={styles.saveTagPlaceholder} />
    )}

    <div className={styles.priceRow}>
      {hasDiscount && (
        <span className={styles.oldPrice}>
          ৳{formatPrice(numericOld!)}
        </span>
      )}
      <span className={styles.price}>
        ৳{formatPrice(numericPrice)}
      </span>
    </div>

<div className={styles.buyNow}>
  <i className="fa fa-shopping-cart" />&nbsp; Buy Now
</div>

  </div>
</Link>


  );
}
