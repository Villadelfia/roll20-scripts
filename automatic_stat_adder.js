on("add:character", function(obj) {
    createObj("attribute", {
        name: "HP",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Temp HP",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Non-lethal Damage",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "initiative",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "AC",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Touch AC",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Flat-footed AC",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "CMD",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Fortitude Save",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Reflex Save",
        characterid: obj.get("_id"),
    });
    createObj("attribute", {
        name: "Will Save",
        characterid: obj.get("_id"),
    });
});