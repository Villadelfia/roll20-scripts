// TODO:
//  - Add support for "Advantage" and "Disadvantage" for the !vs command.

// Globals, utility functions. {{{
var titleStyleR = "font-family: Georgia; font-size: large; font-weight: normal"+
    "; text-align: center; vertical-align: middle; padding: 5px 0px; margin-to"+
    "p: 0.2em; border: 1px solid #000; border-radius: 5px 5px 0px 0px; color"+
    ": #FFF; background: #400; border-bottom-width: 0px;";
var titleStyleG = "font-family: Georgia; font-size: large; font-weight: normal"+
    "; text-align: center; vertical-align: middle; padding: 5px 0px; margin-to"+
    "p: 0.2em; border: 1px solid #000; border-radius: 5px 5px 0px 0px; color"+
    ": #FFF; background: #040; border-bottom-width: 0px;";
var titleStyleB = "font-family: Georgia; font-size: large; font-weight: normal"+
    "; text-align: center; vertical-align: middle; padding: 5px 0px; margin-to"+
    "p: 0.2em; border: 1px solid #000; border-radius: 5px 5px 0px 0px; color"+
    ": #FFF; background: #004; border-bottom-width: 0px;";
var rowStyle = " padding: 5px; border-left: 1px solid #000; border-right: 1px "+
    "solid #000; border-radius: 0px; ";
var lastRowStyle = " padding: 5px; border-left: 1px solid #000; border-bottom:"+
    " 1px solid #000; border-right: 1px solid #000; border-radius: 0px 0px 5p"+
    "x 5px; ";
var oddRow = " background-color: #000; color: #FFF;";
var evenRow = " background-color: #222; color: #FFF;";
var titleTagR = "<div style =\"" + titleStyleR + "\">";
var titleTagG = "<div style =\"" + titleStyleG + "\">";
var titleTagB = "<div style =\"" + titleStyleB + "\">";
var oddTag = "<div style =\"" + rowStyle + oddRow + "\">";
var evenTag = "<div style =\"" + rowStyle + evenRow + "\">";
var lastOddTag = "<div style =\"" + lastRowStyle + oddRow + "\">";
var lastEvenTag = "<div style =\"" + lastRowStyle + evenRow + "\">";
var endTag = "<div style=\"clear: both\"></div></div>";
var sendNextMessageToGm = false;
var sendNextMessageToGmAndPlayer = false;

String.prototype.contains = function(str, startIndex) {
    return ''.indexOf.call(this, str, startIndex) !== -1;
};
String.prototype.startsWith = function(str) {
    return this.slice(0, str.length) == str;
};
String.prototype.endsWith = function(str) {
    return this.slice(-str.length) == str;
};

var sendFormatted = function(message, msg) {
    var toGm = sendNextMessageToGm;
    var toGmAndPlayer = sendNextMessageToGmAndPlayer;
    sendNextMessageToGm = false;
    sendNextMessageToGmAndPlayer = false;

    var msgcontent = message;
    var sender = msg.who.split(" ")[0];

    // Filter styling.
    msgcontent = msgcontent.replace(new RegExp(/(__B__)(.*?)(__EB__)/ig), "<b>$2</b>");
    msgcontent = msgcontent.replace(new RegExp(/(__C__)(.*?)(__EC__)/ig),
        "<div style=\"text-align: center;\">$2</div>");
    msgcontent = msgcontent.replace(new RegExp(/(__J__)(.*?)(__EJ__)/ig),
        "<div style=\"text-align: justify; text-justify: inter-word\">$2</div>");
    msgcontent = msgcontent.replace(new RegExp(/(__R__)(.*?)(__ER__)/ig),
        "<div style=\"float: right; clear: both\">$2</div>");
    //<div style=\"clear: both; float: right\"></div>
    msgcontent = msgcontent.replace(new RegExp(/(__I__)(.*?)(__EI__)/ig), "<i>$2</i>");
    msgcontent = msgcontent.replace(new RegExp(/(__S__)(.*?)(__ES__)/ig),
        "<span style=\"font-size: small; opacity: 0.6\">$2</span>");
    msgcontent = msgcontent.replace(new RegExp(/(__H__)(.*?)(;)(.*?)(__EH__)/ig),
            "<span class=\"inlinerollresult showtip tipsy-n\" style=\"background-color: rgb(254, 246, 142); border: 2px s" +
            "olid rgb(254, 246, 142); padding: 0 3px 0 3px; font-weight: bold; color: #000; cursor: help; font-size: 1.1e" +
            "m\" title=\"$4\">$2</span>");
    msgcontent = msgcontent.replace(new RegExp(/(__U__)(.*?)(__EU__)/ig), "<u>$2</u>");
    msgcontent = msgcontent.replace(new RegExp(/__NAME__/ig), msg.who);
    msgcontent = msgcontent.replace(new RegExp(/__BR__/ig), "<br/>");
    msgcontent = msgcontent.replace(new RegExp(/\\n/ig), "<br/>");
    msgcontent = msgcontent.replace(new RegExp(/^{{/ig), "");
    msgcontent = msgcontent.replace(new RegExp(/}}$/ig), "");
    msgcontent = msgcontent.replace(new RegExp(/}}\s*?{{/ig), "|||");
    msgcontent = msgcontent.replace(new RegExp(/(\[\[.*?\]\])/ig), "<span style=\"color: #000;\">$&</span>");
    var messagercv = msgcontent.split("|||");
    if(messagercv.length < 2) return;

    // Default styling.
    var default_styles = new Array();
    //                           title bg   title fg   odd bg     odd fg     even bg    even fg
    default_styles["clavis"] = ["#8E6918", "#FFFFFF", "#B58E3A", "#FFFFFF", "#DAB564", "#FFFFFF"];
    default_styles["elmyra"] = ["#931100", "#FFFFFF", "#BB220E", "#FFFFFF", "#E63B25", "#FFFFFF"];
    default_styles["kurin"]  = ["#1F4472", "#FFFFFF", "#355988", "#FFFFFF", "#50739F", "#FFFFFF"];
    default_styles["lilith"] = ["#9B1E1E", "#FFFFFF", "#BD3F3F", "#FFFFFF", "#E36A6A", "#FFFFFF"];
    default_styles["shenzi"] = ["#06431B", "#FFFFFF", "#1A6232", "#FFFFFF", "#307A49", "#FFFFFF"];
    default_styles["fidget"] = ["#06431B", "#FFFFFF", "#1A6232", "#FFFFFF", "#307A49", "#FFFFFF"];
    var default_style = default_styles[msg.who.split(' ')[0].toLowerCase()];


    // Title styling.
    var ctr = 0;
    var changed = 1;
    var title = titleTagB;
    if(messagercv[0] == "R") {
        changed = 0;
        title = titleTagR;
        ++ctr;
    } else if(messagercv[0] == "G") {
        changed = 0;
        title = titleTagG;
        ++ctr;
    } else if(messagercv[0] == "B") {
        changed = 0;
        title = titleTagB;
        ++ctr;
    } else if(messagercv[0].contains("#")) {
        changed = 0;
        var titleStyle = messagercv[0].split(";");
        var newTitleTag = titleTagB;
        if(titleStyle.length < 2) {
            newTitleTag = newTitleTag.replace("#004", messagercv[0]);
        } else {
            newTitleTag = newTitleTag.replace("#004", titleStyle[0]);
            newTitleTag = newTitleTag.replace("#FFF", titleStyle[1]);
        }
        title = newTitleTag;
        ++ctr;
    } else if(typeof default_style != 'undefined') {
        newTitleTag = titleTagB;
        newTitleTag = newTitleTag.replace("#004", default_style[0]);
        newTitleTag = newTitleTag.replace("#FFF", default_style[1]);
        title = newTitleTag;
    }

    message = "";
    message = message + title + messagercv[ctr] + endTag;
    ++ctr;

    // Conditional blocks.
    var condctr = ctr;
    while(condctr < messagercv.length) {
        var condition = messagercv[condctr].match(new RegExp("\\(\\((.+?)\\)\\)", "ig"));
        messagercv[condctr] = messagercv[condctr].replace(new RegExp("\\(\\((.+?)\\)\\)", "ig"), "");
        if(condition && condition.length != 0) {
            condition = condition[0].substring(2, condition[0].length - 2).trim();

            // condition now holds the condition to show or not show the segment.
            var elements = condition.split(new RegExp("\\s+?", "ig"));
            if(elements.length == 3) {
                var l = parseInt(elements[0]);
                var r = parseInt(elements[2]);
                if(isNaN(l) || isNaN(r)) continue;
                var deleted = false;
                switch(elements[1]) {
                    case ">":
                    case "gt":
                    case "GT":
                        if(l <= r) {
                            messagercv.splice(condctr, 1);
                            deleted = true;
                        }
                        break;
                    case ">=":
                    case "ge":
                    case "GE":
                        if(l < r) {
                            messagercv.splice(condctr, 1);
                            deleted = true;
                        }
                        break;
                    case "<":
                    case "lt":
                    case "LT":
                        if(l >= r) {
                            messagercv.splice(condctr, 1);
                            deleted = true;
                        }
                        break;
                    case "<=":
                    case "le":
                    case "LE":
                        if(l > r) {
                            messagercv.splice(condctr, 1);
                            deleted = true;
                        }
                        break;
                    case "=":
                    case "==":
                    case "e":
                    case "E":
                    case "eq":
                    case "EQ":
                        if(l != r) {
                            messagercv.splice(condctr, 1);
                            deleted = true;
                        }
                        break;
                    case "!=":
                    case "=/=":
                    case "ne":
                    case "NE":
                    case "neq":
                    case "NEQ":
                        if(l == r) {
                            messagercv.splice(condctr, 1);
                            deleted = true;
                        }
                        break;
                    default:
                        break;
                }
                if(deleted == true)
                    continue;
            }
        }
        condctr++;
    }

    var atLeastOneBlock = false;
    // Forming the message.
    while(ctr < messagercv.length) {
        var last = ctr == messagercv.length - 1;
        var tag = "";
        if(last) {
            tag = (ctr % 2 == changed ? lastOddTag : lastEvenTag);
        } else {
            tag = (ctr % 2 == changed ? oddTag : evenTag);
        }

        // Row styling.
        var rowstyle = messagercv[ctr].match(/#[0-9A-F]{6}/ig);
        messagercv[ctr] = messagercv[ctr].replace(/#[0-9A-F]{6}/ig, "");
        if(rowstyle && rowstyle.length != 0) {
            // Background.
            tag = tag.replace("background-color: #000;", "background-color: " + rowstyle[0] + ";");
            tag = tag.replace("background-color: #222;", "background-color: " + rowstyle[0] + ";");
        }

        if(rowstyle && rowstyle.length > 1) {
            // Foreground.
            tag = tag.replace("; color: #FFF", "; color: " + rowstyle[1]);
        }

        if((!rowstyle || rowstyle.length == 0) && typeof default_style != 'undefined') {
            if(ctr % 2 == changed) { // Odd
                tag = tag.replace("background-color: #000;", "background-color: " + default_style[2] + ";");
                tag = tag.replace("background-color: #222;", "background-color: " + default_style[2] + ";");
                tag = tag.replace("; color: #FFF", "; color: " + default_style[3]);
            } else { // Even
                tag = tag.replace("background-color: #000;", "background-color: " + default_style[4] + ";");
                tag = tag.replace("background-color: #222;", "background-color: " + default_style[4] + ";");
                tag = tag.replace("; color: #FFF", "; color: " + default_style[5]);
            }
        }

        message = message + tag + messagercv[ctr] + endTag;
        atLeastOneBlock = true;
        ++ctr;
    }

    if(!atLeastOneBlock) return;

    if(toGm) {
        sendChat(msg.who, "/w gm " + message);
    } else if(toGmAndPlayer) {
        sendChat(msg.who, "/w gm " + message);
        sendChat(msg.who, "/w " + sender + " " + message);
    } else {
        sendChat(msg.who, message);
    }
};

var sendError = function(error, source) {
    sendFormatted('R|||Error|||' + error, {who: source});
};
// }}}

// IsGM module {{{
var IsGMModule = IsGMModule || {
    version: 0.6,
    active: true,
    reset_password: "reset",

    CheckInstall: function() {
        var players = findObjs({_type:"player"});

        if( ! _.has(state,'IsGM') || ! _.has(state.IsGM,'version') ||
            state.IsGM.version != IsGMModule.version ) {
            state.IsGM={
                version: IsGMModule.version,
                gms: [],
                players: [],
                unknown: []
            };
        }
        state.IsGM.unknown=_.difference(
            _.pluck(players,'id'),
            state.IsGM.gms,
            state.IsGM.players
        );
        IsGMModule.active = (state.IsGM.unknown.length>0);
    },
    IsGM: function(id) {
        return _.contains(state.IsGM.gms,id);
    },
    HandleMessages: function(msg) {
        if(msg.type != "api") {
            if(IsGMModule.active && msg.playerid != 'API') {
                if(_.contains(state.IsGM.unknown, msg.playerid)) {
                    var player=getObj('player',msg.playerid);
                    if("" == player.get('speakingas') || 'player|'+msg.playerid
                        == player.get('speakingas')) {
                        if(msg.who == player.get('_displayname')) {
                            state.IsGM.players.push(msg.playerid);
                        } else {
                            state.IsGM.gms.push(msg.playerid);
                            sendChat('IsGM','/w gm '+player.get('_displayname')+
                                ' is now flagged as a GM.')
                        }
                        state.IsGM.unknown=
                            _.without(state.IsGM.unknown,msg.playerid);
                        IsGMModule.active = (state.IsGM.unknown.length>0);
                    }
                }
            }
        } else {
            var tokenized = msg.content.split(" ");
            var command = tokenized[0];
            switch(command) {
                case '!reset-isgm':
                    if(isGM(msg.playerid) || (tokenized.length>1 && tokenized[1]
                        == IsGMModule.reset_password)) {
                        delete state.IsGM;
                        IsGMModule.CheckInstall();
                        sendChat('IsGM','/w gm IsGM data reset.');
                    } else {
                        var who=getObj('player',msg.playerid).get('_displaynam'+
                            'e').split(' ')[0];
                        sendChat('IsGM','/w '+who+' ('+who+
                            ')Only GMs may reset the IsGM data.If you '+
                            'are a GM you can reset by specifying the rese'+
                            't password from the top of the IsGM script as'+
                            ' an argument to !reset-isgm')
                    }
                    break;
            }
        }
    },
    RegisterEventHandlers: function(){
        on('chat:message',IsGMModule.HandleMessages);
    },

};
on('ready',function(){
    IsGMModule.CheckInstall();
    IsGMModule.RegisterEventHandlers();
});
var isGM = isGM || function(id) {
    return IsGMModule.IsGM(id);
};
// }}}

// Turn tracker {{{
// Implements the commands:
//   !togglelayer
//     - Toggles the layer of the selected tokens between the GM layer and the
//       Token layer.
//   !order
//     - Reorders the current turn tracker.
//   !eot
//     - Ends the current turn, rotate shifts the turn tracker up.
//   !init
//     - Rolls initiative for all visible tokens (Init modifier is looked up by
//       either the "initiative" attribute or
//       the value of Bar 3.
//   !clear
//     - Clears the turn order.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    msg = _.clone(msg);

    var togglelayer = function() {
        _.each(msg.selected, function(selected) {
            var obj = getObj("graphic", selected._id);
            if(typeof obj == "undefined") return;
            if(obj.get("_subtype") != "token") return;

            if(obj.get("layer") == "objects") {
                obj.set("layer", "gmlayer");
                return;
            }

            if(obj.get("layer") == "gmlayer") {
                obj.set("layer", "objects");
            }
        });
    };

    var nextTurn = function() {
        var turnorder;
        if(Campaign().get("turnorder") == "") turnorder = ""; else turnorder =
            JSON.parse(Campaign().get("turnorder"));

        if(turnorder == "")
            return;

        var item = turnorder.shift();
        if(typeof item.custom == 'string' && item.custom.indexOf("---") !== -1) {
            sendChat("", "/desc " + item.custom);
            item.custom = item.custom.replace(/(\d+)/, function(fullMatch, n) {
                return String(Number(n) + 1);
            });
            turnorder.push(item);
        } else {
            // Check for markers and decrement them.
            var token = getObj("graphic", item.id);
            var value = "";

            if(typeof token != "undefined" && typeof token.get("status_red") == "string") {
                value = parseInt(token.get("status_red"));
                --value;
                if(value == 0) {
                    token.set("status_red", false);
                } else {
                    token.set("status_red", value.toString());
                }
            }

            if(typeof token != "undefined" && typeof token.get("status_blue") == "string") {
                value = parseInt(token.get("status_blue"));
                --value;
                if(value == 0) {
                    token.set("status_blue", false);
                } else {
                    token.set("status_blue", value.toString());
                }
            }

            if(typeof token != "undefined" && typeof token.get("status_green") == "string") {
                value = parseInt(token.get("status_green"));
                --value;
                if(value == 0) {
                    token.set("status_green", false);
                } else {
                    token.set("status_green", value.toString());
                }
            }

            turnorder.push(item);
        }

        Campaign().set("turnorder", JSON.stringify(turnorder));
    };

    var reorder = function() {
        var turnorder;
        if(Campaign().get("turnorder") == "")
            turnorder = []; else
            turnorder = JSON.parse(Campaign().get("turnorder"));

        turnorder.sort(function(a, b) {
            if(parseFloat(b.pr) == parseFloat(a.pr)) {
                if(a.custom != "" && b.custom != "")
                    return parseFloat(b.custom) - parseFloat(a.custom); else
                    return 0;
            } else {
                return parseFloat(b.pr) - parseFloat(a.pr);
            }
        });

        Campaign().set("turnorder", JSON.stringify(turnorder));
    };

    var clear = function() {
        var turnorder = [];
        Campaign().set("turnorder", JSON.stringify(turnorder));
        Campaign().set("initiativepage", false);
        sendChat("", "/desc <b>Combat ends.</b>");
    };

    var init = function() {
        sendChat("", "/desc <b>Combat begins!</b>");
        Campaign().set("initiativepage", false);

        var currentPageGraphics = findObjs({
            _pageid:  Campaign().get("playerpageid"),
            _type:    "graphic",
            _subtype: "token",
            _layer:   "objects",
        });

        var turnorder = [];

        _.each(currentPageGraphics, function(obj) {
            var currId = obj.get("represents") || "";
            var currChar = getObj("character", currId) || "";

            var objId = obj.get("_id");
            var currentModifier = 0;
            var totalValue = 0;
            var diceRoll = randomInteger(20);

            var addToInitiative = true;

            // If the current token represents a character.
            if(currChar.length != 0) {
                // Set the modifier.
                var mod = findObjs({
                    name:         "initiative",
                    _characterid: currId,
                }, {caseInsensitive: true});
                if(mod.length != 0) {
                    currentModifier = parseInt(mod[0].get("current"));
                    if(isNaN(currentModifier)) currentModifier = 0;
                }

                // Set the roll result and give feedback.
                totalValue = diceRoll + currentModifier;
                var printableModifier = (currentModifier >= 0 ? "+" +
                    currentModifier : currentModifier);
                sendChat("character|" + currId, "/me rolls " + totalValue +
                    " (1d20(" + diceRoll + ")" + printableModifier +
                    ") for initiative!");
                // For NPC tokens.
            } else {
                // Set the modifier.
                currentModifier = obj.get("bar3_value") || "";
                currentModifier = parseInt(currentModifier);
                if(isNaN(currentModifier)) {
                    currentModifier = 0;
                    addToInitiative = false;
                }

                // Set the roll result.
                totalValue = diceRoll + currentModifier;
            }

            // Push the value.
            if(addToInitiative) {
                turnorder.push({
                    id:     objId,
                    pr:     totalValue,
                    custom: currentModifier,
                });
            }
        });

        turnorder.push({
            id:     "-1",
            pr:     "-999",
            custom: "--- ROUND 2 ---",
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
        reorder();
        Campaign().set("initiativepage", Campaign().get("playerpageid"));
        sendChat("", "/desc --- ROUND 1 ---");
    };

    if(msg.content.startsWith("!order") && msg.who.contains("(GM)")) {
        reorder();
        return;
    }

    if(msg.content == "!eot") {
        nextTurn();
        return;
    }

    if(msg.content == "!init" && msg.who.contains("(GM)")) {
        init();
        return;
    }

    if(msg.content == "!clear" && msg.who.contains("(GM)")) {
        clear();
        return;
    }

    if(msg.content == "!togglelayer" && msg.who.contains("(GM)")) {
        togglelayer();
    }
});
// }}}

// Template manager {{{
// Implements the commands:
//   !t
//   !template
//     - Allows a player to summon a template token, they must exist somewhere
//       obviously.
//     - The token gets placed on the first selected token, if any, or in the
//       top right of the map.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    msg = _.clone(msg);
    var sender = msg.who.split(" ")[0];

    if(msg.content == "!t" || msg.content == "!template") {
        sendChat("Template Spawner", "/w " + sender +
            " Usage:<br/>!t [15|30|60] cone<br/>!t [5|10|15|20|30|40] burst");
        return;
    }

    if(msg.content.startsWith("!t ") || msg.content.startsWith("!template ")) {
        // Get master template tokens.
        var cone_15 = findObjs({
            _type: "graphic",
            name:  "cone_15_template_master",
        })[0];
        var cone_15_ortho = findObjs({
            _type: "graphic",
            name:  "cone_15_ortho_template_master",
        })[0];
        var cone_30 = findObjs({
            _type: "graphic",
            name:  "cone_30_template_master",
        })[0];
        var cone_30_ortho = findObjs({
            _type: "graphic",
            name:  "cone_30_ortho_template_master",
        })[0];
        var cone_60 = findObjs({
            _type: "graphic",
            name:  "cone_60_template_master",
        })[0];
        var cone_60_ortho = findObjs({
            _type: "graphic",
            name:  "cone_60_ortho_template_master",
        })[0];
        var burst_5 = findObjs({
            _type: "graphic",
            name:  "burst_5_template_master",
        })[0];
        var burst_10 = findObjs({
            _type: "graphic",
            name:  "burst_10_template_master",
        })[0];
        var burst_15 = findObjs({
            _type: "graphic",
            name:  "burst_15_template_master",
        })[0];
        var burst_20 = findObjs({
            _type: "graphic",
            name:  "burst_20_template_master",
        })[0];
        var burst_30 = findObjs({
            _type: "graphic",
            name:  "burst_30_template_master",
        })[0];
        var burst_40 = findObjs({
            _type: "graphic",
            name:  "burst_40_template_master",
        })[0];

        // Check if all are found...
        //log(cone_15);
        //log(cone_15_ortho);
        //log(cone_30);
        //log(cone_30_ortho);
        //log(cone_60);
        //log(cone_60_ortho);
        //log(burst_5);
        //log(burst_10);
        //log(burst_15);
        //log(burst_20);
        //log(burst_30);
        //log(burst_40);

        var x = 280;
        var y = 280;
        var selected = msg.selected || "";
        if(selected.length != 0 && selected[0]._type == "graphic") {
            var obj = getObj(selected[0]._type, selected[0]._id);
            x = obj.get("left");
            y = obj.get("top");
        }

        var created1 = "";
        var created2 = "";
        //parse input string, cone or burst?
        if(msg.content.indexOf("cone") !== -1) {
            // 15, 30 or 60?
            if(msg.content.indexOf("15") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 15ft. cones.");
                created1 = createObj("graphic", {
                    name:             "Template: 15ft ortho cone",
                    subtype:          "token",
                    imgsrc:           cone_15_ortho.get("imgsrc"),
                    width:            cone_15_ortho.get("width"),
                    height:           cone_15_ortho.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     cone_15_ortho.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
                created2 = createObj("graphic", {
                    name:             "Template: 15ft cone",
                    subtype:          "token",
                    imgsrc:           cone_15.get("imgsrc"),
                    width:            cone_15.get("width"),
                    height:           cone_15.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     cone_15.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("30") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 30ft. cones.");
                created1 = createObj("graphic", {
                    name:             "Template: 30ft ortho cone",
                    subtype:          "token",
                    imgsrc:           cone_30_ortho.get("imgsrc"),
                    width:            cone_30_ortho.get("width"),
                    height:           cone_30_ortho.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     cone_30_ortho.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
                created2 = createObj("graphic", {
                    name:             "Template: 30ft cone",
                    subtype:          "token",
                    imgsrc:           cone_30.get("imgsrc"),
                    width:            cone_30.get("width"),
                    height:           cone_30.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     cone_30.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("60") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 60ft. cones.");
                created1 = createObj("graphic", {
                    name:             "Template: 60ft ortho cone",
                    subtype:          "token",
                    imgsrc:           cone_60_ortho.get("imgsrc"),
                    width:            cone_60_ortho.get("width"),
                    height:           cone_60_ortho.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     cone_60_ortho.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
                created2 = createObj("graphic", {
                    name:             "Template: 60ft cone",
                    subtype:          "token",
                    imgsrc:           cone_60.get("imgsrc"),
                    width:            cone_60.get("width"),
                    height:           cone_60.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     cone_60.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else {
                sendChat("Template Spawner", "/w " + sender +
                    " No cone available in that size.");
            }
        } else if(msg.content.indexOf("burst") !== -1) {
            // 5, 10 or 20?
            if(msg.content.indexOf(" 5") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 5ft. burst.");
                created1 = createObj("graphic", {
                    name:             "Template: 5ft burst",
                    subtype:          "token",
                    imgsrc:           burst_5.get("imgsrc"),
                    width:            burst_5.get("width"),
                    height:           burst_5.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     burst_5.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf(" 10") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 10ft. burst.");
                created1 = createObj("graphic", {
                    name:             "Template: 10ft burst",
                    subtype:          "token",
                    imgsrc:           burst_10.get("imgsrc"),
                    width:            burst_10.get("width"),
                    height:           burst_10.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     burst_10.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf(" 15") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 15ft. burst.");
                created1 = createObj("graphic", {
                    name:             "Template: 15ft burst",
                    subtype:          "token",
                    imgsrc:           burst_15.get("imgsrc"),
                    width:            burst_15.get("width"),
                    height:           burst_15.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     burst_15.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("20") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 20ft. burst.");
                created1 = createObj("graphic", {
                    name:             "Template: 20ft burst",
                    subtype:          "token",
                    imgsrc:           burst_20.get("imgsrc"),
                    width:            burst_20.get("width"),
                    height:           burst_20.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     burst_20.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("30") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 30ft. burst.");
                created1 = createObj("graphic", {
                    name:             "Template: 30ft burst",
                    subtype:          "token",
                    imgsrc:           burst_30.get("imgsrc"),
                    width:            burst_30.get("width"),
                    height:           burst_30.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     burst_30.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("40") !== -1) {
                sendChat("Template Spawner", "/w " + sender +
                    " Spawning 40ft. burst.");
                created1 = createObj("graphic", {
                    name:             "Template: 40ft burst",
                    subtype:          "token",
                    imgsrc:           burst_40.get("imgsrc"),
                    width:            burst_40.get("width"),
                    height:           burst_40.get("height"),
                    left:             x,
                    top:              y,
                    showname:         true,
                    showplayers_name: true,
                    layer:            "objects",
                    controlledby:     burst_40.get("controlledby"),
                    pageid:           Campaign().get("playerpageid"),
                });
            } else {
                sendChat("Template Spawner", "/w " + sender +
                    " No burst available in that size.");
            }
        } else {
            sendChat("Template Spawner",
                    "/w " + sender + " Usage:<br/>!t [15|30|60] cone<br/>!t [5"+
                    "|10|15|20|30|40] burst");
        }

        var outstring = "";
        if(created1 != "") {
            outstring += created1.get("_id") + " ";
        }
        if(created2 != "") {
            outstring += created2.get("_id");
        }
        if(outstring != "") {
            sendChat("Template Spawner", "/w " + sender + " Click [here](!del " + outstring + ") to delete templates.");
        }
    }
});
// }}}

// Card manager {{{
// Implements the commands:
//   !card
//     - Display an arbitrary message in a pretty display.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    msg = _.clone(msg);
    var message = "";
    var sender = msg.who.split(" ")[0];

    if(msg.content == "!card") {
        sendChat("Card", "/w " + sender + " Usage:<br/>!card|||[R|G|B]|||Title"+
            "|||Row 1|||Row 2|||Row 3...<br/>Several markup tags are available"+
            ", see the code.");
        return;
    }

    if(msg.content.startsWith("!card|||") || msg.content.startsWith("!card ") ) {
        var msgcontent = msg.content;

        if(msg.inlinerolls) {
            for(var i = 0; i < msg.inlinerolls.length; ++i) {
                msgcontent = msgcontent.replace("$[[" + i + "]]", "[[" +
                    msg.inlinerolls[i].expression + "]]");
            }
        }

        msgcontent = msgcontent.replace("!card|||", "");
        msgcontent = msgcontent.replace("!card ", "");
        msgcontent = msgcontent.trim();

        sendFormatted(msgcontent, msg);
        return;
    }

    if(msg.content.startsWith("!blindcard|||") ||
        msg.content.startsWith("!blindcard ") ) {
        var msgcontent = msg.content;

        if(msg.inlinerolls) {
            for(var i = 0; i < msg.inlinerolls.length; ++i) {
                msgcontent = msgcontent.replace("$[[" + i + "]]", "[[" +
                    msg.inlinerolls[i].expression + "]]");
            }
        }

        msgcontent = msgcontent.replace("!blindcard|||", "");
        msgcontent = msgcontent.replace("!blindcard ", "");
        msgcontent = msgcontent.trim();

        sendNextMessageToGm = true;
        sendFormatted(msgcontent, msg);
        return;
    }

    if(msg.content.startsWith("!gmcard|||") || msg.content.startsWith("!gmcard ") ) {
        var msgcontent = msg.content;

        if(msg.inlinerolls) {
            for(var i = 0; i < msg.inlinerolls.length; ++i) {
                msgcontent = msgcontent.replace("$[[" + i + "]]",
                        msg.inlinerolls[i].expression + " = [[" +
                        msg.inlinerolls[i].results.total + "]]");
            }
        }

        msgcontent = msgcontent.replace("!gmcard|||", "");
        msgcontent = msgcontent.replace("!gmcard ", "");
        msgcontent = msgcontent.trim();

        sendNextMessageToGmAndPlayer = true;
        sendFormatted(msgcontent, msg);
        return;
    }
});
// }}}

// Rollers {{{
// Implements the commands:
//   !blindroll
//     - Sends a roll to the GM, but does not reveal the result to the roller.
//   !vs
//     - Makes a roll versus a target value.
//   !monsterdamage
//     - Does damage against a player.
//   !a
//   !attack
//     - Rolls an attack in a pretty display.
//   !d
//   !damage
//     - Rolls attack damage in a pretty display.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    msg = _.clone(msg);
    var message;
    var roll;
    var args;
    var messagercv;

    if(msg.content.startsWith("!blindroll ")) {
        roll = msg.content.replace("!blindroll ", "").trim();
        var sender = msg.who.split(" ")[0];
        if(roll.length > 0) {
            while(roll.contains("++")) {
                roll = roll.replace("++", "+");
            }
            while(roll.contains("+-")) {
                roll = roll.replace("+-", "-");
            }

            sendFormatted("{{B}} {{Blind Skill Check\\n__S____NAME____ES__}} {{**Roll 1:** [[" + roll +
                "]]}} {{**Roll 2:** [[" + roll + "]]}} {{**Roll 3:** [[" + roll + "]]}}", msg);
            sendNextMessageToGm = true;
            sendFormatted("{{G}} {{Which die?}} {{Use result number " + randomInteger(3) + ".}}", msg);
        }
        return;
    }

    if(msg.content.startsWith("!vs ")) {
        if(msg.content.contains("|")) {
            sendChat("Error", "/w gm Select a player token.");
            return;
        }
        roll = msg.content.replace("!vs ", "").trim();
        args = roll.split(" ");
        if(args.length < 5) {
            sendChat("Error", "/w gm Not enough arguments.");
            return;
        }
        var diceRoll = randomInteger(20);
        var modifier = parseInt(args[0]);
        var critrange = parseInt(args[1]);
        var fudge = parseInt(args[2]);
        if(fudge > 0 && fudge <= 20)
            diceRoll = fudge;
        var target = parseInt(args[3]);
        var result = diceRoll + modifier;
        var descriptor = "";
        for(var i = 4; i < args.length; ++i)
            descriptor += args[i] + " ";

        if(diceRoll >= critrange) { // Crit
            sendFormatted("R|||Monster Attack|||I roll a [[" + result + "]] ([[" + diceRoll + "]] on the die) vs. " +
                descriptor + "([[" + target + "]])|||The attack crits.", msg);
        } else if(diceRoll == 1) { // Complete miss.
            sendFormatted("B|||Monster Attack|||I roll a [[" + result + "]] ([[" + diceRoll + "]] on the die) vs. " +
                descriptor + "([[" + target + "]])|||The attack misses completely.", msg);
        } else if(result >= target) { // Hit
            sendFormatted("R|||Monster Attack|||I roll a [[" + result + "]] ([[" + diceRoll + "]] on the die) vs. " +
                descriptor + "([[" + target + "]])|||The attack hits.", msg);
        } else { // Miss
            sendFormatted("G|||Monster Attack|||I roll a [[" + result + "]] ([[" + diceRoll + "]] on the die) vs. " +
                descriptor + "([[" + target + "]])|||The attack misses.", msg);
        }
        return;
    }

    if(msg.content.startsWith("!monsterdamage ")) {
        roll = msg.content.replace("!monsterdamage ", "").trim();
        args = roll.split(" ");
        var dice = args[0];

        var selected = msg.selected || "the target";
        if(selected.length != 0 && selected[0]._type == "graphic") {
            var obj = getObj(selected[0]._type, selected[0]._id);
            selected = obj.get("name");
        }

        message = "R|||Monster Damage|||The monster hits " + selected +
            " for [[" + dice + "]] damage.";
        sendFormatted(message, msg);
        return;
    }

    if(msg.content.startsWith("!a ") || msg.content.startsWith("!attack ")) {
        messagercv = msg.content.split(" ");
        if(messagercv.length < 2) return;
        roll = messagercv[1];
        while(roll.contains("++")) {
            roll = roll.replace("++", "+");
        }
        while(roll.contains("+-")) {
            roll = roll.replace("+-", "-");
        }

        message = "B|||To Hit Roll__BR____S____NAME____ES__|||I roll [[" +
            roll + "]] to hit.";
        sendFormatted(message, msg);
        return;
    }

    if(msg.content.startsWith("!d ") || msg.content.startsWith("!damage ")) {
        messagercv = msg.content.split(" ");
        if(messagercv.length < 2) return;
        roll = messagercv[1];

        message = "R|||Damage__BR____S____NAME____ES__|||I do [[" + roll +
            "]] points of damage.";
        sendFormatted(message, msg);
    }
});
// }}}

// Delete System {{{
// Implements the commands:
//   !del
//     - Deletes the objects with the given ids.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!del")) return;
    msg = _.clone(msg);
    var args;

    msg.content = msg.content.replace("!del ", "").trim();
    args = msg.content.split(' ');

    var obj;
    for(i = 0; i < args.length; ++i) {
        objs = findObjs({
            _id: args[i]
        });
        if(typeof objs !== "undefined")
            objs[0].remove();
    }
});
// }}}

// Torch functionality {{{
var Torch = Torch || (function() {
    'use strict';

    var version = 0.6,

        showHelp = function() {
            sendChat('', '/w gm <div style="border: 1px solid black; backgrou'+
                'nd-color: white; padding: 3px 3px;"><div style="font-weight:'+
                ' bold; border-bottom: 1px solid black;font-size: 130%;">Torc'+
                'h v'+version +'</div><div style="padding-left:10px;margin-bo'+
                'ttom:3px;"><p>Torch provides commands for managing dynamic l'+
                'ighting.  Supplying a first argument of <b>help</b> to any o'+
                'f the commands displays this help message, as will calling !'+
                'torch or !snuff with nothing supplied or selected.</p></div>'+
                '<b>Commands</b><div style="padding-left:10px;"><b><span styl'+
                'e="font-family: serif;">!torch [<Radius> [<Dim Start> [<All '+
                'Players>  [<Token ID> ... ]]]]</span></b><div style="padding'+
                '-left: 10px;padding-right:20px"><p>Sets the light for the se'+
                'lected/supplied tokens.  Only GMs can supply token ids to ad'+
                'just.</p><p><b>Note:</b> If you are using multiple @{target|'+
                'token_id} calls in a macro, and need to adjust light on fewe'+
                'r than the supplied number of arguments, simply select the s'+
                'ame token several times.  The duplicates will be removed.</p'+
                '><ul><li style="border-top: 1px solid #ccc;border-bottom: 1p'+
                'x solid #ccc;"><b><span style="font-family: serif;"><Radius>'+
                '</span></b> - The radius that the light extends to. (Default'+
                ': 40)</li> <li style="border-top: 1px solid #ccc;border-bott'+
                'om: 1px solid #ccc;"><b><span style="font-family: serif;"><D'+
                'im Start></span></b> - The radius at which the light begins '+
                'to dim. (Default: Half of Radius )</li> <li style="border-to'+
                'p: 1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span s'+
                'tyle="font-family: serif;"><All Players></span></b> - Should'+
                ' all players see the light, or only the controlling players '+
                '(Darkvision, etc). Specify one of <i>1, on, yes, true, sure,'+
                ' yup, or -</i> for yes, anything else for no.  (Default: yes'+
                ')</li> <li style="border-top: 1px solid #ccc;border-bottom: '+
                '1px solid #ccc;"><b><span style="font-family: serif;"><Token'+
                ' ID></span></b> - A Token ID, usually supplied with somethin'+
                'g like @{target|Target 1|token_id}.</li> </ul></div><b><span'+
                ' style="font-family: serif;">!snuff [<Token ID> ... ]</span>'+
                '</b><div style="padding-left: 10px;padding-right:20px"><p>Tu'+
                'rns off light for the selected/supplied tokens. Only GMs can'+
                ' supply token ids to adjust.</p><p><b>Note:</b> If you are u'+
                'sing multiple @{target|token_id} calls in a macro, and need '+
                'to adjust light on fewer than the supplied number of argumen'+
                'ts, simply select the same token several times.  The duplica'+
                'tes will be removed.</p><ul><li style="border-top: 1px solid'+
                '#ccc;border-bottom: 1px solid #ccc;"><b><span style="font-fa'+
                'mily: serif;"><Token ID></span></b> - A Token ID, usually su'+
                'pplied with something like @{target|Target 1|token_id}.</li>'+
                '</ul></div><b><span style="font-family: serif;">!daytime [<T'+
                'oken ID>]</span></b><div style="padding-left: 10px;padding-r'+
                'ight:20px"><p>Turns off dynamic lighting for the current pla'+
                'yer page, or the page of the selected/supplied token.</p><ul'+
                '><li style="border-top: 1px solid #ccc;border-bottom: 1px so'+
                'lid #ccc;"><b><span style="font-family: serif;"><Token ID></'+
                'span></b> - A Token ID, usually supplied with something like'+
                ' @{target|Target 1|token_id}.</li> </ul></div><b><span style'+
                '="font-family: serif;">!nighttime [<Token ID>]</span></b><di'+
                'v style="padding-left: 10px;padding-right:20px"><p>Turns on '+
                'dynamic lighting for the current player page, or the page of'+
                ' the selected/supplied token.</p><ul><li style="border-top: '+
                '1px solid #ccc;border-bottom: 1px solid #ccc;"><b><span styl'+
                'e="font-family: serif;"><Token ID></span></b> - A Token ID, '+
                'usually supplied with something like @{target|Target 1|token'+
                '_id}.</li> </ul></div></div></div>');
        },

        handleInput = function(msg) {
            var args, radius, dim_radius, other_players, page, obj;

            if (msg.type !== "api") {
                return;
            }

            args = msg.content.split(" ");
            switch(args[0]) {
                case '!torch':
                    if('help' === args[1] || ( !_.has(msg,'selected') &&
                        args.length < 5)) {
                        showHelp();
                        return;
                    }
                    radius = parseInt(args[1],10) || 40;
                    dim_radius = parseInt(args[2],10) || (radius/2);
                    other_players = _.contains([1,'1','on','yes','true','sure',
                                                'yup','-'], args[3] || 1 );

                    if(isGM(msg.playerid)) {
                        _.chain(args)
                            .rest(4)
                            .uniq()
                            .map(function(t){
                                return getObj('graphic',t);
                            })
                            .reject(_.isUndefined)
                            .each(function(t) {
                                t.set({
                                    light_radius: radius,
                                    light_dimradius: dim_radius,
                                    light_otherplayers: other_players
                                });
                            });
                    }

                    _.each(msg.selected,function (o) {
                        getObj(o._type,o._id).set({
                            light_radius: radius,
                            light_dimradius: dim_radius,
                            light_otherplayers: other_players
                        });
                    });
                    break;

                case '!snuff':
                    if('help' === args[1] || ( !_.has(msg,'selected') &&
                        args.length < 2)) {
                        showHelp();
                        return;
                    }

                    if(isGM(msg.playerid)) {
                        _.chain(args)
                            .rest(1)
                            .uniq()
                            .map(function(t){
                                return getObj('graphic',t);
                            })
                            .reject(_.isUndefined)
                            .each(function(t) {
                                t.set({
                                    light_radius: '',
                                    light_dimradius: '',
                                    light_otherplayers: false
                                });
                            });
                    }
                    _.each(msg.selected,function (o) {
                        getObj(o._type,o._id).set({
                            light_radius: '',
                            light_dimradius: '',
                            light_otherplayers: false
                        });
                    });
                    break;

                case '!daytime':
                    if('help' === args[1]) {
                        showHelp();
                        return;
                    }
                    if(isGM(msg.playerid)) {
                        if(msg.selected) {
                            obj=getObj('graphic', msg.selected[0]._id);
                        } else if(args[1]) {
                            obj=getObj('graphic', args[1]);
                        }
                        page = getObj('page', (obj && obj.get('pageid')) ||
                            Campaign().get('playerpageid'));

                        if(page) {
                            page.set({
                                showlighting: false
                            });
                            sendChat('','/w gm It is now <b>Daytime</b> on '+
                                page.get('name')+'!');
                        }
                    }
                    break;

                case '!nighttime':
                    if('help' === args[1]) {
                        showHelp();
                        return;
                    }
                    if(isGM(msg.playerid)) {
                        if(msg.selected) {
                            obj=getObj('graphic',msg.selected[0]._id);
                        } else if(args[1]) {
                            obj=getObj('graphic', args[1]);
                        }
                        page = getObj('page', (obj && obj.get('pageid')) ||
                            Campaign().get('playerpageid'));

                        if(page) {
                            page.set({
                                showlighting: true
                            });
                            sendChat('','/w gm It is now <b>Nighttime</b> on '+
                                page.get('name')+'!');
                        }
                    }
                    break;
            }

        },

        registerEventHandlers = function() {
            on('chat:message', handleInput);
        };

    return {
        RegisterEventHandlers: registerEventHandlers
    };
}());
on("ready",function(){
    'use strict';

    if("undefined" !== typeof isGM && _.isFunction(isGM)) {
        Torch.RegisterEventHandlers();
    } else {
        log('--------------------------------------------------------------');
        log('Torch requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }
});
// }}}

// Loot System {{{
// Implements the commands:
//   !loot
//     - Shows the current loot pile.
//   !loot clear
//     - Clears the current loot pile.
//   !loot add
//   !loot add money
//   !loot add json {"money": <number>, "items": [<string>, <string>, ...]}
//     - Adds loot.
//   !loot take
//   !loot take money
//     - Takes loot.
//   !loot help
//     - Prints help on the available commands.
//   !loot pack
//     - Packs the existing loot pile to reuse numbers.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!loot")) return;
    msg = _.clone(msg);
    var currency = "gp";
    var sender;
    var args;

    state.lootmoney = state.lootmoney || 0;
    state.lootpile = state.lootpile || [];

    var gmState = function(msg) {
        if(typeof isGM !== 'undefined' && _.isFunction(isGM)) {
            return isGM(msg.playerid);
        } else {
            return msg.who.contains('(GM)');
        }
    };

    var lootExport = function() {
        var exp = {};
        exp.money = state.lootmoney;
        exp.items = _.without(state.lootpile, '__NONE__');
        sendChat("Loot Pile", "/w gm Reimport the current loot pile with:<br /"+
            "><b>!loot add json " + JSON.stringify(exp) + "</b>");
    };

    var lootList = function(gmWhisper) {
        var message = "B|||Loot Pile|||";
        var empty = true;
        if(state.lootmoney == 0 && state.lootpile.length == 0) {
            message += "The loot pile is empty.";
        } else {
            if(state.lootmoney > 0) {
                message += "Money: " + state.lootmoney + " " + currency +
                    ".";
                empty = false;
            }

            var itemcount = 0;
            for(var i = 0; i < state.lootpile.length; ++i) {
                if(state.lootpile[i] !== "__NONE__") {
                    if(!empty && itemcount == 0)
                        message += "|||";
                    message += (i+1) + ": " + state.lootpile[i] + "__BR__";
                    itemcount++;
                    empty = false;
                }
            }

            if(itemcount == 0 && state.lootmoney == 0)
                message += "The loot pile is empty.";
        }
        if(gmWhisper) sendNextMessageToGm = true;
        sendFormatted(message, {who: "Loot Pile"});
        if(!empty && !gmWhisper)
            sendChat("Loot Pile", "/direct <i>To take X money:<br /><b>!loot t"+
                "ake money X</b><br />To take item number X:<br /><b>!loot"+
                " take X</b></i>");
    };

    var lootPack = function() {
        state.lootpile = _.without(state.lootpile, '__NONE__');
        sendChat('Loot Pile', '/w gm Remaining loot packed.');
    };

    var lootClear = function() {
        state.lootmoney = 0;
        state.lootpile = [];
        sendChat('Loot Pile', '/w gm Loot pile cleared.');
    };

    var lootAdd = function() {
        if(args.length < 2) return;
        if(args[1] == 'money') {
            if(args.length < 3) return;
            var money = parseFloat(args[2]);
            if(isNaN(money)) return;
            state.lootmoney += money;
            sendChat("Loot Pile", "/w gm Added " + money + " " + currency +
                " to loot pile.");
        } else if(args[1] == 'json') {
            if(args.length < 3) return;

            try {
                var json = JSON.parse(args.slice(2).join(' '));
            } catch(e) {
                sendChat("Loot Pile", "/w gm Error in JSON: " + e);
                return;
            }

            json.money = parseFloat(json.money);
            if(!isNaN(json.money))
                state.lootmoney += json.money;

            for(var i = 0; i < json.items.length; ++i) {
                state.lootpile.push(json.items[i]);
            }

            sendChat("Loot Pile", "/w gm Added items and/or money from JSON.");
        } else {
            state.lootpile.push(args.slice(1).join(' '));
            sendChat("Loot Pile", "/w gm Added " + args.slice(1).join(' ') +
                " to loot pile.");
        }
    };

    var lootTake = function() {
        if(args.length < 2) return;
        if(args[1] == 'money') {
            if(args.length < 3) return;
            var money = parseFloat(args[2]);
            if(isNaN(money)) return;
            if(money <= 0) return;
            if(money <= state.lootmoney) {
                state.lootmoney -= money;
                sendFormatted("G|||Money Taken|||" + sender + " took " +
                    money + " " + currency, {who: "Loot Pile"});
            } else {
                sendError("There's not enough money in the loot pile to take t"+
                    "hat much.", "Loot Pile");
            }
        } else {
            var id = parseInt(args[1]);
            if(isNaN(id)) return;
            if(id <= 0) return;
            if(id > state.lootpile.length)
                return sendError("That item id does not exist", "Loot Pile");
            if(state.lootpile[id-1] == '__NONE__') {
                sendError("Item has already been taken", "Loot Pile");
            } else {
                sendFormatted("G|||Loot Taken|||" + sender + " took " +
                    state.lootpile[id-1], {who: "Loot Pile"});
                state.lootpile[id-1] = '__NONE__';
            }
        }
    };

    if(msg.content == '!loot') {
        lootList(false);
    } else if(msg.content.startsWith("!loot")) {
        msg.content = msg.content.replace("!loot", "").trim();
        sender = msg.who.split(" ")[0];
        args = msg.content.split(' ');
        if(args.length == 0) return;
        switch(args[0]) {
            case 'add':
                if(gmState(msg)) lootAdd();
                break;
            case 'clear':
                if(gmState(msg)) lootClear();
                break;
            case 'take':
                lootTake();
                break;
            case 'pack':
                if(gmState(msg)) lootPack();
                break;
            case 'help':
                sendFormatted(
                        "B|||Loot Pile|||"+
                        "__I__Player Functions__EI__|||"+
                        "Get loot pile:__BR____B__!loot__EB__|||"+
                        "Take X money:__BR____B__!loot take money X__EB__|||"+
                        "Take item X:__BR____B__!loot take X__EB__|||"+
                        "__I__GM Functions__EI__|||"+
                        "Clear loot pile:__BR____B__!loot clear__EB__|||"+
                        "Add item to loot pile:__BR____B__!loot add item__EB__|||"+
                        "Add money to loot pile:__BR____B__!loot add money amount"+
                        "__EB__|||"+
                        "Add json specification to loot pile:__BR____B__!loot add"+
                        " json {\"money\": <number>, \"items\": [<string"+
                        ">, <string>, ...]}__EB__|||"+
                        "Pack remaining loot:__BR____B__!loot pack__EB__|||"+
                        "Export current loot pile as a json string:__BR____B__!loo"+
                        "t export__EB__|||"+
                        "Whisper current loot pile to gm:__BR____B__!loot gm__EB__",
                    {who: 'Loot Pile'});
                break;
            case 'gm':
                if(gmState(msg)) lootList(true);
                break;
            case 'export':
                if(gmState(msg)) lootExport();
        }
    }
});
// }}}

// Currency Exchange {{{
// Implements the commands:
//   !xe
//     - Prints info on usage
//   !xeset a equals x b
//     - Sets the exchange rate so that 1 a = x b. If x = 0, it means conversion
//       is not possible.
//   !xeconvert x a to b
//     - Converts x of currency a to currency b. It will try and find the
//       shortest path from a to b.
//   !xedelete x
//     - Deletes currency x, and all references to it. If this leaves a currency
//       without references, that currency will be deleted as well!
//   !xeexport
//   !xeimport JSON
//     - Export and import the state of the system.
//   !xereset
//     - Resets the entire currency system.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!xe")) return;
    msg = _.clone(msg);
    msg.content = msg.content.toLowerCase();
    var sender = msg.who.split(" ")[0];
    var args = msg.content.split(' ');

    state.xe = state.xe || {};

    var gmState = function(msg) {
        if(typeof isGM !== 'undefined' && _.isFunction(isGM)) {
            return isGM(msg.playerid);
        } else {
            return msg.who.contains('(GM)');
        }
    };

    var xeHelp = function() {
        sendFormatted(
                "B|||Currency Exchange|||"+
                "__I__Player Functions__EI__|||"+
                "Convert X of currency A to currency B:__BR____B__!xeconvert X"+
                " A to B__EB__|||"+
                "__I__GM Functions__EI__|||"+
                "Set exchange rate so that 1 A equals X B:__BR____B__!xeset A "+
                "equals X B__EB__|||"+
                "Delete currency X and all references to it, also deletes any "+
                "currencies that don't have any conversions due to this deleti"+
                "on:__BR____B__!xedelete X__EB__|||"+
                "Export the state of the system to JSON:__BR____B__!xeexport__"+
                "EB__|||"+
                "Import a JSON state:__BR____B__!xeimport JSON__EB__|||"+
                "Reset the system:__BR____B__!xereset__EB__",
            {who: 'XE'});
    };

    var shortestPath = function(edges, numVertices, startVertex) {
        var done = new Array(numVertices);
        done[startVertex] = true;
        var pathLengths = new Array(numVertices);
        var predecessors = new Array(numVertices);
        for (var i = 0; i < numVertices; i++) {
            pathLengths[i] = edges[startVertex][i];
            if(edges[startVertex][i] != Infinity) {
                predecessors[i] = startVertex;
            }
        }
        pathLengths[startVertex] = 0;
        for (var i = 0; i < numVertices - 1; i++) {
            var closest = -1;
            var closestDistance = Infinity;
            for (var j = 0; j < numVertices; j++) {
                if (!done[j] && pathLengths[j] < closestDistance) {
                    closestDistance = pathLengths[j];
                    closest = j;
                }
            }
            done[closest] = true;
            for (var j = 0; j < numVertices; j++) {
                if (!done[j] && edges[closest]) {
                    var possiblyCloserDistance = pathLengths[closest] +
                        edges[closest][j];
                    if (possiblyCloserDistance < pathLengths[j]) {
                        pathLengths[j] = possiblyCloserDistance;
                        predecessors[j] = closest;
                    }
                }
            }
        }
        return { "startVertex": startVertex,
            "pathLengths": pathLengths,
            "predecessors": predecessors };
    };

    var constructPath = function(shortestPathInfo, endVertex) {
        var path = [];
        while (endVertex != shortestPathInfo.startVertex) {
            path.unshift(endVertex);
            endVertex = shortestPathInfo.predecessors[endVertex];
        }
        return path;
    };

    var xeSet = function() {
        var working = args.split('equals');
        if(working.length != 2) return;
        var from = working[0].trim();
        working = working[1].trim().split(' ');
        if(working.length < 2) return;
        var to = working.slice(1).join(' ').trim();
        var value = parseFloat(working[0].trim());
        if(isNaN(value)) return;

        state.xe[from] = state.xe[from] || {};
        state.xe[to] = state.xe[to] || {};
        state.xe[from][to] = value;
        var inverseSet = false;
        if(value != 0 && typeof state.xe[to][from] == 'undefined') {
            state.xe[to][from] = 1/value;
            inverseSet = true;
        }

        sendFormatted('G|||Conversion set|||1 ' + from + ' is now worth ' +
            value + ' ' + to + '.', {who: 'XE'});

        if(inverseSet) {
            sendFormatted('G|||Conversion set|||1 ' + to + ' is now worth ' +
                1/value + ' ' + from + '.', {who: 'XE'});
        }
    };

    var xeConvert = function() {
        var working = args.split(' ');
        if(working.length < 2) return;
        var value = parseFloat(working[0].trim());
        if(isNaN(value)) return;
        working = working.slice(1).join(' ').trim().split('to');
        if(working.length != 2) return;
        var from = working[0].trim();
        var to = working[1].trim();
        if(typeof state.xe[from] == 'undefined' ||
            typeof state.xe[to] == 'undefined') return;
        var out = value;
        var arrow = ' \u21d2 ';

        // Try direct first:
        if(typeof state.xe[from][to] != 'undefined' &&
            state.xe[from][to] != 0) {
            out = value * state.xe[from][to];
            sendFormatted('B|||Conversion|||' + value + ' ' + from + ' equals '
                + out + ' ' + to + '.|||Converted via ' + from + arrow +
                to + '.', {who: 'XE'});
            return;
        }

        // Not possible, dijkstra to the rescue!.
        var inf = Infinity;
        var currencies = [];

        // Get list of currencies
        for(a in state.xe) {
            if(!state.xe.hasOwnProperty(a)) continue;
            currencies.push(a);
        }

        // Create adjacency matrix.
        var matrix = new Array(currencies.length);
        for(var i = 0; i < currencies.length; ++i) {
            matrix[i] = new Array(currencies.length);
            matrix[i][i] = 1;
        }

        for(var i = 0; i < currencies.length; ++i) {
            for(var j = 0; j < currencies.length; ++j) {
                if(i == j) continue;
                var a = state.xe[currencies[i]][currencies[j]];
                if(typeof a == 'undefined' || a == 0)
                    matrix[i][j] = inf;
                else
                    matrix[i][j] = 1;
            }
        }

        var data = shortestPath(matrix, currencies.length,
            currencies.indexOf(from));
        if(data.pathLengths[currencies.indexOf(to)] == inf) {
            sendError('There is no suitable conversion from ' + from + ' to ' +
                to + '.', 'XE');
            return;
        }

        var path = constructPath(data, currencies.indexOf(to));
        for(var i = 0; i < path.length; ++i) {
            path[i] = currencies[path[i]];
        }
        var conversionPath = from;
        for(var i = 0; i < path.length; ++i) {
            if(i == 0) {
                out = value * state.xe[from][path[i]];
            } else {
                out *= state.xe[path[i-1]][path[i]];
            }
            conversionPath += arrow + path[i];
        }
        sendFormatted('B|||Conversion|||' + value + ' ' + from + ' equals '
                + out + ' ' + to + '.|||Converted via ' + conversionPath + '.',
            {who: 'XE'});
    };

    var xeDelete = function() {
        if(args == '') return;
        if(typeof state.xe[args] == 'undefined') return;

        delete state.xe[args];

        for(prop in state.xe) {
            if(!state.xe.hasOwnProperty(prop)) continue;
            delete state.xe[prop][args];
            if(Object.keys(state.xe[prop]).length == 0)
                delete state.xe[prop];
        }

        sendFormatted('R|||Deleted|||Deleted currency ' + args + '.',
            {who: 'XE'});
    };

    var xeExport = function() {
        sendChat('XE', '/w gm To import type: <br /><b>!xeimport ' +
            JSON.stringify(state.xe) + '</b>');
    };

    var xeImport = function() {
        var data;
        try {
            data = JSON.parse(args);
        } catch(e) {
            sendChat('XE', '/w gm Syntax Error in import string.');
            return;
        }
        state.xe = data;
        sendChat('XE', '/w gm Imported JSON data.');
    };

    var xeReset = function() {
        state.xe = {};
        sendChat('XE', '/w gm System has been reset.');
    };

    switch(args[0]) {
        case '!xe':
            args = msg.content.replace('!xe', '').trim();
            xeHelp();
            break;
        case '!xeset':
            if(!gmState(msg)) return;
            args = msg.content.replace('!xeset', '').trim();
            xeSet();
            break;
        case '!xeconvert':
            args = msg.content.replace('!xeconvert', '').trim();
            xeConvert();
            break;
        case '!xedelete':
            if(!gmState(msg)) return;
            args = msg.content.replace('!xedelete', '').trim();
            xeDelete();
            break;
        case '!xeexport':
            if(!gmState(msg)) return;
            args = msg.content.replace('!xeexport', '').trim();
            xeExport();
            break;
        case '!xeimport':
            if(!gmState(msg)) return;
            args = msg.content.replace('!xeimport', '').trim();
            xeImport();
            break;
        case '!xereset':
            if(!gmState(msg)) return;
            args = msg.content.replace('!xereset', '').trim();
            xeReset();
            break;
    }
});
// }}}

// Api Heartbeat {{{
// Github:   https://github.com/shdwjk/Roll20API/blob/master/APIHeartBeat/APIHeartBeat.js
// By:       The Aaron, Arcane Scriptomancer
// Contact:  https://app.roll20.net/users/104025/the-aaron
var APIHeartBeat = APIHeartBeat || (function() {
    'use strict';

    var version = 0.3,
        schemaVersion = 0.2,
        beatInterval = false,
        beatPeriod = 200,
        devScaleFactor = 5,
        beatCycle = 3000,

        scaleColorRange = function(scale, color1, color2) {
            return _.chain(
                _.zip(
                    _.rest(color1.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/)),
                    _.rest(color2.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/))
                )
            )
                .map(function(d){
                    var b1 = parseInt(d[0],16),
                        b2 = parseInt(d[1],16);
                    return Math.min(255,Math.max(0,((b2-b1)*scale+b1).toFixed(0))).toString(16);
                })
                .reduce(function(memo,d){
                    return memo+(1===d.length ? '0' : '')+d;
                },'#')
                .value();
        },

        animateHeartBeat = function() {
            var cycle = beatCycle * (state.APIHeartBeat.devMode ? 1 : devScaleFactor),
                x = ((Date.now()%cycle)/cycle)*Math.PI*2,
                scale = (Math.sin(x)+1)/2;

            _.chain(state.APIHeartBeat.heartBeaters)
                .map(function(d){
                    return {
                        player: getObj('player',d.pid),
                        color1: d.color1,
                        color2: d.color2
                    };
                })
                .reject(function(d){
                    return !d.player || !d.player.get('online');
                })
                .each(function(d){
                    d.player.set({
                        color: scaleColorRange(scale,d.color1,d.color2)
                    });
                });
        },

        startStopBeat = function() {
            var userOnline=_.chain(
                    _.keys(state.APIHeartBeat.heartBeaters)
                )
                    .map(function(pid){
                        return getObj('player',pid);
                    })
                    .reject(_.isUndefined)
                    .map(function(p){
                        return p.get('online');
                    })
                    .reduce(function(memo,os){
                        return memo||os;
                    },false)
                    .value(),
                period=beatPeriod*( state.APIHeartBeat.devMode ? 1 : devScaleFactor );

            if(!beatInterval && _.keys(state.APIHeartBeat.heartBeaters).length && userOnline) {
                beatInterval = setInterval(animateHeartBeat,period);
            } else if(beatInterval && (!_.keys(state.APIHeartBeat.heartBeaters).length || !userOnline) ) {
                clearInterval(beatInterval);
                beatInterval=false;
            }
        },

        ch = function (c) {
            var entities = {
                '<' : 'lt',
                '>' : 'gt',
                "'" : '#39',
                '@' : '#64',
                '{' : '#123',
                '|' : '#124',
                '}' : '#125',
                '[' : '#91',
                ']' : '#93',
                '"' : 'quot',
                '-' : 'mdash',
                ' ' : 'nbsp'
            };

            if(_.has(entities,c) ){
                return ('&'+entities[c]+';');
            }
            return '';
        },

        showHelp = function(who) {
            sendChat('',
                    '/w '+who+' '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'APIHeartBeat v'+version
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'<p>APIHeartBeat provides visual feedback that the API is running by changing a user'+ch("'")+'s color periodically.</p>'
                    +'</div>'
                    +'<b>Commands</b>'
                    +'<div style="padding-left:10px;">'
                    +'<b><span style="font-family: serif;">!api-heartbeat '+ch('<')+'<i>--help</i>|<i>--off</i>|<i>--dev</i>'+ch('>')+' '+ch('[')+ch('<')+'color'+ch('>')+ch(']')+' '+ch('[')+ch('<')+'color'+ch('>')+ch(']')+'</span></b>'

                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>This command allows you to turn off and on the monitor, as well as configure it.</p>'
                    +'<ul>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">'+ch('<')+'--help'+ch('>')+'</span></b> '+ch('-')+' Displays this help.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">'+ch('<')+'--off'+ch('>')+'</span></b> '+ch('-')+' Turns off the heartbeat for the current player.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">'+ch('<')+'--dev'+ch('>')+'</span></b> '+ch('-')+' Activates development mode. (<b>Warning:</b> This mode updates much more often and could contribute to performance issues, despite being great for script development.)'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">'+ch('<')+'color'+ch('>')+'</span></b> '+ch('-')+' The script alternates between two colors.  If you specify 2 colors, it will use those.  If you specify 1 color, it will use that and your configured color. If you specify no colors, it will go between your configured color and black or red based on brightness.</b>'
                    +'</li> '
                    +'</ul>'
                    +'</div>'
                    +'</div>'
                    +'</div>'
            );
        },

        counterColor = function(color) {
            if(parseInt(
                    _.first(
                        _.rest(
                                (_.isString(color) ? color : '').match(/^#([0-9a-fA-F]{2})/) || []
                        )
                    ) || '00',
                16) > 127
                ){
                return '#000000';
            }
            return '#ff0000';
        },

        handleInput = function(msg) {
            var args, errors, player, who, color;

            if (msg.type !== "api" && !isGM(msg.playerid)) {
                return;
            }
            player = getObj('player',msg.playerid);
            who = player && player.get('_displayname').split(' ')[0];

            args = msg.content.split(/\s+/);
            switch(args.shift()) {
                case '!api-heartbeat':

                    if(_.contains(args,'--help')) {
                        showHelp(who);
                        return;
                    }

                    if ( _.contains(args,'--off') ) {
                        // turn off
                        if(state.APIHeartBeat.heartBeaters[msg.playerid]) {
                            color = state.APIHeartBeat.heartBeaters[msg.playerid].origColor;
                            delete state.APIHeartBeat.heartBeaters[msg.playerid];
                            startStopBeat();
                            player.set({color: color});
                        }
                        sendChat('APIHeartBeat', '/w '+who+' Off for '+player.get('displayname')+'.');
                    } else {
                        if ( _.contains(args,'--dev') ) {
                            state.APIHeartBeat.devMode = !state.APIHeartBeat.devMode;
                            clearInterval(beatInterval);
                            beatInterval=false;
                            sendChat('APIHeartBeat', '/w '+who+' Dev Mode is now '+(state.APIHeartBeat.devMode ? 'ON' : 'OFF')+'.');
                            args = _.chain(args).without('--dev').first(2).value();
                            if( ! args.length ) {
                                startStopBeat();
                                return;
                            }
                        }

                        errors=_.reduce(args, function(memo,a){
                            if( ! a.match(/^(?:#?[0-9a-fA-F]{6})$/) ) {
                                memo.push("Invalid color: "+a);
                            }
                            return memo;
                        },[]);

                        if(errors.length) {
                            sendChat('APIHeartBeat', '/w '+who+' Errors: '+errors.join(' '));
                        } else {
                            switch(args.length) {
                                case 2:
                                    state.APIHeartBeat.heartBeaters[msg.playerid]= {
                                        pid: msg.playerid,
                                        origColor: player.get('color'),
                                        color1: args[0],
                                        color2: args[1]
                                    };
                                    break;
                                case 1:
                                    state.APIHeartBeat.heartBeaters[msg.playerid]= {
                                        pid: msg.playerid,
                                        origColor: player.get('color'),
                                        color1: player.get('color'),
                                        color2: args[0]
                                    };
                                    break;
                                default:
                                    state.APIHeartBeat.heartBeaters[msg.playerid]= {
                                        pid: msg.playerid,
                                        origColor: player.get('color'),
                                        color1: player.get('color'),
                                        color2: counterColor(player.get('color'))
                                    };
                            }
                            sendChat('APIHeartBeat', '/w '+who+' Configured on for '+player.get('displayname')+'.');
                        }
                        startStopBeat();
                    }
                    break;
            }
        },

        checkInstall = function() {
            if( ! _.has(state,'APIHeartBeat') || state.APIHeartBeat.version !== schemaVersion) {
                log('APIHeartBeat: Resetting state');
                state.APIHeartBeat = {
                    version: schemaVersion,
                    devMode: false,
                    heartBeaters: {}
                };
            }

            startStopBeat();
        },

        registerEventHandlers = function() {
            on('chat:message', handleInput);
            on('change:player:_online', startStopBeat);
        };

    return {
        CheckInstall: checkInstall,
        RegisterEventHandlers: registerEventHandlers
    };

}());
on('ready',function() {
    'use strict';

    if("undefined" !== typeof isGM && _.isFunction(isGM)) {
        APIHeartBeat.CheckInstall();
        APIHeartBeat.RegisterEventHandlers();
    } else {
        log('--------------------------------------------------------------');
        log('APIHeartBeat requires the isGM module to work.');
        log('isGM GIST: https://gist.github.com/shdwjk/8d5bb062abab18463625');
        log('--------------------------------------------------------------');
    }
});
// }}}

// Set/SetMax System {{{
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!set ")) return;
    msg = _.clone(msg);
    msg.content = msg.content.toLowerCase().replace("!set ", "").trim();
    var player = msg.playerid;
    var sender = msg.who.split(" ")[0];
    var args = msg.content.split(' ');

    if(playerIsGM(player))
        sender = "gm";

    var characters = findObjs({
        _type: "character",
        name: msg.who
    });

    if(typeof characters != "undefined" && characters.length > 0) {
        var char = characters[0];

        // Check if this player is allowed to edit this character.
        if(char.get("controlledby").contains("all") || char.get("controlledby").contains(player) || playerIsGM(player)) {
            var newValue = args[args.length - 1];
            args.pop();
            var attrName = args.join(' ');

            var attributes = findObjs({
                name: attrName,
                _characterid: char.get("_id")
            }, {caseInsensitive: true});
            var attribute = "";
            if(typeof attributes != "undefined" && attributes.length != 0) {
                attribute = attributes[0];
            }

            if(attribute != "") {
                if(newValue.contains('/')) {
                    var values = newValue.split('/');
                    attribute.set("current", values[0]);
                    attribute.set("max", values[1]);
                } else {
                    attribute.set("current", newValue);
                }
                var tokensAffected = findObjs({
                    _pageid:  Campaign().get("playerpageid"),
                    _type:    "graphic",
                    _subtype: "token",
                    represents: char.get("_id")
                });
                sendChat("Setter", "/w " + sender + " The attribute \"" + attrName + "\" has been set to \"" + newValue
                    + "\".");
            } else {
                sendChat("Setter", "/w " + sender + " No attribute called \"" + attrName + "\" was found.");
            }
        } else {
            sendChat("Setter", "/w " + sender + " You need to activate this command when speaking as a character you control.");
        }
    } else {
        sendChat("Setter", "/w " + sender + " You need to activate this command when speaking as a character you control.");
    }
});
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!settext ")) return;
    msg = _.clone(msg);
    msg.content = msg.content.replace("!settext ", "").trim();
    var player = msg.playerid;
    var sender = msg.who.split(" ")[0];
    var args = msg.content.split(';');

    if(playerIsGM(player))
        sender = "gm";

    var characters = findObjs({
        _type: "character",
        name: msg.who
    });

    if(typeof characters != "undefined" && characters.length > 0) {
        var char = characters[0];

        // Check if this player is allowed to edit this character.
        if(char.get("controlledby").contains("all") || char.get("controlledby").contains(player) || playerIsGM(player)) {
            var newValue = args[args.length - 1].trim();
            args.pop();
            var attrName = args.join(' ').toLowerCase().trim();

            var attributes = findObjs({
                name: attrName,
                _characterid: char.get("_id")
            }, {caseInsensitive: true});
            var attribute = "";
            if(typeof attributes != "undefined" && attributes.length != 0) {
                attribute = attributes[0];
            }

            if(attribute != "") {
                if(newValue.contains('/')) {
                    var values = newValue.split('/');
                    attribute.set("current", values[0]);
                    attribute.set("max", values[1]);
                } else {
                    attribute.set("current", newValue);
                }
                var tokensAffected = findObjs({
                    _pageid:  Campaign().get("playerpageid"),
                    _type:    "graphic",
                    _subtype: "token",
                    represents: char.get("_id")
                });
                if(typeof tokensAffected != "undefined")
                    _.each(tokensAffected, function(obj) { bloodied(obj, "") });
                sendChat("Setter", "/w " + sender + " The attribute \"" + attrName + "\" has been set to \"" + newValue
                    + "\".");
            } else {
                sendChat("Setter", "/w " + sender + " No attribute called \"" + attrName + "\" was found.");
            }
        } else {
            sendChat("Setter", "/w " + sender + " You need to activate this command when speaking as a character you control.");
        }
    } else {
        sendChat("Setter", "/w " + sender + " You need to activate this command when speaking as a character you control.");
    }
});
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!setmax ")) return;
    msg = _.clone(msg);
    msg.content = msg.content.toLowerCase().replace("!setmax ", "").trim();
    var player = msg.playerid;
    var sender = msg.who.split(" ")[0];
    var args = msg.content.split(' ');

    if(playerIsGM(player))
        sender = "gm";

    var characters = findObjs({
        _type: "character",
        name: msg.who
    });

    if(typeof characters != "undefined" && characters.length > 0) {
        var char = characters[0];

        // Check if this player is allowed to edit this character.
        if(char.get("controlledby").contains("all") || char.get("controlledby").contains(player) || playerIsGM(player)) {
            var newValue = args[args.length - 1];
            args.pop();
            var attrName = args.join(' ');

            var attributes = findObjs({
                name: attrName,
                _characterid: char.get("_id")
            }, {caseInsensitive: true});
            var attribute = "";
            if(typeof attributes != "undefined" && attributes.length != 0) {
                attribute = attributes[0];
            }

            if(attribute != "") {
                attribute.set("max", newValue);
                var tokensAffected = findObjs({
                    _pageid:  Campaign().get("playerpageid"),
                    _type:    "graphic",
                    _subtype: "token",
                    represents: char.get("_id")
                });
                sendChat("Setter", "/w " + sender + " The maximum of attribute \"" + attrName + "\" has been set to \"" + newValue
                    + "\".");
            } else {
                sendChat("Setter", "/w " + sender + " No attribute called \"" + attrName + "\" was found.");
            }
        } else {
            sendChat("Setter", "/w " + sender + " You need to activate this command when speaking as a character you control.");
        }
    } else {
        sendChat("Setter", "/w " + sender + " You need to activate this command when speaking as a character you control.");
    }
});
// }}}

// Dump Macros {{{
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(!msg.content.startsWith("!macros")) return;

    var macros = findObjs({
        _type: "macro"
    });
    _.each(macros, function(obj) {
        log("--------- " + obj.get("name") + " --------- " + obj.get("id") + " ---------");
        log(obj.get("action"));
    });
});
// }}}

// Flight tracker {{{
// Implements the commands:
//   !fly <n>
//      - Sets the flight height of the selected tokens to n ft.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    msg = _.clone(msg);
    if(!msg.content.startsWith("!fly")) return;

    // Error handling
    var sender = msg.who.split(" ")[0];
    var messagercv = msg.content.split(" ");
    if(messagercv.length != 2) {
        sendChat("Fly Manager", "/w " + sender + " No height given.");
        return;
    }
    var height = parseInt(messagercv[1]);
    if(isNaN(height)) {
        sendChat("Fly Manager", "/w " + sender + " Invalid height.");
        return;
    }
    if(typeof msg.selected == "undefined") {
        sendChat("Fly Manager", "/w " + sender + " You must select at least one token.");
        return;
    }

    _.each(msg.selected, function(selected) {
        var obj = getObj("graphic", selected._id);
        if(typeof obj == "undefined") return;
        if(obj.get("_subtype") != "token") return;

        // First we find the flying section of the name, then, if it exists, we strip it.
        var name = obj.get("name");
        name = name.replace(/\s*\[.*\]/ig, "");

        // We now get the height (up in 3d) of the token in feet.
        var size = obj.get("width") / 70 * 5;

        // If the wanted height is 0 (landed) we put the stripped name as the name. Otherwise we append the occupied
        // height to the name and replace it.
        if(height == 0) {
            obj.set("name", name);
        } else {
            if(name != "") name = name + " ";
            name = name + "[" + height + "-" + (height + size) + " ft.]";
            obj.set("name", name);
        }
    });
});
// }}}

// Token Locking {{{
var TokenLock = TokenLock || (function() {
    'use strict';

    var version = '0.2.2',
        lastUpdate = 1428859122,
        schemaVersion = 0.2,

        ch = function (c) {
            var entities = {
                '<' : 'lt',
                '>' : 'gt',
                "'" : '#39',
                '@' : '#64',
                '{' : '#123',
                '|' : '#124',
                '}' : '#125',
                '[' : '#91',
                ']' : '#93',
                '"' : 'quot',
                '-' : 'mdash',
                ' ' : 'nbsp'
            };

            if(_.has(entities,c) ){
                return ('&'+entities[c]+';');
            }
            return '';
        },

        getCommandOption_ToggleLock = function() {
            var text = (state.TokenLock.locked ? '<span style="color: #990000;">Locked</span>' : '<span style="color: #009900;">Unlocked</span>' );
            return '<div>'
                +'Tokens are now <b>'
                +text
                +'</b>. '
                +'<a href="!tl --toggle-lock">'
                +'Toggle'
                +'</a>'
                +'</div>';

        },

        getConfigOption_AllowMoveOnTurn = function() {
            var text = (state.TokenLock.config.allowMoveOnTurn ? 'On' : 'Off' );
            return '<div>'
                +'Allow Move on Turn is currently <b>'
                +text
                +'</b> '
                +'<a href="!tl-config --toggle-allowmoveonturn">'
                +'Toggle'
                +'</a>'
                +'</div>';

        },

        showHelp = function(who) {
            var stateColor = (state.TokenLock.locked) ? ('#990000') : ('#009900'),
                stateName  = (state.TokenLock.locked) ? ('Locked') : ('Unlocked');

            sendChat('',
                    '/w '+who+' '
                    +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                    +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                    +'<div style="float:right;width:90px;border:1px solid black;background-color:#ffc;text-align:center;font-size: 70%;"><span style="color: '+stateColor+'; font-weight:bold; padding: 0px 4px;">'+stateName+'</span></div>'
                    +'TokenLock v'+version
                    +'<div style="clear: both"></div>'
                    +'</div>'
                    +'<div style="padding-left:10px;margin-bottom:3px;">'
                    +'<p>TokenLock allows the GM to selectively prevent players from moving their tokens. '
                    +'Since <i><u>change:graphic</u></i> events to not specify who changed the '
                    +'graphic, determination of player tokens is based on whether that token '
                    +'has an entry in the <b>controlled by</b> field of either the token or '
                    +'the character it represents.  If <b>controlled by</b> is empty, the '
                    +'GM can freely move the token at any point.  If there is any entry in '
                    +'<b>controlled by</b>, the token can only be moved when TokenLock is '
                    +'unlocked. </p>'
                    + '<p>Moving of player controlled cards is still permissible. </p>'
                    +'</div>'
                    +'<b>Commands</b>'
                    +'<div style="padding-left:10px;"><b><span style="font-family: serif;">!tl</span></b>'
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'Executing the command with no arguments prints this help.  The following arguments may be supplied in order to change the configuration.  All changes are persisted between script restarts.'
                    +'<ul>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">lock</span></b> -- Locks the player tokens to prevent moving them.'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">unlock</span></b> -- Unlocks the player tokens allowing them to be moved.'
                    +'</li> '
                    +'</ul>'
                    +'</div>'
                    +'</div>'
                    +getCommandOption_ToggleLock()
                    +'<div style="padding-left:10px;">'
                    +'<b><span style="font-family: serif;">!tl-config ['+ch('<')+'Options'+ch('>')+'|--help]</span></b>'
                    +'<div style="padding-left: 10px;padding-right:20px">'
                    +'<p>Swaps the selected Tokens for their counterparts on the other layer.</p>'
                    +'<ul>'
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">--help</span></b> '+ch('-')+' Shows the Help screen'
                    +'</li> '
                    +'<li style="border-top: 1px solid #ccc;border-bottom: 1px solid #ccc;">'
                    +'<b><span style="font-family: serif;">--toggle-allowmoveonturn</span></b> '+ch('-')+' Sets whether tokens can be moved if they are at the top of the turn order.'
                    +'</li> '
                    +'</ul>'
                    +'</div>'
                    +'</div>'
                    +getConfigOption_AllowMoveOnTurn()
                    +'</div>'
            );
        },

        handleInput = function(msg) {
            var args,who;

            if (msg.type !== "api" || !playerIsGM(msg.playerid) ) {
                return;
            }
            who=getObj('player',msg.playerid).get('_displayname').split(' ')[0];

            args = msg.content.split(/\s+/);
            switch(args.shift()) {
                case '!tl':
                    if(_.contains(args,'--help')) {
                        showHelp(who);
                        return;
                    }
                    switch(args.shift()) {
                        case 'lock':
                            state.TokenLock.locked=true;
                            sendChat('TokenLock','/w gm '
                                    +getCommandOption_ToggleLock()
                            );

                            break;

                        case 'unlock':
                            state.TokenLock.locked=false;
                            sendChat('TokenLock','/w gm '
                                    +getCommandOption_ToggleLock()
                            );
                            break;

                        case '--toggle-lock':
                            state.TokenLock.locked= !state.TokenLock.locked;
                            sendChat('TokenLock','/w gm '
                                    +getCommandOption_ToggleLock()
                            );
                            break;

                        default:
                            showHelp(who);
                            break;
                    }
                    break;

                case '!tl-config':
                    if(_.contains(args,'--help')) {
                        showHelp(who);
                        return;
                    }
                    if(!args.length) {
                        sendChat('','/w '+who+' '
                                +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                +'<div style="font-weight: bold; border-bottom: 1px solid black;font-size: 130%;">'
                                +'TokenLock v'+version
                                +'</div>'
                                +getConfigOption_AllowMoveOnTurn()
                                +'</div>'
                        );
                        return;
                    }
                    _.each(args,function(a){
                        var opt=a.split(/\|/);

                        switch(opt.shift()) {
                            case '--toggle-allowmoveonturn':
                                state.TokenLock.config.allowMoveOnTurn = !state.TokenLock.config.allowMoveOnTurn;
                                sendChat('','/w '+who+' '
                                        +'<div style="border: 1px solid black; background-color: white; padding: 3px 3px;">'
                                        +getConfigOption_AllowMoveOnTurn()
                                        +'</div>'
                                );
                                break;

                            default:
                                sendChat('','/w '+who+' '
                                        +'<div><b>Unsupported Option:</div> '+a+'</div>'
                                );
                        }
                    });
                    break;
            }

        },

        handleMove = function(obj,prev) {
            if(state.TokenLock.locked
                && 'token' === obj.get('subtype')
                && ( !state.TokenLock.config.allowMoveOnTurn || (( (JSON.parse(Campaign().get('turnorder'))||[{id:false}])[0].id) !== obj.id) )
                && ( obj.get('left') !== prev.left || obj.get('top') !== prev.top || obj.get('rotation') !== prev.rotation )
                ) {
                if('' !== obj.get('controlledby')) {
                    obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});
                } else if('' !== obj.get('represents') ) {
                    var character = getObj('character',obj.get('represents'));
                    if( character && character.get('controlledby') ) {
                        obj.set({left: prev.left, top: prev.top, rotation: prev.rotation});
                    }
                }
            }
        },

        checkInstall = function() {
            log('-=> TokenLock v'+version+' <=-  ['+(new Date(lastUpdate*1000))+']');

            if( ! _.has(state,'TokenLock') || state.TokenLock.version !== schemaVersion) {
                log('  > Updating Schema to v'+schemaVersion+' <');
                switch(state.TokenLock && state.TokenLock.version) {
                    case 0.1:
                        state.TokenLock.config={
                            allowMoveOnTurn: false
                        };
                        state.TokenLock.version=schemaVersion;
                        break;

                    default:
                        state.TokenLock = {
                            version: schemaVersion,
                            config: {
                                allowMoveOnTurn: false
                            },
                            locked: false
                        };
                }
            }
        },

        registerEventHandlers = function() {
            on('chat:message', handleInput);
            on('change:graphic', handleMove);
        };

    return {
        RegisterEventHandlers: registerEventHandlers,
        CheckInstall: checkInstall
    };
}());
on("ready",function(){
    'use strict';

    TokenLock.CheckInstall();
    TokenLock.RegisterEventHandlers();
});
// }}}

// Path Splitter {{{
// Implements the commands:
//   !pathSplit
//     - Select a pink path and another path, this will delete the pink path and split the other path where they
//       intersect.
var MatrixMath = (function() {
    /**
     * An NxN square matrix, represented as a 2D array of numbers in column-major
     * order. For example, mat[3][2] would get the value in column 3 and row 2.
     * order.
     * @typedef {number[][]} Matrix
     */

    /**
     * An N-degree vector.
     * @typedef {number[]} Vector
     */

    /**
     * Gets the adjugate of a matrix, the tranpose of its cofactor matrix.
     * @param  {[type]} mat
     * @return {[type]}
     */
    function adjoint(mat) {
        var cofactorMat = MatrixMath.cofactorMatrix(mat);
        return MatrixMath.transpose(cofactorMat);
    }

    /**
     * Produces a clone of an NxN square matrix.
     * @param  {Matrix} mat
     * @return {Matrix}
     */
    function clone(mat) {
        return _.map(mat, function(column) {
            return _.map(column, function(value) {
                return value;
            });
        });
    }

    /**
     * Gets the cofactor of a matrix at a specified column and row.
     * @param  {Matrix} mat
     * @param  {uint} col
     * @param  {uint} row
     * @return {number}
     */
    function cofactor(mat, col, row) {
        return Math.pow(-1, col+row)*MatrixMath.minor(mat, col, row);
    }

    /**
     * Gets the cofactor matrix of a matrix.
     * @param  {Matrix} mat
     * @return {Matrix}
     */
    function cofactorMatrix(mat) {
        var result = [];
        var size = MatrixMath.size(mat);
        for(var col=0; col<size; col++) {
            result[col] = [];
            for(var row=0; row<size; row++) {
                result[col][row] = MatrixMath.cofactor(mat, col, row);
            }
        }
        return result;
    }

    /**
     * Gets the determinant of an NxN matrix.
     * @param  {Matrix} mat
     * @return {number}
     */
    function determinant(mat) {
        var size = MatrixMath.size(mat);

        if(size === 2)
            return mat[0][0]*mat[1][1] - mat[1][0]*mat[0][1];
        else {
            var sum = 0;
            for(var col=0; col<size; col++) {
                sum += mat[col][0] * MatrixMath.cofactor(mat, col, 0);
            }
            return sum;
        }
    }

    /**
     * Tests if two matrices are equal.
     * @param  {Matrix} a
     * @param  {Matrix} b
     * @param {number} [tolerance=0]
     *        If specified, this specifies the amount of tolerance to use for
     *        each value of the matrices when testing for equality.
     * @return {boolean}
     */
    function equal(a, b, tolerance) {
        tolerance = tolerance || 0;
        var sizeA = MatrixMath.size(a);
        var sizeB = MatrixMath.size(b);

        if(sizeA !== sizeB)
            return false;

        for(var col=0; col<sizeA; col++) {
            for(var row=0; row<sizeA; row++) {
                if(Math.abs(a[col][row] - b[col][row]) > tolerance)
                    return false;
            }
        }
        return true;
    }

    /**
     * Produces an identity matrix of some size.
     * @param  {uint} size
     * @return {Matrix}
     */
    function identity(size) {
        var mat = [];
        for(var col=0; col<size; col++) {
            mat[col] = [];
            for(var row=0; row<size; row++) {
                if(row === col)
                    mat[col][row] = 1;
                else
                    mat[col][row] = 0;
            }
        }
        return mat;
    }

    /**
     * Gets the inverse of a matrix.
     * @param  {Matrix} mat
     * @return {Matrix}
     */
    function inverse(mat) {
        var determinant = MatrixMath.determinant(mat);
        if(determinant === 0)
            return undefined;

        var adjoint = MatrixMath.adjoint(mat);
        var result = [];
        var size = MatrixMath.size(mat);
        for(var col=0; col<size; col++) {
            result[col] = [];
            for(var row=0; row<size; row++) {
                result[col][row] = adjoint[col][row]/determinant;
            }
        }
        return result;
    }

    /**
     * Gets the determinant of a matrix omitting some column and row.
     * @param  {Matrix} mat
     * @param  {uint} col
     * @param  {uint} row
     * @return {number}
     */
    function minor(mat, col, row) {
        var reducedMat = MatrixMath.omit(mat, col, row);
        return determinant(reducedMat);
    }


    /**
     * Returns the matrix multiplication of a*b.
     * This function works for non-square matrices (and also for transforming
     * vectors by a matrix).
     * For matrix multiplication to work, the # of columns in A must be equal
     * to the # of rows in B.
     * The resulting matrix will have the same number of rows as A and the
     * same number of columns as B.
     * If b was given as a vector, then the result will also be a vector.
     * @param  {Matrix} a
     * @param  {Matrix|Vector} b
     * @return {Matrix|Vector}
     */
    function multiply(a, b) {
        // If a vector is given for b, convert it to a nx1 matrix, where n
        // is the length of b.
        var bIsVector = _.isNumber(b[0]);
        if(bIsVector)
            b = [b];

        var colsA = a.length;
        var rowsA = a[0].length;
        var colsB = b.length;
        var rowsB = b[0].length;
        if(colsA !== rowsB)
            throw new Error('MatrixMath.multiply ERROR: # columns in A must be ' +
                'the same as the # rows in B. Got A: ' + rowsA + 'x' + colsA +
                ', B: ' + rowsB + 'x' + colsB + '.');

        var result = [];
        for(var col=0; col<colsB; col++) {
            result[col] = [];
            for(var row=0; row<rowsA; row++) {
                result[col][row] = 0;
                for(var i=0; i<colsA; i++) {
                    result[col][row] += a[i][row] * b[col][i];
                }
            }
        }

        if(bIsVector)
            result = result[0];
        return result;
    }

    /**
     * Returns a matrix with a column and row omitted.
     * @param  {Matrix} mat
     * @param  {uint} col
     * @param  {uint} row
     * @return {Matrix}
     */
    function omit(mat, col, row) {
        var result = [];

        var size = MatrixMath.size(mat);
        for(var i=0; i<size; i++) {
            if(i === col)
                continue;

            var column = [];
            result.push(column);
            for(var j=0; j<size; j++) {
                if(j !== row)
                    column.push(mat[i][j]);
            }
        }
        return result;
    }

    /**
     * Produces a 2D rotation affine transformation. The direction of the
     * rotation depends upon the coordinate system.
     * @param  {number} angle
     *         The angle, in radians.
     * @return {Matrix}
     */
    function rotate(angle) {
        var cos = Math.cos(angle);
        var sin = Math.sin(angle);
        return [[cos, sin, 0], [-sin, cos, 0], [0,0,1]];
    }

    /**
     * Produces a 2D scale affine transformation matrix.
     * The matrix is used to transform homogenous coordinates, so it is
     * actually size 3 instead of size 2, despite being used for 2D geometry.
     * @param  {(number|Vector)} amount
     *         If specified as a number, then it is a uniform scale. Otherwise,
     *         it defines a scale by parts.
     * @return {Matrix}
     */
    function scale(amount) {
        if(_.isNumber(amount))
            amount = [amount, amount];
        return [[amount[0], 0, 0], [0, amount[1], 0], [0, 0, 1]];
    }

    /**
     * Gets the size N of a NxN square matrix.
     * @param  {Matrix} mat
     * @return {uint}
     */
    function size(mat) {
        return mat[0].length;
    }

    /**
     * Produces a 2D translation affine transformation matrix.
     * The matrix is used to transform homogenous coordinates, so it is
     * actually size 3 instead of size 2, despite being used for 2D geometry.
     * @param  {Vector} vec
     * @return {Matrix}
     */
    function translate(vec) {
        return [[1,0,0], [0,1,0],[vec[0], vec[1], 1]];
    }

    /**
     * Returns the transpose of a matrix.
     * @param  {Matrix} mat
     * @return {Matrix}
     */
    function transpose(mat) {
        var result = [];

        var size = MatrixMath.size(mat);
        for(var col=0; col<size; col++) {
            result[col] = [];
            for(var row=0; row<size; row++) {
                result[col][row] = mat[row][col];
            }
        }
        return result;
    }


    return {
        adjoint: adjoint,
        clone: clone,
        cofactor: cofactor,
        cofactorMatrix: cofactorMatrix,
        determinant: determinant,
        equal: equal,
        identity: identity,
        inverse: inverse,
        minor: minor,
        multiply: multiply,
        omit: omit,
        rotate: rotate,
        scale: scale,
        size: size,
        translate: translate,
        transpose: transpose
    };
})();
var PathMath = (function() {

    /**
     * A vector used to define a homogeneous point or a direction.
     * @typedef {number[]} Vector
     */

    /**
     * A line segment defined by two homogeneous 2D points.
     * @typdef {Vector[]} Segment
     */

    /**
     * A simple class for BoundingBoxes.
     * @param {Number} left
     * @param {Number} top
     * @param {Number} width
     * @param {Number} height
     */
    function BoundingBox(left, top, width, height) {
        this.left = left;
        this.top = top;
        this.width = width;
        this.height = height;
    };

    /**
     * Calculates the bounding box for a list of paths.
     * @param {Path | Path[]} paths
     * @return {BoundingBox}
     */
    function getBoundingBox(paths) {
        if(!_.isArray(paths))
            paths = [paths];

        var result;
        _.each(paths, function(p) {
            var pBox = _getSingleBoundingBox(p);
            if(result)
                result = _addBoundingBoxes(result, pBox);
            else
                result = pBox;
        });
        return result;
    };

    /**
     * Returns the center of the bounding box countaining a path or list
     * of paths. The center is returned as a 2D homongeneous point
     * (It has a third component which is always 1 which is helpful for
     * affine transformations).
     * @param {(Path|Path[])} paths
     * @return {Vector}
     */
    function getCenter(paths) {
        if(!_.isArray(pathjs))
            paths = [paths];

        var bbox = getBoundingBox(paths);
        var cx = bbox.left + bbox.width/2;
        var cy = bbox.top + bbox.height/2;

        return [cx, cy, 1];
    };

    /**
     * @private
     * Calculates the bounding box for a single path.
     * @param  {Path} path
     * @return {BoundingBox}
     */
    function _getSingleBoundingBox(path) {
        var width = path.get('width')*path.get('scaleX');
        var height = path.get('height')*path.get('scaleY');
        var left = path.get('left') - width/2;
        var top = path.get('top') - height/2;

        return new BoundingBox(left, top, width, height);
    };

    /**
     * @private
     * Adds two bounding boxes.
     * @param  {BoundingBox} a
     * @param  {BoundingBox} b
     * @return {BoundingBox}
     */
    function _addBoundingBoxes(a, b) {
        var left = Math.min(a.left, b.left);
        var top = Math.min(a.top, b.top);
        var right = Math.max(a.left + a.width, b.left + b.width);
        var bottom = Math.max(a.top + a.height, b.top + b.height);

        return new BoundingBox(left, top, right - left, bottom - top);
    };

    /**
     * Produces a merged path string from a list of path objects.
     * @param {Path[]} paths
     * @return {String}
     */
    function mergePathStr(paths) {
        var merged = [];
        var bbox = getBoundingBox(paths);

        _.each(paths, function(p) {
            var pbox = getBoundingBox(p);

            var parsed = JSON.parse(p.get('_path'));
            _.each(parsed, function(pathTuple, index) {
                var dx = pbox.left - bbox.left;
                var dy = pbox.top - bbox.top;
                var sx = p.get('scaleX');
                var sy = p.get('scaleY');

                // Bezier curve tuple
                if(pathTuple[0] == 'Q') {
                    var cx = pathTuple[1]*sx + dx;
                    var cy = pathTuple[2]*sy + dy;
                    var x = pathTuple[3]*sx + dx;
                    var y = pathTuple[4]*sy + dy;
                    merged.push([pathTuple[0], cx, cy, x, y]);
                }

                // Move and Line tuples
                else {
                    var x = pathTuple[1]*sx + dx;
                    var y = pathTuple[2]*sy + dy;
                    merged.push([pathTuple[0], x, y]);
                }
            });
        });

        return JSON.stringify(merged);
    };

    /**
     * Reproduces the data for a polygonal path such that the scales are 1 and
     * its rotate is 0.
     * @param {Path}
     * @return {PathData}
     */
    function normalizePath(path) {
        var segments = toSegments(path);
        return segmentsToPath(segments);
    }

    /**
     * Produces the data for creating a path from a list of segments forming a
     * continuous path.
     * @param {Segment[]}
     * @return {PathData}
     */
    function segmentsToPath(segments) {
        var left = segments[0][0][0];
        var right = segments[0][0][0];
        var top = segments[0][0][1];
        var bottom = segments[0][0][1];

        // Get the bounds of the segment.
        var pts = [];
        var isFirst = true;
        _.each(segments, function(segment) {
            var p1 = segment[0];
            if(isFirst) {
                isFirst = false;
                pts.push(p1);
            }

            var p2 = segment[1];

            left = Math.min(left, p1[0], p2[0]);
            right = Math.max(right, p1[0], p2[0]);
            top = Math.min(top, p1[1], p2[1]);
            bottom = Math.max(bottom, p1[1], p2[1]);

            pts.push(p2);
        });

        // Get the path's left and top coordinates.
        var width = right-left;
        var height = bottom-top;
        var cx = left + width/2;
        var cy = top + height/2;

        // Convert the points to a _path.
        var _path = [];
        var firstPt = true;
        _.each(pts, function(pt) {
            var type = 'L';
            if(firstPt) {
                type = 'M';
                firstPt = false;
            }
            _path.push([type, pt[0]-left, pt[1]-top]);
        });

        return {
            _path: JSON.stringify(_path),
            left: cx,
            top: cy,
            width: width,
            height: height
        };
    }

    /**
     * Converts a path into a list of line segments. As the nature of this
     * method suggests, this does not work to convert quadratic paths
     * (for freehand paths) or cubic paths (for oval paths).
     */
    function toSegments(path) {
        var _path = JSON.parse(path.get('_path'));
        var scaleX = path.get('scaleX');
        var scaleY = path.get('scaleY');
        var angle = path.get('rotation')/180*Math.PI;

        // The transformed center of the path.
        var cx = path.get('left');
        var cy = path.get('top');

        // The untransformed width and height.
        var width = path.get('width');
        var height = path.get('height');

        var segments = [];
        var prevPt;

        _.each(_path, function(tuple) {
            var type = tuple[0];

            // The point in path coordinates, relative to the path center.
            var x = tuple[1] - width/2;
            var y = tuple[2] - height/2;
            var pt = [x,y,1];

            // The transform of the point from path coordinates to map
            // coordinates.
            var scale = MatrixMath.scale([scaleX, scaleY]);
            var rotate = MatrixMath.rotate(angle);
            var transform = MatrixMath.translate([cx, cy]);
            transform = MatrixMath.multiply(transform, rotate);
            transform = MatrixMath.multiply(transform, scale);

            pt = MatrixMath.multiply(transform, pt);

            // If we have an 'L' type point, then add the segment.
            // Either way, keep track of the point we've moved to.
            if(type === 'L')
                segments.push([prevPt, pt]);
            prevPt = pt;
        });

        return segments;
    }

    on('chat:message', function(msg) {
        if(msg.type === 'api' && msg.content.indexOf('!pathInfo')  === 0) {
            log('!pathInfo');

            try {
                var path = findObjs({
                    _type: 'path',
                    _id: msg.selected[0]._id
                })[0];
                log(path);
                log(path.get('_path'));

                var segments = toSegments(path);
                log('Segments: ');
                log(segments);

                var pathData = segmentsToPath(segments);
                log('New path data: ');
                log(pathData);

                var curPage = path.get('_pageid');
                _.extend(pathData, {
                    stroke: '#ff0000',
                    _pageid: curPage,
                    layer: path.get('layer')
                });

                var newPath = createObj('path', pathData);
                log(newPath);
            }
            catch(err) {
                log('Lines ERROR: ', err.message)
            }

        }
    });

    return {
        BoundingBox: BoundingBox,
        getBoundingBox: getBoundingBox,
        getCenter: getCenter,
        mergePathStr: mergePathStr,
        normalizePath: normalizePath,
        segmentsToPath: segmentsToPath,
        toSegments: toSegments
    };
})();
var VecMath = (function() {

    /**
     * Adds two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var add = function(a, b) {
        var result = [];
        for(var i=0; i<a.length; i++) {
            result[i] = a[i] + b[i];
        }
        return result;
    };


    /**
     * Creates a cloned copy of a vector.
     * @param {vec} v
     * @return {vec}
     */
    var clone = function(v) {
        var result = [];
        for(var i=0; i < v.length; i++) {
            result.push(v[i]);
        }
        return result;
    };


    /**
     * Returns an array representing the cross product of two 3D vectors.
     * @param {vec3} a
     * @param {vec3} b
     * @return {vec3}
     */
    var cross = function(a, b) {
        var x = a[1]*b[2] - a[2]*b[1];
        var y = a[2]*b[0] - a[0]*b[2];
        var z = a[0]*b[1] - a[1]*b[0];
        return [x, y, z];
    };


    /**
     * Returns the degree of a vector - the number of dimensions it has.
     * @param {vec} vector
     * @return {int}
     */
    var degree = function(vector) {
        return vector.length;
    };


    /**
     * Computes the distance between two points.
     * @param {vec} pt1
     * @param {vec} pt2
     * @return {number}
     */
    var dist = function(pt1, pt2) {
        var v = vec(pt1, pt2);
        return length(v);
    };


    /**
     * Returns the dot product of two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {number}
     */
    var dot = function(a, b) {
        var result = 0;
        for(var i = 0; i < a.length; i++) {
            result += a[i]*b[i];
        }
        return result;
    };


    /**
     * Tests if two vectors are equal.
     * @param {vec} a
     * @param {vec} b
     * @param {float} [tolerance] A tolerance threshold for comparing vector
     *                            components.
     * @return {boolean} true iff the each of the vectors' corresponding
     *                  components are equal.
     */
    var equal = function(a, b, tolerance) {
        if(a.length != b.length)
            return false;

        for(var i=0; i<a.length; i++) {
            if(tolerance !== undefined) {
                if(Math.abs(a[i] - b[i]) > tolerance) {
                    return false;
                }
            }
            else if(a[i] != b[i])
                return false;
        }
        return true;
    };



    /**
     * Returns the length of a vector.
     * @param {vec} vector
     * @return {number}
     */
    var length = function(vector) {
        var length = 0;
        for(var i=0; i < vector.length; i++) {
            length += vector[i]*vector[i];
        }
        return Math.sqrt(length);
    };



    /**
     * Computes the normalization of a vector - its unit vector.
     * @param {vec} v
     * @return {vec}
     */
    var normalize = function(v) {
        var vHat = [];

        var vLength = length(v);
        for(var i=0; i < v.length; i++) {
            vHat[i] = v[i]/vLength;
        }

        return vHat;
    };


    /**
     * Computes the projection of vector b onto vector a.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var projection = function(a, b) {
        var scalar = scalarProjection(a, b);
        var aHat = normalize(a);

        return scale(aHat, scalar);
    };


    /**
     * Computes the distance from a point to an infinitely stretching line.
     * Works for either 2D or 3D points.
     * @param {vec2 || vec3} pt
     * @param {vec2 || vec3} linePt1   A point on the line.
     * @param {vec2 || vec3} linePt2   Another point on the line.
     * @return {number}
     */
    var ptLineDist = function(pt, linePt1, linePt2) {
        var a = vec(linePt1, linePt2);
        var b = vec(linePt1, pt);

        // Make 2D vectors 3D to compute the cross product.
        if(!a[2])
            a[2] = 0;
        if(!b[2])
            b[2] = 0;

        var aHat = normalize(a);
        var aHatCrossB = cross(aHat, b);
        return length(aHatCrossB);
    };


    /**
     * Computes the distance from a point to a line segment.
     * Works for either 2D or 3D points.
     * @param {vec2 || vec3} pt
     * @param {vec2 || vec3} linePt1   The start point of the segment.
     * @param {vec2 || vec3} linePt2   The end point of the segment.
     * @return {number}
     */
    var ptSegDist = function(pt, linePt1, linePt2) {
        var a = vec(linePt1, linePt2);
        var b = vec(linePt1, pt);
        var aDotb = dot(a,b);

        // Is pt behind linePt1?
        if(aDotb < 0) {
            return length(vec(pt, linePt1));
        }

        // Is pt after linePt2?
        else if(aDotb > dot(a,a)) {
            return length(vec(pt, linePt2));
        }

        // Pt must be between linePt1 and linePt2.
        else {
            return ptLineDist(pt, linePt1, linePt2);
        }
    };


    /**
     * Computes the scalar projection of b onto a.
     * @param {vec2} a
     * @param {vec2} b
     * @return {vec2}
     */
    var scalarProjection = function(a, b) {
        var aDotB = dot(a, b);
        var aLength = length(a);

        return aDotB/aLength;
    };



    /**
     * Computes a scaled vector.
     * @param {vec2} v
     * @param {number} scalar
     * @return {vec2}
     */
    var scale = function(v, scalar) {
        var result = [];

        for(var i=0; i<v.length; i++) {
            result[i] = v[i]*scalar;
        }
        return result;
    };


    /**
     * Computes the difference of two vectors.
     * @param {vec} a
     * @param {vec} b
     * @return {vec}
     */
    var sub = function(a, b) {
        var result = [];
        for(var i=0; i<a.length; i++) {
            result.push(a[i] - b[i]);
        }
        return result;
    };


    /**
     * Returns the vector from pt1 to pt2.
     * @param {vec} pt1
     * @param {vec} pt2
     * @return {vec}
     */
    var vec = function(pt1, pt2) {
        var result = [];
        for(var i=0; i<pt1.length; i++) {
            result.push( pt2[i] - pt1[i] );
        }

        return result;
    };


    // The exposed API.
    return {
        add: add,
        clone: clone,
        cross: cross,
        degree: degree,
        dist: dist,
        dot: dot,
        equal: equal,
        length: length,
        normalize: normalize,
        projection: projection,
        ptLineDist: ptLineDist,
        ptSegDist: ptSegDist,
        scalarProjection: scalarProjection,
        scale: scale,
        sub: sub,
        vec: vec
    };
})();
(function() {
    /**
     * A 3-tuple representing a point of intersection between two line segments.
     * The first element is a Vector representing the point of intersection in
     * 2D homogenous coordinates.
     * The second element is the parametric coefficient for the intersection
     * along the first segment.
     * The third element is the parametric coefficient for the intersection
     * along the second segment.
     * @typedef {Array} Intersection
     */

    /**
     * A vector used to define a homogeneous point or a direction.
     * @typedef {number[]} Vector
     */

    /**
     * A line segment defined by two homogenous 2D points.
     * @typdef {Vector[]} Segment
     */


        // Initialize the script's state if it hasn't already been initialized.
    state.PathSplitter = state.PathSplitter || {
        splitPathColor: '#ff00ff' // pink
    };


    function _getSplitSegmentPaths(mainSegments, splitSegments) {
        var resultSegPaths = [];
        var curPathSegs = [];

        _.each(mainSegments, function(seg1) {

            // Find the points of intersection and their parametric coefficients.
            var intersections = [];
            _.each(splitSegments, function(seg2) {
                var i = _segmentIntersection(seg1, seg2);
                if(i)
                    intersections.push(i);
            });

            if(intersections.length > 0) {
                // Sort the intersections in the order that they appear along seg1.
                intersections.sort(function(a, b) {
                    return a[1] - b[1];
                });

                var lastPt = seg1[0];
                _.each(intersections, function(i) {
                    // Complete the current segment path.
                    curPathSegs.push([lastPt, i[0]]);
                    resultSegPaths.push(curPathSegs);

                    // Start a new segment path.
                    curPathSegs = [];
                    lastPt = i[0];
                });
                curPathSegs.push([lastPt, seg1[1]]);
            }
            else {
                curPathSegs.push(seg1);
            }
        });
        resultSegPaths.push(curPathSegs);

        return resultSegPaths;
    };

    /**
     * Computes the intersection between two homogenous 2D line segments,
     * if it exists.
     *
     * Explanation of the fancy mathemagics:
     * Let A be the first point in seg1 and B be the second point in seg1.
     * Let C be the first point in seg2 and D be the second point in seg2.
     * Let U be the vector from A to B.
     * Let V be the vector from C to D.
     *
     * Observe that if the dot product of U and V is 1 or -1, then
     * seg1 and seg2 are parallel, so they will either never intersect or they
     * will overlap. We will ignore the case where seg1 and seg2 are parallel.
     *
     * We can represent any point P along the line projected by seg1 as
     * P = A + SU, where S is some scalar value such that S = 0 yeilds A,
     * S = 1 yields B, and P is on seg1 if and only if 0 <= S <= 1.
     *
     * We can also represent any point Q along the line projected by seg2 as
     * Q = C + TV, where T is some scalar value such that T = 0 yeilds C,
     * T = 1 yields D, and Q is on seg2 if and only if 0 <= T <= 1.
     *
     * Assume that seg1 and seg2 are not parallel and that their
     * projected lines intersect at some point P.
     * Therefore, we have A + SU = C + TV.
     *
     * We can rearrange this such that we have C - A = SU - TV.
     * Let vector W = C - A, thus W = SU - TV.
     * Also, let coeffs = [S, T, 1].
     *
     * We can now represent this system of equations as the matrix
     * multiplication problem W = M * coeffs, where in column-major
     * form, M = [U, -V, [0,0,1]].
     *
     * By matrix-multiplying both sides by M^-1, we get
     * M^-1 * W = M^-1 * M * coeffs = coeffs, from which we can extract the
     * values for S and T.
     *
     * We can now get the point of intersection on the projected lines of seg1
     * and seg2 by substituting S in P = A + SU or T in Q = C + TV.
     * Seg1 and seg2 also intersect at that point if and only if 0 <= S, T <= 1.
     *
     * @param {Segment} seg1
     * @param {Segment} seg2
     * @return {Intersection}
     *      The point of intersection in homogenous 2D coordiantes and its
     *      parametric coefficients along seg1 and seg2,
     *      or undefined if the segments are parallel.
     */
    function _segmentIntersection(seg1, seg2) {
        var u = VecMath.sub(seg1[1], seg1[0]);
        var v = VecMath.sub(seg2[1], seg2[0]);
        var w = VecMath.sub(seg2[0], seg1[0]);

        // Can't use 0-length vectors.
        if(VecMath.length(u) === 0 || VecMath.length(v) === 0)
            return undefined;

        // If the two segments are parallel, then either they never intersect
        // or they overlap. Either way, return undefined in this case.
        var uvDot = VecMath.dot(u,v);
        if(Math.abs(uvDot) === 1)
            return undefined;

        // Build the inverse matrix for getting the intersection point's
        // parametric coefficients along the projected segments.
        var m = [[u[0], u[1], 0], [-v[0], -v[1], 0], [0, 0, 1]];
        var mInv = MatrixMath.inverse(m);

        // Get the parametric coefficients for getting the point of intersection
        // on the projected semgents.
        var coeffs = MatrixMath.multiply(mInv, w);
        var s = coeffs[0];
        var t = coeffs[1];

        // Return the intersection only if it lies on both the segments.
        if(s >= 0 && s <= 1 && t >= 0 && t <= 1) {
            var uPrime = VecMath.scale(u, s);
            return [VecMath.add(seg1[0], uPrime), s, t];
        }
        else
            return undefined;
    };

    /**
     * Splits mainPath at its intersections with splitPath. The original path
     * is removed, being replaced by the new split up paths.
     * @param {Path} mainPath
     * @param {Path} splitPath
     * @return {Path[]}
     */
    function splitPathAtIntersections(mainPath, splitPath) {
        var mainSegments = PathMath.toSegments(mainPath);
        var splitSegments = PathMath.toSegments(splitPath);
        var segmentPaths = _getSplitSegmentPaths(mainSegments, splitSegments);

        // Convert the list of segment paths into paths.
        var _pageid = mainPath.get('_pageid');
        var controlledby = mainPath.get('controlledby');
        var fill = mainPath.get('fill');
        var layer = mainPath.get('layer');
        var stroke = mainPath.get('stroke');
        var stroke_width = mainPath.get('stroke_width');

        var results = [];
        _.each(segmentPaths, function(segments) {
            var pathData = PathMath.segmentsToPath(segments);
            _.extend(pathData, {
                _pageid: _pageid,
                controlledby: controlledby,
                fill: fill,
                layer: layer,
                stroke: stroke,
                stroke_width: stroke_width
            });
            var path = createObj('path', pathData);
            results.push(path);
        });

        // Remove the original path and the splitPath.
        mainPath.remove();
        splitPath.remove();

        return results;
    }

    on('chat:message', function(msg) {
        if(msg.type === 'api' && msg.content.indexOf('!pathSplitColor') === 0) {
            try {
                var selected = msg.selected;
                var path = findObjs({
                    _type: 'path',
                    _id: selected[0]._id
                })[0];

                var stroke = path.get('stroke');
                state.PathSplitter.splitPathColor = stroke;
            }
            catch(err) {
                log('!pathSplitColor ERROR: ', err.message)
            }
        }
        else if(msg.type === 'api' && msg.content.indexOf('!pathSplit')  === 0) {
            try {
                var selected = msg.selected;
                var path1 = findObjs({
                    _type: 'path',
                    _id: selected[0]._id
                })[0];
                var path2 = findObjs({
                    _type: 'path',
                    _id: selected[1]._id
                })[0];

                // Determine which path is the main path and which is the
                // splitting path.
                var mainPath, splitPath;
                if(path1.get('stroke') === state.PathSplitter.splitPathColor) {
                    mainPath = path2;
                    splitPath = path1;
                }
                else if(path2.get('stroke') === state.PathSplitter.splitPathColor) {
                    mainPath = path1;
                    splitPath = path2;
                }
                else {
                    throw new Error('No splitting path selected.');
                }
                var newPaths = splitPathAtIntersections(mainPath, splitPath);
            }
            catch(err) {
                log('!pathSplit ERROR: ', err.message)
            }
        }
    });
})();
// }}}

// 5e XP tracker. {{{
// Implements the commands:
//   !xp
//     - Shows the current status of the party xp.
//   !xp set players X
//     - Sets the number of players to X.
//   !xp set X
//     - Sets the amount of total earned XP by the party to X.
//   !xp add X
//     - Adds X to the total amount of XP earned by the party.
//   !xp reset
//     - Resets to 4 players, 0 xp.
(function() {
    if(!state.xp5e) {
        state.xp5e = {
            xp: 0,
            players: 4
        };
    }

    var xptable = [0, 300, 900, 2700, 6500, 14000, 23000, 34000, 48000, 64000, 85000, 100000, 120000, 140000, 165000, 195000, 225000, 265000, 305000, 355000];

    on('chat:message', function(msg) {
        if(msg.type != "api") return;
        if(!msg.content.startsWith("!xp")) return;
        msg = _.clone(msg);
        msg.content = msg.content.replace("!xp", "").trim().toLowerCase();
        var args = msg.content.split(' ');
        var message = undefined;
        var arg = undefined;
        if(args[0] == "") {
            message = "{{G}} {{XP Overview}} {{**Players:** " + state.xp5e.players + "\\n**Party XP:** " + state.xp5e.xp + "}} ";
            var currxp = state.xp5e.xp / state.xp5e.players;
            var nextxp = 0;
            var level = 0;
            for(var i = 18; i >= 0; --i) {
                if(currxp >= xptable[i]) {
                    level = i+1;
                    nextxp = xptable[i+1];
                    break;
                }
            }
            if(state.xp5e.xp >= xptable[19]) {
                message += "{{The party is at the maximum level.}}";
            } else {
                message += "{{**Level:** " + level + "\\n**Individual XP:** " + currxp + "/" + nextxp + "}}";
            }
            sendFormatted(message, {who: "XP"});
            return;
        } else if(args[0] == "set" && args.length >= 2) {
            if(args[1] == "players") {
                if(args.length < 3) return;
                arg = parseInt(args[2]);
                if(isNaN(arg) || arg <= 0) return;
                state.xp5e.players = arg;
                sendChat('XP', '/w gm Set number of players to ' + arg + '.');
            } else {
                arg = parseInt(args[1]);
                if(isNaN(arg)) return;
                state.xp5e.xp = arg;
                sendChat('XP', '/w gm Set XP to ' + arg + '.');
            }
            return;
        } else if(args[0] == "add" && args.length >= 2) {
            arg = parseInt(args[1]);
            if(isNaN(arg)) return;
            state.xp5e.xp += arg;
            sendChat('XP', '/w gm Incremented party XP by ' + arg + '.');
            return;
        } else if(args[0] == "reset") {
            state.xp5e.xp = 0;
            state.xp5e.players = 4;
            sendChat('XP', '/w gm XP tracker has been reset.');
        }
    });
})();
// }}}

// vim: fdm=marker