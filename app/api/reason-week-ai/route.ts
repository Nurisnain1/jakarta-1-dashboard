import {NextRequest,NextResponse} from "next/server";

type Feedback={date:string;store:string;category:string;feedback:string;target?:number;achievement?:number};

export async function POST(req:NextRequest){
  try{
    const key=process.env.AI_GATEWAY_API_KEY;
    if(!key)return NextResponse.json({error:"AI Gateway belum aktif"},{status:503});
    const body=await req.json() as {week?:string;items?:Feedback[]};
    const items=(body.items??[]).filter(x=>x.store&&x.category&&x.feedback).slice(0,100);
    if(!items.length)return NextResponse.json({error:"Belum ada feedback pada periode ini"},{status:400});
    const input=`Anda adalah retail performance analyst untuk area Jakarta 1. Analisa feedback store berikut secara profesional dalam Bahasa Indonesia. Jangan mengarang fakta di luar data. Kelompokkan masalah menjadi Internal, External, Stock Issue, dan BNPL Issue. Jelaskan pola berulang, store terdampak, kaitan dengan gap target jika tersedia, prioritas root cause, dan recommended action yang spesifik. Gunakan format:\nEXECUTIVE SUMMARY\nROOT CAUSE ANALYSIS\nKEY FINDINGS\nRECOMMENDED ACTION\n\nPeriode: ${body.week||"minggu terpilih"}\nData:\n${JSON.stringify(items)}`;
    const r=await fetch("https://ai-gateway.vercel.sh/v1/responses",{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${key}`},body:JSON.stringify({model:"openai/gpt-5.6-sol",input,max_output_tokens:1200,reasoning:{effort:"medium"}})});
    const j=await r.json();
    if(!r.ok)return NextResponse.json({error:j?.error?.message||"AI analysis gagal"},{status:r.status});
    const text=j.output_text||j.output?.flatMap((o:any)=>o.content??[]).map((c:any)=>c.text??"").join("\n")||"";
    return NextResponse.json({analysis:text});
  }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"AI analysis gagal"},{status:500})}
}
