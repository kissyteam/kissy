/**
 * 依赖yahoo-dom-event.js,element.js,kissy.js
 */
KISSY.add('calendar', function(S) {

/**
 *  全局对象的简写
 */
Y = YAHOO;
$D = Y.util.Dom;
$E = Y.util.Event;
/**
 * calendar.js | 日历控件 基于yui2 & kissy
 * autohr:lijing00333@163.com 拔赤
 * 文件编码 gbk
 * @class Calendar
 * @param { string } 容器或者触点id 
 * @param { object } 配置项
 * @return { object } 生成一个calendar实例
 * @requires { 'element','selector','dom','event','calendar-skin' }
 * @requires { calendar-skin-default } 皮肤
 * 
 * Y.Calenar：	
 *	说明：	日历构造器，通过new Calendar来render一个日历
 *	使用：	new Calendar(id,options);
 *	参数:	id:{string}容器id
 *	配置：	selected {date} 选中的日期
 *			mindate:{date} 最小可选日期
 *			maxdate:{date} 最大可选日期
 *			popup:{boolean} 是否弹出，默认false
 *			closeable:{boolean} 是否单选关闭（弹出状态下起作用），默认为false
 *			range_select:{boolean} 是否选择范围，默认为false
 *			range:{start:date,end:date} 默认选择范围
 *			multi_select:{number} 日历页数，默认为1
 *			date:{date} 默认显示该日期所在的月份，默认为当天
 *			navigator:{boolean} 是否可以选择跳转的月份，默认为true
 *		Calendar的实例的方法：
 *			init:初始化，参数为options
 *			render:渲染，init在new的时候调用，render可以在运行时任意时刻调用，参数为options，其成员可覆盖原参数
 *			hide:隐藏，不会删除窗口
 *			show:显示窗口
 *		
 */

/**
 * @namespace Calendar
 * 约定命名空间
 */
Y.namespace("Calendar");
Calendar = function(){
	this.init.apply(this,arguments);
};
S.mix(Calendar.prototype, { 
	/**
	 * @constructor init
	 * 构造器
	 * 初始化的时候调用
	 */
	init:function(id,config){

		var that = this;
		that.id = that.C_Id = id;
		//构造参数列表
		that.buildParam(config);
		/*
			Calendar实例中的关键值
			that.con，日历的容器
			that.id   传进来的id
			that.C_Id 永远代表日历容器的ID
		*/
		//非弹出日历的容器构造
		if(!that.popup){
			that.con = new Y.util.Element(id);
		} else {
		//弹出日历的容器构造
			var trigger = new Y.util.Element(id);
			that.trigger = trigger;
			that.C_Id = 'C_'+Math.random().toString().replace(/.\./i,'');
			var t_node = document.createElement("div");
			t_node.id = that.C_Id;
			document.getElementsByTagName('body')[0].appendChild(t_node);
			that.con = new Y.util.Element(that.C_Id);
			//默认隐藏弹出的日历容器
			that.con.setStyle('top','0px');
			that.con.setStyle('position','absolute');
			that.con.setStyle('background','white');
			that.con.setStyle('visibility','hidden');
		}
		//创建事件工厂
		that.buildEventCenter();
		//渲染日历
		that.render();
		//关联事件
		that.buildEvent();
		//返回本身
		return this;
	},
	/**
	 * @method buildEventCenter
	 * 创建自定义事件，以及事件工厂
	 */
	buildEventCenter:function(){
		var that = this;
		that.EventCenter = {};
		var EventFactory = function(events){
			for(var i = 0;i<events.length;i++){
				var event_type = events[i];
				that.EventCenter[event_type] = new Y.util.CustomEvent(event_type);
			}
		};
		//自定义事件种类
		EventFactory(['select','switch','rangeselect','timeselect','selectcomplete','hide','show']);
		return this;
	},
	/**
	 * @method on
	 * 绑定事件接口
	 */
	on:function(type,foo){
		var that = this;
		that.EventCenter[type].subscribe(function(type,args){
			foo.apply(foo,args);
		});
		return this;
	},
	/**
	 * @method render
	 * 渲染日历外框
	 */
	render:function(o){
		var that = this;
		var o = o || {};
		that.parseParam(o);
		that.ca = [];

		that.con.addClass('c-call clearfix multi-'+that.multi_page);
		that.con.set('innerHTML','');

		for(var i = 0,_oym = [that.year,that.month]; i<that.multi_page;i++){
			if(i == 0){
				var _prev = true;
			}else{
				var _prev = false;
				_oym = that.computeNextMonth(_oym);
			}
			if(i == (that.multi_page - 1)){
				var _next = true;
			}else {
				var _next = false;	
			}
			that.ca.push(new that.Call({
				year:_oym[0],
				month:_oym[1],
				prev_arrow:_prev,
				next_arrow:_next,
				withtime:that.withtime
			},that));

			//渲染日历内核
			that.ca[i].render();
		}
		return this;

	},
	/**
	 * @method showdate
	 * 计算d天的前几天或者后几天，返回date,chrome下不支持date构造时的天溢出
	 */
	showdate:function(n,d){
		var uom = new Date(d-0+n*86400000);
		uom = uom.getFullYear() + "/" + (uom.getMonth()+1) + "/" + uom.getDate();
		return new Date(uom);
	},
	/**
	 * @method buildEvent
	 * 关联事件
	 */
	buildEvent:function(){
		var that = this;
		if(!that.popup)return this;
		//点击空白
		$E.on(document,'click',function(e){
			var el = $E.getTarget(e);
			if(el.id == that.C_Id)return;

			if(!$D.isAncestor($D.get(that.C_Id),el)){
				that.hide();
			}
			
		});
		//点击触点
		$E.on(that.id,'click',function(e){
			$E.stopEvent(e);
			if(that.con.getStyle('visibility') == 'hidden'){
				that.show();
			}else{
				that.hide();
			}
			
		})
		return this;
	},
	/**
	 * @method show
	 * 显示日历
	 */
	show:function(){
		var that = this;
		that.con.setStyle('visibility','');
		var _x = $D.getXY(that.trigger.get('id'))[0];
		var _y = $D.getXY(that.trigger.get('id'))[1]+Number($D.getRegion(that.trigger.get('id')).height);
		that.con.setStyle('left',_x.toString()+'px');
		that.con.setStyle('top',_y.toString()+'px');
		return this;
	},
	/**
	 * @method hide 
	 * 隐藏日历
	 */
	hide:function(){
		var that = this;
		that.con.setStyle('visibility','hidden');
		return this;
	},
	/**
	 * @method buildParam
	 * 构建参数
	 */
	buildParam:function(o){
		var that = this;
		if(typeof o == 'undefined' || o == null){
			var o = {};
		}
		that.date = (typeof o.date == 'undefined' || o.date == null)?new Date():o.date;
		that.selected = (typeof o.selected == 'undefined' || o.selected == null)?that.date:o.selected;
		that.multi_page = (typeof o.multi_page == 'undefined' || o.multi_page == null)?1:o.multi_page;
		that.closeable = (typeof o.closeable == 'undefined' || o.closeable == null)?false:o.closeable;
		that.range_select = (typeof o.range_select == 'undefined' || o.range_select == null)?false:o.range_select;
		that.mindate = (typeof o.mindate == 'undefined' || o.mindate == null)?false:o.mindate;
		that.maxdate = (typeof o.maxdate == 'undefined' || o.maxdate == null)?false:o.maxdate;
		that.multi_select = (typeof o.multi_select== 'undefined' || o.multi_select == null)?false:o.multi_select;
		that.navigator = (typeof o.navigator == 'undefined' || o.navigator == null)?true:o.navigator;
		that.arrow_left = (typeof o.arrow_left == 'undefined' || o.arrow_left == null)?false:o.arrow_left;
		that.arrow_right = (typeof o.arrow_right == 'undefined' || o.arrow_right == null)?false:o.arrow_right;
		that.popup = (typeof o.popup == 'undefined' || o.popup== null)?false:o.popup;
		that.withtime = (typeof o.withtime == 'undefined' || o.withtime == null)?false:o.withtime;
		that.action = (typeof o.action == 'undefined' || o.action == null)?['click']:o.action;
		if(typeof o.range != 'undefined' && o.range != null){
			var s = that.showdate(1,new Date(o.range.start.getFullYear()+'/'+(o.range.start.getMonth()+1)+'/'+(o.range.start.getDate())));
			var e = that.showdate(1,new Date(o.range.end.getFullYear()+'/'+(o.range.end.getMonth()+1)+'/'+(o.range.end.getDate())));
			that.range = {
				start:s,
				end:e
			};
		}else {
			that.range = {
				start:null,
				end:null
			};
		}
		return this;
	},
	/**
	 * @method parseParam
	 * 重新构建参数
	 */
	parseParam:function(o){
		var that = this;
		if(typeof o == 'undefined' || o == null){
			var o = {};
		}
		for(var i in o){
			that[i] = o[i];
		}
		that.handleDate();
		return this;
	},
	//得到月的天数
	getNumOfDays:function(year,month){
		return 32-new Date(year,month-1,32).getDate();
	},
	//模板函数
	templetShow : function(templet, data){
		var that = this;
		if(data instanceof Array){
			var str_in = '';
			for(var i = 0;i<data.length;i++){
				str_in += that.templetShow(templet,data[i]);
			}
			templet = str_in;
		}else{
			var value_s = templet.match(/{\$(.*?)}/g);
			if(data !== undefined && value_s != null){
				for(var i=0, m=value_s.length; i<m; i++){
					var par = value_s[i].replace(/({\$)|}/g, '');
					value = (data[par] !== undefined) ? data[par] : '';
					templet = templet.replace(value_s[i], value);
				}
			}
		}
		return templet;
	},
	/**
	 * @method handleDate
	 × 处理日历的日期
	 */
	handleDate:function(){
		/*
		待处理的成员变量
		that.month
		that.year
		that.selected
		that.mindate
		that.maxdate
		*/
		var that = this;
		var date = that.date;
		that.weekday= date.getDay() + 1;//星期几 //指定日期是星期几
		that.day = date.getDate();//几号
		that.month = date.getMonth();//月份
		that.year = date.getFullYear();//年份
		return this;
	},
	//get标题
	getHeadStr:function(year,month){
		return year.toString() + '年' + (Number(month)+1).toString() + '月';
	},
	//月加
	monthAdd:function(){
		var that = this;
		if(that.month == 11){
			that.year++;
			that.month = 0;
		}else{
			that.month++;
		}
		that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/'+that.day.toString());
		return this;
	},
	//月减
	monthMinus:function(){
		var that = this;
		if(that.month == 0){
			that.year-- ;
			that.month = 11;
		}else{
			that.month--;
		}
		that.date = new Date(that.year.toString()+'/'+(that.month+1).toString()+'/'+that.day.toString());
		return this;
	},
	//裸算下一个月的年月,[2009,11],年:fullYear，月:从0开始计数
	computeNextMonth:function(a){
		var that = this;
		var _year = a[0];
		var _month = a[1];
		if(_month == 11){
			_year++;
			_month = 0;
		}else{
			_month++;
		}
		return [_year,_month];
	},
	//处理起始日期,d:Date类型
	handleRange : function(d){
		var that = this;
		var d = that.showdate(1,d);
		if((that.range.start == null && that.range.end == null )||(that.range.start != null && that.range.end != null)){
			that.range.start = d;
			that.range.end = null;
			that.render();
		}else if(that.range.start != null && that.range.end == null){
			that.range.end = d;
			if(that.range.start.getTime() > that.range.end.getTime()){
				var __t = that.range.start;
				that.range.start = that.range.end;
				that.range.end = __t;
			}else{
				if(/532/.test(Y.env.ua.webkit)){//hack for chrome
					that.range.start = that.showdate(-1,that.range.start);
				}
			}
			that.EventCenter['rangeselect'].fire(that.range);
			that.render();
		}
		return this;

	},
	//constructor 
	/**
	 * TimeSelector只支持选择，不支持初始化
	 */
	TimeSelector:function(ft,fathor){
		//属性------------------
		this.fathor = fathor;
		//this.fcon = ft.ancestor('.c-box');//cc容器
		this.fcon = $D.getAncestorByClassName(ft,'c-box');
			//var con = new Y.util.Element(cc.id);
		
		this.popupannel = new Y.util.Element($D.getElementsByClassName('selectime','div',this.fcon)[0]);
		
		
		//this.fcon.query('.selectime');//点选时间的弹出层



		if(typeof fathor._time == 'undefined'){//确保初始值和当前时间一致
			fathor._time = new Date();
		}
		this.time = fathor._time;
		this.status = 's';//当前选择的状态，'h','m','s'依次判断更新哪个值
		var _el = document.createElement('div');
		_el.className = 'c-time';
		_el.innerHTML = '时间：<span class="h">h</span>:<span class="m">m</span>:<span class="s">s</span><!--{{arrow--><div class="cta"><button class="u"></button><button class="d"></button></div><!--arrow}}-->';
		this.ctime = new Y.util.Element(_el);
		var _bn = document.createElement('button');
		_bn.className = 'ct-ok';
		_bn.innerHTML = '确定';
		this.button = new Y.util.Element(_bn);
		//this.button = Y.Node.create('<button class="ct-ok">确定</button>');
		//小时
		this.h_a = ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
		//分钟
		this.m_a = ['00','10','20','30','40','50'];
		//秒
		this.s_a = ['00','10','20','30','40','50'];
				

		//接口----------------
		/**
		 * 创建相应的容器html，值均包含在a中
		 * 参数：要拼装的数组
		 * 返回：拼好的innerHTML,结尾还要带一个关闭的a
		 * 
		 */
		this.parseSubHtml = function(a){
			var in_str = '';
			for(var i = 0;i<a.length;i++){
				in_str += '<a href="javascript:void(0);" class="item">'+a[i]+'</a>';
			}
			in_str += '<a href="javascript:void(0);" class="x">x</a>';
			return in_str;
		};
		/**
		 * 显示selectime容器
		 * 参数，构造好的innerHTML
		 */
		this.showPopup= function(instr){
			var that = this;
			this.popupannel.set('innerHTML',instr);
			
			this.popupannel.removeClass('hidden');
			var status = that.status;
			var _con = that.ctime;
			new Y.util.Element($D.getElementsByClassName('h','span',that.ctime)[0]).removeClass('on');
			new Y.util.Element($D.getElementsByClassName('m','span',that.ctime)[0]).removeClass('on');
			new Y.util.Element($D.getElementsByClassName('s','span',that.ctime)[0]).removeClass('on');
			switch(status){
				case 'h':
					new Y.util.Element($D.getElementsByClassName('h','span',that.ctime)[0]).addClass('on');
					break;
				case 'm':
					new Y.util.Element($D.getElementsByClassName('m','span',that.ctime)[0]).addClass('on');
					break;
				case 's':
					new Y.util.Element($D.getElementsByClassName('s','span',that.ctime)[0]).addClass('on');
					break;
			}
		};
		/**
		 * 隐藏selectime容器
		 */
		this.hidePopup= function(){
			var that = this;
			that.popupannel.addClass('hidden');
		};
		/**
		 * 不对其做更多的上下文假设，仅仅根据time显示出来
		 */
		this.render = function(){
			var that = this;
			var h = that.get('h');
			var m = that.get('m');
			var s = that.get('s');
			that.fathor._time = that.time;
			$D.getElementsByClassName('h','span',that.ctime)[0].innerHTML = h;
			$D.getElementsByClassName('m','span',that.ctime)[0].innerHTML = m;
			$D.getElementsByClassName('s','span',that.ctime)[0].innerHTML = s;
			return that;
		};
		//这里的set和get都只是对time的操作，并不对上下文做过多假设
		/**
		 * set(status,v)
		 * h:2,'2'
		 */
		this.set = function(status,v){
			var that = this;
			var v = Number(v);
			switch(status){
				case 'h':
					that.time.setHours(v);
					break;
				case 'm':
					that.time.setMinutes(v);
					break;
				case 's':
					that.time.setSeconds(v);
					break;
			}
			that.render();
		};
		/**
		 * get(status)
		 */
		this.get = function(status){
			var that = this;
			var time = that.time;
			switch(status){
				case 'h':
					return time.getHours();
					break;
				case 'm':
					return time.getMinutes();
					break;
				case 's':
					return time.getSeconds();
					break;
			}
		};

		/**
		 * add()
		 * 状态值代表的变量增1
		 */
		this.add = function(){
			var that = this;
			var status = that.status;
			var v = that.get(status);
			v++;
			that.set(status,v);
		};
		/**
		 * minus()
		 * 状态值代表的变量增1
		 */
		this.minus= function(){
			var that = this;
			var status = that.status;
			var v = that.get(status);
			v--;
			that.set(status,v);
		};
		

		
		//构造---------
		this.init = function(){
			var that = this;
			ft.set('innerHTML','');
			ft.appendChild(that.ctime);
			ft.appendChild(that.button);
			that.render();
			that.popupannel.on('click',function(e){
				var el = new Y.util.Element($E.getTarget(e));
				//var el = e.target;
				if(el.hasClass('x')){//关闭
					that.hidePopup();
					return;
				}else if(el.hasClass('item')){//点选一个值
					var v = Number(el.get('innerHTML'));
					that.set(that.status,v);
					that.hidePopup();
					return;
				}
			});
			//确定的动作
			that.button.on('click',function(e){
				var d = that.fathor.dt_date;
				d.setHours(that.get('h'));
				d.setMinutes(that.get('m'));
				d.setSeconds(that.get('s'));
				//that.fathor.EventCenter.fire('timeselect',d);
				that.fathor.EventCenter['timeselect'].fire(d);
				if(that.fathor.popup && that.fathor.closeable){
					that.fathor.hide();
				}
			});
			//ctime上的键盘事件，上下键，左右键的监听
			//TODO 考虑是否去掉
			/*
			that.ctime.on('keyup',function(e){
				if(e.keyCode == 38 || e.keyCode == 37){//up or left
					e.halt();
					that.add();
				}
				if(e.keyCode == 40 || e.keyCode == 39){//down or right
					e.halt();
					that.minus();
				}
			});
			*/
			//上的箭头动作
			$E.on($D.getElementsByClassName('u','button',that.ctime)[0],'click',function(e){
				that.hidePopup();
				that.add();
			});
			//下的箭头动作
			$E.on($D.getElementsByClassName('d','button',that.ctime)[0],'click',function(e){
				that.hidePopup();
				that.minus();
			});
			//弹出选择小时
			$E.on($D.getElementsByClassName('h','span',that.ctime)[0],'click',function(e){
				var in_str = that.parseSubHtml(that.h_a);
				that.status = 'h';
				that.showPopup(in_str);
			});
			//弹出选择分钟
			$E.on($D.getElementsByClassName('m','span',that.ctime)[0],'click',function(e){
				var in_str = that.parseSubHtml(that.m_a);
				that.status = 'm';
				that.showPopup(in_str);
			});
			//弹出选择秒
			$E.on($D.getElementsByClassName('s','span',that.ctime)[0],'click',function(e){
				var in_str = that.parseSubHtml(that.s_a);
				that.status = 's';
				that.showPopup(in_str);
			});
			


		};
		this.init();


	},
	/**
	 * @constructor Call
	 * 日历内核的构造器,用以构造单个日历主体并绑定日历主体部分的事件
	 */
	Call:function(config,fathor){
		//属性
		this.fathor = fathor;
		this.month = Number(config.month);
		this.year = Number(config.year);
		this.prev_arrow = config.prev_arrow;
		this.next_arrow = config.next_arrow;
		this.node = null;
		this.id = '';
		this.EV = [];
		this.html = [
			//'<div class="c-box" id="{$id}">',
				'<div class="c-hd">', 
					'<a href="javascript:void(0);" class="prev {$prev}"><</a>',
					'<a href="javascript:void(0);" class="title">{$title}</a>',
					'<a href="javascript:void(0);" class="next {$next}">></a>',
				'</div>',
				'<div class="c-bd">',
					'<div class="whd">',
						'<span>日</span>',
						'<span>一</span>',
						'<span>二</span>',
						'<span>三</span>',
						'<span>四</span>',
						'<span>五</span>',
						'<span>六</span>',
					'</div>',
					'<div class="dbd clearfix">',
						'{$ds}',
						/*
						<a href="" class="null">1</a>
						<a href="" class="disabled">3</a>
						<a href="" class="selected">1</a>
						<a href="" class="today">1</a>
						<a href="">1</a>
					*/
					'</div>',
				'</div>',
				'<div class="setime hidden">',
				'</div>',
				'<div class="c-ft {$showtime}">',
					'<div class="c-time">',
						'时间：00:00 	&hearts;',
					'</div>',
				'</div>',
				'<div class="selectime hidden"><!--用以存放点选时间的一些关键值-->',
				'</div>'
			//'</div><!--#c-box-->'
		].join("");
		this.nav_html = [
				'<p>',
				'月',
					'<select value="{$the_month}">',
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
					'<input type="text" value="{$the_year}" onfocus="this.select()"></input>',
				'</p>',
				'<p>',
					'<button class="ok">确定</button><button class="cancel">取消</button>',
				'</p>'
		].join("");


		//方法
		/**
		 * @method renderUI
		 * Call的方法
		 * 渲染UI
		 */
		this.renderUI = function(){
			var cc = this;
			cc.HTML = '';
			var _o = {};
			_o.prev = '';
			_o.next = '';
			_o.title = '';
			_o.ds = '';
			if(!cc.prev_arrow){
				_o.prev = 'hidden';
			}
			if(!cc.next_arrow){
				_o.next = 'hidden';
			}
			if(!cc.fathor.showtime){
				_o.showtime = 'hidden';
			}
			_o.id = cc.id = 'cc-'+Math.random().toString().replace(/.\./i,'');
			_o.title = cc.fathor.getHeadStr(cc.year,cc.month);
			cc.createDS();
			_o.ds = cc.ds;
			var _html = cc.fathor.con.get('innerHTML');
			var _next_cc_body = document.createElement('div');
			_next_cc_body.innerHTML = cc.fathor.templetShow(cc.html,_o);
			_next_cc_body.className = 'c-box';
			_next_cc_body.id = _o.id;
			cc.fathor.con.appendChild(_next_cc_body);
			cc.node = new Y.util.Element(cc.id);
			if(cc.fathor.withtime){
				var ft = new Y.util.Element($D.getElementsByClassName('c-ft','div',cc.id)[0]);
				ft.removeClass('hidden');
				cc.timmer = new cc.fathor.TimeSelector(ft,cc.fathor);
			}
			return this;
		};
		/**
		 * @method buildEvent
		 * Call的方法
		 * 绑定事件
		 */
		this.buildEvent = function(){
			var cc = this;
			var con = new Y.util.Element(cc.id);
			var setime_node = new Y.util.Element($D.getElementsByClassName('setime','div',cc.id)[0]);
			//点击日期
			//flush event
			$E.purgeElement($D.getElementsByClassName('dbd','div',con.get('id')));
			$E.on($D.getElementsByClassName('dbd','div',con.get('id')),'click',function(e){
				$E.stopEvent(e);
				var el = $E.getTarget(e);
				if($D.hasClass(el,'null'))return;
				if($D.hasClass(el,'disabled'))return;
				var selectedd = Number(el.innerHTML);
				/*
				//在opera10.5中，setDate,setMonth,setYear方法失效
				var d = new Date();
				d.setDate(selectedd);
				d.setMonth(cc.month);
				d.setYear(cc.year);
				*/
				var d = new Date(cc.year+'/'+(cc.month+1)+'/'+selectedd);
				cc.fathor.dt_date = d;
				cc.fathor.EventCenter['select'].fire(d);
				if(cc.fathor.popup && cc.fathor.closeable){
					cc.fathor.hide();
				}
				if(cc.fathor.range_select){
					cc.fathor.handleRange(d);
				}
				cc.fathor.render({selected:d});
			});

			//向前
			$E.purgeElement($D.getElementsByClassName('prev','a',con.get('id')), false, "click");
			$E.on($D.getElementsByClassName('prev','a',con.get('id')),'click',function(e){
				$E.stopEvent(e);
				cc.fathor.monthMinus().render();
				cc.fathor.EventCenter['switch'].fire(new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01'));
			});
			//向后
			$E.purgeElement($D.getElementsByClassName('next','a',con.get('id')), false, "click");
			$E.on($D.getElementsByClassName('next','a',con.get('id')),'click',function(e){
				$E.stopEvent(e);
				cc.fathor.monthAdd().render();
				cc.fathor.EventCenter['switch'].fire(new Date(cc.fathor.year+'/'+(cc.fathor.month+1)+'/01'));
			});
			//点击导航
			if(cc.fathor.navigator){
				$E.purgeElement($D.getElementsByClassName('title','a',con.get('id')), false, "click");
				$E.on($D.getElementsByClassName('title','a',con.get('id')),'click',function(e){
					$E.stopEvent(e);
					try{
						cc.timmer.hidePopup();
					}catch(e){}
					setime_node.set('innerHTML','');
					var in_str = cc.fathor.templetShow(cc.nav_html,{
						the_month:cc.month+1,
						the_year:cc.year
					});
					setime_node.set('innerHTML',in_str);
					setime_node.removeClass('hidden');
					//input上的上下键的监听
					$E.on(con.getElementsByTagName('input').item(0),'keydown',function(e){
						$E.stopEvent(e);
						var el = $E.getTarget(e);
						if(e.keyCode == 38){//up
							el.value = Number(el.value)+1;
							el.select();
						}
						if(e.keyCode == 40){//down
							el.value = Number(el.value)-1;
							el.select();
						}
						if(e.keyCode == 13){//enter
							var _month = setime_node.getElementsByTagName('select').item(0).value;
							var _year  = setime_node.getElementsByTagName('input').item(0).value;
							cc.fathor.render({
								date:new Date(_year+'/'+_month+'/01')
							})
							cc.fathor.EventCenter['switch'].fire(new Date(_year+'/'+_month+'/01'));
							setime_node.addClass('hidden');
						}
					});
				});
				$E.purgeElement($D.getElementsByClassName('setime','div',con.get('id')), false, "click");
				$E.on($D.getElementsByClassName('setime','div',con.get('id')),'click',function(e){
					$E.stopEvent(e);
					var el = $E.getTarget(e);
					if($D.hasClass(el,'ok')){
						var _month = setime_node.getElementsByTagName('select').item(0).value;
						var _year  = setime_node.getElementsByTagName('input').item(0).value;
						cc.fathor.render({
							date:new Date(_year+'/'+_month+'/01')
						})
						cc.fathor.EventCenter['switch'].fire(new Date(_year+'/'+_month+'/01'));
						setime_node.addClass('hidden');
					}else if($D.hasClass(el,'cancel')){
						setime_node.addClass('hidden');
					}
				});
			}
			return this;

		};
		/**
		 * @method getNode
		 * Call的方法
		 * 得到日历本体
		 */
		this.getNode = function(){
			var cc = this;
			return cc.node;
		};
		/**
		 * @method createDS
		 * Call的方法
		 * 创建日期列表
		 */
		this.createDS = function(){
			var cc = this;

			var s = '';
			var startweekday = new Date(cc.year+'/'+(cc.month+1)+'/01').getDay();//当月第一天是星期几
			var k = cc.fathor.getNumOfDays(cc.year,cc.month + 1) + startweekday;
			
			for(var i = 0;i< k;i++){
				//prepare data {{
				if(/532/.test(Y.env.ua.webkit)){//chrome下，星期的计算会比其他浏览器多1
					var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
				}else {
					var _td_s = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+2-startweekday).toString());
				}
				var _td_e = new Date(cc.year+'/'+Number(cc.month+1)+'/'+(i+1-startweekday).toString());
				//prepare data }}
				if(i < startweekday){//null
					s += '<a href="javascript:void(0);" class="null">0</a>';
				}else if( cc.fathor.mindate instanceof Date
							&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+2-startweekday)).getTime() < cc.fathor.mindate.getTime()  ){//disabled
					s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';
					
				}else if(cc.fathor.maxdate instanceof Date
							&& new Date(cc.year+'/'+(cc.month+1)+'/'+(i+1-startweekday)).getTime() > cc.fathor.maxdate.getTime()  ){//disabled
					s+= '<a href="javascript:void(0);" class="disabled">'+(i - startweekday + 1)+'</a>';


				}else if((cc.fathor.range.start != null && cc.fathor.range.end != null) //日期选择范围
							&& (
								_td_s.getTime()>=cc.fathor.range.start.getTime() && _td_e.getTime() < cc.fathor.range.end.getTime()) ){
							
							
						if(i == (startweekday + (new Date()).getDate() - 1) 
							&& (new Date()).getFullYear() == cc.year 
							&& (new Date()).getMonth() == cc.month){//今天并被选择
							s+='<a href="javascript:void(0);" class="range today">'+(i - startweekday + 1)+'</a>';
						}else{
							s+= '<a href="javascript:void(0);" class="range">'+(i - startweekday + 1)+'</a>';
						}

				}else if(i == (startweekday + (new Date()).getDate() - 1) 
							&& (new Date()).getFullYear() == cc.year 
							&& (new Date()).getMonth() == cc.month){//today
					s += '<a href="javascript:void(0);" class="today">'+(i - startweekday + 1)+'</a>';

				}else if(i == (startweekday + cc.fathor.selected.getDate() - 1) 
							&& cc.month == cc.fathor.selected.getMonth() 
							&& cc.year == cc.fathor.selected.getFullYear()){//selected
					s += '<a href="javascript:void(0);" class="selected">'+(i - startweekday + 1)+'</a>';
				}else{//other
					s += '<a href="javascript:void(0);">'+(i - startweekday + 1)+'</a>';
				}
			}
			if(k%7 != 0){
				for(var i = 0;i<(7-k%7);i++){
					s += '<a href="javascript:void(0);" class="null">0</a>';
				}
			}
			cc.ds = s;
			return this;
		};
		/**
		 * @method render
		 * Call的方法
		 * 渲染
		 */
		this.render = function(){
			var cc = this;
			cc.renderUI();
			cc.buildEvent();
			return this;
		};


	}//Call constructor over
	
	
});

S.Calendar = Calendar;

});

	

