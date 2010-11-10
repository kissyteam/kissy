describe("template", function(){
    var S = KISSY, T = S.Template, TA = it;

    describe("模板语法的", function(){

        describe("变量操作", function(){
            TA("把一个字符串原封不动的输出", function(){
                expect(
                    T("a").render({})
                ).toBe("a");
            });

            TA("把对象的参数传给渲染方法的当前上下文", function(){
                expect(
                    T("<%=a%><%=b%>")
                        .render({
                            a:"a",
                            b:"b"
                        })
                ).toBe("ab");
            });
        });

        describe("循环", function(){

            TA("支持普通的for循环", function(){
                var templ = [
                    "<% for ( var i = 0, l = _ks_data.length; i < l; i++ ) { %>",
                    "<%= i %>:<%= _ks_data[i] %>,",
                    "<% } %>",
                ].join("");
                expect(
                    T(templ)
                        .render({_ks_data: ["a", "b"]})
                ).toBe("0:a,1:b,");
            });

            TA("支持for..in", function(){
                var templ = [
                    "<% for ( var i in _ks_data ) { %>",
                    "<%= i %>:<%= _ks_data[i] %>,",
                    "<% } %>",
                ].join("");
                expect(
                    T(templ)
                        .render({
                            _ks_data: {
                                a:"A",
                                b:"B"
                            }
                        })
                ).toBe("a:A,b:B,");
            });

            TA("支持while", function(){
                var templ = [
                    "<% var l = _ks_data.length; %>",
                    "<% while ( l-- ) { %>",
                    "<%= l %>:<%= _ks_data[l] %>,",
                    "<% } %>",
                ].join("");
                expect(
                    T(templ)
                        .render({_ks_data: ["a", "b"]})
                ).toBe("1:b,0:a,");
            });

        });

        describe("条件判断", function(){

            TA("支持if/else if/else", function(){
                var templ = [
                    "<% if(a.show) { %>",
                    "<%= a.value %>",
                    "<% } %>",
                    "<% if(b.show) { %>",
                    "<%= b.value %>",
                    "<% } %>"
                ].join("");
                expect(
                    T(templ)
                        .render({
                            a: {
                                show: false,
                                value: "a"
                            },
                            b: {
                                show: true,
                                value: "b"
                            }
                        })
                ).toBe("b");
            });

        });

    });

    describe("数据", function(){

        TA("支持普通的数据对象", function(){
            expect(
                T("<%=a.b.c%>")
                    .render({
                        a: {
                            b: {
                                c: "abc"
                            }
                        }
                     })
            ).toBe("abc");
        });

        TA("支持数组", function(){

            expect(
                T("<%=_ks_data[0]%>")
                    .render({_ks_data: ['abc']})
            ).toBe("abc");

        });

    });

    describe("配置", function(){

        describe("自定义Tag", function(){

            TA("支持变量", function(){
                expect(
                    T("{{=a}}", {lq: "{{", rq: "}}"})
                        .render({a: "a"})
                ).toBe("a");
            });

            TA("支持操作符", function(){
                var templ = [
                    "{{ for ( var i in a ) { }}",
                    "{{=i}}:{{=a[i]}};",
                    "{{ } }}"
                ].join("");
                expect(
                    T(templ, {lq: "{{", rq: "}}"})
                        .render({a: {b: "b", c: "c"}})
                ).toBe("b:b;c:c;");
            });
        });

    });

    describe("调试", function(){

    });

});
