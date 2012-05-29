(function(S){
    var Dom = S.DOM;
    /**
     * get the random Data
     * @param {number} length The length of data
     * @param {number} max The top -bondry of number
     * @return {array} array of data
     **/
    function randomData (length,max){
        var out = [],i;
        max = S.isNull(max)?100:max;
        for(i = 0; i < length; i++){
            out.push(Math.round(Math.random()*max));
        }
        return out;
    }
    function getLabel(length,from){
        var out = [],i;
        for(i = 0; i < length; i++){
            out.push(from++);
        }
        return out;
    }
    var baseline = {
        type : "line",
        elements : [{
            name : "接待人数",
            data : randomData(26,90000),
            label : "{d} 人"
        },
        {
            name : "回复人数",
            data : randomData(26,30000),
            label : "{d} 人"
        },
        {
            name : "满意人数",
            data : randomData(26,60000),
            label : "{d} 人"
        }
        ],
        axis : {
            x : {
                name : "时间",
                labels : getLabel(26,1000)
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

    var chartdata = [
        {
            n : "LineChart",
            d : baseline
        },
        {
            n : "lineChart drawbg",
            d : function(){
                var o = S.clone(baseline);
                o.elements[1].drawbg = true
                return o;
            }()
        },
        {
            n : "lineChart notdraw",
            d : function(){
                var o = S.clone(baseline);
                o.elements[2].notdraw = true;
                return o;
            }()
        },
        {
            n : "lineChart number format",
            d : function(){
                var o = S.clone(baseline);
                o.elements[0].format = "0,000.00";
                return o;
            }()
        }
    ];
    var container = S.one("#fulltestarea");
    S.each(chartdata, function(data,idx){
        var canvas = Dom.create("<canvas class='test' width='800' height='300'>");
        container
            .append("<h3>"+data.n+"</h3>")
            .append(canvas);
        var chart = new S.Chart(canvas);
        chart.render(data.d);
    });
    
})(KISSY);
