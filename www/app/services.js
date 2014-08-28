'use strict';

var myApp = angular.module('fhMap.services', []);

var infowindow = new google.maps.InfoWindow();

myApp.service('mapService', function() {
    var map;
    this.setMap = function(myMap) {
        map = myMap;
    };
    this.getMap = function() {
        if (map) return map;
        throw new Error("Map not defined");
    };
    this.getLatLng = function() {
        var center = map.getCenter();
        return {
            lat: center.lat(),
            lng: center.lng()
        };
    };
});

myApp.service('todosService', function($filter) {
    // nextId and list both have mock starting data
    this.nextId = 4;
    this.items = [{
        id: 1,
        completed: true,
        title: 'Finish work at 17:30',
        desc: 'FeedHenry HQ',
        lat: 52.251134,
        lng: -7.153267
    }, {
        id: 2,
        completed: false,
        title: 'Buy groceries in Tesco',
        desc: 'I would prefer a local food producer though',
        lat: 52.252192,
        lng: -7.136676
    }, {
        id: 3,
        completed: false,
        title: 'Watch a movie',
        desc: 'Perhaps Guardians of the Galaxy',
        lat: 52.255116,
        lng: -7.110954
    }];
    this.filter = {};
    this.filtered = function() {
        return $filter('filter')(this.items, this.filter);
    };
    this.remainingCount = function() {
        return $filter('filter')(this.items, {
            completed: false
        }).length;
    };
    this.getTodoById = function(todoId) {
        var todo, i;
        for (i = this.items.length - 1; i >= 0; i--) {
            todo = this.items[i];
            if (todo.id === todoId) {
                return todo;
            }
        }
        return false;
    };
    this.addTodo = function(title, desc, lat, lng) {
        var newTodo = {
            id: this.nextId++,
            completed: false,
            title: title,
            desc: desc,
            lat: lat,
            lng: lng
        };
        this.items.push(newTodo);
    };
    this.updateTodo = function(todoId, title, desc, lat, lng, comp) {
        var todo = this.getTodoById(todoId);
        if (todo) {
            todo.title = title;
            todo.desc = desc;
            todo.lat = lat;
            todo.lng = lng;
            todo.completed = comp;
            todo.id = this.nextId++;
        }
    };
    this.prune = function() {
        var flag = false,
            i;
        for (var i = this.items.length - 1; i >= 0; i--) {
            if (this.items[i].completed) {
                flag = true;
                this.items.splice(i, 1);
            }
        }
        if (flag) this.nextId++;
    };
});

myApp.service('markersService', function() {
    this.markers = [];
    this.getMarkerByTodoId = function(todoId) {
        var marker, i;
        for (i = this.markers.length - 1; i >= 0; i--) {
            marker = this.markers[i];
            if (marker.get("id") === todoId) {
                return marker;
            }
        }
        return false;
    };
});

myApp.service('infoWindowService', function(mapService) {
    var infoWindow;
    this.data = {};
    this.registerInfoWindow = function(myInfoWindow) {
        infowindow = myInfoWindow;
    };
    this.setData = function(todoId, todoTitle, todoDesc) {
        this.data.id = todoId;
        this.data.title = todoTitle;
        this.data.desc = todoDesc;
    };
    this.open = function(marker) {
        infowindow.open(mapService.getMap(), marker);
    };
    this.close = function() {
        if (infowindow) {
            infowindow.close();
            this.data = {};
        }
    };
});

myApp.service('mapControlsService', function(infoWindowService, markersService, NEW_TODO_ID) {
    this.editTodo = false;
    this.editTodoId = NEW_TODO_ID;
    this.newTodo = function() {
        this.editTodoById();
    };
    this.editTodoById = function(todoId) {
        this.editTodoId = todoId || NEW_TODO_ID;
        this.editTodo = true;
    };
    this.openInfoWindowByTodoId = function(todoId) {
        var marker = markersService.getMarkerByTodoId(todoId);
        if (marker) {
            infoWindowService.setData(todoId, marker.getTitle(), marker.get("desc"));
            infoWindowService.open(marker);
            return;
        }
    };
});