$("#sendMail").click(function() {
    var mail = $("#mail").val();
    var pass = $("#pass").val();

    if (!mail.match(/.+@.+\..+/)) {
        $("#missinput").fadeOut(function() {
            $("#missinput").html("有効なメールアドレスをご入力ください。");
            $("#missinput").fadeIn();
        });
        return;
    }

    var passRe = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/;
    if (!pass.match(passRe)) {
        $("#missinput").fadeOut(function() {
            $("#missinput").html("パスワードには大文字、小文字、数字が少なくとも一つずつ必要です。(８〜100字)");
            $("#missinput").fadeIn();
        });
        return;
    }

    $.ajax({
        url: '/signin',
        type: 'POST',
        dataType: 'json',
        data: {
            mail: mail,
            pass: pass
        },
        success: function(data) {
            if (data.result == "error") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("エラーが発生しました。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "exist") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("このメールアドレスへ既に認証メールを送っています。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            document.cookie = 'tmp='+data.cookie+";"+cookieSecure;;
            window.location.href = "/confirm";
        }
    });

});

$("#facebook").click(function() {
    myFacebookLogin();
});

$("#twitter").click(function() {
    window.location.href = "/oauth";
});