// Globals, utility functions.
var titleStyleR = "font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: " +
    "middle; padding: 5px 0px; margin-top: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color: " +
    "#FFF; background-color: #400;";
var titleStyleG = "font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: " +
    "middle; padding: 5px 0px; margin-top: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color: " +
    "#FFF; background-color: #040;";
var titleStyleB = "font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: " +
    "middle; padding: 5px 0px; margin-top: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color: " +
    "#FFF; background-color: #004;";
var rowStyle = " padding: 5px; border-left: 1px solid #000; border-right: 1px solid #000; border-radius: 0px; ";
var lastRowStyle = " padding: 5px; border-left: 1px solid #000; border-bottom: 1px solid #000; border-right: 1px " +
    "solid #000; border-radius: 0px 0px 10px 10px; ";
var oddRow = " background-color: #CEC7B6; color: #000;";
var evenRow = " background-color: #B6AB91; color: #000;";
var titleTagR = "<div style =\"" + titleStyleR + "\">";
var titleTagG = "<div style =\"" + titleStyleG + "\">";
var titleTagB = "<div style =\"" + titleStyleB + "\">";
var oddTag = "<div style =\"" + rowStyle + oddRow + "\">";
var evenTag = "<div style =\"" + rowStyle + evenRow + "\">";
var lastOddTag = "<div style =\"" + lastRowStyle + oddRow + "\">";
var lastEvenTag = "<div style =\"" + lastRowStyle + evenRow + "\">";
var endTag = "</div>";

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
    var msgcontent = message;

    var msgcontent = msgcontent.replace(new RegExp("__B__", 'g'), "<b>");
    var msgcontent = msgcontent.replace(new RegExp("__EB__", 'g'), "</b>");
    var msgcontent = msgcontent.replace(new RegExp("__C__", 'g'), "<div style=\"text-align: center;\">");
    var msgcontent = msgcontent.replace(new RegExp("__EC__", 'g'), "</div>");
    var msgcontent = msgcontent.replace(new RegExp("__I__", 'g'), "<i>");
    var msgcontent = msgcontent.replace(new RegExp("__EI__", 'g'), "</i>");
    var msgcontent = msgcontent.replace(new RegExp("__S__", 'g'), "<small>");
    var msgcontent = msgcontent.replace(new RegExp("__ES__", 'g'), "</small>");
    var msgcontent = msgcontent.replace(new RegExp("__U__", 'g'), "<u>");
    var msgcontent = msgcontent.replace(new RegExp("__EU__", 'g'), "</u>");
    var msgcontent = msgcontent.replace(new RegExp("__NAME__", 'g'), msg.who);
    var msgcontent = msgcontent.replace(new RegExp("__BR__", 'g'), "<br/>");
    var messagercv = msgcontent.split("|||");
    if(messagercv.length < 2) return;

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
        ++ctr;
    }

    var message = "";
    message = message + title + messagercv[ctr] + endTag;
    ++ctr;

    while(ctr < messagercv.length) {
        var last = ctr == messagercv.length - 1;
        var tag = "";
        if(last)
            tag = (ctr % 2 == changed ? lastOddTag : lastEvenTag); else
            tag = (ctr % 2 == changed ? oddTag : evenTag);
        message = message + tag + messagercv[ctr] + endTag;
        ++ctr;
    }

    sendChat(msg.who, message);
};

// Turn tracker.
// Implements the commands:
//   !togglelayer
//     - Toggles the layer of the selected tokens between the GM layer and the Token layer.
//   !order
//     - Reorders the current turn tracker.
//   !eot
//     - Ends the current turn, rotate shifts the turn tracker up.
//   !init
//     - Rolls initiative for all visible tokens (Init modifier is looked up by either the "initiative" attribute or
//       the value of Bar 3.
//   !clear
//     - Clears the turn order.
on("chat:message", function(msg) {
    if(msg.type != "api") return;

    var togglelayer = function() {
        _.each(msg.selected, function(selected) {
            var obj = getObj("graphic", selected._id);
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
        if(Campaign().get("turnorder") == "") turnorder = ""; else turnorder = JSON.parse(Campaign().get("turnorder"));

        if(turnorder == "")
            return;

        var item = turnorder.shift();
        if(typeof item.custom == 'string' && item.custom.indexOf("---") !== -1) {
            sendChat("IR", "/desc " + item.custom);
            item.custom = item.custom.replace(/(\d+)/, function(fullMatch, n) {
                return String(Number(n) + 1);
            });
            turnorder.push(item);
        } else {
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
        sendChat("IR", "/desc <b>Combat ends.</b>");
    };

    var init = function() {
        sendChat("IR", "/desc <b>Combat begins!</b>");
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
                var printableModifier = (currentModifier > 0 ? "+" + currentModifier : currentModifier);
                sendChat("character|" + currId,
                        "/me rolls " + totalValue + " (1d20(" + diceRoll + ")" + printableModifier +
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
            pr:     "",
            custom: "--- ROUND 2 ---",
        });
        Campaign().set("turnorder", JSON.stringify(turnorder));
        reorder();
        Campaign().set("initiativepage", Campaign().get("playerpageid"));
        sendChat("IR", "/desc --- ROUND 1 ---");
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

// Template manager
// Implements the commands:
//   !t
//   !template
//     - Allows a player to summon a template token, they must exist somewhere obviously.
//     - The token gets placed on the first selected token, if any, or in the top right of the map.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    var sender = msg.who.split(" ")[0];

    if(msg.content == "!t" || msg.content == "!template") {
        sendChat("Template Spawner", "/w " + sender + " Usage:<br/>!t [15|30|60] cone<br/>!t [5|10|15|20|30|40] burst");
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

        //parse input string, cone or burst?
        if(msg.content.indexOf("cone") !== -1) {
            // 15, 30 or 60?
            if(msg.content.indexOf("15") !== -1) {
                sendChat("Template Spawner", "/w " + sender + " Spawning 15ft. cones.");
                createObj("graphic", {
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
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 30ft. cones.");
                createObj("graphic", {
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
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 60ft. cones.");
                createObj("graphic", {
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
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " No cone available in that size.");
            }
        } else if(msg.content.indexOf("burst") !== -1) {
            // 5, 10 or 20?
            if(msg.content.indexOf(" 5") !== -1) {
                sendChat("Template Spawner", "/w " + sender + " Spawning 5ft. burst.");
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 10ft. burst.");
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 15ft. burst.");
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 20ft. burst.");
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 30ft. burst.");
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " Spawning 40ft. burst.");
                createObj("graphic", {
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
                sendChat("Template Spawner", "/w " + sender + " No burst available in that size.");
            }
        } else {
            sendChat("Template Spawner",
                    "/w " + sender + " Usage:<br/>!t [15|30|60] cone<br/>!t [5|10|15|20|30|40] burst");
        }
    }
});

// Card manager
// Implements the commands:
//   !card
//     - Display an arbitrary message in a pretty display.
//   !levelup
//     - Displays level up instructions in a pretty display.
//   !scroll
//     - Allows players to calculate scroll scribing costs.
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    var message = "";
    var sender = msg.who.split(" ")[0];

    if(msg.content == "!card") {
        sendChat("Card", "/w " + sender + " Usage:<br/>!card|||[R|G|B]|||Title|||Row 1|||Row 2|||Row 3...<br/>" +
            "Several markup tags are available, see the code.");
        return;
    }

    if(msg.content.startsWith("!card|||")) {
        var msgcontent = msg.content;

        if(msg.inlinerolls) {
            for(var i = 0; i < msg.inlinerolls.length; ++i) {
                msgcontent = msgcontent.replace("$[[" + i + "]]", "[[" + msg.inlinerolls[i].expression + "]]");
            }
        }

        msgcontent = msgcontent.replace("!card|||", "");

        sendFormatted(msgcontent, msg);
        return;
    }

    if(msg.content == "!levelup") {
        sendChat(msg.who, "/desc You leveled up!");
        message = message + titleTagR + "Level up checklist" + endTag;
        message = message + oddTag + "HP: You gain HDmax/2 + 1 plus your CON modifier as HP." + endTag;
        message = message + evenTag + "Base Attack Bonus: Update your BAB and update the related calculations (melee " +
            "to-hit, range to-hit, CMD, CMB)." + endTag;
        message = message + oddTag + "Saving throws: Update your saving throws." + endTag;
        message = message + evenTag + "Class features: Add your newly gained class features, and update the old ones " +
            "that get upgraded at higher levels." + endTag;
        message = message + oddTag + "Skill ranks: Spend your newly gained skillpoints." + endTag;
        message = message + evenTag + "Feats: Gain a feat on level 3, 5, 7, 9, 11, 13, 15, 17 and 19. Some classes " +
            "get extra feats from specific lists at other levels." + endTag;
        message = message + oddTag + "FC bonus: If you took a level in your favored class, you get either one extra " +
            "HP, one extra skill point, or a third option given by your archetype." + endTag;
        message = message + evenTag + "Spells: Spellcasters gain new spells and/or spell slots every level." + endTag;
        message = message + oddTag + "Ability score increase: At level 4, 8, 12, 16 and 20 you gain a +1 in one " +
            "ability score." + endTag;
        message = message + evenTag + "Hero Point: At every level you gain a Hero Point. If you already have 3 " +
            "Hero Points, you do not get one." + endTag;
        message = message + lastOddTag + "Derived statistics: Go over your character sheet and make sure all attack " +
            "and damage rolls, your saving throw DCs for your spells and special abilities, your ability score " +
            "modifiers and your AC are all up-to-date." + endTag;
        sendChat(msg.who, message);
        return;
    }

    if(msg.content == "!scroll") {
        sendChat("Scroll Cost Calculator", "/w " + sender + " Usage:<br/>!scroll spelllevel casterlevel materialcosts");
        return;
    }

    if(msg.content.startsWith("!scroll")) {
        var messagercv = msg.content.split(" ");
        if(messagercv.length < 4) return;
        var level = parseInt(messagercv[1]);
        var cl = parseInt(messagercv[2]);
        var mats = parseInt(messagercv[3]);
        if(isNaN(level) || isNaN(cl) || isNaN(mats)) return;
        if(level == 0) level = 0.5;
        var price = 12.5 * level * cl;
        price += mats;

        var timeunit = "";
        if(price <= 750) {
            timeunit = "hours";
        } else if(price >= 2000) {
            timeunit = "days";
        } else {
            timeunit = "day";
        }

        var time = 1;
        if(price <= 750) {
            if(price <= 250)
                time = 2; else if(price <= 500)
                time = 4; else
                time = 6;
        } else {
            if(price < 2000) {
                time = 1;
            } else {
                time = Math.floor(price / 1000);
            }
        }

        message = "Scribe scoll__BR____S____NAME____ES__";
        message = message + "|||Scribing a scroll with a level [[" + level + "]] spell at caster level [[" + cl + "]].";
        message = message + "|||This will cost [[" + price + "]] gp and take [[" + time + "]] " + timeunit + ".";
        message = message + "|||The spellcraft to succeed is DC [[5+" + cl + "]], or DC [[10+" + cl + "]] to halve " +
            "the time taken. This check is made after the money and time is spent.";
        sendFormatted(message, msg);
    }
});

// Rollers
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
            sendChat("Blind Roller", "/w " + sender + " Blind roll sent to GM <br/><small>(" + roll + ")</small>.");
            sendChat(msg.who, "/gmroll " + roll + " from " + msg.who);
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
        var diceRoll = randomInteger(20);
        var modifier = parseInt(args[0]);
        var result = diceRoll + modifier;
        var target = parseInt(args[1]);
        var descriptor = "";
        for(var i = 2; i < args.length; ++i)
            descriptor += args[i] + " ";

        if(result >= target) {
            sendFormatted("R|||Monster Attack|||I roll a [[" + result + "]] ([[" + diceRoll + "]] on the die) vs." +
                descriptor + "([[" + target + "]])||| The attack hits.", msg);
        } else {
            sendFormatted("G|||Monster Attack|||I roll a [[" + result + "]] ([[" + diceRoll + "]] on the die) vs." +
                descriptor + "([[" + target + "]])||| The attack misses.", msg);
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

        message = "R|||Monster Damage|||The monster hits " + selected + " for [[" + dice + "]] damage.";
        sendFormatted(message, msg);
        return;
    }

    if(msg.content.startsWith("!a ") || msg.content.startsWith("!attack ")) {
        messagercv = msg.content.split(" ");
        if(messagercv.length < 2) return;
        roll = messagercv[1];

        message = "B|||To Hit Roll__BR____S____NAME____ES__|||I roll [[" + roll + "]] to hit.";
        sendFormatted(message, msg);
        return;
    }

    if(msg.content.startsWith("!d ") || msg.content.startsWith("!damage ")) {
        messagercv = msg.content.split(" ");
        if(messagercv.length < 2) return;
        roll = messagercv[1];

        message = "R|||Damage__BR____S____NAME____ES__|||I do [[" + roll + "]] points of damage.";
        sendFormatted(message, msg);
    }
});

// Crit/Fumble generator.
// Implements the commands:
//   !crit [bludgeoning|piercing|slashing|magic]
//   !fumble [magic|melee|ranged|natural]
on("chat:message", function(msg) {
    if(msg.type != "api") return;
    var critBludgeonName = [
        "Shattered Hand", "Rattled", "Thunder Strike", "Lights Out", "Crushed Trachea", "Split Open", "Feeble Parry",
        "Surprise Opening", "Back Breaker", "Terrible Bruise", "Broken Leg", "Spun Around", "Where Am I?",
        "To Your Thinky Bits", "Crunch", "Armor Dent", "Breathless", "Mace to da Face", "Tiring Blow", "Concussion",
        "Ruptured Spleen", "Solid Blow", "Crumpling Blow", "Collapsed Lung", "Flat Foot", "Skull Crush",
        "And Stay Down!", "Bone Masher", "2 for 1", "Crushed Intestines", "Numbing Blow", "Roundhouse",
        "Staggering Blow", "My Teef!", "Earth Rumble", "Pimp Slap", "Cracked Rib", "Box the Ears", "Bell Ringer",
        "Momentum", "Broken nose", "Broken Ribs", "Knockback", "Low Blow", "Brained", "Shield Smack", "I See Stars",
        "Nighty Night", "Cracked Knee", "What's Going On?", "Crushed Toe", "Off Balance"
    ];
    var critBludgeonEffect = [
        "Normal damage and [[1d2]] Con and Str damage. Hand useless until healed",
        "Normal damage and target is confused for [[1d3]] rounds (Fort negates)|||Save DC is the result of the" +
            " confirmation roll", "Double damage and target is deafened for [[1d4]] rounds",
        "Normal damage and target is blinded for [[1d3]] rounds",
        "Normal damage and target cannot breathe or speak, DC 20 Heal check ends condition",
        "Double damage and [[1d4]] bleed", "Double damage and target is disarmed (1 item)",
        "Double damage and one free attack against the target with a -5 penalty",
        "Double damage and [[1d6]] Dex damage", "Double damage and [[2d6]] nonlethal damage",
        "Normal damage and [[1d4]] Con and Dex damage. Target's speeds are reduced by half until healed",
        "Normal damage and target is flat-footed for 1 round", "Normal damage and target is stunned for 1 round",
        "Double damage and 1 Int bleed (Fort negates save each round)|||Save DC is the result of the confirmation" +
            " roll",
        "Double damage and target is nauseated for 1 round (Fort negates)|||Save DC is the result of the confirmation" +
            " roll", "Double damage and [[2d6]] damage to metal armor (ignore hardness)",
        "Normal damage and target is exhausted for [[1d4]] rounds",
        "Normal damage and target dazed and blinded for 1 round", "Double damage plus target is fatigued",
        "Normal damage and [[1d2]] Int and Wis damage",
        "Normal damage and [[1d6]] bleed. This bleed can only be cured with magic", "Triple damage",
        "Double damage and target is knocked prone", "Normal damage and target is staggered for [[1d6]] rounds",
        "Double damage and 1 Dex damage and target's speeds are reduced by 5 feet until healed",
        "Double damage and [[2d6]] Int drain (Fort half)|||Save DC is the result of the confirmation roll",
        "Normal damage and target is knocked prone and stunned for 1 round (Fort negates stun)|||Save DC is the" +
            " result of the confirmation roll",
        "Normal damage and either [[1d3]] Dex damage and halve speed (leg) or [[1d3]] Str damage (arm). Limb" +
            " useless until healed", "Double damage to target and normal damage to adjacent target",
        "Normal damage and [[1d4]] Con bleed (DC 15 Fort negates, save each round)",
        "Normal damage and [[1d4]] Dex damage and target is disarmed (1 item, Ref negates drop)|||Save DC is the" +
            " result of the confirmation roll",
        "Normal damage and a free attack against adjacent foes at the same bonus",
        "Normal damage and double nonlethal damage",
        "Normal damage and 1 Con damage. Target loses bite, gains 20% spell failure chance for verbal spells",
        "Normal damage and a free trip attempt versus target and all adjacent enemies",
        "Normal damage and target dazed for [[1d4]] rounds",
        "Normal damage and [[1d3]] Con damage and target is fatigued",
        "Normal damage and target deafened for [[1d4]] hours",
        "Normal damage and [[1d2]] Int damage and sickened for [[1d4]] rounds",
        "Double damage and +2 on all your attack rolls for 1 round", "Normal damage and 1 Cha damage and 1 bleed",
        "Double damage and target cannot heal naturally for [[1d4]] days",
        "Double damage and target is pushed [[1d6]] squares directly away",
        "Normal damage and target is sickened for [[1d6]] rounds",
        "Double damage and target can take only one move or standard action next round",
        "Double damage and target's shield is disarmed",
        "Normal damage and target takes a 20% miss chance for [[1d4]] rounds",
        "Normal damage and target is unconscious for [[1d4]] rounds (Fort negates)|||Save DC is the result of the" +
            " confirmation roll",
        "Normal damage and [[1d2]] Dex damage. Target's base land speed reduced to 10 feet until healed",
        "Double damage and [[1d4]] hours of target's memory erased",
        "Normal damage and [[1d4]] Dex damage. Target's land speed is halved until healed",
        "Normal damage and target provokes attacks of opportunity from all threatening opponents"
    ];
    var critMagicName = [
        "Time Vortex", "Maximum Effect", "Draining Spell", "Wild Surge", "Excruciating", "Terrifying Display",
        "Dispelling Aura", "Concussive Spell", "Knockback", "I Love You, Man", "Electrocuted", "Hypnotic Link",
        "Frozen", "Side Effect", "Turned Around", "Stunned", "Call of the Wind", "Petrified", "Pretty Colors",
        "Nerve Damage", "Arcane Blast", "Planar Rift", "Eyeburn", "Intense Strike", "Transposition", "Light Blast",
        "Conduit", "Lingering Magic", "Allergic Reaction", "Arcane Glow", "Combustion", "Unnatural Selection",
        "Corrosive", "Funny Bone", "Phased", "Life Leech", "Siren Song", "Distraction", "Arcane Goo", "Hoarder's Wrath",
        "Mind Cloud", "Elemental Call", "Splash Spell", "Olfactory Overload", "Cut off from Magic",
        "Aura of Protection", "Vulnerability", "Roaring Spell", "Returning Spell", "Power Surge", "Vampiric Magic",
        "Shrink Ray"
    ];
    var critMagicEffect = [
        "Normal damage and target vanishes, reappearing [[1d4]] rounds later", "Maximize all spell variables",
        "Double damage and target randomly loses one spell or one use of a spell-like ability",
        "Normal damage and normal damage of a random energy type",
        "Normal damage and target is sickened for [[1d6]] rounds",
        "Normal damage and target frightened for [[1d4]] rounds (Will negates)|||Save DC is the result of the" +
            " confirmation roll", "Normal damage and dispel magic on the target", "Double damage and [[1d4]] bleed",
        "Double damage and target is pushed [[1d6]] squares directly away",
        "Normal damage and target is charmed for 3 rounds (Will negates)|||Save DC is the result of the confirmation" +
            " roll", "Double damage. If electricity spell, target stunned for [[1d4]] rounds",
        "Double damage and you may give the target 1 suggestion (as the spell. Will negates)|||Save DC is the" +
            " result of the confirmation roll", "Double damage. If cold spell, target takes [[1d4]] Dex damage",
        "Double damage and you become invisible for [[1d4]] rounds",
        "Double damage and target can take only one move or standard action next round",
        "Normal damage and target is stunned for 1 round",
        "Double damage or triple damage to animals, fey, magical beasts, and vermin",
        "Normal damage and target is petrified for [[1d4]] hours (Fort negates)|||Save DC is the result of the" +
            " confirmation roll", "Double damage and target is dazzled for [[1d4]] rounds",
        "Normal damage and target is slow for [[1d6]]" + " rounds",
        "Double damage and [[2d6]] random energy damage (Reflex half)|||Save DC is the result of the confirmation" +
            " roll",
        "Normal damage and target sent to a random plane (Will negates)|||Save DC is the result of the confirmation" +
            " roll",
        "Normal damage and target blinded for [[1d4]] rounds (Fort negates)|||Save DC is the result of the" +
            " confirmation roll", "Double damage and ignore energy resistance (but not immunity)",
        "Double damage and you and target switch places", "Double damage and target is blinded for 1 round",
        "Double damage and target takes a -4 penalty on saves vs. your spells for [[1d6]] rounds",
        "Normal damage this round and half damage each round for [[1d4]] rounds",
        "Double damage and [[1d4]] damage to a random ability score",
        "Double damage and target glows like faerie fire for [[1d6]] rounds",
        "Double damage. If fire spell, target catches fire, taking [[2d6]] fire damage per round until extinguished",
        "Double damage or triple damage to aberrations and outsiders",
        "Double damage. If acid spell, target takes [[2d6]] acid damage for [[1d4]] rounds",
        "Double damage and target spends 1 round laughing (as hideous laughter spell, Will negates)|||Save DC is the" +
            " result of the confirmation roll",
        "Double damage and target is incorporeal for [[1d3]] rounds (Will negates)|||Save DC is the result of the" +
            " confirmation roll",
        "Normal damage and 1 negative level (Fort negates after 1 day)|||Save DC is the result of the confirmation" +
            " roll", "Double damage or triple damage to giants, humanoids and monstrous humanoids",
        "Double damage and an illusion appears to attack foe, flanking him for you for [[1d6]] rounds",
        "Normal damage and target is entangled (DC 20 Str or Escape Artist to be freed)",
        "Double damage or triple damage to dragons", "Double damage and target is dazed for 1 round",
        "Normal damage. If elemental spell, Medium elemental appears to serve for [[1d4]] rounds",
        "Normal damage and half damage to all adjacent targets",
        "Double damage and target loses scent and blindsense for 1 day",
        "Normal damage and target cannot cast spells or use spell-like abilities for [[1d4]] rounds",
        "Double damage and +4 to your AC for 1 round",
        "Double damage and if the spell did elemental damage the target is now vulnerable to that element for 3 rounds",
        "Double damage and target is deafened for [[1d4]] rounds", "Double damage and spell is not lost",
        "Triple damage", "Normal damage. You are healed the same amount",
        "Normal damage and target is reduced for 3 rounds (as Reduce person, Will negates)|||Save DC is the" +
            " result of the confirmation roll"
    ];
    var critPiercingName = [
        "Leg Wound", "Grazing Hit", "Knockback", "Vulnerable Spot", "Bleeder", "Heart Shot", "Deep Wound",
        "Ragged Wound", "Sucking Chest Wound", "Lodged in the Bone", "Momentum", "Pinned Arm", "Punctured Lung",
        "Ventilated", "Hand Wound", "Pinhole", "Perfect Strike", "Nerve Cluster", "Penetrating Wound",
        "Kidney Piercing", "Achilles Heel", "Spinal Tap", "In a Row", "Blown Back", "Appendicitis", "Javelin Catcher",
        "Cheek Pierced", "Calf Hole", "Painful Poke", "Pierced", "Tenacious Wound", "Muscles Severed", "Infection",
        "Overreaction", "Spun Around", "Eye Patch for You", "Forearm Piercing", "Clean Through", "Surprise Opening",
        "Organ Scramble", "Deep Hurting", "Tongue Piercing", "Shoulder Wound", "Left Reeling", "Elbow pierced",
        "Bicep Wound", "Nailed in Place", "Guarded Strike", "Right in the Ear", "Chipped Bone", "Stinger",
        "Nicked an artery"
    ];
    var critPiercingEffect = [
        "Double damage and target's land speed is halved for [[1d4]] rounds",
        "Normal damage and target is stunned for 1 round",
        "Double damage and target is pushed [[1d6]] squares directly away",
        "Normal damage and target takes [[1d4]] ability damage of your choice", "Double damage and [[1d6]] Bleed",
        "Triple damage and 1 Con bleed",
        "Double damage and target is nauseated for 1 round (Fort negates)|||Save DC is the result of the" +
            " confirmation roll", "Normal damage and [[1d8]] bleed",
        "Double damage and target is exhausted (Fort negates)|||Save DC is the result of the confirmation roll",
        "Double damage and 2 bleed. This bleed requires a DC 20 Heal check to stop",
        "Double damage and +2 on all your attack rolls for 1 round",
        "Double damage and one arm cannot move (DC 20 Str or Heal to be freed)",
        "Double damage and target begins to drown 3 round later. DC 20 Fort save each round to end effect",
        "Double damage and [[2d6]] nonlethal damage",
        "Normal damage and [[1d2]] Dex damage. -4 penalty on all rolls using that hand until healed",
        "Double damage and 1 bleed. Target takes 1 additional bleed each round until healed", "Triple Damage",
        "Normal damage and target is stunned for [[1d6]] rounds (Fort save each round to act)",
        "Double damage and ignore DR",
        "Double damage and target sickened for [[2d4]] round (Fort negates)|||Save DC is the result of the" +
            " confirmation roll",
        "Normal damage and [[1d2]] Dex damage. Target's speeds are reduced by half until healed",
        "Normal damage and -4 penalty on attack rolls, skill checks and ability checks for [[1d4]] rounds",
        "Double damage to target and normal damage to adjacent target", "Double damage and target is knocked prone",
        "Double damage and target is poisoned (treat as greenblood oil: 1 Con damage/round for 4 rounds, Fort DC 13" +
            " Save to cure)", "Double damage and [[1d6]] bleed if from ranged attack",
        "Normal damage and [[1d4]] bleed. Target gains 50% spell failure chance for verbal spells until healed",
        "Normal damage and [[1d4]] Dex damage",
        "Double damage and target can take only one move or standard action until next round",
        "Double damage and target is dazed for 1 round",
        "Normal damage and [[1d2]] Con damage. Target does not heal this damage naturally",
        "Normal damage and [[1d6]] Dex and [[1d6]] Str damage",
        "Double damage and target contracts filth fever (Fort negates)|||Save DC is the result of the confirmation" +
            " roll", "Normal damage and target provokes attacks of opportunity from all threatening opponents",
        "Normal damage and target is flat footed for 1 round",
        "Triple damage and [[1d2]] Con drain. -4 Perception and ranged attacks until healed",
        "Double damage and target is disarmed (1 item)", "Normal damage and [[1d6]] bleed and 1 Con drain",
        "Double damage and one free attack against the target with a -5 penalty",
        "Double damage and [[1d6]] Con damage", "Double damage and target is fatigued",
        "Normal damage and 1 Con damage. Target gains 50% spell failure chance for verbal spells until healed",
        "Double damage and [[1d2]] Str and Dex damage",
        "Double damage and target takes a -2 penalty to AC for [[1d4]] rounds",
        "Double damage and target drops whatever is being held (1 item)", "Normal damage and [[1d4]] Str damage",
        "Double damage and target cannot move (DC 20 Str check negates)", "Double damage and +4 to your AC for 1 round",
        "Normal damage and 1 Int damage and 1 bleed", "Double damage and 1 Dex damage",
        "Normal damage and target is sickened for [[1d6]] rounds", "Normal damage and [[2d6]] bleed"
    ];
    var critSlashingName = [
        "Carve your Initials", "Missing Digits", "Hack and Slash", "Stand Aside", "Severed Tendon", "Decapitation",
        "Bewildering Display", "Long Gash", "Shattered Jaw", "Hamstring", "Brow to Chin", "Gut Slash", "Wing Tear",
        "Missing Ear", "Wide Open", "We've Got a Bleeder", "Throat Slash", "Parrying Strike", "Lean into the Blow",
        "Flay", "Paper Cut", "Severed Hand", "Flat Blade Thwack", "Surprise Opening", "Broad Swipe", "Disembowel",
        "Sapping Slash", "Rupture Abdominal Cavity", "Muscle Wound", "Fingertipped", "Bad Parry", "Nerve Slice",
        "Weapon Strike", "Tangled", "Momentum", "Lip Cut", "Gory", "Across the Eyes", "Ugly Wound", "Knockback",
        "Pain and Simple", "Cut Straps", "Severed Spine", "Overhand Chop", "Delayed Wound", "Brow Cut", "Leg Swipe",
        "Terrible Gash", "Shield Cleave", "Armor Damage", "Swing Through", "Spun Around"
    ];
    var critSlashingEffect = [
            "Normal damage and target suffers from humiliation and may only attack you (Will negates)|||Save DC is the" +
            " result of the confirmation roll",
            "Normal damage and target loses [[1d3]] fingers and takes 1 Con and Str drain (Fort negates)|||Save DC is" +
                " the result of the confirmation roll",
            "Double damage and all critical threats against target automatically confirm for the next 3 rounds",
            "Double damage and push target 1 square in any direction", "Normal damage and [[1d6]] Dex damage",
            "Double damage and death (Fort negates)|||Save DC is the result of the confirmation roll",
            "Double damage and target takes a -2 penalty to AC for [[1d4]] rounds",
            "Normal damage and 8 bleed. A successful Heal check cuts the bleeding in half, rather than ending it",
            "Normal damage and 1 Con damage. Target cannot speak or bite until healed",
            "Normal damage and [[1d2]] Dex damage and target is knocked prone",
            "Normal damage and 1 Con and Cha damage. -2 penalty on Perception and ranged attacks until healed",
            "Double damage and [[1d4]] bleed. Target cannot swallow whole",
            "Double damage and target loses flight if it uses wings",
            "Normal damage and 1 Cha drain. -4 penalty on Listen check until healed",
            "Normal damage and target provokes attacks of opportunity from all threatening opponents",
            "Normal damage and [[2d6]] bleed",
            "Normal damage and [[2d6]] bleed. Target cannot talk or breathe while bleeding",
            "Double damage and +4 to your AC for 1 round", "Triple damage, but you drop your weapon",
            "Normal damage plus [[1d6]] Str damage",
            "Normal damage and -4 penalty on attack rolls, skill checks and ability checks for [[1d4]] rounds",
            "Normal damage and target loses hand and takes [[1d3]] Con and Str drain (Fort negates)|||Save DC is the" +
                " result of the confirmation roll", "Triple damage but all damage is nonlethal",
            "Double damage and one free attack against the target with a -5 penalty", "Normal damage and [[1d8]] bleed",
            "Double damage and [[1d4]] Con damage and [[1d6]] bleed", "Double damage and target is fatigued",
            "Double damage and 1 Con bleed", "Double damage and [[1d2]] Str damage",
            "Normal damage and 1 Dex damage. Target cannot use one hand until healed",
            "Double damage and target is disarmed (1 item)",
            "Double damage and target can take only one move or standard action next round",
            "Double damage and normal damage to target's weapon",
            "Double damage and you may automatically grapple the target",
            "Double damage and +2 on all your attack rolls for 1 round",
            "Double damage and 1 bleed. Target gains 20% spell failure chance for verbal spells until healed",
            "Normal damage and target is sickened for [[1d6]] rounds",
            "Normal damage and target permanently blinded (Ref negates)|||Save DC is the result of the confirmation roll",
            "Normal damage and [[1d3]] Cha damage and 1 Cha drain (Fort negates drain)|||Save DC is the result of the" +
                " confirmation roll", "Double damage and target is pushed [[1d6]] squares directly away",
            "Double damage and [[2d6]] nonlethal damage",
            "Double damage and double armor check penalty until fixed (DC 15 Craft)",
            "Double damage and [[3d6]] Dex damage (Fort halves)|||Save DC is the result of the confirmation roll",
            "Double damage and [[1d4]] bleed",
            "Normal damage and target takes bleed damage equal to your normal damage",
            "Normal damage and [[1d4]] bleed. Target blinded while bleeding",
            "Double damage and target is knocked prone", "Double damage and 1 Cha drain",
            "Double damage and normal damage to target's shield", "Double damage and normal damage to target's armor",
            "Double damage and one free attack against an adjacent foe at the same bonus",
            "Normal damage and target is flat-footed for 1 round"
    ];

    var fumbleMagicName = [
        "Wild Magic", "Magic Fatigue", "You made Him Stronger", "Clatto Verata Necktie", "Hit by the Ugly Forest",
        "The Magic is Gone", "Can you hear me now?", "Error!", "Why Me?", "Left Reeling", "Nothing to Fear",
        "Bleeding Eyes", "Acidic Backlash", "Backblast", "Arcane Fire", "Electrical Feedback", "Cursed",
        "You made him faster", "You made him tougher", "Vertigo", "Apprentice Move", "Not me, You fool!",
        "Tiring Spell", "Tangled", "Nose Bleed", "Weakened", "Poor Trade", "Distance Rift", "Mind Drain", "Cold Snap",
        "Caster's Block", "You made him bigger", "Weak-Minded Fool", "Power Down", "Mental Slip", "Power Transfer",
        "Magical Vacuum", "Blastoff", "It's Sparkly", "Now I see you…", "Unexpected Blast", "Jumbled Components",
        "Spell Shield", "Side Effect", "This is Hard", "Magical Smackdown", "Reflection", "Monster Rift",
        "Fragmented Magic", "How did that happen?", "Energy Transfer", "Power Drain"
    ];
    var fumbleMagicEffect = [
        "Roll twice on the Rod of Wonder table (UE 185)", "You cannot cast any spells for 1 round",
        "The target gains a +8 enhancement bonus to Str for [[1d4]] rounds",
        "Your attack hits the nearest ally and is a critical threat. You must roll to confirm the critical hit",
        "You take 1 point of Cha bleed", "You take a -4 penalty to attack rolls until you score a critical hit",
        "You are deafened until healed (DC 15 Heal check)", "The attack deals damage to you instead of the target",
        "You provoke an attack of opportunity from all threatening foes",
        "You are stunned for 1 round (Fort negates)|||Save DC is AC of target", "You are shaken for [[2d4]] rounds",
        "You take [[1d6]] points of bleed", "You take [[2d6]] points of acid damage",
        "The attack hits you and is a critical threat. You must roll to confirm the critical hit",
        "You take [[2d6]] points of fire damage", "You take [[2d6]] points of electricity damage",
        "You take a -4 penalty on attack rolls, saves, skill checks, and ability checks. This effect can only be" +
            " cured with remove curse", "The target is hasted for [[1d4]] rounds",
        "The target gains DR 5/- for [[1d4]] rounds", "You are sickened for [[1d4]] rounds",
        "Reroll attack against creature nearest the target (yourself excluded)",
        "Your attack hits your ally closest to the target", "You are fatigued",
        "You become entangled in your gear until you spend a standard action to free yourself",
        "You take 1 point of bleed", "You take a -2 penalty to all your Spell DCs for [[1d4]] minutes",
        "The attack hits you but you must lose a spell or slot of the highest available level (your choice)",
        "You are teleported the nearest square adjacent to the target",
        "You take [[1d4]] points of damage to Int, Wis, or Cha (determined randomly)",
        "You take [[2d6]] points of cold damage", "You cannot cast this spell for 24 hours",
        "Target increases one size category for [[1d4]] rounds", "You take 1 point of Wis bleed",
        "You take 1 point of Int bleed", "On his next turn, your target may give you one suggestion",
        "The highest level spell effect on you is transferred to your target",
        "[[1d3]] spell effects active on you are dispelled (determined randomly)",
        "You are thrown [[1d6]]x10 feet into the air (or in a random direction if flying) (Will negates)|||Save DC" +
            " is AC of target", "You are blinded for 1 round", "Your target becomes invisible for [[1d4]] rounds",
        "The spell affects all targets within 30 feet of you. You are immune to this effect",
        "You can only take a move action next round",
        "The target gains SR equal to 11 + your caster level for [[1d6]] rounds",
        "One of your magic items permanently gains a random drawback (CRB 538)", "You take 1 point of Con damage",
        "You automatically fail your next saving throw",
        "The spell hits you instead of the target (normal saves apply)",
        "Your spell is converted to a summon monster spell of the same level. The monster attacks you",
        "[[1d4]]+2 mirror images spring up around your target. These images last for 1 minute or until destroyed",
        "A stinking cloud appears, centered on you",
        "Lose one randomly determined spell or spell slot. Your target can cast this spell next round",
        "You lose one prepared spell or spell slot (determined randomly)"
    ];
    var fumbleMeleeName = [
        "Butterfingers", "Catch your breath", "Stuck", "Backswing", "Slipped", "This sword is too heavy",
        "Awkward Attack", "Overextend", "Pulled Muscle", "Fling", "Broken Blade", "Notched",
        "Parry! Dodge! Spin! Thrust!", "Hand it over", "Shield Crash", "Winded", "Wide Open", "Critical Mistake",
        "Strain", "Too Much Stuff", "Spinning Swing", "I told you it was sharp", "Pin Prick", "Off Balance", "Sorry",
        "Bonk", "Catastrophic Failure", "Pointy End Goes There", "Broken Haft", "Fog of War", "Go For The Eyes", "Punt",
        "Bad Grip", "Who Was That", "You Meant to do That", "Eat Dirt", "Second Thoughts", "Attack the Darkness",
        "Wait! What?", "Wrong End", "Vibration", "No Way", "Funny Bone", "Bent", "All or Nothing", "Surrounded by Foes",
        "On the Receiving End", "Bohemian Earspoon", "Better to Give", "Cutter", "This is Bad", "Armor Smash"
    ];
    var fumbleMeleeEffect = [
        "Drop your weapon", "You can only take a move action next round",
        "Your weapon is stuck in a nearby surface. DC 20 Str check to free it",
        "The attack deals damage to you instead of the target", "You are knocked prone", "You are fatigued",
        "You take -2 penalty to AC for [[1d4]] rounds",
        "You provoke an attack of opportunity from all adjacent opponents", "You take [[1d4]] points of Str damage",
        "You drop your weapon and it lands [[1d6]] squares away in a random direction",
        "Your weapon is destroyed (Ref Negates) Magic weapons use their own save bonus (CRB 459)|||Save DC is AC of" +
            " target", "Your weapon takes [[1d6]] points of damage, ignoring hardness", "You are dazed for 1 round",
        "Your target gains possession of your weapon (Ref Negates)|||Save DC is AC of target",
        "Your attack deals damage to your shield", "You are exhausted (Fort negates)|||Save DC is AC of target",
        "You are flat-footed for 1 round",
        "The attack hits you and is a critical threat. You must roll to confirm the critical hit",
        "You take [[1d4]] points of Dex damage",
        "You become entangled in your gear until you spend a standard action to free yourself",
        "You are sickened for [[1d4]] rounds", "You take [[1d6]] points of bleed", "You take 1 point of bleed",
        "You take a -4 penalty on all attack rolls for 1 round",
        "Your attack hits an ally adjacent to you or the target",
        "You are stunned for 1 round (Fort Negates)|||Save DC is AC of target",
        "You fall unconscious for [[1d6]] rounds (Will negates)|||Save DC is AC of target",
        "You take 1 point of Con damage",
        "Your weapon loses reach. You have a -4 penalty on attack rolls with it until repaired (DC 20 Craft check)",
        "You threaten no square for [[1d6]] rounds", "You are blinded for 1 round",
        "Your weapon flies [[2d6]] squares in a random direction",
        "Your weapon deals nonlethal damage for the next 3 rounds", "You are dazed for [[1d3]] rounds",
        "Move 10 feet in a random direction and provoke attacks of opportunity as normal",
        "You fall prone and are blinded for [[1d3]] rounds (Fort Negates)|||Save DC is AC of target",
        "You are sickened for [[1d6]] rounds", "All your enemies have concealment from you for [[1d4]] rounds",
        "You are confused for 1 round",
        "If you're using a slashing weapon, you take [[1d6]] points of damage and 1 point of bleed",
        "If you're using a bludgeoning weapon, you take [[1d3]] of Str damage and drop your weapon",
        "Your attack hits the target, but deals minimum damage", "You drop whatever is in your off hand",
        "You take -4 penalty on all attacks with this weapon until it is repaired (DC 20 Craft Check)",
        "You take a -1 penalty on attack rolls until you score a critical hit",
        "Your attack hits an ally within reach and is a critical threat. You must roll to confirm the critical hit",
        "The attack deals damage to you instead of the target", "You are deafened until healed (DC 15 Heal Check)",
        "You attack damages you instead. Use your target's Str modifier", "You take 1 point of Str bleed",
        "You take an amount of bleed equal to your Str bonus (minimum 1)", "Your attack deals damage to your armor"
    ];
    var fumbleNaturalName = [
        "Tripped", "Bruised Ego", "Awkward Attack", "Tiring Attack", "Upset Tummy", "I Bit My Tug", "Muscle Tear",
        "Stinging Failure", "Smash the Floor", "He's Sharp", "Torn Muscle", "Got Too Close", "Off Balance",
        "He Bit Your Fist", "Fist Meets Face", "Out of Position", "Wide Open", "Bleeding Fist", "Twisted",
        "Stop Hitting Yourself", "Just a Taste", "Overextend", "Frustration", "Broken Tooth", "Not the Weak Point",
        "That Tastes Awful!", "Broke a Nail", "Sprain", "Overexertion", "Don't Pick At It", "We have a Wiener", "Whiff",
        "Jam a Finger", "Caught Your Attack", "Pins & Needles", "Great Roar", "Head, Meet Wall", "Ferocious Fumble",
        "Sneeze!", "Ingrown Nail", "Whirlwind of Shame", "Battered", "Winds of Change", "Unintentional Move",
        "Eye Strain", "Hangnail", "Brutal Collision", "Pinched Nerve", "Overthink It", "Punctured Foot", "Bone Bruise",
        "Bad Headbutt"
    ];
    var fumbleNaturalEffect = [
        "You are knocked prone", "You can attack no other target for [[1d4]] rounds (or until the target is dead)]",
        "You take a -2 penalty to AC for [[1d4]] rounds", "You are fatigued", "You are sickened for [[1d4]] rounds",
        "You take 1 point of bleed", "You take [[1d4]] points of Str damage",
        "You take [[1d6]] points of nonlethal damage and a -2 penalty on attack rolls with that attack for [[1d4]]" +
            " rounds", "You kick up dust that blinds you for [[1d4]] rounds (Fort negates)|||Save DC is AC of target",
        "You take [[1d6]] points of damage & your Str modifier",
        "You take 1 point of Str drain (Fort negates)|||Save DC is AC of target",
        "Your attack hits the target but the target may start a grapple against you for free",
        "You can only take a move action next round", "The target deals bite damage to you",
        "The attack hits you and is a critical threat. You must roll to confirm the critical hit",
        "You cannot use this attack for 1 round", "You are flat-footed for 1 round", "You take [[1d6]] points of bleed",
        "You become entangled in your gear until you spend a standard action to free yourself",
        "The attack deals damage to you instead of the target",
        "Your attack hits an ally adjacent to you or the target",
        "You provoke an attack of opportunity from all adjacent opponents",
        "You take a -4 penalty on all attack rolls for 1 round",
        "You take a -2 penalty on attack rolls for [[1d6]] minutes",
        "Your enemy's armor takes [[1d6]] points of damage. You take [[1d6]] points of damage and cannot use that " +
            "attack for [[1d3]] rounds", "If this was a bite attack, you are nauseated for [[1d6]] rounds",
        "You take [[1d4]] points of damage and you cannot use this attack until healed",
        "You take [[1d4]] points of Dex damage", "You are exhausted (Fort Negates)", "You take 1 point of Con damage",
        "You fall unconscious for [[1d6]] round (Will Negates)", "The attack deals damage to you instead of the target",
        "Your target takes normal damage, you take double damage",
        "The target may attempt to trip, bull rush or overrun you (target's choice)",
        "You are sickened for [[1d6]] rounds", "You are deafened until healed (DC 15 Heal Check)",
        "You are dazed for [[1d3]] rounds",
        "Your attack hits an ally within reach and is a critical threat. You must roll to confirm the critical hit",
        "You are dazed for 1 round", "You take a -1 penalty on attack rolls until you score a critical hit",
        "Your attack deals damage to all targets adjacent to you except the original target",
        "You take a -2 penalty on skill checks and saves for [[1d4]] hours",
        "You threaten no squares for [[1d6]] rounds",
        "Move 10 feet in a random direction and provoke attacks of opportunity as normal",
        "You are blinded for 1 round",
        "If this was a claw attack, slam or unarmed strike, you cannot use that attack for [[1d6]] rounds",
        "Your attack hits, but you are stunned for 2 rounds (For save reduces the stun to 1 round)",
        "If you had reach greater than 5 feet, it is reduced to 5 feet for 3 rounds",
        "Your target's armor and natural armor bonuses are doubled against you for 3 rounds",
        "You take [[1d3]] points of damage and your speed is halved until healed",
        "You take [[1d2]] point of Con damage", "You are stunned for 1 round (Fort negates)|||Save DC is AC of target"
    ];
    var fumbleRangedName = [
        "Mix it Up", "Aim Carefully Next Time", "Don't Hit Me!", "Phantom Wind", "Recoil", "Amazing Miss",
        "Not My Pony", "Double Miss", "Close to the Ear", "Insecure", "In the Line of Fire", "Lowered Guard",
        "Weapon Jam", "Um, oops", "What are the Odds?", "Lost Grip", "Pinch in Parts", "So much Blood", "Huh?",
        "Seeing Double", "Misjudged the distance", "Overcompensate", "Friendly Fire", "Lost the Target",
        "Shot Your Foot", "Overthrow", "Tunnel Vision", "All Thumbs", "Bull's Eye", "Bad Alignment", "Cracked",
        "Whoops!", "Tied Up", "Sprain", "Nicked", "Klutz", "Spilled Ammo", "Head Rush", "My Spleeny Bits!",
        "Notched Fingers", "Torn Tendon", "Broken", "Everything you Got", "Snapped String", "Wrong Weapon",
        "Archer's Elbow", "Wide Open", "Backfire", "Errant Aim", "You'll Shoot Your Eye Out", "Arching Back",
        "Awkward Attack"
    ];
    var fumbleRangedEffect = [
        "You are unable to make ranged attacks for the next [[1d6]] rounds",
        "For 3 rounds, you must spend a full round action to make a single attack",
        "For 3 rounds, you take an additional -2 penalty on ranged attacks for each ally in melee combat with your" +
            " target",
        "You compensate for a breeze which isn't there. You take -2 penalty on ranged attack rolls for 3 rounds",
        "You move backward 1 square and fall prone",
        "You are stunned for 1 round (Fort negates)|||Save DC is AC of target",
        "Your attack hits the nearest allied animal or mount", "You use twice as much ammunition on this attack",
        "You are deafened until healed (DC 15 Heal Check)",
        "You take a -1 penalty on attack rolls for [[1d4]] rounds or until you score a critical hit",
        "Your attack hits the nearest ally and is a critical threat. You must roll to confirm the critical hit",
        "You provoke attacks of opportunity from all threatening foes",
        "If using a projectile weapon it does not function. Spend 1 standard action to clear",
        "The attack deals damage to you instead of the target",
        "If you made a thrown attack, you hit the target, but the weapon ends up in the target's possession",
        "You can only take a move action next round", "You take [[1d6]] points of damage",
        "You are sickened for [[1d6]] rounds", "You are confused for 1 round",
        "All your attacks have a 50% miss chance for 1 round",
        "All attack rolls beyond the first ranged increment have triple the normal distance penalty for 3 rounds",
        "All targets with cover gain an additional +4 bonus to AC against you for 3 rounds",
        "Your attack hits your ally closest to the target", "You take a -4 penalty on all attack rolls for 1 round",
        "You take [[1d2]] points of Dex damage and your speed is reduced by half until healed",
        "If attack was made with a thrown weapon, the weapon travels 5 times its range increment in a random direction",
        "For the next 3 rounds, you have a +1 bonus on attack rolls, but you flat-footed",
        "You lose your Dex bonus on attack rolls for 3 rounds",
        "Your shot ricochets and hits you near the eye. You are blinded for 1 round",
        "You take -4 penalty on all attacks with this weapon until repaired (DC 20 Craft check)",
        "Your weapon (not ammunition) takes [[1d6]] points of damage, ignoring hardness", "You are knocked prone",
        "You become entangled in your gear until you spend a standard action to free yourself",
        "You take [[1d4]] points of Dex damage", "You take 1 point of bleed", "You drop your weapon",
        "Your ammunition falls from its container and takes [[1d6]] rounds to gather up",
        "You are sickened for [[1d4]] rounds", "You take 1 point of Con damage", "You take [[1d6]] points of bleed",
        "You take 1 point of Dex bleed",
        "Your weapon is destroyed (Ref negates). Magic weapons use their own save bonus (CRB 459)|||Save DC is AC of" +
            " target", "You are exhausted (Fort negates)|||Save DC is AC of target",
        "If attack was made with a bow or crossbow, the string breaks and requires [[1d3]] round to fix",
        "If you made a thrown attack, you throw a random object from your gear",
        "You take a -2 penalty on all ranged attack rolls for [[1d4]] minutes", "You are flat-footed for 1 round",
        "The attack deals damage to you instead of the target",
        "Reroll attack against creature nearest the target (yourself excluded)",
        "The attack hits you and is a critical threat. You must roll to confirm the critical hit", "You are fatigued",
        "You take -2 penalty to AC for [[1d4]] rounds"
    ];

    var sender = msg.who.split(" ")[0];
    if(msg.content == "!c" || msg.content == "!crit") {
        sendChat("Crit Deck", "/w " + sender + " Usage:<br/>!crit [bludgeoning|piercing|slashing|magic]");
    } else if(msg.content == "!f" || msg.content == "!fumble") {
        sendChat("Fumble Deck", "/w " + sender + " Usage:<br/>!fumble [melee|ranged|natural|magic]");
    }

    var messagercv = msg.content.split(" ");
    if(messagercv.length < 2) return;
    var type = messagercv[1];
    var names = [];
    var effects = [];
    var kind = "Error";
    var randomNum = 0;
    var messge = "";

    if(msg.content.startsWith("!c ") || msg.content.startsWith("!crit ")) {
        if(type.toLowerCase().startsWith("b")) {
            names = critBludgeonName;
            effects = critBludgeonEffect;
            kind = "Bludgeoning";
        } else if(type.toLowerCase().startsWith("p")) {
            names = critPiercingName;
            effects = critPiercingEffect;
            kind = "Piercing";
        } else if(type.toLowerCase().startsWith("s")) {
            names = critSlashingName;
            effects = critSlashingEffect;
            kind = "Slashing";
        } else if(type.toLowerCase().startsWith("m")) {
            names = critMagicName;
            effects = critMagicEffect;
            kind = "Magic";
        } else {
            names = ["Incorrect Type"];
            effects = ["You fumbled the command: __B__!crit [bludgeoning|piercing|slashing|magic]__EB__"];
        }

        randomNum = _.random(names.length - 1);

        message =
            "G|||Critical Hit!__BR____S__" + kind + "__ES__|||__B____C__" + names[randomNum] + "__EC____EB____BR__" +
            effects[randomNum];
        sendFormatted(message, msg);
        return;
    }

    if(msg.content.startsWith("!f ") || msg.content.startsWith("!fumble ")) {
        if(type.toLowerCase().startsWith("me")) {
            names = fumbleMeleeName;
            effects = fumbleMeleeEffect;
            kind = "Melee";
        } else if(type.toLowerCase().startsWith("n")) {
            names = fumbleNaturalName;
            effects = fumbleNaturalEffect;
            kind = "Natural";
        } else if(type.toLowerCase().startsWith("r")) {
            names = fumbleRangedName;
            effects = fumbleRangedEffect;
            kind = "Ranged";
        } else if(type.toLowerCase().startsWith("ma")) {
            names = fumbleMagicName;
            effects = fumbleMagicEffect;
            kind = "Magic";
        } else {
            names = ["Incorrect Type"];
            effects = ["You fumbled the command: __B__!fumble [melee|ranged|natural|magic]__EB__"];
        }

        randomNum = _.random(names.length - 1);

        message =
            "R|||Critical Fumble!__BR____S__" + kind + "__ES__|||__B____C__" + names[randomNum] + "__EC____EB____BR__" +
            effects[randomNum];
        sendFormatted(message, msg);
    }
});