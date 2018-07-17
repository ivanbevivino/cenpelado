'use strict';

angular.module('cloudpoxee.directives').directive('hexagons', function($window, $log, $timeout) {
  function reorder(scope, holder, elements, size, margin) {
    var filter = "NA";


    switch (scope.selectgroup) {
      case "NA":
        filter = "status";
        break;
      case "BS":
        filter = "status";
        break;
      case "BR":
        filter = "region";
        break;
      case "BD":
        filter = "directoryId";
        break;
      case "BA":
        filter = "accountName";
        break;
      default:
        filter = "status";
    }

    var groups = _.groupBy(scope.elements, filter);
    var arraystatus = [];
    _.forOwn(groups, function(value, key) {
      arraystatus.push(key);
    });
    // FIN  DISTINTOS ELEMENTOS

    //  Creo la matriz del
    var matrix = [];
    for (var q = 0; q < arraystatus.length; q++) {
      matrix[q] = [];

    }
    //  fin   Creo la matriz del



    switch (filter) {
      case "status":
      // Cargo la matriz
      for (var i = 0; i < scope.elements.length; i++) {
        for (var f = 0; f < arraystatus.length; f++) {
          if (scope.elements[i].status == arraystatus[f]) {
            matrix[f].push(scope.elements[i])
          }
        }

      }
      //  Fin Cargo la matriz
        break;

      case "region":
      // Cargo la matriz
      for (var i = 0; i < scope.elements.length; i++) {
        for (var f = 0; f < arraystatus.length; f++) {
          if (scope.elements[i].region == arraystatus[f]) {
            matrix[f].push(scope.elements[i])
          }
        }

      }
      //  Fin Cargo la matriz
        break;
      case "directoryId":
      // Cargo la matriz
      for (var i = 0; i < scope.elements.length; i++) {
        for (var f = 0; f < arraystatus.length; f++) {
          if (scope.elements[i].directoryId == arraystatus[f]) {
            matrix[f].push(scope.elements[i])
          }
        }

      }
      //  Fin Cargo la matriz
        break;
      case "accountName":
      // Cargo la matriz
      for (var i = 0; i < scope.elements.length; i++) {
        for (var f = 0; f < arraystatus.length; f++) {
          if (scope.elements[i].accountName == arraystatus[f]) {
            matrix[f].push(scope.elements[i])
          }
        }

      }
      //  Fin Cargo la matriz
        break;
      default:
      // Cargo la matriz
      for (var i = 0; i < scope.elements.length; i++) {
        for (var f = 0; f < arraystatus.length; f++) {
          if (scope.elements[i].status == arraystatus[f]) {
            matrix[f].push(scope.elements[i])
          }
        }

      }
      //  Fin Cargo la matriz
    }




    var width = angular.element(holder).width();
    var newWidth = angular.element(holder).parent().width();

    if (newWidth < width) {
      width = newWidth;
    }
    //



    //
    angular.element(holder).width(newWidth);

    var maxLeft = 0;
    var row = 0;
    var offset = 0;
    var left = 1;
    var top = 0;
    var cols = 0;

    var noOffset = function(offset) {
      return offset;
    };

    var withOffset = function(offset) {
      return (offset + 1) % 2;
    };

    var halfTop = function() {
      return (row * (0.5 * size * Math.sqrt(3) + margin));
    };

    var fullTop = function() {
      return (row * (size + margin + size * 0.1));
    };



    function orderHexagons(elements, leftHandler, topHandler) {

      angular.forEach(elements, function(element, index) {

        top = topHandler(top);

        if (elements.length < 500 && scope.tab === 'STATUS') {
          if (index === 0 && scope.selectgroup != 'NA' && scope.tab === 'STATUS') {
            left = 1;
          }
          TweenMax.to(document.getElementById('hexagon-' + element.id), 0.005 * index, {
            x: left,
            y: top,
            ease: Power1.easeInOut
          });
        } else {
          if (index === 0 && scope.selectgroup != 'NA' && scope.tab === 'STATUS') {
            left = 1;
          }
          TweenMax.to(document.getElementById('hexagon-' + element.id), 0.000001 * index, {
            x: left,
            y: top,
            ease: Power1.easeInOut
          });
        }

        // if(index === 0 && scope.selectgroup != 'NA'){ left=1;}

        left += size + margin;

        if (left > maxLeft) {
          maxLeft = left;
        }

        if (row === 0) {
          cols += 1;
        }

        if (left + size > width) {
          row = row + 1;
          offset = leftHandler(offset);
          left = offset / 2 * (size + margin);
        }
      });

      angular.element(holder).height(top + size * 4);
    }

    if (width < 1.5 * (size + margin)) {

      // console.log(matrix)
      orderHexagons(elements, noOffset, fullTop);
    } else {

      // console.log(matrix)
      for (var y = 0; y < matrix.length; y++) {

        orderHexagons(matrix[y], withOffset, halfTop);



      }

      // orderHexagons(elements, withOffset, halfTop);
    }
  }

  function elementsVisible(scope) {

    var scrollable = $('.hexagons__container');
    var elementsToLoad = [];

    angular.forEach(scope.elements, function(element) {
      if (!element.loaded && !element.loading) {
        var container = angular.element('#hexagon-' + element.id);
        var offset = container.offset();

        var top_of_element = offset.top;
        var bottom_of_element = offset.top + container.outerHeight();
        var bottom_of_screen = scrollable.scrollTop() + scrollable.height();
        var top_of_screen = scrollable.scrollTop();

        if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
          elementsToLoad.push(element);
        }
      }
    });


    // angular.forEach(scope.elements, function(element) {
    //   if (!element.loaded && !element.loading) {
    //     var container = angular.element('#hexagon-' + element.id);
    //     var offset = container.offset();
    //
    //     var top_of_element = offset.top;
    //     var bottom_of_element = offset.top + container.outerHeight();
    //     var bottom_of_screen = scrollable.scrollTop() + scrollable.height();
    //     var top_of_screen = scrollable.scrollTop();
    //
    //     if ((bottom_of_screen > top_of_element) && (top_of_screen < bottom_of_element)) {
    //       elementsToLoad.push(element);
    //     }
    //   }
    // });
    return elementsToLoad;
  }

  return {
    restrict: 'E',
    templateUrl: 'views/workspaces/hexagons.html',
    replace: true,
    scope: {
      elements: '=',
      size: '=',
      tab: '=activeTab',
      selectgroup: '='
    },
    link: function(scope, element) {
      scope.viewport = {
        'selector': '#hexagons'
      };

      scope.openElement = function(element) {
        scope.$emit('element:clicked', element);
      };

      scope.$watch('size', function() {
        $timeout(function() {

          reorder(scope, element, scope.elements, scope.size, -3);
          if (scope.tab === 'LIST') {
            $timeout(function() {
              scope.$emit('elements:visible', elementsVisible(scope));
            }, 1000);
          }
        }, 0);
      });

      scope.$watch('elements', function() {
        $timeout(function() {
          reorder(scope, element, scope.elements, scope.size, -3);
          if (scope.tab === 'LIST') {
            $timeout(function() {
              scope.$emit('elements:visible', elementsVisible(scope));
            }, 1000);
          }
        }, 0);
      });

      angular.element($window).bind('resize', function() {
        $timeout(function() {
          reorder(scope, element, scope.elements, scope.size, -3);
          if (scope.tab === 'LIST') {
            $timeout(function() {
              scope.$emit('elements:visible', elementsVisible(scope));
            }, 1000);
          }
          scope.$digest();
        }, 500);
      });

      $('.hexagons__container').scroll(function() {
        if (scope.tab === 'LIST') {
          scope.$emit('elements:visible', elementsVisible(scope));
          scope.$digest();
        }
      });
    }
  };
});
