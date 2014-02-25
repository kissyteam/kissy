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
  _$jscoverage['/lang/array.js'].lineData[161] = 0;
  _$jscoverage['/lang/array.js'].lineData[164] = 0;
  _$jscoverage['/lang/array.js'].lineData[165] = 0;
  _$jscoverage['/lang/array.js'].lineData[166] = 0;
  _$jscoverage['/lang/array.js'].lineData[167] = 0;
  _$jscoverage['/lang/array.js'].lineData[170] = 0;
  _$jscoverage['/lang/array.js'].lineData[188] = 0;
  _$jscoverage['/lang/array.js'].lineData[191] = 0;
  _$jscoverage['/lang/array.js'].lineData[193] = 0;
  _$jscoverage['/lang/array.js'].lineData[194] = 0;
  _$jscoverage['/lang/array.js'].lineData[195] = 0;
  _$jscoverage['/lang/array.js'].lineData[198] = 0;
  _$jscoverage['/lang/array.js'].lineData[201] = 0;
  _$jscoverage['/lang/array.js'].lineData[218] = 0;
  _$jscoverage['/lang/array.js'].lineData[219] = 0;
  _$jscoverage['/lang/array.js'].lineData[220] = 0;
  _$jscoverage['/lang/array.js'].lineData[224] = 0;
  _$jscoverage['/lang/array.js'].lineData[225] = 0;
  _$jscoverage['/lang/array.js'].lineData[228] = 0;
  _$jscoverage['/lang/array.js'].lineData[229] = 0;
  _$jscoverage['/lang/array.js'].lineData[230] = 0;
  _$jscoverage['/lang/array.js'].lineData[231] = 0;
  _$jscoverage['/lang/array.js'].lineData[234] = 0;
  _$jscoverage['/lang/array.js'].lineData[235] = 0;
  _$jscoverage['/lang/array.js'].lineData[236] = 0;
  _$jscoverage['/lang/array.js'].lineData[237] = 0;
  _$jscoverage['/lang/array.js'].lineData[241] = 0;
  _$jscoverage['/lang/array.js'].lineData[242] = 0;
  _$jscoverage['/lang/array.js'].lineData[243] = 0;
  _$jscoverage['/lang/array.js'].lineData[249] = 0;
  _$jscoverage['/lang/array.js'].lineData[250] = 0;
  _$jscoverage['/lang/array.js'].lineData[251] = 0;
  _$jscoverage['/lang/array.js'].lineData[253] = 0;
  _$jscoverage['/lang/array.js'].lineData[256] = 0;
  _$jscoverage['/lang/array.js'].lineData[270] = 0;
  _$jscoverage['/lang/array.js'].lineData[273] = 0;
  _$jscoverage['/lang/array.js'].lineData[274] = 0;
  _$jscoverage['/lang/array.js'].lineData[275] = 0;
  _$jscoverage['/lang/array.js'].lineData[276] = 0;
  _$jscoverage['/lang/array.js'].lineData[279] = 0;
  _$jscoverage['/lang/array.js'].lineData[293] = 0;
  _$jscoverage['/lang/array.js'].lineData[296] = 0;
  _$jscoverage['/lang/array.js'].lineData[297] = 0;
  _$jscoverage['/lang/array.js'].lineData[298] = 0;
  _$jscoverage['/lang/array.js'].lineData[299] = 0;
  _$jscoverage['/lang/array.js'].lineData[302] = 0;
  _$jscoverage['/lang/array.js'].lineData[311] = 0;
  _$jscoverage['/lang/array.js'].lineData[312] = 0;
  _$jscoverage['/lang/array.js'].lineData[314] = 0;
  _$jscoverage['/lang/array.js'].lineData[315] = 0;
  _$jscoverage['/lang/array.js'].lineData[317] = 0;
  _$jscoverage['/lang/array.js'].lineData[320] = 0;
  _$jscoverage['/lang/array.js'].lineData[329] = 0;
  _$jscoverage['/lang/array.js'].lineData[331] = 0;
  _$jscoverage['/lang/array.js'].lineData[332] = 0;
  _$jscoverage['/lang/array.js'].lineData[333] = 0;
  _$jscoverage['/lang/array.js'].lineData[335] = 0;
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
  _$jscoverage['/lang/array.js'].branchData['161'] = [];
  _$jscoverage['/lang/array.js'].branchData['161'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['166'] = [];
  _$jscoverage['/lang/array.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['188'] = [];
  _$jscoverage['/lang/array.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['193'] = [];
  _$jscoverage['/lang/array.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['194'] = [];
  _$jscoverage['/lang/array.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['195'] = [];
  _$jscoverage['/lang/array.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['198'] = [];
  _$jscoverage['/lang/array.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['219'] = [];
  _$jscoverage['/lang/array.js'].branchData['219'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['224'] = [];
  _$jscoverage['/lang/array.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['224'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['230'] = [];
  _$jscoverage['/lang/array.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['235'] = [];
  _$jscoverage['/lang/array.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['242'] = [];
  _$jscoverage['/lang/array.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['249'] = [];
  _$jscoverage['/lang/array.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['250'] = [];
  _$jscoverage['/lang/array.js'].branchData['250'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['270'] = [];
  _$jscoverage['/lang/array.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['273'] = [];
  _$jscoverage['/lang/array.js'].branchData['273'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['273'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['274'] = [];
  _$jscoverage['/lang/array.js'].branchData['274'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['275'] = [];
  _$jscoverage['/lang/array.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['293'] = [];
  _$jscoverage['/lang/array.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['296'] = [];
  _$jscoverage['/lang/array.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['296'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['297'] = [];
  _$jscoverage['/lang/array.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['298'] = [];
  _$jscoverage['/lang/array.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['311'] = [];
  _$jscoverage['/lang/array.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['314'] = [];
  _$jscoverage['/lang/array.js'].branchData['314'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['320'] = [];
  _$jscoverage['/lang/array.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['320'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['325'] = [];
  _$jscoverage['/lang/array.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'] = [];
  _$jscoverage['/lang/array.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['328'] = [];
  _$jscoverage['/lang/array.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['328'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['328'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['328'][4] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['332'] = [];
  _$jscoverage['/lang/array.js'].branchData['332'][1] = new BranchData();
}
_$jscoverage['/lang/array.js'].branchData['332'][1].init(812, 5, 'i < l');
function visit131_332_1(result) {
  _$jscoverage['/lang/array.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['328'][4].init(147, 23, 'lengthType === \'number\'');
function visit130_328_4(result) {
  _$jscoverage['/lang/array.js'].branchData['328'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['328'][3].init(132, 38, '\'item\' in o && lengthType === \'number\'');
function visit129_328_3(result) {
  _$jscoverage['/lang/array.js'].branchData['328'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['328'][2].init(105, 20, 'oType === \'function\'');
function visit128_328_2(result) {
  _$jscoverage['/lang/array.js'].branchData['328'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['328'][1].init(105, 66, 'oType === \'function\' && !(\'item\' in o && lengthType === \'number\')');
function visit127_328_1(result) {
  _$jscoverage['/lang/array.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][2].init(528, 18, 'oType === \'string\'');
function visit126_326_2(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][1].init(26, 173, 'oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit125_326_1(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['325'][1].init(198, 200, 'o.alert || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit124_325_1(result) {
  _$jscoverage['/lang/array.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['320'][2].init(299, 23, 'lengthType !== \'number\'');
function visit123_320_2(result) {
  _$jscoverage['/lang/array.js'].branchData['320'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['320'][1].init(299, 399, 'lengthType !== \'number\' || o.alert || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit122_320_1(result) {
  _$jscoverage['/lang/array.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['314'][1].init(87, 12, 'S.isArray(o)');
function visit121_314_1(result) {
  _$jscoverage['/lang/array.js'].branchData['314'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['311'][1].init(17, 9, 'o == null');
function visit120_311_1(result) {
  _$jscoverage['/lang/array.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['298'][1].init(25, 44, 'i in arr && fn.call(context, arr[i], i, arr)');
function visit119_298_1(result) {
  _$jscoverage['/lang/array.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['297'][1].init(83, 7, 'i < len');
function visit118_297_1(result) {
  _$jscoverage['/lang/array.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['296'][2].init(27, 17, 'arr && arr.length');
function visit117_296_2(result) {
  _$jscoverage['/lang/array.js'].branchData['296'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['296'][1].init(27, 22, 'arr && arr.length || 0');
function visit116_296_1(result) {
  _$jscoverage['/lang/array.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['293'][1].init(43, 15, 'context || this');
function visit115_293_1(result) {
  _$jscoverage['/lang/array.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['275'][1].init(25, 45, 'i in arr && !fn.call(context, arr[i], i, arr)');
function visit114_275_1(result) {
  _$jscoverage['/lang/array.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['274'][1].init(83, 7, 'i < len');
function visit113_274_1(result) {
  _$jscoverage['/lang/array.js'].branchData['274'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['273'][2].init(27, 17, 'arr && arr.length');
function visit112_273_2(result) {
  _$jscoverage['/lang/array.js'].branchData['273'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['273'][1].init(27, 22, 'arr && arr.length || 0');
function visit111_273_1(result) {
  _$jscoverage['/lang/array.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['270'][1].init(44, 15, 'context || this');
function visit110_270_1(result) {
  _$jscoverage['/lang/array.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['250'][1].init(21, 8, 'k in arr');
function visit109_250_1(result) {
  _$jscoverage['/lang/array.js'].branchData['250'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['249'][1].init(990, 7, 'k < len');
function visit108_249_1(result) {
  _$jscoverage['/lang/array.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['242'][1].init(270, 8, 'k >= len');
function visit107_242_1(result) {
  _$jscoverage['/lang/array.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['235'][1].init(25, 8, 'k in arr');
function visit106_235_1(result) {
  _$jscoverage['/lang/array.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['230'][1].init(435, 21, 'arguments.length >= 3');
function visit105_230_1(result) {
  _$jscoverage['/lang/array.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['224'][3].init(268, 22, 'arguments.length === 2');
function visit104_224_3(result) {
  _$jscoverage['/lang/array.js'].branchData['224'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['224'][2].init(255, 9, 'len === 0');
function visit103_224_2(result) {
  _$jscoverage['/lang/array.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['224'][1].init(255, 35, 'len === 0 && arguments.length === 2');
function visit102_224_1(result) {
  _$jscoverage['/lang/array.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['219'][1].init(51, 30, 'typeof callback !== \'function\'');
function visit101_219_1(result) {
  _$jscoverage['/lang/array.js'].branchData['219'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['198'][1].init(42, 15, 'context || this');
function visit100_198_1(result) {
  _$jscoverage['/lang/array.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['195'][1].init(104, 106, 'el || i in arr');
function visit99_195_1(result) {
  _$jscoverage['/lang/array.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['194'][1].init(30, 23, 'typeof arr === \'string\'');
function visit98_194_1(result) {
  _$jscoverage['/lang/array.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['193'][1].init(113, 7, 'i < len');
function visit97_193_1(result) {
  _$jscoverage['/lang/array.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['188'][1].init(42, 15, 'context || this');
function visit96_188_1(result) {
  _$jscoverage['/lang/array.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['166'][2].init(33, 15, 'context || this');
function visit95_166_2(result) {
  _$jscoverage['/lang/array.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['166'][1].init(25, 38, 'fn.call(context || this, item, i, arr)');
function visit94_166_1(result) {
  _$jscoverage['/lang/array.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['161'][1].init(45, 15, 'context || this');
function visit93_161_1(result) {
  _$jscoverage['/lang/array.js'].branchData['161'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['144'][1].init(20, 25, 'S.indexOf(item, arr) > -1');
function visit92_144_1(result) {
  _$jscoverage['/lang/array.js'].branchData['144'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['130'][1].init(402, 8, 'override');
function visit91_130_1(result) {
  _$jscoverage['/lang/array.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['124'][1].init(54, 33, '(n = S.lastIndexOf(item, b)) !== i');
function visit90_124_1(result) {
  _$jscoverage['/lang/array.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['122'][1].init(187, 12, 'i < b.length');
function visit89_122_1(result) {
  _$jscoverage['/lang/array.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['115'][1].init(48, 8, 'override');
function visit88_115_1(result) {
  _$jscoverage['/lang/array.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['98'][1].init(25, 15, 'arr[i] === item');
function visit87_98_1(result) {
  _$jscoverage['/lang/array.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['97'][1].init(46, 6, 'i >= 0');
function visit86_97_1(result) {
  _$jscoverage['/lang/array.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['75'][1].init(25, 15, 'arr[i] === item');
function visit85_75_1(result) {
  _$jscoverage['/lang/array.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['74'][1].init(51, 7, 'i < len');
function visit84_74_1(result) {
  _$jscoverage['/lang/array.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['52'][1].init(29, 42, 'fn.call(context, val, i, object) === FALSE');
function visit83_52_1(result) {
  _$jscoverage['/lang/array.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['51'][1].init(46, 10, 'i < length');
function visit82_51_1(result) {
  _$jscoverage['/lang/array.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['45'][1].init(122, 52, 'fn.call(context, object[key], key, object) === FALSE');
function visit81_45_1(result) {
  _$jscoverage['/lang/array.js'].branchData['45'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['42'][1].init(71, 15, 'i < keys.length');
function visit80_42_1(result) {
  _$jscoverage['/lang/array.js'].branchData['42'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['40'][1].init(379, 5, 'isObj');
function visit79_40_1(result) {
  _$jscoverage['/lang/array.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['38'][1].init(341, 15, 'context || null');
function visit78_38_1(result) {
  _$jscoverage['/lang/array.js'].branchData['38'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['36'][3].init(265, 29, 'S.type(object) === \'function\'');
function visit77_36_3(result) {
  _$jscoverage['/lang/array.js'].branchData['36'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['36'][2].init(241, 20, 'length === undefined');
function visit76_36_2(result) {
  _$jscoverage['/lang/array.js'].branchData['36'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['36'][1].init(241, 53, 'length === undefined || S.type(object) === \'function\'');
function visit75_36_1(result) {
  _$jscoverage['/lang/array.js'].branchData['36'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['34'][1].init(115, 23, 'object && object.length');
function visit74_34_1(result) {
  _$jscoverage['/lang/array.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['29'][1].init(17, 6, 'object');
function visit73_29_1(result) {
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
  if (visit73_29_1(object)) {
    _$jscoverage['/lang/array.js'].lineData[30]++;
    var key, val, keys, i = 0, length = visit74_34_1(object && object.length), isObj = visit75_36_1(visit76_36_2(length === undefined) || visit77_36_3(S.type(object) === 'function'));
    _$jscoverage['/lang/array.js'].lineData[38]++;
    context = visit78_38_1(context || null);
    _$jscoverage['/lang/array.js'].lineData[40]++;
    if (visit79_40_1(isObj)) {
      _$jscoverage['/lang/array.js'].lineData[41]++;
      keys = S.keys(object);
      _$jscoverage['/lang/array.js'].lineData[42]++;
      for (; visit80_42_1(i < keys.length); i++) {
        _$jscoverage['/lang/array.js'].lineData[43]++;
        key = keys[i];
        _$jscoverage['/lang/array.js'].lineData[45]++;
        if (visit81_45_1(fn.call(context, object[key], key, object) === FALSE)) {
          _$jscoverage['/lang/array.js'].lineData[46]++;
          break;
        }
      }
    } else {
      _$jscoverage['/lang/array.js'].lineData[50]++;
      for (val = object[0]; visit82_51_1(i < length); val = object[++i]) {
        _$jscoverage['/lang/array.js'].lineData[52]++;
        if (visit83_52_1(fn.call(context, val, i, object) === FALSE)) {
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
  for (var i = 0, len = arr.length; visit84_74_1(i < len); ++i) {
    _$jscoverage['/lang/array.js'].lineData[75]++;
    if (visit85_75_1(arr[i] === item)) {
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
  for (var i = arr.length - 1; visit86_97_1(i >= 0); i--) {
    _$jscoverage['/lang/array.js'].lineData[98]++;
    if (visit87_98_1(arr[i] === item)) {
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
  if (visit88_115_1(override)) {
    _$jscoverage['/lang/array.js'].lineData[116]++;
    b.reverse();
  }
  _$jscoverage['/lang/array.js'].lineData[118]++;
  var i = 0, n, item;
  _$jscoverage['/lang/array.js'].lineData[122]++;
  while (visit89_122_1(i < b.length)) {
    _$jscoverage['/lang/array.js'].lineData[123]++;
    item = b[i];
    _$jscoverage['/lang/array.js'].lineData[124]++;
    while (visit90_124_1((n = S.lastIndexOf(item, b)) !== i)) {
      _$jscoverage['/lang/array.js'].lineData[125]++;
      b.splice(n, 1);
    }
    _$jscoverage['/lang/array.js'].lineData[127]++;
    i += 1;
  }
  _$jscoverage['/lang/array.js'].lineData[130]++;
  if (visit91_130_1(override)) {
    _$jscoverage['/lang/array.js'].lineData[131]++;
    b.reverse();
  }
  _$jscoverage['/lang/array.js'].lineData[133]++;
  return b;
}, 
  inArray: function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[7]++;
  _$jscoverage['/lang/array.js'].lineData[144]++;
  return visit92_144_1(S.indexOf(item, arr) > -1);
}, 
  filter: filter ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[8]++;
  _$jscoverage['/lang/array.js'].lineData[161]++;
  return filter.call(arr, fn, visit93_161_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[9]++;
  _$jscoverage['/lang/array.js'].lineData[164]++;
  var ret = [];
  _$jscoverage['/lang/array.js'].lineData[165]++;
  S.each(arr, function(item, i, arr) {
  _$jscoverage['/lang/array.js'].functionData[10]++;
  _$jscoverage['/lang/array.js'].lineData[166]++;
  if (visit94_166_1(fn.call(visit95_166_2(context || this), item, i, arr))) {
    _$jscoverage['/lang/array.js'].lineData[167]++;
    ret.push(item);
  }
});
  _$jscoverage['/lang/array.js'].lineData[170]++;
  return ret;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[11]++;
  _$jscoverage['/lang/array.js'].lineData[188]++;
  return map.call(arr, fn, visit96_188_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[12]++;
  _$jscoverage['/lang/array.js'].lineData[191]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/lang/array.js'].lineData[193]++;
  for (var i = 0; visit97_193_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[194]++;
    var el = visit98_194_1(typeof arr === 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/lang/array.js'].lineData[195]++;
    if (visit99_195_1(el || i in arr)) {
      _$jscoverage['/lang/array.js'].lineData[198]++;
      res[i] = fn.call(visit100_198_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/lang/array.js'].lineData[201]++;
  return res;
}, 
  reduce: function(arr, callback, initialValue) {
  _$jscoverage['/lang/array.js'].functionData[13]++;
  _$jscoverage['/lang/array.js'].lineData[218]++;
  var len = arr.length;
  _$jscoverage['/lang/array.js'].lineData[219]++;
  if (visit101_219_1(typeof callback !== 'function')) {
    _$jscoverage['/lang/array.js'].lineData[220]++;
    throw new TypeError('callback is not function!');
  }
  _$jscoverage['/lang/array.js'].lineData[224]++;
  if (visit102_224_1(visit103_224_2(len === 0) && visit104_224_3(arguments.length === 2))) {
    _$jscoverage['/lang/array.js'].lineData[225]++;
    throw new TypeError('arguments invalid');
  }
  _$jscoverage['/lang/array.js'].lineData[228]++;
  var k = 0;
  _$jscoverage['/lang/array.js'].lineData[229]++;
  var accumulator;
  _$jscoverage['/lang/array.js'].lineData[230]++;
  if (visit105_230_1(arguments.length >= 3)) {
    _$jscoverage['/lang/array.js'].lineData[231]++;
    accumulator = initialValue;
  } else {
    _$jscoverage['/lang/array.js'].lineData[234]++;
    do {
      _$jscoverage['/lang/array.js'].lineData[235]++;
      if (visit106_235_1(k in arr)) {
        _$jscoverage['/lang/array.js'].lineData[236]++;
        accumulator = arr[k++];
        _$jscoverage['/lang/array.js'].lineData[237]++;
        break;
      }
      _$jscoverage['/lang/array.js'].lineData[241]++;
      k += 1;
      _$jscoverage['/lang/array.js'].lineData[242]++;
      if (visit107_242_1(k >= len)) {
        _$jscoverage['/lang/array.js'].lineData[243]++;
        throw new TypeError();
      }
    } while (TRUE);
  }
  _$jscoverage['/lang/array.js'].lineData[249]++;
  while (visit108_249_1(k < len)) {
    _$jscoverage['/lang/array.js'].lineData[250]++;
    if (visit109_250_1(k in arr)) {
      _$jscoverage['/lang/array.js'].lineData[251]++;
      accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
    }
    _$jscoverage['/lang/array.js'].lineData[253]++;
    k++;
  }
  _$jscoverage['/lang/array.js'].lineData[256]++;
  return accumulator;
}, 
  every: every ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[14]++;
  _$jscoverage['/lang/array.js'].lineData[270]++;
  return every.call(arr, fn, visit110_270_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[15]++;
  _$jscoverage['/lang/array.js'].lineData[273]++;
  var len = visit111_273_1(visit112_273_2(arr && arr.length) || 0);
  _$jscoverage['/lang/array.js'].lineData[274]++;
  for (var i = 0; visit113_274_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[275]++;
    if (visit114_275_1(i in arr && !fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/lang/array.js'].lineData[276]++;
      return FALSE;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[279]++;
  return TRUE;
}, 
  some: some ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[16]++;
  _$jscoverage['/lang/array.js'].lineData[293]++;
  return some.call(arr, fn, visit115_293_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[17]++;
  _$jscoverage['/lang/array.js'].lineData[296]++;
  var len = visit116_296_1(visit117_296_2(arr && arr.length) || 0);
  _$jscoverage['/lang/array.js'].lineData[297]++;
  for (var i = 0; visit118_297_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[298]++;
    if (visit119_298_1(i in arr && fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/lang/array.js'].lineData[299]++;
      return TRUE;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[302]++;
  return FALSE;
}, 
  makeArray: function(o) {
  _$jscoverage['/lang/array.js'].functionData[18]++;
  _$jscoverage['/lang/array.js'].lineData[311]++;
  if (visit120_311_1(o == null)) {
    _$jscoverage['/lang/array.js'].lineData[312]++;
    return [];
  }
  _$jscoverage['/lang/array.js'].lineData[314]++;
  if (visit121_314_1(S.isArray(o))) {
    _$jscoverage['/lang/array.js'].lineData[315]++;
    return o;
  }
  _$jscoverage['/lang/array.js'].lineData[317]++;
  var lengthType = typeof o.length, oType = typeof o;
  _$jscoverage['/lang/array.js'].lineData[320]++;
  if (visit122_320_1(visit123_320_2(lengthType !== 'number') || visit124_325_1(o.alert || visit125_326_1(visit126_326_2(oType === 'string') || (visit127_328_1(visit128_328_2(oType === 'function') && !(visit129_328_3('item' in o && visit130_328_4(lengthType === 'number'))))))))) {
    _$jscoverage['/lang/array.js'].lineData[329]++;
    return [o];
  }
  _$jscoverage['/lang/array.js'].lineData[331]++;
  var ret = [];
  _$jscoverage['/lang/array.js'].lineData[332]++;
  for (var i = 0, l = o.length; visit131_332_1(i < l); i++) {
    _$jscoverage['/lang/array.js'].lineData[333]++;
    ret[i] = o[i];
  }
  _$jscoverage['/lang/array.js'].lineData[335]++;
  return ret;
}});
})(KISSY);
