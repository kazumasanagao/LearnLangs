var color_unclickable_rgb = 'rgb(156, 156, 156)'; // #9C9C9C
var color_selected_rgb = 'rgb(40, 175, 230)'; // #28AFE6
var color_unselect_rgb = 'rgb(211, 211, 211)'; // #d3d3d3 teach.cssにも設定しているため、変更の際は両方を直す必要あり。

var r_languages = $("#r_languages").html();
var r_ctime = $("#r_ctime").html();
var r_isquarter = $("#r_isquarter").html();
var r_today = $("#r_today").html();var r_todayp1 = $("#r_todayp1").html();var r_todayp2 = $("#r_todayp2").html();var r_todayp3 = $("#r_todayp3").html();var r_todayp4 = $("#r_todayp4").html();
var r_maxinaday = $("#r_maxinaday").html();
var r_maxinall = $("#r_maxinall").html();

var teachlangs = "";
if (r_languages) {
    $("#langSelects").html("");
    var langs = r_languages.split(",");
    for (var i=0; i<langs.length; i++) if (languagesMap[langs[i]]) teachlangs = teachlangs + languagesMap[langs[i]] + ', ';
    teachlangs = teachlangs.substr(0,teachlangs.length-2);
}
$('#teachlangs').html(teachlangs);

if (r_isquarter == "true") $('#time').html('<li>0:15</li><li>0:45</li><li>1:15</li><li>1:45</li><li>2:15</li><li>2:45</li><li>3:15</li><li>3:45</li><li>4:15</li><li>4:45</li><li>5:15</li><li>5:45</li><li>6:15</li><li>6:45</li><li>7:15</li><li>7:45</li><li>8:15</li><li>8:45</li><li>9:15</li><li>9:45</li><li>10:15</li><li>10:45</li><li>11:15</li><li>11:45</li><li>12:15</li><li>12:45</li><li>13:15</li><li>13:45</li><li>14:15</li><li>14:45</li><li>15:15</li><li>15:45</li><li>16:15</li><li>16:45</li><li>17:15</li><li>17:45</li><li>18:15</li><li>18:45</li><li>19:15</li><li>19:45</li><li>20:15</li><li>20:45</li><li>21:15</li><li>21:45</li><li>22:15</li><li>22:45</li><li>23:15</li><li>23:45</li>');

if (r_maxinaday) $('#maxinaday_select option[value='+ r_maxinaday +']').attr("selected","selected");
if (r_maxinall) $('#maxinall_select option[value='+ r_maxinall +']').attr("selected","selected");
$('#maxinall_select').change(function() {
    var maxinall = $('#maxinall_select').val();
    var maxinaday = $('#maxinaday_select').val();
    if (!maxinall || !maxinaday) return;
    if (Number(maxinall) < Number(maxinaday)) {
        $('#maxinall_select').val(maxinaday);
        toast('一日の上限数を下回る数値は設定できません。');
    }
}); 
$('#maxinaday_select').change(function() {
    var maxinall = $('#maxinall_select').val();
    var maxinaday = $('#maxinaday_select').val();
    if (!maxinall || !maxinaday) return;
    if (Number(maxinall) < Number(maxinaday)) {
        $('#maxinaday_select').val(maxinall);
        toast('全期間の上限数を上回る数値は設定できません。');
    }
}); 

$('#maxinaday_desc').click(function() {
    var mes = '<p>一日の授業数の上限を設定すると、それを超える数の授業を、一日の内に予約されることはありません。</p>'+
    '<p>予約数が最大数に達した時点で、他に空き時間が残っていても、その日の予約を締め切ります。</p>' +
    '<p>（設定前にすでに予約されていた授業には影響を及ぼしません。なお、キャンセルが出た場合は予約の受付を再開します。）</p>';
    $('#max_description').html(mes);
    $('#max_description').fadeIn();
    $('#graylayer').fadeIn();
});
$('#maxinall_desc').click(function() {
    var mes = '<p>全期間の授業数の上限を設定すると、それを超える数の授業を、予約されることはありません。</p>'+
    '<p>予約数が最大数に達した時点で、他に空き時間が残っていても、全ての日の予約を締め切ります。</p>' +
    '<p>（設定前にすでに予約されていた授業には影響を及ぼしません。なお、キャンセルが出た場合は予約の受付を再開します。）</p>';
    $('#max_description').html(mes);
    $('#max_description').fadeIn();
    $('#graylayer').fadeIn();
});

setdays(0,4);
function setdays(start, end) {
    var j = 0;
    var t = (r_ctime) ? r_ctime.split(',') : [null];
    var today = (t.length == 5) ? new Date(Number(t[0]), Number(t[1]), Number(t[2]), Number(t[3]), Number(t[4]), 0) : new Date();
    var pastMin = today.getHours()*60 + today.getMinutes();
    var unclickables = Math.ceil(pastMin / 30); // 既に経過した時間は選択不可にする。
    var unclickables_p1 = (unclickables > 48) ? unclickables - 48 : 0;
    $("#today li:lt("+unclickables+")").css({'background': color_unclickable_rgb});
    $("#todayplus1 li:lt("+unclickables_p1+")").css({'background': color_unclickable_rgb});
    var cMonth = today.getMonth()+1;
    for (var i=start;i<end+1;i++) {
        var d = new Date(today.getTime() + i*24*60*60*1000);
        var setText = d.getDate()+'<br/>'+weekDayList[d.getDay()];
        if (d.getMonth() + 1 != cMonth) {
            cMonth = d.getMonth()+1;
            setText = cMonth+' / '+ setText;
        }
        $('.eachdate').eq(j).html(setText);
        j++;
    }
}

var today = (r_today) ? r_today.split(',') : null; if (today) for (var i=0; i<today.length; i++) $('#today li').eq(Number(today[i])).css({'background': color_selected_rgb});
var todayp1 = (r_todayp1) ? r_todayp1.split(',') : null; if (todayp1) for (var i=0; i<todayp1.length; i++) $('#todayplus1 li').eq(Number(todayp1[i])).css({'background': color_selected_rgb});
var todayp2 = (r_todayp2) ? r_todayp2.split(',') : null; if (todayp2) for (var i=0; i<todayp2.length; i++) $('#todayplus2 li').eq(Number(todayp2[i])).css({'background': color_selected_rgb});
var todayp3 = (r_todayp3) ? r_todayp3.split(',') : null; if (todayp3) for (var i=0; i<todayp3.length; i++) $('#todayplus3 li').eq(Number(todayp3[i])).css({'background': color_selected_rgb});
var todayp4 = (r_todayp4) ? r_todayp4.split(',') : null; if (todayp4) for (var i=0; i<todayp4.length; i++) $('#todayplus4 li').eq(Number(todayp4[i])).css({'background': color_selected_rgb});


var isdrag = false; var isoff = false;
var parentId = ''; var color = '';
$('.timecolumn li').mousedown(function() {
    if ($(this).css('background-color') == color_unclickable_rgb) return;
    isoff = ($(this).css('background-color') == color_unselect_rgb);
    color = (isoff) ? color_selected_rgb : color_unselect_rgb
    $(this).css({'background':color});
    isdrag = true;
    parentId = $(this).parent().attr('id');
});
$('.timecolumn li').mouseover(function() {
    if (isdrag && $(this).parent().attr('id') == parentId) {
        if ($(this).css('background-color') == color_unclickable_rgb) return;
        $(this).css({'background': color});
    }
});
$('body').mouseup(function() {
    isdrag = false;
    parentId = '';
});

var datebarY = $('#datebar').offset().top;
$(window).scroll(function() {
    var position = ($(window).scrollTop() > datebarY) ? 'fixed' : 'relative';
    $('#datebar').css({'position':position});
});

$('#sendButton').click(function() {
    var data = {};
    var t=[],tp1=[],tp2=[],tp3=[],tp4=[]; 
    $('#today li').each(function(i, ele) { pushto(i, ele, t) });
    $('#todayplus1 li').each(function(i, ele) { pushto(i, ele, tp1) });
    $('#todayplus2 li').each(function(i, ele) { pushto(i, ele, tp2) });
    $('#todayplus3 li').each(function(i, ele) { pushto(i, ele, tp3) });
    $('#todayplus4 li').each(function(i, ele) { pushto(i, ele, tp4) });
    data.t=t.join(",");data.tp1=tp1.join(",");data.tp2=tp2.join(",");
    data.tp3=tp3.join(",");data.tp4=tp4.join(",");

    data.maxinaday = $('#maxinaday_select').val();
    data.maxinall = $('#maxinall_select').val();

    $.ajax({
        url: '/teach',
        type: 'POST',
        dataType: 'json',
        data: data,
        success: function(res) {
            if (res.result == 'error') return toast('エラーが発生しました。');
            if (res.result == 'success') return toast('データを保存しました。');
        }
    });
    function pushto(i, ele, array) { if ($(ele).css('background-color') == color_selected_rgb) array.push(i); }
});
