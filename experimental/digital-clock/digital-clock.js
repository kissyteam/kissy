/*
	digital clock emulation
	@author yiminghe@gmail.com(chengyu)
*/
KISSY.add("digital-clock",function(S,undefined){
	
	//clock number markup
	var CLOCK_NUMBER='<div class="ks-digitalclock-container">'
		
		+'<div class="ks-digitalclock-element  ks-digitalclock-vertical ks-digitalclock-e1">'
		+	'<s class="ks-digitalclock-first"></s>'
			+'<div class="ks-digitalclock-bar"></div>'
			+'<b class="ks-digitalclock-last"></b>'
		+'</div>'
		
	+	'<div class="ks-digitalclock-element ks-digitalclock-vertical ks-digitalclock-e2">'
		+	'<s class="ks-digitalclock-first"></s>'
		+	'<div class="ks-digitalclock-bar"></div>'
		+	'<b class="ks-digitalclock-last"></b>'
		+'</div>'
		
		+'<div class="ks-digitalclock-element ks-digitalclock-horizonal ks-digitalclock-e3">'
		+	'<s class="ks-digitalclock-first"></s>'
		+	'<div class="ks-digitalclock-bar"></div>'
		+	'<b class="ks-digitalclock-last"></b>'
		+'</div>'
		
		+'<div class="ks-digitalclock-element  ks-digitalclock-vertical ks-digitalclock-e4">'
		+	'<s class="ks-digitalclock-first"></s>'
		+	'<div class="ks-digitalclock-bar"></div>'
		+	'<b class="ks-digitalclock-last"></b>'
		+'</div>'
		
		+'<div class="ks-digitalclock-element ks-digitalclock-vertical ks-digitalclock-e5">'
		+	'<s class="ks-digitalclock-first"></s>'
		+	'<div class="ks-digitalclock-bar"></div>'
		+	'<b class="ks-digitalclock-last"></b>'
		+'</div>'
		
		+'<div class="ks-digitalclock-element ks-digitalclock-horizonal ks-digitalclock-e6">'
		+	'<s class="ks-digitalclock-first"></s>'
		+	'<div class="ks-digitalclock-bar"></div>'
		+	'<b class="ks-digitalclock-last"></b>'
		+'</div>'
		
		+'<div class="ks-digitalclock-element ks-digitalclock-horizonal ks-digitalclock-ex">'
		+	'<s class="ks-digitalclock-first"></s>'
		+	'<div class="ks-digitalclock-bar"></div>'
		+	'<b class="ks-digitalclock-last"></b>'
	+	'</div>'
		
	+'</div>'
	
	,N2=function(str){
		return parseInt(str,2);
	}
	
	//colon markup
	,COLON='<div class="ks-digitalclock-container">'
		+'<div class="ks-digitalclock-colon1">'
		+'<s class="ks-digitalclock-colon-top">'
		+'</s>'
		+'<b class="ks-digitalclock-colon-bottom">'
		+'</b>'
		+'</div>'
		
		+'<div class="ks-digitalclock-colon2">'
		+'<s class="ks-digitalclock-colon-top">'
		+'</s>'
		+'<b class="ks-digitalclock-colon-bottom">'
		+'</b>'
	+'</div>'
		
	+'</div>'	
	
	//clock container markup
	,CLOCK_BORDER="<div class='ks-digitalclock-border clearfix'>"
	+"</div>"
	
	,Node=S.Node
	
	//clock region
	,C_WIDTH=120
	,C_WIDTH_LIMIT=11
	,C_HEIGHT=200
	,C_HEIGHT_LIMIT=18
	,C_MARGIN_LR=10
	,VERTICAL_WIDTH=20
	,D_HEIGHT=97
	,BAR_HEIGHT=67
	,E24_TOP=104
	,BORDER_L=10
	,BORDER_S=5
	,E45_LEFT=99
	,HORIZONAL_WIDTH=107
	,HORIZONAL_HEIGHT=20
	,HORIZONAL_LEFT=6
	,HORIZONAL_BAR_WIDTH=67
	,E3_LEFT=6
	,E3_TOP=180
	,EX_TOP=90
	,COLON_WIDTH=30
	,COLON_LEFT=0
	,COLON1_TOP=60
	,COLON2_TOP=90
	,KS_WIDTH=710
	,S_ZOOM=0.4
	,NUM_LIMIT=3
	,MARGIN_LIMIT=2
	,MARGIN_COMPENSATE=20
	,BG_COLOR="#565656"
	//电子钟组成部分和相应div的对照
	,DIGITAL_CONFIG={
		 0:N2("01111110")
		,1:N2("0110000")
		,2:N2("11101100")
		,3:N2("11111000")
		,4:N2("10110010")
		,5:N2("11011010")
		,6:N2("11011110")
		,7:N2("01110010")
		,8:N2("11111111")
		,9:N2("11111011")
	};
	
	//clock number attributes
	ClockNumber.ATTRS = {
		/*
		clock number value
		@default 0
		*/
    value: {
        value: 8
    },
    /*
    clock zoom value
    @default 1
    */
    zoom: 1
	};
	
	function ClockNumber(cfg) {
	    var self = this;
	    ClockNumber.superclass.constructor.call(self, cfg);
	    self._domNode = new Node(CLOCK_NUMBER);
	    self._bars = self._domNode.children();
	    for (var i = 0; i < self._bars.length; i++) {
	        self._bars[i] = new Node(self._bars[i]);
	    }
	    self.on("afterValueChange", self.repaint, self);
	    self.on("afterZoomChange", self.zoom, self);
	}
	S.extend(ClockNumber, S.Base, {
	    /**
	     append this number to a clock container
	     @param container {HTMLElement} clock container
	     @return this for chain
	     */
	    appendTo: function (container) {
	        var self = this;
	        self._domNode.appendTo(container[0]);
	        return self;
	    },
	    //internal use ,zoom number
	    zoom: function (e) {
	        var z = e.newVal;
	        var self = this;
	        self._domNode.css("margin", "0 " + Math.max(C_MARGIN_LR * z, MARGIN_LIMIT) + "px");
	        self._domNode.css("width", Math.max(C_WIDTH * z, C_WIDTH_LIMIT) + "px");
	        self._domNode.css("height", Math.max(C_HEIGHT * z, C_HEIGHT_LIMIT) + "px");
	        self._domNode.all(".ks-digitalclock-element").each(function (node) {
	            node.css("height", D_HEIGHT * z + "px");
	        });
	        self._domNode.all(".ks-digitalclock-vertical").each(function (node) {
	            node.css("width", Math.max(VERTICAL_WIDTH * z, NUM_LIMIT) + "px");
	        });
	        self._domNode.all(".ks-digitalclock-bar").each(function (node) {
	            node.css("height", BAR_HEIGHT * z + "px");
	        });
	        self._bars[1].css("top", E24_TOP * z + "px");
	        self._bars[3].css("top", E24_TOP * z + "px");
	        //if zoom too small ,then triangle disappear !
	        if (z >= 0.2) {
	            self._domNode.all(".ks-digitalclock-element").each(function (node) {
	                node.css("background-color", "transparent");
	            });
	            self._domNode.all(".ks-digitalclock-last").each(function (node) {
	                node.css("border-width", Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            });
	            self._domNode.all(".ks-digitalclock-first").each(function (node) {
	                node.css("border-width", Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            });
	            self._bars[0].one(".ks-digitalclock-first").css("border-width", Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[4].one(".ks-digitalclock-first").css("border-width", Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[0].one(".ks-digitalclock-last").css("border-width", BORDER_S * z + "px" + " " + Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[1].one(".ks-digitalclock-first").css("border-width", BORDER_S * z + "px" + " " + Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[1].one(".ks-digitalclock-last").css("border-width", Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[3].one(".ks-digitalclock-last").css("border-width", Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[3].one(".ks-digitalclock-first").css("border-width", BORDER_S * z + "px" + " " + Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	            self._bars[4].one(".ks-digitalclock-last").css("border-width", BORDER_S * z + "px" + " " + Math.max(BORDER_L * z, NUM_LIMIT / 2) + "px");
	        } else {
	            self._domNode.all(".ks-digitalclock-element").each(function (node) {
	                node.css("background-color", BG_COLOR);
	            });
	        }
	        self._bars[3].css("left", E45_LEFT * z + "px");
	        self._bars[4].css("left", E45_LEFT * z + "px");
	        self._domNode.all(".ks-digitalclock-horizonal").each(function (node) {
	            var height = Math.max(HORIZONAL_HEIGHT * z, NUM_LIMIT);
	            node.css("width", HORIZONAL_WIDTH * z + "px");
	            node.css("height", height + "px");
	            node.css("left", HORIZONAL_LEFT * z + "px");
	            node.one(".ks-digitalclock-bar").css("width", HORIZONAL_BAR_WIDTH * z + "px");
	            node.one(".ks-digitalclock-bar").css("height", height + "px");
	        });
	        self._bars[2].css("left", E3_LEFT * z + "px");
	        self._bars[2].css("top", E3_TOP * z + "px");
	        self._bars[6].css("top", EX_TOP * z + "px");
	    },
	    //internal use ,synchronize data with ui
	    repaint: function (e) {
	        var self = this
	        , v = DIGITAL_CONFIG[e.newVal]
	        , preV=DIGITAL_CONFIG[e.preVal]
	        , diff=v ^ preV;
	        //console.log(e.newVal,e.preVal,v.toString(2),preV.toString(2),diff.toString(2));
	        for (var i = 0; i < self._bars.length; i++) {
	        		v = v >> 1;
	            diff = diff >> 1;
	            var node = self._bars[i]	            
	            , b = v & 1,diffB=diff&1;
	            if (b && diffB) {
	                node.css("display", "");
	            } else if(diffB){
	                node.css("display", "none");
	            }else{
	            	//console.log("unchanged");
	            }
	        }
	    }
	});
	DigitalClock.ATTRS = {
	    /*
				clock time
				@default now
				*/
	    date: {
	        value: new Date()
	    },
	    zoom: {
	        value: 1
	    },
	    /*
		    clock container to append
		    @default body
		    */
	    container: {
	        valueFn: function () {
	            return document.body;
	        }
	    }
	};
	function DigitalClock(cfg) {
	    var self = this;
	    DigitalClock.superclass.constructor.call(self, cfg);
	    self._ns = [];
	    self._container = new Node(CLOCK_BORDER);
	    for (var i = 0; i < 2; i++) {
	        self._ns.push(new ClockNumber().appendTo(self._container));
	    }
	    self._colon = new Node(COLON).appendTo(self._container[0]);
	    for (var i = 0; i < 2; i++) {
	        self._ns.push(new ClockNumber().appendTo(self._container));
	    }
	    for (var i = 0; i < 2; i++) {
	        self._ns.push(new ClockNumber().appendTo(self._container));
	    }
	    self._container.appendTo(self.get("container"));
	    self.repaint({
	        newVal: self.get("date")
	    });
	    self.zoom({
	        newVal: self.get("zoom")
	    });
	    self.on("afterDateChange", self.repaint, self);
	    self.on("afterZoomChange", self.zoom, self);
	    setInterval(function () {
	        //return;
	        self.fire("tick", {
	            date: self.get("date")
	        });
	        self.set("date", new Date());
	    },
	    1000);
	}
	S.extend(DigitalClock, S.Base, {
	    zoom: function (e) {
	        var self = this;
	        var z = e.newVal;
	        for (var i = 0; i < 4; i++)
	        self._ns[i].set("zoom", z);
	        for (var i = 4; i < 6; i++)
	        self._ns[i].set("zoom", z * S_ZOOM);
	        self._colon.css("width", COLON_WIDTH * z + "px");
	        self._colon.css("height", C_HEIGHT * z + "px");
	        self._colon.all(".ks-digitalclock-colon-top,.ks-digitalclock-colon-bottom").each(function (node) {
	            node.css("border-width", BORDER_L * z + "px");
	        });
	        self._colon.one(".ks-digitalclock-colon1").css("left", COLON_LEFT * z + "px");
	        self._colon.one(".ks-digitalclock-colon2").css("left", COLON_LEFT * z + "px");
	        self._colon.one(".ks-digitalclock-colon1").css("top", COLON1_TOP * z + "px");
	        self._colon.one(".ks-digitalclock-colon2").css("top", COLON2_TOP * z + "px");
	        self._container.css("width", KS_WIDTH * z + MARGIN_COMPENSATE + "px");
	    },
	    //internal use ,repaint its numbers and colon
	    repaint: function (e) {
	        var self = this;
	        var d = e.newVal,
	            h = d.getHours(),
	            m = d.getMinutes(),
	            s = d.getSeconds();
	        //console.log(h,m,s);    
	        //h = 88,
	        //m = 88,
	        //s = 88;
	        self._ns[0].set("value", Math.floor(h / 10));
	        self._ns[1].set("value", Math.floor(h % 10));
	        self._ns[2].set("value", Math.floor(m / 10));
	        self._ns[3].set("value", Math.floor(m % 10));
	        self._ns[4].set("value", Math.floor(s / 10));
	        self._ns[5].set("value", Math.floor(s % 10));
	    }
	});
	S.DigitalClock = DigitalClock;
});