import { NextResponse } from "next/server";
import { getRelatedProducts } from "@/lib/api/products";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json([]);
  }

  try {
    const products = await getRelatedProducts(slug, 8);
    return NextResponse.json(products);
  } catch (error) {
    return NextResponse.json([], { status: 500 });
  }
}
