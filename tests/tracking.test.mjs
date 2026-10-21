import assert from 'node:assert/strict';
import {test} from 'node:test';
import {makeTrack,targetAt,trackingSeed,TrackingMetrics} from '../lib/tracking.ts';
test('same stage/repeat reproduces fair trajectory; validation repeat changes it',()=>{
 const a=makeTrack(trackingSeed('复测',0),15);assert.deepEqual(a,makeTrack(trackingSeed('复测',0),15));assert.notDeepEqual(a,makeTrack(trackingSeed('复测',1),15));
});
test('strafing stays horizontal, continuous, bounded, and contains stops and reversals',()=>{
 for(let seed=1;seed<100;seed++){
 const legs=makeTrack(seed,15);assert.equal(legs.at(-1).end,15);assert.ok(legs.some(l=>l.velocity===0));const moving=legs.filter(l=>l.velocity);assert.ok(moving.some((l,i)=>i&&l.velocity*moving[i-1].velocity<0));
 for(let i=0;i<legs.length;i++){const l=legs[i];assert.ok(l.end>l.start);assert.ok(Math.abs(l.x)<=28.000001);assert.ok(Math.abs(l.x+l.velocity*(l.end-l.start))<=28.000001);if(i){const prev=legs[i-1];assert.ok(Math.abs(l.x-(prev.x+prev.velocity*(prev.end-prev.start)))<1e-9);assert.equal(l.start,prev.end);}}
 for(let t=0;t<=15;t+=.03){const p=targetAt(legs,t);assert.equal(p.y,0);assert.ok(Math.abs(p.x)<=28.000001);}
 }
});
function simulate(error){const legs=makeTrack(631,15),metrics=new TrackingMetrics();for(const [index,leg] of legs.entries()){for(let t=leg.start;t<leg.end;){const end=Math.min(leg.end,t+1/240);metrics.update(leg,index,end,end-t,error,2.5);t=end;}}return metrics.summary();}
test('perfect tracking scores 100 and no tracking scores zero, including missed changes',()=>{
 const ideal=simulate(0),absent=simulate(20);assert.ok(Math.abs(ideal.score-100)<1e-8);assert.equal(ideal.missedTransitions,0);assert.equal(ideal.movingError,0);assert.equal(absent.score,0);assert.equal(absent.reacquireMs,null);assert.equal(absent.missedTransitions,absent.transitions);assert.ok(absent.transitions>0);
});
test('brief target crossings do not count as reacquisition',()=>{
 const m=new TrackingMetrics(),leg={start:1,end:2,x:0,velocity:0};for(let i=0;i<100;i++)m.update(leg,1,1+(i+1)*.01,.01,i%5===0?10:0,2.5);assert.equal(m.summary().reacquireMs,null);assert.equal(m.summary().missedTransitions,1);
});
