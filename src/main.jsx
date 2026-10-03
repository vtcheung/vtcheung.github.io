import React, { useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { AnimatePresence, motion } from 'framer-motion'
import { Camera, ChevronDown, ChevronRight, Menu, Pause, Play, Plus, Star, Volume2, X, ArrowLeft, ExternalLink, SkipBack, SkipForward } from 'lucide-react'
import './styles.css'
import './trip.css'
import './features.css'

const fields = text => Object.fromEntries(text.trim().split('\n').map(line => { const n = line.indexOf(':'); return n < 0 ? [] : [line.slice(0, n).trim(), line.slice(n + 1).trim()] }).filter(x => x.length))
const cards = text => { const p = text.split(/^---\s*$/m), out=[]; for(let i=1;i<p.length;i+=2){const data=fields(p[i]||'');if(data.title)out.push({...data,text:(p[i+1]||'').trim()})} return out }
const read = async file => { try{return await (await fetch(file)).text()}catch{return ''} }
const getCards = async file => cards(await read(file))
const detail = text => { const p=text.split(/^---\s*$/m), data=fields(p[1]||''), sections={}; p.slice(2).join('---').split(/^## /m).slice(1).forEach(x=>{const [h,...b]=x.split('\n');sections[h.trim()]=b.join('\n').trim()}); return {...data,sections} }
const getDetail = async file => detail(await read(file))
const albumImages = source => [...source.matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map(([,caption,image])=>{const [place,date,camera]=caption.split('|').map(x=>x.trim());return {place,date,camera,image}})
const tracks = source => source.split(/^### /m).slice(1).map(block=>{const [title,...body]=block.split('\n');return {...fields(body.join('\n')),title:title.trim()}})
const ytEmbed = url => { if(!url)return null; const list=url.match(/[?&]list=([^#&?]+)/), vid=url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([^#&?]+)/); if(list)return `https://www.youtube.com/embed/videoseries?list=${list[1]}`; if(vid)return `https://www.youtube.com/embed/${vid[1]}`; return null }

function Back({close}){return <button className="back" onClick={close}><ArrowLeft size={15}/> 返回</button>}
function Travel({data,close,zoom}){const s=data.sections||{}, images=albumImages(s.Album||s['相册']||'');return <section className="trip-page wrap"><Back close={close}/><div className="trip-hero"><img src={data.cover} alt={data.title}/><div><p className="eyebrow">TRAVEL ARCHIVE · {data.date}</p><h1>{data.title}</h1><p>{data.subtitle}</p></div></div><div className="trip-info"><article><p className="eyebrow">ABOUT THIS JOURNEY</p><h2>旅行介绍</h2><p>{s.Intro||s['旅行介绍']}</p></article><article><p className="eyebrow">THE ROUTE</p><h2>行走路线</h2><p className="route">{s.Route||s['路线']}</p></article></div><div className="album"><p className="eyebrow">PHOTO ALBUM</p><h2>旅行相册</h2><div className="album-grid">{images.map((x,i)=><button key={i} onClick={()=>zoom(x)}><img src={x.image} alt={x.place}/><span>{x.place}</span></button>)}</div></div></section>}
function Playlist({data,close,play,toggle,now,playing}){const list=tracks(data.sections?.Tracks||''),embed=ytEmbed(data.youtube);return <section className="detail-page wrap"><Back close={close}/><div className="detail-head"><img src={data.cover} alt=""/><div><p className="eyebrow">PLAYLIST · {data.date||'PERSONAL SELECTION'}</p><h1>{data.title}</h1><p>{data.subtitle}</p>{data.desc&&<p className="album-desc">{data.desc}</p>}<button className="big-play" onClick={()=>play(list,0,data.title)}><Play size={18} fill="currentColor"/> 播放歌单</button></div></div><div className="song-list">{list.map((x,i)=><button key={x.title} onClick={()=>toggle(list,i,data.title)}><span>{String(i+1).padStart(2,'0')}</span><div><b>{x.title}</b><small>{x.artist||x.detail}</small></div><em>{x.duration}</em>{playing&&now?.title===x.title?<Pause size={16}/>:<Play size={16}/>}</button>)}</div>{data.youtube&&<div className="yt-block"><div className="yt-head"><p className="eyebrow">STREAM ON YOUTUBE</p><a className="yt-link" href={data.youtube} target="_blank" rel="noreferrer"><ExternalLink size={17}/> 在 YouTube 打开</a></div>{embed&&<div className="yt-frame"><iframe src={embed} title={data.title} allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen/></div>}</div>}</section>}
function Book({data,close}){const quotes=(data.sections?.Quotes||'').split('\n').filter(x=>x.trim()).map(x=>x.replace(/^-\s*/,''));return <section className="detail-page book-page wrap"><Back close={close}/><div className="detail-head"><img src={data.cover} alt=""/><div><p className="eyebrow">BOOK NOTES · {data.author}</p><h1>{data.title}</h1><p>{data.text}</p></div></div><div className="quotes"><p className="eyebrow">HIGHLIGHTS</p><h2>摘抄</h2>{quotes.map((q,i)=><blockquote key={i}>{q}</blockquote>)}</div></section>}

const THEMES=[
 {id:'travel', n:'01', nav:'旅途', en:'MY TRAVEL FOOTPRINT', label:'旅行档案', sub:'火山、冰川与公路 — 每一次远行的回声', c:'#E2572B', cl:'#F0A17C', ink:'#431708', grow:1.22, lx:22, ly:58, sx:1.15},
 {id:'music', n:'02', nav:'声音', en:'SOUND SKETCHES', label:'声音收藏', sub:'为不同时刻准备的私人歌单', c:'#2E86AB', cl:'#8CC0D6', ink:'#0E2C3A', grow:1, lx:68, ly:34, sx:.95},
 {id:'journal', n:'03', nav:'随笔', en:'MEDIA JOURNAL', label:'书影音随笔', sub:'读过的书、看过的电影、反复听的歌', c:'#C79A2E', cl:'#E5CE86', ink:'#3A2C05', grow:1.3, lx:54, ly:66, sx:1.25},
]
const THEME_VERB={travel:'查看旅途',music:'查看歌单',journal:'查看随笔'}

const impasto=color=>{
 const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='1440' height='330'><filter id='p' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>
  <feTurbulence type='turbulence' baseFrequency='0.0055 0.013' numOctaves='4' seed='9' result='b'/>
  <feTurbulence type='fractalNoise' baseFrequency='0.004 0.007' numOctaves='3' seed='4' result='s'/>
  <feDisplacementMap in='b' in2='s' scale='34' xChannelSelector='R' yChannelSelector='G' result='b2'/>
  <feDiffuseLighting in='b2' surfaceScale='2.2' diffuseConstant='1' lighting-color='#ffffff' result='l'><feDistantLight azimuth='252' elevation='40'/></feDiffuseLighting>
  <feComposite in='l' in2='SourceGraphic' operator='arithmetic' k1='0.9' k2='0.32' k3='0' k4='0' result='d'/>
  <feSpecularLighting in='b2' surfaceScale='1.7' specularConstant='0.32' specularExponent='15' lighting-color='#ffffff' result='spec'><feDistantLight azimuth='252' elevation='54'/></feSpecularLighting>
  <feBlend in='spec' in2='d' mode='screen'/>
 </filter><rect width='1440' height='330' fill='${color}' filter='url(#p)'/></svg>`
 return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`
}

function Motif({id}){
 if(id==='travel')return <svg viewBox="0 0 150 70" className="motif-svg"><g fill="none" stroke="#2b2419" strokeLinecap="round" strokeLinejoin="round"><path d="M28,34 q8,-10 16,0 q8,-10 16,0" strokeWidth="3.4"/><path d="M84,22 q6,-7 12,0 q6,-7 12,0" strokeWidth="2.6"/></g></svg>
 if(id==='music')return <svg viewBox="0 0 150 70" className="motif-svg"><g fill="#20282a"><path d="M42,38 l46,0 -7,13 -32,0 z"/><rect x="63" y="20" width="2.4" height="18"/><path d="M65,20 l19,12 -19,2.4 z"/><path d="M30,52 q12,-4 24,0 t24,0" fill="none" stroke="#20282a" strokeWidth="1.6"/></g></svg>
 const toe="M0,-9 C1,-7.7 1.45,-4 1.4,-1.8 C1.38,-0.7 0.78,0 0,0 C-0.78,0 -1.38,-0.7 -1.4,-1.8 C-1.45,-4 -1,-7.7 0,-9 Z"; return <svg viewBox="0 0 150 70" className="motif-svg"><defs><g id="pf"><path d={toe}/><path d={toe} transform="rotate(-30)"/><path d={toe} transform="rotate(30)"/></g></defs><g fill="#2a2118"><use href="#pf" transform="translate(22,31) rotate(94) scale(1.05)"/><use href="#pf" transform="translate(48,31) rotate(94) scale(1.05)"/><use href="#pf" transform="translate(74,31) rotate(94) scale(1.05)"/><use href="#pf" transform="translate(100,31) rotate(94) scale(1.05)"/><use href="#pf" transform="translate(126,31) rotate(94) scale(1.05)"/><use href="#pf" transform="translate(35,41) rotate(86) scale(1.05)"/><use href="#pf" transform="translate(61,41) rotate(86) scale(1.05)"/><use href="#pf" transform="translate(87,41) rotate(86) scale(1.05)"/><use href="#pf" transform="translate(113,41) rotate(86) scale(1.05)"/></g></svg>
}

function Stroke({t,open}){
 return <button className="stroke" style={{'--c':t.c,'--cl':t.cl,'--ink':t.ink,'--grow':t.grow,'--tex':impasto(t.c)}} onClick={()=>open(t.id)} aria-label={t.label}>
  <span className="motif" style={{left:t.lx+'%',top:t.ly+'%',transform:`translate(-50%,-50%) scale(${t.sx})`}}><Motif id={t.id}/></span>
  <span className="stroke-label" style={{color:t.ink}}>
   <span className="stroke-meta"><span className="stroke-no">{t.n}</span><span className="stroke-en">{t.en}</span></span>
   <b>{t.label}</b>
   <i>{t.sub}</i>
   <span className="stroke-cta">{THEME_VERB[t.id]} <ChevronRight size={15}/></span>
  </span>
 </button>
}

function Strokes({open}){
 const ref=useRef(null)
 const move=e=>{const r=ref.current.getBoundingClientRect();ref.current.style.setProperty('--mx',(((e.clientX-r.left)/r.width-.5)*2).toFixed(3))}
 return <section className="strokes" ref={ref} onMouseMove={move} id="top">
  {THEMES.map(t=><Stroke key={t.id} t={t} open={open}/>)}
 </section>
}

function Theme({theme,travel,playlists,journal,tab,setTab,open,close}){
 const filmsByYear=journal.films.reduce((a,x)=>{const y=(x.date||'').slice(0,4);(a[y]=a[y]||[]).push(x);return a},{})
 const years=Object.keys(filmsByYear).sort((a,b)=>b.localeCompare(a))
 const [openYears,setOpenYears]=useState({})
 const toggleYear=y=>setOpenYears(o=>({...o,[y]:!o[y]}))
 useEffect(()=>{if(years.length&&!Object.keys(openYears).length)setOpenYears({[years[0]]:true})},[journal.films.length])
 const journalList=tab==='books'?[...journal[tab]].reverse():journal[tab]
 const body = theme.id==='travel'
  ? <div className="gallery">{travel.map((x,i)=><motion.button className={'photo-card card-'+i%6} whileHover={{y:-5}} key={x.slug} onClick={()=>open('travel',x)}><img src={x.cover} alt=""/><span className="photo-overlay"><Camera size={18}/><b>{x.title}</b><small>{x.date} · 点击阅读</small></span></motion.button>)}</div>
  : theme.id==='music'
  ? <div className="playlist-grid">{playlists.map(x=><button className="playlist-card" key={x.slug} onClick={()=>open('playlist',x)}><img src={x.cover} alt=""/><span><small>PLAYLIST · {x.date}</small><b>{x.title}</b><i>{x.text}</i><Play size={18} fill="currentColor"/></span></button>)}</div>
  : <><div className="tabs">{[['books','书籍'],['films','影视'],['music','音乐']].map(([id,label])=><button key={id} onClick={()=>setTab(id)} className={tab===id?'active':''}>{label}</button>)}</div>{tab==='films'?<div className="timeline">{years.map(year=>{const list=filmsByYear[year];return <section className="film-year" key={year}><button className={'year-head'+(openYears[year]?' open':'')} onClick={()=>toggleYear(year)}><span className="year-num">{year}</span><span className="year-count">{list.length} 部</span><ChevronDown size={17}/></button>{openYears[year]&&<div className="year-body">{list.map(x=><article key={x.title+x.date}><time>{x.date}</time><img src={x.image} alt=""/><div><div className="stars">{Array.from({length:+x.rating||0},(_,i)=><Star key={i} size={13} fill="currentColor"/>)}</div><h3>{x.title}{x.original&&<span className="orig">（{x.original}）</span>}</h3>{x.text&&<p className="note">{x.text}</p>}</div></article>)}</div>}</section>})}</div>:<div className="journal-grid">{journalList.map(x=><button className="journal-card" key={x.title} onClick={()=>open(tab==='books'?'book':'album',x)}><img src={x.image||x.cover} alt=""/><div className="journal-content"><div className="stars">{Array.from({length:+x.rating||0},(_,i)=><Star key={i} size={13} fill="currentColor"/>)}</div><h3>{x.title}</h3><p className="author">{x.author}</p><p className="review">“{x.text}”</p></div></button>)}</div>}</>
 return <section className="theme-page"><div className="theme-strip" style={{background:`linear-gradient(180deg,${theme.cl},${theme.c})`}}><div className="wrap"><Back close={close}/><p className="eyebrow">{theme.n} · {theme.en}</p><h1>{theme.label}</h1><p className="theme-sub">{theme.sub}</p></div></div><div className="wrap theme-body">{body}</div></section>
}

function App(){
 const [travel,setTravel]=useState([]),[playlists,setPlaylists]=useState([]),[journal,setJournal]=useState({books:[],films:[],music:[]}),[tab,setTab]=useState('books'),[view,setView]=useState(null),[lightbox,setLightbox]=useState(null),[now,setNow]=useState(null),[queue,setQueue]=useState([]),[queueIndex,setQueueIndex]=useState(0),[playing,setPlaying]=useState(false); const audio=useRef(null)
 useEffect(()=>{Promise.all([getCards('/content/travel.md'),getCards('/content/playlists.md'),getCards('/content/journal/books.md'),getCards('/content/journal/films.md'),getCards('/content/journal/music.md')]).then(([t,p,b,f,m])=>{setTravel(t);setPlaylists(p);setJournal({books:b,films:f,music:m})})},[])
 useEffect(()=>{if(!audio.current)return;playing?audio.current.play().catch(()=>setPlaying(false)):audio.current.pause()},[now,playing])
 const play=(list,index,collection)=>{setQueue(list);setQueueIndex(index);setNow({...list[index],collection});setPlaying(true)}
 const ended=()=>{if(queueIndex<queue.length-1){const n=queueIndex+1;setQueueIndex(n);setNow({...queue[n],collection:now?.collection});setPlaying(true)}else setPlaying(false)}
 const step=dir=>{if(!queue.length)return;const n=(queueIndex+dir+queue.length)%queue.length;setQueueIndex(n);setNow({...queue[n],collection:now?.collection});setPlaying(true)}
 const toggle=(list,index,collection)=>{if(now&&list[index]&&now.title===list[index].title&&now.collection===collection)setPlaying(p=>!p);else play(list,index,collection)}
 useEffect(()=>{const go=el=>window.scrollTo({top:el?Math.max(0,el.getBoundingClientRect().top+window.scrollY):0,behavior:'smooth'});const raf=requestAnimationFrame(()=>{let el;if(!view)el=document.querySelector('.strokes');else if(view.type==='theme'){const b=document.querySelector('.theme-body');el=(b&&b.firstElementChild)||b}else if(view.type==='travel')el=document.querySelector('.trip-hero');else el=document.querySelector('.detail-head>img');go(el)});return()=>cancelAnimationFrame(raf)},[view])
 const PARENT={travel:'travel',playlist:'music',book:'journal',album:'journal'}
 const FOLDER={travel:'trips',playlist:'playlists',book:'books',album:'albums'}
 const push=s=>{const d=((window.history.state&&window.history.state.d)||0)+1;window.history.pushState({...s,d},'')}
 const loadDetail=async(type,parent,slug)=>{setView({type,parent,data:null});const data=await getDetail(`/content/${FOLDER[type]}/${slug}.md`);setView({type,parent,data})}
 const applyState=s=>{if(!s)setView(null);else if(s.k==='theme')setView({type:'theme',id:s.id});else loadDetail(s.type,s.parent,s.slug)}
 const open=(type,item)=>{const parent=PARENT[type];push({k:'detail',type,parent,slug:item.slug});loadDetail(type,parent,item.slug)}
 const openTheme=id=>{push({k:'theme',id});setView({type:'theme',id})}
 const goBack=()=>window.history.back()
 const goHome=()=>{const d=(window.history.state&&window.history.state.d)||0;if(d>0)window.history.go(-d);else setView(null)}
 useEffect(()=>{window.history.scrollRestoration='manual';window.history.replaceState(null,'');const onPop=e=>applyState(e.state);window.addEventListener('popstate',onPop);return()=>window.removeEventListener('popstate',onPop)},[])
 const current=()=>{
  if(view.type==='theme'){const th=THEMES.find(t=>t.id===view.id);return <Theme theme={th} travel={travel} playlists={playlists} journal={journal} tab={tab} setTab={setTab} open={open} close={goBack}/>}
  if(!view.data)return <section className="trip-page wrap"><Back close={goBack}/><p>正在打开内容…</p></section>
  if(view.type==='travel')return <Travel data={view.data} close={goBack} zoom={setLightbox}/>
  if(view.type==='book')return <Book data={view.data} close={goBack}/>
  return <Playlist data={view.data} close={goBack} play={play} toggle={toggle} now={now} playing={playing}/>
 }
  return <main>
   <audio ref={audio} src={now?.audio} onEnded={ended}/>
  <nav className="nav wrap"><button className="brand" onClick={goHome}>vt's world<span>·</span></button><div className="nav-links">{THEMES.map(t=><button key={t.id} onClick={()=>openTheme(t.id)} className={view?.type==='theme'&&view.id===t.id?'active':''}>{t.nav}</button>)}</div><Menu className="menu"/></nav>
  {view?current():<Strokes open={openTheme}/>}
  <footer className="wrap"><p>© 2026 WEITONG · MADE WITH WONDER</p></footer>
  <AnimatePresence>{lightbox&&<motion.div className="lightbox" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setLightbox(null)}><button className="close"><X/></button><motion.img initial={{scale:.94}} animate={{scale:1}} src={lightbox.image} alt=""/><div><b>{lightbox.place}</b><p>{lightbox.date} · {lightbox.camera}</p></div></motion.div>}</AnimatePresence>
  <div className="floating-player"><div className={'vinyl '+(playing?'spinning':'')}><span/></div><div className="now-playing"><small>{now?.collection||'NOW PLAYING'}</small><b>{now?.title||'选择一首音乐'}</b><span><Volume2 size={13}/>{now?.artist||now?.detail||'播放列表会在这里显示'}</span></div><div className="player-ctrls"><button className={'ctrl'+(now?'':' off')} onClick={()=>now&&step(-1)} disabled={!now} aria-label="上一首"><SkipBack size={16} fill="currentColor"/></button><button className="toggle" onClick={()=>now&&setPlaying(!playing)} aria-label={playing?'暂停':'播放'}>{playing?<Pause size={18}/>:<Play size={18} fill="currentColor"/>}</button><button className={'ctrl'+(now?'':' off')} onClick={()=>now&&step(1)} disabled={!now} aria-label="下一首"><SkipForward size={16} fill="currentColor"/></button></div></div>
 </main>
}
createRoot(document.getElementById('root')).render(<App/>)
