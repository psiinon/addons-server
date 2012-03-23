(function() {
    var threshold = 250,
        timeout = false;
    z.page = $('#page');
    if (z.capabilities['replaceState']) {
        var $loading = $('<div>', {'class': 'loading balloon',
                                   'html': gettext('Loading&hellip;')})
                        .prependTo($('#site-header'));

        z.page.on('click', 'a', function(e) {
            var href = this.getAttribute('href');
            if (e.metaKey || e.ctrlKey || e.button !== 0) return;
            if (!href || href.substr(0,4) == 'http' || href === '#') return;
            e.preventDefault();
            fetchFragment(href);
        });

        function fetchFragment(href) {
            timeout = setTimeout(function() { $loading.addClass('active'); },
                                 threshold);
            $.get(href, function(d, textStatus, xhr) {
                clearTimeout(timeout);

                // Bail if this is not HTML.
                if (xhr.getResponseHeader('content-type').indexOf('text/html') < 0) {
                    window.location = href;
                    return;
                }

                history.pushState({path: href}, false, href);
                z.page.html(d).trigger('fragmentloaded');

                // We so sneaky.
                var $title = z.page.find('title');
                document.title = $title.text();
                $title.remove();

                _.delay(function() { $loading.removeClass('active'); }, 400);
                $('html, body').animate({scrollTop: 0}, 200);
            });
        }

        $(window).on('popstate', function(e) {
            var state = e.originalEvent.state;
            if (state) {
                fetchFragment(state.path);
            }
        });

        $(function() {
            var path = window.location.pathname + window.location.search;
            history.replaceState({path: path}, false, path);
            z.page.trigger('fragmentloaded');
        });
    }
})();
