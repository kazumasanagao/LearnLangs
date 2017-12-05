var canvas, content, img;
const canvas_width = 100;
const canvas_height = 100;

function loadImage(fbphoto) {
    canvas = document.getElementById('image_preview');
    context = canvas.getContext("2d");
    img = new Image();
    //img.crossOrigin='Anonymous';
    loadCurrentImage();// 現在の画像をロード

    function loadCurrentImage() {
        if (fbphoto) {
            var fbphoto_canvas = document.getElementById('fbphoto');
            var fbphoto_content = fbphoto_canvas.getContext('2d'); 
            var fbimg = new Image();
            fbimg.setAttribute('crossOrigin', 'anonymous');
            fbimg.src = fbphoto;
            fbimg.onload = function() {
                fbphoto_content.drawImage(fbimg, 0, 0, canvas_width, canvas_height);
                img.src = fbphoto_canvas.toDataURL("image/jpeg");
            }
            
        } else {
            var id = ($("#r_id").html()) ? $("#r_id").html() : null;
            if (id) img.src = image_url + id + ".jpeg";
        }

        img.onload = function() {
            context.drawImage(img, 0, 0, canvas_width, canvas_height);
        }
        img.onerror = function() {
            //img.src = makeRapidsUrl(); // conf.jsより
            img.src = "/images/nophoto.png"
        }
    }
}


function preview(ele) {
    if (!ele.files.length) return;
    var file = ele.files[0];
    var fr = new FileReader();
    fr.onload = function() {
        context.clearRect(0,0, canvas_width, canvas_height);
        img.src = fr.result;
        img.onload = function() { // 画像のロードが完了してから、Editする。
            img.onload = ""; // onloadを初期化。そうしないと、editImageの無限ループになる。
            editImage(img);
        }    
    }
    fr.readAsDataURL(file);
}
function editImage(img) {
    rotateImg(img);
    trimImg(img); 
}
function trimImg(img0) {
    var tmp_canvas = document.createElement('canvas');
    var tmp_context = tmp_canvas.getContext('2d');
    var width = img0.width;
    var height = img0.height;
    tmp_canvas.width = canvas_width;
    tmp_canvas.height = canvas_height;
    var sx,sy,sw,sh;
    if (width > height) {
        sy = 0;
        sh = height;
        sw = sh;
        sx = (width - sw) / 2;
    } else {
        sx = 0;
        sw = width;
        sh = sw;
        sy = (height - sh) / 2;
    }
    tmp_context.drawImage(img0, sx, sy, sw, sh, 0, 0, canvas_width, canvas_height);
    img.onload = function() {
        context.drawImage(img, 0, 0, canvas_width, canvas_height);
    }
    img.src = tmp_canvas.toDataURL("image/jpeg");
}

// Exif値で回転角度を場合分け
function rotateImg(img0) {
    var exif = getOrientation(img0.src);
    if (exif >= 2) {
        switch(exif) {
            case 3:
            case 4:
                img.src = ImageRotate(img0, img0.width, img0.height, 180);
                break;
            case 5:
            case 6:
                img.src = ImageRotate(img0, img0.width, img0.height, 90);
                break;
            case 7:
            case 8:
                img.src = ImageRotate(img0, img0.width, img0.height, 270);
                break;
        }
    } 
}

// 画像の回転
function ImageRotate(img0, width, height, rotate) {
    var tmp_canvas = document.createElement('canvas');
    if(rotate == 90 || rotate == 270) {
        tmp_canvas.width = height;
        tmp_canvas.height = width;
    } else {
        tmp_canvas.width = width;
        tmp_canvas.height = height;
    }
    var tmp_context = tmp_canvas.getContext('2d');
    if(rotate && rotate > 0) {
        tmp_context.rotate(rotate * Math.PI / 180);
        if(rotate == 90)
            tmp_context.translate(0, -height);
        else if(rotate == 180)
            tmp_context.translate(-width, -height);
        else if(rotate == 270)
            tmp_context.translate(-width, 0);
    }
    tmp_context.drawImage(img0, 0, 0, width, height);
    return tmp_canvas.toDataURL("image/jpeg");
}

// Exifのorientationを取得
function getOrientation(imgDataURL){
        var byteString = atob(imgDataURL.split(',')[1]);
        var orientaion = byteStringToOrientation(byteString);
        return orientaion;

        function byteStringToOrientation(img){
            var head = 0;
            var orientation;
            while (1){
                if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 218) {break;}
                if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 216) {
                    head += 2;
                }
                else {
                    var length = img.charCodeAt(head + 2) * 256 + img.charCodeAt(head + 3);
                    var endPoint = head + length + 2;
                    if (img.charCodeAt(head) == 255 & img.charCodeAt(head + 1) == 225) {
                        var segment = img.slice(head, endPoint);
                        var bigEndian = segment.charCodeAt(10) == 77;
                        if (bigEndian) {
                            var count = segment.charCodeAt(18) * 256 + segment.charCodeAt(19);
                        } else {
                            var count = segment.charCodeAt(18) + segment.charCodeAt(19) * 256;
                        }
                        for (i=0;i<count;i++){
                            var field = segment.slice(20 + 12 * i, 32 + 12 * i);
                            if ((bigEndian && field.charCodeAt(1) == 18) || (!bigEndian && field.charCodeAt(0) == 18)) {
                                orientation = bigEndian ? field.charCodeAt(9) : field.charCodeAt(8);
                            }
                        }
                        break;
                    }
                    head = endPoint;
                }
                if (head > img.length){break;}
            }
            return orientation;
        }
}
