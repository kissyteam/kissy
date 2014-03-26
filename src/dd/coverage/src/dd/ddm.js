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
if (! _$jscoverage['/dd/ddm.js']) {
  _$jscoverage['/dd/ddm.js'] = {};
  _$jscoverage['/dd/ddm.js'].lineData = [];
  _$jscoverage['/dd/ddm.js'].lineData[6] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[7] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[10] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[12] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[35] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[40] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[47] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[50] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[51] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[62] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[63] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[65] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[66] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[69] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[70] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[71] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[72] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[73] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[74] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[83] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[87] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[88] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[96] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[97] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[98] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[101] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[108] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[112] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[115] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[117] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[118] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[119] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[120] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[121] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[124] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[125] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[126] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[130] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[132] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[133] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[134] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[135] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[138] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[140] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[141] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[142] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[143] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[146] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[149] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[150] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[151] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[152] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[154] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[155] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[156] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[157] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[160] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[168] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[171] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[172] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[181] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[183] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[184] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[186] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[187] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[188] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[190] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[191] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[263] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[265] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[283] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[285] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[289] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[292] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[295] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[296] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[298] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[299] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[306] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[308] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[310] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[311] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[314] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[316] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[320] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[321] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[325] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[326] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[327] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[328] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[329] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[330] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[336] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[337] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[339] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[340] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[345] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[346] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[347] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[348] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[349] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[351] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[359] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[360] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[366] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[367] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[368] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[370] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[373] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[374] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[378] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[386] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[387] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[390] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[391] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[392] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[393] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[397] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[398] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[399] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[400] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[401] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[402] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[404] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].functionData) {
  _$jscoverage['/dd/ddm.js'].functionData = [];
  _$jscoverage['/dd/ddm.js'].functionData[0] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[1] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[2] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[3] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[4] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[5] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[6] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[7] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[8] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[9] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[10] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[11] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[12] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[13] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[14] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[15] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[16] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[17] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[18] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[19] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[20] = 0;
  _$jscoverage['/dd/ddm.js'].functionData[21] = 0;
}
if (! _$jscoverage['/dd/ddm.js'].branchData) {
  _$jscoverage['/dd/ddm.js'].branchData = {};
  _$jscoverage['/dd/ddm.js'].branchData['18'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['18'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['50'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['65'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['70'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['72'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['97'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['108'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['115'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['117'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['119'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['119'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['124'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['130'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['133'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['138'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['141'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['150'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['150'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['150'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['155'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['155'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['156'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['156'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['171'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['183'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['187'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['187'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['279'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['279'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['285'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['285'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['298'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['298'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['310'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['310'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['313'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['313'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['320'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['328'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['328'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['338'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['347'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['353'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['353'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['355'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['360'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['361'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['362'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['362'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['363'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['363'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['367'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['367'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['367'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['367'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['391'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['391'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['391'][1].init(13, 4, 'node');
function visit44_391_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['367'][3].init(44, 27, 'region.left >= region.right');
function visit43_367_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['367'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['367'][2].init(13, 27, 'region.top >= region.bottom');
function visit42_367_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['367'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['367'][1].init(13, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit41_367_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['367'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['363'][1].init(40, 28, 'region.bottom >= pointer.top');
function visit40_363_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['363'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['362'][2].init(106, 25, 'region.top <= pointer.top');
function visit39_362_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['362'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['362'][1].init(43, 69, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit38_362_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['361'][2].init(61, 28, 'region.right >= pointer.left');
function visit37_361_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['361'][1].init(42, 113, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit36_361_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['360'][2].init(16, 27, 'region.left <= pointer.left');
function visit35_360_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['360'][1].init(16, 156, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit34_360_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['355'][1].init(173, 43, 'node.__ddCachedHeight || node.outerHeight()');
function visit33_355_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['353'][1].init(66, 41, 'node.__ddCachedWidth || node.outerWidth()');
function visit32_353_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['353'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['347'][1].init(49, 21, '!node.__ddCachedWidth');
function visit31_347_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['338'][1].init(96, 12, 'drops.length');
function visit30_338_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['328'][1].init(96, 12, 'drops.length');
function visit29_328_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['328'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['320'][1].init(408, 3, 'ie6');
function visit28_320_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['313'][1].init(235, 14, 'cur === \'auto\'');
function visit27_313_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['313'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['310'][1].init(171, 2, 'ah');
function visit26_310_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['310'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['298'][1].init(63, 62, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit25_298_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['298'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['285'][1].init(680, 3, 'ie6');
function visit24_285_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['285'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['279'][1].init(460, 31, 'doc.body || doc.documentElement');
function visit23_279_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['279'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['187'][1].init(212, 10, 'activeDrop');
function visit22_187_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['187'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['183'][1].init(99, 10, 'self._shim');
function visit21_183_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['171'][1].init(179, 20, 'self.__needDropCheck');
function visit20_171_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['156'][1].init(21, 22, 'oldDrop !== activeDrop');
function visit19_156_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['155'][1].init(2481, 10, 'activeDrop');
function visit18_155_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['150'][2].init(2286, 22, 'oldDrop !== activeDrop');
function visit17_150_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['150'][1].init(2275, 33, 'oldDrop && oldDrop !== activeDrop');
function visit16_150_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['141'][1].init(131, 14, 'a === dragArea');
function visit15_141_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['138'][1].init(1515, 17, 'mode === \'strict\'');
function visit14_138_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['133'][1].init(140, 9, 'a > vArea');
function visit13_133_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['130'][1].init(1210, 20, 'mode === \'intersect\'');
function visit12_130_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['124'][1].init(87, 9, 'a < vArea');
function visit11_124_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['119'][1].init(77, 11, '!activeDrop');
function visit10_119_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['117'][1].init(62, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit9_117_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['115'][1].init(574, 16, 'mode === \'point\'');
function visit8_115_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['108'][1].init(377, 5, '!node');
function visit7_108_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['97'][1].init(21, 20, 'drop.get(\'disabled\')');
function visit6_97_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['72'][1].init(57, 29, 'self.get(\'validDrops\').length');
function visit5_72_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['70'][1].init(290, 18, 'drag.get(\'groups\')');
function visit4_70_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['65'][1].init(124, 16, 'drag.get(\'shim\')');
function visit3_65_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['50'][1].init(134, 12, 'index !== -1');
function visit2_50_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['18'][1].init(159, 11, 'UA.ie === 6');
function visit1_18_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['18'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/ddm.js'].functionData[0]++;
  _$jscoverage['/dd/ddm.js'].lineData[7]++;
  var Node = require('node'), Base = require('base');
  _$jscoverage['/dd/ddm.js'].lineData[10]++;
  var logger = S.getLogger('dd/ddm');
  _$jscoverage['/dd/ddm.js'].lineData[12]++;
  var UA = require('ua'), $ = Node.all, win = S.Env.host, doc = win.document, $doc = $(doc), $win = $(win), ie6 = visit1_18_1(UA.ie === 6), MOVE_DELAY = 30, SHIM_Z_INDEX = 999999;
  _$jscoverage['/dd/ddm.js'].lineData[35]++;
  var DDManger = Base.extend({
  addDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[1]++;
  _$jscoverage['/dd/ddm.js'].lineData[40]++;
  this.get('drops').push(d);
}, 
  removeDrop: function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[2]++;
  _$jscoverage['/dd/ddm.js'].lineData[47]++;
  var self = this, drops = self.get('drops'), index = S.indexOf(d, drops);
  _$jscoverage['/dd/ddm.js'].lineData[50]++;
  if (visit2_50_1(index !== -1)) {
    _$jscoverage['/dd/ddm.js'].lineData[51]++;
    drops.splice(index, 1);
  }
}, 
  start: function(e, drag) {
  _$jscoverage['/dd/ddm.js'].functionData[3]++;
  _$jscoverage['/dd/ddm.js'].lineData[62]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[63]++;
  self.setInternal('activeDrag', drag);
  _$jscoverage['/dd/ddm.js'].lineData[65]++;
  if (visit3_65_1(drag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[66]++;
    activeShim(self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[69]++;
  self.__needDropCheck = 0;
  _$jscoverage['/dd/ddm.js'].lineData[70]++;
  if (visit4_70_1(drag.get('groups'))) {
    _$jscoverage['/dd/ddm.js'].lineData[71]++;
    _activeDrops(self);
    _$jscoverage['/dd/ddm.js'].lineData[72]++;
    if (visit5_72_1(self.get('validDrops').length)) {
      _$jscoverage['/dd/ddm.js'].lineData[73]++;
      cacheWH(drag.get('node'));
      _$jscoverage['/dd/ddm.js'].lineData[74]++;
      self.__needDropCheck = 1;
    }
  }
}, 
  addValidDrop: function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[4]++;
  _$jscoverage['/dd/ddm.js'].lineData[83]++;
  this.get('validDrops').push(drop);
}, 
  _notifyDropsMove: function(ev, activeDrag) {
  _$jscoverage['/dd/ddm.js'].functionData[5]++;
  _$jscoverage['/dd/ddm.js'].lineData[87]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[88]++;
  var drops = self.get('validDrops'), mode = activeDrag.get('mode'), activeDrop = 0, oldDrop, vArea = 0, dragRegion = region(activeDrag.get('node')), dragArea = area(dragRegion);
  _$jscoverage['/dd/ddm.js'].lineData[96]++;
  S.each(drops, function(drop) {
  _$jscoverage['/dd/ddm.js'].functionData[6]++;
  _$jscoverage['/dd/ddm.js'].lineData[97]++;
  if (visit6_97_1(drop.get('disabled'))) {
    _$jscoverage['/dd/ddm.js'].lineData[98]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[101]++;
  var a, node = drop.getNodeFromTarget(ev, activeDrag.get('dragNode')[0], activeDrag.get('node')[0]);
  _$jscoverage['/dd/ddm.js'].lineData[108]++;
  if (visit7_108_1(!node)) {
    _$jscoverage['/dd/ddm.js'].lineData[112]++;
    return undefined;
  }
  _$jscoverage['/dd/ddm.js'].lineData[115]++;
  if (visit8_115_1(mode === 'point')) {
    _$jscoverage['/dd/ddm.js'].lineData[117]++;
    if (visit9_117_1(inNodeByPointer(node, activeDrag.mousePos))) {
      _$jscoverage['/dd/ddm.js'].lineData[118]++;
      a = area(region(node));
      _$jscoverage['/dd/ddm.js'].lineData[119]++;
      if (visit10_119_1(!activeDrop)) {
        _$jscoverage['/dd/ddm.js'].lineData[120]++;
        activeDrop = drop;
        _$jscoverage['/dd/ddm.js'].lineData[121]++;
        vArea = a;
      } else {
        _$jscoverage['/dd/ddm.js'].lineData[124]++;
        if (visit11_124_1(a < vArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[125]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[126]++;
          vArea = a;
        }
      }
    }
  } else {
    _$jscoverage['/dd/ddm.js'].lineData[130]++;
    if (visit12_130_1(mode === 'intersect')) {
      _$jscoverage['/dd/ddm.js'].lineData[132]++;
      a = area(intersect(dragRegion, region(node)));
      _$jscoverage['/dd/ddm.js'].lineData[133]++;
      if (visit13_133_1(a > vArea)) {
        _$jscoverage['/dd/ddm.js'].lineData[134]++;
        vArea = a;
        _$jscoverage['/dd/ddm.js'].lineData[135]++;
        activeDrop = drop;
      }
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[138]++;
      if (visit14_138_1(mode === 'strict')) {
        _$jscoverage['/dd/ddm.js'].lineData[140]++;
        a = area(intersect(dragRegion, region(node)));
        _$jscoverage['/dd/ddm.js'].lineData[141]++;
        if (visit15_141_1(a === dragArea)) {
          _$jscoverage['/dd/ddm.js'].lineData[142]++;
          activeDrop = drop;
          _$jscoverage['/dd/ddm.js'].lineData[143]++;
          return false;
        }
      }
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[146]++;
  return undefined;
});
  _$jscoverage['/dd/ddm.js'].lineData[149]++;
  oldDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[150]++;
  if (visit16_150_1(oldDrop && visit17_150_2(oldDrop !== activeDrop))) {
    _$jscoverage['/dd/ddm.js'].lineData[151]++;
    oldDrop._handleOut(ev);
    _$jscoverage['/dd/ddm.js'].lineData[152]++;
    activeDrag._handleOut(ev);
  }
  _$jscoverage['/dd/ddm.js'].lineData[154]++;
  self.setInternal('activeDrop', activeDrop);
  _$jscoverage['/dd/ddm.js'].lineData[155]++;
  if (visit18_155_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[156]++;
    if (visit19_156_1(oldDrop !== activeDrop)) {
      _$jscoverage['/dd/ddm.js'].lineData[157]++;
      activeDrop._handleEnter(ev);
    } else {
      _$jscoverage['/dd/ddm.js'].lineData[160]++;
      activeDrop._handleOver(ev);
    }
  }
}, 
  move: function(ev, activeDrag) {
  _$jscoverage['/dd/ddm.js'].functionData[7]++;
  _$jscoverage['/dd/ddm.js'].lineData[168]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[171]++;
  if (visit20_171_1(self.__needDropCheck)) {
    _$jscoverage['/dd/ddm.js'].lineData[172]++;
    self._notifyDropsMove(ev, activeDrag);
  }
}, 
  end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[8]++;
  _$jscoverage['/dd/ddm.js'].lineData[181]++;
  var self = this, activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[183]++;
  if (visit21_183_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[184]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[186]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[187]++;
  if (visit22_187_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[188]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[190]++;
  self.setInternal('activeDrop', null);
  _$jscoverage['/dd/ddm.js'].lineData[191]++;
  self.setInternal('activeDrag', null);
}}, {
  ATTRS: {
  dragCursor: {
  value: 'move'}, 
  activeDrag: {}, 
  activeDrop: {}, 
  drops: {
  value: []}, 
  validDrops: {
  value: []}}});
  _$jscoverage['/dd/ddm.js'].lineData[263]++;
  var activeShim = function(self) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[265]++;
  self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + self.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit23_279_1(doc.body || doc.documentElement)).css('opacity', 0);
  _$jscoverage['/dd/ddm.js'].lineData[283]++;
  activeShim = showShim;
  _$jscoverage['/dd/ddm.js'].lineData[285]++;
  if (visit24_285_1(ie6)) {
    _$jscoverage['/dd/ddm.js'].lineData[289]++;
    $win.on('resize scroll', adjustShimSize, self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[292]++;
  showShim(self);
};
  _$jscoverage['/dd/ddm.js'].lineData[295]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[10]++;
  _$jscoverage['/dd/ddm.js'].lineData[296]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[298]++;
  if (visit25_298_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[299]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[306]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[11]++;
    _$jscoverage['/dd/ddm.js'].lineData[308]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[310]++;
    if (visit26_310_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[311]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[313]++;
    if (visit27_313_1(cur === 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[314]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[316]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[320]++;
    if (visit28_320_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[321]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[325]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[326]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[327]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[328]++;
    if (visit29_328_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[329]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[13]++;
  _$jscoverage['/dd/ddm.js'].lineData[330]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[335]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[336]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[337]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[338]++;
    if (visit30_338_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[339]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[15]++;
  _$jscoverage['/dd/ddm.js'].lineData[340]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[345]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[16]++;
    _$jscoverage['/dd/ddm.js'].lineData[346]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[347]++;
    if (visit31_347_1(!node.__ddCachedWidth)) {
      _$jscoverage['/dd/ddm.js'].lineData[348]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[349]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[351]++;
    return {
  left: offset.left, 
  right: offset.left + (visit32_353_1(node.__ddCachedWidth || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit33_355_1(node.__ddCachedHeight || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[359]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[360]++;
    return visit34_360_1(visit35_360_2(region.left <= pointer.left) && visit36_361_1(visit37_361_2(region.right >= pointer.left) && visit38_362_1(visit39_362_2(region.top <= pointer.top) && visit40_363_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[366]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[18]++;
    _$jscoverage['/dd/ddm.js'].lineData[367]++;
    if (visit41_367_1(visit42_367_2(region.top >= region.bottom) || visit43_367_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[368]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[370]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[373]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[374]++;
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[378]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[386]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[387]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[390]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[391]++;
    if (visit44_391_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[392]++;
      node.__ddCachedWidth = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[393]++;
      node.__ddCachedHeight = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[397]++;
  var DDM = new DDManger();
  _$jscoverage['/dd/ddm.js'].lineData[398]++;
  DDM.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[399]++;
  DDM.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[400]++;
  DDM.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[401]++;
  DDM.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[402]++;
  DDM.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[404]++;
  return DDM;
});
