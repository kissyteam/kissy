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
  _$jscoverage['/dd/ddm.js'].lineData[167] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[170] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[171] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[180] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[182] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[183] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[185] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[186] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[187] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[189] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[190] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[262] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[264] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[282] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[284] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[288] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[291] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[294] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[295] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[297] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[298] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[305] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[307] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[309] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[310] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[312] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[313] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[315] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[319] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[320] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[324] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[325] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[326] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[327] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[328] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[329] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[334] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[335] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[336] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[337] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[338] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[339] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[344] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[345] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[346] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[347] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[348] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[350] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[358] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[359] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[365] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[366] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[367] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[369] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[372] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[373] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[377] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[385] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[386] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[389] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[390] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[391] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[392] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[396] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[397] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[398] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[399] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[400] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[401] = 0;
  _$jscoverage['/dd/ddm.js'].lineData[403] = 0;
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
  _$jscoverage['/dd/ddm.js'].branchData['170'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['182'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['182'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['186'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['278'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['284'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['284'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['297'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['309'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['309'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['312'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['312'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['319'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['327'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['337'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['337'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['346'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['346'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['352'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['352'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['354'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['354'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['359'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['359'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['359'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['360'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['360'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['360'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['361'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['361'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['362'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['366'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['366'][1] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['366'][2] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['366'][3] = new BranchData();
  _$jscoverage['/dd/ddm.js'].branchData['390'] = [];
  _$jscoverage['/dd/ddm.js'].branchData['390'][1] = new BranchData();
}
_$jscoverage['/dd/ddm.js'].branchData['390'][1].init(14, 4, 'node');
function visit44_390_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['390'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['366'][3].init(45, 27, 'region.left >= region.right');
function visit43_366_3(result) {
  _$jscoverage['/dd/ddm.js'].branchData['366'][3].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['366'][2].init(14, 27, 'region.top >= region.bottom');
function visit42_366_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['366'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['366'][1].init(14, 58, 'region.top >= region.bottom || region.left >= region.right');
function visit41_366_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['366'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['362'][1].init(41, 28, 'region.bottom >= pointer.top');
function visit40_362_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['361'][2].init(109, 25, 'region.top <= pointer.top');
function visit39_361_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['361'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['361'][1].init(44, 70, 'region.top <= pointer.top && region.bottom >= pointer.top');
function visit38_361_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['360'][2].init(63, 28, 'region.right >= pointer.left');
function visit37_360_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['360'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['360'][1].init(43, 115, 'region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit36_360_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['360'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['359'][2].init(17, 27, 'region.left <= pointer.left');
function visit35_359_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['359'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['359'][1].init(17, 159, 'region.left <= pointer.left && region.right >= pointer.left && region.top <= pointer.top && region.bottom >= pointer.top');
function visit34_359_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['359'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['354'][1].init(177, 43, 'node.__ddCachedHeight || node.outerHeight()');
function visit33_354_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['354'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['352'][1].init(68, 41, 'node.__ddCachedWidth || node.outerWidth()');
function visit32_352_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['352'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['346'][1].init(51, 21, '!node.__ddCachedWidth');
function visit31_346_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['346'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['337'][1].init(99, 12, 'drops.length');
function visit30_337_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['337'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['327'][1].init(99, 12, 'drops.length');
function visit29_327_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['319'][1].init(422, 3, 'ie6');
function visit28_319_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['312'][1].init(242, 14, 'cur === \'auto\'');
function visit27_312_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['312'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['309'][1].init(175, 2, 'ah');
function visit26_309_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['309'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['297'][1].init(66, 62, '(activeDrag = self.get(\'activeDrag\')) && activeDrag.get(\'shim\')');
function visit25_297_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['284'][1].init(702, 3, 'ie6');
function visit24_284_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['284'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['278'][1].init(474, 31, 'doc.body || doc.documentElement');
function visit23_278_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['186'][1].init(219, 10, 'activeDrop');
function visit22_186_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['182'][1].init(102, 10, 'self._shim');
function visit21_182_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['182'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['170'][1].init(184, 20, 'self.__needDropCheck');
function visit20_170_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['156'][1].init(22, 22, 'oldDrop !== activeDrop');
function visit19_156_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['156'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['155'][1].init(2550, 10, 'activeDrop');
function visit18_155_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['155'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['150'][2].init(2350, 22, 'oldDrop !== activeDrop');
function visit17_150_2(result) {
  _$jscoverage['/dd/ddm.js'].branchData['150'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['150'][1].init(2339, 33, 'oldDrop && oldDrop !== activeDrop');
function visit16_150_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['150'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['141'][1].init(134, 14, 'a === dragArea');
function visit15_141_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['138'][1].init(1557, 17, 'mode === \'strict\'');
function visit14_138_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['133'][1].init(143, 9, 'a > vArea');
function visit13_133_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['130'][1].init(1244, 20, 'mode === \'intersect\'');
function visit12_130_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['124'][1].init(89, 9, 'a < vArea');
function visit11_124_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['119'][1].init(79, 11, '!activeDrop');
function visit10_119_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['119'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['117'][1].init(64, 42, 'inNodeByPointer(node, activeDrag.mousePos)');
function visit9_117_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['115'][1].init(593, 16, 'mode === \'point\'');
function visit8_115_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['108'][1].init(389, 5, '!node');
function visit7_108_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['97'][1].init(22, 20, 'drop.get(\'disabled\')');
function visit6_97_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['72'][1].init(59, 29, 'self.get(\'validDrops\').length');
function visit5_72_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['70'][1].init(299, 18, 'drag.get(\'groups\')');
function visit4_70_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['65'][1].init(128, 16, 'drag.get(\'shim\')');
function visit3_65_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['50'][1].init(138, 12, 'index !== -1');
function visit2_50_1(result) {
  _$jscoverage['/dd/ddm.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/ddm.js'].branchData['18'][1].init(165, 11, 'UA.ie === 6');
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
  _$jscoverage['/dd/ddm.js'].lineData[167]++;
  var self = this;
  _$jscoverage['/dd/ddm.js'].lineData[170]++;
  if (visit20_170_1(self.__needDropCheck)) {
    _$jscoverage['/dd/ddm.js'].lineData[171]++;
    self._notifyDropsMove(ev, activeDrag);
  }
}, 
  end: function(e) {
  _$jscoverage['/dd/ddm.js'].functionData[8]++;
  _$jscoverage['/dd/ddm.js'].lineData[180]++;
  var self = this, activeDrop = self.get('activeDrop');
  _$jscoverage['/dd/ddm.js'].lineData[182]++;
  if (visit21_182_1(self._shim)) {
    _$jscoverage['/dd/ddm.js'].lineData[183]++;
    self._shim.hide();
  }
  _$jscoverage['/dd/ddm.js'].lineData[185]++;
  _deActiveDrops(self);
  _$jscoverage['/dd/ddm.js'].lineData[186]++;
  if (visit22_186_1(activeDrop)) {
    _$jscoverage['/dd/ddm.js'].lineData[187]++;
    activeDrop._end(e);
  }
  _$jscoverage['/dd/ddm.js'].lineData[189]++;
  self.setInternal('activeDrop', null);
  _$jscoverage['/dd/ddm.js'].lineData[190]++;
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
  _$jscoverage['/dd/ddm.js'].lineData[262]++;
  var activeShim = function(self) {
  _$jscoverage['/dd/ddm.js'].functionData[9]++;
  _$jscoverage['/dd/ddm.js'].lineData[264]++;
  self._shim = $('<div ' + 'style="' + 'background-color:red;' + 'position:' + (ie6 ? 'absolute' : 'fixed') + ';' + 'left:0;' + 'width:100%;' + 'height:100%;' + 'top:0;' + 'cursor:' + self.get('dragCursor') + ';' + 'z-index:' + SHIM_Z_INDEX + ';' + '"><' + '/div>').prependTo(visit23_278_1(doc.body || doc.documentElement)).css('opacity', 0);
  _$jscoverage['/dd/ddm.js'].lineData[282]++;
  activeShim = showShim;
  _$jscoverage['/dd/ddm.js'].lineData[284]++;
  if (visit24_284_1(ie6)) {
    _$jscoverage['/dd/ddm.js'].lineData[288]++;
    $win.on('resize scroll', adjustShimSize, self);
  }
  _$jscoverage['/dd/ddm.js'].lineData[291]++;
  showShim(self);
};
  _$jscoverage['/dd/ddm.js'].lineData[294]++;
  var adjustShimSize = S.throttle(function() {
  _$jscoverage['/dd/ddm.js'].functionData[10]++;
  _$jscoverage['/dd/ddm.js'].lineData[295]++;
  var self = this, activeDrag;
  _$jscoverage['/dd/ddm.js'].lineData[297]++;
  if (visit25_297_1((activeDrag = self.get('activeDrag')) && activeDrag.get('shim'))) {
    _$jscoverage['/dd/ddm.js'].lineData[298]++;
    self._shim.css({
  width: $doc.width(), 
  height: $doc.height()});
  }
}, MOVE_DELAY);
  _$jscoverage['/dd/ddm.js'].lineData[305]++;
  function showShim(self) {
    _$jscoverage['/dd/ddm.js'].functionData[11]++;
    _$jscoverage['/dd/ddm.js'].lineData[307]++;
    var ah = self.get('activeDrag').get('activeHandler'), cur = 'auto';
    _$jscoverage['/dd/ddm.js'].lineData[309]++;
    if (visit26_309_1(ah)) {
      _$jscoverage['/dd/ddm.js'].lineData[310]++;
      cur = ah.css('cursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[312]++;
    if (visit27_312_1(cur === 'auto')) {
      _$jscoverage['/dd/ddm.js'].lineData[313]++;
      cur = self.get('dragCursor');
    }
    _$jscoverage['/dd/ddm.js'].lineData[315]++;
    self._shim.css({
  cursor: cur, 
  display: 'block'});
    _$jscoverage['/dd/ddm.js'].lineData[319]++;
    if (visit28_319_1(ie6)) {
      _$jscoverage['/dd/ddm.js'].lineData[320]++;
      adjustShimSize.call(self);
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[324]++;
  function _activeDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[12]++;
    _$jscoverage['/dd/ddm.js'].lineData[325]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[326]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[327]++;
    if (visit29_327_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[328]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[13]++;
  _$jscoverage['/dd/ddm.js'].lineData[329]++;
  d._active();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[334]++;
  function _deActiveDrops(self) {
    _$jscoverage['/dd/ddm.js'].functionData[14]++;
    _$jscoverage['/dd/ddm.js'].lineData[335]++;
    var drops = self.get('drops');
    _$jscoverage['/dd/ddm.js'].lineData[336]++;
    self.setInternal('validDrops', []);
    _$jscoverage['/dd/ddm.js'].lineData[337]++;
    if (visit30_337_1(drops.length)) {
      _$jscoverage['/dd/ddm.js'].lineData[338]++;
      S.each(drops, function(d) {
  _$jscoverage['/dd/ddm.js'].functionData[15]++;
  _$jscoverage['/dd/ddm.js'].lineData[339]++;
  d._deActive();
});
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[344]++;
  function region(node) {
    _$jscoverage['/dd/ddm.js'].functionData[16]++;
    _$jscoverage['/dd/ddm.js'].lineData[345]++;
    var offset = node.offset();
    _$jscoverage['/dd/ddm.js'].lineData[346]++;
    if (visit31_346_1(!node.__ddCachedWidth)) {
      _$jscoverage['/dd/ddm.js'].lineData[347]++;
      logger.debug('no cache in dd!');
      _$jscoverage['/dd/ddm.js'].lineData[348]++;
      logger.debug(node[0]);
    }
    _$jscoverage['/dd/ddm.js'].lineData[350]++;
    return {
  left: offset.left, 
  right: offset.left + (visit32_352_1(node.__ddCachedWidth || node.outerWidth())), 
  top: offset.top, 
  bottom: offset.top + (visit33_354_1(node.__ddCachedHeight || node.outerHeight()))};
  }
  _$jscoverage['/dd/ddm.js'].lineData[358]++;
  function inRegion(region, pointer) {
    _$jscoverage['/dd/ddm.js'].functionData[17]++;
    _$jscoverage['/dd/ddm.js'].lineData[359]++;
    return visit34_359_1(visit35_359_2(region.left <= pointer.left) && visit36_360_1(visit37_360_2(region.right >= pointer.left) && visit38_361_1(visit39_361_2(region.top <= pointer.top) && visit40_362_1(region.bottom >= pointer.top))));
  }
  _$jscoverage['/dd/ddm.js'].lineData[365]++;
  function area(region) {
    _$jscoverage['/dd/ddm.js'].functionData[18]++;
    _$jscoverage['/dd/ddm.js'].lineData[366]++;
    if (visit41_366_1(visit42_366_2(region.top >= region.bottom) || visit43_366_3(region.left >= region.right))) {
      _$jscoverage['/dd/ddm.js'].lineData[367]++;
      return 0;
    }
    _$jscoverage['/dd/ddm.js'].lineData[369]++;
    return (region.right - region.left) * (region.bottom - region.top);
  }
  _$jscoverage['/dd/ddm.js'].lineData[372]++;
  function intersect(r1, r2) {
    _$jscoverage['/dd/ddm.js'].functionData[19]++;
    _$jscoverage['/dd/ddm.js'].lineData[373]++;
    var t = Math.max(r1.top, r2.top), r = Math.min(r1.right, r2.right), b = Math.min(r1.bottom, r2.bottom), l = Math.max(r1.left, r2.left);
    _$jscoverage['/dd/ddm.js'].lineData[377]++;
    return {
  left: l, 
  right: r, 
  top: t, 
  bottom: b};
  }
  _$jscoverage['/dd/ddm.js'].lineData[385]++;
  function inNodeByPointer(node, point) {
    _$jscoverage['/dd/ddm.js'].functionData[20]++;
    _$jscoverage['/dd/ddm.js'].lineData[386]++;
    return inRegion(region(node), point);
  }
  _$jscoverage['/dd/ddm.js'].lineData[389]++;
  function cacheWH(node) {
    _$jscoverage['/dd/ddm.js'].functionData[21]++;
    _$jscoverage['/dd/ddm.js'].lineData[390]++;
    if (visit44_390_1(node)) {
      _$jscoverage['/dd/ddm.js'].lineData[391]++;
      node.__ddCachedWidth = node.outerWidth();
      _$jscoverage['/dd/ddm.js'].lineData[392]++;
      node.__ddCachedHeight = node.outerHeight();
    }
  }
  _$jscoverage['/dd/ddm.js'].lineData[396]++;
  var DDM = new DDManger();
  _$jscoverage['/dd/ddm.js'].lineData[397]++;
  DDM.inRegion = inRegion;
  _$jscoverage['/dd/ddm.js'].lineData[398]++;
  DDM.region = region;
  _$jscoverage['/dd/ddm.js'].lineData[399]++;
  DDM.area = area;
  _$jscoverage['/dd/ddm.js'].lineData[400]++;
  DDM.cacheWH = cacheWH;
  _$jscoverage['/dd/ddm.js'].lineData[401]++;
  DDM.PREFIX_CLS = 'ks-dd-';
  _$jscoverage['/dd/ddm.js'].lineData[403]++;
  return DDM;
});
