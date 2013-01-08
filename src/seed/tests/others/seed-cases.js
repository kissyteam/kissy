/********************************************************************************************
 load the framework, and execute at shell:
 ----------------------------------------
 > load('seed-cases.js');
 > T.mix(T, {
       echo: ...,
       run: ...
   });
 > T.test('KISSY');
 ********************************************************************************************/

T = {

    SCOPE: this,  // current scope, default is global

    mix: function(r, s) { // <ov>erflow always, not <wl>
        for (var p in s) r[p] = s[p];
        return r;
    },

    /* must mixin in your shell or env. */
    run: function() {
    },

    /* mixin maybe */
    echo: function() {
    },

    casee: function(func, msg, thisObject) {
        var echo = this.echo,
            echoY = function (msg) {
                echo(msg + ' is passed')
            },
            echoN = function (msg) {
                echo(msg + ' is failed')
            };

        var result = false;
        try {
            func = func instanceof Function ? func : new Function(func);
            result = func.call(thisObject || this.SCOPE);
            (result ? echoY : echoN)(msg);
        }
        catch (e) {
            echoN(msg);
        }
        return result;
    },

    /* rewrite in this.test() */
    case_kissyAnno: function() {
    },

    /* test samples */
    case_kissySeed: function(S) {
        var HOST = { },
            SEED1 = { },
            SEED2 = { mix: this.mix },
            SEED3 = { "Env.host": this.SCOPE },
            SEED4 = { "Env.host": HOST, mix: this.mix };

        // seed is blank kissy.
        this.SCOPE[S] = SEED1;
        this.run('../kissy.js');
        if (!((SEED1.Env.host === this.SCOPE) && SEED1.mix && this.case_kissyAnno())) return false;

        // seed is kissy with custom mix.
        this.SCOPE[S] = SEED2;
        this.run('../kissy.js');
        if (!((SEED2.Env.host === this.SCOPE) && (SEED2.mix === this.mix) && this.case_kissyAnno())) return false;

        // seed with host, will keep.
        this.SCOPE[S] = SEED3;
        this.run('../kissy.js');
        if (!((SEED3.Env.host === this.SCOPE) && SEED3.mix && this.case_kissyAnno())) return false;

        // seed has custom host and mix.
        this.SCOPE[S] = SEED4;
        this.run('../kissy.js');
        return (SEED4.Env.host === HOST) && (SEED2.mix === this.mix) && this.case_kissyAnno();
    },

    backuper: function(Scope, S) {
        var has = S in Scope, value = Scope[S];
        return function() {
            if (has) {
                Scope[S] = value;
            }
            else {
                try {
                    delete Scope[S];
                }
                catch (e) {
                    Scope[S] = undefined;
                }
            }
        }
    },

    /* don't mix for the next */
    test: function(S) {
        // backup scope's KISSY
        var reset_kissy = this.backuper(this.SCOPE, S);

        // rewrite case_kissyAnno()
        this.case_kissyAnno = function() {
            return bind_in_scope(this.SCOPE)(S + '.guid() === "0"');
        };

        // Seed layer check
        this.casee(new Function('return this.case_kissySeed("' + S + '")'), 'KISSY core with seed', this);

        // Core layer check
        reset_kissy();
        this.run('../kissy.js');
        this.casee(this.case_kissyAnno, 'KISSY core', this);

        // Load other mods or testcase.
        this.run('../lang.js');
    }
};
