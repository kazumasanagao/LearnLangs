$("#sendMail").click(function() {
    var mail = $("#mail").val();

    if (!mail.match(/.+@.+\..+/)) {
        $("#missinput").fadeOut(function() {
            $("#missinput").html("有効なメールアドレスをご入力ください。");
            $("#missinput").fadeIn();
        });
        return;
    }

    $.ajax({
        url: '/forgetpass',
        type: 'POST',
        dataType: 'json',
        data: { mail: mail },
        success: function(data) {
            if (data.result == "error") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("エラーが発生しました。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "overtry") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("既に何度か認証メールを送信しています。しばらく時間をおいて、再度お試しください。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            window.location.href = "/confirm/reset";
        }
    });
});