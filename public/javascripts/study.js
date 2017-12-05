var color_available_rgb = 'rgb(40, 175, 230)'; // #28AFE6
var color_unselect_rgb = 'rgb(211, 211, 211)'; // #d3d3d3 study.cssにも設定しているため、変更の際は両方を直す必要あり。

$("#language_select").html(languagesHTML);
var r_person1 = $("#r_person1").html();var r_person2 = $("#r_person2").html();var r_person3 = $("#r_person3").html();
var r_restIds = $("#r_restIds").html();var r_ctime = $("#r_ctime").html();
var r_lang = $("#r_lang").html();var r_requestDay = $("#r_requestDay").html();
var r_isquarter = $("#r_isquarter").html();
var r_from = $("#r_from").html();var r_to = $("#r_to").html();
var r_gender = $("#r_gender").html(); var r_regions_raw = $("#r_regions").html();

if (r_lang) $('#language_select option[value='+ r_lang +']').attr("selected","selected");
var t = (r_ctime) ? r_ctime.split(',') : [null];
(r_isquarter == "true") ? $('.selections2').html('<option value="-1"></option>'+timeQuarterHTML) : $('.selections2').html('<option value="-1"></option>'+timeHTML);
if (r_from) $('#time_select1 option[value='+ r_from +']').attr("selected","selected");
if (r_to) $('#time_select2 option[value='+ r_to +']').attr("selected","selected");
if (r_gender) $('#' + r_gender).attr("checked","checked");
if (r_isquarter == "true") $('#time').html('<li>0:15</li><li>0:45</li><li>1:15</li><li>1:45</li><li>2:15</li><li>2:45</li><li>3:15</li><li>3:45</li><li>4:15</li><li>4:45</li><li>5:15</li><li>5:45</li><li>6:15</li><li>6:45</li><li>7:15</li><li>7:45</li><li>8:15</li><li>8:45</li><li>9:15</li><li>9:45</li><li>10:15</li><li>10:45</li><li>11:15</li><li>11:45</li><li>12:15</li><li>12:45</li><li>13:15</li><li>13:45</li><li>14:15</li><li>14:45</li><li>15:15</li><li>15:45</li><li>16:15</li><li>16:45</li><li>17:15</li><li>17:45</li><li>18:15</li><li>18:45</li><li>19:15</li><li>19:45</li><li>20:15</li><li>20:45</li><li>21:15</li><li>21:45</li><li>22:15</li><li>22:45</li><li>23:15</li><li>23:45</li>');
var regions = [];
var r_regions = (r_regions_raw) ? r_regions_raw.split(',') : null;
if (r_regions) {
    for (var i=0; i<r_regions.length; i++) {
        $('.regions[name='+r_regions[i]+']').css({'background':'gray','color':'white'});
        regions.push(r_regions[i]);
    } 
}
var isOpenExtra = false;
if (r_from || r_to || r_gender || r_regions) openCloseExtra();
$('#openOptions').click(function() {
    openCloseExtra();
});
function openCloseExtra() {
    if (isOpenExtra) {
        $('#extraOptions').fadeOut();
        $('#openOptions').html('+ 詳細オプション');
        isOpenExtra = false;
    } else {
        $('#extraOptions').fadeIn();
        $('#openOptions').html('- 詳細オプション');
        isOpenExtra = true;
    }
}

setdays(4);
function setdays(end) {
    var today = (t.length == 5) ? new Date(Number(t[0]), Number(t[1]), Number(t[2]), Number(t[3]), Number(t[4]), 0) : new Date();
    var cMonth = today.getMonth()+1;
    var options = '';
    for (var i=0; i<end+1; i++) {
        var d = new Date(today.getTime() + i*24*60*60*1000);
        var setText = d.getDate()+' '+weekDayList[d.getDay()];
        if (d.getMonth() + 1 != cMonth) { cMonth = d.getMonth()+1; setText = cMonth+' / '+ setText; }
        options = options + '<option value="'+i+'">'+setText+'</option>';
    }
    $('#date_select').html(options);
}
var reqestDay = (r_requestDay) ? Number(r_requestDay) : null;
if (typeof reqestDay != 'number' || reqestDay < 0 || reqestDay > 4) reqestDay = null;
if (reqestDay) $('#date_select option[value='+ reqestDay +']').attr("selected","selected");
$("#date_select").change(function () {
    window.location.href = '/study?day='+$(this).val();
});

$("#time_select1").change(function () {
    if ($("#time_select2").val() == '-1' && Number($(this).val()) >= 0) $('#time_select2 option[value='+ $(this).val() +']').attr("selected","selected");
});
$("#time_select2").change(function () {
    if (!$("#time_select1").val() == '-1' && Number($(this).val()) >= 0) $('#time_select1 option[value='+ $(this).val() +']').attr("selected","selected");
});

$('.regions').click(function() {
    var val = $(this).attr('name');
    var index = regions.indexOf(val);
    if (index == -1) {
        $(this).css({'background':'gray','color':'white'});
        regions.push(val);
    } else {
        $(this).css({'background':'white','color':'black'});
        regions.splice(index, 1);
    }
    console.log(regions);
});

$('#search').click(function() {
    var time1 = Number($('#time_select1').val());
    var time2 = Number($('#time_select2').val());
    var timequery = '';
    if (time1 >= 0 && time2 >= 0 && time1 <= time2) timequery = '&from='+time1+'&to='+time2;
    if (time1 >= 0 && time2 < 0) timequery = '&from='+time1;
    if (time1 < 0 && time2 >= 0) timequery = '&to='+time2;

    var genderquery = '';
    var gender = $("[name=gender]:checked").val();
    if (gender == 'fe' || gender == 'ma') genderquery = '&gender='+gender;

    var regionsquery = (regions.length > 0) ? '&regions='+regions.join(',') : ''; 

    window.location.href = '/study?day='+$("#date_select").val()+timequery+genderquery+regionsquery;
});

var currentIds = []; // 予約ボタン押下時にIDが欲しいため
if (r_person1) setEachPerson(1,r_person1);
if (r_person2) setEachPerson(2,r_person2);
if (r_person3) setEachPerson(3,r_person3);

function setEachPerson(num,data) {
    var person = data.split('|');
    $('#person'+num+' .personnames').html(person[0]);
    $('#person'+num+' .personcountries span').html(countryMap[person[1]]);
    $('#person'+num+' .personcountries img').attr({'src':'/images/flags/'+person[1]+'.png'});
    $('#person'+num+' .personphotos').attr({'src':image_url+person[2]+'.jpeg'});
    currentIds.push(person[2]);

    var schedule = (person[3]) ? person[3].split(',') : null;
    if (!schedule) return; 
    for (var i=0; i<schedule.length; i++) {
        $('#schedule'+num+' li').eq(Number(schedule[i])).css({'background': color_available_rgb});
        $('#schedule'+num+' li').eq(Number(schedule[i])).html('予約する');
    }
}
function delPerson(num) {
    $('#person'+num+' .personnames').html('');
    $('#person'+num+' .personcountries span').html('');
    $('#person'+num+' .personcountries img').attr({'src':''});
    $('#person'+num+' .personphotos').attr({'src':''});
    $('#schedule'+num+' li').css({'background': 'lightgray'});
}

var reserveData;
$('.timecolumn li').click(function() {
    if ($(this).css('background-color') != color_available_rgb) return;
    var day = $("#date_select").val();
    var pid = $(this).parent().attr('id');
    var index = $('#'+pid+' li').index(this);
    var id;
    if (pid == 'schedule1') id = currentIds[0];
    if (pid == 'schedule2') id = currentIds[1];
    if (pid == 'schedule3') id = currentIds[2];
    if (!index || !day || !id) return;
    var lang = $("#language_select").val();
    if (!languagesMap[lang]) return;
    var data = day+','+index+','+id+','+lang;
    reserveData = data;
    console.log(data);
    $.ajax({
        url: '/study/reserve',
        type: 'POST',
        dataType: 'json',
        data: {data: data, isfinal: false},
        success: function(res) {
            if (res.result == 'error') return console.log('ng'); ;
            if (res.result == 'success') openConfirm(pid,index);
        }
    });
});
function openConfirm(pid,index) {
    var nickname;
    if (pid == 'schedule1') nickname = $('#person1 .personnames').html();
    if (pid == 'schedule2') nickname = $('#person2 .personnames').html();
    if (pid == 'schedule3') nickname = $('#person3 .personnames').html();
    $('#reserveName').html('講師: '+nickname);
    var lang = $('#language_select option:selected').text();
    $('#reserveLang').html('言語: '+lang);
    var date = $('#date_select option:selected').text();
    $('#reserveDate').html('日にち: '+date);
    var quarter = (r_isquarter == "true") ? 15 : 0;
    var startMin = index*30 + quarter;
    var endMin = index*30 + 25 + quarter;
    var startH = Math.floor(startMin / 60);
    var startM = startMin % 60; if (startM < 10) startM = '0' + startM;
    var endH = Math.floor(endMin / 60);
    var endM = endMin % 60; if (endM < 10) endM = '0' + endM;
    $('#reserveTime').html('時間: '+startH+':'+startM+' ~ '+endH+':'+endM);
    
    $('#confReserve').fadeIn();
    $('#graylayer').fadeIn();
}
$("#confReserveYes").click(function() {
    $.ajax({
        url: '/study/reserve',
        type: 'POST',
        dataType: 'json',
        data: {data: reserveData, isfinal: true},
        success: function(res) {
            if (res.result == 'error') return console.log('ng');
            if (res.result == 'success') return console.log('ok');
        }
    });
});
$("#confReserveNo").click(function() {
    $('#graylayer').fadeOut();
    $('#confReserve').fadeOut();
});

$("#language_select").change(function() {
    var lang = $(this).val();
    console.log(lang);
    $.ajax({
        url: '/study/changelang',
        type: 'POST',
        dataType: 'json',
        data: {lang: lang},
        success: function(res) {
            if (res.result == 'error') return;
            if (res.result == 'success') window.location.href = '/study?day='+$("#date_select").val();
        }
    });
});

// 既に経過した時間は非表示にする。
if (r_from || r_to) {
    if (r_from) hideTimes(true, Number(r_from));
    if (r_to) hideTimes(false, Number(r_to));
} else if (!reqestDay || reqestDay == 0) {
    var today = (t.length == 5) ? new Date(Number(t[0]), Number(t[1]), Number(t[2]), Number(t[3]), Number(t[4]), 0) : new Date();
    var pastMin = today.getHours()*60 + today.getMinutes();
    var hides = Math.ceil(pastMin / 30);
    hideTimes(true, hides);
}
function hideTimes(islt, num) {
    var ltgt = (islt) ? 'lt' : 'gt';
    $("#time li:"+ltgt+"("+num+")").css({'display':'none'}); $("#schedule1 li:"+ltgt+"("+num+")").css({'display':'none'});
    $("#schedule2 li:"+ltgt+"("+num+")").css({'display':'none'}); $("#schedule3 li:"+ltgt+"("+num+")").css({'display':'none'});
}

function setPersons(page) {
    var start = (page - 1) * 3; var end = start + 3;
    var idsArray = restIds.slice(start,end);
    var ids = (idsArray) ? idsArray.join(',') : null;
    if (!ids) return;
    $.ajax({
        url: '/study/addition?day='+$("#date_select").val(),
        type: 'POST',
        dataType: 'json',
        data: {ids: ids},
        success: function(res) {
            if (res.result == 'error') return;
            if (res.result == 'success') {
                currentIds = []; // いったん初期化する
                $('.timecolumn li').css({'background': color_unselect_rgb});
                $('.timecolumn li').html('');
                (res.person1) ? setEachPerson(1,res.person1) : delPerson(1);
                (res.person2) ? setEachPerson(2,res.person2) : delPerson(2);
                (res.person3) ? setEachPerson(3,res.person3) : delPerson(3);
                currentPage = page;
                return makePageBar();
            }
        }
    });
}

var restIds = (r_restIds) ? r_restIds.split(',') : [null];
currentPage = 1;
totalPage = Math.ceil(restIds.length/3);
makePageBar();

function makePageBar() {
    var center_html = ""; var firstpage_html = ""; var lastpage_html = "";
    var maxleft = 2; var maxright = 2;
    if (currentPage == 1) {maxleft = 0; maxright = 4;}
    if (currentPage == 2) {maxleft = 1; maxright = 3;}
    if (currentPage == totalPage) { maxleft = 4; maxright = 0;}
    if (currentPage == totalPage - 1) {maxleft = 3; maxright = 1;}

    var lowest_page = currentPage;
    for (var i = 0; i < maxleft; i++) {
        var candidate = currentPage - (i+1);
        if (candidate < 1) continue;
        center_html = '<span class="page clickable" onclick="setPersons('+ candidate +');">'+ candidate +'</span>' + center_html;
        lowest_page = candidate;
    }
    if (lowest_page >= 3) firstpage_html = '<span class="page clickable" onclick="setPersons(1);">1</span><span class="page unclickable abbr">...</span>';
    if (lowest_page == 2) firstpage_html = '<span class="page clickable" onclick="setPersons(1);">1</span>';

    center_html += '<span class="page unclickable" onclick="setPersons('+ currentPage +');">'+ currentPage +'</span>';

    var highest_page = currentPage;
    for (var i = 0; i < maxright; i++) {
        var candidate = currentPage + (i+1);
        if (candidate > totalPage) continue;
        center_html += '<span class="page clickable" onclick="setPersons('+ candidate +');">'+ candidate +'</span>';
        highest_page = candidate;
    }
    if (highest_page <= totalPage - 2) lastpage_html = '<span class="page unclickable abbr">...</span><span class="page clickable" onclick="setPersons('+totalPage.toString()+');">'+totalPage.toString()+'</span>';
    if (highest_page == totalPage - 1) lastpage_html = '<span class="page clickable" onclick="setPersons('+totalPage.toString()+');">'+totalPage.toString()+'</span>'

    //var prev_html = (currentPage == 1) ? '<span id="prev" class="unclickable">Prev</span>' : '<span id="prev" class="clickable" onclick="setPersons('+ (currentPage-1).toString() +');">Prev</span>';
    //var next_html = (currentPage == totalPage || totalPage == 0) ? '<span id="next" class="unclickable">Next</span>' : '<span id="next" class="clickable" onclick="setPersons('+ (currentPage+1).toString() +');">Next</span>';
    //$("#pageBar").html(prev_html + firstpage_html + center_html + lastpage_html + next_html);
    $(".pageBar").html(firstpage_html + center_html + lastpage_html);
}

/*
var datebarY = $('#personsbar').offset().top;
$(window).scroll(function() {
    var position = ($(window).scrollTop() > datebarY) ? 'fixed' : 'relative';
    $('#personsbar').css({'position':position});
});
*/
