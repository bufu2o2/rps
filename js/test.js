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

      fba.onAuthStateChanged(authStateChangeListener);


      function authStateChangeListener(user) {
          //SIGN IN
        if (user) {
            //do login operations...
            Chat.onlogin();
            Game.onlogin();
        } else { //signout
            window.location.reload();
        }
    }












    });