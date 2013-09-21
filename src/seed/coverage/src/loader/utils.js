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
  _$jscoverage['/loader/utils.js'].lineData[195] = 0;
  _$jscoverage['/loader/utils.js'].lineData[197] = 0;
  _$jscoverage['/loader/utils.js'].lineData[198] = 0;
  _$jscoverage['/loader/utils.js'].lineData[202] = 0;
  _$jscoverage['/loader/utils.js'].lineData[203] = 0;
  _$jscoverage['/loader/utils.js'].lineData[204] = 0;
  _$jscoverage['/loader/utils.js'].lineData[206] = 0;
  _$jscoverage['/loader/utils.js'].lineData[219] = 0;
  _$jscoverage['/loader/utils.js'].lineData[222] = 0;
  _$jscoverage['/loader/utils.js'].lineData[223] = 0;
  _$jscoverage['/loader/utils.js'].lineData[225] = 0;
  _$jscoverage['/loader/utils.js'].lineData[226] = 0;
  _$jscoverage['/loader/utils.js'].lineData[228] = 0;
  _$jscoverage['/loader/utils.js'].lineData[229] = 0;
  _$jscoverage['/loader/utils.js'].lineData[230] = 0;
  _$jscoverage['/loader/utils.js'].lineData[232] = 0;
  _$jscoverage['/loader/utils.js'].lineData[233] = 0;
  _$jscoverage['/loader/utils.js'].lineData[235] = 0;
  _$jscoverage['/loader/utils.js'].lineData[236] = 0;
  _$jscoverage['/loader/utils.js'].lineData[238] = 0;
  _$jscoverage['/loader/utils.js'].lineData[239] = 0;
  _$jscoverage['/loader/utils.js'].lineData[240] = 0;
  _$jscoverage['/loader/utils.js'].lineData[241] = 0;
  _$jscoverage['/loader/utils.js'].lineData[242] = 0;
  _$jscoverage['/loader/utils.js'].lineData[244] = 0;
  _$jscoverage['/loader/utils.js'].lineData[246] = 0;
  _$jscoverage['/loader/utils.js'].lineData[248] = 0;
  _$jscoverage['/loader/utils.js'].lineData[249] = 0;
  _$jscoverage['/loader/utils.js'].lineData[251] = 0;
  _$jscoverage['/loader/utils.js'].lineData[260] = 0;
  _$jscoverage['/loader/utils.js'].lineData[261] = 0;
  _$jscoverage['/loader/utils.js'].lineData[264] = 0;
  _$jscoverage['/loader/utils.js'].lineData[266] = 0;
  _$jscoverage['/loader/utils.js'].lineData[269] = 0;
  _$jscoverage['/loader/utils.js'].lineData[271] = 0;
  _$jscoverage['/loader/utils.js'].lineData[274] = 0;
  _$jscoverage['/loader/utils.js'].lineData[283] = 0;
  _$jscoverage['/loader/utils.js'].lineData[284] = 0;
  _$jscoverage['/loader/utils.js'].lineData[286] = 0;
  _$jscoverage['/loader/utils.js'].lineData[301] = 0;
  _$jscoverage['/loader/utils.js'].lineData[312] = 0;
  _$jscoverage['/loader/utils.js'].lineData[319] = 0;
  _$jscoverage['/loader/utils.js'].lineData[320] = 0;
  _$jscoverage['/loader/utils.js'].lineData[321] = 0;
  _$jscoverage['/loader/utils.js'].lineData[322] = 0;
  _$jscoverage['/loader/utils.js'].lineData[323] = 0;
  _$jscoverage['/loader/utils.js'].lineData[324] = 0;
  _$jscoverage['/loader/utils.js'].lineData[325] = 0;
  _$jscoverage['/loader/utils.js'].lineData[326] = 0;
  _$jscoverage['/loader/utils.js'].lineData[329] = 0;
  _$jscoverage['/loader/utils.js'].lineData[333] = 0;
  _$jscoverage['/loader/utils.js'].lineData[344] = 0;
  _$jscoverage['/loader/utils.js'].lineData[345] = 0;
  _$jscoverage['/loader/utils.js'].lineData[347] = 0;
  _$jscoverage['/loader/utils.js'].lineData[350] = 0;
  _$jscoverage['/loader/utils.js'].lineData[351] = 0;
  _$jscoverage['/loader/utils.js'].lineData[356] = 0;
  _$jscoverage['/loader/utils.js'].lineData[357] = 0;
  _$jscoverage['/loader/utils.js'].lineData[359] = 0;
  _$jscoverage['/loader/utils.js'].lineData[370] = 0;
  _$jscoverage['/loader/utils.js'].lineData[372] = 0;
  _$jscoverage['/loader/utils.js'].lineData[375] = 0;
  _$jscoverage['/loader/utils.js'].lineData[376] = 0;
  _$jscoverage['/loader/utils.js'].lineData[377] = 0;
  _$jscoverage['/loader/utils.js'].lineData[381] = 0;
  _$jscoverage['/loader/utils.js'].lineData[383] = 0;
  _$jscoverage['/loader/utils.js'].lineData[387] = 0;
  _$jscoverage['/loader/utils.js'].lineData[393] = 0;
  _$jscoverage['/loader/utils.js'].lineData[404] = 0;
  _$jscoverage['/loader/utils.js'].lineData[410] = 0;
  _$jscoverage['/loader/utils.js'].lineData[411] = 0;
  _$jscoverage['/loader/utils.js'].lineData[412] = 0;
  _$jscoverage['/loader/utils.js'].lineData[413] = 0;
  _$jscoverage['/loader/utils.js'].lineData[416] = 0;
  _$jscoverage['/loader/utils.js'].lineData[420] = 0;
  _$jscoverage['/loader/utils.js'].lineData[421] = 0;
  _$jscoverage['/loader/utils.js'].lineData[424] = 0;
  _$jscoverage['/loader/utils.js'].lineData[425] = 0;
  _$jscoverage['/loader/utils.js'].lineData[426] = 0;
  _$jscoverage['/loader/utils.js'].lineData[427] = 0;
  _$jscoverage['/loader/utils.js'].lineData[428] = 0;
  _$jscoverage['/loader/utils.js'].lineData[431] = 0;
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
  _$jscoverage['/loader/utils.js'].branchData['195'] = [];
  _$jscoverage['/loader/utils.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['197'] = [];
  _$jscoverage['/loader/utils.js'].branchData['197'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['202'] = [];
  _$jscoverage['/loader/utils.js'].branchData['202'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['203'] = [];
  _$jscoverage['/loader/utils.js'].branchData['203'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['222'] = [];
  _$jscoverage['/loader/utils.js'].branchData['222'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['225'] = [];
  _$jscoverage['/loader/utils.js'].branchData['225'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['229'] = [];
  _$jscoverage['/loader/utils.js'].branchData['229'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['232'] = [];
  _$jscoverage['/loader/utils.js'].branchData['232'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['235'] = [];
  _$jscoverage['/loader/utils.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['238'] = [];
  _$jscoverage['/loader/utils.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['239'] = [];
  _$jscoverage['/loader/utils.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['246'] = [];
  _$jscoverage['/loader/utils.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['260'] = [];
  _$jscoverage['/loader/utils.js'].branchData['260'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['266'] = [];
  _$jscoverage['/loader/utils.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['283'] = [];
  _$jscoverage['/loader/utils.js'].branchData['283'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['321'] = [];
  _$jscoverage['/loader/utils.js'].branchData['321'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['322'] = [];
  _$jscoverage['/loader/utils.js'].branchData['322'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['324'] = [];
  _$jscoverage['/loader/utils.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['325'] = [];
  _$jscoverage['/loader/utils.js'].branchData['325'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['345'] = [];
  _$jscoverage['/loader/utils.js'].branchData['345'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['347'] = [];
  _$jscoverage['/loader/utils.js'].branchData['347'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['350'] = [];
  _$jscoverage['/loader/utils.js'].branchData['350'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['356'] = [];
  _$jscoverage['/loader/utils.js'].branchData['356'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['375'] = [];
  _$jscoverage['/loader/utils.js'].branchData['375'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['404'] = [];
  _$jscoverage['/loader/utils.js'].branchData['404'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['405'] = [];
  _$jscoverage['/loader/utils.js'].branchData['405'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['410'] = [];
  _$jscoverage['/loader/utils.js'].branchData['410'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['412'] = [];
  _$jscoverage['/loader/utils.js'].branchData['412'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['425'] = [];
  _$jscoverage['/loader/utils.js'].branchData['425'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['427'] = [];
  _$jscoverage['/loader/utils.js'].branchData['427'][1] = new BranchData();
  _$jscoverage['/loader/utils.js'].branchData['427'][2] = new BranchData();
}
_$jscoverage['/loader/utils.js'].branchData['427'][2].init(64, 21, 'mod.status !== status');
function visit491_427_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['427'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['427'][1].init(56, 29, '!mod || mod.status !== status');
function visit490_427_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['427'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['425'][1].init(137, 19, 'i < modNames.length');
function visit489_425_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['425'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['412'][1].init(62, 23, 'm = path.match(rule[0])');
function visit488_412_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['412'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['410'][1].init(205, 22, 'i < mappedRules.length');
function visit487_410_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['410'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['405'][1].init(29, 53, 'runtime.Config.mappedRules || []');
function visit486_405_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['405'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['404'][1].init(32, 83, 'rules || runtime.Config.mappedRules || []');
function visit485_404_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['404'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['375'][1].init(138, 13, 'mod && mod.fn');
function visit484_375_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['375'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['356'][1].init(522, 10, 'refModName');
function visit483_356_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['356'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['350'][1].init(143, 11, 'modNames[i]');
function visit482_350_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['350'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['347'][1].init(84, 5, 'i < l');
function visit481_347_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['347'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['345'][1].init(51, 8, 'modNames');
function visit480_345_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['345'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['325'][1].init(34, 9, '!alias[j]');
function visit479_325_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['325'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['324'][1].init(86, 6, 'j >= 0');
function visit478_324_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['322'][1].init(27, 38, '(m = mods[ret[i]]) && (alias = m.alias)');
function visit477_322_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['322'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['321'][1].init(68, 6, 'i >= 0');
function visit476_321_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['321'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['283'][1].init(18, 27, 'typeof modNames == \'string\'');
function visit475_283_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['283'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['266'][1].init(133, 24, 'typeof fn === \'function\'');
function visit474_266_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['260'][1].init(18, 20, 'mod.status != LOADED');
function visit473_260_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['260'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['246'][1].init(929, 105, 'Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache)');
function visit472_246_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['239'][1].init(22, 25, 'S.inArray(modName, stack)');
function visit471_239_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['238'][1].init(608, 9, '\'@DEBUG@\'');
function visit470_238_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['235'][1].init(512, 16, 'status != LOADED');
function visit469_235_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['232'][1].init(425, 15, 'status == ERROR');
function visit468_232_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['232'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['229'][1].init(327, 18, 'status == ATTACHED');
function visit467_229_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['229'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['225'][1].init(213, 2, '!m');
function visit466_225_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['225'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['222'][1].init(121, 16, 'modName in cache');
function visit465_222_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['222'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['203'][1].init(22, 78, 's && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache)');
function visit464_203_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['203'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['202'][1].init(340, 5, 'i < l');
function visit463_202_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['202'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['197'][1].init(176, 11, 'cache || {}');
function visit462_197_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['197'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['195'][1].init(77, 11, 'stack || []');
function visit461_195_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['173'][1].init(295, 5, 'allOk');
function visit460_173_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['173'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][3].init(88, 20, 'm.status == ATTACHED');
function visit459_171_3(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][2].init(83, 25, 'm && m.status == ATTACHED');
function visit458_171_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['171'][1].init(78, 30, 'a && m && m.status == ATTACHED');
function visit457_171_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['171'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][2].init(75, 22, 'mod.getType() != \'css\'');
function visit456_167_2(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['167'][1].init(67, 30, '!mod || mod.getType() != \'css\'');
function visit455_167_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['167'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['129'][1].init(147, 3, 'mod');
function visit454_129_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['99'][1].init(476, 5, 'i < l');
function visit453_99_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['99'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['91'][1].init(22, 55, 'startsWith(depName, \'../\') || startsWith(depName, \'./\')');
function visit452_91_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['90'][1].init(126, 26, 'typeof depName == \'string\'');
function visit451_90_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['90'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['86'][1].init(47, 8, '!depName');
function visit450_86_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['86'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['74'][1].init(21, 58, 'doc.getElementsByTagName(\'head\')[0] || doc.documentElement');
function visit449_74_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['58'][1].init(26, 12, 'Plugin.alias');
function visit448_58_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['52'][1].init(54, 11, 'index != -1');
function visit447_52_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['44'][1].init(40, 29, 's.charAt(s.length - 1) == \'/\'');
function visit446_44_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['35'][1].init(103, 5, 'i < l');
function visit445_35_1(result) {
  _$jscoverage['/loader/utils.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/utils.js'].branchData['29'][1].init(14, 20, 'typeof s == \'string\'');
function visit444_29_1(result) {
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
    if (visit444_29_1(typeof s == 'string')) {
      _$jscoverage['/loader/utils.js'].lineData[30]++;
      return indexMapStr(s);
    } else {
      _$jscoverage['/loader/utils.js'].lineData[32]++;
      var ret = [], i = 0, l = s.length;
      _$jscoverage['/loader/utils.js'].lineData[35]++;
      for (; visit445_35_1(i < l); i++) {
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
    if (visit446_44_1(s.charAt(s.length - 1) == '/')) {
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
    if (visit447_52_1(index != -1)) {
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
  if (visit448_58_1(Plugin.alias)) {
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
  return visit449_74_1(doc.getElementsByTagName('head')[0] || doc.documentElement);
}, 
  normalDepModuleName: function(moduleName, depName) {
  _$jscoverage['/loader/utils.js'].functionData[6]++;
  _$jscoverage['/loader/utils.js'].lineData[84]++;
  var i = 0, l;
  _$jscoverage['/loader/utils.js'].lineData[86]++;
  if (visit450_86_1(!depName)) {
    _$jscoverage['/loader/utils.js'].lineData[87]++;
    return depName;
  }
  _$jscoverage['/loader/utils.js'].lineData[90]++;
  if (visit451_90_1(typeof depName == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[91]++;
    if (visit452_91_1(startsWith(depName, '../') || startsWith(depName, './'))) {
      _$jscoverage['/loader/utils.js'].lineData[93]++;
      return Path.resolve(Path.dirname(moduleName), depName);
    }
    _$jscoverage['/loader/utils.js'].lineData[96]++;
    return Path.normalize(depName);
  }
  _$jscoverage['/loader/utils.js'].lineData[99]++;
  for (l = depName.length; visit453_99_1(i < l); i++) {
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
  if (visit454_129_1(mod)) {
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
  if (visit455_167_1(!mod || visit456_167_2(mod.getType() != 'css'))) {
    _$jscoverage['/loader/utils.js'].lineData[168]++;
    unalias = Utils.unalias(runtime, modName);
    _$jscoverage['/loader/utils.js'].lineData[169]++;
    allOk = S.reduce(unalias, function(a, n) {
  _$jscoverage['/loader/utils.js'].functionData[13]++;
  _$jscoverage['/loader/utils.js'].lineData[170]++;
  m = runtimeMods[n];
  _$jscoverage['/loader/utils.js'].lineData[171]++;
  return visit457_171_1(a && visit458_171_2(m && visit459_171_3(m.status == ATTACHED)));
}, true);
    _$jscoverage['/loader/utils.js'].lineData[173]++;
    if (visit460_173_1(allOk)) {
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
  _$jscoverage['/loader/utils.js'].lineData[195]++;
  stack = visit461_195_1(stack || []);
  _$jscoverage['/loader/utils.js'].lineData[197]++;
  cache = visit462_197_1(cache || {});
  _$jscoverage['/loader/utils.js'].lineData[198]++;
  var i, s = 1, l = modNames.length, stackDepth = stack.length;
  _$jscoverage['/loader/utils.js'].lineData[202]++;
  for (i = 0; visit463_202_1(i < l); i++) {
    _$jscoverage['/loader/utils.js'].lineData[203]++;
    s = visit464_203_1(s && Utils.attachModRecursively(modNames[i], runtime, stack, errorList, cache));
    _$jscoverage['/loader/utils.js'].lineData[204]++;
    stack.length = stackDepth;
  }
  _$jscoverage['/loader/utils.js'].lineData[206]++;
  return s;
}, 
  attachModRecursively: function(modName, runtime, stack, errorList, cache) {
  _$jscoverage['/loader/utils.js'].functionData[15]++;
  _$jscoverage['/loader/utils.js'].lineData[219]++;
  var mods = runtime.Env.mods, status, m = mods[modName];
  _$jscoverage['/loader/utils.js'].lineData[222]++;
  if (visit465_222_1(modName in cache)) {
    _$jscoverage['/loader/utils.js'].lineData[223]++;
    return cache[modName];
  }
  _$jscoverage['/loader/utils.js'].lineData[225]++;
  if (visit466_225_1(!m)) {
    _$jscoverage['/loader/utils.js'].lineData[226]++;
    return cache[modName] = 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[228]++;
  status = m.status;
  _$jscoverage['/loader/utils.js'].lineData[229]++;
  if (visit467_229_1(status == ATTACHED)) {
    _$jscoverage['/loader/utils.js'].lineData[230]++;
    return cache[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[232]++;
  if (visit468_232_1(status == ERROR)) {
    _$jscoverage['/loader/utils.js'].lineData[233]++;
    errorList.push(m);
  }
  _$jscoverage['/loader/utils.js'].lineData[235]++;
  if (visit469_235_1(status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[236]++;
    return cache[modName] = 0;
  }
  _$jscoverage['/loader/utils.js'].lineData[238]++;
  if (visit470_238_1('@DEBUG@')) {
    _$jscoverage['/loader/utils.js'].lineData[239]++;
    if (visit471_239_1(S.inArray(modName, stack))) {
      _$jscoverage['/loader/utils.js'].lineData[240]++;
      stack.push(modName);
      _$jscoverage['/loader/utils.js'].lineData[241]++;
      S.error('find cyclic dependency between mods: ' + stack);
      _$jscoverage['/loader/utils.js'].lineData[242]++;
      return cache[modName] = 0;
    }
    _$jscoverage['/loader/utils.js'].lineData[244]++;
    stack.push(modName);
  }
  _$jscoverage['/loader/utils.js'].lineData[246]++;
  if (visit472_246_1(Utils.attachModsRecursively(m.getNormalizedRequires(), runtime, stack, errorList, cache))) {
    _$jscoverage['/loader/utils.js'].lineData[248]++;
    Utils.attachMod(runtime, m);
    _$jscoverage['/loader/utils.js'].lineData[249]++;
    return cache[modName] = 1;
  }
  _$jscoverage['/loader/utils.js'].lineData[251]++;
  return cache[modName] = 0;
}, 
  attachMod: function(runtime, mod) {
  _$jscoverage['/loader/utils.js'].functionData[16]++;
  _$jscoverage['/loader/utils.js'].lineData[260]++;
  if (visit473_260_1(mod.status != LOADED)) {
    _$jscoverage['/loader/utils.js'].lineData[261]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[264]++;
  var fn = mod.fn;
  _$jscoverage['/loader/utils.js'].lineData[266]++;
  if (visit474_266_1(typeof fn === 'function')) {
    _$jscoverage['/loader/utils.js'].lineData[269]++;
    mod.value = fn.apply(mod, Utils.getModules(runtime, mod.getRequiresWithAlias()));
  } else {
    _$jscoverage['/loader/utils.js'].lineData[271]++;
    mod.value = fn;
  }
  _$jscoverage['/loader/utils.js'].lineData[274]++;
  mod.status = ATTACHED;
}, 
  getModNamesAsArray: function(modNames) {
  _$jscoverage['/loader/utils.js'].functionData[17]++;
  _$jscoverage['/loader/utils.js'].lineData[283]++;
  if (visit475_283_1(typeof modNames == 'string')) {
    _$jscoverage['/loader/utils.js'].lineData[284]++;
    modNames = modNames.replace(/\s+/g, '').split(',');
  }
  _$jscoverage['/loader/utils.js'].lineData[286]++;
  return modNames;
}, 
  normalizeModNames: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[18]++;
  _$jscoverage['/loader/utils.js'].lineData[301]++;
  return Utils.unalias(runtime, Utils.normalizeModNamesWithAlias(runtime, modNames, refModName));
}, 
  unalias: function(runtime, names) {
  _$jscoverage['/loader/utils.js'].functionData[19]++;
  _$jscoverage['/loader/utils.js'].lineData[312]++;
  var ret = [].concat(names), i, m, alias, ok = 0, j, mods = runtime['Env'].mods;
  _$jscoverage['/loader/utils.js'].lineData[319]++;
  while (!ok) {
    _$jscoverage['/loader/utils.js'].lineData[320]++;
    ok = 1;
    _$jscoverage['/loader/utils.js'].lineData[321]++;
    for (i = ret.length - 1; visit476_321_1(i >= 0); i--) {
      _$jscoverage['/loader/utils.js'].lineData[322]++;
      if (visit477_322_1((m = mods[ret[i]]) && (alias = m.alias))) {
        _$jscoverage['/loader/utils.js'].lineData[323]++;
        ok = 0;
        _$jscoverage['/loader/utils.js'].lineData[324]++;
        for (j = alias.length - 1; visit478_324_1(j >= 0); j--) {
          _$jscoverage['/loader/utils.js'].lineData[325]++;
          if (visit479_325_1(!alias[j])) {
            _$jscoverage['/loader/utils.js'].lineData[326]++;
            alias.splice(j, 1);
          }
        }
        _$jscoverage['/loader/utils.js'].lineData[329]++;
        ret.splice.apply(ret, [i, 1].concat(indexMap(alias)));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[333]++;
  return ret;
}, 
  normalizeModNamesWithAlias: function(runtime, modNames, refModName) {
  _$jscoverage['/loader/utils.js'].functionData[20]++;
  _$jscoverage['/loader/utils.js'].lineData[344]++;
  var ret = [], i, l;
  _$jscoverage['/loader/utils.js'].lineData[345]++;
  if (visit480_345_1(modNames)) {
    _$jscoverage['/loader/utils.js'].lineData[347]++;
    for (i = 0 , l = modNames.length; visit481_347_1(i < l); i++) {
      _$jscoverage['/loader/utils.js'].lineData[350]++;
      if (visit482_350_1(modNames[i])) {
        _$jscoverage['/loader/utils.js'].lineData[351]++;
        ret.push(pluginAlias(runtime, indexMap(modNames[i])));
      }
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[356]++;
  if (visit483_356_1(refModName)) {
    _$jscoverage['/loader/utils.js'].lineData[357]++;
    ret = Utils.normalDepModuleName(refModName, ret);
  }
  _$jscoverage['/loader/utils.js'].lineData[359]++;
  return ret;
}, 
  registerModule: function(runtime, name, fn, config) {
  _$jscoverage['/loader/utils.js'].functionData[21]++;
  _$jscoverage['/loader/utils.js'].lineData[370]++;
  name = indexMapStr(name);
  _$jscoverage['/loader/utils.js'].lineData[372]++;
  var mods = runtime.Env.mods, mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[375]++;
  if (visit484_375_1(mod && mod.fn)) {
    _$jscoverage['/loader/utils.js'].lineData[376]++;
    logger.error(name + ' is defined more than once');
    _$jscoverage['/loader/utils.js'].lineData[377]++;
    return;
  }
  _$jscoverage['/loader/utils.js'].lineData[381]++;
  Utils.createModuleInfo(runtime, name);
  _$jscoverage['/loader/utils.js'].lineData[383]++;
  mod = mods[name];
  _$jscoverage['/loader/utils.js'].lineData[387]++;
  S.mix(mod, {
  name: name, 
  status: LOADED, 
  fn: fn});
  _$jscoverage['/loader/utils.js'].lineData[393]++;
  S.mix(mod, config);
}, 
  getMappedPath: function(runtime, path, rules) {
  _$jscoverage['/loader/utils.js'].functionData[22]++;
  _$jscoverage['/loader/utils.js'].lineData[404]++;
  var mappedRules = visit485_404_1(rules || visit486_405_1(runtime.Config.mappedRules || [])), i, m, rule;
  _$jscoverage['/loader/utils.js'].lineData[410]++;
  for (i = 0; visit487_410_1(i < mappedRules.length); i++) {
    _$jscoverage['/loader/utils.js'].lineData[411]++;
    rule = mappedRules[i];
    _$jscoverage['/loader/utils.js'].lineData[412]++;
    if (visit488_412_1(m = path.match(rule[0]))) {
      _$jscoverage['/loader/utils.js'].lineData[413]++;
      return path.replace(rule[0], rule[1]);
    }
  }
  _$jscoverage['/loader/utils.js'].lineData[416]++;
  return path;
}});
  _$jscoverage['/loader/utils.js'].lineData[420]++;
  function isStatus(runtime, modNames, status) {
    _$jscoverage['/loader/utils.js'].functionData[23]++;
    _$jscoverage['/loader/utils.js'].lineData[421]++;
    var mods = runtime.Env.mods, mod, i;
    _$jscoverage['/loader/utils.js'].lineData[424]++;
    modNames = S.makeArray(modNames);
    _$jscoverage['/loader/utils.js'].lineData[425]++;
    for (i = 0; visit489_425_1(i < modNames.length); i++) {
      _$jscoverage['/loader/utils.js'].lineData[426]++;
      mod = mods[modNames[i]];
      _$jscoverage['/loader/utils.js'].lineData[427]++;
      if (visit490_427_1(!mod || visit491_427_2(mod.status !== status))) {
        _$jscoverage['/loader/utils.js'].lineData[428]++;
        return 0;
      }
    }
    _$jscoverage['/loader/utils.js'].lineData[431]++;
    return 1;
  }
})(KISSY);
