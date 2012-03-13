(function(S){
    var Dom = S.DOM,
        P = S.namespace("Gallery.Chart"),
        Event = S.Event,
        c = Dom.get("#chart1");

    function randomData (length,max){
        max = S.isNull(max)?100:max;
        var out = [],i;
        for(i = 0; i < length; i++){
            out.push(Math.round(Math.random()*max));
        }
        return out;
    }
    var chart1 = {
        type : "bar",
        elements : [{
            name : "接待人数",
            data : randomData(6,30),
            label : "{name} : {d}人"
        },
        {
            name : "回复人数",
            data : randomData(6,20),
            label : "{name} : {d}人"
        },
        {
            name : "回复人数",
            data : randomData(6,18),
            label : "{name} : {d}人"
        }],
        axis : {
            x : {
                name : "时间",
                labels : ["2011-1-10","2011-1-11","2011-1-12","2011-1-13","2011-1-14","2011-1-15"]
            },
            y : {
                name : "人数",
                labels : [null,"2,000","4,000","6,000","8,000","10,000"],
                max : 50
            }
        },
        config : {
            left : 60
        }
    };
    var chart2 = {
        type : "line",
        elements : [{
            name : "接待人数",
            data : randomData(26,50),
            format : "0.00",
            label : "<span style='color:#fff'> {name}</span> {d} 人"
        },
        {
            name : "回复人数",
            data : randomData(26,10),
            drawbg : true,
            label : "<span style='color:#fff'> {name}</span> {d} 人"
        },
        {
            name : "回复率",
            notdraw : true,
            data : [0,50,75,90,100,0,50,75,90,100,0,50,75,90,100,0,50,75,90,100,0,50,75,90,100,50],
            label : "<span style='color:#fff'>　{name}</span> {d} %"
        },
        ],
        axis : {
            x : {
                name : "时间",
                labels : ["2011-1-10","2011-1-11","2011-1-12","2011-1-13","2011-1-14","2011-1-10","2011-1-11","2011-1-12","2011-1-13","2011-1-14","2011-1-10","2011-1-11","2011-1-12","2011-1-13","2011-1-14","2011-1-10","2011-1-11","2011-1-12","2011-1-13","2011-1-14","2011-1-10","2011-1-11","2011-1-12","2011-1-13","2011-1-14","2011-1-15"]
            },
            y : {
                name : "hhh"
                //labels : [null,"2,000","4,000","6,000","8,000","10,000"],
                //max : 50
            }
        },
        config : {
            left:100
        }
    };
    var chart3 = {
        type : "bar",
        elements : [{
            name : "接待人数",
            data : [46],
            label : "{name}{d}%"
        },
        {
            name : "回复人数",
            data : [2],
            label : ["8%"]
        }],
        axis : {
            x : {
                name : "时间",
                labels : ["2011-1-10"]
            },
            y : {
                name : "人数",
                labels : [null,"2,000","4,000","6,000","8,000","10,000"],
                max : 50
            }
        }
    };
    var chart4 = {
        type : "bar",
        elements : [{
            name : "接待人数",
            data : [46,30,60,40,55],
            label : ["46%","30%","60%","40%","55%"]
        },
        {
            name : "回复人数",
            data : [8,20,60,90,40],
            label : ["8%","20%","60%","90%","40%"]
        }],
        axis : {
            x : {
                name : "时间",
                labels : ["2011-1-10"]
            },
            y : {
                name : "人数",
                labels : [null,"2,000","4,000","6,000","8,000","10,000"],
                max : 50
            }
        }
    };
    var pie = {
        type : "pie",
        elements : [
        {
            name : "iphone",
            data : 10,
            label : "{name} - {data}"
        },
        {
            name : "android",
            data : 20,
            label : "{name} {data}"
        },
        {
            name : "wp7",
            data : 70,
            label : "{name} {data}"
        }
        ]
    };
    Event.on(window,"load",function(){
        var chart = new P.Chart(c);
        if(!chart) return;
        //chart.render(chart1);
        var testdata = [
            { "d" : chart1,"n":"多条形图"},
            { "d" : chart2,"n":"折线"},
            { "d" : chart3,"n":"条形图"},
            { "d" : pie,"n":"饼图[preview]"}
        ];
        S.each(testdata,function(item){
            var a = Dom.create("<a href=\"javascript:void(0)\">"+item.n+"</a>");
            Event.on(a,"click",function(){
                chart.render(item.d)
                Dom.val("#jsonvalue",S.JSON.stringify(item.d));
            });
            S.one("#samples").append(a);
        });
        Event.on("#Dataform","submit",function(e){
            e.preventDefault();
            var chartdata = S.JSON.parse(Dom.val("#jsonvalue"));
            if(chartdata)
                chart.render(chartdata);
        });
        //chart.render(chart2);
    });
})(KISSY);
