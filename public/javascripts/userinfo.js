$("#country_select").html('<option value=""></option> +' + countriesHTML);
$("#language_select1").html('<option value=""></option> +' + languagesHTML);
$("#timezone_select").html(timezonesHTML);

// r はregisterdの略
var r_nickname = $("#r_nickname").html();
var r_skypeid = $("#r_skypeid").html();
var r_country = $("#r_country").html();
var r_languages = $("#r_languages").html();
var r_gender = $("#r_gender").html();
var r_timezone = $("#r_timezone").html();
var r_summertime = $("#r_summertime").html();
var r_mail = $("#r_mail").html();
var r_intro = $("#r_intro").html();
var r_fbphoto = $("#r_fbphoto").html();

var langNum = 0;
var langsArray = [];

if (r_nickname) $("#nickname").attr('value',r_nickname);
if (r_skypeid) $("#skypeid").attr('value',r_skypeid); 
if (r_country && countryMap[r_country]) $('#country_select option[value='+ r_country +']').attr("selected","selected");
if (r_languages) {
    $("#langSelects").html("");
    var langs = r_languages.split(",");
    for (var i = 0; i < langs.length; i++) {
        if (languagesMap[langs[i]]) {
            langNum++;
            $("#langSelects").append('<select id="language_select'+langNum+'" class="language_selects" name="language'+langNum+'"><option value=""></option>'+languagesHTML+'</select><br>');
            $('#language_select'+langNum+' option[value='+ langs[i] +']').attr("selected","selected");
            langsArray.push(langs[i]);
        }
    }
}
if (r_gender) $('#' + r_gender).attr("checked","checked");
if (r_mail) $("#mail").html(r_mail);
if (r_intro) $("#intro").html(r_intro);
if (r_fbphoto) {
    r_fbphoto = r_fbphoto.replace(/&amp;/g,'&');
    loadImage(r_fbphoto);
} else {
    loadImage();
}

var nicknameArea = document.getElementById('nickname');
nicknameArea.addEventListener('keydown', function (e){
    var val = nicknameArea.value;
    (val.match(/^[A-Za-z]{1,12}$/)) ? $("#nicknameMiss").fadeOut() : $("#nicknameMiss").fadeIn();
}, false);
nicknameArea.addEventListener('keyup', function (e){
    var val = nicknameArea.value;
    (val.match(/^[A-Za-z]{1,12}$/)) ? $("#nicknameMiss").fadeOut() : $("#nicknameMiss").fadeIn();
}, false);

$("#addLang").click(function() {
    langNum++;
    $("#langSelects").append('<select id="language_select'+langNum+'" class="language_selects" name="language'+langNum+'"><option value=""></option>'+languagesHTML+'</select>');
});

var serverDate = new Date($('#serverDate').html());
var ctHour = serverDate.getUTCHours();
var ctMin = serverDate.getUTCMinutes();
var ctSec = serverDate.getUTCSeconds();
var summertime = (r_summertime == 'true') ? 1 : 0;
var timezone;
initTime();
function initTime() {
    if (summertime == 1) $("#summertime").attr("checked","checked");
    if (r_timezone && timezones.indexOf(Number(r_timezone)) != -1) {
        timezone = Number(r_timezone);
        $('#timezone_select option[value='+ timezone +']').attr("selected","selected");
        return setCurrentTime();
    }
    var pcTimezone = new Date().getTimezoneOffset()*-1;
    var gap = 10000;
    var nearestZone;
    for (var i=0;i<timezones.length;i++) {
        var thisgap = Math.abs(pcTimezone - timezones[i]);
        if (thisgap < gap) {
            gap = thisgap;
            nearestZone = timezones[i];
        } 
    }
    timezone = nearestZone;
    $('#timezone_select option[value='+ nearestZone +']').attr("selected","selected");
    setCurrentTime();
}
function setCurrentTime() {
    var thisHour, thisMin;
    thisHour = ctHour + summertime + Math.floor(timezone / 60);
    thisMin = ctMin + (timezone % 60);
    if (thisMin >= 60) {
        var exceedHour = Math.floor(thisMin / 60);
        thisHour = thisHour + exceedHour;
        thisMin = thisMin - (exceedHour * 60); 
    }
    if (thisHour >= 24) thisHour = thisHour - 24;
    if (thisHour < 0) thisHour = thisHour + 24;
    if (thisMin < 10) thisMin = '0'+thisMin;
    $('#currentTime').html(thisHour+":"+thisMin);
}
$("#timezone_select").change(function () {
    timezone = $("#timezone_select option:selected").val();
    setCurrentTime();
});
$("#summertime").change(function () {
    summertime = ($('#summertime').is(':checked')) ? 1 : 0;
    setCurrentTime()
});
setTimeout(function() {
    ctMin = ctMin + 1; setCurrentTime();
    setInterval(function() { ctMin = ctMin + 1; setCurrentTime(); }, 60000);
}, (60 - ctSec) * 1000);


$("#sendInfo").click(function() {
    if (!checkAnyChanges()) return;

    var data = {};
    if ($("#nickname").val() != r_nickname && $("#nickname").val()) {
        var nickname = $("#nickname").val();
        if (!nickname.match(/^[A-Za-z]{1,12}$/)) {
            $("html,body").animate({scrollTop:0},'fast');
            $("#nicknameMiss").fadeIn();
            return;
        }
        data.nickname = nickname;
    }
    if ($("#skypeid").val() != r_skypeid && $("#skypeid").val()) {
        var skypeid = $("#skypeid").val();
        if (!skypeid.match(/^[A-Za-z0-9\-\_\,\.]{6,32}$/)) {
            $("html,body").animate({scrollTop:0},'fast');
            $("#skypeidMiss").fadeIn();
            return;
        }
        data.skypeid = skypeid;
    }
    if ($("#country_select").val() && $("#country_select").val() != r_country) data.country = $("#country_select").val();
    if (checkLangsChange()) data.languages = checkLangsChange().join(",");
    if ($("[name=gender]:checked").val() != r_gender) data.gender = $("[name=gender]:checked").val();
    if ($("#intro").val() != r_gender) data.intro = $("#intro").val();
    if (Number(r_timezone) != timezone) data.timezone = timezone;
    var isSummertime = (summertime == 1) ? true : false;
    if (r_summertime == "true" && summertime == 0) data.summertime = isSummertime;
    if (r_summertime == "false" && summertime == 1) data.summertime = isSummertime;
    if ($('#inputFile')[0].files[0] || r_fbphoto) {
        var canvasData = img.src;
        canvasData = canvasData.replace(/^data:image\/jpeg;base64,/, '');
        data.photo = canvasData;
    }
    if (Object.keys(data).length == 0) return;

    $.ajax({
        url: '/userinfo',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(data) {
            if (data.result == "success") {
                r_nickname = $("#nickname").val();
                r_skypeid = $("#skypeid").val();
                r_country = $("#country_select").val();
                if (checkLangsChange()) langsArray = checkLangsChange();
                r_gender = $("[name=gender]:checked").val();
                r_timezone = timezone;
                r_summertime = (summertime == 1) ?  "true" : "false";
                r_intro = $("#intro").val();
                $('#inputFile').after('<input type="file" id="inputFile_new" accept=".png,.jpg,.jpeg" onchange="preview(this)" style="display:none;" />');
                $('#inputFile').remove();
                $('#inputFile_new').attr('id','inputFile');
                r_fbphoto = null;
                return toast("保存しました");
            }
            if (data.result == "error") return toast("エラーが発生しました。");
            if (data.result == "nochanges") return;
            if (data.result == "hugephoto") return toast("写真の容量が大き過ぎます。");
            if (data.result == "errphoto") return toast("写真の保存に失敗しました。");
        }
    });
});

function checkLangsChange() {
    var langleng = $(".language_selects").length;
    var currentlangsArray = [];
    for (var i = 0; i < langleng; i++) {
        var j = i + 1;
        var lang = $("#language_select"+j).val();
        if (lang && languagesMap[lang] && currentlangsArray.indexOf(lang) == -1) currentlangsArray.push(lang);
    }
    if (langsArray.toString() == currentlangsArray.toString()) return false;
    return currentlangsArray;
}

function checkAnyChanges() {
    if ($("#nickname").val() != r_nickname) return true;
    if ($("#skypeid").val() != r_skypeid) return true;
    if ($("#country_select").val() && $("#country_select").val() != r_country) return true;
    if (checkLangsChange()) return true;
    if (r_gender && $("[name=gender]:checked").val() != r_gender) return true;
    if (Number(r_timezone) != timezone) return true;
    if (r_summertime == "true" && summertime == 0) return true;
    if (r_summertime == "false" && summertime == 1) return true;
    if ($("#intro").val() != r_intro) return true;
    if ($('#inputFile')[0].files[0]) return true;
}


var textarea = document.getElementById('intro');
var textcounter = document.getElementById('introCounter');
const max_length = 400;
textcounter.innerHTML = max_length - calcByte(textarea.value);
textarea.addEventListener('keydown', function (e) { fireKeyupdown() }, false);
textarea.addEventListener('keyup', function (e) { fireKeyupdown() }, false);
function fireKeyupdown() {
    var bytes = calcByte(textarea.value);
    var maxlength = max_length - (bytes - textarea.value.length);
    textcounter.innerHTML = max_length - bytes;
    $("#intro").attr("maxlength", maxlength);
}
// 文字の画面上での大きさをコントロールしたいためなので、３バイト文字も２バイトとしている。
function calcByte(text) {
    var bytes = 0;
    for (var i=0;i<text.length;i++) (text[i].charCodeAt(0) <= 127) ? bytes += 1 : bytes += 2;
    return bytes;
}

$(window).on('beforeunload', function() {
    if (checkAnyChanges()) return "登録が完了していません。";
});
