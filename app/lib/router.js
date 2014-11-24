Router.route('/', function () {
  var easyId = randNineDigit();
  var timer_id = Timers.insert({easyId: easyId, time: Session.get('timeDefaults').pomo, run: true, currentTimer: 'pomo'});
  Meteor.call('start_timer', timer_id);
  Router.go('/'+ easyId);
});

Router.route('/:easyId', function () {
  var timer_id = Timers.findOne({easyId: this.params.easyId});
  Session.set('timer_id', timer_id);
  Session.set('easyId', this.params.easyId);
  Session.set('url', window.location.origin + '/' + Session.get('easyId'));
  this.render('all');
});