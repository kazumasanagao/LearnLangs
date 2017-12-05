$("#sendMail").click(function() {
    var pass = $("#pass").val();

    var passRe = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/;
    if (!pass.match(passRe)) {
        $("#missinput").fadeOut(function() {
            $("#missinput").html("パスワードには大文字、小文字、数字を少なくとも一つずつ含めてください。(８〜100字)");
            $("#missinput").fadeIn();
        });
        return;
    }

    $.ajax({
        url: '/forgetpass/passinput',
        type: 'POST',
        dataType: 'json',
        data: { pass: pass },
        success: function(data) {
            if (data.result == "error") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("エラーが発生しました。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "timeup") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("30分以上経過したため、認証コードは無効となりました。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            window.location.href = "/?toast=passok";
        }
    });
});