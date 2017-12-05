const fb_appId = "※※※※※※※※※※※※※※※";
const cookieSecure = "";
const image_url = "https://s3-ap-northeast-1.amazonaws.com/test.chample.in/";

// 本番
/*

const fb_appId = "";
const cookieSecure = ";secure";
const image_url = "https://s3-ap-northeast-1.amazonaws.com//";

*/


const countryMap = {ae:"United Arab Emirates",af:"Afghanistan",ag:"Antigua and Barbuda",al:"Albania",am:"Armenia",ao:"Angola",ar:"Argentina",at:"Austria",au:"Australia",az:"Azerbaijan",ba:"Bosnia and Herzegovina",bb:"Barbados",bd:"Bangladesh",be:"Belgium",bf:"Burkina Faso",bg:"Bulgaria",bi:"Burundi",bj:"Benin",bn:"Brunei Darussalam",bo:"Bolivia",br:"Brazil",bs:"Bahamas",bt:"Bhutan",bw:"Botswana",by:"Belarus",bz:"Belize",ca:"Canada",cd:"Democratic Republic of the Congo",cf:"Central African Republic",cg:"Republic of the Congo",ch:"Switzerland",ci:"Cote d$prime;Ivoire",cl:"Chile",cm:"Cameroon",cn:"China",co:"Colombia",cr:"Costa Rica",cu:"Cuba",cv:"Cape Verde",cy:"Cyprus",cz:"Czech Republic",de:"Germany",dj:"Djibouti",dk:"Denmark",dm:"Dominica",do:"Dominican Republic",dz:"Algeria",ec:"Ecuador",ee:"Estonia",eg:"Egypt",er:"Eritrea",es:"Spain",et:"Ethiopia",fi:"Finland",fj:"Fiji",fk:"Falkland Islands",fr:"France",ga:"Gabon",gb:"United Kingdom",gd:"Grenada",ge:"Georgia",gf:"French Guiana",gh:"Ghana",gl:"Greenland",gm:"Gambia",gn:"Guinea",gq:"Equatorial Guinea",gr:"Greece",gt:"Guatemala",gw:"Guinea-Bissau",gy:"Guyana",hn:"Honduras",hr:"Croatia",ht:"Haiti",hu:"Hungary",id:"Indonesia",ie:"Ireland",il:"Israel",in:"India",iq:"Iraq",ir:"Iran",is:"Iceland",it:"Italy",jm:"Jamaica",jo:"Jordan",jp:"Japan",ke:"Kenya",kg:"Kyrgyz Republic",kh:"Cambodia",km:"Comoros",kn:"Saint Kitts and Nevis",kp:"North Korea",kr:"South Korea",kw:"Kuwait",kz:"Kazakhstan",la:"Lao People&prime;s Democratic Republic",lb:"Lebanon",lc:"Saint Lucia",lk:"Sri Lanka",lr:"Liberia",ls:"Lesotho",lt:"Lithuania",lv:"Latvia",ly:"Libya",ma:"Morocco",md:"Moldova",mg:"Madagascar",mk:"Macedonia",ml:"Mali",mm:"Myanmar",mn:"Mongolia",mr:"Mauritania",mt:"Malta",mu:"Mauritius",mv:"Maldives",mw:"Malawi",mx:"Mexico",my:"Malaysia",mz:"Mozambique",na:"Namibia",nc:"New Caledonia",ne:"Niger",ng:"Nigeria",ni:"Nicaragua",nl:"Netherlands",no:"Norway",np:"Nepal",nz:"New Zealand",om:"Oman",pa:"Panama",pe:"Peru",pf:"French Polynesia",pg:"Papua New Guinea",ph:"Philippines",pk:"Pakistan",pl:"Poland",pt:"Portugal",py:"Paraguay",qa:"Qatar",re:"Reunion",ro:"Romania",rs:"Serbia",ru:"Russian Federation",rw:"Rwanda",sa:"Saudi Arabia",sb:"Solomon Islands",sc:"Seychelles",sd:"Sudan",se:"Sweden",si:"Slovenia",sk:"Slovakia",sl:"Sierra Leone",sn:"Senegal",so:"Somalia",sr:"Suriname",st:"Sao Tome and Principe",sv:"El Salvador",sy:"Syrian Arab Republic",sz:"Swaziland",td:"Chad",tg:"Togo",th:"Thailand",tj:"Tajikistan",tl:"Timor-Leste",tm:"Turkmenistan",tn:"Tunisia",tr:"Turkey",tt:"Trinidad and Tobago",tw:"Taiwan",tz:"Tanzania",ua:"Ukraine",ug:"Uganda",us:"United States of America",uy:"Uruguay",uz:"Uzbekistan",ve:"Venezuela",vn:"Vietnam",vu:"Vanuatu",ye:"Yemen",za:"South Africa",zm:"Zambia",zw:"Zimbabwe"}
const languagesMap = {en:"English",ar:"Arabic",zh:"Chinese",fr:"French",de:"German",hi:"Hindi",ja:"Japanese",pt:"Portuguese",ru:"Russian",es:"Spanish"};
const timezones = [840,780,765,720,660,630,600,570,540,525,510,480,420,390,360,345,330,300,270,240,210,180,120,60,0,-60,-120,-180,-210,-240,-300,-360,-420,-480,-540,-570,-600,-660,-720];
const weekDayList = [ "(日)", "(月)", "(火)", "(水)", "(木)", "(金)", "(土)"];


checkToast();

function checkToast() {
    var params = checkParam();
    if (!params) return;
    var t = params['toast'];
    if (t == "passok") return toast('パスワードを変更しました。');
    if (t == "changeok") return toast('メールアドレスを変更しました。');
    return;
}

function checkParam() {
    var url = location.href;
    var u = url.split("?");
    if (u.length != 2) return null;
    var p = u[1].split("&");
    var params = {};
    for (var i=0;i<p.length;i++) {
        var v = p[i].split("=");
        if (v.length == 2) params[v[0]] = v[1];
    }
    return params;
}

function toast(mes) {
    var message = mes;
    $("#toast").html(message);
    $("#toast").fadeIn(1000, function() {
        setTimeout(function() {
            $("#toast").fadeOut(1000);
        },2000);
    });
}


refreshCookies();

function getCookie(name) {
    var result = null;
    var cookieName = name + '=';
    var allcookies = document.cookie;
    var position = allcookies.indexOf( cookieName );
    if (position != -1) {
        var startIndex = position + cookieName.length;
        var endIndex = allcookies.indexOf( ';', startIndex );
        if (endIndex == -1) endIndex = allcookies.length;
        result = decodeURIComponent(allcookies.substring(startIndex, endIndex));
    }
    return result;
}
// cookieの期限を更新。
function refreshCookies() {
    (getCookie('extends') == "yes") ? extendCookies() : shortenCookies();
}
function extendCookies() {
    var id = getCookie('id');
    if (id) document.cookie = "id=" + id + ";max-age=604800;" + cookieSecure;
    document.cookie = "extends=yes;max-age=604800;" + cookieSecure;
}
function shortenCookies() {
    var id = getCookie('id');
    if (id) document.cookie = "id=" + id + ";" + cookieSecure;
    document.cookie = "extends=no;" + cookieSecure;
}