export const modes = ['快速定位','微调瞄准','连续跟踪','大角度切换'];
export type Round = { factor:number; mode:number; phase:'热身'|'初筛'|'精测'|'复测'; repeat:number };
export type Sample = Round & {score:number; hits:number; shots:number; timeouts:number; meanMs:number; onTarget:number; error:number; movingError?:number; reacquireMs?:number|null; missedTransitions?:number; transitions?:number; raw:boolean};
export const mean=(v:number[])=>v.length?v.reduce((a,b)=>a+b,0)/v.length:0;
export function clickScore(hits:number,shots:number,seconds:number,mode:number){
 const reference=mode===1?2.5:mode===3?1:1.8;
 return Math.min(100,100*(hits/Math.max(shots,1))*Math.min(1,hits/seconds/reference));
}
export function blocks(factors:number[],phase:Round['phase'],repeat=0):Round[]{return factors.flatMap(factor=>[0,1,2,3].map(mode=>({factor,phase,mode,repeat})));}
export function shuffle<T>(values:T[]):T[]{const a=[...values];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function ranking(samples:Sample[]){return [...new Set(samples.map(s=>s.factor))].map(factor=>({factor,score:mean(samples.filter(s=>s.factor===factor).map(s=>s.score))})).sort((a,b)=>b.score-a.score);}
export function fineFactors(winner:number){return [...new Set([winner/1.1,winner,winner*1.1].map(n=>+n.toFixed(3)))];}
export function report(samples:Sample[]){
 const verified=samples.filter(s=>s.phase==='复测'); const ranked=ranking(verified); const top=ranked[0];
 const baseline=ranked.find(s=>s.factor===1); const gains=[0,1].map(repeat=>{const data=verified.filter(s=>s.repeat===repeat);return mean(data.filter(s=>s.factor===top?.factor).map(s=>s.score))-mean(data.filter(s=>s.factor===1).map(s=>s.score));});
 const fine=ranking(samples.filter(s=>s.phase==='精测'));
 const fineValues=fine.map(s=>s.factor);
 const boundary=!!(fine.length>1&&fine[0].factor!==1&&(fine[0].factor===Math.min(...fineValues)||fine[0].factor===Math.max(...fineValues)));
 const complete=verified.length===16&&ranked.length===2&&verified.every(s=>s.raw)&&ranked.every(r=>[0,1].every(repeat=>[0,1,2,3].every(mode=>verified.filter(s=>s.factor===r.factor&&s.repeat===repeat&&s.mode===mode).length===1)));
 const improvement=!!(complete&&!boundary&&top&&top.factor!==1&&baseline&&top.score-baseline.score>5&&gains.every(g=>g>3));
 const factor=improvement?top.factor:1;
 const range=ranked.filter(s=>s.score>=(top?.score??0)-5).map(s=>s.factor);
 return {ranked,factor,improvement,complete,boundary,gains,range,delta:top&&baseline?top.score-baseline.score:0};
}
