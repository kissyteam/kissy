KISSY.add("chart/data",function(S){
    var P = S.namespace("Chart");

    /**
     * 图表默认配置
     */
    var defaultConfig= {
        //上边距
        paddingTop: 30,
        //左边距
        paddingLeft : 20,
        //右边距
        paddingRight : 20,
        //底边距
        paddingBottom : 20,
        //是否显示标签
        showLabels : true,

        colors : [],
        //动画间隔
        animationDuration : .5,
        //动画Easing函数
        animationEasing : "easeInStrong",
        //背景色 或 背景渐变
        /*
        {
            start : "#222",
            end : "#666"
        }
        */
        backgroundStyle : false,
        //坐标字体颜色
        axisTextColor : "#999",
        //坐标间隔背景颜色
        axisBackgroundColor : "#EEE",
        //坐标线框颜色
        axisGridColor : "#e4e4e4",
        //Number Format
        //针对特定数据设置numberFormat可以用
        //numberFormats : ['0.00','0.000']
        //false表示不做format处理
        numberFormat : false,
        //边框颜色
        frameColor : "#d7d7d7"
    };

    /**
     * 特定图标配置
     */
    var specificConfig = {
        'line' : {
            //是否在折线下绘制渐变背景
            //值为要绘制背景的折线index
            drawbg : -1
        },
        'bar' : { },
        'pie' : {
            //pie 默认动画时间
            animationDuration : 1.8,
            //pie 的默认动画效果
            animationEasing : "bounceOut",
            paddingTop : 10,
            paddingBottom : 10,
            paddingLeft : 10,
            paddingRight : 10,
            shadow : true,
            labelTemplete : "{name} {pecent}%", //{name} {data} {pecent}
            firstPieOut : false // 第一块飞出
        }
    };

    /**
     * 数据默认配置
     */
    var defaultElementConfig = {
        'default' : {
            label : "{name} -  {data}"
        },
        'line':{
        },
        "pie" : {
        },
        "bar" : {
        }
    };

    /**
     * 图表数据
     * 处理图表输入数据
     * @constructor
     * @param {Object} 输入的图表JSON数据
     */
    function Data(data){
        if(!data || !data.type) return;
        if(!this instanceof Data)
            return new Data(data);
        var self = this,
            cfg = data.config;

        self.origin = data;
        data = S.clone(data);
        self.type = data.type.toLowerCase();
        //self._design = data.design;

        self.config = cfg = S.merge(defaultConfig, specificConfig[self.type], cfg);

        /**
         * 配置兼容
         */
        S.each({
            'left'  : 'paddingLeft',
            'top'   : 'paddingTop',
            'bottom': 'paddingBottom',
            'right' : 'paddingRight'
        }, function(item, key){
            if(key in cfg && S.isNumber(cfg[key])){
                cfg[item] = cfg[key];
            }
        });

        self._elements = self._initElement(data);
        self._elements = self._expandElement(self._elements);
        self._initElementItem();
        self._axis = data.axis;
    }

    S.augment(Data, /**@lends Data.protoptype*/{
        /**
         * get the AxisData
         */
        axis : function(){
            return this._axis;
        },

        /**
         * get the Element Data
         */
        elements : function(){
            return this._elements;
        },

        /**
         * get the the max length of each Element
         */
        maxElementLength: function(){
            var ml = 0;
            S.each(this._elements, function(elem,idx){
                if(S.isArray(elem.items)){
                    ml = Math.max(ml, elem.items.length);
                } else {
                    ml = Math.max(ml,1)
                }
            });
            return ml;
        },


        /**
         * Get the color for the Element
         * from the user config or the default
         * color
         * @param {Number} the index of the element
         * @param {String} type of Chart
         */
        getColor : function(idx,type){
            var length = this._elements.length;
            var usercolor = this.config.colors
            if(S.isArray(usercolor) && usercolor[idx]){
                return usercolor[idx];
            }

            //getColor frome user defined function
            if(S.isFunction(usercolor)){
                return usercolor(idx);
            }

            //get color from default Color getter
            return this.getDefaultColor(idx,length,type);
        },

        /**
         * return the sum of all Data
         */
        sum: function(){
            var d = 0;
            this.eachElement(function(item){
                d += item.data;
            });
            return d;
        },

        /**
         * Get the Biggest Data from element
         */
        max : function(){
            return this._max;
        },

        /**
         * get the default color depending on idx and length, and types of chart 
         * @param {Number} index of element
         * @param {Number} length of element
         */
        getDefaultColor : function (idx,length){
            //在色相环上取色
            var colorgap = 1/3,
                //h = Math.floor(idx/3)/length + 1/(idx%3 + 1)*colorgap,
                h = colorgap * idx, //h of color hsl
                s = .7, // s of color hsl
                b = 1,//b of  color hsb
                l = b - s*.5, //l of color hsl
                i, j, k;

            if(idx < 3){
                h = colorgap * idx + 0.05;
            }else{
                //防止最后一个颜色落在第3区间
                if(length % 3 == 0){
                    if(idx === length -1){
                        idx = length - 2;
                    }else
                    if(idx === length - 2){
                        idx = length - 1;
                    }
                }
                i = idx % 3;
                j = Math.ceil(length/3);
                k = Math.ceil((idx + 1)/3);
                h = i*colorgap + colorgap/j * (k-1);
            }
            return P.Color.hsl(h,s,l).hexTriplet();
        },


        /**
         * execuse fn on each Element item
         */
        eachElement : function(fn){
            var self = this;

            S.each(self._elements, function(item,idx){
                if(item.items){
                    S.each(item.items, function(i, idx2){
                        fn(i,idx,idx2);
                    });
                }else{
                    fn(item, idx, -1);
                }
            });
        },

        /**
         * Init the Element Item
         * parse the label
         */
        _initElementItem: function(){
            var self = this;
            self._max = null;

            self.eachElement(function(elem,idx,idx2){
                if(idx === 0 && (!idx2) )self._max = elem.data || 0;

                var defaultElem = S.merge(defaultElementConfig['default'], defaultElementConfig[self.type]||{});

                elem.data = S.isNumber(elem.data) ? elem.data : 0;
                //数字的格式
                if(S.isArray(self.config.numberFormats) ){
                    elem.format = self.config.numberFormats[idx];
                }

                if(typeof elem.format == 'undefined' ){
                    elem.format = self.config.numberFormat;
                }

                elem.label = elem.label || defaultElem.label;
                elem.label = S.substitute(
                    elem.label,
                    {
                        name : elem.name,
                        data : elem.format?P.format(elem.data, elem.format):elem.data
                    }
                );
                self._max = Math.max(self._max, elem.data);
            });
        },

        /**
         * expand the sub element
         * @param {Object} the Element Object
         * @private
         */
        _expandElement : function(data){
            var datas,
                itemdata,
                self = this;
            S.each(data, function(item,idx){
                if(S.isArray(item.datas)){
                    item.items = item.items || [];
                    S.each(item.datas, function(d,n){
                        itemdata = {
                            name : item.name,
                            data : d
                        };
                        if(item.label){
                            itemdata.label = item.label;
                        }
                        if(item.labels && S.isString(item.labels[n])){
                            itemdata.label = item.labels[n];
                        }

                        delete item.datas;
                        item.items.push(itemdata);
                    });
                }

            });
            return data;
        },

        /**
         * normalize Input Element
         * @private
         * @param {Object} input data
         */
        _initElement : function(data){
            var elements = null,
                elem,
                self = this,
                newelem;

            //数组形式
            if(data.elements && S.isArray(data.elements)){
                elements = S.clone(data.elements);
            }

            //对象形式
            if(!data.elements && data.element && S.isArray(data.element.names)){
                elements = [];
                elem = data.element;
                S.each(elem.names, function(name,idx){
                    elements.push({
                        name   : name,
                        data   : self._getLabel(elem.datas, idx),
                        label  : self._getLabel(elem.labels, idx) || elem.label
                    });
                });
            }

            return elements;
        },

        /**
         * 如果是数组，返回label[n]
         * 否则返回labels
         * @private
         * @param {Any} labels of chart
         * @param {Number} offset of label
         */
        _getLabel : function(labels, offset){
            if(S.isArray(labels)){
                return (offset < labels.length) ? labels[offset]:null;
            }else{
                return false;
            }
        }
    });

    P.Data = Data;

    return Data;
},{requires : ["chart/color"]});
