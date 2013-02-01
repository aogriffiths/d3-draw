define(["d3","underscore"], function(d3, _) {
  var d3draw = {};
  d3draw.tools = {};  
  var currentTool = null;
  var currentToolName = null;
  var clickCollector = {};

  var toolRect = d3draw.tools.rect = {};
  toolRect.draw = function(x,y){
    
  }
  
  d3draw.setTool = function(name){
    currentToolName = name;
    currentTool = d3draw.tools[name];
  }

  d3draw.getTool = function(){
    return currentTool;
  }
  
  d3draw.getToolName = function(){
    return currentToolName;
  };
  
  d3draw.getAsSVG(){
    
  }
  d3draw.getAsJSON(){
    
  }
    
  _.forEach(d3draw.tools, function(value,key){
    d3draw.setTool[key] = function(){
      d3draw.setTool(key);
    }
  });
  
  
  
  return d3draw;
});




