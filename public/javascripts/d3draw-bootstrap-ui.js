define(["./d3draw","backbone","underscore"], function(d3draw, Backbone, _) {

  var MenuItemConfigItem = Backbone.Model.extend({

  });

  var MenuItemConfigItems = Backbone.Collection.extend({
    model: MenuItemConfigItem
  });
  
  var MenuItem = Backbone.Model.extend({
    initialize: function(){
      var configItemsArray = [];
      var that = this;
      _.forEach(this.get("tool").config, function(config, key){
        configItemsArray.push({name:key, config:config, fn:that.get("tool")[key]});
      })
      this.configItems = new MenuItemConfigItems(configItemsArray);
    }
  });
  
  var MenuItems = Backbone.Collection.extend({
    model: MenuItem
  });
  
  var MenuItemConfigItemViewPrototype = {
    // The DOM events specific to an item.
    events: {
      "click .configaction"   : "actionClick"
    },

    initialize: function() {
    },

    // Re-render the titles of the todo item.
    render: function() {
      var type = this.model.get('config').type;
      this.setElement(this['template' + type](this.model.toJSON()));
      return this;
    },

    actionClick: function() {
      var fn = this.model.get("fn")
      var type = this.model.get('config').type;
      switch(type){
      case 'OPTION':
        //var value = this.$('select').val();
        var value = this.$('input[name=optionsRadios]:checked').val();
        fn(value);
        break;
      case 'COMMAND':
        fn();
        break;
      case 'NUMBER':
        var value = this.$('text').val()
        fn(value);
        break;        
      }
    }
  }
  
  _.forEach(d3draw.Tool.config_types, function(value, type){
    // Cache the template function for a single item.
    MenuItemConfigItemViewPrototype['template' + type] =  _.template($('#menuitem-configitem-' + type + '-template').html());    
  })

  var MenuItemConfigItemView = Backbone.View.extend(MenuItemConfigItemViewPrototype);
    
  var MenuItemView = Backbone.View.extend({

    // Cache the template function for a single item.
    template: _.template($('#menuitem-template').html()),

    // The DOM events specific to an item.
    events: {
      "click .action"   : "actionClick"
    },

    initialize: function() {
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.setElement(this.template(this.model.toJSON()));
      var that = this;
      this.model.configItems.each(function(configitem){        
        var view = new MenuItemConfigItemView({model: configitem});
        that.$(".dropdown-menu").append(view.render().el);
      })
      return this;
    },

    actionClick: function() {
      var tool = this.model.get("tool")
      tool.turnOn();
    }

  });
  
  var menuitems;
  
  var AppView = Backbone.View.extend({

    el: $("#ui"),

    initialize: function() {
      var menuitem_array = [];
      _.forEach(d3draw.tools,function(tool, name){
        var menuitem = new MenuItem({tool:tool, name:name});
        menuitem_array.push(menuitem);
      })
      menuitems = new MenuItems(menuitem_array);
    },

    render: function() {
      this.addAllMenuItems();
    },

    // Add a single menu item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOneMenuItem: function(menuitem) {
      var view = new MenuItemView({model: menuitem});
      this.$("#menuitems").append(view.render().el);
    },

    // Add all items in the **MenuItems** collection at once.
    addAllMenuItems: function() {
      menuitems.each(this.addOneMenuItem, this);
    }

  });
  
  var app = new AppView;
  
  return app;
});