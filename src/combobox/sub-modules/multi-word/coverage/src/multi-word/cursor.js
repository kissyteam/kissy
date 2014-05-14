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
if (! _$jscoverage['/multi-word/cursor.js']) {
  _$jscoverage['/multi-word/cursor.js'] = {};
  _$jscoverage['/multi-word/cursor.js'].lineData = [];
  _$jscoverage['/multi-word/cursor.js'].lineData[6] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[7] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[8] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[10] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[56] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[57] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[58] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[59] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[61] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[62] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[65] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[67] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[68] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[70] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[71] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[73] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[74] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[77] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[78] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[80] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[86] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[87] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[88] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[89] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[90] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[91] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[97] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[99] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[100] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[101] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[102] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[112] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[113] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[114] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[124] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[128] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[129] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[130] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[133] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[135] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[137] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[145] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[148] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[149] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[150] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[151] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[153] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[154] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[158] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[159] = 0;
  _$jscoverage['/multi-word/cursor.js'].lineData[162] = 0;
}
if (! _$jscoverage['/multi-word/cursor.js'].functionData) {
  _$jscoverage['/multi-word/cursor.js'].functionData = [];
  _$jscoverage['/multi-word/cursor.js'].functionData[0] = 0;
  _$jscoverage['/multi-word/cursor.js'].functionData[1] = 0;
  _$jscoverage['/multi-word/cursor.js'].functionData[2] = 0;
  _$jscoverage['/multi-word/cursor.js'].functionData[3] = 0;
  _$jscoverage['/multi-word/cursor.js'].functionData[4] = 0;
  _$jscoverage['/multi-word/cursor.js'].functionData[5] = 0;
}
if (! _$jscoverage['/multi-word/cursor.js'].branchData) {
  _$jscoverage['/multi-word/cursor.js'].branchData = {};
  _$jscoverage['/multi-word/cursor.js'].branchData['58'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['61'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['70'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['89'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['112'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['112'][1] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['128'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['128'][2] = new BranchData();
  _$jscoverage['/multi-word/cursor.js'].branchData['153'] = [];
  _$jscoverage['/multi-word/cursor.js'].branchData['153'][1] = new BranchData();
}
_$jscoverage['/multi-word/cursor.js'].branchData['153'][1].init(1879, 18, 'selectionStart > 0');
function visit8_153_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['128'][2].init(1033, 24, 'elem.type !== \'textarea\'');
function visit7_128_2(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['128'][2].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['128'][1].init(1006, 51, '!supportInputScrollLeft && elem.type !== \'textarea\'');
function visit6_128_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['112'][1].init(364, 13, 'doc.selection');
function visit5_112_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['112'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['89'][1].init(337, 23, 'input[0].scrollLeft > 0');
function visit4_89_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['70'][1].init(436, 9, '!FAKE_DIV');
function visit3_70_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['61'][1].init(115, 49, 'String(elem[0].type.toLowerCase()) === \'textarea\'');
function visit2_61_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].branchData['58'][1].init(44, 5, '!fake');
function visit1_58_1(result) {
  _$jscoverage['/multi-word/cursor.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/multi-word/cursor.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/multi-word/cursor.js'].functionData[0]++;
  _$jscoverage['/multi-word/cursor.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/multi-word/cursor.js'].lineData[8]++;
  var util = require('util');
  _$jscoverage['/multi-word/cursor.js'].lineData[10]++;
  var $ = Node.all, FAKE_DIV_HTML = '<div style="' + 'z-index:-9999;' + 'overflow:hidden;' + 'position: fixed;' + 'left:-9999px;' + 'top:-9999px;' + 'opacity:0;' + 'white-space:pre-wrap;' + 'word-wrap:break-word;' + '"></div>', FAKE_DIV, MARKER = '<span>' + 'x' + '</span>', STYLES = ['paddingLeft', 'paddingTop', 'paddingBottom', 'paddingRight', 'marginLeft', 'marginTop', 'marginBottom', 'marginRight', 'borderLeftStyle', 'borderTopStyle', 'borderBottomStyle', 'borderRightStyle', 'borderLeftWidth', 'borderTopWidth', 'borderBottomWidth', 'borderRightWidth', 'line-height', 'outline', 'height', 'fontFamily', 'fontSize', 'fontWeight', 'fontVariant', 'fontStyle'], supportInputScrollLeft, findSupportInputScrollLeft;
  _$jscoverage['/multi-word/cursor.js'].lineData[56]++;
  function getFakeDiv(elem) {
    _$jscoverage['/multi-word/cursor.js'].functionData[1]++;
    _$jscoverage['/multi-word/cursor.js'].lineData[57]++;
    var fake = FAKE_DIV;
    _$jscoverage['/multi-word/cursor.js'].lineData[58]++;
    if (visit1_58_1(!fake)) {
      _$jscoverage['/multi-word/cursor.js'].lineData[59]++;
      fake = $(FAKE_DIV_HTML);
    }
    _$jscoverage['/multi-word/cursor.js'].lineData[61]++;
    if (visit2_61_1(String(elem[0].type.toLowerCase()) === 'textarea')) {
      _$jscoverage['/multi-word/cursor.js'].lineData[62]++;
      fake.css('width', elem.css('width'));
    } else {
      _$jscoverage['/multi-word/cursor.js'].lineData[65]++;
      fake.css('width', 9999);
    }
    _$jscoverage['/multi-word/cursor.js'].lineData[67]++;
    util.each(STYLES, function(s) {
  _$jscoverage['/multi-word/cursor.js'].functionData[2]++;
  _$jscoverage['/multi-word/cursor.js'].lineData[68]++;
  fake.css(s, elem.css(s));
});
    _$jscoverage['/multi-word/cursor.js'].lineData[70]++;
    if (visit3_70_1(!FAKE_DIV)) {
      _$jscoverage['/multi-word/cursor.js'].lineData[71]++;
      fake.insertBefore(elem[0].ownerDocument.body.firstChild);
    }
    _$jscoverage['/multi-word/cursor.js'].lineData[73]++;
    FAKE_DIV = fake;
    _$jscoverage['/multi-word/cursor.js'].lineData[74]++;
    return fake;
  }
  _$jscoverage['/multi-word/cursor.js'].lineData[77]++;
  findSupportInputScrollLeft = function() {
  _$jscoverage['/multi-word/cursor.js'].functionData[3]++;
  _$jscoverage['/multi-word/cursor.js'].lineData[78]++;
  var doc = document, input = $('<input>');
  _$jscoverage['/multi-word/cursor.js'].lineData[80]++;
  input.css({
  width: 1, 
  position: 'absolute', 
  left: -9999, 
  top: -9999});
  _$jscoverage['/multi-word/cursor.js'].lineData[86]++;
  input.val('123456789');
  _$jscoverage['/multi-word/cursor.js'].lineData[87]++;
  input.appendTo(doc.body);
  _$jscoverage['/multi-word/cursor.js'].lineData[88]++;
  input[0].focus();
  _$jscoverage['/multi-word/cursor.js'].lineData[89]++;
  supportInputScrollLeft = (visit4_89_1(input[0].scrollLeft > 0));
  _$jscoverage['/multi-word/cursor.js'].lineData[90]++;
  input.remove();
  _$jscoverage['/multi-word/cursor.js'].lineData[91]++;
  findSupportInputScrollLeft = function() {
  _$jscoverage['/multi-word/cursor.js'].functionData[4]++;
};
};
  _$jscoverage['/multi-word/cursor.js'].lineData[97]++;
  supportInputScrollLeft = false;
  _$jscoverage['/multi-word/cursor.js'].lineData[99]++;
  return function(elem) {
  _$jscoverage['/multi-word/cursor.js'].functionData[5]++;
  _$jscoverage['/multi-word/cursor.js'].lineData[100]++;
  var $elem = $(elem);
  _$jscoverage['/multi-word/cursor.js'].lineData[101]++;
  elem = $elem[0];
  _$jscoverage['/multi-word/cursor.js'].lineData[102]++;
  var doc = elem.ownerDocument, $doc = $(doc), elemOffset, range, fake, selectionStart, offset, marker, elemScrollTop = elem.scrollTop, elemScrollLeft = elem.scrollLeft;
  _$jscoverage['/multi-word/cursor.js'].lineData[112]++;
  if (visit5_112_1(doc.selection)) {
    _$jscoverage['/multi-word/cursor.js'].lineData[113]++;
    range = doc.selection.createRange();
    _$jscoverage['/multi-word/cursor.js'].lineData[114]++;
    return {
  left: range.boundingLeft + elemScrollLeft + $doc.scrollLeft(), 
  top: range.boundingTop + elemScrollTop + range.boundingHeight + $doc.scrollTop()};
  }
  _$jscoverage['/multi-word/cursor.js'].lineData[124]++;
  elemOffset = $elem.offset();
  _$jscoverage['/multi-word/cursor.js'].lineData[128]++;
  if (visit6_128_1(!supportInputScrollLeft && visit7_128_2(elem.type !== 'textarea'))) {
    _$jscoverage['/multi-word/cursor.js'].lineData[129]++;
    elemOffset.top += elem.offsetHeight;
    _$jscoverage['/multi-word/cursor.js'].lineData[130]++;
    return elemOffset;
  }
  _$jscoverage['/multi-word/cursor.js'].lineData[133]++;
  fake = getFakeDiv($elem);
  _$jscoverage['/multi-word/cursor.js'].lineData[135]++;
  selectionStart = elem.selectionStart;
  _$jscoverage['/multi-word/cursor.js'].lineData[137]++;
  fake.html(S.escapeHtml(elem.value.substring(0, selectionStart - 1)) + MARKER);
  _$jscoverage['/multi-word/cursor.js'].lineData[145]++;
  offset = elemOffset;
  _$jscoverage['/multi-word/cursor.js'].lineData[148]++;
  fake.offset(offset);
  _$jscoverage['/multi-word/cursor.js'].lineData[149]++;
  marker = fake.last();
  _$jscoverage['/multi-word/cursor.js'].lineData[150]++;
  offset = marker.offset();
  _$jscoverage['/multi-word/cursor.js'].lineData[151]++;
  offset.top += marker.height();
  _$jscoverage['/multi-word/cursor.js'].lineData[153]++;
  if (visit8_153_1(selectionStart > 0)) {
    _$jscoverage['/multi-word/cursor.js'].lineData[154]++;
    offset.left += marker.width();
  }
  _$jscoverage['/multi-word/cursor.js'].lineData[158]++;
  offset.top -= elemScrollTop;
  _$jscoverage['/multi-word/cursor.js'].lineData[159]++;
  offset.left -= elemScrollLeft;
  _$jscoverage['/multi-word/cursor.js'].lineData[162]++;
  return offset;
};
});
