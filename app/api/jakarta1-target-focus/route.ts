import {NextRequest,NextResponse} from "next/server";
import {getSheetRanges} from "@/lib/google-sheets";

const SALES_2026="151Qfrz3RZnDMgZjKOPt5s_aS-zscSiOTCWodbUDWM1k";
const MASTER_2026="1BjLDXdi_5BgZCUUJAKba-xYRFf0RDmRTT0FW1be03WE";
const MONTHS=["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
type Raw=unknown[];
type MasterItem={article:string;product:string;brand:string;category:string;lob:string;is3pp:boolean;vas:string};
type TargetRow={store:string;kind:"lob"|"product"|"vas";key:string;target:number};
type Actual={lob:Record<string,number>;products:Record<string,number>;vas:Record<string,number>};
type StoreInfo={code:string;name:string};
let cache=new Map<string,{at:number;data:unknown}>();
const CACHE_MS=120000;
const s=(v:unknown)=>String(v??"").trim();
const up=(v:unknown)=>s(v).toUpperCase();
function n(v:unknown){if(typeof v==="number")return Number.isFinite(v)?v:0;const x=Number(s(v).replace(/\s/g,"").replace(/\.(?=\d{3}(?:\D|$))/g,"").replace(",",".").replace(/[^0-9.-]/g,""));return Number.isFinite(x)?x:0}
function dateKey(v:unknown){if(typeof v==="number"&&v>20000)return new Date(Date.UTC(1899,11,30)+v*86400000).toISOString().slice(0,10);const x=s(v);let m=x.match(/^(\d{2})[-/](\d{2})[-/](\d{4})$/);if(m)return`${m[3]}-${m[2]}-${m[1]}`;m=x.match(/^(\d{4})-(\d{2})-(\d{2})/);return m?`${m[1]}-${m[2]}-${m[3]}`:""}
const norm=(v:unknown)=>up(v).replace(/[^A-Z0-9]/g,"");
function findCol(h:Raw,aliases:string[]){const a=aliases.map(norm);return h.findIndex(v=>a.includes(norm(v)))}
function findHeader(rows:Raw[],required:string[][]){let best={row:-1,score:-1};for(let r=0;r<Math.min(rows.length,80);r++){const score=required.reduce((q,a)=>q+(findCol(rows[r],a)>=0?1:0),0);if(score>best.score)best={row:r,score}}return best}
function truthy(v:unknown){return ["YES","Y","TRUE","1","3PP","ACTIVE","AKTIF"].includes(up(v))}
function blank():Actual{return{lob:{},products:{},vas:{}}}
function add(map:Record<string,number>,key:string,value:number){const k=s(key);if(k)map[k]=(map[k]||0)+value}
function targetKey(store:string,kind:string,key:string){return`${store}|${kind}|${up(key)}`}

function parseMaster(rows:Raw[],period:string){
 const storeMap=new Map<string,string>(),items=new Map<string,MasterItem>(),targets:TargetRow[]=[];
 const audit={masterRows:rows.length,unmatchedMasterRows:0,storeHeaderRow:-1,productHeaderRow:-1,targetHeaderRow:-1};
 const storeH=findHeader(rows,[["STORE CODE","KODE STORE","STORECODE"],["STORE NAME","NAMA STORE","STORE"]]);
 if(storeH.score>=1){audit.storeHeaderRow=storeH.row;const h=rows[storeH.row],ic=findCol(h,["STORE CODE","KODE STORE","STORECODE"]),iname=findCol(h,["STORE NAME","NAMA STORE","STORE"]);for(const r of rows.slice(storeH.row+1)){const code=ic>=0?s(r[ic]):"",name=iname>=0?s(r[iname]):code;if(/^M\d{3,}$/i.test(code))storeMap.set(code.toUpperCase(),name||code)}}
 // Product master is detected by actual header names, never fixed column positions.
 const productH=findHeader(rows,[["ARTICLE NUMBER","ARTICLE","SAP ARTICLE","PRODUCT CODE","SKU"],["PRODUCT","PRODUCT NAME","DESCRIPTION"],["BRAND"],["CATEGORY","PRODUCT CATEGORY"],["LOB","PRODUCT GROUP"],["3PP","IS 3PP","3PP FLAG"],["VAS","VAS TYPE"]]);
 if(productH.score>=2){audit.productHeaderRow=productH.row;const h=rows[productH.row],ia=findCol(h,["ARTICLE NUMBER","ARTICLE","SAP ARTICLE","PRODUCT CODE","SKU"]),ip=findCol(h,["PRODUCT","PRODUCT NAME","DESCRIPTION"]),ib=findCol(h,["BRAND"]),ic=findCol(h,["CATEGORY","PRODUCT CATEGORY"]),il=findCol(h,["LOB","PRODUCT GROUP"]),i3=findCol(h,["3PP","IS 3PP","3PP FLAG"]),iv=findCol(h,["VAS","VAS TYPE"]);for(const r of rows.slice(productH.row+1)){const article=ia>=0?s(r[ia]):"";if(!article)continue;items.set(up(article),{article,product:ip>=0?s(r[ip]):"",brand:ib>=0?s(r[ib]):"",category:ic>=0?s(r[ic]):"",lob:il>=0?s(r[il]):"",is3pp:i3>=0?truthy(r[i3]):false,vas:iv>=0?s(r[iv]):""})}}
 // Generic target table support when Master Data exposes named columns.
 const targetH=findHeader(rows,[["STORE CODE","KODE STORE","STORECODE"],["TARGET"],["LOB","PRODUCT GROUP"],["PRODUCT","PRODUCT NAME"],["VAS","VAS TYPE"],["MONTH","BULAN","PERIOD","PERIODE"]]);
 if(targetH.score>=3){audit.targetHeaderRow=targetH.row;const h=rows[targetH.row],is=findCol(h,["STORE CODE","KODE STORE","STORECODE"]),it=findCol(h,["TARGET"]),il=findCol(h,["LOB","PRODUCT GROUP"]),ip=findCol(h,["PRODUCT","PRODUCT NAME"]),iv=findCol(h,["VAS","VAS TYPE"]),im=findCol(h,["MONTH","BULAN","PERIOD","PERIODE"]);for(const r of rows.slice(targetH.row+1)){const store=is>=0?up(r[is]):"",target=it>=0?n(r[it]):0,month=im>=0?s(r[im]):"";if(!store||!target)continue;if(month){const wanted=MONTHS[Number(period.slice(5,7))-1].toUpperCase();const m=up(month);if(!m.includes(period)&&!m.includes(wanted))continue}const lob=il>=0?s(r[il]):"",product=ip>=0?s(r[ip]):"",vas=iv>=0?s(r[iv]):"";if(product)targets.push({store,kind:"product",key:product,target});else if(vas)targets.push({store,kind:"vas",key:vas,target});else if(lob)targets.push({store,kind:"lob",key:lob,target})}}
 // Existing Jakarta 1 monthly target block (Month / Store / Total / Amount / Device / Acc / VAS).
 let active=false;const wanted=MONTHS[Number(period.slice(5,7))-1].toUpperCase();for(const r of rows){const first=up(r[0]);if(MONTHS.map(x=>x.toUpperCase()).includes(first)){active=first===wanted;continue}if(!active)continue;if(up(r[1])==="TOTAL")break;if(/^M\d{3,}$/.test(first)){if(!storeMap.has(first))storeMap.set(first,first);const device=n(r[4]),acc=n(r[5]),vas=n(r[6]);if(device)targets.push({store:first,kind:"lob",key:"DEVICE",target:device});if(acc)targets.push({store:first,kind:"lob",key:"ACCESSORIES",target:acc});if(vas)targets.push({store:first,kind:"vas",key:"VAS",target:vas})}}
 return{stores:[...storeMap].map(([code,name])=>({code,name})),items,targets,audit};
}

function parseSales(rows:Raw[],store:string,period:string,master:Map<string,MasterItem>,audit:{unmatchedSales:number;processed:number}){
 const out=blank();if(!rows.length)return out;const h=rows[0],ix={date:findCol(h,["TANGGAL","DATE"]),category:findCol(h,["PRODUCT CATEGORY","CATEGORY"]),group:findCol(h,["PRODUCT GROUP","LOB","GROUP"]),article:findCol(h,["ARTICLE NUMBER","ARTICLE","SAP ARTICLE","PRODUCT CODE","SKU"]),desc:findCol(h,["DESCRIPTION","PRODUCT","PRODUCT NAME"]),qty:findCol(h,["QTY","QUANTITY"]),amount:findCol(h,["LOCAL AMOUNT","AMOUNT","SALES"])};if(ix.date<0||ix.qty<0||ix.amount<0)throw new Error(`Header Data Compile 2026 ${store} tidak lengkap`);
 for(const r of rows.slice(1)){if(!dateKey(r[ix.date]).startsWith(period)||r.some(v=>up(v).includes("VOUCHER")))continue;const qty=Math.max(0,n(r[ix.qty])),amount=n(r[ix.amount]),article=ix.article>=0?up(r[ix.article]):"",m=article?master.get(article):undefined,category=m?.category|| (ix.category>=0?s(r[ix.category]):""),lob=m?.lob||(ix.group>=0?s(r[ix.group]):""),desc=m?.product||(ix.desc>=0?s(r[ix.desc]):"");audit.processed++;if(article&&!m)audit.unmatchedSales++;
  const lobKey=lob||category||"UNMAPPED";add(out.lob,lobKey,amount);
  if(m?.is3pp)add(out.products,m.product||desc||article,qty);
  const vas=m?.vas||(/VAS/i.test(lob)?category||desc:"");if(vas)add(out.vas,vas,amount);
 }
 return out;
}

export async function GET(req:NextRequest){
 const period=req.nextUrl.searchParams.get("period")||"2026-09";if(!/^2026-(0[1-9]|1[0-2])$/.test(period))return NextResponse.json({error:"Target Fokus saat ini menggunakan Data Compile 2026"},{status:400});const force=req.nextUrl.searchParams.has("refresh");const hit=cache.get(period);if(!force&&hit&&Date.now()-hit.at<CACHE_MS)return NextResponse.json(hit.data,{headers:{"x-jakarta1-target-focus-cache":"HIT"}});const email=process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,key=process.env.GOOGLE_PRIVATE_KEY;if(!email||!key)return NextResponse.json({error:"Google Sheets belum dikonfigurasi"},{status:503});
 try{
  // One centralized master read, then one batched sales read. Components never call Sheets directly.
  const [masterRows]=await getSheetRanges(MASTER_2026,["'Master Data'!A1:AZ5000"],email,key);const parsed=parseMaster((masterRows||[]) as Raw[],period);if(!parsed.stores.length)throw new Error("Daftar store tidak ditemukan pada 2026 Master Data Jakarta 1");
  const sales=await getSheetRanges(SALES_2026,parsed.stores.map(x=>`'${x.code}'!A:O`),email,key),byStore:Record<string,Actual>={},audit={unmatchedSales:0,processed:0};for(let i=0;i<parsed.stores.length;i++)byStore[parsed.stores[i].code]=parseSales((sales[i]||[]) as Raw[],parsed.stores[i].code,period,parsed.items,audit);
  const tmap=new Map<string,number>();for(const t of parsed.targets)tmap.set(targetKey(t.store,t.kind,t.key),(tmap.get(targetKey(t.store,t.kind,t.key))||0)+t.target);
  const keys=(kind:keyof Actual)=>Array.from(new Set(parsed.stores.flatMap(st=>Object.keys(byStore[st.code][kind])))).sort();const sumActual=(kind:keyof Actual,k:string)=>parsed.stores.reduce((a,st)=>a+(byStore[st.code][kind][k]||0),0);const sumTarget=(kind:string,k:string)=>parsed.stores.reduce((a,st)=>a+(tmap.get(targetKey(st.code,kind,k))||0),0);
  const itemByProduct=new Map([...parsed.items.values()].map(x=>[up(x.product),x]));const lob=keys("lob").map(name=>({name,actual:sumActual("lob",name),target:sumTarget("lob",name)||null}));const products=keys("products").map(product=>{const m=itemByProduct.get(up(product));return{name:product,product,brand:m?.brand||"Unmapped",category:m?.category||"Unmapped",actual:sumActual("products",product),target:sumTarget("product",product)||null}});const vas=keys("vas").map(name=>({name,actual:sumActual("vas",name),target:sumTarget("vas",name)||null}));
  const stores=parsed.stores.map(st=>({code:st.code,name:st.name}));const storeBreakdown=stores.map(st=>{const a=byStore[st.code],actual=Object.values(a.lob).reduce((x,y)=>x+y,0),target=parsed.targets.filter(t=>t.store===st.code&&t.kind==="lob").reduce((x,y)=>x+y.target,0);return{...st,target,actual}});
  const data={period,stores,summary:{target:storeBreakdown.reduce((a,x)=>a+x.target,0),actual:storeBreakdown.reduce((a,x)=>a+x.actual,0)},lob,products,vas,storeBreakdown,byStore:Object.fromEntries(stores.map(st=>[st.code,{info:st,actual:byStore[st.code],targets:Object.fromEntries(parsed.targets.filter(t=>t.store===st.code).map(t=>[`${t.kind}|${up(t.key)}`,t.target]))}])),meta:{sources:["Data Compile 2026","2026 Master Data Jakarta 1"],masterSheet:"Master Data",salesColumns:"Resolved from actual headers",masterColumns:"Resolved from actual headers",unmatchedRecords:audit.unmatchedSales,processedRecords:audit.processed,audit:parsed.audit,targetNote:"Target hanya ditampilkan jika ditemukan pada master; tidak ada target dummy atau pembagian target perkiraan."}};cache.set(period,{at:Date.now(),data});return NextResponse.json(data,{headers:{"cache-control":"public, max-age=60, stale-while-revalidate=120","x-jakarta1-target-focus-cache":"MISS"}})
 }catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Gagal memuat Target Fokus Jakarta 1"},{status:500})}
}
