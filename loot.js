// Globals, utility functions. {{{
var titleStyleR = "font-family: Georgia; font-size: large; font-weight: normal"+
    "; text-align: center; vertical-align: middle; padding: 5px 0px; margin-to"+
    "p: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color"+
    ": #FFF; background-color: #400;";
var titleStyleG = "font-family: Georgia; font-size: large; font-weight: normal"+
    "; text-align: center; vertical-align: middle; padding: 5px 0px; margin-to"+
    "p: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color"+
    ": #FFF; background-color: #040;";
var titleStyleB = "font-family: Georgia; font-size: large; font-weight: normal"+
    "; text-align: center; vertical-align: middle; padding: 5px 0px; margin-to"+
    "p: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color"+
    ": #FFF; background-color: #004;";
var rowStyle = " padding: 5px; border-left: 1px solid #000; border-right: 1px "+
    "solid #000; border-radius: 0px; ";
var lastRowStyle = " padding: 5px; border-left: 1px solid #000; border-bottom:"+
    " 1px solid #000; border-right: 1px solid #000; border-radius: 0px 0px 10p"+
    "x 10px; ";
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
var sendNextMessageToGm = false;

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
    sendNextMessageToGm = false;
    
    var msgcontent = message;

    var msgcontent = msgcontent.replace(new RegExp("__B__", 'ig'), "<b>");
    var msgcontent = msgcontent.replace(new RegExp("__EB__", 'ig'), "</b>");
    var msgcontent = msgcontent.replace(new RegExp("__C__", 'ig'), "<div style"+
            "=\"text-align: center;\">");
    var msgcontent = msgcontent.replace(new RegExp("__EC__", 'ig'), "</div>");
    var msgcontent = msgcontent.replace(new RegExp("__I__", 'ig'), "<i>");
    var msgcontent = msgcontent.replace(new RegExp("__EI__", 'ig'), "</i>");
    var msgcontent = msgcontent.replace(new RegExp("__S__", 'ig'), "<small>");
    var msgcontent = msgcontent.replace(new RegExp("__ES__", 'ig'), "</small>");
    var msgcontent = msgcontent.replace(new RegExp("__U__", 'ig'), "<u>");
    var msgcontent = msgcontent.replace(new RegExp("__EU__", 'ig'), "</u>");
    var msgcontent = msgcontent.replace(new RegExp("__NAME__", 'ig'), msg.who);
    var msgcontent = msgcontent.replace(new RegExp("__BR__", 'ig'), "<br/>");
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

    if(toGm)
        sendChat(msg.who, "/w gm " + message);
    else
        sendChat(msg.who, message);
};

var sendError = function(error, source) {
    sendFormatted('R|||Error|||' + error, {who: source});
};
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
    }

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
                    " json {\"money\": &lt;number&gt;, \"items\": [&lt;string"+
                    "&gt;, &lt;string&gt;, ...]}__EB__|||"+
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

// vim: fdm=marker

