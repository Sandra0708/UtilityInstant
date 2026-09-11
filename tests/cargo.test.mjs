import {test} from 'node:test';
import assert from 'node:assert/strict';
import {planCargo,compareCargo,defaultSpace,defaultCargo} from '../lib/cargo.ts';
function check(space,items){const result=planCargo(space,items);for(const p of result.placed){assert.ok(p.x>=space.margin-.001&&p.y>=space.margin-.001);assert.ok(p.x+p.width<=space.width-space.margin+.001);assert.ok(p.y+p.length<=space.length-space.margin+.001);assert.ok(p.z+p.height<=space.height+.001);if(p.z>0)assert.ok(result.placed.some(q=>q!==p&&q.id===p.id&&q.x===p.x&&q.y===p.y&&q.z+q.height===p.z));for(const q of result.placed){if(p===q)continue;assert.ok(p.x+p.width<=q.x+.001||q.x+q.width<=p.x+.001||p.y+p.length<=q.y+.001||q.y+q.length<=p.y+.001||p.z+p.height<=q.z+.001||q.z+q.height<=p.z+.001,'overlap');}}if(space.maxWeight)assert.ok(result.weight<=space.maxWeight+.001);assert.ok(result.volume<=result.capacity+.001);return result;}
test('33 EUR pallets in trailer with 20 mm perimeter margin',()=>{assert.equal(check(defaultSpace,[defaultCargo]).placed.length,33);});
test('mixed sizes, gaps, weight and quantities',()=>{const items=[{...defaultCargo,quantity:22,weight:600},{...defaultCargo,id:'b',name:'Industrial',length:1000,width:1200,quantity:12,weight:450}];const r=check({...defaultSpace,gap:30,maxWeight:12000},items);assert.ok(r.placed.length>0);for(const c of r.counts)assert.equal(c.loaded+c.left,c.requested);});
test('height and door reject cargo; rotation permits narrow door',()=>{assert.equal(check({...defaultSpace,height:1000},[defaultCargo]).placed.length,0);assert.equal(check({...defaultSpace,doorWidth:700},[defaultCargo]).placed.length,0);assert.equal(check({...defaultSpace,doorHeight:1000},[defaultCargo]).placed.length,0);assert.ok(check({...defaultSpace,doorWidth:900},[{...defaultCargo,width:1200,length:800}]).placed.length>0);});
test('stacked identical pallets are supported and respect height/weight',()=>{const r=check({...defaultSpace,length:1300,width:900,height:2500,maxWeight:1500},[{...defaultCargo,quantity:10,levels:3,weight:500,topLoad:1000}]);assert.equal(r.placed.length,2);assert.equal(r.placed[1].z,1200);});
test('invalid imported inputs and boundaries',()=>{for(const quantity of [0,-1,501,1.5])assert.throws(()=>planCargo(defaultSpace,[{...defaultCargo,quantity}]));assert.throws(()=>planCargo(defaultSpace,[{...defaultCargo,name:{}}]));assert.throws(()=>planCargo({...defaultSpace,margin:2000},[defaultCargo]));});
test('multiple bounded mixed layouts never overlap',()=>{for(let k=1;k<=10;k++){const items=Array.from({length:4},(_,i)=>({...defaultCargo,id:String(i),width:600+(i*127+k*31)%600,length:800+(i*137+k*73)%500,height:700+(i*41)%500,quantity:10,levels:i%2+1,weight:100}));check({...defaultSpace,gap:k,maxWeight:20000},items);}});

test('reserved zones never contain pallets; overlapping zones are counted once',()=>{
 const zones=[{id:'a',kind:'blocked',x:0,y:0,width:1000,length:2000},{id:'b',kind:'blocked',x:0,y:1000,width:1000,length:2000}];
 const space={...defaultSpace,zones};const r=compareCargo(space,[defaultCargo]);
 assert.equal(r.reservedFloor,3);assert.ok(r.geometricCount>=r.placed.length);
 for(const p of r.placed)for(const z of zones)assert.ok(p.x+p.width<=z.x||p.x>=z.x+z.width||p.y+p.length<=z.y||p.y>=z.y+z.length);
 assert.ok(Math.abs(r.freeFloor+r.floor+r.reservedFloor-space.width*space.length/1e6)<.001);
 assert.throws(()=>planCargo({...space,zones:[{...zones[0],x:space.width}]},[defaultCargo]));
});
test('operational stacking requires weight, top-load capacity and height/base stability',()=>{
 const space={...defaultSpace,length:1300,width:900,height:4000};const item={...defaultCargo,quantity:3,weight:500,levels:3};
 assert.equal(planCargo(space,[item]).placed.length,1);
 assert.equal(planCargo(space,[{...item,topLoad:500}]).placed.length,2);
 assert.equal(planCargo({...space,maxStackRatio:2},[{...item,topLoad:1000}]).placed.length,1);
 const r=compareCargo({...space,maxWeight:900},[{...item,topLoad:1000}]);assert.equal(r.geometricCount,3);assert.equal(r.placed.length,1);
 assert.equal(planCargo({...space,maxWeight:900},[{...item,weight:0}]).placed.length,0);
});
test('required access uses a connected aisle and blocked aisles do not count',()=>{
 const aisle={id:'aisle',kind:'aisle',x:800,y:0,width:1000,length:6000};
 const space={...defaultSpace,length:6000,width:2600,margin:0,gap:0,zones:[aisle],requireAccess:true};
 const item={...defaultCargo,rotate:false,quantity:20};const r=check(space,[item]);assert.equal(r.placed.length,10);
 const blocked={id:'block',kind:'blocked',x:800,y:0,width:1000,length:300};
 assert.equal(planCargo({...space,zones:[aisle,blocked]},[item]).placed.length,2);
});
