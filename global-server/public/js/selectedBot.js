(function() {
    var socket = io();
    var storage = { };

    var PRIVATE_PROXY = 1
    var LOCAL_PROXY = 2
    socket.emit("giveMeData", { characterName: getUrlVars()["name"] });

    var manualScroll = false;
    function writeInChat(text) {
        if ($("#chat > tr").length > 50) {
            $("#chat").find('tr:first').remove();
        }
        var html = `<tr><td class="col-md-12">` + text + `</td> `;
        var table = $("#chat");
        table.append(html);
        if (!manualScroll) { table.scrollTop(table.prop("scrollHeight")); }

    }

    $("#chat").click(function(){
        manualScroll = true;
    });

    $( "#sendMessageForm" ).click(function() {
        manualScroll = false;
    });

    $( "#sendMessageForm" ).submit(function( event ) {
        sendTextMessage()
        event.preventDefault();
    });

    function sendTextMessage() {
        var text = $("#sendMessageInput").val();
        socket.emit("SEND_MESSAGE", { from: getUrlVars()["name"], text: text, type: LOCAL_PROXY, to: "" });
        $("#sendMessageInput").val("");
    }

    function isTextSpell(text) {
        var text = text.toLowerCase();
        var spellList = [ "utani", "exura", "hur", "utito ", "exeta", "res", "vis", "utori", "flam", "exevo", "utamo", "vita", "frigo", "exori", "exevo", " san", " terra", " ico", "utana ", "utevo " ];
        for (var i = 0; i < spellList.length; i++) {
            if (text.indexOf(spellList[i]) > -1) {
                return true;
            }
        }
        return false;
    }

    var activeChat = LOCAL_PROXY;
    socket.on(getUrlVars()["name"], function(data) {
        if (typeof data.speaker != "undefined" && data.level > 0 && !isTextSpell(data.text) && data.type == activeChat) {
            var date = new Date(data.time*1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();
            var seconds = "0" + date.getSeconds();
            var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
            var text = formattedTime + ` ` + data.speaker + ` [` + data.level + `]: ` + data.text;

            writeInChat(text);
        }
    });

    socket.on(getUrlVars()["name"], function(data) {
        if (data.characterName == getUrlVars()["name"]) {
            //console.log(data);
            updateTable(data)
        }
    });

    var lastTimeUpdated = 0;



    function updateTable(data) {
        var charNameWithoutSpaces = (data.characterName).replace(/ /g, '');
        var healthPercent = (data.current_health / data.max_health)*100 || 100;
        var manaPercent = (data.current_mana / data.max_mana)*100 || 100;
        var experiencePercent = data.current_level_experience / data.experience_for_next_level*100;


        $("#name").text(data.characterName || "NO NAME");
        $("#health_bar").css("width", healthPercent + "%");
        $("#health_bar span").text((data.current_health || 0) + "/" + (data.max_health || 0) + " (" + Math.floor(healthPercent) + "%)");

        $("#mana_bar").css("width", manaPercent + "%");
        $("#mana_bar span").text((data.current_mana || 0) + "/" + (data.max_mana || 0) + " (" + Math.floor(manaPercent) + "%)");

        $("#vocation").text(data.vocation);

        $("#level").css("width", data.percent_experience + "%");
        $("#level span").text(data.percent_experience + "%");
        lastTimeUpdated = Math.floor(Date.now() / 1000);
        if (data.self_position)
            updateMapPos(data.self_position.x, data.self_position.y, data.self_position.z);
    }

    var _x, _y, _z = 0;
    function updateMapPos(x, y, z) {
        if (window.frames[0]) {
            if (window.frames[0].frameElement.contentWindow.map) {
                if (_x != x || _y != y || _z != z) {
                    _x = x;
                    _y = y;
                    _z = z;
                    var vars = "map.setPosition(" + x + ", " + y + ", " + z + ")";
                    window.frames[0].frameElement.contentWindow.eval(vars);
                }
            }
        }
    }

    setInterval(function() {
        if (Math.floor(Date.now() / 1000) - lastTimeUpdated > 2) {
            $("#status").css("color", "red");
            $("#status").text("OFFLINE");
        }
        else {
            $("#status").css("color", "green");
            $("#status").text("ONLINE");
        }

    }, 100);

    function getUrlVars() {
        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');

        for(var i = 0; i < hashes.length; i++) {
            hash = hashes[i].split('=');
            hash[1] = unescape(hash[1]);
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }

        return vars;
    }
})();

