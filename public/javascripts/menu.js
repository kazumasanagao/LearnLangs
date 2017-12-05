$('#menuButton').click(function() {
    $('#menu').fadeIn();
    $('#graylayer').fadeIn();
});
$('#graylayer').click(function() {
    $('#menu').fadeOut();
    $('#graylayer').fadeOut();
    $('#confReserve').fadeOut(); // study.js
    $('#max_description').fadeOut(); // teach.js
});
$('#userinfo').click(function() {
    window.location.href = '/userinfo';
});
$('#changepass').click(function() {
    window.location.href = '/changepass';
});
$("#logout").click(function() {
    document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    window.location.href = "/";
});