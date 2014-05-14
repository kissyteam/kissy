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
  _$jscoverage['/html-parser/writer/filter.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[16] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[17] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[22] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[25] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[26] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[35] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[36] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[46] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[50] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[53] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[59] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[68] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[78] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[106] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[111] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[112] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[126] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[151] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[152] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[153] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[155] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[156] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[161] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[175] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[179] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[180] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[194] = 0;
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
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['27'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['35'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['49'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['56'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['56'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['73'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['73'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['77'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['106'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['110'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['151'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['151'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['153'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['155'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['169'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['169'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['171'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['173'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['175'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['179'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['179'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['183'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['183'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/filter.js'].branchData['183'][1].init(491, 11, '!el.tagName');
function visit401_183_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['179'][2].init(302, 10, 'ret !== el');
function visit400_179_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['179'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['179'][1].init(295, 17, 'ret && ret !== el');
function visit399_179_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['175'][1].init(93, 36, '(ret = element[filter](el)) === false');
function visit398_175_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['173'][1].init(76, 15, 'element[filter]');
function visit397_173_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['171'][1].init(76, 15, 'j < tags.length');
function visit396_171_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['169'][1].init(166, 18, 'i < filters.length');
function visit395_169_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['169'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['155'][1].init(205, 7, 't === 8');
function visit394_155_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['153'][1].init(128, 7, 't === 3');
function visit393_153_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['151'][1].init(52, 7, 't === 1');
function visit392_151_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['151'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['110'][1].init(63, 6, 'holder');
function visit391_110_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['106'][1].init(25, 14, 'priority || 10');
function visit390_106_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['77'][1].init(305, 23, 'typeof ret === \'string\'');
function visit389_77_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['73'][2].init(132, 58, '(ret = item[name].call(null, attrNode.value, el)) === false');
function visit388_73_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['73'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['73'][1].init(117, 73, 'item[name] && (ret = item[name].call(null, attrNode.value, el)) === false');
function visit387_73_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['69'][2].init(33, 14, 'i < arr.length');
function visit386_69_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['69'][1].init(26, 21, 'arr && i < arr.length');
function visit385_69_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['56'][1].init(26, 19, 'el.toHtml() === ret');
function visit384_56_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['56'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['55'][1].init(87, 23, 'typeof ret === \'string\'');
function visit383_55_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['53'][3].init(227, 10, 'ret !== el');
function visit382_53_3(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['53'][2].init(220, 17, 'ret && ret !== el');
function visit381_53_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['53'][1].init(214, 23, 'el && ret && ret !== el');
function visit380_53_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['49'][1].init(53, 39, '(ret = item.apply(null, args)) === false');
function visit379_49_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['47'][2].init(56, 14, 'i < arr.length');
function visit378_47_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1].init(49, 21, 'arr && i < arr.length');
function visit377_47_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['35'][2].init(33, 14, 'i < arr.length');
function visit376_35_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['35'][1].init(26, 21, 'arr && i < arr.length');
function visit375_35_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['27'][1].init(18, 19, 'arr[i].priority > p');
function visit374_27_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['26'][2].init(33, 14, 'i < arr.length');
function visit373_26_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1].init(26, 21, 'arr && i < arr.length');
function visit372_26_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/html-parser/writer/filter.js'].lineData[13]++;
  function Filter() {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[15]++;
    this.tagNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[16]++;
    this.attributeNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[17]++;
    this.tags = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[18]++;
    this.comment = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[19]++;
    this.text = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[20]++;
    this.cdata = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[21]++;
    this.attributes = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[22]++;
    this.root = [];
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[25]++;
  function findIndexToInsert(arr, p) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[26]++;
    for (var i = 0; visit372_26_1(arr && visit373_26_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[27]++;
      if (visit374_27_1(arr[i].priority > p)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[28]++;
        return i;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[31]++;
    return arr.length;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[34]++;
  function filterName(arr, v) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[35]++;
    for (var i = 0; visit375_35_1(arr && visit376_35_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[36]++;
      var items = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[38]++;
      util.each(items, function(item) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[39]++;
  v = v.replace(item[0], item[1]);
});
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[42]++;
    return v;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[45]++;
  function filterFn(arr, args, el) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[46]++;
    var item, i, ret;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[47]++;
    for (i = 0; visit377_47_1(arr && visit378_47_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[48]++;
      item = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[49]++;
      if (visit379_49_1((ret = item.apply(null, args)) === false)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[50]++;
        return false;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[53]++;
      if (visit380_53_1(el && visit381_53_2(ret && visit382_53_3(ret !== el)))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[55]++;
        if (visit383_55_1(typeof ret === 'string')) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[56]++;
          if (visit384_56_1(el.toHtml() === ret)) {
            _$jscoverage['/html-parser/writer/filter.js'].lineData[57]++;
            return el;
          }
          _$jscoverage['/html-parser/writer/filter.js'].lineData[59]++;
          el.nodeValue = ret;
          _$jscoverage['/html-parser/writer/filter.js'].lineData[60]++;
          ret = el;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[62]++;
        return this.onNode(ret);
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[65]++;
    return el;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[68]++;
  function filterAttr(arr, attrNode, el, _default) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[69]++;
    for (var i = 0; visit385_69_1(arr && visit386_69_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[70]++;
      var item = arr[i].value, ret, name = attrNode.name;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[73]++;
      if (visit387_73_1(item[name] && visit388_73_2((ret = item[name].call(null, attrNode.value, el)) === false))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[74]++;
        return ret;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[77]++;
      if (visit389_77_1(typeof ret === 'string')) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[78]++;
        attrNode.value = ret;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[81]++;
    return _default;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[84]++;
  Filter.prototype = {
  constructor: Filter, 
  addRules: function(rules, priority) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[106]++;
  priority = visit390_106_1(priority || 10);
  _$jscoverage['/html-parser/writer/filter.js'].lineData[107]++;
  for (var r in rules) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[109]++;
    var holder = this[r];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[110]++;
    if (visit391_110_1(holder)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[111]++;
      var index = findIndexToInsert(holder, priority);
      _$jscoverage['/html-parser/writer/filter.js'].lineData[112]++;
      holder.splice(index, 0, {
  value: rules[r], 
  priority: priority});
    }
  }
}, 
  onTagName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[126]++;
  return filterName(this.tagNames, v);
}, 
  onAttributeName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[130]++;
  return filterName(this.attributeNames, v);
}, 
  onText: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[134]++;
  return filterFn.call(this, this.text, [el.toHtml(), el], el);
}, 
  onCData: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[138]++;
  return filterFn.call(this, this.cdata, [el.toHtml(), el], el);
}, 
  onAttribute: function(attrNode, el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[12]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[142]++;
  return filterAttr(this.attributes, attrNode, el, attrNode);
}, 
  onComment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[146]++;
  return filterFn.call(this, this.comment, [el.toHtml(), el], el);
}, 
  onNode: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[150]++;
  var t = el.nodeType;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[151]++;
  if (visit392_151_1(t === 1)) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[152]++;
    return this.onTag(el);
  } else {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[153]++;
    if (visit393_153_1(t === 3)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[154]++;
      return this.onText(el);
    } else {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[155]++;
      if (visit394_155_1(t === 8)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[156]++;
        return this.onComment(el);
      }
    }
  }
}, 
  onFragment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[161]++;
  return filterFn.call(this, this.root, [el], el);
}, 
  onTag: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[166]++;
  var filters = ['^', el.tagName, '$'], tags = this.tags, ret;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[169]++;
  for (var i = 0; visit395_169_1(i < filters.length); i++) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[170]++;
    var filter = filters[i];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[171]++;
    for (var j = 0; visit396_171_1(j < tags.length); j++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[172]++;
      var element = tags[j].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[173]++;
      if (visit397_173_1(element[filter])) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[175]++;
        if (visit398_175_1((ret = element[filter](el)) === false)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[176]++;
          return false;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[179]++;
        if (visit399_179_1(ret && visit400_179_2(ret !== el))) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[180]++;
          return this.onNode(ret);
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[183]++;
        if (visit401_183_1(!el.tagName)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[184]++;
          return el;
        }
      }
    }
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[189]++;
  return el;
}};
  _$jscoverage['/html-parser/writer/filter.js'].lineData[194]++;
  return Filter;
});
