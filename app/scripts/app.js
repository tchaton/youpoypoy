'use strict';

/**
 * @ngdoc overview
 * @name secondApp
 * @description
 * # secondApp
 *
 * Main module of the application.
 */
var app = angular
  .module('secondApp', [
    'ngAnimate',
    'ngAria',
    'ngCookies',
    'ngMessages',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angular-loading-bar',
    'ui.bootstrap'
  ]);

app.config(function ($routeProvider,$httpProvider) {
    delete $httpProvider.defaults.headers.common['X-Requested-With'];
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
      })
      .otherwise({
        redirectTo: '/'
      });
  });

app.run(function () {
  var tag = document.createElement('script');
  tag.src = "http://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
});

app.service('VideosService', ['$window', '$rootScope', '$log', function ($window, $rootScope, $log) {

  var service = this;
  var currentIdTitle = {id:null,title:null,placeholder:null};
  var youtube = {
    ready: false,
    player: null,
    playerId: null,
    videoId: null,
    videoTitle: null,
    playerHeight: '400',
    playerWidth: '600',
    state: 'stopped'
  };
  var results = [];
  var upcoming = [
    {id: 'kRJuY6ZDLPo', title: 'La Roux - In for the Kill (Twelves Remix)'},
    {id: '45YSGFctLws', title: 'Shout Out Louds - Illusions'},
    {id: 'ktoaj1IpTbw', title: 'CHVRCHES - Gun'},
    {id: '8Zh0tY2NfLs', title: 'N.E.R.D. ft. Nelly Furtado - Hot N\' Fun (Boys Noize Remix) HQ'},
    {id: 'zwJPcRtbzDk', title: 'Daft Punk - Human After All (SebastiAn Remix)'},
    {id: 'sEwM6ERq0gc', title: 'HAIM - Forever (Official Music Video)'},
    {id: 'fTK4XTvZWmk', title: 'Housse De Racket â˜â˜€â˜ Apocalypso'}
  ];
  var history = [
    {id: 'XKa7Ywiv734', title: '[OFFICIAL HD] Daft Punk - Give Life Back To Music (feat. Nile Rodgers)'}
  ];

  $window.onYouTubeIframeAPIReady = function () {
    $log.info('Youtube API is ready');
    youtube.ready = true;
    service.bindPlayer('placeholder');
    service.loadPlayer();
    $rootScope.$apply();
  };

  function onYoutubeReady (event) {
    $log.info('YouTube Player is ready');
    youtube.player.cueVideoById(history[0].id);
    youtube.videoId = history[0].id;
    youtube.videoTitle = history[0].title;
  }

  function onYoutubeStateChange (event) {
    if (event.data == YT.PlayerState.PLAYING) {
      youtube.state = 'playing';
    } else if (event.data == YT.PlayerState.PAUSED) {
      youtube.state = 'paused';
    } else if (event.data == YT.PlayerState.ENDED) {
      youtube.state = 'ended';
      $log.info(event);
/*    service.launchPlayer(upcoming[0].id, upcoming[0].title);
      service.archiveVideo(upcoming[0].id, upcoming[0].title);
      service.deleteVideo(upcoming, upcoming[0].id);*/
    }
    $rootScope.$apply();
  }
  this.bindPlayer = function (elementId) {
    $log.info('Binding to ' + elementId);
    youtube.playerId = elementId;
  };

  this.createPlayer = function () {
    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 1,
        showinfo: 1,
      },
      events: {
        'onReady': onYoutubeReady,
        'onStateChange': onYoutubeStateChange
      }
    });
  };
  this.createPlayerInside = function () {
    $log.info('Creating a new Youtube player for DOM id ' + youtube.playerId + ' and video ' + youtube.videoId);
    youtube.playerWidth = $window.innerWidth*0.22;
    return new YT.Player(youtube.playerId, {
      height: youtube.playerHeight,
      width: youtube.playerWidth,
      playerVars: {
        rel: 1,
        showinfo: 1,
        autoplay: 1
      },
      events: {
        'onReady': onYoutubeReadyInside,
        'onStateChange': onYoutubeStateChange
      }
    });
  };
  function onYoutubeReadyInside (event) {
    $log.info('YouTube Player is ready');
    youtube.player.cueVideoById(currentIdTitle.id);
    youtube.videoId = currentIdTitle.id;
    youtube.videoTitle =currentIdTitle.title;
  }
  this.loadPlayer = function () {
    if (youtube.ready && youtube.playerId) {
      if (youtube.player) {
        youtube.player.destroy();
      }
      youtube.player = service.createPlayer();
    }
  };


  this.loadPlayerInside = function (id, title) {
    if (youtube.ready && youtube.playerId) {
      if (youtube.player) {
        youtube.player.destroy();
      }
      youtube.player = service.createPlayerInside(id, title);
    }
  };
  this.destroyPlayer = function () {
      youtube.player.destroy();
      youtube.player = service.createPlayer();
  };

  this.launchPlayer = function (id, title) {
    youtube.player.loadVideoById(id);
    youtube.videoId = id;
    youtube.videoTitle = title;
    return youtube;
  }

  this.launchPlayerInside = function (id, title,placeholder) {
    console.log(placeholder);
    service.bindPlayer(placeholder);
    currentIdTitle.id = id;
    currentIdTitle.title = title;
    currentIdTitle.placeholder = placeholder;
    service.loadPlayerInside(id, title);
    youtube.videoId = id;
    youtube.videoTitle = title;
    return youtube;
  }

  this.listResults = function (data) {
    results.length = 0;
    for (var i = data.items.length - 1; i >= 0; i--) {
      results.push({
        id: data.items[i].id.videoId,
        title: data.items[i].snippet.title,
        description: data.items[i].snippet.description,
        thumbnail: data.items[i].snippet.thumbnails.default.url,
        author: data.items[i].snippet.channelTitle
      });
    }
    return results;
  }

  this.listResultsPart = function (data,nbElement,Pagination) {
      results.length = 0;
      var min = data.items.length - (Pagination+1)*nbElement;
      if(min<=0){
        min = 0;
      }
      for (var i = data.items.length - 1 ; i >= min; i--) {
        results.push({
          id: data.items[i].id.videoId,
          title: data.items[i].snippet.title,
          description: data.items[i].snippet.description,
          thumbnail: data.items[i].snippet.thumbnails.default.url,
          author: data.items[i].snippet.channelTitle
        });
      }
      Pagination++;
      return results,Pagination;
  }

  this.queueVideo = function (id, title) {
    upcoming.push({
      id: id,
      title: title
    });
    return upcoming;
  };

  this.archiveVideo = function (id, title) {
    history.unshift({
      id: id,
      title: title
    });
    return history;
  };

  this.deleteVideo = function (list, id) {
    for (var i = list.length - 1; i >= 0; i--) {
      if (list[i].id === id) {
        list.splice(i, 1);
        break;
      }
    }
  };

  this.getYoutube = function () {
    return youtube;
  };

  this.getResults = function () {
    return results;
  };

  this.getUpcoming = function () {
    return upcoming;
  };

  this.getHistory = function () {
    return history;
  };
  this.getPlaceHolder = function(){
    return currentIdTitle.placeholder;
  }

}])
.directive('whenScrolled', function() {
    return function(scope, elm, attr) {
        var raw = elm[0];
        
        elm.bind('scroll', function() {
            if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
                scope.$apply(attr.whenScrolled);
            }
        });
    };
});
