/**
 * css3 selector tc modified from Sizzle
 * @author yiminghe@gmail.com
 */
KISSY.use('dom/selector', function (S, engine) {

    var select = engine.select;
    var matches = engine.matches;
    var ieVersion = S.UA.ie;

    var it = function (name, fn) {
        var self;
        window.it(name, function () {
            S.log('******************: ' + name);
            if (name == 'input[type=search]0') {
//                debugger
            }
            fn.call(self);
        });
    };

    function matchesSelector(el, selector) {
        return matches(selector, [el]).length == 1;
    }

    function ok(a, name) {
        it(name, function () {
            if (typeof a == 'function') {
                a = a();
            }
            expect(a).toBeTruthy();
        });
    }

    function getAttr(el, name) {
        var ret = el && el.getAttributeNode(name);
        return ret && ret.nodeValue;
    }

    /**
     * Asserts that a select matches the given IDs
     * @param {String} a - Assertion name
     * @param {String} b - selector
     * @param {String} c - Array of ids to construct what is expected
     * @example t("Check for something", "//[a]", ["foo", "baar"]);
     * @result returns true if "//[a]" return two elements with the IDs 'foo' and 'baar'
     */
    function t(a, b, c) {
        it(a, function () {

            var f = select(b),
                s = [],
                i = 0;

            for (; i < f.length; i++) {
                s.push(getAttr(f[i], 'id'));
            }

            expect(s).toEqual(c);
        });

    }

    /**
     * Returns an array of elements with the given IDs
     * @example q("main", "foo", "bar")
     * @result [<div id="main">, <span id="foo">, <input id="bar">]
     */
    function q() {
        var r = [],
            i = 0;

        for (; i < arguments.length; i++) {
            r.push(document.getElementById(arguments[i]));
        }
        return r;
    }

    function broken(name, selector) {

        it(name + ": " + selector, function () {

            try {
                select(selector);
            } catch (e) {
                expect(e.message.indexOf("Syntax error")).toBeGreaterThan(-1);
            }

        });
    }

    function equal(a, b, name) {
        it(name, function () {
            if (typeof a == 'function') {
                a = a();
            }
            if (typeof b == 'function') {
                b = b();
            }
            expect(a).toEqual(b);
        });
    }

    var createWithFriesXML = function () {
        var string = '<?xml version="1.0" encoding="UTF-8"?> \
	<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" \
		xmlns:xsd="http://www.w3.org/2001/XMLSchema" \
		xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"> \
		<soap:Body> \
			<jsconf xmlns="http://www.example.com/ns1"> \
				<response xmlns:ab="http://www.example.com/ns2"> \
					<meta> \
						<component id="seite1" class="component"> \
							<properties xmlns:cd="http://www.example.com/ns3"> \
								<property name="prop1"> \
									<thing /> \
									<value>1</value> \
								</property> \
								<property name="prop2"> \
									<thing att="something" /> \
								</property> \
								<foo_bar>foo</foo_bar> \
							</properties> \
						</component> \
					</meta> \
				</response> \
			</jsconf> \
		</soap:Body> \
	</soap:Envelope>';

        return jQuery.parseXML(string);
    };

    describe("element", function () {

        var form = document.getElementById("form");

        it('Select all', function () {

            expect(select("*").length).toBeGreaterThan(30);
        });

        it('Select all elements, no comment nodes', function () {
            var all = select("*"), good = true;
            for (var i = 0; i < all.length; i++) {
                if (all[i].nodeType == 8) {
                    good = false;
                }
            }
            expect(good).toBeTruthy();
        });

        t("Element Selector html", "html", ["html"]);
        t("Element Selector body", "body", ["body"]);
        t("Element Selector p", "#qunit-fixture p", ["firstp", "ap", "sndp", "en", "sap", "first"]);

        t("Parent Element", "dl ol", ["empty", "listWithTabIndex"]);
        t("Parent Element (non-space descendant combinator)", "dl\tol", ["empty", "listWithTabIndex"]);

        it("Object/param as context", function () {
            var obj1 = document.getElementById("object1");
            expect(select("param", obj1).length).toBe(2);
        });

        it("Finding selects with a context.", function () {
            expect(select("select", form)).toEqual(q("select1", "select2", "select3", "select4", "select5"));
        });

        // Check for unique-ness and sort order
        it("Check for duplicates: p, div p", function () {
            expect(select("p, div p")).toEqual(select('p'));
        });

        t("Checking sort order -1", "h2, h1", ["qunit-header", "qunit-banner", "qunit-userAgent"]);
        t("Checking sort order -2", "#qunit-fixture p, #qunit-fixture p a", ["firstp", "simon1", "ap", "google", "groups", "anchor1", "mark", "sndp", "en", "yahoo", "sap", "anchor2", "simon", "first"]);

        // Test Conflict ID
        var lengthtest = document.getElementById("lengthtest");

        it("Finding element with id of ID. -1", function () {
            expect(select("#idTest", lengthtest)).toEqual(q('idTest'));
        });

        it("Finding element with id of ID. -2", function () {
            expect(select("[name='id']", lengthtest)).toEqual(q('idTest'));
        });

        it("Finding elements with id of ID.", function () {
            expect(select("input[id='idTest']", lengthtest)).toEqual(q('idTest'));
        });

        var siblingTest = document.getElementById("siblingTest");
        it("Element-rooted QSA select based on document context", function () {
            expect(select("div em", siblingTest)).toEqual(q('siblingfirst',
                'siblingnext',
                'siblingthird',
                'siblingchild',
                'siblinggrandchild',
                'siblinggreatgrandchild'));
        });

        it("Other document as context", function () {
            var iframe = document.getElementById("iframe"),
                iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            iframeDoc.open();
            iframeDoc.write("<body><p id='foo'>bar</p></body>");
            iframeDoc.close();
            expect(select("p#foo", iframeDoc)).toEqual([ iframeDoc.getElementById("foo") ]);
        });

        it("No stack or performance problems with large amounts of descendents", function () {
            var html = "";
            for (var i = 0; i < 100; i++) {
                html = "<div>" + html + "</div>";
            }
            html = jQuery(html).appendTo(document.body);

            expect(select("body div div div").length).toBeGreaterThan(0);
            expect(select("body>div div div").length).toBeGreaterThan(0);

            html.remove();
        });

        it('', function () {
            q("qunit-fixture")[0].appendChild(document.createElement("toString")).id = "toString";
        });

        t("Element name matches Object.prototype property", "toString#toString", ["toString"]);

        it('', function () {
            jQuery('#toString').remove();
        });
    });

    describe("XML Document Selectors", function () {
        var xml = createWithFriesXML();

        it("Element Selector with underscore", function () {
            expect(select("foo_bar", xml).length).toBe(1);
        });

        it("Class selector", function () {
            expect(select(".component", xml).length).toBe(1);
        });

        it("Attribute selector for class", function () {
            expect(select("[class*=component]", xml).length).toBe(1);
        });

        it("Attribute selector with name", function () {
            expect(select("property[name=prop2]", xml).length).toBe(1);
        });

        it("Attribute selector with name -2", function () {
            expect(select("[name=prop2]", xml).length).toBe(1);
        });

        it("Attribute selector with ID", function () {
            expect(select("#seite1", xml).length).toBe(1);
        });

        it("Attribute selector with ID -2", function () {
            expect(select("component#seite1", xml).length).toBe(1);
        });

        it("Attribute selector filter with ID", function () {
            expect(matches("#seite1", select("component", xml)).length).toBe(1);
        });

        it("Descendent selector and dir caching", function () {
            expect(select("meta property thing", select("component", xml)[0]).length).toBe(2);
        });

        it("Check for namespaced element", function () {
            expect(matches("soap\\:Envelope", [xml.lastChild]).length).toBe(1);
        });
    });

    describe("broken", function () {

        broken("Broken Selector", "[");
        broken("Broken Selector", "(");
        broken("Broken Selector", "{");
        broken("Broken Selector", "<");
        broken("Broken Selector", "()");
        broken("Broken Selector", "<>");
        broken("Broken Selector", "{}");
        broken("Broken Selector", ",");
        broken("Broken Selector", ",a");
        broken("Broken Selector", "a,");
        // Hangs on IE 9 if regular expression is inefficient
        broken("Broken Selector", "[id=012345678901234567890123456789");
        broken("Doesn't exist", ":visble");
        broken("Nth-child", ":nth-child");

        broken("Nth-child", ":nth-child(2n+-0)");
        broken("Nth-child", ":nth-child(2+0)");
        broken("Nth-child", ":nth-child(- 1n)");
        broken("Nth-child", ":nth-child(-1 n)");
        broken("First-child", ":first-child(n)");
        broken("Last-child", ":last-child(n)");
        broken("Only-child", ":only-child(n)");
        broken("Nth-last-last-child", ":nth-last-last-child(1)");
        broken("First-last-child", ":first-last-child");
        broken("Last-last-child", ":last-last-child");
        broken("Only-last-child", ":only-last-child");

        // Make sure attribute value quoting works correctly. See: #6093
        var a = jQuery("<input type='hidden' value='2' name='foo.baz' id='attrbad1'/><input type='hidden' value='2' name='foo[baz]' id='attrbad2'/>").appendTo("#qunit-fixture");

        broken("Attribute not escaped", "input[name=foo.baz]");
        broken("Attribute not escaped", "input[name=foo[baz]]");
        it('', function () {
            a.remove()
        });
    });

    describe("id", function () {

        t("ID Selector", "#body", ["body"]);
        t("ID Selector w/ Element", "body#body", ["body"]);
        t("ID Selector w/ Element", "ul#first", []);
        t("ID selector with existing ID descendant", "#firstp #simon1", ["simon1"]);
        t("ID selector with non-existant descendant", "#firstp #foobar", []);
        t("ID selector using UTF8", "#台北Táiběi", ["台北Táiběi"]);
        t("Multiple ID selectors using UTF8", "#台北Táiběi, #台北", ["台北Táiběi", "台北"]);
        t("Descendant ID selector using UTF8", "div #台北", ["台北"]);
        t("Child ID selector using UTF8", "form > #台北", ["台北"]);

        t("Escaped ID", "#foo\\:bar", ["foo:bar"]);
        t("Escaped ID", "#test\\.foo\\[5\\]bar", ["test.foo[5]bar"]);
        t("Descendant escaped ID", "div #foo\\:bar", ["foo:bar"]);
        t("Descendant escaped ID", "div #test\\.foo\\[5\\]bar", ["test.foo[5]bar"]);
        t("Child escaped ID", "form > #foo\\:bar", ["foo:bar"]);
        t("Child escaped ID", "form > #test\\.foo\\[5\\]bar", ["test.foo[5]bar"]);

        it("Escaped ID as context", function () {
            var tmp = jQuery("<div id='fiddle\\Foo'><span id='fiddleSpan'></span></div>").appendTo("#qunit-fixture");
            expect(select("#fiddle\\\\Foo > span")).toEqual(q([ "fiddleSpan" ]));
            tmp.remove();
        });

        t("ID Selector, child ID present", "#form > #radio1", ["radio1"]); // bug #267
        t("ID Selector, not an ancestor ID", "#form #first", []);
        t("ID Selector, not a child ID", "#form > #option1a", []);

        t("All Children of ID", "#foo > *", ["sndp", "en", "sap"]);
        t("All Children of ID with no children", "#firstUL > *", []);

        var tmpNode = jQuery("<div>" +
            "<a name='tName1'>tName1 <code>A</code></a>" +
            "<a name='tName2'>tName2 <code>A</code></a>" +
            "<div id='tName1'>tName1 <code>DIV</code></div>" +
            "</div>").appendTo("#qunit-fixture");

        equal(select("#tName1")[0].id, "tName1", "ID selector with same value for a name attribute");
        equal(select("#tName2"), [], "ID selector non-existing but name attribute on an A tag");
        equal(select("#tName2 code"), [], "Leading ID selector non-existing but name attribute on an A tag");
        it('', function () {
            tmpNode.remove();
        });

        it('', function () {
            tmpNode = jQuery("<a id='backslash\\foo'></a>").appendTo("#qunit-fixture");
        });

        t("ID Selector contains backslash", "#backslash\\\\foo", ["backslash\\foo"]);

        t("ID Selector on Form with an input that has a name of 'id'", "#lengthtest", ["lengthtest"]);

        t("ID selector with non-existant ancestor", "#asdfasdf #foobar", []); // bug #986

        equal(select("div#form", document.body), [], "ID selector within the context of another element");

        t("Underscore ID", "#types_all", ["types_all"]);
        t("Dash ID", "#qunit-fixture", ["qunit-fixture"]);

        t("ID with weird characters in it", "#name\\+value", ["name+value"]);
        it('', function () {
            tmpNode.remove();
        });
    });

    describe("class", function () {

        t("Class Selector", ".blog", ["mark", "simon"]);
        t("Class Selector", ".GROUPS", ["groups"]);
        t("Class Selector", ".blog.link", ["simon"]);
        t("Class Selector w/ Element", "a.blog", ["mark", "simon"]);
        t("Parent Class Selector", "p .blog", ["mark", "simon"]);

        t("Class selector using UTF8", ".台北Táiběi", ["utf8class1"]);
        //t( "Class selector using UTF8", ".台北", ["utf8class1","utf8class2"] );
        t("Class selector using UTF8", ".台北Táiběi.台北", ["utf8class1"]);
        t("Class selector using UTF8", ".台北Táiběi, .台北", ["utf8class1", "utf8class2"]);
        t("Descendant class selector using UTF8", "div .台北Táiběi", ["utf8class1"]);
        t("Child class selector using UTF8", "form > .台北Táiběi", ["utf8class1"]);

        t("Escaped Class", ".foo\\:bar", ["foo:bar"]);
        t("Escaped Class", ".test\\.foo\\[5\\]bar", ["test.foo[5]bar"]);
        t("Descendant escaped Class", "div .foo\\:bar", ["foo:bar"]);
        t("Descendant escaped Class", "div .test\\.foo\\[5\\]bar", ["test.foo[5]bar"]);
        t("Child escaped Class", "form > .foo\\:bar", ["foo:bar"]);
        t("Child escaped Class", "form > .test\\.foo\\[5\\]bar", ["test.foo[5]bar"]);


        it("Finding a second class.", function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            expect(select(".e", div)).toEqual([ div.firstChild ]);

        });

        it("Finding a modified class.", function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            div.lastChild.className = "e";
            expect(select(".e", div)).toEqual([ div.firstChild, div.lastChild ]);
        });
        it('".null does not match an element with no class"', function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            expect(matches('.null', [div]).length).toBe(0);
            div.className = "null";
            expect(matches('.null', [div]).length).toBe(1);
        });

        it('".null does not match an element with no class"', function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";
            expect(matches('.null div', [div.firstChild]).length).toBe(0);
            div.className = "null";
            expect(matches('.null div', [div.firstChild]).length).toBe(1);
        });


        it("Classes match Object.prototype properties", function () {
            var div = document.createElement("div");
            div.innerHTML = "<div class='test e'></div><div class='test'></div>";

            div.lastChild.className += " hasOwnProperty toString";
            expect(select(".hasOwnProperty.toString", div)).toEqual([ div.lastChild ]);
        });
    });

    describe("name", function () {

        t("Name selector", "input[name=action]", ["text1"]);
        t("Name selector with single quotes", "input[name='action']", ["text1"]);
        t("Name selector with double quotes", "input[name=\"action\"]", ["text1"]);

        t("Name selector non-input", "[name=example]", ["name-is-example"]);
        t("Name selector non-input", "[name=div]", ["name-is-div"]);
        t("Name selector non-input", "*[name=iframe]", ["iframe"]);

        t("Name selector for grouped input", "input[name='types[]']", ["types_all", "types_anime", "types_movie"]);


        it("Name selector within the context of another element", function () {
            var form = document.getElementById("form");
            expect(select("input[name=action]", form)).toEqual(q("text1"));
        });

        it("Name selector for grouped form element within the context of another element", function () {
            var form = document.getElementById("form");
            expect(select("input[name='foo[bar]']", form)).toEqual(q("hidden2"));
        });

        it("Make sure that rooted queries on forms (with possible expandos) work.", function () {
            var form = jQuery("<form><input name='id'/></form>").appendTo("body");
            expect(select("input", form[0]).length).toEqual(1);
        });

        describe('name nested', function () {
            var a;
            beforeEach(function () {
                a = jQuery("<div><a id=\"tName1ID\" name=\"tName1\">tName1 A</a><a id=\"tName2ID\" name=\"tName2\">tName2 A</a><div id=\"tName1\">tName1 Div</div></div>")
                    .appendTo("#qunit-fixture").children();
            });

            afterEach(function () {
                a.parent().remove();
            });

            equal(function () {
                return a.length;
            }, 3, "Make sure the right number of elements were inserted.");
            equal(function () {
                return a[1].id;
            }, "tName2ID", "Make sure the right number of elements were inserted.");

            equal(function () {
                return select("[name=tName1]")[0];
            }, function () {
                return a[0];
            }, "Find elements that have similar IDs");
            equal(function () {
                return select("[name=tName2]")[0];
            }, function () {
                return a[1];
            }, "Find elements that have similar IDs");
            t("Find elements that have similar IDs", "#tName2ID", ["tName2ID"]);

        });


    });

    describe("multiple", function () {
        t("Comma Support1", "h2, #qunit-fixture p", ["qunit-banner", "qunit-userAgent", "firstp", "ap", "sndp", "en", "sap", "first"]);
        t("Comma Support2", "h2 , #qunit-fixture p", ["qunit-banner", "qunit-userAgent", "firstp", "ap", "sndp", "en", "sap", "first"]);
        t("Comma Support3", "h2 , #qunit-fixture p", ["qunit-banner", "qunit-userAgent", "firstp", "ap", "sndp", "en", "sap", "first"]);
        t("Comma Support4", "h2,#qunit-fixture p", ["qunit-banner", "qunit-userAgent", "firstp", "ap", "sndp", "en", "sap", "first"]);
        t("Comma Support5", "h2,#qunit-fixture p", ["qunit-banner", "qunit-userAgent", "firstp", "ap", "sndp", "en", "sap", "first"]);
        t("Comma Support6", "h2\t,\r#qunit-fixture p", ["qunit-banner", "qunit-userAgent", "firstp", "ap", "sndp", "en", "sap", "first"]);
    });

    describe("child and adjacent", function () {

        t("Child", "p > a", ["simon1", "google", "groups", "mark", "yahoo", "simon"]);
        t("Child", "p> a", ["simon1", "google", "groups", "mark", "yahoo", "simon"]);
        t("Child", "p >a", ["simon1", "google", "groups", "mark", "yahoo", "simon"]);
        t("Child", "p>a", ["simon1", "google", "groups", "mark", "yahoo", "simon"]);
        t("Child w/ Class", "p > a.blog", ["mark", "simon"]);
        t("All Children", "code > *", ["anchor1", "anchor2"]);
        t("All Grandchildren", "p > * > *", ["anchor1", "anchor2"]);
        t("Adjacent1", "#qunit-fixture a + a", ["groups"]);
        t("Adjacent2", "#qunit-fixture a +a", ["groups"]);
        t("Adjacent3", "#qunit-fixture a+ a", ["groups"]);
        t("Adjacent4", "#qunit-fixture a+a", ["groups"]);
        t("Adjacent5", "p + p", ["ap", "en", "sap"]);
        t("Adjacent6", "p#firstp + p", ["ap"]);
        t("Adjacent7", "p[lang=en] + p", ["sap"]);
        t("Adjacent8", "a.GROUPS + code + a", ["mark"]);
        t("Comma, Child, and Adjacent", "#qunit-fixture a + a, code > a", ["groups", "anchor1", "anchor2"]);
        t("Element Preceded By1", "#qunit-fixture p ~ div",
            ["foo", 'nothiddendiv', "moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest"]);
        t("Element Preceded By2", "#first ~ div", ["moretests", "tabindex-tests", "liveHandlerOrder", "siblingTest"]);
        t("Element Preceded By3", "#groups ~ a", ["mark"]);
        t("Element Preceded By4", "#length ~ input", ["idTest"]);
        t("Element Preceded By5", "#siblingfirst ~ em", ["siblingnext", "siblingthird"]);
        t("Element Preceded By6 (multiple)", "#siblingTest em ~ em ~ em ~ span", ["siblingspan"]);


        equal(select("#siblingfirst ~ em"), q("siblingnext", "siblingthird"), "Element Preceded By with a context.");
        equal(select("#siblingfirst + em"), q("siblingnext"), "Element Directly Preceded By with a context.");


        equal(select("#en + p,#en a"), q("yahoo", "sap"),
            "Compound selector with context, beginning with sibling test.");
        equal(select("#en a, #en + p"), q("yahoo", "sap"),
            "Compound selector with context, containing sibling test.");

        t("Multiple combinators selects all levels", "#siblingTest em *", ["siblingchild", "siblinggrandchild", "siblinggreatgrandchild"]);
        t("Multiple combinators selects all levels", "#siblingTest > em *", ["siblingchild", "siblinggrandchild", "siblinggreatgrandchild"]);
        t("Multiple sibling combinators doesn't miss general siblings", "#siblingTest > em:first-child + em ~ span", ["siblingspan"]);

        equal(select("#listWithTabIndex").length, 1, "Parent div for next test is found via ID ");
        equal(select("#__sizzle__").length, 0, "Make sure the temporary id assigned is cleared out");
        equal(select("#listWithTabIndex").length, 1, "Parent div for previous test is still found via ID");

        t("Verify deep class selector", "div.blah > p > a", []);

        t("No element deep selector", "div.foo > span > a", []);

        t("Non-existant ancestors", ".fototab > .thumbnails > a", []);
    });

    describe("attributes", function () {

        var opt, input, attrbad, div;

        t("Attribute Exists1", "#qunit-fixture a[title]", ["google"]);
        t("Attribute Exists2 (case-insensitive)", "#qunit-fixture a[TITLE]", ["google"]);
        t("Attribute Exists3", "#qunit-fixture *[title]", ["google", "text1"]);
        t("Attribute Exists4", "#qunit-fixture [title]", ["google", "text1"]);
        t("Attribute Exists5", "#qunit-fixture a[ title ]", ["google"]);

        if (!ieVersion || ieVersion > 8) {
            // TODO ie67
            t("Boolean attribute exists0", "#option2d[selected]", ["option2d"]);
            t("Boolean attribute exists1", "#select2 option[selected]", ["option2d"]);
            t("Boolean attribute equals2", "#select2 option[selected='selected']", ["option2d"]);
        }

        t("Attribute Equals1", "#qunit-fixture a[rel='bookmark']", ["simon1"]);
        t("Attribute Equals2", "#qunit-fixture a[rel='bookmark']", ["simon1"]);
        t("Attribute Equals3", "#qunit-fixture a[rel=bookmark]", ["simon1"]);
        t("Attribute Equals4", "#qunit-fixture a[href='http://www.google.com/']", ["google"]);
        t("Attribute Equals5", "#qunit-fixture a[ rel = 'bookmark' ]", ["simon1"]);
        t("Attribute Equals6 Number", "#qunit-fixture option[value=1]",
            ["option1b", "option2b", "option3b", "option4b", "option5c"]);
        t("Attribute Equals8 Number", "#foodWithNegativeTabIndex[tabIndex='-1']", ["foodWithNegativeTabIndex"]);
        t("Attribute Equals7 Number", "#qunit-fixture li[tabIndex='-1']", ["foodWithNegativeTabIndex"]);

        document.getElementById("anchor2").href = "#2";
        t("href Attribute", "p a[href^='#']", ["anchor2"]);
        t("href Attribute", "p a[href*='#']", ["simon1", "anchor2"]);

        t("for Attribute", "form label[for]", ["label-for"]);
        t("for Attribute in form", "#form [for=action]", ["label-for"]);

        t("Attribute containing []1", "input[name^='foo[']", ["hidden2"]);
        t("Attribute containing []2", "input[name^='foo[bar]']", ["hidden2"]);
        t("Attribute containing []3", "input[name*='[bar]']", ["hidden2"]);
        t("Attribute containing []4", "input[name$='bar]']", ["hidden2"]);
        t("Attribute containing []5", "input[name$='[bar]']", ["hidden2"]);
        t("Attribute containing []6", "input[name$='foo[bar]']", ["hidden2"]);
        t("Attribute containing []7", "input[name*='foo[bar]']", ["hidden2"]);

        equal(select("input[data-comma='0,1']"), [ document.getElementById("el12087") ], "Without context, single-quoted attribute containing ','");
        equal(select("input[data-comma=\"0,1\"]"), [ document.getElementById("el12087") ], "Without context, double-quoted attribute containing ','");
        equal(select("input[data-comma='0,1']", document.getElementById("t12087")), [ document.getElementById("el12087") ], "With context, single-quoted attribute containing ','");
        equal(select("input[data-comma=\"0,1\"]", document.getElementById("t12087")), [ document.getElementById("el12087") ], "With context, double-quoted attribute containing ','");

        t("Multiple Attribute Equals", "#form input[type='radio'], #form input[type='hidden']", ["radio1", "radio2", "hidden1"]);
        t("Multiple Attribute Equals", "#form input[type='radio'], #form input[type=\"hidden\"]", ["radio1", "radio2", "hidden1"]);
        t("Multiple Attribute Equals", "#form input[type='radio'], #form input[type=hidden]", ["radio1", "radio2", "hidden1"]);

        t("Attribute selector using UTF8", "span[lang=中文]", ["台北"]);

        t("Attribute Begins With", "a[href ^= 'http://www']", ["google", "yahoo"]);
        t("Attribute Ends With", "a[href $= 'org/']", ["mark"]);
        t("Attribute Contains", "a[href *= 'google']", ["google", "groups"]);

        opt = document.getElementById("option1a");
        opt.setAttribute("test", "");

        ok(matchesSelector(opt, "[id*=option1]"), "Attribute With No Quotes Contains Matches");
        ok(matchesSelector(opt, "[test]"), "Attribute With No Quotes No Content Matches");
        ok(!matchesSelector(opt, "[test^='']"),
            "Attribute with empty string value does not match startsWith selector (^=)");
        ok(matchesSelector(opt, "[id=option1a]"), "Attribute With No Quotes Equals Matches");
        ok(matchesSelector(document.getElementById("simon1"), "a[href*='#']"), "Attribute With No Quotes Href Contains Matches");

        t("Empty values", "#select1 option[value='']", ["option1a"]);

        t("Grouped Form Elements", "input[name='foo[bar]']", ["hidden2"]);

        input = document.getElementById("text1");
        input.title = "Don't click me";

        ok(matchesSelector(input, "input[title=\"Don't click me\"]"), "Quote within attribute value does not mess up tokenizer");

        // Make sure attribute value quoting works correctly. See jQuery #6093; #6428
        var tmp;

        it('', function () {
            tmp = jQuery(
                "<input type='hidden' id='attrbad_dot' value='2' name='foo.baz'/>" +
                    "<input type='hidden' id='attrbad_brackets' value='2' name='foo[baz]'/>" +
                    "<input type='hidden' id='attrbad_injection' data-attr='foo_baz&#39;]'/>" +
                    "<input type='hidden' id='attrbad_quote' data-attr='&#39;'/>" +
                    "<input type='hidden' id='attrbad_backslash' data-attr='&#92;'/>" +
                    "<input type='hidden' id='attrbad_backslash_quote' data-attr='&#92;&#39;'/>" +
                    "<input type='hidden' id='attrbad_backslash_backslash' data-attr='&#92;&#92;'/>" +
                    "<input type='hidden' id='attrbad_unicode' data-attr='&#x4e00;'/>"
            ).appendTo("#qunit-fixture");
        });

        t("Underscores don't need escaping", "input[id=types_all]", ["types_all"]);

        t("Escaped dot", "input[name=foo\\.baz]", ["attrbad_dot"]);
        t("Escaped brackets", "input[name=foo\\[baz\\]]", ["attrbad_brackets"]);
        t("Escaped quote + right bracket", "input[data-attr='foo_baz\\']']", ["attrbad_injection"]);

        t("Quoted quote", "input[data-attr='\\'']", ["attrbad_quote"]);

        t("Quoted backslash", "input[data-attr='\\\\']", ["attrbad_backslash"]);
        t("Quoted backslash quote", "input[data-attr='\\\\\\'']", ["attrbad_backslash_quote"]);
        t("Quoted backslash backslash", "input[data-attr='\\\\\\\\']", ["attrbad_backslash_backslash"]);

        t("Quoted backslash backslash (numeric escape)", "input[data-attr='\\5C\\\\']", ["attrbad_backslash_backslash"]);
        t("Quoted backslash backslash (numeric escape with trailing space)", "input[data-attr='\\5C \\\\']", ["attrbad_backslash_backslash"]);
        t("Quoted backslash backslash (numeric escape with trailing tab)", "input[data-attr='\\5C\t\\\\']", ["attrbad_backslash_backslash"]);
        t("Long numeric escape (BMP)", "input[data-attr='\\04e00']", ["attrbad_unicode"]);

        it('', function () {
            document.getElementById("attrbad_unicode").setAttribute("data-attr", "\uD834\uDF06A");
        });


        // It was too much code to fix Safari 5.x Supplemental Plane crashes (see ba5f09fa404379a87370ec905ffa47f8ac40aaa3)
        // t( "Long numeric escape (non-BMP)", "input[data-attr='\\01D306A']", ["attrbad_unicode"] );

        if (!ieVersion || ieVersion > 8) {
            if (!ieVersion || ieVersion > 9) {
                t("input[type=search]0", "#search[type=search]", ["search"]);
                t("input[type=text]", "#form input[type=text]", ["text1", "text2", "hidden2", "name"]);
                t("input[type=search]", "#form input[type=search]", ["search"]);
            } else {
                t("input[type=text]", "#form input[type=text]", ["text1", "text2", "hidden2", "name", "search"]);
            }
        }

        // #3279
        div = document.createElement("div");
        div.innerHTML = "<div id='foo' xml:test='something'></div>";

        equal(select("[xml\\:test]", div), [ div.firstChild ], "Finding by attribute with escaped characters.");

        it('', function () {
            tmp.remove();
        });

    });

    describe("pseudo - (parent|empty)", function () {
        t("Empty", "ul:empty", ["firstUL"]);
        t("Empty with comment node", "ol:empty", ["empty"]);
    });

    describe("pseudo - (first|last|only)-(child|of-type)", function () {

        t("First Child", "p:first-child", ["firstp", "sndp"]);
        t("First Child (leading id)", "#qunit-fixture p:first-child", ["firstp", "sndp"]);
        t("First Child (leading class)", ".nothiddendiv div:first-child", ["nothiddendivchild"]);
        t("First Child (case-insensitive)", "#qunit-fixture p:FIRST-CHILD", ["firstp", "sndp"]);

        t("Last Child", "p:last-child", ["sap"]);
        t("Last Child (leading id)", "#qunit-fixture a:last-child",
            ["simon1", "anchor1", "mark", "yahoo", "anchor2", "simon", "liveLink1", "liveLink2"]);

        t("Only Child", "#qunit-fixture a:only-child", ["simon1", "anchor1", "yahoo", "anchor2", "liveLink1", "liveLink2"]);

        t("First-of-type", "#qunit-fixture > p:first-of-type", ["firstp"]);
        t("Last-of-type", "#qunit-fixture > p:last-of-type", ["first"]);
        t("Only-of-type", "#qunit-fixture > :only-of-type", ["name+value", "firstUL", "empty", "floatTest", "iframe", "table"]);

        it("No longer second child", function () {
            // Verify that the child position isn't being cached improperly
            var secondChildren = jQuery("p:nth-child(2)").before("<div></div>");
            expect(select("p:nth-child(2)")).toEqual([]);
            secondChildren.prev().remove();
        });

        t("Restored second child", "p:nth-child(2)", ["ap", "en"]);
    });

    describe("pseudo - nth-child", function () {

        t("Nth-child", "p:nth-child(1)", ["firstp", "sndp"]);
        t("Nth-child (with whitespace)", "p:nth-child( 1 )", ["firstp", "sndp"]);
        t("Not nth-child", "#qunit-fixture p:not(:nth-child(1))", ["ap", "en", "sap", "first"]);

        t("Nth-child(2)", "#qunit-fixture form#form > *:nth-child(2)", ["text1"]);
        t("Nth-child(2)", "#qunit-fixture form#form > :nth-child(2)", ["text1"]);

        equal(select(":nth-child(n)", null, [ document.createElement("a") ].concat(q("ap"))), q("ap"), "Seeded nth-child");
    });

    describe("pseudo - nth-last-child", function () {

        t("Nth-last-child", "form:nth-last-child(5)", ["testForm"]);
        t("Nth-last-child (with whitespace)", "form:nth-last-child( 5 )", ["testForm"]);
        t("Not nth-last-child", "#qunit-fixture p:not(:nth-last-child(1))", ["firstp", "ap", "sndp", "en", "first"]);

        equal(select(":nth-last-child(n)", null, [ document.createElement("a") ].concat(q("ap"))), q("ap"),
            "Seeded nth-last-child");
    });

    describe("pseudo - nth-of-type", function () {
        t("Nth-of-type(-1)", ":nth-of-type(-1)", []);
        t("Nth-of-type(3)", "#ap :nth-of-type(3)", ["mark"]);
        t("Nth-of-type(n)", "#ap :nth-of-type(n)", ["google", "groups", "code1", "anchor1", "mark"]);
        t("Nth-of-type(0n+3)", "#ap :nth-of-type(0n+3)", ["mark"]);
        t("Nth-of-type(2n)", "#ap :nth-of-type(2n)", ["groups"]);
        t("Nth-of-type(even)", "#ap :nth-of-type(even)", ["groups"]);
        t("Nth-of-type(2n+1)", "#ap :nth-of-type(2n+1)", ["google", "code1", "anchor1", "mark"]);
        t("Nth-of-type(odd)", "#ap :nth-of-type(odd)", ["google", "code1", "anchor1", "mark"]);


        it("Nth-of-type(-n+2)", function () {
            expect(select("#qunit-fixture > :nth-of-type(-n+2)", null, select('#qunit-fixture > *')))
                .toEqual(S.makeArray(Sizzle("#qunit-fixture > :nth-of-type(-n+2)")));
        });

    });

    describe("pseudo - nth-last-of-type", function () {
        t("Nth-last-of-type(-1)", ":nth-last-of-type(-1)", []);
        t("Nth-last-of-type(3)", "#ap :nth-last-of-type(3)", ["google"]);
        t("Nth-last-of-type(n)", "#ap :nth-last-of-type(n)", ["google", "groups", "code1", "anchor1", "mark"]);
        t("Nth-last-of-type(0n+3)", "#ap :nth-last-of-type(0n+3)", ["google"]);
        t("Nth-last-of-type(2n)", "#ap :nth-last-of-type(2n)", ["groups"]);
        t("Nth-last-of-type(even)", "#ap :nth-last-of-type(even)", ["groups"]);
        t("Nth-last-of-type(2n+1)", "#ap :nth-last-of-type(2n+1)", ["google", "code1", "anchor1", "mark"]);
        t("Nth-last-of-type(odd)", "#ap :nth-last-of-type(odd)", ["google", "code1", "anchor1", "mark"]);

        t("Nth-last-of-type(-n+2)",
            "#qunit-fixture > :nth-last-of-type(-n+2)",
            ["ap", "name+value", "first", "firstUL", "empty", "floatTest", "iframe", "table", "name-tests", "testForm", "liveHandlerOrder", "siblingTest"]);
    });

    describe("pseudo - misc", function () {

        // Recreate tmp

        it('div focus', function () {
            var tmp = document.createElement("div");
            tmp.id = "tmp_input";
            tmp.innerHTML = "<span>Hello I am focusable.</span>";
            // Setting tabIndex should make the element focusable
            // http://dev.w3.org/html5/spec/single-page.html#focus-management
            document.body.appendChild(tmp);
            tmp.tabIndex = 0;
            tmp.focus();
            if (document.activeElement !== tmp || (document.hasFocus && !document.hasFocus()) ||
                (document.querySelectorAll && !document.querySelectorAll("div:focus").length)) {
            } else {
                expect(select(":focus")).toEqual([tmp ]);
                expect(matchesSelector(tmp, ":focus")).toBeTruthy();
            }

            // Blur tmp
            tmp.blur();
            document.body.focus();
            expect(matchesSelector(tmp, ":focus")).toBeFalsy();
            document.body.removeChild(tmp);
        });


        it('input focus', function () {
            var tmp = document.createElement("input");
            tmp.type = "text";
            tmp.id = "tmp_input";

            document.body.appendChild(tmp);
            tmp.focus();

            if (document.activeElement !== tmp || (document.hasFocus && !document.hasFocus()) ||
                (document.querySelectorAll && !document.querySelectorAll("div:focus").length)) {
            } else {
                expect(select(":focus")).toEqual(q("tmp_input"));
                expect(matchesSelector(tmp, ":focus")).toBeTruthy();
            }

            // Blur tmp
            tmp.blur();
            document.body.focus();
            expect(matchesSelector(tmp, ":focus")).toBeFalsy();
            document.body.removeChild(tmp);
        });


        equal(
            select("[id='select1'] *:not(:last-child), [id='select2'] *:not(:last-child)", q("qunit-fixture")[0]),
            q("option1a", "option1b", "option1c", "option2a", "option2b", "option2c"),
            "caching system tolerates recursive selection"
        );

    });


    describe("pseudo - :not", function () {

        t("Not", "a.blog:not(.link)", ["mark"]);

        t(":not() failing interior", "#qunit-fixture p:not(.foo)", ["firstp", "ap", "sndp", "en", "sap", "first"]);
        t(":not() failing interior", "#qunit-fixture p:not(#blargh)", ["firstp", "ap", "sndp", "en", "sap", "first"]);
        t(":not() failing interior", "#qunit-fixture p:not(#blargh)", ["firstp", "ap", "sndp", "en", "sap", "first"]);
        t(":not() failing interior", "#qunit-fixture p:not(#blargh)", ["firstp", "ap", "sndp", "en", "sap", "first"]);

        t(":not Multiple", "#qunit-fixture p:not(a)", ["firstp", "ap", "sndp", "en", "sap", "first"]);
        t(":not Multiple", "#qunit-fixture p:not( a )", ["firstp", "ap", "sndp", "en", "sap", "first"]);
        t(":not Multiple", "#qunit-fixture p:not( p )", []);
        t(":not Multiple", "p:not(p)", []);
        t(":not Multiple", "p:not(p)", []);
        t(":not Multiple", "p:not(p)", []);
        t(":not Multiple", "p:not(p)", []);

        t("No element not selector", ".container div:not(.excluded) div", []);

        t(":not() Existing attribute", "#form select:not([multiple])", ["select1", "select2", "select5"]);
        t(":not() Equals attribute", "#form select:not([name=select1])", ["select2", "select3", "select4", "select5"]);
        t(":not() Equals quoted attribute", "#form select:not([name='select1'])", ["select2", "select3", "select4", "select5"]);

        t(":not() Multiple Class", "#foo a:not(.blog)", ["yahoo", "anchor2"]);
        t(":not() Multiple Class", "#foo a:not(.link)", ["yahoo", "anchor2"]);
    });

    describe("pseudo - form", function () {

        var extraTexts = jQuery("<input id=\"impliedText\"/><input id=\"capitalText\" type=\"TEXT\">").appendTo("#form");


        t("Selected Option Element are also :checked", "#form option:checked", ["option1a", "option2d", "option3b", "option3c", "option4b", "option4c", "option4d", "option5a"]);
        t("Hidden inputs should be treated as enabled. See QSA test.", "#hidden1:enabled", ["hidden1"]);

        it('xx', function () {
            extraTexts.remove();
        });

    });

    describe("pseudo - :target and :root", function () {

        it(':target', function () {
            // Target
            var $link = jQuery("<a/>").attr({
                href: "#",
                id: "new-link"
            }).appendTo("#qunit-fixture");

            var oldHash = window.location.hash;
            window.location.hash = "new-link";

            expect(select(":target")).toEqual([$link[0]]);

            $link.remove();
            window.location.hash = oldHash;
        });

        // Root
        equal(select(":root")[0], document.documentElement, ":root selector");
    });

    describe("pseudo - :lang", function () {

        document.documentElement.lang = 'en-us';

        var docElem = document.documentElement,
            docXmlLang = docElem.getAttribute("xml:lang"),
            docLang = docElem.lang,
            foo = document.getElementById("foo"),
            anchor = document.getElementById("anchor2"),
            xml = createWithFriesXML(),
            testLang = function (text, elem, container, lang, extra) {

                it(lang + "-" + extra, function () {
                    if (typeof elem == 'function') {
                        elem = elem();
                    }
                    if (typeof container == 'function') {
                        container = container();
                    }
                    var message,
                        cur = elem,
                        full = lang + "-" + extra;

                    var isXML = container.ownerDocument.documentElement.nodeName.toUpperCase() !== "HTML";

//                    while (cur && cur != container.ownerDocument.documentElement) {
//                        cur.lang = '';
//                        cur = cur.parentNode;
//                    }

                    message = "lang=" + lang + " " + text;
                    container.setAttribute(
                        !isXML ?
                            "lang" : "xml:lang", lang);

                    assertMatch(message, elem, ":lang(" + lang + ")");
                    assertMatch(message, elem, ":lang(" + mixCase(lang) + ")");
                    assertNoMatch(message, elem, ":lang(" + full + ")");
                    assertNoMatch(message, elem, ":lang(" + mixCase(full) + ")");
                    assertNoMatch(message, elem, ":lang(" + lang + "-)");
                    assertNoMatch(message, elem, ":lang(" + full + "-)");
                    assertNoMatch(message, elem, ":lang(" + lang + "glish)");
                    assertNoMatch(message, elem, ":lang(" + full + "glish)");

                    message = "lang=" + full + " " + text;
                    container.setAttribute(
                        !isXML ?
                            "lang" : "xml:lang", full);

                    assertMatch(message, elem, ":lang(" + lang + ")");
                    assertMatch(message, elem, ":lang(" + mixCase(lang) + ")");
                    assertMatch(message, elem, ":lang(" + full + ")");
                    assertMatch(message, elem, ":lang(" + mixCase(full) + ")");
                    assertNoMatch(message, elem, ":lang(" + lang + "-)");
                    assertNoMatch(message, elem, ":lang(" + full + "-)");
                    assertNoMatch(message, elem, ":lang(" + lang + "glish)");
                    assertNoMatch(message, elem, ":lang(" + full + "glish)");
                });

            },
            mixCase = function (str) {
                var ret = str.split(""),
                    i = ret.length;
                while (i--) {
                    if (i & 1) {
                        ret[i] = ret[i].toUpperCase();
                    }
                }
                return ret.join("");
            },
            assertMatch = function (text, elem, selector) {

                var r = matchesSelector(elem, selector);
                if (!r) {
                    matchesSelector(elem, selector);
                }
                expect(r).toBe(true);
                if (!r) {
                    S.log('error:' + text + " should match " + selector)
                }

            },
            assertNoMatch = function (text, elem, selector) {
                var r = matchesSelector(elem, selector);
                expect(r).toBe(false);
                if (r) {
                    S.log('error:' + text + " should fail " + selector)
                }
            };

        // Prefixing and inheritance
        ok(function () {
            return matchesSelector(docElem, ":lang(" + docElem.lang + ")");
        }, "starting :lang");

        testLang("document", function () {
            return anchor
        }, docElem, "en", "us");

        testLang("grandparent", function () {
                return anchor
            },
            function () {
                return anchor.parentNode.parentNode
            }, "yue", "hk");

        ok(function () {
                return !matchesSelector(anchor, ":lang(en), :lang(en-us)")
            },
            ":lang does not look above an ancestor with specified lang");

        testLang("self", function () {
            return anchor
        }, function () {
            return anchor
        }, "es", "419");

        ok(function () {
                return !matchesSelector(anchor, ":lang(en), :lang(en-us), :lang(yue), :lang(yue-hk)")
            },
            ":lang does not look above self with specified lang");

        // Searching by language tag
        it('', function () {
            anchor.parentNode.parentNode.lang = "arab";
            anchor.parentNode.lang = anchor.parentNode.id = "ara-sa";
            anchor.lang = "ara";
        });

        equal(function () {
            return select(":lang(ara)", foo)
        }, [ anchor.parentNode, anchor ], "Find by :lang");

        it('', function () {
            // Selector validity
            anchor.parentNode.lang = "ara";
            anchor.lang = "ara\\b";
        });

        equal(function () {
            return select(":lang(ara\\b)", foo)
        }, [], ":lang respects backslashes");
        equal(function () {
                return select(":lang(ara\\\\b)", foo)
            }, [ anchor ],
            ":lang respects escaped backslashes");

        it(":lang value must be a valid identifier", function () {
            try {
                select("dl:lang(c++)")
            } catch (e) {
                expect(e.message.indexOf("Syntax error")).toBeGreaterThan(-1);
            }
        });

        it('', function () {
            // XML
            foo = jQuery("response", xml)[0];
            anchor = jQuery("#seite1", xml)[0];

        });

        testLang("XML document", function () {
            return anchor
        }, xml.documentElement, "en", "us");
        testLang("XML grandparent", function () {
            return anchor
        }, function () {
            return foo
        }, "yue", "hk");

        ok(function () {
                return !matchesSelector(anchor, ":lang(en), :lang(en-us)")
            },
            "XML :lang does not look above an ancestor with specified lang");
        testLang("XML self", function () {
            return anchor
        }, function () {
            return anchor
        }, "es", "419");
        ok(function () {
                return !matchesSelector(anchor, ":lang(en), :lang(en-us), :lang(yue), :lang(yue-hk)")
            },
            "XML :lang does not look above self with specified lang");

        it('', function () {
            // Cleanup
            if (docXmlLang == null) {
                docElem.removeAttribute("xml:lang");
            } else {
                docElem.setAttribute("xml:lang", docXmlLang);
            }
            docElem.lang = docLang;
        });

    });

    describe("caching", function () {
        select(":not(code)", document.getElementById("ap"));
        equal(select(":not(code)", document.getElementById("foo")), q("sndp", "en", "yahoo", "sap", "anchor2", "simon"), "Reusing selector with new context");
    });
});