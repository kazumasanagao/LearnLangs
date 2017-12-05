var pagetype = $("#pagetype").html();
var url = null;
if (pagetype == 'new') url = '/confirm';
if (pagetype == 'change') url = '/confirm/change';
if (pagetype == 'reset') url = '/confirm/reset';
 
$("#sendCode").click(function() {
    var code = $("#confirmCode").val(); 
    $.ajax({
        url: url,
        type: 'POST',
        dataType: 'json',
        data: {
            code: code
        },
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
            if (data.result == "overmiss") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("３回以上失敗したため、認証コードは無効となりました。30分以上時間をおいて、再度はじめからお手続きください。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "incorrect") {
                var remain = data.remain;
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("認証コードが違います。あと"+remain+"回試行できます。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            if (data.result == "duplicated") {
                $("#missinput").fadeOut(function() {
                    $("#missinput").html("このメールアドレスは既に使われています。");
                    $("#missinput").fadeIn();
                });
                return;
            }
            // 新規の場合の成功
            if (data.result == "success") {
                document.cookie = "tmp=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                $(window).off('beforeunload');
                window.location.href = "/";
                return;
            }
            // changeの場合の成功
            if (data.result == "success2") {
                $(window).off('beforeunload');
                window.location.href = "/userinfo?toast=changeok";
                return;
            }
            // passresetの場合の成功
            if (data.result == "success3") {
                $(window).off('beforeunload');
                window.location.href = "/forgetpass/passinput";
                return;
            }
        }
    });
});


// ------- 途中退室するときに確認 -------


$(function(){
    $(window).on('beforeunload', function() {
        return "登録が完了していません。";
    });
});

$(function(){
    $(window).on('unload', function() {
        
    });
});