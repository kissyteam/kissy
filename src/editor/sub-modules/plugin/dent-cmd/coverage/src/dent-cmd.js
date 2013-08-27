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
  _$jscoverage['/dent-cmd.js'].lineData[9] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[11] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[22] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[23] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[26] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[30] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[32] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[34] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[35] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[37] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[39] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[40] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[43] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[46] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[47] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[48] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[49] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[50] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[52] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[53] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[59] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[61] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[62] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[65] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[66] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[67] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[68] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[71] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[77] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[81] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[82] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[84] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[86] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[87] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[103] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[105] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[109] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[113] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[114] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[115] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[116] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[118] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[122] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[123] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[125] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[130] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[131] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[133] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[136] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[137] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[138] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[142] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[147] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[148] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[150] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[152] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[154] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[159] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[162] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[163] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[166] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[167] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[168] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[169] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[173] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[174] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[175] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[176] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[178] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[179] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[180] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[182] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[183] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[184] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[185] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[186] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[189] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[193] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[194] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[196] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[197] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[199] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[204] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[207] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[214] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[218] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[219] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[220] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[223] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[226] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[227] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[228] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[231] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[233] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[234] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[235] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[236] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[238] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[242] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[244] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[248] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[250] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[253] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[254] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[255] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[257] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[258] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[259] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[260] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[266] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[268] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[269] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[270] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[272] = 0;
  _$jscoverage['/dent-cmd.js'].lineData[273] = 0;
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
  _$jscoverage['/dent-cmd.js'].branchData['23'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['23'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['23'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['23'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['32'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['32'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['35'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['35'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['39'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['39'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['47'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['52'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['52'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['65'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['65'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['66'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['66'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['71'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['71'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['83'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['83'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['104'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['104'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['104'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['104'][3] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['114'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['114'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['116'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['117'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['117'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['122'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['123'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['123'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['124'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['124'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['130'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['131'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['131'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['132'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['132'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['136'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['136'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['137'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['137'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['142'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['142'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['147'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['147'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['148'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['148'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['175'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['175'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['178'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['178'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['179'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['179'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['185'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['185'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['195'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['195'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['196'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['196'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['204'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['204'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['205'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['205'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['205'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['214'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['214'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['215'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['215'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['215'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['223'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['224'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['224'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['224'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['233'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['233'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['235'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['235'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['235'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['239'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['239'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['239'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['242'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['242'][2] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['254'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['269'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['269'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['272'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/dent-cmd.js'].branchData['273'] = [];
  _$jscoverage['/dent-cmd.js'].branchData['273'][1] = new BranchData();
}
_$jscoverage['/dent-cmd.js'].branchData['273'][1].init(87, 41, 'block && block.style(INDENT_CSS_PROPERTY)');
function visit55_273_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['273'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['272'][1].init(30, 31, 'elementPath.block || blockLimit');
function visit54_272_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['269'][1].init(72, 35, 'elementPath.contains(listNodeNames)');
function visit53_269_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['269'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['254'][1].init(14, 27, '!editor.hasCommand(cmdType)');
function visit52_254_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['242'][2].init(474, 73, 'indentWholeList && indentElement(nearestListBlock, type)');
function visit51_242_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['242'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['242'][1].init(471, 78, '!(indentWholeList && indentElement(nearestListBlock, type))');
function visit50_242_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['239'][2].init(73, 33, 'firstListItem[0] == rangeStart[0]');
function visit49_239_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['239'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['239'][1].init(73, 71, 'firstListItem[0] == rangeStart[0] || firstListItem.contains(rangeStart)');
function visit48_239_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['239'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['235'][2].init(97, 32, 'firstListItem.nodeName() != "li"');
function visit47_235_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['235'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['235'][1].init(80, 49, 'firstListItem && firstListItem.nodeName() != "li"');
function visit46_235_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['235'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['233'][1].init(1524, 16, 'nearestListBlock');
function visit45_233_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['233'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['224'][2].init(1188, 53, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit44_224_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['224'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['224'][1].init(32, 110, 'endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames');
function visit43_224_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['224'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['223'][1].init(1153, 143, 'nearestListBlock && endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && endContainer.nodeName() in listNodeNames');
function visit42_223_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['215'][2].init(828, 55, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit41_215_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['215'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['215'][1].init(32, 114, 'startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames');
function visit40_215_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['215'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['214'][1].init(793, 147, 'nearestListBlock && startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE && startContainer.nodeName() in listNodeNames');
function visit39_214_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['214'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['205'][2].init(35, 57, 'nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE');
function visit38_205_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['205'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['205'][1].init(35, 122, 'nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()]');
function visit37_205_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['205'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['204'][1].init(377, 160, 'nearestListBlock && !(nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE && listNodeNames[nearestListBlock.nodeName()])');
function visit36_204_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['204'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['196'][1].init(122, 6, '!range');
function visit35_196_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['196'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['195'][1].init(59, 37, 'selection && selection.getRanges()[0]');
function visit34_195_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['195'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['185'][1].init(547, 31, 'element[0].style.cssText === \'\'');
function visit33_185_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['185'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['179'][1].init(246, 17, 'currentOffset < 0');
function visit32_179_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['179'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['178'][1].init(188, 16, 'type == \'indent\'');
function visit31_178_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['178'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['175'][1].init(93, 20, 'isNaN(currentOffset)');
function visit30_175_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['175'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['148'][1].init(33, 45, 'isNotWhitespaces(node) && isNotBookmark(node)');
function visit29_148_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['148'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['147'][1].init(195, 144, 'UA[\'ie\'] && !li.first(function(node) {\n  return isNotWhitespaces(node) && isNotBookmark(node);\n}, 1)');
function visit28_147_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['147'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['142'][1].init(187, 106, '(followingList = followingList.next()) && followingList.nodeName() in listNodeNames');
function visit27_142_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['142'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['137'][1].init(26, 22, 'i < pendingList.length');
function visit26_137_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['137'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['136'][1].init(4446, 33, 'pendingList && pendingList.length');
function visit25_136_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['136'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['132'][1].init(74, 23, 'listNode[0] || listNode');
function visit24_132_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['132'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['131'][1].init(31, 39, 'newList.listNode[0] || newList.listNode');
function visit23_131_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['131'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['130'][1].init(4199, 7, 'newList');
function visit22_130_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['124'][1].init(59, 24, 'child.nodeName() == \'li\'');
function visit21_124_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['124'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['123'][1].init(28, 84, '(child = new Node(children[i])) && child.nodeName() == \'li\'');
function visit20_123_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['123'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['122'][1].init(176, 6, 'i >= 0');
function visit19_122_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['117'][1].init(57, 34, 'parentLiElement.nodeName() == \'li\'');
function visit18_117_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['117'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['116'][1].init(54, 92, '(parentLiElement = listNode.parent()) && parentLiElement.nodeName() == \'li\'');
function visit17_116_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['114'][1].init(3616, 17, 'type == \'outdent\'');
function visit16_114_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['114'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['104'][3].init(23, 32, 'listArray[i].indent > baseIndent');
function visit15_104_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['104'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['104'][2].init(3100, 20, 'i < listArray.length');
function visit14_104_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['104'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['104'][1].init(60, 56, 'i < listArray.length && listArray[i].indent > baseIndent');
function visit13_104_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['104'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['83'][1].init(57, 37, 'i <= lastItem.data(\'listarray_index\')');
function visit12_83_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['83'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['71'][1].init(1797, 16, 'type == \'indent\'');
function visit11_71_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['71'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['66'][1].init(18, 42, 'listNodeNames[listParents[i].nodeName()]');
function visit10_66_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['66'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['65'][1].init(1581, 22, 'i < listParents.length');
function visit9_65_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['65'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['52'][1].init(1051, 22, 'itemsToMove.length < 1');
function visit8_52_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['52'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['47'][1].init(18, 26, 'block.equals(endContainer)');
function visit7_47_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['39'][1].init(609, 32, '!startContainer || !endContainer');
function visit6_39_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['39'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['35'][1].init(473, 68, 'endContainer && !endContainer.parent().equals(listNode)');
function visit5_35_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['35'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['32'][1].init(328, 72, 'startContainer && !startContainer.parent().equals(listNode)');
function visit4_32_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['32'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['23'][3].init(63, 26, 'Dom.nodeName(node) == \'li\'');
function visit3_23_3(result) {
  _$jscoverage['/dent-cmd.js'].branchData['23'][3].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['23'][2].init(17, 42, 'node.nodeType == Dom.NodeType.ELEMENT_NODE');
function visit2_23_2(result) {
  _$jscoverage['/dent-cmd.js'].branchData['23'][2].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].branchData['23'][1].init(17, 72, 'node.nodeType == Dom.NodeType.ELEMENT_NODE && Dom.nodeName(node) == \'li\'');
function visit1_23_1(result) {
  _$jscoverage['/dent-cmd.js'].branchData['23'][1].ranCondition(result);
  return result;
}_$jscoverage['/dent-cmd.js'].lineData[9]++;
KISSY.add("editor/plugin/dent-cmd", function(S, Editor, ListUtils) {
  _$jscoverage['/dent-cmd.js'].functionData[0]++;
  _$jscoverage['/dent-cmd.js'].lineData[11]++;
  var listNodeNames = {
  ol: 1, 
  ul: 1}, Walker = Editor.Walker, Dom = S.DOM, Node = S.Node, UA = S.UA, isNotWhitespaces = Walker.whitespaces(true), INDENT_CSS_PROPERTY = "margin-left", INDENT_OFFSET = 40, INDENT_UNIT = "px", isNotBookmark = Walker.bookmark(false, true);
  _$jscoverage['/dent-cmd.js'].lineData[22]++;
  function isListItem(node) {
    _$jscoverage['/dent-cmd.js'].functionData[1]++;
    _$jscoverage['/dent-cmd.js'].lineData[23]++;
    return visit1_23_1(visit2_23_2(node.nodeType == Dom.NodeType.ELEMENT_NODE) && visit3_23_3(Dom.nodeName(node) == 'li'));
  }
  _$jscoverage['/dent-cmd.js'].lineData[26]++;
  function indentList(range, listNode, type) {
    _$jscoverage['/dent-cmd.js'].functionData[2]++;
    _$jscoverage['/dent-cmd.js'].lineData[30]++;
    var startContainer = range.startContainer, endContainer = range.endContainer;
    _$jscoverage['/dent-cmd.js'].lineData[32]++;
    while (visit4_32_1(startContainer && !startContainer.parent().equals(listNode))) {
      _$jscoverage['/dent-cmd.js'].lineData[34]++;
      startContainer = startContainer.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[35]++;
    while (visit5_35_1(endContainer && !endContainer.parent().equals(listNode))) {
      _$jscoverage['/dent-cmd.js'].lineData[37]++;
      endContainer = endContainer.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[39]++;
    if (visit6_39_1(!startContainer || !endContainer)) {
      _$jscoverage['/dent-cmd.js'].lineData[40]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[43]++;
    var block = startContainer, itemsToMove = [], stopFlag = false;
    _$jscoverage['/dent-cmd.js'].lineData[46]++;
    while (!stopFlag) {
      _$jscoverage['/dent-cmd.js'].lineData[47]++;
      if (visit7_47_1(block.equals(endContainer))) {
        _$jscoverage['/dent-cmd.js'].lineData[48]++;
        stopFlag = true;
      }
      _$jscoverage['/dent-cmd.js'].lineData[49]++;
      itemsToMove.push(block);
      _$jscoverage['/dent-cmd.js'].lineData[50]++;
      block = block.next();
    }
    _$jscoverage['/dent-cmd.js'].lineData[52]++;
    if (visit8_52_1(itemsToMove.length < 1)) {
      _$jscoverage['/dent-cmd.js'].lineData[53]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[59]++;
    var listParents = listNode._4e_parents(true, undefined);
    _$jscoverage['/dent-cmd.js'].lineData[61]++;
    listParents.each(function(n, i) {
  _$jscoverage['/dent-cmd.js'].functionData[3]++;
  _$jscoverage['/dent-cmd.js'].lineData[62]++;
  listParents[i] = n;
});
    _$jscoverage['/dent-cmd.js'].lineData[65]++;
    for (var i = 0; visit9_65_1(i < listParents.length); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[66]++;
      if (visit10_66_1(listNodeNames[listParents[i].nodeName()])) {
        _$jscoverage['/dent-cmd.js'].lineData[67]++;
        listNode = listParents[i];
        _$jscoverage['/dent-cmd.js'].lineData[68]++;
        break;
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[71]++;
    var indentOffset = visit11_71_1(type == 'indent') ? 1 : -1, startItem = itemsToMove[0], lastItem = itemsToMove[itemsToMove.length - 1], database = {};
    _$jscoverage['/dent-cmd.js'].lineData[77]++;
    var listArray = ListUtils.listToArray(listNode, database);
    _$jscoverage['/dent-cmd.js'].lineData[81]++;
    var baseIndent = listArray[lastItem.data('listarray_index')].indent;
    _$jscoverage['/dent-cmd.js'].lineData[82]++;
    for (i = startItem.data('listarray_index'); visit12_83_1(i <= lastItem.data('listarray_index')); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[84]++;
      listArray[i].indent += indentOffset;
      _$jscoverage['/dent-cmd.js'].lineData[86]++;
      var listRoot = listArray[i].parent;
      _$jscoverage['/dent-cmd.js'].lineData[87]++;
      listArray[i].parent = new Node(listRoot[0].ownerDocument.createElement(listRoot.nodeName()));
    }
    _$jscoverage['/dent-cmd.js'].lineData[103]++;
    for (i = lastItem.data('listarray_index') + 1; visit13_104_1(visit14_104_2(i < listArray.length) && visit15_104_3(listArray[i].indent > baseIndent)); i++) {
      _$jscoverage['/dent-cmd.js'].lineData[105]++;
      listArray[i].indent += indentOffset;
    }
    _$jscoverage['/dent-cmd.js'].lineData[109]++;
    var newList = ListUtils.arrayToList(listArray, database, null, "p");
    _$jscoverage['/dent-cmd.js'].lineData[113]++;
    var pendingList = [];
    _$jscoverage['/dent-cmd.js'].lineData[114]++;
    if (visit16_114_1(type == 'outdent')) {
      _$jscoverage['/dent-cmd.js'].lineData[115]++;
      var parentLiElement;
      _$jscoverage['/dent-cmd.js'].lineData[116]++;
      if (visit17_116_1((parentLiElement = listNode.parent()) && visit18_117_1(parentLiElement.nodeName() == 'li'))) {
        _$jscoverage['/dent-cmd.js'].lineData[118]++;
        var children = newList.listNode.childNodes, count = children.length, child;
        _$jscoverage['/dent-cmd.js'].lineData[122]++;
        for (i = count - 1; visit19_122_1(i >= 0); i--) {
          _$jscoverage['/dent-cmd.js'].lineData[123]++;
          if (visit20_123_1((child = new Node(children[i])) && visit21_124_1(child.nodeName() == 'li'))) {
            _$jscoverage['/dent-cmd.js'].lineData[125]++;
            pendingList.push(child);
          }
        }
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[130]++;
    if (visit22_130_1(newList)) {
      _$jscoverage['/dent-cmd.js'].lineData[131]++;
      Dom.insertBefore(visit23_131_1(newList.listNode[0] || newList.listNode), visit24_132_1(listNode[0] || listNode));
      _$jscoverage['/dent-cmd.js'].lineData[133]++;
      listNode.remove();
    }
    _$jscoverage['/dent-cmd.js'].lineData[136]++;
    if (visit25_136_1(pendingList && pendingList.length)) {
      _$jscoverage['/dent-cmd.js'].lineData[137]++;
      for (i = 0; visit26_137_1(i < pendingList.length); i++) {
        _$jscoverage['/dent-cmd.js'].lineData[138]++;
        var li = pendingList[i], followingList = li;
        _$jscoverage['/dent-cmd.js'].lineData[142]++;
        while (visit27_142_1((followingList = followingList.next()) && followingList.nodeName() in listNodeNames)) {
          _$jscoverage['/dent-cmd.js'].lineData[147]++;
          if (visit28_147_1(UA['ie'] && !li.first(function(node) {
  _$jscoverage['/dent-cmd.js'].functionData[4]++;
  _$jscoverage['/dent-cmd.js'].lineData[148]++;
  return visit29_148_1(isNotWhitespaces(node) && isNotBookmark(node));
}, 1))) {
            _$jscoverage['/dent-cmd.js'].lineData[150]++;
            li[0].appendChild(range.document.createTextNode('\xa0'));
          }
          _$jscoverage['/dent-cmd.js'].lineData[152]++;
          li[0].appendChild(followingList[0]);
        }
        _$jscoverage['/dent-cmd.js'].lineData[154]++;
        Dom.insertAfter(li[0], parentLiElement[0]);
      }
    }
    _$jscoverage['/dent-cmd.js'].lineData[159]++;
    Editor.Utils.clearAllMarkers(database);
  }
  _$jscoverage['/dent-cmd.js'].lineData[162]++;
  function indentBlock(range, type) {
    _$jscoverage['/dent-cmd.js'].functionData[5]++;
    _$jscoverage['/dent-cmd.js'].lineData[163]++;
    var iterator = range.createIterator(), block;
    _$jscoverage['/dent-cmd.js'].lineData[166]++;
    iterator.enforceRealBlocks = true;
    _$jscoverage['/dent-cmd.js'].lineData[167]++;
    iterator.enlargeBr = true;
    _$jscoverage['/dent-cmd.js'].lineData[168]++;
    while (block = iterator.getNextParagraph()) {
      _$jscoverage['/dent-cmd.js'].lineData[169]++;
      indentElement(block, type);
    }
  }
  _$jscoverage['/dent-cmd.js'].lineData[173]++;
  function indentElement(element, type) {
    _$jscoverage['/dent-cmd.js'].functionData[6]++;
    _$jscoverage['/dent-cmd.js'].lineData[174]++;
    var currentOffset = parseInt(element.style(INDENT_CSS_PROPERTY), 10);
    _$jscoverage['/dent-cmd.js'].lineData[175]++;
    if (visit30_175_1(isNaN(currentOffset))) {
      _$jscoverage['/dent-cmd.js'].lineData[176]++;
      currentOffset = 0;
    }
    _$jscoverage['/dent-cmd.js'].lineData[178]++;
    currentOffset += (visit31_178_1(type == 'indent') ? 1 : -1) * INDENT_OFFSET;
    _$jscoverage['/dent-cmd.js'].lineData[179]++;
    if (visit32_179_1(currentOffset < 0)) {
      _$jscoverage['/dent-cmd.js'].lineData[180]++;
      return false;
    }
    _$jscoverage['/dent-cmd.js'].lineData[182]++;
    currentOffset = Math.max(currentOffset, 0);
    _$jscoverage['/dent-cmd.js'].lineData[183]++;
    currentOffset = Math.ceil(currentOffset / INDENT_OFFSET) * INDENT_OFFSET;
    _$jscoverage['/dent-cmd.js'].lineData[184]++;
    element.css(INDENT_CSS_PROPERTY, currentOffset ? currentOffset + INDENT_UNIT : '');
    _$jscoverage['/dent-cmd.js'].lineData[185]++;
    if (visit33_185_1(element[0].style.cssText === '')) {
      _$jscoverage['/dent-cmd.js'].lineData[186]++;
      element.removeAttr('style');
    }
    _$jscoverage['/dent-cmd.js'].lineData[189]++;
    return true;
  }
  _$jscoverage['/dent-cmd.js'].lineData[193]++;
  function indentEditor(editor, type) {
    _$jscoverage['/dent-cmd.js'].functionData[7]++;
    _$jscoverage['/dent-cmd.js'].lineData[194]++;
    var selection = editor.getSelection(), range = visit34_195_1(selection && selection.getRanges()[0]);
    _$jscoverage['/dent-cmd.js'].lineData[196]++;
    if (visit35_196_1(!range)) {
      _$jscoverage['/dent-cmd.js'].lineData[197]++;
      return;
    }
    _$jscoverage['/dent-cmd.js'].lineData[199]++;
    var startContainer = range.startContainer, endContainer = range.endContainer, rangeRoot = range.getCommonAncestor(), nearestListBlock = rangeRoot;
    _$jscoverage['/dent-cmd.js'].lineData[204]++;
    while (visit36_204_1(nearestListBlock && !(visit37_205_1(visit38_205_2(nearestListBlock[0].nodeType == Dom.NodeType.ELEMENT_NODE) && listNodeNames[nearestListBlock.nodeName()])))) {
      _$jscoverage['/dent-cmd.js'].lineData[207]++;
      nearestListBlock = nearestListBlock.parent();
    }
    _$jscoverage['/dent-cmd.js'].lineData[214]++;
    if (visit39_214_1(nearestListBlock && visit40_215_1(visit41_215_2(startContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && startContainer.nodeName() in listNodeNames))) {
      _$jscoverage['/dent-cmd.js'].lineData[218]++;
      var walker = new Walker(range);
      _$jscoverage['/dent-cmd.js'].lineData[219]++;
      walker.evaluator = isListItem;
      _$jscoverage['/dent-cmd.js'].lineData[220]++;
      range.startContainer = walker.next();
    }
    _$jscoverage['/dent-cmd.js'].lineData[223]++;
    if (visit42_223_1(nearestListBlock && visit43_224_1(visit44_224_2(endContainer[0].nodeType == Dom.NodeType.ELEMENT_NODE) && endContainer.nodeName() in listNodeNames))) {
      _$jscoverage['/dent-cmd.js'].lineData[226]++;
      walker = new Walker(range);
      _$jscoverage['/dent-cmd.js'].lineData[227]++;
      walker.evaluator = isListItem;
      _$jscoverage['/dent-cmd.js'].lineData[228]++;
      range.endContainer = walker.previous();
    }
    _$jscoverage['/dent-cmd.js'].lineData[231]++;
    var bookmarks = selection.createBookmarks(true);
    _$jscoverage['/dent-cmd.js'].lineData[233]++;
    if (visit45_233_1(nearestListBlock)) {
      _$jscoverage['/dent-cmd.js'].lineData[234]++;
      var firstListItem = nearestListBlock.first();
      _$jscoverage['/dent-cmd.js'].lineData[235]++;
      while (visit46_235_1(firstListItem && visit47_235_2(firstListItem.nodeName() != "li"))) {
        _$jscoverage['/dent-cmd.js'].lineData[236]++;
        firstListItem = firstListItem.next();
      }
      _$jscoverage['/dent-cmd.js'].lineData[238]++;
      var rangeStart = range.startContainer, indentWholeList = visit48_239_1(visit49_239_2(firstListItem[0] == rangeStart[0]) || firstListItem.contains(rangeStart));
      _$jscoverage['/dent-cmd.js'].lineData[242]++;
      if (visit50_242_1(!(visit51_242_2(indentWholeList && indentElement(nearestListBlock, type))))) {
        _$jscoverage['/dent-cmd.js'].lineData[244]++;
        indentList(range, nearestListBlock, type);
      }
    } else {
      _$jscoverage['/dent-cmd.js'].lineData[248]++;
      indentBlock(range, type);
    }
    _$jscoverage['/dent-cmd.js'].lineData[250]++;
    selection.selectBookmarks(bookmarks);
  }
  _$jscoverage['/dent-cmd.js'].lineData[253]++;
  function addCommand(editor, cmdType) {
    _$jscoverage['/dent-cmd.js'].functionData[8]++;
    _$jscoverage['/dent-cmd.js'].lineData[254]++;
    if (visit52_254_1(!editor.hasCommand(cmdType))) {
      _$jscoverage['/dent-cmd.js'].lineData[255]++;
      editor.addCommand(cmdType, {
  exec: function(editor) {
  _$jscoverage['/dent-cmd.js'].functionData[9]++;
  _$jscoverage['/dent-cmd.js'].lineData[257]++;
  editor.execCommand("save");
  _$jscoverage['/dent-cmd.js'].lineData[258]++;
  indentEditor(editor, cmdType);
  _$jscoverage['/dent-cmd.js'].lineData[259]++;
  editor.execCommand("save");
  _$jscoverage['/dent-cmd.js'].lineData[260]++;
  editor.notifySelectionChange();
}});
    }
  }
  _$jscoverage['/dent-cmd.js'].lineData[266]++;
  return {
  checkOutdentActive: function(elementPath) {
  _$jscoverage['/dent-cmd.js'].functionData[10]++;
  _$jscoverage['/dent-cmd.js'].lineData[268]++;
  var blockLimit = elementPath.blockLimit;
  _$jscoverage['/dent-cmd.js'].lineData[269]++;
  if (visit53_269_1(elementPath.contains(listNodeNames))) {
    _$jscoverage['/dent-cmd.js'].lineData[270]++;
    return true;
  } else {
    _$jscoverage['/dent-cmd.js'].lineData[272]++;
    var block = visit54_272_1(elementPath.block || blockLimit);
    _$jscoverage['/dent-cmd.js'].lineData[273]++;
    return visit55_273_1(block && block.style(INDENT_CSS_PROPERTY));
  }
}, 
  addCommand: addCommand};
}, {
  requires: ['editor', './list-utils']});
