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
  _$jscoverage['/ie/create.js'].lineData[5] = 0;
  _$jscoverage['/ie/create.js'].lineData[8] = 0;
  _$jscoverage['/ie/create.js'].lineData[12] = 0;
  _$jscoverage['/ie/create.js'].lineData[13] = 0;
  _$jscoverage['/ie/create.js'].lineData[18] = 0;
  _$jscoverage['/ie/create.js'].lineData[19] = 0;
  _$jscoverage['/ie/create.js'].lineData[22] = 0;
  _$jscoverage['/ie/create.js'].lineData[28] = 0;
  _$jscoverage['/ie/create.js'].lineData[29] = 0;
  _$jscoverage['/ie/create.js'].lineData[30] = 0;
  _$jscoverage['/ie/create.js'].lineData[33] = 0;
  _$jscoverage['/ie/create.js'].lineData[37] = 0;
  _$jscoverage['/ie/create.js'].lineData[38] = 0;
  _$jscoverage['/ie/create.js'].lineData[43] = 0;
  _$jscoverage['/ie/create.js'].lineData[44] = 0;
  _$jscoverage['/ie/create.js'].lineData[49] = 0;
  _$jscoverage['/ie/create.js'].lineData[50] = 0;
  _$jscoverage['/ie/create.js'].lineData[53] = 0;
  _$jscoverage['/ie/create.js'].lineData[54] = 0;
  _$jscoverage['/ie/create.js'].lineData[56] = 0;
  _$jscoverage['/ie/create.js'].lineData[62] = 0;
  _$jscoverage['/ie/create.js'].lineData[65] = 0;
  _$jscoverage['/ie/create.js'].lineData[70] = 0;
  _$jscoverage['/ie/create.js'].lineData[73] = 0;
  _$jscoverage['/ie/create.js'].lineData[74] = 0;
  _$jscoverage['/ie/create.js'].lineData[76] = 0;
  _$jscoverage['/ie/create.js'].lineData[77] = 0;
  _$jscoverage['/ie/create.js'].lineData[79] = 0;
  _$jscoverage['/ie/create.js'].lineData[81] = 0;
  _$jscoverage['/ie/create.js'].lineData[82] = 0;
  _$jscoverage['/ie/create.js'].lineData[83] = 0;
  _$jscoverage['/ie/create.js'].lineData[86] = 0;
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
  _$jscoverage['/ie/create.js'].branchData['28'] = [];
  _$jscoverage['/ie/create.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['29'] = [];
  _$jscoverage['/ie/create.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['33'] = [];
  _$jscoverage['/ie/create.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['33'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['33'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['33'][4] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['33'][5] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['37'] = [];
  _$jscoverage['/ie/create.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['43'] = [];
  _$jscoverage['/ie/create.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['49'] = [];
  _$jscoverage['/ie/create.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['53'] = [];
  _$jscoverage['/ie/create.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['70'] = [];
  _$jscoverage['/ie/create.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['76'] = [];
  _$jscoverage['/ie/create.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['82'] = [];
  _$jscoverage['/ie/create.js'].branchData['82'][1] = new BranchData();
  _$jscoverage['/ie/create.js'].branchData['82'][2] = new BranchData();
}
_$jscoverage['/ie/create.js'].branchData['82'][2].init(22, 26, 'Dom.nodeName(c) == \'tbody\'');
function visit37_82_2(result) {
  _$jscoverage['/ie/create.js'].branchData['82'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['82'][1].init(22, 50, 'Dom.nodeName(c) == \'tbody\' && !c.childNodes.length');
function visit36_82_1(result) {
  _$jscoverage['/ie/create.js'].branchData['82'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['76'][1].init(122, 8, 'hasTBody');
function visit35_76_1(result) {
  _$jscoverage['/ie/create.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['70'][1].init(2797, 11, 'S.UA.ie < 8');
function visit34_70_1(result) {
  _$jscoverage['/ie/create.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['53'][3].init(2106, 23, 'nodeName === \'textarea\'');
function visit33_53_3(result) {
  _$jscoverage['/ie/create.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['53'][2].init(2082, 20, 'nodeName === \'input\'');
function visit32_53_2(result) {
  _$jscoverage['/ie/create.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['53'][1].init(2082, 47, 'nodeName === \'input\' || nodeName === \'textarea\'');
function visit31_53_1(result) {
  _$jscoverage['/ie/create.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['49'][1].init(1856, 21, 'nodeName === \'option\'');
function visit30_49_1(result) {
  _$jscoverage['/ie/create.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['43'][1].init(522, 24, 'dest.value !== src.value');
function visit29_43_1(result) {
  _$jscoverage['/ie/create.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['37'][1].init(254, 11, 'src.checked');
function visit28_37_1(result) {
  _$jscoverage['/ie/create.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['33'][5].init(1078, 20, 'src.type === \'radio\'');
function visit27_33_5(result) {
  _$jscoverage['/ie/create.js'].branchData['33'][5].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['33'][4].init(1051, 23, 'src.type === \'checkbox\'');
function visit26_33_4(result) {
  _$jscoverage['/ie/create.js'].branchData['33'][4].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['33'][3].init(1051, 47, 'src.type === \'checkbox\' || src.type === \'radio\'');
function visit25_33_3(result) {
  _$jscoverage['/ie/create.js'].branchData['33'][3].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['33'][2].init(1026, 20, 'nodeName === \'input\'');
function visit24_33_2(result) {
  _$jscoverage['/ie/create.js'].branchData['33'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['33'][1].init(1026, 73, 'nodeName === \'input\' && (src.type === \'checkbox\' || src.type === \'radio\')');
function visit23_33_1(result) {
  _$jscoverage['/ie/create.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['29'][1].init(30, 22, 'i < srcChildren.length');
function visit22_29_1(result) {
  _$jscoverage['/ie/create.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['28'][2].init(763, 21, 'nodeName === \'object\'');
function visit21_28_2(result) {
  _$jscoverage['/ie/create.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['28'][1].init(763, 48, 'nodeName === \'object\' && !dest.childNodes.length');
function visit20_28_1(result) {
  _$jscoverage['/ie/create.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['18'][1].init(362, 20, 'dest.mergeAttributes');
function visit19_18_1(result) {
  _$jscoverage['/ie/create.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].branchData['12'][1].init(161, 20, 'dest.clearAttributes');
function visit18_12_1(result) {
  _$jscoverage['/ie/create.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/ie/create.js'].lineData[5]++;
KISSY.add('dom/ie/create', function(S, Dom) {
  _$jscoverage['/ie/create.js'].functionData[0]++;
  _$jscoverage['/ie/create.js'].lineData[8]++;
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
  _$jscoverage['/ie/create.js'].lineData[28]++;
  if (visit20_28_1(visit21_28_2(nodeName === 'object') && !dest.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[29]++;
    for (var i = 0; visit22_29_1(i < srcChildren.length); i++) {
      _$jscoverage['/ie/create.js'].lineData[30]++;
      dest.appendChild(srcChildren[i].cloneNode(true));
    }
  } else {
    _$jscoverage['/ie/create.js'].lineData[33]++;
    if (visit23_33_1(visit24_33_2(nodeName === 'input') && (visit25_33_3(visit26_33_4(src.type === 'checkbox') || visit27_33_5(src.type === 'radio'))))) {
      _$jscoverage['/ie/create.js'].lineData[37]++;
      if (visit28_37_1(src.checked)) {
        _$jscoverage['/ie/create.js'].lineData[38]++;
        dest['defaultChecked'] = dest.checked = src.checked;
      }
      _$jscoverage['/ie/create.js'].lineData[43]++;
      if (visit29_43_1(dest.value !== src.value)) {
        _$jscoverage['/ie/create.js'].lineData[44]++;
        dest.value = src.value;
      }
    } else {
      _$jscoverage['/ie/create.js'].lineData[49]++;
      if (visit30_49_1(nodeName === 'option')) {
        _$jscoverage['/ie/create.js'].lineData[50]++;
        dest.selected = src.defaultSelected;
      } else {
        _$jscoverage['/ie/create.js'].lineData[53]++;
        if (visit31_53_1(visit32_53_2(nodeName === 'input') || visit33_53_3(nodeName === 'textarea'))) {
          _$jscoverage['/ie/create.js'].lineData[54]++;
          dest.defaultValue = src.defaultValue;
          _$jscoverage['/ie/create.js'].lineData[56]++;
          dest.value = src.value;
        }
      }
    }
  }
  _$jscoverage['/ie/create.js'].lineData[62]++;
  dest.removeAttribute(Dom.__EXPANDO);
};
  _$jscoverage['/ie/create.js'].lineData[65]++;
  var creators = Dom._creators, defaultCreator = Dom._defaultCreator, R_TBODY = /<tbody/i;
  _$jscoverage['/ie/create.js'].lineData[70]++;
  if (visit34_70_1(S.UA.ie < 8)) {
    _$jscoverage['/ie/create.js'].lineData[73]++;
    creators.table = function(html, ownerDoc) {
  _$jscoverage['/ie/create.js'].functionData[2]++;
  _$jscoverage['/ie/create.js'].lineData[74]++;
  var frag = defaultCreator(html, ownerDoc), hasTBody = R_TBODY.test(html);
  _$jscoverage['/ie/create.js'].lineData[76]++;
  if (visit35_76_1(hasTBody)) {
    _$jscoverage['/ie/create.js'].lineData[77]++;
    return frag;
  }
  _$jscoverage['/ie/create.js'].lineData[79]++;
  var table = frag.firstChild, tableChildren = S.makeArray(table.childNodes);
  _$jscoverage['/ie/create.js'].lineData[81]++;
  S.each(tableChildren, function(c) {
  _$jscoverage['/ie/create.js'].functionData[3]++;
  _$jscoverage['/ie/create.js'].lineData[82]++;
  if (visit36_82_1(visit37_82_2(Dom.nodeName(c) == 'tbody') && !c.childNodes.length)) {
    _$jscoverage['/ie/create.js'].lineData[83]++;
    table.removeChild(c);
  }
});
  _$jscoverage['/ie/create.js'].lineData[86]++;
  return frag;
};
  }
}, {
  requires: ['dom/base']});
