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
    let db1 = db.ref("current");
    let fba = firebase.auth();
    let dbm = db.ref("messages");
    let dbg = db.ref("game");
    let dbp = db.ref("players");
    let cl = (m) => {console.log(m);}

  let auth = {
    // c: "",
    // counter: () => {
    //     db1.on("value", (snap) => {
    //         auth.c = snap.val().counter;
    //         //cl("THIS IS AUTH C : " + auth.c);
    //         // cl("THIS IS SNAP VAL COUNTER : " + snap.val().counter);
    //     });
    // },
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
                db.ref("/game/activePlayers/" + user.uid).update({
                    name: players.current.un,
                });
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
        cl("THIS IS THE UID INSIDE PRESENCE: " + uid);

        let userStatusDbr = db.ref('/status/' + uid);

        let offline = {
            state: 'offline',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            playing: false,
        };
    
        let online = {
            state: 'online',
            last_changed: firebase.database.ServerValue.TIMESTAMP,
            playing: false,
        };
    
        db.ref('.info/connected').on('value', function(snap) {
            if (snap.val() == false) {
                return;
            };

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
                playing: true,
            });
            
        }
        else{
            spec = (sCounter - 2);
            dbg.update({
                spectators: spec,
            });
        }
    },
} 
    let game = {
        playersReady: () => {
            let activeP;
            db.ref("game/activePlayers/" + players.current.uid).on("value", (snap) => {
                activeP = snap.val().playing;
                cl("THIS IS ACTIVE PLAYERS PLAYING : " + activeP);
            });
            dbg.on("value", (s) => {
                //cl("THIS IS THE SNAP VAL OF DBG IN THE PLAYER READY: " + s.val().activePlayers.name);
                if(s.val().players == 2){
                    $(".container").css({
                        "opacity": "1",
                        "pointer-events": "auto",
                    });
                    game.message(players.current.un + ", Your Game is Starting!");
                    $(".waiting").fadeOut(1000);
                }
                else if (s.val().players == 1){
                    $(".container").css({
                        "opacity": ".5",
                        "pointer-events": "none",
                    });
                    game.message("Hello " + players.current.un + ", Waiting for a challenger to join... ");
                }
                else if(s.val().spectators > 0 && activeP != true){
                    $(".selections-container, .results, .p2-selection").css({
                        "opacity": ".5",
                        "pointer-events": "none",
                    });
                    $(".chat, .change-name, .sign-out").css({
                        "opacity": "1",
                        "pointer-events": "auto",
                    });
                
                    game.message("Hello " + players.current.un + ", There's a game in progress...");
                    setTimeout(() => {
                        $(".waiting").fadeOut(1000);
                    }, 3000);
                }
                else{cl("Something is Wrong");}
            });
        },
        message: (m) => {
            $(".waiting").text(m).css("display", "grid").fadeIn(800);
        },
  }

    let players = {
        current: {
            uid: "",
            un: "",
        },
        p1: {
            un: "",
            uid: "",
            w: 0,
            l: 0,   
            t: 0,   
            selected: "none",
            presence: false,
        },
        p2: {
            un: "",
            uid: "",
            w: 0,
            l: 0,   
            t: 0,   
            selected: "none",
            presence: false,
        },
  }



  //game play function execution
  
    auth.login();
    auth.changeUsername();
    auth.signout();
    setTimeout(() => {
        game.playersReady();    
    }, 2000);
    


});