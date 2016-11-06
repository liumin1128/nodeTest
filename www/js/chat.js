/*
* @Author: 刘敏
* @Date:   2016-02-13 16:14:14
* @Last Modified by:   刘敏
* @Last Modified time: 2016-02-15 20:12:58
*/
$(document).ready(function(){
    // $('#connect').modal('show');
    var chat = new chatObj();
    chat.init();
    // 自动获取浏览器最大高度
    // $(".chat").css("min-height",$(document).height());
    $(".nickname")[0].value = $.cookie("nickname")||"";
    // if(navigator.platform.indexOf('Win32')!=-1){
    //     alert("电脑");
    //  }else{
    //     // go to 手机
    //     alert("手机");

    //   }
    $(".fontColor").change(function(){
        chat.fontColor = $(".fontColor")[0].value;
    })
    $(".bgColor").change(function(){
        chat.bgColor = $(".bgColor")[0].value;
    })
    $(".fontSize").change(function(){
        chat.fontSize = $(".fontSize")[0].value;
        console.log(chat.fontSize);
    })
    $(".plusbtn").click(function(){
        window.setTimeout(function(){
            $(".sentinput").focus();
        },500);
    })
    $(".emojibtn").click(function() {
        $(".heads").hide(300);
        $(".font-set").hide(300);
        $(".emoji").toggle(300);
    });
    $(".fontbtn").click(function() {
        $(".heads").hide(300);
        $(".emoji").hide(300);
        $(".font-set").toggle(300);
    });
    $(".facebtn").click(function() {
        $(".font-set").hide(300);
        $(".emoji").hide(300);
        $(".heads").toggle(300);
    });
    $(".clearbtn").click(function() {
        $(".sentinput")[0].value = "";
    });
    $(".emoji").click(function(e) {
        var target = e.target;
        // console.log(target.nodeName.toLowerCase());
        if (target.nodeName.toLowerCase() == "img") {
            $(".sentinput")[0].value = $(".sentinput")[0].value + "[emoji:" + target.title + "]";
            $('.sentinput').focus();
            // console.log($(".emoji img").length)
        }
    });
    $(".heads").click(function(e) {
        var target = e.target;
        // console.log(target.nodeName.toLowerCase());
        if (target.nodeName.toLowerCase() == "img") {
            chat.head = target.title;
            // 头像已更换为
            // alert("头像已更换"+chat.head);
            $("img.current").removeClass("current");
            $("img[title="+chat.head+"]").addClass("current");
            $('.sentinput').focus();
            // console.log($(".emoji img").length)
        }
    });
    $("img[title="+chat.head+"]").addClass("current");
    $(document).keydown(function(event) {
        if (event.keyCode == 13) {
            $('.sent').modal('show');
            window.setTimeout(function(){
                $('.sentinput').focus();
            },500)
            return false;
        };
    });
//键盘操作





});

var chatObj = function(){
    this.socket = null;
    this.fontColor = "";
    this.bgColor = "";
    this.fontSize = "";
    this.head = "";
    this.name = "";
    this.init = function(){
        var that = this;
        this.fontColor = "#ffffff";
        this.bgColor = randomColor(0, 0, 0, 1);
        this.fontSize = "14px";
        this.head = "face"+Math.floor(Math.random()*17);
        this.socket = io.connect();
        this.socket.on("connect",function(){
            // 显示模态框且自动聚焦
            $('#login').modal('show');
            window.setTimeout(function(){
                // $('#connect').modal('hide');
                $(".nickname").focus();
            },500);
            $(".mybtn").click(function(){
                var nickname = $(".nickname")[0].value;
                if (/[$"'<>%;)(&+@#!^*()-+=]/.test(nickname)) {
                    alert('昵称中不得带有"["<>%;)(&+@#!^*()-+=]等特殊字符!');
                    $(".nickname")[0].value = nickname.replace(/[$"'<>%;)(&+@#!^*()-+=]/g,"");
                } else {
                    if (nickname.length >= 2 && nickname.length <= 6) {
                        // 如果输入信息符合条件则发送登录信息
                        that.socket.emit('login', nickname,that.fontColor,that.bgColor,that.fontSize,that.head);
                    } else {
                        alert("请输入2~6个字符");
                    }
                }
            });
            $(".nickname").keydown(function(event) {
                if (event.keyCode == 13) {

                    var nickname = $(".nickname")[0].value;
                    if (/[$"'<>%;)(&+@#!^*()-+=]/.test(nickname)) {
                        alert('昵称中不得带有"["<>%;)(&+@#!^*()-+=]等特殊字符!');
                        $(".nickname")[0].value = nickname.replace(/[$"'<>%;)(&+@#!^*()-+=]/g,"");

                    } else {
                        if (nickname.length >= 2 && nickname.length <= 8) {
                            // 如果输入信息符合条件则发送登录信息
                            that.socket.emit('login', nickname);
                        } else {
                            alert("请输入2~6个字符");
                        }
                    }
                    return false;
                };

            });

            $(".sentbtn").click(function(){
                var data = $(".sentinput")[0].value;
                data = nizoukai(data);

                if(data.length>=1){
                    // 如果输入信息符合条件则发送登录信息
                    that.socket.emit('postMsg', data,that.fontColor,that.bgColor,that.fontSize,that.head);
                    that.showMyMessage(that.name,data,that.fontColor,that.bgColor,that.fontSize,that.head);
                    goToBottom();
                    $(".sentinput")[0].value = "";
                    $('.sent').modal('toggle')
                }else{
                    // alert("内容不能为空!");
                }
            });

            $(".sentinput").keydown(function(event) {
                if (event.keyCode == 13) {
                    var data = $(".sentinput")[0].value;
                    data = nizoukai(data);

                    if (data.length >= 1) {
                        // 如果输入信息符合条件则发送登录信息
                        that.socket.emit('postMsg', data, that.fontColor, that.bgColor, that.fontSize,that.head);
                        that.showMyMessage(that.name, data, that.fontColor, that.bgColor, that.fontSize,that.head);
                        goToBottom();
                        $(".sentinput")[0].value = "";
                        $('.sent').modal('toggle')
                    } else {
                        // alert("内容不能为空!");
                    }
                    return false;
                };

            });

            document.getElementById('sentimg').addEventListener('change', function() {
                //检查是否有文件被选中
                if (this.files.length != 0) {
                    //获取文件并用FileReader进行读取
                    var file = this.files[0],
                        reader = new FileReader();
                    if (!reader) {
                        that._displayNewMsg('system', '!your browser doesn\'t support fileReader', 'red');
                        this.value = '';
                        return;
                    };
                    reader.onload = function(e) {
                        //读取成功，显示到页面并发送到服务器
                        this.value = '';
                        console.log(that.head);
                        that.socket.emit('img',that.name,e.target.result,that.fontColor,that.bgColor,that.fontSize,that.head);
                        that.showMyImg(that.name, e.target.result,that.fontColor,that.bgColor,that.fontSize,that.head);
                    };
                    reader.readAsDataURL(file);
                    goToBottom();
                    $('.sent').modal('toggle')
                };
            }, false);
        });
        this.socket.on('nickExisted', function() {
            alert("此昵称已被使用!"); //显示昵称被占用的提示
            // console.log("已重新连接")
        });
        this.socket.on('loginSuccess', function() {
            that.name = $(".nickname")[0].value;
            document.title = $(".nickname")[0].value;
            $('#login').modal('hide');
            $.cookie('nickname', that.name, { expires: 7 });
        });
        this.socket.on('system',function(data,num){

                data = data + getTimeChar();
            var system = $("<div class='text-center systemMsg'></div>").text(data)
            $(".messages").append(system);
            $(".usersnum").text(num);
            goToBottom();
        });
        this.socket.on('newMsg', function(user, data,fontColor,bgColor,fontSize,head) {
            that.showMessage(user, data,fontColor,bgColor,fontSize,head);
            goToBottom();
        });
        this.socket.on('newImg', function(user, img,fontColor,bgColor,fontSize,head) {
            that.showImg(user, img,fontColor,bgColor,fontSize,head);
            goToBottom();
        });
    };
    this.showMessage = function(user,data,fontColor,bgColor,fontSize,head){
        data = this.showEmoji(data);
        var message = '<div class="message row">' +
                    '<div class="col-sm-1 col-xs-2">' +
                        '<div class="head center-block">' +
                            '<img src="img/face/'+head+'.jpg" class="img-circle img-responsive center-block" alt="Responsive image">' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-10 col-xs-8 clearfix">' +
                        '<p>'+
                            user+getTimeChar()+
                        '</p>' +
                        '<div style="color:'+
                            fontColor+
                            ';background:'+
                            bgColor+
                            ';font-size:'+
                            fontSize+
                            ';" class="content pull-left">' +
                            data +
                        '</div>' +
                        '<span style="border-color:transparent '+bgColor+' transparent transparent;" class="sl"></span>' +
                    '</div>' +
                '</div>';
        $(".messages").append(message);
    };
    this.showMyMessage = function(user,data,fontColor,bgColor,fontSize,head){
        data = this.showEmoji(data);
        var message = '<div class="message row">' +
                    '<div class="col-sm-1 col-xs-2"></div>' +
                    '<div class="col-sm-1 col-sm-push-10 col-xs-2 col-xs-push-8">' +
                        '<div class="head center-block">' +
                            '<img src="img/face/'+head+'.jpg" class="img-circle img-responsive center-block" alt="Responsive image">' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-10 col-sm-pull-1 col-xs-8 col-xs-pull-2 clearfix">' +
                        '<p class="text-right">'+
                        user+getTimeChar()+
                        '</p>' +
                        '<div style="color:'+
                            fontColor+
                            ';background:'+
                            bgColor+
                            ';font-size:'+
                            fontSize+
                            ';" class="content pull-right">' +
                            data +
                        '</div>' +
                        '<span style="border-color:transparent transparent transparent '+bgColor+';" class="sr"></span>' +
                    '</div>' +
                '</div>';
        $(".messages").append(message);
    };
    this.showImg = function(user,img,fontColor,bgColor,fontSize,head){
        console.log(head);
        var message = '<div class="message row">' +
                    '<div class="col-sm-1 col-xs-2">' +
                        '<div class="head center-block">' +
                            '<img src="img/face/'+head+'.jpg" class="img-circle img-responsive center-block" alt="Responsive image">' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-10 col-xs-8 clearfix">' +
                        '<p>'+
                        user+getTimeChar()+
                        '</p>' +
                        '<div style="color:'+
                            fontColor+
                            ';background:'+
                            bgColor+
                            ';font-size:'+
                            fontSize+
                            ';" class="content pull-left">' +
                            '<img src="'+
                            img +
                            '" alt="">'+
                        '</div>' +
                        '<span style="border-color:transparent '+bgColor+' transparent transparent;" class="sl"></span>' +
                    '</div>' +
                '</div>';
        $(".messages").append(message);
    };
    this.showMyImg = function(user,img,fontColor,bgColor,fontSize,head){
        var message = '<div class="message row">' +
                    '<div class="col-sm-1 col-xs-2"></div>' +
                    '<div class="col-sm-1 col-sm-push-10 col-xs-2 col-xs-push-8">' +
                        '<div class="head center-block">' +
                            '<img src="img/face/'+head+'.jpg" class="img-circle img-responsive center-block" alt="Responsive image">' +
                        '</div>' +
                    '</div>' +
                    '<div class="col-sm-10 col-sm-pull-1 col-xs-8 col-xs-pull-2 clearfix">' +
                        '<p class="text-right">'+
                        user+getTimeChar()+
                        '</p>' +
                        '<div style="color:'+
                            fontColor+
                            ';background:'+
                            bgColor+
                            ';font-size:'+
                            fontSize+
                            ';" class="content pull-right">' +
                            '<img src="'+
                            img +
                            '" alt="">'+
                        '</div>' +
                        '<span style="border-color:transparent transparent transparent '+bgColor+';" class="sr"></span>' +
                    '</div>' +
                '</div>';
        $(".messages").append(message);
    };
    this.showEmoji = function(data){
        var reg =  /\[emoji:lion\d+\]/g,
            result = data,
            emojiTotalNum = $(".emoji img").length,
            emojiId,match;
            // console.log(reg.exec(data));
            while (match = reg.exec(data))  {
                // console.log(match[0].slice(11, -1));
                emojiId = match[0].slice(11, -1);
                // console.log(reg.lastIndex);
                if(emojiId<=emojiTotalNum){
                    result = result.replace(match[0],'<img class="emojiLion" src="img/lion/' + emojiId + '.gif" />');
                }else{
                    result = result.replace(match[0],'<img class="emojiLion" src="img/lion/' + 13 + '.gif" />');
                }
            }
        return result;
    };
}





function goToBottom(){
    var speed=500;//滑动的速度
    $('body,html').animate({ scrollTop: $('body,html')[0].scrollHeight }, speed);
    // $('.messages').animate({ scrollTop: $(".messages")[0].scrollHeight }, 1000);
}

function getTimeChar(){
    var mydate = new Date();
    var hours = mydate.getHours(),
        minutes = mydate.getMinutes(),
        seconds = mydate.getSeconds();
    return "("+hours+":"+minutes+":"+seconds+")";
}

function nizoukai(data){
    // reg = new RegExp("<","g");
    var res = data.replace(/\</g,"＜");
        res = res.replace(/\>/g,"＞");
        res = res.replace(/script/g,"[emoji:lion02]");
    return res;
}

function cleanSpelChar(data){
    if(/["'<>%;)(&+]/.test(data)){
        alert("昵称中不得带有'[<>%;)(&+]'等特殊字符!");
        return data.replace(/["'<>%;)(&+]/,"");
    }else{
        return data;
    }
}

function checkSpelChar(data){
    if(/["'<>%;)(&+]/.test(data)){
        alert("昵称中不得带有'[<>%;)(&+]'等特殊字符!");
        return false;
    }else{
        return true;
    }
}

function randomColor(r, g, b, a) {
    var R = r || Math.floor(Math.random() * 255);
    var G = g || Math.floor(Math.random() * 255);
    var B = b || Math.floor(Math.random() * 255);
    var A = a || Math.random();
    return "rgba(" + R + "," + G + "," + B + "," + A + ")";
}

//昵称设置的确定按钮


// addEventListener('click', function() {
//     var nickName = document.getElementById('nicknameInput').value;
//     //检查昵称输入框是否为空
//     if (nickName.trim().length != 0) {
//         //不为空，则发起一个login事件并将输入的昵称发送到服务器
//         that.socket.emit('login', nickName);
//     } else {
//         //否则输入框获得焦点
//         document.getElementById('nicknameInput').focus();
//     };
// }, false);


// Advantage
// $.fn.autoHeight = function(){

//     function autoHeight(elem){
//         elem.style.height = 'auto';
//         elem.scrollTop = 0; //防抖动
//         elem.style.height = elem.scrollHeight + 'px';
//     }

//     this.each(function(){
//         autoHeight(this);
//         $(this).on('keyup', function(){
//             autoHeight(this);
//         });
//     });

// }


// $('textarea[autoHeight]').autoHeight();
