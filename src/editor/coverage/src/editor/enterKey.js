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
  _$jscoverage['/editor/enterKey.js'].lineData[18] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[20] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[22] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[23] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[26] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[29] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[31] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[32] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[34] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[35] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[38] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[42] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[43] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[44] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[45] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[46] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[48] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[54] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[57] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[59] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[60] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[63] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[66] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[69] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[72] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[73] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[74] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[75] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[76] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[79] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[80] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[81] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[82] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[88] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[92] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[95] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[99] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[100] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[103] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[105] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[109] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[111] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[114] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[115] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[117] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[118] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[123] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[124] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[125] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[126] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[128] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[129] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[131] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[132] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[133] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[134] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[139] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[140] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[142] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[149] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[151] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[152] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[156] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[159] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[160] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[163] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[166] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[168] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[169] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[174] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[179] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[186] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[187] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[190] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[191] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[192] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[193] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[194] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[195] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[197] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[198] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[199] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[200] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[201] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[208] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[210] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[213] = 0;
  _$jscoverage['/editor/enterKey.js'].lineData[214] = 0;
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
  _$jscoverage['/editor/enterKey.js'].branchData['22'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['34'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['38'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['39'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['39'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['39'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['42'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['59'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['72'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['74'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['79'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['79'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['79'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['79'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['88'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['92'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['93'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['99'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['105'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['109'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['114'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['117'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['124'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['125'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['128'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['131'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['139'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['149'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['149'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['149'][3] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['156'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['159'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['160'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['194'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['195'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['195'][2] = new BranchData();
  _$jscoverage['/editor/enterKey.js'].branchData['200'] = [];
  _$jscoverage['/editor/enterKey.js'].branchData['200'][1] = new BranchData();
}
_$jscoverage['/editor/enterKey.js'].branchData['200'][1].init(188, 12, 're !== false');
function visit332_200_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['195'][2].init(37, 24, 'ev.ctrlKey || ev.metaKey');
function visit331_195_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['195'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['195'][1].init(22, 39, 'ev.shiftKey || ev.ctrlKey || ev.metaKey');
function visit330_195_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['194'][1].init(57, 14, 'keyCode === 13');
function visit329_194_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['160'][1].init(18, 9, 'nextBlock');
function visit328_160_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['159'][1].init(5432, 9, '!UA[\'ie\']');
function visit327_159_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['156'][1].init(2422, 31, 'isStartOfBlock && !isEndOfBlock');
function visit326_156_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['149'][3].init(2060, 52, '!isEndOfBlock || !previousBlock[0].childNodes.length');
function visit325_149_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['149'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['149'][2].init(2040, 74, 'isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit324_149_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['149'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['149'][1].init(2028, 86, 'UA[\'ie\'] && isStartOfBlock && (!isEndOfBlock || !previousBlock[0].childNodes.length)');
function visit323_149_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['139'][1].init(1610, 9, '!UA[\'ie\']');
function visit322_139_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['131'][1].init(275, 38, 'dtd.$removeEmpty[element.nodeName()]');
function visit321_131_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['128'][1].init(90, 75, 'element.equals(elementPath.block) || element.equals(elementPath.blockLimit)');
function visit320_128_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['125'][1].init(69, 7, 'i < len');
function visit319_125_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['124'][1].init(955, 11, 'elementPath');
function visit318_124_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['117'][1].init(620, 9, '!newBlock');
function visit317_117_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['114'][1].init(544, 9, 'nextBlock');
function visit316_114_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['109'][2].init(218, 32, 'previousBlock.nodeName() == \'li\'');
function visit315_109_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['109'][1].init(218, 82, 'previousBlock.nodeName() == \'li\' || !headerTagRegex.test(previousBlock.nodeName())');
function visit314_109_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['105'][1].init(47, 13, 'previousBlock');
function visit313_105_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['99'][1].init(605, 9, 'nextBlock');
function visit312_99_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['93'][1].init(50, 109, '(node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit311_93_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['92'][2].init(227, 28, 'nextBlock.nodeName() == \'li\'');
function visit310_92_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['92'][1].init(227, 160, 'nextBlock.nodeName() == \'li\' && (node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), [\'ul\', \'ol\'])');
function visit309_92_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['88'][1].init(2185, 32, '!isStartOfBlock && !isEndOfBlock');
function visit308_88_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['79'][3].init(1760, 23, 'node.nodeName() == \'li\'');
function visit307_79_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['79'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['79'][2].init(1725, 58, '(node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit306_79_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['79'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['79'][1].init(1706, 77, 'previousBlock && (node = previousBlock.parent()) && node.nodeName() == \'li\'');
function visit305_79_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['79'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['74'][1].init(58, 23, 'node.nodeName() == \'li\'');
function visit304_74_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['72'][1].init(1453, 9, 'nextBlock');
function visit303_72_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['59'][1].init(1053, 10, '!splitInfo');
function visit302_59_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['42'][1].init(22, 28, 'editor.hasCommand(\'outdent\')');
function visit301_42_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['39'][3].init(55, 33, 'block.parent().nodeName() == \'li\'');
function visit300_39_3(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['39'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['39'][2].init(27, 24, 'block.nodeName() == \'li\'');
function visit299_39_2(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['39'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['39'][1].init(27, 61, 'block.nodeName() == \'li\' || block.parent().nodeName() == \'li\'');
function visit298_39_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['38'][1].init(139, 91, 'block && (block.nodeName() == \'li\' || block.parent().nodeName() == \'li\')');
function visit297_38_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['34'][1].init(219, 52, 'range.checkStartOfBlock() && range.checkEndOfBlock()');
function visit296_34_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].branchData['22'][1].init(205, 5, 'i > 0');
function visit295_22_1(result) {
  _$jscoverage['/editor/enterKey.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor/enterKey.js'].lineData[10]++;
KISSY.add("editor/enterKey", function(S, Editor, Walker, ElementPath) {
  _$jscoverage['/editor/enterKey.js'].functionData[0]++;
  _$jscoverage['/editor/enterKey.js'].lineData[11]++;
  var UA = S.UA, headerTagRegex = /^h[1-6]$/, dtd = Editor.XHTML_DTD, Node = S.Node, Event = S.Event;
  _$jscoverage['/editor/enterKey.js'].lineData[18]++;
  function getRange(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[1]++;
    _$jscoverage['/editor/enterKey.js'].lineData[20]++;
    var ranges = editor.getSelection().getRanges();
    _$jscoverage['/editor/enterKey.js'].lineData[22]++;
    for (var i = ranges.length - 1; visit295_22_1(i > 0); i--) {
      _$jscoverage['/editor/enterKey.js'].lineData[23]++;
      ranges[i].deleteContents();
    }
    _$jscoverage['/editor/enterKey.js'].lineData[26]++;
    return ranges[0];
  }
  _$jscoverage['/editor/enterKey.js'].lineData[29]++;
  function enterBlock(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[2]++;
    _$jscoverage['/editor/enterKey.js'].lineData[31]++;
    var range = getRange(editor);
    _$jscoverage['/editor/enterKey.js'].lineData[32]++;
    var doc = range.document;
    _$jscoverage['/editor/enterKey.js'].lineData[34]++;
    if (visit296_34_1(range.checkStartOfBlock() && range.checkEndOfBlock())) {
      _$jscoverage['/editor/enterKey.js'].lineData[35]++;
      var path = new ElementPath(range.startContainer), block = path.block;
      _$jscoverage['/editor/enterKey.js'].lineData[38]++;
      if (visit297_38_1(block && (visit298_39_1(visit299_39_2(block.nodeName() == 'li') || visit300_39_3(block.parent().nodeName() == 'li'))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[42]++;
        if (visit301_42_1(editor.hasCommand('outdent'))) {
          _$jscoverage['/editor/enterKey.js'].lineData[43]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[44]++;
          editor.execCommand('outdent');
          _$jscoverage['/editor/enterKey.js'].lineData[45]++;
          editor.execCommand("save");
          _$jscoverage['/editor/enterKey.js'].lineData[46]++;
          return true;
        } else {
          _$jscoverage['/editor/enterKey.js'].lineData[48]++;
          return false;
        }
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[54]++;
    var blockTag = "p";
    _$jscoverage['/editor/enterKey.js'].lineData[57]++;
    var splitInfo = range.splitBlock(blockTag);
    _$jscoverage['/editor/enterKey.js'].lineData[59]++;
    if (visit302_59_1(!splitInfo)) {
      _$jscoverage['/editor/enterKey.js'].lineData[60]++;
      return true;
    }
    _$jscoverage['/editor/enterKey.js'].lineData[63]++;
    var previousBlock = splitInfo.previousBlock, nextBlock = splitInfo.nextBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[66]++;
    var isStartOfBlock = splitInfo.wasStartOfBlock, isEndOfBlock = splitInfo.wasEndOfBlock;
    _$jscoverage['/editor/enterKey.js'].lineData[69]++;
    var node;
    _$jscoverage['/editor/enterKey.js'].lineData[72]++;
    if (visit303_72_1(nextBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[73]++;
      node = nextBlock.parent();
      _$jscoverage['/editor/enterKey.js'].lineData[74]++;
      if (visit304_74_1(node.nodeName() == 'li')) {
        _$jscoverage['/editor/enterKey.js'].lineData[75]++;
        nextBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[76]++;
        nextBlock._4e_move(nextBlock.next(), true);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[79]++;
      if (visit305_79_1(previousBlock && visit306_79_2((node = previousBlock.parent()) && visit307_79_3(node.nodeName() == 'li')))) {
        _$jscoverage['/editor/enterKey.js'].lineData[80]++;
        previousBlock._4e_breakParent(node);
        _$jscoverage['/editor/enterKey.js'].lineData[81]++;
        range.moveToElementEditablePosition(previousBlock.next());
        _$jscoverage['/editor/enterKey.js'].lineData[82]++;
        previousBlock._4e_move(previousBlock.prev());
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[88]++;
    if (visit308_88_1(!isStartOfBlock && !isEndOfBlock)) {
      _$jscoverage['/editor/enterKey.js'].lineData[92]++;
      if (visit309_92_1(visit310_92_2(nextBlock.nodeName() == 'li') && visit311_93_1((node = nextBlock.first(Walker.invisible(true))) && S.inArray(node.nodeName(), ['ul', 'ol'])))) {
        _$jscoverage['/editor/enterKey.js'].lineData[95]++;
        (UA['ie'] ? new Node(doc.createTextNode('\xa0')) : new Node(doc.createElement('br'))).insertBefore(node);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[99]++;
      if (visit312_99_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[100]++;
        range.moveToElementEditablePosition(nextBlock);
      }
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[103]++;
      var newBlock;
      _$jscoverage['/editor/enterKey.js'].lineData[105]++;
      if (visit313_105_1(previousBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[109]++;
        if (visit314_109_1(visit315_109_2(previousBlock.nodeName() == 'li') || !headerTagRegex.test(previousBlock.nodeName()))) {
          _$jscoverage['/editor/enterKey.js'].lineData[111]++;
          newBlock = previousBlock.clone();
        }
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[114]++;
        if (visit316_114_1(nextBlock)) {
          _$jscoverage['/editor/enterKey.js'].lineData[115]++;
          newBlock = nextBlock.clone();
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[117]++;
      if (visit317_117_1(!newBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[118]++;
        newBlock = new Node("<" + blockTag + ">", null, doc);
      }
      _$jscoverage['/editor/enterKey.js'].lineData[123]++;
      var elementPath = splitInfo.elementPath;
      _$jscoverage['/editor/enterKey.js'].lineData[124]++;
      if (visit318_124_1(elementPath)) {
        _$jscoverage['/editor/enterKey.js'].lineData[125]++;
        for (var i = 0, len = elementPath.elements.length; visit319_125_1(i < len); i++) {
          _$jscoverage['/editor/enterKey.js'].lineData[126]++;
          var element = elementPath.elements[i];
          _$jscoverage['/editor/enterKey.js'].lineData[128]++;
          if (visit320_128_1(element.equals(elementPath.block) || element.equals(elementPath.blockLimit))) {
            _$jscoverage['/editor/enterKey.js'].lineData[129]++;
            break;
          }
          _$jscoverage['/editor/enterKey.js'].lineData[131]++;
          if (visit321_131_1(dtd.$removeEmpty[element.nodeName()])) {
            _$jscoverage['/editor/enterKey.js'].lineData[132]++;
            element = element.clone();
            _$jscoverage['/editor/enterKey.js'].lineData[133]++;
            newBlock._4e_moveChildren(element);
            _$jscoverage['/editor/enterKey.js'].lineData[134]++;
            newBlock.append(element);
          }
        }
      }
      _$jscoverage['/editor/enterKey.js'].lineData[139]++;
      if (visit322_139_1(!UA['ie'])) {
        _$jscoverage['/editor/enterKey.js'].lineData[140]++;
        newBlock._4e_appendBogus();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[142]++;
      range.insertNode(newBlock);
      _$jscoverage['/editor/enterKey.js'].lineData[149]++;
      if (visit323_149_1(UA['ie'] && visit324_149_2(isStartOfBlock && (visit325_149_3(!isEndOfBlock || !previousBlock[0].childNodes.length))))) {
        _$jscoverage['/editor/enterKey.js'].lineData[151]++;
        range.moveToElementEditablePosition(isEndOfBlock ? previousBlock : newBlock);
        _$jscoverage['/editor/enterKey.js'].lineData[152]++;
        range.select();
      }
      _$jscoverage['/editor/enterKey.js'].lineData[156]++;
      range.moveToElementEditablePosition(visit326_156_1(isStartOfBlock && !isEndOfBlock) ? nextBlock : newBlock);
    }
    _$jscoverage['/editor/enterKey.js'].lineData[159]++;
    if (visit327_159_1(!UA['ie'])) {
      _$jscoverage['/editor/enterKey.js'].lineData[160]++;
      if (visit328_160_1(nextBlock)) {
        _$jscoverage['/editor/enterKey.js'].lineData[163]++;
        var tmpNode = new Node(doc.createElement('span'));
        _$jscoverage['/editor/enterKey.js'].lineData[166]++;
        tmpNode.html('&nbsp;');
        _$jscoverage['/editor/enterKey.js'].lineData[168]++;
        range.insertNode(tmpNode);
        _$jscoverage['/editor/enterKey.js'].lineData[169]++;
        tmpNode.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
        _$jscoverage['/editor/enterKey.js'].lineData[174]++;
        range.deleteContents();
      } else {
        _$jscoverage['/editor/enterKey.js'].lineData[179]++;
        newBlock.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
      }
    }
    _$jscoverage['/editor/enterKey.js'].lineData[186]++;
    range.select();
    _$jscoverage['/editor/enterKey.js'].lineData[187]++;
    return true;
  }
  _$jscoverage['/editor/enterKey.js'].lineData[190]++;
  function EnterKey(editor) {
    _$jscoverage['/editor/enterKey.js'].functionData[3]++;
    _$jscoverage['/editor/enterKey.js'].lineData[191]++;
    var doc = editor.get("document")[0];
    _$jscoverage['/editor/enterKey.js'].lineData[192]++;
    Event.on(doc, "keydown", function(ev) {
  _$jscoverage['/editor/enterKey.js'].functionData[4]++;
  _$jscoverage['/editor/enterKey.js'].lineData[193]++;
  var keyCode = ev.keyCode;
  _$jscoverage['/editor/enterKey.js'].lineData[194]++;
  if (visit329_194_1(keyCode === 13)) {
    _$jscoverage['/editor/enterKey.js'].lineData[195]++;
    if (visit330_195_1(ev.shiftKey || visit331_195_2(ev.ctrlKey || ev.metaKey))) {
    } else {
      _$jscoverage['/editor/enterKey.js'].lineData[197]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[198]++;
      var re = editor.execCommand("enterBlock");
      _$jscoverage['/editor/enterKey.js'].lineData[199]++;
      editor.execCommand("save");
      _$jscoverage['/editor/enterKey.js'].lineData[200]++;
      if (visit332_200_1(re !== false)) {
        _$jscoverage['/editor/enterKey.js'].lineData[201]++;
        ev.preventDefault();
      }
    }
  }
});
  }
  _$jscoverage['/editor/enterKey.js'].lineData[208]++;
  return {
  init: function(editor) {
  _$jscoverage['/editor/enterKey.js'].functionData[5]++;
  _$jscoverage['/editor/enterKey.js'].lineData[210]++;
  editor.addCommand("enterBlock", {
  exec: enterBlock});
  _$jscoverage['/editor/enterKey.js'].lineData[213]++;
  editor.docReady(function() {
  _$jscoverage['/editor/enterKey.js'].functionData[6]++;
  _$jscoverage['/editor/enterKey.js'].lineData[214]++;
  EnterKey(editor);
});
}};
}, {
  requires: ['./base', './walker', './elementPath', 'node']});
