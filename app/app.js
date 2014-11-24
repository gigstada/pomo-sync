Timers = new Mongo.Collection('timers');

randNineDigit = function() {
  var num = getRandomInt(100000000,999999999);
  return num.toString();
};

getRandomInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

hyphenate9 = function(num) {
  var hyphenated = num;
  hyphenated = hyphenated.split('');
  hyphenated.splice(3, 0, '-');
  hyphenated.splice(7, 0, '-');
  return hyphenated.join('');
}

numbersOnly = function(str) {
  var arr = str.match(/[0-9]+/g);
  if (arr) {
    return arr.join('');
  } else {
    return '';
  }
  
}

Meteor.methods({
  setTimer: function(id,secs,name) {
    Timers.update(id, {$set: {time: secs, run: true, currentTimer: name}});
  },
  start: function(id) {
    Timers.update(id, {$set: {run: true}});
  },
  stop: function(id) {
    Timers.update(id, {$set: {run: false}});
  },
  reset: function(id,timeDefaults) {
    var timer = Timers.findOne(id);
    var currentTimer = timer.currentTimer;

    Timers.update(id, {$set: {run: false, time: timeDefaults[currentTimer]}});
  }
});


if (Meteor.isClient) {
  
  var zeroPad = function(num){
    if (num < 10){
      num = '0' + num;
    }
    return num;
  }
  
  var convertedTime = function(seconds){
    var minutes = Math.floor(seconds / 60);
    var seconds = seconds % 60;
    
    return zeroPad(minutes) + ':' + zeroPad(seconds);
  }
  

  
  Template.all.helpers({
    timeVal: function () {
      var timer = Timers.findOne(Session.get("timer_id"));
      return timer && convertedTime(timer.time);
    },
    url: function () {
      return Session.get('url');
    },
    easyId: function() {
      var timer = Timers.findOne(Session.get("timer_id"));
      return timer && hyphenate9(timer.easyId);
    }
  });

  Template.all.events({
    'click button.btn-pomo': function () {
      Meteor.call('setTimer',Session.get('timer_id'),Session.get('timeDefaults').pomo,'pomo');
    },
    'click button.btn-short-break': function () {
      Meteor.call('setTimer',Session.get('timer_id'),Session.get('timeDefaults').shortBreak,'shortBreak');
    },
    'click button.btn-long-break': function () {
      Meteor.call('setTimer',Session.get('timer_id'),Session.get('timeDefaults').longBreak,'longBreak');
    },
    'click button.btn-start': function () {
      Meteor.call('start',Session.get('timer_id'));
    },
    'click button.btn-stop': function () {
      Meteor.call('stop',Session.get('timer_id'));
    },
    'click button.btn-reset': function () {
      Meteor.call('reset',Session.get('timer_id'),Session.get('timeDefaults'));
    },
    'submit': function(event) {
      var joinId = $('#joinId').val();
      if (joinId && joinId != "") {
        var record = Timers.findOne({easyId:numbersOnly(joinId)});
        if(record) {
          Router.go('/'+ numbersOnly(joinId));
          $('#joinId').val('');
        }
      }
      event.preventDefault();
      event.stopPropagation();
      return false;
    }
    
  });
  
  Meteor.startup(function () {   
    Session.set('timeDefaults',{
      pomo: 25 * 60,
      shortBreak: 5 * 60,
      longBreak: 15 * 60
    });

  });
}

if (Meteor.isServer) {
  
  Meteor.methods({
    start_timer: function (timer_id) {
      var interval = Meteor.setInterval(function () {
        
        var timer = Timers.findOne(timer_id);
        
        if(timer && timer.run && timer.time > 0){
          Timers.update(timer_id, {$inc: {time: -1}});
        }
      }, 1000);

      return timer_id;
    }
  });
  
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
