
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

const STEPS = ["Processador","Placa-mãe","Memória RAM","Placa de vídeo","Armazenamento","Fonte","Cooler","Gabinete"];

const SAMPLE = [
  { id:'cpu-ryzen-5500', name:'AMD Ryzen 5 5500', category:'Processador', brand:'AMD', socket:'AM4', tdp:65 },
  { id:'cpu-ryzen-5600x', name:'AMD Ryzen 5 5600X', category:'Processador', brand:'AMD', socket:'AM4', tdp:65 },
  { id:'cpu-i5-12400', name:'Intel Core i5-12400', category:'Processador', brand:'Intel', socket:'LGA1700', tdp:65 },
  { id:'mb-b550', name:'ASUS B550 Gaming', category:'Placa-mãe', brand:'ASUS', socket:'AM4', ram_type:'DDR4', max_gpu_mm:330 },
  { id:'mb-z690', name:'MSI Z690', category:'Placa-mãe', brand:'MSI', socket:'LGA1700', ram_type:'DDR5', max_gpu_mm:360 },
  { id:'gpu-rtx3060', name:'NVIDIA RTX 3060', category:'Placa de vídeo', brand:'NVIDIA', length_mm:242, tdp:170 },
  { id:'gpu-rx6600', name:'AMD RX 6600', category:'Placa de vídeo', brand:'AMD', length_mm:200, tdp:132 },
  { id:'case-nzxt-h510', name:'NZXT H510', category:'Gabinete', brand:'NZXT', max_gpu_mm:381, max_cooler_height_mm:165, fan_slots:5 },
  { id:'psu-650', name:'Corsair 650W', category:'Fonte', brand:'Corsair', watt:650 },
  { id:'fan-corsair', name:'Corsair QL120 RGB', category:'Ventoinha', brand:'Corsair', size_mm:120, rgb:true }
];

function fetchSimulatedPrices(name){
  return [
    {market:'Kabum', price: Math.round(Math.random()*1500+500), link:'#'},
    {market:'Terabyte', price: Math.round(Math.random()*1500+500), link:'#'},
    {market:'Pichau', price: Math.round(Math.random()*1500+500), link:'#'},
    {market:'Mercado Livre', price: Math.round(Math.random()*1500+500), link:'#'}
  ].sort((a,b)=>a.price-b.price)
}

function ThreePlaceholder({build,fans}){
  return (
    <div style={{width:'100%',height:340,display:'flex',alignItems:'center',justifyContent:'center',background:'#071021',borderRadius:8}}>
      <div style={{color:'#6ee7ff',opacity:0.9}}>3D Preview (placeholder) - integrate GLTFs for true models</div>
    </div>
  )
}

export default function App(){
  const [catalog] = useState(SAMPLE);
  const [step,setStep] = useState(0);
  const [build,setBuild] = useState({});
  const [brandFilter,setBrandFilter] = useState(null);
  const [pricesCache,setPricesCache] = useState({});
  const [popup,setPopup] = useState(null);

  const currentCategory = STEPS[step];

  const options = useMemo(()=>{
    let items = catalog.filter(i=>i.category===currentCategory);
    if(currentCategory==='Placa-mãe' && build['Processador']){
      const cpu = build['Processador'];
      items = items.filter(mb => mb.socket===cpu.socket);
    }
    if(currentCategory==='Gabinete' && build['Placa de vídeo']){
      const gpu = build['Placa de vídeo'];
      items = items.filter(g => !g.max_gpu_mm || g.max_gpu_mm >= (gpu.length_mm||0));
    }
    if(brandFilter) items = items.filter(i=>i.brand.toLowerCase().includes(brandFilter.toLowerCase()));
    return items;
  },[catalog,currentCategory,build,brandFilter])

  useEffect(()=>{
    if(popup){
      const t = setTimeout(()=>setPopup(null),4000);
      return ()=>clearTimeout(t);
    }
  },[popup])

  function choose(item){
    setBuild(b=>({...b,[currentCategory]:item}));
    // fetch prices from backend (or simulate)
    axios.get('/api/prices', { params: { q: item.name }})
      .then(res=>{
        setPricesCache(p=>({...p,[item.id]: res.data}));
      }).catch(err=>{
        // fallback to simulated
        setPricesCache(p=>({...p,[item.id]: fetchSimulatedPrices(item.name)}));
      })
    // suggestion popup
    setPopup({title:'Sugestão', text:`Recomendado: combine ${item.name} com placas compatíveis listadas na próxima etapa.`});
    setTimeout(()=> setStep(s=>Math.min(s+1,STEPS.length-1)),300)
  }

  function bestPrice(item){
    const arr = pricesCache[item.id] || fetchSimulatedPrices(item.name);
    return arr[0];
  }

  return (
    <div className="container">
      <header className="header">
        <div style={{display:'flex',alignItems:'center',gap:12}}>
          <img src="/logo.png" alt="PCForge" style={{height:48}}/>
          <div>
            <h1 style={{margin:0}}>PCForge</h1>
            <div className="small">Monte seu PC com compatibilidade e melhores preços</div>
          </div>
        </div>
        <div className="progress">Progresso: {step+1}/{STEPS.length}</div>
      </header>

      <main style={{display:'grid',gridTemplateColumns:'1fr 420px',gap:20}}>
        <section className="card">
          <h3 style={{marginTop:0}}>{currentCategory || 'Concluído'}</h3>
          <div style={{display:'flex',gap:8,marginBottom:12}}>
            <button className="button" onClick={()=>setBrandFilter(null)}>Todos</button>
            <button className="button" onClick={()=>setBrandFilter('AMD')}>AMD</button>
            <button className="button" onClick={()=>setBrandFilter('Intel')}>Intel</button>
            <button className="button" onClick={()=>setBrandFilter('NVIDIA')}>NVIDIA</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            {options.map(item => (
              <div key={item.id} className={"card step-card show"} style={{padding:12,borderRadius:10,display:'flex',flexDirection:'column',justifyContent:'space-between'}}>
                <div>
                  <div style={{fontWeight:600}}>{item.name}</div>
                  <div className="small">{item.brand} • {item.category}</div>
                  <div className="small" style={{marginTop:6}}>Specs: {item.spec || (item.tdp?`TDP ${item.tdp}W`:'-')}</div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:8}}>
                  <div style={{textAlign:'right'}}>
                    <div className="small">Melhor preço</div>
                    <div style={{fontWeight:700,color:'#6ee7ff'}}>R$ {bestPrice(item).price}</div>
                    <div className="small">{bestPrice(item).market}</div>
                  </div>
                  <div style={{display:'flex',flexDirection:'column',gap:6}}>
                    <button className="button" onClick={()=>choose(item)}>Escolher</button>
                    <button className="small" onClick={()=>alert(JSON.stringify(item,null,2))}>Detalhes</button>
                  </div>
                </div>
              </div>
            ))}
            {options.length===0 && <div className="small">Nenhuma opção disponível — ajuste filtros ou volte uma etapa.</div>}
          </div>
        </section>

        <aside className="card">
          <h3 style={{marginTop:0}}>Resumo</h3>
          <div style={{display:'grid',gap:8}}>
            {STEPS.map(s=>(
              <div key={s} style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div><div className="small">{s}</div><div style={{fontWeight:600}}>{build[s]?.name || '—'}</div></div>
                <div style={{textAlign:'right'}}>
                  {build[s] && <div className="small">R$ { (pricesCache[build[s].id] || fetchSimulatedPrices(build[s].name))[0].price }</div>}
                </div>
              </div>
            ))}
          </div>

          <div style={{marginTop:12}}>
            <h4 style={{margin:'8px 0'}}>Visual 3D</h4>
            <ThreePlaceholder build={build} fans={[]} />
          </div>
        </aside>
      </main>

      {popup && <div className="popup"><strong>{popup.title}</strong><div style={{marginTop:6}}>{popup.text}</div></div>}

      <footer style={{marginTop:20}} className="small">Demo PCForge — integrado com backend simulado. Para produção, configure as chaves e endpoints de marketplaces.</footer>
    </div>
  )
}
