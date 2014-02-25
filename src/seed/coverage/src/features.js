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
  _$jscoverage['/features.js'].lineData[78] = 0;
  _$jscoverage['/features.js'].lineData[80] = 0;
  _$jscoverage['/features.js'].lineData[81] = 0;
  _$jscoverage['/features.js'].lineData[82] = 0;
  _$jscoverage['/features.js'].lineData[85] = 0;
  _$jscoverage['/features.js'].lineData[86] = 0;
  _$jscoverage['/features.js'].lineData[91] = 0;
  _$jscoverage['/features.js'].lineData[95] = 0;
  _$jscoverage['/features.js'].lineData[96] = 0;
  _$jscoverage['/features.js'].lineData[97] = 0;
  _$jscoverage['/features.js'].lineData[98] = 0;
  _$jscoverage['/features.js'].lineData[105] = 0;
  _$jscoverage['/features.js'].lineData[110] = 0;
  _$jscoverage['/features.js'].lineData[119] = 0;
  _$jscoverage['/features.js'].lineData[127] = 0;
  _$jscoverage['/features.js'].lineData[136] = 0;
  _$jscoverage['/features.js'].lineData[144] = 0;
  _$jscoverage['/features.js'].lineData[148] = 0;
  _$jscoverage['/features.js'].lineData[156] = 0;
  _$jscoverage['/features.js'].lineData[167] = 0;
  _$jscoverage['/features.js'].lineData[175] = 0;
  _$jscoverage['/features.js'].lineData[183] = 0;
  _$jscoverage['/features.js'].lineData[191] = 0;
  _$jscoverage['/features.js'].lineData[199] = 0;
  _$jscoverage['/features.js'].lineData[208] = 0;
  _$jscoverage['/features.js'].lineData[218] = 0;
  _$jscoverage['/features.js'].lineData[226] = 0;
  _$jscoverage['/features.js'].lineData[234] = 0;
  _$jscoverage['/features.js'].lineData[242] = 0;
  _$jscoverage['/features.js'].lineData[250] = 0;
  _$jscoverage['/features.js'].lineData[254] = 0;
  _$jscoverage['/features.js'].lineData[258] = 0;
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
  _$jscoverage['/features.js'].branchData['72'] = [];
  _$jscoverage['/features.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['74'] = [];
  _$jscoverage['/features.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['74'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['74'][4] = new BranchData();
  _$jscoverage['/features.js'].branchData['74'][5] = new BranchData();
  _$jscoverage['/features.js'].branchData['81'] = [];
  _$jscoverage['/features.js'].branchData['81'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['85'] = [];
  _$jscoverage['/features.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['97'] = [];
  _$jscoverage['/features.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['105'] = [];
  _$jscoverage['/features.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['148'] = [];
  _$jscoverage['/features.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['148'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['167'] = [];
  _$jscoverage['/features.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/features.js'].branchData['167'][3] = new BranchData();
  _$jscoverage['/features.js'].branchData['175'] = [];
  _$jscoverage['/features.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['183'] = [];
  _$jscoverage['/features.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['208'] = [];
  _$jscoverage['/features.js'].branchData['208'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['218'] = [];
  _$jscoverage['/features.js'].branchData['218'][1] = new BranchData();
  _$jscoverage['/features.js'].branchData['218'][2] = new BranchData();
}
_$jscoverage['/features.js'].branchData['218'][2].init(29, 6, 'ie < v');
function visit40_218_2(result) {
  _$jscoverage['/features.js'].branchData['218'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['218'][1].init(23, 12, 'ie && ie < v');
function visit39_218_1(result) {
  _$jscoverage['/features.js'].branchData['218'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['208'][1].init(67, 74, '!S.config(\'dom/selector\') && isQuerySelectorSupportedState');
function visit38_208_1(result) {
  _$jscoverage['/features.js'].branchData['208'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['183'][1].init(20, 29, 'transformPrefix !== undefined');
function visit37_183_1(result) {
  _$jscoverage['/features.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['175'][1].init(20, 30, 'transitionPrefix !== undefined');
function visit36_175_1(result) {
  _$jscoverage['/features.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['167'][3].init(193, 6, 'ie > 7');
function visit35_167_3(result) {
  _$jscoverage['/features.js'].branchData['167'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['167'][2].init(186, 13, '!ie || ie > 7');
function visit34_167_2(result) {
  _$jscoverage['/features.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['167'][1].init(159, 41, '(\'onhashchange\' in win) && (!ie || ie > 7)');
function visit33_167_1(result) {
  _$jscoverage['/features.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['148'][2].init(50, 42, 'isPointerSupported || isMsPointerSupported');
function visit32_148_2(result) {
  _$jscoverage['/features.js'].branchData['148'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['148'][1].init(20, 72, 'isTouchEventSupportedState || isPointerSupported || isMsPointerSupported');
function visit31_148_1(result) {
  _$jscoverage['/features.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['105'][1].init(502, 94, 'vendorInfos[name] || {\n  name: name, \n  prefix: false}');
function visit30_105_1(result) {
  _$jscoverage['/features.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['97'][1].init(79, 34, 'vendorName in documentElementStyle');
function visit29_97_1(result) {
  _$jscoverage['/features.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['85'][1].init(147, 53, '!documentElementStyle || name in documentElementStyle');
function visit28_85_1(result) {
  _$jscoverage['/features.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['81'][1].init(13, 17, 'vendorInfos[name]');
function visit27_81_1(result) {
  _$jscoverage['/features.js'].branchData['81'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['74'][5].init(656, 16, 'has3d !== \'none\'');
function visit26_74_5(result) {
  _$jscoverage['/features.js'].branchData['74'][5].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['74'][4].init(636, 16, 'has3d.length > 0');
function visit25_74_4(result) {
  _$jscoverage['/features.js'].branchData['74'][4].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['74'][3].init(636, 36, 'has3d.length > 0 && has3d !== \'none\'');
function visit24_74_3(result) {
  _$jscoverage['/features.js'].branchData['74'][3].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['74'][2].init(613, 19, 'has3d !== undefined');
function visit23_74_2(result) {
  _$jscoverage['/features.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['74'][1].init(613, 59, 'has3d !== undefined && has3d.length > 0 && has3d !== \'none\'');
function visit22_74_1(result) {
  _$jscoverage['/features.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/features.js'].branchData['72'][1].init(443, 85, 'computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]');
function visit21_72_1(result) {
  _$jscoverage['/features.js'].branchData['72'][1].ranCondition(result);
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
      var el = doc.createElement('p');
      _$jscoverage['/features.js'].lineData[69]++;
      documentElement.insertBefore(el, documentElement.firstChild);
      _$jscoverage['/features.js'].lineData[70]++;
      el.style[transformProperty] = 'translate3d(1px,1px,1px)';
      _$jscoverage['/features.js'].lineData[71]++;
      var computedStyle = win.getComputedStyle(el);
      _$jscoverage['/features.js'].lineData[72]++;
      var has3d = visit21_72_1(computedStyle.getPropertyValue(transformProperty) || computedStyle[transformProperty]);
      _$jscoverage['/features.js'].lineData[73]++;
      documentElement.removeChild(el);
      _$jscoverage['/features.js'].lineData[74]++;
      isTransform3dSupported = (visit22_74_1(visit23_74_2(has3d !== undefined) && visit24_74_3(visit25_74_4(has3d.length > 0) && visit26_74_5(has3d !== 'none'))));
    }
  }
  _$jscoverage['/features.js'].lineData[78]++;
  var vendorInfos = {};
  _$jscoverage['/features.js'].lineData[80]++;
  function getVendorInfo(name) {
    _$jscoverage['/features.js'].functionData[2]++;
    _$jscoverage['/features.js'].lineData[81]++;
    if (visit27_81_1(vendorInfos[name])) {
      _$jscoverage['/features.js'].lineData[82]++;
      return vendorInfos[name];
    }
    _$jscoverage['/features.js'].lineData[85]++;
    if (visit28_85_1(!documentElementStyle || name in documentElementStyle)) {
      _$jscoverage['/features.js'].lineData[86]++;
      vendorInfos[name] = {
  name: name, 
  prefix: ''};
    } else {
      _$jscoverage['/features.js'].lineData[91]++;
      var upperFirstName = name.charAt(0).toUpperCase() + name.slice(1), vendorName, i = VENDORS.length;
      _$jscoverage['/features.js'].lineData[95]++;
      while (i--) {
        _$jscoverage['/features.js'].lineData[96]++;
        vendorName = VENDORS[i] + upperFirstName;
        _$jscoverage['/features.js'].lineData[97]++;
        if (visit29_97_1(vendorName in documentElementStyle)) {
          _$jscoverage['/features.js'].lineData[98]++;
          vendorInfos[name] = {
  name: vendorName, 
  prefix: VENDORS[i]};
        }
      }
      _$jscoverage['/features.js'].lineData[105]++;
      vendorInfos[name] = visit30_105_1(vendorInfos[name] || {
  name: name, 
  prefix: false});
    }
    _$jscoverage['/features.js'].lineData[110]++;
    return vendorInfos[name];
  }
  _$jscoverage['/features.js'].lineData[119]++;
  S.Features = {
  isMsPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[3]++;
  _$jscoverage['/features.js'].lineData[127]++;
  return isMsPointerSupported;
}, 
  isPointerSupported: function() {
  _$jscoverage['/features.js'].functionData[4]++;
  _$jscoverage['/features.js'].lineData[136]++;
  return isPointerSupported;
}, 
  isTouchEventSupported: function() {
  _$jscoverage['/features.js'].functionData[5]++;
  _$jscoverage['/features.js'].lineData[144]++;
  return isTouchEventSupportedState;
}, 
  isTouchGestureSupported: function() {
  _$jscoverage['/features.js'].functionData[6]++;
  _$jscoverage['/features.js'].lineData[148]++;
  return visit31_148_1(isTouchEventSupportedState || visit32_148_2(isPointerSupported || isMsPointerSupported));
}, 
  isDeviceMotionSupported: function() {
  _$jscoverage['/features.js'].functionData[7]++;
  _$jscoverage['/features.js'].lineData[156]++;
  return !!win.DeviceMotionEvent;
}, 
  'isHashChangeSupported': function() {
  _$jscoverage['/features.js'].functionData[8]++;
  _$jscoverage['/features.js'].lineData[167]++;
  return visit33_167_1(('onhashchange' in win) && (visit34_167_2(!ie || visit35_167_3(ie > 7))));
}, 
  'isTransitionSupported': function() {
  _$jscoverage['/features.js'].functionData[9]++;
  _$jscoverage['/features.js'].lineData[175]++;
  return visit36_175_1(transitionPrefix !== undefined);
}, 
  'isTransformSupported': function() {
  _$jscoverage['/features.js'].functionData[10]++;
  _$jscoverage['/features.js'].lineData[183]++;
  return visit37_183_1(transformPrefix !== undefined);
}, 
  'isTransform3dSupported': function() {
  _$jscoverage['/features.js'].functionData[11]++;
  _$jscoverage['/features.js'].lineData[191]++;
  return isTransform3dSupported;
}, 
  'isClassListSupported': function() {
  _$jscoverage['/features.js'].functionData[12]++;
  _$jscoverage['/features.js'].lineData[199]++;
  return isClassListSupportedState;
}, 
  'isQuerySelectorSupported': function() {
  _$jscoverage['/features.js'].functionData[13]++;
  _$jscoverage['/features.js'].lineData[208]++;
  return visit38_208_1(!S.config('dom/selector') && isQuerySelectorSupportedState);
}, 
  'isIELessThan': function(v) {
  _$jscoverage['/features.js'].functionData[14]++;
  _$jscoverage['/features.js'].lineData[218]++;
  return !!(visit39_218_1(ie && visit40_218_2(ie < v)));
}, 
  'getTransitionPrefix': function() {
  _$jscoverage['/features.js'].functionData[15]++;
  _$jscoverage['/features.js'].lineData[226]++;
  return transitionPrefix;
}, 
  'getTransformPrefix': function() {
  _$jscoverage['/features.js'].functionData[16]++;
  _$jscoverage['/features.js'].lineData[234]++;
  return transformPrefix;
}, 
  'getTransitionProperty': function() {
  _$jscoverage['/features.js'].functionData[17]++;
  _$jscoverage['/features.js'].lineData[242]++;
  return transitionProperty;
}, 
  'getTransformProperty': function() {
  _$jscoverage['/features.js'].functionData[18]++;
  _$jscoverage['/features.js'].lineData[250]++;
  return transformProperty;
}, 
  getVendorCssPropPrefix: function(name) {
  _$jscoverage['/features.js'].functionData[19]++;
  _$jscoverage['/features.js'].lineData[254]++;
  return getVendorInfo(name).prefix;
}, 
  getVendorCssPropName: function(name) {
  _$jscoverage['/features.js'].functionData[20]++;
  _$jscoverage['/features.js'].lineData[258]++;
  return getVendorInfo(name).name;
}};
})(KISSY);
