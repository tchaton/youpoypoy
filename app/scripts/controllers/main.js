'use strict';

/**
 * @ngdoc function
 * @name secondApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the secondApp
 */
angular.module('secondApp')
  .controller('MainCtrl', function ($interval,$scope,$log,$http,$rootScope,serviceAjax,VideosService,$window) {
  	$scope.seeMore = false;
  	$scope.results = [];
  	$scope.data = [];
  	var nbElement = 8;
  	$scope.pagination = 0;
  	$scope.showAll = [];
  	$scope.stacked = [];
  	$scope.changeState = function(){
  			if($scope.searchInput)
  			{
  			serviceAjax.search($scope.searchInput)
		      .success( function (data) {
		      	for(var i = 0 ; i < data.length;i++)
		      	{
		      		$scope.showAll.push({i:false});
		      	}
		      	console.log($scope.showAll)
		      	$scope.data = data;
		      	var results,pagination = VideosService.listResultsPart($scope.data,nbElement,$scope.pagination);
		      	$scope.pagination = pagination;
			    console.log(VideosService.results);
		        $log.info(data);
		      })
		      .error( function () {
		        $log.info('Search error');
			  });
  			}
  	}
    init();

    function init() {
      $log.info($window.innerWidth);
      $log.info($window.innerWidth);
      $scope.youtube = VideosService.getYoutube();
      $scope.results =  VideosService.getResults();
      $scope.upcoming = VideosService.getUpcoming();
      $scope.history = VideosService.getHistory();
      $scope.playlist = true;
    }

    $scope.launch = function (id, title) {
      VideosService.launchPlayer(id, title);
      VideosService.archiveVideo(id, title);
      VideosService.deleteVideo($scope.upcoming, id);
      $log.info('Launched id:' + id + ' and title:' + title);
    };
    $scope.launchInside = function (id, title,index) {
      $log.info($scope.showAll);
      if($scope.showAll[index]){
      	$scope.showAll[index] = false;
      	VideosService.destroyPlayer();
      }else{
	      $scope.showAll[index] = true;
	      $log.info('Launched id:' + id + ' and title:' + title);
	      var placeholder = 'placeholder'+index;
	      VideosService.launchPlayerInside(id, title,placeholder);
	      $log.info($scope.showAll);  
/*
	      $interval(function($scope){
	      	var youtube = VideosService.getYoutube();
	      	var player = youtube.player;

	      	var time = player.getCurrentTime()/player.getDuration();
	      	$scope.stacked.push({value:time,type:'danger'});

	      	$log.info(player.getCurrentTime());
	      },2000); 	 */         	
      } 	

    };

    $scope.queue = function (id, title) {
      VideosService.queueVideo(id, title);
      VideosService.deleteVideo($scope.history, id);
      $log.info('Queued id:' + id + ' and title:' + title);
    };
    $scope.delete = function (list, id) {
      VideosService.deleteVideo(list, id);
    };

    $scope.tabulate = function (state) {
      $scope.playlist = state;
	};
    $scope.items = [];
    
    var counter = 0;
    $scope.loadMore = function() {
    	console.log($scope.pagination);
    	var results,pagination = VideosService.listResultsPart($scope.data,nbElement,$scope.pagination);
    	$scope.pagination = pagination;

    };
	$scope.handleProgressBarClick = function(e) {
	  var fullProgressBarWidth = $(e.currentTarget).width();
	  var requestedPosition = e.offsetX / fullProgressBarWidth;
	  $log.info(requestedPosition);
	  var youtube = VideosService.getYoutube();
	  var duration = youtube.player.getDuration();
	  youtube.player.seekTo(Math.floor(requestedPosition*duration));
	};
	var refresh = function(){
		var youtube = VideosService.getYoutube();
		if(youtube.state == "playing")
		{
	     var player = youtube.player;     
	     if(player.getDuration())
	     {
	     var duration = player.getDuration();	     	
	     }
	     else{
	     	var duration = 1 
	     }
	     var time = (player.getCurrentTime()/duration)*100;
	     $scope.stacked = [];
		var totalSec = Math.floor(player.getCurrentTime()+0.5);
		var hours = parseInt( totalSec / 3600 ) % 24;
		var minutes = parseInt( totalSec / 60 ) % 60;
		var seconds = totalSec % 60;
		var result = (hours < 1 ? ''  : "0" + hours + ":")  + (minutes < 10 ? "0" + minutes : minutes) + ":" + (seconds  < 10 ? "0" + seconds : seconds);

		var totalSecD = Math.floor(duration);
		var hoursD = parseInt( totalSecD / 3600 ) % 24;
		var minutesD = parseInt( totalSecD / 60 ) % 60;
		var secondsD = totalSecD % 60;
		var resultD = (hoursD < 1 ? ''  : "0" + hoursD + ":")  + (minutesD < 10 ? "0" + minutesD : minutesD) + ":" + (secondsD  < 10 ? "0" + secondsD : secondsD);
		result = result + ' / ' + resultD;
	     $scope.stacked.push({value:time,type:'danger',time:result});
		}
	};
	$interval(refresh,1000);
    
  })
  .factory('serviceAjax', function ($http) {
    
	return {
		search: function(query){
                        return $http.get("http://localhost:3000/search?query="+ query);
                }
	}
});
