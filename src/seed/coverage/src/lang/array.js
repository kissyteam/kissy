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
if (! _$jscoverage['/lang/array.js']) {
  _$jscoverage['/lang/array.js'] = {};
  _$jscoverage['/lang/array.js'].lineData = [];
  _$jscoverage['/lang/array.js'].lineData[7] = 0;
  _$jscoverage['/lang/array.js'].lineData[9] = 0;
  _$jscoverage['/lang/array.js'].lineData[19] = 0;
  _$jscoverage['/lang/array.js'].lineData[29] = 0;
  _$jscoverage['/lang/array.js'].lineData[30] = 0;
  _$jscoverage['/lang/array.js'].lineData[38] = 0;
  _$jscoverage['/lang/array.js'].lineData[40] = 0;
  _$jscoverage['/lang/array.js'].lineData[41] = 0;
  _$jscoverage['/lang/array.js'].lineData[42] = 0;
  _$jscoverage['/lang/array.js'].lineData[43] = 0;
  _$jscoverage['/lang/array.js'].lineData[45] = 0;
  _$jscoverage['/lang/array.js'].lineData[46] = 0;
  _$jscoverage['/lang/array.js'].lineData[50] = 0;
  _$jscoverage['/lang/array.js'].lineData[52] = 0;
  _$jscoverage['/lang/array.js'].lineData[53] = 0;
  _$jscoverage['/lang/array.js'].lineData[58] = 0;
  _$jscoverage['/lang/array.js'].lineData[71] = 0;
  _$jscoverage['/lang/array.js'].lineData[74] = 0;
  _$jscoverage['/lang/array.js'].lineData[75] = 0;
  _$jscoverage['/lang/array.js'].lineData[76] = 0;
  _$jscoverage['/lang/array.js'].lineData[79] = 0;
  _$jscoverage['/lang/array.js'].lineData[94] = 0;
  _$jscoverage['/lang/array.js'].lineData[97] = 0;
  _$jscoverage['/lang/array.js'].lineData[98] = 0;
  _$jscoverage['/lang/array.js'].lineData[99] = 0;
  _$jscoverage['/lang/array.js'].lineData[102] = 0;
  _$jscoverage['/lang/array.js'].lineData[114] = 0;
  _$jscoverage['/lang/array.js'].lineData[115] = 0;
  _$jscoverage['/lang/array.js'].lineData[116] = 0;
  _$jscoverage['/lang/array.js'].lineData[118] = 0;
  _$jscoverage['/lang/array.js'].lineData[122] = 0;
  _$jscoverage['/lang/array.js'].lineData[123] = 0;
  _$jscoverage['/lang/array.js'].lineData[124] = 0;
  _$jscoverage['/lang/array.js'].lineData[125] = 0;
  _$jscoverage['/lang/array.js'].lineData[127] = 0;
  _$jscoverage['/lang/array.js'].lineData[130] = 0;
  _$jscoverage['/lang/array.js'].lineData[131] = 0;
  _$jscoverage['/lang/array.js'].lineData[133] = 0;
  _$jscoverage['/lang/array.js'].lineData[144] = 0;
  _$jscoverage['/lang/array.js'].lineData[162] = 0;
  _$jscoverage['/lang/array.js'].lineData[165] = 0;
  _$jscoverage['/lang/array.js'].lineData[166] = 0;
  _$jscoverage['/lang/array.js'].lineData[167] = 0;
  _$jscoverage['/lang/array.js'].lineData[168] = 0;
  _$jscoverage['/lang/array.js'].lineData[171] = 0;
  _$jscoverage['/lang/array.js'].lineData[189] = 0;
  _$jscoverage['/lang/array.js'].lineData[192] = 0;
  _$jscoverage['/lang/array.js'].lineData[194] = 0;
  _$jscoverage['/lang/array.js'].lineData[195] = 0;
  _$jscoverage['/lang/array.js'].lineData[196] = 0;
  _$jscoverage['/lang/array.js'].lineData[200] = 0;
  _$jscoverage['/lang/array.js'].lineData[203] = 0;
  _$jscoverage['/lang/array.js'].lineData[224] = 0;
  _$jscoverage['/lang/array.js'].lineData[225] = 0;
  _$jscoverage['/lang/array.js'].lineData[226] = 0;
  _$jscoverage['/lang/array.js'].lineData[230] = 0;
  _$jscoverage['/lang/array.js'].lineData[231] = 0;
  _$jscoverage['/lang/array.js'].lineData[234] = 0;
  _$jscoverage['/lang/array.js'].lineData[235] = 0;
  _$jscoverage['/lang/array.js'].lineData[236] = 0;
  _$jscoverage['/lang/array.js'].lineData[237] = 0;
  _$jscoverage['/lang/array.js'].lineData[240] = 0;
  _$jscoverage['/lang/array.js'].lineData[241] = 0;
  _$jscoverage['/lang/array.js'].lineData[242] = 0;
  _$jscoverage['/lang/array.js'].lineData[243] = 0;
  _$jscoverage['/lang/array.js'].lineData[247] = 0;
  _$jscoverage['/lang/array.js'].lineData[248] = 0;
  _$jscoverage['/lang/array.js'].lineData[249] = 0;
  _$jscoverage['/lang/array.js'].lineData[255] = 0;
  _$jscoverage['/lang/array.js'].lineData[256] = 0;
  _$jscoverage['/lang/array.js'].lineData[257] = 0;
  _$jscoverage['/lang/array.js'].lineData[259] = 0;
  _$jscoverage['/lang/array.js'].lineData[262] = 0;
  _$jscoverage['/lang/array.js'].lineData[276] = 0;
  _$jscoverage['/lang/array.js'].lineData[279] = 0;
  _$jscoverage['/lang/array.js'].lineData[280] = 0;
  _$jscoverage['/lang/array.js'].lineData[281] = 0;
  _$jscoverage['/lang/array.js'].lineData[282] = 0;
  _$jscoverage['/lang/array.js'].lineData[285] = 0;
  _$jscoverage['/lang/array.js'].lineData[299] = 0;
  _$jscoverage['/lang/array.js'].lineData[302] = 0;
  _$jscoverage['/lang/array.js'].lineData[303] = 0;
  _$jscoverage['/lang/array.js'].lineData[304] = 0;
  _$jscoverage['/lang/array.js'].lineData[305] = 0;
  _$jscoverage['/lang/array.js'].lineData[308] = 0;
  _$jscoverage['/lang/array.js'].lineData[317] = 0;
  _$jscoverage['/lang/array.js'].lineData[318] = 0;
  _$jscoverage['/lang/array.js'].lineData[320] = 0;
  _$jscoverage['/lang/array.js'].lineData[321] = 0;
  _$jscoverage['/lang/array.js'].lineData[323] = 0;
  _$jscoverage['/lang/array.js'].lineData[326] = 0;
  _$jscoverage['/lang/array.js'].lineData[335] = 0;
  _$jscoverage['/lang/array.js'].lineData[337] = 0;
  _$jscoverage['/lang/array.js'].lineData[338] = 0;
  _$jscoverage['/lang/array.js'].lineData[339] = 0;
  _$jscoverage['/lang/array.js'].lineData[341] = 0;
}
if (! _$jscoverage['/lang/array.js'].functionData) {
  _$jscoverage['/lang/array.js'].functionData = [];
  _$jscoverage['/lang/array.js'].functionData[0] = 0;
  _$jscoverage['/lang/array.js'].functionData[1] = 0;
  _$jscoverage['/lang/array.js'].functionData[2] = 0;
  _$jscoverage['/lang/array.js'].functionData[3] = 0;
  _$jscoverage['/lang/array.js'].functionData[4] = 0;
  _$jscoverage['/lang/array.js'].functionData[5] = 0;
  _$jscoverage['/lang/array.js'].functionData[6] = 0;
  _$jscoverage['/lang/array.js'].functionData[7] = 0;
  _$jscoverage['/lang/array.js'].functionData[8] = 0;
  _$jscoverage['/lang/array.js'].functionData[9] = 0;
  _$jscoverage['/lang/array.js'].functionData[10] = 0;
  _$jscoverage['/lang/array.js'].functionData[11] = 0;
  _$jscoverage['/lang/array.js'].functionData[12] = 0;
  _$jscoverage['/lang/array.js'].functionData[13] = 0;
  _$jscoverage['/lang/array.js'].functionData[14] = 0;
  _$jscoverage['/lang/array.js'].functionData[15] = 0;
  _$jscoverage['/lang/array.js'].functionData[16] = 0;
  _$jscoverage['/lang/array.js'].functionData[17] = 0;
  _$jscoverage['/lang/array.js'].functionData[18] = 0;
}
if (! _$jscoverage['/lang/array.js'].branchData) {
  _$jscoverage['/lang/array.js'].branchData = {};
  _$jscoverage['/lang/array.js'].branchData['29'] = [];
  _$jscoverage['/lang/array.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['34'] = [];
  _$jscoverage['/lang/array.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['36'] = [];
  _$jscoverage['/lang/array.js'].branchData['36'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['36'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['36'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['38'] = [];
  _$jscoverage['/lang/array.js'].branchData['38'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['40'] = [];
  _$jscoverage['/lang/array.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['42'] = [];
  _$jscoverage['/lang/array.js'].branchData['42'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['45'] = [];
  _$jscoverage['/lang/array.js'].branchData['45'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['51'] = [];
  _$jscoverage['/lang/array.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['52'] = [];
  _$jscoverage['/lang/array.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['74'] = [];
  _$jscoverage['/lang/array.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['75'] = [];
  _$jscoverage['/lang/array.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['97'] = [];
  _$jscoverage['/lang/array.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['98'] = [];
  _$jscoverage['/lang/array.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['115'] = [];
  _$jscoverage['/lang/array.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['122'] = [];
  _$jscoverage['/lang/array.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['124'] = [];
  _$jscoverage['/lang/array.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['130'] = [];
  _$jscoverage['/lang/array.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['144'] = [];
  _$jscoverage['/lang/array.js'].branchData['144'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['162'] = [];
  _$jscoverage['/lang/array.js'].branchData['162'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['167'] = [];
  _$jscoverage['/lang/array.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['189'] = [];
  _$jscoverage['/lang/array.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['194'] = [];
  _$jscoverage['/lang/array.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['195'] = [];
  _$jscoverage['/lang/array.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['196'] = [];
  _$jscoverage['/lang/array.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['200'] = [];
  _$jscoverage['/lang/array.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['225'] = [];
  _$jscoverage['/lang/array.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['230'] = [];
  _$jscoverage['/lang/array.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['230'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['230'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['236'] = [];
  _$jscoverage['/lang/array.js'].branchData['236'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['241'] = [];
  _$jscoverage['/lang/array.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['248'] = [];
  _$jscoverage['/lang/array.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['255'] = [];
  _$jscoverage['/lang/array.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['256'] = [];
  _$jscoverage['/lang/array.js'].branchData['256'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['276'] = [];
  _$jscoverage['/lang/array.js'].branchData['276'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['279'] = [];
  _$jscoverage['/lang/array.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['279'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['280'] = [];
  _$jscoverage['/lang/array.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['281'] = [];
  _$jscoverage['/lang/array.js'].branchData['281'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['299'] = [];
  _$jscoverage['/lang/array.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['302'] = [];
  _$jscoverage['/lang/array.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['303'] = [];
  _$jscoverage['/lang/array.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['304'] = [];
  _$jscoverage['/lang/array.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['317'] = [];
  _$jscoverage['/lang/array.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['320'] = [];
  _$jscoverage['/lang/array.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'] = [];
  _$jscoverage['/lang/array.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['331'] = [];
  _$jscoverage['/lang/array.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['332'] = [];
  _$jscoverage['/lang/array.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['332'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['334'] = [];
  _$jscoverage['/lang/array.js'].branchData['334'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['334'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['334'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['334'][4] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['338'] = [];
  _$jscoverage['/lang/array.js'].branchData['338'][1] = new BranchData();
}
_$jscoverage['/lang/array.js'].branchData['338'][1].init(830, 5, 'i < l');
function visit111_338_1(result) {
  _$jscoverage['/lang/array.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['334'][4].init(147, 22, 'lengthType == \'number\'');
function visit110_334_4(result) {
  _$jscoverage['/lang/array.js'].branchData['334'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['334'][3].init(132, 37, '\'item\' in o && lengthType == \'number\'');
function visit109_334_3(result) {
  _$jscoverage['/lang/array.js'].branchData['334'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['334'][2].init(106, 19, 'oType == \'function\'');
function visit108_334_2(result) {
  _$jscoverage['/lang/array.js'].branchData['334'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['334'][1].init(106, 64, 'oType == \'function\' && !(\'item\' in o && lengthType == \'number\')');
function visit107_334_1(result) {
  _$jscoverage['/lang/array.js'].branchData['334'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['332'][2].init(543, 17, 'oType == \'string\'');
function visit106_332_2(result) {
  _$jscoverage['/lang/array.js'].branchData['332'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['332'][1].init(27, 172, 'oType == \'string\' || (oType == \'function\' && !(\'item\' in o && lengthType == \'number\'))');
function visit105_332_1(result) {
  _$jscoverage['/lang/array.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['331'][1].init(202, 200, 'o.alert || oType == \'string\' || (oType == \'function\' && !(\'item\' in o && lengthType == \'number\'))');
function visit104_331_1(result) {
  _$jscoverage['/lang/array.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][2].init(309, 22, 'lengthType != \'number\'');
function visit103_326_2(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][1].init(309, 403, 'lengthType != \'number\' || o.alert || oType == \'string\' || (oType == \'function\' && !(\'item\' in o && lengthType == \'number\'))');
function visit102_326_1(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['320'][1].init(91, 12, 'S.isArray(o)');
function visit101_320_1(result) {
  _$jscoverage['/lang/array.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['317'][1].init(18, 9, 'o == null');
function visit100_317_1(result) {
  _$jscoverage['/lang/array.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['304'][1].init(26, 44, 'i in arr && fn.call(context, arr[i], i, arr)');
function visit99_304_1(result) {
  _$jscoverage['/lang/array.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['303'][1].init(85, 7, 'i < len');
function visit98_303_1(result) {
  _$jscoverage['/lang/array.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['302'][2].init(28, 17, 'arr && arr.length');
function visit97_302_2(result) {
  _$jscoverage['/lang/array.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['302'][1].init(28, 22, 'arr && arr.length || 0');
function visit96_302_1(result) {
  _$jscoverage['/lang/array.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['299'][1].init(44, 15, 'context || this');
function visit95_299_1(result) {
  _$jscoverage['/lang/array.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['281'][1].init(26, 45, 'i in arr && !fn.call(context, arr[i], i, arr)');
function visit94_281_1(result) {
  _$jscoverage['/lang/array.js'].branchData['281'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['280'][1].init(85, 7, 'i < len');
function visit93_280_1(result) {
  _$jscoverage['/lang/array.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['279'][2].init(28, 17, 'arr && arr.length');
function visit92_279_2(result) {
  _$jscoverage['/lang/array.js'].branchData['279'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['279'][1].init(28, 22, 'arr && arr.length || 0');
function visit91_279_1(result) {
  _$jscoverage['/lang/array.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['276'][1].init(45, 15, 'context || this');
function visit90_276_1(result) {
  _$jscoverage['/lang/array.js'].branchData['276'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['256'][1].init(22, 8, 'k in arr');
function visit89_256_1(result) {
  _$jscoverage['/lang/array.js'].branchData['256'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['255'][1].init(1021, 7, 'k < len');
function visit88_255_1(result) {
  _$jscoverage['/lang/array.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['248'][1].init(278, 8, 'k >= len');
function visit87_248_1(result) {
  _$jscoverage['/lang/array.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['241'][1].init(26, 8, 'k in arr');
function visit86_241_1(result) {
  _$jscoverage['/lang/array.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['236'][1].init(447, 21, 'arguments.length >= 3');
function visit85_236_1(result) {
  _$jscoverage['/lang/array.js'].branchData['236'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['230'][3].init(275, 21, 'arguments.length == 2');
function visit84_230_3(result) {
  _$jscoverage['/lang/array.js'].branchData['230'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['230'][2].init(262, 9, 'len === 0');
function visit83_230_2(result) {
  _$jscoverage['/lang/array.js'].branchData['230'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['230'][1].init(262, 34, 'len === 0 && arguments.length == 2');
function visit82_230_1(result) {
  _$jscoverage['/lang/array.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['225'][1].init(53, 30, 'typeof callback !== \'function\'');
function visit81_225_1(result) {
  _$jscoverage['/lang/array.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['200'][1].init(43, 15, 'context || this');
function visit80_200_1(result) {
  _$jscoverage['/lang/array.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['196'][1].init(105, 133, 'el || i in arr');
function visit79_196_1(result) {
  _$jscoverage['/lang/array.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['195'][1].init(31, 22, 'typeof arr == \'string\'');
function visit78_195_1(result) {
  _$jscoverage['/lang/array.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['194'][1].init(116, 7, 'i < len');
function visit77_194_1(result) {
  _$jscoverage['/lang/array.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['189'][1].init(43, 15, 'context || this');
function visit76_189_1(result) {
  _$jscoverage['/lang/array.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['167'][2].init(34, 15, 'context || this');
function visit75_167_2(result) {
  _$jscoverage['/lang/array.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['167'][1].init(26, 38, 'fn.call(context || this, item, i, arr)');
function visit74_167_1(result) {
  _$jscoverage['/lang/array.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['162'][1].init(46, 15, 'context || this');
function visit73_162_1(result) {
  _$jscoverage['/lang/array.js'].branchData['162'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['144'][1].init(21, 25, 'S.indexOf(item, arr) > -1');
function visit72_144_1(result) {
  _$jscoverage['/lang/array.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['130'][1].init(419, 8, 'override');
function visit71_130_1(result) {
  _$jscoverage['/lang/array.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['124'][1].init(56, 33, '(n = S.lastIndexOf(item, b)) !== i');
function visit70_124_1(result) {
  _$jscoverage['/lang/array.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['122'][1].init(196, 12, 'i < b.length');
function visit69_122_1(result) {
  _$jscoverage['/lang/array.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['115'][1].init(50, 8, 'override');
function visit68_115_1(result) {
  _$jscoverage['/lang/array.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['98'][1].init(26, 15, 'arr[i] === item');
function visit67_98_1(result) {
  _$jscoverage['/lang/array.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['97'][1].init(47, 6, 'i >= 0');
function visit66_97_1(result) {
  _$jscoverage['/lang/array.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['75'][1].init(26, 15, 'arr[i] === item');
function visit65_75_1(result) {
  _$jscoverage['/lang/array.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['74'][1].init(52, 7, 'i < len');
function visit64_74_1(result) {
  _$jscoverage['/lang/array.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['52'][1].init(30, 42, 'fn.call(context, val, i, object) === FALSE');
function visit63_52_1(result) {
  _$jscoverage['/lang/array.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['51'][1].init(47, 10, 'i < length');
function visit62_51_1(result) {
  _$jscoverage['/lang/array.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['45'][1].init(125, 52, 'fn.call(context, object[key], key, object) === FALSE');
function visit61_45_1(result) {
  _$jscoverage['/lang/array.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['42'][1].init(73, 15, 'i < keys.length');
function visit60_42_1(result) {
  _$jscoverage['/lang/array.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['40'][1].init(389, 5, 'isObj');
function visit59_40_1(result) {
  _$jscoverage['/lang/array.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['38'][1].init(349, 15, 'context || null');
function visit58_38_1(result) {
  _$jscoverage['/lang/array.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['36'][3].init(271, 28, 'S.type(object) == \'function\'');
function visit57_36_3(result) {
  _$jscoverage['/lang/array.js'].branchData['36'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['36'][2].init(247, 20, 'length === undefined');
function visit56_36_2(result) {
  _$jscoverage['/lang/array.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['36'][1].init(247, 52, 'length === undefined || S.type(object) == \'function\'');
function visit55_36_1(result) {
  _$jscoverage['/lang/array.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['34'][1].init(119, 23, 'object && object.length');
function visit54_34_1(result) {
  _$jscoverage['/lang/array.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['29'][1].init(18, 6, 'object');
function visit53_29_1(result) {
  _$jscoverage['/lang/array.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/array.js'].functionData[0]++;
  _$jscoverage['/lang/array.js'].lineData[9]++;
  var TRUE = true, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
  _$jscoverage['/lang/array.js'].lineData[19]++;
  S.mix(S, {
  each: function(object, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[1]++;
  _$jscoverage['/lang/array.js'].lineData[29]++;
  if (visit53_29_1(object)) {
    _$jscoverage['/lang/array.js'].lineData[30]++;
    var key, val, keys, i = 0, length = visit54_34_1(object && object.length), isObj = visit55_36_1(visit56_36_2(length === undefined) || visit57_36_3(S.type(object) == 'function'));
    _$jscoverage['/lang/array.js'].lineData[38]++;
    context = visit58_38_1(context || null);
    _$jscoverage['/lang/array.js'].lineData[40]++;
    if (visit59_40_1(isObj)) {
      _$jscoverage['/lang/array.js'].lineData[41]++;
      keys = S.keys(object);
      _$jscoverage['/lang/array.js'].lineData[42]++;
      for (; visit60_42_1(i < keys.length); i++) {
        _$jscoverage['/lang/array.js'].lineData[43]++;
        key = keys[i];
        _$jscoverage['/lang/array.js'].lineData[45]++;
        if (visit61_45_1(fn.call(context, object[key], key, object) === FALSE)) {
          _$jscoverage['/lang/array.js'].lineData[46]++;
          break;
        }
      }
    } else {
      _$jscoverage['/lang/array.js'].lineData[50]++;
      for (val = object[0]; visit62_51_1(i < length); val = object[++i]) {
        _$jscoverage['/lang/array.js'].lineData[52]++;
        if (visit63_52_1(fn.call(context, val, i, object) === FALSE)) {
          _$jscoverage['/lang/array.js'].lineData[53]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/lang/array.js'].lineData[58]++;
  return object;
}, 
  indexOf: indexOf ? function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[2]++;
  _$jscoverage['/lang/array.js'].lineData[71]++;
  return indexOf.call(arr, item);
} : function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[3]++;
  _$jscoverage['/lang/array.js'].lineData[74]++;
  for (var i = 0, len = arr.length; visit64_74_1(i < len); ++i) {
    _$jscoverage['/lang/array.js'].lineData[75]++;
    if (visit65_75_1(arr[i] === item)) {
      _$jscoverage['/lang/array.js'].lineData[76]++;
      return i;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[79]++;
  return -1;
}, 
  lastIndexOf: (lastIndexOf) ? function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[4]++;
  _$jscoverage['/lang/array.js'].lineData[94]++;
  return lastIndexOf.call(arr, item);
} : function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[5]++;
  _$jscoverage['/lang/array.js'].lineData[97]++;
  for (var i = arr.length - 1; visit66_97_1(i >= 0); i--) {
    _$jscoverage['/lang/array.js'].lineData[98]++;
    if (visit67_98_1(arr[i] === item)) {
      _$jscoverage['/lang/array.js'].lineData[99]++;
      break;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[102]++;
  return i;
}, 
  unique: function(a, override) {
  _$jscoverage['/lang/array.js'].functionData[6]++;
  _$jscoverage['/lang/array.js'].lineData[114]++;
  var b = a.slice();
  _$jscoverage['/lang/array.js'].lineData[115]++;
  if (visit68_115_1(override)) {
    _$jscoverage['/lang/array.js'].lineData[116]++;
    b.reverse();
  }
  _$jscoverage['/lang/array.js'].lineData[118]++;
  var i = 0, n, item;
  _$jscoverage['/lang/array.js'].lineData[122]++;
  while (visit69_122_1(i < b.length)) {
    _$jscoverage['/lang/array.js'].lineData[123]++;
    item = b[i];
    _$jscoverage['/lang/array.js'].lineData[124]++;
    while (visit70_124_1((n = S.lastIndexOf(item, b)) !== i)) {
      _$jscoverage['/lang/array.js'].lineData[125]++;
      b.splice(n, 1);
    }
    _$jscoverage['/lang/array.js'].lineData[127]++;
    i += 1;
  }
  _$jscoverage['/lang/array.js'].lineData[130]++;
  if (visit71_130_1(override)) {
    _$jscoverage['/lang/array.js'].lineData[131]++;
    b.reverse();
  }
  _$jscoverage['/lang/array.js'].lineData[133]++;
  return b;
}, 
  inArray: function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[7]++;
  _$jscoverage['/lang/array.js'].lineData[144]++;
  return visit72_144_1(S.indexOf(item, arr) > -1);
}, 
  filter: filter ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[8]++;
  _$jscoverage['/lang/array.js'].lineData[162]++;
  return filter.call(arr, fn, visit73_162_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[9]++;
  _$jscoverage['/lang/array.js'].lineData[165]++;
  var ret = [];
  _$jscoverage['/lang/array.js'].lineData[166]++;
  S.each(arr, function(item, i, arr) {
  _$jscoverage['/lang/array.js'].functionData[10]++;
  _$jscoverage['/lang/array.js'].lineData[167]++;
  if (visit74_167_1(fn.call(visit75_167_2(context || this), item, i, arr))) {
    _$jscoverage['/lang/array.js'].lineData[168]++;
    ret.push(item);
  }
});
  _$jscoverage['/lang/array.js'].lineData[171]++;
  return ret;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[11]++;
  _$jscoverage['/lang/array.js'].lineData[189]++;
  return map.call(arr, fn, visit76_189_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[12]++;
  _$jscoverage['/lang/array.js'].lineData[192]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/lang/array.js'].lineData[194]++;
  for (var i = 0; visit77_194_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[195]++;
    var el = visit78_195_1(typeof arr == 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/lang/array.js'].lineData[196]++;
    if (visit79_196_1(el || i in arr)) {
      _$jscoverage['/lang/array.js'].lineData[200]++;
      res[i] = fn.call(visit80_200_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/lang/array.js'].lineData[203]++;
  return res;
}, 
  reduce: function(arr, callback, initialValue) {
  _$jscoverage['/lang/array.js'].functionData[13]++;
  _$jscoverage['/lang/array.js'].lineData[224]++;
  var len = arr.length;
  _$jscoverage['/lang/array.js'].lineData[225]++;
  if (visit81_225_1(typeof callback !== 'function')) {
    _$jscoverage['/lang/array.js'].lineData[226]++;
    throw new TypeError('callback is not function!');
  }
  _$jscoverage['/lang/array.js'].lineData[230]++;
  if (visit82_230_1(visit83_230_2(len === 0) && visit84_230_3(arguments.length == 2))) {
    _$jscoverage['/lang/array.js'].lineData[231]++;
    throw new TypeError('arguments invalid');
  }
  _$jscoverage['/lang/array.js'].lineData[234]++;
  var k = 0;
  _$jscoverage['/lang/array.js'].lineData[235]++;
  var accumulator;
  _$jscoverage['/lang/array.js'].lineData[236]++;
  if (visit85_236_1(arguments.length >= 3)) {
    _$jscoverage['/lang/array.js'].lineData[237]++;
    accumulator = arguments[2];
  } else {
    _$jscoverage['/lang/array.js'].lineData[240]++;
    do {
      _$jscoverage['/lang/array.js'].lineData[241]++;
      if (visit86_241_1(k in arr)) {
        _$jscoverage['/lang/array.js'].lineData[242]++;
        accumulator = arr[k++];
        _$jscoverage['/lang/array.js'].lineData[243]++;
        break;
      }
      _$jscoverage['/lang/array.js'].lineData[247]++;
      k += 1;
      _$jscoverage['/lang/array.js'].lineData[248]++;
      if (visit87_248_1(k >= len)) {
        _$jscoverage['/lang/array.js'].lineData[249]++;
        throw new TypeError();
      }
    } while (TRUE);
  }
  _$jscoverage['/lang/array.js'].lineData[255]++;
  while (visit88_255_1(k < len)) {
    _$jscoverage['/lang/array.js'].lineData[256]++;
    if (visit89_256_1(k in arr)) {
      _$jscoverage['/lang/array.js'].lineData[257]++;
      accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
    }
    _$jscoverage['/lang/array.js'].lineData[259]++;
    k++;
  }
  _$jscoverage['/lang/array.js'].lineData[262]++;
  return accumulator;
}, 
  every: every ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[14]++;
  _$jscoverage['/lang/array.js'].lineData[276]++;
  return every.call(arr, fn, visit90_276_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[15]++;
  _$jscoverage['/lang/array.js'].lineData[279]++;
  var len = visit91_279_1(visit92_279_2(arr && arr.length) || 0);
  _$jscoverage['/lang/array.js'].lineData[280]++;
  for (var i = 0; visit93_280_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[281]++;
    if (visit94_281_1(i in arr && !fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/lang/array.js'].lineData[282]++;
      return FALSE;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[285]++;
  return TRUE;
}, 
  some: some ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[16]++;
  _$jscoverage['/lang/array.js'].lineData[299]++;
  return some.call(arr, fn, visit95_299_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[17]++;
  _$jscoverage['/lang/array.js'].lineData[302]++;
  var len = visit96_302_1(visit97_302_2(arr && arr.length) || 0);
  _$jscoverage['/lang/array.js'].lineData[303]++;
  for (var i = 0; visit98_303_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[304]++;
    if (visit99_304_1(i in arr && fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/lang/array.js'].lineData[305]++;
      return TRUE;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[308]++;
  return FALSE;
}, 
  makeArray: function(o) {
  _$jscoverage['/lang/array.js'].functionData[18]++;
  _$jscoverage['/lang/array.js'].lineData[317]++;
  if (visit100_317_1(o == null)) {
    _$jscoverage['/lang/array.js'].lineData[318]++;
    return [];
  }
  _$jscoverage['/lang/array.js'].lineData[320]++;
  if (visit101_320_1(S.isArray(o))) {
    _$jscoverage['/lang/array.js'].lineData[321]++;
    return o;
  }
  _$jscoverage['/lang/array.js'].lineData[323]++;
  var lengthType = typeof o.length, oType = typeof o;
  _$jscoverage['/lang/array.js'].lineData[326]++;
  if (visit102_326_1(visit103_326_2(lengthType != 'number') || visit104_331_1(o.alert || visit105_332_1(visit106_332_2(oType == 'string') || (visit107_334_1(visit108_334_2(oType == 'function') && !(visit109_334_3('item' in o && visit110_334_4(lengthType == 'number'))))))))) {
    _$jscoverage['/lang/array.js'].lineData[335]++;
    return [o];
  }
  _$jscoverage['/lang/array.js'].lineData[337]++;
  var ret = [];
  _$jscoverage['/lang/array.js'].lineData[338]++;
  for (var i = 0, l = o.length; visit111_338_1(i < l); i++) {
    _$jscoverage['/lang/array.js'].lineData[339]++;
    ret[i] = o[i];
  }
  _$jscoverage['/lang/array.js'].lineData[341]++;
  return ret;
}});
})(KISSY);
