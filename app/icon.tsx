import { ImageResponse } from "next/og";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#24291f", borderRadius: 10, color: "#f3f1e8", fontSize: 48, fontWeight: 700 }}>C</div>, size);
}
