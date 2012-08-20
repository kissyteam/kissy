KISSY.use("menu", function (S, Menu) {


    var $ = S.all;

    new Menu({
        width: 200,
        render: '#index',
        listeners: {
            "click": function (e) {
                var h;
                if (h = e.target.get("href")) {
                    window.open(h);
                } else {
                    alert("敬请期待!")
                }
            }
        },
        children: [
            {
                content: "base",
                xclass: 'submenu',
                menu: {
                    xclass: 'popupmenu',
                    children: [
                        {
                            content: "css reset",
                            href: 'demo/dpl/reset.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: "grids system",
                            href: 'demo/dpl/grids.html',
                            xclass: 'submenu',
                            menu: {
                                xclass: 'popupmenu',
                                children: [
                                    {
                                        content: '固定布局',
                                        href: 'demo/dpl/grids/fixed.html',
                                        xclass: 'menuitem'
                                    },
                                    {
                                        content: '流式布局',
                                        href: 'demo/dpl/grids/fluid.html',
                                        xclass: 'menuitem'
                                    }
                                ]
                            }
                        },
                        {
                            content: 'fly-swing',
                            xclass: 'submenu',
                            menu: {
                                xclass: 'popupmenu',
                                children: [
                                    {
                                        content: 'fly-swing demo',
                                        href: 'demo/dpl/fly-swing/demo.html',
                                        xclass: 'menuitem'
                                    },
                                    {
                                        content: 'layout generator',
                                        href: 'demo/dpl/fly-swing/css-generator.html',
                                        xclass: 'menuitem'
                                    }
                                ]
                            }
                        },
                        {
                            content: "common",
                            xclass: 'submenu',
                            menu: {
                                xclass: 'popupmenu',
                                children: [
                                    {
                                        content: 'ks-inline-block',
                                        xclass: 'menuitem'
                                    },
                                    {
                                        content: 'ks-shown',
                                        xclass: 'menuitem'
                                    },
                                    {
                                        content: '...',
                                        xclass: 'menuitem'
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
            {
                content: 'simple ui',
                xclass: 'submenu',
                menu: {
                    xclass: 'popupmenu',
                    children: [
                        {
                            content: 'badges',
                            href: 'demo/dpl/badges.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'forms',
                            href: 'demo/dpl/forms.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'icons',
                            href: 'demo/dpl/icons.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'labels',
                            href: 'demo/dpl/labels.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'tables',
                            href: 'demo/dpl/tables.html',
                            xclass: 'menuitem'
                        }
                    ]
                }
            },
            {
                content: 'complex ui',
                xclass: 'submenu',
                menu: {
                    xclass: 'popupmenu',
                    children: [
                        {
                            content: 'button',
                            href: '../button/demo.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'calendar',
                            href: '../calendar/demo.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'combobox',
                            href: '../combobox/demo.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'editor',
                            href: '../editor/demo/build/full.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'menu',
                            href: '../menu/demo.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'menubutton',
                            href: '../menubutton/demo.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'overlay',
                            href: '../overlay/demo.html',
                            xclass: 'menuitem'
                        },
                        {
                            content: 'split-button',
                            href: '../split-button/demo.html',
                            xclass: 'menuitem'
                        },

                        {
                            content: 'tabs',
                            href: '../tabs/demo.html',
                            xclass: 'menuitem'
                        },


                        {
                            content: 'toolbar',
                            href: '../toolbar/demo.html',
                            xclass: 'menuitem'
                        },

                        {
                            content: 'tree',
                            href: '../tree/demo.html',
                            xclass: 'menuitem'
                        }

                    ]
                }
            }
        ]
    }).render();


    var simple = {
        base: {

        },
        // simple ui
        badges: {
            requires: ['base']
        },
        forms: {
            requires: ['base']
        },
        icons: {
            requires: ['base']
        },
        labels: {
            requires: ['base']
        },
        tables: {
            requires: ['base']
        }
    };


    var complex = {
        button: {

        },
        calendar: {

        },
        combobox: {
            requires: [ 'menu']
        },
        menu: {

        },
        menubutton: {
            requires: [ 'button', 'menu']
        },
        overlay: {

        },
        'split-button': {
            requires: [ 'menubutton']
        },
        tabs: {
            requires: [ 'button']
        },
        'toolbar': {
            requires: [ 'menubutton']
        },
        'tree': {

        }
    };

    var modsHolder = {
        simple: simple,
        complex: complex
    };

    var cssContainer = $("#cssContainer");


    cssContainer.append('<h3>simple ui</h3>');

    var div = $("<p></p>").appendTo(cssContainer);

    S.each(simple, function (item, name) {
        div.append('<label class="checkbox">' +
            '<input type="checkbox"' +
            ' class="simple" ' +
            ' value="' +
            name + '">' + name + '' +
            '</label>');
    });

    cssContainer.append('<h3>complex ui</h3>');

    div = $("<p></p>").appendTo(cssContainer);

    S.each(complex, function (item, name) {
        div.append('<label class="checkbox">' +
            '<input type="checkbox"' +
            'class="complex" ' +
            ' value="' +
            name + '">' + name + '' +
            '</label>');
    });

    function findAllMods(requires, mods, ret) {
        ret = ret || [];
        // menu button menubutton
        S.each(requires, function (r) {
            if (S.indexOf(r, ret) != -1) {
                return;
            }
            var name = r;
            r = mods[r];
            if (r.requires) {
                findAllMods(r.requires, mods, ret);
            }
            ret.push(name);
        });
        return ret;
    }

    function gen(base, mode, callbackRule) {

        var mods = S.map($("#cssContainer input." + mode), function (n) {
            if ($(n)[0].checked) {
                return $(n).val();
            }
        });

        mods = S.filter(mods, function (m) {
            return !!m;
        });

        var all = findAllMods(mods, modsHolder[mode]),
            cache = {}, finalMods = [];

        S.each(all, function (a) {
            if (cache[a]) {
            } else {
                finalMods.push(a);
                cache[a] = 1;
            }
        });

        if(!finalMods.length){
            finalMods=["base"];
        }

        var urls = S.map(finalMods, callbackRule);

        if (urls.length) {
            var f = base + "??" + urls.join(",");
            $("#result").append('<p><a href="' + f + '" target="_blank">' +
                f
                + '</p>');
        }
    }

    $("#gen").on("click", function () {

        $("#result").html('');

        var min = $("#min").attr("checked");

        var base = $("#cdn").attr("checked") ?
            "http://a.tbcdn.cn/s/kissy/1.3.0rc/" :
            S.config("base");

        gen(base + 'css/dpl/', 'simple', function (m) {
            return m + (min ? "-min" : "") + ".css";
        });

        gen(base, 'complex', function (m) {
            return m + "/assets/dpl" + (min ? "-min" : "") + ".css";
        });

    });

});