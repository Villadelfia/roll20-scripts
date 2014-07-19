if(!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

var inspired = inspired || {};

on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(msg.content.contains("!blindroll ")) {
        var roll = msg.content.replace("!blindroll ", "").trim();
        if(roll.length > 0) {
            while(roll.contains("++")) {
                roll = roll.replace("++", "+");
            }
            while(roll.contains("+-")) {
                roll = roll.replace("+-", "-");
            }
            sendChat(msg.who, "Blind roll sent to GM <br/><small>(" + roll + ")</small>.");
            sendChat(msg.who, "/gmroll " + roll + " from " + msg.who);
        }
    }
});

on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(msg.content.contains("!vs ")) {
        var roll = msg.content.replace("!vs ", "").trim();
        var args = roll.split(" ");
        var diceRoll = randomInteger(20);
        var modifier = parseInt(args[0]);
        var result = diceRoll + modifier;
        var target = parseInt(args[1]);
        var descriptor = args[2];
        
        if(result >= target) {
            sendChat(msg.who, "/me rolls " + result + " (1d20("+diceRoll+")+"+modifier+") vs. " + descriptor + " (" + target + "), and hits.");
        } else {
            sendChat(msg.who, "/me rolls " + result + " (1d20("+diceRoll+")+"+modifier+") vs. " + descriptor + " (" + target + "), and misses.");
        }
    }
});

on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(msg.content.contains("!damage ")) {
        var roll = msg.content.replace("!damage ", "").trim();
        var args = roll.split(" ");
        var dice = args[0];

        var selected = msg.selected || "";
        if(selected.length != 0 && selected[0]._type == "graphic") {
            var obj = getObj(selected[0]._type, selected[0]._id);
            selected = obj.get("name");
        }
        
        sendChat(msg.who, "/me hits "+selected+" for [["+dice+"]] damage.");
    }
});

on("chat:message", function(msg) {
    if(msg.type != "api") return;
    if(msg.content.contains("!rigroll ")) {
        var parts = msg.content.replace("!rigroll ", "").split(":");
        var roll = parts[0];
        var temp = roll.split("d");
        var numdice = temp[0];
        var faces = temp[1];
        var modifier = parts[1];
        var values = parts[2].split(",");
        var formulaStyle = "font-size:inherit;display:inline;padding:4px;background:white;border-radius:3px;";
        var totalStyle = formulaStyle;
        totalStyle += "border:1px solid #d1d1d1;cursor:move;font-size:1.4em;font-weight:bold;color:black;line-height:2.0em;";

        formulaStyle += "border:1px solid #d1d1d1;font-size:1.1em;line-height:2.0em;word-wrap:break-word;";
        var clearStyle = "clear:both";
        var formattedFormulaStyle = "display:block;float:left;padding:0 4px 0 4px;margin:5px 0 5px 0";
        var dicegroupingStyle = "display:inline";
        var uisortableStyle = "cursor:move";
        var rolledStyle = "cursor:move;font-weight:bold;color:black;font-size:1.4em";
        var uidraggableStyle = "cursor:move";
        
        var html = "<div style=\"" + formulaStyle + "\"> rolling " + numdice + "d" + faces + modifier + " </div>";
        html += "<div style=\"" + clearStyle + "\"></div>";
        html += "<div style=\"" + formulaStyle + ";" + formattedFormulaStyle + "\">";
        html += "   <div style=\"" + dicegroupingStyle + ";" + uisortableStyle + "\" data-groupindex=\"0\">";
        var total = 0;
        html += "      (";
        for(var i = 0; i < numdice; i++) {
            var value = values[i];
            var color="black";
            if (value == "1") {
                color="#730505";
            }
            else if (value == faces) {
                color="#247305";
            }
            var didrollStyle = "text-shadow:-1px -1px 1px #fff,1px -1px 1px #fff,-1px 1px 1px #fff,1px 1px 1px #fff;z-index:2;position:relative;color:"+color+";height:30px;min-height:29px;margin-top:-3px;top:0;text-align:center;font size=16px;font-family:sans-serif;";
            var dicerollStyle = "display:inline-block;font-size:1.2em;font-family:san-sarif" + faces;
            var diconStyle = "display:inline-block;min-width:30px;text-align:center;position:relative";
            var backingStyle = "position:absolute;top:-2px;left:0;width:100%;text-align:center;font-size:30px;color:#8fb1d9;text-shadow:0 0 3px #8fb1d9;opacity:.75;pointer-events:none;z-index:1";
            html += "       <div data-origindex=\"0\" style=\"" + dicerollStyle + "\" class=\"diceroll d" + faces + "\">";
            html += "          <div style=\"" + diconStyle + "\">";
            html += "             <div class=\"backing\"></div>"
            html += "             <div style=\"" + didrollStyle + "\">"
            total += eval(value);
            if ((value=="1")||(value==faces)){
                html+= "<strong>"
            }
            html += value;
            if ((value=="1")||(value==faces)){
                html+= "</strong>"
            }
            html += "</div>";
            html += "             <div style=\"" + backingStyle + "\"></div>";
            html += "          </div>";
            html += "       </div>";
            if(i == numdice - 1) html += ")";
            else html += "+";
        }
        html += "   </div>";
        total = eval(total + modifier);
        html += modifier;
        html += "</div>";
        html += "<div style=\"" + clearStyle + "\"></div><strong> = </strong><div style=\"" + totalStyle + ";" + uidraggableStyle + "\"><strong><font size=\"6\"> " + total + "</strong> </div>";
        
        sendChat(msg.who, "/direct " + html);
        sendChat("Roll20", "/w gm " + roll + " was rigged to have values " + values.join() + ".");
    }
});
