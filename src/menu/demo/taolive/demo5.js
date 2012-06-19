KISSY.use("menu", function (S, Menu) {
    var prefixCls = "nav-";

    // 首先创建一个弹出菜单
    var sb = new Menu.PopupMenu({
        width:200,
        // boolean，是否鼠标脱离菜单后自动隐藏
        autoHideOnMouseLeave:true,
        align:{
            offset:[-1, -1],
            points:['bl', 'tl']
        },
        prefixCls:prefixCls
    });

    S.each(['日志', '相册', '个人资料'], function (title) {
        sb.addChild(new Menu.Item({
            prefixCls:prefixCls,
            content:'<a href="javascript:void(0)" tabindex="-1">' + title + '</a>'
        }));
    });

    // 这个子菜单, 关联到上面创建的弹出菜单
    var b = new Menu.SubMenu({
        prefixCls:prefixCls,
        content:'<span class="title">更多</span>',
        menu:sb
    });

    // 创建导航菜单
    var menu = new Menu({
        prefixCls:prefixCls,
        width:800,
        render:'#menu_container',
        elCls:"horizonal"
    });

    S.each(['淘单', '动态'], function (title) {
        menu.addChild(new Menu.Item({
            prefixCls:prefixCls,
            content:'<a href="javascript:void(0)" class="title" tabindex="-1">' + title + '</a>'
        }));
    });
    menu.addChild(b);
    menu.render();
});