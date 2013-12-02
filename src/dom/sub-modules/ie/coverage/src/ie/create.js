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
if (! _$jscoverage['/ie/create.js']) {
  _$jscoverage['/ie/create.js'] = {};
  _$jscoverage['/ie/create.js'].lineData = [];
  _$jscoverage['/ie/create.js'].lineData[6] = 0;
  _$jscoverage['/ie/create.js'].lineData[7] = 0;
  _$jscoverage['/ie/create.js'].lineData[9] = 0;
  _$jscoverage['/ie/create.js'].lineData[13] = 0;
  _$jscoverage['/ie/create.js'].lineData[14] = 0;
  _$jscoverage['/ie/create.js'].lineData[19] = 0;
  _$jscoverage['/ie/create.js'].lineData[20] = 0;
  _$jscoverage['/ie/create.js'].lineData[23] = 0;
  _$jscoverage['/ie/create.js'].lineData[29] = 0;
  _$jscoverage['/ie/create.js'].lineData[30] = 0;
  _$jscoverage['/ie/create.js'].lineData[31] = 0;
  _$jscoverage['/ie/create.js'].lineData[34] = 0;
  _$jscoverage['/ie/create.js'].lineData[38] = 0;
  _$jscoverage['/ie/create.js'].lineData[39] = 0;
  _$jscoverage['/ie/create.js'].lineData[44] = 0;
  _$jscoverage['/ie/create.js'].lineData[45] = 0;
  _$jscoverage['/ie/create.js'].lineData[50] = 0;
  _$jscoverage['/ie/create.js'].lineData[51] = 0;
  _$jscoverage['/ie/create.js'].lineData[54] = 0;
  _$jscoverage['/ie/create.js'].lineData[55] = 0;
  _$jscoverage['/ie/create.js'].lineData[57] = 0;
  _$jscoverage['/ie/create.js'].lineData[63] = 0;
  _$jscoverage['/ie/create.js'].lineData[66] = 0;
  _$jscoverage['/ie/create.js'].lineData[71] = 0;
  _$jscoverage['/ie/create.js'].lineData[74] = 0;
  _$jscoverage['/ie/create.js'].lineData[75] = 0;
  _$jscoverage['/ie/create.js'].lineData[77] = 0;
  _$jscoverage['/ie/create.js'].lineData[78] = 0;
  _$jscoverage['/ie/create.js'].lineData[80] = 0;
  _$jscoverage['/ie/create.js'].lineData[82] = 0;
  _$jscoverage['/ie/create.js'].lineData[83] = 0;
  _$jscoverage['/ie/create.js'].lineData[84] = 0;
  _$jscoverage['/ie/create.js'].lineData[87] = 0;
}
if (! _$jscoverage['/ie/create.js'].functionData) {
  _$jscoverage['/ie/create.js'].functionData = [];
  _$jscoverage['/ie/create.js'].functionData[0] = 0;
  _$jscoverage['/ie/create.js'].functionData[1] = 0;
  _$jscoverage['/ie/create.js'].functionData[2] = 0;
  _$jscoverage['/ie/create.js'].functionData[3] = 0;
}
if (! _$jscoverage['/ie/create.js'].branchData) {
  _$jscoverage['/ie/create.js'].branchData = {};
  _$jscoverage['/ie/create.js'].branchData['13'] = [];
  _$jscoverage['/ie/create.js'].branchData['13'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['19'] = [];
  _$jscoverage['/ie/create.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['29'] = [];
  _$jscoverage['/ie/create.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['29'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['30'] = [];
  _$jscoverage['/ie/create.js'].branchData['30'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['34'] = [];
  _$jscoverage['/ie/create.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['34'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['34'][4] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['34'][5] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['38'] = [];
  _$jscoverage['/ie/create.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['44'] = [];
  _$jscoverage['/ie/create.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['50'] = [];
  _$jscoverage['/ie/create.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['54'] = [];
  _$jscoverage['/ie/create.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['54'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['71'] = [];
  _$jscoverage['/ie/create.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['77'] = [];
  _$jscoverage['/ie/create.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['83'] = [];
  _$jscoverage['/ie/create.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['83'][2] = new BranchData();
}
_$jscoverage['/ie/create.js'].branchData['83'][2].init(21, 27, 'Dom.nodeName(c) === \'tbody\'');
function visit37_83_2(result) {
  _$jscoverage['/ie/create.js'].branchData['83'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['83'][1].init(21, 51, 'Dom.nodeName(c) === \'tbody\' && !c.childNodes.length');
function visit36_83_1(result) {
  _$jscoverage['/ie/create.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['77'][1].init(119, 8, 'hasTBody');
function visit35_77_1(result) {
  _$jscoverage['/ie/create.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['71'][1].init(2763, 15, 'S.UA.ieMode < 8');
function visit34_71_1(result) {
  _$jscoverage['/ie/create.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['54'][3].init(2058, 23, 'nodeName === \'textarea\'');
function visit33_54_3(result) {
  _$jscoverage['/ie/create.js'].branchData['54'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['54'][2].init(2034, 20, 'nodeName === \'input\'');
function visit32_54_2(result) {
  _$jscoverage['/ie/create.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['54'][1].init(2034, 47, 'nodeName === \'input\' || nodeName === \'textarea\'');
function visit31_54_1(result) {
  _$jscoverage['/ie/create.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['50'][1].init(1812, 21, 'nodeName === \'option\'');
function visit30_50_1(result) {
  _$jscoverage['/ie/create.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['44'][1].init(509, 24, 'dest.value !== src.value');
function visit29_44_1(result) {
  _$jscoverage['/ie/create.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['38'][1].init(250, 11, 'src.checked');
function visit28_38_1(result) {
  _$jscoverage['/ie/create.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['34'][5].init(1053, 20, 'src.type === \'radio\'');
function visit27_34_5(result) {
  _$jscoverage['/ie/create.js'].branchData['34'][5].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['34'][4].init(1026, 23, 'src.type === \'checkbox\'');
function visit26_34_4(result) {
  _$jscoverage['/ie/create.js'].branchData['34'][4].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['34'][3].init(1026, 47, 'src.type === \'checkbox\' || src.type === \'radio\'');
function visit25_34_3(result) {
  _$jscoverage['/ie/create.js'].branchData['34'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['34'][2].init(1001, 20, 'nodeName === \'input\'');
function visit24_34_2(result) {
  _$jscoverage['/ie/create.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['34'][1].init(1001, 73, 'nodeName === \'input\' && (src.type === \'checkbox\' || src.type === \'radio\')');
function visit23_34_1(result) {
  _$jscoverage['/ie/create.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['30'][1].init(29, 22, 'i < srcChildren.length');
function visit22_30_1(result) {
  _$jscoverage['/ie/create.js'].branchData['30'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['29'][2].init(743, 21, 'nodeName === \'object\'');
function visit21_29_2(result) {
  _$jscoverage['/ie/create.js'].branchData['29'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['29'][1].init(743, 48, 'nodeName === \'object\' && !dest.childNodes.length');
function visit20_29_1(result) {
  _$jscoverage['/ie/create.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['19'][1].init(352, 20, 'dest.mergeAttributes');
function visit19_19_1(result) {
  _$jscoverage['/ie/create.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['13'][1].init(157, 20, 'dest.clearAttributes');
function visit18_13_1(result) {
  _$jscoverage['/ie/create.js'].branchData['13'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/create.js'].functionData[0]++;
  _$jscoverage['/ie/create.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/create.js'].lineData[9]++;
  Dom._fixCloneAttributes = function(src, dest) {
  _$jscoverage['/ie/create.js'].functionData[1]++;
  _$jscoverage['/ie/create.js'].lineData[13]++;
  if (visit18_13_1(dest.clearAttributes)) {
    _$jscoverage['/ie/create.js'].lineData[14]++;
    dest.clearAttributes();
  }
  _$jscoverage['/ie/create.js'].lineData[19]++;
  if (visit19_19_1(dest.mergeAttributes)) {
    _$jscoverage['/ie/create.js'].lineData[20]++;
    dest.mergeAttributes(src);
  }
  _$jscoverage['/ie/create.js'].lineData[23]++;
  var nodeName = dest.nodeName.toLowerCase(), srcChildren = src.childNodes;
  _$jscoverage['/ie/create.js'].lineData[29]++;
  if (visit20_29_1(visit21_29_2(nodeName === 'object') && !dest.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[30]++;
    for (var i = 0; visit22_30_1(i < srcChildren.length); i++) {
      _$jscoverage['/ie/create.js'].lineData[31]++;
      dest.appendChild(srcChildren[i].cloneNode(true));
    }
  } else {
    _$jscoverage['/ie/create.js'].lineData[34]++;
    if (visit23_34_1(visit24_34_2(nodeName === 'input') && (visit25_34_3(visit26_34_4(src.type === 'checkbox') || visit27_34_5(src.type === 'radio'))))) {
      _$jscoverage['/ie/create.js'].lineData[38]++;
      if (visit28_38_1(src.checked)) {
        _$jscoverage['/ie/create.js'].lineData[39]++;
        dest.defaultChecked = dest.checked = src.checked;
      }
      _$jscoverage['/ie/create.js'].lineData[44]++;
      if (visit29_44_1(dest.value !== src.value)) {
        _$jscoverage['/ie/create.js'].lineData[45]++;
        dest.value = src.value;
      }
    } else {
      _$jscoverage['/ie/create.js'].lineData[50]++;
      if (visit30_50_1(nodeName === 'option')) {
        _$jscoverage['/ie/create.js'].lineData[51]++;
        dest.selected = src.defaultSelected;
      } else {
        _$jscoverage['/ie/create.js'].lineData[54]++;
        if (visit31_54_1(visit32_54_2(nodeName === 'input') || visit33_54_3(nodeName === 'textarea'))) {
          _$jscoverage['/ie/create.js'].lineData[55]++;
          dest.defaultValue = src.defaultValue;
          _$jscoverage['/ie/create.js'].lineData[57]++;
          dest.value = src.value;
        }
      }
    }
  }
  _$jscoverage['/ie/create.js'].lineData[63]++;
  dest.removeAttribute(Dom.__EXPANDO);
};
  _$jscoverage['/ie/create.js'].lineData[66]++;
  var creators = Dom._creators, defaultCreator = Dom._defaultCreator, R_TBODY = /<tbody/i;
  _$jscoverage['/ie/create.js'].lineData[71]++;
  if (visit34_71_1(S.UA.ieMode < 8)) {
    _$jscoverage['/ie/create.js'].lineData[74]++;
    creators.table = function(html, ownerDoc) {
  _$jscoverage['/ie/create.js'].functionData[2]++;
  _$jscoverage['/ie/create.js'].lineData[75]++;
  var frag = defaultCreator(html, ownerDoc), hasTBody = R_TBODY.test(html);
  _$jscoverage['/ie/create.js'].lineData[77]++;
  if (visit35_77_1(hasTBody)) {
    _$jscoverage['/ie/create.js'].lineData[78]++;
    return frag;
  }
  _$jscoverage['/ie/create.js'].lineData[80]++;
  var table = frag.firstChild, tableChildren = S.makeArray(table.childNodes);
  _$jscoverage['/ie/create.js'].lineData[82]++;
  S.each(tableChildren, function(c) {
  _$jscoverage['/ie/create.js'].functionData[3]++;
  _$jscoverage['/ie/create.js'].lineData[83]++;
  if (visit36_83_1(visit37_83_2(Dom.nodeName(c) === 'tbody') && !c.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[84]++;
    table.removeChild(c);
  }
});
  _$jscoverage['/ie/create.js'].lineData[87]++;
  return frag;
};
  }
});
