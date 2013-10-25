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
if (! _$jscoverage['/editor/enterKey.js']) {
  _$jscoverage['/editor/enterKey.js'] = {};
  _$jscoverage['/editor/enterKey.js'].lineData = [];
  _$jscoverage['/editor/enterKey.js'].lineData[10] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[11] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[17] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[19] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[21] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[22] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[25] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[28] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[30] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[31] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[33] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[34] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[37] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[41] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[42] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[43] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[45] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[47] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[53] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[56] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[58] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[59] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[62] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[65] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[68] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[71] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[72] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[73] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[75] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[78] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[79] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[80] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[81] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[87] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[91] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[94] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[98] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[99] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[102] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[104] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[108] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[110] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[113] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[114] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[116] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[117] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[122] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[123] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[124] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[125] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[127] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[128] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[130] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[131] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[132] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[133] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[138] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[139] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[141] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[148] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[150] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[151] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[155] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[158] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[159] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[162] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[165] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[167] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[168] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[173] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[178] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[185] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[186] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[189] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[190] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[191] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[192] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[193] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[194] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[196] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[198] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[199] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[200] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[207] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[209] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[212] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[213] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].functionData) {
  _$jscoverage['/editor/enterKey.js'].functionData = [];
  _$jscoverage['/editor/enterKey.js'].functionData[0] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[1] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[2] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[3] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[4] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[5] = 0;
  _$jscoverage['/editor/enterKey.js'].functionData[6] = 0;
}
if (! _$jscoverage['/editor/enterKey.js'].branchData) {
  _$jscoverage['/editor/enterKey.js'].branchData = {};
  _$jscoverage['/editor/enterKey.js'].branchData['21'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['21'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['33'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['37'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['38'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['38'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['38'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['41'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['58'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['71'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['73'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['78'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['78'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['78'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['78'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['87'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['91'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['91'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['92'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['98'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['104'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['108'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['108'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['113'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['116'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['123'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['124'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['127'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['127'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['130'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['138'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['148'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['148'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['155'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['158'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['159'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['193'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['194'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['194'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['199'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['199'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['199'][1].init(188, 12, 're !== false');
function visit332_199_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['194'][2].init(37, 24, 'ev.ctrlKey || ev.metaKey');
function visit331_194_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['194'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['194'][1].init(22, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit330_194_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['193'][1].init(57, 14, 'keyCode === 13');
function visit329_193_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['159'][1].init(18, 9, 'nextBlock');
function visit328_159_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['158'][1].init(5432, 9, '!UA[\'ie\']');
function visit327_158_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['155'][1].init(2422, 31, 'isStartOfBlock && !isEndOfBlock');
function visit326_155_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['148'][3].init(2060, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit325_148_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['148'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['148'][2].init(2040, 74, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit324_148_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['148'][1].init(2028, 86, 'UA[\'ie\'] && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit323_148_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['138'][1].init(1610, 9, '!UA[\'ie\']');
function visit322_138_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['130'][1].init(275, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit321_130_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['127'][1].init(90, 75, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit320_127_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['127'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['124'][1].init(69, 7, 'i < len');
function visit319_124_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['123'][1].init(955, 11, 'elementPath');
function visit318_123_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['116'][1].init(620, 9, '!newBlock');
function visit317_116_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['113'][1].init(544, 9, 'nextBlock');
function visit316_113_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['108'][2].init(218, 32, 'previousBlock.nodeName() == \'li\'');
function visit315_108_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['108'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['108'][1].init(218, 82, 'previousBlock.nodeName() == \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit314_108_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['104'][1].init(47, 13, 'previousBlock');
function visit313_104_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['98'][1].init(605, 9, 'nextBlock');
function visit312_98_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['92'][1].init(50, 109, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit311_92_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['91'][2].init(227, 28, 'nextBlock.nodeName() == \'li\'');
function visit310_91_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['91'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['91'][1].init(227, 160, 'nextBlock.nodeName() == \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit309_91_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['87'][1].init(2185, 32, '!isStartOfBlock && !isEndOfBlock');
function visit308_87_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['78'][3].init(1760, 23, 'node.nodeName() == \'li\'');
function visit307_78_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['78'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['78'][2].init(1725, 58, '(node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit306_78_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['78'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['78'][1].init(1706, 77, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit305_78_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['78'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['73'][1].init(58, 23, 'node.nodeName() == \'li\'');
function visit304_73_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['71'][1].init(1453, 9, 'nextBlock');
function visit303_71_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['58'][1].init(1053, 10, '!splitInfo');
function visit302_58_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['41'][1].init(22, 28, 'editor.hasCommand(\'outdent\')');
function visit301_41_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['38'][3].init(55, 33, 'block.parent().nodeName() == \'li\'');
function visit300_38_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['38'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['38'][2].init(27, 24, 'block.nodeName() == \'li\'');
function visit299_38_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['38'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['38'][1].init(27, 61, 'block.nodeName() == \'li\' || block.parent().nodeName() == \'li\'');
function visit298_38_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['37'][1].init(139, 91, 'block && (block.nodeName() == \'li\' || block.parent().nodeName() == \'li\')');
function visit297_37_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['33'][1].init(219, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit296_33_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['21'][1].init(205, 5, 'i > 0');
function visit295_21_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['21'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[10]++;
KISSY.add("editor/enterKey", function(S, Editor, Walker, ElementPath, Event) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[11]++;
  var UA = S.UA, headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD, Node = S.Node;
  _$jscoverage['/editor/enterKey.js'].lineData[17]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[19]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[21]++;
    for (var i = ranges.length - 1; visit295_21_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[22]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[25]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[28]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[30]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[31]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[33]++;
    if (visit296_33_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[34]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[37]++;
      if (visit297_37_1(block && (visit298_38_1(visit299_38_2(block.nodeName() == 'li') || visit300_38_3(block.parent().nodeName() == 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[41]++;
        if (visit301_41_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[42]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[43]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[44]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[45]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[47]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[53]++;
    var blockTag = "p";
    _$jscoverage['/editor/enterKey.js'].lineData[56]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[58]++;
    if (visit302_58_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[59]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[62]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[65]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[68]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[71]++;
    if (visit303_71_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[72]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[73]++;
      if (visit304_73_1(node.nodeName() == 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[74]++;
        nextBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[75]++;
        nextBlock._4e_move(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[78]++;
      if (visit305_78_1(previousBlock && visit306_78_2((node = previousBlock.parent()) && visit307_78_3(node.nodeName() == 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[79]++;
        previousBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[80]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[81]++;
        previousBlock._4e_move(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[87]++;
    if (visit308_87_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[91]++;
      if (visit309_91_1(visit310_91_2(nextBlock.nodeName() == 'li') && visit311_92_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[94]++;
        (UA['ie'] ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[98]++;
      if (visit312_98_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[99]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[102]++;
      var newBlock;
      _$jscoverage['/editor/enterKey.js'].lineData[104]++;
      if (visit313_104_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[108]++;
        if (visit314_108_1(visit315_108_2(previousBlock.nodeName() == 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[110]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[113]++;
        if (visit316_113_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[114]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[116]++;
      if (visit317_116_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[117]++;
        newBlock = new Node("<" + blockTag + ">", null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[122]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[123]++;
      if (visit318_123_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[124]++;
        for (var i = 0, len = elementPath.elements.length; visit319_124_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[125]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[127]++;
          if (visit320_127_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[128]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[130]++;
          if (visit321_130_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[131]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[132]++;
            newBlock._4e_moveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[133]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[138]++;
      if (visit322_138_1(!UA['ie'])) {
        _$jscoverage['/editor/enterKey.js'].lineData[139]++;
        newBlock._4e_appendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[141]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[148]++;
      if (visit323_148_1(UA['ie'] && visit324_148_2(isStartOfBlock && (visit325_148_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[150]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[151]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[155]++;
      range.moveToElementEditablePosition(visit326_155_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[158]++;
    if (visit327_158_1(!UA['ie'])) {
      _$jscoverage['/editor/enterKey.js'].lineData[159]++;
      if (visit328_159_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[162]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[165]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[167]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[168]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[173]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[178]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[185]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[186]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[189]++;
  function EnterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[190]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/enterKey.js'].lineData[191]++;
    Event.on(doc, "keydown", function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[192]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[193]++;
  if (visit329_193_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[194]++;
    if (visit330_194_1(ev.shiftKey || visit331_194_2(ev.ctrlKey || ev.metaKey))) {
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[196]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[197]++;
      var re = editor.execCommand("enterBlock");
      _$jscoverage['/editor/enterKey.js'].lineData[198]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[199]++;
      if (visit332_199_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[200]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[207]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[209]++;
  editor.addCommand("enterBlock", {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[212]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[213]++;
  EnterKey(editor);
});
}};
}, {
  requires: ['./base', './walker', './elementPath', 'node', 'event']});
