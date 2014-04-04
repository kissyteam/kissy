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
if (! _$jscoverage['/menubutton/select.js']) {
  _$jscoverage['/menubutton/select.js'] = {};
  _$jscoverage['/menubutton/select.js'].lineData = [];
  _$jscoverage['/menubutton/select.js'].lineData[6] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[7] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[8] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[10] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[11] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[16] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[17] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[18] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[19] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[22] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[29] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[30] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[31] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[32] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[33] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[34] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[37] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[38] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[42] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[45] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[46] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[49] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[50] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[51] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[57] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[58] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[61] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[62] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[63] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[64] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[67] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[68] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[73] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[74] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[78] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[86] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[87] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[89] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[90] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[92] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[93] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[94] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[109] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[111] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[112] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[120] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[121] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[122] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[132] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[133] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[134] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[135] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[140] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[141] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[142] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[146] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[178] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[179] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[180] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[182] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[189] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[190] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[196] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[197] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[202] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[205] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[211] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[213] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[215] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[216] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[221] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[222] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[226] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[227] = 0;
  _$jscoverage['/menubutton/select.js'].lineData[233] = 0;
}
if (! _$jscoverage['/menubutton/select.js'].functionData) {
  _$jscoverage['/menubutton/select.js'].functionData = [];
  _$jscoverage['/menubutton/select.js'].functionData[0] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[1] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[2] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[3] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[4] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[5] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[6] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[7] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[8] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[9] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[10] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[11] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[12] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[13] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[14] = 0;
  _$jscoverage['/menubutton/select.js'].functionData[15] = 0;
}
if (! _$jscoverage['/menubutton/select.js'].branchData) {
  _$jscoverage['/menubutton/select.js'].branchData = {};
  _$jscoverage['/menubutton/select.js'].branchData['12'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['12'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['12'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['12'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['16'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['18'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['31'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['32'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['33'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['34'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['37'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['38'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['48'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['48'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['50'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['51'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['61'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['62'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['63'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['63'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['67'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['75'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['76'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['76'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['76'][3] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['89'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['93'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['134'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['134'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['179'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['196'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/menubutton/select.js'].branchData['222'] = [];
  _$jscoverage['/menubutton/select.js'].branchData['222'][1] = new BranchData();
}
_$jscoverage['/menubutton/select.js'].branchData['222'][1].init(35, 14, 'e.newVal || \'\'');
function visit64_222_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['196'][1].init(268, 25, 'curValue === option.val()');
function visit63_196_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['179'][1].init(65, 9, 'cfg || {}');
function visit62_179_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['134'][1].init(98, 36, 'c.get(\'value\') === self.get(\'value\')');
function visit61_134_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['134'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['93'][1].init(153, 21, 'newValue !== oldValue');
function visit60_93_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['89'][1].init(69, 17, 'target.isMenuItem');
function visit59_89_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][2].init(35, 37, 'content || self.get(\'defaultCaption\')');
function visit58_78_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['78'][1].init(301, 52, 'textContent || content || self.get(\'defaultCaption\')');
function visit57_78_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['76'][3].init(173, 31, 'item.get && item.get(\'content\')');
function visit56_76_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['76'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['76'][2].init(157, 47, 'item.content || item.get && item.get(\'content\')');
function visit55_76_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['76'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['76'][1].init(148, 57, 'item && (item.content || item.get && item.get(\'content\'))');
function visit54_76_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['75'][3].init(88, 35, 'item.get && item.get(\'textContent\')');
function visit53_75_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['75'][2].init(68, 55, 'item.textContent || item.get && item.get(\'textContent\')');
function visit52_75_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['75'][1].init(59, 65, 'item && (item.textContent || item.get && item.get(\'textContent\'))');
function visit51_75_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['67'][1].init(179, 12, 'selectedItem');
function visit50_67_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['63'][1].init(73, 4, 'item');
function visit49_63_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['63'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['62'][1].init(24, 31, 'selectedItem || m.getChildAt(0)');
function visit48_62_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['61'][1].init(122, 14, 'e.target === m');
function visit47_61_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['51'][1].init(35, 25, 'getItemValue(c) === value');
function visit46_51_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['50'][1].init(17, 10, 'c && c.set');
function visit45_50_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['48'][2].init(92, 32, 'menu.get && menu.get(\'children\')');
function visit44_48_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['48'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['48'][1].init(84, 40, 'menu && menu.get && menu.get(\'children\')');
function visit43_48_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['38'][1].init(25, 26, 'c.textContent || c.content');
function visit42_38_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['37'][1].init(22, 26, '(v = c.value) === undefined');
function visit41_37_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['34'][1].init(25, 40, 'c.get(\'textContent\') || c.get(\'content\')');
function visit40_34_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['33'][1].init(22, 33, '(v = c.get(\'value\')) === undefined');
function visit39_33_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['32'][1].init(17, 5, 'c.get');
function visit38_32_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['31'][1].init(28, 1, 'c');
function visit37_31_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['18'][1].init(40, 25, 'getItemValue(c) === value');
function visit36_18_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['16'][1].init(201, 13, 'i < cs.length');
function visit35_16_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['12'][3].init(62, 32, 'menu.get && menu.get(\'children\')');
function visit34_12_3(result) {
  _$jscoverage['/menubutton/select.js'].branchData['12'][3].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['12'][2].init(62, 38, 'menu.get && menu.get(\'children\') || []');
function visit33_12_2(result) {
  _$jscoverage['/menubutton/select.js'].branchData['12'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].branchData['12'][1].init(45, 55, 'menu.children || menu.get && menu.get(\'children\') || []');
function visit32_12_1(result) {
  _$jscoverage['/menubutton/select.js'].branchData['12'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/select.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menubutton/select.js'].functionData[0]++;
  _$jscoverage['/menubutton/select.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/menubutton/select.js'].lineData[8]++;
  var MenuButton = require('./control');
  _$jscoverage['/menubutton/select.js'].lineData[10]++;
  function getSelectedItem(self) {
    _$jscoverage['/menubutton/select.js'].functionData[1]++;
    _$jscoverage['/menubutton/select.js'].lineData[11]++;
    var menu = self.get('menu'), cs = visit32_12_1(menu.children || visit33_12_2(visit34_12_3(menu.get && menu.get('children')) || [])), value = self.get('value'), c, i;
    _$jscoverage['/menubutton/select.js'].lineData[16]++;
    for (i = 0; visit35_16_1(i < cs.length); i++) {
      _$jscoverage['/menubutton/select.js'].lineData[17]++;
      c = cs[i];
      _$jscoverage['/menubutton/select.js'].lineData[18]++;
      if (visit36_18_1(getItemValue(c) === value)) {
        _$jscoverage['/menubutton/select.js'].lineData[19]++;
        return c;
      }
    }
    _$jscoverage['/menubutton/select.js'].lineData[22]++;
    return null;
  }
  _$jscoverage['/menubutton/select.js'].lineData[29]++;
  function getItemValue(c) {
    _$jscoverage['/menubutton/select.js'].functionData[2]++;
    _$jscoverage['/menubutton/select.js'].lineData[30]++;
    var v;
    _$jscoverage['/menubutton/select.js'].lineData[31]++;
    if (visit37_31_1(c)) {
      _$jscoverage['/menubutton/select.js'].lineData[32]++;
      if (visit38_32_1(c.get)) {
        _$jscoverage['/menubutton/select.js'].lineData[33]++;
        if (visit39_33_1((v = c.get('value')) === undefined)) {
          _$jscoverage['/menubutton/select.js'].lineData[34]++;
          v = visit40_34_1(c.get('textContent') || c.get('content'));
        }
      } else {
        _$jscoverage['/menubutton/select.js'].lineData[37]++;
        if (visit41_37_1((v = c.value) === undefined)) {
          _$jscoverage['/menubutton/select.js'].lineData[38]++;
          v = visit42_38_1(c.textContent || c.content);
        }
      }
    }
    _$jscoverage['/menubutton/select.js'].lineData[42]++;
    return v;
  }
  _$jscoverage['/menubutton/select.js'].lineData[45]++;
  function deSelectAllExcept(self) {
    _$jscoverage['/menubutton/select.js'].functionData[3]++;
    _$jscoverage['/menubutton/select.js'].lineData[46]++;
    var menu = self.get('menu'), value = self.get('value'), cs = visit43_48_1(menu && visit44_48_2(menu.get && menu.get('children')));
    _$jscoverage['/menubutton/select.js'].lineData[49]++;
    S.each(cs, function(c) {
  _$jscoverage['/menubutton/select.js'].functionData[4]++;
  _$jscoverage['/menubutton/select.js'].lineData[50]++;
  if (visit45_50_1(c && c.set)) {
    _$jscoverage['/menubutton/select.js'].lineData[51]++;
    c.set('selected', visit46_51_1(getItemValue(c) === value));
  }
});
  }
  _$jscoverage['/menubutton/select.js'].lineData[57]++;
  function _handleMenuShow(e) {
    _$jscoverage['/menubutton/select.js'].functionData[5]++;
    _$jscoverage['/menubutton/select.js'].lineData[58]++;
    var self = this, selectedItem = getSelectedItem(self), m = self.get('menu');
    _$jscoverage['/menubutton/select.js'].lineData[61]++;
    if (visit47_61_1(e.target === m)) {
      _$jscoverage['/menubutton/select.js'].lineData[62]++;
      var item = visit48_62_1(selectedItem || m.getChildAt(0));
      _$jscoverage['/menubutton/select.js'].lineData[63]++;
      if (visit49_63_1(item)) {
        _$jscoverage['/menubutton/select.js'].lineData[64]++;
        item.set('highlighted', true);
      }
      _$jscoverage['/menubutton/select.js'].lineData[67]++;
      if (visit50_67_1(selectedItem)) {
        _$jscoverage['/menubutton/select.js'].lineData[68]++;
        selectedItem.set('selected', true);
      }
    }
  }
  _$jscoverage['/menubutton/select.js'].lineData[73]++;
  function _updateCaption(self) {
    _$jscoverage['/menubutton/select.js'].functionData[6]++;
    _$jscoverage['/menubutton/select.js'].lineData[74]++;
    var item = getSelectedItem(self), textContent = visit51_75_1(item && (visit52_75_2(item.textContent || visit53_75_3(item.get && item.get('textContent'))))), content = visit54_76_1(item && (visit55_76_2(item.content || visit56_76_3(item.get && item.get('content')))));
    _$jscoverage['/menubutton/select.js'].lineData[78]++;
    self.set('content', visit57_78_1(textContent || visit58_78_2(content || self.get('defaultCaption'))));
  }
  _$jscoverage['/menubutton/select.js'].lineData[86]++;
  function handleMenuClick(e) {
    _$jscoverage['/menubutton/select.js'].functionData[7]++;
    _$jscoverage['/menubutton/select.js'].lineData[87]++;
    var self = this, target = e.target;
    _$jscoverage['/menubutton/select.js'].lineData[89]++;
    if (visit59_89_1(target.isMenuItem)) {
      _$jscoverage['/menubutton/select.js'].lineData[90]++;
      var newValue = getItemValue(target), oldValue = self.get('value');
      _$jscoverage['/menubutton/select.js'].lineData[92]++;
      self.set('value', newValue);
      _$jscoverage['/menubutton/select.js'].lineData[93]++;
      if (visit60_93_1(newValue !== oldValue)) {
        _$jscoverage['/menubutton/select.js'].lineData[94]++;
        self.fire('change', {
  prevVal: oldValue, 
  newVal: newValue});
      }
    }
  }
  _$jscoverage['/menubutton/select.js'].lineData[109]++;
  var Select = MenuButton.extend({
  bindUI: function() {
  _$jscoverage['/menubutton/select.js'].functionData[8]++;
  _$jscoverage['/menubutton/select.js'].lineData[111]++;
  this.on('click', handleMenuClick, this);
  _$jscoverage['/menubutton/select.js'].lineData[112]++;
  this.on('show', _handleMenuShow, this);
}, 
  removeItems: function() {
  _$jscoverage['/menubutton/select.js'].functionData[9]++;
  _$jscoverage['/menubutton/select.js'].lineData[120]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[121]++;
  self.callSuper.apply(self, arguments);
  _$jscoverage['/menubutton/select.js'].lineData[122]++;
  self.set('value', null);
}, 
  removeItem: function(c, destroy) {
  _$jscoverage['/menubutton/select.js'].functionData[10]++;
  _$jscoverage['/menubutton/select.js'].lineData[132]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[133]++;
  self.callSuper(c, destroy);
  _$jscoverage['/menubutton/select.js'].lineData[134]++;
  if (visit61_134_1(c.get('value') === self.get('value'))) {
    _$jscoverage['/menubutton/select.js'].lineData[135]++;
    self.set('value', null);
  }
}, 
  _onSetValue: function() {
  _$jscoverage['/menubutton/select.js'].functionData[11]++;
  _$jscoverage['/menubutton/select.js'].lineData[140]++;
  var self = this;
  _$jscoverage['/menubutton/select.js'].lineData[141]++;
  deSelectAllExcept(self);
  _$jscoverage['/menubutton/select.js'].lineData[142]++;
  _updateCaption(self);
}, 
  _onSetDefaultCaption: function() {
  _$jscoverage['/menubutton/select.js'].functionData[12]++;
  _$jscoverage['/menubutton/select.js'].lineData[146]++;
  _updateCaption(this);
}}, {
  ATTRS: {
  value: {}, 
  defaultCaption: {
  value: ''}, 
  collapseOnClick: {
  value: true}}, 
  decorate: function(element, cfg) {
  _$jscoverage['/menubutton/select.js'].functionData[13]++;
  _$jscoverage['/menubutton/select.js'].lineData[178]++;
  element = S.one(element);
  _$jscoverage['/menubutton/select.js'].lineData[179]++;
  cfg = visit62_179_1(cfg || {});
  _$jscoverage['/menubutton/select.js'].lineData[180]++;
  cfg.elBefore = element;
  _$jscoverage['/menubutton/select.js'].lineData[182]++;
  var name, allItems = [], select, selectedItem = null, curValue = element.val(), options = element.all('option');
  _$jscoverage['/menubutton/select.js'].lineData[189]++;
  options.each(function(option) {
  _$jscoverage['/menubutton/select.js'].functionData[14]++;
  _$jscoverage['/menubutton/select.js'].lineData[190]++;
  var item = {
  xclass: 'option', 
  content: option.text(), 
  elCls: option.attr('class'), 
  value: option.val()};
  _$jscoverage['/menubutton/select.js'].lineData[196]++;
  if (visit63_196_1(curValue === option.val())) {
    _$jscoverage['/menubutton/select.js'].lineData[197]++;
    selectedItem = {
  content: item.content, 
  value: item.value};
  }
  _$jscoverage['/menubutton/select.js'].lineData[202]++;
  allItems.push(item);
});
  _$jscoverage['/menubutton/select.js'].lineData[205]++;
  S.mix(cfg, {
  menu: S.mix({
  children: allItems}, cfg.menuCfg)});
  _$jscoverage['/menubutton/select.js'].lineData[211]++;
  delete cfg.menuCfg;
  _$jscoverage['/menubutton/select.js'].lineData[213]++;
  select = new Select(S.mix(cfg, selectedItem)).render();
  _$jscoverage['/menubutton/select.js'].lineData[215]++;
  if ((name = element.attr('name'))) {
    _$jscoverage['/menubutton/select.js'].lineData[216]++;
    var input = new Node('<input' + ' type="hidden"' + ' name="' + name + '" value="' + curValue + '">').insertBefore(element, undefined);
    _$jscoverage['/menubutton/select.js'].lineData[221]++;
    select.on('afterValueChange', function(e) {
  _$jscoverage['/menubutton/select.js'].functionData[15]++;
  _$jscoverage['/menubutton/select.js'].lineData[222]++;
  input.val(visit64_222_1(e.newVal || ''));
});
  }
  _$jscoverage['/menubutton/select.js'].lineData[226]++;
  element.remove();
  _$jscoverage['/menubutton/select.js'].lineData[227]++;
  return select;
}, 
  xclass: 'select'});
  _$jscoverage['/menubutton/select.js'].lineData[233]++;
  return Select;
});
