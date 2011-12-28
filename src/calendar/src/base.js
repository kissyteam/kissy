/**
 * KISSY Calendar
 * @creator  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/base', function (S, Node, Event, undefined) {
    var EventTarget = Event.Target,
        $ = Node.all,
        win = $(window);

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
        _init:function (selector, config) {
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
                    'top':'0px',
                    'position':'absolute',
                    'background':'white',
                    'visibility':'hidden',
                    'z-index':99999999
                });
            }
            self.C_Id = self._stamp(self.con);

            self.render();
            self._buildEvent();
            return this;
        },

        /**
         * 日历构造渲染,增加对多日历不联动的处理
         * @param { object }    [o]
         */
        render:function (o) {
            var self = this,
                i,
                _prev, _next, _oym;

            o = o || {};
            self._parseParam(o);

            self.con.addClass('ks-cal-call ks-clearfix ks-cal-call-multi-' + self.pages);
            self.con.html('');

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
                    _prev = true;
                } else if (!self.rangeLinkage) {
                    _prev = true;
                    if (_rangeEnd && (i + 1) == self.pages) {
                        _oym = [self.range.end.getFullYear(), self.range.end.getMonth()];
                    }
                    else {
                        _oym = self._computeNextMonth(_oym);
                    }
                }
                else {
                    _prev = false;
                    _oym = self._computeNextMonth(_oym);
                }
                if (!self.rangeLinkage) {
                    _next = true;
                }
                else {
                    _next = i == (self.pages - 1);
                }
                self.ca = self.ca || [];
                var cal = self.ca[i];
                if (!self.rangeLinkage && cal && (cal.year != _oym[0] || cal.month != _oym[1])) {
                    _oym = [cal.year, cal.month];
                }

                self.ca[i] = new self.Page({
                    year:_oym[0],
                    month:_oym[1],
                    prevArrow:_prev,
                    nextArrow:_next,
                    showTime:self.showTime
                }, self);
                self.ca[i].render();
            }
            return this;

        },

        /**
         * 用以给容器打上id的标记,容器有id则返回
         * @method _stamp
         * @param el
         * @return {string}
         * @private
         */
        _stamp:function (el) {
            if (!el.attr('id')) {
                el.attr('id', S.guid('K_Calendar'));
            }
            return el.attr('id');
        },


        /**
         * 创建日历外框的事件
         * @method _buildEvent
         */
        _buildEvent:function () {
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
                target:$(document),
                type:'click'
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
                        x:self.con.offset().left,
                        y:self.con.offset().top
                    },
                    {
                        x:self.con.offset().left + self.con.width(),
                        y:self.con.offset().top + self.con.height()
                    }
                ])) {
                    self.hide();
                }
            };
            tev.target.on(tev.type, tev.fn);
            //点击触点
            for (i = 0; i < self.triggerType.length; i++) {
                tev = self.EV[i + 1] = {
                    target:$('#' + self.id),
                    type:self.triggerType[i],
                    fn:function (e) {
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
        __getAlignOffset:function (node, align) {

            var V = align.charAt(0),
                H = align.charAt(1),
                offset, w, h, x, y;

            if (node) {
                node = Node.one(node);
                offset = node.offset();
                w = node.outerWidth();
                h = node.outerHeight();
            } else {
                offset = { left:win.scrollLeft(), top:win.scrollTop() };
                w = win.width();
                h = win.height();
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

            return { left:x, top:y };

        },
        /**
         * 改变日历是否显示的状态
         * @mathod toggle
         */
        toggle:function () {
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
        show:function () {
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
        hide:function () {
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
        _buildParam:function (o) {
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
                date:new Date(),
                selected:null,
                startDay:0,
                pages:1,
                closable:false,
                rangeSelect:false,
                minDate:false,
                maxDate:false,
                "multiSelect":false,
                navigator:true,
                popup:false,
                showTime:false,
                triggerType:['click'],
                //新增加的配置参数
                disabled:null, //禁止点击的日期数组[new Date(),new Date(2011,11,26)]
                range:null, //已选择的时间段{start:null,end:null}
                rangeLinkage:true,
                align:{
                    points:['bl', 'tl'],
                    offset:[0, 0]
                }, //对其方式
                notLimited:false// 是否出现不限的按钮
            }, setParam);


            // 支持用户传进来一个string
            if (typeof o.triggerType === 'string') {
                o.triggerType = [o.triggerType];
            }

            self.startDay = self.startDay % 7;
            if (self.startDay < 0) {
                self.startDay += 7;
            }

            self.EV = [];
            return this;
        },

        /**
         * 过滤参数列表
         * @method _parseParam
         * @private
         */
        _parseParam:function (o) {
            var self = this, i;
            if (o === undefined || o === null) {
                o = {};
            }
            for (i in o) {
                self[i] = o[i];
            }
            self._handleDate();
            return this;
        },

        /**
         * 模板函数
         * @method _templetShow
         * @private
         */
        _templetShow:function (templet, data) {
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
        _handleDate:function () {
            var self = this,
                date = self.date;
            self.weekday = date.getDay() + 1;//星期几 //指定日期是星期几
            self.day = date.getDate();//几号
            self.month = date.getMonth();//月份
            self.year = date.getFullYear();//年份
            return this;
        },

        //get标题
        _getHeadStr:function (year, month) {
            return year.toString() + '年' + (Number(month) + 1).toString() + '月';
        },

        //月加
        _monthAdd:function () {
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
        _monthMinus:function () {
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
        _yearAdd:function () {
            var self = this;
            self.year++;
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //年减
        _yearMinus:function () {
            var self = this;
            self.year--;
            self.date = new Date(self.year.toString() + '/' + (self.month + 1).toString() + '/1');
            return this;
        },

        //裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
        _computeNextMonth:function (a) {
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
        _handleOffset:function () {
            var self = this,
                data = ['日', '一', '二', '三', '四', '五', '六'],
                temp = '<span>{$day}</span>',
                offset = self.startDay,
                day_html,
                a = [];
            for (var i = 0; i < 7; i++) {
                a[i] = {
                    day:data[(i + offset) % 7]
                };
            }
            day_html = self._templetShow(temp, a);

            return {
                day_html:day_html
            };
        },

        //处理起始日期,d:Date类型
        _handleRange:function (d) {
            var self = this, t;
            self.range = self.range || {start:null, end:null};
            if ((self.range.start === null && self.range.end === null ) || (self.range.start !== null && self.range.end !== null)) {
                self.range.start = d;
                self.range.end = null;
                self.render();
            } else if (self.range.start !== null && self.range.end === null) {
                self.range.end = d;
                if (self.range.start.getTime() > self.range.end.getTime()) {
                    t = self.range.start;
                    self.range.start = self.range.end;
                    self.range.end = t;
                }
                self.fire('rangeSelect', self.range);

                self.render();
                if (self.popup && self.closable) {
                    self.hide();
                }
            }
            return this;
        }
    });

    return Calendar;
}, { requires:['node', "event"] });

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