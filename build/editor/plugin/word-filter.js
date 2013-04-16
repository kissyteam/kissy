/*
Copyright 2013, KISSY UI Library v1.40dev
MIT Licensed
build time: Apr 17 00:21
*/
/**
 * clean html pasted from word. modified from ckeditor.
 * @author yiminghe@gmail.com
 */
KISSY.add("editor/plugin/word-filter", function (S, HTMLParser) {
    var $ = S.all,
        UA = S.UA,
        dtd = HTMLParser.DTD,
        wordFilter = new HTMLParser.Filter(),
        cssLengthRelativeUnit = /^([.\d]*)+(em|ex|px|gd|rem|vw|vh|vm|ch|mm|cm|in|pt|pc|deg|rad|ms|s|hz|khz){1}?/i,
    // e.g. 0px 0pt 0px
        emptyMarginRegex = /^(?:\b0[^\s]*\s*){1,4}$/,
        romanLiteralPattern = '^m{0,4}(cm|cd|d?c{0,3})(xc|xl|l?x{0,3})(ix|iv|v?i{0,3})$',
        lowerRomanLiteralRegex = new RegExp(romanLiteralPattern),
        upperRomanLiteralRegex = new RegExp(romanLiteralPattern.toUpperCase()),
        orderedPatterns = {
            'decimal': /\d+/,
            'lower-roman': lowerRomanLiteralRegex,
            'upper-roman': upperRomanLiteralRegex,
            'lower-alpha': /^[a-z]+$/,
            'upper-alpha': /^[A-Z]+$/
        },
        unorderedPatterns = {
            'disc': /[l\u00B7\u2002]/,
            'circle': /[\u006F\u00D8]/,
            'square': /[\u006E\u25C6]/
        },
        listMarkerPatterns = {
            'ol': orderedPatterns,
            'ul': unorderedPatterns
        },
        romans = [
            [1000, 'M'],
            [900, 'CM'],
            [500, 'D'],
            [400, 'CD'],
            [100, 'C'],
            [90, 'XC'],
            [50, 'L'],
            [40, 'XL'],
            [10, 'X'],
            [9, 'IX'],
            [5, 'V'],
            [4, 'IV'],
            [1, 'I']
        ],
        alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    // Convert roman numbering back to decimal.
    function fromRoman(str) {
        str = str.toUpperCase();
        var l = romans.length, retVal = 0;
        for (var i = 0; i < l; ++i) {
            for (var j = romans[i], k = j[1].length; str.substr(0, k) == j[1]; str = str.substr(k)) {
                retVal += j[ 0 ];
            }
        }
        return retVal;
    }

    // Convert alphabet numbering back to decimal.
    function fromAlphabet(str) {
        str = str.toUpperCase();
        var l = alphabets.length, retVal = 1;
        for (var x = 1; str.length > 0; x *= l) {
            retVal += alphabets.indexOf(str.charAt(str.length - 1)) * x;
            str = str.substr(0, str.length - 1);
        }
        return retVal;
    }

    function setStyle(element, str) {
        if (str) {
            element.setAttribute("style", str);
        } else {
            element.removeAttribute("style");
        }
    }

    /**
     * Convert the specified CSS length value to the calculated pixel length inside this page.
     * <strong>Note:</strong> Percentage based value is left intact.
     * @param {String} cssLength CSS length value.
     */
    var convertToPx = (function () {
        var calculator;

        return function (cssLength) {
            if (!calculator) {
                calculator = $(
                    '<div style="position:absolute;left:-9999px;' +
                        'top:-9999px;margin:0px;padding:0px;border:0px;"' +
                        '></div>')['prependTo']("body");

            }

            if (!(/%$/).test(cssLength)) {
                calculator.css('width', cssLength);
                return calculator[0].clientWidth;
            }

            return cssLength;
        };
    })();

    var listBaseIndent = 0,
        previousListItemMargin = null,
        previousListId;

    function onlyChild(elem) {
        var childNodes = elem.childNodes || [],
            count = childNodes.length,
            firstChild = (count == 1) && childNodes[0];
        return firstChild || null;
    }

    function removeAnyChildWithName(elem, tagName) {
        var children = elem.childNodes || [],
            ret = [],
            child;

        for (var i = 0; i < children.length; i++) {
            child = children[ i ];
            if (!child.nodeName) {
                continue;
            }
            if (child.nodeName == tagName) {
                ret.push(child);
                children.splice(i--, 1);
            }
            ret = ret.concat(removeAnyChildWithName(child, tagName));
        }
        return ret;
    }

    function getAncestor(elem, tagNameRegex) {
        var parent = elem.parentNode;
        while (parent && !( parent.nodeName && parent.nodeName.match(tagNameRegex) )) {
            parent = parent.parentNode;
        }
        return parent;
    }

    function firstChild(elem, evaluator) {
        var child,
            i,
            children = elem.childNodes || [];

        for (i = 0; i < children.length; i++) {
            child = children[ i ];
            if (evaluator(child)) {
                return child;
            } else if (child.nodeName) {
                child = firstChild(child, evaluator);
                if (child) {
                    return child;
                }
            }
        }

        return null;
    }


    function addStyle(elem, name, value, isPrepend) {
        var styleText, addingStyleText = '', style;
        // name/value pair.
        if (typeof value == 'string') {
            addingStyleText += name + ':' + value + ';';
        } else {
            // style literal.
            if (typeof name == 'object') {
                for (style in name) {

                    addingStyleText += style + ':' + name[ style ] + ';';

                }
            }
            // raw style text form.
            else {
                addingStyleText += name;
            }
            isPrepend = value;
        }


        styleText = elem.getAttribute("style");

        styleText = ( isPrepend ?
            [ addingStyleText, styleText ]
            : [ styleText, addingStyleText ] ).join(';');

        setStyle(elem, styleText.replace(/^;|;(?=;)/, ''));
    }


    function parentOf(tagName) {
        var result = {},
            tag;
        for (tag in dtd) {

            if (tag.indexOf('$') == -1 && dtd[ tag ][ tagName ]) {
                result[ tag ] = 1;
            }

        }
        return result;
    }

    var filters = {
        // Transform a normal list into flat list items only presentation.
        // E.g. <ul><li>level1<ol><li>level2</li></ol></li> =>
        // <ke:li ke:listtype="ul" ke:indent="1">level1</ke:li>
        // <ke:li ke:listtype="ol" ke:indent="2">level2</ke:li>
        flattenList: function (element, level) {
            level = typeof level == 'number' ? level : 1;

            var listStyleType;

            // All list items are of the same type.
            switch (element.getAttribute("type")) {
                case 'a' :
                    listStyleType = 'lower-alpha';
                    break;
                case '1' :
                    listStyleType = 'decimal';
                    break;
                // TODO: Support more list style type from MS-Word.
            }

            var children = element.childNodes || [],
                child;

            for (var i = 0; i < children.length; i++) {
                child = children[ i ];

                if (child.nodeName in dtd.$listItem) {
                    var listItemChildren = child.childNodes || [],
                        count = listItemChildren.length,
                        last = listItemChildren[ count - 1 ];

                    // Move out nested list.
                    if (last.nodeName in dtd.$list) {
                        element.insertAfter(child);
                        // Remove the parent list item if it's just a holder.
                        if (!--listItemChildren.length) {
                            element.removeChild(children[i--]);
                        }
                    }

                    child.setTagName('ke:li');

                    // Inherit numbering from list root on the first list item.
                    element.getAttribute("start") &&
                        !i &&
                    ( element.setAttribute("value", element.getAttribute("start")));

                    filters.stylesFilter(
                        [
                            [
                                'tab-stops', null, function (val) {
                                var margin = val.split(' ')[ 1 ].match(cssLengthRelativeUnit);
                                margin && ( previousListItemMargin = convertToPx(margin[ 0 ]) );
                            }
                            ],
                            ( level == 1 ? [ 'mso-list', null, function (val) {
                                val = val.split(' ');
                                var listId = Number(val[ 0 ].match(/\d+/));
                                if (listId !== previousListId) {
                                    child.setAttribute('ke:reset', 1)
                                }
                                previousListId = listId;
                            } ] : null )
                        ])(child.getAttribute("style"));

                    child.setAttribute('ke:indent', level);
                    child.setAttribute('ke:listtype', element.nodeName);
                    child.setAttribute('ke:list-style-type', listStyleType);
                }
                // Flatten sub list.
                else if (child.nodeName in dtd.$list) {
                    // Absorb sub list children.
                    arguments.callee.apply(this, [ child, level + 1 ]);
                    children = children.slice(0, i).concat(child.childNodes).concat(children.slice(i + 1));
                    element.empty();
                    for (var j = 0, num = children.length; j < num; j++) {
                        element.appendChild(children[j]);
                    }
                }
            }

            element.nodeName = element.tagName = null;

            // We're loosing tag name here, signalize this element as a list.
            element.setAttribute('ke:list', 1);
        },

        /**
         *  Try to collect all list items among the children and establish one
         *  or more HTML list structures for them.
         * @param element
         */
        assembleList: function (element) {
            var children = element.childNodes || [],
                child,
                listItem, // The current processing ke:li element.
                listItemIndent, // Indent level of current list item.
                lastIndent,
                lastListItem, // The previous one just been added to the list.
                list, // Current staging list and it's parent list if any.
                openedLists = [],
                previousListStyleType,
                previousListType;

            // Properties of the list item are to be resolved from the list bullet.
            var bullet,
                listType,
                listStyleType,
                itemNumeric;

            for (var i = 0; i < children.length; i++) {
                child = children[ i ];

                if ('ke:li' == child.nodeName) {
                    child.setTagName('li');
                    listItem = child;

                    bullet = listItem.getAttribute('ke:listsymbol');
                    bullet = bullet && bullet.match(/^(?:[(]?)([^\s]+?)([.)]?)$/);
                    listType = listStyleType = itemNumeric = null;

                    if (listItem.getAttribute('ke:ignored')) {
                        children.splice(i--, 1);
                        continue;
                    }


                    // This's from a new list root.
                    listItem.getAttribute('ke:reset') && ( list = lastIndent = lastListItem = null );

                    // List item indent level might come from a real list indentation or
                    // been resolved from a pseudo list item's margin value, even get
                    // no indentation at all.
                    listItemIndent = Number(listItem.getAttribute('ke:indent'));

                    // We're moving out of the current list, cleaning up.
                    if (listItemIndent != lastIndent)
                        previousListType = previousListStyleType = null;

                    // List type and item style are already resolved.
                    if (!bullet) {
                        listType = listItem.getAttribute('ke:listtype') || 'ol';
                        listStyleType = listItem.getAttribute('ke:list-style-type');
                    }
                    else {
                        // Probably share the same list style type with previous list item,
                        // give it priority to avoid ambiguous between C(Alpha) and C.(Roman).
                        if (previousListType &&
                            listMarkerPatterns[ previousListType ] [ previousListStyleType ].test(bullet[ 1 ])) {
                            listType = previousListType;
                            listStyleType = previousListStyleType;
                        }
                        else {
                            for (var type in listMarkerPatterns) {

                                for (var style in listMarkerPatterns[ type ]) {

                                    if (listMarkerPatterns[ type ][ style ].test(bullet[ 1 ])) {
                                        // Small numbering has higher priority, when dealing with ambiguous
                                        // between C(Alpha) and C.(Roman).
                                        if (type == 'ol' && ( /alpha|roman/ ).test(style)) {
                                            var num = /roman/.test(style) ? fromRoman(bullet[ 1 ]) : fromAlphabet(bullet[ 1 ]);
                                            if (!itemNumeric || num < itemNumeric) {
                                                itemNumeric = num;
                                                listType = type;
                                                listStyleType = style;
                                            }
                                        }
                                        else {
                                            listType = type;
                                            listStyleType = style;
                                            break;
                                        }
                                    }
                                }
                            }
                        }

                        // Simply use decimal/disc for the rest forms of unrepresentable
                        // numerals, e.g. Chinese..., but as long as there a second part
                        // included, it has a bigger chance of being a order list ;)
                        !listType && ( listType = bullet[ 2 ] ? 'ol' : 'ul' );
                    }

                    previousListType = listType;
                    previousListStyleType = listStyleType || ( listType == 'ol' ? 'decimal' : 'disc' );
                    if (listStyleType && listStyleType != ( listType == 'ol' ? 'decimal' : 'disc' ))
                        addStyle(listItem, 'list-style-type', listStyleType);

                    // Figure out start numbering.
                    if (listType == 'ol' && bullet) {
                        switch (listStyleType) {
                            case 'decimal' :
                                itemNumeric = Number(bullet[ 1 ]);
                                break;
                            case 'lower-roman':
                            case 'upper-roman':
                                itemNumeric = fromRoman(bullet[ 1 ]);
                                break;
                            case 'lower-alpha':
                            case 'upper-alpha':
                                itemNumeric = fromAlphabet(bullet[ 1 ]);
                                break;
                        }

                        // Always create the numbering, swipe out unnecessary ones later.
                        listItem.setAttribute("value", itemNumeric);
                    }

                    // Start the list construction.
                    if (!list) {
                        openedLists.push(list = new HTMLParser.Tag(listType));
                        list.appendChild(listItem);
                        element.replaceChild(list, children[i]);
                    } else {
                        if (listItemIndent > lastIndent) {
                            openedLists.push(list = new HTMLParser.Tag(listType));
                            list.appendChild(listItem);
                            lastListItem.appendChild(list);
                        }
                        else if (listItemIndent < lastIndent) {
                            // There might be a negative gap between two list levels. (#4944)
                            var diff = lastIndent - listItemIndent,
                                parent;
                            while (diff-- && ( parent = list.parentNode )) {
                                list = parent.parentNode;
                            }
                            list.appendChild(listItem);
                        }
                        else {
                            list.appendChild(listItem);
                        }
                        children.splice(i--, 1);
                    }

                    lastListItem = listItem;
                    lastIndent = listItemIndent;
                }
                else if (child.nodeType == 3 && !S.trim(child.nodeValue)) {
                    //  li 间的空文字节点忽略
                } else if (list) {
                    list = lastIndent = lastListItem = null;
                }
            }

            for (i = 0; i < openedLists.length; i++) {
                postProcessList(openedLists[ i ]);
            }
        },

        /**
         * A simple filter which always rejecting.
         */
        falsyFilter: function () {
            return false;
        },

        /**
         * A filter dedicated on the 'style' attribute filtering, e.g. dropping/replacing style properties.
         * @param styles {Array} in form of [ styleNameRegexp, styleValueRegexp,
         *  newStyleValue/newStyleGenerator, newStyleName ] where only the first
         *  parameter is mandatory.
         * @param [whitelist] {Boolean} Whether the {@param styles} will be considered as a white-list.
         */
        stylesFilter: function (styles, whitelist) {
            return function (styleText, element) {
                var rules = [];
                // html-encoded quote might be introduced by 'font-family'
                // from MS-Word which confused the following regexp. e.g.
                //'font-family: &quot;Lucida, Console&quot;'
                ( styleText || '' )
                    .replace(/&quot;/g, '"')
                    .replace(/\s*([^ :;]+)\s*:\s*([^;]+)\s*(?=;|$)/g,
                    function (match, name, value) {
                        name = name.toLowerCase();
                        name == 'font-family' && ( value = value.replace(/["']/g, '') );

                        var namePattern,
                            valuePattern,
                            newValue,
                            newName;
                        for (var i = 0; i < styles.length; i++) {
                            if (styles[ i ]) {
                                namePattern = styles[ i ][ 0 ];
                                valuePattern = styles[ i ][ 1 ];
                                newValue = styles[ i ][ 2 ];
                                newName = styles[ i ][ 3 ];

                                if (name.match(namePattern)
                                    && ( !valuePattern || value.match(valuePattern) )) {
                                    name = newName || name;
                                    whitelist && ( newValue = newValue || value );

                                    if (typeof newValue == 'function') {
                                        newValue = newValue(value, element, name);
                                    }

                                    // Return an couple indicate both name and value
                                    // changed.
                                    if (newValue && newValue.push) {
                                        name = newValue[ 0 ];
                                        newValue = newValue[ 1 ];
                                    }

                                    if (typeof newValue == 'string') {
                                        rules.push([ name, newValue ]);
                                    }

                                    return;
                                }
                            }
                        }

                        !whitelist && rules.push([ name, value ]);

                    });

                for (var i = 0; i < rules.length; i++) {
                    rules[ i ] = rules[ i ].join(':');
                }

                return rules.length ? ( rules.join(';') + ';' ) : false;
            };
        },

        /**
         * A filter which will be used to apply inline css style according the stylesheet
         * definition rules, is generated lazily when filtering.
         */
        applyStyleFilter: null

    };


    // 1. move consistent list item styles up to list root.
    // 2. clear out unnecessary list item numbering.
    function postProcessList(list) {
        var children = list.childNodes || [],
            child,
            count = children.length,
            match,
            mergeStyle,
            styleTypeRegexp = /list-style-type:(.*?)(?:;|$)/,
            stylesFilter = filters.stylesFilter;


        if (styleTypeRegexp.exec(list.getAttribute("style")))
            return;

        for (var i = 0; i < count; i++) {
            child = children[ i ];

            if (child.getAttribute("value") && Number(child.getAttribute("value")) == i + 1) {
                child.removeAttribute("value");
            }

            match = styleTypeRegexp.exec(child.getAttribute("style"));

            if (match) {
                if (match[ 1 ] == mergeStyle || !mergeStyle)
                    mergeStyle = match[ 1 ];
                else {
                    mergeStyle = null;
                    break;
                }
            }
        }

        if (mergeStyle) {
            for (i = 0; i < count; i++) {
                var style = children[ i ].getAttribute("style");

                if (style) {
                    style = stylesFilter([
                        [ 'list-style-type']
                    ])(style);
                    setStyle(children[ i ], style);
                }
            }
            addStyle(list, 'list-style-type', mergeStyle);
        }
    }

    var utils = {
        // Create a <ke:listbullet> which indicate an list item type.
        createListBulletMarker: function (bullet, bulletText) {
            var marker = new HTMLParser.Tag('ke:listbullet');
            marker.setAttribute("ke:listsymbol", bullet[ 0 ]);
            marker.appendChild(new HTMLParser.Text(bulletText));
            return marker;
        },

        isListBulletIndicator: function (element) {
            var styleText = element.getAttribute("style");
            if (/mso-list\s*:\s*Ignore/i.test(styleText)) {
                return true;
            }
        },

        isContainingOnlySpaces: function (element) {
            var text;
            return ( ( text = onlyChild(element) )
                && ( /^(:?\s|&nbsp;)+$/ ).test(text.nodeValue) );
        },

        resolveList: function (element) {
            // <ke:listbullet> indicate a list item.
            var listMarker;

            if (( listMarker = removeAnyChildWithName(element, 'ke:listbullet') )
                && listMarker.length
                && ( listMarker = listMarker[ 0 ] )) {
                element.setTagName('ke:li');

                if (element.getAttribute("style")) {
                    var styleStr = filters.stylesFilter(
                        [
                            // Text-indent is not representing list item level any more.
                            [ 'text-indent' ],
                            [ 'line-height' ],
                            // First attempt is to resolve indent level from on a constant margin increment.
                            [ ( /^margin(:?-left)?$/ ), null, function (margin) {
                                // Deal with component/short-hand form.
                                var values = margin.split(' ');
                                margin = convertToPx(values[ 3 ] || values[ 1 ] || values [ 0 ]);

                                // Figure out the indent unit by checking the first time of incrementation.
                                if (!listBaseIndent && previousListItemMargin !== null &&
                                    margin > previousListItemMargin) {
                                    listBaseIndent = margin - previousListItemMargin;
                                }

                                previousListItemMargin = margin;
                                if (listBaseIndent) {
                                    element.setAttribute('ke:indent', listBaseIndent &&
                                        ( Math.ceil(margin / listBaseIndent) + 1 ) || 1);
                                }
                            } ],
                            // The best situation: "mso-list:l0 level1 lfo2" tells the belonged list root, list item indentation, etc.
                            [ ( /^mso-list$/ ), null, function (val) {
                                val = val.split(' ');
                                var listId = Number(val[ 0 ].match(/\d+/)),
                                    indent = Number(val[ 1 ].match(/\d+/));

                                if (indent == 1) {
                                    listId !== previousListId && ( element.setAttribute('ke:reset', 1) );

                                    previousListId = listId;
                                }
                                element.setAttribute('ke:indent', indent);
                            } ]
                        ])(element.getAttribute("style"), element);

                    setStyle(element, styleStr);
                }

                // First level list item might be presented without a margin.
                // In case all above doesn't apply.
                if (!element.getAttribute("ke:indent")) {
                    previousListItemMargin = 0;
                    element.setAttribute('ke:indent', 1);
                }

                S.each(listMarker.attributes, function (a) {
                    element.setAttribute(a.name, a.value);
                });

                return true;
            }
            // Current list disconnected.
            else {
                previousListId = previousListItemMargin = listBaseIndent = null;
            }
            return false;
        },

        // Providing a shorthand style then retrieve one or more style component values.
        getStyleComponents: (function () {
            var calculator = $(
                '<div style="position:absolute;left:-9999px;top:-9999px;"></div>').prependTo("body");

            return function (name, styleValue, fetchList) {
                calculator.css(name, styleValue);
                var styles = {},
                    count = fetchList.length;
                for (var i = 0; i < count; i++) {
                    styles[ fetchList[ i ] ] = calculator.css(fetchList[ i ]);
                }

                return styles;
            };
        })(),

        listDtdParents: parentOf('ol')
    };

    (function () {
        var blockLike = S.merge(dtd.$block, dtd.$listItem, dtd.$tableContent),
            falsyFilter = filters.falsyFilter,
            stylesFilter = filters.stylesFilter,
            createListBulletMarker = utils.createListBulletMarker,
            flattenList = filters.flattenList,
            assembleList = filters.assembleList,
            isListBulletIndicator = utils.isListBulletIndicator,
            containsNothingButSpaces = utils.isContainingOnlySpaces,
            resolveListItem = utils.resolveList,
            convertToPxStr = function (value) {
                value = convertToPx(value);
                return isNaN(value) ? value : value + 'px';
            },
            getStyleComponents = utils.getStyleComponents,
            listDtdParents = utils.listDtdParents;

        wordFilter.addRules({

            tagNames: [
                // Remove script, meta and link elements.
                [ ( /meta|link|script/ ), '' ]
            ],

            root: function (element) {
                element.filterChildren();
                assembleList(element);
            },

            tags: {
                '^': function (element) {
                    // Transform CSS style declaration to inline style.
                    var applyStyleFilter;
                    if (UA.gecko && ( applyStyleFilter = filters.applyStyleFilter ))
                        applyStyleFilter(element);
                },

                $: function (element) {
                    var tagName = element.nodeName || '';

                    // Convert length unit of width/height on blocks to
                    // a more editor-friendly way (px).
                    if (tagName in blockLike && element.getAttribute("style")) {
                        setStyle(element, stylesFilter(
                            [
                                [ ( /^(:?width|height)$/ ), null, convertToPxStr ]
                            ])(element.getAttribute("style")));
                    }

                    // Processing headings.
                    if (tagName.match(/h\d/)) {
                        element.filterChildren();
                        // Is the heading actually a list item?
                        if (resolveListItem(element)) {
                            return;
                        }
                    }
                    // Remove inline elements which contain only empty spaces.
                    else if (tagName in dtd.$inline) {
                        element.filterChildren();
                        if (containsNothingButSpaces(element)) {
                            element.setTagName(null);
                        }
                    }
                    // Remove element with ms-office namespace,
                    // with it's content preserved, e.g. 'o:p'.
                    else if (tagName.indexOf(':') != -1
                        && tagName.indexOf('ke') == -1) {
                        element.filterChildren();

                        // Restore image real link from vml.
                        if (tagName == 'v:imagedata') {
                            var href = element.getAttribute('o:href');
                            if (href) {
                                element.setAttribute("src", href);
                            }
                            element.setTagName('img');
                            return;
                        }
                        element.setTagName(null);
                    }

                    // Assembling list items into a whole list.
                    if (tagName in listDtdParents) {
                        element.filterChildren();
                        assembleList(element);
                    }
                },

                // We'll drop any style sheet, but Firefox conclude
                // certain styles in a single style element, which are
                // required to be changed into inline ones.
                'style': function (element) {
                    if (UA.gecko) {
                        // Grab only the style definition section.
                        var styleDefSection = onlyChild(element).nodeValue
                                .match(/\/\* Style Definitions \*\/([\s\S]*?)\/\*/),
                            styleDefText = styleDefSection && styleDefSection[ 1 ],
                            rules = {}; // Storing the parsed result.

                        if (styleDefText) {
                            styleDefText
                                // Remove line-breaks.
                                .replace(/[\n\r]/g, '')
                                // Extract selectors and style properties.
                                .replace(/(.+?)\{(.+?)\}/g,
                                function (rule, selectors, styleBlock) {
                                    selectors = selectors.split(',');
                                    var length = selectors.length;
                                    for (var i = 0; i < length; i++) {
                                        // Assume MS-Word mostly generate only simple
                                        // selector( [Type selector][Class selector]).
                                        S.trim(selectors[ i ])
                                            .replace(/^(\w+)(\.[\w-]+)?$/g,
                                            function (match, tagName, className) {
                                                tagName = tagName || '*';
                                                className = className.substring(1, className.length);

                                                // Reject MS-Word Normal styles.
                                                if (className.match(/MsoNormal/))
                                                    return;

                                                if (!rules[ tagName ]) {
                                                    rules[ tagName ] = {};
                                                }
                                                if (className) {
                                                    rules[ tagName ][ className ] = styleBlock;
                                                } else {
                                                    rules[ tagName ] = styleBlock;
                                                }
                                            });
                                    }
                                });

                            filters.applyStyleFilter = function (element) {
                                var name = rules[ '*' ] ? '*' : element.nodeName,
                                    className = element.getAttribute('class'),
                                    style;
                                if (name in rules) {
                                    style = rules[ name ];
                                    if (typeof style == 'object')
                                        style = style[ className ];
                                    // Maintain style rules priorities.
                                    style && addStyle(element, style, true);
                                }
                            };
                        }
                    }
                    return false;
                },

                'p': function (element) {
                    // This's a fall-back approach to recognize list item in FF3.6,
                    // as it's not perfect as not all list style (e.g. "heading list") is shipped
                    // with this pattern. (#6662)
                    if (/MsoListParagraph/.exec(element.getAttribute('class'))) {
                        var bulletText = firstChild(element, function (node) {
                            return node.nodeType == 3 && !containsNothingButSpaces(node.parentNode);
                        });
                        var bullet = bulletText && bulletText.parentNode;
                        !bullet.getAttribute("style") && ( bullet.setAttribute("style", 'mso-list: Ignore;'));
                    }

                    element.filterChildren();
                    // Is the paragraph actually a list item?
                    resolveListItem(element)
                },

                'div': function (element) {
                    // Aligned table with no text surrounded is represented by a wrapper div, from which
                    // table cells inherit as text-align styles, which is wrong.
                    // Instead we use a clear-float div after the table to properly achieve the same layout.
                    var singleChild = onlyChild(element);
                    if (singleChild && singleChild.nodeName == 'table') {
                        var attrs = element.attributes;

                        S.each(attrs, function (attr) {
                            singleChild.setAttribute(attr.name, attr.value);
                        });

                        if (element.getAttribute("style")) {
                            addStyle(singleChild, element.getAttribute("style"));
                        }

                        var clearFloatDiv = new HTMLParser.Tag('div');
                        addStyle(clearFloatDiv, 'clear', 'both');
                        element.appendChild(clearFloatDiv);
                        element.setTagName(null);
                    }
                },

                'td': function (element) {
                    // 'td' in 'thead' is actually <th>.
                    if (getAncestor(element, 'thead'))
                        element.setTagName('th');
                },

                // MS-Word sometimes present list as a mixing of normal list
                // and pseudo-list, normalize the previous ones into pseudo form.
                'ol': flattenList,
                'ul': flattenList,
                'dl': flattenList,

                'font': function (element) {
                    // Drop the font tag if it comes from list bullet text.
                    if (isListBulletIndicator(element.parentNode)) {
                        element.setTagName(null);
                        return;
                    }

                    element.filterChildren();

                    var styleText = element.getAttribute("style"),
                        parent = element.parentNode;

                    if ('font' == parent.name)     // Merge nested <font> tags.
                    {
                        S.each(element.attributes, function (attr) {
                            parent.setAttribute(attr.name, attr.value);
                        });
                        styleText && addStyle(parent, styleText);
                        element.setTagName(null);
                    }
                    // Convert the merged into a span with all attributes preserved.
                    else {
                        styleText = styleText || '';
                        // IE's having those deprecated attributes, normalize them.
                        if (element.getAttribute("color")) {
                            element.getAttribute("color") != '#000000' && ( styleText += 'color:' + element.getAttribute("color") + ';' );
                            element.removeAttribute("color");
                        }
                        if (element.getAttribute("face")) {
                            styleText += 'font-family:' + element.getAttribute("face") + ';';
                            element.removeAttribute("face");
                        }
                        var size = element.getAttribute("size");
                        // TODO: Mapping size in ranges of xx-small,
                        // x-small, small, medium, large, x-large, xx-large.
                        if (size) {
                            styleText += 'font-size:' +
                                (size > 3 ? 'large'
                                    : ( size < 3 ? 'small' : 'medium' ) ) + ';';
                            element.removeAttribute("size");
                        }
                        element.setTagName("span");
                        addStyle(element, styleText);
                    }
                },

                'span': function (element) {
                    // Remove the span if it comes from list bullet text.
                    if (isListBulletIndicator(element.parentNode)) {
                        return false;
                    }
                    element.filterChildren();
                    if (containsNothingButSpaces(element)) {
                        element.setTagName(null);
                        return null;
                    }

                    // List item bullet type is supposed to be indicated by
                    // the text of a span with style 'mso-list : Ignore' or an image.
                    if (isListBulletIndicator(element)) {
                        var listSymbolNode = firstChild(element, function (node) {
                            return node.nodeValue || node.nodeName == 'img';
                        });

                        var listSymbol = listSymbolNode && ( listSymbolNode.nodeValue || 'l.' ),
                            listType = listSymbol && listSymbol.match(/^(?:[(]?)([^\s]+?)([.)]?)$/);

                        if (listType) {
                            var marker = createListBulletMarker(listType, listSymbol);
                            // Some non-existed list items might be carried by an inconsequential list,
                            // indicate by "mso-hide:all/display:none",
                            // those are to be removed later, now mark it with "ke:ignored".
                            var ancestor = getAncestor(element, 'span');
                            if (ancestor && (/ mso-hide:\s*all|display:\s*none /).
                                test(ancestor.getAttribute("style"))) {
                                marker.setAttribute('ke:ignored', 1);
                            }
                            return marker;
                        }
                    }

                    // Update the src attribute of image element with href.
                    var styleText = element.getAttribute("style");

                    // Assume MS-Word mostly carry font related styles on <span>,
                    // adapting them to editor's convention.
                    if (styleText) {

                        setStyle(element, stylesFilter(
                            [
                                // Drop 'inline-height' style which make lines overlapping.
                                [ /^line-height$/ ],
                                [  /^font-family$/  ] ,
                                [  /^font-size$/  ] ,
                                [  /^color$/  ] ,
                                [  /^background-color$/  ]
                            ]
                        )(styleText, element));
                    }
                },
                // Editor doesn't support anchor with content currently (#3582),
                // drop such anchors with content preserved.
                'a': function (element) {
                    var href;
                    if (!(href = element.getAttribute("href")) && element.getAttribute("name")) {
                        element.setTagName(null);
                    } else if (UA.webkit && href && href.match(/file:\/\/\/[\S]+#/i)) {
                        element.setAttribute("href", href.replace(/file:\/\/\/[^#]+/i, ''));
                    }
                },
                'ke:listbullet': function (element) {
                    if (getAncestor(element, /h\d/)) {
                        element.setTagName(null);
                    }
                }
            },

            attributeNames: [
                // Remove onmouseover and onmouseout events (from MS Word comments effect)
                [ ( /^onmouse(:?out|over)/ ), '' ],
                // Onload on image element.
                [ ( /^onload$/ ), '' ],
                // Remove office and vml attribute from elements.
                [ ( /(?:v|o):\w+/ ), '' ],
                // Remove lang/language attributes.
                [ ( /^lang/ ), '' ]
            ],

            attributes: {
                'style': stylesFilter(
                    // Provide a white-list of styles that we preserve, those should
                    // be the ones that could later be altered with editor tools.
                    [
                        // Leave list-style-type
                        [ ( /^list-style-type$/ ) ],

                        // Preserve margin-left/right which used as default indent style in the editor.
                        [ ( /^margin$|^margin-(?!bottom|top)/ ), null, function (value, element, name) {
                            if (element.nodeName in { p: 1, div: 1 }) {
                                var indentStyleName = 'margin-left';

                                // Extract component value from 'margin' shorthand.
                                if (name == 'margin') {
                                    value = getStyleComponents(name, value,
                                        [ indentStyleName ])[ indentStyleName ];
                                } else if (name != indentStyleName) {
                                    return null;
                                }

                                if (value && !emptyMarginRegex.test(value)) {
                                    return [ indentStyleName, value ];
                                }
                            }

                            return null;
                        } ],

                        // Preserve clear float style.
                        [ ( /^clear$/ ) ],

                        [ ( /^border.*|margin.*|vertical-align|float$/ ), null,
                            function (value, element) {
                                if (element.nodeName == 'img')
                                    return value;
                            } ],

                        [ (/^width|height$/ ), null,
                            function (value, element) {
                                if (element.nodeName in { table: 1, td: 1, th: 1, img: 1 })
                                    return value;
                            } ]
                    ], 1),

                // Prefer width styles over 'width' attributes.
                'width': function (value, element) {
                    if (element.nodeName in dtd.$tableContent)
                        return false;
                },
                // Prefer border styles over table 'border' attributes.
                'border': function (value, element) {
                    if (element.nodeName in dtd.$tableContent)
                        return false;
                },

                // Only Firefox carry style sheet from MS-Word, which
                // will be applied by us manually. For other browsers
                // the css className is useless.
                'class': falsyFilter,

                // MS-Word always generate 'background-color' along with 'bgcolor',
                // simply drop the deprecated attributes.
                'bgcolor': falsyFilter,

                // Deprecate 'valign' attribute in favor of 'vertical-align'.
                'valign': function (value, element) {
                    addStyle(element, 'vertical-align', value);
                    return false;
                }
            },


            // Fore none-IE, some useful data might be buried under these IE-conditional
            // comments where RegExp were the right approach to dig them out where usual approach
            // is transform it into a fake element node which hold the desired data.
            comment: UA.ie ?
                function (value, node) {
                    var imageInfo = value.match(/<img.*?>/),
                        listInfo = value.match(/^\[if !supportLists\]([\s\S]*?)\[endif\]$/);

                    // Seek for list bullet indicator.
                    if (listInfo) {
                        // Bullet symbol could be either text or an image.
                        var listSymbol = listInfo[ 1 ] || ( imageInfo && 'l.' ),
                            listType = listSymbol && listSymbol.match(/>(?:[(]?)([^\s]+?)([.)]?)</);
                        return createListBulletMarker(listType, listSymbol);
                    }

                    // Reveal the <img> element in conditional comments for Firefox.
                    if (UA.gecko && imageInfo) {
                        var img = new HTMLParser.Parser(imageInfo[0]).parse().childNodes[ 0 ],
                            previousComment = node.previousSibling,
                        // Try to dig the real image link from vml markup from previous comment text.
                            imgSrcInfo = previousComment && previousComment.toHTML().match(/<v:imagedata[^>]*o:href=['"](.*?)['"]/),
                            imgSrc = imgSrcInfo && imgSrcInfo[ 1 ];

                        // Is there a real 'src' url to be used?
                        imgSrc && ( img.setAttribute("src", imgSrc) );
                        return img;
                    }

                    return false;
                }
                : falsyFilter
        });
    })();

    return {

        toDataFormat: function (html, editor) {
            // Firefox will be confused by those downlevel-revealed IE conditional
            // comments, fixing them first( convert it to upperlevel-revealed one ).
            // e.g. <![if !vml]>...<![endif]>
            //<!--[if !supportLists]-->
            // <span style=\"font-family: Wingdings;\" lang=\"EN-US\">
            // <span style=\"\">l<span style=\"font: 7pt &quot;Times New Roman&quot;;\">&nbsp;
            // </span></span></span>
            // <!--[endif]-->

            //变成：

            //<!--[if !supportLists]
            // <span style=\"font-family: Wingdings;\" lang=\"EN-US\">
            // <span style=\"\">l<span style=\"font: 7pt &quot;Times New Roman&quot;;\">&nbsp;
            // </span></span></span>
            // [endif]-->
            if (UA.gecko) {
                html = html.replace(/(<!--\[if[^<]*?\])-->([\S\s]*?)<!--(\[endif\]-->)/gi,
                    '$1$2$3');
            }

            // 针对 word 一次
            html = editor['htmlDataProcessor'].toDataFormat(html, wordFilter);

            return html;
        }

    };


}, {
    requires: ['htmlparser']
});
