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
  _$jscoverage['/ie/create.js'].lineData[12] = 0;
  _$jscoverage['/ie/create.js'].lineData[13] = 0;
  _$jscoverage['/ie/create.js'].lineData[18] = 0;
  _$jscoverage['/ie/create.js'].lineData[19] = 0;
  _$jscoverage['/ie/create.js'].lineData[22] = 0;
  _$jscoverage['/ie/create.js'].lineData[25] = 0;
  _$jscoverage['/ie/create.js'].lineData[26] = 0;
  _$jscoverage['/ie/create.js'].lineData[31] = 0;
  _$jscoverage['/ie/create.js'].lineData[32] = 0;
  _$jscoverage['/ie/create.js'].lineData[33] = 0;
  _$jscoverage['/ie/create.js'].lineData[35] = 0;
  _$jscoverage['/ie/create.js'].lineData[39] = 0;
  _$jscoverage['/ie/create.js'].lineData[40] = 0;
  _$jscoverage['/ie/create.js'].lineData[41] = 0;
  _$jscoverage['/ie/create.js'].lineData[46] = 0;
  _$jscoverage['/ie/create.js'].lineData[47] = 0;
  _$jscoverage['/ie/create.js'].lineData[48] = 0;
  _$jscoverage['/ie/create.js'].lineData[50] = 0;
  _$jscoverage['/ie/create.js'].lineData[53] = 0;
  _$jscoverage['/ie/create.js'].lineData[54] = 0;
  _$jscoverage['/ie/create.js'].lineData[57] = 0;
  _$jscoverage['/ie/create.js'].lineData[59] = 0;
  _$jscoverage['/ie/create.js'].lineData[65] = 0;
  _$jscoverage['/ie/create.js'].lineData[68] = 0;
  _$jscoverage['/ie/create.js'].lineData[73] = 0;
  _$jscoverage['/ie/create.js'].lineData[76] = 0;
  _$jscoverage['/ie/create.js'].lineData[77] = 0;
  _$jscoverage['/ie/create.js'].lineData[79] = 0;
  _$jscoverage['/ie/create.js'].lineData[80] = 0;
  _$jscoverage['/ie/create.js'].lineData[82] = 0;
  _$jscoverage['/ie/create.js'].lineData[84] = 0;
  _$jscoverage['/ie/create.js'].lineData[85] = 0;
  _$jscoverage['/ie/create.js'].lineData[86] = 0;
  _$jscoverage['/ie/create.js'].lineData[89] = 0;
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
  _$jscoverage['/ie/create.js'].branchData['12'] = [];
  _$jscoverage['/ie/create.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['18'] = [];
  _$jscoverage['/ie/create.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['25'] = [];
  _$jscoverage['/ie/create.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['31'] = [];
  _$jscoverage['/ie/create.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['31'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['32'] = [];
  _$jscoverage['/ie/create.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['35'] = [];
  _$jscoverage['/ie/create.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['35'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['35'][4] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['35'][5] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['40'] = [];
  _$jscoverage['/ie/create.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['47'] = [];
  _$jscoverage['/ie/create.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['50'] = [];
  _$jscoverage['/ie/create.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['54'] = [];
  _$jscoverage['/ie/create.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['54'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['54'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['73'] = [];
  _$jscoverage['/ie/create.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['79'] = [];
  _$jscoverage['/ie/create.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['85'] = [];
  _$jscoverage['/ie/create.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['85'][2] = new BranchData();
}
_$jscoverage['/ie/create.js'].branchData['85'][2].init(21, 27, 'Dom.nodeName(c) === \'tbody\'');
function visit38_85_2(result) {
  _$jscoverage['/ie/create.js'].branchData['85'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['85'][1].init(21, 51, 'Dom.nodeName(c) === \'tbody\' && !c.childNodes.length');
function visit37_85_1(result) {
  _$jscoverage['/ie/create.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['79'][1].init(119, 8, 'hasTBody');
function visit36_79_1(result) {
  _$jscoverage['/ie/create.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['73'][1].init(2860, 24, 'require(\'ua\').ieMode < 8');
function visit35_73_1(result) {
  _$jscoverage['/ie/create.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['54'][3].init(2027, 23, 'nodeName === \'textarea\'');
function visit34_54_3(result) {
  _$jscoverage['/ie/create.js'].branchData['54'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['54'][2].init(2003, 20, 'nodeName === \'input\'');
function visit33_54_2(result) {
  _$jscoverage['/ie/create.js'].branchData['54'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['54'][1].init(2003, 47, 'nodeName === \'input\' || nodeName === \'textarea\'');
function visit32_54_1(result) {
  _$jscoverage['/ie/create.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['50'][1].init(1786, 21, 'nodeName === \'option\'');
function visit31_50_1(result) {
  _$jscoverage['/ie/create.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['47'][1].init(579, 23, 'dest.value !== srcValue');
function visit30_47_1(result) {
  _$jscoverage['/ie/create.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['40'][1].init(288, 10, 'srcChecked');
function visit29_40_1(result) {
  _$jscoverage['/ie/create.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['35'][5].init(1087, 16, 'type === \'radio\'');
function visit28_35_5(result) {
  _$jscoverage['/ie/create.js'].branchData['35'][5].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['35'][4].init(1064, 19, 'type === \'checkbox\'');
function visit27_35_4(result) {
  _$jscoverage['/ie/create.js'].branchData['35'][4].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['35'][3].init(1064, 39, 'type === \'checkbox\' || type === \'radio\'');
function visit26_35_3(result) {
  _$jscoverage['/ie/create.js'].branchData['35'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['35'][2].init(1039, 20, 'nodeName === \'input\'');
function visit25_35_2(result) {
  _$jscoverage['/ie/create.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['35'][1].init(1039, 65, 'nodeName === \'input\' && (type === \'checkbox\' || type === \'radio\')');
function visit24_35_1(result) {
  _$jscoverage['/ie/create.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['32'][1].init(29, 22, 'i < srcChildren.length');
function visit23_32_1(result) {
  _$jscoverage['/ie/create.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['31'][2].init(828, 21, 'nodeName === \'object\'');
function visit22_31_2(result) {
  _$jscoverage['/ie/create.js'].branchData['31'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['31'][1].init(828, 48, 'nodeName === \'object\' && !dest.childNodes.length');
function visit21_31_1(result) {
  _$jscoverage['/ie/create.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['25'][1].init(540, 14, 'src.type || \'\'');
function visit20_25_1(result) {
  _$jscoverage['/ie/create.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['18'][1].init(351, 20, 'dest.mergeAttributes');
function visit19_18_1(result) {
  _$jscoverage['/ie/create.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['12'][1].init(156, 20, 'dest.clearAttributes');
function visit18_12_1(result) {
  _$jscoverage['/ie/create.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/ie/create.js'].functionData[0]++;
  _$jscoverage['/ie/create.js'].lineData[7]++;
  var Dom = require('dom/base');
  _$jscoverage['/ie/create.js'].lineData[9]++;
  Dom._fixCloneAttributes = function(src, dest) {
  _$jscoverage['/ie/create.js'].functionData[1]++;
  _$jscoverage['/ie/create.js'].lineData[12]++;
  if (visit18_12_1(dest.clearAttributes)) {
    _$jscoverage['/ie/create.js'].lineData[13]++;
    dest.clearAttributes();
  }
  _$jscoverage['/ie/create.js'].lineData[18]++;
  if (visit19_18_1(dest.mergeAttributes)) {
    _$jscoverage['/ie/create.js'].lineData[19]++;
    dest.mergeAttributes(src);
  }
  _$jscoverage['/ie/create.js'].lineData[22]++;
  var nodeName = dest.nodeName.toLowerCase(), srcChildren = src.childNodes;
  _$jscoverage['/ie/create.js'].lineData[25]++;
  var type = (visit20_25_1(src.type || '')).toLowerCase();
  _$jscoverage['/ie/create.js'].lineData[26]++;
  var srcValue, srcChecked;
  _$jscoverage['/ie/create.js'].lineData[31]++;
  if (visit21_31_1(visit22_31_2(nodeName === 'object') && !dest.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[32]++;
    for (var i = 0; visit23_32_1(i < srcChildren.length); i++) {
      _$jscoverage['/ie/create.js'].lineData[33]++;
      dest.appendChild(srcChildren[i].cloneNode(true));
    }
  } else {
    _$jscoverage['/ie/create.js'].lineData[35]++;
    if (visit24_35_1(visit25_35_2(nodeName === 'input') && (visit26_35_3(visit27_35_4(type === 'checkbox') || visit28_35_5(type === 'radio'))))) {
      _$jscoverage['/ie/create.js'].lineData[39]++;
      srcChecked = src.checked;
      _$jscoverage['/ie/create.js'].lineData[40]++;
      if (visit29_40_1(srcChecked)) {
        _$jscoverage['/ie/create.js'].lineData[41]++;
        dest.defaultChecked = dest.checked = srcChecked;
      }
      _$jscoverage['/ie/create.js'].lineData[46]++;
      srcValue = src.value;
      _$jscoverage['/ie/create.js'].lineData[47]++;
      if (visit30_47_1(dest.value !== srcValue)) {
        _$jscoverage['/ie/create.js'].lineData[48]++;
        dest.value = srcValue;
      }
    } else {
      _$jscoverage['/ie/create.js'].lineData[50]++;
      if (visit31_50_1(nodeName === 'option')) {
        _$jscoverage['/ie/create.js'].lineData[53]++;
        dest.selected = src.defaultSelected;
      } else {
        _$jscoverage['/ie/create.js'].lineData[54]++;
        if (visit32_54_1(visit33_54_2(nodeName === 'input') || visit34_54_3(nodeName === 'textarea'))) {
          _$jscoverage['/ie/create.js'].lineData[57]++;
          dest.defaultValue = src.defaultValue;
          _$jscoverage['/ie/create.js'].lineData[59]++;
          dest.value = src.value;
        }
      }
    }
  }
  _$jscoverage['/ie/create.js'].lineData[65]++;
  dest.removeAttribute(Dom.__EXPANDO);
};
  _$jscoverage['/ie/create.js'].lineData[68]++;
  var creators = Dom._creators, defaultCreator = Dom._defaultCreator, R_TBODY = /<tbody/i;
  _$jscoverage['/ie/create.js'].lineData[73]++;
  if (visit35_73_1(require('ua').ieMode < 8)) {
    _$jscoverage['/ie/create.js'].lineData[76]++;
    creators.table = function(html, ownerDoc) {
  _$jscoverage['/ie/create.js'].functionData[2]++;
  _$jscoverage['/ie/create.js'].lineData[77]++;
  var frag = defaultCreator(html, ownerDoc), hasTBody = R_TBODY.test(html);
  _$jscoverage['/ie/create.js'].lineData[79]++;
  if (visit36_79_1(hasTBody)) {
    _$jscoverage['/ie/create.js'].lineData[80]++;
    return frag;
  }
  _$jscoverage['/ie/create.js'].lineData[82]++;
  var table = frag.firstChild, tableChildren = S.makeArray(table.childNodes);
  _$jscoverage['/ie/create.js'].lineData[84]++;
  S.each(tableChildren, function(c) {
  _$jscoverage['/ie/create.js'].functionData[3]++;
  _$jscoverage['/ie/create.js'].lineData[85]++;
  if (visit37_85_1(visit38_85_2(Dom.nodeName(c) === 'tbody') && !c.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[86]++;
    table.removeChild(c);
  }
});
  _$jscoverage['/ie/create.js'].lineData[89]++;
  return frag;
};
  }
});
