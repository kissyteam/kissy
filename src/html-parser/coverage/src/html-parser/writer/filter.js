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
  _$jscoverage['/html-parser/writer/filter.js'].lineData[5] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[10] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[12] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[13] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[14] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[15] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[18] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[19] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[20] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[21] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[24] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[27] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[29] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[30] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[31] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[34] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[37] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[38] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[39] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[40] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[41] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[42] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[49] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[52] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[60] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[66] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[69] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[70] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[73] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[76] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[99] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[102] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[123] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[135] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[143] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[144] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[147] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[148] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[154] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[162] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[164] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[165] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[166] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[168] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[169] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[172] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[173] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[176] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[177] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[182] = 0;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[187] = 0;
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
  _$jscoverage['/html-parser/writer/filter.js'].branchData['19'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['19'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['20'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['20'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['28'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['28'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['39'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['41'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][3] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['48'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['61'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['65'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['65'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['99'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['103'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['144'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['146'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['148'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['162'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['164'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['166'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['168'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['168'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/html-parser/writer/filter.js'].branchData['176'] = [];
  _$jscoverage['/html-parser/writer/filter.js'].branchData['176'][1] = new BranchData();
}
_$jscoverage['/html-parser/writer/filter.js'].branchData['176'][1].init(490, 11, '!el.tagName');
function visit391_176_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['172'][2].init(302, 9, 'ret != el');
function visit390_172_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['172'][1].init(295, 16, 'ret && ret != el');
function visit389_172_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['168'][1].init(93, 36, '(ret = element[filter](el)) === false');
function visit388_168_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['168'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['166'][1].init(76, 15, 'element[filter]');
function visit387_166_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['164'][1].init(76, 15, 'j < tags.length');
function visit386_164_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['162'][1].init(166, 18, 'i < filters.length');
function visit385_162_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['148'][1].init(205, 7, 't === 8');
function visit384_148_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['146'][1].init(128, 7, 't === 3');
function visit383_146_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['144'][1].init(52, 7, 't === 1');
function visit382_144_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['103'][1].init(63, 6, 'holder');
function visit381_103_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['99'][1].init(25, 14, 'priority || 10');
function visit380_99_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['69'][1].init(305, 22, 'typeof ret == \'string\'');
function visit379_69_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['69'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['65'][2].init(132, 58, '(ret = item[name].call(null, attrNode.value, el)) === false');
function visit378_65_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['65'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['65'][1].init(117, 73, 'item[name] && (ret = item[name].call(null, attrNode.value, el)) === false');
function visit377_65_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['61'][2].init(33, 14, 'i < arr.length');
function visit376_61_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['61'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['61'][1].init(26, 21, 'arr && i < arr.length');
function visit375_61_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['48'][1].init(26, 18, 'el.toHtml() == ret');
function visit374_48_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1].init(87, 22, 'typeof ret == \'string\'');
function visit373_47_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['45'][3].init(227, 9, 'ret != el');
function visit372_45_3(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][3].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['45'][2].init(220, 16, 'ret && ret != el');
function visit371_45_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['45'][1].init(214, 22, 'el && ret && ret != el');
function visit370_45_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['41'][1].init(53, 39, '(ret = item.apply(null, args)) === false');
function visit369_41_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['39'][2].init(56, 14, 'i < arr.length');
function visit368_39_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['39'][1].init(49, 21, 'arr && i < arr.length');
function visit367_39_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['28'][2].init(33, 14, 'i < arr.length');
function visit366_28_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['28'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['28'][1].init(26, 21, 'arr && i < arr.length');
function visit365_28_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['20'][1].init(18, 19, 'arr[i].priority > p');
function visit364_20_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['20'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['19'][2].init(33, 14, 'i < arr.length');
function visit363_19_2(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['19'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].branchData['19'][1].init(26, 21, 'arr && i < arr.length');
function visit362_19_1(result) {
  _$jscoverage['/html-parser/writer/filter.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/writer/filter.js'].lineData[5]++;
KISSY.add("html-parser/writer/filter", function(S) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[0]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[6]++;
  function Filter() {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[1]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[8]++;
    this.tagNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[9]++;
    this.attributeNames = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[10]++;
    this.tags = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[11]++;
    this.comment = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[12]++;
    this.text = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[13]++;
    this.cdata = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[14]++;
    this.attributes = [];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[15]++;
    this.root = [];
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[18]++;
  function findIndexToInsert(arr, p) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[2]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[19]++;
    for (var i = 0; visit362_19_1(arr && visit363_19_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[20]++;
      if (visit364_20_1(arr[i].priority > p)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[21]++;
        return i;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[24]++;
    return arr.length;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[27]++;
  function filterName(arr, v) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[3]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[28]++;
    for (var i = 0; visit365_28_1(arr && visit366_28_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[29]++;
      var items = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[30]++;
      S.each(items, function(item) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[4]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[31]++;
  v = v.replace(item[0], item[1]);
});
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[34]++;
    return v;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[37]++;
  function filterFn(arr, args, el) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[5]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[38]++;
    var item, i, ret;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[39]++;
    for (i = 0; visit367_39_1(arr && visit368_39_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[40]++;
      item = arr[i].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[41]++;
      if (visit369_41_1((ret = item.apply(null, args)) === false)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[42]++;
        return false;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[45]++;
      if (visit370_45_1(el && visit371_45_2(ret && visit372_45_3(ret != el)))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[47]++;
        if (visit373_47_1(typeof ret == 'string')) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[48]++;
          if (visit374_48_1(el.toHtml() == ret)) {
            _$jscoverage['/html-parser/writer/filter.js'].lineData[49]++;
            return el;
          }
          _$jscoverage['/html-parser/writer/filter.js'].lineData[51]++;
          el.nodeValue = ret;
          _$jscoverage['/html-parser/writer/filter.js'].lineData[52]++;
          ret = el;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[54]++;
        return this.onNode(ret);
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[57]++;
    return el;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[60]++;
  function filterAttr(arr, attrNode, el, _default) {
    _$jscoverage['/html-parser/writer/filter.js'].functionData[6]++;
    _$jscoverage['/html-parser/writer/filter.js'].lineData[61]++;
    for (var i = 0; visit375_61_1(arr && visit376_61_2(i < arr.length)); i++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[62]++;
      var item = arr[i].value, ret, name = attrNode.name;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[65]++;
      if (visit377_65_1(item[name] && visit378_65_2((ret = item[name].call(null, attrNode.value, el)) === false))) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[66]++;
        return ret;
      }
      _$jscoverage['/html-parser/writer/filter.js'].lineData[69]++;
      if (visit379_69_1(typeof ret == 'string')) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[70]++;
        attrNode.value = ret;
      }
    }
    _$jscoverage['/html-parser/writer/filter.js'].lineData[73]++;
    return _default;
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[76]++;
  Filter.prototype = {
  constructor: Filter, 
  addRules: function(rules, priority) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[7]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[99]++;
  priority = visit380_99_1(priority || 10);
  _$jscoverage['/html-parser/writer/filter.js'].lineData[100]++;
  for (var r in rules) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[102]++;
    var holder = this[r];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[103]++;
    if (visit381_103_1(holder)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[104]++;
      var index = findIndexToInsert(holder, priority);
      _$jscoverage['/html-parser/writer/filter.js'].lineData[105]++;
      holder.splice(index, 0, {
  value: rules[r], 
  priority: priority});
    }
  }
}, 
  onTagName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[8]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[119]++;
  return filterName(this.tagNames, v);
}, 
  onAttributeName: function(v) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[9]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[123]++;
  return filterName(this.attributeNames, v);
}, 
  onText: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[10]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[127]++;
  return filterFn.call(this, this.text, [el.toHtml(), el], el);
}, 
  onCData: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[11]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[131]++;
  return filterFn.call(this, this.cdata, [el.toHtml(), el], el);
}, 
  onAttribute: function(attrNode, el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[12]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[135]++;
  return filterAttr(this.attributes, attrNode, el, attrNode);
}, 
  onComment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[13]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[139]++;
  return filterFn.call(this, this.comment, [el.toHtml(), el], el);
}, 
  onNode: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[14]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[143]++;
  var t = el.nodeType;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[144]++;
  if (visit382_144_1(t === 1)) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[145]++;
    return this.onTag(el);
  } else {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[146]++;
    if (visit383_146_1(t === 3)) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[147]++;
      return this.onText(el);
    } else {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[148]++;
      if (visit384_148_1(t === 8)) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[149]++;
        return this.onComment(el);
      }
    }
  }
}, 
  onFragment: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[15]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[154]++;
  return filterFn.call(this, this.root, [el], el);
}, 
  onTag: function(el) {
  _$jscoverage['/html-parser/writer/filter.js'].functionData[16]++;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[159]++;
  var filters = ["^", el.tagName, "$"], tags = this.tags, ret;
  _$jscoverage['/html-parser/writer/filter.js'].lineData[162]++;
  for (var i = 0; visit385_162_1(i < filters.length); i++) {
    _$jscoverage['/html-parser/writer/filter.js'].lineData[163]++;
    var filter = filters[i];
    _$jscoverage['/html-parser/writer/filter.js'].lineData[164]++;
    for (var j = 0; visit386_164_1(j < tags.length); j++) {
      _$jscoverage['/html-parser/writer/filter.js'].lineData[165]++;
      var element = tags[j].value;
      _$jscoverage['/html-parser/writer/filter.js'].lineData[166]++;
      if (visit387_166_1(element[filter])) {
        _$jscoverage['/html-parser/writer/filter.js'].lineData[168]++;
        if (visit388_168_1((ret = element[filter](el)) === false)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[169]++;
          return false;
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[172]++;
        if (visit389_172_1(ret && visit390_172_2(ret != el))) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[173]++;
          return this.onNode(ret);
        }
        _$jscoverage['/html-parser/writer/filter.js'].lineData[176]++;
        if (visit391_176_1(!el.tagName)) {
          _$jscoverage['/html-parser/writer/filter.js'].lineData[177]++;
          return el;
        }
      }
    }
  }
  _$jscoverage['/html-parser/writer/filter.js'].lineData[182]++;
  return el;
}};
  _$jscoverage['/html-parser/writer/filter.js'].lineData[187]++;
  return Filter;
});
