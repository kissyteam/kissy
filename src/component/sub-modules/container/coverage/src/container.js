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
  _$jscoverage['/container.js'].lineData[9] = 0;
  _$jscoverage['/container.js'].lineData[11] = 0;
  _$jscoverage['/container.js'].lineData[12] = 0;
  _$jscoverage['/container.js'].lineData[13] = 0;
  _$jscoverage['/container.js'].lineData[17] = 0;
  _$jscoverage['/container.js'].lineData[20] = 0;
  _$jscoverage['/container.js'].lineData[22] = 0;
  _$jscoverage['/container.js'].lineData[24] = 0;
  _$jscoverage['/container.js'].lineData[26] = 0;
  _$jscoverage['/container.js'].lineData[27] = 0;
  _$jscoverage['/container.js'].lineData[29] = 0;
  _$jscoverage['/container.js'].lineData[35] = 0;
  _$jscoverage['/container.js'].lineData[36] = 0;
  _$jscoverage['/container.js'].lineData[37] = 0;
  _$jscoverage['/container.js'].lineData[42] = 0;
  _$jscoverage['/container.js'].lineData[43] = 0;
  _$jscoverage['/container.js'].lineData[46] = 0;
  _$jscoverage['/container.js'].lineData[49] = 0;
  _$jscoverage['/container.js'].lineData[50] = 0;
  _$jscoverage['/container.js'].lineData[53] = 0;
  _$jscoverage['/container.js'].lineData[64] = 0;
  _$jscoverage['/container.js'].lineData[68] = 0;
  _$jscoverage['/container.js'].lineData[72] = 0;
  _$jscoverage['/container.js'].lineData[78] = 0;
  _$jscoverage['/container.js'].lineData[84] = 0;
  _$jscoverage['/container.js'].lineData[89] = 0;
  _$jscoverage['/container.js'].lineData[96] = 0;
  _$jscoverage['/container.js'].lineData[97] = 0;
  _$jscoverage['/container.js'].lineData[100] = 0;
  _$jscoverage['/container.js'].lineData[101] = 0;
  _$jscoverage['/container.js'].lineData[106] = 0;
  _$jscoverage['/container.js'].lineData[110] = 0;
  _$jscoverage['/container.js'].lineData[114] = 0;
  _$jscoverage['/container.js'].lineData[118] = 0;
  _$jscoverage['/container.js'].lineData[121] = 0;
  _$jscoverage['/container.js'].lineData[122] = 0;
  _$jscoverage['/container.js'].lineData[127] = 0;
  _$jscoverage['/container.js'].lineData[130] = 0;
  _$jscoverage['/container.js'].lineData[131] = 0;
  _$jscoverage['/container.js'].lineData[148] = 0;
  _$jscoverage['/container.js'].lineData[150] = 0;
  _$jscoverage['/container.js'].lineData[151] = 0;
  _$jscoverage['/container.js'].lineData[153] = 0;
  _$jscoverage['/container.js'].lineData[157] = 0;
  _$jscoverage['/container.js'].lineData[161] = 0;
  _$jscoverage['/container.js'].lineData[164] = 0;
  _$jscoverage['/container.js'].lineData[166] = 0;
  _$jscoverage['/container.js'].lineData[173] = 0;
  _$jscoverage['/container.js'].lineData[180] = 0;
  _$jscoverage['/container.js'].lineData[181] = 0;
  _$jscoverage['/container.js'].lineData[182] = 0;
  _$jscoverage['/container.js'].lineData[183] = 0;
  _$jscoverage['/container.js'].lineData[184] = 0;
  _$jscoverage['/container.js'].lineData[185] = 0;
  _$jscoverage['/container.js'].lineData[186] = 0;
  _$jscoverage['/container.js'].lineData[187] = 0;
  _$jscoverage['/container.js'].lineData[190] = 0;
  _$jscoverage['/container.js'].lineData[191] = 0;
  _$jscoverage['/container.js'].lineData[193] = 0;
  _$jscoverage['/container.js'].lineData[195] = 0;
  _$jscoverage['/container.js'].lineData[197] = 0;
  _$jscoverage['/container.js'].lineData[202] = 0;
  _$jscoverage['/container.js'].lineData[207] = 0;
  _$jscoverage['/container.js'].lineData[209] = 0;
  _$jscoverage['/container.js'].lineData[210] = 0;
  _$jscoverage['/container.js'].lineData[227] = 0;
  _$jscoverage['/container.js'].lineData[228] = 0;
  _$jscoverage['/container.js'].lineData[230] = 0;
  _$jscoverage['/container.js'].lineData[245] = 0;
  _$jscoverage['/container.js'].lineData[247] = 0;
  _$jscoverage['/container.js'].lineData[248] = 0;
  _$jscoverage['/container.js'].lineData[250] = 0;
  _$jscoverage['/container.js'].lineData[251] = 0;
  _$jscoverage['/container.js'].lineData[253] = 0;
  _$jscoverage['/container.js'].lineData[262] = 0;
  _$jscoverage['/container.js'].lineData[263] = 0;
  _$jscoverage['/container.js'].lineData[268] = 0;
  _$jscoverage['/container.js'].lineData[276] = 0;
  _$jscoverage['/container.js'].lineData[289] = 0;
  _$jscoverage['/container.js'].lineData[292] = 0;
  _$jscoverage['/container.js'].lineData[295] = 0;
  _$jscoverage['/container.js'].lineData[296] = 0;
  _$jscoverage['/container.js'].lineData[297] = 0;
  _$jscoverage['/container.js'].lineData[298] = 0;
  _$jscoverage['/container.js'].lineData[299] = 0;
  _$jscoverage['/container.js'].lineData[300] = 0;
  _$jscoverage['/container.js'].lineData[303] = 0;
  _$jscoverage['/container.js'].lineData[306] = 0;
  _$jscoverage['/container.js'].lineData[309] = 0;
  _$jscoverage['/container.js'].lineData[310] = 0;
  _$jscoverage['/container.js'].lineData[311] = 0;
  _$jscoverage['/container.js'].lineData[312] = 0;
  _$jscoverage['/container.js'].lineData[327] = 0;
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
  _$jscoverage['/container.js'].functionData[20] = 0;
  _$jscoverage['/container.js'].functionData[21] = 0;
  _$jscoverage['/container.js'].functionData[22] = 0;
}
if (! _$jscoverage['/container.js'].branchData) {
  _$jscoverage['/container.js'].branchData = {};
  _$jscoverage['/container.js'].branchData['26'] = [];
  _$jscoverage['/container.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['42'] = [];
  _$jscoverage['/container.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['49'] = [];
  _$jscoverage['/container.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['84'] = [];
  _$jscoverage['/container.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['97'] = [];
  _$jscoverage['/container.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['98'] = [];
  _$jscoverage['/container.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['100'] = [];
  _$jscoverage['/container.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['121'] = [];
  _$jscoverage['/container.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['130'] = [];
  _$jscoverage['/container.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['150'] = [];
  _$jscoverage['/container.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['183'] = [];
  _$jscoverage['/container.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['184'] = [];
  _$jscoverage['/container.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['186'] = [];
  _$jscoverage['/container.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['190'] = [];
  _$jscoverage['/container.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['209'] = [];
  _$jscoverage['/container.js'].branchData['209'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['227'] = [];
  _$jscoverage['/container.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['247'] = [];
  _$jscoverage['/container.js'].branchData['247'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['250'] = [];
  _$jscoverage['/container.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['250'][2] = new BranchData();
  _$jscoverage['/container.js'].branchData['263'] = [];
  _$jscoverage['/container.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['295'] = [];
  _$jscoverage['/container.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['297'] = [];
  _$jscoverage['/container.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['298'] = [];
  _$jscoverage['/container.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['309'] = [];
  _$jscoverage['/container.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['311'] = [];
  _$jscoverage['/container.js'].branchData['311'][1] = new BranchData();
}
_$jscoverage['/container.js'].branchData['311'][1].init(65, 11, 'c.isControl');
function visit25_311_1(result) {
  _$jscoverage['/container.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['309'][1].init(115, 12, 'i < v.length');
function visit24_309_1(result) {
  _$jscoverage['/container.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['298'][1].init(48, 46, 'defaultChildCfg || self.get(\'defaultChildCfg\')');
function visit23_298_1(result) {
  _$jscoverage['/container.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['297'][1].init(65, 12, '!c.isControl');
function visit22_297_1(result) {
  _$jscoverage['/container.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['295'][1].init(152, 12, 'i < v.length');
function visit21_295_1(result) {
  _$jscoverage['/container.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['263'][1].init(71, 23, 'children[index] || null');
function visit20_263_1(result) {
  _$jscoverage['/container.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['250'][2].init(214, 17, 'destroy !== false');
function visit19_250_2(result) {
  _$jscoverage['/container.js'].branchData['250'][2].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['250'][1].init(214, 29, 'destroy !== false && self.$el');
function visit18_250_1(result) {
  _$jscoverage['/container.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['247'][1].init(113, 12, 'i < t.length');
function visit17_247_1(result) {
  _$jscoverage['/container.js'].branchData['247'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['227'][1].init(18, 21, 'destroy === undefined');
function visit16_227_1(result) {
  _$jscoverage['/container.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['209'][1].init(130, 5, 'i < l');
function visit15_209_1(result) {
  _$jscoverage['/container.js'].branchData['209'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['190'][1].init(22, 8, 'elBefore');
function visit14_190_1(result) {
  _$jscoverage['/container.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['186'][1].init(51, 31, 'cEl.parentNode !== domContentEl');
function visit13_186_1(result) {
  _$jscoverage['/container.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['184'][1].init(430, 17, 'c.get(\'rendered\')');
function visit12_184_1(result) {
  _$jscoverage['/container.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['183'][1].init(370, 41, 'domContentEl.children[childIndex] || null');
function visit11_183_1(result) {
  _$jscoverage['/container.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['150'][1].init(98, 19, 'index === undefined');
function visit10_150_1(result) {
  _$jscoverage['/container.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['130'][1].init(126, 19, 'i < children.length');
function visit9_130_1(result) {
  _$jscoverage['/container.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['121'][1].init(126, 19, 'i < children.length');
function visit8_121_1(result) {
  _$jscoverage['/container.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['100'][1].init(221, 7, 'ChildUI');
function visit7_100_1(result) {
  _$jscoverage['/container.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['98'][1].init(72, 93, 'defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)');
function visit6_98_1(result) {
  _$jscoverage['/container.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['97'][1].init(32, 166, 'self.getComponentConstructorByNode(prefixCls, c) || defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)');
function visit5_97_1(result) {
  _$jscoverage['/container.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['84'][1].init(606, 38, 'defaultChildCfg.prefixCls || prefixCls');
function visit4_84_1(result) {
  _$jscoverage['/container.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['49'][1].init(334, 9, 'c.destroy');
function visit3_49_1(result) {
  _$jscoverage['/container.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['42'][1].init(182, 12, 'index !== -1');
function visit2_42_1(result) {
  _$jscoverage['/container.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['26'][1].init(329, 20, 'self.get(\'rendered\')');
function visit1_26_1(result) {
  _$jscoverage['/container.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/container.js'].functionData[0]++;
  _$jscoverage['/container.js'].lineData[7]++;
  var util = require('util');
  _$jscoverage['/container.js'].lineData[8]++;
  var Control = require('component/control');
  _$jscoverage['/container.js'].lineData[9]++;
  var Manager = Control.Manager;
  _$jscoverage['/container.js'].lineData[11]++;
  function defAddChild(e) {
    _$jscoverage['/container.js'].functionData[1]++;
    _$jscoverage['/container.js'].lineData[12]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[13]++;
    var c = e.component, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[17]++;
    children.splice(index, 0, c);
    _$jscoverage['/container.js'].lineData[20]++;
    children = self.get('children');
    _$jscoverage['/container.js'].lineData[22]++;
    c = children[index];
    _$jscoverage['/container.js'].lineData[24]++;
    c.setInternal('parent', self);
    _$jscoverage['/container.js'].lineData[26]++;
    if (visit1_26_1(self.get('rendered'))) {
      _$jscoverage['/container.js'].lineData[27]++;
      self.renderChild(index);
    }
    _$jscoverage['/container.js'].lineData[29]++;
    self.fire('afterAddChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[35]++;
  function defRemoveChild(e) {
    _$jscoverage['/container.js'].functionData[2]++;
    _$jscoverage['/container.js'].lineData[36]++;
    var self = this;
    _$jscoverage['/container.js'].lineData[37]++;
    var c = e.component, destroy = e.destroy, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[42]++;
    if (visit2_42_1(index !== -1)) {
      _$jscoverage['/container.js'].lineData[43]++;
      children.splice(index, 1);
    }
    _$jscoverage['/container.js'].lineData[46]++;
    c.setInternal('parent', null);
    _$jscoverage['/container.js'].lineData[49]++;
    if (visit3_49_1(c.destroy)) {
      _$jscoverage['/container.js'].lineData[50]++;
      c.destroy(destroy);
    }
    _$jscoverage['/container.js'].lineData[53]++;
    self.fire('afterRemoveChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[64]++;
  return Control.extend({
  isContainer: true, 
  initializer: function() {
  _$jscoverage['/container.js'].functionData[3]++;
  _$jscoverage['/container.js'].lineData[68]++;
  var self = this, prefixCls = self.get('prefixCls'), defaultChildCfg = self.get('defaultChildCfg');
  _$jscoverage['/container.js'].lineData[72]++;
  self.publish('beforeAddChild', {
  defaultFn: defAddChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[78]++;
  self.publish('beforeRemoveChild', {
  defaultFn: defRemoveChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[84]++;
  defaultChildCfg.prefixCls = visit4_84_1(defaultChildCfg.prefixCls || prefixCls);
}, 
  decorateDom: function() {
  _$jscoverage['/container.js'].functionData[4]++;
  _$jscoverage['/container.js'].lineData[89]++;
  var self = this, childrenContainerEl = self.getChildrenContainerEl(), defaultChildCfg = self.get('defaultChildCfg'), prefixCls = defaultChildCfg.prefixCls, defaultChildXClass = defaultChildCfg.xclass, childrenComponents = [], children = childrenContainerEl.children();
  _$jscoverage['/container.js'].lineData[96]++;
  children.each(function(c) {
  _$jscoverage['/container.js'].functionData[5]++;
  _$jscoverage['/container.js'].lineData[97]++;
  var ChildUI = visit5_97_1(self.getComponentConstructorByNode(prefixCls, c) || visit6_98_1(defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)));
  _$jscoverage['/container.js'].lineData[100]++;
  if (visit7_100_1(ChildUI)) {
    _$jscoverage['/container.js'].lineData[101]++;
    childrenComponents.push(new ChildUI(util.merge(defaultChildCfg, {
  srcNode: c})));
  }
});
  _$jscoverage['/container.js'].lineData[106]++;
  self.set('children', childrenComponents);
}, 
  createDom: function() {
  _$jscoverage['/container.js'].functionData[6]++;
  _$jscoverage['/container.js'].lineData[110]++;
  this.createChildren();
}, 
  renderUI: function() {
  _$jscoverage['/container.js'].functionData[7]++;
  _$jscoverage['/container.js'].lineData[114]++;
  this.renderChildren();
}, 
  renderChildren: function() {
  _$jscoverage['/container.js'].functionData[8]++;
  _$jscoverage['/container.js'].lineData[118]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[121]++;
  for (i = 0; visit8_121_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[122]++;
    self.renderChild(i);
  }
}, 
  createChildren: function() {
  _$jscoverage['/container.js'].functionData[9]++;
  _$jscoverage['/container.js'].lineData[127]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[130]++;
  for (i = 0; visit9_130_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[131]++;
    self.createChild(i);
  }
}, 
  addChild: function(c, index) {
  _$jscoverage['/container.js'].functionData[10]++;
  _$jscoverage['/container.js'].lineData[148]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[150]++;
  if (visit10_150_1(index === undefined)) {
    _$jscoverage['/container.js'].lineData[151]++;
    index = children.length;
  }
  _$jscoverage['/container.js'].lineData[153]++;
  self.fire('beforeAddChild', {
  component: c, 
  index: index});
  _$jscoverage['/container.js'].lineData[157]++;
  return children[index];
}, 
  renderChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[11]++;
  _$jscoverage['/container.js'].lineData[161]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[164]++;
  self.createChild(childIndex).render();
  _$jscoverage['/container.js'].lineData[166]++;
  self.fire('afterRenderChild', {
  component: children[childIndex], 
  index: childIndex});
}, 
  createChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[12]++;
  _$jscoverage['/container.js'].lineData[173]++;
  var self = this, c, elBefore, domContentEl, children = self.get('children'), cEl, contentEl;
  _$jscoverage['/container.js'].lineData[180]++;
  c = children[childIndex];
  _$jscoverage['/container.js'].lineData[181]++;
  contentEl = self.getChildrenContainerEl();
  _$jscoverage['/container.js'].lineData[182]++;
  domContentEl = contentEl[0];
  _$jscoverage['/container.js'].lineData[183]++;
  elBefore = visit11_183_1(domContentEl.children[childIndex] || null);
  _$jscoverage['/container.js'].lineData[184]++;
  if (visit12_184_1(c.get('rendered'))) {
    _$jscoverage['/container.js'].lineData[185]++;
    cEl = c.el;
    _$jscoverage['/container.js'].lineData[186]++;
    if (visit13_186_1(cEl.parentNode !== domContentEl)) {
      _$jscoverage['/container.js'].lineData[187]++;
      domContentEl.insertBefore(cEl, elBefore);
    }
  } else {
    _$jscoverage['/container.js'].lineData[190]++;
    if (visit14_190_1(elBefore)) {
      _$jscoverage['/container.js'].lineData[191]++;
      c.set('elBefore', elBefore);
    } else {
      _$jscoverage['/container.js'].lineData[193]++;
      c.set('render', contentEl);
    }
    _$jscoverage['/container.js'].lineData[195]++;
    c.create();
  }
  _$jscoverage['/container.js'].lineData[197]++;
  self.fire('afterCreateChild', {
  component: c, 
  index: childIndex});
  _$jscoverage['/container.js'].lineData[202]++;
  return c;
}, 
  addChildren: function(children) {
  _$jscoverage['/container.js'].functionData[13]++;
  _$jscoverage['/container.js'].lineData[207]++;
  var i, l = children.length;
  _$jscoverage['/container.js'].lineData[209]++;
  for (i = 0; visit15_209_1(i < l); i++) {
    _$jscoverage['/container.js'].lineData[210]++;
    this.addChild(children[i]);
  }
}, 
  removeChild: function(c, destroy) {
  _$jscoverage['/container.js'].functionData[14]++;
  _$jscoverage['/container.js'].lineData[227]++;
  if (visit16_227_1(destroy === undefined)) {
    _$jscoverage['/container.js'].lineData[228]++;
    destroy = true;
  }
  _$jscoverage['/container.js'].lineData[230]++;
  this.fire('beforeRemoveChild', {
  component: c, 
  index: util.indexOf(c, this.get('children')), 
  destroy: destroy});
}, 
  removeChildren: function(destroy) {
  _$jscoverage['/container.js'].functionData[15]++;
  _$jscoverage['/container.js'].lineData[245]++;
  var self = this, i, t = [].concat(self.get('children'));
  _$jscoverage['/container.js'].lineData[247]++;
  for (i = 0; visit17_247_1(i < t.length); i++) {
    _$jscoverage['/container.js'].lineData[248]++;
    self.removeChild(t[i], false);
  }
  _$jscoverage['/container.js'].lineData[250]++;
  if (visit18_250_1(visit19_250_2(destroy !== false) && self.$el)) {
    _$jscoverage['/container.js'].lineData[251]++;
    self.getChildrenContainerEl()[0].innerHTML = '';
  }
  _$jscoverage['/container.js'].lineData[253]++;
  return self;
}, 
  getChildAt: function(index) {
  _$jscoverage['/container.js'].functionData[16]++;
  _$jscoverage['/container.js'].lineData[262]++;
  var children = this.get('children');
  _$jscoverage['/container.js'].lineData[263]++;
  return visit20_263_1(children[index] || null);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/container.js'].functionData[17]++;
  _$jscoverage['/container.js'].lineData[268]++;
  return this.$el;
}, 
  destructor: function(destroy) {
  _$jscoverage['/container.js'].functionData[18]++;
  _$jscoverage['/container.js'].lineData[276]++;
  this.removeChildren(destroy);
}}, {
  ATTRS: {
  children: {
  valueFn: function() {
  _$jscoverage['/container.js'].functionData[19]++;
  _$jscoverage['/container.js'].lineData[289]++;
  return [];
}, 
  getter: function(v) {
  _$jscoverage['/container.js'].functionData[20]++;
  _$jscoverage['/container.js'].lineData[292]++;
  var defaultChildCfg = null, i, c, self = this;
  _$jscoverage['/container.js'].lineData[295]++;
  for (i = 0; visit21_295_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[296]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[297]++;
    if (visit22_297_1(!c.isControl)) {
      _$jscoverage['/container.js'].lineData[298]++;
      defaultChildCfg = visit23_298_1(defaultChildCfg || self.get('defaultChildCfg'));
      _$jscoverage['/container.js'].lineData[299]++;
      util.mix(c, defaultChildCfg, false);
      _$jscoverage['/container.js'].lineData[300]++;
      v[i] = this.createComponent(c);
    }
  }
  _$jscoverage['/container.js'].lineData[303]++;
  return v;
}, 
  setter: function(v) {
  _$jscoverage['/container.js'].functionData[21]++;
  _$jscoverage['/container.js'].lineData[306]++;
  var i, c;
  _$jscoverage['/container.js'].lineData[309]++;
  for (i = 0; visit24_309_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[310]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[311]++;
    if (visit25_311_1(c.isControl)) {
      _$jscoverage['/container.js'].lineData[312]++;
      c.setInternal('parent', this);
    }
  }
}}, 
  defaultChildCfg: {
  valueFn: function() {
  _$jscoverage['/container.js'].functionData[22]++;
  _$jscoverage['/container.js'].lineData[327]++;
  return {};
}}}, 
  name: 'container'});
});
