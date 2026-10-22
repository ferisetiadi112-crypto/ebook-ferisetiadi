import { useCallback, useEffect, useRef, useState } from "react";
import { BookOpen, ChevronLeft, ChevronRight, Maximize2, Minimize2, RotateCcw, Volume2, VolumeX, ZoomIn, ZoomOut } from "lucide-react";
import * as pdfjs from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
type PageMode = "single" | "double";
type TurnEffect = "flip" | "slide" | "card";

export default function PdfFlipbook({slug,title}:{slug:string;title:string}){
 const leftRef=useRef<HTMLCanvasElement|null>(null);
 const rightRef=useRef<HTMLCanvasElement|null>(null);
 const docRef=useRef<PDFDocumentProxy|null>(null);
 const stageRef=useRef<HTMLDivElement|null>(null);
 const [total,setTotal]=useState(0);
 const [page,setPage]=useState(1);
 const [zoom,setZoom]=useState(1);
 const [mode,setMode]=useState<PageMode>("double");
 const [effect,setEffect]=useState<TurnEffect>("flip");
 const [sound,setSound]=useState(false);
 const [shadows,setShadows]=useState(true);
 const [turnKey,setTurnKey]=useState(0);
 const [turnDirection,setTurnDirection]=useState<"next"|"previous">("next");
 const [fullscreen,setFullscreen]=useState(false);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState("");
 const clampZoom=(value:number)=>Math.min(2.5,Math.max(.6,Math.round(value*10)/10));
 const changeZoom=useCallback((delta:number)=>setZoom(z=>clampZoom(z+delta)),[]);
 const playPageSound=useCallback(()=>{
  if(!sound)return;
  try{
   const AudioContextClass=window.AudioContext||(window as any).webkitAudioContext;
   if(!AudioContextClass)return;
   const ctx=new AudioContextClass();
   const length=Math.floor(ctx.sampleRate*.16);
   const buffer=ctx.createBuffer(1,length,ctx.sampleRate);
   const data=buffer.getChannelData(0);
   for(let i=0;i<length;i++){const envelope=Math.pow(1-i/length,2.4);data[i]=(Math.random()*2-1)*envelope*.22;}
   const source=ctx.createBufferSource();source.buffer=buffer;
   const filter=ctx.createBiquadFilter();filter.type="lowpass";filter.frequency.value=1700;
   const gain=ctx.createGain();gain.gain.value=.22;
   source.connect(filter);filter.connect(gain);gain.connect(ctx.destination);
   source.onended=()=>{void ctx.close()};source.start();
  }catch{/* Audio is optional; some browsers block it until a user gesture. */}
 },[sound]);
 useEffect(()=>{let cancelled=false;setLoading(true);setError("");setPage(1);setZoom(1);
  pdfjs.getDocument({url:"/api/books/"+encodeURIComponent(slug)+"/pdf",withCredentials:true}).promise.then(doc=>{if(cancelled){void doc.destroy();return}docRef.current=doc;setTotal(doc.numPages);setLoading(false)}).catch(()=>{if(!cancelled){setError("PDF tidak dapat dibuka. Pastikan buku memiliki berkas PDF yang valid.");setLoading(false)}});
  return()=>{cancelled=true;void docRef.current?.destroy();docRef.current=null};
 },[slug]);
 useEffect(()=>{let cancelled=false;
  const render=async(ref:HTMLCanvasElement|null,n:number)=>{
   if(!ref)return;
   if(!docRef.current||n<1||n>total){const c=ref.getContext("2d");c?.clearRect(0,0,ref.width,ref.height);ref.style.display="none";return}
   ref.style.display="block";
   const pdfPage=await docRef.current.getPage(n);if(cancelled)return;
   const viewport=pdfPage.getViewport({scale:zoom*1.15});
   const canvas=ref;const context=canvas.getContext("2d");if(!context)return;
   canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
   await pdfPage.render({canvasContext:context,viewport}).promise;
  };
  const rightPage=mode==="double"?page+1:0;
  Promise.all([render(leftRef.current,page),render(rightRef.current,rightPage)]).catch(()=>{if(!cancelled)setError("Gagal merender halaman PDF.")});
  return()=>{cancelled=true};
 },[page,zoom,total,mode]);
 const turn=(direction:"next"|"previous")=>{
  const step=mode==="single"?1:2;
  const target=direction==="next"?Math.min(total,page+step):Math.max(1,page-step);
  if(target===page)return;
  setTurnDirection(direction);setTurnKey(k=>k+1);playPageSound();setPage(target);
 };
 const previous=()=>turn("previous");const next=()=>turn("next");
 useEffect(()=>{const onKey=(event:KeyboardEvent)=>{if(event.key==="ArrowLeft")previous();if(event.key==="ArrowRight")next();if(event.key==="Escape")setFullscreen(false)};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey)});
 const onWheel=(event:React.WheelEvent<HTMLDivElement>)=>{if(event.ctrlKey||event.metaKey||Math.abs(event.deltaY)>0){event.preventDefault();changeZoom(event.deltaY<0?.1:-.1)}};
 const isFirst=page<=1;const isLast=mode==="single"?page>=total:page+1>=total;
 return <main className={fullscreen?"pdf-reader pdf-reader-fullscreen":"pdf-reader"}>
  <header className="pdf-reader-header">
   <a href={"/buku/"+slug}>← Kembali ke buku</a><strong>{title}</strong><span>PDF Flipbook</span>
  </header>
  {loading?<div className="pdf-loading"><span className="spin">◌</span> Memuat PDF…</div>:error?<div className="pdf-loading pdf-error">{error}</div>:<>
   <div className="pdf-toolbar" aria-label="Kontrol flipbook">
    <div className="pdf-toolbar-group">
     <button title="Perkecil (scroll ke bawah pada halaman)" aria-label="Zoom out" onClick={()=>changeZoom(-.1)} disabled={zoom<=.6}><ZoomOut size={17}/></button>
     <span className="pdf-zoom-value">{Math.round(zoom*100)}%</span>
     <button title="Perbesar (scroll ke atas pada halaman)" aria-label="Zoom in" onClick={()=>changeZoom(.1)} disabled={zoom>=2.5}><ZoomIn size={17}/></button>
     <button title="Reset zoom" aria-label="Reset zoom" onClick={()=>setZoom(1)}><RotateCcw size={15}/></button>
    </div>
    <span className="pdf-toolbar-divider"/>
    <div className="pdf-toolbar-group">
     <span className="pdf-toolbar-label">Tampilan</span>
     <button className={mode==="single"?"selected":""} title="Satu halaman" onClick={()=>{setMode("single");setPage(p=>Math.min(p,total))}}><BookOpen size={16}/> <span>Satu</span></button>
     <button className={mode==="double"?"selected":""} title="Dua halaman" onClick={()=>{setMode("double");setPage(p=>p===1?1:Math.max(1,p%2===0?p-1:p))}}><BookOpen size={16}/> <span>Dua</span></button>
    </div>
    <span className="pdf-toolbar-divider"/>
    <label className="pdf-effect-control"><span>Efek</span><select value={effect} onChange={e=>setEffect(e.target.value as TurnEffect)}><option value="flip">Buka kertas</option><option value="slide">Geser</option><option value="card">Kartu</option></select></label>
    <div className="pdf-toolbar-group pdf-toolbar-options">
     <button className={sound?"selected":""} title={sound?"Matikan suara halaman":"Aktifkan suara halaman"} aria-label="Suara halaman" onClick={()=>setSound(v=>!v)}>{sound?<Volume2 size={17}/>:<VolumeX size={17}/>}<span>Suara</span></button>
     <button className={shadows?"selected":""} title="Aktif/nonaktifkan bayangan halaman" onClick={()=>setShadows(v=>!v)}><span className="pdf-shadow-icon">▤</span><span>Bayangan</span></button>
     <button title={fullscreen?"Keluar layar penuh":"Layar penuh"} aria-label="Layar penuh" onClick={()=>setFullscreen(v=>!v)}>{fullscreen?<Minimize2 size={16}/>:<Maximize2 size={16}/>}</button>
    </div>
   </div>
   <div className={"pdf-stage "+(shadows?"with-shadows":"")} ref={stageRef} onWheel={onWheel}>
    <button className="pdf-turn-arrow" aria-label="Halaman sebelumnya" disabled={isFirst} onClick={previous}><ChevronLeft/></button>
    <div key={turnKey} className={"pdf-spread "+(mode==="single"?"single-page":"double-page")+" effect-"+effect+" turn-"+turnDirection}>
     <div className="pdf-page-wrap"><canvas ref={leftRef} className="pdf-page-canvas"/></div>
     {mode==="double"&&<div className="pdf-page-wrap right-page-wrap"><canvas ref={rightRef} className="pdf-page-canvas"/></div>}
    </div>
    <button className="pdf-turn-arrow" aria-label="Halaman berikutnya" disabled={isLast} onClick={next}><ChevronRight/></button>
   </div>
   <footer className="pdf-reader-controls">
    <div className="pdf-bottom-nav"><button disabled={isFirst} onClick={previous}><ChevronLeft size={16}/> Sebelumnya</button><span>Halaman <strong>{page}{mode==="double"&&page+1<=total?"–"+(page+1):""}</strong> dari {total}</span><button disabled={isLast} onClick={next}>Berikutnya <ChevronRight size={16}/></button></div>
    <div className="pdf-wheel-hint">Tip: arahkan kursor ke halaman, lalu scroll untuk zoom. Gunakan tombol panah untuk membalik halaman.</div>
   </footer>
  </>}
 </main>;
}
