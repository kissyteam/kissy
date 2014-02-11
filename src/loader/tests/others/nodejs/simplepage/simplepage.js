/**
 * simplepage.js | simplepage 分页控件，包含list items和分页的页码，页码无逻辑
 * autohr:lijing00333@163.com 拔赤
 * @class S.Spage
 * @param { ks-node } nodelist:ks的nodelist
 * @param { string } pageid:页码容器的id,页码为a，选中后默认添加classname 'selected'
 * @param { object } 配置项
 * @return { object } 生成一个Spage实例
 * @requires { 'node' }
 *
 * Y.Spage：
 *    说明：    简单分页构造器
 *    使用：    new S.Spage(nodelist,id,options);
 *    参数:    nodelist:{ks-nodelist}yui3的nodelist
 *    参数:    id:{string}容器id
 *    配置：    selected_class {string} 选中的a的className
 *            step:每页的步长
 *            index:当前显示第几页
 *
 *
 */


KISSY.add('example/simplepage/simplepage', function (S) {

    var Spage = function () {
        this.init.apply(this, arguments);
    };
    Spage.prototype = {
        /**
         * 构造器
         */
        init:function (nodelist, pageid, config) {
            var that = this;
            that.buildParam(config);
            that.nodelist = nodelist;
            that.pageid = pageid;

            that.size = that.nodelist.length;
            that.pages = Math.ceil(that.size / that.step);
            //that.buildEventCenter();
            var EventFactory = new Function;
            S.augment(EventFactory, S.EventTarget);
            var eventCenter = new EventFactory();
            S.mix(that, eventCenter);

            that.buildHTML();
            that.bindEvent();
            that.render({index:1});
            return this;
        },
        /**
         * 渲染
         */
        render:function (o) {
            var that = this;
            var o = o || {};
            that.parseParam(o);
            if (that.index > that.pages)that.index = that.pages;
            that.showPage(that.index);
            return this;
        },
        /**
         * 构建参数
         */
        buildParam:function (o) {
            var that = this;
            if (typeof o == 'undefined' || o == null) {
                var o = {};
            }
            that.selected_class = (typeof o.selected_class == 'undefined' || o.selected_class == null) ? 'selected' : o.selected_class;
            that.step = (typeof o.step == 'undefined' || o.step == null) ? '10' : o.step;
            that.index = (typeof o.index == 'undefined' || o.index == null) ? 1 : o.index;
            return this;
        },
        /**
         * 过滤参数列表
         */
        parseParam:function (o) {
            var that = this;
            if (typeof o == 'undefined' || o == null) {
                var o = {};
            }
            for (var i in o) {
                that[i] = o[i];
            }
            return this;
        },
        showPage:function (index) {
            var that = this;
            var as = S.all('#' + that.pageid + ' a');
            as.removeClass(that.selected_class);
            as.item(Number(index) - 1).addClass(that.selected_class);////////////////

            var rear = (Number(index) - 1) * that.step + 1;
            var top = (rear + that.step - 1 > that.size) ? that.size : (rear + that.step - 1);
            that.nodelist.addClass('hidden');
            for (var i = rear; i <= top; i++) {
                that.nodelist.item(i - 1).removeClass('hidden');
            }
            that.fire('pagechange', {
                rear:rear,
                top:top,
                index:index,
                step:that.step
            });

        },
        bindEvent:function () {
            var that = this;
            that.pagecon = S.one('#' + that.pageid);
            that.pagecon.all('a').on('click', function (e) {
                //e.preventDefault();
                var pageNo = Number(S.Node(e.target).html());
                that.render({index:pageNo});
                //that.showPage(pageNo);
            });
            return this;
        },

        /**
         * 生成页码
         */
        buildHTML:function () {
            var str = 'javascript:void(0);';
            var that = this;
            that.pagecon = S.one('#' + that.pageid);
            for (var i = 0; i < that.pages; i++) {
                //for ssjs
                if (S.SSJS) {
                    //str = '<a href="page='+url.parse(R.url, true).query.page+'">';
                    str = '?page=' + Number(i + 1);
                } else {
                    str = '#page=' + Number(i + 1)
                }
                that.pagecon.append(S.Node('<a href="' + str + '">' + Number(i + 1) + '</a>'));
            }

        }


    };

    return Spage;
});
