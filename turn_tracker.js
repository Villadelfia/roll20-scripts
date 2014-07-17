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
    }

    var init = function () {
        clear();

        var currentPageGraphics = findObjs({
            _pageid: Campaign().get("playerpageid"),
            _type: "graphic",
            _subtype: "token",
            _layer: "objects",
        });

        _.each(currentPageGraphics, function (obj) {
            var currId = obj.get("represents") || "";
            var currChar = getObj("character", currId) || "";

            // If the current token represents a character.
            if (currChar.length != 0) {
                // Try and find the character stat.
                var mod = findObjs({
                    name: "initiative",
                    _characterid: currId,
                }, {
                    caseInsensitive: true
                });

                // Get an initiative value.
                var result;
                var modifier = 0;
                if (mod.length != 0) {
                    modifier = parseInt(mod[0].get("current"));
                    if (isNaN(modifier)) modifier = 0;
                }

                sendChat("character|" + currId, "/roll 1d20" + (modifier > 0 ? "+" : "") + modifier, function (ops) {
                    var rollResult = JSON.parse(ops[0].content);
                    //If this code stops working, uncomment following line and debug from there:
                    //log(rollResult);
                    var totalValue = parseFloat(rollResult.total);
                    var usedModifier = parseFloat(rollResult.rolls[1].expr);
                    var diceRoll = parseFloat(rollResult.rolls[0].results[0].v);

                    var turnorder;
                    if (Campaign().get("turnorder") == "")
                        turnorder = [];
                    else
                        turnorder = JSON.parse(Campaign().get("turnorder"));

                    turnorder.push({
                        id: obj.get("_id"),
                        pr: totalValue,
                        custom: usedModifier,
                    });

                    turnorder.sort(function (a, b) {
                        if (parseFloat(b.pr) == parseFloat(a.pr))
                            return parseFloat(b.custom) - parseFloat(a.custom);
                        else
                            return parseFloat(b.pr) - parseFloat(a.pr);
                    });

                    Campaign().set("turnorder", JSON.stringify(turnorder));

                    usedModifier = (usedModifier > 0 ? "+" + usedModifier : usedModifier);

                    sendChat("character|" + currId, "/me rolls " + totalValue + " (1d20(" + diceRoll + ")" + usedModifier + ") for initiative!");
                });
            } else {
                var bonus = obj.get("bar3_value") || "";

                if (bonus.length != 0) {
                    bonus = parseInt(bonus);
                    if (isNaN(bonus))
                        bonus = 0;
                    var diceRoll = randomInteger(20);
                    var roll = parseFloat(diceRoll + bonus);

                    var turnorder;
                    if (Campaign().get("turnorder") == "")
                        turnorder = [];
                    else
                        turnorder = JSON.parse(Campaign().get("turnorder"));

                    turnorder.push({
                        id: obj.get("_id"),
                        pr: roll,
                        custom: bonus,
                    });

                    turnorder.sort(function (a, b) {
                        if (parseFloat(b.pr) == parseFloat(a.pr))
                            return parseFloat(b.custom) - parseFloat(a.custom);
                        else
                            return parseFloat(b.pr) - parseFloat(a.pr);
                    });

                    Campaign().set("turnorder", JSON.stringify(turnorder));
                }
            }
        });

        Campaign().set("initiativepage", Campaign().get("playerpageid"));
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