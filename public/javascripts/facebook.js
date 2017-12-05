(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

window.fbAsyncInit = function() {
    FB.init({
        appId      : fb_appId,
        cookie     : true,
        xfbml      : true,
        version    : 'v2.5'
    });
};

function myFacebookLogin(isKeepLogin) {
    FB.login(function(response){
        if(response.status === 'connected') {
            var fbAccessToken = response.authResponse.accessToken;
            console.log(fbAccessToken);
            $.ajax({
                type: 'POST',
                url: '/signin/fblogin',
                data: {fbtoken: fbAccessToken},
                success: function(data) {
                    if (data.result == "ok") {
                        (isKeepLogin) ? extendCookies() : shortenCookies();
                        return window.location.href = "/";         
                    }
                    return alert("Error. Please try again later.");
                },
                dataType: 'json'
            });
        }
    }, {scope: 'email'});
}

/*

function connectWithFacebook() {
    FB.login(function(response){
        if(response.status === 'connected') {
            var fbAccessToken = response.authResponse.accessToken;
            $.ajax({
                type: 'POST',
                url: '/signin/fblogin?q=connect',
                data: {fbtoken: fbAccessToken},
                success: function(data) {
                    if (data.stat == "ok") {
                        alert("Successfully registered");
                    } else if (data.stat == "du") {
                        alert("This Facebook account has already been used.");
                    } else if (data.stat == "er") {
                        alert("Error. Please try again later.");
                    }
                },
                dataType: 'json'
            });
        }
    });
}
*/
