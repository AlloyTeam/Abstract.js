# Abstract.js
Abstract.js is a new and amazing framework for fast web development. It's the world's first Logic Oriented Program Framework(As I know). Using Abstract.js you can construct a readable, tidy project.

* **Abstract Models & Core Concept:**Here the Models don't refer to the M of MVC, but drawn from the model concept in Mathematic. Abstract.js rethought construction of the web page and found the common and abstract actions in web development.
<br />We extract two base models which can describe all the web development. So it's rendering model and relationship model in Abstract.js.
<br />The relationship model is based on a simple state machine and using for describing the relationship between the rendering models. While the rendring model is using for rendering modules of the web page.
<br />But it's not enough just with the two base models, Abstract.js also offers the connction methods between the models to make it more convenient building the web world.
* **Virtual DOM and Event Propagation:**Models refer to the Real Dom. Models construct Virtual DOM Tree with parent&child relationship and event propagation.
* **Logical Abstracted:**Abstract Models are like ribs of the page. Many logical programmings are encapsulated, So you build your page fast.

##Doc
[Doc](doc.md)

##examples
simple render model
```javascript
var nav = new RenderModel({
    el: '.nav',
    data: {
        navList: [
            {name: '简介', cn: '_intro'},
            {name: '应用', cn: '_applacation'},
            {name: '文档', cn: '_doc'}
        ]
    },
    tmpl: "<li soda-repeat='item in navList' onclick='switchNav(\"{{item.cn}}\")' class='{{item.cn}}'>{{item.name}}</li>",
    events: function(){
        window.switchNav = function(name){
            Model.trigger("." + name);
        };
    }
});

nav.rock();

```
page model

```javascript
var intro = new RenderModel({
    el: '.intro',
    tmpl: 'Model.js'
});

var nav = new RenderModel({
    el: '.nav',
    data: {
        navList: [
            {name: '简介', cn: '_intro'},
            {name: '应用', cn: '_applacation'},
            {name: '文档', cn: '_doc'}
        ]
    },
    tmpl: "<li soda-repeat='item in navList' onclick='switchNav(\"{{item.cn}}\")' class='{{item.cn}}'>{{item.name}}</li>",
    events: function(){
        window.switchNav = function(name){
            Model.trigger("." + name);
        };
    }
});

var page = new PageModel();
page.add(intro);
page.add(nav);
page.rock();
```
observe events
```
var intro = new RenderModel({
    el: '.intro',
    tmpl: 'Model.js'
});

intro.addEventListener("completed", function(e){
     // do something
});
```
###Learn Abstract.js(comming soon)
