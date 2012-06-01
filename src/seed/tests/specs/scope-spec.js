describe('test scope and seed', function() {

    var NATIVE_KISSY = { },

        MY_HOST1 = {
            T: { },
            KISSY: undefined
        },

        MY_HOST2 = {
            T: T,
            KISSY: NATIVE_KISSY
        };

    function do_load(host) {
        var F = bind_in_scope(host);

        function eval_in_scope(url) {
            return F(get_script_text(url));
        }

        eval_in_scope('seed-cases.js');

        host.T.mix(host.T, {
            run: eval_in_scope,
            echo: T.echo
        })
    }

    function do_test(host) {
        bind_in_scope(host)('T.test("KISSY")');
    }

    it('global', function() {
        // Test in global
        T.test('KISSY');
    });

    it('scope, no kissy', function() {
        // if <KISSY> not exist, will reset to <T>  in scope.js
        do_load(MY_HOST1, 'seed-cases.js');
        do_test(MY_HOST1);
    });

    it('scope, native kissy', function() {
        // if <KISSY> exist, not rewrite, mix <T> to native <KISSY>
        do_load(MY_HOST2, 'seed-cases.js');
        MY_HOST2.T.echo('test is ok? ' + (MY_HOST2.KISSY === NATIVE_KISSY));
        do_test(MY_HOST2);
    });
});
