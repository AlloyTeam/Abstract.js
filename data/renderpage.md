#Get Rocking
##Render Page
We will learn how to use RenderModel to render page block;

<img src="image/header.jpg" alt="" />

##Static Page
Firstly, we need to write static page using html and css; The html structure is as below;

<pre class="brush: xml">
<div class="header">
    <div class="left logo"></div>
    <div class="right intro">
        <h2>QQ</h2>
        <div class="subtitle subintro">Feeds 50, 000 Follow 930,000</div>
        <div class="level">
            <span class="icon levelicon"></span>
            <span class="levelRect" style="width: 93%"></span>
            <span class="levelnumber">0/15</span>
        </div>

        <div class="sign">sign</div>
    </div>
</div>
</pre>

##Abstact Template
Secondly, we need to abstact template from the upper html code.

The Html structure will be like

<pre class="brush: xml">
<div class="header">
</div>
</pre>

The template will be like(rendered by <a href='http://alloyteam.github.io/SodaRender/'>sodaRender</a>)
<pre class="brush: xml">
    <div class="left logo"></div>
    <div class="right intro">
        <h2>{{title}}</h2>
        <div class="subtitle subintro">Feeds {{feeds | number}} Follow {{follow | number}}</div>
        <div class="level">
            <span class="icon levelicon"></span>
            <span class="levelRect" style="width: {{width}}%"></span>
            <span class="levelnumber">{{currLevel}}/{{totalLevel}}</span>
        </div>

        <div class="sign">sign</div>
    </div>

</pre>

##Construct Logics
Since it's just common rendering block, so we use RenderModel to render this block;

<pre class="brush:js">
var header = new RenderModel({
    el: ".header",
    data: {
        title: "QQ",
        feeds: 50000,
        follow: 930000,
        width: 93,
        currLevel: 0,
        totalLevel: 15
    },
    
    processData: function(data){
    },

    tmpl: tmplStr,

    complete: function(data){
    }
});

header.rock();
</pre>

the option el refers to the element which the template will append to;

the option data, if given will be used by the template;

the option processData, where you can process your data for the template.

the option tmpl refers to the template str you are using.

the option complete is function, where you can do something after rendered.

The template uses soda filter "number", we also need to define soda filter.
<pre class="brush:js">
sodaFilter("number", function(input){
      // ... some code here to format number
});
</pre>



##Fetch Data From Server
If your need to fetch data from server, you just need to set the url option and param option.
<pre class="brush:js">
var header = new RenderModel({
    el: ".header",

    url: "/cgi-bin/get_header",
    param: {
        id: 1
    },

    processData: function(data){
    },

    tmpl: tmplStr,

    complete: function(data){
    }
});

header.rock();
</pre>

param option also can be function.
<pre class="brush:js">
var header = new RenderModel({
    el: ".header",

    url: "/cgi-bin/get_header",
    param: function(){
        return {
            id: 1
        };
    },

    processData: function(data){
    },

    tmpl: tmplStr,

    complete: function(data){
    }
});

header.rock();
</pre>


Notice that RenderModel will cache the response data in localStorage. Next time RenderModel will using local cache data to render page block, at the same time, the request is also going on. When the response comes RenderModel will render another time to replace the old content. So users will see page details faster.

If you don't want to use cache rendering, you can set the "noCache" option be true to pass the cache rendering. 

##Refresh block
If you want to refresh this block, just call refresh method.

<pre class="brush:js">
header.refresh();
</pre>

##Do More thing
There are more option settings to let you do more thing, see doc.
