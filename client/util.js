Util = {};

// We need to store the dep, ready flag, and data for each call
Util.d_waitOns = {};

// This function returns a handle with a reactive ready function, which
// is what waitOn expects. waitOn will complete when the reactive function
// returns true.
Util.waitOnServer = function(name) {
  // This prevents the waitOnServer call from being called multiple times
  // and the resulting infinite loop.
  if (this.d_waitOns[name] !== undefined &&
      this.d_waitOns[name].ready === true) {
    return;
  }
  else {
    this.d_waitOns[name] = {};
  }
  var self = this;
  // We need to store the dependency and the ready flag.
  this.d_waitOns[name].dep = new Deps.Dependency();
  this.d_waitOns[name].ready = false;

  // Perform the actual async call.
  Meteor.call(name, function(err, or) {
    // The call has complete, so set the ready flag, notify the reactive
    // function that we are ready, and store the data.
    self.d_waitOns[name].ready = true;
    self.d_waitOns[name].dep.changed();
    self.d_waitOns[name].data = (err || or);
  });

  // The reactive handle that we are returning.
  var handle = {
    ready: function() {
      self.d_waitOns[name].dep.depend();
      return self.d_waitOns[name].ready;
    }
  };
  return handle;
}

// Retrieve the data that we stored in the async callback.
Util.getResponse = function(name) {
  return this.d_waitOns[name].data;
}