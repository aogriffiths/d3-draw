QUnit.config.autostart = false;
//QUnit.config.autorun = false;

require.config({
  baseUrl: "../javascripts",
  shim: {    
    '../test/tests.js': {
      deps: ['jquery','underscore','backbone','../javascripts/jsonml/jsonml-xml.js']
    }
  }
});

require(
  ['../test/tests.js'], 
  function (testsjs) {
    //QUnit.start();
    console.log('done');
});   
