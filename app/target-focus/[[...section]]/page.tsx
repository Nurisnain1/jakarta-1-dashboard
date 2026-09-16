import {redirect} from "next/navigation";

export default async function TargetFocusRoute({params}:{params:Promise<{section?:string[]}>}){
  const {section=[]}=await params;
  const selected=section[0]??"lob";
  if(!["lob","product","vas"].includes(selected))redirect("/target-focus/lob");
  redirect(`/?target-focus=${selected}`);
}
