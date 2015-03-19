/** This file is part of KCFinder project
  *
  *      @desc Image viewer
  *   @package KCFinder
  *   @version 3.12
  *    @author Pavel Tzonkov <sunhater@sunhater.com>
  * @copyright 2010-2014 KCFinder Project
  *   @license http://opensource.org/licenses/GPL-3.0 GPLv3
  *   @license http://opensource.org/licenses/LGPL-3.0 LGPLv3
  *      @link http://kcfinder.sunhater.com
  */

_.cropImage = function(data) {

    var ts = new Date().getTime(),
        dlg = false,
        images = [],
        min_h = 100,
        w = $(window),
        min_w, dd, dv, dh,

    showImage = function(data) {
        _.lock = true;

        var url = $.$.escapeDirs(_.uploadURL + "/" + _.dir + "/" + data.name) + "?ts=" + ts,
            img = new Image(),
            i = $(img),

        onImgLoad = function() {
            _.lock = false;

            $('#files .file').each(function() {
                if ($(this).data('name') == data.name) {
                    _.ssImage = this;
                    return false;
                }
            });

            i.hide().appendTo('body');

            var w_w = w.width(),
                w_h = w.height(),
                o_w = i.width(),
                o_h = i.height(),
                i_w = o_w,
                i_h = o_h,
                openDlg = false,
                t = $('<div class="img"></div>'),


            cropFunc = function(e) {
                if (_.ssImage) {
                    var data = {};
                    data.src = $("#cropper").data("src");
                    data.top = parseInt($(".cropMask").position().top);
                    data.left = parseInt($(".cropMask").position().left);
                    data.height = parseInt($(".cropMask").height());
                    data.width = parseInt($(".cropMask").width());

                    $.post("test.php", {
                        data: JSON.stringify(data)
                    });
                }
                dlg.dialog('destroy').detach();
            };

            i.detach().appendTo(t);

            if (!dlg) {
                openDlg = true;

                var closeFunc = function() {
                    dlg.dialog('destroy').detach();
                },

                focusFunc = function() {
                    setTimeout(function() {
                        dlg.find('input').get(0).focus();
                    }, 100);
                };

                dlg = _.dialog(".", "", {
                    draggable: false,
                    nopadding: true,
                    close: closeFunc,
                    show: false,
                    hide: false,
                    buttons: [
                        {
                            text: _.label("Crop"),
                            icons: {primary: "ui-icon-scissors"},
                            click: cropFunc

                        }, {
                            text: _.label("Close"),
                            icons: {primary: "ui-icon-closethick"},
                            click: closeFunc
                        }
                    ]
                });

                dlg.css({overflow: "hidden"}).parent().css({width: "auto", height: "auto"});

                dd = dlg.parent().click(focusFunc).rightClick(focusFunc).disableTextSelect().addClass('kcfImageViewer');
                dv = dd.find('.ui-dialog-titlebar').outerHeight() + dd.find('.ui-dialog-buttonpane').outerHeight() + dd.outerVSpace('b');
                dh = dd.outerHSpace('b');
                min_w = dd.outerWidth() - dh;
            }

            var max_w = w_w - dh,
                max_h = w_h - dv + 1,
                top = 0,
                left = 0,
                width = o_w,
                height = o_h;

            // Too big
            if ((o_w > max_w) || (o_h > max_h)) {

                if ((max_h / max_w) < (o_h / o_w)) {
                    height = max_h;
                    width = (o_w * height) / o_h;

                } else {
                    width = max_w;
                    height = (o_h * width) / o_w;
                }

                i_w = width;
                i_h = height;

            // Too small
            } else if ((o_w < min_w) || (o_h < min_h)) {
                width = (o_w < min_w) ? min_w : o_w;
                height = (o_h < min_h) ? min_h : o_h;
                left = (o_w < min_w) ? (min_w - o_w) / 2 : 0;
                top = (o_h < min_h) ? (min_h - o_h) / 2 : 0;
            }

            var show = function() {
                dlg.animate({width: width, height: height}, 150);
                dlg.parent().animate({top: (w_h - height - dv) / 2, left: (w_w - width - dh) / 2}, 150, function() {
                    dlg.html(t.get(0)).append('<input style="width:1px;height:1px;position:fixed;top:-1000px;left:-1000px" type="text" />');
                    i.css({padding: top + "px 0 0 " + left + "px", width: i_w, height: i_h}).show();
                    dlg.children().first().css({width: width, height: height, display: "none"}).fadeIn(150, function() {
                        loadingStop();
                        var title = data.name + " (" + o_w + " x " + o_h + ")";
                        dlg.prev().find('.ui-dialog-title').css({width:width - dlg.prev().find('.ui-dialog-titlebar-close').outerWidth() - 20}).text(title).attr({title: title}).css({cursor: "default"});
                    });
                });
            };

            var cropper = document.createElement('canvas');
                cropper.height = i_h;
                cropper.width = i_w;
            $(cropper).appendTo(t);

            //create and manage square for cropping image
            var cropMask = document.createElement('div');
            $(cropMask).addClass('cropMask').appendTo(t);

            //create element for resize mask
            var resizeMask = document.createElement('div');
            $(resizeMask).addClass('resizeMask ui-icon ui-icon-grip-diagonal-se').appendTo(cropMask);

            //create element for size labels
            var sizeLabel = document.createElement('div');
            $(sizeLabel).addClass('sizeLabel').appendTo(cropMask);
            setTimeout( function(){ 
                $(sizeLabel).text($(cropMask).width() + "x" + $(cropMask).height());
            }, 500 );


            //manage resize
            var isResizing = false;
            $(resizeMask).mousedown(function() {
                isResizing = true;
            });

            //manage drag
            var isDragging = {};

            isDragging.target = null;
            $(cropMask).mousedown(function() {
                isDragging.target = $(cropMask);

                var divOffset = isDragging.target.offset();
                var maskBorder = parseInt($(cropMask).css("border-width")) * 2;
                var maskWidth = $(cropMask).width() + maskBorder;
                var maskHeight = $(cropMask).height() + maskBorder;

                isDragging.relX = event.pageX - divOffset.left;
                isDragging.relY = event.pageY - divOffset.top;
                //console.log('x: ' + isDragging.relX + ' - y: ' + isDragging.relY);
                isDragging.complRelX = maskWidth - isDragging.relX;
                isDragging.complRelY = maskHeight - isDragging.relY;
                //console.log('complX: ' + isDragging.complRelX + ' - complY: ' + isDragging.complRelY);

            });
            $(document.body).mouseup(function() {
                isDragging.target = null;
                isResizing = false;
            });

            $(document.body).mousemove(function(event) {

                function isPositionValid() {
                    var result = {};
                    var canvasOffset = $(cropper).offset();

                    result.maskBorder = parseInt($(cropMask).css("border-width")) * 2;
                    result.newY = event.pageY - isDragging.relY;
                    result.newX = event.pageX - isDragging.relX;
                    result.maskWidth = $(cropMask).width() + result.maskBorder;
                    result.maskHeight = $(cropMask).height() + result.maskBorder;

                    //mouse position relative to canvas
                    result.canRelX = event.pageX - canvasOffset.left;
                    result.canRelY = event.pageY - canvasOffset.top;
                    
                    result.positionValid = {};
                    result.positionValid.valid = true;
                    result.positionValid.minY = false;
                    result.positionValid.minX = false;
                    result.positionValid.maxY = false;
                    result.positionValid.maxX = false;

                    //manage minimum position
                    if (result.canRelY - isDragging.relY < 0) {
                        //console.log('negative Y');
                        result.positionValid.valid = false;
                        result.positionValid.minY = true;
                    }
                    if (result.canRelX - isDragging.relX < 0) {
                        //console.log('negative X');
                        result.positionValid.valid = false;
                        result.positionValid.minX = true;
                    }
                    //manage maximum position
                    if (result.canRelY + isDragging.complRelY > i_h) {
                        //console.log('overflow Y');
                        result.positionValid.valid = false;
                        result.positionValid.maxY = true;
                    }
                    if (result.canRelX + isDragging.complRelX > i_w) {
                        //console.log('overflow X');
                        result.positionValid.valid = false;
                        result.positionValid.maxX = true;
                    }
                    return result;
                }

                var result;
                if (isDragging.target && isResizing === true) {
                    //resize section
                    result = isPositionValid();

                    var newHeight = result.canRelY - parseInt($(cropMask).css("top"));
                    var newWidth = result.canRelX - parseInt($(cropMask).css("left"));
                    isDragging.target.css({
                        height: newHeight,
                        width: newWidth
                    });

                    //manage outside positions
                    if (result.positionValid.maxY) {
                        var canvasY = $(cropper).offset().top;
                        newHeight = i_h - ($(cropMask).offset().top - canvasY + result.maskBorder);
                        $(cropMask).css({height: newHeight + 'px'});
                    }
                    if (result.positionValid.maxX) {
                        var canvasX = $(cropper).offset().left;
                        newWidth = i_w - ($(cropMask).offset().left - canvasX + result.maskBorder);
                        $(cropMask).css({width: newWidth + 'px'});
                    }

                    $(sizeLabel).text(parseInt(newWidth) + "x" + parseInt(newHeight));


                } else if (isDragging.target && isResizing !== true) {
                    //drag section

                    result = isPositionValid();
                    if (result.positionValid.valid) {
                        isDragging.target.offset({
                            top: result.newY,
                            left: result.newX
                        });
                    }

                    //manage outside positions
                    if (result.positionValid.minY) {
                        $(cropMask).css({top: 0});
                    }
                    if (result.positionValid.minX) {
                        $(cropMask).css({left: 0});
                    }
                    if (result.positionValid.maxY) {
                        $(cropMask).css({top: i_h - result.maskHeight + 'px'});
                    }
                    if (result.positionValid.maxX) {
                        $(cropMask).css({left: i_w - result.maskWidth + 'px'});
                    }
                }
            });

            
            



            $(cropper).css({'position': 'absolute', 'top': '0', 'left': '0'});
            var image = $(cropper).siblings("img");
            var imageSrc = image.attr("src");
            $(cropper).data("src", imageSrc);
            $(cropper).attr("id", "cropper");

            var context = cropper.getContext('2d');

            /* immagine */
            var imageObj = new Image();
            imageObj.onload = function() {
                context.drawImage(imageObj, 0, 0, i_w, i_h);
            };
            imageObj.src = imageSrc;
            /**/

            if (openDlg)
                show();
            else
                dlg.children().first().fadeOut(150, show);
        },

        loadingStart = function() {
            if (dlg)
                dlg.prev().addClass("loading").find('.ui-dialog-title').text(_.label("Loading image...")).css({width: "auto"});
            else
                $('#loading').text(_.label("Loading image...")).show();
        },

        loadingStop = function() {
            if (dlg)
                dlg.prev().removeClass("loading");
            $('#loading').hide();
        };

        loadingStart();
        img.src = url;

        if (img.complete)
            onImgLoad();
        else {
            img.onload = onImgLoad;
            img.onerror = function() {
                _.lock = false;
                loadingStop();
                _.alert(_.label("Unknown error."));
                _.refresh();
            };
        }
        $(img).attr("id", "imgToCrop");
    };

    $.each(_.files, function(i, file) {
        i = images.length;
        if (file.thumb || file.smallThumb)
            images[i] = file;
        if (file.name == data.name)
            _.currImg = i;
    });

    showImage(data);
    return false;
};
