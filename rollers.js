if(!('contains' in String.prototype)) {
    String.prototype.contains = function(str, startIndex) {
        return ''.indexOf.call(this, str, startIndex) !== -1;
    };
}

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
