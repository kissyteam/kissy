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
if (! _$jscoverage['/features.js']) {
  _$jscoverage['/features.js'] = {};
  _$jscoverage['/features.js'].lineData = [];
  _$jscoverage['/features.js'].lineData[6] = 0;
  _$jscoverage['/features.js'].lineData[7] = 0;
  _$jscoverage['/features.js'].lineData[36] = 0;
  _$jscoverage['/features.js'].lineData[37] = 0;
  _$jscoverage['/features.js'].lineData[40] = 0;
  _$jscoverage['/features.js'].lineData[42] = 0;
  _$jscoverage['/features.js'].lineData[44] = 0;
  _$jscoverage['/features.js'].lineData[45] = 0;
  _$jscoverage['/features.js'].lineData[47] = 0;
  _$jscoverage['/features.js'].lineData[49] = 0;
  _$jscoverage['/features.js'].lineData[50] = 0;
  _$jscoverage['/features.js'].lineData[52] = 0;
  _$jscoverage['/features.js'].lineData[54] = 0;
  _$jscoverage['/features.js'].lineData[55] = 0;
  _$jscoverage['/features.js'].lineData[59] = 0;
  _$jscoverage['/features.js'].lineData[60] = 0;
  _$jscoverage['/features.js'].lineData[61] = 0;
  _$jscoverage['/features.js'].lineData[62] = 0;
  _$jscoverage['/features.js'].lineData[64] = 0;
  _$jscoverage['/features.js'].lineData[68] = 0;
  _$jscoverage['/features.js'].lineData[69] = 0;
  _$jscoverage['/features.js'].lineData[70] = 0;
  _$jscoverage['/features.js'].lineData[71] = 0;
  _$jscoverage['/features.js'].lineData[72] = 0;
  _$jscoverage['/features.js'].lineData[73] = 0;
  _$jscoverage['/features.js'].lineData[74] = 0;
  _$jscoverage['/features.js'].lineData[75] = 0;
  _$jscoverage['/features.js'].lineData[78] = 0;
  _$jscoverage['/features.js'].lineData[83] = 0;
  _$jscoverage['/features.js'].lineData[85] = 0;
  _$jscoverage['/features.js'].lineData[86] = 0;
  _$jscoverage['/features.js'].lineData[87] = 0;
  _$jscoverage['/features.js'].lineData[90] = 0;
  _$jscoverage['/features.js'].lineData[91] = 0;
  _$jscoverage['/features.js'].lineData[96] = 0;
  _$jscoverage['/features.js'].lineData[100] = 0;
  _$jscoverage['/features.js'].lineData[101] = 0;
  _$jscoverage['/features.js'].lineData[102] = 0;
  _$jscoverage['/features.js'].lineData[103] = 0;
  _$jscoverage['/features.js'].lineData[110] = 0;
  _$jscoverage['/features.js'].lineData[115] = 0;
  _$jscoverage['/features.js'].lineData[124] = 0;
  _$jscoverage['/features.js'].lineData[132] = 0;
  _$jscoverage['/features.js'].lineData[141] = 0;
  _$jscoverage['/features.js'].lineData[149] = 0;
  _$jscoverage['/features.js'].lineData[153] = 0;
  _$jscoverage['/features.js'].lineData[161] = 0;
  _$jscoverage['/features.js'].lineData[172] = 0;
  _$jscoverage['/features.js'].lineData[180] = 0;
  _$jscoverage['/features.js'].lineData[188] = 0;
  _$jscoverage['/features.js'].lineData[196] = 0;
  _$jscoverage['/features.js'].lineData[204] = 0;
  _$jscoverage['/features.js'].lineData[213] = 0;
  _$jscoverage['/features.js'].lineData[223] = 0;
  _$jscoverage['/features.js'].lineData[231] = 0;
  _$jscoverage['/features.js'].lineData[239] = 0;
  _$jscoverage['/features.js'].lineData[247] = 0;
  _$jscoverage['/features.js'].lineData[255] = 0;
  _$jscoverage['/features.js'].lineData[259] = 0;
  _$jscoverage['/features.js'].lineData[263] = 0;
}
if (! _$jscoverage['/features.js'].functionData) {
  _$jscoverage['/features.js'].functionData = [];
  _$jscoverage['/features.js'].functionData[0] = 0;
  _$jscoverage['/features.js'].functionData[1] = 0;
  _$jscoverage['/features.js'].functionData[2] = 0;
  _$jscoverage['/features.js'].functionData[3] = 0;
  _$jscoverage['/features.js'].functionData[4] = 0;
  _$jscoverage['/features.js'].functionData[5] = 0;
  _$jscoverage['/features.js'].functionData[6] = 0;
  _$jscoverage['/features.js'].functionData[7] = 0;
  _$jscoverage['/features.js'].functionData[8] = 0;
  _$jscoverage['/features.js'].functionData[9] = 0;
  _$jscoverage['/features.js'].functionData[10] = 0;
  _$jscoverage['/features.js'].functionData[11] = 0;
  _$jscoverage['/features.js'].functionData[12] = 0;
  _$jscoverage['/features.js'].functionData[13] = 0;
  _$jscoverage['/features.js'].functionData[14] = 0;
  _$jscoverage['/features.js'].functionData[15] = 0;
  _$jscoverage['/features.js'].functionData[16] = 0;
  _$jscoverage['/features.js'].functionData[17] = 0;
  _$jscoverage['/features.js'].functionData[18] = 0;
  _$jscoverage['/features.js'].functionData[19] = 0;
  _$jscoverage['/features.js'].functionData[20] = 0;
}
if (! _$jscoverage['/features.js'].branchData) {
  _$jscoverage['/features.js'].branchData = {};
  _$jscoverage['/features.js'].branchData['19'] = [];
  _$jscoverage['/features.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['33'] = [];
  _$jscoverage['/features.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['36'] = [];
  _$jscoverage['/features.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['37'] = [];
  _$jscoverage['/features.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['39'] = [];
  _$jscoverage['/features.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['47'] = [];
  _$jscoverage['/features.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['47'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['52'] = [];
  _$jscoverage['/features.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['60'] = [];
  _$jscoverage['/features.js'].branchData['60'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['64'] = [];
  _$jscoverage['/features.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['73'] = [];
  _$jscoverage['/features.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['75'] = [];
  _$jscoverage['/features.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['75'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['75'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['75'][4] = new BranchData();
  _$jscoverage['/features.js'].branchData['75'][5] = new BranchData();
  _$jscoverage['/features.js'].branchData['86'] = [];
  _$jscoverage['/features.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['90'] = [];
  _$jscoverage['/features.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['102'] = [];
  _$jscoverage['/features.js'].branchData['102'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['110'] = [];
  _$jscoverage['/features.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['153'] = [];
  _$jscoverage['/features.js'].branchData['153'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['153'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['172'] = [];
  _$jscoverage['/features.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['172'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['172'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['180'] = [];
  _$jscoverage['/features.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['188'] = [];
  _$jscoverage['/features.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['213'] = [];
  _$jscoverage['/features.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['223'] = [];
  _$jscoverage['/features.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['223'][2] = new BranchData();
}
_$jscoverage['/features.js'].branchData['223'][2].init(29, 6, 'ie < v');
function visit40_223_2(result) {
  _$jscoverage['/features.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['223'][1].init(23, 12, 'ie && ie < v');
function visit39_223_1(result) {
  _$jscoverage['/features.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['213'][1].init(67, 74, '!S.config(\'dom/selector\') && isQuerySelectorSupportedState');
function visit38_213_1(result) {
  _$jscoverage['/features.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['188'][1].init(20, 29, 'transformPrefix !== undefined');
function visit37_188_1(result) {
  _$jscoverage['/features.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['180'][1].init(20, 30, 'transitionPrefix !== undefined');
function visit36_180_1(result) {
  _$jscoverage['/features.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['172'][3].init(193, 6, 'ie > 7');
function visit35_172_3(result) {
  _$jscoverage['/features.js'].branchData['172'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['172'][2].init(186, 13, '!ie || ie > 7');
function visit34_172_2(result) {
  _$jscoverage['/features.js'].branchData['172'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['172'][1].init(159, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit33_172_1(result) {
  _$jscoverage['/features.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['153'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit32_153_2(result) {
  _$jscoverage['/features.js'].branchData['153'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['153'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit31_153_1(result) {
  _$jscoverage['/features.js'].branchData['153'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['110'][1].init(502, 94, 'vendorInfos[name] || {\n  name: name, \n  prefix: false}');
function visit30_110_1(result) {
  _$jscoverage['/features.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['102'][1].init(79, 34, 'vendorName in documentElementStyle');
function visit29_102_1(result) {
  _$jscoverage['/features.js'].branchData['102'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['90'][1].init(147, 53, '!documentElementStyle || name in documentElementStyle');
function visit28_90_1(result) {
  _$jscoverage['/features.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['86'][1].init(13, 17, 'vendorInfos[name]');
function visit27_86_1(result) {
  _$jscoverage['/features.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['75'][5].init(513, 16, 'has3d !== \'none\'');
function visit26_75_5(result) {
  _$jscoverage['/features.js'].branchData['75'][5].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['75'][4].init(493, 16, 'has3d.length > 0');
function visit25_75_4(result) {
  _$jscoverage['/features.js'].branchData['75'][4].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['75'][3].init(493, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit24_75_3(result) {
  _$jscoverage['/features.js'].branchData['75'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['75'][2].init(470, 19, 'has3d !== undefined');
function visit23_75_2(result) {
  _$jscoverage['/features.js'].branchData['75'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['75'][1].init(470, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit22_75_1(result) {
  _$jscoverage['/features.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['73'][1].init(292, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit21_73_1(result) {
  _$jscoverage['/features.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['64'][1].init(1063, 17, 'transformProperty');
function visit20_64_1(result) {
  _$jscoverage['/features.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['60'][1].init(904, 19, 'win.navigator || {}');
function visit19_60_1(result) {
  _$jscoverage['/features.js'].branchData['60'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['52'][2].init(361, 29, 'transformPrefix === undefined');
function visit18_52_2(result) {
  _$jscoverage['/features.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['52'][1].init(361, 82, 'transformPrefix === undefined && transform in documentElementStyle');
function visit17_52_1(result) {
  _$jscoverage['/features.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['47'][2].init(154, 30, 'transitionPrefix === undefined');
function visit16_47_2(result) {
  _$jscoverage['/features.js'].branchData['47'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['47'][1].init(154, 84, 'transitionPrefix === undefined && transition in documentElementStyle');
function visit15_47_1(result) {
  _$jscoverage['/features.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['39'][1].init(70, 8, 'ie !== 8');
function visit14_39_1(result) {
  _$jscoverage['/features.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['37'][1].init(13, 79, 'documentElement.querySelector && ie !== 8');
function visit13_37_1(result) {
  _$jscoverage['/features.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['36'][1].init(839, 15, 'documentElement');
function visit12_36_1(result) {
  _$jscoverage['/features.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['33'][1].init(757, 41, '(\'ontouchstart\' in doc) && !(UA.phantomjs)');
function visit11_33_1(result) {
  _$jscoverage['/features.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['19'][1].init(245, 18, 'win.document || {}');
function visit10_19_1(result) {
  _$jscoverage['/features.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/features.js'].functionData[0]++;
  _$jscoverage['/features.js'].lineData[7]++;
  var Env = S.Env, win = Env.host, UA = S.UA, VENDORS = ['', 'Webkit', 'Moz', 'O', 'ms'], doc = visit10_19_1(win.document || {}), isMsPointerSupported, isPointerSupported, transitionProperty, transformProperty, transitionPrefix, transformPrefix, isTransform3dSupported, documentElement = doc.documentElement, documentElementStyle, isClassListSupportedState = true, isQuerySelectorSupportedState = false, isTouchEventSupportedState = visit11_33_1(('ontouchstart' in doc) && !(UA.phantomjs)), ie = UA.ieMode;
  _$jscoverage['/features.js'].lineData[36]++;
  if (visit12_36_1(documentElement)) {
    _$jscoverage['/features.js'].lineData[37]++;
    if (visit13_37_1(documentElement.querySelector && visit14_39_1(ie !== 8))) {
      _$jscoverage['/features.js'].lineData[40]++;
      isQuerySelectorSupportedState = true;
    }
    _$jscoverage['/features.js'].lineData[42]++;
    documentElementStyle = documentElement.style;
    _$jscoverage['/features.js'].lineData[44]++;
    S.each(VENDORS, function(val) {
  _$jscoverage['/features.js'].functionData[1]++;
  _$jscoverage['/features.js'].lineData[45]++;
  var transition = val ? val + 'Transition' : 'transition', transform = val ? val + 'Transform' : 'transform';
  _$jscoverage['/features.js'].lineData[47]++;
  if (visit15_47_1(visit16_47_2(transitionPrefix === undefined) && transition in documentElementStyle)) {
    _$jscoverage['/features.js'].lineData[49]++;
    transitionPrefix = val;
    _$jscoverage['/features.js'].lineData[50]++;
    transitionProperty = transition;
  }
  _$jscoverage['/features.js'].lineData[52]++;
  if (visit17_52_1(visit18_52_2(transformPrefix === undefined) && transform in documentElementStyle)) {
    _$jscoverage['/features.js'].lineData[54]++;
    transformPrefix = val;
    _$jscoverage['/features.js'].lineData[55]++;
    transformProperty = transform;
  }
});
    _$jscoverage['/features.js'].lineData[59]++;
    isClassListSupportedState = 'classList' in documentElement;
    _$jscoverage['/features.js'].lineData[60]++;
    var navigator = (visit19_60_1(win.navigator || {}));
    _$jscoverage['/features.js'].lineData[61]++;
    isMsPointerSupported = 'msPointerEnabled' in navigator;
    _$jscoverage['/features.js'].lineData[62]++;
    isPointerSupported = 'pointerEnabled' in navigator;
    _$jscoverage['/features.js'].lineData[64]++;
    if (visit20_64_1(transformProperty)) {
      _$jscoverage['/features.js'].lineData[68]++;
      try {
        _$jscoverage['/features.js'].lineData[69]++;
        var el = doc.createElement('p');
        _$jscoverage['/features.js'].lineData[70]++;
        documentElement.insertBefore(el, documentElement.firstChild);
        _$jscoverage['/features.js'].lineData[71]++;
        el.style[transformProperty] = 'translate3d(1px,1px,1px)';
        _$jscoverage['/features.js'].lineData[72]++;
        var computedStyle = win.getComputedStyle(el);
        _$jscoverage['/features.js'].lineData[73]++;
        var has3d = visit21_73_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
        _$jscoverage['/features.js'].lineData[74]++;
        documentElement.removeChild(el);
        _$jscoverage['/features.js'].lineData[75]++;
        isTransform3dSupported = (visit22_75_1(visit23_75_2(has3d !== undefined) && visit24_75_3(visit25_75_4(has3d.length > 0) && visit26_75_5(has3d !== 'none'))));
      }      catch (e) {
  _$jscoverage['/features.js'].lineData[78]++;
  isTransform3dSupported = true;
}
    }
  }
  _$jscoverage['/features.js'].lineData[83]++;
  var vendorInfos = {};
  _$jscoverage['/features.js'].lineData[85]++;
  function getVendorInfo(name) {
    _$jscoverage['/features.js'].functionData[2]++;
    _$jscoverage['/features.js'].lineData[86]++;
    if (visit27_86_1(vendorInfos[name])) {
      _$jscoverage['/features.js'].lineData[87]++;
      return vendorInfos[name];
    }
    _$jscoverage['/features.js'].lineData[90]++;
    if (visit28_90_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/features.js'].lineData[91]++;
      vendorInfos[name] = {
  name: name, 
  prefix: ''};
    } else {
      _$jscoverage['/features.js'].lineData[96]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName, i = VENDORS.length;
      _$jscoverage['/features.js'].lineData[100]++;
      while (i--) {
        _$jscoverage['/features.js'].lineData[101]++;
        vendorName = VENDORS[i] + upperFirstName;
        _$jscoverage['/features.js'].lineData[102]++;
        if (visit29_102_1(vendorName in documentElementStyle)) {
          _$jscoverage['/features.js'].lineData[103]++;
          vendorInfos[name] = {
  name: vendorName, 
  prefix: VENDORS[i]};
        }
      }
      _$jscoverage['/features.js'].lineData[110]++;
      vendorInfos[name] = visit30_110_1(vendorInfos[name] || {
  name: name, 
  prefix: false});
    }
    _$jscoverage['/features.js'].lineData[115]++;
    return vendorInfos[name];
  }
  _$jscoverage['/features.js'].lineData[124]++;
  S.Features = {
  isMsPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[3]++;
  _$jscoverage['/features.js'].lineData[132]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[4]++;
  _$jscoverage['/features.js'].lineData[141]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/features.js'].functionData[5]++;
  _$jscoverage['/features.js'].lineData[149]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/features.js'].functionData[6]++;
  _$jscoverage['/features.js'].lineData[153]++;
  return visit31_153_1(isTouchEventSupportedState || visit32_153_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/features.js'].functionData[7]++;
  _$jscoverage['/features.js'].lineData[161]++;
  return !!win.DeviceMotionEvent;
}, 
  'isHashChangeSupported': function() {
  _$jscoverage['/features.js'].functionData[8]++;
  _$jscoverage['/features.js'].lineData[172]++;
  return visit33_172_1(('onhashchange' in win) && (visit34_172_2(!ie || visit35_172_3(ie > 7))));
}, 
  'isTransitionSupported': function() {
  _$jscoverage['/features.js'].functionData[9]++;
  _$jscoverage['/features.js'].lineData[180]++;
  return visit36_180_1(transitionPrefix !== undefined);
}, 
  'isTransformSupported': function() {
  _$jscoverage['/features.js'].functionData[10]++;
  _$jscoverage['/features.js'].lineData[188]++;
  return visit37_188_1(transformPrefix !== undefined);
}, 
  'isTransform3dSupported': function() {
  _$jscoverage['/features.js'].functionData[11]++;
  _$jscoverage['/features.js'].lineData[196]++;
  return isTransform3dSupported;
}, 
  'isClassListSupported': function() {
  _$jscoverage['/features.js'].functionData[12]++;
  _$jscoverage['/features.js'].lineData[204]++;
  return isClassListSupportedState;
}, 
  'isQuerySelectorSupported': function() {
  _$jscoverage['/features.js'].functionData[13]++;
  _$jscoverage['/features.js'].lineData[213]++;
  return visit38_213_1(!S.config('dom/selector') && isQuerySelectorSupportedState);
}, 
  'isIELessThan': function(v) {
  _$jscoverage['/features.js'].functionData[14]++;
  _$jscoverage['/features.js'].lineData[223]++;
  return !!(visit39_223_1(ie && visit40_223_2(ie < v)));
}, 
  'getTransitionPrefix': function() {
  _$jscoverage['/features.js'].functionData[15]++;
  _$jscoverage['/features.js'].lineData[231]++;
  return transitionPrefix;
}, 
  'getTransformPrefix': function() {
  _$jscoverage['/features.js'].functionData[16]++;
  _$jscoverage['/features.js'].lineData[239]++;
  return transformPrefix;
}, 
  'getTransitionProperty': function() {
  _$jscoverage['/features.js'].functionData[17]++;
  _$jscoverage['/features.js'].lineData[247]++;
  return transitionProperty;
}, 
  'getTransformProperty': function() {
  _$jscoverage['/features.js'].functionData[18]++;
  _$jscoverage['/features.js'].lineData[255]++;
  return transformProperty;
}, 
  getVendorCssPropPrefix: function(name) {
  _$jscoverage['/features.js'].functionData[19]++;
  _$jscoverage['/features.js'].lineData[259]++;
  return getVendorInfo(name).prefix;
}, 
  getVendorCssPropName: function(name) {
  _$jscoverage['/features.js'].functionData[20]++;
  _$jscoverage['/features.js'].lineData[263]++;
  return getVendorInfo(name).name;
}};
})(KISSY);
