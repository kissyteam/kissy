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
if (! _$jscoverage['/dent-cmd.js']) {
  _$jscoverage['/dent-cmd.js'] = {};
  _$jscoverage['/dent-cmd.js'].lineData = [];
  _$jscoverage['/dent-cmd.js'].lineData[10] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[11] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[12] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[14] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[25] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[26] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[29] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[33] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[35] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[36] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[37] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[38] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[40] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[41] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[44] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[47] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[48] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[49] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[50] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[51] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[53] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[54] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[60] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[62] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[63] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[66] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[67] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[68] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[69] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[72] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[78] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[82] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[83] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[85] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[87] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[88] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[104] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[106] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[110] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[114] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[115] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[116] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[117] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[119] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[123] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[124] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[126] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[131] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[132] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[134] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[137] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[138] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[139] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[143] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[148] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[149] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[151] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[153] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[155] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[160] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[163] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[164] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[167] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[168] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[169] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[170] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[174] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[175] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[176] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[177] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[179] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[180] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[181] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[183] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[184] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[185] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[186] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[187] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[190] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[194] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[195] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[197] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[198] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[200] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[205] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[207] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[214] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[217] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[218] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[219] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[222] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[225] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[226] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[227] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[230] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[232] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[233] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[234] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[235] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[237] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[241] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[243] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[247] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[249] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[252] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[253] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[254] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[256] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[257] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[258] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[259] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[265] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[267] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[268] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[269] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[271] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[272] = 0;
}
if (! _$jscoverage['/dent-cmd.js'].functionData) {
  _$jscoverage['/dent-cmd.js'].functionData = [];
  _$jscoverage['/dent-cmd.js'].functionData[0] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[1] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[2] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[3] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[4] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[5] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[6] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[7] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[8] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[9] = 0;
  _$jscoverage['/dent-cmd.js'].functionData[10] = 0;
}
if (! _$jscoverage['/dent-cmd.js'].branchData) {
  _$jscoverage['/dent-cmd.js'].branchData = {};
  _$jscoverage['/dent-cmd.js'].branchData['26'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['26'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['26'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['26'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['35'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['37'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['40'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['40'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['48'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['48'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['53'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['53'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['66'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['67'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['67'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['72'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['84'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['84'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['105'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['105'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['105'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['105'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['115'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['115'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['117'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['118'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['123'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['124'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['125'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['125'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['131'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['132'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['133'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['133'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['137'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['138'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['143'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['148'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['149'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['149'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['176'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['176'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['179'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['180'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['180'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['186'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['196'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['197'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['205'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['205'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['214'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['215'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['222'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['223'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['223'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['232'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['234'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['234'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['234'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['238'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['238'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['241'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['241'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['253'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['268'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['268'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['271'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['272'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['272'][1] = new BranchData();
}
_$jscoverage['/dent-cmd.js'].branchData['272'][1].init(85, 41, 'block && block.style(INDENT_CSS_PROPERTY)');
function visit55_272_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['271'][1].init(29, 31, 'elementPath.block || blockLimit');
function visit54_271_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['268'][1].init(70, 35, 'elementPath.contains(listNodeNames)');
function visit53_268_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['268'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['253'][1].init(13, 27, '!editor.hasCommand(cmdType)');
function visit52_253_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['241'][2].init(465, 72, 'indentWholeList && indentElement(nearestListBlock, type)');
function visit51_241_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['241'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['241'][1].init(462, 77, '!(indentWholeList && indentElement(nearestListBlock, type))');
function visit50_241_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['238'][2].init(72, 33, 'firstListItem[0] == rangeStart[0]');
function visit49_238_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['238'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['238'][1].init(72, 71, 'firstListItem[0] == rangeStart[0] || firstListItem.contains(rangeStart)');
function visit48_238_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['234'][2].init(95, 32, 'firstListItem.nodeName() != "li"');
function visit47_234_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['234'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['234'][1].init(78, 49, 'firstListItem && firstListItem.nodeName() != "li"');
function visit46_234_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['234'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['232'][1].init(1426, 16, 'nearestListBlock');
function visit45_232_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['223'][2].init(1099, 53, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit44_223_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['223'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['223'][1].init(31, 109, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames');
function visit43_223_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['222'][1].init(1065, 141, 'nearestListBlock && endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames');
function visit42_222_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['215'][2].init(790, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit41_215_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['215'][1].init(31, 113, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames');
function visit40_215_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['214'][1].init(756, 145, 'nearestListBlock && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames');
function visit39_214_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['205'][3].init(389, 57, 'nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit38_205_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['205'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['205'][2].init(389, 117, 'nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()]');
function visit37_205_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['205'][1].init(366, 142, 'nearestListBlock && !(nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()])');
function visit36_205_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['197'][1].init(119, 6, '!range');
function visit35_197_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['196'][1].init(58, 37, 'selection && selection.getRanges()[0]');
function visit34_196_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['186'][1].init(535, 31, 'element[0].style.cssText === \'\'');
function visit33_186_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['180'][1].init(240, 17, 'currentOffset < 0');
function visit32_180_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['180'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['179'][1].init(183, 16, 'type == \'indent\'');
function visit31_179_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['176'][1].init(91, 20, 'isNaN(currentOffset)');
function visit30_176_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['176'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['149'][1].init(32, 45, 'isNotWhitespaces(node) && isNotBookmark(node)');
function visit29_149_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['149'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['148'][1].init(192, 143, 'UA[\'ie\'] && !li.first(function(node) {\n  return isNotWhitespaces(node) && isNotBookmark(node);\n}, 1)');
function visit28_148_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['143'][1].init(182, 104, '(followingList = followingList.next()) && followingList.nodeName() in listNodeNames');
function visit27_143_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['138'][1].init(25, 22, 'i < pendingList.length');
function visit26_138_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['137'][1].init(4312, 33, 'pendingList && pendingList.length');
function visit25_137_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['133'][1].init(73, 23, 'listNode[0] || listNode');
function visit24_133_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['133'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['132'][1].init(30, 39, 'newList.listNode[0] || newList.listNode');
function visit23_132_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['131'][1].init(4071, 7, 'newList');
function visit22_131_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['125'][1].init(58, 24, 'child.nodeName() == \'li\'');
function visit21_125_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['125'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['124'][1].init(27, 83, '(child = new Node(children[i])) && child.nodeName() == \'li\'');
function visit20_124_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['123'][1].init(171, 6, 'i >= 0');
function visit19_123_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['118'][1].init(56, 34, 'parentLiElement.nodeName() == \'li\'');
function visit18_118_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['117'][1].init(52, 91, '(parentLiElement = listNode.parent()) && parentLiElement.nodeName() == \'li\'');
function visit17_117_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['115'][1].init(3504, 17, 'type == \'outdent\'');
function visit16_115_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['115'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['105'][3].init(23, 32, 'listArray[i].indent > baseIndent');
function visit15_105_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['105'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['105'][2].init(2998, 20, 'i < listArray.length');
function visit14_105_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['105'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['105'][1].init(59, 56, 'i < listArray.length && listArray[i].indent > baseIndent');
function visit13_105_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['105'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['84'][1].init(56, 37, 'i <= lastItem.data(\'listarray_index\')');
function visit12_84_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['84'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['72'][1].init(1728, 16, 'type == \'indent\'');
function visit11_72_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['67'][1].init(17, 42, 'listNodeNames[listParents[i].nodeName()]');
function visit10_67_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['67'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['66'][1].init(1518, 22, 'i < listParents.length');
function visit9_66_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['53'][1].init(1001, 22, 'itemsToMove.length < 1');
function visit8_53_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['53'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['48'][1].init(17, 26, 'block.equals(endContainer)');
function visit7_48_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['48'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['40'][1].init(572, 32, '!startContainer || !endContainer');
function visit6_40_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['40'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['37'][1].init(452, 55, 'endContainer && !endContainer.parent().equals(listNode)');
function visit5_37_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['35'][1].init(322, 59, 'startContainer && !startContainer.parent().equals(listNode)');
function visit4_35_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['26'][3].init(62, 26, 'Dom.nodeName(node) == \'li\'');
function visit3_26_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['26'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['26'][2].init(16, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit2_26_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['26'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['26'][1].init(16, 72, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && Dom.nodeName(node) == \'li\'');
function visit1_26_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['26'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].lineData[10]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dent-cmd.js'].functionData[0]++;
  _$jscoverage['/dent-cmd.js'].lineData[11]++;
  var Editor = require('editor');
  _$jscoverage['/dent-cmd.js'].lineData[12]++;
  var ListUtils = require('./list-utils');
  _$jscoverage['/dent-cmd.js'].lineData[14]++;
  var listNodeNames = {
  ol: 1, 
  ul: 1}, Walker = Editor.Walker, Dom = S.DOM, Node = S.Node, UA = S.UA, isNotWhitespaces = Walker.whitespaces(true), INDENT_CSS_PROPERTY = "margin-left", INDENT_OFFSET = 40, INDENT_UNIT = "px", isNotBookmark = Walker.bookmark(false, true);
  _$jscoverage['/dent-cmd.js'].lineData[25]++;
  function isListItem(node) {
    _$jscoverage['/dent-cmd.js'].functionData[1]++;
    _$jscoverage['/dent-cmd.js'].lineData[26]++;
    return visit1_26_1(visit2_26_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && visit3_26_3(Dom.nodeName(node) == 'li'));
  }
  _$jscoverage['/dent-cmd.js'].lineData[29]++;
  function indentList(range, listNode, type) {
    _$jscoverage['/dent-cmd.js'].functionData[2]++;
    _$jscoverage['/dent-cmd.js'].lineData[33]++;
    var startContainer = range.startContainer, endContainer = range.endContainer;
    _$jscoverage['/dent-cmd.js'].lineData[35]++;
    while (visit4_35_1(startContainer && !startContainer.parent().equals(listNode))) {
      _$jscoverage['/dent-cmd.js'].lineData[36]++;
      startContainer = startContainer.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[37]++;
    while (visit5_37_1(endContainer && !endContainer.parent().equals(listNode))) {
      _$jscoverage['/dent-cmd.js'].lineData[38]++;
      endContainer = endContainer.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[40]++;
    if (visit6_40_1(!startContainer || !endContainer)) {
      _$jscoverage['/dent-cmd.js'].lineData[41]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[44]++;
    var block = startContainer, itemsToMove = [], stopFlag = false;
    _$jscoverage['/dent-cmd.js'].lineData[47]++;
    while (!stopFlag) {
      _$jscoverage['/dent-cmd.js'].lineData[48]++;
      if (visit7_48_1(block.equals(endContainer))) {
        _$jscoverage['/dent-cmd.js'].lineData[49]++;
        stopFlag = true;
      }
      _$jscoverage['/dent-cmd.js'].lineData[50]++;
      itemsToMove.push(block);
      _$jscoverage['/dent-cmd.js'].lineData[51]++;
      block = block.next();
    }
    _$jscoverage['/dent-cmd.js'].lineData[53]++;
    if (visit8_53_1(itemsToMove.length < 1)) {
      _$jscoverage['/dent-cmd.js'].lineData[54]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[60]++;
    var listParents = listNode._4eParents(true, undefined);
    _$jscoverage['/dent-cmd.js'].lineData[62]++;
    listParents.each(function(n, i) {
  _$jscoverage['/dent-cmd.js'].functionData[3]++;
  _$jscoverage['/dent-cmd.js'].lineData[63]++;
  listParents[i] = n;
});
    _$jscoverage['/dent-cmd.js'].lineData[66]++;
    for (var i = 0; visit9_66_1(i < listParents.length); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[67]++;
      if (visit10_67_1(listNodeNames[listParents[i].nodeName()])) {
        _$jscoverage['/dent-cmd.js'].lineData[68]++;
        listNode = listParents[i];
        _$jscoverage['/dent-cmd.js'].lineData[69]++;
        break;
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[72]++;
    var indentOffset = visit11_72_1(type == 'indent') ? 1 : -1, startItem = itemsToMove[0], lastItem = itemsToMove[itemsToMove.length - 1], database = {};
    _$jscoverage['/dent-cmd.js'].lineData[78]++;
    var listArray = ListUtils.listToArray(listNode, database);
    _$jscoverage['/dent-cmd.js'].lineData[82]++;
    var baseIndent = listArray[lastItem.data('listarray_index')].indent;
    _$jscoverage['/dent-cmd.js'].lineData[83]++;
    for (i = startItem.data('listarray_index'); visit12_84_1(i <= lastItem.data('listarray_index')); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[85]++;
      listArray[i].indent += indentOffset;
      _$jscoverage['/dent-cmd.js'].lineData[87]++;
      var listRoot = listArray[i].parent;
      _$jscoverage['/dent-cmd.js'].lineData[88]++;
      listArray[i].parent = new Node(listRoot[0].ownerDocument.createElement(listRoot.nodeName()));
    }
    _$jscoverage['/dent-cmd.js'].lineData[104]++;
    for (i = lastItem.data('listarray_index') + 1; visit13_105_1(visit14_105_2(i < listArray.length) && visit15_105_3(listArray[i].indent > baseIndent)); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[106]++;
      listArray[i].indent += indentOffset;
    }
    _$jscoverage['/dent-cmd.js'].lineData[110]++;
    var newList = ListUtils.arrayToList(listArray, database, null, 'p');
    _$jscoverage['/dent-cmd.js'].lineData[114]++;
    var pendingList = [];
    _$jscoverage['/dent-cmd.js'].lineData[115]++;
    if (visit16_115_1(type == 'outdent')) {
      _$jscoverage['/dent-cmd.js'].lineData[116]++;
      var parentLiElement;
      _$jscoverage['/dent-cmd.js'].lineData[117]++;
      if (visit17_117_1((parentLiElement = listNode.parent()) && visit18_118_1(parentLiElement.nodeName() == 'li'))) {
        _$jscoverage['/dent-cmd.js'].lineData[119]++;
        var children = newList.listNode.childNodes, count = children.length, child;
        _$jscoverage['/dent-cmd.js'].lineData[123]++;
        for (i = count - 1; visit19_123_1(i >= 0); i--) {
          _$jscoverage['/dent-cmd.js'].lineData[124]++;
          if (visit20_124_1((child = new Node(children[i])) && visit21_125_1(child.nodeName() == 'li'))) {
            _$jscoverage['/dent-cmd.js'].lineData[126]++;
            pendingList.push(child);
          }
        }
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[131]++;
    if (visit22_131_1(newList)) {
      _$jscoverage['/dent-cmd.js'].lineData[132]++;
      Dom.insertBefore(visit23_132_1(newList.listNode[0] || newList.listNode), visit24_133_1(listNode[0] || listNode));
      _$jscoverage['/dent-cmd.js'].lineData[134]++;
      listNode.remove();
    }
    _$jscoverage['/dent-cmd.js'].lineData[137]++;
    if (visit25_137_1(pendingList && pendingList.length)) {
      _$jscoverage['/dent-cmd.js'].lineData[138]++;
      for (i = 0; visit26_138_1(i < pendingList.length); i++) {
        _$jscoverage['/dent-cmd.js'].lineData[139]++;
        var li = pendingList[i], followingList = li;
        _$jscoverage['/dent-cmd.js'].lineData[143]++;
        while (visit27_143_1((followingList = followingList.next()) && followingList.nodeName() in listNodeNames)) {
          _$jscoverage['/dent-cmd.js'].lineData[148]++;
          if (visit28_148_1(UA.ie && !li.first(function(node) {
  _$jscoverage['/dent-cmd.js'].functionData[4]++;
  _$jscoverage['/dent-cmd.js'].lineData[149]++;
  return visit29_149_1(isNotWhitespaces(node) && isNotBookmark(node));
}, 1))) {
            _$jscoverage['/dent-cmd.js'].lineData[151]++;
            li[0].appendChild(range.document.createTextNode('\xa0'));
          }
          _$jscoverage['/dent-cmd.js'].lineData[153]++;
          li[0].appendChild(followingList[0]);
        }
        _$jscoverage['/dent-cmd.js'].lineData[155]++;
        Dom.insertAfter(li[0], parentLiElement[0]);
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[160]++;
    Editor.Utils.clearAllMarkers(database);
  }
  _$jscoverage['/dent-cmd.js'].lineData[163]++;
  function indentBlock(range, type) {
    _$jscoverage['/dent-cmd.js'].functionData[5]++;
    _$jscoverage['/dent-cmd.js'].lineData[164]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/dent-cmd.js'].lineData[167]++;
    iterator.enforceRealBlocks = true;
    _$jscoverage['/dent-cmd.js'].lineData[168]++;
    iterator.enlargeBr = true;
    _$jscoverage['/dent-cmd.js'].lineData[169]++;
    while (block = iterator.getNextParagraph()) {
      _$jscoverage['/dent-cmd.js'].lineData[170]++;
      indentElement(block, type);
    }
  }
  _$jscoverage['/dent-cmd.js'].lineData[174]++;
  function indentElement(element, type) {
    _$jscoverage['/dent-cmd.js'].functionData[6]++;
    _$jscoverage['/dent-cmd.js'].lineData[175]++;
    var currentOffset = parseInt(element.style(INDENT_CSS_PROPERTY), 10);
    _$jscoverage['/dent-cmd.js'].lineData[176]++;
    if (visit30_176_1(isNaN(currentOffset))) {
      _$jscoverage['/dent-cmd.js'].lineData[177]++;
      currentOffset = 0;
    }
    _$jscoverage['/dent-cmd.js'].lineData[179]++;
    currentOffset += (visit31_179_1(type == 'indent') ? 1 : -1) * INDENT_OFFSET;
    _$jscoverage['/dent-cmd.js'].lineData[180]++;
    if (visit32_180_1(currentOffset < 0)) {
      _$jscoverage['/dent-cmd.js'].lineData[181]++;
      return false;
    }
    _$jscoverage['/dent-cmd.js'].lineData[183]++;
    currentOffset = Math.max(currentOffset, 0);
    _$jscoverage['/dent-cmd.js'].lineData[184]++;
    currentOffset = Math.ceil(currentOffset / INDENT_OFFSET) * INDENT_OFFSET;
    _$jscoverage['/dent-cmd.js'].lineData[185]++;
    element.css(INDENT_CSS_PROPERTY, currentOffset ? currentOffset + INDENT_UNIT : '');
    _$jscoverage['/dent-cmd.js'].lineData[186]++;
    if (visit33_186_1(element[0].style.cssText === '')) {
      _$jscoverage['/dent-cmd.js'].lineData[187]++;
      element.removeAttr('style');
    }
    _$jscoverage['/dent-cmd.js'].lineData[190]++;
    return true;
  }
  _$jscoverage['/dent-cmd.js'].lineData[194]++;
  function indentEditor(editor, type) {
    _$jscoverage['/dent-cmd.js'].functionData[7]++;
    _$jscoverage['/dent-cmd.js'].lineData[195]++;
    var selection = editor.getSelection(), range = visit34_196_1(selection && selection.getRanges()[0]);
    _$jscoverage['/dent-cmd.js'].lineData[197]++;
    if (visit35_197_1(!range)) {
      _$jscoverage['/dent-cmd.js'].lineData[198]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[200]++;
    var startContainer = range.startContainer, endContainer = range.endContainer, rangeRoot = range.getCommonAncestor(), nearestListBlock = rangeRoot;
    _$jscoverage['/dent-cmd.js'].lineData[205]++;
    while (visit36_205_1(nearestListBlock && !(visit37_205_2(visit38_205_3(nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE) && listNodeNames[nearestListBlock.nodeName()])))) {
      _$jscoverage['/dent-cmd.js'].lineData[207]++;
      nearestListBlock = nearestListBlock.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[214]++;
    if (visit39_214_1(nearestListBlock && visit40_215_1(visit41_215_2(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && startContainer.nodeName() in listNodeNames))) {
      _$jscoverage['/dent-cmd.js'].lineData[217]++;
      var walker = new Walker(range);
      _$jscoverage['/dent-cmd.js'].lineData[218]++;
      walker.evaluator = isListItem;
      _$jscoverage['/dent-cmd.js'].lineData[219]++;
      range.startContainer = walker.next();
    }
    _$jscoverage['/dent-cmd.js'].lineData[222]++;
    if (visit42_222_1(nearestListBlock && visit43_223_1(visit44_223_2(endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && endContainer.nodeName() in listNodeNames))) {
      _$jscoverage['/dent-cmd.js'].lineData[225]++;
      walker = new Walker(range);
      _$jscoverage['/dent-cmd.js'].lineData[226]++;
      walker.evaluator = isListItem;
      _$jscoverage['/dent-cmd.js'].lineData[227]++;
      range.endContainer = walker.previous();
    }
    _$jscoverage['/dent-cmd.js'].lineData[230]++;
    var bookmarks = selection.createBookmarks(true);
    _$jscoverage['/dent-cmd.js'].lineData[232]++;
    if (visit45_232_1(nearestListBlock)) {
      _$jscoverage['/dent-cmd.js'].lineData[233]++;
      var firstListItem = nearestListBlock.first();
      _$jscoverage['/dent-cmd.js'].lineData[234]++;
      while (visit46_234_1(firstListItem && visit47_234_2(firstListItem.nodeName() != "li"))) {
        _$jscoverage['/dent-cmd.js'].lineData[235]++;
        firstListItem = firstListItem.next();
      }
      _$jscoverage['/dent-cmd.js'].lineData[237]++;
      var rangeStart = range.startContainer, indentWholeList = visit48_238_1(visit49_238_2(firstListItem[0] == rangeStart[0]) || firstListItem.contains(rangeStart));
      _$jscoverage['/dent-cmd.js'].lineData[241]++;
      if (visit50_241_1(!(visit51_241_2(indentWholeList && indentElement(nearestListBlock, type))))) {
        _$jscoverage['/dent-cmd.js'].lineData[243]++;
        indentList(range, nearestListBlock, type);
      }
    } else {
      _$jscoverage['/dent-cmd.js'].lineData[247]++;
      indentBlock(range, type);
    }
    _$jscoverage['/dent-cmd.js'].lineData[249]++;
    selection.selectBookmarks(bookmarks);
  }
  _$jscoverage['/dent-cmd.js'].lineData[252]++;
  function addCommand(editor, cmdType) {
    _$jscoverage['/dent-cmd.js'].functionData[8]++;
    _$jscoverage['/dent-cmd.js'].lineData[253]++;
    if (visit52_253_1(!editor.hasCommand(cmdType))) {
      _$jscoverage['/dent-cmd.js'].lineData[254]++;
      editor.addCommand(cmdType, {
  exec: function(editor) {
  _$jscoverage['/dent-cmd.js'].functionData[9]++;
  _$jscoverage['/dent-cmd.js'].lineData[256]++;
  editor.execCommand('save');
  _$jscoverage['/dent-cmd.js'].lineData[257]++;
  indentEditor(editor, cmdType);
  _$jscoverage['/dent-cmd.js'].lineData[258]++;
  editor.execCommand('save');
  _$jscoverage['/dent-cmd.js'].lineData[259]++;
  editor.notifySelectionChange();
}});
    }
  }
  _$jscoverage['/dent-cmd.js'].lineData[265]++;
  return {
  checkOutdentActive: function(elementPath) {
  _$jscoverage['/dent-cmd.js'].functionData[10]++;
  _$jscoverage['/dent-cmd.js'].lineData[267]++;
  var blockLimit = elementPath.blockLimit;
  _$jscoverage['/dent-cmd.js'].lineData[268]++;
  if (visit53_268_1(elementPath.contains(listNodeNames))) {
    _$jscoverage['/dent-cmd.js'].lineData[269]++;
    return true;
  } else {
    _$jscoverage['/dent-cmd.js'].lineData[271]++;
    var block = visit54_271_1(elementPath.block || blockLimit);
    _$jscoverage['/dent-cmd.js'].lineData[272]++;
    return visit55_272_1(block && block.style(INDENT_CSS_PROPERTY));
  }
}, 
  addCommand: addCommand};
});
