(function($) {

    /**
     * Brukes med panel()
     * @return {jQuery} jQuery object.
     */
    $.fn.navList = function() {

        var $this = $(this);
        $a = $this.find('a'),
            b = [];

        $a.each(function() {

            var $this = $(this),
                indent = Math.max(0, $this.parents('li').length - 1),
                href = $this.attr('href'),
                target = $this.attr('target');

            b.push(
                '<a ' +
                'class="link depth-' + indent + '"' +
                ((typeof target !== 'undefined' && target != '') ? ' target="' + target + '"' : '') +
                ((typeof href !== 'undefined' && href != '') ? ' href="' + href + '"' : '') +
                '>' +
                '<span class="indent-' + indent + '"></span>' +
                $this.text() +
                '</a>'
            );

        });

        return b.join('');

    };

    /**
     * Panel-ify på et element
     * @param {object} userConfig User config.
     * @return {jQuery} jQuery object.
     */
    $.fn.panel = function(userConfig) {

        // Hvis ingen elementer
        if (this.length == 0)
            return $this;

        // Hvis flere elementer
        if (this.length > 1) {

            for (var i = 0; i < this.length; i++)
                $(this[i]).panel(userConfig);

            return $this;

        }

        // Variabler
        var $this = $(this),
            $body = $('body'),
            $window = $(window),
            id = $this.attr('id'),
            config;

        // Config
        config = $.extend({

            // Delay
            delay: 0,

            // Skjul panel ved klikk
            hideOnClick: false,

            // Skjul panel ved escape-klikk
            hideOnEscape: false,

            // Skjul panel ved swipe
            hideOnSwipe: false,

            // Reset scroll-posisjon ved skjult panel
            resetScroll: false,

            // Reset forms ved skjult panel
            resetForms: false,

            // Siden av panelen vises
            side: null,

            // Target element for "class"
            target: $this,

            // Class toggle
            visibleClass: 'visible'

        }, userConfig);

        // Utvid "target" om det ikke er et jQuery-objekt allerede
        if (typeof config.target != 'jQuery')
            config.target = $(config.target);

        // Panel

        // Metoder
        $this._hide = function(event) {

            // Allerede skjult? Bail
            if (!config.target.hasClass(config.visibleClass))
                return;

            // Hvis et event har blitt gitt, avbryt det
            if (event) {

                event.preventDefault();
                event.stopPropagation();

            }

            // Skjul
            config.target.removeClass(config.visibleClass);

            // Etter skjuling
            window.setTimeout(function() {

                // Reset scroll-posisjon
                if (config.resetScroll)
                    $this.scrollTop(0);

                // Reset forms
                if (config.resetForms)
                    $this.find('form').each(function() {
                        this.reset();
                    });

            }, config.delay);

        };

        // Fikser noen feil ved bruk av enkelte nettlsesere
        $this
            .css('-ms-overflow-style', '-ms-autohiding-scrollbar')
            .css('-webkit-overflow-scrolling', 'touch');

        // Skjul ved klikk
        if (config.hideOnClick) {

            $this.find('a')
                .css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

            $this
                .on('click', 'a', function(event) {

                    var $a = $(this),
                        href = $a.attr('href'),
                        target = $a.attr('target');

                    if (!href || href == '#' || href == '' || href == '#' + id)
                        return;

                    // Avbryt opprinnelig event
                    event.preventDefault();
                    event.stopPropagation();

                    // Skjul panel
                    $this._hide();

                    // Dirigerer til href
                    window.setTimeout(function() {

                        if (target == '_blank')
                            window.open(href);
                        else
                            window.location.href = href;

                    }, config.delay + 10);

                });

        }

        // Event: touch 
        $this.on('touchstart', function(event) {

            $this.touchPosX = event.originalEvent.touches[0].pageX;
            $this.touchPosY = event.originalEvent.touches[0].pageY;

        })

        $this.on('touchmove', function(event) {

            if ($this.touchPosX === null ||
                $this.touchPosY === null)
                return;

            var diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
                diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
                th = $this.outerHeight(),
                ts = ($this.get(0).scrollHeight - $this.scrollTop());

            // Skjul ved swipe?
            if (config.hideOnSwipe) {

                var result = false,
                    boundary = 20,
                    delta = 50;

                switch (config.side) {

                    case 'left':
                        result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
                        break;

                    case 'right':
                        result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
                        break;

                    case 'top':
                        result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
                        break;

                    case 'bottom':
                        result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
                        break;

                    default:
                        break;

                }

                if (result) {

                    $this.touchPosX = null;
                    $this.touchPosY = null;
                    $this._hide();

                    return false;

                }

            }

            // Forhindrer vertikal scrolling "utenfor" siden.
            if (($this.scrollTop() < 0 && diffY < 0) ||
                (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

                event.preventDefault();
                event.stopPropagation();

            }

        });

        // Event: Forhindrer oppblåsning av noen elementer
        $this.on('click touchend touchstart touchmove', function(event) {
            event.stopPropagation();
        });

        // Event: Skjul panelet hvis et child anchor tag peker til IDen blir klikket på
        $this.on('click', 'a[href="#' + id + '"]', function(event) {

            event.preventDefault();
            event.stopPropagation();

            config.target.removeClass(config.visibleClass);

        });

        // Body

        // Event: Skjul panel ved klikk eller touch på body
        $body.on('click touchend', function(event) {
            $this._hide(event);
        });

        // Event: Toggle
        $body.on('click', 'a[href="#' + id + '"]', function(event) {

            event.preventDefault();
            event.stopPropagation();

            config.target.toggleClass(config.visibleClass);

        });

        // Window

        // Event: Skjul ved klikk på escape
        if (config.hideOnEscape)
            $window.on('keydown', function(event) {

                if (event.keyCode == 27)
                    $this._hide(event);

            });

        return $this;

    };

    /**
     * Fyller ut enkelte elementer som placeholdere
     * @return {jQuery} jQuery object.
     */
    $.fn.placeholder = function() {

        // Hvis nettleseren støtter automatisk placeholder-fyll, bail
        if (typeof(document.createElement('input')).placeholder != 'undefined')
            return $(this);

        // Ingen elementer
        if (this.length == 0)
            return $this;

        // Flere elementer
        if (this.length > 1) {

            for (var i = 0; i < this.length; i++)
                $(this[i]).placeholder();

            return $this;

        }

        // Variabler
        var $this = $(this);

        // Text, TextArea.
        $this.find('input[type=text],textarea')
            .each(function() {

                var i = $(this);

                if (i.val() == '' ||
                    i.val() == i.attr('placeholder'))
                    i
                    .addClass('polyfill-placeholder')
                    .val(i.attr('placeholder'));

            })
            .on('blur', function() {

                var i = $(this);

                if (i.attr('name').match(/-polyfill-field$/))
                    return;

                if (i.val() == '')
                    i
                    .addClass('polyfill-placeholder')
                    .val(i.attr('placeholder'));

            })
            .on('focus', function() {

                var i = $(this);

                if (i.attr('name').match(/-polyfill-field$/))
                    return;

                if (i.val() == i.attr('placeholder'))
                    i
                    .removeClass('polyfill-placeholder')
                    .val('');

            });

        // Passord
        $this.find('input[type=password]')
            .each(function() {

                var i = $(this);
                var x = $(
                    $('<div>')
                    .append(i.clone())
                    .remove()
                    .html()
                    .replace(/type="password"/i, 'type="text"')
                    .replace(/type=password/i, 'type=text')
                );

                if (i.attr('id') != '')
                    x.attr('id', i.attr('id') + '-polyfill-field');

                if (i.attr('name') != '')
                    x.attr('name', i.attr('name') + '-polyfill-field');

                x.addClass('polyfill-placeholder')
                    .val(x.attr('placeholder')).insertAfter(i);

                if (i.val() == '')
                    i.hide();
                else
                    x.hide();

                i
                    .on('blur', function(event) {

                        event.preventDefault();

                        var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

                        if (i.val() == '') {

                            i.hide();
                            x.show();

                        }

                    });

                x
                    .on('focus', function(event) {

                        event.preventDefault();

                        var i = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');

                        x.hide();

                        i
                            .show()
                            .focus();

                    })
                    .on('keypress', function(event) {

                        event.preventDefault();
                        x.val('');

                    });

            });

        // Events
        $this
            .on('submit', function() {

                $this.find('input[type=text],input[type=password],textarea')
                    .each(function(event) {

                        var i = $(this);

                        if (i.attr('name').match(/-polyfill-field$/))
                            i.attr('name', '');

                        if (i.val() == i.attr('placeholder')) {

                            i.removeClass('polyfill-placeholder');
                            i.val('');

                        }

                    });

            })
            .on('reset', function(event) {

                event.preventDefault();

                $this.find('select')
                    .val($('option:first').val());

                $this.find('input,textarea')
                    .each(function() {

                        var i = $(this),
                            x;

                        i.removeClass('polyfill-placeholder');

                        switch (this.type) {

                            case 'submit':
                            case 'reset':
                                break;

                            case 'password':
                                i.val(i.attr('defaultValue'));

                                x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

                                if (i.val() == '') {
                                    i.hide();
                                    x.show();
                                } else {
                                    i.show();
                                    x.hide();
                                }

                                break;

                            case 'checkbox':
                            case 'radio':
                                i.attr('checked', i.attr('defaultValue'));
                                break;

                            case 'text':
                            case 'textarea':
                                i.val(i.attr('defaultValue'));

                                if (i.val() == '') {
                                    i.addClass('polyfill-placeholder');
                                    i.val(i.attr('placeholder'));
                                }

                                break;

                            default:
                                i.val(i.attr('defaultValue'));
                                break;

                        }
                    });

            });

        return $this;

    };

    /**
     * Flytter elementer til eller fra parent-objekter sin posisjon
     * @param {jQuery} $elements Elementer som skal flyttes
     * @param {bool} condition Hvis true, flytter elementene opp, hvis ikke flyttes disse til opprinnelig posisjon
     */
    $.prioritize = function($elements, condition) {

        var key = '__prioritize';

        // Utvider $elements hvis ikke jQuery-element
        if (typeof $elements != 'jQuery')
            $elements = $($elements);

        // Gå gjennom elementene
        $elements.each(function() {

            var $e = $(this),
                $p,
                $parent = $e.parent();

            // Ingen parent? Bail
            if ($parent.length == 0)
                return;

            // Ikke flyttet? Flytt
            if (!$e.data(key)) {

                // Condition false? Bail.
                if (!condition)
                    return;

                // Hent placeholder
                $p = $e.prev();

                // Hvis ikke funnet, betyr det at elementet allerede er i toppen, bail.
                if ($p.length == 0)
                    return;

                // Flytt element til toppen av parent
                $e.prependTo($parent);

                // Marker elementet som "flyttet"
                $e.data(key, $p);

            }

            // Flyttet allerede?
            else {

                // Condition true? Bail.
                if (condition)
                    return;

                $p = $e.data(key);

                // Flytt elementet tilbake til opprinnelig posisjon
                $e.insertAfter($p);

                // Sett markerte elementer tilbake til "ikke flyttet"
                $e.removeData(key);

            }

        });

    };

})(jQuery);