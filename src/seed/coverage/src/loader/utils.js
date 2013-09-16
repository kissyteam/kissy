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
  _$jscoverage['/loader/utils.js'].lineData[28] = 0;
  _$jscoverage['/loader/utils.js'].lineData[29] = 0;
  _$jscoverage['/loader/utils.js'].lineData[30] = 0;
  _$jscoverage['/loader/utils.js'].lineData[32] = 0;
  _$jscoverage['/loader/utils.js'].lineData[35] = 0;
  _$jscoverage['/loader/utils.js'].lineData[36] = 0;
  _$jscoverage['/loader/utils.js'].lineData[38] = 0;
  _$jscoverage['/loader/utils.js'].lineData[42] = 0;
  _$jscoverage['/loader/utils.js'].lineData[44] = 0;
  _$jscoverage['/loader/utils.js'].lineData[45] = 0;
  _$jscoverage['/loader/utils.js'].lineData[47] = 0;
  _$jscoverage['/loader/utils.js'].lineData[50] = 0;
  _$jscoverage['/loader/utils.js'].lineData[51] = 0;
  _$jscoverage['/loader/utils.js'].lineData[52] = 0;
  _$jscoverage['/loader/utils.js'].lineData[53] = 0;
  _$jscoverage['/loader/utils.js'].lineData[54] = 0;
  _$jscoverage['/loader/utils.js'].lineData[55] = 0;
  _$jscoverage['/loader/utils.js'].lineData[58] = 0;
  _$jscoverage['/loader/utils.js'].lineData[60] = 0;
  _$jscoverage['/loader/utils.js'].lineData[65] = 0;
  _$jscoverage['/loader/utils.js'].lineData[68] = 0;
  _$jscoverage['/loader/utils.js'].lineData[74] = 0;
  _$jscoverage['/loader/utils.js'].lineData[84] = 0;
  _$jscoverage['/loader/utils.js'].lineData[86] = 0;
  _$jscoverage['/loader/utils.js'].lineData[87] = 0;
  _$jscoverage['/loader/utils.js'].lineData[90] = 0;
  _$jscoverage['/loader/utils.js'].lineData[91] = 0;
  _$jscoverage['/loader/utils.js'].lineData[93] = 0;
  _$jscoverage['/loader/utils.js'].lineData[96] = 0;
  _$jscoverage['/loader/utils.js'].lineData[99] = 0;
  _$jscoverage['/loader/utils.js'].lineData[100] = 0;
  _$jscoverage['/loader/utils.js'].lineData[102] = 0;
  _$jscoverage['/loader/utils.js'].lineData[111] = 0;
  _$jscoverage['/loader/utils.js'].lineData[112] = 0;
  _$jscoverage['/loader/utils.js'].lineData[124] = 0;
  _$jscoverage['/loader/utils.js'].lineData[126] = 0;
  _$jscoverage['/loader/utils.js'].lineData[129] = 0;
  _$jscoverage['/loader/utils.js'].lineData[130] = 0;
  _$jscoverage['/loader/utils.js'].lineData[134] = 0;
  _$jscoverage['/loader/utils.js'].lineData[139] = 0;
  _$jscoverage['/loader/utils.js'].lineData[149] = 0;
  _$jscoverage['/loader/utils.js'].lineData[159] = 0;
  _$jscoverage['/loader/utils.js'].lineData[165] = 0;
  _$jscoverage['/loader/utils.js'].lineData[166] = 0;
  _$jscoverage['/loader/utils.js'].lineData[167] = 0;
  _$jscoverage['/loader/utils.js'].lineData[168] = 0;
  _$jscoverage['/loader/utils.js'].lineData[169] = 0;
  _$jscoverage['/loader/utils.js'].lineData[170] = 0;
  _$jscoverage['/loader/utils.js'].lineData[171] = 0;
  _$jscoverage['/loader/utils.js'].lineData[173] = 0;
  _$jscoverage['/loader/utils.js'].lineData[174] = 0;
  _$jscoverage['/loader/utils.js'].lineData[176] = 0;
  _$jscoverage['/loader/utils.js'].lineData[181] = 0;
  _$jscoverage['/loader/utils.js'].lineData[186] = 0;
  _$jscoverage['/loader/utils.js'].lineData[188] = 0;
  _$jscoverage['/loader/utils.js'].lineData[189] = 0;
  _$jscoverage['/loader/utils.js'].lineData[193] = 0;
  _$jscoverage['/loader/utils.js'].lineData[194] = 0;
  _$jscoverage['/loader/utils.js'].lineData[195] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[201] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[205] = 0;
  _$jscoverage['/loader/utils.js'].lineData[207] = 0;
  _$jscoverage['/loader/utils.js'].lineData[208] = 0;
  _$jscoverage['/loader/utils.js'].lineData[210] = 0;
  _$jscoverage['/loader/utils.js'].lineData[211] = 0;
  _$jscoverage['/loader/utils.js'].lineData[212] = 0;
  _$jscoverage['/loader/utils.js'].lineData[214] = 0;
  _$jscoverage['/loader/utils.js'].lineData[215] = 0;
  _$jscoverage['/loader/utils.js'].lineData[217] = 0;
  _$jscoverage['/loader/utils.js'].lineData[218] = 0;
  _$jscoverage['/loader/utils.js'].lineData[220] = 0;
  _$jscoverage['/loader/utils.js'].lineData[221] = 0;
  _$jscoverage['/loader/utils.js'].lineData[222] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[224] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[228] = 0;
  _$jscoverage['/loader/utils.js'].lineData[230] = 0;
  _$jscoverage['/loader/utils.js'].lineData[231] = 0;
  _$jscoverage['/loader/utils.js'].lineData[233] = 0;
  _$jscoverage['/loader/utils.js'].lineData[242] = 0;
  _$jscoverage['/loader/utils.js'].lineData[243] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[248] = 0;
  _$jscoverage['/loader/utils.js'].lineData[251] = 0;
  _$jscoverage['/loader/utils.js'].lineData[253] = 0;
  _$jscoverage['/loader/utils.js'].lineData[256] = 0;
  _$jscoverage['/loader/utils.js'].lineData[265] = 0;
  _$jscoverage['/loader/utils.js'].lineData[266] = 0;
  _$jscoverage['/loader/utils.js'].lineData[268] = 0;
  _$jscoverage['/loader/utils.js'].lineData[283] = 0;
  _$jscoverage['/loader/utils.js'].lineData[294] = 0;
  _$jscoverage['/loader/utils.js'].lineData[301] = 0;
  _$jscoverage['/loader/utils.js'].lineData[302] = 0;
  _$jscoverage['/loader/utils.js'].lineData[303] = 0;
  _$jscoverage['/loader/utils.js'].lineData[304] = 0;
  _$jscoverage['/loader/utils.js'].lineData[305] = 0;
  _$jscoverage['/loader/utils.js'].lineData[306] = 0;
  _$jscoverage['/loader/utils.js'].lineData[307] = 0;
  _$jscoverage['/loader/utils.js'].lineData[308] = 0;
  _$jscoverage['/loader/utils.js'].lineData[311] = 0;
  _$jscoverage['/loader/utils.js'].lineData[315] = 0;
  _$jscoverage['/loader/utils.js'].lineData[326] = 0;
  _$jscoverage['/loader/utils.js'].lineData[327] = 0;
  _$jscoverage['/loader/utils.js'].lineData[329] = 0;
  _$jscoverage['/loader/utils.js'].lineData[332] = 0;
  _$jscoverage['/loader/utils.js'].lineData[333] = 0;
  _$jscoverage['/loader/utils.js'].lineData[338] = 0;
  _$jscoverage['/loader/utils.js'].lineData[339] = 0;
  _$jscoverage['/loader/utils.js'].lineData[341] = 0;
  _$jscoverage['/loader/utils.js'].lineData[353] = 0;
  _$jscoverage['/loader/utils.js'].lineData[355] = 0;
  _$jscoverage['/loader/utils.js'].lineData[358] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[360] = 0;
  _$jscoverage['/loader/utils.js'].lineData[364] = 0;
  _$jscoverage['/loader/utils.js'].lineData[366] = 0;
  _$jscoverage['/loader/utils.js'].lineData[370] = 0;
  _$jscoverage['/loader/utils.js'].lineData[376] = 0;
  _$jscoverage['/loader/utils.js'].lineData[387] = 0;
  _$jscoverage['/loader/utils.js'].lineData[393] = 0;
  _$jscoverage['/loader/utils.js'].lineData[394] = 0;
  _$jscoverage['/loader/utils.js'].lineData[395] = 0;
  _$jscoverage['/loader/utils.js'].lineData[396] = 0;
  _$jscoverage['/loader/utils.js'].lineData[399] = 0;
  _$jscoverage['/loader/utils.js'].lineData[403] = 0;
  _$jscoverage['/loader/utils.js'].lineData[404] = 0;
  _$jscoverage['/loader/utils.js'].lineData[407] = 0;
  _$jscoverage['/loader/utils.js'].lineData[408] = 0;
  _$jscoverage['/loader/utils.js'].lineData[409] = 0;
  _$jscoverage['/loader/utils.js'].lineData[410] = 0;
  _$jscoverage['/loader/utils.js'].lineData[411] = 0;
  _$jscoverage['/loader/utils.js'].lineData[414] = 0;
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
  _$jscoverage['/loader/utils.js'].branchData['29'] = [];
  _$jscoverage['/loader/utils.js'].branchData['29'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['35'] = [];
  _$jscoverage['/loader/utils.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['44'] = [];
  _$jscoverage['/loader/utils.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['52'] = [];
  _$jscoverage['/loader/utils.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['58'] = [];
  _$jscoverage['/loader/utils.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['74'] = [];
  _$jscoverage['/loader/utils.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['86'] = [];
  _$jscoverage['/loader/utils.js'].branchData['86'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['90'] = [];
  _$jscoverage['/loader/utils.js'].branchData['90'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['91'] = [];
  _$jscoverage['/loader/utils.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['99'] = [];
  _$jscoverage['/loader/utils.js'].branchData['99'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['129'] = [];
  _$jscoverage['/loader/utils.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'] = [];
  _$jscoverage['/loader/utils.js'].branchData['167'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['167'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['171'] = [];
  _$jscoverage['/loader/utils.js'].branchData['171'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['171'][2] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['171'][3] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['173'] = [];
  _$jscoverage['/loader/utils.js'].branchData['173'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['186'] = [];
  _$jscoverage['/loader/utils.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['188'] = [];
  _$jscoverage['/loader/utils.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['193'] = [];
  _$jscoverage['/loader/utils.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['194'] = [];
  _$jscoverage['/loader/utils.js'].branchData['194'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['204'] = [];
  _$jscoverage['/loader/utils.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['207'] = [];
  _$jscoverage['/loader/utils.js'].branchData['207'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['211'] = [];
  _$jscoverage['/loader/utils.js'].branchData['211'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['214'] = [];
  _$jscoverage['/loader/utils.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['217'] = [];
  _$jscoverage['/loader/utils.js'].branchData['217'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['220'] = [];
  _$jscoverage['/loader/utils.js'].branchData['220'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['221'] = [];
  _$jscoverage['/loader/utils.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['228'] = [];
  _$jscoverage['/loader/utils.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['242'] = [];
  _$jscoverage['/loader/utils.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['248'] = [];
  _$jscoverage['/loader/utils.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['265'] = [];
  _$jscoverage['/loader/utils.js'].branchData['265'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['303'] = [];
  _$jscoverage['/loader/utils.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['304'] = [];
  _$jscoverage['/loader/utils.js'].branchData['304'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['306'] = [];
  _$jscoverage['/loader/utils.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['307'] = [];
  _$jscoverage['/loader/utils.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['327'] = [];
  _$jscoverage['/loader/utils.js'].branchData['327'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['329'] = [];
  _$jscoverage['/loader/utils.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['332'] = [];
  _$jscoverage['/loader/utils.js'].branchData['332'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['338'] = [];
  _$jscoverage['/loader/utils.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['358'] = [];
  _$jscoverage['/loader/utils.js'].branchData['358'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['387'] = [];
  _$jscoverage['/loader/utils.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['388'] = [];
  _$jscoverage['/loader/utils.js'].branchData['388'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['393'] = [];
  _$jscoverage['/loader/utils.js'].branchData['393'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['395'] = [];
  _$jscoverage['/loader/utils.js'].branchData['395'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['408'] = [];
  _$jscoverage['/loader/utils.js'].branchData['408'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['410'] = [];
  _$jscoverage['/loader/utils.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['410'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['410'][2].init(64, 21, 'mod.status !== status');
function visit492_410_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['410'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['410'][1].init(56, 29, '!mod || mod.status !== status');
function visit491_410_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['408'][1].init(137, 19, 'i < modNames.length');
function visit490_408_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['408'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['395'][1].init(62, 23, 'm = path.match(rule[0])');
function visit489_395_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['395'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['393'][1].init(205, 22, 'i < mappedRules.length');
function visit488_393_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['393'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['388'][1].init(29, 53, 'runtime.Config.mappedRules || []');
function visit487_388_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['388'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['387'][1].init(32, 83, 'rules || runtime.Config.mappedRules || []');
function visit486_387_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['358'][1].init(140, 13, 'mod && mod.fn');
function visit485_358_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['358'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['338'][1].init(522, 10, 'refModName');
function visit484_338_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['332'][1].init(143, 11, 'modNames[i]');
function visit483_332_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['332'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['329'][1].init(84, 5, 'i < l');
function visit482_329_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['327'][1].init(51, 8, 'modNames');
function visit481_327_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['327'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['307'][1].init(34, 9, '!alias[j]');
function visit480_307_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['306'][1].init(86, 6, 'j >= 0');
function visit479_306_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['304'][1].init(27, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit478_304_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['304'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['303'][1].init(68, 6, 'i >= 0');
function visit477_303_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['265'][1].init(18, 27, 'typeof modNames == \'string\'');
function visit476_265_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['265'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['248'][1].init(133, 24, 'typeof fn === \'function\'');
function visit475_248_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['242'][1].init(18, 20, 'mod.status != LOADED');
function visit474_242_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['228'][1].init(929, 105, 'Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit473_228_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['221'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit472_221_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['220'][1].init(608, 9, '\'@DEBUG@\'');
function visit471_220_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['220'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['217'][1].init(512, 16, 'status != LOADED');
function visit470_217_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['217'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['214'][1].init(425, 15, 'status == ERROR');
function visit469_214_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['211'][1].init(327, 18, 'status == ATTACHED');
function visit468_211_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['211'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['207'][1].init(213, 2, '!m');
function visit467_207_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['207'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['204'][1].init(121, 16, 'modName in cache');
function visit466_204_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['194'][1].init(22, 78, 's && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit465_194_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['194'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['193'][1].init(340, 5, 'i < l');
function visit464_193_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['188'][1].init(176, 11, 'cache || {}');
function visit463_188_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['186'][1].init(77, 11, 'stack || []');
function visit462_186_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['173'][1].init(295, 5, 'allOk');
function visit461_173_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][3].init(88, 20, 'm.status == ATTACHED');
function visit460_171_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][2].init(83, 25, 'm && m.status == ATTACHED');
function visit459_171_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][1].init(78, 30, 'a && m && m.status == ATTACHED');
function visit458_171_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][2].init(75, 22, 'mod.getType() != \'css\'');
function visit457_167_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][1].init(67, 30, '!mod || mod.getType() != \'css\'');
function visit456_167_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['129'][1].init(147, 3, 'mod');
function visit455_129_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['99'][1].init(476, 5, 'i < l');
function visit454_99_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['91'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit453_91_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['90'][1].init(126, 26, 'typeof depName == \'string\'');
function visit452_90_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['86'][1].init(47, 8, '!depName');
function visit451_86_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['74'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit450_74_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['58'][1].init(26, 12, 'Plugin.alias');
function visit449_58_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['52'][1].init(54, 11, 'index != -1');
function visit448_52_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['44'][1].init(40, 29, 's.charAt(s.length - 1) == \'/\'');
function visit447_44_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['35'][1].init(103, 5, 'i < l');
function visit446_35_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['29'][1].init(14, 20, 'typeof s == \'string\'');
function visit445_29_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['29'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].lineData[6]++;
(function(S) {
  _$jscoverage['/loader/utils.js'].functionData[0]++;
  _$jscoverage['/loader/utils.js'].lineData[7]++;
  var Loader = S.Loader, Path = S.Path, logger = S.getLogger('s/loader'), host = S.Env.host, startsWith = S.startsWith, data = Loader.Status, ATTACHED = data.ATTACHED, LOADED = data.LOADED, ERROR = data.ERROR, Utils = Loader.Utils = {}, doc = host.document;
  _$jscoverage['/loader/utils.js'].lineData[28]++;
  function indexMap(s) {
    _$jscoverage['/loader/utils.js'].functionData[1]++;
    _$jscoverage['/loader/utils.js'].lineData[29]++;
    if (visit445_29_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[30]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[32]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[35]++;
      for (; visit446_35_1(i < l); i++) {
        _$jscoverage['/loader/utils.js'].lineData[36]++;
        ret[i] = indexMapStr(s[i]);
      }
      _$jscoverage['/loader/utils.js'].lineData[38]++;
      return ret;
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[42]++;
  function indexMapStr(s) {
    _$jscoverage['/loader/utils.js'].functionData[2]++;
    _$jscoverage['/loader/utils.js'].lineData[44]++;
    if (visit447_44_1(s.charAt(s.length - 1) == '/')) {
      _$jscoverage['/loader/utils.js'].lineData[45]++;
      s += 'index';
    }
    _$jscoverage['/loader/utils.js'].lineData[47]++;
    return s;
  }
  _$jscoverage['/loader/utils.js'].lineData[50]++;
  function pluginAlias(runtime, name) {
    _$jscoverage['/loader/utils.js'].functionData[3]++;
    _$jscoverage['/loader/utils.js'].lineData[51]++;
    var index = name.indexOf('!');
    _$jscoverage['/loader/utils.js'].lineData[52]++;
    if (visit448_52_1(index != -1)) {
      _$jscoverage['/loader/utils.js'].lineData[53]++;
      var pluginName = name.substring(0, index);
      _$jscoverage['/loader/utils.js'].lineData[54]++;
      name = name.substring(index + 1);
      _$jscoverage['/loader/utils.js'].lineData[55]++;
      S.use(pluginName, {
  sync: true, 
  success: function(S, Plugin) {
  _$jscoverage['/loader/utils.js'].functionData[4]++;
  _$jscoverage['/loader/utils.js'].lineData[58]++;
  if (visit449_58_1(Plugin.alias)) {
    _$jscoverage['/loader/utils.js'].lineData[60]++;
    name = Plugin.alias(runtime, name, pluginName);
  }
}});
    }
    _$jscoverage['/loader/utils.js'].lineData[65]++;
    return name;
  }
  _$jscoverage['/loader/utils.js'].lineData[68]++;
  S.mix(Utils, {
  docHead: function() {
  _$jscoverage['/loader/utils.js'].functionData[5]++;
  _$jscoverage['/loader/utils.js'].lineData[74]++;
  return visit450_74_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[84]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[86]++;
  if (visit451_86_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[87]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[90]++;
  if (visit452_90_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[91]++;
    if (visit453_91_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[93]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[96]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[99]++;
  for (l = depName.length; visit454_99_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[100]++;
    depName[i] = Utils.normalDepModuleName(moduleName, depName[i]);
  }
  _$jscoverage['/loader/utils.js'].lineData[102]++;
  return depName;
}, 
  createModulesInfo: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[7]++;
  _$jscoverage['/loader/utils.js'].lineData[111]++;
  S.each(modNames, function(m) {
  _$jscoverage['/loader/utils.js'].functionData[8]++;
  _$jscoverage['/loader/utils.js'].lineData[112]++;
  Utils.createModuleInfo(runtime, m);
});
}, 
  createModuleInfo: function(runtime, modName, cfg) {
  _$jscoverage['/loader/utils.js'].functionData[9]++;
  _$jscoverage['/loader/utils.js'].lineData[124]++;
  modName = indexMapStr(modName);
  _$jscoverage['/loader/utils.js'].lineData[126]++;
  var mods = runtime.Env.mods, mod = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[129]++;
  if (visit455_129_1(mod)) {
    _$jscoverage['/loader/utils.js'].lineData[130]++;
    return mod;
  }
  _$jscoverage['/loader/utils.js'].lineData[134]++;
  mods[modName] = mod = new Loader.Module(S.mix({
  name: modName, 
  runtime: runtime}, cfg));
  _$jscoverage['/loader/utils.js'].lineData[139]++;
  return mod;
}, 
  'isAttached': function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[10]++;
  _$jscoverage['/loader/utils.js'].lineData[149]++;
  return isStatus(runtime, modNames, ATTACHED);
}, 
  getModules: function(runtime, modNames) {
  _$jscoverage['/loader/utils.js'].functionData[11]++;
  _$jscoverage['/loader/utils.js'].lineData[159]++;
  var mods = [runtime], mod, unalias, allOk, m, runtimeMods = runtime.Env.mods;
  _$jscoverage['/loader/utils.js'].lineData[165]++;
  S.each(modNames, function(modName) {
  _$jscoverage['/loader/utils.js'].functionData[12]++;
  _$jscoverage['/loader/utils.js'].lineData[166]++;
  mod = runtimeMods[modName];
  _$jscoverage['/loader/utils.js'].lineData[167]++;
  if (visit456_167_1(!mod || visit457_167_2(mod.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[168]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[169]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[170]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[171]++;
  return visit458_171_1(a && visit459_171_2(m && visit460_171_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[173]++;
    if (visit461_173_1(allOk)) {
      _$jscoverage['/loader/utils.js'].lineData[174]++;
      mods.push(runtimeMods[unalias[0]].value);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[176]++;
      mods.push(null);
    }
  }
});
  _$jscoverage['/loader/utils.js'].lineData[181]++;
  return mods;
}, 
  attachModsRecursively: function(modNames, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[14]++;
  _$jscoverage['/loader/utils.js'].lineData[186]++;
  stack = visit462_186_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[188]++;
  cache = visit463_188_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[189]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[193]++;
  for (i = 0; visit464_193_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[194]++;
    s = visit465_194_1(s && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[195]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[197]++;
  return s;
}, 
  attachModRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[201]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[204]++;
  if (visit466_204_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[205]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[207]++;
  if (visit467_207_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[208]++;
    return cache[modName] = 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[210]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[211]++;
  if (visit468_211_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[212]++;
    return cache[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[214]++;
  if (visit469_214_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[215]++;
    errorList.push(m);
  }
  _$jscoverage['/loader/utils.js'].lineData[217]++;
  if (visit470_217_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[218]++;
    return cache[modName] = 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[220]++;
  if (visit471_220_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[221]++;
    if (visit472_221_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[222]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[223]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[224]++;
      return cache[modName] = 0;
    }
    _$jscoverage['/loader/utils.js'].lineData[226]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[228]++;
  if (visit473_228_1(Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[230]++;
    Utils.attachMod(runtime, m);
    _$jscoverage['/loader/utils.js'].lineData[231]++;
    return cache[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[233]++;
  return cache[modName] = 0;
}, 
  attachMod: function(runtime, mod) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[242]++;
  if (visit474_242_1(mod.status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[243]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[246]++;
  var fn = mod.fn;
  _$jscoverage['/loader/utils.js'].lineData[248]++;
  if (visit475_248_1(typeof fn === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[251]++;
    mod.value = fn.apply(mod, Utils.getModules(runtime, mod.getRequiresWithAlias()));
  } else {
    _$jscoverage['/loader/utils.js'].lineData[253]++;
    mod.value = fn;
  }
  _$jscoverage['/loader/utils.js'].lineData[256]++;
  mod.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[265]++;
  if (visit476_265_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[266]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[268]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[283]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[294]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[301]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[302]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[303]++;
    for (i = ret.length - 1; visit477_303_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[304]++;
      if (visit478_304_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[305]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[306]++;
        for (j = alias.length - 1; visit479_306_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[307]++;
          if (visit480_307_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[308]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[311]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[315]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[326]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[327]++;
  if (visit481_327_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[329]++;
    for (i = 0 , l = modNames.length; visit482_329_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[332]++;
      if (visit483_332_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[333]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[338]++;
  if (visit484_338_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[339]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[341]++;
  return ret;
}, 
  registerModule: function(runtime, name, fn, config) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[353]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[355]++;
  var mods = runtime.Env.mods, mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[358]++;
  if (visit485_358_1(mod && mod.fn)) {
    _$jscoverage['/loader/utils.js'].lineData[359]++;
    logger.error(name + ' is defined more than once');
    _$jscoverage['/loader/utils.js'].lineData[360]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[364]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[366]++;
  mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[370]++;
  S.mix(mod, {
  name: name, 
  status: LOADED, 
  fn: fn});
  _$jscoverage['/loader/utils.js'].lineData[376]++;
  S.mix(mod, config);
}, 
  getMappedPath: function(runtime, path, rules) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[387]++;
  var mappedRules = visit486_387_1(rules || visit487_388_1(runtime.Config.mappedRules || [])), i, m, rule;
  _$jscoverage['/loader/utils.js'].lineData[393]++;
  for (i = 0; visit488_393_1(i < mappedRules.length); i++) {
    _$jscoverage['/loader/utils.js'].lineData[394]++;
    rule = mappedRules[i];
    _$jscoverage['/loader/utils.js'].lineData[395]++;
    if (visit489_395_1(m = path.match(rule[0]))) {
      _$jscoverage['/loader/utils.js'].lineData[396]++;
      return path.replace(rule[0], rule[1]);
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[399]++;
  return path;
}});
  _$jscoverage['/loader/utils.js'].lineData[403]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[23]++;
    _$jscoverage['/loader/utils.js'].lineData[404]++;
    var mods = runtime.Env.mods, mod, i;
    _$jscoverage['/loader/utils.js'].lineData[407]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[408]++;
    for (i = 0; visit490_408_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[409]++;
      mod = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[410]++;
      if (visit491_410_1(!mod || visit492_410_2(mod.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[411]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[414]++;
    return 1;
  }
})(KISSY);
