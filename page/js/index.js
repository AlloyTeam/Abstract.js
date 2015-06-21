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
    }
});


var contentTab = new MultitabModel();

var content1 = new RenderModel({
    el: '.content',
    data: {
        content: '简介'
    },

    fuse: '._intro',

    tmpl: "{{content}}"
});

var content2 = content1.extend({
    fuse: '._applacation',
    data: {
        content: '应用'
    }
});

var content3 = content1.extend({
    fuse: "._doc",
    data: {
        content: '文档'
    }
});

contentTab.add('._intro', content1);
contentTab.add('._applacation', content2);


var pageContent = new RenderModel({
    el: '.pageContent',
    url: 'data/pagedata.json',
    tmpl: "<li soda-repeat='item in list'>{{item.title}}<br />{{item.content}}</li>",
    onreset: function(){
        document.querySelector(".pageContent").innerHTML = "";
    },
    processData: function(data){
        //data = JSON.parse(data);

        return data;
    }
});

var pages = new RenderModel({
    el: '.pages',
    data: {
        num: new Array(4)
    },
    tmpl: "<li soda-repeat='item in num' onclick='toPage({{$index}})'>{{$index + 1}}</li>",
    events: function(){
        window.toPage = function(page){
            pageContent.url = "data/pagedata" + (page + 1) + ".json";

            pageContent.reset();
            pageContent.refresh();
        };
    }
});


var page = new PageModel();
page.add(intro);
page.add(nav);
page.add(contentTab);


page.add(pageContent);
page.add(pages);

page.rock();



