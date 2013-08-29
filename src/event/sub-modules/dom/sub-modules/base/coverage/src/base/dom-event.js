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
if (! _$jscoverage['/base/dom-event.js']) {
  _$jscoverage['/base/dom-event.js'] = {};
  _$jscoverage['/base/dom-event.js'].lineData = [];
  _$jscoverage['/base/dom-event.js'].lineData[6] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[7] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[9] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[11] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[13] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[14] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[19] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[22] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[23] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[26] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[29] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[30] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[35] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[36] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[39] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[41] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[42] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[46] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[49] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[51] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[53] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[54] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[55] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[56] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[57] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[59] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[61] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[64] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[65] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[69] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[71] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[72] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[77] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[80] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[82] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[85] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[87] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[89] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[91] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[93] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[96] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[97] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[101] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[102] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[103] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[105] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[108] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[110] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[111] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[115] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[132] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[134] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[135] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[136] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[137] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[138] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[139] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[143] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[163] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[165] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[167] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[173] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[175] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[176] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[177] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[179] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[180] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[181] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[182] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[189] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[204] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[221] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[239] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[241] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[247] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[249] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[251] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[256] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[259] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[260] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[262] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[266] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[268] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[271] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[273] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[274] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[275] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[278] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[279] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[284] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[285] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[286] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[287] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[293] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[308] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[320] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[322] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[323] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[325] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[326] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[329] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[331] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[332] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[333] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[337] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[343] = 0;
}
if (! _$jscoverage['/base/dom-event.js'].functionData) {
  _$jscoverage['/base/dom-event.js'].functionData = [];
  _$jscoverage['/base/dom-event.js'].functionData[0] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[1] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[2] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[3] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[4] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[5] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[6] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[7] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[8] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[9] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[10] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[11] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[12] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[13] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[14] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[15] = 0;
  _$jscoverage['/base/dom-event.js'].functionData[16] = 0;
}
if (! _$jscoverage['/base/dom-event.js'].branchData) {
  _$jscoverage['/base/dom-event.js'].branchData = {};
  _$jscoverage['/base/dom-event.js'].branchData['14'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['14'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['19'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['19'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['41'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['49'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['49'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['50'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['54'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['64'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['64'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['71'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['94'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['96'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['101'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['110'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['137'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['175'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['179'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['181'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['241'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['266'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['273'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['278'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['284'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['286'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['286'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['286'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['286'][3] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['322'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['326'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['326'][2] = new BranchData();
}
_$jscoverage['/base/dom-event.js'].branchData['326'][2].init(307, 36, 'srcData === DomEventUtils.data(dest)');
function visit28_326_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['326'][1].init(296, 47, 'srcData && srcData === DomEventUtils.data(dest)');
function visit27_326_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['322'][1].init(100, 83, '!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))');
function visit26_322_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['286'][3].init(126, 15, 'r !== undefined');
function visit25_286_3(result) {
  _$jscoverage['/base/dom-event.js'].branchData['286'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['286'][2].init(109, 13, 'ret !== false');
function visit24_286_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['286'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['286'][1].init(109, 32, 'ret !== false && r !== undefined');
function visit23_286_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['286'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['284'][1].init(553, 18, 'domEventObservable');
function visit22_284_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['278'][1].init(265, 36, '!onlyHandlers && !domEventObservable');
function visit21_278_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['273'][1].init(700, 6, 'i >= 0');
function visit20_273_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['266'][1].init(485, 14, 's && s.typeFix');
function visit19_266_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['241'][1].init(115, 15, 'eventData || {}');
function visit18_241_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['181'][1].init(125, 6, 'j >= 0');
function visit17_181_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['179'][1].init(156, 34, 'cfg.deep && t.getElementsByTagName');
function visit16_179_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['175'][1].init(276, 6, 'i >= 0');
function visit15_175_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['137'][1].init(159, 6, 'i >= 0');
function visit14_137_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['110'][1].init(684, 11, 'customEvent');
function visit13_110_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['101'][1].init(456, 5, '!type');
function visit12_101_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['96'][1].init(317, 50, '!domEventObservablesHolder || !domEventObservables');
function visit11_96_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['94'][1].init(131, 31, 'domEventObservablesHolder || {}');
function visit10_94_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['71'][1].init(1690, 19, '!domEventObservable');
function visit9_71_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['64'][1].init(1393, 62, '!(domEventObservables = domEventObservablesHolder.observables)');
function visit8_64_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['64'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['54'][1].init(589, 18, 'domEventObservable');
function visit7_54_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['50'][1].init(65, 27, 'typeof KISSY == \'undefined\'');
function visit6_50_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['49'][2].init(312, 41, 'DomEventObservable.triggeredEvent == type');
function visit5_49_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['49'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['49'][1].init(312, 93, 'DomEventObservable.triggeredEvent == type || typeof KISSY == \'undefined\'');
function visit4_49_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['41'][1].init(336, 44, '!(handle = domEventObservablesHolder.handle)');
function visit3_41_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['19'][1].init(180, 42, '!cfg.originalType && (typeFix = s.typeFix)');
function visit2_19_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['19'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['14'][1].init(18, 19, 'Special[type] || {}');
function visit1_14_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['14'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].lineData[6]++;
KISSY.add('event/dom/base/dom-event', function(S, BaseEvent, DomEventUtils, Dom, Special, DomEventObservable, DomEventObject) {
  _$jscoverage['/base/dom-event.js'].functionData[0]++;
  _$jscoverage['/base/dom-event.js'].lineData[7]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/dom-event.js'].lineData[9]++;
  var undefined = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[11]++;
  var DomEvent = {};
  _$jscoverage['/base/dom-event.js'].lineData[13]++;
  function fixType(cfg, type) {
    _$jscoverage['/base/dom-event.js'].functionData[1]++;
    _$jscoverage['/base/dom-event.js'].lineData[14]++;
    var s = visit1_14_1(Special[type] || {}), typeFix;
    _$jscoverage['/base/dom-event.js'].lineData[19]++;
    if (visit2_19_1(!cfg.originalType && (typeFix = s.typeFix))) {
      _$jscoverage['/base/dom-event.js'].lineData[22]++;
      cfg.originalType = type;
      _$jscoverage['/base/dom-event.js'].lineData[23]++;
      type = typeFix;
    }
    _$jscoverage['/base/dom-event.js'].lineData[26]++;
    return type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[29]++;
  function addInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[2]++;
    _$jscoverage['/base/dom-event.js'].lineData[30]++;
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    _$jscoverage['/base/dom-event.js'].lineData[35]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[36]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[39]++;
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    _$jscoverage['/base/dom-event.js'].lineData[41]++;
    if (visit3_41_1(!(handle = domEventObservablesHolder.handle))) {
      _$jscoverage['/base/dom-event.js'].lineData[42]++;
      handle = domEventObservablesHolder.handle = function(event) {
  _$jscoverage['/base/dom-event.js'].functionData[3]++;
  _$jscoverage['/base/dom-event.js'].lineData[46]++;
  var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
  _$jscoverage['/base/dom-event.js'].lineData[49]++;
  if (visit4_49_1(visit5_49_2(DomEventObservable.triggeredEvent == type) || visit6_50_1(typeof KISSY == 'undefined'))) {
    _$jscoverage['/base/dom-event.js'].lineData[51]++;
    return undefined;
  }
  _$jscoverage['/base/dom-event.js'].lineData[53]++;
  domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
  _$jscoverage['/base/dom-event.js'].lineData[54]++;
  if (visit7_54_1(domEventObservable)) {
    _$jscoverage['/base/dom-event.js'].lineData[55]++;
    event.currentTarget = currentTarget;
    _$jscoverage['/base/dom-event.js'].lineData[56]++;
    event = new DomEventObject(event);
    _$jscoverage['/base/dom-event.js'].lineData[57]++;
    return domEventObservable.notify(event);
  }
  _$jscoverage['/base/dom-event.js'].lineData[59]++;
  return undefined;
};
      _$jscoverage['/base/dom-event.js'].lineData[61]++;
      handle.currentTarget = currentTarget;
    }
    _$jscoverage['/base/dom-event.js'].lineData[64]++;
    if (visit8_64_1(!(domEventObservables = domEventObservablesHolder.observables))) {
      _$jscoverage['/base/dom-event.js'].lineData[65]++;
      domEventObservables = domEventObservablesHolder.observables = {};
    }
    _$jscoverage['/base/dom-event.js'].lineData[69]++;
    domEventObservable = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[71]++;
    if (visit9_71_1(!domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[72]++;
      domEventObservable = domEventObservables[type] = new DomEventObservable({
  type: type, 
  currentTarget: currentTarget});
      _$jscoverage['/base/dom-event.js'].lineData[77]++;
      domEventObservable.setup();
    }
    _$jscoverage['/base/dom-event.js'].lineData[80]++;
    domEventObservable.on(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[82]++;
    currentTarget = null;
  }
  _$jscoverage['/base/dom-event.js'].lineData[85]++;
  function removeInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[4]++;
    _$jscoverage['/base/dom-event.js'].lineData[87]++;
    cfg = S.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[89]++;
    var customEvent;
    _$jscoverage['/base/dom-event.js'].lineData[91]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[93]++;
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (visit10_94_1(domEventObservablesHolder || {})).observables;
    _$jscoverage['/base/dom-event.js'].lineData[96]++;
    if (visit11_96_1(!domEventObservablesHolder || !domEventObservables)) {
      _$jscoverage['/base/dom-event.js'].lineData[97]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[101]++;
    if (visit12_101_1(!type)) {
      _$jscoverage['/base/dom-event.js'].lineData[102]++;
      for (type in domEventObservables) {
        _$jscoverage['/base/dom-event.js'].lineData[103]++;
        domEventObservables[type].detach(cfg);
      }
      _$jscoverage['/base/dom-event.js'].lineData[105]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[108]++;
    customEvent = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[110]++;
    if (visit13_110_1(customEvent)) {
      _$jscoverage['/base/dom-event.js'].lineData[111]++;
      customEvent.detach(cfg);
    }
  }
  _$jscoverage['/base/dom-event.js'].lineData[115]++;
  S.mix(DomEvent, {
  on: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[5]++;
  _$jscoverage['/base/dom-event.js'].lineData[132]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[134]++;
  BaseUtils.batchForType(function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[6]++;
  _$jscoverage['/base/dom-event.js'].lineData[135]++;
  var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
  _$jscoverage['/base/dom-event.js'].lineData[136]++;
  type = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[137]++;
  for (i = targets.length - 1; visit14_137_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[138]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[139]++;
    addInternal(t, type, cfg);
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[143]++;
  return targets;
}, 
  detach: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[7]++;
  _$jscoverage['/base/dom-event.js'].lineData[163]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[165]++;
  BaseUtils.batchForType(function(targets, singleType, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[8]++;
  _$jscoverage['/base/dom-event.js'].lineData[167]++;
  var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
  _$jscoverage['/base/dom-event.js'].lineData[173]++;
  singleType = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[175]++;
  for (i = targets.length - 1; visit15_175_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[176]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[177]++;
    removeInternal(t, singleType, cfg);
    _$jscoverage['/base/dom-event.js'].lineData[179]++;
    if (visit16_179_1(cfg.deep && t.getElementsByTagName)) {
      _$jscoverage['/base/dom-event.js'].lineData[180]++;
      elChildren = t.getElementsByTagName('*');
      _$jscoverage['/base/dom-event.js'].lineData[181]++;
      for (j = elChildren.length - 1; visit17_181_1(j >= 0); j--) {
        _$jscoverage['/base/dom-event.js'].lineData[182]++;
        removeInternal(elChildren[j], singleType, cfg);
      }
    }
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[189]++;
  return targets;
}, 
  delegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[9]++;
  _$jscoverage['/base/dom-event.js'].lineData[204]++;
  return DomEvent.on(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  undelegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[10]++;
  _$jscoverage['/base/dom-event.js'].lineData[221]++;
  return DomEvent.detach(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  fire: function(targets, eventType, eventData, onlyHandlers) {
  _$jscoverage['/base/dom-event.js'].functionData[11]++;
  _$jscoverage['/base/dom-event.js'].lineData[239]++;
  var ret = undefined;
  _$jscoverage['/base/dom-event.js'].lineData[241]++;
  eventData = visit18_241_1(eventData || {});
  _$jscoverage['/base/dom-event.js'].lineData[247]++;
  eventData.synthetic = 1;
  _$jscoverage['/base/dom-event.js'].lineData[249]++;
  BaseUtils.splitAndRun(eventType, function(eventType) {
  _$jscoverage['/base/dom-event.js'].functionData[12]++;
  _$jscoverage['/base/dom-event.js'].lineData[251]++;
  var r, i, target, domEventObservable;
  _$jscoverage['/base/dom-event.js'].lineData[256]++;
  BaseUtils.fillGroupsForEvent(eventType, eventData);
  _$jscoverage['/base/dom-event.js'].lineData[259]++;
  eventType = eventData.type;
  _$jscoverage['/base/dom-event.js'].lineData[260]++;
  var s = Special[eventType];
  _$jscoverage['/base/dom-event.js'].lineData[262]++;
  var originalType = eventType;
  _$jscoverage['/base/dom-event.js'].lineData[266]++;
  if (visit19_266_1(s && s.typeFix)) {
    _$jscoverage['/base/dom-event.js'].lineData[268]++;
    originalType = s.typeFix;
  }
  _$jscoverage['/base/dom-event.js'].lineData[271]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[273]++;
  for (i = targets.length - 1; visit20_273_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[274]++;
    target = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[275]++;
    domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
    _$jscoverage['/base/dom-event.js'].lineData[278]++;
    if (visit21_278_1(!onlyHandlers && !domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[279]++;
      domEventObservable = new DomEventObservable({
  type: originalType, 
  currentTarget: target});
    }
    _$jscoverage['/base/dom-event.js'].lineData[284]++;
    if (visit22_284_1(domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[285]++;
      r = domEventObservable.fire(eventData, onlyHandlers);
      _$jscoverage['/base/dom-event.js'].lineData[286]++;
      if (visit23_286_1(visit24_286_2(ret !== false) && visit25_286_3(r !== undefined))) {
        _$jscoverage['/base/dom-event.js'].lineData[287]++;
        ret = r;
      }
    }
  }
});
  _$jscoverage['/base/dom-event.js'].lineData[293]++;
  return ret;
}, 
  fireHandler: function(targets, eventType, eventData) {
  _$jscoverage['/base/dom-event.js'].functionData[13]++;
  _$jscoverage['/base/dom-event.js'].lineData[308]++;
  return DomEvent.fire(targets, eventType, eventData, 1);
}, 
  clone: function(src, dest) {
  _$jscoverage['/base/dom-event.js'].functionData[14]++;
  _$jscoverage['/base/dom-event.js'].lineData[320]++;
  var domEventObservablesHolder, domEventObservables;
  _$jscoverage['/base/dom-event.js'].lineData[322]++;
  if (visit26_322_1(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src)))) {
    _$jscoverage['/base/dom-event.js'].lineData[323]++;
    return;
  }
  _$jscoverage['/base/dom-event.js'].lineData[325]++;
  var srcData = DomEventUtils.data(src);
  _$jscoverage['/base/dom-event.js'].lineData[326]++;
  if (visit27_326_1(srcData && visit28_326_2(srcData === DomEventUtils.data(dest)))) {
    _$jscoverage['/base/dom-event.js'].lineData[329]++;
    DomEventUtils.removeData(dest);
  }
  _$jscoverage['/base/dom-event.js'].lineData[331]++;
  domEventObservables = domEventObservablesHolder.observables;
  _$jscoverage['/base/dom-event.js'].lineData[332]++;
  S.each(domEventObservables, function(customEvent, type) {
  _$jscoverage['/base/dom-event.js'].functionData[15]++;
  _$jscoverage['/base/dom-event.js'].lineData[333]++;
  S.each(customEvent.observers, function(observer) {
  _$jscoverage['/base/dom-event.js'].functionData[16]++;
  _$jscoverage['/base/dom-event.js'].lineData[337]++;
  addInternal(dest, type, observer);
});
});
}});
  _$jscoverage['/base/dom-event.js'].lineData[343]++;
  return DomEvent;
}, {
  requires: ['event/base', './utils', 'dom', './special', './observable', './object']});
