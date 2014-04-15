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
if (! _$jscoverage['/container.js']) {
  _$jscoverage['/container.js'] = {};
  _$jscoverage['/container.js'].lineData = [];
  _$jscoverage['/container.js'].lineData[6] = 0;
  _$jscoverage['/container.js'].lineData[7] = 0;
  _$jscoverage['/container.js'].lineData[8] = 0;
  _$jscoverage['/container.js'].lineData[10] = 0;
  _$jscoverage['/container.js'].lineData[11] = 0;
  _$jscoverage['/container.js'].lineData[12] = 0;
  _$jscoverage['/container.js'].lineData[16] = 0;
  _$jscoverage['/container.js'].lineData[19] = 0;
  _$jscoverage['/container.js'].lineData[21] = 0;
  _$jscoverage['/container.js'].lineData[23] = 0;
  _$jscoverage['/container.js'].lineData[25] = 0;
  _$jscoverage['/container.js'].lineData[26] = 0;
  _$jscoverage['/container.js'].lineData[28] = 0;
  _$jscoverage['/container.js'].lineData[34] = 0;
  _$jscoverage['/container.js'].lineData[35] = 0;
  _$jscoverage['/container.js'].lineData[36] = 0;
  _$jscoverage['/container.js'].lineData[43] = 0;
  _$jscoverage['/container.js'].lineData[44] = 0;
  _$jscoverage['/container.js'].lineData[47] = 0;
  _$jscoverage['/container.js'].lineData[49] = 0;
  _$jscoverage['/container.js'].lineData[51] = 0;
  _$jscoverage['/container.js'].lineData[52] = 0;
  _$jscoverage['/container.js'].lineData[55] = 0;
  _$jscoverage['/container.js'].lineData[56] = 0;
  _$jscoverage['/container.js'].lineData[57] = 0;
  _$jscoverage['/container.js'].lineData[62] = 0;
  _$jscoverage['/container.js'].lineData[73] = 0;
  _$jscoverage['/container.js'].lineData[77] = 0;
  _$jscoverage['/container.js'].lineData[81] = 0;
  _$jscoverage['/container.js'].lineData[87] = 0;
  _$jscoverage['/container.js'].lineData[93] = 0;
  _$jscoverage['/container.js'].lineData[98] = 0;
  _$jscoverage['/container.js'].lineData[105] = 0;
  _$jscoverage['/container.js'].lineData[106] = 0;
  _$jscoverage['/container.js'].lineData[109] = 0;
  _$jscoverage['/container.js'].lineData[110] = 0;
  _$jscoverage['/container.js'].lineData[115] = 0;
  _$jscoverage['/container.js'].lineData[119] = 0;
  _$jscoverage['/container.js'].lineData[123] = 0;
  _$jscoverage['/container.js'].lineData[127] = 0;
  _$jscoverage['/container.js'].lineData[130] = 0;
  _$jscoverage['/container.js'].lineData[131] = 0;
  _$jscoverage['/container.js'].lineData[136] = 0;
  _$jscoverage['/container.js'].lineData[139] = 0;
  _$jscoverage['/container.js'].lineData[140] = 0;
  _$jscoverage['/container.js'].lineData[157] = 0;
  _$jscoverage['/container.js'].lineData[159] = 0;
  _$jscoverage['/container.js'].lineData[160] = 0;
  _$jscoverage['/container.js'].lineData[162] = 0;
  _$jscoverage['/container.js'].lineData[166] = 0;
  _$jscoverage['/container.js'].lineData[170] = 0;
  _$jscoverage['/container.js'].lineData[173] = 0;
  _$jscoverage['/container.js'].lineData[175] = 0;
  _$jscoverage['/container.js'].lineData[182] = 0;
  _$jscoverage['/container.js'].lineData[189] = 0;
  _$jscoverage['/container.js'].lineData[190] = 0;
  _$jscoverage['/container.js'].lineData[191] = 0;
  _$jscoverage['/container.js'].lineData[192] = 0;
  _$jscoverage['/container.js'].lineData[193] = 0;
  _$jscoverage['/container.js'].lineData[194] = 0;
  _$jscoverage['/container.js'].lineData[195] = 0;
  _$jscoverage['/container.js'].lineData[196] = 0;
  _$jscoverage['/container.js'].lineData[199] = 0;
  _$jscoverage['/container.js'].lineData[200] = 0;
  _$jscoverage['/container.js'].lineData[202] = 0;
  _$jscoverage['/container.js'].lineData[204] = 0;
  _$jscoverage['/container.js'].lineData[206] = 0;
  _$jscoverage['/container.js'].lineData[211] = 0;
  _$jscoverage['/container.js'].lineData[227] = 0;
  _$jscoverage['/container.js'].lineData[228] = 0;
  _$jscoverage['/container.js'].lineData[230] = 0;
  _$jscoverage['/container.js'].lineData[245] = 0;
  _$jscoverage['/container.js'].lineData[248] = 0;
  _$jscoverage['/container.js'].lineData[249] = 0;
  _$jscoverage['/container.js'].lineData[251] = 0;
  _$jscoverage['/container.js'].lineData[260] = 0;
  _$jscoverage['/container.js'].lineData[261] = 0;
  _$jscoverage['/container.js'].lineData[266] = 0;
  _$jscoverage['/container.js'].lineData[274] = 0;
  _$jscoverage['/container.js'].lineData[276] = 0;
  _$jscoverage['/container.js'].lineData[277] = 0;
  _$jscoverage['/container.js'].lineData[278] = 0;
  _$jscoverage['/container.js'].lineData[294] = 0;
  _$jscoverage['/container.js'].lineData[298] = 0;
  _$jscoverage['/container.js'].lineData[299] = 0;
  _$jscoverage['/container.js'].lineData[300] = 0;
  _$jscoverage['/container.js'].lineData[301] = 0;
  _$jscoverage['/container.js'].lineData[302] = 0;
  _$jscoverage['/container.js'].lineData[303] = 0;
  _$jscoverage['/container.js'].lineData[306] = 0;
  _$jscoverage['/container.js'].lineData[309] = 0;
  _$jscoverage['/container.js'].lineData[312] = 0;
  _$jscoverage['/container.js'].lineData[313] = 0;
  _$jscoverage['/container.js'].lineData[314] = 0;
  _$jscoverage['/container.js'].lineData[315] = 0;
}
if (! _$jscoverage['/container.js'].functionData) {
  _$jscoverage['/container.js'].functionData = [];
  _$jscoverage['/container.js'].functionData[0] = 0;
  _$jscoverage['/container.js'].functionData[1] = 0;
  _$jscoverage['/container.js'].functionData[2] = 0;
  _$jscoverage['/container.js'].functionData[3] = 0;
  _$jscoverage['/container.js'].functionData[4] = 0;
  _$jscoverage['/container.js'].functionData[5] = 0;
  _$jscoverage['/container.js'].functionData[6] = 0;
  _$jscoverage['/container.js'].functionData[7] = 0;
  _$jscoverage['/container.js'].functionData[8] = 0;
  _$jscoverage['/container.js'].functionData[9] = 0;
  _$jscoverage['/container.js'].functionData[10] = 0;
  _$jscoverage['/container.js'].functionData[11] = 0;
  _$jscoverage['/container.js'].functionData[12] = 0;
  _$jscoverage['/container.js'].functionData[13] = 0;
  _$jscoverage['/container.js'].functionData[14] = 0;
  _$jscoverage['/container.js'].functionData[15] = 0;
  _$jscoverage['/container.js'].functionData[16] = 0;
  _$jscoverage['/container.js'].functionData[17] = 0;
  _$jscoverage['/container.js'].functionData[18] = 0;
  _$jscoverage['/container.js'].functionData[19] = 0;
}
if (! _$jscoverage['/container.js'].branchData) {
  _$jscoverage['/container.js'].branchData = {};
  _$jscoverage['/container.js'].branchData['25'] = [];
  _$jscoverage['/container.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['43'] = [];
  _$jscoverage['/container.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['49'] = [];
  _$jscoverage['/container.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['51'] = [];
  _$jscoverage['/container.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['55'] = [];
  _$jscoverage['/container.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['93'] = [];
  _$jscoverage['/container.js'].branchData['93'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['106'] = [];
  _$jscoverage['/container.js'].branchData['106'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['107'] = [];
  _$jscoverage['/container.js'].branchData['107'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['109'] = [];
  _$jscoverage['/container.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['130'] = [];
  _$jscoverage['/container.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['139'] = [];
  _$jscoverage['/container.js'].branchData['139'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['159'] = [];
  _$jscoverage['/container.js'].branchData['159'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['192'] = [];
  _$jscoverage['/container.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['193'] = [];
  _$jscoverage['/container.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['195'] = [];
  _$jscoverage['/container.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['199'] = [];
  _$jscoverage['/container.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['227'] = [];
  _$jscoverage['/container.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['248'] = [];
  _$jscoverage['/container.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['261'] = [];
  _$jscoverage['/container.js'].branchData['261'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['276'] = [];
  _$jscoverage['/container.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['277'] = [];
  _$jscoverage['/container.js'].branchData['277'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['298'] = [];
  _$jscoverage['/container.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['300'] = [];
  _$jscoverage['/container.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['301'] = [];
  _$jscoverage['/container.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['312'] = [];
  _$jscoverage['/container.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['314'] = [];
  _$jscoverage['/container.js'].branchData['314'][1] = new BranchData();
}
_$jscoverage['/container.js'].branchData['314'][1].init(65, 11, 'c.isControl');
function visit26_314_1(result) {
  _$jscoverage['/container.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['312'][1].init(115, 12, 'i < v.length');
function visit25_312_1(result) {
  _$jscoverage['/container.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['301'][1].init(48, 46, 'defaultChildCfg || self.get(\'defaultChildCfg\')');
function visit24_301_1(result) {
  _$jscoverage['/container.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['300'][1].init(65, 12, '!c.isControl');
function visit23_300_1(result) {
  _$jscoverage['/container.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['298'][1].init(177, 12, 'i < v.length');
function visit22_298_1(result) {
  _$jscoverage['/container.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['277'][1].init(22, 19, 'children[i].destroy');
function visit21_277_1(result) {
  _$jscoverage['/container.js'].branchData['277'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['276'][1].init(96, 19, 'i < children.length');
function visit20_276_1(result) {
  _$jscoverage['/container.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['261'][1].init(71, 23, 'children[index] || null');
function visit19_261_1(result) {
  _$jscoverage['/container.js'].branchData['261'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['248'][1].init(130, 12, 'i < t.length');
function visit18_248_1(result) {
  _$jscoverage['/container.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['227'][1].init(18, 21, 'destroy === undefined');
function visit17_227_1(result) {
  _$jscoverage['/container.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['199'][1].init(22, 8, 'elBefore');
function visit16_199_1(result) {
  _$jscoverage['/container.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['195'][1].init(51, 31, 'cEl.parentNode !== domContentEl');
function visit15_195_1(result) {
  _$jscoverage['/container.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['193'][1].init(430, 17, 'c.get(\'rendered\')');
function visit14_193_1(result) {
  _$jscoverage['/container.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['192'][1].init(370, 41, 'domContentEl.children[childIndex] || null');
function visit13_192_1(result) {
  _$jscoverage['/container.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['159'][1].init(98, 19, 'index === undefined');
function visit12_159_1(result) {
  _$jscoverage['/container.js'].branchData['159'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['139'][1].init(126, 19, 'i < children.length');
function visit11_139_1(result) {
  _$jscoverage['/container.js'].branchData['139'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['130'][1].init(126, 19, 'i < children.length');
function visit10_130_1(result) {
  _$jscoverage['/container.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['109'][1].init(221, 7, 'ChildUI');
function visit9_109_1(result) {
  _$jscoverage['/container.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['107'][1].init(72, 93, 'defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)');
function visit8_107_1(result) {
  _$jscoverage['/container.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['106'][1].init(32, 166, 'self.getComponentConstructorByNode(prefixCls, c) || defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)');
function visit7_106_1(result) {
  _$jscoverage['/container.js'].branchData['106'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['93'][1].init(606, 38, 'defaultChildCfg.prefixCls || prefixCls');
function visit6_93_1(result) {
  _$jscoverage['/container.js'].branchData['93'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['55'][1].init(18, 24, 'c.get && (cDOMEl = c.el)');
function visit5_55_1(result) {
  _$jscoverage['/container.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['51'][1].init(50, 9, 'c.destroy');
function visit4_51_1(result) {
  _$jscoverage['/container.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['49'][1].init(354, 7, 'destroy');
function visit3_49_1(result) {
  _$jscoverage['/container.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['43'][1].init(230, 12, 'index !== -1');
function visit2_43_1(result) {
  _$jscoverage['/container.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['25'][1].init(329, 20, 'self.get(\'rendered\')');
function visit1_25_1(result) {
  _$jscoverage['/container.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/container.js'].functionData[0]++;
  _$jscoverage['/container.js'].lineData[7]++;
  var Control = require('component/control');
  _$jscoverage['/container.js'].lineData[8]++;
  var Manager = require('component/manager');
  _$jscoverage['/container.js'].lineData[10]++;
  function defAddChild(e) {
    _$jscoverage['/container.js'].functionData[1]++;
    _$jscoverage['/container.js'].lineData[11]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[12]++;
    var c = e.component, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[16]++;
    children.splice(index, 0, c);
    _$jscoverage['/container.js'].lineData[19]++;
    children = self.get('children');
    _$jscoverage['/container.js'].lineData[21]++;
    c = children[index];
    _$jscoverage['/container.js'].lineData[23]++;
    c.setInternal('parent', self);
    _$jscoverage['/container.js'].lineData[25]++;
    if (visit1_25_1(self.get('rendered'))) {
      _$jscoverage['/container.js'].lineData[26]++;
      self.renderChild(index);
    }
    _$jscoverage['/container.js'].lineData[28]++;
    self.fire('afterAddChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[34]++;
  function defRemoveChild(e) {
    _$jscoverage['/container.js'].functionData[2]++;
    _$jscoverage['/container.js'].lineData[35]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[36]++;
    var c = e.component, cDOMParentEl, cDOMEl, destroy = e.destroy, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[43]++;
    if (visit2_43_1(index !== -1)) {
      _$jscoverage['/container.js'].lineData[44]++;
      children.splice(index, 1);
    }
    _$jscoverage['/container.js'].lineData[47]++;
    c.setInternal('parent', null);
    _$jscoverage['/container.js'].lineData[49]++;
    if (visit3_49_1(destroy)) {
      _$jscoverage['/container.js'].lineData[51]++;
      if (visit4_51_1(c.destroy)) {
        _$jscoverage['/container.js'].lineData[52]++;
        c.destroy();
      }
    } else {
      _$jscoverage['/container.js'].lineData[55]++;
      if (visit5_55_1(c.get && (cDOMEl = c.el))) {
        _$jscoverage['/container.js'].lineData[56]++;
        if ((cDOMParentEl = cDOMEl.parentNode)) {
          _$jscoverage['/container.js'].lineData[57]++;
          cDOMParentEl.removeChild(cDOMEl);
        }
      }
    }
    _$jscoverage['/container.js'].lineData[62]++;
    self.fire('afterRemoveChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[73]++;
  return Control.extend({
  isContainer: true, 
  initializer: function() {
  _$jscoverage['/container.js'].functionData[3]++;
  _$jscoverage['/container.js'].lineData[77]++;
  var self = this, prefixCls = self.get('prefixCls'), defaultChildCfg = self.get('defaultChildCfg');
  _$jscoverage['/container.js'].lineData[81]++;
  self.publish('beforeAddChild', {
  defaultFn: defAddChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[87]++;
  self.publish('beforeRemoveChild', {
  defaultFn: defRemoveChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[93]++;
  defaultChildCfg.prefixCls = visit6_93_1(defaultChildCfg.prefixCls || prefixCls);
}, 
  decorateDom: function() {
  _$jscoverage['/container.js'].functionData[4]++;
  _$jscoverage['/container.js'].lineData[98]++;
  var self = this, childrenContainerEl = self.getChildrenContainerEl(), defaultChildCfg = self.get('defaultChildCfg'), prefixCls = defaultChildCfg.prefixCls, defaultChildXClass = defaultChildCfg.xclass, childrenComponents = [], children = childrenContainerEl.children();
  _$jscoverage['/container.js'].lineData[105]++;
  children.each(function(c) {
  _$jscoverage['/container.js'].functionData[5]++;
  _$jscoverage['/container.js'].lineData[106]++;
  var ChildUI = visit7_106_1(self.getComponentConstructorByNode(prefixCls, c) || visit8_107_1(defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)));
  _$jscoverage['/container.js'].lineData[109]++;
  if (visit9_109_1(ChildUI)) {
    _$jscoverage['/container.js'].lineData[110]++;
    childrenComponents.push(new ChildUI(S.merge(defaultChildCfg, {
  srcNode: c})));
  }
});
  _$jscoverage['/container.js'].lineData[115]++;
  self.set('children', childrenComponents);
}, 
  createDom: function() {
  _$jscoverage['/container.js'].functionData[6]++;
  _$jscoverage['/container.js'].lineData[119]++;
  this.createChildren();
}, 
  renderUI: function() {
  _$jscoverage['/container.js'].functionData[7]++;
  _$jscoverage['/container.js'].lineData[123]++;
  this.renderChildren();
}, 
  renderChildren: function() {
  _$jscoverage['/container.js'].functionData[8]++;
  _$jscoverage['/container.js'].lineData[127]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[130]++;
  for (i = 0; visit10_130_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[131]++;
    self.renderChild(i);
  }
}, 
  createChildren: function() {
  _$jscoverage['/container.js'].functionData[9]++;
  _$jscoverage['/container.js'].lineData[136]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[139]++;
  for (i = 0; visit11_139_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[140]++;
    self.createChild(i);
  }
}, 
  addChild: function(c, index) {
  _$jscoverage['/container.js'].functionData[10]++;
  _$jscoverage['/container.js'].lineData[157]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[159]++;
  if (visit12_159_1(index === undefined)) {
    _$jscoverage['/container.js'].lineData[160]++;
    index = children.length;
  }
  _$jscoverage['/container.js'].lineData[162]++;
  self.fire('beforeAddChild', {
  component: c, 
  index: index});
  _$jscoverage['/container.js'].lineData[166]++;
  return children[index];
}, 
  renderChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[11]++;
  _$jscoverage['/container.js'].lineData[170]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[173]++;
  self.createChild(childIndex).render();
  _$jscoverage['/container.js'].lineData[175]++;
  self.fire('afterRenderChild', {
  component: children[childIndex], 
  index: childIndex});
}, 
  createChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[12]++;
  _$jscoverage['/container.js'].lineData[182]++;
  var self = this, c, elBefore, domContentEl, children = self.get('children'), cEl, contentEl;
  _$jscoverage['/container.js'].lineData[189]++;
  c = children[childIndex];
  _$jscoverage['/container.js'].lineData[190]++;
  contentEl = self.getChildrenContainerEl();
  _$jscoverage['/container.js'].lineData[191]++;
  domContentEl = contentEl[0];
  _$jscoverage['/container.js'].lineData[192]++;
  elBefore = visit13_192_1(domContentEl.children[childIndex] || null);
  _$jscoverage['/container.js'].lineData[193]++;
  if (visit14_193_1(c.get('rendered'))) {
    _$jscoverage['/container.js'].lineData[194]++;
    cEl = c.el;
    _$jscoverage['/container.js'].lineData[195]++;
    if (visit15_195_1(cEl.parentNode !== domContentEl)) {
      _$jscoverage['/container.js'].lineData[196]++;
      domContentEl.insertBefore(cEl, elBefore);
    }
  } else {
    _$jscoverage['/container.js'].lineData[199]++;
    if (visit16_199_1(elBefore)) {
      _$jscoverage['/container.js'].lineData[200]++;
      c.set('elBefore', elBefore);
    } else {
      _$jscoverage['/container.js'].lineData[202]++;
      c.set('render', contentEl);
    }
    _$jscoverage['/container.js'].lineData[204]++;
    c.create();
  }
  _$jscoverage['/container.js'].lineData[206]++;
  self.fire('afterCreateChild', {
  component: c, 
  index: childIndex});
  _$jscoverage['/container.js'].lineData[211]++;
  return c;
}, 
  removeChild: function(c, destroy) {
  _$jscoverage['/container.js'].functionData[13]++;
  _$jscoverage['/container.js'].lineData[227]++;
  if (visit17_227_1(destroy === undefined)) {
    _$jscoverage['/container.js'].lineData[228]++;
    destroy = true;
  }
  _$jscoverage['/container.js'].lineData[230]++;
  this.fire('beforeRemoveChild', {
  component: c, 
  index: S.indexOf(c, this.get('children')), 
  destroy: destroy});
}, 
  removeChildren: function(destroy) {
  _$jscoverage['/container.js'].functionData[14]++;
  _$jscoverage['/container.js'].lineData[245]++;
  var self = this, i, t = [].concat(self.get('children'));
  _$jscoverage['/container.js'].lineData[248]++;
  for (i = 0; visit18_248_1(i < t.length); i++) {
    _$jscoverage['/container.js'].lineData[249]++;
    self.removeChild(t[i], destroy);
  }
  _$jscoverage['/container.js'].lineData[251]++;
  return self;
}, 
  getChildAt: function(index) {
  _$jscoverage['/container.js'].functionData[15]++;
  _$jscoverage['/container.js'].lineData[260]++;
  var children = this.get('children');
  _$jscoverage['/container.js'].lineData[261]++;
  return visit19_261_1(children[index] || null);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/container.js'].functionData[16]++;
  _$jscoverage['/container.js'].lineData[266]++;
  return this.$el;
}, 
  destructor: function() {
  _$jscoverage['/container.js'].functionData[17]++;
  _$jscoverage['/container.js'].lineData[274]++;
  var i, children = this.get('children');
  _$jscoverage['/container.js'].lineData[276]++;
  for (i = 0; visit20_276_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[277]++;
    if (visit21_277_1(children[i].destroy)) {
      _$jscoverage['/container.js'].lineData[278]++;
      children[i].destroy();
    }
  }
}}, {
  ATTRS: {
  children: {
  value: [], 
  getter: function(v) {
  _$jscoverage['/container.js'].functionData[18]++;
  _$jscoverage['/container.js'].lineData[294]++;
  var defaultChildCfg = null, i, c, self = this;
  _$jscoverage['/container.js'].lineData[298]++;
  for (i = 0; visit22_298_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[299]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[300]++;
    if (visit23_300_1(!c.isControl)) {
      _$jscoverage['/container.js'].lineData[301]++;
      defaultChildCfg = visit24_301_1(defaultChildCfg || self.get('defaultChildCfg'));
      _$jscoverage['/container.js'].lineData[302]++;
      S.mix(c, defaultChildCfg, false);
      _$jscoverage['/container.js'].lineData[303]++;
      v[i] = this.createComponent(c);
    }
  }
  _$jscoverage['/container.js'].lineData[306]++;
  return v;
}, 
  setter: function(v) {
  _$jscoverage['/container.js'].functionData[19]++;
  _$jscoverage['/container.js'].lineData[309]++;
  var i, c;
  _$jscoverage['/container.js'].lineData[312]++;
  for (i = 0; visit25_312_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[313]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[314]++;
    if (visit26_314_1(c.isControl)) {
      _$jscoverage['/container.js'].lineData[315]++;
      c.setInternal('parent', this);
    }
  }
}}, 
  defaultChildCfg: {
  value: {}}}, 
  name: 'container'});
});
