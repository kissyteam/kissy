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
if (! _$jscoverage['/combobox/cursor.js']) {
  _$jscoverage['/combobox/cursor.js'] = {};
  _$jscoverage['/combobox/cursor.js'].lineData = [];
  _$jscoverage['/combobox/cursor.js'].lineData[6] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[7] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[8] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[54] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[55] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[56] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[57] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[59] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[60] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[63] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[65] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[66] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[68] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[69] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[71] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[72] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[75] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[76] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[78] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[84] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[85] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[86] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[87] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[88] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[89] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[93] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[95] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[96] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[97] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[98] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[108] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[109] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[110] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[120] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[124] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[125] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[126] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[129] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[131] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[133] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[141] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[144] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[145] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[146] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[147] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[149] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[150] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[154] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[155] = 0;
  _$jscoverage['/combobox/cursor.js'].lineData[158] = 0;
}
if (! _$jscoverage['/combobox/cursor.js'].functionData) {
  _$jscoverage['/combobox/cursor.js'].functionData = [];
  _$jscoverage['/combobox/cursor.js'].functionData[0] = 0;
  _$jscoverage['/combobox/cursor.js'].functionData[1] = 0;
  _$jscoverage['/combobox/cursor.js'].functionData[2] = 0;
  _$jscoverage['/combobox/cursor.js'].functionData[3] = 0;
  _$jscoverage['/combobox/cursor.js'].functionData[4] = 0;
}
if (! _$jscoverage['/combobox/cursor.js'].branchData) {
  _$jscoverage['/combobox/cursor.js'].branchData = {};
  _$jscoverage['/combobox/cursor.js'].branchData['56'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['59'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['68'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['68'][1] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['87'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['108'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['124'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['124'][2] = new BranchData();
  _$jscoverage['/combobox/cursor.js'].branchData['149'] = [];
  _$jscoverage['/combobox/cursor.js'].branchData['149'][1] = new BranchData();
}
_$jscoverage['/combobox/cursor.js'].branchData['149'][1].init(1825, 18, 'selectionStart > 0');
function visit68_149_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['124'][2].init(1004, 24, 'elem.type !== \'textarea\'');
function visit67_124_2(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['124'][2].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['124'][1].init(977, 51, '!supportInputScrollLeft && elem.type !== \'textarea\'');
function visit66_124_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['108'][1].init(351, 13, 'doc.selection');
function visit65_108_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['87'][1].init(325, 23, 'input[0].scrollLeft > 0');
function visit64_87_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['68'][1].init(419, 9, '!FAKE_DIV');
function visit63_68_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['68'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['59'][1].init(110, 49, 'String(elem[0].type.toLowerCase()) === \'textarea\'');
function visit62_59_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].branchData['56'][1].init(42, 5, '!fake');
function visit61_56_1(result) {
  _$jscoverage['/combobox/cursor.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/combobox/cursor.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/combobox/cursor.js'].functionData[0]++;
  _$jscoverage['/combobox/cursor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/combobox/cursor.js'].lineData[8]++;
  var $ = Node.all, FAKE_DIV_HTML = '<div style="' + 'z-index:-9999;' + 'overflow:hidden;' + 'position: fixed;' + 'left:-9999px;' + 'top:-9999px;' + 'opacity:0;' + 'white-space:pre-wrap;' + 'word-wrap:break-word;' + '"></div>', FAKE_DIV, MARKER = '<span>' + 'x' + '</span>', STYLES = ['paddingLeft', 'paddingTop', 'paddingBottom', 'paddingRight', 'marginLeft', 'marginTop', 'marginBottom', 'marginRight', 'borderLeftStyle', 'borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftWidth', 'borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'line-height', 'outline', 'height', 'fontFamily', 'fontSize', 'fontWeight', 'fontVariant', 'fontStyle'], supportInputScrollLeft, findSupportInputScrollLeft;
  _$jscoverage['/combobox/cursor.js'].lineData[54]++;
  function getFakeDiv(elem) {
    _$jscoverage['/combobox/cursor.js'].functionData[1]++;
    _$jscoverage['/combobox/cursor.js'].lineData[55]++;
    var fake = FAKE_DIV;
    _$jscoverage['/combobox/cursor.js'].lineData[56]++;
    if (visit61_56_1(!fake)) {
      _$jscoverage['/combobox/cursor.js'].lineData[57]++;
      fake = $(FAKE_DIV_HTML);
    }
    _$jscoverage['/combobox/cursor.js'].lineData[59]++;
    if (visit62_59_1(String(elem[0].type.toLowerCase()) === 'textarea')) {
      _$jscoverage['/combobox/cursor.js'].lineData[60]++;
      fake.css('width', elem.css('width'));
    } else {
      _$jscoverage['/combobox/cursor.js'].lineData[63]++;
      fake.css('width', 9999);
    }
    _$jscoverage['/combobox/cursor.js'].lineData[65]++;
    S.each(STYLES, function(s) {
  _$jscoverage['/combobox/cursor.js'].functionData[2]++;
  _$jscoverage['/combobox/cursor.js'].lineData[66]++;
  fake.css(s, elem.css(s));
});
    _$jscoverage['/combobox/cursor.js'].lineData[68]++;
    if (visit63_68_1(!FAKE_DIV)) {
      _$jscoverage['/combobox/cursor.js'].lineData[69]++;
      fake.insertBefore(elem[0].ownerDocument.body.firstChild);
    }
    _$jscoverage['/combobox/cursor.js'].lineData[71]++;
    FAKE_DIV = fake;
    _$jscoverage['/combobox/cursor.js'].lineData[72]++;
    return fake;
  }
  _$jscoverage['/combobox/cursor.js'].lineData[75]++;
  findSupportInputScrollLeft = function() {
  _$jscoverage['/combobox/cursor.js'].functionData[3]++;
  _$jscoverage['/combobox/cursor.js'].lineData[76]++;
  var doc = document, input = $('<input>');
  _$jscoverage['/combobox/cursor.js'].lineData[78]++;
  input.css({
  width: 1, 
  position: 'absolute', 
  left: -9999, 
  top: -9999});
  _$jscoverage['/combobox/cursor.js'].lineData[84]++;
  input.val('123456789');
  _$jscoverage['/combobox/cursor.js'].lineData[85]++;
  input.appendTo(doc.body);
  _$jscoverage['/combobox/cursor.js'].lineData[86]++;
  input[0].focus();
  _$jscoverage['/combobox/cursor.js'].lineData[87]++;
  supportInputScrollLeft = (visit64_87_1(input[0].scrollLeft > 0));
  _$jscoverage['/combobox/cursor.js'].lineData[88]++;
  input.remove();
  _$jscoverage['/combobox/cursor.js'].lineData[89]++;
  findSupportInputScrollLeft = S.noop;
};
  _$jscoverage['/combobox/cursor.js'].lineData[93]++;
  supportInputScrollLeft = false;
  _$jscoverage['/combobox/cursor.js'].lineData[95]++;
  return function(elem) {
  _$jscoverage['/combobox/cursor.js'].functionData[4]++;
  _$jscoverage['/combobox/cursor.js'].lineData[96]++;
  var $elem = $(elem);
  _$jscoverage['/combobox/cursor.js'].lineData[97]++;
  elem = $elem[0];
  _$jscoverage['/combobox/cursor.js'].lineData[98]++;
  var doc = elem.ownerDocument, $doc = $(doc), elemOffset, range, fake, selectionStart, offset, marker, elemScrollTop = elem.scrollTop, elemScrollLeft = elem.scrollLeft;
  _$jscoverage['/combobox/cursor.js'].lineData[108]++;
  if (visit65_108_1(doc.selection)) {
    _$jscoverage['/combobox/cursor.js'].lineData[109]++;
    range = doc.selection.createRange();
    _$jscoverage['/combobox/cursor.js'].lineData[110]++;
    return {
  left: range.boundingLeft + elemScrollLeft + $doc.scrollLeft(), 
  top: range.boundingTop + elemScrollTop + range.boundingHeight + $doc.scrollTop()};
  }
  _$jscoverage['/combobox/cursor.js'].lineData[120]++;
  elemOffset = $elem.offset();
  _$jscoverage['/combobox/cursor.js'].lineData[124]++;
  if (visit66_124_1(!supportInputScrollLeft && visit67_124_2(elem.type !== 'textarea'))) {
    _$jscoverage['/combobox/cursor.js'].lineData[125]++;
    elemOffset.top += elem.offsetHeight;
    _$jscoverage['/combobox/cursor.js'].lineData[126]++;
    return elemOffset;
  }
  _$jscoverage['/combobox/cursor.js'].lineData[129]++;
  fake = getFakeDiv($elem);
  _$jscoverage['/combobox/cursor.js'].lineData[131]++;
  selectionStart = elem.selectionStart;
  _$jscoverage['/combobox/cursor.js'].lineData[133]++;
  fake.html(S.escapeHtml(elem.value.substring(0, selectionStart - 1)) + MARKER);
  _$jscoverage['/combobox/cursor.js'].lineData[141]++;
  offset = elemOffset;
  _$jscoverage['/combobox/cursor.js'].lineData[144]++;
  fake.offset(offset);
  _$jscoverage['/combobox/cursor.js'].lineData[145]++;
  marker = fake.last();
  _$jscoverage['/combobox/cursor.js'].lineData[146]++;
  offset = marker.offset();
  _$jscoverage['/combobox/cursor.js'].lineData[147]++;
  offset.top += marker.height();
  _$jscoverage['/combobox/cursor.js'].lineData[149]++;
  if (visit68_149_1(selectionStart > 0)) {
    _$jscoverage['/combobox/cursor.js'].lineData[150]++;
    offset.left += marker.width();
  }
  _$jscoverage['/combobox/cursor.js'].lineData[154]++;
  offset.top -= elemScrollTop;
  _$jscoverage['/combobox/cursor.js'].lineData[155]++;
  offset.left -= elemScrollLeft;
  _$jscoverage['/combobox/cursor.js'].lineData[158]++;
  return offset;
};
});
