import {NextRequest,NextResponse} from "next/server";
import {getSheetRanges} from "@/lib/google-sheets";
import {GET as getJakarta1V2} from "@/app/api/jakarta1-v2/route";

const SALES:Record<string,string>={"2025":"1NnRW70VyrtV8c89_M08gTnOGbtzeldSy8gL-gm4GjJ0","2026":"151Qfrz3RZnDMgZjKOPt5s_aS-zscSiOTCWodbUDWM1k"};
const STORES=["M117","M118","M124","M127","M217","M227","M238","M255","M264"] as const;
const NAMES:Record<string,string>={M117:"Plaza Senayan",M118:"Pondok Indah Mall 3",M124:"Pacific Place",M127:"Lotte Avenue",M217:"Blok M Plaza",M227:"Aeon Tanjung Barat",M238:"Pondok Indah Mall 2",M255:"Antasari Place",M264:"Plaza Semanggi"};
const MONTHS=["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
type Row=unknown[];type Lob="iPhone"|"Mac"|"iPad"|"Apple Watch";type Bucket={amount:number;qty:number};
const empty=():Bucket=>({amount:0,qty:0});
function n(v:unknown){if(typeof v==="number")return Number.isFinite(v)?v:0;const s=String(v??"").trim();if(!s)return 0;const x=Number(s.replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",",".").replace(/[^0-9.-]/g,""));return Number.isFinite(x)?x:0}
function dateKey(v:unknown){if(typeof v==="number"&&v>20000){const d=new Date(Date.UTC(1899,11,30)+v*86400000);return d.toISOString().slice(0,10)}const s=String(v??"").trim();let m=s.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);if(m)return `${m[3]}-${m[2]}-${m[1]}`;m=s.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?`${m[1]}-${m[2]}-${m[3]}`:""}
function voucher(row:Row){return row.some(v=>String(v??"").toUpperCase().includes("VOUCHER"))}
function lobOf(cat:string,desc:string):Lob|null{const x=`${cat} ${desc}`.toUpperCase();if(x.includes("IPHONE"))return"iPhone";if(x.includes("MACBOOK")||cat.toUpperCase()==="MAC")return"Mac";if(x.includes("IPAD"))return"iPad";if(x.includes("WATCH"))return"Apple Watch";return null}
function growth(cur:number,prev:number){return prev?(cur-prev)/prev*100:null}
function compare(p:Bucket,c:Bucket){return{y2025:p.amount,y2026:c.amount,qty2025:p.qty,qty2026:c.qty,gap:c.amount-p.amount,yoy:growth(c.amount,p.amount),qtyYoy:growth(c.qty,p.qty)}}

async function deviceDirect(endMonth:number,email:string,key:string){
 const [r25,r26]=await Promise.all([getSheetRanges(SALES["2025"],STORES.map(s=>`'${s}'!A:O`),email,key),getSheetRanges(SALES["2026"],STORES.map(s=>`'${s}'!A:O`),email,key)]);
 const years:Record<string,Record<string,{total:Bucket;months:Bucket[];lobs:Record<Lob,Bucket>}>>={};
 for(const year of ["2025","2026"]){years[year]={};for(const s of STORES)years[year][s]={total:empty(),months:Array.from({length:12},empty),lobs:{iPhone:empty(),Mac:empty(),iPad:empty(),"Apple Watch":empty()}};const ranges=year==="2025"?r25:r26;for(let si=0;si<STORES.length;si++){const store=STORES[si],rows=(ranges[si]??[]) as Row[];for(const row of rows.slice(1)){if(voucher(row))continue;const d=dateKey(row[1]);if(!d||!d.startsWith(`${year}-`))continue;const m=Number(d.slice(5,7));if(m<1||m>endMonth)continue;if(String(row[8]??"").toUpperCase()!=="DEVICES")continue;const lob=lobOf(String(row[6]??""),String(row[10]??""));if(!lob)continue;const qty=n(row[11]),amount=n(row[13]),x=years[year][store];x.total.amount+=amount;x.total.qty+=qty;x.months[m-1].amount+=amount;x.months[m-1].qty+=qty;x.lobs[lob].amount+=amount;x.lobs[lob].qty+=qty}}}
 const area=(year:string)=>STORES.reduce((a,s)=>{a.amount+=years[year][s].total.amount;a.qty+=years[year][s].total.qty;return a},empty()),a25=area("2025"),a26=area("2026");
 const stores=STORES.map(code=>({code,name:NAMES[code],...compare(years["2025"][code].total,years["2026"][code].total)})).sort((a,b)=>a.gap-b.gap);
 const months=Array.from({length:endMonth},(_,i)=>{const sum=(year:string)=>STORES.reduce((a,s)=>{a.amount+=years[year][s].months[i].amount;a.qty+=years[year][s].months[i].qty;return a},empty());return{month:i+1,label:MONTHS[i],...compare(sum("2025"),sum("2026"))}});
 const lobList=(['iPhone','Mac','iPad','Apple Watch'] as Lob[]);const lobs=lobList.map(lob=>{const sum=(year:string)=>STORES.reduce((a,s)=>{a.amount+=years[year][s].lobs[lob].amount;a.qty+=years[year][s].lobs[lob].qty;return a},empty());return{lob,...compare(sum("2025"),sum("2026"))}}).sort((a,b)=>a.gap-b.gap);
 const detail=Object.fromEntries(STORES.map(code=>[code,{months:Array.from({length:endMonth},(_,i)=>({month:i+1,label:MONTHS[i],...compare(years["2025"][code].months[i],years["2026"][code].months[i])})),lobs:lobList.map(lob=>({lob,...compare(years["2025"][code].lobs[lob],years["2026"][code].lobs[lob])})).sort((a,b)=>a.gap-b.gap)}]));
 return{endMonth,summary:{...compare(a25,a26),growthStores:stores.filter(s=>(s.yoy??0)>=0).length,disgrowthStores:stores.filter(s=>(s.yoy??0)<0).length},stores,months,lobs,detail,meta:{scope:"device",label:"Device Only",includedLobs:["iPhone","Mac","iPad","Apple Watch"],excluded:["Accessories","VAS","AirPods","Voucher"],source:"direct"}};
}

async function allValue(req:NextRequest,endMonth:number){
 const call=async(year:string)=>{const r=await getJakarta1V2(new NextRequest(new URL(`/api/jakarta1-v2?period=${year}-01`,req.url)));return await r.json() as any};const[y25,y26]=await Promise.all([call("2025"),call("2026")]);
 const mr=(d:any)=>d.monthComparison??[];const stores=STORES.map(code=>{let p=0,c=0;for(let i=0;i<endMonth;i++){p+=mr(y25)[i]?.stores?.[code]??0;c+=mr(y26)[i]?.stores?.[code]??0}return{code,name:NAMES[code],y2025:p,y2026:c,qty2025:0,qty2026:0,gap:c-p,yoy:growth(c,p),qtyYoy:null}}).sort((a,b)=>a.gap-b.gap);
 const months=Array.from({length:endMonth},(_,i)=>{const p=mr(y25)[i]?.total??0,c=mr(y26)[i]?.total??0;return{month:i+1,label:MONTHS[i],y2025:p,y2026:c,qty2025:0,qty2026:0,gap:c-p,yoy:growth(c,p),qtyYoy:null}});
 const detail=Object.fromEntries(STORES.map(code=>[code,{months:months.map((m:any,i:number)=>{const p=mr(y25)[i]?.stores?.[code]??0,c=mr(y26)[i]?.stores?.[code]??0;return{...m,y2025:p,y2026:c,gap:c-p,yoy:growth(c,p)}}),lobs:[]} ]));
 const p=months.reduce((a:number,m:any)=>a+m.y2025,0),c=months.reduce((a:number,m:any)=>a+m.y2026,0);
 return{endMonth,summary:{y2025:p,y2026:c,qty2025:0,qty2026:0,gap:c-p,yoy:growth(c,p),qtyYoy:null,growthStores:stores.filter(s=>(s.yoy??0)>=0).length,disgrowthStores:stores.filter(s=>(s.yoy??0)<0).length},stores,months,lobs:[],detail,meta:{scope:"all",label:"All Value",includedLobs:["Device","Accessories","VAS"],excluded:["Voucher"],source:"jakarta1-v2"}};
}

async function deviceFallback(req:NextRequest,endMonth:number){const all=await allValue(req,endMonth);return{...all,lobs:[],detail:Object.fromEntries(STORES.map(code=>[code,{months:(all as any).detail[code].months,lobs:[]} ])),meta:{scope:"device",label:"Device Only",includedLobs:["iPhone","Mac","iPad","Apple Watch"],excluded:["Accessories","VAS","AirPods","Voucher"],source:"fallback",note:"Direct device source belum dapat dibaca; amount store/month sementara mengikuti source area existing."}}}

export async function GET(req:NextRequest){const endMonth=Math.min(12,Math.max(1,Number(req.nextUrl.searchParams.get("endMonth")||9)));const scope=req.nextUrl.searchParams.get("scope")==="all"?"all":"device";try{if(scope==="all")return NextResponse.json(await allValue(req,endMonth),{headers:{"Cache-Control":"private, max-age=60"}});const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,key=process.env.GOOGLE_PRIVATE_KEY;if(!email||!key)throw new Error("Google Sheets belum dikonfigurasi");try{return NextResponse.json(await deviceDirect(endMonth,email,key),{headers:{"Cache-Control":"private, max-age=60"}})}catch{return NextResponse.json(await deviceFallback(req,endMonth),{headers:{"Cache-Control":"private, max-age=60","x-jakarta1-yoy-source":"fallback"}})}}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Gagal memuat YoY Jakarta 1"},{status:500})}}
