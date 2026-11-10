import { ImageResponse } from "next/og";
import { CipherMark } from "@/components/brand/CipherMark";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function Icon() { return new ImageResponse(<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",background:"#d4ed83",color:"#18200d",borderRadius:16}}><CipherMark size={180 * .72}/></div>, size); }
