import { ImageResponse } from "next/og";
import { CipherMark } from "@/components/brand/CipherMark";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";
export default function Icon() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#d4ed83",color:"#18200d",borderRadius:16}}><CipherMark size={64 * .72}/></div>, size); }
