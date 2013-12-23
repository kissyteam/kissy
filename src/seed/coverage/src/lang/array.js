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
  _$jscoverage['/lang/array.js'].lineData[8] = 0;
  _$jscoverage['/lang/array.js'].lineData[18] = 0;
  _$jscoverage['/lang/array.js'].lineData[28] = 0;
  _$jscoverage['/lang/array.js'].lineData[29] = 0;
  _$jscoverage['/lang/array.js'].lineData[37] = 0;
  _$jscoverage['/lang/array.js'].lineData[39] = 0;
  _$jscoverage['/lang/array.js'].lineData[40] = 0;
  _$jscoverage['/lang/array.js'].lineData[41] = 0;
  _$jscoverage['/lang/array.js'].lineData[42] = 0;
  _$jscoverage['/lang/array.js'].lineData[44] = 0;
  _$jscoverage['/lang/array.js'].lineData[45] = 0;
  _$jscoverage['/lang/array.js'].lineData[49] = 0;
  _$jscoverage['/lang/array.js'].lineData[51] = 0;
  _$jscoverage['/lang/array.js'].lineData[52] = 0;
  _$jscoverage['/lang/array.js'].lineData[57] = 0;
  _$jscoverage['/lang/array.js'].lineData[70] = 0;
  _$jscoverage['/lang/array.js'].lineData[73] = 0;
  _$jscoverage['/lang/array.js'].lineData[74] = 0;
  _$jscoverage['/lang/array.js'].lineData[75] = 0;
  _$jscoverage['/lang/array.js'].lineData[78] = 0;
  _$jscoverage['/lang/array.js'].lineData[93] = 0;
  _$jscoverage['/lang/array.js'].lineData[96] = 0;
  _$jscoverage['/lang/array.js'].lineData[97] = 0;
  _$jscoverage['/lang/array.js'].lineData[98] = 0;
  _$jscoverage['/lang/array.js'].lineData[101] = 0;
  _$jscoverage['/lang/array.js'].lineData[113] = 0;
  _$jscoverage['/lang/array.js'].lineData[114] = 0;
  _$jscoverage['/lang/array.js'].lineData[115] = 0;
  _$jscoverage['/lang/array.js'].lineData[117] = 0;
  _$jscoverage['/lang/array.js'].lineData[121] = 0;
  _$jscoverage['/lang/array.js'].lineData[122] = 0;
  _$jscoverage['/lang/array.js'].lineData[123] = 0;
  _$jscoverage['/lang/array.js'].lineData[124] = 0;
  _$jscoverage['/lang/array.js'].lineData[126] = 0;
  _$jscoverage['/lang/array.js'].lineData[129] = 0;
  _$jscoverage['/lang/array.js'].lineData[130] = 0;
  _$jscoverage['/lang/array.js'].lineData[132] = 0;
  _$jscoverage['/lang/array.js'].lineData[143] = 0;
  _$jscoverage['/lang/array.js'].lineData[160] = 0;
  _$jscoverage['/lang/array.js'].lineData[163] = 0;
  _$jscoverage['/lang/array.js'].lineData[164] = 0;
  _$jscoverage['/lang/array.js'].lineData[165] = 0;
  _$jscoverage['/lang/array.js'].lineData[166] = 0;
  _$jscoverage['/lang/array.js'].lineData[169] = 0;
  _$jscoverage['/lang/array.js'].lineData[186] = 0;
  _$jscoverage['/lang/array.js'].lineData[189] = 0;
  _$jscoverage['/lang/array.js'].lineData[191] = 0;
  _$jscoverage['/lang/array.js'].lineData[192] = 0;
  _$jscoverage['/lang/array.js'].lineData[193] = 0;
  _$jscoverage['/lang/array.js'].lineData[196] = 0;
  _$jscoverage['/lang/array.js'].lineData[199] = 0;
  _$jscoverage['/lang/array.js'].lineData[215] = 0;
  _$jscoverage['/lang/array.js'].lineData[216] = 0;
  _$jscoverage['/lang/array.js'].lineData[217] = 0;
  _$jscoverage['/lang/array.js'].lineData[221] = 0;
  _$jscoverage['/lang/array.js'].lineData[222] = 0;
  _$jscoverage['/lang/array.js'].lineData[225] = 0;
  _$jscoverage['/lang/array.js'].lineData[226] = 0;
  _$jscoverage['/lang/array.js'].lineData[227] = 0;
  _$jscoverage['/lang/array.js'].lineData[228] = 0;
  _$jscoverage['/lang/array.js'].lineData[230] = 0;
  _$jscoverage['/lang/array.js'].lineData[231] = 0;
  _$jscoverage['/lang/array.js'].lineData[232] = 0;
  _$jscoverage['/lang/array.js'].lineData[233] = 0;
  _$jscoverage['/lang/array.js'].lineData[237] = 0;
  _$jscoverage['/lang/array.js'].lineData[238] = 0;
  _$jscoverage['/lang/array.js'].lineData[239] = 0;
  _$jscoverage['/lang/array.js'].lineData[245] = 0;
  _$jscoverage['/lang/array.js'].lineData[246] = 0;
  _$jscoverage['/lang/array.js'].lineData[247] = 0;
  _$jscoverage['/lang/array.js'].lineData[249] = 0;
  _$jscoverage['/lang/array.js'].lineData[252] = 0;
  _$jscoverage['/lang/array.js'].lineData[266] = 0;
  _$jscoverage['/lang/array.js'].lineData[269] = 0;
  _$jscoverage['/lang/array.js'].lineData[270] = 0;
  _$jscoverage['/lang/array.js'].lineData[271] = 0;
  _$jscoverage['/lang/array.js'].lineData[272] = 0;
  _$jscoverage['/lang/array.js'].lineData[275] = 0;
  _$jscoverage['/lang/array.js'].lineData[289] = 0;
  _$jscoverage['/lang/array.js'].lineData[292] = 0;
  _$jscoverage['/lang/array.js'].lineData[293] = 0;
  _$jscoverage['/lang/array.js'].lineData[294] = 0;
  _$jscoverage['/lang/array.js'].lineData[295] = 0;
  _$jscoverage['/lang/array.js'].lineData[298] = 0;
  _$jscoverage['/lang/array.js'].lineData[308] = 0;
  _$jscoverage['/lang/array.js'].lineData[309] = 0;
  _$jscoverage['/lang/array.js'].lineData[311] = 0;
  _$jscoverage['/lang/array.js'].lineData[312] = 0;
  _$jscoverage['/lang/array.js'].lineData[314] = 0;
  _$jscoverage['/lang/array.js'].lineData[317] = 0;
  _$jscoverage['/lang/array.js'].lineData[327] = 0;
  _$jscoverage['/lang/array.js'].lineData[329] = 0;
  _$jscoverage['/lang/array.js'].lineData[330] = 0;
  _$jscoverage['/lang/array.js'].lineData[331] = 0;
  _$jscoverage['/lang/array.js'].lineData[333] = 0;
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
  _$jscoverage['/lang/array.js'].branchData['28'] = [];
  _$jscoverage['/lang/array.js'].branchData['28'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['33'] = [];
  _$jscoverage['/lang/array.js'].branchData['33'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['35'] = [];
  _$jscoverage['/lang/array.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['35'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['35'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['37'] = [];
  _$jscoverage['/lang/array.js'].branchData['37'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['39'] = [];
  _$jscoverage['/lang/array.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['41'] = [];
  _$jscoverage['/lang/array.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['44'] = [];
  _$jscoverage['/lang/array.js'].branchData['44'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['50'] = [];
  _$jscoverage['/lang/array.js'].branchData['50'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['51'] = [];
  _$jscoverage['/lang/array.js'].branchData['51'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['73'] = [];
  _$jscoverage['/lang/array.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['74'] = [];
  _$jscoverage['/lang/array.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['96'] = [];
  _$jscoverage['/lang/array.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['97'] = [];
  _$jscoverage['/lang/array.js'].branchData['97'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['114'] = [];
  _$jscoverage['/lang/array.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['121'] = [];
  _$jscoverage['/lang/array.js'].branchData['121'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['123'] = [];
  _$jscoverage['/lang/array.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['129'] = [];
  _$jscoverage['/lang/array.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['143'] = [];
  _$jscoverage['/lang/array.js'].branchData['143'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['160'] = [];
  _$jscoverage['/lang/array.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['165'] = [];
  _$jscoverage['/lang/array.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['165'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['186'] = [];
  _$jscoverage['/lang/array.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['191'] = [];
  _$jscoverage['/lang/array.js'].branchData['191'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['192'] = [];
  _$jscoverage['/lang/array.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['193'] = [];
  _$jscoverage['/lang/array.js'].branchData['193'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['196'] = [];
  _$jscoverage['/lang/array.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['216'] = [];
  _$jscoverage['/lang/array.js'].branchData['216'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['221'] = [];
  _$jscoverage['/lang/array.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['221'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['221'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['227'] = [];
  _$jscoverage['/lang/array.js'].branchData['227'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['231'] = [];
  _$jscoverage['/lang/array.js'].branchData['231'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['238'] = [];
  _$jscoverage['/lang/array.js'].branchData['238'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['245'] = [];
  _$jscoverage['/lang/array.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['246'] = [];
  _$jscoverage['/lang/array.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['266'] = [];
  _$jscoverage['/lang/array.js'].branchData['266'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['269'] = [];
  _$jscoverage['/lang/array.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['269'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['270'] = [];
  _$jscoverage['/lang/array.js'].branchData['270'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['271'] = [];
  _$jscoverage['/lang/array.js'].branchData['271'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['289'] = [];
  _$jscoverage['/lang/array.js'].branchData['289'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['292'] = [];
  _$jscoverage['/lang/array.js'].branchData['292'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['292'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['293'] = [];
  _$jscoverage['/lang/array.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['294'] = [];
  _$jscoverage['/lang/array.js'].branchData['294'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['308'] = [];
  _$jscoverage['/lang/array.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['311'] = [];
  _$jscoverage['/lang/array.js'].branchData['311'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['317'] = [];
  _$jscoverage['/lang/array.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['317'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['320'] = [];
  _$jscoverage['/lang/array.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['320'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['323'] = [];
  _$jscoverage['/lang/array.js'].branchData['323'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['323'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['323'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['323'][4] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['324'] = [];
  _$jscoverage['/lang/array.js'].branchData['324'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['324'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'] = [];
  _$jscoverage['/lang/array.js'].branchData['326'][1] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'][2] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'][3] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['326'][4] = new BranchData();
  _$jscoverage['/lang/array.js'].branchData['330'] = [];
  _$jscoverage['/lang/array.js'].branchData['330'][1] = new BranchData();
}
_$jscoverage['/lang/array.js'].branchData['330'][1].init(891, 5, 'i < l');
function visit131_330_1(result) {
  _$jscoverage['/lang/array.js'].branchData['330'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][4].init(146, 23, 'lengthType === \'number\'');
function visit130_326_4(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][3].init(131, 38, '\'item\' in o && lengthType === \'number\'');
function visit129_326_3(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][2].init(105, 20, 'oType === \'function\'');
function visit128_326_2(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['326'][1].init(105, 65, 'oType === \'function\' && !(\'item\' in o && lengthType === \'number\')');
function visit127_326_1(result) {
  _$jscoverage['/lang/array.js'].branchData['326'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['324'][2].init(609, 18, 'oType === \'string\'');
function visit126_324_2(result) {
  _$jscoverage['/lang/array.js'].branchData['324'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['324'][1].init(46, 172, 'oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit125_324_1(result) {
  _$jscoverage['/lang/array.js'].branchData['324'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['323'][4].init(574, 13, 'o == o.window');
function visit124_323_4(result) {
  _$jscoverage['/lang/array.js'].branchData['323'][4].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['323'][3].init(561, 9, 'o != null');
function visit123_323_3(result) {
  _$jscoverage['/lang/array.js'].branchData['323'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['323'][2].init(561, 26, 'o != null && o == o.window');
function visit122_323_2(result) {
  _$jscoverage['/lang/array.js'].branchData['323'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['323'][1].init(116, 219, '(o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit121_323_1(result) {
  _$jscoverage['/lang/array.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['320'][2].init(443, 30, 'typeof o.nodeName === \'string\'');
function visit120_320_2(result) {
  _$jscoverage['/lang/array.js'].branchData['320'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['320'][1].init(141, 336, 'typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit119_320_1(result) {
  _$jscoverage['/lang/array.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['317'][2].init(299, 23, 'lengthType !== \'number\'');
function visit118_317_2(result) {
  _$jscoverage['/lang/array.js'].branchData['317'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['317'][1].init(299, 478, 'lengthType !== \'number\' || typeof o.nodeName === \'string\' || (o != null && o == o.window) || oType === \'string\' || (oType === \'function\' && !(\'item\' in o && lengthType === \'number\'))');
function visit117_317_1(result) {
  _$jscoverage['/lang/array.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['311'][1].init(87, 12, 'S.isArray(o)');
function visit116_311_1(result) {
  _$jscoverage['/lang/array.js'].branchData['311'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['308'][1].init(17, 9, 'o == null');
function visit115_308_1(result) {
  _$jscoverage['/lang/array.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['294'][1].init(25, 44, 'i in arr && fn.call(context, arr[i], i, arr)');
function visit114_294_1(result) {
  _$jscoverage['/lang/array.js'].branchData['294'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['293'][1].init(83, 7, 'i < len');
function visit113_293_1(result) {
  _$jscoverage['/lang/array.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['292'][2].init(27, 17, 'arr && arr.length');
function visit112_292_2(result) {
  _$jscoverage['/lang/array.js'].branchData['292'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['292'][1].init(27, 22, 'arr && arr.length || 0');
function visit111_292_1(result) {
  _$jscoverage['/lang/array.js'].branchData['292'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['289'][1].init(43, 15, 'context || this');
function visit110_289_1(result) {
  _$jscoverage['/lang/array.js'].branchData['289'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['271'][1].init(25, 45, 'i in arr && !fn.call(context, arr[i], i, arr)');
function visit109_271_1(result) {
  _$jscoverage['/lang/array.js'].branchData['271'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['270'][1].init(83, 7, 'i < len');
function visit108_270_1(result) {
  _$jscoverage['/lang/array.js'].branchData['270'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['269'][2].init(27, 17, 'arr && arr.length');
function visit107_269_2(result) {
  _$jscoverage['/lang/array.js'].branchData['269'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['269'][1].init(27, 22, 'arr && arr.length || 0');
function visit106_269_1(result) {
  _$jscoverage['/lang/array.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['266'][1].init(44, 15, 'context || this');
function visit105_266_1(result) {
  _$jscoverage['/lang/array.js'].branchData['266'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['246'][1].init(21, 8, 'k in arr');
function visit104_246_1(result) {
  _$jscoverage['/lang/array.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['245'][1].init(978, 7, 'k < len');
function visit103_245_1(result) {
  _$jscoverage['/lang/array.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['238'][1].init(270, 8, 'k >= len');
function visit102_238_1(result) {
  _$jscoverage['/lang/array.js'].branchData['238'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['231'][1].init(25, 8, 'k in arr');
function visit101_231_1(result) {
  _$jscoverage['/lang/array.js'].branchData['231'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['227'][1].init(435, 21, 'arguments.length >= 3');
function visit100_227_1(result) {
  _$jscoverage['/lang/array.js'].branchData['227'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['221'][3].init(268, 22, 'arguments.length === 2');
function visit99_221_3(result) {
  _$jscoverage['/lang/array.js'].branchData['221'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['221'][2].init(255, 9, 'len === 0');
function visit98_221_2(result) {
  _$jscoverage['/lang/array.js'].branchData['221'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['221'][1].init(255, 35, 'len === 0 && arguments.length === 2');
function visit97_221_1(result) {
  _$jscoverage['/lang/array.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['216'][1].init(51, 30, 'typeof callback !== \'function\'');
function visit96_216_1(result) {
  _$jscoverage['/lang/array.js'].branchData['216'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['196'][1].init(42, 15, 'context || this');
function visit95_196_1(result) {
  _$jscoverage['/lang/array.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['193'][1].init(104, 106, 'el || i in arr');
function visit94_193_1(result) {
  _$jscoverage['/lang/array.js'].branchData['193'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['192'][1].init(30, 23, 'typeof arr === \'string\'');
function visit93_192_1(result) {
  _$jscoverage['/lang/array.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['191'][1].init(113, 7, 'i < len');
function visit92_191_1(result) {
  _$jscoverage['/lang/array.js'].branchData['191'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['186'][1].init(42, 15, 'context || this');
function visit91_186_1(result) {
  _$jscoverage['/lang/array.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['165'][2].init(33, 15, 'context || this');
function visit90_165_2(result) {
  _$jscoverage['/lang/array.js'].branchData['165'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['165'][1].init(25, 38, 'fn.call(context || this, item, i, arr)');
function visit89_165_1(result) {
  _$jscoverage['/lang/array.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['160'][1].init(45, 15, 'context || this');
function visit88_160_1(result) {
  _$jscoverage['/lang/array.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['143'][1].init(20, 25, 'S.indexOf(item, arr) > -1');
function visit87_143_1(result) {
  _$jscoverage['/lang/array.js'].branchData['143'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['129'][1].init(402, 8, 'override');
function visit86_129_1(result) {
  _$jscoverage['/lang/array.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['123'][1].init(54, 33, '(n = S.lastIndexOf(item, b)) !== i');
function visit85_123_1(result) {
  _$jscoverage['/lang/array.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['121'][1].init(187, 12, 'i < b.length');
function visit84_121_1(result) {
  _$jscoverage['/lang/array.js'].branchData['121'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['114'][1].init(48, 8, 'override');
function visit83_114_1(result) {
  _$jscoverage['/lang/array.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['97'][1].init(25, 15, 'arr[i] === item');
function visit82_97_1(result) {
  _$jscoverage['/lang/array.js'].branchData['97'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['96'][1].init(46, 6, 'i >= 0');
function visit81_96_1(result) {
  _$jscoverage['/lang/array.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['74'][1].init(25, 15, 'arr[i] === item');
function visit80_74_1(result) {
  _$jscoverage['/lang/array.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['73'][1].init(51, 7, 'i < len');
function visit79_73_1(result) {
  _$jscoverage['/lang/array.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['51'][1].init(29, 42, 'fn.call(context, val, i, object) === FALSE');
function visit78_51_1(result) {
  _$jscoverage['/lang/array.js'].branchData['51'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['50'][1].init(46, 10, 'i < length');
function visit77_50_1(result) {
  _$jscoverage['/lang/array.js'].branchData['50'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['44'][1].init(122, 52, 'fn.call(context, object[key], key, object) === FALSE');
function visit76_44_1(result) {
  _$jscoverage['/lang/array.js'].branchData['44'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['41'][1].init(71, 15, 'i < keys.length');
function visit75_41_1(result) {
  _$jscoverage['/lang/array.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['39'][1].init(379, 5, 'isObj');
function visit74_39_1(result) {
  _$jscoverage['/lang/array.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['37'][1].init(341, 15, 'context || null');
function visit73_37_1(result) {
  _$jscoverage['/lang/array.js'].branchData['37'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['35'][3].init(265, 29, 'S.type(object) === \'function\'');
function visit72_35_3(result) {
  _$jscoverage['/lang/array.js'].branchData['35'][3].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['35'][2].init(241, 20, 'length === undefined');
function visit71_35_2(result) {
  _$jscoverage['/lang/array.js'].branchData['35'][2].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['35'][1].init(241, 53, 'length === undefined || S.type(object) === \'function\'');
function visit70_35_1(result) {
  _$jscoverage['/lang/array.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['33'][1].init(115, 23, 'object && object.length');
function visit69_33_1(result) {
  _$jscoverage['/lang/array.js'].branchData['33'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].branchData['28'][1].init(17, 6, 'object');
function visit68_28_1(result) {
  _$jscoverage['/lang/array.js'].branchData['28'][1].ranCondition(result);
  return result;
}_$jscoverage['/lang/array.js'].lineData[7]++;
(function(S, undefined) {
  _$jscoverage['/lang/array.js'].functionData[0]++;
  _$jscoverage['/lang/array.js'].lineData[8]++;
  var TRUE = true, AP = Array.prototype, indexOf = AP.indexOf, lastIndexOf = AP.lastIndexOf, filter = AP.filter, every = AP.every, some = AP.some, map = AP.map, FALSE = false;
  _$jscoverage['/lang/array.js'].lineData[18]++;
  S.mix(S, {
  each: function(object, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[1]++;
  _$jscoverage['/lang/array.js'].lineData[28]++;
  if (visit68_28_1(object)) {
    _$jscoverage['/lang/array.js'].lineData[29]++;
    var key, val, keys, i = 0, length = visit69_33_1(object && object.length), isObj = visit70_35_1(visit71_35_2(length === undefined) || visit72_35_3(S.type(object) === 'function'));
    _$jscoverage['/lang/array.js'].lineData[37]++;
    context = visit73_37_1(context || null);
    _$jscoverage['/lang/array.js'].lineData[39]++;
    if (visit74_39_1(isObj)) {
      _$jscoverage['/lang/array.js'].lineData[40]++;
      keys = S.keys(object);
      _$jscoverage['/lang/array.js'].lineData[41]++;
      for (; visit75_41_1(i < keys.length); i++) {
        _$jscoverage['/lang/array.js'].lineData[42]++;
        key = keys[i];
        _$jscoverage['/lang/array.js'].lineData[44]++;
        if (visit76_44_1(fn.call(context, object[key], key, object) === FALSE)) {
          _$jscoverage['/lang/array.js'].lineData[45]++;
          break;
        }
      }
    } else {
      _$jscoverage['/lang/array.js'].lineData[49]++;
      for (val = object[0]; visit77_50_1(i < length); val = object[++i]) {
        _$jscoverage['/lang/array.js'].lineData[51]++;
        if (visit78_51_1(fn.call(context, val, i, object) === FALSE)) {
          _$jscoverage['/lang/array.js'].lineData[52]++;
          break;
        }
      }
    }
  }
  _$jscoverage['/lang/array.js'].lineData[57]++;
  return object;
}, 
  indexOf: indexOf ? function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[2]++;
  _$jscoverage['/lang/array.js'].lineData[70]++;
  return indexOf.call(arr, item);
} : function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[3]++;
  _$jscoverage['/lang/array.js'].lineData[73]++;
  for (var i = 0, len = arr.length; visit79_73_1(i < len); ++i) {
    _$jscoverage['/lang/array.js'].lineData[74]++;
    if (visit80_74_1(arr[i] === item)) {
      _$jscoverage['/lang/array.js'].lineData[75]++;
      return i;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[78]++;
  return -1;
}, 
  lastIndexOf: (lastIndexOf) ? function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[4]++;
  _$jscoverage['/lang/array.js'].lineData[93]++;
  return lastIndexOf.call(arr, item);
} : function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[5]++;
  _$jscoverage['/lang/array.js'].lineData[96]++;
  for (var i = arr.length - 1; visit81_96_1(i >= 0); i--) {
    _$jscoverage['/lang/array.js'].lineData[97]++;
    if (visit82_97_1(arr[i] === item)) {
      _$jscoverage['/lang/array.js'].lineData[98]++;
      break;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[101]++;
  return i;
}, 
  unique: function(a, override) {
  _$jscoverage['/lang/array.js'].functionData[6]++;
  _$jscoverage['/lang/array.js'].lineData[113]++;
  var b = a.slice();
  _$jscoverage['/lang/array.js'].lineData[114]++;
  if (visit83_114_1(override)) {
    _$jscoverage['/lang/array.js'].lineData[115]++;
    b.reverse();
  }
  _$jscoverage['/lang/array.js'].lineData[117]++;
  var i = 0, n, item;
  _$jscoverage['/lang/array.js'].lineData[121]++;
  while (visit84_121_1(i < b.length)) {
    _$jscoverage['/lang/array.js'].lineData[122]++;
    item = b[i];
    _$jscoverage['/lang/array.js'].lineData[123]++;
    while (visit85_123_1((n = S.lastIndexOf(item, b)) !== i)) {
      _$jscoverage['/lang/array.js'].lineData[124]++;
      b.splice(n, 1);
    }
    _$jscoverage['/lang/array.js'].lineData[126]++;
    i += 1;
  }
  _$jscoverage['/lang/array.js'].lineData[129]++;
  if (visit86_129_1(override)) {
    _$jscoverage['/lang/array.js'].lineData[130]++;
    b.reverse();
  }
  _$jscoverage['/lang/array.js'].lineData[132]++;
  return b;
}, 
  inArray: function(item, arr) {
  _$jscoverage['/lang/array.js'].functionData[7]++;
  _$jscoverage['/lang/array.js'].lineData[143]++;
  return visit87_143_1(S.indexOf(item, arr) > -1);
}, 
  filter: filter ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[8]++;
  _$jscoverage['/lang/array.js'].lineData[160]++;
  return filter.call(arr, fn, visit88_160_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[9]++;
  _$jscoverage['/lang/array.js'].lineData[163]++;
  var ret = [];
  _$jscoverage['/lang/array.js'].lineData[164]++;
  S.each(arr, function(item, i, arr) {
  _$jscoverage['/lang/array.js'].functionData[10]++;
  _$jscoverage['/lang/array.js'].lineData[165]++;
  if (visit89_165_1(fn.call(visit90_165_2(context || this), item, i, arr))) {
    _$jscoverage['/lang/array.js'].lineData[166]++;
    ret.push(item);
  }
});
  _$jscoverage['/lang/array.js'].lineData[169]++;
  return ret;
}, 
  map: map ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[11]++;
  _$jscoverage['/lang/array.js'].lineData[186]++;
  return map.call(arr, fn, visit91_186_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[12]++;
  _$jscoverage['/lang/array.js'].lineData[189]++;
  var len = arr.length, res = new Array(len);
  _$jscoverage['/lang/array.js'].lineData[191]++;
  for (var i = 0; visit92_191_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[192]++;
    var el = visit93_192_1(typeof arr === 'string') ? arr.charAt(i) : arr[i];
    _$jscoverage['/lang/array.js'].lineData[193]++;
    if (visit94_193_1(el || i in arr)) {
      _$jscoverage['/lang/array.js'].lineData[196]++;
      res[i] = fn.call(visit95_196_1(context || this), el, i, arr);
    }
  }
  _$jscoverage['/lang/array.js'].lineData[199]++;
  return res;
}, 
  reduce: function(arr, callback, initialValue) {
  _$jscoverage['/lang/array.js'].functionData[13]++;
  _$jscoverage['/lang/array.js'].lineData[215]++;
  var len = arr.length;
  _$jscoverage['/lang/array.js'].lineData[216]++;
  if (visit96_216_1(typeof callback !== 'function')) {
    _$jscoverage['/lang/array.js'].lineData[217]++;
    throw new TypeError('callback is not function!');
  }
  _$jscoverage['/lang/array.js'].lineData[221]++;
  if (visit97_221_1(visit98_221_2(len === 0) && visit99_221_3(arguments.length === 2))) {
    _$jscoverage['/lang/array.js'].lineData[222]++;
    throw new TypeError('arguments invalid');
  }
  _$jscoverage['/lang/array.js'].lineData[225]++;
  var k = 0;
  _$jscoverage['/lang/array.js'].lineData[226]++;
  var accumulator;
  _$jscoverage['/lang/array.js'].lineData[227]++;
  if (visit100_227_1(arguments.length >= 3)) {
    _$jscoverage['/lang/array.js'].lineData[228]++;
    accumulator = initialValue;
  } else {
    _$jscoverage['/lang/array.js'].lineData[230]++;
    do {
      _$jscoverage['/lang/array.js'].lineData[231]++;
      if (visit101_231_1(k in arr)) {
        _$jscoverage['/lang/array.js'].lineData[232]++;
        accumulator = arr[k++];
        _$jscoverage['/lang/array.js'].lineData[233]++;
        break;
      }
      _$jscoverage['/lang/array.js'].lineData[237]++;
      k += 1;
      _$jscoverage['/lang/array.js'].lineData[238]++;
      if (visit102_238_1(k >= len)) {
        _$jscoverage['/lang/array.js'].lineData[239]++;
        throw new TypeError();
      }
    } while (TRUE);
  }
  _$jscoverage['/lang/array.js'].lineData[245]++;
  while (visit103_245_1(k < len)) {
    _$jscoverage['/lang/array.js'].lineData[246]++;
    if (visit104_246_1(k in arr)) {
      _$jscoverage['/lang/array.js'].lineData[247]++;
      accumulator = callback.call(undefined, accumulator, arr[k], k, arr);
    }
    _$jscoverage['/lang/array.js'].lineData[249]++;
    k++;
  }
  _$jscoverage['/lang/array.js'].lineData[252]++;
  return accumulator;
}, 
  every: every ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[14]++;
  _$jscoverage['/lang/array.js'].lineData[266]++;
  return every.call(arr, fn, visit105_266_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[15]++;
  _$jscoverage['/lang/array.js'].lineData[269]++;
  var len = visit106_269_1(visit107_269_2(arr && arr.length) || 0);
  _$jscoverage['/lang/array.js'].lineData[270]++;
  for (var i = 0; visit108_270_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[271]++;
    if (visit109_271_1(i in arr && !fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/lang/array.js'].lineData[272]++;
      return FALSE;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[275]++;
  return TRUE;
}, 
  some: some ? function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[16]++;
  _$jscoverage['/lang/array.js'].lineData[289]++;
  return some.call(arr, fn, visit110_289_1(context || this));
} : function(arr, fn, context) {
  _$jscoverage['/lang/array.js'].functionData[17]++;
  _$jscoverage['/lang/array.js'].lineData[292]++;
  var len = visit111_292_1(visit112_292_2(arr && arr.length) || 0);
  _$jscoverage['/lang/array.js'].lineData[293]++;
  for (var i = 0; visit113_293_1(i < len); i++) {
    _$jscoverage['/lang/array.js'].lineData[294]++;
    if (visit114_294_1(i in arr && fn.call(context, arr[i], i, arr))) {
      _$jscoverage['/lang/array.js'].lineData[295]++;
      return TRUE;
    }
  }
  _$jscoverage['/lang/array.js'].lineData[298]++;
  return FALSE;
}, 
  makeArray: function(o) {
  _$jscoverage['/lang/array.js'].functionData[18]++;
  _$jscoverage['/lang/array.js'].lineData[308]++;
  if (visit115_308_1(o == null)) {
    _$jscoverage['/lang/array.js'].lineData[309]++;
    return [];
  }
  _$jscoverage['/lang/array.js'].lineData[311]++;
  if (visit116_311_1(S.isArray(o))) {
    _$jscoverage['/lang/array.js'].lineData[312]++;
    return o;
  }
  _$jscoverage['/lang/array.js'].lineData[314]++;
  var lengthType = typeof o.length, oType = typeof o;
  _$jscoverage['/lang/array.js'].lineData[317]++;
  if (visit117_317_1(visit118_317_2(lengthType !== 'number') || visit119_320_1(visit120_320_2(typeof o.nodeName === 'string') || visit121_323_1((visit122_323_2(visit123_323_3(o != null) && visit124_323_4(o == o.window))) || visit125_324_1(visit126_324_2(oType === 'string') || (visit127_326_1(visit128_326_2(oType === 'function') && !(visit129_326_3('item' in o && visit130_326_4(lengthType === 'number')))))))))) {
    _$jscoverage['/lang/array.js'].lineData[327]++;
    return [o];
  }
  _$jscoverage['/lang/array.js'].lineData[329]++;
  var ret = [];
  _$jscoverage['/lang/array.js'].lineData[330]++;
  for (var i = 0, l = o.length; visit131_330_1(i < l); i++) {
    _$jscoverage['/lang/array.js'].lineData[331]++;
    ret[i] = o[i];
  }
  _$jscoverage['/lang/array.js'].lineData[333]++;
  return ret;
}});
})(KISSY);
