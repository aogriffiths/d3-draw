var $, d3, d, dui, jsondiffpatch;

require(['jquery','d3','./d3draw','./d3draw-bootstrap-ui','jsondiffpatch.min'], function (_$, _d3, _d3draw, _d3drawui, _jsondiffpatch) {
  $ = _$;
  d3 = _d3;
  d = _d3draw;
  dui = _d3drawui;
  jsondiffpatch =  _jsondiffpatch;
  
  dui.render();
});    
