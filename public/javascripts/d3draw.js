//A useful addition to Array done globally for now...
Array.prototype.remove = function() {
  var what, a = arguments, L = a.length, ax;
  while (L && this.length) {
      what = a[--L];
      while ((ax = this.indexOf(what)) !== -1) {
          this.splice(ax, 1);
      }
  }
  return this;
};

Array.prototype.contains = function(what) {
  return (this.indexOf(what) !== -1);
};

/* Simple JavaScript Inheritance
 * Originally by John Resig http://ejohn.org/
 * MIT Licensed.
 * With modifications by Adam Griffiths
 * MIT Licensed.
 */
// Inspired by base2 and Prototype
(function(){
  
  var initializing = false;
  var fnTest = /xyz/.test(function(){xyz;}) ? /\b_super\b/ : /.*/;
  
  // Create a new Class that inherits from this class
  function extend(prop) {
    //var _superClass = this;
    var _super = this.prototype;
   
    // Instantiate a base class (but only create the instance,
    // don't run the init constructor)
    initializing  = true;
    var prototype = new this();
    initializing  = false;    
   
    // Copy the properties over onto the new prototype
    for (var name in prop) {
      // Check if we're overwriting an existing function
      prototype[name] = 
        typeof prop[name] == "function" &&    //IF this prop is a function 
        typeof _super[name] == "function" &&  //AND the _super prop is a function
        fnTest.test(prop[name])               //AND the prop function refers to _super.
        //THEN
        ? (function(name, fn){
          return function() {
            var tmp = this._super;
           
            // Add a new ._super() method that is the same method
            // but on the super-class
            this._super = _super[name];
           
            // The method only need to be bound temporarily, so we
            // remove it when we're done executing
            var ret = fn.apply(this, arguments);        
            this._super = tmp;
           
            return ret;
          };
        })(name, prop[name]) 
        //ELSE
        : prop[name];
    }
    
    prototype._initAlways = function(){
      if(prototype.initAlways) prototype.initAlways.apply(this, arguments);
      if(_super._initAlways) _super._initAlways.apply(this, arguments);
    }
   
    // The dummy class constructor
    function Class() {
      // All construction is actually done in the init method
      if ( !initializing ){
        this._initAlways.apply(this, arguments);
        if(this.init) this.init.apply(this, arguments);
      }
    }
   
    // Populate our constructed prototype object
    Class.prototype = prototype;
        
    // Enforce the constructor to be what we expect
    Class.prototype.constructor = Class;

    // static is an alias for the Class
    Class.prototype.static = Class;
    
    // Copy the class level properties over to the new class
    BaseClass = this;
    Object.keys(BaseClass).forEach(function(prop){
      if(typeof BaseClass[prop] == "function"){
        Class[prop] = BaseClass[prop];        
      }else{
        //deep clone
        Class[prop] = BaseClass[prop];
      }
    });    
   
    return Class;
  };
  
  //The base Class implementation (does nothing)
  this.Class = function(){};
 
  Class._property_options = {};

  Class.extend = extend;
  
  function cleanUp(properties, clazz){
    if(!clazz._properties) clazz._properties = {};
    Object.keys(properties).forEach(function(key){
      var prop = properties[key];
      if(typeof prop != 'object'){
        properties[key] = {type:prop};
        prop = properties[key];
      }
      //Defaults
      prop.property_name    = prop.property_name    || key;
      prop.type             = prop.type             || 'ONE';
      prop.private_name     = prop.private_name     || '_' + prop.property_name;
      prop.base_method_name = prop.base_method_name || prop.property_name.charAt(0).toUpperCase() + prop.property_name.slice(1);
      prop.events           = prop.events           || true;
      
      //Method names:
      prop.method_name      = {};
      prop.method_name.prop   = 'prop' + prop.base_method_name;
      prop.method_name.root   = prop.base_method_name;      
      prop.method_name.get  = 'get' + prop.base_method_name;
      if(prop.type === 'ONE'){
        prop.method_name.set  = 'set' + prop.base_method_name;
      }else if(prop.type === 'MANY'){
        prop.method_name.add  = 'add' + prop.base_method_name;
        prop.method_name.rem  = 'rem' + prop.base_method_name;        
        prop.method_name.has  = 'has' + prop.base_method_name;
      }

      //Actual methods:
      prop.method           = {};
      prop.class = clazz;                            //link the properties to the class
      clazz._properties[prop.property_name] = prop;  //and visa versa
      
      //store these cleaned up options against the class
      ///TODO.... _class._prop[prop.property_name] = prop;
    });
  }

  
  function linkToRelationships(properties){
    Object.keys(properties).forEach(function(key){
      var prop = properties[key];

      //prop.to can define the other end of a relationship or be undefined.
      //if it is defined on this end, the following code forces the definition
      //on the other end to point back to this end:
      if(prop.to){
        if(prop.to.property_name && prop.to.class){
          to_prop = prop.to.class._properties[prop.to.property_name];
          to_prop.to = prop;
          prop.to = to_prop;
        }else{
          throw new Error('"to:" should include a property_name and a class');
        }
      }
    });
  }
  
  Class.addStaticProperties = function(props){
    this.addProperties(props, {classProperty:true});
  }
  
  Class.addProperties = function(properties, opts){
    var target =
      (opts && opts.classProperty) ?
      this :           //Class properties
      this.prototype ; //Prototype properties
        
    cleanUp(properties, this);
    linkToRelationships(properties);
    
    Object.keys(properties).forEach(function(key){
      var prop = properties[key];
            
      //Add events code if it is not already there
      target.changed = changed;
      
      //BOTH SINGLE AND COLLECTIONS
      target[prop.method_name.prop] = prop.method.prop = prop;
      target[prop.method_name.get]  = prop.method.get = getter(prop);
      
      //SINLGE VALUES
      if(prop.type == "ONE"){        
        target[prop.method_name.set]  = prop.method.set = setter(prop);
        target[prop.method_name.root] = prop.method.root = root(prop);
      }
      
      //COLLECTIONS
      else if(prop.type == "MANY"){
        target[prop.method_name.add] = prop.method.add = adder(prop);
        target[prop.method_name.rem] = prop.method.rem = remover(prop);
        target[prop.method_name.has] = prop.method.has = has(prop);
      }
    })    
  }
  
  function changed(property_name){
    if(this.trigger){
      this.trigger('change', this);
      this.trigger('change:' + property_name, this);
    }
  }
  //creates a property setter, based on the options provided in prop.
  //(for properties of type 'ONE', i.e. sets a single value).
  function setter(prop){
    return function(new_value, flags){
      flags = flags || {};
      //set the value directly, keep the old_value in case we need it.
      var old_value = this[prop.private_name];
      if (new_value === old_value) return;
      
      this[prop.private_name] = new_value;
      
      //if the property has a relationship 'to' another property 
      //and it's not been flagged to be ignored
      if(prop.to && ! flags.ignore_to){
        //switch to the type of the 'to' property 
        switch(prop.to.type){
        case 'ONE': //ONE to ONE
          if(new_value && !flags.ignore_new) prop.to.method.set.call(new_value, this, {ignore_new:true}); 
          if(old_value && !flags.ignore_old) prop.to.method.set.call(old_value, null, {ignore_old:true});   
          break;
        case 'MANY': //ONE to MANY
          if(new_value && !flags.ignore_new) prop.to.method.add.call(new_value, this, {ignore_new:true}); //d.set(a)
          if(old_value && !flags.ignore_old) prop.to.method.rem.call(old_value, this, {ignore_new:true,ignore_old:true}); //b.set(null)
          break;
        }
      }
      if(prop.events) this.changed(prop.method_name);
    }
  }
  
  function getter(prop){
    return function(){
      if(!this[prop.private_name] && prop.type === 'MANY') this[prop.private_name] = [];
      return this[prop.private_name];
    }
  }
  
  function has(prop){
    return function(value){
      return (
        this[prop.private_name] ?
        this[prop.private_name].contains(value) :
        false );
    }
  }
  
  function root(prop){
    return function(value){
      if(value === undefined){
        return 
        prop.methods.get.apply(this,[].slice.call(arguments,0));  
      }else{
        prop.methods.set.apply(this,[].slice.call(arguments,0));  
      }
    };     
  }
  
  function adder(prop){
    return function(new_value, flags){
      flags = flags || {};
      if(!this[prop.private_name]) this[prop.private_name] = [];
      this[prop.private_name].push(new_value);
      if(prop.to && ! flags.ignore_to){
        switch(prop.to.type){
        case 'ONE': //MANY-ONE
          if(new_value && !flags.ignore_add) prop.to.method.set.call(new_value, this, {ignore_new:true}); 
          break;
        case 'MANY': //MANY-MANY
          if(!flags.ignore_add){
            if(new_value) prop.to.method.add.call(new_value, this, {ignore_add:true});
          }
          break;
        }
      }
      if(prop.events) this.changed(prop.method_name);
    };
  }
  
  function remover(prop){
    return function(old_value, flags){
      flags = flags || {};
      if(!this[prop.private_name]) this[prop.private_name] = [];
      this[prop.private_name].remove(old_value);
      if(prop.to && ! flags.ignore_to){
        switch(prop.to.type){
        case 'ONE': //MANY-ONE
          if(old_value && !flags.ignore_old) prop.to.method.set.call(old_value, null, {ignore_old:true});
          break;
        case 'MANY': //MANY-MANY
          if(old_value && !flags.ignore_old) prop.to.method.rem.call(old_value, this, {ignore_old:true});
          break;
        }
      }
      if(prop.events) this.changed(prop.method_name);
    };
  }

  Class.mixin = function(source){
    _.extend(this.prototype, source);
  }
  
  Class = Class.extend({
    initAlways: function(props){
      that = this;
      if(!props) return;
      Object.keys(props).forEach(function(property_name){
        var value = props[property_name];
        var prop = that.constructor._properties[property_name];
        if(prop){
          that[prop.private_name] = value;
        }else{
          that[property_name] = value;
        }

      });
    }
  });

})();
//End Simple JavaScript Inheritance by John Resig

//Universal Module Defination (UMD) which allows you to include
//D3Draw using Node, AMD (like Require.js) lor Browser Globals.
//see https://github.com/umdjs/umd/blob/master/returnExports.js

//Define an anonymous UMD function(root, factory) 
(function (root, factory) {
  //Only to variables need to be set for this generic UMD function to work
  
  //1. The dependencies that factory requires, in order.
  //As used by Node & AMD:
  var dependencies = ['d3','underscore','Backbone'];
  //As used by Browser Globals:
  var dependenciesBG = ['d3','_','Backbone'];
  
  //2. A global name, only used for Browser Globals.
  var globalName = 'D3Draw';
  
  //The rest of this UMD functin is generic, and should work for any library
  if (typeof exports === 'object') {
    // ~~~ Node ~~~ 
    // Does not work with strict CommonJS, but
    // only CommonJS-like enviroments that support module.exports,
    // like Node.
    var resolvedDependencies = [];
    dependencies.forEach(function(dependency){
      resolvedDependencies.push(require(dependency));
    });
    module.exports = factory.apply(undefined,resolvedDependencies);
  } else if (typeof define === 'function' && define.amd) {
    // ~~~ AMD ~~~
    // Register as an anonymous module.
    define(dependencies, factory);
  } else {
    // ~~~ Browser Globals ~~~
    // Root is window
    var resolvedDependencies = [];
    dependenciesBG.forEach(function(dependency){
      resolvedDependencies.push(root[dependency]);
    });
    root[globalName] = factory.apply(undefined,resolvedDependencies);
  }
}
//END the UMD function definition

//Immediately execute the UMD function(root, factory) 
(/*root=*/ this, /*factory=*/ function (d3, _, Backbone) {
  //At last! The boiler plate stuff is over with, from here on this is the
  //D3Draw library proper.
  
  var Controller = Class.extend({
    initAlways: function(){
      var that = this;
      this.static.getDefaultSubControllerClass().forEach(function(Class){
        var a = new Class()
        that.addChildController(a);
        console.log('adding ' + a.getName());
      })
    },
    
    init: function(){
    }
  });
  
  Controller.addProperties({
    name:             {type:'ONE'}, 
    parentController: {type:'ONE'}, 
    childController:  {type:'MANY', to:{property_name:'parentController', class:Controller}}
  });
  
  Controller.addStaticProperties({
    defaultSubControllerClass: 'MANY'
  });
  
  Controller.mixin(Backbone.Events);


  
  var D3Draw = Controller.extend({
    initAlways: function(){
      console.log('D3Draw');
    },

    init: function(){

    },    
  });
  
  D3Draw.Controller =  Controller;
  
  var DeSelect = Controller.extend({
    name: 'deselect',
    start: function(){
      clear_select();
    }
  });
  
  D3Draw.addDefaultSubControllerClass(DeSelect);
  
  return D3Draw;
}));

//wont execute:
function dontrun(){

define(["d3","underscore","backbone","jsonml/jsonml-xml","jsondiffpatch.min"], function(d3, _, Backbone, JsonML, jsondiffpatch) {

/* EXAMPLE, rarely need to override constructor.
 ExtendedModel = Backbone.Model.extend({
    constructor: function(attributes, options){
      console.log(1);
      Backbone.Model.prototype.constructor.call(this, attributes, options);
    },
    initialize: function(){
      console.log(2);
    } 
  });  
 */
  
  var d3draw = {};
  d3draw.tools = {};  
  var currentTools = [];
  var clickCollector = {};

  
  // Tool
  // ----
  var Tool = Backbone.Model.extend({   
    defaults: {},
    
    constructor: function(attributes, options){
      var that = this;
      _.forEach(this.config, function(value, key){
        if(!that[key]){
          that[key] = function(arg){
            if(arg === undefined){
              return that['_'+key];
            }else{
              that['_'+key] = arg;
              return that;
            }
          }
        }
      });
      Backbone.Model.prototype.constructor.call(this, attributes, options);
      if(this.get("activated") === undefined){
        this.set("activated") = false;
      }
    },
    
    // If overriden should call this parent initializer with:
    // D3Draw.Tool.prototype.initialize.apply(this, arguments);
    initialize: function(attributes, options){
      //Ensure this has a unique name and id;
      var name = this.get('name') || this.name;
      if(!name){
        name = 'unnamed';
      }
      var count = Tool.globalnames[name] ||  0;
      if(count > 0){
        name = name + count;
      }
      Tool.globalnames[name] = count + 1;
      this.set('name', name);
      this.set('id', name);

      this.set({'toolbox': new ToolCollection()});
      if(!options.emptytoolbox){
        var toolbox = this.get('toolbox');
        toolConstuctors
        _.forEach(defaulttoolbox, function(ATool){
          tool = new ATool();
          toolbox.add(tool);
        })
      }
    },
    
    // Initialise is an empty function by default. 
    // Override it 
    activate: function(){
      this.trigger('activate', this);
      this.set('activated', true);
    },
    
    deactivate: function(){
      this.trigger('deactivate', this);
      this.set('activated', false);
    }
  });
  
  //Unnecessary but may be useful later, to attach extra actions on extend.
  Tool.extend = function(){
    Backbone.Model.prototype.extend.apply(this, arguments);    
  };
  
  Tool.globalnames = {};


  // ToolCollection
  // --------------

  var ToolCollection = Backbone.Collection.extend({
    model: Tool    
  });
  
  // D3Draw
  // ------
  var defaulttoolbox = [];
  
  var D3Draw = Tool.extend({
    defaults: {
      name:   "D3Draw",
      toolbox: []
    },
    
    initialize: function(attributes, options){
      D3Draw.Tool.prototype.initialize.apply(this, arguments);      
    }        
  });
  
  D3Draw.Tool = Tool;
  D3Draw.ToolCollection = ToolCollection;
  
  
  var ToolFeature = d3draw.ToolFeature = Backbone.Model.extend({    
    // Should be set for your tool feature
    name: undefined, 
    
    // Should be set for your tool feature    
    type: undefined,
    
    // Initialise is an empty function by default. Override it with your own
    // initialisation logic.
    initialise: function(){},
    
    // Turns your tool on
    turnOn: function(){
      d3draw.setTool(this.name);
    }
  })

  Tool.config_types = {
      OPTION: 'OPTION',
      COMMAND:'COMMAND',
      NUMBER: 'NUMBER'
  } 
  
  ToolFeature.types = Tool.config_types;
  
  // d3draw utility functions
  // ----------------------------------

  var loadTool = d3draw.loadTool = function(tool){
    d3draw.tools[tool.name] = tool;
    return tool;
  }
  
  d3draw.setTool = function(name){
    currentTools.forEach(function(tool){
      if(tool.end && _.isFunction(tool.end)){
        tool.end();
      }
    });
    currentTools = [];
    d3draw.addTool(name);
  }

  d3draw.addTool = function(name){
    var tool = d3draw.tools[name];
    if(tool.start && _.isFunction(tool.start)){
      tool.start();
    }
    currentTools.push(tool);
  }

  d3draw.getTools = function(){
    return currentTools;
  }  

  // the None tool (which does nothing)
  // ----------------------------------

  var ToolNone = Tool.extend({
    name: 'none'
  });
  D3Draw.prototype.defaults.toolConstuctors.push(ToolNone);
    
  // A DeSelect tool 
  // ---------------

  var ToolDeSelect = Tool.extend({
    name: 'deselect',
    start: function(){
      clear_select();
    }
  });
  loadTool(new ToolDeSelect());
  
  
  function clear_select(){
    toolSelect.clicked_nodes = [];
    clear_select_g();
  }
  
  function clear_select_g(){
    d3draw.getRootSelection().selectAll('#select_g')
      .remove();
  }
  
  // A Selector tool 
  // ---------------
  
  var ToolSelect = Tool.extend({
    name: 'select',
    
    initialise: function(){
      this._mode = 'add';
      this.clicked_nodes = [];
    },
    
    config:{
      mode: {
        type:   Tool.config_types.OPTION,        
        values: ['add','replace','subtract']
      },
      reset: {
        type:   Tool.config_types.COMMAND
      }
    },
    
    clicked_nodes: [],
    
    click: clickfn,
    
    reset: restfn
    
  });
  var toolSelect = new ToolSelect();
  loadTool(toolSelect);
  
  function restfn(){
    clear_select();
    redraw_select();
    return this;
  }
  
  function clickfn(domelement,d,i){
    var clicked_node = d3.event.target;
    var clicked_sel = d3.select(clicked_node);
    
    if(clicked_sel.classed("sel")) return; //can't select selection handels!
    if(clicked_node.nodeName === 'svg') return //can't select the svg element (yet)
    
    if (this._mode === 'replace'){
      clear_select();
      this.clicked_nodes.push(clicked_node);
    } else if (this._mode === 'add'){
      clear_select_g();
      this.clicked_nodes.remove(clicked_node);
      this.clicked_nodes.push(clicked_node);      
    } else if (this._mode === 'subtract'){
      clear_select_g();
      this.clicked_nodes.remove(clicked_node);
    }
    redraw_select();
  }

  function redraw_select(){
    var HANDELSIZE = 8;
    var HANDELGAP = 1;
    //globalbbox
    var gbbox = {
        x1: Infinity,
        y1: Infinity,
        x2: -Infinity,
        y2: -Infinity
    };
    _.forEach(toolSelect.clicked_nodes, function(node){
      var parent_node = node.parentNode;
      var select_g = 
        d3.select(parent_node)
          .insert("g",node)
          ;

      var bbox = node.getBBox();
      
      gbbox.x1 = Math.min(gbbox.x1, bbox.x);
      gbbox.y1 = Math.min(gbbox.y1, bbox.y);
      gbbox.x2 = Math.max(gbbox.x2, bbox.x + bbox.width);
      gbbox.y2 = Math.max(gbbox.y2, bbox.y + bbox.height);
          
      select_g
          .attr("id","select_g")
          .classed("sel",true)
          ;
      
      select_g
        .append("rect")
          .classed("sel_highlight",true)
          .attr("x",bbox.x)
          .attr("y",bbox.y)
          .attr("height",bbox.height)
          .attr("width",bbox.width)
          .style("fill","none")
          .style("stroke","lightblue")
          .style("opacity",0.5)
          .style("stroke-width","6px")      
          ;       
    });
    
    if(gbbox.x1 != Infinity){
      var select_g = 
        d3draw.getRootSelection()
          .append("g");
  
      var x_w = gbbox.x1 - HANDELSIZE - HANDELGAP;
      var y_n = gbbox.y1 - HANDELSIZE - HANDELGAP;
      var x_e = gbbox.x2 + HANDELGAP;
      var y_s = gbbox.y2 + HANDELGAP;
          
      select_g
          .attr("id","select_g")
          .classed("sel",true)
          ;
      
      select_g
        .append("rect")
          .classed("sel_nw",true)
          .style("cursor","nw-resize")
          .attr("x",x_w)
          .attr("y",y_n)
          ;
      
      select_g
        .append("rect")
          .classed("sel_ne",true)
          .style("cursor","ne-resize")
          .attr("x",x_e)
          .attr("y",y_n)
          ;
      
      select_g
        .append("rect")
          .classed("sel_se",true)
          .style("cursor","se-resize")
          .attr("x",x_e)
          .attr("y",y_s)
          ;
      
      select_g
        .append("rect")
          .classed("sel_sw",true)
          .style("cursor","sw-resize")
          .attr("x",x_w)
          .attr("y",y_s)
          ;
  
     select_g.selectAll("rect")
       .classed("sel",true)
       .classed("sel_handel",true)
       .attr("width",HANDELSIZE)
       .attr("height",HANDELSIZE)
       .style("fill","lightblue")
       .style("stroke","darkblue")
       .style("stroke-width","1px")
    }
  }

  // A Rectangle tool 
  // ----------------

  
  var ToolRect = Tool.extend({
    name: 'rect',
  
    mousedown: function(domelement,d,i){
      var coord = d3.mouse(domelement);
      this.temp_x = coord[0];
      this.temp_y = coord[1];   
      this.drawing = true;
      
      var sel = d3draw.getRootSelection();    
      sel
        .style("cursor","crosshair");
      
      this.currentShape = 
      sel
        .append("rect")
        .style("fill","none")
        .style("stroke","black")
        .style("stroke-width","2px")
        ;
    },
    
    mousemove: function(domelement,d,i){
      if(this.drawing && this.currentShape){  
        var coord = d3.mouse(domelement);
  
        var dx = coord[0] - this.temp_x;
        var dy = coord[1] - this.temp_y;
        var width  = Math.abs(dx);
        var height = Math.abs(dy);
        var x, y;
        if(dx >= 0){
          x = this.temp_x;   
        }else{
          x = this.temp_x + dx;
        }
        if(dy >= 0){
          y = this.temp_y;   
        }else{
          y = this.temp_y + dy;
        }
        
        this.currentShape
          .attr("x",x)
          .attr("y",y)             
          .attr("width",  width)
          .attr("height", height)          
          ;
      }
    },
    
    mouseup: function(domelement,d,i){
      this.drawing = false;
      
      var sel = d3draw.getRootSelection();    
      sel
        .style("cursor","auto");
    }
  });
  loadTool(new ToolRect());
  
  d3draw.getRootSelection = function(){
    return d3.select('svg');
  }

  d3draw.getRootNode = function(){
    return d3draw.getRootSelection().node();
  }

  
  var _XMLSerializer;
  d3draw.getAsSVG = function(){
    if(!_XMLSerializer) _XMLSerializer = new XMLSerializer();
    
    return _XMLSerializer.serializeToString(
        d3draw.getRootNode()
    );
  }
  
  d3draw.getAsJSON = function(){
    return JsonML.fromXML(d3draw.getRootNode());
  }
  
    
  _.forEach(d3draw.tools, function(value,key){
    d3draw.setTool[key] = function(){
      d3draw.setTool(key);
    }
  });
  
  function eventListner(domelement,event,d,i){
    console.log(event,domelement,d3.event.target,i);
    currentTools.forEach(function(tool){
      if(tool[event] && _.isFunction(tool[event])){
        tool[event](domelement,d,i);
      }
    });
  }
  
  var createEventListner = d3draw.createEventListner = function(name){    
    return function(d,i){
      eventListner(this,name,d,i)
    }
  }
  d3draw.listenForEventsRoot = function(){
    d3draw.listenForEventsSel(d3draw.getRootSelection());    
  }
  d3draw.listenForEventsSel = function(sel){    
    var events = ["click","mousedown","mouseup","mouseover","mousemove","mouseout"];
    //touchstart, touchend, touchmove, touchenter, touchleave, touchcancel
    events.forEach(function(event){
      sel.on(event,createEventListner(event));      
    });
  }
  
  d3.selection.prototype.union = function(that) {
    if(that instanceof d3.selection){
      var newselection  = d3.select(null); //ensure the correct prototype
      newselection.splice(0,1);            //empty the selection      
      [].push.apply(newselection, this);   //push in this selection, without loosing the prototype 
      [].push.apply(newselection, that);   //push in that selection, without loosing the prototype
      return newselection;
    }else{
      throw new Error("Can only union with another d3 selection"); 
    }
  };

  d3draw.renderTools = function(intoselection){
    var sel = d3.select(intoselection);
    sel.selectAll("span")
       .data(Object.keys(d3draw.tools))
       .enter()
       .append("span")
         .text("|")
       .append("a")
         .on("click",function(d,i){d3draw.setTool(d)})
         .text(function(d,i){return d})
       ;
    sel
      .append("span")
      .text("|")
      ;
    }
  
  
  d3draw.listenForEventsRoot();
  d3draw.getRootSelection().node().addEventListener("mousedown", function(e) { e.preventDefault(); }, false);
  d3draw.renderTools("div#menu");
  
  
  
  return d3draw;
});


}

