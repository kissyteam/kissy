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
  _$jscoverage['/base/dom-event.js'].lineData[8] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[9] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[10] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[11] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[12] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[13] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[14] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[16] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[17] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[22] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[25] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[26] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[29] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[32] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[33] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[38] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[39] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[42] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[44] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[45] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[49] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[52] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[54] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[56] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[57] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[58] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[59] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[60] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[62] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[64] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[67] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[68] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[72] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[74] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[75] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[80] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[83] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[85] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[88] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[90] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[92] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[94] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[96] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[99] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[100] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[104] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[105] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[106] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[108] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[111] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[113] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[114] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[123] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[139] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[141] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[142] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[143] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[144] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[145] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[146] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[150] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[169] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[171] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[173] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[179] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[181] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[182] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[183] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[185] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[186] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[187] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[188] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[195] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[210] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[227] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[245] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[248] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[249] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[250] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[254] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[260] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[262] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[263] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[268] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[271] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[272] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[274] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[278] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[280] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[283] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[285] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[286] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[287] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[290] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[291] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[296] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[297] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[298] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[299] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[305] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[320] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[331] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[333] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[334] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[336] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[337] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[340] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[342] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[343] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[344] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[348] = 0;
  _$jscoverage['/base/dom-event.js'].lineData[354] = 0;
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
  _$jscoverage['/base/dom-event.js'].branchData['17'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['17'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['22'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['22'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['44'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['52'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['52'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['53'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['57'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['67'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['74'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['97'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['99'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['104'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['113'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['144'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['181'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['181'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['185'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['187'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['248'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['254'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['278'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['285'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['290'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['296'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['298'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['298'][2] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['298'][3] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['333'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['333'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['337'] = [];
  _$jscoverage['/base/dom-event.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/base/dom-event.js'].branchData['337'][2] = new BranchData();
}
_$jscoverage['/base/dom-event.js'].branchData['337'][2].init(307, 36, 'srcData === DomEventUtils.data(dest)');
function visit29_337_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['337'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['337'][1].init(296, 47, 'srcData && srcData === DomEventUtils.data(dest)');
function visit28_337_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['333'][1].init(100, 83, '!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src))');
function visit27_333_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['333'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['298'][3].init(126, 15, 'r !== undefined');
function visit26_298_3(result) {
  _$jscoverage['/base/dom-event.js'].branchData['298'][3].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['298'][2].init(109, 13, 'ret !== false');
function visit25_298_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['298'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['298'][1].init(109, 32, 'ret !== false && r !== undefined');
function visit24_298_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['296'][1].init(553, 18, 'domEventObservable');
function visit23_296_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['290'][1].init(265, 36, '!onlyHandlers && !domEventObservable');
function visit22_290_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['285'][1].init(698, 6, 'i >= 0');
function visit21_285_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['278'][1].init(483, 14, 's && s.typeFix');
function visit20_278_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['254'][1].init(316, 15, 'eventData || {}');
function visit19_254_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['248'][1].init(107, 23, 'eventType.isEventObject');
function visit18_248_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['187'][1].init(125, 6, 'j >= 0');
function visit17_187_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['185'][1].init(156, 34, 'cfg.deep && t.getElementsByTagName');
function visit16_185_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['181'][1].init(276, 6, 'i >= 0');
function visit15_181_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['181'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['144'][1].init(159, 6, 'i >= 0');
function visit14_144_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['113'][1].init(687, 11, 'customEvent');
function visit13_113_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['104'][1].init(459, 5, '!type');
function visit12_104_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['99'][1].init(320, 50, '!domEventObservablesHolder || !domEventObservables');
function visit11_99_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['97'][1].init(131, 31, 'domEventObservablesHolder || {}');
function visit10_97_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['74'][1].init(1695, 19, '!domEventObservable');
function visit9_74_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['67'][1].init(1398, 62, '!(domEventObservables = domEventObservablesHolder.observables)');
function visit8_67_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['57'][1].init(591, 18, 'domEventObservable');
function visit7_57_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['53'][1].init(66, 28, 'typeof KISSY === \'undefined\'');
function visit6_53_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['52'][2].init(312, 42, 'DomEventObservable.triggeredEvent === type');
function visit5_52_2(result) {
  _$jscoverage['/base/dom-event.js'].branchData['52'][2].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['52'][1].init(312, 95, 'DomEventObservable.triggeredEvent === type || typeof KISSY === \'undefined\'');
function visit4_52_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['44'][1].init(339, 44, '!(handle = domEventObservablesHolder.handle)');
function visit3_44_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['22'][1].init(180, 42, '!cfg.originalType && (typeFix = s.typeFix)');
function visit2_22_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['22'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].branchData['17'][1].init(18, 19, 'Special[type] || {}');
function visit1_17_1(result) {
  _$jscoverage['/base/dom-event.js'].branchData['17'][1].ranCondition(result);
  return result;
}_$jscoverage['/base/dom-event.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/base/dom-event.js'].functionData[0]++;
  _$jscoverage['/base/dom-event.js'].lineData[7]++;
  var BaseEvent = require('event/base');
  _$jscoverage['/base/dom-event.js'].lineData[8]++;
  var DomEventUtils = require('./utils');
  _$jscoverage['/base/dom-event.js'].lineData[9]++;
  var Dom = require('dom');
  _$jscoverage['/base/dom-event.js'].lineData[10]++;
  var Special = require('./special');
  _$jscoverage['/base/dom-event.js'].lineData[11]++;
  var DomEventObservable = require('./observable');
  _$jscoverage['/base/dom-event.js'].lineData[12]++;
  var DomEventObject = require('./object');
  _$jscoverage['/base/dom-event.js'].lineData[13]++;
  var util = require('util');
  _$jscoverage['/base/dom-event.js'].lineData[14]++;
  var BaseUtils = BaseEvent.Utils;
  _$jscoverage['/base/dom-event.js'].lineData[16]++;
  function fixType(cfg, type) {
    _$jscoverage['/base/dom-event.js'].functionData[1]++;
    _$jscoverage['/base/dom-event.js'].lineData[17]++;
    var s = visit1_17_1(Special[type] || {}), typeFix;
    _$jscoverage['/base/dom-event.js'].lineData[22]++;
    if (visit2_22_1(!cfg.originalType && (typeFix = s.typeFix))) {
      _$jscoverage['/base/dom-event.js'].lineData[25]++;
      cfg.originalType = type;
      _$jscoverage['/base/dom-event.js'].lineData[26]++;
      type = typeFix;
    }
    _$jscoverage['/base/dom-event.js'].lineData[29]++;
    return type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[32]++;
  function addInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[2]++;
    _$jscoverage['/base/dom-event.js'].lineData[33]++;
    var domEventObservablesHolder, domEventObservable, domEventObservables, handle;
    _$jscoverage['/base/dom-event.js'].lineData[38]++;
    cfg = util.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[39]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[42]++;
    domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget, 1);
    _$jscoverage['/base/dom-event.js'].lineData[44]++;
    if (visit3_44_1(!(handle = domEventObservablesHolder.handle))) {
      _$jscoverage['/base/dom-event.js'].lineData[45]++;
      handle = domEventObservablesHolder.handle = function(event) {
  _$jscoverage['/base/dom-event.js'].functionData[3]++;
  _$jscoverage['/base/dom-event.js'].lineData[49]++;
  var type = event.type, domEventObservable, currentTarget = handle.currentTarget;
  _$jscoverage['/base/dom-event.js'].lineData[52]++;
  if (visit4_52_1(visit5_52_2(DomEventObservable.triggeredEvent === type) || visit6_53_1(typeof KISSY === 'undefined'))) {
    _$jscoverage['/base/dom-event.js'].lineData[54]++;
    return undefined;
  }
  _$jscoverage['/base/dom-event.js'].lineData[56]++;
  domEventObservable = DomEventObservable.getDomEventObservable(currentTarget, type);
  _$jscoverage['/base/dom-event.js'].lineData[57]++;
  if (visit7_57_1(domEventObservable)) {
    _$jscoverage['/base/dom-event.js'].lineData[58]++;
    event.currentTarget = currentTarget;
    _$jscoverage['/base/dom-event.js'].lineData[59]++;
    event = new DomEventObject(event);
    _$jscoverage['/base/dom-event.js'].lineData[60]++;
    return domEventObservable.notify(event);
  }
  _$jscoverage['/base/dom-event.js'].lineData[62]++;
  return undefined;
};
      _$jscoverage['/base/dom-event.js'].lineData[64]++;
      handle.currentTarget = currentTarget;
    }
    _$jscoverage['/base/dom-event.js'].lineData[67]++;
    if (visit8_67_1(!(domEventObservables = domEventObservablesHolder.observables))) {
      _$jscoverage['/base/dom-event.js'].lineData[68]++;
      domEventObservables = domEventObservablesHolder.observables = {};
    }
    _$jscoverage['/base/dom-event.js'].lineData[72]++;
    domEventObservable = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[74]++;
    if (visit9_74_1(!domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[75]++;
      domEventObservable = domEventObservables[type] = new DomEventObservable({
  type: type, 
  currentTarget: currentTarget});
      _$jscoverage['/base/dom-event.js'].lineData[80]++;
      domEventObservable.setup();
    }
    _$jscoverage['/base/dom-event.js'].lineData[83]++;
    domEventObservable.on(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[85]++;
    currentTarget = null;
  }
  _$jscoverage['/base/dom-event.js'].lineData[88]++;
  function removeInternal(currentTarget, type, cfg) {
    _$jscoverage['/base/dom-event.js'].functionData[4]++;
    _$jscoverage['/base/dom-event.js'].lineData[90]++;
    cfg = util.merge(cfg);
    _$jscoverage['/base/dom-event.js'].lineData[92]++;
    var customEvent;
    _$jscoverage['/base/dom-event.js'].lineData[94]++;
    type = fixType(cfg, type);
    _$jscoverage['/base/dom-event.js'].lineData[96]++;
    var domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(currentTarget), domEventObservables = (visit10_97_1(domEventObservablesHolder || {})).observables;
    _$jscoverage['/base/dom-event.js'].lineData[99]++;
    if (visit11_99_1(!domEventObservablesHolder || !domEventObservables)) {
      _$jscoverage['/base/dom-event.js'].lineData[100]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[104]++;
    if (visit12_104_1(!type)) {
      _$jscoverage['/base/dom-event.js'].lineData[105]++;
      for (type in domEventObservables) {
        _$jscoverage['/base/dom-event.js'].lineData[106]++;
        domEventObservables[type].detach(cfg);
      }
      _$jscoverage['/base/dom-event.js'].lineData[108]++;
      return;
    }
    _$jscoverage['/base/dom-event.js'].lineData[111]++;
    customEvent = domEventObservables[type];
    _$jscoverage['/base/dom-event.js'].lineData[113]++;
    if (visit13_113_1(customEvent)) {
      _$jscoverage['/base/dom-event.js'].lineData[114]++;
      customEvent.detach(cfg);
    }
  }
  _$jscoverage['/base/dom-event.js'].lineData[123]++;
  var DomEvent = {
  on: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[5]++;
  _$jscoverage['/base/dom-event.js'].lineData[139]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[141]++;
  BaseUtils.batchForType(function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[6]++;
  _$jscoverage['/base/dom-event.js'].lineData[142]++;
  var cfg = BaseUtils.normalizeParam(type, fn, context), i, t;
  _$jscoverage['/base/dom-event.js'].lineData[143]++;
  type = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[144]++;
  for (i = targets.length - 1; visit14_144_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[145]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[146]++;
    addInternal(t, type, cfg);
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[150]++;
  return targets;
}, 
  detach: function(targets, type, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[7]++;
  _$jscoverage['/base/dom-event.js'].lineData[169]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[171]++;
  BaseUtils.batchForType(function(targets, singleType, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[8]++;
  _$jscoverage['/base/dom-event.js'].lineData[173]++;
  var cfg = BaseUtils.normalizeParam(singleType, fn, context), i, j, elChildren, t;
  _$jscoverage['/base/dom-event.js'].lineData[179]++;
  singleType = cfg.type;
  _$jscoverage['/base/dom-event.js'].lineData[181]++;
  for (i = targets.length - 1; visit15_181_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[182]++;
    t = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[183]++;
    removeInternal(t, singleType, cfg);
    _$jscoverage['/base/dom-event.js'].lineData[185]++;
    if (visit16_185_1(cfg.deep && t.getElementsByTagName)) {
      _$jscoverage['/base/dom-event.js'].lineData[186]++;
      elChildren = t.getElementsByTagName('*');
      _$jscoverage['/base/dom-event.js'].lineData[187]++;
      for (j = elChildren.length - 1; visit17_187_1(j >= 0); j--) {
        _$jscoverage['/base/dom-event.js'].lineData[188]++;
        removeInternal(elChildren[j], singleType, cfg);
      }
    }
  }
}, 1, targets, type, fn, context);
  _$jscoverage['/base/dom-event.js'].lineData[195]++;
  return targets;
}, 
  delegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[9]++;
  _$jscoverage['/base/dom-event.js'].lineData[210]++;
  return DomEvent.on(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  undelegate: function(targets, eventType, filter, fn, context) {
  _$jscoverage['/base/dom-event.js'].functionData[10]++;
  _$jscoverage['/base/dom-event.js'].lineData[227]++;
  return DomEvent.detach(targets, eventType, {
  fn: fn, 
  context: context, 
  filter: filter});
}, 
  fire: function(targets, eventType, eventData, onlyHandlers) {
  _$jscoverage['/base/dom-event.js'].functionData[11]++;
  _$jscoverage['/base/dom-event.js'].lineData[245]++;
  var ret;
  _$jscoverage['/base/dom-event.js'].lineData[248]++;
  if (visit18_248_1(eventType.isEventObject)) {
    _$jscoverage['/base/dom-event.js'].lineData[249]++;
    eventData = eventType;
    _$jscoverage['/base/dom-event.js'].lineData[250]++;
    eventType = eventType.type;
  }
  _$jscoverage['/base/dom-event.js'].lineData[254]++;
  eventData = visit19_254_1(eventData || {});
  _$jscoverage['/base/dom-event.js'].lineData[260]++;
  eventData.synthetic = 1;
  _$jscoverage['/base/dom-event.js'].lineData[262]++;
  BaseUtils.splitAndRun(eventType, function(eventType) {
  _$jscoverage['/base/dom-event.js'].functionData[12]++;
  _$jscoverage['/base/dom-event.js'].lineData[263]++;
  var r, i, target, domEventObservable;
  _$jscoverage['/base/dom-event.js'].lineData[268]++;
  BaseUtils.fillGroupsForEvent(eventType, eventData);
  _$jscoverage['/base/dom-event.js'].lineData[271]++;
  eventType = eventData.type;
  _$jscoverage['/base/dom-event.js'].lineData[272]++;
  var s = Special[eventType];
  _$jscoverage['/base/dom-event.js'].lineData[274]++;
  var originalType = eventType;
  _$jscoverage['/base/dom-event.js'].lineData[278]++;
  if (visit20_278_1(s && s.typeFix)) {
    _$jscoverage['/base/dom-event.js'].lineData[280]++;
    originalType = s.typeFix;
  }
  _$jscoverage['/base/dom-event.js'].lineData[283]++;
  targets = Dom.query(targets);
  _$jscoverage['/base/dom-event.js'].lineData[285]++;
  for (i = targets.length - 1; visit21_285_1(i >= 0); i--) {
    _$jscoverage['/base/dom-event.js'].lineData[286]++;
    target = targets[i];
    _$jscoverage['/base/dom-event.js'].lineData[287]++;
    domEventObservable = DomEventObservable.getDomEventObservable(target, originalType);
    _$jscoverage['/base/dom-event.js'].lineData[290]++;
    if (visit22_290_1(!onlyHandlers && !domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[291]++;
      domEventObservable = new DomEventObservable({
  type: originalType, 
  currentTarget: target});
    }
    _$jscoverage['/base/dom-event.js'].lineData[296]++;
    if (visit23_296_1(domEventObservable)) {
      _$jscoverage['/base/dom-event.js'].lineData[297]++;
      r = domEventObservable.fire(eventData, onlyHandlers);
      _$jscoverage['/base/dom-event.js'].lineData[298]++;
      if (visit24_298_1(visit25_298_2(ret !== false) && visit26_298_3(r !== undefined))) {
        _$jscoverage['/base/dom-event.js'].lineData[299]++;
        ret = r;
      }
    }
  }
});
  _$jscoverage['/base/dom-event.js'].lineData[305]++;
  return ret;
}, 
  fireHandler: function(targets, eventType, eventData) {
  _$jscoverage['/base/dom-event.js'].functionData[13]++;
  _$jscoverage['/base/dom-event.js'].lineData[320]++;
  return DomEvent.fire(targets, eventType, eventData, 1);
}, 
  clone: function(src, dest) {
  _$jscoverage['/base/dom-event.js'].functionData[14]++;
  _$jscoverage['/base/dom-event.js'].lineData[331]++;
  var domEventObservablesHolder, domEventObservables;
  _$jscoverage['/base/dom-event.js'].lineData[333]++;
  if (visit27_333_1(!(domEventObservablesHolder = DomEventObservable.getDomEventObservablesHolder(src)))) {
    _$jscoverage['/base/dom-event.js'].lineData[334]++;
    return;
  }
  _$jscoverage['/base/dom-event.js'].lineData[336]++;
  var srcData = DomEventUtils.data(src);
  _$jscoverage['/base/dom-event.js'].lineData[337]++;
  if (visit28_337_1(srcData && visit29_337_2(srcData === DomEventUtils.data(dest)))) {
    _$jscoverage['/base/dom-event.js'].lineData[340]++;
    DomEventUtils.removeData(dest);
  }
  _$jscoverage['/base/dom-event.js'].lineData[342]++;
  domEventObservables = domEventObservablesHolder.observables;
  _$jscoverage['/base/dom-event.js'].lineData[343]++;
  util.each(domEventObservables, function(customEvent, type) {
  _$jscoverage['/base/dom-event.js'].functionData[15]++;
  _$jscoverage['/base/dom-event.js'].lineData[344]++;
  util.each(customEvent.observers, function(observer) {
  _$jscoverage['/base/dom-event.js'].functionData[16]++;
  _$jscoverage['/base/dom-event.js'].lineData[348]++;
  addInternal(dest, type, observer);
});
});
}};
  _$jscoverage['/base/dom-event.js'].lineData[354]++;
  return DomEvent;
});
