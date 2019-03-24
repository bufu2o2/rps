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
// working function
$(".login-head").fadeIn(1000).css("display", "grid");
$(".login").fadeIn(1000).css("display", "grid");
(function () {
     var ui = new firebaseui.auth.AuthUI(firebase.auth());

    var uiConfig = {
        callbacks: {
            signInSuccessWithAuthResult: function (authResult, redirectUrl) {
                // User successfully signed in.
                // Return type determines whether we continue the redirect automatically
                // or whether we leave that to developer to handle.
                return true;
            },
            // uiShown: function () {
            //     // The widget is rendered.
            //     // Hide the loader.
            //     document.getElementById('loader').style.display = 'none';
            // }
        },
        // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
        signInFlow: 'popup',
        signInSuccessUrl: 'game.html',
        signInOptions: [
            // Leave the lines as is for the providers you want to offer your users.
            // firebase.auth.GoogleAuthProvider.PROVIDER_ID,
            // firebase.auth.FacebookAuthProvider.PROVIDER_ID,
            // firebase.auth.TwitterAuthProvider.PROVIDER_ID,
            // firebase.auth.GithubAuthProvider.PROVIDER_ID,
            firebase.auth.EmailAuthProvider.PROVIDER_ID
            // firebase.auth.PhoneAuthProvider.PROVIDER_ID
        ],
        // Terms of service url.
        tosUrl: 'tos.html',
        // Privacy policy url.
        privacyPolicyUrl: 'tos.html'
    };


    // The start method will wait until the DOM is loaded.
     ui.start('#firebaseui-auth-container', uiConfig);

})()
