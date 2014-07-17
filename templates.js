on("chat:message", function(msg) {
    if(msg.type == "api" && msg.content.indexOf("!template") !== -1) {
        var sender = msg.who.split(" ")[0];
        // Get master template tokens.
        var cone_15 = findObjs({
            _type: "graphic",
            name: "cone_15_template_master",
        })[0];
        var cone_15_ortho = findObjs({
            _type: "graphic",
            name: "cone_15_ortho_template_master",
        })[0];
        var cone_30 = findObjs({
            _type: "graphic",
            name: "cone_30_template_master",
        })[0];
        var cone_30_ortho = findObjs({
            _type: "graphic",
            name: "cone_30_ortho_template_master",
        })[0];
        var burst_5 = findObjs({
            _type: "graphic",
            name: "burst_5_template_master",
        })[0];
        var burst_10 = findObjs({
            _type: "graphic",
            name: "burst_10_template_master",
        })[0];
        var burst_20 = findObjs({
            _type: "graphic",
            name: "burst_20_template_master",
        })[0];
        
        // Check if all are found...
        //log(cone_15);
        //log(cone_15_ortho);
        //log(cone_30);
        //log(cone_30_ortho);
        //log(burst_5);
        //log(burst_10);
        //log(burst_20);
        
        //parse input string, cone or burst?
        if(msg.content.indexOf("cone") !== -1) {
            // 15 or 30?
            if(msg.content.indexOf("15") !== -1) {
                // Orthogonal or not?
                if(msg.content.indexOf("ortho") !== -1) {
                    sendChat("Template Spawner", "/w "+sender+" Spawning 15ft. cone (orthogonal).");
                    createObj("graphic", {
                        name: "Template: 15ft ortho cone",
                        subtype: "token",
                        imgsrc: cone_15_ortho.get("imgsrc"),
                        width: cone_15_ortho.get("width"),
                        height: cone_15_ortho.get("height"),
                        left: 280,
                        top: 280,
                        showname: true,
                        showplayers_name: true,
                        layer: "objects",
                        controlledby: cone_15_ortho.get("controlledby"),
                        pageid: Campaign().get("playerpageid"),
                    });
                } else {
                    sendChat("Template Spawner", "/w "+sender+" Spawning 15ft. cone (diagonal).");
                    createObj("graphic", {
                        name: "Template: 15ft cone",
                        subtype: "token",
                        imgsrc: cone_15.get("imgsrc"),
                        width: cone_15.get("width"),
                        height: cone_15.get("height"),
                        left: 280,
                        top: 280,
                        showname: true,
                        showplayers_name: true,
                        layer: "objects",
                        controlledby: cone_15.get("controlledby"),
                        pageid: Campaign().get("playerpageid"),
                    });
                }
            } else if(msg.content.indexOf("30") !== -1) {
                // Orthogonal or not?
                if(msg.content.indexOf("ortho") !== -1) {
                    sendChat("Template Spawner", "/w "+sender+" Spawning 30ft. cone (orthogonal).");
                    createObj("graphic", {
                        name: "Template: 30ft ortho cone",
                        subtype: "token",
                        imgsrc: cone_30_ortho.get("imgsrc"),
                        width: cone_30_ortho.get("width"),
                        height: cone_30_ortho.get("height"),
                        left: 280,
                        top: 280,
                        showname: true,
                        showplayers_name: true,
                        layer: "objects",
                        controlledby: cone_30_ortho.get("controlledby"),
                        pageid: Campaign().get("playerpageid"),
                    });
                } else {
                    sendChat("Template Spawner", "/w "+sender+" Spawning 30ft. cone (diagonal).");
                    createObj("graphic", {
                        name: "Template: 30ft cone",
                        subtype: "token",
                        imgsrc: cone_30.get("imgsrc"),
                        width: cone_30.get("width"),
                        height: cone_30.get("height"),
                        left: 280,
                        top: 280,
                        showname: true,
                        showplayers_name: true,
                        layer: "objects",
                        controlledby: cone_30.get("controlledby"),
                        pageid: Campaign().get("playerpageid"),
                    });
                }
            } else {
                sendChat("Template Spawner", "/w "+sender+" No cone available in that size.");
            }
        } else if(msg.content.indexOf("burst") !== -1) {
            // 5, 10 or 20?
            if(msg.content.indexOf(" 5") !== -1) {
                sendChat("Template Spawner", "/w "+sender+" Spawning 5ft. burst.");
                createObj("graphic", {
                    name: "Template: 5ft burst",
                    subtype: "token",
                    imgsrc: burst_5.get("imgsrc"),
                    width: burst_5.get("width"),
                    height: burst_5.get("height"),
                    left: 280,
                    top: 280,
                    showname: true,
                    showplayers_name: true,
                    layer: "objects",
                    controlledby: burst_5.get("controlledby"),
                    pageid: Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("10") !== -1) {
                sendChat("Template Spawner", "/w "+sender+" Spawning 10ft. burst.");
                createObj("graphic", {
                    name: "Template: 5ft burst",
                    subtype: "token",
                    imgsrc: burst_10.get("imgsrc"),
                    width: burst_10.get("width"),
                    height: burst_10.get("height"),
                    left: 280,
                    top: 280,
                    showname: true,
                    showplayers_name: true,
                    layer: "objects",
                    controlledby: burst_10.get("controlledby"),
                    pageid: Campaign().get("playerpageid"),
                });
            } else if(msg.content.indexOf("20") !== -1) {
                sendChat("Template Spawner", "/w "+sender+" Spawning 20ft. burst.");
                createObj("graphic", {
                    name: "Template: 5ft burst",
                    subtype: "token",
                    imgsrc: burst_20.get("imgsrc"),
                    width: burst_20.get("width"),
                    height: burst_20.get("height"),
                    left: 280,
                    top: 280,
                    showname: true,
                    showplayers_name: true,
                    layer: "objects",
                    controlledby: burst_20.get("controlledby"),
                    pageid: Campaign().get("playerpageid"),
                });
            } else {
                sendChat("Template Spawner", "/w "+sender+" No burst available in that size.");
            }
        } else {
            sendChat("Template Spawner", "/w "+sender+" Usage:<br/>!template [15|30] cone {ortho}<br/>!template [5|10|20] burst");
        }
    }
});
