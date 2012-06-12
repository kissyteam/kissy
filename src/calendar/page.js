/**
 * @module     日历
 * @creator  拔赤<lijing00333@163.com>
 */
KISSY.add('calendar/page', function(S, UA, Node, Calendar) {

    S.augment(Calendar, {

        Page: function(config, father) {
            /**
             * 子日历构造器
             * @constructor S.Calendar.Page
             * @param {object} config ,参数列表，需要指定子日历所需的年月
             * @param {object} father,指向Y.Calendar实例的指针，需要共享父框的参数
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
            this.EV = [];
            this.html = [
                '<div class="ks-cal-box" id="{$id}">',
                '<div class="ks-cal-hd">',
                '<a href="javascript:void(0);" class="ks-prev {$prev}"><</a>',
                '<a href="javascript:void(0);" class="ks-title">{$title}</a>',
                '<a href="javascript:void(0);" class="ks-next {$next}">></a>',
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
                '</div>',
                '</div>',
                '<div class="ks-setime hidden">',
                '</div>',
                '<div class="ks-cal-ft {$showtime}">',
                '<div class="ks-cal-time">',
                '时间：00:00 &hearts;',
                '</div>',
                '</div>',
                '<div class="ks-selectime hidden">',//<!--用以存放点选时间的一些关键值-->',
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
            this.Verify = function() {

                var isDay = function(n) {
                    if (!/^\d+$/i.test(n)) {
                        return false;
                    }
                    n = Number(n);
                    return !(n < 1 || n > 31);

                },
                    isYear = function(n) {
                        if (!/^\d+$/i.test(n)) {
                            return false;
                        }
                        n = Number(n);
                        return !(n < 100 || n > 10000);

                    },
                    isMonth = function(n) {
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
            this._renderUI = function() {
                var cc = this,_o = {},ft;
                cc.HTML = '';
                _o.prev = '';
                _o.next = '';
                _o.title = '';
                _o.ds = '';
                if (!cc.prevArrow) {
                    _o.prev = 'hidden';
                }
                if (!cc.nextArrow) {
                    _o.next = 'hidden';
                }
                if (!cc.father.showtime) {
                    _o.showtime = 'hidden';
                }
                _o.id = cc.id = 'ks-cal-' + Math.random().toString().replace(/.\./i, '');
                _o.title = cc.father._getHeadStr(cc.year, cc.month);
                cc.createDS();
                _o.ds = cc.ds;
                cc.father.con.append(cc.father._templetShow(cc.html, _o));
                cc.node = Node.one('#' + cc.id);
                if (cc.father.showTime) {
                    ft = cc.node.one('.ks-cal-ft');
                    ft.removeClass('hidden');
                    cc.timmer = new cc.father.TimeSelector(ft, cc.father);
                }
                return this;
            };
			this.detachEvent = function(){
				var cc = this;
				cc.EV = cc.EV || [];
				//flush event
                S.each(cc.EV, function(tev) {
                    if (tev) {
                        tev.target.detach(tev.type, tev.fn);
                    }
                });
			}
            /**
             * 创建子日历的事件
             */
            this._buildEvent = function() {
                var cc = this,i,
                    tev,
                    con = Node.one('#' + cc.id);
                //flush event
                S.each(cc.EV, function(tev) {
                    if (tev) {
                        tev.target.detach(tev.type, tev.fn);
                    }
                });
                cc.EV = cc.EV || [];
                tev = cc.EV[0] = {
                    target:     con.one('div.ks-dbd'),
                    type:"click",
                    fn:   function(e) {
                        //e.preventDefault();
                        e.target = Node(e.target);
                        if (e.target.hasClass('ks-null')) {
                            return;
                        }
                        if (e.target.hasClass('ks-disabled')) {
                            return;
                        }
                        var selectedd = Number(e.target.html());
                        //如果当天是30日或者31日，设置2月份就会出问题
                        var d = new Date('2010/01/01');
                        d.setYear(cc.year);
                        d.setMonth(cc.month);
                        d.setDate(selectedd);
                        //self.callback(d);
                        //datetime的date
                        cc.father.dt_date = d;
                        cc.father.fire('select', {
                            date:d
                        });
                        if (cc.father.popup && cc.father.closable) {
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
                function bindEventTev() {
                    tev.target.on(tev.type, tev.fn);
                }

                bindEventTev();
                //向前
                tev = cc.EV[1] = {
                    target:con.one('a.ks-prev'),
                    type:'click',
                    fn:function(e) {
                        e.preventDefault();
                        cc.father._monthMinus().render();
                        cc.father.fire('monthChange', {
                            date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                        });

                    }
                };
                bindEventTev();
                //向后
                tev = cc.EV[2] = {
                    target:con.one('a.ks-next'),
                    type:'click',
                    fn: function(e) {
                        e.preventDefault();
                        cc.father._monthAdd().render();
                        cc.father.fire('monthChange', {
                            date:new Date(cc.father.year + '/' + (cc.father.month + 1) + '/01')
                        });
                    }
                };
                bindEventTev();
                if (cc.father.navigator) {
                    tev = cc.EV[3] = {
                        target:con.one('a.ks-title'),
                        type:'click',
                        fn:function(e) {
                            try {
                                cc.timmer.hidePopup();
                                e.preventDefault();
                            } catch(exp) {
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
                            con.one('input').on('keydown', function(e) {
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
                    tev = cc.EV[4] = {
                        target:con.one('.ks-setime'),
                        type:'click',
                        fn:function(e) {
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
                return this;

            };
            /**
             * 得到当前子日历的node引用
             */
            this._getNode = function() {
                var cc = this;
                return cc.node;
            };
            /**
             * 得到某月有多少天,需要给定年来判断闰年
             */
            this._getNumOfDays = function(year, month) {
                return 32 - new Date(year, month - 1, 32).getDate();
            };
            /**
             * 生成日期的html
             */
            this.createDS = function() {
                var cc = this,
                    s = '',
                    startOffset = (7-cc.father.startDay+new Date(cc.year + '/' + (cc.month + 1) + '/01').getDay())%7,//当月第一天是星期几
                    days = cc._getNumOfDays(cc.year, cc.month + 1),
					selected = cc.father.selected,
					today = new Date(),
                    i, _td_s;


				for(var i=0;i<startOffset;i++){
					s += '<a href="javascript:void(0);" class="ks-null">0</a>';
				}
				//左莫优化了日历生成
                for (i = 1; i <= days; i++) {
					var cls = '';
					var date = new Date(cc.year,cc.month, i);
					//minDate 和 maxDate都包含当天
					if((cc.father.minDate&&new Date(cc.year,cc.month, i+1)<=cc.father.minDate) || (cc.father.maxDate&&date>cc.father.maxDate)){
						cls = 'ks-disabled';
					}
					else if(cc.father.range&&date>=cc.father.range.start&&date<=cc.father.range.end){
						cls = 'ks-range';
					}
					else if(selected&&selected.getFullYear() == cc.year&&selected.getMonth() == cc.month&&selected.getDate()==i){
						cls = 'ks-selected';
					}

					if(today.getFullYear() == cc.year&&today.getMonth() == cc.month&&today.getDate()==i){
						cls += ' ks-today';
					}

					s += '<a '+(cls?'class='+cls:'')+' href="javascript:void(0);">' + i + '</a>';
				}
                cc.ds = s;
                return this;
            };
            /**
             * 渲染
             */
            this.render = function() {
                var cc = this;
                cc._renderUI();
                cc._buildEvent();
                return this;
            };


        }//Page constructor over
    });
    return Calendar;
}, { requires:["ua","node","calendar/base"] });
