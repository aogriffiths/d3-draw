test( "Underscore", function() {
  ok(_, "Underscore is here." );
});

test( "Backbone", function() {
  ok(Backbone, "Backbone is here." );
});

test( "JQuery", function() {
  ok($, "JQuery is here." );
});

test( "D3Draw", function() {
  ok(D3Draw, "D3Draw is here." );
});

test( "One:one, same object, same property", function() {
  var Person = Class.extend({});
  Person.addProperties({
    bestFriend: {type:'ONE', to:{property_name:'bestFriend', class:Person}},
  });
  
  var bill = new Person();
  var ben = new Person();
  
  bill.setBestFriend(ben);
  
  strictEqual(ben.getBestFriend(), bill, "It worked" );   
});

test( "One:one, same object, same property - test events", function() {
  expect(2);
  var Person = Class.extend({});
  Person.addProperties({
    bestFriend: {type:'ONE', to:{property_name:'bestFriend', class:Person}},
  });
  
  var bill = new Person();
  var ben = new Person();  
  
  Person.mixin(Backbone.Events);
  bill.on('change', function(changed){
    console.log('bill changed');
    strictEqual(changed, bill, 'bill changed');
  })

  ben.on('change', function(changed){
    console.log('ben changed');
    strictEqual(changed, ben, 'ben changed');
  })
  
  bill.setBestFriend(ben);
});

test( "One:one, same object, different property", function() {
  var Person = Class.extend({});
  Person.addProperties({
    husband: {type:'ONE'}, 
    wife: {type:'ONE', to:{property_name:'husband', class:Person}},
  });
  
  var joseph = new Person();
  var mary = new Person();
  
  //Setting by Wife
  joseph.setWife(mary);  
  strictEqual(mary.getHusband(), joseph, "Setting by Wife" );

  var victoria = new Person();
  var albert = new Person();
  
  //Setting by Husband
  victoria.setHusband(albert);  
  strictEqual(albert.getWife(), victoria, "Setting by Husband" );

  //Changing by Husband
  victoria.setHusband(joseph);  
  strictEqual(joseph.getWife(),  victoria, "Changing by Husband, check wife" );
  strictEqual(albert.getWife(),  null,     "Changing by Husband, check ex husband" );
  strictEqual(mary.getHusband(), null,     "Changing by Husband, check ex wife" );

  joseph.setWife(mary);  
  victoria.setHusband(albert);  

  //Changing by Wife
  albert.setWife(mary);  
  strictEqual(mary.getHusband()      , albert, "Changing by Wife, check husband" );
  strictEqual(victoria.getHusband()  , null,   "Changing by Wife, check ex husband" );
  strictEqual(joseph.getWife()       , null,   "Changing by Wife, check ex wife" );

});

test( "One:one, different object", function() {
  var Pet = Class.extend({});
  Pet.addProperties({
    owner: {type:'ONE'}
  });

  var Person = Class.extend({});
  Person.addProperties({
    pet: {type:'ONE', to:{property_name:'owner', class:Pet}},
  });
  
  var jake = new Person();
  var shep = new Pet();
  
  //Setting by pet
  jake.setPet(shep);
  
  strictEqual(shep.getOwner(), jake, "Shep belongs to Jake" );
  strictEqual(jake.getPet(),   shep, "Jake owns Shep" );

  //null by pet
  jake.setPet(null);

  strictEqual(shep.getOwner(), null, "Shep run's away" );
  strictEqual(jake.getPet(),   null, "Jake has lost shep" );

  //Setting by owner
  shep.setOwner(jake);

  strictEqual(shep.getOwner(), jake, "Shep belongs to Jake again" );
  strictEqual(jake.getPet(),   shep, "Jake owns Shep again" );

});

test( "One:many, same object - lead by one side", function() {
  var Region = Class.extend({});
  Region.addProperties({
    name:      {type:'ONE'},
    belongsTo: {type:'ONE'},
    region:    {type:'MANY', to:{property_name:'belongsTo', class:Region}}
  });

  var london   = new Region({name:'London'});
  var stepney  = new Region({name:'Stepney'});
  var chiswick = new Region({name:'Chiswick'});
  var docks    = new Region({name:'Docks'});
  var bristol  = new Region({name:'Bristol'})
  
  london.addRegion(stepney);
  london.addRegion(chiswick);
  london.addRegion(docks);
      
  ok(stepney.getBelongsTo() === london,  "Checking stepney belongs to london" );
  ok(chiswick.getBelongsTo() === london, "Checking chiswick belongs to london" );
  ok(docks.getBelongsTo() === london,    "Checking docks belongs to london" );

  ok(london.hasRegion(docks),  "Checking docks are in london" );
  //move the docks to bristol.
  bristol.addRegion(docks);
  ok(docks.getBelongsTo() === bristol,  "Checking docks now belong to bristol" );
  ok(! london.hasRegion(docks),  "Checking docks are NOT in london" );

});

test( "One:many, same object - lead by many side", function() {
  var Region = Class.extend({});
  Region.addProperties({
    name:      {type:'ONE'},
    belongsTo: {type:'ONE'},
    region:    {type:'MANY', to:{property_name:'belongsTo', class:Region}}
  });
  
  var london   = new Region({name:'London'});
  var stepney  = new Region({name:'Stepney'});
  var chiswick = new Region({name:'Chiswick'});
  var docks    = new Region({name:'Docks'});
  var bristol  = new Region({name:'Bristol'})
  
  stepney.setBelongsTo(london);
  chiswick.setBelongsTo(london);
  docks.setBelongsTo(london);
      
  ok(london.hasRegion(stepney),  "Checking stepney belongs to london" );
  ok(london.hasRegion(chiswick), "Checking chiswick belongs to london" );
  ok(london.hasRegion(docks),    "Checking docks belongs to london" );

  ok(docks.getBelongsTo() === london,  "Checking docks are in london" );
  //move the docks to bristol.
  docks.setBelongsTo(bristol); 
  ok(bristol.hasRegion(docks),  "Checking docks now belong to bristol" );
  ok(docks.getBelongsTo() !== london,  "Checking docks are NOT in london" );

});


test( "Many:many, same object", function() {
  var Food = Class.extend({});
  Food.addProperties({
    name:      {type:'ONE'},
    goodWith:  {type:'MANY', to:{property_name:'goodWith', class:Food}}
  });
  
  var fries        = new Food({name:'fries'});
  var ketchup      = new Food({name:'ketchup'});
  var scrambledegg = new Food({name:'scrambledegg'});

  ketchup.addGoodWith(fries);
  ok(fries.hasGoodWith(ketchup),  "Fries are good with ketchup" );
  ok(ketchup.getGoodWith().length === 1, "That's one thing" );  
  
  ketchup.addGoodWith(scrambledegg);
  ok(scrambledegg.hasGoodWith(ketchup),  "Scramled Egg is good with ketchup" );  
  ok(ketchup.getGoodWith().length === 2, "That's two things" );  
  ok(! scrambledegg.hasGoodWith(fries),  "Scramled Egg is not good with fries" );

  ok(ketchup.hasGoodWith(fries),        "Ketchup is good with both fries..." );  
  ok(ketchup.hasGoodWith(scrambledegg), "...and Scramled Egg" );  
  ok(ketchup.getGoodWith().length === 2, "That's two things" );  

  ketchup.remGoodWith(scrambledegg);
  ok(! scrambledegg.hasGoodWith(ketchup),  "I changed my mind. Ketchup is not good with scrambled egg." ); 
  ok(ketchup.getGoodWith().length === 1, "That's one thing" );  
});

test( "Static Properties", function() {
  var Train = Class.extend({});
  Train.addProperties({
    name:          {type:'ONE'},
    regulationMet: {type:'MANY'}
  });
  Train.addStaticProperties({
    regulation:      {type:'MANY'}
  });
  
  Train.mixin({
    passrate: function(){
      var that = this, pass = 0, total = 0;
      this.static.getRegulation().forEach(function(value){
        var key = Object.keys(value)[0];
        var met = false;
        that.getRegulationMet().forEach(function(key2){
          if(key2 == key) met = true;
        })
        total ++;
        if(met) pass ++;
      });
      return pass / total;
    }
  });
  
  Train.addRegulation({a:'Driver can see where they are going.'});
  Train.addRegulation({b:'Driver can stop the train in a safe distance.'});
  Train.addRegulation({c:'Runs on electricity.'});

  scotsman = new Train({name:'Flying Scotsman'});

  scotsman.addRegulationMet('a');
  scotsman.addRegulationMet('b');
  strictEqual(scotsman.passrate(), 2/3, "two out of three regulations met")

});

test( "D3 Draw basics", function() {
  var d3draw = new D3Draw();
  equal(d3draw.getChildController()[0].name, 'deselect', 'cool');
});

var filter_no_id = function(a){
  if(typeof a[1] === 'object'){
    if(a[1].id != undefined){
      return a;
    } 
  }
}

/*
 * flatten takes a node in JsonML format:
 *   node = [name, attributes?, nodes* | stringvalue*]  //see note re attributes below
 * and flattens the herichy of child nodes to give:
 *   flattened = [ flatnode* ] 
 * where each flatnode look like:
 *   [name,        id, parentid, possition, attributes?]  //element nodes
 *   or
 *   [stringvalue, id, parentid, possition]        //string nodes
 *   
 * Note re attributes: nodes can only be flattened if they have an id attribute. 
 * So while attributes is not mandatory in JsonML any node without them will be 
 * ignored by this function.
 * 
 * 
 */

function flatten(node, flattened, parentid, i){  
  if(!flattened) flattened = [];
  if(!parentid) parentid = null;
  if(!i) i = 0;
  var flatnode = [];
  var nodeid = null;
  var isElementNode = false;
  if(Array.isArray(node)){     //this is an element node
    isElementNode = true;
    var attributes = node[1];
    if(typeof attributes === 'object') nodeid = attributes.id;    
    if(nodeid === null || nodeid === undefined) return;    
    var attributes2 = removeid(attributes);
    flatnode = flatnode.concat([node[0], nodeid, parentid, i]);
    if(attributes2) flatnode.push(attributes2);          
  }else{                       //this is a text node
    nodeid = parentid + '_text_' + i;
    flatnode = flatnode.concat([node   , nodeid, parentid, i]);
  }
  flattened.push(flatnode);
  if(isElementNode){           //deal with children
    //Must be slice(2) becuase we will only have got 
    //this far if the first two elements were a node name and attributes.
    var children  = node.slice(2); 
    if(children){
      var j = 0;
      children.forEach(function (node2){   
        flatten(node2, flattened, nodeid, j++);
      });
    }
  }
  return flattened;
}

function index(flattened){
  var indexed = {};
  var i = 0;
  flattened.forEach(function(flatnode){
    var nodeid = flatnode[1];
    var therest = flatnode.slice(0,1).concat([i]).concat(flatnode.slice(2));
    indexed[nodeid] = therest;
    i++;
  });
  return indexed;
}

function removeid(attributes){
  var attributes2 = {};
  var gotone = false;
  Object.keys(attributes).forEach(function(attribute){
    if(attribute != 'id'){
      attributes2[attribute] = attributes[attribute];
      gotone = true;
    }
  });
  if(gotone){
    return attributes2
  }else{
    return null;
  }
}

function diffkeys(obj1,obj2){
  var keys1 = Object.keys(obj1);
  var keys2 = Object.keys(obj2);
  var left = [], both = [], right = [];
  
  keys1.forEach(function(key1){
    if(obj2[key1]){
      both.push(key1);
    }else{
      left.push(key1);      
    }
  });
  
  keys2.forEach(function(key2){
    if(!obj1[key2]){
      right.push(key2);      
    }
  });
  return {left:left,both:both,right:right};
}

function diff(flatjson1, flatjson2){
  var index1 = index(flatjson1);
  var index2 = index(flatjson2);
  var diff = diffkeys(index1,index2);
  
}

var xmlText1 = 
  '<svg id="A"><g id="B"><rect id="C" x="1" y="2" width="3" height="4"></rect></g></svg>';
var jsonExpected1 = 
  ['svg', {id:"A"},
    ['g', {id:"B"},
      ['rect',{x:"1",y:"2",width:"3", height:"4", id:"C"}]]];
var jsonFlattened1 = {
    A:['svg' , 0, null, 0 ],
    B:['g'   , 1, 'A' , 0 ],
    C:['rect', 2, 'B' , 0, {x:"1", y:"2",  width:"3", height:"4"}]
  }


var xmlText2 =
  '<svg id="A"><g id="B"><rect x="1" y="2" width="3" height="4"></rect></g></svg>';
var jsonExpected2 = 
  ['svg', {id:"A"},
    ['g', {id:"B"}]];

var xmlText3 = 
  '<svg id="A"><g id="B"><rect id="C" x="1" y="2" width="3" height="4"></rect><rect id="D" x="1" y="14" width="3" height="4"></rect></g></svg>';
var jsonExpected3 = 
  ['svg', {id:"A"},
    ['g', {id:"B"},
      ['rect',{x:"1", y:"2",  width:"3", height:"4", id:"C"}],
      ['rect',{x:"1", y:"14", width:"3", height:"4", id:"D"}] ]];
var jsonFlattened3 = [
    ['svg' , 'A', null, 0 ],
    ['g'   , 'B', 'A' , 0 ],
    ['rect', 'C', 'B' , 0, {x:"1", y:"2",  width:"3", height:"4"} ],
    ['rect', 'D', 'B' , 1, {x:"1", y:"14", width:"3", height:"4"} ]];
var jsonIndexed3 = {
  A:['svg' ,  0 , null, 0 ],
  B:['g'   ,  1 , 'A' , 0 ],
  C:['rect',  2 , 'B' , 0, {x:"1", y:"2",  width:"3", height:"4"}],
  D:['rect',  3 , 'B' , 1, {x:"1", y:"14", width:"3", height:"4"}]};

var xmlText4 = 
  '<svg id="A"><g id="B"><rect id="D" x="1" y="14" width="3" height="4"></rect><rect id="C" x="1" y="2" width="3" height="4"></rect></g></svg>';
var jsonExpected4 = 
  ['svg', {id:"A"},
    ['g', {id:"B"},
      ['rect',{x:"1", y:"14",  width:"3", height:"4", id:"D"}],
      ['rect',{x:"1", y:"2", width:"3", height:"4", id:"C"}] ]];
var jsonFlattened4 = [
    ['svg' , 'A', null, 0 ],
    ['g'   , 'B', 'A' , 0 ],
    ['rect', 'D', 'B' , 0, {x:"1", y:"14", width:"3", height:"4"} ],
    ['rect', 'C', 'B' , 1, {x:"1", y:"2",  width:"3", height:"4"} ]];
var jsonIndexed4 = {
  A:['svg' ,  0 , null, 0 ],
  B:['g'   ,  1 , 'A' , 0 ],
  D:['rect',  2 , 'B' , 0, {x:"1", y:"14", width:"3", height:"4"} ],
  C:['rect',  3 , 'B' , 1, {x:"1", y:"2",  width:"3", height:"4"} ]};


test("JSONML full 1", function(){
  var json1 = JsonML.fromXMLText(xmlText1, filter_no_id);
  deepEqual(json1, jsonExpected1, "JSON equal")
});

test("JSONML filtered 2", function(){
  var json2 = JsonML.fromXMLText(xmlText2, filter_no_id);
  deepEqual(json2, jsonExpected2, "JSON equal")
});

test("JSONML full 3", function(){
  var json3 = JsonML.fromXMLText(xmlText3, filter_no_id);
  deepEqual(json3, jsonExpected3, "JSON equal")
});

test("Test flattened 1", function(){
  var json1 = JsonML.fromXMLText(xmlText1, filter_no_id);
  var flat1 = index(flatten(json1));
  deepEqual(flat1, jsonFlattened1, "JSON equal")
});

test("Test flattened 3", function(){
  var json3 = JsonML.fromXMLText(xmlText3, filter_no_id);
  var flat3 = flatten(json3);
  var index3 = index(flat3);
  deepEqual(flat3, jsonFlattened3, "flat JSON equal");
  deepEqual(index3, jsonIndexed3, "indexed JSON equal");
});

test("Test flattened 4", function(){
  var json4 = JsonML.fromXMLText(xmlText4, filter_no_id);
  var flat4 = flatten(json4);
  var index4 = index(flat4);
  deepEqual(flat4, jsonFlattened4, "JSON equal");
  deepEqual(index4, jsonIndexed4, "JSON equal")
});

test("diff", function(){
  var diff = diffkeys({a:1,b:2},{b:2,c:3});
  deepEqual(diff, {left:['a'],both:['b'],right:['c']}, "diffed")
});
/*    c = offsets(a)
 *    A   B  0         1         2         3         4
 *           eq0       rm1       mv2-1     in2 E     eq3-3
 *           ab++      a++       ab++????  b++       ab++=>done
 *                     o1--      o3--      o1++
 *                               o1++  
 *    _   _  _______   _______   _______   _______   _______
 *0   A   A  1AaAbcA   1A A  A.  1A A  A.  1A A  A.  1A A  A. 
 *1   B   D  1B D  B   1BaDbcB   0B DbcC.  1B D  D.  2B B  D.
 *2   C   E  1C E  C   1C E  C   1CaE  D   1C EbcC.  1C E  E.
 *3   D   C  1D C  D   1D C  D   1D*C      0DaC      0DaCbcC.
 *
 */

/*    c = offsets(a)
 *    A   B  0         1          4
 *           eq0       mv2-1      eq2-2
 *           ab++      ab++       ab++=>done
 *                     o1--       
 *                               
 *    _   _  _______   _______   _______   
 *0   A   A  1AaAbcA   1A A  A.  2A A  A. 
 *1   B   C  1B D  B   1BaCbcC   1BaC  C.  
 *2   C   B  1C E  C   1C*B  B   0C BbcB. 
 * 
 */

function tohere(vector, pos){
  if(pos==0) return 0;
  return  vector.slice(0,pos).reduce(function(p,c){return p+c});
}
function newdiff(flatA, indexA, flatB, indexB){
  var ia = ib = 0;
  var ops = [];

  var offsets = [];
  for(var i = 0; i<flatA.length; i++){
    offsets.push(1);
  }

  // invarient: ops, applied in order, to flatA[0..ia] results in flatB[0..ib]  
  // (true at the end of each loop).
      
  // invarient: if ops were applied to flatA to give flatA'
  // for i = 0..flatA.length 
  // flatA'[sum(offsets, 0..i)-1] = flatA[i]
  
  // offsets[i] represents the number of indicies the value of flatA[i] is away from
  // the value of flatA[i-1] in flatA'. If 0 flatA[i] does no exist in flatA'.
  
  while(ib < flatB.length || ia < flatA.length ){
    
    //iterate 
    var nodeB = flatB[ib];
    var nodeA = flatA[ia];
    var idA   = nodeA ? nodeA[1] : undefined;
    var idB   = nodeB ? nodeB[1] : undefined;
    if(idA == idB){ 
      //nodeA and nodeB match, check for change
      ops.push({op:'eq', from:tohere(offsets, ia), to:ib});
      ia++;
      ib++;
    }else{ 
      //nodeA and nodeB do not match  
      nodeBAlsoInA = idB != undefined ? indexA[idB] : undefined;
      nodeAAlsoInB = idA != undefined ? indexB[idA] : undefined;
      
      
      //Deal with deletes and inserts first:
      
      //check - if nodeA is not in B => nodeA was deleted. 
      //DELETE
      if(nodeA && !nodeAAlsoInB ){
        ops.push({op:'rm', from:tohere(offsets, ia)});
        offsets[ia]--;
        ia++;
      }else
      
      //check - if nodeB is not in A => nodeB is new
      //INSERT
      if(nodeB && !nodeBAlsoInA){
        ops.push({op:'in', to:ib, data:nodeB});
        offsets[ia]++;
        ib++;
      }else
      
      //check - if nodeA elsewhere in B => nodeB has been moved to this possition
      //MOVE
      if(nodeB && nodeBAlsoInA){   
        //record the move of nodeB, from where it was in A to where it is now in B.
        ops.push({op:'mv', from:tohere(offsets, nodeBAlsoInA[1]), to:ib});
        //when nodeB is reached in A, if it hasn't been alreay, it will be along side a different node from B
        //that nodeB will either be a MOVE or INSERT itself. INSERTS take care of themselves, it it is a MOVE
        //we will be back at this line of code again...
        offsets[ia]++;
        offsets[nodeBAlsoInA[1]]--;
        ib++;
        ia++ // ignore a, it will get picked up separately...
      }
      
      // if nodeB is elsewhere in A it will have already got picked up or get picked up later 
      // so no need to check if(nodeBAlsoInA).
      

    }
  }
  return ops;
}

test("diff 2", function(){
  var json1 = JsonML.fromXMLText(xmlText1, filter_no_id);
  var json4 = JsonML.fromXMLText(xmlText4, filter_no_id);
  var flat1 = flatten(json1);
  var flat4 = flatten(json4);
  var index1 = index(flat1);
  var index4 = index(flat4);

  var diff = diffkeys(index1,index4);

  deepEqual(diff, {left:[],both:['A','B','C'],right:['D']}, "diffed")
  
  var a = newdiff(flat1,index1,flat4,index4);
  console.log(a);
  console.log(JSON.stringify(a));
});

function insertA(arr, pos, d){
  return arr.slice(0, pos).concat( [d] ).concat(arr.slice(pos));
}
function removeA(arr, pos){
  return arr.slice(0, pos).concat(arr.slice(pos+1));
}

function execdiff(ops, arr){
  var a = [];
  arr.forEach(function(i){
    a.push(i);
  })
  ops.forEach(function(op){
    d = a[op.from];
    if(op.op == "rm" || op.op == "mv"){
      a = removeA(a, op.from);
    }
    if(op.op == "in" || op.op == "mv"){
      offset = 0;
      if(op.op == "mv" && op.from < opt.to){
        offset = -1;
      }
      a = insertA(a, op.to + offset, op.data);
    }
  })
  return a;
}


test("diff replace", function(){
  var x1="";
  var x2="";
  x1 += "<a id='a'>";
  x1 += "<b id='b'/>";
  x1 += "</a>";
    
  x2 += "<a id='a'>";
  x2 += "<c id='c'/>";
  x2 += "</a>";

  var jsonA = JsonML.fromXMLText(x1, filter_no_id);
  var jsonB = JsonML.fromXMLText(x2, filter_no_id);
  var flatA = flatten(jsonA);
  var flatB = flatten(jsonB);
  var indexA = index(flatA);
  var indexB = index(flatB);

  //var diff = newdiff(flatA,indexA,flatB,indexB);

  deepEqual(diff[0].op, "eq");
  deepEqual(diff[1].op, "rm");
  deepEqual(diff[2].op, "in");
  deepEqual(diff[3], undefined); 
  deepEqual( execdiff(diff, flatA), flatB );

});

test("diff move", function(){
  var x1="";
  var x2="";
  x1 += "<a id='a'>";
  x1 += "<b id='b'/>";
  x1 += "<c id='c'/>";
  x1 += "</a>";
    
  x2 += "<a id='a'>";
  x2 += "<c id='c'/>";
  x2 += "<b id='b'/>";
  x2 += "</a>";

  var jsonA = JsonML.fromXMLText(x1, filter_no_id);
  var jsonB = JsonML.fromXMLText(x2, filter_no_id);
  var flatA = flatten(jsonA);
  var flatB = flatten(jsonB);
  var indexA = index(flatA);
  var indexB = index(flatB);

  //var diff = newdiff(flatA,indexA,flatB,indexB);
  console.debug(diff);
  deepEqual(diff[0].op, "eq");
  deepEqual(diff[1].op, "mv");
  deepEqual(diff[2], undefined);
  deepEqual( execdiff(diff, flatA), flatB );
});

function zz(){
  a = [1,2,3];
  a.reduce(function(a,b,c,d){
    console.log(a,b,c,d);
    return;
  });
}


