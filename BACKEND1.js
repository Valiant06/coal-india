var _qrnExitIntents = {
    screen: {
      width: document.body['scrollWidth'],
      height: document.body['scrollHeight'],
      thresholds: {
        x: (this.screen.width / 100) * 100,
        y: 0
      }
    },
    elements: {
      overlay: document.getElementById('opportunities-overlay'),
      serp: document.getElementById('main-serp')
    },
    utilities: {
  
      setCookie: function(name, value, minutes) {
  
        var expires = "";
  
        if (minutes) {
          var date = new Date();
          date.setTime(date.getTime() + (minutes*60*1000));
          expires = "; expires=" + date.toUTCString();
        }
  
        document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  
      },
  
      getCookie: function(name) {
  
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
  
        for(var i=0;i < ca.length;i++) {
          var c = ca[i];
          while (c.charAt(0)==' ') c = c.substring(1,c.length);
          if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
  
        return null;
  
      }
  
    },
    isMac: false,
    isMobile: false,
    exitIntentFired: false,
    scrollTracker: {
      up: 0,
      down: 0,
      last: 0,
      lastDirection: '',
      thresholdReached: false
    },
  
    exitDetector: function(e, type) {
  
      if (type === 'mouse') {
  
        var isUserHeadingToExit = this.userExitMouse(e);
        this.userExitScroll(e);
  
        if(isUserHeadingToExit && this.scrollTracker.thresholdReached) {
  
          this.fireExitIntent();
          window.scrollTo({ top: 0 });
  
        }
  
      } else {
  
        var isUserScrollingToExit = this.userExitScroll(e);
  
        if(isUserScrollingToExit) {
  
          this.fireExitIntent();
          window.scrollTo({ top: 0 });
  
        }
  
      }
  
    },
  
    userExitMouse: function(mouse) {
  
      if (!this.isMac && mouse.clientY < 50 && this.screen.width-mouse.clientX < this.screen.thresholds.x) {
  
        return true;
  
      } else if (this.isMac && mouse.clientY < 50 && mouse.clientX < this.screen.thresholds.x) {
  
        return true;
  
      }
  
      return false;
  
    },
  
    userExitScroll: function(scroll) {
  
      var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      var direction = 'up';
  
      if(scrollTop > this.scrollTracker.last) {
        direction = 'down';
      }
  
      if (scrollTop >= this.screen.thresholds.y) {
  
        this.scrollTracker.thresholdReached = true;
  
      }
  
      if (direction === 'up') {
  
        if (this.scrollTracker.thresholdReached) {
          this.scrollTracker.up += 3;
        }
  
      }
  
      if (direction === 'down') {
  
        this.scrollTracker.down++;
  
      }
  
      if (this.scrollTracker.up > this.scrollTracker.down) {
  
        return true;
  
      }
  
      this.scrollTracker.last = scrollTop;
      this.scrollTracker.lastDirection = direction;
  
      return false;
  
    },
  
    setupListener: function() {
      var self = this;
      this.isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      this.isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      this.screen.thresholds.y = (this.screen.height / 100) * 20;
  
      if (!this.isMobile) {
  
        window.addEventListener('mousemove', function (e) {
  
          if (self.exitIntentCanShow()) {
  
            self.exitDetector(e, 'mouse');
  
          }
  
        });
  
      } else {
  
        window.addEventListener('scroll', function(e) {
  
          if (self.exitIntentCanShow()) {
  
            self.exitDetector(e, 'scroll');
  
          }
  
        });
  
      }
  
  
  
    },
  
    fireExitIntent: function() {
  
        if (typeof this.elements.overlay !== 'undefined') {
          this.elements.serp.style.display = 'none';
          this.elements.overlay.style.display = 'block';
        }
  
        this.exitIntentFired = true;
  
        this.setViewedCookie();
  
    },
  
    closeExitIntent: function() {
  
      this.elements.overlay.style.display = 'none';
      this.elements.serp.style.display = 'block';
  
    },
  
    setViewedCookie: function() {
  
      this.utilities.setCookie('qrn-exit-intent-viewed', '1', 30);
  
    },
  
    exitIntentCanShow: function() {
  
      if (this.exitIntentFired || this.utilities.getCookie('qrn-exit-intent-viewed')) {
        return false;
      }
  
      return true;
  
    }
  
  };
  
  _qrnExitIntents.setupListener();
  