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
        img_link: 'http://ww2.sinaimg.cn/small/723dadf5gw1f8vnviyg1zj20cb0bq74o.jpg',
        code_link: 'http://asciiflow.com/',
        title: '纯文本流程图表',
        core_tech: 'JavaScript + CSS',
        description: '如果你对MicrosoftVisio望而却步，对Diagram.ly都觉得麻烦，ASCIIFlow可能是你的菜。ASCIIFlow是上世纪九十年代黑客们最爱的制作流程图表方式，全文本易传播，Geek风格的反璞归真。不幸的是，目前似乎无法输入中文。'
    }, {
       demo_link: 'http://emblemmatic.org/markmaker',
       img_link: 'http://ww3.sinaimg.cn/large/723dadf5gw1f8vnlypmn9j208c08cdg0.jpg',
       code_link: 'http://emblemmatic.org/markmaker',
       title: '生成企业Logo',
       core_tech: 'JavaScript',
       description: '还在为设计企业Logo而绞尽脑汁么？这里有国外站点提供的Logo免费生成服务！'
   }, {
        demo_link: 'http://d.lanrentuku.com/down/js/jiaodiantu-785/',
        img_link: 'http://ww1.sinaimg.cn/mw690/723dadf5gw1f8vo03ponpj207s03wdfw.jpg',
        code_link: 'http://www.lanrentuku.com/js/d785.zip',
        title: '腾讯软件中心JS焦点图代码',
        core_tech: 'CSS',
        description: '腾讯软件中心JS焦点图代码，调用方便，图片尺寸610x205。'
    }, {
        demo_link: 'http://d.lanrentuku.com/down/js/jiaodiantu-1164/',
        img_link: 'http://ww3.sinaimg.cn/mw690/723dadf5gw1f8vo046r3fj207s03wwev.jpg',
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
        gutter: 20
    })
}
