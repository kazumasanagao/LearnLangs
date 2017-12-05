$("#sendMail").click(function() {
    var pass = $("#pass").val();
    var pass2 = $("#pass2").val();

    var passRe = /^(?=.*?[a-z])(?=.*?[A-Z])(?=.*?\d).{8,100}$/;
    if (!pass.match(passRe)) {
        $("#missinput").fadeOut(function() {
            $("#missinput").html("現在のパスワードには大文字、小文字、数字が少なくとも一つずつ含まれます。(８〜100字)");
            $("#missinput").fadeIn();
        });
        return;
    }
    if (!pass2.match(passRe)) {
        $("#missinput").fadeOut(function() {
            $("#missinput").html("新しいパスワードには大文字、小文字、数字を少なくとも一つずつ含めてください。(８〜100字)");
            $("#missinput").fadeIn();
        });
        return;
    }

    $.ajax({
        url: '/changepass',
        type: 'POST',
        dataType: 'json',
        data: { pass: pass, pass2: pass2 },
        success: function(data) {
            if (data.result == "error") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("エラーが発生しました。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "notcorrect") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("現在のパスワードが違います。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            window.location.href = "/?toast=passok";
        }
    });
});