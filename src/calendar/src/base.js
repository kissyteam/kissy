/**
 *  KISSY Calendar
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/base', function (S, Node, Event, undefined) {
    var EventTarget = Event.Target,
        DOM= S.DOM,
        UA = S.UA,
        $ = Node.all;

    function Calendar(trigger, config) {
        this._init(trigger, config);
    }

    S.augment(Calendar, EventTarget, {

        /**
         * 日历构造函数
         * @method     _init
         * @param { string }    selector
         * @param { string }    config
         * @private
         */
        _init: function (selector, config) {
            /*
             self.con  日历的容器
             self.id   传进来的id
             self.C_Id 永远代表日历容器的ID
             */
            var self = this, trigger = $(selector);
            self.id = self._stamp(trigger);
            self._buildParam(config);
            if (!self.popup) {
                self.con = trigger;
            } else {
                self.trigger = trigger;
                self.con = new Node('<div>');
                $(document.body).append(self.con);

                self.con.css({
                    'top': '0px',
                    'position': 'absolute',
                    'background': 'white',
                    'visibility': 'hidden',
                    'z-index': 99999999
                });
            }
            self.C_Id = self._stamp(self.con);

            self.render();
            self._buildEvent();
            return this;
        },

        /**
         * 日历构造渲染,增加对多日历不联动的处理
         * @param { object }    o
         */
        render: function (o) {
            var self = this,
                i = 0,
                _prev, _next, _oym;

            o = o || {};
            self._parseParam(o);

            self.con.addClass('ks-cal-call ks-clearfix ks-cal-call-multi-' + self.pages);

            self.ca = self.ca || [];
            for (var i = 0; i < self.ca.length; i++) {
                self.ca[i].detachEvent();
            }
            if (self.__shimEl) {
                self.__shimEl.remove();
                delete self.__shimEl;
            }
            self.con.empty();

            //重置日历的个数
            self.ca.length = self.pages;
            var _rangeStart = false;
            var _rangeEnd = false;
            if (self.range) {
                if (self.range.start) {
                    _rangeStart = true;
                }
                if (self.range.end) {
                    _rangeEnd = true;
                }
            }
            if (_rangeStart && !self.rangeLinkage) {

                _oym = [self.range.start.getFullYear(), self.range.start.getMonth()];
            }
            else {
                _oym = [self.year, self.month];
            }

            for (i = 0; i < self.pages; i++) {
                if (i === 0) {
                    if (_rangeStart) {
                        self._time = S.clone(self.range.start);
                    }
                    _prev = true;
                } else if (!self.rangeLinkage) {
                    if (_rangeEnd) {
                        self._time = S.clone(self.range.end);
                    }
                    _prev = true;
                    if (_rangeEnd && (i + 1) == self.pages) {
                        _oym = [self.range.end.getFullYear(), self.range.end.getMonth()];
                    }
                    else {
                        _oym = self._computeNextMonth(_oym);
                    }
                }
                else {
                    if (_rangeEnd) {
                        self._time = S.clone(self.range.end);
                    }
                    _prev = false;
                    _oym = self._computeNextMonth(_oym);
                }
                if (!self.rangeLinkage) {
                    _next = true;
                }
                else {
                    _next = i == (self.pages - 1);
                }

                var cal = self.ca[i];
                if (!self.rangeLinkage && cal && (cal.year != _oym[0] || cal.month != _oym[1])) {
                    _oym = [cal.year, cal.month];
                }

                self.ca[i] = new self.Page({
                    year: _oym[0],
                    month: _oym[1],
                    prevArrow: _prev,
                    nextArrow: _next,
                    showTime: self.showTime
                }, self);
                self.ca[i].render();
            }
            if (self.popup && UA['ie'] === 6) {
                self.__shimEl = new Node("<" + "iframe frameBorder='0' style='position: absolute;" +
                    "border: none;" +
                    "width: expression(this.parentNode.offsetWidth-3);" +
                    "top: 0;" +
                    //"filter: alpha(opacity=0);" +
                    "left: 0;" +
                    "z-index: 0;" +
                    "height: expression(this.parentNode.offsetHeight-3);" + "'></iframe>");
                self.con.prepend(self.__shimEl);
            }
            return this;

        },
        destroy: function () {
            //在清空html前，移除绑定的事件
            var self = this;
            for (var i = 0; i < self.ca.length; i++) {
                self.ca[i].detachEvent();
            }

            S.each(self.EV, function (tev) {
                if (tev) {
                    tev.target.detach(tev.type, tev.fn);
                }
            });
            self.con.remove();
        },
        /**
         * 用以给容器打上id的标记,容器有id则返回
         * @method _stamp
         * @param el
         * @return {string}
         * @private
         */
        _stamp: function (el) {
            if (!el.attr('id')) {
                el.attr('id', S.guid('K_Calendar'));
            }
            return el.attr('id');
        },


        /**
         * 创建日历外框的事件
         * @method _buildEvent
         * @private
         */
        _buildEvent: function () {
            var self = this, tev, i;
            if (!self.popup) {
                return this;
            }
            //点击空白
            //flush event
            S.each(self.EV, function (tev) {
                if (tev) {
                    tev.target.detach(tev.type, tev.fn);
                }
            });
            self.EV = self.EV || [];
            tev = self.EV[0] = {
                target: $(document),
                type: 'click'
            };
            tev.fn = function (e) {
                var target = $(e.target);
                //点击到日历上
                if (target.attr('id') === self.C_Id) {
                    return;
                }
                if ((target.hasClass('ks-next') || target.hasClass('ks-prev')) &&
                    target[0].tagName === 'A') {
                    return;
                }
                //点击在trigger上
                if (target.attr('id') == self.id) {
                    return;
                }

                if (self.con.css('visibility') == 'hidden') {
                    return;
                }

                // bugfix by jayli - popup状态下，点击选择月份的option时日历层关闭
                if (self.con.contains(target) &&
                    (target[0].nodeName.toLowerCase() === 'option' ||
                        target[0].nodeName.toLowerCase() === 'select')) {
                    return;
                }

                var inRegion = function (dot, r) {
                    return dot[0] > r[0].x
                        && dot[0] < r[1].x
                        && dot[1] > r[0].y
                        && dot[1] < r[1].y;
                };
                if (!inRegion([e.pageX, e.pageY], [
                    {
                        x: self.con.offset().left,
                        y: self.con.offset().top
                    },
                    {
                        x: self.con.offset().left + self.con.width(),
                        y: self.con.offset().top + self.con.height()
                    }
                ])) {
                    self.hide();
                }
            };
            tev.target.on(tev.type, tev.fn);
            //点击触点
            for (i = 0; i < self.triggerType.length; i++) {
                tev = self.EV[i + 1] = {
                    target: $('#' + self.id),
                    type: self.triggerType[i],
                    fn: function (e) {
                        e.target = $(e.target);
                        e.preventDefault();
                        //如果focus和click同时存在的hack

                        var a = self.triggerType;
                        if (S.inArray('click', a) && S.inArray('focus', a)) {//同时含有
                            if (e.type == 'focus') {
                                self.toggle();
                            }
                        } else if (S.inArray('click', a) && !S.inArray('focus', a)) {//只有click
                            if (e.type == 'click') {
                                self.toggle();
                            }
                        } else if (!S.inArray('click', a) && S.inArray('focus', a)) {//只有focus
                            setTimeout(function () {//为了跳过document.onclick事件
                                self.toggle();
                            }, 170);
                        } else {
                            self.toggle();
                        }

                    }
                };
                tev.target.on(tev.type, tev.fn);
            }
            return this;
        },

        //处理对齐
        __getAlignOffset: function (node, align) {
            var V = align.charAt(0),
                H = align.charAt(1),
                offset, w, h, x, y;

            if (node) {
                node = Node.one(node);
                offset = node.offset();
                w = node.outerWidth();
                h = node.outerHeight();
            } else {
                offset = { left: DOM.scrollLeft(), top: DOM.scrollTop() };
                w = DOM.viewportWidth();
                h = DOM.viewportHeight();
            }

            x = offset.left;
            y = offset.top;

            if (V === 'c') {
                y += h / 2;
            } else if (V === 'b') {
                y += h;
            }

            if (H === 'c') {
                x += w / 2;
            } else if (H === 'r') {
                x += w;
            }

            return { left: x, top: y };

        },
        /**
         * 改变日历是否显示的状态
         * @mathod toggle
         */
        toggle: function () {
            var self = this;
            if (self.con.css('visibility') == 'hidden') {
                self.show();
            } else {
                self.hide();
            }
        },

        /**
         * 显示日历
         * @method show
         */
        show: function () {
            var self = this;
            self.con.css('visibility', '');
            var points = self.align.points,
                offset = self.align.offset || [0, 0],
                xy = self.con.offset(),
                p1 = self.__getAlignOffset(self.trigger, points[0]),
                p2 = self.__getAlignOffset(self.con, points[1]),
                diff = [p2.left - p1.left, p2.top - p1.top],
                _x = xy.left - diff[0] + offset[0],
                _y = xy.top - diff[1] + offset[1];

            self.con.css('left', _x.toString() + 'px');
            self.con.css('top', _y.toString() + 'px');
            self.fire("show");
            return this;
        },

        /**
         * 隐藏日历
         * @method hide
         */
        hide: function () {
            var self = this;
            self.con.css('visibility', 'hidden');
            self.fire("hide");
            return this;
        },

        /**
         * 创建参数列表
         * @method _buildParam
         * @private
         */
        _buildParam: function (o) {
            var self = this;
            if (o === undefined || o === null) {
                o = { };
            }

            function setParam(def, key) {
                var v = o[key];
                // null在这里是“占位符”，用来清除参数的一个道具
                self[key] = (v === undefined || v === null) ? def : v;
            }

            //这种处理方式不错
            S.each({
                date: new Date(), //该日期所在月份, 默认为当天
                selected: null, //当前选中的日期
                startDay: 0, //日历显示星期x为起始日期, 取值范围为0到6, 默认为0,从星期日开始,若取值为1, 则从星期一开始, 若取值为7, 则从周日开始
                pages: 1, //日历的页数, 默认为1, 包含一页日历
                closable: false, //在弹出情况下, 点选日期后是否关闭日历, 默认为false
                rangeSelect: false, //是否支持时间段选择，只有开启时候才会触发rangeSelect事件
                minDate: false, //日历可选择的最小日期
                maxDate: false, //日历可选择的最大日期
                multiSelect: false, //是否支持多选
                multi: null, //多选的日期数组
                navigator: true, //是否可以通过点击导航输入日期,默认开启
                popup: false, //日历是否为弹出,默认为false
                showTime: false, //是否显示时间的选择,默认为false
                triggerType: ['click'], //弹出状态下, 触发弹出日历的事件, 例如：[‘click’,’focus’],也可以直接传入’focus’, 默认为[‘click’]
                disabled: null, //禁止点击的日期数组[new Date(),new Date(2011,11,26)]
                range: null, //已选择的时间段{start:null,end:null}
                rangeLinkage: true, //多个日历是否联动
                align: {
                    points: ['bl', 'tl'],
                    offset: [0, 0]
                }, //对齐方式
                notLimited: false// 是否出现不限的按钮
            }, setParam);


            return this;
        },

        /**
         * 过滤参数列表
         * @method _parseParam
         * @private
         */
        _parseParam: function (o) {
            var self = this, i;
            if (o === undefined || o === null) {
                o = {};
            }
            for (i in o) {
                self[i] = o[i];
            }

            // 支持用户传进来一个string
            if (typeof self.triggerType === 'string') {
                self.triggerType = [self.triggerType];
            }

            self.startDay = self.startDay % 7;
            if (self.startDay < 0) {
                self.startDay += 7;
            }

            self.EV = [];
            self._handleDate();


            //对multiSelect的处理
            if (self.multiSelect) {
                self.rangeSelect = false;
                self.range = null;
                self.selected = null;
                if (self.multi) {
                    //将传入的日期数组格式化成字符串数组,便于内部操作
                    for (var i = 0; i < self.multi.length; i++) {
                        if (self.multi[i] instanceof Date) {
                            self.multi[i] = self._handleDate2String(self.multi[i]);
                        }
                    }
                }
            }
            return this;
        },

        /**
         * 模板函数
         * @method _templetShow
         * @private
         */
        _templetShow: function (templet, data) {
            var str_in, value_s, i, m, value, par;
            if (data instanceof Array) {
                str_in = '';
                for (i = 0; i < data.length; i++) {
                    str_in += arguments.callee(templet, data[i]);
                }
                templet = str_in;
            } else {
                value_s = templet.match(/{\$(.*?)}/g);
                if (data !== undefined && value_s !== null) {
                    for (i = 0, m = value_s.length; i < m; i++) {
                        par = value_s[i].replace(/({\$)|}/g, '');
                        value = (data[par] !== undefined) ? data[par] : '';
                        templet = templet.replace(value_s[i], value);
                    }
                }
            }
            return templet;
        },

        /**
         * 处理日期
         * @method _handleDate
         * @private
         */
        _handleDate: function () {
            var self = this,
                date = self.date;
            self.weekday = date.getDay() + 1;//星期几 //指定日期是星期几
            self.day = date.getDate();//几号
            self.month = date.getMonth();//月份
            self.year = date.getFullYear();//年份
            return this;
        },
        /**
         * 处理日期TO字符串
         * @method _handleDate2String
         * @private
         */
        _handleDate2String: function (d) {
            var year = d.getFullYear();
            var month = d.getMonth();
            var date = d.getDate();
            return year + '-' + (month > 8 ? (month + 1) : '0' + (month + 1)) + '-' + (date > 9 ? date : '0' + date);
        },
        /**
         * 处理字符串TO日期
         * @method _handleString2Date
         * @private
         */
        _handleString2Date: function (str) {
            var arr = str.toString().split('-');
            if (arr.length == 3) {
                var date = new Date(parseInt(arr[0], 10), (parseInt(arr[1], 10) - 1), parseInt(arr[2], 10));
                if (date instanceof Date && (date != "Invalid Date") && !isNaN(date)) {
                    return date;
                }
            }
        },

        //get标题
        _getHeadStr: function (year, month) {
            return year.toString() + '年' + (Number(month) + 1).toString() + '月';
        },

        //月加
        _monthAdd: function () {
            var self = this;
            if (self.month == 11) {
                self.year++;
                self.month = 0;
            } else {
                self.month++;
            }
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //月减
        _monthMinus: function () {
            var self = this;
            if (self.month === 0) {
                self.year--;
                self.month = 11;
            } else {
                self.month--;
            }
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },
        //年加
        _yearAdd: function () {
            var self = this;
            self.year++;
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //年减
        _yearMinus: function () {
            var self = this;
            self.year--;
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
        _computeNextMonth: function (a) {
            var _year = a[0],
                _month = a[1];
            if (_month == 11) {
                _year++;
                _month = 0;
            } else {
                _month++;
            }
            return [_year, _month];
        },

        //处理日期的偏移量
        _handleOffset: function () {
            var self = this,
                data = ['日', '一', '二', '三', '四', '五', '六'],
                temp = '<span>{$day}</span>',
                offset = self.startDay,
                day_html = '',
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day: data[(i + offset) % 7]
                };
            }
            day_html = self._templetShow(temp, a);

            return {
                day_html: day_html
            };
        },

        //处理起始日期,d:Date类型
        _handleRange: function (d) {
            var self = this, t;
            self.range = self.range || {start: null, end: null};
            if ((self.range.start === null && self.range.end === null ) || (self.range.start !== null && self.range.end !== null)) {
                self.range.start = d;
                self.range.end = null;
            } else if (self.range.start !== null && self.range.end === null) {
                self.range.end = d;
                if (self.range.start.getTime() > self.range.end.getTime()) {
                    t = self.range.start;
                    self.range.start = self.range.end;
                    self.range.end = t;
                }
                self.fire('rangeSelect', self.range);
                if (self.popup && self.closable) {
                    self.hide();
                }
            }
            return this;
        },
        //开始多选
        _handleMultiSelectStart: function (d) {
            var self = this;
            self.multiStart = d;

        },
        _handleMultiSelectEnd: function (d) {

            var self = this;
            if (!self.multiStart) {
                return;
            }
            self.multi = self.multi || [];
            if (d < self.multiStart) {
                self.multiEnd = self.multiStart;
                self.multiStart = d;
            }
            else {
                self.multiEnd = d;
            }

            //对min和max的处理
            if (self.minDate && self.multiStart < self.minDate) {
                self.multiStart = new Date(self.minDate.getFullYear(), self.minDate.getMonth(), self.minDate.getDate());//这里需要重新创建对象
            }
            if (self.maxDate && self.multiEnd > self.maxDate) {
                self.multiEnd = new Date(self.maxDate.getFullYear(), self.maxDate.getMonth(), self.maxDate.getDate());
            }

            while (self.multiStart <= self.multiEnd) {

                var isDisabled = false;
                //需要处理disabled
                if (self.disabled && self.disabled.length > 0) {
                    for (var i = 0; i < self.disabled.length; i++) {
                        var disabled = self.disabled[i];
                        if (disabled.getTime() == self.multiStart.getTime()) {
                            isDisabled = true;
                            break;
                        }
                    }
                }
                if (isDisabled) {
                    continue;
                }
                var str = self._handleDate2String(self.multiStart);
                if (!S.inArray(str, self.multi)) {
                    self.multi.push(str);
                }
                else {
                    self.multi.splice(S.indexOf(str, self.multi), 1);
                }
                self.multiStart.setDate(self.multiStart.getDate() + 1);
            }
            self.multiStart = null;
            self.render();
        },
        _handleMultiSelect: function () {
            var self = this;
            //这里对multi进行排序和处理成日期格式
            self.multi = self.multi || [];
            self.multi.sort(function (a, b) {
                if (a > b) {
                    return 1;
                }
                return -1;
            });
            for (var i = 0; i < self.multi.length; i++) {
                self.multi[i] = self._handleString2Date(self.multi[i])
            }

            self.fire('multiSelect', {multi: self.multi});
            if (self.popup && self.closable) {
                self.hide();
            }

        }
    });

    return Calendar;
}, { requires: ['node', "event"] });

/**
 *
 * 2011-12-27 by keyapril@gmail.com
 1.新增配置参数：
 disabled:null, //禁止点击的日期数组[new Date(),new Date(2011,11,26)]
 range:    null,//已选择的时间段{start:null,end:null}
 align:{
 points:['bl','tl'],
 offset:[0,0]
 },//对其方式
 notLimited:    false,// 是否出现不限的按钮
 rangLinkage //多个日历是否联动
 2.新增加功能
 -加入了"年"的前进后退
 -加入了不限按钮，在点击之后触发“select”事件，参数为null,
 -Date.parse方法新增对"2011-12-27"字符串的处理
 3.bug修复
 -修复最小最大日期限制后31号始终可点击的BUG
 4.样式的调整
 -美化了。。。
 *
 * 2011-12-06 by yiminghe@gmail.com
 *  - 全局绑定放 document
 *  - fix 清除事件调用
 *
 * 2010-09-09 by lijing00333@163.com - 拔赤
 *     - 将基于YUI2/3的Calendar改为基于KISSY
 *     - 增加起始日期（星期x）的自定义
 *      - 常见浮层的bugfix
 *
 * TODO:
 *   - 日历日期的输出格式的定制
 *   - 多选日期的场景的交互设计
 */