'use strict';

/**
 * @ngdoc service
 * @name gw2TradingmarketsApp.serviceAjax
 * @description
 * # serviceAjax
 * Factory in the gw2TradingmarketsApp.
 */
angular.module('secondApp')
  .factory('serviceAjax', function ($http) {
	return {
		search: function(query){
                        return $http.get("http://localhost:3000/search?query="+ query);
                }
	}
});