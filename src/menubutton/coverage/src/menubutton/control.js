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
if (! _$jscoverage['/menubutton/control.js']) {
  _$jscoverage['/menubutton/control.js'] = {};
  _$jscoverage['/menubutton/control.js'].lineData = [];
  _$jscoverage['/menubutton/control.js'].lineData[6] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[7] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[8] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[9] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[11] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[18] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[22] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[24] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[25] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[27] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[28] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[31] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[39] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[40] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[41] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[42] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[43] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[46] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[48] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[49] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[55] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[56] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[58] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[71] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[77] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[79] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[80] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[81] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[83] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[84] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[87] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[88] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[90] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[91] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[92] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[94] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[98] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[101] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[102] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[104] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[115] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[118] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[130] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[131] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[133] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[143] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[144] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[153] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[154] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[162] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[163] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[164] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[165] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[166] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[167] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[177] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[178] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[183] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[184] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[189] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[236] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[237] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[238] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[239] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[241] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[244] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[245] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[269] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[270] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[271] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[275] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[276] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[277] = 0;
  _$jscoverage['/menubutton/control.js'].lineData[279] = 0;
}
if (! _$jscoverage['/menubutton/control.js'].functionData) {
  _$jscoverage['/menubutton/control.js'].functionData = [];
  _$jscoverage['/menubutton/control.js'].functionData[0] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[1] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[2] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[3] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[4] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[5] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[6] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[7] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[8] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[9] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[10] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[11] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[12] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[13] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[14] = 0;
  _$jscoverage['/menubutton/control.js'].functionData[15] = 0;
}
if (! _$jscoverage['/menubutton/control.js'].branchData) {
  _$jscoverage['/menubutton/control.js'].branchData = {};
  _$jscoverage['/menubutton/control.js'].branchData['24'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['24'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['28'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['40'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['44'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['45'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['77'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['77'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['80'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['80'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['83'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['87'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['90'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['98'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['98'][2] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['99'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['99'][2] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['100'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['163'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['164'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['164'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['166'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['178'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['183'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['236'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['237'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['237'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['244'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['244'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['270'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['276'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['279'] = [];
  _$jscoverage['/menubutton/control.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/menubutton/control.js'].branchData['279'][2] = new BranchData();
}
_$jscoverage['/menubutton/control.js'].branchData['279'][2].init(41, 26, 'menuItem && menuItem.el.id');
function visit27_279_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['279'][1].init(121, 32, 'menuItem && menuItem.el.id || \'\'');
function visit26_279_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['276'][1].init(13, 15, 'e.target.isMenu');
function visit25_276_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['270'][1].init(13, 50, 'e.target.isMenuItem && this.get(\'collapseOnClick\')');
function visit24_270_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['244'][1].init(25, 11, 'm.isControl');
function visit23_244_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['244'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['237'][1].init(36, 23, 'v.xclass || \'popupmenu\'');
function visit22_237_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['237'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['236'][1].init(25, 12, '!v.isControl');
function visit21_236_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['183'][1].init(16, 2, '!v');
function visit20_183_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['178'][1].init(61, 46, 'menu.get(\'rendered\') && menu.getChildAt(index)');
function visit19_178_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['166'][1].init(122, 13, 'menu.children');
function visit18_166_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['164'][1].init(21, 19, 'menu.removeChildren');
function visit17_164_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['164'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['163'][1].init(58, 4, 'menu');
function visit16_163_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['100'][1].init(43, 22, 'keyCode === KeyCode.UP');
function visit15_100_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['99'][2].init(1029, 24, 'keyCode === KeyCode.DOWN');
function visit14_99_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['99'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['99'][1].init(44, 66, 'keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit13_99_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['98'][2].init(982, 25, 'keyCode === KeyCode.SPACE');
function visit12_98_2(result) {
  _$jscoverage['/menubutton/control.js'].branchData['98'][2].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['98'][1].init(982, 111, 'keyCode === KeyCode.SPACE || keyCode === KeyCode.DOWN || keyCode === KeyCode.UP');
function visit11_98_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['90'][1].init(111, 23, 'keyCode === KeyCode.ESC');
function visit10_90_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['87'][1].init(547, 43, 'menu.get(\'rendered\') && menu.get(\'visible\')');
function visit9_87_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['83'][1].init(436, 18, 'type !== \'keydown\'');
function visit8_83_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['80'][1].init(110, 16, 'type !== \'keyup\'');
function visit7_80_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['80'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['77'][1].init(198, 25, 'keyCode === KeyCode.SPACE');
function visit6_77_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['77'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['45'][1].init(80, 45, 'parseInt(menuEl.css(\'borderRightWidth\')) || 0');
function visit5_45_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['44'][1].init(42, 44, 'parseInt(menuEl.css(\'borderLeftWidth\')) || 0');
function visit4_44_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['40'][1].init(478, 24, 'self.get(\'matchElWidth\')');
function visit3_40_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['28'][1].init(56, 20, '!menu.get(\'visible\')');
function visit2_28_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].branchData['24'][1].init(87, 1, 'v');
function visit1_24_1(result) {
  _$jscoverage['/menubutton/control.js'].branchData['24'][1].ranCondition(result);
  return result;
}_$jscoverage['/menubutton/control.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/menubutton/control.js'].functionData[0]++;
  _$jscoverage['/menubutton/control.js'].lineData[7]++;
  var Node = require('node');
  _$jscoverage['/menubutton/control.js'].lineData[8]++;
  var Button = require('button');
  _$jscoverage['/menubutton/control.js'].lineData[9]++;
  var MenuButtonRender = require('./render');
  _$jscoverage['/menubutton/control.js'].lineData[11]++;
  var KeyCode = Node.KeyCode;
  _$jscoverage['/menubutton/control.js'].lineData[18]++;
  return Button.extend({
  isMenuButton: 1, 
  _onSetCollapsed: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[1]++;
  _$jscoverage['/menubutton/control.js'].lineData[22]++;
  var self = this, menu = self.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[24]++;
  if (visit1_24_1(v)) {
    _$jscoverage['/menubutton/control.js'].lineData[25]++;
    menu.hide();
  } else {
    _$jscoverage['/menubutton/control.js'].lineData[27]++;
    var el = self.$el;
    _$jscoverage['/menubutton/control.js'].lineData[28]++;
    if (visit2_28_1(!menu.get('visible'))) {
      _$jscoverage['/menubutton/control.js'].lineData[31]++;
      var align = {
  node: el, 
  points: ['bl', 'tl'], 
  overflow: {
  adjustX: 1, 
  adjustY: 1}};
      _$jscoverage['/menubutton/control.js'].lineData[39]++;
      S.mix(menu.get('align'), align, false);
      _$jscoverage['/menubutton/control.js'].lineData[40]++;
      if (visit3_40_1(self.get('matchElWidth'))) {
        _$jscoverage['/menubutton/control.js'].lineData[41]++;
        menu.render();
        _$jscoverage['/menubutton/control.js'].lineData[42]++;
        var menuEl = menu.get('el');
        _$jscoverage['/menubutton/control.js'].lineData[43]++;
        var borderWidth = (visit4_44_1(parseInt(menuEl.css('borderLeftWidth')) || 0)) + (visit5_45_1(parseInt(menuEl.css('borderRightWidth')) || 0));
        _$jscoverage['/menubutton/control.js'].lineData[46]++;
        menu.set('width', menu.get('align').node[0].offsetWidth - borderWidth);
      }
      _$jscoverage['/menubutton/control.js'].lineData[48]++;
      menu.show();
      _$jscoverage['/menubutton/control.js'].lineData[49]++;
      el.attr('aria-haspopup', menu.get('el').attr('id'));
    }
  }
}, 
  bindUI: function() {
  _$jscoverage['/menubutton/control.js'].functionData[2]++;
  _$jscoverage['/menubutton/control.js'].lineData[55]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[56]++;
  self.on('afterHighlightedItemChange', onMenuAfterHighlightedItemChange, self);
  _$jscoverage['/menubutton/control.js'].lineData[58]++;
  self.on('click', onMenuItemClick, self);
}, 
  handleKeyDownInternal: function(e) {
  _$jscoverage['/menubutton/control.js'].functionData[3]++;
  _$jscoverage['/menubutton/control.js'].lineData[71]++;
  var self = this, keyCode = e.keyCode, type = String(e.type), menu = self.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[77]++;
  if (visit6_77_1(keyCode === KeyCode.SPACE)) {
    _$jscoverage['/menubutton/control.js'].lineData[79]++;
    e.preventDefault();
    _$jscoverage['/menubutton/control.js'].lineData[80]++;
    if (visit7_80_1(type !== 'keyup')) {
      _$jscoverage['/menubutton/control.js'].lineData[81]++;
      return undefined;
    }
  } else {
    _$jscoverage['/menubutton/control.js'].lineData[83]++;
    if (visit8_83_1(type !== 'keydown')) {
      _$jscoverage['/menubutton/control.js'].lineData[84]++;
      return undefined;
    }
  }
  _$jscoverage['/menubutton/control.js'].lineData[87]++;
  if (visit9_87_1(menu.get('rendered') && menu.get('visible'))) {
    _$jscoverage['/menubutton/control.js'].lineData[88]++;
    var handledByMenu = menu.handleKeyDownInternal(e);
    _$jscoverage['/menubutton/control.js'].lineData[90]++;
    if (visit10_90_1(keyCode === KeyCode.ESC)) {
      _$jscoverage['/menubutton/control.js'].lineData[91]++;
      self.set('collapsed', true);
      _$jscoverage['/menubutton/control.js'].lineData[92]++;
      return true;
    }
    _$jscoverage['/menubutton/control.js'].lineData[94]++;
    return handledByMenu;
  }
  _$jscoverage['/menubutton/control.js'].lineData[98]++;
  if (visit11_98_1(visit12_98_2(keyCode === KeyCode.SPACE) || visit13_99_1(visit14_99_2(keyCode === KeyCode.DOWN) || visit15_100_1(keyCode === KeyCode.UP)))) {
    _$jscoverage['/menubutton/control.js'].lineData[101]++;
    self.set('collapsed', false);
    _$jscoverage['/menubutton/control.js'].lineData[102]++;
    return true;
  }
  _$jscoverage['/menubutton/control.js'].lineData[104]++;
  return undefined;
}, 
  handleClickInternal: function() {
  _$jscoverage['/menubutton/control.js'].functionData[4]++;
  _$jscoverage['/menubutton/control.js'].lineData[115]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[118]++;
  self.set('collapsed', !self.get('collapsed'));
}, 
  handleBlurInternal: function(e) {
  _$jscoverage['/menubutton/control.js'].functionData[5]++;
  _$jscoverage['/menubutton/control.js'].lineData[130]++;
  var self = this;
  _$jscoverage['/menubutton/control.js'].lineData[131]++;
  self.callSuper(e);
  _$jscoverage['/menubutton/control.js'].lineData[133]++;
  self.set('collapsed', true);
}, 
  addItem: function(item, index) {
  _$jscoverage['/menubutton/control.js'].functionData[6]++;
  _$jscoverage['/menubutton/control.js'].lineData[143]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[144]++;
  menu.addChild(item, index);
}, 
  removeItem: function(c, destroy) {
  _$jscoverage['/menubutton/control.js'].functionData[7]++;
  _$jscoverage['/menubutton/control.js'].lineData[153]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[154]++;
  menu.removeChild(c, destroy);
}, 
  removeItems: function(destroy) {
  _$jscoverage['/menubutton/control.js'].functionData[8]++;
  _$jscoverage['/menubutton/control.js'].lineData[162]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[163]++;
  if (visit16_163_1(menu)) {
    _$jscoverage['/menubutton/control.js'].lineData[164]++;
    if (visit17_164_1(menu.removeChildren)) {
      _$jscoverage['/menubutton/control.js'].lineData[165]++;
      menu.removeChildren(destroy);
    } else {
      _$jscoverage['/menubutton/control.js'].lineData[166]++;
      if (visit18_166_1(menu.children)) {
        _$jscoverage['/menubutton/control.js'].lineData[167]++;
        menu.children = [];
      }
    }
  }
}, 
  getItemAt: function(index) {
  _$jscoverage['/menubutton/control.js'].functionData[9]++;
  _$jscoverage['/menubutton/control.js'].lineData[177]++;
  var menu = this.get('menu');
  _$jscoverage['/menubutton/control.js'].lineData[178]++;
  return visit19_178_1(menu.get('rendered') && menu.getChildAt(index));
}, 
  _onSetDisabled: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[10]++;
  _$jscoverage['/menubutton/control.js'].lineData[183]++;
  if (visit20_183_1(!v)) {
    _$jscoverage['/menubutton/control.js'].lineData[184]++;
    this.set('collapsed', true);
  }
}, 
  destructor: function() {
  _$jscoverage['/menubutton/control.js'].functionData[11]++;
  _$jscoverage['/menubutton/control.js'].lineData[189]++;
  this.get('menu').destroy();
}}, {
  ATTRS: {
  matchElWidth: {
  value: true}, 
  collapseOnClick: {
  value: false}, 
  menu: {
  value: {}, 
  getter: function(v) {
  _$jscoverage['/menubutton/control.js'].functionData[12]++;
  _$jscoverage['/menubutton/control.js'].lineData[236]++;
  if (visit21_236_1(!v.isControl)) {
    _$jscoverage['/menubutton/control.js'].lineData[237]++;
    v.xclass = visit22_237_1(v.xclass || 'popupmenu');
    _$jscoverage['/menubutton/control.js'].lineData[238]++;
    v = this.createComponent(v);
    _$jscoverage['/menubutton/control.js'].lineData[239]++;
    this.setInternal('menu', v);
  }
  _$jscoverage['/menubutton/control.js'].lineData[241]++;
  return v;
}, 
  setter: function(m) {
  _$jscoverage['/menubutton/control.js'].functionData[13]++;
  _$jscoverage['/menubutton/control.js'].lineData[244]++;
  if (visit23_244_1(m.isControl)) {
    _$jscoverage['/menubutton/control.js'].lineData[245]++;
    m.setInternal('parent', this);
  }
}}, 
  collapsed: {
  value: false, 
  view: 1}, 
  xrender: {
  value: MenuButtonRender}}, 
  xclass: 'menu-button'});
  _$jscoverage['/menubutton/control.js'].lineData[269]++;
  function onMenuItemClick(e) {
    _$jscoverage['/menubutton/control.js'].functionData[14]++;
    _$jscoverage['/menubutton/control.js'].lineData[270]++;
    if (visit24_270_1(e.target.isMenuItem && this.get('collapseOnClick'))) {
      _$jscoverage['/menubutton/control.js'].lineData[271]++;
      this.set('collapsed', true);
    }
  }
  _$jscoverage['/menubutton/control.js'].lineData[275]++;
  function onMenuAfterHighlightedItemChange(e) {
    _$jscoverage['/menubutton/control.js'].functionData[15]++;
    _$jscoverage['/menubutton/control.js'].lineData[276]++;
    if (visit25_276_1(e.target.isMenu)) {
      _$jscoverage['/menubutton/control.js'].lineData[277]++;
      var el = this.el, menuItem = e.newVal;
      _$jscoverage['/menubutton/control.js'].lineData[279]++;
      el.setAttribute('aria-activedescendant', visit26_279_1(visit27_279_2(menuItem && menuItem.el.id) || ''));
    }
  }
});
