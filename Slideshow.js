/**
* This Javascript package creates slide show from the HTML UL list,
* rendering list items as slides
*
* Slideshow.js requires Event.js package, which can be acquired at the following links:
*
* Github - https://github.com/mark-rolich/Event.js
* JS Classes - http://www.jsclasses.org/package/212-JavaScript-Handle-events-in-a-browser-independent-manner.html
*
* @author Mark Rolich <mark.rolich@gmail.com>
*/
var Slideshow = function (evt, ssId, settings) {
    "use strict";

    var options         = (settings !== undefined) ? settings : {},
        autoplay        = options.autoplay || 0,
        current         = 0,
        info            = null,
        infoCntTxt      = null,
        infoText        = (options.info !== undefined) ? options.info : 1,
        mode            = options.mode || 'open-end',
        nextBtn         = null,
        noControls      = options.noControls || 0,
        offWidth        = 0,
        playBtn         = null,
        playBtnWrapper  = null,
        playButton      = (options.playButton !== undefined) ? options.playButton : 1,
        playSpeed       = options.playSpeed * 1000 || 1000,
        playStatus      = 0,
        prevBtn         = null,
        remainder       = 0,
        slideInterval   = null,
        slideWidth      = 0,
        ss              = document.getElementById(ssId),
        slides          = [],
        slidesLen       = 0,
        ssInterval      = null,
        ssWidth         = 0,
        start           = 0,
        step            = 50,
        tempStep        = 50,
        wrapper         = null,
        hovered         = 0,
        renderWrapper = function () {
            wrapper = document.createElement('div');

            wrapper.className = 'slide-show-wrapper';
            wrapper.style.width = slideWidth + 'px';

            ss.parentNode.insertBefore(wrapper, ss);
            wrapper.appendChild(ss);
        },
        init = function () {
            var i = 0,
                domSlides = ss.getElementsByTagName('li'),
                domSlidesLen = domSlides.length;

            for (i; i < domSlidesLen; i = i + 1) {
                if (domSlides[i].parentNode.className === 'slide-show') {
                    slides.push(domSlides[i]);
                    slidesLen = slidesLen + 1;
                }
            }

            for (i = 0; i < slidesLen; i = i + 1) {
                offWidth = slides[i].offsetWidth;
                ssWidth += offWidth;

                if (offWidth > slideWidth) {
                    slideWidth = offWidth;
                }
            }

            ss.style.width = ssWidth + 'px';

            if (options.speed !== undefined) {
                step = tempStep = options.speed;
            }

            remainder = slideWidth % step;

            renderWrapper();
        },
        renderNavigation = function () {
            var prevText = document.createTextNode('\u25C0'),
                nextText = document.createTextNode('\u25B6'),
                navBtnTopPos = '';

            prevBtn = document.createElement('button');
            prevBtn.className = 'nav-btn prev';
            prevBtn.setAttribute('title', 'Ctrl + ←');
            prevBtn.appendChild(prevText);

            nextBtn = prevBtn.cloneNode(false);
            nextBtn.className = 'nav-btn next';
            nextBtn.setAttribute('title', 'Ctrl + →');
            nextBtn.appendChild(nextText);

            wrapper.appendChild(prevBtn);
            wrapper.appendChild(nextBtn);

            navBtnTopPos = ((wrapper.offsetHeight - nextBtn.offsetHeight) / 2) + 'px';

            prevBtn.style.top = nextBtn.style.top = navBtnTopPos;
            prevBtn.style.display = nextBtn.style.display = 'none';
        },
        renderPlayBtn = function () {
            playBtnWrapper = document.createElement('div');
            playBtnWrapper.className = 'play-btn-wrapper';

            playBtn = nextBtn.cloneNode(true);
            playBtn.className = 'play';
            playBtn.setAttribute('title', 'Ctrl + ␣');
            playBtn.style.display = 'block';

            playBtnWrapper.appendChild(playBtn);
            wrapper.appendChild(playBtnWrapper);

            playBtnWrapper.style.left = ((slideWidth - playBtnWrapper.offsetWidth) / 2) + 'px';
            playBtnWrapper.style.display = 'none';
        },
        renderInfo = function () {
            var infoTxt1 = document.createTextNode('Slide '),
                infoTxt2 = infoTxt1.cloneNode(false),
                infoCnt = document.createElement('span');

            info = document.createElement('div');

            infoCntTxt = document.createTextNode('1');

            info.className = 'info';

            infoTxt2.nodeValue = ' of ' + slidesLen;

            info.appendChild(infoTxt1);

            infoCnt.appendChild(infoCntTxt);

            info.appendChild(infoCnt);
            info.appendChild(infoTxt2);

            wrapper.appendChild(info);
            info.style.display = 'none';
        },
        prepare = function () {
            if (mode === 'open-end') {
                ss.innerHTML += ss.innerHTML + ss.innerHTML;
                ss.style.width = (ssWidth * 3) + 'px';

                start = -(slideWidth * slidesLen);
                ss.style.left = start + 'px';
            }
        },
        pause = function () {
            window.clearInterval(ssInterval);
            ssInterval = null;
        },
        move = function (direction) {
            if (slideInterval !== null) {
                return false;
            }

            slideInterval = window.setInterval(function () {
                start = start + (step * direction);
                ss.style.left = start + 'px';

                var mod = Math.abs(start) % slideWidth;

                if (remainder !== 0
                            && ((direction === -1 && slideWidth - mod <= step)
                                || (direction === 1 && mod <= step))
                            ) {
                    step = 1;
                }

                if (mod === 0) {
                    window.clearInterval(slideInterval);
                    slideInterval = null;

                    step = tempStep;

                    current = (current - direction + slidesLen) % slidesLen;

                    if (current === 0) {
                        start = (mode === 'open-end')
                                ? -(slideWidth * slidesLen)
                                : 0;
                    }

                    if (info !== null) {
                        infoCntTxt.nodeValue = current + 1;
                    }

                    if (mode === 'ftl') {
                        if (hovered === 1) {
                            prevBtn.style.display = (current === 0) ? 'none' : 'block';
                        }

                        if (current === slidesLen - 1) {
                            if (hovered === 1) {
                                nextBtn.style.display = playBtnWrapper.style.display = 'none';
                            }

                            pause();
                            playStatus = 0;
                        } else {
                            if (hovered === 1) {
                                nextBtn.style.display = playBtnWrapper.style.display = 'block';
                            }

                            if (playStatus === 0 && playBtn !== null) {
                                playBtn.innerHTML = '\u25B6';
                            }
                        }
                    }
                }
            }, 10);
        },
        play = function () {
            move(-1);

            ssInterval = window.setInterval(function () {
                move(-1);
            }, playSpeed);
        },
        playPause = function () {
            if (playButton === 1) {
                if (playStatus === 0) {
                    play();
                    playBtn.innerHTML = '\u275A\u275A';
                    playStatus = 1;
                } else {
                    pause();
                    playBtn.innerHTML = '\u25B6';
                    playStatus = 0;
                }
            }
        },
        render = function () {
            renderNavigation();

            if (playButton === 1) {
                renderPlayBtn();
            }

            if (infoText === 1) {
                renderInfo();
            }

            evt.attach('mouseover', wrapper, function () {
                prevBtn.style.display = nextBtn.style.display = 'block';

                if (playBtn !== null) {
                    playBtnWrapper.style.display = 'block';
                }

                if (info !== null) {
                    info.style.display = 'block';
                }

                if (mode === 'ftl') {
                    prevBtn.style.display = (current === 0) ? 'none' : 'block';

                    if (current === slidesLen - 1) {
                        nextBtn.style.display = playBtnWrapper.style.display = 'none';
                    } else {
                        nextBtn.style.display = playBtnWrapper.style.display = 'block';
                    }
                }

                hovered = 1;
            });

            evt.attach('mouseout', wrapper, function () {
                prevBtn.style.display = nextBtn.style.display = 'none';

                if (playBtn !== null) {
                    playBtnWrapper.style.display = 'none';
                }

                if (info !== null) {
                    info.style.display = 'none';
                }

                hovered = 0;
            });

            evt.attach('click', nextBtn, function () {
                move(-1);
            });

            evt.attach('click', prevBtn, function () {
                move(1);
            });

            if (playBtn !== null) {
                evt.attach('click', playBtn, playPause);
            }
        };

    init();

    if (noControls === 0) {
        render();
    }

    prepare();

    if (autoplay === 1) {
        ssInterval = window.setInterval(function () {
            move(-1);
        }, playSpeed);

        if (playBtn !== null) {
            playBtn.innerHTML = '\u275A\u275A';
            playStatus = 1;
        }
    }

    if (noControls === 0) {
        evt.attach('keydown', document, function (e) {
            if (e.ctrlKey === true) {
                switch (e.keyCode) {
                case 32:
                    if (mode === 'open-end' || (mode === 'ftl' && current !== slidesLen - 1)) {
                        playPause();
                    }
                    break;
                case 37:
                    if (mode === 'open-end' || (mode === 'ftl' && current !== 0)) {
                        move(1);
                    }
                    break;
                case 39:
                    if (mode === 'open-end' || (mode === 'ftl' && current !== slidesLen - 1)) {
                        move(-1);
                    }
                    break;
                }
            }
        });
    }
};