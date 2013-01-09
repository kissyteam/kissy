/**
 * @     日历
 * @author  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/page', function (S, Node, Calendar) {

    S.augment(Calendar, {

        Page:function (config, father) {
            /**
             * 子日历构造器
             * @constructor S.Calendar.Page
             * @param {Object} config ,参数列表，需要指定子日历所需的年月
             * @param {Object} father,指向Y.Calendar实例的指针，需要共享父框的参数
             * @return 子日历的实例
             */

                //属性
            this.father = father;
            this.month = Number(config.month);
            this.year = Number(config.year);
            this.prevArrow = config.prevArrow;
            this.nextArrow = config.nextArrow;
            this.node = null;
            this.timmer = null;//时间选择的实例
            this.id = '';
            this.html = [
                '<div class="ks-cal-box" id="{$id}">',
                '<div class="ks-cal-hd">',
                '<a href="javascript:void(0);" class="ks-prev-year {$prev}"><</a><a href="javascript:void(0);" class="ks-prev-month {$prev}"><</a>',
                '<a href="javascript:void(0);" class="ks-title">{$title}</a>',
                '<a href="javascript:void(0);" class="ks-next-month {$next}">></a><a href="javascript:void(0);" class="ks-next-year {$next}">></a>',
                '</div>',
                '<div class="ks-cal-bd">',
                '<div class="ks-whd">',
                /*
                 '<span>日</span>',
                 '<span>一</span>',
                 '<span>二</span>',
                 '<span>三</span>',
                 '<span>四</span>',
                 '<span>五</span>',
                 '<span>六</span>',
                 */
                father._handleOffset().day_html,
                '</div>',
                '<div class="ks-dbd ks-clearfix">',
                '{$ds}',
                /*
                 <a href="" class="ks-null">1</a>
                 <a href="" class="ks-disabled">3</a>
                 <a href="" class="ks-selected">1</a>
                 <a href="" class="ks-today">1</a>
                 <a href="">1</a>
                 */
                '<div style="clear:both;"></div>',
                '</div>',
                '</div>',
                '<div class="ks-setime hidden">',
                '</div>',
                '<div class="{$notlimited}"><a href="#" class="ks-cal-notLimited {$notlimitedCls}">不限</a></div>',
                '<div class="ks-multi-select {$multiSelect}"><button class="ks-multi-select-btn">确定</button></div>',
                '<div class="ks-cal-ft {$showtime}">',
                '<div class="ks-cal-time">',
                '时间：00:00 &hearts;',
                '</div>',
                '</div>',
                '<div class="ks-selectime hidden">', //<!--用以存放点选时间的一些关键值-->',
                '</div>',
                '</div><!--#ks-cal-box-->'
            ].join("");
            this.nav_html = [
                '<p>',
                '月',
                '<select' +
                    ' value="{$the_month}">',
                '<option class="m1" value="1">01</option>',
                '<option class="m2" value="2">02</option>',
                '<option class="m3" value="3">03</option>',
                '<option class="m4" value="4">04</option>',
                '<option class="m5" value="5">05</option>',
                '<option class="m6" value="6">06</option>',
                '<option class="m7" value="7">07</option>',
                '<option class="m8" value="8">08</option>',
                '<option class="m9" value="9">09</option>',
                '<option class="m10" value="10">10</option>',
                '<option class="m11" value="11">11</option>',
                '<option class="m12" value="12">12</option>',
                '</select>',
                '</p>',
                '<p>',
                '年',
                '<input type="text" value="{$the_year}" onfocus="this.select()"/>',
                '</p>',
                '<p>',
                '<button class="ok">确定</button><button class="cancel">取消</button>',
                '</p>'
            ].join("");


            //方法
            //常用的数据格式的验证
            this.Verify = function () {

                var isDay = function (n) {
                    if (!/^\d+$/i.test(n)) {
                        return false;
                    }
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function (n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function (n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 1 || n > 12);


                    };

                return {
                    isDay:isDay,
                    isYear:isYear,
                    isMonth:isMonth

                };


            };

            /**
             * 渲染子日历的UI
             */
            this._renderUI = function () {
                var cc = this, _o = {}, ft;
                cc.HTML = '';
                _o.prev = '';
                _o.next = '';
                _o.title = '';
                _o.ds = '';
                _o.notlimited = '';
                _o.notlimitedClass = '';
                if (!cc.prevArrow) {
                    _o.prev = 'hidden';
                }
                if (!cc.nextArrow) {
                    _o.next = 'hidden';
                }
                if (!cc.father.showTime) {
                    _o.showtime = 'hidden';
                }
                if (!cc.father.notLimited) {
                    _o.notlimited = 'hidden';
                }
                if (!cc.father.multiSelect) {
                    _o.multiSelect = 'hidden';
                }
                if (cc.father.showTime && cc.father.notLimited) {
                    _o.notlimitedCls = 'ks-cal-notLimited-showTime';
                }
                if (cc.father.notLimited && !cc.father.selected) {
                    _o.notlimitedCls += ' ks-cal-notLimited-selected';
                }
                _o.id = cc.id = 'ks-cal-' + Math.random().toString().replace(/.\./i, '');
                _o.title = cc.father._getHeadStr(cc.year, cc.month);
                cc.createDS();
                _o.ds = cc.ds;
                cc.father.con.append(cc.father._templetShow(cc.html, _o));
                cc.node = Node.one('#' + cc.id);
                if (cc.father.showTime) {
                    ft = cc.node.one('.ks-cal-ft');
                    cc.timmer = new cc.father.TimeSelector(ft, cc.father);
                }
                return this;
            };

            this.detachEvent = function () {
                var cc = this;
                cc.EV = cc.EV || [];
                //flush event
                S.each(cc.EV, function (tev) {
                    if (tev) {
                        tev.target.detach(tev.type, tev.fn);
                    }
                });
            };

            /**
             * 创建子日历的事件
             */
            this._buildEvent = function () {
                var cc = this, i,
                    tev,
                    con = Node.one('#' + cc.id);

                function bindEventTev() {
                    tev.target.on(tev.type, tev.fn);
                }

                cc.EV = [];
                if (!cc.father.multiSelect) {
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('div.ks-dbd'),
                        type:"click",
                        fn:function (e) {
                            e.preventDefault();
                            if (e.target.tagName != 'A') {
                                //如果不是点击在A标签上，直接return;
                                return;
                            }
                            e.target = Node(e.target);

                            if (e.target.hasClass('ks-null')) {
                                return;
                            }
                            if (e.target.hasClass('ks-disabled')) {
                                return;
                            }
                            var d = new Date(cc.year, cc.month, Number(e.target.html()));
                            cc.father.dt_date = d;
                            cc.father.fire('select', {
                                date:d
                            });
                            if (cc.father.popup && cc.father.closable && !cc.father.showTime && !cc.father.rangeSelect) {
                                cc.father.hide();
                            }
                            if (cc.father.rangeSelect) {
                                //如果包含time，这显示完整的时间
                                if(cc.timmer){
                                    d.setHours(cc.timmer.get('h'));
                                    d.setMinutes(cc.timmer.get('m'));
                                    d.setSeconds(cc.timmer.get('s'));
                                }
                                cc.father._handleRange(d);
                            }
                            cc.father.render({selected:d});
                        }
                    };
                    bindEventTev();
                }

                //向前一月
                tev = cc.EV[cc.EV.length] = {
                    target:con.one('a.ks-prev-month'),
                    type:'click',
                    fn:function (e) {
                        e.preventDefault();
                        if (!cc.father.rangeLinkage) {
                            cc._monthMinus();
                        }
                        cc.father._monthMinus().render();
                        cc.father.fire('monthChange', {
                            date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                        });
                    }
                };
                bindEventTev();
                //向后一月
                tev = cc.EV[cc.EV.length] = {
                    target:con.one('a.ks-next-month'),
                    type:'click',
                    fn:function (e) {
                        e.preventDefault();
                        if (!cc.father.rangeLinkage) {
                            cc._monthAdd();
                        }
                        cc.father._monthAdd().render();
                        cc.father.fire('monthChange', {
                            date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                        });
                    }
                };
                bindEventTev();
                //向前一年
                tev = cc.EV[cc.EV.length] = {
                    target:con.one('a.ks-prev-year'),
                    type:'click',
                    fn:function (e) {
                        e.preventDefault();
                        if (!cc.father.rangeLinkage) {
                            cc._yearMinus();
                        }
                        cc.father._yearMinus().render();
                        cc.father.fire('monthChange', {
                            date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                        });
                    }
                };
                bindEventTev();
                //向后一年
                tev = cc.EV[cc.EV.length] = {
                    target:con.one('a.ks-next-year'),
                    type:'click',
                    fn:function (e) {
                        e.preventDefault();
                        if (!cc.father.rangeLinkage) {
                            cc._yearAdd();
                        }
                        cc.father._yearAdd().render();
                        cc.father.fire('monthChange', {
                            date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                        });
                    }
                };
                bindEventTev();
                if (cc.father.navigator) {
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('a.ks-title'),
                        type:'click',
                        fn:function (e) {
                            try {
                                cc.timmer.hidePopup();
                                e.preventDefault();
                            } catch (exp) {
                            }
                            e.target = Node(e.target);
                            var setime_node = con.one('.ks-setime');
                            setime_node.html('');
                            var in_str = cc.father._templetShow(cc.nav_html, {
                                the_month:cc.month + 1,
                                the_year:cc.year
                            });
                            setime_node.html(in_str);
                            setime_node.removeClass('hidden');
                            con.one('input').on('keydown', function (e) {
                                e.target = Node(e.target);
                                if (e.keyCode == 38) {//up
                                    e.target.val(Number(e.target.val()) + 1);
                                    e.target[0].select();
                                }
                                if (e.keyCode == 40) {//down
                                    e.target.val(Number(e.target.val()) - 1);
                                    e.target[0].select();
                                }
                                if (e.keyCode == 13) {//enter
                                    var _month = con.one('.ks-setime').one('select').val();
                                    var _year = con.one('.ks-setime').one('input').val();
                                    con.one('.ks-setime').addClass('hidden');
                                    if (!cc.Verify().isYear(_year)) {
                                        return;
                                    }
                                    if (!cc.Verify().isMonth(_month)) {
                                        return;
                                    }
                                    cc.father.render({
                                        date:new Date(_year + '/' + _month + '/01')
                                    });
                                    cc.father.fire('monthChange', {
                                        date:new Date(_year + '/' + _month + '/01')
                                    });
                                }
                            });
                        }
                    };
                    bindEventTev();
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('.ks-setime'),
                        type:'click',
                        fn:function (e) {
                            e.preventDefault();
                            e.target = Node(e.target);
                            if (e.target.hasClass('ok')) {
                                var _month = con.one('.ks-setime').one('select').val(),
                                    _year = con.one('.ks-setime').one('input').val();
                                con.one('.ks-setime').addClass('hidden');
                                if (!cc.Verify().isYear(_year)) {
                                    return;
                                }
                                if (!cc.Verify().isMonth(_month)) {
                                    return;
                                }
                                cc.father.render({
                                    date:new Date(_year + '/' + _month + '/01')
                                });
                                cc.father.fire('monthChange', {
                                    date:new Date(_year + '/' + _month + '/01')
                                });
                            } else if (e.target.hasClass('cancel')) {
                                con.one('.ks-setime').addClass('hidden');
                            }
                        }
                    };
                    bindEventTev();
                }

                if (cc.father.notLimited) {
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('.ks-cal-notLimited'),
                        type:'click',
                        fn:function (e) {
                            e.preventDefault();
                            cc.father.range = {start:null, end:null};
                            cc.father.fire('select', {date:null});
                            if (cc.father.popup && cc.father.closable) {
                                cc.father.hide();
                            }
                            cc.father.render({selected:null});
                        }
                    };
                    bindEventTev();
                }
                if (cc.father.multiSelect) {
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('div.ks-dbd'),
                        type:"mousedown",
                        fn:function (e) {
                            e.preventDefault();
                            if (e.target.tagName != 'A') {
                                return;
                            }
                            e.target = Node(e.target);

                            if (e.target.hasClass('ks-null')) {
                                return;
                            }
                            if (e.target.hasClass('ks-disabled')) {
                                return;
                            }
                            var d = new Date(cc.year, cc.month, Number(e.target.html()));
                            cc.father._handleMultiSelectStart(d)
                        }
                    };
                    bindEventTev();
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('div.ks-dbd'),
                        type:"mouseup",
                        fn:function (e) {
                            e.preventDefault();
                            if (e.target.tagName != 'A') {
                                return;
                            }
                            e.target = Node(e.target);
                            if (e.target.hasClass('ks-null')) {
                                return;
                            }
                            if (e.target.hasClass('ks-disabled')) {
                                return;
                            }
                            var d = new Date(cc.year, cc.month, Number(e.target.html()));
                            cc.father._handleMultiSelectEnd(d);
                            //cc.father.render();
                        }
                    };
                    bindEventTev();
                    tev = cc.EV[cc.EV.length] = {
                        target:con.one('.ks-multi-select-btn'),
                        type:"click",
                        fn:function (e) {
                            e.preventDefault();
                            cc.father._handleMultiSelect();
                            //cc.father.render();
                        }
                    };
                    bindEventTev();
                }

                return this;

            };
            //月加
            this._monthAdd = function () {
                var self = this;
                if (self.month == 11) {
                    self.year++;
                    self.month = 0;
                } else {
                    self.month++;
                }
            },

                //月减
                this._monthMinus = function () {
                    var self = this;
                    if (self.month === 0) {
                        self.year--;
                        self.month = 11;
                    } else {
                        self.month--;
                    }
                },
                //年加
                this._yearAdd = function () {
                    var self = this;
                    self.year++;
                };

            //年减
            this._yearMinus = function () {
                var self = this;
                self.year--;
            };

            /**
             * 得到当前子日历的node引用
             */
            this._getNode = function () {
                var cc = this;
                return cc.node;
            };
            /**
             * 得到某月有多少天,需要给定年来判断闰年
             */
            this._getNumOfDays = function (year, month) {
                return 32 - new Date(year, month - 1, 32).getDate();
            };

            this._isDisabled = function (arrDisabled, date) {
                if (arrDisabled && arrDisabled.length > 0) {
                    for (var i = 0; i < arrDisabled.length; i++) {
                        var d = arrDisabled[i];
                        if (date.getFullYear() == d.getFullYear() && date.getMonth() == d.getMonth() && date.getDate() == d.getDate()) {
                            return true;
                        }
                    }
                }
                return false;
            };

            this.isInMulit = function (mulit, date) {
                if (mulit && mulit.length > 0) {
                    for (var i = 0; i < mulit.length; i++) {
                        var arr = mulit[i].split('-');
                        if (date.getFullYear() == parseInt(arr[0], 10) && date.getMonth() == (parseInt(arr[1], 10) - 1) && date.getDate() == parseInt(arr[2], 10)) {
                            return true;
                        }
                    }
                }
                return false;
            };


            /**
             * 生成日期的html
             *
             */
            this.createDS = function () {
                var cc = this,
                    s = '',
                    startOffset = (7 - cc.father.startDay + new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay()) % 7, //当月第一天是星期几
                    days = cc._getNumOfDays(cc.year, cc.month + 1),
                    selected = cc.father.selected,
                    today = new Date(),
                    i, _td_s;


                for (var i = 0; i < startOffset; i++) {
                    s += '<a href="javascript:void(0);" class="ks-null">0</a>';
                }
                //左莫优化了日历生成
                for (i = 1; i <= days; i++) {
                    var cls = '';
                    var date = new Date(cc.year, cc.month, i);
                    //minDate 和 maxDate都包含当天
                    if ((cc.father.minDate && new Date(cc.year, cc.month, i + 1) <= cc.father.minDate) || (cc.father.maxDate && date > cc.father.maxDate) || cc._isDisabled(cc.father.disabled, date)) {
                        cls = 'ks-disabled';
                    }
                    else if (cc.father.range && date >= cc.father.range.start && date <= cc.father.range.end) {
                        cls = 'ks-range';
                    }
                    else if ((selected && selected.getFullYear() == cc.year && selected.getMonth() == cc.month && selected.getDate() == i) || cc.isInMulit(cc.father.multi, date)) {
                        cls = 'ks-selected';
                    }

                    if (today.getFullYear() == cc.year && today.getMonth() == cc.month && today.getDate() == i) {
                        cls += ' ks-today';
                    }

                    s += '<a ' + (cls ? 'class="' + cls + '"' : '') + ' href="javascript:void(0);">' + i + '</a>';
                }
                cc.ds = s;
                return this;
            };
            /**
             * 渲染
             */
            this.render = function () {
                var cc = this;
                cc._renderUI();
                cc._buildEvent();
                return this;
            };


        }//Page constructor over
    });
    return Calendar;
}, { requires:["node", "calendar/base"] });
/**
 * 2010-09-14 拔赤
 *        - 仅支持S.Date.format和S.Date.parse，format仅对常用格式进行支持（不超过10个），也可以自定义
 *        - kissy-lang中是否应当增加Lang.type(o)?或者isDate(d)?
 *        - 模块名称取为datetype还是直接用date? 我更倾向于用date
 *        - YUI的datetype花了大量精力对全球语种进行hack，似乎KISSY是不必要的，KISSY只对中文做hack即可
 */