$("#study").click(function() {
    window.location.href = '/study';
});
$("#teach").click(function() {
    window.location.href = '/teach';
});

var dataRaw = $("#data").html();
var dataArr = (dataRaw) ? dataRaw.split('|') : null;
var data = [];
for (var ele in dataArr) {
    var eachData = {};
    var tmpArr = [];
    tmpArr.push(dataArr[ele].split('~'));
    if (!tmpArr) continue;
    for (var ele2 in tmpArr) {
        if (!tmpArr[ele2]) continue;
        for (var ele3 in tmpArr[ele2]) { 
            var keyval = tmpArr[ele2][ele3].split('=');
            if (!keyval || keyval.length != 2) continue;
            eachData[keyval[0]] = keyval[1];
        }
    }
    if (eachData) data.push(eachData);
}

var thisMonth = new Date().getMonth() + 1;

if (data) {
for (var i=0; i<data.length; i++) {
    console.log(data[i]);
    var stOrTeCl = (data[i].isreserved == "true") ? 'youare_student' : 'youare_teacher';
    var stOrTeTx = (data[i].isreserved == "true") ? '生徒' : '教師';
    var id = data[i].id;
    var imgsrc = image_url + id + ".jpeg";
    var nickname = data[i].nickname;
    var stOrTeTx2 = (data[i].isreserved == "true") ? '講師' : '生徒';
    var language = (languagesMap[data[i].language]) ? languagesMap[data[i].language] : '' ;
    var country = (countryMap[data[i].country]) ? countryMap[data[i].country] : '' ;
    var skypeid = data[i].skypeid;

    var t = data[i].date.split(',');
    var thisday = new Date(Number(t[0]), Number(t[1]), Number(t[2]), Number(t[3]), Number(t[4]), 0);
    var monthStr = (thisday.getMonth() + 1 == thisMonth) ? '' : thisday.getMonth()+1 + '/';
    var dateStr = thisday.getDate();
    var dayStr = ' '+weekDayList[thisday.getDay()];
    var thisdayStr = monthStr + dateStr + dayStr;
    var hour = thisday.getHours();
    var min = thisday.getMinutes();
    var minplus25 = min + 25;
    var hour2 = hour;
    if (minplus25 > 60) {
        minplus25 = minplus25 - 60;
        hour2++;
    }
    if (min < 10) min = '0'+min;
    if (minplus25 < 10) minplus25 = '0'+minplus25;
    var hourminStr = hour+':'+min+' ~ '+hour2+':'+minplus25;

    var addHtml = ''+
    '<div class="lessons">'+
        '<p class="lessons_head">第'+(i+1)+'レッスン：<span class="'+stOrTeCl+'">あなたは'+stOrTeTx+'です</span></p>' +
        '<img class="lessons_profpic" src="'+imgsrc+'" width="80" height="80" onerror="this.onerror=null;this.src='+"'"+'/images/nophoto.png'+"'"+'" />' +
        '<div class="lessons_rightpart">' +
            '<p>'+stOrTeTx2+': '+nickname+'</p>' +
            '<p>言語: '+language+'</p>' +
            '<p>出身: <img class="lessons_flag" src="/images/flags/'+data[i].country+'.png" width="18" height="12"/>'+country+'</p>' +
        '</div>' +
        '<div class="lessons_belowpart">' +
            '<p>日時: '+thisdayStr+' '+hourminStr+'</p>' +
            '<p>Skype ID: <span class="selectable lessons_skypeid">'+skypeid+'</span><span class="lessons_copyid">IDをコピーする</span></p>' +
            '<a href="skype:'+skypeid+'?call"><div class="lessons_call">'+stOrTeTx2+'にコールする</div></a>' +
            '<p class="lessons_cancel">レッスンをキャンセルする</p>' +
        '</div>' +
    '</div>';
    $("#lessonsFrame").append(addHtml);
}
}

$('.lessons_copyid').click(function() {
    var skypeid = $(this).parent().find(".lessons_skypeid");
    ClipboardSetData(skypeid.html());
});

function ClipboardSetData(data){
    var body = document.body;
    if(!body) return false;
    var text_area = document.createElement("textarea");
    text_area.value = data;
    body.appendChild(text_area);
    text_area.select();
    var result = document.execCommand("copy");
    body.removeChild(text_area);
    toast('SkypeIDをコピーしました。')
    return result;
}
