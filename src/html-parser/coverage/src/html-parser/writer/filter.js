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
if (! _$jscoverage['/html-parser/writer/filter.js']) {
  _$jscoverage['/html-parser/writer/filter.js'] = {};
  _$jscoverage['/html-parser/writer/filter.js'].lineData = [];
  _$jscoverage['/html-parser/writer/filter.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[33] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[43] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[58] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[63] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[67] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[71] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[72] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[79] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[82] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[124] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[132] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[140] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[167] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[178] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[192] = 0;
}
if (! _$jscoverage['/html-parser/writer/filter.js'].functionData) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData = [];
  _$jscoverage['/html-parser/writer/filter.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[9] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[10] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[11] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[12] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[13] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[14] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[15] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].functionData[16] = 0;
}
if (! _$jscoverage['/html-parser/writer/filter.js'].branchData) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData = {};
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['54'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['67'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['67'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['71'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['71'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['75'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['104'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['108'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['149'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['151'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['153'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['167'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['169'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['171'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['173'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['177'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['177'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['177'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['181'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['181'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/filter.js'].branchData['181'][1].init(490, 11, '!el.tagName');
function visit399_181_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['177'][2].init(302, 9, 'ret != el');
function visit398_177_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['177'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['177'][1].init(295, 16, 'ret && ret != el');
function visit397_177_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['177'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['173'][1].init(93, 36, '(ret = element[filter](el)) === false');
function visit396_173_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['171'][1].init(76, 15, 'element[filter]');
function visit395_171_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['169'][1].init(76, 15, 'j < tags.length');
function visit394_169_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['167'][1].init(166, 18, 'i < filters.length');
function visit393_167_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['153'][1].init(205, 7, 't === 8');
function visit392_153_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['151'][1].init(128, 7, 't === 3');
function visit391_151_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['149'][1].init(52, 7, 't === 1');
function visit390_149_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['108'][1].init(63, 6, 'holder');
function visit389_108_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['104'][1].init(25, 14, 'priority || 10');
function visit388_104_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['75'][1].init(305, 22, 'typeof ret == \'string\'');
function visit387_75_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['71'][2].init(132, 58, '(ret = item[name].call(null, attrNode.value, el)) === false');
function visit386_71_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['71'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['71'][1].init(117, 73, 'item[name] && (ret = item[name].call(null, attrNode.value, el)) === false');
function visit385_71_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['67'][2].init(33, 14, 'i < arr.length');
function visit384_67_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['67'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['67'][1].init(26, 21, 'arr && i < arr.length');
function visit383_67_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['54'][1].init(26, 18, 'el.toHtml() == ret');
function visit382_54_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['53'][1].init(87, 22, 'typeof ret == \'string\'');
function visit381_53_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['51'][3].init(227, 9, 'ret != el');
function visit380_51_3(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['51'][2].init(220, 16, 'ret && ret != el');
function visit379_51_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['51'][1].init(214, 22, 'el && ret && ret != el');
function visit378_51_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1].init(53, 39, '(ret = item.apply(null, args)) === false');
function visit377_47_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['45'][2].init(56, 14, 'i < arr.length');
function visit376_45_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['45'][1].init(49, 21, 'arr && i < arr.length');
function visit375_45_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['34'][2].init(33, 14, 'i < arr.length');
function visit374_34_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['34'][1].init(26, 21, 'arr && i < arr.length');
function visit373_34_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1].init(18, 19, 'arr[i].priority > p');
function visit372_26_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['25'][2].init(33, 14, 'i < arr.length');
function visit371_25_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['25'][1].init(26, 21, 'arr && i < arr.length');
function visit370_25_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].lineData[6]++;
KISSY.add("html-parser/writer/filter", function(S) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[12]++;
  function Filter() {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[14]++;
    this.tagNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[15]++;
    this.attributeNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[16]++;
    this.tags = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[17]++;
    this.comment = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[18]++;
    this.text = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[19]++;
    this.cdata = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[20]++;
    this.attributes = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[21]++;
    this.root = [];
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[24]++;
  function findIndexToInsert(arr, p) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[25]++;
    for (var i = 0; visit370_25_1(arr && visit371_25_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[26]++;
      if (visit372_26_1(arr[i].priority > p)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[27]++;
        return i;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[30]++;
    return arr.length;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[33]++;
  function filterName(arr, v) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[34]++;
    for (var i = 0; visit373_34_1(arr && visit374_34_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[35]++;
      var items = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[36]++;
      S.each(items, function(item) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[37]++;
  v = v.replace(item[0], item[1]);
});
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[40]++;
    return v;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[43]++;
  function filterFn(arr, args, el) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[44]++;
    var item, i, ret;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[45]++;
    for (i = 0; visit375_45_1(arr && visit376_45_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[46]++;
      item = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[47]++;
      if (visit377_47_1((ret = item.apply(null, args)) === false)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[48]++;
        return false;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[51]++;
      if (visit378_51_1(el && visit379_51_2(ret && visit380_51_3(ret != el)))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[53]++;
        if (visit381_53_1(typeof ret == 'string')) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[54]++;
          if (visit382_54_1(el.toHtml() == ret)) {
            _$jscoverage['/html-parser/writer/filter.js'].lineData[55]++;
            return el;
          }
          _$jscoverage['/html-parser/writer/filter.js'].lineData[57]++;
          el.nodeValue = ret;
          _$jscoverage['/html-parser/writer/filter.js'].lineData[58]++;
          ret = el;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[60]++;
        return this.onNode(ret);
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[63]++;
    return el;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[66]++;
  function filterAttr(arr, attrNode, el, _default) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[67]++;
    for (var i = 0; visit383_67_1(arr && visit384_67_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[68]++;
      var item = arr[i].value, ret, name = attrNode.name;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[71]++;
      if (visit385_71_1(item[name] && visit386_71_2((ret = item[name].call(null, attrNode.value, el)) === false))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[72]++;
        return ret;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[75]++;
      if (visit387_75_1(typeof ret == 'string')) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[76]++;
        attrNode.value = ret;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[79]++;
    return _default;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[82]++;
  Filter.prototype = {
  constructor: Filter, 
  addRules: function(rules, priority) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[104]++;
  priority = visit388_104_1(priority || 10);
  _$jscoverage['/html-parser/writer/filter.js'].lineData[105]++;
  for (var r in rules) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[107]++;
    var holder = this[r];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[108]++;
    if (visit389_108_1(holder)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[109]++;
      var index = findIndexToInsert(holder, priority);
      _$jscoverage['/html-parser/writer/filter.js'].lineData[110]++;
      holder.splice(index, 0, {
  value: rules[r], 
  priority: priority});
    }
  }
}, 
  onTagName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[124]++;
  return filterName(this.tagNames, v);
}, 
  onAttributeName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[128]++;
  return filterName(this.attributeNames, v);
}, 
  onText: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[132]++;
  return filterFn.call(this, this.text, [el.toHtml(), el], el);
}, 
  onCData: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[136]++;
  return filterFn.call(this, this.cdata, [el.toHtml(), el], el);
}, 
  onAttribute: function(attrNode, el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[12]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[140]++;
  return filterAttr(this.attributes, attrNode, el, attrNode);
}, 
  onComment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[144]++;
  return filterFn.call(this, this.comment, [el.toHtml(), el], el);
}, 
  onNode: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[148]++;
  var t = el.nodeType;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[149]++;
  if (visit390_149_1(t === 1)) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[150]++;
    return this.onTag(el);
  } else {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[151]++;
    if (visit391_151_1(t === 3)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[152]++;
      return this.onText(el);
    } else {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[153]++;
      if (visit392_153_1(t === 8)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[154]++;
        return this.onComment(el);
      }
    }
  }
}, 
  onFragment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[159]++;
  return filterFn.call(this, this.root, [el], el);
}, 
  onTag: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[164]++;
  var filters = ["^", el.tagName, "$"], tags = this.tags, ret;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[167]++;
  for (var i = 0; visit393_167_1(i < filters.length); i++) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[168]++;
    var filter = filters[i];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[169]++;
    for (var j = 0; visit394_169_1(j < tags.length); j++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[170]++;
      var element = tags[j].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[171]++;
      if (visit395_171_1(element[filter])) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[173]++;
        if (visit396_173_1((ret = element[filter](el)) === false)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[174]++;
          return false;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[177]++;
        if (visit397_177_1(ret && visit398_177_2(ret != el))) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[178]++;
          return this.onNode(ret);
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[181]++;
        if (visit399_181_1(!el.tagName)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[182]++;
          return el;
        }
      }
    }
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[187]++;
  return el;
}};
  _$jscoverage['/html-parser/writer/filter.js'].lineData[192]++;
  return Filter;
});
