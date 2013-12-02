function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ',"src":' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/html-parser/dtd.js']) {
  _$jscoverage['/html-parser/dtd.js'] = {};
  _$jscoverage['/html-parser/dtd.js'].lineData = [];
  _$jscoverage['/html-parser/dtd.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[160] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[208] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[808] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[809] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[815] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[816] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[817] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[818] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[819] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[825] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[826] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[829] = 0;
  _$jscoverage['/html-parser/dtd.js'].lineData[832] = 0;
}
if (! _$jscoverage['/html-parser/dtd.js'].functionData) {
  _$jscoverage['/html-parser/dtd.js'].functionData = [];
  _$jscoverage['/html-parser/dtd.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/dtd.js'].functionData[1] = 0;
}
if (! _$jscoverage['/html-parser/dtd.js'].branchData) {
  _$jscoverage['/html-parser/dtd.js'].branchData = {};
  _$jscoverage['/html-parser/dtd.js'].branchData['817'] = [];
  _$jscoverage['/html-parser/dtd.js'].branchData['817'][1] = new BranchData();
  _$jscoverage['/html-parser/dtd.js'].branchData['818'] = [];
  _$jscoverage['/html-parser/dtd.js'].branchData['818'][1] = new BranchData();
  _$jscoverage['/html-parser/dtd.js'].branchData['825'] = [];
  _$jscoverage['/html-parser/dtd.js'].branchData['825'][1] = new BranchData();
}
_$jscoverage['/html-parser/dtd.js'].branchData['825'][1].init(454, 20, 'i < html5Tags.length');
function visit3_825_1(result) {
  _$jscoverage['/html-parser/dtd.js'].branchData['825'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/dtd.js'].branchData['818'][1].init(33, 20, 'i < html5Tags.length');
function visit2_818_1(result) {
  _$jscoverage['/html-parser/dtd.js'].branchData['818'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/dtd.js'].branchData['817'][1].init(21, 12, 'p2 === \'div\'');
function visit1_817_1(result) {
  _$jscoverage['/html-parser/dtd.js'].branchData['817'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/dtd.js'].lineData[10]++;
KISSY.add(function(S) {
  _$jscoverage['/html-parser/dtd.js'].functionData[0]++;
  _$jscoverage['/html-parser/dtd.js'].lineData[11]++;
  var merge = S.merge, A = {
  'isindex': 1, 
  'fieldset': 1}, B = {
  'input': 1, 
  'button': 1, 
  'select': 1, 
  'textarea': 1, 
  'label': 1}, C = merge({
  'a': 1}, B), D = merge({
  'iframe': 1}, C), E = {
  'hr': 1, 
  'ul': 1, 
  'menu': 1, 
  'div': 1, 
  'blockquote': 1, 
  'noscript': 1, 
  'table': 1, 
  'center': 1, 
  'address': 1, 
  'dir': 1, 
  'pre': 1, 
  'h5': 1, 
  'dl': 1, 
  'h4': 1, 
  'noframes': 1, 
  'h6': 1, 
  'ol': 1, 
  'h1': 1, 
  'h3': 1, 
  'h2': 1}, F = {
  'ins': 1, 
  'del': 1, 
  'script': 1, 
  'style': 1}, G = merge({
  'b': 1, 
  'acronym': 1, 
  'bdo': 1, 
  'var': 1, 
  '#text': 1, 
  'abbr': 1, 
  'code': 1, 
  'br': 1, 
  'i': 1, 
  'cite': 1, 
  'kbd': 1, 
  'u': 1, 
  'strike': 1, 
  's': 1, 
  'tt': 1, 
  'strong': 1, 
  'q': 1, 
  'samp': 1, 
  'em': 1, 
  'dfn': 1, 
  'span': 1}, F), H = merge({
  'sub': 1, 
  'img': 1, 
  'object': 1, 
  'sup': 1, 
  'basefont': 1, 
  'map': 1, 
  'applet': 1, 
  'font': 1, 
  'big': 1, 
  'small': 1}, G), I = merge({
  'p': 1}, H), J = merge({
  'iframe': 1}, H, B), K = {
  'img': 1, 
  'noscript': 1, 
  'br': 1, 
  'kbd': 1, 
  'center': 1, 
  'button': 1, 
  'basefont': 1, 
  'h5': 1, 
  'h4': 1, 
  'samp': 1, 
  'h6': 1, 
  'ol': 1, 
  'h1': 1, 
  'h3': 1, 
  'h2': 1, 
  'form': 1, 
  'font': 1, 
  '#text': 1, 
  'select': 1, 
  'menu': 1, 
  'ins': 1, 
  'abbr': 1, 
  'label': 1, 
  'code': 1, 
  'table': 1, 
  'script': 1, 
  'cite': 1, 
  'input': 1, 
  'iframe': 1, 
  'strong': 1, 
  'textarea': 1, 
  'noframes': 1, 
  'big': 1, 
  'small': 1, 
  'span': 1, 
  'hr': 1, 
  'sub': 1, 
  'bdo': 1, 
  'var': 1, 
  'div': 1, 
  'object': 1, 
  'sup': 1, 
  'strike': 1, 
  'dir': 1, 
  'map': 1, 
  'dl': 1, 
  'applet': 1, 
  'del': 1, 
  'isindex': 1, 
  'fieldset': 1, 
  'ul': 1, 
  'b': 1, 
  'acronym': 1, 
  'a': 1, 
  'blockquote': 1, 
  'i': 1, 
  'u': 1, 
  's': 1, 
  'tt': 1, 
  'address': 1, 
  'q': 1, 
  'pre': 1, 
  'p': 1, 
  'em': 1, 
  'dfn': 1}, L = merge({
  'a': 1}, J), M = {
  'tr': 1}, N = {
  '#text': 1}, O = merge({
  'param': 1}, K), P = merge({
  'form': 1}, A, D, E, I), Q = {
  'li': 1}, R = {
  'style': 1, 
  'script': 1}, headTags = {
  'base': 1, 
  'link': 1, 
  'meta': 1, 
  'title': 1}, T = merge(headTags, R), U = {
  'head': 1, 
  'body': 1}, V = {
  'html': 1};
  _$jscoverage['/html-parser/dtd.js'].lineData[160]++;
  var block = {
  'address': 1, 
  'blockquote': 1, 
  'center': 1, 
  'dir': 1, 
  'div': 1, 
  'dl': 1, 
  'fieldset': 1, 
  'form': 1, 
  'h1': 1, 
  'h2': 1, 
  'h3': 1, 
  'h4': 1, 
  'h5': 1, 
  'h6': 1, 
  'hr': 1, 
  'isindex': 1, 
  'menu': 1, 
  'noframes': 1, 
  'ol': 1, 
  'p': 1, 
  'pre': 1, 
  'table': 1, 
  'ul': 1};
  _$jscoverage['/html-parser/dtd.js'].lineData[208]++;
  var dtd = {
  $nonBodyContent: merge(V, U, headTags), 
  $block: block, 
  $blockLimit: {
  'body': 1, 
  'div': 1, 
  'td': 1, 
  'th': 1, 
  'caption': 1, 
  'form': 1}, 
  $inline: L, 
  $body: merge({
  'script': 1, 
  'style': 1}, block), 
  $cdata: {
  'script': 1, 
  'style': 1}, 
  $empty: {
  'area': 1, 
  'base': 1, 
  'br': 1, 
  'col': 1, 
  'hr': 1, 
  'img': 1, 
  'input': 1, 
  'link': 1, 
  'meta': 1, 
  'param': 1}, 
  $listItem: {
  'dd': 1, 
  'dt': 1, 
  'li': 1}, 
  $list: {
  'ul': 1, 
  'ol': 1, 
  'dl': 1}, 
  $nonEditable: {
  'applet': 1, 
  'button': 1, 
  'embed': 1, 
  'iframe': 1, 
  'map': 1, 
  'object': 1, 
  'option': 1, 
  'script': 1, 
  'textarea': 1, 
  'param': 1}, 
  $removeEmpty: {
  'abbr': 1, 
  'acronym': 1, 
  'address': 1, 
  'b': 1, 
  'bdo': 1, 
  'big': 1, 
  'cite': 1, 
  'code': 1, 
  'del': 1, 
  'dfn': 1, 
  'em': 1, 
  'font': 1, 
  'i': 1, 
  'ins': 1, 
  'label': 1, 
  'kbd': 1, 
  'q': 1, 
  's': 1, 
  'samp': 1, 
  'small': 1, 
  'span': 1, 
  'strike': 1, 
  'strong': 1, 
  'sub': 1, 
  'sup': 1, 
  'tt': 1, 
  'u': 1, 
  'var': 1}, 
  $tabIndex: {
  'a': 1, 
  'area': 1, 
  'button': 1, 
  'input': 1, 
  'object': 1, 
  'select': 1, 
  'textarea': 1}, 
  $tableContent: {
  'caption': 1, 
  'col': 1, 
  'colgroup': 1, 
  'tbody': 1, 
  'td': 1, 
  'tfoot': 1, 
  'th': 1, 
  'thead': 1, 
  'tr': 1}, 
  'html': U, 
  'head': T, 
  'style': N, 
  'body': P, 
  'base': {}, 
  'link': {}, 
  'meta': {}, 
  'title': N, 
  'col': {}, 
  'tr': {
  'td': 1, 
  'th': 1}, 
  'img': {}, 
  'colgroup': {
  'col': 1}, 
  'noscript': P, 
  'td': P, 
  'br': {}, 
  'th': P, 
  'center': P, 
  'kbd': L, 
  'button': merge(I, E), 
  'basefont': {}, 
  'h5': L, 
  'h4': L, 
  'samp': L, 
  'h6': L, 
  'ol': Q, 
  'h1': L, 
  'h3': L, 
  'option': N, 
  'h2': L, 
  'form': merge(A, D, E, I), 
  'select': {
  'optgroup': 1, 
  'option': 1}, 
  'font': L, 
  'ins': L, 
  'menu': Q, 
  'abbr': L, 
  'label': L, 
  'table': {
  'thead': 1, 
  'col': 1, 
  'tbody': 1, 
  'tr': 1, 
  'colgroup': 1, 
  'caption': 1, 
  'tfoot': 1}, 
  'code': L, 
  'script': N, 
  'tfoot': M, 
  'cite': L, 
  'li': P, 
  'input': {}, 
  'iframe': P, 
  'strong': L, 
  'textarea': N, 
  'noframes': P, 
  'big': L, 
  'small': L, 
  'span': L, 
  'hr': {}, 
  'dt': L, 
  'sub': L, 
  'optgroup': {
  'option': 1}, 
  'param': {}, 
  'bdo': L, 
  'var': L, 
  'div': P, 
  'object': O, 
  'sup': L, 
  'dd': P, 
  'strike': L, 
  'area': {}, 
  'dir': Q, 
  'map': merge({
  'area': 1, 
  'form': 1, 
  'p': 1}, A, F, E), 
  'applet': O, 
  'dl': {
  'dt': 1, 
  'dd': 1}, 
  'del': L, 
  'isindex': {}, 
  'fieldset': merge({
  legend: 1}, K), 
  'thead': M, 
  'ul': Q, 
  'acronym': L, 
  'b': L, 
  'a': J, 
  'blockquote': P, 
  'caption': L, 
  'i': L, 
  'u': L, 
  'tbody': M, 
  's': L, 
  'address': merge(D, I), 
  'tt': L, 
  'legend': L, 
  'q': L, 
  'pre': merge(G, C), 
  'p': L, 
  'em': L, 
  'dfn': L};
  _$jscoverage['/html-parser/dtd.js'].lineData[808]++;
  (function() {
  _$jscoverage['/html-parser/dtd.js'].functionData[1]++;
  _$jscoverage['/html-parser/dtd.js'].lineData[809]++;
  var i, html5Tags = ['article', 'figure', 'nav', 'aside', 'section', 'footer'];
  _$jscoverage['/html-parser/dtd.js'].lineData[815]++;
  for (var p in dtd) {
    _$jscoverage['/html-parser/dtd.js'].lineData[816]++;
    for (var p2 in dtd[p]) {
      _$jscoverage['/html-parser/dtd.js'].lineData[817]++;
      if (visit1_817_1(p2 === 'div')) {
        _$jscoverage['/html-parser/dtd.js'].lineData[818]++;
        for (i = 0; visit2_818_1(i < html5Tags.length); i++) {
          _$jscoverage['/html-parser/dtd.js'].lineData[819]++;
          dtd[p][html5Tags[i]] = dtd[p][p2];
        }
      }
    }
  }
  _$jscoverage['/html-parser/dtd.js'].lineData[825]++;
  for (i = 0; visit3_825_1(i < html5Tags.length); i++) {
    _$jscoverage['/html-parser/dtd.js'].lineData[826]++;
    dtd[html5Tags[i]] = dtd.div;
  }
  _$jscoverage['/html-parser/dtd.js'].lineData[829]++;
  dtd.$empty['!doctype'] = 1;
})();
  _$jscoverage['/html-parser/dtd.js'].lineData[832]++;
  return dtd;
});
