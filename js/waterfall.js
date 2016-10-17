/* jshint asi:true */
//先等图片都加载完成
//再执行布局函数

/**
 * 执行主函数
 * @param  {[type]} function( [description]
 * @return {[type]}           [description]
 */
(function() {

    /**
     * 内容JSON
     */
    var demoContent = [{
        demo_link: 'http://asciiflow.com/',
        img_link: 'http://img1.appinn.com/2011/06/Asciiflow_-_ASCII_Flow_Diagram_Tool-20110620-082457.jpg',
        code_link: 'http://asciiflow.com/',
        title: '纯文本流程图表',
        core_tech: 'JavaScript + CSS',
        description: '如果你对MicrosoftVisio望而却步，对Diagram.ly都觉得麻烦，ASCIIFlow可能是你的菜。ASCIIFlow是上世纪九十年代黑客们最爱的制作流程图表方式，全文本易传播，Geek风格的反璞归真。不幸的是，目前似乎无法输入中文。'
    }, {
       demo_link: 'http://emblemmatic.org/markmaker',
       img_link: 'data:image/png;base64,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',
       code_link: 'http://emblemmatic.org/markmaker',
       title: '生成企业Logo',
       core_tech: 'JavaScript',
       description: '还在为设计企业Logo而绞尽脑汁么？这里有国外站点提供的Logo免费生成服务！'
   }, {
        demo_link: 'http://d.lanrentuku.com/down/js/jiaodiantu-785/',
        img_link: 'http://d.lanrentuku.com/down/js/jiaodiantu-785/index.jpg',
        code_link: 'http://www.lanrentuku.com/js/d785.zip',
        title: '腾讯软件中心JS焦点图代码',
        core_tech: 'CSS',
        description: '腾讯软件中心JS焦点图代码，调用方便，图片尺寸610x205。'
    }, {
        demo_link: 'http://d.lanrentuku.com/down/js/jiaodiantu-1164/',
        img_link: 'http://d.lanrentuku.com/down/js/jiaodiantu-1164/index.jpg',
        code_link: 'http://www.lanrentuku.com/js/d1164.zip',
        title: 'jQuery横向图片焦点图滚动效果',
        core_tech: 'jQuery',
        description: 'jQuery横向图片焦点图滚动效果，标题有打字机效果，兼容主流浏览器。'
    }];

    contentInit(demoContent) //内容初始化
    waitImgsLoad() //等待图片加载，并执行布局初始化
}());



/**
 * 内容初始化
 * @return {[type]} [description]
 */
function contentInit(content) {
    // var htmlArr = [];
    // for (var i = 0; i < content.length; i++) {
    //     htmlArr.push('<div class="grid-item">')
    //     htmlArr.push('<a class="a-img" href="'+content[i].demo_link+'">')
    //     htmlArr.push('<img src="'+content[i].img_link+'">')
    //     htmlArr.push('</a>')
    //     htmlArr.push('<h3 class="demo-title">')
    //     htmlArr.push('<a href="'+content[i].demo_link+'">'+content[i].title+'</a>')
    //     htmlArr.push('</h3>')
    //     htmlArr.push('<p>主要技术：'+content[i].core_tech+'</p>')
    //     htmlArr.push('<p>'+content[i].description)
    //     htmlArr.push('<a href="'+content[i].code_link+'">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>')
    //     htmlArr.push('</p>')
    //     htmlArr.push('</div>')
    // }
    // var htmlStr = htmlArr.join('')
    var htmlStr = ''
    for (var i = 0; i < content.length; i++) {
        htmlStr +=
            '<div class="grid-item">' +
            '   <a class="a-img" href="' + content[i].demo_link + '">' +
            '       <img src="' + content[i].img_link + '">' +
            '   </a>' +
            '   <h3 class="demo-title">' +
            '       <a href="' + content[i].demo_link + '">' + content[i].title + '</a>' +
            '   </h3>' +
            '   <p>主要技术：' + content[i].core_tech + '</p>' +
            '   <p>' + content[i].description +
            '       <a href="' + content[i].code_link + '">源代码 <i class="fa fa-code" aria-hidden="true"></i></a>' +
            '   </p>' +
            '</div>'
    }
    var grid = document.querySelector('.grid')
    grid.insertAdjacentHTML('afterbegin', htmlStr)
}

/**
 * 等待图片加载
 * @return {[type]} [description]
 */
function waitImgsLoad() {
    var imgs = document.querySelectorAll('.grid img')
    var totalImgs = imgs.length
    var count = 0
        //console.log(imgs)
    for (var i = 0; i < totalImgs; i++) {
        if (imgs[i].complete) {
            //console.log('complete');
            count++
        } else {
            imgs[i].onload = function() {
                // alert('onload')
                count++
                //console.log('onload' + count)
                if (count == totalImgs) {
                    //console.log('onload---bbbbbbbb')
                    initGrid()
                }
            }
        }
    }
    if (count == totalImgs) {
        //console.log('---bbbbbbbb')
        initGrid()
    }
}

/**
 * 初始化栅格布局
 * @return {[type]} [description]
 */
function initGrid() {
    var msnry = new Masonry('.grid', {
        // options
        itemSelector: '.grid-item',
        columnWidth: 250,
        isFitWidth: true,
        gutter: 20,
    })
}
