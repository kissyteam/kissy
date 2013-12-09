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
if (! _$jscoverage['/utils.js']) {
  _$jscoverage['/utils.js'] = {};
  _$jscoverage['/utils.js'].lineData = [];
  _$jscoverage['/utils.js'].lineData[6] = 0;
  _$jscoverage['/utils.js'].lineData[7] = 0;
  _$jscoverage['/utils.js'].lineData[8] = 0;
  _$jscoverage['/utils.js'].lineData[26] = 0;
  _$jscoverage['/utils.js'].lineData[27] = 0;
  _$jscoverage['/utils.js'].lineData[29] = 0;
  _$jscoverage['/utils.js'].lineData[30] = 0;
  _$jscoverage['/utils.js'].lineData[31] = 0;
  _$jscoverage['/utils.js'].lineData[32] = 0;
  _$jscoverage['/utils.js'].lineData[35] = 0;
  _$jscoverage['/utils.js'].lineData[36] = 0;
  _$jscoverage['/utils.js'].lineData[38] = 0;
  _$jscoverage['/utils.js'].lineData[42] = 0;
  _$jscoverage['/utils.js'].lineData[43] = 0;
  _$jscoverage['/utils.js'].lineData[44] = 0;
  _$jscoverage['/utils.js'].lineData[46] = 0;
  _$jscoverage['/utils.js'].lineData[47] = 0;
  _$jscoverage['/utils.js'].lineData[49] = 0;
  _$jscoverage['/utils.js'].lineData[50] = 0;
  _$jscoverage['/utils.js'].lineData[51] = 0;
  _$jscoverage['/utils.js'].lineData[52] = 0;
  _$jscoverage['/utils.js'].lineData[53] = 0;
  _$jscoverage['/utils.js'].lineData[55] = 0;
  _$jscoverage['/utils.js'].lineData[56] = 0;
  _$jscoverage['/utils.js'].lineData[59] = 0;
  _$jscoverage['/utils.js'].lineData[61] = 0;
  _$jscoverage['/utils.js'].lineData[63] = 0;
  _$jscoverage['/utils.js'].lineData[64] = 0;
  _$jscoverage['/utils.js'].lineData[65] = 0;
  _$jscoverage['/utils.js'].lineData[67] = 0;
  _$jscoverage['/utils.js'].lineData[70] = 0;
  _$jscoverage['/utils.js'].lineData[71] = 0;
  _$jscoverage['/utils.js'].lineData[73] = 0;
  _$jscoverage['/utils.js'].lineData[75] = 0;
  _$jscoverage['/utils.js'].lineData[76] = 0;
  _$jscoverage['/utils.js'].lineData[77] = 0;
  _$jscoverage['/utils.js'].lineData[80] = 0;
  _$jscoverage['/utils.js'].lineData[81] = 0;
  _$jscoverage['/utils.js'].lineData[84] = 0;
}
if (! _$jscoverage['/utils.js'].functionData) {
  _$jscoverage['/utils.js'].functionData = [];
  _$jscoverage['/utils.js'].functionData[0] = 0;
  _$jscoverage['/utils.js'].functionData[1] = 0;
  _$jscoverage['/utils.js'].functionData[2] = 0;
  _$jscoverage['/utils.js'].functionData[3] = 0;
}
if (! _$jscoverage['/utils.js'].branchData) {
  _$jscoverage['/utils.js'].branchData = {};
  _$jscoverage['/utils.js'].branchData['29'] = [];
  _$jscoverage['/utils.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['31'] = [];
  _$jscoverage['/utils.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['35'] = [];
  _$jscoverage['/utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['46'] = [];
  _$jscoverage['/utils.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['51'] = [];
  _$jscoverage['/utils.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['63'] = [];
  _$jscoverage['/utils.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['68'] = [];
  _$jscoverage['/utils.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/utils.js'].branchData['70'] = [];
  _$jscoverage['/utils.js'].branchData['70'][1] = new BranchData();
}
_$jscoverage['/utils.js'].branchData['70'][1].init(151, 25, '!range || range.collapsed');
function visit8_70_1(result) {
  _$jscoverage['/utils.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['68'][1].init(56, 25, 'sel && sel.getRanges()[0]');
function visit7_68_1(result) {
  _$jscoverage['/utils.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['63'][1].init(110, 11, '_selectedEl');
function visit6_63_1(result) {
  _$jscoverage['/utils.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['51'][1].init(331, 5, 'range');
function visit5_51_1(result) {
  _$jscoverage['/utils.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['46'][1].init(130, 24, 'range && range.collapsed');
function visit4_46_1(result) {
  _$jscoverage['/utils.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['35'][1].init(256, 16, 'el.style.cssText');
function visit3_35_1(result) {
  _$jscoverage['/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['31'][1].init(52, 11, 'a.specified');
function visit2_31_1(result) {
  _$jscoverage['/utils.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].branchData['29'][1].init(86, 21, 'i < attributes.length');
function visit1_29_1(result) {
  _$jscoverage['/utils.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/utils.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/utils.js'].functionData[0]++;
  _$jscoverage['/utils.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/utils.js'].lineData[8]++;
  var Node = S.Node, KEStyle = Editor.Style, savedHref = '_ke_saved_href', linkStyle = {
  element: 'a', 
  attributes: {
  'href': '#(href)', 
  'title': '#(title)', 
  '_ke_saved_href': '#(_ke_saved_href)', 
  target: '#(target)'}};
  _$jscoverage['/utils.js'].lineData[26]++;
  function getAttributes(el) {
    _$jscoverage['/utils.js'].functionData[1]++;
    _$jscoverage['/utils.js'].lineData[27]++;
    var attributes = el.attributes, re = {};
    _$jscoverage['/utils.js'].lineData[29]++;
    for (var i = 0; visit1_29_1(i < attributes.length); i++) {
      _$jscoverage['/utils.js'].lineData[30]++;
      var a = attributes[i];
      _$jscoverage['/utils.js'].lineData[31]++;
      if (visit2_31_1(a.specified)) {
        _$jscoverage['/utils.js'].lineData[32]++;
        re[a.name] = a.value;
      }
    }
    _$jscoverage['/utils.js'].lineData[35]++;
    if (visit3_35_1(el.style.cssText)) {
      _$jscoverage['/utils.js'].lineData[36]++;
      re.style = el.style.cssText;
    }
    _$jscoverage['/utils.js'].lineData[38]++;
    return re;
  }
  _$jscoverage['/utils.js'].lineData[42]++;
  function removeLink(editor, a) {
    _$jscoverage['/utils.js'].functionData[2]++;
    _$jscoverage['/utils.js'].lineData[43]++;
    editor.execCommand('save');
    _$jscoverage['/utils.js'].lineData[44]++;
    var sel = editor.getSelection(), range = sel.getRanges()[0];
    _$jscoverage['/utils.js'].lineData[46]++;
    if (visit4_46_1(range && range.collapsed)) {
      _$jscoverage['/utils.js'].lineData[47]++;
      var bs = sel.createBookmarks();
      _$jscoverage['/utils.js'].lineData[49]++;
      a._4eRemove(true);
      _$jscoverage['/utils.js'].lineData[50]++;
      sel.selectBookmarks(bs);
    } else {
      _$jscoverage['/utils.js'].lineData[51]++;
      if (visit5_51_1(range)) {
        _$jscoverage['/utils.js'].lineData[52]++;
        var attrs = getAttributes(a[0]);
        _$jscoverage['/utils.js'].lineData[53]++;
        new KEStyle(linkStyle, attrs).remove(editor.get('document')[0]);
      }
    }
    _$jscoverage['/utils.js'].lineData[55]++;
    editor.execCommand('save');
    _$jscoverage['/utils.js'].lineData[56]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/utils.js'].lineData[59]++;
  function applyLink(editor, attr, _selectedEl) {
    _$jscoverage['/utils.js'].functionData[3]++;
    _$jscoverage['/utils.js'].lineData[61]++;
    attr[savedHref] = attr.href;
    _$jscoverage['/utils.js'].lineData[63]++;
    if (visit6_63_1(_selectedEl)) {
      _$jscoverage['/utils.js'].lineData[64]++;
      editor.execCommand('save');
      _$jscoverage['/utils.js'].lineData[65]++;
      _selectedEl.attr(attr);
    } else {
      _$jscoverage['/utils.js'].lineData[67]++;
      var sel = editor.getSelection(), range = visit7_68_1(sel && sel.getRanges()[0]);
      _$jscoverage['/utils.js'].lineData[70]++;
      if (visit8_70_1(!range || range.collapsed)) {
        _$jscoverage['/utils.js'].lineData[71]++;
        var a = new Node('<a>' + attr.href + '</a>', attr, editor.get('document')[0]);
        _$jscoverage['/utils.js'].lineData[73]++;
        editor.insertElement(a);
      } else {
        _$jscoverage['/utils.js'].lineData[75]++;
        editor.execCommand('save');
        _$jscoverage['/utils.js'].lineData[76]++;
        var linkStyleObj = new KEStyle(linkStyle, attr);
        _$jscoverage['/utils.js'].lineData[77]++;
        linkStyleObj.apply(editor.get('document')[0]);
      }
    }
    _$jscoverage['/utils.js'].lineData[80]++;
    editor.execCommand('save');
    _$jscoverage['/utils.js'].lineData[81]++;
    editor.notifySelectionChange();
  }
  _$jscoverage['/utils.js'].lineData[84]++;
  return {
  removeLink: removeLink, 
  applyLink: applyLink, 
  savedHref: savedHref};
});
