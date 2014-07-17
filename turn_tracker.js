on("chat:message", function (msg) {
    var togglelayer = function () {
        _.each(msg.selected, function (selected) {
            var obj = getObj("graphic", selected._id);
            if (obj.get("_subtype") != "token") return;

            if (obj.get("layer") == "objects") {
                obj.set("layer", "gmlayer");
                return;
            }

            if (obj.get("layer") == "gmlayer") {
                obj.set("layer", "objects");
                return;
            }
        });
    }

    var reorder = function () {
        var turnorder;
        if (Campaign().get("turnorder") == "")
            turnorder = [];
        else
            turnorder = JSON.parse(Campaign().get("turnorder"));

        turnorder.sort(function (a, b) {
            if (parseFloat(b.pr) == parseFloat(a.pr)) {
                if (a.custom != "" && b.custom != "")
                    return parseFloat(b.custom) - parseFloat(a.custom);
                else
                    return 0;
            } else {
                return parseFloat(b.pr) - parseFloat(a.pr);
            }
        });

        Campaign().set("turnorder", JSON.stringify(turnorder));
    };

    var clear = function () {
        var turnorder = [];
        Campaign().set("turnorder", JSON.stringify(turnorder));
        Campaign().set("initiativepage", false);
        sendChat("IR", "/desc <b>Combat ends.</b>");
    }

    var init = function () {
        sendChat("IR", "/desc <b>Rolling for initiative.</b>");
        Campaign().set("initiativepage", false);

        var currentPageGraphics = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            _layer: "objects",
        });
        
        var turnorder = [];

        _.each(currentPageGraphics, function (obj) {
            var currId = obj.get("represents") || "";
            var currChar = getObj("character", currId) || "";
            
            var objId = obj.get("_id");
            var currentModifier = 0;
            var totalValue = 0;
            var diceRoll = randomInteger(20);

            // If the current token represents a character.
            if (currChar.length != 0) {
                // Set the modifier.
                var mod = findObjs({
                    name: "initiative",
                    _characterid: currId,
                }, {caseInsensitive: true});
                if (mod.length != 0) {
                    currentModifier = parseInt(mod[0].get("current"));
                    if (isNaN(currentModifier)) currentModifier = 0;
                }
                
                // Set the roll result and give feedback.
                totalValue = diceRoll + currentModifier;
                var printableModifier = (currentModifier > 0 ? "+" + currentModifier : currentModifier);
                sendChat("character|" + currId, "/me rolls " + totalValue + " (1d20(" + diceRoll + ")" + printableModifier + ") for initiative!");
            // For NPC tokens.
            } else {
                // Set the modifier.
                currentModifier = obj.get("bar3_value") || "0";
                currentModifier = parseInt(currentModifier);
                if(isNaN(currentModifier))
                    currentModifier = 0;
                    
                // Set the roll result.
                totalValue = diceRoll + currentModifier;
            }
            
            // Push the value.
            turnorder.push({
                id: objId,
                pr: totalValue,
                custom: currentModifier,
            });
        });
        
        Campaign().set("turnorder", JSON.stringify(turnorder));
        reorder();
        Campaign().set("initiativepage", Campaign().get("playerpageid"));
        
        sendChat("IR", "/desc <b>Combat begins!</b>");
    };

    if (msg.type == "api" && msg.content.indexOf("!order") !== -1 && msg.who.indexOf("(GM)") !== -1) {
        reorder();
    }

    if (msg.type == "api" && msg.content.indexOf("!init") !== -1 && msg.who.indexOf("(GM)") !== -1) {
        init();
    }

    if (msg.type == "api" && msg.content.indexOf("!clear") !== -1 && msg.who.indexOf("(GM)") !== -1) {
        clear();
    }

    if (msg.type == "api" && msg.content.indexOf("!togglelayer") !== -1 && msg.who.indexOf("(GM)") !== -1) {
        togglelayer();
    }
});