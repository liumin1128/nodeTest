/*
* @Author: 刘敏
* @Date:   2016-02-13 16:07:10
* @Last Modified by:   刘敏
* @Last Modified time: 2016-02-15 19:33:26
*/
//服务器及页面响应部分
var express = require('express'),
    app = express(),
    server = require('http').createServer(app),
    io = require('socket.io').listen(server); //引入socket.io模块并绑定到服务器
app.use('/', express.static(__dirname + '/www'));
server.listen(80);
console.log("服务器已开启,监听端口80");
users=[];//保存所有在线用户的昵称
//socket部分
io.on('connection', function(socket) {
    //接收并处理客户端发送的foo事件
    socket.on('foo', function(data) {
        //将消息输出到控制台
        console.log(data);
    })
    socket.on('login', function(nickname,fontColor,bgColor,fontSize,head) {
        if (users.indexOf(nickname) > -1) {
            console.log(nickname+"已存在"+nickname+fontColor+bgColor+fontSize+head);
            socket.emit('nickExisted');
        } else {
            socket.userIndex = users.length;
            socket.nickname = nickname;
            users.push(nickname);
            console.log(nickname+"登录"+nickname+fontColor+bgColor+fontSize+head);
            socket.emit('loginSuccess');
            io.sockets.emit('system', nickname+" 加入聊天室",users.length); //向所有连接到服务器的客户端发送当前登陆用户的昵称
        };
    });
    socket.on('postMsg', function(data,fontColor,bgColor,fontSize,head) {
        //将消息发送到除自己外的所有用户
        socket.broadcast.emit('newMsg', socket.nickname, data,fontColor,bgColor,fontSize,head);
    });
    socket.on('img', function(user,img,fontColor,bgColor,fontSize,head) {
        //通过一个newImg事件分发到除自己外的每个用户
        console.log(head);
        socket.broadcast.emit('newImg', socket.nickname, img,fontColor,bgColor,fontSize,head);
    });
    socket.on('disconnect', function() {
        //将断开连接的用户从users中删除
        users.splice(socket.userIndex, 1);
        //通知除自己以外的所有人
        socket.broadcast.emit('system', socket.nickname+"已离开", users.length);
    });
});
