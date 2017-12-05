var isKeepLogin = (getCookie("extends") == "yes") ? true : false;
if (isKeepLogin) {
    $('input[name="keeplogin"]').attr("checked","checked");
    $('input[name="keeplogin1"]').attr("checked","checked");
}

$("#sendMail").click(function() {
    var mail = $("#mail").val();
    var pass = $("#pass").val();
    var keeplogin = $("[name=keeplogin]:checked").val();

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
            $("#missinput").html("パスワードには大文字、小文字、数字が少なくとも一つずつ含まれています。(８〜100字)");
            $("#missinput").fadeIn();
        });
        return;
    }

    $.ajax({
        url: '/login',
        type: 'POST',
        dataType: 'json',
        data: { mail: mail, pass: pass },
        success: function(data) {
            if (data.result == "error") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("メールアドレスかパスワードが違います。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "overmiss") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("複数回入力ミスがありました。10分以上してから再度お試しください。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            (keeplogin) ? extendCookies() : shortenCookies();
            return window.location.href = "/";
        }
    });
});

$("#facebook").click(function() {
    var keeplogin = $("[name=keeplogin1]:checked").val();
    return myFacebookLogin(keeplogin);
});

$("#twitter").click(function() {
    return window.location.href = "/oauth";
});