$(() => {
  // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCw6KGM9zUzsrMDwnWC5NIs7U-_dyH8N5I",
        authDomain: "bufu2o2-rps.firebaseapp.com",
        databaseURL: "https://bufu2o2-rps.firebaseio.com",
        projectId: "bufu2o2-rps",
        storageBucket: "bufu2o2-rps.appspot.com",
        messagingSenderId: "1062902478862"
    };
    firebase.initializeApp(config);
    let db = firebase.database();
    let dbr = db.ref();
    let fba = firebase.auth();
    let dbm = db.ref("/messages");
    let dbc = db.ref("/chat");
    let dbg = db.ref("/game");
    let dbgl = db.ref("/game/logic");
    let cl = (m) => {console.log(m);}

  let auth = {
    signout: () => {
        $(".sign-out").on("click", "button", () => {
            fba.signOut().then(() => {
                cl("SIGNED OUT!!!!!");
            }).catch((err) => {
                cl("THE ERROR MESSAGE IS : " + err.message);
            });
        });
    },
    login: () => {
        fba.onAuthStateChanged(function (user) {
            if (user) {
                // Run once the User is signed in.
                db.ref("/status").on("value", (snap) => {
                    // if(snap.)
                });
                
                players.current.uid = user.uid;
                players.current.un = user.displayName;
                cl("THIS IS THE UID: " + players.current.uid);
                cl("THIS IS THE DISPLAY NAME: " + players.current.un);
            } else {
                //no user signed in
                uid = null;
                window.location.replace("index.html");
            }
        });
        //time out because login auth takes so long to login
        setTimeout(() => {
            auth.presence();
        }, 1800);
        
    },
    changeUsername: () => {
        $(".change-name").on("click", "button", function() {
            $(".login").fadeIn(500).css("display", "grid");
            auth.enterUsername();
        });
    },
    enterUsername: () => {
        let uid = players.current.uid;
        let un = players.current.un;
        $("#login-submit").on("click", function() {
            un = $("#username").val().trim();
            if($("#username").val() != ""){
                cl("NAME SUCCESSFULLY INPUT AS : " + un);
                db.ref("/players/" + uid).update({
                    name: un,
                });
                $(".login").fadeOut(500);
            }
            else{ cl("Somethings Broken");}
        });
      
    },
    presence: () => {
        let uid = players.current.uid;
        // cl("THIS IS THE UID INSIDE PRESENCE: " + uid);

        let userStatusDbr = db.ref('/status/' + uid);
        let dbaP = db.ref("/game/activePlayers/" + uid);
        

        let offline = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };
    
        let online = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
        };
    
        let setup = () => {
            cl("SETUP ! RAN!!!!");
            dbaP.update({
                playing: false,
                player: 0,
                lose: 0,
                win: 0,
                tie: 0,
            });
            dbg.update({
                counter: 0,
            });
        }

        db.ref('.info/connected').on('value', function(snap) {
            cl("SNAP VAL FOR INFO CONNECTED: " + snap.val());
            if (snap.val() == false) {
                //offline1();
                return;
            };
            setup();
            dbc.onDisconnect().remove();
            dbaP.onDisconnect().remove();
            dbgl.onDisconnect().remove();
            userStatusDbr.onDisconnect().set(offline).then(function() {
                userStatusDbr.set(online);
            });
            
        });
        setTimeout(() => {
            auth.state();
        }, 1000);
    },
    state: () => {
        let sCounter = 0;
        let spec = 0;
        db.ref("status").on("value", (snap) => {
            snap.forEach((childSnap) => {
                let children = childSnap.val();
                let cstate = children.state;
                cl("THIS IS THE SNAP OF ALL THE STATES: " + children.state);
                if(cstate === "online"){
                    sCounter++;
                }
            });
        });
        cl("THIS IS SCOUNTER BEFORE CONDITIONALS: " + sCounter);
        if(sCounter <= 2){
            dbg.update({
                players: sCounter,
            });
            db.ref("/game/activePlayers/" + players.current.uid).update({
                name: players.current.un,
                playing: true,
                player: sCounter,
                win: 0,
                lose: 0,
                tie: 0,
                selected: "",
            });
            players.setChallengerUID();
        }
        else{
            spec = (sCounter - 2);
            dbg.update({
                spectators: spec,
            });
            db.ref("/game/activePlayers/" + players.current.uid).update({
                name: players.current.un,
                playing: false,
            });
        }
        game.playersReady();
    },
} 
    let game = {
        playersReady: () => {
            let activeP;
            db.ref("game/activePlayers/" + players.current.uid).on("value", (snap) => {
                activeP = snap.val().playing;
            });
            dbg.on("value", (s) => {
                //cl("THIS IS THE SNAP VAL OF DBG IN THE PLAYER READY: " + s.val().activePlayers.name);
                if(s.val().players == 2 && activeP == true){
                    $(".container").css({
                        "opacity": "1",
                        "pointer-events": "auto",
                    });
                    //game.message("Your Game is Starting!");
                    $(".waiting").fadeOut(1000);
                    $(".loading").slideUp();
                }
                else if (s.val().players == 1 && activeP == true){
                    $(".container").css({
                        "opacity": ".5",
                        "pointer-events": "none",
                    });
                    game.message("Hello " + players.current.un + ", Waiting for a challenger to join... ");
                }
                else if(s.val().spectators > 0 && activeP != true){
                    $(".container").css("opacity", "1");
                    $(".chat, .change-name, .sign-out").css({
                        "opacity": "1",
                        "pointer-events": "auto",
                    });
                    $(".selections-container, .results, .p2-selection").css({
                        "opacity": ".5",
                        "pointer-events": "none",
                    });
           
                
                    game.message("Hello " + players.current.un + ", There's a game in progress... you may still chat!");
                    setTimeout(() => {
                        $(".waiting").fadeOut(1000);
                    }, 3000);
                }
                else{cl("Something is Wrong");}
            });
        },
        message: (m) => {
            $(".loading").slideUp();
            $(".waiting").text(m).css("display", "grid").fadeIn(500);
        },
        selection: () => {
           $(".selections-container").on("click", "img", function() {
                let s = $(this).attr("value");
                let user = db.ref("/game/logic/" + fba.currentUser.uid);
                // cl("THIS IS THE SELECTION: " + s);
                players.current.selected = s;
                user.set({
                    s,
                    selected: true,
                });

                $(".selections-container").css({
                    "opacity": ".5",
                    "pointer-events": "none",
                    "cursor": "not-allowed",
                });

                players.setChalSel();
            });
            
        },
        logic: () => {
            dbg.update({
                counter: 0,
            });
            let a = players.current.selected;
            let b;
            dbgl.on("value", (snap) => {
                snap.forEach((child) => {
                    if (child.key != fba.currentUser.uid) {
                        // cl("DBGL ON VAL CHILD UID : " + fba.currentUser.uid);
                        // cl("DBGL ON VAL CHILD KEY: " + child.key);
                        // cl("DBGL ON VAL CHILD RAN TO SET B: " + child.val().s);
                        b = child.val().s;
                    }
                });
            });
            if((a === "Rock" && b === "Scissor") || (a === "Scissor" && b === "Paper") || (a === "Paper" && b === "Rock")){
                let ref = db.ref("/game/activePlayers/" + fba.currentUser.uid);
                players.setCurrentStat();
                let x = players.current.w;
                x++;
                ref.update({
                    win: x,
                });
                chat.upChat(fba.currentUser.displayName, "Wins!");
                $(".selections-container").css({
                    "opacity": "1",
                    "pointer-events": "auto",
                    "cursor": "auto",
                });
                players.reset();
            }
            else if((a === "Rock" && b === "Paper") || (a === "Scissor" && b === "Rock") || (a === "Paper" && b === "Scissor")){
                let ref = db.ref("/game/activePlayers/" + fba.currentUser.uid);
                players.setCurrentStat();
                let x = players.current.l;
                x++;
                ref.update({
                    lose: x,
                });
                chat.upChat(fba.currentUser.displayName, "Loses!");
                $(".selections-container").css({
                    "opacity": "1",
                    "pointer-events": "auto",
                    "cursor": "auto",
                });
                players.reset();
            }
            else if((a === "Rock" && b === "Rock") || (a === "Scissor" && b === "Scissor") || (a === "Paper" && b === "Paper")){
                let ref = db.ref("/game/activePlayers/" + fba.currentUser.uid);
                players.setCurrentStat();
                let x = players.current.t;
                x++;
                ref.update({
                    tie: x,
                });
                chat.upChat(fba.currentUser.displayName, "Ties!");
                $(".selections-container").css({
                    "opacity": "1",
                    "pointer-events": "auto",
                    "cursor": "auto",
                });
                players.reset();
            }
            else{
                cl("NO ENTRY");
            }
            
        },
  }

    let players = {
        current: {
            un: "",
            uid: "",
            w: 0,
            l: 0,   
            t: 0,   
            selected: "none",
            presence: false,
        },
        challenger: {
            un: "",
            uid: "",
            w: 0,
            l: 0,   
            t: 0,   
            selected: "none",
            presence: false,
        },
        setCurrentStat: () => {
            let dbUID = db.ref("/game/activePlayers/" + fba.currentUser.uid);
            dbUID.on("value", (snap) => {
                // cl("THIS IS CL OF SETCURRENT STAT DBUID: " + snap.val().win);
                players.current.w = snap.val().win;
                players.current.l = snap.val().lose;
                players.current.t = snap.val().tie;
                players.current.selected = snap.val().selected;
                players.current.uid = fba.currentUser.uid;
                players.current.un = fba.currentUser.displayName;

                $(".win-counter").text(players.current.w);
                $(".lose-counter").text(players.current.l);
                $(".tie-counter").text(players.current.t);
            }); 
        },
        setCounter: () => {
            dbg.on("value", (snap) => {
                players.counter = snap.val().counter;
            });
        },
        counter: 0,
        setChalSel: () => {
            let tCSelected;
            let chal = db.ref("/game/logic/" + players.challenger.uid);
            let user = db.ref("/game/logic/" + fba.currentUser.uid);
            
          

            chal.on("value", (snap) => {
                user.on("value", (s) => {
                    tCSelected = s.val().selected;
                });
                // cl("INSIDE SELECTION THIS IS TCSELECTED : " + tCSelected);
                // cl("INSIDE SELECTION THIS IS CHALLENGER SELECTED: " + snap.val().selected);
                if (snap.val().selected == true && tCSelected == true){
                    $("#p2S").text(snap.val().s);
                    game.logic();
                }
                else{
                    cl("Still waiting for challenger selection");
                }
            });
        },
        setChallengerUID: () => {
            db.ref("/game/activePlayers/").on("value", (snap) => {
                // cl("THE CHILD SNAPSHOT RAN");
                snap.forEach((child) => {
                    console.log("THIS IS THE CHILD KEY TEST : " + child.val().player);
                    let p = child.val().playing;
                 
                    if (p == true && child.key !== players.current.uid){
                        // cl("THIS IS THE CURRENT PLAYERS UID: " + players.current.uid);
                        // cl("THIS IS THE CHILD KEY: " + child.key);
                        players.challenger.uid = child.key;
                        // cl("CHALLENGER UID SET WAS A SUCCESS!!!");
                    }
                }); 
            });
        },
        reset: () => {
            cl("PLAYER RESET RAN!!!");
            dbg.update({
                counter: 0,
            });
            setTimeout(() => {
                db.ref("/game/logic/" + fba.currentUser.uid).update({
                    s: "",
                    selected: false,
                });
                $("#p2S").text("");
            }, 2000);
           
            $(".selections-container").css({
                "opacity": "1",
                "pointer-events": "auto",
                "cursor": "auto",
            });
        },
  }

  let chat = {
      sendMessage: () => {
          $(".chat-btn").on("click", () => {
            let message = $(".chat-input").val().trim();
            if(message != ""){
                $(".chat-input").val("");
            }
            dbc.push().set({
                name: fba.currentUser.displayName,
                message,
            });
          });
          $(".chat-input").keypress(function(e) {
            let message = $(".chat-input").val().trim();
            let k = (e.keyCode ? e.keyCode : e.which);
            if(k == 13){
                cl("CHAT ENTER WAS PRESSED");
                if(message != ""){
                    //$(".chat-input").val("");
                    $(".chat-btn").click();
                }
            }
        });
        dbc.on("child_added", (snap) => {
            let m = snap.val();
            chat.upChat(m.name, m.message);
        });
    },
    upChat: (n, m) => {
        $(".chat-display").append($("<p><span style = 'font-weight: bolder;'>" + n + " : </span>" + m + "</p>"));
    },

  }


  //game play function execution
  
    auth.login();
    auth.changeUsername();
    auth.signout();
    
    chat.sendMessage();
    
    game.selection();










    
    // $("#test").on("click", () => {
    //     cl("THIS IS THE CURRENT UID: " + players.current.uid);
    // });

    // $("#testc").on("click", () => {
    //         cl("THIS IS THE CHALLENGER UID: " + players.challenger.uid);
    //     });
        

    // setTimeout(() => {
    //     cl("TEST SCRIPT IS RUNNING!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");

    // }, 5000);



});