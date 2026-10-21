import assert from 'node:assert/strict';
import {test} from 'node:test';
import {degreesPerCount,resultSettings,convertSensitivity} from '../lib/sensitivity.ts';
test('800 DPI Valorant 0.3 gives 240 eDPI and 0.021 degrees per count',()=>{
 const r=resultSettings('valorant',800,.3);assert.equal(r.edpi,240);assert.equal(r.sensitivity,.3);assert.ok(Math.abs(degreesPerCount('valorant',.3)-.021)<1e-12);
});
test('CS2 1 and Valorant 0.3142857 preserve physical rotation but not eDPI',()=>{
 const val=convertSensitivity('cs2','valorant',1);assert.ok(Math.abs(val-.3142857142857143)<1e-12);assert.ok(Math.abs(degreesPerCount('cs2',1)-degreesPerCount('valorant',val))<1e-12);assert.notEqual(resultSettings('cs2',800,1).edpi,resultSettings('valorant',800,val).edpi);
});
test('recommendation factor affects both eDPI and game sensitivity, not hardware DPI',()=>{
 assert.deepEqual(resultSettings('cs2',800,1,.85),{game:'cs2',edpi:680,sensitivity:.85,dpi:800});
 assert.equal(resultSettings('cs2',1600,.425).edpi,680);
});
test('invalid values cannot produce a report',()=>{for(const value of [0,-1,NaN,Infinity])assert.throws(()=>resultSettings('cs2',value,1));});
