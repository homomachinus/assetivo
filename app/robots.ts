import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/explore", "/product/"],
        disallow: [
          "/admin/",
          "/api/",
          "/cart",
          "/checkout",
          "/order-success",
          "/account",
          "/favourites",
          "/devel/",
        ],
      },
    ],
    sitemap: "https://assetivo.store/sitemap.xml",
    host: "https://assetivo.store",
  };
}
