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
  _$jscoverage['/container.js'].lineData[41] = 0;
  _$jscoverage['/container.js'].lineData[42] = 0;
  _$jscoverage['/container.js'].lineData[45] = 0;
  _$jscoverage['/container.js'].lineData[48] = 0;
  _$jscoverage['/container.js'].lineData[49] = 0;
  _$jscoverage['/container.js'].lineData[52] = 0;
  _$jscoverage['/container.js'].lineData[63] = 0;
  _$jscoverage['/container.js'].lineData[67] = 0;
  _$jscoverage['/container.js'].lineData[71] = 0;
  _$jscoverage['/container.js'].lineData[77] = 0;
  _$jscoverage['/container.js'].lineData[83] = 0;
  _$jscoverage['/container.js'].lineData[88] = 0;
  _$jscoverage['/container.js'].lineData[95] = 0;
  _$jscoverage['/container.js'].lineData[96] = 0;
  _$jscoverage['/container.js'].lineData[99] = 0;
  _$jscoverage['/container.js'].lineData[100] = 0;
  _$jscoverage['/container.js'].lineData[105] = 0;
  _$jscoverage['/container.js'].lineData[109] = 0;
  _$jscoverage['/container.js'].lineData[113] = 0;
  _$jscoverage['/container.js'].lineData[117] = 0;
  _$jscoverage['/container.js'].lineData[120] = 0;
  _$jscoverage['/container.js'].lineData[121] = 0;
  _$jscoverage['/container.js'].lineData[126] = 0;
  _$jscoverage['/container.js'].lineData[129] = 0;
  _$jscoverage['/container.js'].lineData[130] = 0;
  _$jscoverage['/container.js'].lineData[147] = 0;
  _$jscoverage['/container.js'].lineData[149] = 0;
  _$jscoverage['/container.js'].lineData[150] = 0;
  _$jscoverage['/container.js'].lineData[152] = 0;
  _$jscoverage['/container.js'].lineData[156] = 0;
  _$jscoverage['/container.js'].lineData[160] = 0;
  _$jscoverage['/container.js'].lineData[163] = 0;
  _$jscoverage['/container.js'].lineData[165] = 0;
  _$jscoverage['/container.js'].lineData[172] = 0;
  _$jscoverage['/container.js'].lineData[179] = 0;
  _$jscoverage['/container.js'].lineData[180] = 0;
  _$jscoverage['/container.js'].lineData[181] = 0;
  _$jscoverage['/container.js'].lineData[182] = 0;
  _$jscoverage['/container.js'].lineData[183] = 0;
  _$jscoverage['/container.js'].lineData[184] = 0;
  _$jscoverage['/container.js'].lineData[185] = 0;
  _$jscoverage['/container.js'].lineData[186] = 0;
  _$jscoverage['/container.js'].lineData[189] = 0;
  _$jscoverage['/container.js'].lineData[190] = 0;
  _$jscoverage['/container.js'].lineData[192] = 0;
  _$jscoverage['/container.js'].lineData[194] = 0;
  _$jscoverage['/container.js'].lineData[196] = 0;
  _$jscoverage['/container.js'].lineData[201] = 0;
  _$jscoverage['/container.js'].lineData[206] = 0;
  _$jscoverage['/container.js'].lineData[208] = 0;
  _$jscoverage['/container.js'].lineData[209] = 0;
  _$jscoverage['/container.js'].lineData[226] = 0;
  _$jscoverage['/container.js'].lineData[227] = 0;
  _$jscoverage['/container.js'].lineData[229] = 0;
  _$jscoverage['/container.js'].lineData[244] = 0;
  _$jscoverage['/container.js'].lineData[246] = 0;
  _$jscoverage['/container.js'].lineData[247] = 0;
  _$jscoverage['/container.js'].lineData[249] = 0;
  _$jscoverage['/container.js'].lineData[250] = 0;
  _$jscoverage['/container.js'].lineData[252] = 0;
  _$jscoverage['/container.js'].lineData[261] = 0;
  _$jscoverage['/container.js'].lineData[262] = 0;
  _$jscoverage['/container.js'].lineData[267] = 0;
  _$jscoverage['/container.js'].lineData[275] = 0;
  _$jscoverage['/container.js'].lineData[288] = 0;
  _$jscoverage['/container.js'].lineData[291] = 0;
  _$jscoverage['/container.js'].lineData[294] = 0;
  _$jscoverage['/container.js'].lineData[295] = 0;
  _$jscoverage['/container.js'].lineData[296] = 0;
  _$jscoverage['/container.js'].lineData[297] = 0;
  _$jscoverage['/container.js'].lineData[298] = 0;
  _$jscoverage['/container.js'].lineData[299] = 0;
  _$jscoverage['/container.js'].lineData[302] = 0;
  _$jscoverage['/container.js'].lineData[305] = 0;
  _$jscoverage['/container.js'].lineData[308] = 0;
  _$jscoverage['/container.js'].lineData[309] = 0;
  _$jscoverage['/container.js'].lineData[310] = 0;
  _$jscoverage['/container.js'].lineData[311] = 0;
  _$jscoverage['/container.js'].lineData[326] = 0;
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
  _$jscoverage['/container.js'].branchData['25'] = [];
  _$jscoverage['/container.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['41'] = [];
  _$jscoverage['/container.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['48'] = [];
  _$jscoverage['/container.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['83'] = [];
  _$jscoverage['/container.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['96'] = [];
  _$jscoverage['/container.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['97'] = [];
  _$jscoverage['/container.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['99'] = [];
  _$jscoverage['/container.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['120'] = [];
  _$jscoverage['/container.js'].branchData['120'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['129'] = [];
  _$jscoverage['/container.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['149'] = [];
  _$jscoverage['/container.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['182'] = [];
  _$jscoverage['/container.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['183'] = [];
  _$jscoverage['/container.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['185'] = [];
  _$jscoverage['/container.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['189'] = [];
  _$jscoverage['/container.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['208'] = [];
  _$jscoverage['/container.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['226'] = [];
  _$jscoverage['/container.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['246'] = [];
  _$jscoverage['/container.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['249'] = [];
  _$jscoverage['/container.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['249'][2] = new BranchData();
  _$jscoverage['/container.js'].branchData['262'] = [];
  _$jscoverage['/container.js'].branchData['262'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['294'] = [];
  _$jscoverage['/container.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['296'] = [];
  _$jscoverage['/container.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['297'] = [];
  _$jscoverage['/container.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['308'] = [];
  _$jscoverage['/container.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/container.js'].branchData['310'] = [];
  _$jscoverage['/container.js'].branchData['310'][1] = new BranchData();
}
_$jscoverage['/container.js'].branchData['310'][1].init(65, 11, 'c.isControl');
function visit25_310_1(result) {
  _$jscoverage['/container.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['308'][1].init(115, 12, 'i < v.length');
function visit24_308_1(result) {
  _$jscoverage['/container.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['297'][1].init(48, 46, 'defaultChildCfg || self.get(\'defaultChildCfg\')');
function visit23_297_1(result) {
  _$jscoverage['/container.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['296'][1].init(65, 12, '!c.isControl');
function visit22_296_1(result) {
  _$jscoverage['/container.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['294'][1].init(152, 12, 'i < v.length');
function visit21_294_1(result) {
  _$jscoverage['/container.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['262'][1].init(71, 23, 'children[index] || null');
function visit20_262_1(result) {
  _$jscoverage['/container.js'].branchData['262'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['249'][2].init(214, 17, 'destroy !== false');
function visit19_249_2(result) {
  _$jscoverage['/container.js'].branchData['249'][2].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['249'][1].init(214, 29, 'destroy !== false && self.$el');
function visit18_249_1(result) {
  _$jscoverage['/container.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['246'][1].init(113, 12, 'i < t.length');
function visit17_246_1(result) {
  _$jscoverage['/container.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['226'][1].init(18, 21, 'destroy === undefined');
function visit16_226_1(result) {
  _$jscoverage['/container.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['208'][1].init(130, 5, 'i < l');
function visit15_208_1(result) {
  _$jscoverage['/container.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['189'][1].init(22, 8, 'elBefore');
function visit14_189_1(result) {
  _$jscoverage['/container.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['185'][1].init(51, 31, 'cEl.parentNode !== domContentEl');
function visit13_185_1(result) {
  _$jscoverage['/container.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['183'][1].init(430, 17, 'c.get(\'rendered\')');
function visit12_183_1(result) {
  _$jscoverage['/container.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['182'][1].init(370, 41, 'domContentEl.children[childIndex] || null');
function visit11_182_1(result) {
  _$jscoverage['/container.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['149'][1].init(98, 19, 'index === undefined');
function visit10_149_1(result) {
  _$jscoverage['/container.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['129'][1].init(126, 19, 'i < children.length');
function visit9_129_1(result) {
  _$jscoverage['/container.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['120'][1].init(126, 19, 'i < children.length');
function visit8_120_1(result) {
  _$jscoverage['/container.js'].branchData['120'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['99'][1].init(221, 7, 'ChildUI');
function visit7_99_1(result) {
  _$jscoverage['/container.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['97'][1].init(72, 93, 'defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)');
function visit6_97_1(result) {
  _$jscoverage['/container.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['96'][1].init(32, 166, 'self.getComponentConstructorByNode(prefixCls, c) || defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)');
function visit5_96_1(result) {
  _$jscoverage['/container.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['83'][1].init(606, 38, 'defaultChildCfg.prefixCls || prefixCls');
function visit4_83_1(result) {
  _$jscoverage['/container.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['48'][1].init(334, 9, 'c.destroy');
function visit3_48_1(result) {
  _$jscoverage['/container.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/container.js'].branchData['41'][1].init(182, 12, 'index !== -1');
function visit2_41_1(result) {
  _$jscoverage['/container.js'].branchData['41'][1].ranCondition(result);
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
  var Manager = Control.Manager;
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
    var c = e.component, destroy = e.destroy, children = self.get('children'), index = e.index;
    _$jscoverage['/container.js'].lineData[41]++;
    if (visit2_41_1(index !== -1)) {
      _$jscoverage['/container.js'].lineData[42]++;
      children.splice(index, 1);
    }
    _$jscoverage['/container.js'].lineData[45]++;
    c.setInternal('parent', null);
    _$jscoverage['/container.js'].lineData[48]++;
    if (visit3_48_1(c.destroy)) {
      _$jscoverage['/container.js'].lineData[49]++;
      c.destroy(destroy);
    }
    _$jscoverage['/container.js'].lineData[52]++;
    self.fire('afterRemoveChild', {
  component: c, 
  index: index});
  }
  _$jscoverage['/container.js'].lineData[63]++;
  return Control.extend({
  isContainer: true, 
  initializer: function() {
  _$jscoverage['/container.js'].functionData[3]++;
  _$jscoverage['/container.js'].lineData[67]++;
  var self = this, prefixCls = self.get('prefixCls'), defaultChildCfg = self.get('defaultChildCfg');
  _$jscoverage['/container.js'].lineData[71]++;
  self.publish('beforeAddChild', {
  defaultFn: defAddChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[77]++;
  self.publish('beforeRemoveChild', {
  defaultFn: defRemoveChild, 
  defaultTargetOnly: true});
  _$jscoverage['/container.js'].lineData[83]++;
  defaultChildCfg.prefixCls = visit4_83_1(defaultChildCfg.prefixCls || prefixCls);
}, 
  decorateDom: function() {
  _$jscoverage['/container.js'].functionData[4]++;
  _$jscoverage['/container.js'].lineData[88]++;
  var self = this, childrenContainerEl = self.getChildrenContainerEl(), defaultChildCfg = self.get('defaultChildCfg'), prefixCls = defaultChildCfg.prefixCls, defaultChildXClass = defaultChildCfg.xclass, childrenComponents = [], children = childrenContainerEl.children();
  _$jscoverage['/container.js'].lineData[95]++;
  children.each(function(c) {
  _$jscoverage['/container.js'].functionData[5]++;
  _$jscoverage['/container.js'].lineData[96]++;
  var ChildUI = visit5_96_1(self.getComponentConstructorByNode(prefixCls, c) || visit6_97_1(defaultChildXClass && Manager.getConstructorByXClass(defaultChildXClass)));
  _$jscoverage['/container.js'].lineData[99]++;
  if (visit7_99_1(ChildUI)) {
    _$jscoverage['/container.js'].lineData[100]++;
    childrenComponents.push(new ChildUI(S.merge(defaultChildCfg, {
  srcNode: c})));
  }
});
  _$jscoverage['/container.js'].lineData[105]++;
  self.set('children', childrenComponents);
}, 
  createDom: function() {
  _$jscoverage['/container.js'].functionData[6]++;
  _$jscoverage['/container.js'].lineData[109]++;
  this.createChildren();
}, 
  renderUI: function() {
  _$jscoverage['/container.js'].functionData[7]++;
  _$jscoverage['/container.js'].lineData[113]++;
  this.renderChildren();
}, 
  renderChildren: function() {
  _$jscoverage['/container.js'].functionData[8]++;
  _$jscoverage['/container.js'].lineData[117]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[120]++;
  for (i = 0; visit8_120_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[121]++;
    self.renderChild(i);
  }
}, 
  createChildren: function() {
  _$jscoverage['/container.js'].functionData[9]++;
  _$jscoverage['/container.js'].lineData[126]++;
  var i, self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[129]++;
  for (i = 0; visit9_129_1(i < children.length); i++) {
    _$jscoverage['/container.js'].lineData[130]++;
    self.createChild(i);
  }
}, 
  addChild: function(c, index) {
  _$jscoverage['/container.js'].functionData[10]++;
  _$jscoverage['/container.js'].lineData[147]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[149]++;
  if (visit10_149_1(index === undefined)) {
    _$jscoverage['/container.js'].lineData[150]++;
    index = children.length;
  }
  _$jscoverage['/container.js'].lineData[152]++;
  self.fire('beforeAddChild', {
  component: c, 
  index: index});
  _$jscoverage['/container.js'].lineData[156]++;
  return children[index];
}, 
  renderChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[11]++;
  _$jscoverage['/container.js'].lineData[160]++;
  var self = this, children = self.get('children');
  _$jscoverage['/container.js'].lineData[163]++;
  self.createChild(childIndex).render();
  _$jscoverage['/container.js'].lineData[165]++;
  self.fire('afterRenderChild', {
  component: children[childIndex], 
  index: childIndex});
}, 
  createChild: function(childIndex) {
  _$jscoverage['/container.js'].functionData[12]++;
  _$jscoverage['/container.js'].lineData[172]++;
  var self = this, c, elBefore, domContentEl, children = self.get('children'), cEl, contentEl;
  _$jscoverage['/container.js'].lineData[179]++;
  c = children[childIndex];
  _$jscoverage['/container.js'].lineData[180]++;
  contentEl = self.getChildrenContainerEl();
  _$jscoverage['/container.js'].lineData[181]++;
  domContentEl = contentEl[0];
  _$jscoverage['/container.js'].lineData[182]++;
  elBefore = visit11_182_1(domContentEl.children[childIndex] || null);
  _$jscoverage['/container.js'].lineData[183]++;
  if (visit12_183_1(c.get('rendered'))) {
    _$jscoverage['/container.js'].lineData[184]++;
    cEl = c.el;
    _$jscoverage['/container.js'].lineData[185]++;
    if (visit13_185_1(cEl.parentNode !== domContentEl)) {
      _$jscoverage['/container.js'].lineData[186]++;
      domContentEl.insertBefore(cEl, elBefore);
    }
  } else {
    _$jscoverage['/container.js'].lineData[189]++;
    if (visit14_189_1(elBefore)) {
      _$jscoverage['/container.js'].lineData[190]++;
      c.set('elBefore', elBefore);
    } else {
      _$jscoverage['/container.js'].lineData[192]++;
      c.set('render', contentEl);
    }
    _$jscoverage['/container.js'].lineData[194]++;
    c.create();
  }
  _$jscoverage['/container.js'].lineData[196]++;
  self.fire('afterCreateChild', {
  component: c, 
  index: childIndex});
  _$jscoverage['/container.js'].lineData[201]++;
  return c;
}, 
  addChildren: function(children) {
  _$jscoverage['/container.js'].functionData[13]++;
  _$jscoverage['/container.js'].lineData[206]++;
  var i, l = children.length;
  _$jscoverage['/container.js'].lineData[208]++;
  for (i = 0; visit15_208_1(i < l); i++) {
    _$jscoverage['/container.js'].lineData[209]++;
    this.addChild(children[i]);
  }
}, 
  removeChild: function(c, destroy) {
  _$jscoverage['/container.js'].functionData[14]++;
  _$jscoverage['/container.js'].lineData[226]++;
  if (visit16_226_1(destroy === undefined)) {
    _$jscoverage['/container.js'].lineData[227]++;
    destroy = true;
  }
  _$jscoverage['/container.js'].lineData[229]++;
  this.fire('beforeRemoveChild', {
  component: c, 
  index: S.indexOf(c, this.get('children')), 
  destroy: destroy});
}, 
  removeChildren: function(destroy) {
  _$jscoverage['/container.js'].functionData[15]++;
  _$jscoverage['/container.js'].lineData[244]++;
  var self = this, i, t = [].concat(self.get('children'));
  _$jscoverage['/container.js'].lineData[246]++;
  for (i = 0; visit17_246_1(i < t.length); i++) {
    _$jscoverage['/container.js'].lineData[247]++;
    self.removeChild(t[i], false);
  }
  _$jscoverage['/container.js'].lineData[249]++;
  if (visit18_249_1(visit19_249_2(destroy !== false) && self.$el)) {
    _$jscoverage['/container.js'].lineData[250]++;
    self.getChildrenContainerEl()[0].innerHTML = '';
  }
  _$jscoverage['/container.js'].lineData[252]++;
  return self;
}, 
  getChildAt: function(index) {
  _$jscoverage['/container.js'].functionData[16]++;
  _$jscoverage['/container.js'].lineData[261]++;
  var children = this.get('children');
  _$jscoverage['/container.js'].lineData[262]++;
  return visit20_262_1(children[index] || null);
}, 
  getChildrenContainerEl: function() {
  _$jscoverage['/container.js'].functionData[17]++;
  _$jscoverage['/container.js'].lineData[267]++;
  return this.$el;
}, 
  destructor: function(destroy) {
  _$jscoverage['/container.js'].functionData[18]++;
  _$jscoverage['/container.js'].lineData[275]++;
  this.removeChildren(destroy);
}}, {
  ATTRS: {
  children: {
  valueFn: function() {
  _$jscoverage['/container.js'].functionData[19]++;
  _$jscoverage['/container.js'].lineData[288]++;
  return [];
}, 
  getter: function(v) {
  _$jscoverage['/container.js'].functionData[20]++;
  _$jscoverage['/container.js'].lineData[291]++;
  var defaultChildCfg = null, i, c, self = this;
  _$jscoverage['/container.js'].lineData[294]++;
  for (i = 0; visit21_294_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[295]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[296]++;
    if (visit22_296_1(!c.isControl)) {
      _$jscoverage['/container.js'].lineData[297]++;
      defaultChildCfg = visit23_297_1(defaultChildCfg || self.get('defaultChildCfg'));
      _$jscoverage['/container.js'].lineData[298]++;
      S.mix(c, defaultChildCfg, false);
      _$jscoverage['/container.js'].lineData[299]++;
      v[i] = this.createComponent(c);
    }
  }
  _$jscoverage['/container.js'].lineData[302]++;
  return v;
}, 
  setter: function(v) {
  _$jscoverage['/container.js'].functionData[21]++;
  _$jscoverage['/container.js'].lineData[305]++;
  var i, c;
  _$jscoverage['/container.js'].lineData[308]++;
  for (i = 0; visit24_308_1(i < v.length); i++) {
    _$jscoverage['/container.js'].lineData[309]++;
    c = v[i];
    _$jscoverage['/container.js'].lineData[310]++;
    if (visit25_310_1(c.isControl)) {
      _$jscoverage['/container.js'].lineData[311]++;
      c.setInternal('parent', this);
    }
  }
}}, 
  defaultChildCfg: {
  valueFn: function() {
  _$jscoverage['/container.js'].functionData[22]++;
  _$jscoverage['/container.js'].lineData[326]++;
  return {};
}}}, 
  name: 'container'});
});
