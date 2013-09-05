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
if (! _$jscoverage['/loader/utils.js']) {
  _$jscoverage['/loader/utils.js'] = {};
  _$jscoverage['/loader/utils.js'].lineData = [];
  _$jscoverage['/loader/utils.js'].lineData[6] = 0;
  _$jscoverage['/loader/utils.js'].lineData[7] = 0;
  _$jscoverage['/loader/utils.js'].lineData[27] = 0;
  _$jscoverage['/loader/utils.js'].lineData[28] = 0;
  _$jscoverage['/loader/utils.js'].lineData[29] = 0;
  _$jscoverage['/loader/utils.js'].lineData[31] = 0;
  _$jscoverage['/loader/utils.js'].lineData[34] = 0;
  _$jscoverage['/loader/utils.js'].lineData[35] = 0;
  _$jscoverage['/loader/utils.js'].lineData[37] = 0;
  _$jscoverage['/loader/utils.js'].lineData[41] = 0;
  _$jscoverage['/loader/utils.js'].lineData[43] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[46] = 0;
  _$jscoverage['/loader/utils.js'].lineData[49] = 0;
  _$jscoverage['/loader/utils.js'].lineData[50] = 0;
  _$jscoverage['/loader/utils.js'].lineData[51] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[57] = 0;
  _$jscoverage['/loader/utils.js'].lineData[59] = 0;
  _$jscoverage['/loader/utils.js'].lineData[64] = 0;
  _$jscoverage['/loader/utils.js'].lineData[67] = 0;
  _$jscoverage['/loader/utils.js'].lineData[73] = 0;
  _$jscoverage['/loader/utils.js'].lineData[83] = 0;
  _$jscoverage['/loader/utils.js'].lineData[85] = 0;
  _$jscoverage['/loader/utils.js'].lineData[86] = 0;
  _$jscoverage['/loader/utils.js'].lineData[89] = 0;
  _$jscoverage['/loader/utils.js'].lineData[90] = 0;
  _$jscoverage['/loader/utils.js'].lineData[92] = 0;
  _$jscoverage['/loader/utils.js'].lineData[95] = 0;
  _$jscoverage['/loader/utils.js'].lineData[98] = 0;
  _$jscoverage['/loader/utils.js'].lineData[99] = 0;
  _$jscoverage['/loader/utils.js'].lineData[101] = 0;
  _$jscoverage['/loader/utils.js'].lineData[110] = 0;
  _$jscoverage['/loader/utils.js'].lineData[111] = 0;
  _$jscoverage['/loader/utils.js'].lineData[123] = 0;
  _$jscoverage['/loader/utils.js'].lineData[125] = 0;
  _$jscoverage['/loader/utils.js'].lineData[128] = 0;
  _$jscoverage['/loader/utils.js'].lineData[129] = 0;
  _$jscoverage['/loader/utils.js'].lineData[133] = 0;
  _$jscoverage['/loader/utils.js'].lineData[138] = 0;
  _$jscoverage['/loader/utils.js'].lineData[148] = 0;
  _$jscoverage['/loader/utils.js'].lineData[158] = 0;
  _$jscoverage['/loader/utils.js'].lineData[164] = 0;
  _$jscoverage['/loader/utils.js'].lineData[165] = 0;
  _$jscoverage['/loader/utils.js'].lineData[166] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[168] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[172] = 0;
  _$jscoverage['/loader/utils.js'].lineData[173] = 0;
  _$jscoverage['/loader/utils.js'].lineData[175] = 0;
  _$jscoverage['/loader/utils.js'].lineData[180] = 0;
  _$jscoverage['/loader/utils.js'].lineData[184] = 0;
  _$jscoverage['/loader/utils.js'].lineData[185] = 0;
  _$jscoverage['/loader/utils.js'].lineData[189] = 0;
  _$jscoverage['/loader/utils.js'].lineData[190] = 0;
  _$jscoverage['/loader/utils.js'].lineData[191] = 0;
  _$jscoverage['/loader/utils.js'].lineData[193] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[200] = 0;
  _$jscoverage['/loader/utils.js'].lineData[201] = 0;
  _$jscoverage['/loader/utils.js'].lineData[203] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[207] = 0;
  _$jscoverage['/loader/utils.js'].lineData[208] = 0;
  _$jscoverage['/loader/utils.js'].lineData[210] = 0;
  _$jscoverage['/loader/utils.js'].lineData[211] = 0;
  _$jscoverage['/loader/utils.js'].lineData[213] = 0;
  _$jscoverage['/loader/utils.js'].lineData[214] = 0;
  _$jscoverage['/loader/utils.js'].lineData[215] = 0;
  _$jscoverage['/loader/utils.js'].lineData[216] = 0;
  _$jscoverage['/loader/utils.js'].lineData[217] = 0;
  _$jscoverage['/loader/utils.js'].lineData[219] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[224] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[236] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[244] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[249] = 0;
  _$jscoverage['/loader/utils.js'].lineData[258] = 0;
  _$jscoverage['/loader/utils.js'].lineData[259] = 0;
  _$jscoverage['/loader/utils.js'].lineData[261] = 0;
  _$jscoverage['/loader/utils.js'].lineData[276] = 0;
  _$jscoverage['/loader/utils.js'].lineData[287] = 0;
  _$jscoverage['/loader/utils.js'].lineData[294] = 0;
  _$jscoverage['/loader/utils.js'].lineData[295] = 0;
  _$jscoverage['/loader/utils.js'].lineData[296] = 0;
  _$jscoverage['/loader/utils.js'].lineData[297] = 0;
  _$jscoverage['/loader/utils.js'].lineData[298] = 0;
  _$jscoverage['/loader/utils.js'].lineData[299] = 0;
  _$jscoverage['/loader/utils.js'].lineData[300] = 0;
  _$jscoverage['/loader/utils.js'].lineData[301] = 0;
  _$jscoverage['/loader/utils.js'].lineData[304] = 0;
  _$jscoverage['/loader/utils.js'].lineData[308] = 0;
  _$jscoverage['/loader/utils.js'].lineData[319] = 0;
  _$jscoverage['/loader/utils.js'].lineData[320] = 0;
  _$jscoverage['/loader/utils.js'].lineData[322] = 0;
  _$jscoverage['/loader/utils.js'].lineData[325] = 0;
  _$jscoverage['/loader/utils.js'].lineData[326] = 0;
  _$jscoverage['/loader/utils.js'].lineData[331] = 0;
  _$jscoverage['/loader/utils.js'].lineData[332] = 0;
  _$jscoverage['/loader/utils.js'].lineData[334] = 0;
  _$jscoverage['/loader/utils.js'].lineData[346] = 0;
  _$jscoverage['/loader/utils.js'].lineData[348] = 0;
  _$jscoverage['/loader/utils.js'].lineData[351] = 0;
  _$jscoverage['/loader/utils.js'].lineData[352] = 0;
  _$jscoverage['/loader/utils.js'].lineData[353] = 0;
  _$jscoverage['/loader/utils.js'].lineData[357] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[363] = 0;
  _$jscoverage['/loader/utils.js'].lineData[369] = 0;
  _$jscoverage['/loader/utils.js'].lineData[380] = 0;
  _$jscoverage['/loader/utils.js'].lineData[386] = 0;
  _$jscoverage['/loader/utils.js'].lineData[387] = 0;
  _$jscoverage['/loader/utils.js'].lineData[388] = 0;
  _$jscoverage['/loader/utils.js'].lineData[389] = 0;
  _$jscoverage['/loader/utils.js'].lineData[392] = 0;
  _$jscoverage['/loader/utils.js'].lineData[396] = 0;
  _$jscoverage['/loader/utils.js'].lineData[397] = 0;
  _$jscoverage['/loader/utils.js'].lineData[400] = 0;
  _$jscoverage['/loader/utils.js'].lineData[401] = 0;
  _$jscoverage['/loader/utils.js'].lineData[402] = 0;
  _$jscoverage['/loader/utils.js'].lineData[403] = 0;
  _$jscoverage['/loader/utils.js'].lineData[404] = 0;
  _$jscoverage['/loader/utils.js'].lineData[407] = 0;
}
if (! _$jscoverage['/loader/utils.js'].functionData) {
  _$jscoverage['/loader/utils.js'].functionData = [];
  _$jscoverage['/loader/utils.js'].functionData[0] = 0;
  _$jscoverage['/loader/utils.js'].functionData[1] = 0;
  _$jscoverage['/loader/utils.js'].functionData[2] = 0;
  _$jscoverage['/loader/utils.js'].functionData[3] = 0;
  _$jscoverage['/loader/utils.js'].functionData[4] = 0;
  _$jscoverage['/loader/utils.js'].functionData[5] = 0;
  _$jscoverage['/loader/utils.js'].functionData[6] = 0;
  _$jscoverage['/loader/utils.js'].functionData[7] = 0;
  _$jscoverage['/loader/utils.js'].functionData[8] = 0;
  _$jscoverage['/loader/utils.js'].functionData[9] = 0;
  _$jscoverage['/loader/utils.js'].functionData[10] = 0;
  _$jscoverage['/loader/utils.js'].functionData[11] = 0;
  _$jscoverage['/loader/utils.js'].functionData[12] = 0;
  _$jscoverage['/loader/utils.js'].functionData[13] = 0;
  _$jscoverage['/loader/utils.js'].functionData[14] = 0;
  _$jscoverage['/loader/utils.js'].functionData[15] = 0;
  _$jscoverage['/loader/utils.js'].functionData[16] = 0;
  _$jscoverage['/loader/utils.js'].functionData[17] = 0;
  _$jscoverage['/loader/utils.js'].functionData[18] = 0;
  _$jscoverage['/loader/utils.js'].functionData[19] = 0;
  _$jscoverage['/loader/utils.js'].functionData[20] = 0;
  _$jscoverage['/loader/utils.js'].functionData[21] = 0;
  _$jscoverage['/loader/utils.js'].functionData[22] = 0;
  _$jscoverage['/loader/utils.js'].functionData[23] = 0;
}
if (! _$jscoverage['/loader/utils.js'].branchData) {
  _$jscoverage['/loader/utils.js'].branchData = {};
  _$jscoverage['/loader/utils.js'].branchData['28'] = [];
  _$jscoverage['/loader/utils.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['34'] = [];
  _$jscoverage['/loader/utils.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['43'] = [];
  _$jscoverage['/loader/utils.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['51'] = [];
  _$jscoverage['/loader/utils.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['57'] = [];
  _$jscoverage['/loader/utils.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['73'] = [];
  _$jscoverage['/loader/utils.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['85'] = [];
  _$jscoverage['/loader/utils.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['89'] = [];
  _$jscoverage['/loader/utils.js'].branchData['89'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['90'] = [];
  _$jscoverage['/loader/utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['98'] = [];
  _$jscoverage['/loader/utils.js'].branchData['98'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['128'] = [];
  _$jscoverage['/loader/utils.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['166'] = [];
  _$jscoverage['/loader/utils.js'].branchData['166'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['166'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['170'] = [];
  _$jscoverage['/loader/utils.js'].branchData['170'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['170'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['170'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['172'] = [];
  _$jscoverage['/loader/utils.js'].branchData['172'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['184'] = [];
  _$jscoverage['/loader/utils.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['189'] = [];
  _$jscoverage['/loader/utils.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['190'] = [];
  _$jscoverage['/loader/utils.js'].branchData['190'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['200'] = [];
  _$jscoverage['/loader/utils.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['204'] = [];
  _$jscoverage['/loader/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['207'] = [];
  _$jscoverage['/loader/utils.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['210'] = [];
  _$jscoverage['/loader/utils.js'].branchData['210'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['213'] = [];
  _$jscoverage['/loader/utils.js'].branchData['213'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['214'] = [];
  _$jscoverage['/loader/utils.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['221'] = [];
  _$jscoverage['/loader/utils.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['235'] = [];
  _$jscoverage['/loader/utils.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['241'] = [];
  _$jscoverage['/loader/utils.js'].branchData['241'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['258'] = [];
  _$jscoverage['/loader/utils.js'].branchData['258'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['296'] = [];
  _$jscoverage['/loader/utils.js'].branchData['296'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['297'] = [];
  _$jscoverage['/loader/utils.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['299'] = [];
  _$jscoverage['/loader/utils.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['300'] = [];
  _$jscoverage['/loader/utils.js'].branchData['300'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['320'] = [];
  _$jscoverage['/loader/utils.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['322'] = [];
  _$jscoverage['/loader/utils.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['325'] = [];
  _$jscoverage['/loader/utils.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['331'] = [];
  _$jscoverage['/loader/utils.js'].branchData['331'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['351'] = [];
  _$jscoverage['/loader/utils.js'].branchData['351'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['380'] = [];
  _$jscoverage['/loader/utils.js'].branchData['380'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['381'] = [];
  _$jscoverage['/loader/utils.js'].branchData['381'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['386'] = [];
  _$jscoverage['/loader/utils.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['388'] = [];
  _$jscoverage['/loader/utils.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['401'] = [];
  _$jscoverage['/loader/utils.js'].branchData['401'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['403'] = [];
  _$jscoverage['/loader/utils.js'].branchData['403'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['403'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['403'][2].init(64, 21, 'mod.status !== status');
function visit489_403_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['403'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['403'][1].init(56, 29, '!mod || mod.status !== status');
function visit488_403_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['403'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['401'][1].init(137, 19, 'i < modNames.length');
function visit487_401_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['401'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['388'][1].init(62, 23, 'm = path.match(rule[0])');
function visit486_388_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['386'][1].init(205, 22, 'i < mappedRules.length');
function visit485_386_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['381'][1].init(29, 53, 'runtime.Config.mappedRules || []');
function visit484_381_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['381'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['380'][1].init(32, 83, 'rules || runtime.Config.mappedRules || []');
function visit483_380_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['380'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['351'][1].init(140, 13, 'mod && mod.fn');
function visit482_351_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['351'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['331'][1].init(522, 10, 'refModName');
function visit481_331_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['331'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['325'][1].init(143, 11, 'modNames[i]');
function visit480_325_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['322'][1].init(84, 5, 'i < l');
function visit479_322_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['320'][1].init(51, 8, 'modNames');
function visit478_320_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['300'][1].init(34, 9, '!alias[j]');
function visit477_300_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['300'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['299'][1].init(86, 6, 'j >= 0');
function visit476_299_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['297'][1].init(27, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit475_297_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['296'][1].init(68, 6, 'i >= 0');
function visit474_296_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['296'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['258'][1].init(18, 27, 'typeof modNames == \'string\'');
function visit473_258_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['258'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['241'][1].init(133, 24, 'typeof fn === \'function\'');
function visit472_241_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['241'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['235'][1].init(18, 20, 'mod.status != LOADED');
function visit471_235_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['221'][1].init(769, 98, 'Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList)');
function visit470_221_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['214'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit469_214_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['213'][1].init(465, 9, '\'@DEBUG@\'');
function visit468_213_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['213'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['210'][1].init(386, 16, 'status != LOADED');
function visit467_210_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['210'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['207'][1].init(299, 15, 'status == ERROR');
function visit466_207_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['204'][1].init(218, 18, 'status == ATTACHED');
function visit465_204_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['200'][1].init(121, 2, '!m');
function visit464_200_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['190'][1].init(22, 71, 'Utils.attachModRecursively(modNames[i], runtime, stack, errorList) && s');
function visit463_190_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['190'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['189'][1].init(186, 5, 'i < l');
function visit462_189_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['184'][1].init(22, 11, 'stack || []');
function visit461_184_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['172'][1].init(295, 5, 'allOk');
function visit460_172_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['172'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['170'][3].init(88, 20, 'm.status == ATTACHED');
function visit459_170_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['170'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['170'][2].init(83, 25, 'm && m.status == ATTACHED');
function visit458_170_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['170'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['170'][1].init(78, 30, 'a && m && m.status == ATTACHED');
function visit457_170_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['170'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['166'][2].init(75, 22, 'mod.getType() != \'css\'');
function visit456_166_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['166'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['166'][1].init(67, 30, '!mod || mod.getType() != \'css\'');
function visit455_166_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['166'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['128'][1].init(147, 3, 'mod');
function visit454_128_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['98'][1].init(476, 5, 'i < l');
function visit453_98_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['98'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['90'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit452_90_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['89'][1].init(126, 26, 'typeof depName == \'string\'');
function visit451_89_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['89'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['85'][1].init(47, 8, '!depName');
function visit450_85_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['73'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit449_73_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['57'][1].init(26, 12, 'Plugin.alias');
function visit448_57_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['51'][1].init(54, 11, 'index != -1');
function visit447_51_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['43'][1].init(40, 29, 's.charAt(s.length - 1) == \'/\'');
function visit446_43_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['34'][1].init(103, 5, 'i < l');
function visit445_34_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['28'][1].init(14, 20, 'typeof s == \'string\'');
function visit444_28_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, host = S.Env.host, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, LOADED = data.LOADED, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[27]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[28]++;
    if (visit444_28_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[29]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[31]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[34]++;
      for (; visit445_34_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[35]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[37]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[41]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[43]++;
    if (visit446_43_1(s.charAt(s.length - 1) == '/')) {
      _$jscoverage['/loader/utils.js'].lineData[44]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[46]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[49]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[50]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[51]++;
    if (visit447_51_1(index != -1)) {
      _$jscoverage['/loader/utils.js'].lineData[52]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[53]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[54]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[57]++;
  if (visit448_57_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[59]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[64]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[67]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[73]++;
  return visit449_73_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[83]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[85]++;
  if (visit450_85_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[86]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[89]++;
  if (visit451_89_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[90]++;
    if (visit452_90_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[92]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[95]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[98]++;
  for (l = depName.length; visit453_98_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[99]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[101]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[110]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[111]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[123]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[125]++;
  var mods = runtime.Env.mods, mod = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[128]++;
  if (visit454_128_1(mod)) {
    _$jscoverage['/loader/utils.js'].lineData[129]++;
    return mod;
  }
  _$jscoverage['/loader/utils.js'].lineData[133]++;
  mods[modName] = mod = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[138]++;
  return mod;
}, 
  'isAttached': function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[148]++;
  return isStatus(runtime, modNames, ATTACHED);
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[158]++;
  var mods = [runtime], mod, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[164]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[165]++;
  mod = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[166]++;
  if (visit455_166_1(!mod || visit456_166_2(mod.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[167]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[168]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[169]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[170]++;
  return visit457_170_1(a && visit458_170_2(m && visit459_170_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[172]++;
    if (visit460_172_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[173]++;
      mods.push(runtimeMods[unalias[0]].value);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[175]++;
      mods.push(null);
    }
  }
});
  _$jscoverage['/loader/utils.js'].lineData[180]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime, stack, errorList) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[184]++;
  stack = visit461_184_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[185]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[189]++;
  for (i = 0; visit462_189_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[190]++;
    s = visit463_190_1(Utils.attachModRecursively(modNames[i], runtime, stack, errorList) && s);
    _$jscoverage['/loader/utils.js'].lineData[191]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[193]++;
  return s;
}, 
  attachModRecursively: function(modName, runtime, stack, errorList) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[197]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[200]++;
  if (visit464_200_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[201]++;
    return 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[203]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[204]++;
  if (visit465_204_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[205]++;
    return 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[207]++;
  if (visit466_207_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[208]++;
    errorList.push(m);
  }
  _$jscoverage['/loader/utils.js'].lineData[210]++;
  if (visit467_210_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[211]++;
    return 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[213]++;
  if (visit468_213_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[214]++;
    if (visit469_214_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[215]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[216]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[217]++;
      return 0;
    }
    _$jscoverage['/loader/utils.js'].lineData[219]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[221]++;
  if (visit470_221_1(Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList))) {
    _$jscoverage['/loader/utils.js'].lineData[223]++;
    Utils.attachMod(runtime, m);
    _$jscoverage['/loader/utils.js'].lineData[224]++;
    return 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[226]++;
  return 0;
}, 
  attachMod: function(runtime, mod) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[235]++;
  if (visit471_235_1(mod.status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[236]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[239]++;
  var fn = mod.fn;
  _$jscoverage['/loader/utils.js'].lineData[241]++;
  if (visit472_241_1(typeof fn === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[244]++;
    mod.value = fn.apply(mod, Utils.getModules(runtime, mod.getRequiresWithAlias()));
  } else {
    _$jscoverage['/loader/utils.js'].lineData[246]++;
    mod.value = fn;
  }
  _$jscoverage['/loader/utils.js'].lineData[249]++;
  mod.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[258]++;
  if (visit473_258_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[259]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[261]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[276]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[287]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[294]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[295]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[296]++;
    for (i = ret.length - 1; visit474_296_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[297]++;
      if (visit475_297_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[298]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[299]++;
        for (j = alias.length - 1; visit476_299_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[300]++;
          if (visit477_300_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[301]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[304]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[308]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[319]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[320]++;
  if (visit478_320_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[322]++;
    for (i = 0 , l = modNames.length; visit479_322_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[325]++;
      if (visit480_325_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[326]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[331]++;
  if (visit481_331_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[332]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[334]++;
  return ret;
}, 
  registerModule: function(runtime, name, fn, config) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[346]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[348]++;
  var mods = runtime.Env.mods, mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[351]++;
  if (visit482_351_1(mod && mod.fn)) {
    _$jscoverage['/loader/utils.js'].lineData[352]++;
    S.log(name + ' is defined more than once', 'error');
    _$jscoverage['/loader/utils.js'].lineData[353]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[357]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[359]++;
  mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[363]++;
  S.mix(mod, {
  name: name, 
  status: LOADED, 
  fn: fn});
  _$jscoverage['/loader/utils.js'].lineData[369]++;
  S.mix(mod, config);
}, 
  getMappedPath: function(runtime, path, rules) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[380]++;
  var mappedRules = visit483_380_1(rules || visit484_381_1(runtime.Config.mappedRules || [])), i, m, rule;
  _$jscoverage['/loader/utils.js'].lineData[386]++;
  for (i = 0; visit485_386_1(i < mappedRules.length); i++) {
    _$jscoverage['/loader/utils.js'].lineData[387]++;
    rule = mappedRules[i];
    _$jscoverage['/loader/utils.js'].lineData[388]++;
    if (visit486_388_1(m = path.match(rule[0]))) {
      _$jscoverage['/loader/utils.js'].lineData[389]++;
      return path.replace(rule[0], rule[1]);
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[392]++;
  return path;
}});
  _$jscoverage['/loader/utils.js'].lineData[396]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[23]++;
    _$jscoverage['/loader/utils.js'].lineData[397]++;
    var mods = runtime.Env.mods, mod, i;
    _$jscoverage['/loader/utils.js'].lineData[400]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[401]++;
    for (i = 0; visit487_401_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[402]++;
      mod = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[403]++;
      if (visit488_403_1(!mod || visit489_403_2(mod.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[404]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[407]++;
    return 1;
  }
})(KISSY);
