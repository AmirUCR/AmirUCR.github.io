(function ($) {
  "use strict";

  $(function () {
    // -----------------------------
    // Cache selectors
    // -----------------------------
    var $body = $("body");
    var $win = $(window);
    var $greeting = $(".greeting");
    var $cursor = $(".cursor");
    var $intro = $(".intro");
    var $navUnit = $(".nav-unit");
    var $aboutWrapper = $(".about-wrapper");
    var $workWrapper = $(".work-wrapper");
    var $contactWrapper = $(".contact-wrapper");
    var $navWrapper = $(".nav-wrapper");
    var $aboutOverlay = $(".about-overlay");
    var $workOverlay = $(".work-overlay");
    var $contactOverlay = $(".contact-overlay");
    var $footer = $(".footer");
    var $resume = $(".resume");
    var $eks = $(".eks span");
    var $image = $(".image");
    var $floatImg = $(".js-hover-image");

    // -----------------------------
    // State
    // -----------------------------
    var NAME = "Amirsadra Mohseni";
    var CURSOR_CHAR = "|";
    var typedDone = false;
    var activeNav = null; // set on open, used on close

    // -----------------------------
    // Times
    // -----------------------------
    var $baseTime = 400;
    
    // -----------------------------
    // My image pop up
    // -----------------------------
    $('body')
        // 1. Mouse Enter
        .on('mouseenter', '.hover-trigger', function() {
            var imgUrl = $(this).data('image');
            $floatImg.attr('src', imgUrl).addClass('is-active');
        })
        
        // 2. Mouse Leave
        .on('mouseleave', '.hover-trigger', function() {
            $floatImg.removeClass('is-active');
        })
        
        // 3. Mouse Move (Update position)
        .on('mousemove', '.hover-trigger', function(e) {
            // Using requestAnimationFrame for smoother performance
            requestAnimationFrame(function() {
                $floatImg.css({
                    top: e.clientY,
                    left: e.clientX
                });
            });
        });

    // -----------------------------
    // Parallax background on .image (rAF throttled)
    // -----------------------------
    if ($image.length > 0) {
      var center = { x: 0, y: 0 };
      var last = { x: 0, y: 0 };
      var rafId = null;

      function computeCenter() {
        // Use first .image; extend if ever have multiple
        var el = $image[0];
        if (!el) {
          return;
        }
        var rect = el.getBoundingClientRect();
        center.x = rect.left + rect.width / 2 + window.scrollX;
        center.y = rect.top + rect.height / 2 + window.scrollY;
      }

      function tick() {
        rafId = null;
        var dx = ((last.x - center.x) * -1) / 100;
        var dy = ((last.y - center.y) * -1) / 100;
        $image.css("background-position", dx + "px " + dy + "px");
      }

      computeCenter();
      $win.on("resize.parallax scroll.parallax", computeCenter);
      $body.on("mousemove.parallax", function (e) {
        last.x = e.pageX;
        last.y = e.pageY;
        if (rafId === null) {
          rafId = window.requestAnimationFrame(tick);
        }
      });
    }

    // -----------------------------
    // Ripple / Ink effect
    // -----------------------------
    function inkFn(e) {
      var $btn = $(this);

      var $ink = $btn.find(".ink");
      if ($ink.length === 0) {
        $btn.prepend("<span class='ink'></span>");
        $ink = $btn.find(".ink");
      }

      $ink.removeClass("animate");

      if (!$ink[0].offsetHeight && !$ink[0].offsetWidth) {
        var d = Math.max($btn.outerHeight(), $btn.outerWidth());
        $ink.css({ height: d, width: d });
      }

      var offset = $btn.offset();
      var pageX = e.pageX;
      var pageY = e.pageY;

      // Basic touch support
      if (
        e.originalEvent &&
        e.originalEvent.touches &&
        e.originalEvent.touches[0]
      ) {
        pageX = e.originalEvent.touches[0].pageX;
        pageY = e.originalEvent.touches[0].pageY;
      }

      var x = pageX - offset.left - $ink.width() / 2;
      var y = pageY - offset.top - $ink.width() / 2;

      $ink.css({ top: y + "px", left: x + "px" }).addClass("animate");
    }

    // -----------------------------
    // Open transitions
    // -----------------------------
    function transitions() {
      var $self = $(this);
      activeNav = $self;

      // prevent click spam
      $navUnit.off("click.ink click.nav");

      // shrink others
      $navUnit.not($self).addClass("shrink");

      // hide others + fade footer
      window.setTimeout(function () {
        $navUnit.not($self).addClass("no-display");
        if ($footer.length > 0) {
          $footer.stop(true, true).animate({ opacity: 0 }, 200);
        }
      }, $baseTime);

      if ($self.hasClass("about-nav")) {
        window.setTimeout(function () {
          $self.addClass("enlarged");
        }, $baseTime);
        window.setTimeout(function () {
          $aboutWrapper.css({ visibility: "visible" });
          $aboutOverlay.addClass("curtain-close");
        }, $baseTime * 2);
        // window.setTimeout(function () { $aboutWrapper.css({ "z-index": 0 }); }, $baseTime*3);
      } else if ($self.hasClass("work-nav")) {
        window.setTimeout(function () {
          $self.addClass("moveUp");
        }, $baseTime);
        window.setTimeout(function () {
          $self.addClass("enlarged");
        }, $baseTime * 2);
        window.setTimeout(function () {
          $workWrapper.css({ visibility: "visible" });
          $workOverlay.addClass("curtain-close");
        }, $baseTime * 3);
        // window.setTimeout(function () { $workWrapper.css({ "z-index": 0 }); }, $baseTime*4);
      } else if ($self.hasClass("contact-nav")) {
        window.setTimeout(function () {
          $self.addClass("moveUp");
        }, $baseTime);
        window.setTimeout(function () {
          $self.addClass("enlarged");
        }, $baseTime * 2);
        window.setTimeout(function () {
          $contactWrapper.css({ visibility: "visible" });
          $contactOverlay.addClass("curtain-close");
        }, $baseTime * 3);
        // window.setTimeout(function () { $contactWrapper.css({ "z-index": 0 }); }, $baseTime*4);
      }
    }

    // -----------------------------
    // Close / X handler
    // -----------------------------
    var isAnimating = false;

    function eksHandler() {
      $("body").addClass("disable-clicks");

      $aboutWrapper.css({ "z-index": -1 });
      $workWrapper.css({ "z-index": -1 });
      $contactWrapper.css({ "z-index": -1 });

      if (isAnimating) return;
      isAnimating = true;

      var $self = activeNav;

      if (!$self || $self.length === 0) {
        $self = $navUnit.filter(".enlarged, .moveUp").first();
      }
      if ($self.length === 0) {
        // IMPORTANT: If we exit early because nothing is active,
        // we must unlock so the button works next time.
        isAnimating = false;
        return;
      }

      var section, $wrap, $overlay;
      if ($self.hasClass("about-nav")) {
        section = "about";
        $wrap = $aboutWrapper;
        $overlay = $aboutOverlay;
      } else if ($self.hasClass("work-nav")) {
        section = "work";
        $wrap = $workWrapper;
        $overlay = $workOverlay;
      } else if ($self.hasClass("contact-nav")) {
        section = "contact";
        $wrap = $contactWrapper;
        $overlay = $contactOverlay;
      }

      $wrap.css({
        "z-index": -1
      });

      if ($overlay && $overlay.length > 0) {
        $overlay.removeClass("curtain-close");
      }

      if (section === "about") {
        setTimeout(function () {
          $self.removeClass("enlarged moveUp");
        }, $baseTime);

        setTimeout(function () {
          if ($footer.length > 0) {
            $footer.stop(true, true).animate({ opacity: 1 }, 200);
          }
          $wrap.css({ "z-index": -1 });

          // UNLOCK
          $("body").removeClass("disable-clicks");
          isAnimating = false;
        }, $baseTime * 2);
      } else {
        // Work or Contact
        setTimeout(function () {
          $self.removeClass("enlarged");
        }, $baseTime);

        setTimeout(function () {
          $self.removeClass("moveUp");
          $wrap.css({ "z-index": -1, visibility: "hidden" });
        }, $baseTime * 2);

        setTimeout(function () {
          if ($footer.length > 0) {
            $footer.stop(true, true).animate({ opacity: 1 }, 200);
          }

          // UNLOCK
          $("body").removeClass("disable-clicks");
          isAnimating = false;
        }, $baseTime * 3);
      }

      // Restore other nav items
      setTimeout(function () {
        $navUnit.not($self).removeClass("no-display shrink");
        $navUnit.on("click.ink", inkFn);
        $navUnit.on("click.nav", transitions);
        activeNav = null;
      }, $baseTime * 2);
    }

    // -----------------------------
    // Initial nav appearance
    // -----------------------------
    function navAppear() {
      var $kids = $navWrapper.children();
      var i = 0;
      var id = window.setInterval(function () {
        if (i >= $kids.length) {
          window.clearInterval(id);
        } else {
          $kids.eq(i).addClass("effect");
          i++;
        }
      }, 200);
    }

    // -----------------------------
    // Typing effect for name
    // -----------------------------
    var ACCENT_FROM = 0;
    var ACCENT_TO = 4;

    // Render helper: wraps the typed slice [from, to) in <span class="accent">
    function renderTypedHTML(typed, from, to) {
      if (from < 0) {
        from = 0;
      }
      if (to < 0) {
        to = 0;
      }
      if (from > to) {
        var tmp = from;
        from = to;
        to = tmp;
      }

      var a = typed.slice(0, Math.min(from, typed.length));
      var b = typed.slice(
        Math.min(from, typed.length),
        Math.min(to, typed.length)
      );
      var c = typed.slice(Math.min(to, typed.length));

      if (b.length > 0) {
        return (
          a +
          '<span class="accent hover-trigger" data-image="https://github.com/AmirUCR/img/blob/master/portrait.jpg?raw=true">' +
          b +
          "</span>" +
          c
        );
      } else {
        return a + c; // nothing to accent yet
      }
    }

    function textTyper() {
      var idx = 0;
      var id = window.setInterval(function () {
        var typed = NAME.substr(0, idx);
        $greeting.html(renderTypedHTML(typed, ACCENT_FROM, ACCENT_TO));

        idx++;

        if (idx > NAME.length) {
          typedDone = true;
          window.clearInterval(id);

          // underline, lift title, then show nav
          $greeting.addClass("effect");
          window.setTimeout(function () {
            $intro.addClass("effect");
          }, $baseTime / 2);
          window.setTimeout(navAppear, $baseTime);
        }
      }, 120);
    }

    // -----------------------------
    // JS blink
    // -----------------------------
    function blinkingCursor() {
      $cursor.text(CURSOR_CHAR);
      var id = window.setInterval(function () {
        $cursor.animate({ opacity: 0 }, 200).animate({ opacity: 1 }, 200);
        if (typedDone === true) {
          window.clearInterval(id);
          $cursor.stop(true, true).animate({ opacity: 0 }, 150);
        }
      }, 600);
    }

    // -----------------------------
    // Resume click: guard empty hrefs
    // -----------------------------
    function resumeFn(e) {
      var $link = $(this);
      var href = $link.attr("href");
      if (!href || href === "#") {
        e.preventDefault();
      }
    }

    // -----------------------------
    // Bind events (namespaced)
    // -----------------------------
    $navUnit.on("click.ink", inkFn);
    $navUnit.on("click.nav", transitions);
    $eks.on("click.close", eksHandler);
    $resume.on("click.resume", resumeFn);

    // Kick off
    window.setTimeout(textTyper, 200);
    blinkingCursor(); // enable if want JS-driven blinking
  });
})(jQuery);
