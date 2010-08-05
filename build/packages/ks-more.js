/*
Copyright 2010, KISSY UI Library v1.1.0
MIT Licensed
build time: Aug 2 23:52
*/
/**
 * from http://www.JSON.org/json2.js
 * 2010-03-20
 */

KISSY.add('json', function (S) {

    var JSON = S.JSON = window.JSON || { };

    function f(n) {
        // Format integers to have at least two digits.
        return n < 10 ? '0' + n : n;
    }

    if (typeof Date.prototype.toJSON !== 'function') {

        Date.prototype.toJSON = function () {

            return isFinite(this.valueOf()) ?
                   this.getUTCFullYear() + '-' +
                   f(this.getUTCMonth() + 1) + '-' +
                   f(this.getUTCDate()) + 'T' +
                   f(this.getUTCHours()) + ':' +
                   f(this.getUTCMinutes()) + ':' +
                   f(this.getUTCSeconds()) + 'Z' : null;
        };

        String.prototype.toJSON =
        Number.prototype.toJSON =
        Boolean.prototype.toJSON = function () {
            return this.valueOf();
        };
    }

    var cx = /[\u0000\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g,
        gap,
        indent,
        meta = {    // table of character substitutions
            '\b': '\\b',
            '\t': '\\t',
            '\n': '\\n',
            '\f': '\\f',
            '\r': '\\r',
            '"' : '\\"',
            '\\': '\\\\'
        },
        rep;


    function quote(string) {

        // If the string contains no control characters, no quote characters, and no
        // backslash characters, then we can safely slap some quotes around it.
        // Otherwise we must also replace the offending characters with safe escape
        // sequences.

        escapable.lastIndex = 0;
        return escapable.test(string) ?
               '"' + string.replace(escapable, function (a) {
                   var c = meta[a];
                   return typeof c === 'string' ? c :
                          '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
               }) + '"' :
               '"' + string + '"';
    }


    function str(key, holder) {

        // Produce a string from holder[key].

        var i,          // The loop counter.
            k,          // The member key.
            v,          // The member value.
            length,
            mind = gap,
            partial,
            value = holder[key];

        // If the value has a toJSON method, call it to obtain a replacement value.

        if (value && typeof value === 'object' &&
            typeof value.toJSON === 'function') {
            value = value.toJSON(key);
        }

        // If we were called with a replacer function, then call the replacer to
        // obtain a replacement value.

        if (typeof rep === 'function') {
            value = rep.call(holder, key, value);
        }

        // What happens next depends on the value's type.

        switch (typeof value) {
            case 'string':
                return quote(value);

            case 'number':

                // JSON numbers must be finite. Encode non-finite numbers as null.

                return isFinite(value) ? String(value) : 'null';

            case 'boolean':
            case 'null':

                // If the value is a boolean or null, convert it to a string. Note:
                // typeof null does not produce 'null'. The case is included here in
                // the remote chance that this gets fixed someday.

                return String(value);

            // If the type is 'object', we might be dealing with an object or an array or
            // null.

            case 'object':

                // Due to a specification blunder in ECMAScript, typeof null is 'object',
                // so watch out for that case.

                if (!value) {
                    return 'null';
                }

                // Make an array to hold the partial results of stringifying this object value.

                gap += indent;
                partial = [];

                // Is the value an array?

                if (Object.prototype.toString.apply(value) === '[object Array]') {

                    // The value is an array. Stringify every element. Use null as a placeholder
                    // for non-JSON values.

                    length = value.length;
                    for (i = 0; i < length; i += 1) {
                        partial[i] = str(i, value) || 'null';
                    }

                    // Join all of the elements together, separated with commas, and wrap them in
                    // brackets.

                    v = partial.length === 0 ? '[]' :
                        gap ? '[\n' + gap +
                              partial.join(',\n' + gap) + '\n' +
                              mind + ']' :
                        '[' + partial.join(',') + ']';
                    gap = mind;
                    return v;
                }

                // If the replacer is an array, use it to select the members to be stringified.

                if (rep && typeof rep === 'object') {
                    length = rep.length;
                    for (i = 0; i < length; i += 1) {
                        k = rep[i];
                        if (typeof k === 'string') {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                } else {

                    // Otherwise, iterate through all of the keys in the object.

                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = str(k, value);
                            if (v) {
                                partial.push(quote(k) + (gap ? ': ' : ':') + v);
                            }
                        }
                    }
                }

                // Join all of the member texts together, separated with commas,
                // and wrap them in braces.

                v = partial.length === 0 ? '{}' :
                    gap ? '{\n' + gap + partial.join(',\n' + gap) + '\n' +
                          mind + '}' : '{' + partial.join(',') + '}';
                gap = mind;
                return v;
        }
    }

    // If the JSON object does not yet have a stringify method, give it one.

    if (typeof JSON.stringify !== 'function') {
        JSON.stringify = function (value, replacer, space) {

            // The stringify method takes a value and an optional replacer, and an optional
            // space parameter, and returns a JSON text. The replacer can be a function
            // that can replace values, or an array of strings that will select the keys.
            // A default replacer method can be provided. Use of the space parameter can
            // produce text that is more easily readable.

            var i;
            gap = '';
            indent = '';

            // If the space parameter is a number, make an indent string containing that
            // many spaces.

            if (typeof space === 'number') {
                for (i = 0; i < space; i += 1) {
                    indent += ' ';
                }

                // If the space parameter is a string, it will be used as the indent string.

            } else if (typeof space === 'string') {
                indent = space;
            }

            // If there is a replacer, it must be a function or an array.
            // Otherwise, throw an error.

            rep = replacer;
            if (replacer && typeof replacer !== 'function' &&
                (typeof replacer !== 'object' ||
                 typeof replacer.length !== 'number')) {
                throw new Error('JSON.stringify');
            }

            // Make a fake root object containing our value under the key of ''.
            // Return the result of stringifying the value.

            return str('', {'': value});
        };
    }


    // If the JSON object does not yet have a parse method, give it one.

    if (typeof JSON.parse !== 'function') {
        JSON.parse = function (text, reviver) {

            // The parse method takes a text and an optional reviver function, and returns
            // a JavaScript value if the text is a valid JSON text.

            var j;

            function walk(holder, key) {

                // The walk method is used to recursively walk the resulting structure so
                // that modifications can be made.

                var k, v, value = holder[key];
                if (value && typeof value === 'object') {
                    for (k in value) {
                        if (Object.hasOwnProperty.call(value, k)) {
                            v = walk(value, k);
                            if (v !== undefined) {
                                value[k] = v;
                            } else {
                                delete value[k];
                            }
                        }
                    }
                }
                return reviver.call(holder, key, value);
            }


            // Parsing happens in four stages. In the first stage, we replace certain
            // Unicode characters with escape sequences. JavaScript handles many characters
            // incorrectly, either silently deleting them, or treating them as line endings.

            text = String(text);
            cx.lastIndex = 0;
            if (cx.test(text)) {
                text = text.replace(cx, function (a) {
                    return '\\u' +
                           ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
                });
            }

            // In the second stage, we run the text against regular expressions that look
            // for non-JSON patterns. We are especially concerned with '()' and 'new'
            // because they can cause invocation, and '=' because it can cause mutation.
            // But just to be safe, we want to reject all unexpected forms.

            // We split the second stage into 4 regexp operations in order to work around
            // crippling inefficiencies in IE's and Safari's regexp engines. First we
            // replace the JSON backslash pairs with '@' (a non-JSON character). Second, we
            // replace all simple value tokens with ']' characters. Third, we delete all
            // open brackets that follow a colon or comma or that begin the text. Finally,
            // we look to see that the remaining characters are only whitespace or ']' or
            // ',' or ':' or '{' or '}'. If that is so, then the text is safe for eval.

            if (/^[\],:{}\s]*$/.
                test(text.replace(/\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g, '@').
                replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, ']').
                replace(/(?:^|:|,)(?:\s*\[)+/g, ''))) {

                // In the third stage we use the eval function to compile the text into a
                // JavaScript structure. The '{' operator is subject to a syntactic ambiguity
                // in JavaScript: it can begin a block or an object literal. We wrap the text
                // in parens to eliminate the ambiguity.

                j = eval('(' + text + ')');

                // In the optional fourth stage, we recursively walk the new structure, passing
                // each name/value pair to a reviver function for possible transformation.

                return typeof reviver === 'function' ?
                       walk({'': j}, '') : j;
            }

            // If the text is not JSON parseable, then a SyntaxError is thrown.

            throw new SyntaxError('JSON.parse');
        };
    }
});
/*
Copyright 2010, KISSY UI Library v1.1.0
MIT Licensed
build time: Aug 2 23:52
*/
/*!
 * Sizzle CSS Selector Engine - v1.0
 *  Copyright 2009, The Dojo Foundation
 *  Released under the MIT, BSD, and GPL Licenses.
 *  More information: http://sizzlejs.com/
 */
(function(){

var chunker = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
	done = 0,
	toString = Object.prototype.toString,
	hasDuplicate = false,
	baseHasDuplicate = true;

// Here we check if the JavaScript engine is using some sort of
// optimization where it does not always call our comparision
// function. If that is the case, discard the hasDuplicate value.
//   Thus far that includes Google Chrome.
[0, 0].sort(function(){
	baseHasDuplicate = false;
	return 0;
});

var Sizzle = function(selector, context, results, seed) {
	results = results || [];
	context = context || document;

	var origContext = context;

	if ( context.nodeType !== 1 && context.nodeType !== 9 ) {
		return [];
	}
	
	if ( !selector || typeof selector !== "string" ) {
		return results;
	}

	var parts = [], m, set, checkSet, extra, prune = true, contextXML = Sizzle.isXML(context),
		soFar = selector, ret, cur, pop, i;
	
	// Reset the position of the chunker regexp (start from head)
	do {
		chunker.exec("");
		m = chunker.exec(soFar);

		if ( m ) {
			soFar = m[3];
		
			parts.push( m[1] );
		
			if ( m[2] ) {
				extra = m[3];
				break;
			}
		}
	} while ( m );

	if ( parts.length > 1 && origPOS.exec( selector ) ) {
		if ( parts.length === 2 && Expr.relative[ parts[0] ] ) {
			set = posProcess( parts[0] + parts[1], context );
		} else {
			set = Expr.relative[ parts[0] ] ?
				[ context ] :
				Sizzle( parts.shift(), context );

			while ( parts.length ) {
				selector = parts.shift();

				if ( Expr.relative[ selector ] ) {
					selector += parts.shift();
				}
				
				set = posProcess( selector, set );
			}
		}
	} else {
		// Take a shortcut and set the context if the root selector is an ID
		// (but not if it'll be faster if the inner selector is an ID)
		if ( !seed && parts.length > 1 && context.nodeType === 9 && !contextXML &&
				Expr.match.ID.test(parts[0]) && !Expr.match.ID.test(parts[parts.length - 1]) ) {
			ret = Sizzle.find( parts.shift(), context, contextXML );
			context = ret.expr ? Sizzle.filter( ret.expr, ret.set )[0] : ret.set[0];
		}

		if ( context ) {
			ret = seed ?
				{ expr: parts.pop(), set: makeArray(seed) } :
				Sizzle.find( parts.pop(), parts.length === 1 && (parts[0] === "~" || parts[0] === "+") && context.parentNode ? context.parentNode : context, contextXML );
			set = ret.expr ? Sizzle.filter( ret.expr, ret.set ) : ret.set;

			if ( parts.length > 0 ) {
				checkSet = makeArray(set);
			} else {
				prune = false;
			}

			while ( parts.length ) {
				cur = parts.pop();
				pop = cur;

				if ( !Expr.relative[ cur ] ) {
					cur = "";
				} else {
					pop = parts.pop();
				}

				if ( pop == null ) {
					pop = context;
				}

				Expr.relative[ cur ]( checkSet, pop, contextXML );
			}
		} else {
			checkSet = parts = [];
		}
	}

	if ( !checkSet ) {
		checkSet = set;
	}

	if ( !checkSet ) {
		Sizzle.error( cur || selector );
	}

	if ( toString.call(checkSet) === "[object Array]" ) {
		if ( !prune ) {
			results.push.apply( results, checkSet );
		} else if ( context && context.nodeType === 1 ) {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && (checkSet[i] === true || checkSet[i].nodeType === 1 && Sizzle.contains(context, checkSet[i])) ) {
					results.push( set[i] );
				}
			}
		} else {
			for ( i = 0; checkSet[i] != null; i++ ) {
				if ( checkSet[i] && checkSet[i].nodeType === 1 ) {
					results.push( set[i] );
				}
			}
		}
	} else {
		makeArray( checkSet, results );
	}

	if ( extra ) {
		Sizzle( extra, origContext, results, seed );
		Sizzle.uniqueSort( results );
	}

	return results;
};

Sizzle.uniqueSort = function(results){
	if ( sortOrder ) {
		hasDuplicate = baseHasDuplicate;
		results.sort(sortOrder);

		if ( hasDuplicate ) {
			for ( var i = 1; i < results.length; i++ ) {
				if ( results[i] === results[i-1] ) {
					results.splice(i--, 1);
				}
			}
		}
	}

	return results;
};

Sizzle.matches = function(expr, set){
	return Sizzle(expr, null, null, set);
};

Sizzle.find = function(expr, context, isXML){
	var set;

	if ( !expr ) {
		return [];
	}

	for ( var i = 0, l = Expr.order.length; i < l; i++ ) {
		var type = Expr.order[i], match;
		
		if ( (match = Expr.leftMatch[ type ].exec( expr )) ) {
			var left = match[1];
			match.splice(1,1);

			if ( left.substr( left.length - 1 ) !== "\\" ) {
				match[1] = (match[1] || "").replace(/\\/g, "");
				set = Expr.find[ type ]( match, context, isXML );
				if ( set != null ) {
					expr = expr.replace( Expr.match[ type ], "" );
					break;
				}
			}
		}
	}

	if ( !set ) {
		set = context.getElementsByTagName("*");
	}

	return {set: set, expr: expr};
};

Sizzle.filter = function(expr, set, inplace, not){
	var old = expr, result = [], curLoop = set, match, anyFound,
		isXMLFilter = set && set[0] && Sizzle.isXML(set[0]);

	while ( expr && set.length ) {
		for ( var type in Expr.filter ) {
			if ( (match = Expr.leftMatch[ type ].exec( expr )) != null && match[2] ) {
				var filter = Expr.filter[ type ], found, item, left = match[1];
				anyFound = false;

				match.splice(1,1);

				if ( left.substr( left.length - 1 ) === "\\" ) {
					continue;
				}

				if ( curLoop === result ) {
					result = [];
				}

				if ( Expr.preFilter[ type ] ) {
					match = Expr.preFilter[ type ]( match, curLoop, inplace, result, not, isXMLFilter );

					if ( !match ) {
						anyFound = found = true;
					} else if ( match === true ) {
						continue;
					}
				}

				if ( match ) {
					for ( var i = 0; (item = curLoop[i]) != null; i++ ) {
						if ( item ) {
							found = filter( item, match, i, curLoop );
							var pass = not ^ !!found;

							if ( inplace && found != null ) {
								if ( pass ) {
									anyFound = true;
								} else {
									curLoop[i] = false;
								}
							} else if ( pass ) {
								result.push( item );
								anyFound = true;
							}
						}
					}
				}

				if ( found !== undefined ) {
					if ( !inplace ) {
						curLoop = result;
					}

					expr = expr.replace( Expr.match[ type ], "" );

					if ( !anyFound ) {
						return [];
					}

					break;
				}
			}
		}

		// Improper expression
		if ( expr === old ) {
			if ( anyFound == null ) {
				Sizzle.error( expr );
			} else {
				break;
			}
		}

		old = expr;
	}

	return curLoop;
};

Sizzle.error = function( msg ) {
	throw "Syntax error, unrecognized expression: " + msg;
};

var Expr = Sizzle.selectors = {
	order: [ "ID", "NAME", "TAG" ],
	match: {
		ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
		NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
		ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(['"]*)(.*?)\3|)\s*\]/,
		TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
		CHILD: /:(only|nth|last|first)-child(?:\((even|odd|[\dn+\-]*)\))?/,
		POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
		PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
	},
	leftMatch: {},
	attrMap: {
		"class": "className",
		"for": "htmlFor"
	},
	attrHandle: {
		href: function(elem){
			return elem.getAttribute("href");
		}
	},
	relative: {
		"+": function(checkSet, part){
			var isPartStr = typeof part === "string",
				isTag = isPartStr && !/\W/.test(part),
				isPartStrNotTag = isPartStr && !isTag;

			if ( isTag ) {
				part = part.toLowerCase();
			}

			for ( var i = 0, l = checkSet.length, elem; i < l; i++ ) {
				if ( (elem = checkSet[i]) ) {
					while ( (elem = elem.previousSibling) && elem.nodeType !== 1 ) {}

					checkSet[i] = isPartStrNotTag || elem && elem.nodeName.toLowerCase() === part ?
						elem || false :
						elem === part;
				}
			}

			if ( isPartStrNotTag ) {
				Sizzle.filter( part, checkSet, true );
			}
		},
		">": function(checkSet, part){
			var isPartStr = typeof part === "string",
				elem, i = 0, l = checkSet.length;

			if ( isPartStr && !/\W/.test(part) ) {
				part = part.toLowerCase();

				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						var parent = elem.parentNode;
						checkSet[i] = parent.nodeName.toLowerCase() === part ? parent : false;
					}
				}
			} else {
				for ( ; i < l; i++ ) {
					elem = checkSet[i];
					if ( elem ) {
						checkSet[i] = isPartStr ?
							elem.parentNode :
							elem.parentNode === part;
					}
				}

				if ( isPartStr ) {
					Sizzle.filter( part, checkSet, true );
				}
			}
		},
		"": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("parentNode", part, doneName, checkSet, nodeCheck, isXML);
		},
		"~": function(checkSet, part, isXML){
			var doneName = done++, checkFn = dirCheck, nodeCheck;

			if ( typeof part === "string" && !/\W/.test(part) ) {
				part = part.toLowerCase();
				nodeCheck = part;
				checkFn = dirNodeCheck;
			}

			checkFn("previousSibling", part, doneName, checkSet, nodeCheck, isXML);
		}
	},
	find: {
		ID: function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? [m] : [];
			}
		},
		NAME: function(match, context){
			if ( typeof context.getElementsByName !== "undefined" ) {
				var ret = [], results = context.getElementsByName(match[1]);

				for ( var i = 0, l = results.length; i < l; i++ ) {
					if ( results[i].getAttribute("name") === match[1] ) {
						ret.push( results[i] );
					}
				}

				return ret.length === 0 ? null : ret;
			}
		},
		TAG: function(match, context){
			return context.getElementsByTagName(match[1]);
		}
	},
	preFilter: {
		CLASS: function(match, curLoop, inplace, result, not, isXML){
			match = " " + match[1].replace(/\\/g, "") + " ";

			if ( isXML ) {
				return match;
			}

			for ( var i = 0, elem; (elem = curLoop[i]) != null; i++ ) {
				if ( elem ) {
					if ( not ^ (elem.className && (" " + elem.className + " ").replace(/[\t\n]/g, " ").indexOf(match) >= 0) ) {
						if ( !inplace ) {
							result.push( elem );
						}
					} else if ( inplace ) {
						curLoop[i] = false;
					}
				}
			}

			return false;
		},
		ID: function(match){
			return match[1].replace(/\\/g, "");
		},
		TAG: function(match, curLoop){
			return match[1].toLowerCase();
		},
		CHILD: function(match){
			if ( match[1] === "nth" ) {
				// parse equations like 'even', 'odd', '5', '2n', '3n+2', '4n-1', '-n+6'
				var test = /(-?)(\d*)n((?:\+|-)?\d*)/.exec(
					match[2] === "even" && "2n" || match[2] === "odd" && "2n+1" ||
					!/\D/.test( match[2] ) && "0n+" + match[2] || match[2]);

				// calculate the numbers (first)n+(last) including if they are negative
				match[2] = (test[1] + (test[2] || 1)) - 0;
				match[3] = test[3] - 0;
			}

			// TODO: Move to normal caching system
			match[0] = done++;

			return match;
		},
		ATTR: function(match, curLoop, inplace, result, not, isXML){
			var name = match[1].replace(/\\/g, "");
			
			if ( !isXML && Expr.attrMap[name] ) {
				match[1] = Expr.attrMap[name];
			}

			if ( match[2] === "~=" ) {
				match[4] = " " + match[4] + " ";
			}

			return match;
		},
		PSEUDO: function(match, curLoop, inplace, result, not){
			if ( match[1] === "not" ) {
				// If we're dealing with a complex expression, or a simple one
				if ( ( chunker.exec(match[3]) || "" ).length > 1 || /^\w/.test(match[3]) ) {
					match[3] = Sizzle(match[3], null, null, curLoop);
				} else {
					var ret = Sizzle.filter(match[3], curLoop, inplace, true ^ not);
					if ( !inplace ) {
						result.push.apply( result, ret );
					}
					return false;
				}
			} else if ( Expr.match.POS.test( match[0] ) || Expr.match.CHILD.test( match[0] ) ) {
				return true;
			}
			
			return match;
		},
		POS: function(match){
			match.unshift( true );
			return match;
		}
	},
	filters: {
		enabled: function(elem){
			return elem.disabled === false && elem.type !== "hidden";
		},
		disabled: function(elem){
			return elem.disabled === true;
		},
		checked: function(elem){
			return elem.checked === true;
		},
		selected: function(elem){
			// Accessing this property makes selected-by-default
			// options in Safari work properly
			elem.parentNode.selectedIndex;
			return elem.selected === true;
		},
		parent: function(elem){
			return !!elem.firstChild;
		},
		empty: function(elem){
			return !elem.firstChild;
		},
		has: function(elem, i, match){
			return !!Sizzle( match[3], elem ).length;
		},
		header: function(elem){
			return (/h\d/i).test( elem.nodeName );
		},
		text: function(elem){
			return "text" === elem.type;
		},
		radio: function(elem){
			return "radio" === elem.type;
		},
		checkbox: function(elem){
			return "checkbox" === elem.type;
		},
		file: function(elem){
			return "file" === elem.type;
		},
		password: function(elem){
			return "password" === elem.type;
		},
		submit: function(elem){
			return "submit" === elem.type;
		},
		image: function(elem){
			return "image" === elem.type;
		},
		reset: function(elem){
			return "reset" === elem.type;
		},
		button: function(elem){
			return "button" === elem.type || elem.nodeName.toLowerCase() === "button";
		},
		input: function(elem){
			return (/input|select|textarea|button/i).test(elem.nodeName);
		}
	},
	setFilters: {
		first: function(elem, i){
			return i === 0;
		},
		last: function(elem, i, match, array){
			return i === array.length - 1;
		},
		even: function(elem, i){
			return i % 2 === 0;
		},
		odd: function(elem, i){
			return i % 2 === 1;
		},
		lt: function(elem, i, match){
			return i < match[3] - 0;
		},
		gt: function(elem, i, match){
			return i > match[3] - 0;
		},
		nth: function(elem, i, match){
			return match[3] - 0 === i;
		},
		eq: function(elem, i, match){
			return match[3] - 0 === i;
		}
	},
	filter: {
		PSEUDO: function(elem, match, i, array){
			var name = match[1], filter = Expr.filters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			} else if ( name === "contains" ) {
				return (elem.textContent || elem.innerText || Sizzle.getText([ elem ]) || "").indexOf(match[3]) >= 0;
			} else if ( name === "not" ) {
				var not = match[3];

				for ( var j = 0, l = not.length; j < l; j++ ) {
					if ( not[j] === elem ) {
						return false;
					}
				}

				return true;
			} else {
				Sizzle.error( "Syntax error, unrecognized expression: " + name );
			}
		},
		CHILD: function(elem, match){
			var type = match[1], node = elem;
			switch (type) {
				case 'only':
				case 'first':
					while ( (node = node.previousSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					if ( type === "first" ) { 
						return true; 
					}
					node = elem;
				case 'last':
					while ( (node = node.nextSibling) )	 {
						if ( node.nodeType === 1 ) { 
							return false; 
						}
					}
					return true;
				case 'nth':
					var first = match[2], last = match[3];

					if ( first === 1 && last === 0 ) {
						return true;
					}
					
					var doneName = match[0],
						parent = elem.parentNode;
	
					if ( parent && (parent.sizcache !== doneName || !elem.nodeIndex) ) {
						var count = 0;
						for ( node = parent.firstChild; node; node = node.nextSibling ) {
							if ( node.nodeType === 1 ) {
								node.nodeIndex = ++count;
							}
						} 
						parent.sizcache = doneName;
					}
					
					var diff = elem.nodeIndex - last;
					if ( first === 0 ) {
						return diff === 0;
					} else {
						return ( diff % first === 0 && diff / first >= 0 );
					}
			}
		},
		ID: function(elem, match){
			return elem.nodeType === 1 && elem.getAttribute("id") === match;
		},
		TAG: function(elem, match){
			return (match === "*" && elem.nodeType === 1) || elem.nodeName.toLowerCase() === match;
		},
		CLASS: function(elem, match){
			return (" " + (elem.className || elem.getAttribute("class")) + " ")
				.indexOf( match ) > -1;
		},
		ATTR: function(elem, match){
			var name = match[1],
				result = Expr.attrHandle[ name ] ?
					Expr.attrHandle[ name ]( elem ) :
					elem[ name ] != null ?
						elem[ name ] :
						elem.getAttribute( name ),
				value = result + "",
				type = match[2],
				check = match[4];

			return result == null ?
				type === "!=" :
				type === "=" ?
				value === check :
				type === "*=" ?
				value.indexOf(check) >= 0 :
				type === "~=" ?
				(" " + value + " ").indexOf(check) >= 0 :
				!check ?
				value && result !== false :
				type === "!=" ?
				value !== check :
				type === "^=" ?
				value.indexOf(check) === 0 :
				type === "$=" ?
				value.substr(value.length - check.length) === check :
				type === "|=" ?
				value === check || value.substr(0, check.length + 1) === check + "-" :
				false;
		},
		POS: function(elem, match, i, array){
			var name = match[2], filter = Expr.setFilters[ name ];

			if ( filter ) {
				return filter( elem, i, match, array );
			}
		}
	}
};

var origPOS = Expr.match.POS,
	fescape = function(all, num){
		return "\\" + (num - 0 + 1);
	};

for ( var type in Expr.match ) {
	Expr.match[ type ] = new RegExp( Expr.match[ type ].source + (/(?![^\[]*\])(?![^\(]*\))/.source) );
	Expr.leftMatch[ type ] = new RegExp( /(^(?:.|\r|\n)*?)/.source + Expr.match[ type ].source.replace(/\\(\d+)/g, fescape) );
}

var makeArray = function(array, results) {
	array = Array.prototype.slice.call( array, 0 );

	if ( results ) {
		results.push.apply( results, array );
		return results;
	}
	
	return array;
};

// Perform a simple check to determine if the browser is capable of
// converting a NodeList to an array using builtin methods.
// Also verifies that the returned array holds DOM nodes
// (which is not the case in the Blackberry browser)
try {
	Array.prototype.slice.call( document.documentElement.childNodes, 0 )[0].nodeType;

// Provide a fallback method if it does not work
} catch(e){
	makeArray = function(array, results) {
		var ret = results || [], i = 0;

		if ( toString.call(array) === "[object Array]" ) {
			Array.prototype.push.apply( ret, array );
		} else {
			if ( typeof array.length === "number" ) {
				for ( var l = array.length; i < l; i++ ) {
					ret.push( array[i] );
				}
			} else {
				for ( ; array[i]; i++ ) {
					ret.push( array[i] );
				}
			}
		}

		return ret;
	};
}

var sortOrder;

if ( document.documentElement.compareDocumentPosition ) {
	sortOrder = function( a, b ) {
		if ( !a.compareDocumentPosition || !b.compareDocumentPosition ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.compareDocumentPosition ? -1 : 1;
		}

		var ret = a.compareDocumentPosition(b) & 4 ? -1 : a === b ? 0 : 1;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( "sourceIndex" in document.documentElement ) {
	sortOrder = function( a, b ) {
		if ( !a.sourceIndex || !b.sourceIndex ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.sourceIndex ? -1 : 1;
		}

		var ret = a.sourceIndex - b.sourceIndex;
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
} else if ( document.createRange ) {
	sortOrder = function( a, b ) {
		if ( !a.ownerDocument || !b.ownerDocument ) {
			if ( a == b ) {
				hasDuplicate = true;
			}
			return a.ownerDocument ? -1 : 1;
		}

		var aRange = a.ownerDocument.createRange(), bRange = b.ownerDocument.createRange();
		aRange.setStart(a, 0);
		aRange.setEnd(a, 0);
		bRange.setStart(b, 0);
		bRange.setEnd(b, 0);
		var ret = aRange.compareBoundaryPoints(Range.START_TO_END, bRange);
		if ( ret === 0 ) {
			hasDuplicate = true;
		}
		return ret;
	};
}

// Utility function for retreiving the text value of an array of DOM nodes
Sizzle.getText = function( elems ) {
	var ret = "", elem;

	for ( var i = 0; elems[i]; i++ ) {
		elem = elems[i];

		// Get the text from text nodes and CDATA nodes
		if ( elem.nodeType === 3 || elem.nodeType === 4 ) {
			ret += elem.nodeValue;

		// Traverse everything else, except comment nodes
		} else if ( elem.nodeType !== 8 ) {
			ret += Sizzle.getText( elem.childNodes );
		}
	}

	return ret;
};

// Check to see if the browser returns elements by name when
// querying by getElementById (and provide a workaround)
(function(){
	// We're going to inject a fake input element with a specified name
	var form = document.createElement("div"),
		id = "script" + (new Date()).getTime();
	form.innerHTML = "<a name='" + id + "'/>";

	// Inject it into the root element, check its status, and remove it quickly
	var root = document.documentElement;
	root.insertBefore( form, root.firstChild );

	// The workaround has to do additional checks after a getElementById
	// Which slows things down for other browsers (hence the branching)
	if ( document.getElementById( id ) ) {
		Expr.find.ID = function(match, context, isXML){
			if ( typeof context.getElementById !== "undefined" && !isXML ) {
				var m = context.getElementById(match[1]);
				return m ? m.id === match[1] || typeof m.getAttributeNode !== "undefined" && m.getAttributeNode("id").nodeValue === match[1] ? [m] : undefined : [];
			}
		};

		Expr.filter.ID = function(elem, match){
			var node = typeof elem.getAttributeNode !== "undefined" && elem.getAttributeNode("id");
			return elem.nodeType === 1 && node && node.nodeValue === match;
		};
	}

	root.removeChild( form );
	root = form = null; // release memory in IE
})();

(function(){
	// Check to see if the browser returns only elements
	// when doing getElementsByTagName("*")

	// Create a fake element
	var div = document.createElement("div");
	div.appendChild( document.createComment("") );

	// Make sure no comments are found
	if ( div.getElementsByTagName("*").length > 0 ) {
		Expr.find.TAG = function(match, context){
			var results = context.getElementsByTagName(match[1]);

			// Filter out possible comments
			if ( match[1] === "*" ) {
				var tmp = [];

				for ( var i = 0; results[i]; i++ ) {
					if ( results[i].nodeType === 1 ) {
						tmp.push( results[i] );
					}
				}

				results = tmp;
			}

			return results;
		};
	}

	// Check to see if an attribute returns normalized href attributes
	div.innerHTML = "<a href='#'></a>";
	if ( div.firstChild && typeof div.firstChild.getAttribute !== "undefined" &&
			div.firstChild.getAttribute("href") !== "#" ) {
		Expr.attrHandle.href = function(elem){
			return elem.getAttribute("href", 2);
		};
	}

	div = null; // release memory in IE
})();

if ( document.querySelectorAll ) {
	(function(){
		var oldSizzle = Sizzle, div = document.createElement("div");
		div.innerHTML = "<p class='TEST'></p>";

		// Safari can't handle uppercase or unicode characters when
		// in quirks mode.
		if ( div.querySelectorAll && div.querySelectorAll(".TEST").length === 0 ) {
			return;
		}
	
		Sizzle = function(query, context, extra, seed){
			context = context || document;

			// Only use querySelectorAll on non-XML documents
			// (ID selectors don't work in non-HTML documents)
			if ( !seed && context.nodeType === 9 && !Sizzle.isXML(context) ) {
				try {
					return makeArray( context.querySelectorAll(query), extra );
				} catch(e){}
			}
		
			return oldSizzle(query, context, extra, seed);
		};

		for ( var prop in oldSizzle ) {
			Sizzle[ prop ] = oldSizzle[ prop ];
		}

		div = null; // release memory in IE
	})();
}

(function(){
	var div = document.createElement("div");

	div.innerHTML = "<div class='test e'></div><div class='test'></div>";

	// Opera can't find a second classname (in 9.6)
	// Also, make sure that getElementsByClassName actually exists
	if ( !div.getElementsByClassName || div.getElementsByClassName("e").length === 0 ) {
		return;
	}

	// Safari caches class attributes, doesn't catch changes (in 3.2)
	div.lastChild.className = "e";

	if ( div.getElementsByClassName("e").length === 1 ) {
		return;
	}
	
	Expr.order.splice(1, 0, "CLASS");
	Expr.find.CLASS = function(match, context, isXML) {
		if ( typeof context.getElementsByClassName !== "undefined" && !isXML ) {
			return context.getElementsByClassName(match[1]);
		}
	};

	div = null; // release memory in IE
})();

function dirNodeCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 && !isXML ){
					elem.sizcache = doneName;
					elem.sizset = i;
				}

				if ( elem.nodeName.toLowerCase() === cur ) {
					match = elem;
					break;
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

function dirCheck( dir, cur, doneName, checkSet, nodeCheck, isXML ) {
	for ( var i = 0, l = checkSet.length; i < l; i++ ) {
		var elem = checkSet[i];
		if ( elem ) {
			elem = elem[dir];
			var match = false;

			while ( elem ) {
				if ( elem.sizcache === doneName ) {
					match = checkSet[elem.sizset];
					break;
				}

				if ( elem.nodeType === 1 ) {
					if ( !isXML ) {
						elem.sizcache = doneName;
						elem.sizset = i;
					}
					if ( typeof cur !== "string" ) {
						if ( elem === cur ) {
							match = true;
							break;
						}

					} else if ( Sizzle.filter( cur, [elem] ).length > 0 ) {
						match = elem;
						break;
					}
				}

				elem = elem[dir];
			}

			checkSet[i] = match;
		}
	}
}

Sizzle.contains = document.compareDocumentPosition ? function(a, b){
	return !!(a.compareDocumentPosition(b) & 16);
} : function(a, b){
	return a !== b && (a.contains ? a.contains(b) : true);
};

Sizzle.isXML = function(elem){
	// documentElement is verified for cases where it doesn't yet exist
	// (such as loading iframes in IE - #4833) 
	var documentElement = (elem ? elem.ownerDocument || elem : 0).documentElement;
	return documentElement ? documentElement.nodeName !== "HTML" : false;
};

var posProcess = function(selector, context){
	var tmpSet = [], later = "", match,
		root = context.nodeType ? [context] : context;

	// Position selectors must be done after the filter
	// And so must :not(positional) so we move all PSEUDOs to the end
	while ( (match = Expr.match.PSEUDO.exec( selector )) ) {
		later += match[0];
		selector = selector.replace( Expr.match.PSEUDO, "" );
	}

	selector = Expr.relative[selector] ? selector + "*" : selector;

	for ( var i = 0, l = root.length; i < l; i++ ) {
		Sizzle( selector, root[i], tmpSet );
	}

	return Sizzle.filter( later, tmpSet );
};

// EXPOSE
KISSY.ExternalSelector = Sizzle;
KISSY.ExternalSelector._filter = function(selector, filter) {
    //Sizzle.matches( String selector, Array<DOMElement> set )
    return Sizzle.matches(filter, KISSY.query(selector));
};

})();
/*
Copyright 2010, KISSY UI Library v1.1.0
MIT Licensed
build time: Aug 2 23:52
*/
/**
 * @module anim-easing
 */
KISSY.add('anim-easing', function(S) {

    // Based on Easing Equations (c) 2003 Robert Penner, all rights reserved.
    // This work is subject to the terms in http://www.robertpenner.com/easing_terms_of_use.html
    // Preview: http://www.robertpenner.com/easing/easing_demo.html

    /**
     * 和 YUI 的 Easing 相比，S.Easing 进行了归一化处理，参数调整为：
     * @param {Number} t Time value used to compute current value  保留 0 =< t <= 1
     * @param {Number} b Starting value  b = 0
     * @param {Number} c Delta between start and end values  c = 1
     * @param {Number} d Total length of animation d = 1
     */

    var M = Math, PI = M.PI,
        pow = M.pow, sin = M.sin,
        BACK_CONST = 1.70158,

        Easing = {

            /**
             * Uniform speed between points.
             */
            easeNone: function (t) {
                return t;
            },

            /**
             * Begins slowly and accelerates towards end. (quadratic)
             */
            easeIn: function (t) {
                return t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quadratic)
             */
            easeOut: function (t) {
                return ( 2 - t) * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quadratic)
             */
            easeBoth: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t :
                    .5 * (1 - (--t) * (t - 2));
            },

            /**
             * Begins slowly and accelerates towards end. (quartic)
             */
            easeInStrong: function (t) {
                return t * t * t * t;
            },

            /**
             * Begins quickly and decelerates towards end.  (quartic)
             */
            easeOutStrong: function (t) {
                return 1 - (--t) * t * t * t;
            },

            /**
             * Begins slowly and decelerates towards end. (quartic)
             */
            easeBothStrong: function (t) {
                return (t *= 2) < 1 ?
                    .5 * t * t * t * t :
                    .5 * (2 - (t -= 2) * t * t * t);
            },

            /**
             * Snap in elastic effect.
             */

            elasticIn: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return -(pow(2, 10 * (t -= 1)) * sin((t - s) * (2 * PI) / p));
            },

            /**
             * Snap out elastic effect.
             */
            elasticOut: function (t) {
                var p = .3, s = p / 4;
                if (t === 0 || t === 1) return t;
                return pow(2, -10 * t) * sin((t - s) * (2 * PI) / p) + 1;
            },

            /**
             * Snap both elastic effect.
             */
            elasticBoth: function (t) {
                var p = .45, s = p / 4;
                if (t === 0 || (t *= 2) === 2) return t;

                if (t < 1) {
                    return -.5 * (pow(2, 10 * (t -= 1)) *
                        sin((t - s) * (2 * PI) / p));
                }
                return pow(2, -10 * (t -= 1)) *
                    sin((t - s) * (2 * PI) / p) * .5 + 1;
            },

            /**
             * Backtracks slightly, then reverses direction and moves to end.
             */
            backIn: function (t) {
                if (t === 1) t -= .001;
                return t * t * ((BACK_CONST + 1) * t - BACK_CONST);
            },

            /**
             * Overshoots end, then reverses and comes back to end.
             */
            backOut: function (t) {
                return (t -= 1) * t * ((BACK_CONST + 1) * t + BACK_CONST) + 1;
            },

            /**
             * Backtracks slightly, then reverses direction, overshoots end,
             * then reverses and comes back to end.
             */
            backBoth: function (t) {
                if ((t *= 2 ) < 1) {
                    return .5 * (t * t * (((BACK_CONST *= (1.525)) + 1) * t - BACK_CONST));
                }
                return .5 * ((t -= 2) * t * (((BACK_CONST *= (1.525)) + 1) * t + BACK_CONST) + 2);
            },

            /**
             * Bounce off of start.
             */
            bounceIn: function (t) {
                return 1 - Easing.bounceOut(1 - t);
            },

            /**
             * Bounces off end.
             */
            bounceOut: function (t) {
                var s = 7.5625, r;

                if (t < (1 / 2.75)) {
                    r = s * t * t;
                }
                else if (t < (2 / 2.75)) {
                    r =  s * (t -= (1.5 / 2.75)) * t + .75;
                }
                else if (t < (2.5 / 2.75)) {
                    r =  s * (t -= (2.25 / 2.75)) * t + .9375;
                }
                else {
                    r =  s * (t -= (2.625 / 2.75)) * t + .984375;
                }

                return r;
            },

            /**
             * Bounces off start and end.
             */
            bounceBoth: function (t) {
                if (t < .5) {
                    return Easing.bounceIn(t * 2) * .5;
                }
                return Easing.bounceOut(t * 2 - 1) * .5 + .5;
            }
        };

    S.Easing = Easing;
});

/**
 * TODO:
 *  - test-easing.html 详细的测试 + 曲线可视化
 *
 * NOTES:
 *  - 综合比较 jQuery UI/scripty2/YUI 的 easing 命名，还是觉得 YUI 的对用户
 *    最友好。因此这次完全照搬 YUI 的 Easing, 只是代码上做了点压缩优化。
 *
 */
/**
 * @module   anim
 * @author   lifesinger@gmail.com
 * @depends  ks-core
 */
KISSY.add('anim', function(S, undefined) {

    var DOM = S.DOM, Easing = S.Easing,
        PARSE_FLOAT = parseFloat,
        parseEl = DOM.create('<div>'),
        PROPS = ('backgroundColor borderBottomColor borderBottomWidth borderBottomStyle borderLeftColor borderLeftWidth borderLeftStyle ' +
            'borderRightColor borderRightWidth borderRightStyle borderSpacing borderTopColor borderTopWidth borderTopStyle bottom color ' +
            'font fontFamily fontSize fontWeight height left letterSpacing lineHeight marginBottom marginLeft marginRight marginTop maxHeight ' +
            'maxWidth minHeight minWidth opacity outlineColor outlineOffset outlineWidth paddingBottom paddingLeft ' +
            'paddingRight paddingTop right textIndent top width wordSpacing zIndex').split(' '),

        STEP_INTERVAL = 13,
        OPACITY = 'opacity',
        EVENT_START = 'start',
        EVENT_STEP = 'step',
        EVENT_COMPLETE = 'complete',

        defaultConfig = {
            duration: 1,
            easing: Easing.easeNone
            //queue: true
        };

    /**
     * Anim Class
     * @constructor
     */
    function Anim(elem, props, duration, easing, callback) {
        // ignore non-exist element
        if (!(elem = S.get(elem))) return;

        // factory or constructor
        if (!(this instanceof Anim)) {
            return new Anim(elem, props, duration, easing, callback);
        }

        var self = this,
            isConfig = S.isPlainObject(duration),
            style = props, config;

        /**
         * the related dom element
         */
        self.domEl = elem;

        /**
         * the transition properties
         * 可以是 "width: 200px; color: #ccc" 字符串形式
         * 也可以是 { width: '200px', color: '#ccc' } 对象形式
         */
        if (S.isPlainObject(style)) {
            style = S.param(style, ';').replace(/=/g, ':');
        }
        self.props = normalize(style);
        self.targetStyle = style;
        // normalize 后：
        // props = {
        //          width: { v: 200, unit: 'px', f: interpolate }
        //          color: { v: '#ccc', unit: '', f: color }
        //         }

        /**
         * animation config
         */
        if (isConfig) {
            config = S.merge(defaultConfig, duration);
        } else {
            config = S.clone(defaultConfig);
            duration && (config.duration = PARSE_FLOAT(duration, 10) || 1);
            S.isString(easing) && (easing = Easing[easing]); // 可以是字符串, 比如 'easingOut'
            S.isFunction(easing) && (config.easing = easing);
            S.isFunction(callback) && (config.complete = callback);
        }
        self.config = config;

        /**
         * timer
         */
        //self.timer = undefined;

        // register callback
        if (S.isFunction(callback)) {
            self.on(EVENT_COMPLETE, callback);
        }
    }

    S.augment(Anim, S.EventTarget, {

        run: function() {
            var self = this, config = self.config,
                elem = self.domEl,
                duration = config.duration * 1000,
                easing = config.easing,
                start = S.now(), finish = start + duration,
                target = self.props,
                source = {}, prop, go;

            for (prop in target) source[prop] = parse(DOM.css(elem, prop));
            if(self.fire(EVENT_START) === false) return;

            self.stop(); // 先停止掉正在运行的动画

            self.timer = S.later((go = function () {
                var time = S.now(),
                    t = time > finish ? 1 : (time - start) / duration,
                    sp, tp, b;

                for (prop in target) {
                    sp = source[prop];
                    tp = target[prop];

                    // 比如 sp = { v: 0, u: 'pt'} ( width: 0 时，默认单位是 pt )
                    // 这时要把 sp 的单位调整为和 tp 的一致
                    if(tp.v == 0) tp.u = sp.u;

                    // 单位不一样时，以 tp.u 的为主，同时 sp 从 0 开始
                    // 比如：ie 下 border-width 默认为 medium
                    if(sp.u !== tp.u) sp.v = 0;

                    // go
                    DOM.css(elem, prop, tp.f(sp.v, tp.v, easing(t)) + tp.u);
                }

                if ((self.fire(EVENT_STEP) === false) || (b = time > finish)) {
                    self.stop();
                    // complete 事件只在动画到达最后一帧时才触发
                    if(b) self.fire(EVENT_COMPLETE);
                }
            }), STEP_INTERVAL, true);

            // 立刻执行
            go();

            return self;
        },

        stop: function(finish) {
            var self = this, elem = self.domEl,
                style = self.targetStyle;

            // 停止定时器
            if (self.timer) {
                self.timer.cancel();
                self.timer = undefined;
            }

            // 直接设置到最终样式
            if(finish) {
                if(S.UA.ie && style.indexOf(OPACITY) > -1) {
                    DOM.css(elem, OPACITY, self.props[OPACITY].v);
                }
                elem.style.cssText += ';' + style;
                self.fire(EVENT_COMPLETE);
            }

            return self;
        }
    });

    S.Anim = Anim;

    function normalize(style) {
        var css, rules = { }, i = PROPS.length, v;
        parseEl.innerHTML = '<div style="' + style + '"></div>';
        css = parseEl.firstChild.style;
        while (i--) if ((v = css[PROPS[i]])) rules[PROPS[i]] = parse(v);
        return rules;
    }

    function parse(val) {
        var num = PARSE_FLOAT(val), unit = (val + '').replace(/^[-\d\.]+/, '');
        return isNaN(num) ? { v: unit, u: '', f: colorEtc } : { v: num, u: unit, f: interpolate };
    }

    function interpolate(source, target, pos) {
        return (source + (target - source) * pos).toFixed(3);
    }

    function colorEtc(source, target, pos) {
        var i = 2, j, c, tmp, v = [], r = [];

        while (j = 3, c = arguments[i - 1], i--) {
            if (s(c, 0, 4) === 'rgb(') {
                c = c.match(/\d+/g);
                while (j--) v.push(~~c[j]);
            }
            else if(s(c, 0) === '#') {
                if (c.length === 4) c = '#' + s(c, 1) + s(c, 1) + s(c, 2) + s(c, 2) + s(c, 3) + s(c, 3);
                while (j--) v.push(parseInt(s(c, 1 + j * 2, 2), 16));
            }
            else { // red, black 等值，以及其它一切非颜色值，直接返回 target
                return target;
            }
        }

        while (j--) {
            tmp = ~~(v[j + 3] + (v[j] - v[j + 3]) * pos);
            r.push(tmp < 0 ? 0 : tmp > 255 ? 255 : tmp);
        }

        return 'rgb(' + r.join(',') + ')';
    }

    function s(str, p, c) {
        return str.substr(p, c || 1);
    }
});

/**
 * TODO:
 *  - 实现 jQuery Effects 的 queue / specialEasing / += / toogle,show,hide 等特性
 *  - 还有些情况就是动画不一定改变 CSS, 有可能是 scroll-left 等
 *
 * NOTES:
 *  - 与 emile 相比，增加了 borderStyle, 使得 border: 5px solid #ccc 能从无到有，正确显示
 *  - api 借鉴了 YUI, jQuery 以及 http://www.w3.org/TR/css3-transitions/
 *  - 代码实现了借鉴了 Emile.js: http://github.com/madrobby/emile
 */
/**
 * @module  anim-node-plugin
 * @author  lifesinger@gmail.com
 */
KISSY.add('anim-node-plugin', function(S, undefined) {

    var Anim = S.Anim,
        NP = S.Node.prototype, NLP = S.NodeList.prototype;

    S.each([NP, NLP], function(P) {

        P.animate = function() {
            var args = S.makeArray(arguments);

            S.each(this, function(elem) {
                Anim.apply(undefined, [elem].concat(args)).run();
            });
            
            return this;
        };
    })

});

/**
 * TODO:
 *  - ����ֱ�Ӹ� Node ��� Node.addMethods ����
 *  - �����Ƿ���� slideUp/slideDown/fadeIn/show/hide �ȿ�ݷ���
 *
 */
/*
Copyright 2010, KISSY UI Library v1.1.1dev
MIT Licensed
build time: ${build.time}
*/
/**
 * 数据延迟加载组件
 * @module   datalazyload
 * @creator  玉伯<lifesinger@gmail.com>
 * @depends  ks-core
 */
KISSY.add('datalazyload', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        win = window, doc = document,

        IMG_SRC_DATA = 'data-ks-lazyload',
        AREA_DATA_CLS = 'ks-datalazyload',
        CUSTOM = '-custom',
        MANUAL = 'manual',
        DISPLAY = 'display', DEFAULT = 'default', NONE = 'none',
        SCROLL = 'scroll', RESIZE = 'resize',

        defaultConfig = {

            /**
             * 懒处理模式
             *   auto   - 自动化。html 输出时，不对 img.src 做任何处理
             *   manual - 输出 html 时，已经将需要延迟加载的图片的 src 属性替换为 IMG_SRC_DATA
             * 注：对于 textarea 数据，只有手动模式
             */
            mod: MANUAL,

            /**
             * 当前视窗往下，diff px 外的 img/textarea 延迟加载
             * 适当设置此值，可以让用户在拖动时感觉数据已经加载好
             * 默认为当前视窗高度（两屏以外的才延迟加载）
             */
            diff: DEFAULT,

            /**
             * 图像的占位图，默认无
             */
            placeholder: NONE
        };

    /**
     * 延迟加载组件
     * @constructor
     */
    function DataLazyload(containers, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof DataLazyload)) {
            return new DataLazyload(containers, config);
        }

        // 允许仅传递 config 一个参数
        if (config === undefined) {
            config = containers;
            containers = [doc];
        }

        // containers 是一个 HTMLElement 时
        if (!S.isArray(containers)) {
            containers = [S.get(containers) || doc];
        }

        /**
         * 图片所在容器（可以多个），默认为 [doc]
         * @type Array
         */
        self.containers = containers;

        /**
         * 配置参数
         * @type Object
         */
        self.config = S.merge(defaultConfig, config);

        /**
         * 需要延迟下载的图片
         * @type Array
         */
        //self.images

        /**
         * 需要延迟处理的 textarea
         * @type Array
         */
        //self.areas

        /**
         * 开始延迟的 Y 坐标
         * @type number
         */
        //self.threshold

        self._init();
    }

    S.augment(DataLazyload, {

        /**
         * 初始化
         * @protected
         */
        _init: function() {
            var self = this;
            self.threshold = self._getThreshold();

            self._filterItems();
            self._getItemsLength() && self._initLoadEvent();
        },

        /**
         * 获取并初始化需要延迟的 images 和 areas
         * @protected
         */
        _filterItems: function() {
            var self = this,
                containers = self.containers,
                n, N, imgs, areas, i, len, img, area,
                lazyImgs = [], lazyAreas = [];

            for (n = 0,N = containers.length; n < N; ++n) {
                imgs = S.query('img', containers[n]);
                lazyImgs = lazyImgs.concat(S.filter(imgs, self._filterImg, self));

                areas = S.query('textarea', containers[n]);
                lazyAreas = lazyAreas.concat(S.filter(areas, self._filterArea, self));
            }

            self.images = lazyImgs;
            self.areas = lazyAreas;
        },

        /**
         * filter for lazyload image
         */
        _filterImg: function(img) {
            var self = this,
                dataSrc = img.getAttribute(IMG_SRC_DATA),
                threshold = self.threshold,
                placeholder = self.config.placeholder,
                isManualMod = self.config.mod === MANUAL;

            // 手工模式，只处理有 data-src 的图片
            if (isManualMod) {
                if (dataSrc) {
                    if (placeholder !== NONE) {
                        img.src = placeholder;
                    }
                    return true;
                }
            }
            // 自动模式，只处理 threshold 外无 data-src 的图片
            else {
                // 注意：已有 data-src 的项，可能已有其它实例处理过，不用再次处理
                if (DOM.offset(img).top > threshold && !dataSrc) {
                    DOM.attr(img, IMG_SRC_DATA, img.src);
                    if (placeholder !== NONE) {
                        img.src = placeholder;
                    } else {
                        img.removeAttribute('src');
                    }
                    return true;
                }
            }
        },

        /**
         * filter for lazyload textarea
         */
        _filterArea: function(area) {
            return DOM.hasClass(area, AREA_DATA_CLS);
        },

        /**
         * 初始化加载事件
         * @protected
         */
        _initLoadEvent: function() {
            var timer, self = this;

            // scroll 和 resize 时，加载图片
            Event.on(win, SCROLL, loader);
            Event.on(win, RESIZE, function() {
                self.threshold = self._getThreshold();
                loader();
            });

            // 需要立即加载一次，以保证第一屏的延迟项可见
            if (self._getItemsLength()) {
                S.ready(function() {
                    loadItems();
                });
            }

            // 加载函数
            function loader() {
                if (timer) return;
                timer = setTimeout(function() {
                    loadItems();
                    timer = null;
                }, 100); // 0.1s 内，用户感觉流畅
            }

            // 加载延迟项
            function loadItems() {
                self._loadItems();
                if (self._getItemsLength() === 0) {
                    Event.remove(win, SCROLL, loader);
                    Event.remove(win, RESIZE, loader);
                }
            }
        },

        /**
         * 加载延迟项
         */
        _loadItems: function() {
            this._loadImgs();
            this._loadAreas();
        },

        /**
         * 加载图片
         * @protected
         */
        _loadImgs: function() {
            var self = this;
            self.images = S.filter(self.images, self._loadImg, self);
        },

        /**
         * 监控滚动，处理图片
         */
        _loadImg: function(img) {
            var self = this,
                scrollTop = DOM.scrollTop(),
                threshold = self.threshold + scrollTop,
                offset = DOM.offset(img);

            if (offset.top <= threshold) {
                self._loadImgSrc(img);
            } else {
                return true;
            }
        },

        /**
         * 加载图片 src
         * @static
         */
        _loadImgSrc: function(img, flag) {
            flag = flag || IMG_SRC_DATA;
            var dataSrc = img.getAttribute(flag);

            if (dataSrc && img.src != dataSrc) {
                img.src = dataSrc;
                img.removeAttribute(flag);
            }
        },

        /**
         * 加载 textarea 数据
         * @protected
         */
        _loadAreas: function() {
            var self = this;
            self.areas = S.filter(self.areas, self._loadArea, self);
        },

        /**
         * 监控滚动，处理 textarea
         */
        _loadArea: function(area) {
            var self = this, top,
                isHidden = DOM.css(area, DISPLAY) === NONE;

            // 注：area 可能处于 display: none 状态，DOM.offset(area).top 返回 0
            // 这种情况下用 area.parentNode 的 Y 值来替代
            top = DOM.offset(isHidden ? area.parentNode : area).top;

            if (top <= self.threshold + DOM.scrollTop()) {
                self._loadAreaData(area.parentNode, area);
            } else {
                return true;
            }
        },

        /**
         * 从 textarea 中加载数据
         * @static
         */
        _loadAreaData: function(container, area) {
            //chengyu 大幅重构，使用正则识别 html 字符串里的 script，提高性能
            // 为了通用性，不要搜索 container 内的全部 script dom 节点执行

            // 采用隐藏 textarea 但不去除方式，去除会引发 Chrome 下错乱
            area.style.display = NONE;
            area.className = ''; // clear hook

            var content = DOM.create('<div>');
            container.insertBefore(content, area);
            DOM.html(content, area.value, true);

            //area.value = ''; // bug fix: 注释掉，不能清空，否则 F5 刷新，会丢内容
        },

        /**
         * 获取阈值
         * @protected
         */
        _getThreshold: function() {
            var diff = this.config.diff,
                vh = DOM.viewportHeight();

            if (diff === DEFAULT) return 2 * vh; // diff 默认为当前视窗高度（两屏以外的才延迟加载）
            else return vh + diff;
        },

        /**
         * 获取当前延迟项的数量
         * @protected
         */
        _getItemsLength: function() {
            return this.images.length + this.areas.length;
        },

        /**
         * 加载自定义延迟数据
         * @static
         */
        loadCustomLazyData: function(containers, type) {
            var self = this, area, imgs;

            // 支持数组
            if (!S.isArray(containers)) {
                containers = [S.get(containers)];
            }

            // 遍历处理
            S.each(containers, function(container) {
                switch (type) {
                    case 'img-src':
                        if (container.nodeName === 'IMG') { // 本身就是图片
                            imgs = [container];
                        } else {
                            imgs = S.query('img', container);
                        }
                        
                        S.each(imgs, function(img) {
                            self._loadImgSrc(img, IMG_SRC_DATA + CUSTOM);
                        });
                        
                        break;
                    
                    default:
                        area = S.get('textarea', container);
                        if (area && DOM.hasClass(area, AREA_DATA_CLS + CUSTOM)) {
                            self._loadAreaData(container, area);
                        }
                }
            });
        }
    });

    // attach static methods
    S.mix(DataLazyload, DataLazyload.prototype, true, ['loadCustomLazyData', '_loadImgSrc', '_loadAreaData']);

    S.DataLazyload = DataLazyload;
});

/**
 * NOTES:
 *
 * 模式为 auto 时：
 *  1. 在 Firefox 下非常完美。脚本运行时，还没有任何图片开始下载，能真正做到延迟加载。
 *  2. 在 IE 下不尽完美。脚本运行时，有部分图片已经与服务器建立链接，这部分 abort 掉，
 *     再在滚动时延迟加载，反而增加了链接数。
 *  3. 在 Safari 和 Chrome 下，因为 webkit 内核 bug，导致无法 abort 掉下载。该
 *     脚本完全无用。
 *  4. 在 Opera 下，和 Firefox 一致，完美。
 *  5. 2010-07-12: 发现在 Firefox 下，也有导致部分 Aborted 链接。
 *
 * 模式为 manual 时：（要延迟加载的图片，src 属性替换为 data-lazyload-src, 并将 src 的值赋为 placeholder ）
 *  1. 在任何浏览器下都可以完美实现。
 *  2. 缺点是不渐进增强，无 JS 时，图片不能展示。
 *
 * 缺点：
 *  1. 对于大部分情况下，需要拖动查看内容的页面（比如搜索结果页），快速滚动时加载有损用
 *     户体验（用户期望所滚即所得），特别是网速不好时。
 *  2. auto 模式不支持 Webkit 内核浏览器；IE 下，有可能导致 HTTP 链接数的增加。
 *
 * 优点：
 *  1. 可以很好的提高页面初始加载速度。
 *  2. 第一屏就跳转，延迟加载图片可以减少流量。
 *
 * 参考资料：
 *  1. http://davidwalsh.name/lazyload MooTools 的图片延迟插件
 *  2. http://vip.qq.com/ 模板输出时，就替换掉图片的 src
 *  3. http://www.appelsiini.net/projects/lazyload jQuery Lazyload
 *  4. http://www.dynamixlabs.com/2008/01/17/a-quick-look-add-a-loading-icon-to-your-larger-images/
 *  5. http://www.nczonline.net/blog/2009/11/30/empty-image-src-can-destroy-your-site/
 *
 * 特别要注意的测试用例:
 *  1. 初始窗口很小，拉大窗口时，图片加载正常
 *  2. 页面有滚动位置时，刷新页面，图片加载正常
 *  3. 手动模式，第一屏有延迟图片时，加载正常
 *
 * 2009-12-17 补充：
 *  1. textarea 延迟加载约定：页面中需要延迟的 dom 节点，放在
 *       <textarea class='ks-datalazysrc invisible'>dom code</textarea>
 *     里。可以添加 hidden 等 class, 但建议用 invisible, 并设定 height = '实际高度'，这样可以保证
 *     滚动时，diff 更真实有效。
 *     注意：textarea 加载后，会替换掉父容器中的所有内容。
 *  2. 延迟 callback 约定：dataLazyload.addCallback(el, fn) 表示当 el 即将出现时，触发 fn.
 *  3. 所有操作都是最多触发一次，比如 callback. 来回拖动滚动条时，只有 el 第一次出现时会触发 fn 回调。
 */

/**
 * zTODO:
 *   - [取消] 背景图片的延迟加载（对于 css 里的背景图片和 sprite 很难处理）
 *   - [取消] 加载时的 loading 图（对于未设定大小的图片，很难完美处理[参考资料 4]）
 */

/**
 * UPDATE LOG:
 *   - 2010-07-31 yubo IMG_SRC_DATA 由 data-lazyload-src 更名为 data-ks-lazyload + 支持 touch 设备
 *   - 2010-07-10 chengyu 重构，使用正则表达式识别 html 中的脚本，使用 EventTarget 自定义事件机制来处理回调
 *   - 2010-05-10 yubo ie6 下，在 dom ready 后执行，会导致 placeholder 重复加载，为比避免此问题，默认为 none, 去掉占位图
 *   - 2010-04-05 yubo 重构，使得对 YUI 的依赖仅限于 YDOM
 *   - 2009-12-17 yubo 将 imglazyload 升级为 datalazyload, 支持 textarea 方式延迟和特定元素即将出现时的回调函数
 */
/*
Copyright 2010, KISSY UI Library v1.1.0
MIT Licensed
build time: Aug 2 23:52
*/
/**
 * @module   Flash UA 探测
 * @author   kingfo<oicuicu@gmail.com>
 * @depends  ks-core
 */
KISSY.add('flash-ua', function(S) {

    var UA = S.UA, fpv, fpvF, firstRun = true;

    /**
     * 获取 Flash 版本号
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     */
    function getFlashVersion() {
        var ver, SF = 'ShockwaveFlash';

        // for NPAPI see: http://en.wikipedia.org/wiki/NPAPI
        if (navigator.plugins && navigator.mimeTypes.length) {
            ver = (navigator.plugins['Shockwave Flash'] || 0).description;
        }
        // for ActiveX see:	http://en.wikipedia.org/wiki/ActiveX
        else if (window.ActiveXObject) {
            try {
                ver = new ActiveXObject(SF + '.' + SF)['GetVariable']('$version');
            } catch(ex) {
                //S.log('getFlashVersion failed via ActiveXObject');
                // nothing to do, just return undefined
            }
        }

        // 插件没安装或有问题时，ver 为 undefined
        if(!ver) return;

        // 插件安装正常时，ver 为 "Shockwave Flash 10.1 r53" or "WIN 10,1,53,64"
        return arrify(ver);
    }

    /**
     * arrify("10.1.r53") => ["10", "1", "53"]
     */
    function arrify(ver) {
        return ver.match(/(\d)+/g);
    }

    /**
     * 格式：主版本号Major.次版本号Minor(小数点后3位，占3位)修正版本号Revision(小数点后第4至第8位，占5位)
     * ver 参数不符合预期时，返回 0
     * numerify("10.1 r53") => 10.00100053
     * numerify(["10", "1", "53"]) => 10.00100053
     * numerify(12.2) => 12.2
     */
    function numerify(ver) {
        var arr = S.isString(ver) ? arrify(ver) : ver, ret = ver;
        if (S.isArray(arr)) {
            ret = parseFloat(arr[0] + '.' + pad(arr[1], 3) + pad(arr[2], 5));
        }
        return ret || 0;
    }

    /**
     * pad(12, 5) => "00012"
     * ref: http://lifesinger.org/blog/2009/08/the-harm-of-tricky-code/
     */
    function pad(num, n) {
        var len = (num + '').length;
        while (len++ < n) {
            num = '0' + num;
        }
        return num;
    }

    /**
     * 返回数据 [M, S, R] 若未安装，则返回 undefined
     * fpv 全称是 flash player version
     */
    UA.fpv = function(force) {
        // 考虑 new ActiveX 和 try catch 的 性能损耗，延迟初始化到第一次调用时
        if(force || firstRun) {
            firstRun = false;
            fpv = getFlashVersion();
            fpvF = numerify(fpv);
        }
        return fpv;
    };

    /**
     * Checks fpv is greater than or equal the specific version.
     * 普通的 flash 版本检测推荐使用该方法
     * @param ver eg. "10.1.53"
     * <code>
     *    if(S.UA.fpvGEQ('9.9.2')) { ... }
     * </code>
     */
    UA.fpvGEQ = function(ver, force) {
        if(firstRun) UA.fpv(force);
        return !!fpvF && (fpvF >= numerify(ver));
    };

});

/**
 * NOTES:
 *
 -  ActiveXObject JS 小记
 -    newObj = new ActiveXObject(ProgID:String[, location:String])
 -    newObj      必需    用于部署 ActiveXObject  的变量
 -    ProgID      必选    形式为 "serverName.typeName" 的字符串
 -    serverName  必需    提供该对象的应用程序的名称
 -    typeName    必需    创建对象的类型或者类
 -    location    可选    创建该对象的网络服务器的名称

 -  Google Chrome 比较特别：
 -    即使对方未安装 flashplay 插件 也含最新的 Flashplayer
 -    ref: http://googlechromereleases.blogspot.com/2010/03/dev-channel-update_30.html
 *
 */
/**
 * @module   Flash 全局静态类
 * @author   kingfo<oicuicu@gmail.com>
 * @depends  ks-core
 */
KISSY.add('flash', function(S){
	
	S.Flash = {
		/**
		 * flash 实例 map { '#id': elem, ... }
         * @static
		 */
		swfs: { length: 0 }
	};
});
/**
 * @module   将 swf 嵌入到页面中
 * @author   kingfo<oicuicu@gmail.com>, 射雕<lifesinger@gmail.com>
 * @depends  ks-core + json
 */
KISSY.add('flash-embed', function(S) {

    var UA = S.UA, DOM = S.DOM, Flash = S.Flash,

        SWF_SUCCESS = 1,
        FP_LOW = 0,
        FP_UNINSTALL = -1,
        TARGET_NOT_FOUND = -2,  // 指定 ID 的对象未找到
        SWF_SRC_UNDEFINED = -3, // swf 的地址未指定

        RE_FLASH_TAGS = /object|embed/i,
        CID = 'clsid:d27cdb6e-ae6d-11cf-96b8-444553540000',
        TYPE = 'application/x-shockwave-flash',
        FLASHVARS = 'flashvars', EMPTY = '',
        PREFIX = 'ks-flash-', ID_PRE = '#',
        encode = encodeURIComponent,

        // flash player 的参数范围
        PARAMS = {
            ////////////////////////// 高频率使用的参数
            //flashvars: EMPTY,     // swf 传入的第三方数据。支持复杂的 Object / XML 数据 / JSON 字符串
            wmode: EMPTY,
            allowscriptaccess: EMPTY,
            allownetworking: EMPTY,
            allowfullscreen: EMPTY,
            ///////////////////////// 显示 控制 删除 
            play: 'false',
            loop: EMPTY,
            menu: EMPTY,
            quality: EMPTY,
            scale: EMPTY,
            salign: EMPTY,
            bgcolor: EMPTY,
            devicefont: EMPTY,
            /////////////////////////	其他控制参数
            base: EMPTY,
            swliveconnect: EMPTY,
            seamlesstabbing: EMPTY
        },

        defaultConifg = {
            //src: '',       // swf 路径
            params: { },     // Flash Player 的配置参数
            attrs: {         // swf 对应 DOM 元素的属性
                width: 215,	 // 最小控制面板宽度,小于此数字将无法支持在线快速安装
                height: 138  // 最小控制面板高度,小于此数字将无法支持在线快速安装
            },
            //xi: '',	     //	快速安装地址。全称 express install  // ? 默认路径
            version: 9       //	要求的 Flash Player 最低版本
        };


    S.mix(Flash, {

        fpv: UA.fpv,

        fpvGEQ: UA.fpvGEQ,

        len: function () {
            return Flash.swfs.length;
        },

        /**
         * 添加 SWF 对象
         * @param target {String|HTMLElement}  #id or element
         */
        add: function(target, config, callback) {
            var self = this, xi, id;

            // 标准化配置信息
            config = Flash._normalize(config);

            // 合并配置信息
            config = S.merge(defaultConifg, config);
            config.attrs = S.merge(defaultConifg.attrs, config.attrs);


            // 1. target 元素未找到
            if (!(target = S.get(target))) {
                self._callback(callback, TARGET_NOT_FOUND);
                return;
            }

            // 保存 id, 没有则自动生成
            if (!target.id) target.id = S.guid(PREFIX);
            id = config.attrs.id = ID_PRE + target.id;

            // 2. flash 插件没有安装
            if (!UA.fpv()) {
                self._callback(callback, FP_UNINSTALL, id, target);
                return;
            }

            // 3. 已安装，但当前客户端版本低于指定版本时
            if (!UA.fpvGEQ(config.version)) {
                self._callback(callback, FP_LOW, id, target);

                // 有 xi 时，将 src 替换为快速安装
                if (!((xi = config.xi) && S.isString(xi))) return;
                config.src = xi;
            }

            // 对已有 HTML 结构的 SWF 进行注册使用
            if (RE_FLASH_TAGS.test(target.nodeName)) {
                self._register(target, config, callback);
                return;
            }

            // src 未指定
            if (!config.src) {
                self._callback(callback, SWF_SRC_UNDEFINED, id, target);
                return;
            }

            // 替换 target 为 SWF 嵌入对象
            self._embed(target, config, callback);
        },

        /**
         * 获得已注册到 S.Flash 的 SWF
         * 注意，请不要混淆 DOM.get() 和 Flash.get()
         * 只有成功执行过 S.Flash.add() 的 SWF 才可以被获取
         * @return {HTMLElement}  返回 SWF 的 HTML 元素(object/embed). 未注册时，返回 undefined
         */
        get: function(id) {
            return Flash.swfs[id];
        },

        /**
         * 移除已注册到 S.Flash 的 SWF 和 DOM 中对应的 HTML 元素
         */
        remove: function(id) {
            var swf = Flash.get(id);
            if (swf) {
                DOM.remove(swf);
                delete Flash.swfs['#' + swf.id];
                Flash.swfs.length -= 1;
            }
        },

        /**
         * 检测是否存在已注册的 swf
         * 只有成功执行过 S.Flash.add() 的 SWF 才可以被获取到
         * @return {Boolean}
         */
        contains: function(target) {
            var swfs = Flash.swfs,
                id, ret = false;

            if (S.isString(target)) {
                ret = (target in swfs);
            } else {
                for (id in swfs)
                    if (swfs[id] === target) {
                        ret = true;
                        break;
                    }
            }
            return ret;
        },

        _register: function(swf, config, callback) {
            var id = config.attrs.id;
            Flash._addSWF(id, swf);
            Flash._callback(callback, SWF_SUCCESS, id, swf);
        },

        _embed: function (target, config, callback) {
            var o = Flash._createSWF(config.src, config.attrs, config.params);
			
            if (UA.ie) {
                // ie 下，通过纯 dom 操作插入的 object 会一直处于加载状态中
                // 只能通过 innerHTML/outerHTML 嵌入
                target.outerHTML = o.outerHTML;
            }
            else {
                target.parentNode.replaceChild(o, target);
            }

            Flash._register(target, config, callback);
        },

        _callback: function(callback, type, id, swf) {
            if (type && S.isFunction(callback)) {
                callback({
                    status: type,
                    id: id,
                    swf: swf
                });
            }
        },

        _addSWF: function(id, swf) {
            if (id && swf) {
                Flash.swfs[id] = swf;
                Flash.swfs.length += 1;
            }
        },

        _createSWF: function (src, attrs, params) {
            var o = DOM.create('<object>'), k;

            // 普通属性设置
            DOM.attr(o, attrs);

            // 特殊属性设置
            if (UA.ie) {
                DOM.attr(o, 'classid', CID);
                appendParam(o, 'movie', src);
            }
            else {
                DOM.attr(o, {
                    type: TYPE,
                    data: src,
                    name: attrs.id
                });
            }
			
            // 添加 params
            for (k in params) {
                if (k in PARAMS) appendParam(o, k, params[k]);
            }
            if (params[FLASHVARS]) {
                appendParam(o, FLASHVARS,  Flash.toFlashVars(params[FLASHVARS]));
            }

            return o;
        },

        /**
         * 将对象的 key 全部转为小写
         * 一般用于配置选项 key 的标准化
         */
        _normalize: function(obj) {
            var key, val, prop, ret = obj;

            if (S.isPlainObject(obj)) {
                ret = {};

                for (prop in obj) {
                    key = prop.toLowerCase();
                    val = obj[prop];

                    // 忽略自定义传参内容标准化
                    if (key !== FLASHVARS) val = Flash._normalize(val);

                    ret[key] = val;
                }
            }
            return ret;
        },

        /**
         * 将普通对象转换为 flashvars
         * eg: {a: 1, b: { x: 2, z: 's=1&c=2' }} => a=1&b={"x":2,"z":"s%3D1%26c%3D2"}
         */
        toFlashVars: function(obj) {
            if (!S.isPlainObject(obj)) return EMPTY; // 仅支持 PlainOject
            var prop, data, arr = [];

            for (prop in obj) {
                data = obj[prop];

                // 字符串，用双引号括起来
                if (S.isString(data)) {
                    data = '"' + encode(data) + '"';
                }
                // 其它值，用 stringify 转换后，再转义掉字符串值
                else {
                    data = (S.JSON.stringify(data));
                    if (!data) continue; // 忽略掉 undefined, fn 等值
                    
                    data = data.replace(/:"([^"]+)/g, function(m, val) {
                        return ':"' + encode(val);
                    });
                }

                arr.push(prop + '=' + data);
            }

            return arr.join('&');
        }
    });

    function appendParam(o, name, val) {
        var param = DOM.create('<param>');
        DOM.attr(param, { name: name, value: val });
        o.appendChild(param);
    }
});

/**
 * NOTES:
 * 2010/07/21   向 google code 提交了基础代码
 * 2010/07/22   修正了 embed 始终都有 callback 尝试性调用
 *              避免了未定义 el/id 或 swfurl 时无法获知错误
 * 2010/07/27   迁移至 github 做版本管理。向 kissy-sandbox 提交代码
 * 2010/07/28   合并了公开方法 Flash.register 和 Flash.embed 为 Flash.add()
 *              修改 Flash.length() 为 Flash.getLength(), 使其看上去更像方法而非属性方式获取
 * 2010/07/29   重构到 kissy 项目中
 * 2010/07/30	增加了标准化配置项方法 _normalize(); 修正 flashvars 转 String 方式为 toFlashVars
 */
/*
Copyright 2010, KISSY UI Library v1.1.1dev
MIT Licensed
build time: ${build.time}
*/
/**
 * Switchable
 * @creator  玉伯<lifesinger@gmail.com>
 * @depends  ks-core
 */
KISSY.add('switchable', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        FORWARD = 'forward', BACKWARD = 'backward',
        DOT = '.',
        EVENT_BEFORE_INIT = 'beforeInit', EVENT_INIT = 'init',
        EVENT_BEFORE_SWITCH = 'beforeSwitch', EVENT_SWITCH = 'switch',
        CLS_PREFIX = 'ks-switchable-';

    /**
     * Switchable Widget
     * attached members：
     *   - this.container
     *   - this.config
     *   - this.triggers  可以为空值 []
     *   - this.panels    可以为空值 []
     *   - this.content
     *   - this.length
     *   - this.activeIndex
     *   - this.switchTimer
     */
    function Switchable(container, config) {
        var self = this;

        // 调整配置信息
        config = config || {};
        if (!('markupType' in config)) {
            if (config.panelCls) {
                config.markupType = 1;
            } else if (config.panels) {
                config.markupType = 2;
            }
        }
        config = S.merge(Switchable.Config, config);

        /**
         * the container of widget
         * @type HTMLElement
         */
        self.container = S.get(container);

        /**
         * 配置参数
         * @type Object
         */
        self.config = config;

        /**
         * triggers
         * @type Array of HTMLElement
         */
        //self.triggers

        /**
         * panels
         * @type Array of HTMLElement
         */
        //self.panels

        /**
         * length = panels.length / steps
         * @type number
         */
        //self.length

        /**
         * the parentNode of panels
         * @type HTMLElement
         */
        //self.content

        /**
         * 当前激活的 index
         * @type Number
         */
        self.activeIndex = config.activeIndex;

        self._init();
    }

    // 默认配置
    Switchable.Config = {
        markupType: 0, // markup 的类型，取值如下：

        // 0 - 默认结构：通过 nav 和 content 来获取 triggers 和 panels
        navCls: CLS_PREFIX + 'nav',
        contentCls: CLS_PREFIX + 'content',

        // 1 - 适度灵活：通过 cls 来获取 triggers 和 panels
        triggerCls: CLS_PREFIX + 'trigger',
        panelCls: CLS_PREFIX + 'panel',

        // 2 - 完全自由：直接传入 triggers 和 panels
        triggers: [],
        panels: [],

        // 是否有触点
        hasTriggers: true,

        // 触发类型
        triggerType: 'mouse', // or 'click'
        // 触发延迟
        delay: .1, // 100ms

        activeIndex: 0, // markup 的默认激活项，应该与此 index 一致
        activeTriggerCls: 'ks-active',

        // 可见视图内有多少个 panels
        steps: 1,

        // 可见视图区域的大小。一般不需要设定此值，仅当获取值不正确时，用于手工指定大小
        viewSize: []
    };

    // 插件
    Switchable.Plugins = [];

    S.augment(Switchable, S.EventTarget, {

        /**
         * init switchable
         */
        _init: function() {
            var self = this, cfg = self.config;

            // fire event
            if(self.fire(EVENT_BEFORE_INIT) === false) return;

            // parse markup
            self._parseMarkup();

            // bind triggers
            if (cfg.hasTriggers) {
                self._bindTriggers();
            }

            // init plugins
            S.each(Switchable.Plugins, function(plugin) {
                if(plugin.init) {
                    plugin.init(self);
                }
            });
            
            self.fire(EVENT_INIT);
        },

        /**
         * 解析 markup, 获取 triggers, panels, content
         */
        _parseMarkup: function() {
            var self = this, container = self.container,
                cfg = self.config,
                nav, content, triggers = [], panels = [], i, n, m;

            switch (cfg.markupType) {
                case 0: // 默认结构
                    nav = S.get(DOT + cfg.navCls, container);
                    if (nav) triggers = DOM.children(nav);
                    content = S.get(DOT + cfg.contentCls, container);
                    panels = DOM.children(content);
                    break;
                case 1: // 适度灵活
                    triggers = S.query(DOT + cfg.triggerCls, container);
                    panels = S.query(DOT + cfg.panelCls, container);
                    break;
                case 2: // 完全自由
                    triggers = cfg.triggers;
                    panels = cfg.panels;
                    break;
            }


            // get length
            n = panels.length;
            self.length = n / cfg.steps;

            // 自动生成 triggers
            if (cfg.hasTriggers && n > 0 && triggers.length === 0) {
                triggers = self._generateTriggersMarkup(self.length);
            }

            // 将 triggers 和 panels 转换为普通数组
            self.triggers = S.makeArray(triggers);
            self.panels = S.makeArray(panels);

            // get content
            self.content = content || panels[0].parentNode;
        },

        /**
         * 自动生成 triggers 的 markup
         */
        _generateTriggersMarkup: function(len) {
            var self = this, cfg = self.config,
                ul = DOM.create('<ul>'), li, i;

            ul.className = cfg.navCls;
            for (i = 0; i < len; i++) {
                li = DOM.create('<li>');
                if (i === self.activeIndex) {
                    li.className = cfg.activeTriggerCls;
                }
                li.innerHTML = i + 1;
                ul.appendChild(li);
            }

            self.container.appendChild(ul);
            return DOM.children(ul);
        },

        /**
         * 给 triggers 添加事件
         */
        _bindTriggers: function() {
            var self = this, cfg = self.config,
                triggers = self.triggers, trigger,
                i, len = triggers.length;

            for (i = 0; i < len; i++) {
                (function(index) {
                    trigger = triggers[index];

                    // 响应点击和 Tab 键
                    Event.on(trigger, 'click focus', function() {
                        self._onFocusTrigger(index);
                    });

                    // 响应鼠标悬浮
                    if (cfg.triggerType === 'mouse') {
                        Event.on(trigger, 'mouseenter', function() {
                            self._onMouseEnterTrigger(index);
                        });
                        Event.on(trigger, 'mouseleave', function() {
                            self._onMouseLeaveTrigger(index);
                        });
                    }
                })(i);
            }
        },

        /**
         * click or tab 键激活 trigger 时触发的事件
         */
        _onFocusTrigger: function(index) {
            var self = this;
            if (!self._triggerIsValid()) return; // 重复点击

            this._cancelSwitchTimer(); // 比如：先悬浮，再立刻点击，这时悬浮触发的切换可以取消掉。
            self.switchTo(index);
        },

        /**
         * 鼠标悬浮在 trigger 上时触发的事件
         */
        _onMouseEnterTrigger: function(index) {
            var self = this;
            if (!self._triggerIsValid()) return; // 重复悬浮。比如：已显示内容时，将鼠标快速滑出再滑进来，不必再次触发。

            self.switchTimer = S.later(function() {
                self.switchTo(index);
            }, self.config.delay * 1000);
        },

        /**
         * 鼠标移出 trigger 时触发的事件
         */
        _onMouseLeaveTrigger: function() {
            this._cancelSwitchTimer();
        },

        /**
         * 重复触发时的有效判断
         */
        _triggerIsValid: function(index) {
            return this.activeIndex !== index;
        },

        /**
         * 取消切换定时器
         */
        _cancelSwitchTimer: function() {
            var self = this;
            if(self.switchTimer) {
                self.switchTimer.cancel();
                self.switchTimer = undefined;
            }
        },

        /**
         * 切换操作
         */
        switchTo: function(index, direction) {
            var self = this, cfg = self.config,
                triggers = self.triggers, panels = self.panels,
                activeIndex = self.activeIndex,
                steps = cfg.steps,
                fromIndex = activeIndex * steps, toIndex = index * steps;

            if (!self._triggerIsValid()) return self; // 再次避免重复触发
            if (self.fire(EVENT_BEFORE_SWITCH, {toIndex: index}) === false) return self;

            // switch active trigger
            if (cfg.hasTriggers) {
                self._switchTrigger(activeIndex > -1 ? triggers[activeIndex] : null, triggers[index]);
            }

            // switch active panels
            if (direction === undefined) {
                direction = index > activeIndex ? FORWARD : BACKWARD;
            }

            // switch view
            self._switchView(
                panels.slice(fromIndex, fromIndex + steps),
                panels.slice(toIndex, toIndex + steps),
                index,
                direction);

            // update activeIndex
            self.activeIndex = index;

            return self; // chain
        },

        /**
         * 切换当前触点
         */
        _switchTrigger: function(fromTrigger, toTrigger/*, index*/) {
            var activeTriggerCls = this.config.activeTriggerCls;

            if (fromTrigger) DOM.removeClass(fromTrigger, activeTriggerCls);
            DOM.addClass(toTrigger, activeTriggerCls);
        },

        /**
         * 切换视图
         */
        _switchView: function(fromPanels, toPanels, index/*, direction*/) {
            // 最简单的切换效果：直接隐藏/显示
            DOM.css(fromPanels, DISPLAY, NONE);
            DOM.css(toPanels, DISPLAY, BLOCK);

            // fire onSwitch events
            this._fireOnSwitch(index);
        },

        /**
         * 触发 switch 相关事件
         */
        _fireOnSwitch: function(index) {
            this.fire(EVENT_SWITCH, { currentIndex: index });
        },

        /**
         * 切换到上一视图
         */
        prev: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex > 0 ? activeIndex - 1 : self.length - 1, BACKWARD);
        },

        /**
         * 切换到下一视图
         */
        next: function() {
            var self = this, activeIndex = self.activeIndex;
            self.switchTo(activeIndex < self.length - 1 ? activeIndex + 1 : 0, FORWARD);
        }
    });

    S.Switchable = Switchable;
});

/**
 * NOTES:
 *
 * 2010.07
 *  - 重构，去掉对 YUI2-Animation 的依赖
 *
 * 2010.04
 *  - 重构，脱离对 yahoo-dom-event 的依赖
 *
 * 2010.03
 *  - 重构，去掉 Widget, 部分代码直接采用 kissy 基础库
 *  - 插件机制从 weave 织入法改成 hook 钩子法
 *
 * TODO:
 *  - http://malsup.com/jquery/cycle/
 *  - http://www.mall.taobao.com/go/chn/mall_chl/flagship.php
 *  - 对 touch 设备的支持
 *
 * References:
 *  - jQuery Scrollable http://flowplayer.org/tools/scrollable.html
 *
 */
/**
 * Switchable Autoplay Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-autoplay', function(S, undefined) {

    var Event = S.Event,
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        autoplay: false,
        interval: 5, // 自动播放间隔时间
        pauseOnHover: true  // triggerType 为 mouse 时，鼠标悬停在 slide 上是否暂停自动播放
    });

    /**
     * 添加插件
     * attached members:
     *   - this.paused
     */
    Switchable.Plugins.push({

        name: 'autoplay',

        init: function(host) {
            var cfg = host.config, interval = cfg.interval * 1000, timer;
            if (!cfg.autoplay) return;

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    if(timer) {
                        timer.cancel();
                        timer = undefined;
                    }
                    host.paused = true; // paused 可以让外部知道 autoplay 的当前状态
                });
                Event.on(host.container, 'mouseleave', function() {
                    host.paused = false;
                    startAutoplay();
                });
            }

            function startAutoplay() {
                // 设置自动播放
                timer = S.later(function() {
                    if (host.paused) return;

                    // 自动播放默认 forward（不提供配置），这样可以保证 circular 在临界点正确切换
                    host.switchTo(host.activeIndex < host.length - 1 ? host.activeIndex + 1 : 0, 'forward');
                }, interval, true);
            }

            // go
            startAutoplay();
        }
    });
});
/**
 * Switchable Effect Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-effect', function(S, undefined) {

    var DOM = S.DOM, Anim = S.Anim,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',
        OPACITY = 'opacity', Z_INDEX = 'z-index',
        POSITION = 'position', RELATIVE = 'relative', ABSOLUTE = 'absolute',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly', FADE = 'fade',
        LEFT = 'left', TOP = 'top', FLOAT = 'float', PX = 'px',
        Switchable = S.Switchable, Effects;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        effect: NONE, // 'scrollx', 'scrolly', 'fade' 或者直接传入 custom effect fn
        duration: .5, // 动画的时长
        easing: 'easeNone' // easing method
    });

    /**
     * 定义效果集
     */
    Switchable.Effects = {

        // 最朴素的显示/隐藏效果
        none: function(fromEls, toEls, callback) {
            DOM.css(fromEls, DISPLAY, NONE);
            DOM.css(toEls, DISPLAY, BLOCK);
            callback();
        },

        // 淡隐淡现效果
        fade: function(fromEls, toEls, callback) {
            if (fromEls.length !== 1) {
                S.error('fade effect only supports steps == 1.');
            }
            var self = this, cfg = self.config,
                fromEl = fromEls[0], toEl = toEls[0];

            if (self.anim) self.anim.stop(true);

            // 首先显示下一张
            DOM.css(toEl, OPACITY, 1);

            // 动画切换
            self.anim = new Anim(fromEl, { opacity: 0 }, cfg.duration, cfg.easing, function() {
                self.anim = undefined; // free

                // 切换 z-index
                DOM.css(toEl, Z_INDEX, 9);
                DOM.css(fromEl, Z_INDEX, 1);

                callback();
            }).run();
        },

        // 水平/垂直滚动效果
        scroll: function(fromEls, toEls, callback, index) {
            var self = this, cfg = self.config,
                isX = cfg.effect === SCROLLX,
                diff = self.viewSize[isX ? 0 : 1] * index,
                props = { };

            props[isX ? LEFT : TOP] = -diff + PX;
            if (self.anim) self.anim.stop();

            self.anim = new Anim(self.content, props, cfg.duration, cfg.easing, function() {
                self.anim = undefined; // free
                callback();
            }).run();
        }
    };
    Effects = Switchable.Effects;
    Effects[SCROLLX] = Effects[SCROLLY] = Effects.scroll;

    /**
     * 添加插件
     * attached members:
     *   - this.viewSize
     */
    Switchable.Plugins.push({

        name: 'effect',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config, effect = cfg.effect,
                panels = host.panels, content = host.content,
                steps = cfg.steps,
                activeIndex = host.activeIndex,
                len = panels.length;

            // 1. 获取高宽
            host.viewSize = [
                cfg.viewSize[0] || panels[0].offsetWidth * steps,
                cfg.viewSize[1] || panels[0].offsetHeight * steps
            ];
            // 注：所有 panel 的尺寸应该相同
            //    最好指定第一个 panel 的 width 和 height, 因为 Safari 下，图片未加载时，读取的 offsetHeight 等值会不对

            // 2. 初始化 panels 样式
            if (effect !== NONE) { // effect = scrollx, scrolly, fade

                // 这些特效需要将 panels 都显示出来
                S.each(panels, function(panel) {
                    DOM.css(panel, DISPLAY, BLOCK);
                });

                switch (effect) {
                    // 如果是滚动效果
                    case SCROLLX:
                    case SCROLLY:
                        // 设置定位信息，为滚动效果做铺垫
                        DOM.css(content, POSITION, ABSOLUTE);
                        DOM.css(content.parentNode, POSITION, RELATIVE); // 注：content 的父级不一定是 container

                        // 水平排列
                        if (effect === SCROLLX) {
                            DOM.css(panels, FLOAT, LEFT);

                            // 设置最大宽度，以保证有空间让 panels 水平排布
                            DOM.width(content, host.viewSize[0] * (len / steps));
                        }
                        break;

                    // 如果是透明效果，则初始化透明
                    case FADE:
                        var min = activeIndex * steps,
                            max = min + steps - 1,
                            isActivePanel;

                        S.each(panels, function(panel, i) {
                            isActivePanel = i >= min && i <= max;
                            DOM.css(panel, {
                                opacity: isActivePanel ? 1 : 0,
                                position: ABSOLUTE,
                                zIndex: isActivePanel ? 9 : 1
                            });
                        });
                        break;
                }
            }

            // 3. 在 CSS 里，需要给 container 设定高宽和 overflow: hidden
        }
    });

    /**
     * 覆盖切换方法
     */
    S.augment(Switchable, {

        _switchView: function(fromEls, toEls, index, direction) {
            var self = this, cfg = self.config,
                effect = cfg.effect,
                fn = S.isFunction(effect) ? effect : Effects[effect];

            fn.call(self, fromEls, toEls, function() {
                self._fireOnSwitch(index);
            }, index, direction);
        }

    });
});
/**
 * Switchable Circular Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-circular', function(S, undefined) {

    var DOM = S.DOM,
        POSITION = 'position', RELATIVE = 'relative',
        LEFT = 'left', TOP = 'top',
        EMPTY = '', PX = 'px',
        FORWARD = 'forward', BACKWARD = 'backward',
        SCROLLX = 'scrollx', SCROLLY = 'scrolly',
        Switchable = S.Switchable;

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        circular: false
    });

    /**
     * 循环滚动效果函数
     */
    function circularScroll(fromEls, toEls, callback, index, direction) {
        var self = this, cfg = self.config,
            len = self.length,
            activeIndex = self.activeIndex,
            isX = cfg.scrollType === SCROLLX,
            prop = isX ? LEFT : TOP,
            viewDiff = self.viewSize[isX ? 0 : 1],
            diff = -viewDiff * index,
            props = {},
            isCritical,
            isBackward = direction === BACKWARD;

        // 从第一个反向滚动到最后一个 or 从最后一个正向滚动到第一个
        isCritical = (isBackward && activeIndex === 0 && index === len - 1)
            || (direction === FORWARD && activeIndex === len - 1 && index === 0);

        if (isCritical) {
            // 调整位置并获取 diff
            diff = adjustPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
        }
        props[prop] = diff + PX;

        // 开始动画
        if (self.anim) self.anim.stop();
        self.anim = new S.Anim(self.content, props, cfg.duration, cfg.easing, function() {
            if (isCritical) {
                // 复原位置
                resetPosition.call(self, self.panels, index, isBackward, prop, viewDiff);
            }
            // free
            self.anim = undefined;
            callback();
        }).run();
    }

    /**
     * 调整位置
     */
    function adjustPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 调整 panels 到下一个视图中
        for (i = from; i < to; i++) {
            DOM.css(panels[i], POSITION, RELATIVE);
            DOM.css(panels[i], prop, (isBackward ? -1 : 1) * viewDiff * len);
        }

        // 偏移量
        return isBackward ? viewDiff : -viewDiff * len;
    }

    /**
     * 复原位置
     */
    function resetPosition(panels, index, isBackward, prop, viewDiff) {
        var self = this, cfg = self.config,
            steps = cfg.steps,
            len = self.length,
            start = isBackward ? len - 1 : 0,
            from = start * steps,
            to = (start + 1) * steps,
            i;

        // 滚动完成后，复位到正常状态
        for (i = from; i < to; i++) {
            DOM.css(panels[i], POSITION, EMPTY);
            DOM.css(panels[i], prop, EMPTY);
        }

        // 瞬移到正常位置
        DOM.css(self.content, prop, isBackward ? -viewDiff * (len - 1) : EMPTY);
    }

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name: 'circular',

        /**
         * 根据 effect, 调整初始状态
         */
        init: function(host) {
            var cfg = host.config;

            // 仅有滚动效果需要下面的调整
            if (cfg.circular && (cfg.effect === SCROLLX || cfg.effect === SCROLLY)) {
                // 覆盖滚动效果函数
                cfg.scrollType = cfg.effect; // 保存到 scrollType 中
                cfg.effect = circularScroll;
            }
        }
    });
});

/**
 * TODO:
 *   - 是否需要考虑从 0 到 2（非最后一个） 的 backward 滚动？需要更灵活
 */
/**
 * Switchable Lazyload Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('switchable-lazyload', function(S) {

    var DOM = S.DOM,
        EVENT_BEFORE_SWITCH = 'beforeSwitch',
        IMG_SRC = 'img-src',
        AREA_DATA = 'area-data',
        FLAGS = { },
        Switchable = S.Switchable;

    FLAGS[IMG_SRC] = 'data-ks-lazyload-custom';
    FLAGS[AREA_DATA] = 'ks-datalazyload-custom';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        lazyDataType: AREA_DATA // or IMG_SRC
    });

    /**
     * 织入初始化函数
     */
    Switchable.Plugins.push({

        name: 'lazyload',

        init: function(host) {
            var DataLazyload = S.DataLazyload,
                cfg = host.config,
                type = cfg.lazyDataType, flag = FLAGS[type];

            if (!DataLazyload || !type || !flag) return; // 没有延迟项

            host.on(EVENT_BEFORE_SWITCH, loadLazyData);

            /**
             * 加载延迟数据
             */
            function loadLazyData(ev) {
                var steps = cfg.steps,
                    from = ev.toIndex * steps ,
                    to = from + steps;

                DataLazyload.loadCustomLazyData(host.panels.slice(from, to), type);
                if (isAllDone()) {
                    host.detach(EVENT_BEFORE_SWITCH, loadLazyData);
                }
            }

            /**
             * 是否都已加载完成
             */
            function isAllDone() {
                var elems, i, len,
                    isImgSrc = type === IMG_SRC,
                    tagName = isImgSrc ? 'img' : (type === AREA_DATA ? 'textarea' : '');

                if (tagName) {
                    elems = S.query(tagName, host.container);
                    for (i = 0, len = elems.length; i < len; i++) {
                        if (isImgSrc ? DOM.attr(elems[i], flag) : DOM.hasClass(elems[i], flag)) return false;
                    }
                }
                return true;
            }
        }
    });
});
/**
 * Switchable Countdown Plugin
 * @creator  gonghao<gonghao@ghsky.com>
 */
KISSY.add('switchable-countdown', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event, Anim = S.Anim,
        Switchable = S.Switchable,
        CLS_PREFIX = 'ks-switchable-trigger-',
        TRIGGER_MASK_CLS = CLS_PREFIX + 'mask',
        TRIGGER_CONTENT_CLS = CLS_PREFIX + 'content',
        STYLE = 'style';

    /**
     * 添加默认配置
     */
    S.mix(Switchable.Config, {
        countdown: false,
        countdownFromStyle: '',      // 倒计时的初始样式
        countdownToStyle: 'width: 0' // 初始样式由用户在 css 里指定，配置里仅需要传入有变化的最终样式
    });

    /**
     * 添加插件
     */
    Switchable.Plugins.push({

        name: 'countdown',

        init: function(host) {
            var cfg = host.config, interval = cfg.interval,
                triggers = host.triggers, masks = [],
                fromStyle = cfg.countdownFromStyle, toStyle = cfg.countdownToStyle,
                anim;

            // 必须保证开启 autoplay 以及有 trigger 时，才能开启倒计时动画
            if (!cfg.autoplay || !cfg.hasTriggers || !cfg.countdown) return;

            // 为每个 trigger 增加倒计时动画覆盖层
            S.each(triggers, function(trigger, i) {
                trigger.innerHTML = '<div class="' + TRIGGER_MASK_CLS + '"></div>' +
                    '<div class="' + TRIGGER_CONTENT_CLS + '">' + trigger.innerHTML + '</div>';
                masks[i] = trigger.firstChild;
            });

            // 鼠标悬停，停止自动播放
            if (cfg.pauseOnHover) {
                Event.on(host.container, 'mouseenter', function() {
                    // 先停止未完成动画
                    stopAnim();

                    // 快速平滑回退到初始状态
                    var mask = masks[host.activeIndex];
                    if (fromStyle) {
                        anim = new Anim(mask, fromStyle, .2, 'easeOut').run();
                    } else {
                        DOM.removeAttr(mask, STYLE);
                    }
                });

                Event.on(host.container, 'mouseleave', function() {
                    // 鼠标离开时立即停止未完成动画
                    stopAnim();

                    // 初始化动画参数，准备开始新一轮动画
                    DOM.removeAttr(masks[host.activeIndex], STYLE);

                    // 重新开始倒计时动画
                    setTimeout(startAnim, 200);
                });
            }

            // panels 切换前，当前 trigger 完成善后工作以及下一 trigger 进行初始化
            host.on('beforeSwitch', function() {
                // 恢复前，先结束未完成动画效果
                stopAnim();

                // 将当前 mask 恢复动画前状态
                DOM.removeAttr(masks[host.activeIndex], STYLE);
            });

            // panel 切换完成时，开始 trigger 的倒计时动画
            host.on('switch', function() {
                // 悬停状态，当用户主动触发切换时，不需要倒计时动画
                if (!host.paused) {
                    startAnim();
                }
            });

            // 开始第一次
            startAnim(host.activeIndex);

            // 开始倒计时动画
            function startAnim() {
                stopAnim(); // 开始之前，先确保停止掉之前的
                anim = new Anim(masks[host.activeIndex], toStyle, interval - .5).run(); // -.5 是为了动画结束时停留一下，使得动画更自然
            }

            // 停止所有动画
            function stopAnim() {
                if (anim) {
                    anim.stop();
                    anim = undefined;
                }
            }
        }
    });
});/**
 * Switchable Autorender Plugin
 * @creator  玉伯<lifesinger@gmail.com>
 * @depends  ks-core, json
 */
KISSY.add('switchable-autorender', function(S) {

    /**
     * 自动渲染 container 元素内的所有 Switchable 组件
     */
    S.Switchable.autoRender = function(container, hookPrefix, dataAttrName) {
        hookPrefix = '.' + (hookPrefix || 'KS_');
        dataAttrName = dataAttrName || 'data-ks-switchable';

        S.each(['Switchable', 'Tabs', 'Slide', 'Carousel', 'Accordion'], function(name) {
            S.each(S.query(hookPrefix + name, container), function(elem) {
                try {
                    var config = elem.getAttribute(dataAttrName);
                    if(config) config = config.replace(/'/g, '"');
                    new S[name](elem, S.JSON.parse(config));
                } catch(ex) {
                    S.log('Switchable.autoRender: ' + ex, 'warn');
                }
            });
        });
    }
});
/**
 * Tabs Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('tabs', function(S) {

    /**
     * Tabs Class
     * @constructor
     */
    function Tabs(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Tabs)) {
            return new Tabs(container, config);
        }

        Tabs.superclass.constructor.call(self, container, config);
    }

    S.extend(Tabs, S.Switchable);
    S.Tabs = Tabs;
});
/**
 * Tabs Widget
 * @creator     玉伯<lifesinger@gmail.com>
 */
KISSY.add('slide', function(S) {

    /**
     * 默认配置，和 Switchable 相同的部分此处未列出
     */
    var defaultConfig = {
        autoplay: true,
        circular: true
    };

    /**
     * Slide Class
     * @constructor
     */
    function Slide(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Slide)) {
            return new Slide(container, config);
        }

        Slide.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Slide, S.Switchable);
    S.Slide = Slide;
});
/**
 * Carousel Widget
 * @creator  玉伯<lifesinger@gmail.com>
 */
KISSY.add('carousel', function(S, undefined) {

    var DOM = S.DOM, Event = S.Event,
        CLS_PREFIX = 'ks-switchable-', DOT = '.',
        PREV_BTN = 'prevBtn', NEXT_BTN = 'nextBtn',

        /**
         * 默认配置，和 Switchable 相同的部分此处未列出
         */
        defaultConfig = {
            circular: true,
            prevBtnCls: CLS_PREFIX + 'prev-btn',
            nextBtnCls: CLS_PREFIX + 'next-btn',
            disableBtnCls: CLS_PREFIX + 'disable-btn'
        };

    /**
     * Carousel Class
     * @constructor
     */
    function Carousel(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Carousel)) {
            return new Carousel(container, config);
        }

        // 插入 carousel 的初始化逻辑
        self.on('init', function() { init_carousel(self); });

        // call super
        Carousel.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Carousel, S.Switchable);
    S.Carousel = Carousel;

    /**
     * Carousel 的初始化逻辑
     * 增加了:
     *   self.prevBtn
     *   self.nextBtn
     */
    function init_carousel(self) {
        var cfg = self.config, disableCls = cfg.disableBtnCls;

        // 获取 prev/next 按钮，并添加事件
        S.each(['prev', 'next'], function(d) {
            var btn = self[d + 'Btn'] = S.get(DOT + cfg[d + 'BtnCls'], self.container);

            Event.on(btn, 'click', function(ev) {
                ev.preventDefault();
                if(!DOM.hasClass(btn, disableCls)) self[d]();
            });
        });

        // 注册 switch 事件，处理 prevBtn/nextBtn 的 disable 状态
        // circular = true 时，无需处理
        if (!cfg.circular) {
            self.on('switch', function(ev) {
                var i = ev.currentIndex,
                    disableBtn = (i === 0) ? self[PREV_BTN]
                        : (i === self.length - 1) ? self[NEXT_BTN]
                        : undefined;

                DOM.removeClass([self[PREV_BTN], self[NEXT_BTN]], disableCls);
                if (disableBtn) DOM.addClass(disableBtn, disableCls);
            });
        }

        // 触发 itemSelected 事件
        Event.on(self.panels, 'click focus', function() {
            self.fire('itemSelected', { item: this });
        });
    }
});


/**
 * NOTES:
 *
 * 2010.07
 *  - 添加对 prevBtn/nextBtn 的支持
 *  - 添加 itemSelected 事件
 *
 * TODO:
 *  - 对键盘事件的支持，比如 Up/Down 触发 prevItem/nextItem, PgDn/PgUp 触发 prev/next
 *  - itemSelected 时，自动居中的特性
 */
/**
 * Accordion Widget
 * @creator  沉鱼<fool2fish@gmail.com>
 */
KISSY.add('accordion', function(S) {

    var DOM = S.DOM,
        DISPLAY = 'display', BLOCK = 'block', NONE = 'none',

        defaultConfig = {
            markupType: 1,
            triggerType: 'click',
            multiple: false
        };

    /**
     * Accordion Class
     * @constructor
     */
    function Accordion(container, config) {
        var self = this;

        // factory or constructor
        if (!(self instanceof Accordion)) {
            return new Accordion(container, config);
        }

        Accordion.superclass.constructor.call(self, container, S.merge(defaultConfig, config));
    }

    S.extend(Accordion, S.Switchable);
    S.Accordion = Accordion;

    S.augment(Accordion, {

        /**
         * 重复触发时的有效判断
         */
        _triggerIsValid: function(index) {
            // multiple 模式下，再次触发意味着切换展开/收缩状态
            return this.activeIndex !== index || this.config.multiple;
        },

        /**
         * 切换视图
         */
        _switchView: function(fromPanels, toPanels, index) {
            var self = this, cfg = self.config,
                panel = toPanels[0];

            if (cfg.multiple) {
                DOM.toggleClass(self.triggers[index], cfg.activeTriggerCls);
                DOM.css(panel, DISPLAY, panel.style[DISPLAY] == NONE ? BLOCK : NONE);
                this._fireOnSwitch(index);
            }
            else {
                Accordion.superclass._switchView.call(self, fromPanels, toPanels, index);
            }
        }
    });
});

/**
 * TODO:
 *
 *  - 支持动画
 *
 */
