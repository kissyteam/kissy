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
if (! _$jscoverage['/dd/draggable.js']) {
  _$jscoverage['/dd/draggable.js'] = {};
  _$jscoverage['/dd/draggable.js'].lineData = [];
  _$jscoverage['/dd/draggable.js'].lineData[6] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[7] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[12] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[13] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[21] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[22] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[23] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[24] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[29] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[30] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[33] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[34] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[41] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[42] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[50] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[52] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[53] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[54] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[218] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[220] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[224] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[227] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[228] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[229] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[231] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[236] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[240] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[242] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[247] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[252] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[254] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[259] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[264] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[266] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[267] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[269] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[273] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[276] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[278] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[279] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[280] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[281] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[283] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[285] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[289] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[290] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[291] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[293] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[297] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[299] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[301] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[302] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[303] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[317] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[318] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[325] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[326] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[329] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[330] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[335] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[338] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[339] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[342] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[346] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[347] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[356] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[360] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[365] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[366] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[369] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[374] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[384] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[386] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[387] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[388] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[390] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[391] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[392] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[396] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[399] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[402] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[403] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[406] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[410] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[411] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[414] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[416] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[425] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[426] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[431] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[433] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[436] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[439] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[441] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[443] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[444] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[449] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[454] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[456] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[468] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[469] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[472] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[479] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[480] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[482] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[486] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[495] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[518] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[519] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[521] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[564] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[565] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[566] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[568] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[569] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[570] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[573] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[574] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[576] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[577] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[579] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[581] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[582] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[743] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[745] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[746] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[749] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[750] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[755] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[756] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[757] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[760] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[761] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[771] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[772] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[778] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[779] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[782] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[783] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[784] = 0;
  _$jscoverage['/dd/draggable.js'].lineData[787] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].functionData) {
  _$jscoverage['/dd/draggable.js'].functionData = [];
  _$jscoverage['/dd/draggable.js'].functionData[0] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[1] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[2] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[3] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[4] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[5] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[6] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[7] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[8] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[9] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[10] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[11] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[12] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[13] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[14] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[15] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[16] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[17] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[18] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[19] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[20] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[21] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[22] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[23] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[24] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[25] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[26] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[27] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[28] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[29] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[30] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[31] = 0;
  _$jscoverage['/dd/draggable.js'].functionData[32] = 0;
}
if (! _$jscoverage['/dd/draggable.js'].branchData) {
  _$jscoverage['/dd/draggable.js'].branchData = {};
  _$jscoverage['/dd/draggable.js'].branchData['23'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['227'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['228'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['228'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['242'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['254'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['266'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['278'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['278'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['290'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['290'][2] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['301'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['301'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['317'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['325'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['329'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['329'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['338'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['338'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['365'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['365'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['386'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['386'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['402'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['402'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['410'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['414'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['414'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['425'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['431'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['431'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['518'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['518'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['565'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['565'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['569'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['569'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['573'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['573'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['576'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['749'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['749'][1] = new BranchData();
  _$jscoverage['/dd/draggable.js'].branchData['760'] = [];
  _$jscoverage['/dd/draggable.js'].branchData['760'][1] = new BranchData();
}
_$jscoverage['/dd/draggable.js'].branchData['760'][1].init(310, 19, 'doc.body.setCapture');
function visit82_760_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['760'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['749'][1].init(263, 23, 'doc.body.releaseCapture');
function visit81_749_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['749'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['576'][1].init(346, 10, 'v.nodeType');
function visit80_576_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['573'][1].init(207, 21, 'typeof v === \'string\'');
function visit79_573_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['573'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['569'][1].init(30, 23, 'typeof v === \'function\'');
function visit78_569_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['569'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['565'][1].init(64, 10, '!vs.length');
function visit77_565_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['565'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['518'][1].init(26, 20, '!(v instanceof Node)');
function visit76_518_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['518'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['431'][1].init(18, 7, 'e || {}');
function visit75_431_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['431'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['425'][1].init(18, 17, 'this._isValidDrag');
function visit74_425_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['414'][1].init(1582, 11, 'def && move');
function visit73_414_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['414'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['410'][1].init(1475, 32, 'self.get(\'preventDefaultOnMove\')');
function visit72_410_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['402'][1].init(1273, 40, 'self.fire(\'drag\', customEvent) === false');
function visit71_402_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['402'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['386'][1].init(704, 4, 'move');
function visit70_386_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['386'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['365'][1].init(155, 25, 'e.gestureType === \'touch\'');
function visit69_365_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['365'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['338'][1].init(87, 25, 'e.gestureType === \'touch\'');
function visit68_338_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['338'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['329'][1].init(1103, 15, 'self._allowMove');
function visit67_329_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['329'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['325'][1].init(1003, 25, 'e.gestureType === \'mouse\'');
function visit66_325_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['317'][1].init(705, 16, 'self.get(\'halt\')');
function visit65_317_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['301'][1].init(88, 2, 'ie');
function visit64_301_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['301'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['290'][2].init(81, 13, 'e.which !== 1');
function visit63_290_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['290'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['290'][1].init(48, 46, 'self.get(\'primaryButtonOnly\') && e.which !== 1');
function visit62_290_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['278'][2].init(53, 16, 'handler[0] === t');
function visit61_278_2(result) {
  _$jscoverage['/dd/draggable.js'].branchData['278'][2].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['278'][1].init(53, 39, 'handler[0] === t || handler.contains(t)');
function visit60_278_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['266'][1].init(94, 4, 'node');
function visit59_266_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['254'][1].init(97, 4, 'node');
function visit58_254_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['242'][1].init(97, 4, 'node');
function visit57_242_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['228'][1].init(22, 22, '!self._checkHandler(t)');
function visit56_228_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['228'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['227'][1].init(81, 28, 'self._checkDragStartValid(e)');
function visit55_227_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].branchData['23'][1].init(18, 17, 'this._isValidDrag');
function visit54_23_1(result) {
  _$jscoverage['/dd/draggable.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/dd/draggable.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/dd/draggable.js'].functionData[0]++;
  _$jscoverage['/dd/draggable.js'].lineData[7]++;
  var Node = require('node'), BasicGesture = require('event/gesture/basic'), DDM = require('./ddm'), Base = require('base'), DragGesture = require('event/gesture/drag');
  _$jscoverage['/dd/draggable.js'].lineData[12]++;
  var util = require('util');
  _$jscoverage['/dd/draggable.js'].lineData[13]++;
  var UA = require('ua'), $ = Node.all, $doc = $(document), each = util.each, ie = UA.ie, PREFIX_CLS = DDM.PREFIX_CLS, doc = S.Env.host.document;
  _$jscoverage['/dd/draggable.js'].lineData[21]++;
  function checkValid(fn) {
    _$jscoverage['/dd/draggable.js'].functionData[1]++;
    _$jscoverage['/dd/draggable.js'].lineData[22]++;
    return function() {
  _$jscoverage['/dd/draggable.js'].functionData[2]++;
  _$jscoverage['/dd/draggable.js'].lineData[23]++;
  if (visit54_23_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[24]++;
    fn.apply(this, arguments);
  }
};
  }
  _$jscoverage['/dd/draggable.js'].lineData[29]++;
  var onDragStart = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[3]++;
  _$jscoverage['/dd/draggable.js'].lineData[30]++;
  this._start(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[33]++;
  var onDrag = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[4]++;
  _$jscoverage['/dd/draggable.js'].lineData[34]++;
  this._move(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[41]++;
  var onDragEnd = checkValid(function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[5]++;
  _$jscoverage['/dd/draggable.js'].lineData[42]++;
  this._end(e);
});
  _$jscoverage['/dd/draggable.js'].lineData[50]++;
  var Draggable = Base.extend({
  initializer: function() {
  _$jscoverage['/dd/draggable.js'].functionData[6]++;
  _$jscoverage['/dd/draggable.js'].lineData[52]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[53]++;
  self.addTarget(DDM);
  _$jscoverage['/dd/draggable.js'].lineData[54]++;
  self._allowMove = self.get('move');
}, 
  _onSetNode: function(n) {
  _$jscoverage['/dd/draggable.js'].functionData[7]++;
  _$jscoverage['/dd/draggable.js'].lineData[218]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[220]++;
  self.setInternal('dragNode', n);
}, 
  onGestureStart: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[8]++;
  _$jscoverage['/dd/draggable.js'].lineData[224]++;
  var self = this, t = e.target;
  _$jscoverage['/dd/draggable.js'].lineData[227]++;
  if (visit55_227_1(self._checkDragStartValid(e))) {
    _$jscoverage['/dd/draggable.js'].lineData[228]++;
    if (visit56_228_1(!self._checkHandler(t))) {
      _$jscoverage['/dd/draggable.js'].lineData[229]++;
      return;
    }
    _$jscoverage['/dd/draggable.js'].lineData[231]++;
    self._prepare(e);
  }
}, 
  getEventTargetEl: function() {
  _$jscoverage['/dd/draggable.js'].functionData[9]++;
  _$jscoverage['/dd/draggable.js'].lineData[236]++;
  return this.get('node');
}, 
  start: function() {
  _$jscoverage['/dd/draggable.js'].functionData[10]++;
  _$jscoverage['/dd/draggable.js'].lineData[240]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[242]++;
  if (visit57_242_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[247]++;
    node.on(DragGesture.DRAG_START, onDragStart, self).on(DragGesture.DRAG, onDrag, self).on(DragGesture.DRAG_END, onDragEnd, self).on(BasicGesture.START, onGestureStart, self).on('dragstart', preventDefault);
  }
}, 
  stop: function() {
  _$jscoverage['/dd/draggable.js'].functionData[11]++;
  _$jscoverage['/dd/draggable.js'].lineData[252]++;
  var self = this, node = self.getEventTargetEl();
  _$jscoverage['/dd/draggable.js'].lineData[254]++;
  if (visit58_254_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[259]++;
    node.detach(DragGesture.DRAG_START, onDragStart, self).detach(DragGesture.DRAG, onDrag, self).detach(DragGesture.DRAG_END, onDragEnd, self).detach(BasicGesture.START, onGestureStart, self).detach('dragstart', preventDefault);
  }
}, 
  _onSetDisabled: function(d) {
  _$jscoverage['/dd/draggable.js'].functionData[12]++;
  _$jscoverage['/dd/draggable.js'].lineData[264]++;
  var self = this, node = self.get('dragNode');
  _$jscoverage['/dd/draggable.js'].lineData[266]++;
  if (visit59_266_1(node)) {
    _$jscoverage['/dd/draggable.js'].lineData[267]++;
    node[d ? 'addClass' : 'removeClass'](PREFIX_CLS + '-disabled');
  }
  _$jscoverage['/dd/draggable.js'].lineData[269]++;
  self[d ? 'stop' : 'start']();
}, 
  _checkHandler: function(t) {
  _$jscoverage['/dd/draggable.js'].functionData[13]++;
  _$jscoverage['/dd/draggable.js'].lineData[273]++;
  var self = this, handlers = self.get('handlers'), ret = 0;
  _$jscoverage['/dd/draggable.js'].lineData[276]++;
  each(handlers, function(handler) {
  _$jscoverage['/dd/draggable.js'].functionData[14]++;
  _$jscoverage['/dd/draggable.js'].lineData[278]++;
  if (visit60_278_1(visit61_278_2(handler[0] === t) || handler.contains(t))) {
    _$jscoverage['/dd/draggable.js'].lineData[279]++;
    ret = 1;
    _$jscoverage['/dd/draggable.js'].lineData[280]++;
    self.setInternal('activeHandler', handler);
    _$jscoverage['/dd/draggable.js'].lineData[281]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[283]++;
  return undefined;
});
  _$jscoverage['/dd/draggable.js'].lineData[285]++;
  return ret;
}, 
  _checkDragStartValid: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[15]++;
  _$jscoverage['/dd/draggable.js'].lineData[289]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[290]++;
  if (visit62_290_1(self.get('primaryButtonOnly') && visit63_290_2(e.which !== 1))) {
    _$jscoverage['/dd/draggable.js'].lineData[291]++;
    return 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[293]++;
  return 1;
}, 
  _prepare: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[16]++;
  _$jscoverage['/dd/draggable.js'].lineData[297]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[299]++;
  self._isValidDrag = 1;
  _$jscoverage['/dd/draggable.js'].lineData[301]++;
  if (visit64_301_1(ie)) {
    _$jscoverage['/dd/draggable.js'].lineData[302]++;
    fixIEMouseDown();
    _$jscoverage['/dd/draggable.js'].lineData[303]++;
    $doc.on(BasicGesture.END, {
  fn: fixIEMouseUp, 
  once: true});
  }
  _$jscoverage['/dd/draggable.js'].lineData[317]++;
  if (visit65_317_1(self.get('halt'))) {
    _$jscoverage['/dd/draggable.js'].lineData[318]++;
    e.stopPropagation();
  }
  _$jscoverage['/dd/draggable.js'].lineData[325]++;
  if (visit66_325_1(e.gestureType === 'mouse')) {
    _$jscoverage['/dd/draggable.js'].lineData[326]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[329]++;
  if (visit67_329_1(self._allowMove)) {
    _$jscoverage['/dd/draggable.js'].lineData[330]++;
    self.setInternal('startNodePos', self.get('node').offset());
  }
}, 
  _start: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[17]++;
  _$jscoverage['/dd/draggable.js'].lineData[335]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[338]++;
  if (visit68_338_1(e.gestureType === 'touch')) {
    _$jscoverage['/dd/draggable.js'].lineData[339]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[342]++;
  self.mousePos = {
  left: e.pageX, 
  top: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[346]++;
  DDM.start(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[347]++;
  self.fire('dragstart', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
  _$jscoverage['/dd/draggable.js'].lineData[356]++;
  self.get('dragNode').addClass(PREFIX_CLS + 'dragging');
}, 
  _move: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[18]++;
  _$jscoverage['/dd/draggable.js'].lineData[360]++;
  var self = this, pageX = e.pageX, pageY = e.pageY;
  _$jscoverage['/dd/draggable.js'].lineData[365]++;
  if (visit69_365_1(e.gestureType === 'touch')) {
    _$jscoverage['/dd/draggable.js'].lineData[366]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[369]++;
  self.mousePos = {
  left: pageX, 
  top: pageY};
  _$jscoverage['/dd/draggable.js'].lineData[374]++;
  var customEvent = {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY};
  _$jscoverage['/dd/draggable.js'].lineData[384]++;
  var move = self._allowMove;
  _$jscoverage['/dd/draggable.js'].lineData[386]++;
  if (visit70_386_1(move)) {
    _$jscoverage['/dd/draggable.js'].lineData[387]++;
    var startNodePos = self.get('startNodePos');
    _$jscoverage['/dd/draggable.js'].lineData[388]++;
    var left = startNodePos.left + e.deltaX, top = startNodePos.top + e.deltaY;
    _$jscoverage['/dd/draggable.js'].lineData[390]++;
    customEvent.left = left;
    _$jscoverage['/dd/draggable.js'].lineData[391]++;
    customEvent.top = top;
    _$jscoverage['/dd/draggable.js'].lineData[392]++;
    self.setInternal('actualPos', {
  left: left, 
  top: top});
    _$jscoverage['/dd/draggable.js'].lineData[396]++;
    self.fire('dragalign', customEvent);
  }
  _$jscoverage['/dd/draggable.js'].lineData[399]++;
  var def = 1;
  _$jscoverage['/dd/draggable.js'].lineData[402]++;
  if (visit71_402_1(self.fire('drag', customEvent) === false)) {
    _$jscoverage['/dd/draggable.js'].lineData[403]++;
    def = 0;
  }
  _$jscoverage['/dd/draggable.js'].lineData[406]++;
  DDM.move(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[410]++;
  if (visit72_410_1(self.get('preventDefaultOnMove'))) {
    _$jscoverage['/dd/draggable.js'].lineData[411]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[414]++;
  if (visit73_414_1(def && move)) {
    _$jscoverage['/dd/draggable.js'].lineData[416]++;
    self.get('node').offset(self.get('actualPos'));
  }
}, 
  stopDrag: function() {
  _$jscoverage['/dd/draggable.js'].functionData[19]++;
  _$jscoverage['/dd/draggable.js'].lineData[425]++;
  if (visit74_425_1(this._isValidDrag)) {
    _$jscoverage['/dd/draggable.js'].lineData[426]++;
    this._end();
  }
}, 
  _end: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[20]++;
  _$jscoverage['/dd/draggable.js'].lineData[431]++;
  e = visit75_431_1(e || {});
  _$jscoverage['/dd/draggable.js'].lineData[433]++;
  var self = this, activeDrop;
  _$jscoverage['/dd/draggable.js'].lineData[436]++;
  self._isValidDrag = 0;
  _$jscoverage['/dd/draggable.js'].lineData[439]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[441]++;
  self.get('dragNode').removeClass(PREFIX_CLS + 'dragging');
  _$jscoverage['/dd/draggable.js'].lineData[443]++;
  if ((activeDrop = DDM.get('activeDrop'))) {
    _$jscoverage['/dd/draggable.js'].lineData[444]++;
    self.fire('dragdrophit', {
  drag: self, 
  drop: activeDrop});
  } else {
    _$jscoverage['/dd/draggable.js'].lineData[449]++;
    self.fire('dragdropmiss', {
  drag: self});
  }
  _$jscoverage['/dd/draggable.js'].lineData[454]++;
  DDM.end(e, self);
  _$jscoverage['/dd/draggable.js'].lineData[456]++;
  self.fire('dragend', {
  drag: self, 
  gestureType: e.gestureType, 
  startPos: e.startPos, 
  deltaX: e.deltaX, 
  deltaY: e.deltaY, 
  pageX: e.pageX, 
  pageY: e.pageY});
}, 
  _handleOut: function() {
  _$jscoverage['/dd/draggable.js'].functionData[21]++;
  _$jscoverage['/dd/draggable.js'].lineData[468]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[469]++;
  self.get('node').removeClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[472]++;
  self.fire('dragexit', {
  drag: self, 
  drop: DDM.get('activeDrop')});
}, 
  _handleEnter: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[22]++;
  _$jscoverage['/dd/draggable.js'].lineData[479]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[480]++;
  self.get('node').addClass(PREFIX_CLS + 'drag-over');
  _$jscoverage['/dd/draggable.js'].lineData[482]++;
  self.fire('dragenter', e);
}, 
  _handleOver: function(e) {
  _$jscoverage['/dd/draggable.js'].functionData[23]++;
  _$jscoverage['/dd/draggable.js'].lineData[486]++;
  this.fire('dragover', e);
}, 
  destructor: function() {
  _$jscoverage['/dd/draggable.js'].functionData[24]++;
  _$jscoverage['/dd/draggable.js'].lineData[495]++;
  this.stop();
}}, {
  name: 'Draggable', 
  ATTRS: {
  node: {
  setter: function(v) {
  _$jscoverage['/dd/draggable.js'].functionData[25]++;
  _$jscoverage['/dd/draggable.js'].lineData[518]++;
  if (visit76_518_1(!(v instanceof Node))) {
    _$jscoverage['/dd/draggable.js'].lineData[519]++;
    return $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[521]++;
  return undefined;
}}, 
  dragNode: {}, 
  shim: {
  value: false}, 
  handlers: {
  value: [], 
  getter: function(vs) {
  _$jscoverage['/dd/draggable.js'].functionData[26]++;
  _$jscoverage['/dd/draggable.js'].lineData[564]++;
  var self = this;
  _$jscoverage['/dd/draggable.js'].lineData[565]++;
  if (visit77_565_1(!vs.length)) {
    _$jscoverage['/dd/draggable.js'].lineData[566]++;
    vs[0] = self.get('node');
  }
  _$jscoverage['/dd/draggable.js'].lineData[568]++;
  each(vs, function(v, i) {
  _$jscoverage['/dd/draggable.js'].functionData[27]++;
  _$jscoverage['/dd/draggable.js'].lineData[569]++;
  if (visit78_569_1(typeof v === 'function')) {
    _$jscoverage['/dd/draggable.js'].lineData[570]++;
    v = v.call(self);
  }
  _$jscoverage['/dd/draggable.js'].lineData[573]++;
  if (visit79_573_1(typeof v === 'string')) {
    _$jscoverage['/dd/draggable.js'].lineData[574]++;
    v = self.get('node').one(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[576]++;
  if (visit80_576_1(v.nodeType)) {
    _$jscoverage['/dd/draggable.js'].lineData[577]++;
    v = $(v);
  }
  _$jscoverage['/dd/draggable.js'].lineData[579]++;
  vs[i] = v;
});
  _$jscoverage['/dd/draggable.js'].lineData[581]++;
  self.setInternal('handlers', vs);
  _$jscoverage['/dd/draggable.js'].lineData[582]++;
  return vs;
}}, 
  activeHandler: {}, 
  mode: {
  value: 'point'}, 
  disabled: {
  value: false}, 
  move: {
  value: false}, 
  primaryButtonOnly: {
  value: true}, 
  halt: {
  value: true}, 
  groups: {
  value: true}, 
  startNodePos: {}, 
  actualPos: {}, 
  preventDefaultOnMove: {
  value: true}}, 
  inheritedStatics: {
  DropMode: {
  POINT: 'point', 
  INTERSECT: 'intersect', 
  STRICT: 'strict'}}});
  _$jscoverage['/dd/draggable.js'].lineData[743]++;
  var _ieSelectBack;
  _$jscoverage['/dd/draggable.js'].lineData[745]++;
  function fixIEMouseUp() {
    _$jscoverage['/dd/draggable.js'].functionData[28]++;
    _$jscoverage['/dd/draggable.js'].lineData[746]++;
    doc.body.onselectstart = _ieSelectBack;
    _$jscoverage['/dd/draggable.js'].lineData[749]++;
    if (visit81_749_1(doc.body.releaseCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[750]++;
      doc.body.releaseCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[755]++;
  function fixIEMouseDown() {
    _$jscoverage['/dd/draggable.js'].functionData[29]++;
    _$jscoverage['/dd/draggable.js'].lineData[756]++;
    _ieSelectBack = doc.body.onselectstart;
    _$jscoverage['/dd/draggable.js'].lineData[757]++;
    doc.body.onselectstart = fixIESelect;
    _$jscoverage['/dd/draggable.js'].lineData[760]++;
    if (visit82_760_1(doc.body.setCapture)) {
      _$jscoverage['/dd/draggable.js'].lineData[761]++;
      doc.body.setCapture();
    }
  }
  _$jscoverage['/dd/draggable.js'].lineData[771]++;
  function preventDefault(e) {
    _$jscoverage['/dd/draggable.js'].functionData[30]++;
    _$jscoverage['/dd/draggable.js'].lineData[772]++;
    e.preventDefault();
  }
  _$jscoverage['/dd/draggable.js'].lineData[778]++;
  function fixIESelect() {
    _$jscoverage['/dd/draggable.js'].functionData[31]++;
    _$jscoverage['/dd/draggable.js'].lineData[779]++;
    return false;
  }
  _$jscoverage['/dd/draggable.js'].lineData[782]++;
  function onGestureStart(e) {
    _$jscoverage['/dd/draggable.js'].functionData[32]++;
    _$jscoverage['/dd/draggable.js'].lineData[783]++;
    this._isValidDrag = 0;
    _$jscoverage['/dd/draggable.js'].lineData[784]++;
    this.onGestureStart(e);
  }
  _$jscoverage['/dd/draggable.js'].lineData[787]++;
  return Draggable;
});
