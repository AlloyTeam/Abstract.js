#Get Rocking
##Quick Glance
###Theroy
Actually we often consern about how to render page block with data, and we spend a lot of time to write repeat code just to render data. Abstract.js abstracts one concept called RenderModel from the repeat action.

###Split Page Block
Before writing code, we need to think about how to split the page to render blocks. 

<img src="image/blocks.png" alt="" />

###Writing Html Frame
Writing your html frame for every block

<pre class="brush: xml">
&lt;div class="header">&lt;/div>
&lt;div class="nav">&lt;/div>
&lt;div class="recommend">&lt;/div>
&lt;div class="list">&lt;/div>
</pre>

###Config
header, nav, recommend block will render once, we think they are just common renderModels. While list block will render more after we pull the list to bottom, we think it's scrollModel. So setting the config as below.
<pre class="brush:js">
var header = new RenderModel({
   el: ".header",
   url: "cgi/get_header",
   // after response, process data
   processData: function(data){
   },

   tmpl: "{{content}}...",

   // when complete, do something
   complete: function(){
   }
});

// and write nav 
var nav = new RenderModel({
        // ... some code here
});

var recommend = new RenderModel({
        // ... some code here
});

// ScrollModel has the same config with RenderModel
var list = new ScrollModel({
        // ... some code here
});
</pre>

### Setting The Relationship Between Models
In Abstract.js, we have just two relationship to express the whole relationship between models(blocks); And we also can prove that it's enough.

One is PageModel, which is to express when one model is active,the others will be active.

Another is MutexModel, which is to express when one model is active, the others will be unactive. 

What's more, there is MultitabModel, which is not a new relationship, but is MutexModel Enhanced. More details for MultitabModel will be talked below;

So we can find out which relationship is between the models. The four models will be active at the same time, so it's PageModel;

<pre class="brush: javascript">
var page = new PageModel();
page.add(header);
page.add(nav);
page.add(recommend);
page.add(list);
</pre>

### Enjoy Rocking
So far, the page will run nothing. Because we need to let every block move. It's like the puppet was cut out every block, we need to give him the electric shock to let him be live.

Here we run the Rock Method. The page is live;

<pre class="brush: javascript">
page.rock();
</pre>
