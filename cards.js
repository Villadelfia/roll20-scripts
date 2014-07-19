var titleStyleR = "font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: middle; padding: 5px 0px; margin-top: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color: #FFF; background-color: #400;";
var titleStyleG = "font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: middle; padding: 5px 0px; margin-top: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color: #FFF; background-color: #040;";
var titleStyleB = "font-family: Georgia; font-size: large; font-weight: normal; text-align: center; vertical-align: middle; padding: 5px 0px; margin-top: 0.2em; border: 1px solid #000; border-radius: 10px 10px 0px 0px; color: #FFF; background-color: #004;";
var rowStyle = " padding: 5px; border-left: 1px solid #000; border-right: 1px solid #000; border-radius: 0px; ";
var lastRowStyle = " padding: 5px; border-left: 1px solid #000; border-bottom: 1px solid #000; border-right: 1px solid #000; border-radius: 0px 0px 10px 10px; ";
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

on("chat:message", function(msg) {
    if(msg.type == "api" && msg.content.indexOf("!card") !== -1) {
        var msgcontent = msg.content;
        var msgcontent = msgcontent.replace(new RegExp("__B__",  'g'), "<b>");
        var msgcontent = msgcontent.replace(new RegExp("__EB__", 'g'), "</b>");
        var msgcontent = msgcontent.replace(new RegExp("__I__",  'g'), "<i>");
        var msgcontent = msgcontent.replace(new RegExp("__EI__", 'g'), "</i>");
        var messagercv = msgcontent.split("|||");
        if(messagercv.length < 3) return;
        
        var ctr = 1
        var changed = 0;
        var title = titleTagB;
        if(messagercv[1] == "R") {
            changed = 1;
            title = titleTagR;
            ++ctr;
        } else if(messagercv[1] == "G") {
            changed = 1;
            title = titleTagG;
            ++ctr;
        } else if(messagercv[1] == "B") {
            changed = 1;
            ++ctr;
        }
        
        var message = "";
        message = message + title + messagercv[ctr] + endTag;
        ++ctr;
        
        while(ctr < messagercv.length) {
            var last = ctr == messagercv.length-1;
            var tag = "";
            if(last)
                tag = (ctr % 2 == changed ? lastOddTag : lastEvenTag);
            else
                tag = (ctr % 2 == changed ? oddTag : evenTag);
            message = message + tag +  messagercv[ctr] + endTag;
            ++ctr;
        }
        sendChat(msg.who, message);
    }
});

on("chat:message", function(msg) {
    if(msg.type == "api" && msg.content.indexOf("!levelup") !== -1) {
        sendChat(msg.who, "/desc You leveled up!");
        var message = "";
        message = message + titleTagR + "Level up checklist" + endTag;
        message = message + oddTag +  "HP: You gain HDmax/2 + 1 plus your CON modifier as HP." + endTag;
        message = message + evenTag + "Base Attack Bonus: Update your BAB and update the related calculations (melee to-hit, range to-hit, CMD, CMB)." + endTag;
        message = message + oddTag +  "Saving throws: Update your saving throws." + endTag;
        message = message + evenTag + "Class features: Add your newly gained class features, and update the old ones that get upgraded at higher levels." + endTag;
        message = message + oddTag +  "Skill ranks: Spend your newly gained skillpoints." + endTag;
        message = message + evenTag + "Feats: Gain a feat on level 3, 5, 7, 9, 11, 13, 15, 17 and 19. Some classes get extra feats from specific lists at other levels." + endTag;
        message = message + oddTag +  "FC bonus: If you took a level in your favored class, you get either one extra HP, one extra skill point, or a third option given by your archetype." + endTag;
        message = message + evenTag + "Spells: Spellcasters gain new spells and/or spell slots every level." + endTag;
        message = message + oddTag +  "Ability score increase: At level 4, 8, 12, 16 and 20 you gain a +1 in one ability score." + endTag;
        message = message + lastEvenTag + "Derived statistics: Go over your character sheet and make sure all attack and damage rolls, your saving throw DCs for your spells and special abilities, your ability score modifiers and your AC are all up-to-date." + endTag;
        sendChat(msg.who, message);
    }
});