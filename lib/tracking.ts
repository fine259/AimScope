// Seeded horizontal strafing. Factor/DPI are intentionally excluded from seed.
export type Leg={start:number;end:number;x:number;velocity:number};
export function trackingSeed(phase:string,repeat:number){return ({'热身':137,'初筛':271,'精测':419,'复测':631}[phase]??137)+repeat*997;}
export function makeTrack(seed:number,duration:number):Leg[]{
 let state=seed>>>0;const random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
 const legs:Leg[]=[];let t=0,x=0,direction=random()<.5?-1:1;
 const add=(velocity:number,length:number)=>{const end=Math.min(duration,t+length);legs.push({start:t,end,x,velocity});x+=velocity*(end-t);t=end;};
 while(t<duration){
  const speed=18+random()*18;let length=.54+random()*.66;
  if(Math.abs(x+direction*speed*length)>28)direction=x>0?-1:1;
  length=Math.min(length,(28-direction*x)/speed);
  add(direction*speed,length);
  if(t>=duration)break;
  if(random()<.65)add(0,.15+random()*.2);
  direction=random()<.8?-direction:direction;
 }
 return legs;
}
export function targetAt(legs:Leg[],time:number){const index=Math.max(0,legs.findIndex(l=>time<l.end));const i=time>=legs[legs.length-1].end?legs.length-1:index;const leg=legs[i];return {x:leg.x+leg.velocity*Math.max(0,Math.min(time,leg.end)-leg.start),y:0,velocity:leg.velocity,index:i};}
// Reacquisition requires 80 ms continuously on target, to reject accidental crossings.
export class TrackingMetrics{
 private total=0;private on=0;private moving=0;private movingError=0;
 private events=new Map<number,{dwell:number;latency:number|null;duration:number}>();
 update(leg:Leg,index:number,time:number,dt:number,error:number,radius:number){
  if(dt<=0)return;this.total+=dt;if(error<=radius)this.on+=dt;
  if(leg.velocity!==0){this.moving+=dt;this.movingError+=error*dt;}
  if(index===0||leg.end-leg.start<.08)return;
  let event=this.events.get(index);if(!event){event={dwell:0,latency:null,duration:leg.end-leg.start};this.events.set(index,event);}
  if(event.latency!==null)return;
  event.dwell=error<=radius?event.dwell+dt:0;
  if(event.dwell>=.08)event.latency=Math.max(0,time-leg.start-event.dwell);
 }
 summary(){
  const events=[...this.events.values()];const acquired=events.filter(e=>e.latency!==null);
  const occupancy=this.total?100*this.on/this.total:0;
  const response=events.length?100*events.reduce((n,e)=>n+(e.latency===null?0:Math.max(0,1-e.latency/e.duration)),0)/events.length:0;
  return {score:events.length?.8*occupancy+.2*response:occupancy,onTarget:occupancy,movingError:this.moving?this.movingError/this.moving:0,reacquireMs:acquired.length?1000*acquired.reduce((n,e)=>n+e.latency!,0)/acquired.length:null,missedTransitions:events.length-acquired.length,transitions:events.length};
 }
}
