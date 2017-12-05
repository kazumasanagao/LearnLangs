var r_mail = $("#r_mail").html();
if (r_mail) $("#oldmail").html(r_mail);

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
        url: '/changemail',
        type: 'POST',
        dataType: 'json',
        data: {
            mail: mail
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
                    $("#missinput").html("既に認証メールを送信しました。再送する場合は５分以上時間をあけてください。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            window.location.href = "/confirm/change";
        }
    });

});