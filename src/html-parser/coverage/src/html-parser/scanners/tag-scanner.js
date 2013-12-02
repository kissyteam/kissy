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
if (! _$jscoverage['/html-parser/scanners/tag-scanner.js']) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'] = {};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[6] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[7] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[8] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[9] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[11] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[28] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[44] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[45] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[47] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[48] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[51] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[54] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[55] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[56] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[57] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[61] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[62] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[65] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[74] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[75] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[77] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[81] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[84] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[88] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[89] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[91] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[92] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[96] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[97] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[100] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[103] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[104] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[105] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[107] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[108] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[109] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[110] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[113] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[114] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[116] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[118] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[119] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[120] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[121] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[127] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[128] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[130] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[131] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[133] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[134] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[136] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[137] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[138] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[139] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[141] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[142] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[145] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[146] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[149] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[150] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[158] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[159] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[163] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[170] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[171] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[174] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[181] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[183] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[184] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[186] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[187] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[189] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[190] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[192] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[193] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[196] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[199] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[200] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[201] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[203] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[204] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[206] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[207] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[212] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[213] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[216] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[217] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[221] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[223] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[224] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[225] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[227] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[228] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[230] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[231] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[234] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[237] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[242] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[243] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[244] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[245] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[246] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[248] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[250] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[251] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[253] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[255] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[256] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[259] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[260] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[268] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[272] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[273] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[275] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[278] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[294] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[295] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[296] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[297] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[298] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[299] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[303] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[306] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[307] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[308] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[309] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[314] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[319] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[320] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[321] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[323] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[324] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[325] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[327] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[328] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[330] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[337] = 0;
}
if (! _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[0] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[1] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[2] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[3] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[4] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[5] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[6] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[7] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[8] = 0;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[9] = 0;
}
if (! _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData = {};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['47'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['47'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['55'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['55'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['61'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['75'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['75'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['91'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['91'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['96'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['96'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['103'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['103'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['109'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'][2] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['130'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['130'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['158'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['192'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['192'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['200'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['200'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['223'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['223'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['230'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['230'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['242'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['242'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['253'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['253'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['259'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['259'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['272'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['272'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['278'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['278'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['297'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['303'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1] = new BranchData();
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'] = [];
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'][1] = new BranchData();
}
_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'][1].init(127, 30, '!SpecialScanners[node.tagName]');
function visit322_323_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['323'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1].init(25, 16, 'stack.length > 0');
function visit321_320_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['320'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'][1].init(4137, 13, 'node === null');
function visit320_319_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['319'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['303'][1].init(1460, 12, 'index !== -1');
function visit319_303_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['297'][1].init(87, 26, 'c.tagName === node.tagName');
function visit318_297_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'][1].init(1142, 6, 'i >= 0');
function visit317_295_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['278'][1].init(1868, 15, 'node.isEndTag()');
function visit316_278_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['278'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['272'][1].init(797, 26, 'processImpliedEndTag(node)');
function visit315_272_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['272'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['259'][1].init(103, 17, 'node.isSelfClosed');
function visit314_259_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['259'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['253'][1].init(34, 29, 'SpecialScanners[node.tagName]');
function visit313_253_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['253'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'][1].init(227, 16, '!node.isEndTag()');
function visit312_251_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['251'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'][1].init(46, 28, 'node.tagName === tag.tagName');
function visit311_249_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['249'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'][1].init(71, 75, 'node.isEndTag() && node.tagName === tag.tagName');
function visit310_248_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['248'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'][1].init(25, 19, 'node.nodeType === 1');
function visit309_246_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['246'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'][1].init(62, 4, 'node');
function visit308_245_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['245'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['242'][1].init(1723, 16, 'opts.stack || []');
function visit307_242_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['242'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['230'][1].init(609, 7, 'needFix');
function visit306_230_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['230'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['223'][1].init(87, 31, 'parent.tagName === node.tagName');
function visit305_223_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['223'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'][1].init(211, 47, 'parent && !(parent.tagName in endParentTagName)');
function visit304_221_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['221'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['200'][1].init(31, 8, 'i > from');
function visit303_200_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['200'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['192'][1].init(301, 29, 'node.tagName || node.nodeName');
function visit302_192_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['192'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'][1].init(223, 19, 'node.nodeType === 8');
function visit301_189_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['189'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'][1].init(116, 17, '!dtd[tag.tagName]');
function visit300_186_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['186'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'][1].init(50, 18, 'tag.nodeType === 9');
function visit299_183_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['183'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['158'][1].init(4115, 24, 'holder.childNodes.length');
function visit298_158_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['130'][1].init(81, 28, 'canHasNodeAsChild(c, holder)');
function visit297_130_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['130'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'][1].init(1408, 17, '!c.equals(holder)');
function visit296_128_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['128'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'][2].init(261, 28, 'childNodes[i].nodeType === 3');
function visit295_113_2(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'][2].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'][1].init(261, 62, 'childNodes[i].nodeType === 3 && S.trim(childNodes[i].toHtml())');
function visit294_113_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['113'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['109'][1].init(29, 42, 'childNodes[i].tagName === currentChildName');
function visit293_109_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][1].init(228, 21, 'i < childNodes.length');
function visit292_108_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['108'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['103'][1].init(261, 31, 'dtd.$listItem[currentChildName]');
function visit291_103_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['103'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['96'][1].init(93, 16, 'c.nodeType !== 1');
function visit290_96_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['96'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['91'][1].init(53, 28, 'canHasNodeAsChild(holder, c)');
function visit289_91_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['91'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'][1].init(1402, 21, 'i < childNodes.length');
function visit288_88_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['88'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['75'][1].init(17, 24, 'holder.childNodes.length');
function visit287_75_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['75'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['61'][1].init(349, 5, 'valid');
function visit286_61_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['55'][1].init(17, 26, '!canHasNodeAsChild(tag, c)');
function visit285_55_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['55'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['47'][1].init(38, 14, '!opts.fixByDtd');
function visit284_47_1(result) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].branchData['47'][1].ranCondition(result);
  return result;
}_$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[0]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[7]++;
  var dtd = require('../dtd');
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[8]++;
  var Tag = require('../nodes/tag');
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[9]++;
  var SpecialScanners = require('./special-scanners');
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[11]++;
  var wrapper = {
  li: 'ul', 
  dt: 'dl', 
  dd: 'dl'};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[28]++;
  var impliedEndTag = {
  'dd': {
  'dl': 1}, 
  'dt': {
  'dl': 1}, 
  'li': {
  'ul': 1, 
  'ol': 1}, 
  'option': {
  'select': 1}, 
  'optgroup': {
  'select': 1}};
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[44]++;
  function fixCloseTagByDtd(tag, opts) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[1]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[45]++;
    tag.closed = 1;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[47]++;
    if (visit284_47_1(!opts.fixByDtd)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[48]++;
      return 0;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[51]++;
    var valid = 1, childNodes = [].concat(tag.childNodes);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[54]++;
    S.each(childNodes, function(c) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[2]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[55]++;
  if (visit285_55_1(!canHasNodeAsChild(tag, c))) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[56]++;
    valid = 0;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[57]++;
    return false;
  }
});
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[61]++;
    if (visit286_61_1(valid)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[62]++;
      return 0;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[65]++;
    var holder = tag.clone(), prev = tag, recursives = [];
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[74]++;
    function closeCurrentHolder() {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[3]++;
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[75]++;
      if (visit287_75_1(holder.childNodes.length)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[77]++;
        holder.insertAfter(prev);
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[81]++;
        prev = holder;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[84]++;
        holder = tag.clone();
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[88]++;
    for (var i = 0; visit288_88_1(i < childNodes.length); i++) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[89]++;
      var c = childNodes[i];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[91]++;
      if (visit289_91_1(canHasNodeAsChild(holder, c))) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[92]++;
        holder.appendChild(c);
      } else {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[96]++;
        if (visit290_96_1(c.nodeType !== 1)) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[97]++;
          continue;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[100]++;
        var currentChildName = c.tagName;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[103]++;
        if (visit291_103_1(dtd.$listItem[currentChildName])) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[104]++;
          closeCurrentHolder();
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[105]++;
          var pTagName = wrapper[c.tagName], pTag = new Tag();
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[107]++;
          pTag.nodeName = pTag.tagName = pTagName;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[108]++;
          while (visit292_108_1(i < childNodes.length)) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[109]++;
            if (visit293_109_1(childNodes[i].tagName === currentChildName)) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[110]++;
              pTag.appendChild(childNodes[i]);
            } else {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[113]++;
              if (visit294_113_1(visit295_113_2(childNodes[i].nodeType === 3) && S.trim(childNodes[i].toHtml()))) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[114]++;
                break;
              }
            }
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[116]++;
            i++;
          }
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[118]++;
          pTag.insertAfter(prev);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[119]++;
          prev = pTag;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[120]++;
          i--;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[121]++;
          continue;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[127]++;
        closeCurrentHolder();
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[128]++;
        if (visit296_128_1(!c.equals(holder))) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[130]++;
          if (visit297_130_1(canHasNodeAsChild(c, holder))) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[131]++;
            holder = tag.clone();
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[133]++;
            S.each(c.childNodes, function(cc) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[4]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[134]++;
  holder.appendChild(cc);
});
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[136]++;
            c.empty();
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[137]++;
            c.insertAfter(prev);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[138]++;
            prev = c;
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[139]++;
            c.appendChild(holder);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[141]++;
            recursives.push(holder);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[142]++;
            holder = tag.clone();
          } else {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[145]++;
            c.insertAfter(prev);
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[146]++;
            prev = c;
          }
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[149]++;
          c.insertAfter(prev);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[150]++;
          prev = c;
        }
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[158]++;
    if (visit298_158_1(holder.childNodes.length)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[159]++;
      holder.insertAfter(prev);
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[163]++;
    tag.parentNode.removeChild(tag);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[170]++;
    S.each(recursives, function(r) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[5]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[171]++;
  fixCloseTagByDtd(r, opts);
});
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[174]++;
    return 1;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[181]++;
  function canHasNodeAsChild(tag, node) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[6]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[183]++;
    if (visit299_183_1(tag.nodeType === 9)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[184]++;
      return 1;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[186]++;
    if (visit300_186_1(!dtd[tag.tagName])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[187]++;
      S.error('dtd[' + tag.tagName + '] === undefined!');
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[189]++;
    if (visit301_189_1(node.nodeType === 8)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[190]++;
      return 1;
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[192]++;
    var nodeName = visit302_192_1(node.tagName || node.nodeName);
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[193]++;
    return !!dtd[tag.tagName][nodeName];
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[196]++;
  return {
  scan: function(tag, lexer, opts) {
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[7]++;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[199]++;
  function closeStackOpenTag(end, from) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[8]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[200]++;
    for (i = end; visit303_200_1(i > from); i--) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[201]++;
      var currentStackItem = stack[i], preStackItem = stack[i - 1];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[203]++;
      preStackItem.appendChild(currentStackItem);
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[204]++;
      fixCloseTagByDtd(currentStackItem, opts);
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[206]++;
    tag = stack[from];
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[207]++;
    stack.length = from;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[212]++;
  function processImpliedEndTag(node) {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].functionData[9]++;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[213]++;
    var needFix = 0, endParentTagName;
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[216]++;
    if ((endParentTagName = impliedEndTag[node.tagName])) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[217]++;
      var from = stack.length - 1, parent = stack[from];
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[221]++;
      while (visit304_221_1(parent && !(parent.tagName in endParentTagName))) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[223]++;
        if (visit305_223_1(parent.tagName === node.tagName)) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[224]++;
          needFix = 1;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[225]++;
          break;
        }
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[227]++;
        from--;
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[228]++;
        parent = stack[from];
      }
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[230]++;
      if (visit306_230_1(needFix)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[231]++;
        closeStackOpenTag(stack.length - 1, from - 1);
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[234]++;
    return needFix;
  }
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[237]++;
  var node, i, stack;
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[242]++;
  stack = opts.stack = visit307_242_1(opts.stack || []);
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[243]++;
  do {
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[244]++;
    node = lexer.nextNode();
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[245]++;
    if (visit308_245_1(node)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[246]++;
      if (visit309_246_1(node.nodeType === 1)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[248]++;
        if (visit310_248_1(node.isEndTag() && visit311_249_1(node.tagName === tag.tagName))) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[250]++;
          node = null;
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[251]++;
          if (visit312_251_1(!node.isEndTag())) {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[253]++;
            if (visit313_253_1(SpecialScanners[node.tagName])) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[255]++;
              SpecialScanners[node.tagName].scan(node, lexer, opts);
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[256]++;
              tag.appendChild(node);
            } else {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[259]++;
              if (visit314_259_1(node.isSelfClosed)) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[260]++;
                tag.appendChild(node);
              } else {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[268]++;
                stack.push(tag);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[272]++;
                if (visit315_272_1(processImpliedEndTag(node))) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[273]++;
                  stack.push(tag);
                }
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[275]++;
                tag = node;
              }
            }
          } else {
            _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[278]++;
            if (visit316_278_1(node.isEndTag())) {
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[294]++;
              var index = -1;
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[295]++;
              for (i = stack.length - 1; visit317_295_1(i >= 0); i--) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[296]++;
                var c = stack[i];
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[297]++;
                if (visit318_297_1(c.tagName === node.tagName)) {
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[298]++;
                  index = i;
                  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[299]++;
                  break;
                }
              }
              _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[303]++;
              if (visit319_303_1(index !== -1)) {
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[306]++;
                stack[stack.length - 1].appendChild(tag);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[307]++;
                fixCloseTagByDtd(tag, opts);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[308]++;
                closeStackOpenTag(stack.length - 1, index);
                _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[309]++;
                node = null;
              }
            }
          }
        }
      } else {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[314]++;
        tag.appendChild(node);
      }
    }
    _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[319]++;
    if (visit320_319_1(node === null)) {
      _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[320]++;
      if (visit321_320_1(stack.length > 0)) {
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[321]++;
        node = stack[stack.length - 1];
        _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[323]++;
        if (visit322_323_1(!SpecialScanners[node.tagName])) {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[324]++;
          stack.length = stack.length - 1;
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[325]++;
          node.appendChild(tag);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[327]++;
          fixCloseTagByDtd(tag, opts);
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[328]++;
          tag = node;
        } else {
          _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[330]++;
          node = null;
        }
      }
    }
  } while (node);
  _$jscoverage['/html-parser/scanners/tag-scanner.js'].lineData[337]++;
  fixCloseTagByDtd(tag, opts);
}};
});
