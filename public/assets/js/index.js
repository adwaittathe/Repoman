


$(document).ready(function () {


    var scroller = $('#scroller div.innerScrollArea');
    var scrollerContent = scroller.children('ul');
    scrollerContent.children().clone().appendTo(scrollerContent);
    

    var curX = 0;
    scrollerContent.children().each(function () {
        var $this = $(this);
        $this.css('left', curX);
        curX += $this.outerWidth(true);
    });
    var fullW = curX / 2;
    var viewportW = scroller.width();

    var controller = { curSpeed: 0, fullSpeed: 1 };
    var $controller = $(controller);
    var tweenToNewSpeed = function (newSpeed, duration) {
        if (duration === undefined) {
            duration = 600;
            $controller.stop().animate({ curSpeed: newSpeed }, duration);
        }

    };
    var doScroll = function () {
        var curX = scroller.scrollLeft();
        var newX = curX + controller.curSpeed;
        if (newX > fullW * 2 - viewportW)
            newX -= fullW;
        scroller.scrollLeft(newX);

    };
    setInterval(doScroll, 40);
    tweenToNewSpeed(controller.fullSpeed);
    console.log("foo");
    console.log(scrollerContent.children());
    
});


