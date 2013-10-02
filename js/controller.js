var Controller = function(baseUrl, authenticator) {
  this.baseUrl = baseUrl
  this.auth = authenticator
  this.initialize()
};

Controller.prototype = {
  initialize: function() {
    var self = this;
    $(document).on('click', '#green-button', function() { self.vote("yes") });
    $(document).on('click', '#red-button', function() { self.vote("no") });
    $(document).on('submit', '#send-message-button', function(e) { self.sendMessage(e) });
    $(document).on('click', "#signup", function() { self.renderForm("#signup-template") })
    $(document).on('click', '#signin', function() { self.renderForm("#signin-template") })
    $(document).on(globalEvents.logIn, function(){
      console.log("i am responding to that event you fired")
      self.getRandomUser()
    })
  },

  vote: function(opinion) {
    console.log('start of vote function');
    var self = this;
    var vote = new Object();
    vote['voted_on_id'] = $('.user').data('id');
    vote['voter_id'] = self.auth.getCurrentUser();
    vote['opinion'] = opinion;
    $.post(this.baseUrl + 'votes', vote)
    .done(function(data) {
      console.log(data);
      console.log("in the vote function");
      console.log(data.status);
      if (data.status === "yes")
      {
       console.log('you win');
       self.render("#match-message-template", data.votee);
      }
    else
      {
        console.log('sorry try again');
        self.getRandomUser();
      }
    });
  },

  getRandomUser: function() {
    console.log("event trigger is getting me into getRandomUser!")
    var self  = this;
    var templateSelector = "#profile-template";
    $.ajax({
      url: self.baseUrl + '/users/random',
      data: self.auth.getCurrentUser()
    })
    .done(function(response) {
      console.log("event trigger is getting me into getRandomUser ajax!")
      var user = new User(response);
      self.render(templateSelector, user);
       getLocation();
      // $('#greenbutton').on('click', voteOnProfile);
    });
  },

  render: function(templateSelector, data) {
    var source   = $(templateSelector).html();
    var template = Handlebars.compile(source);
    $('body').html(template(data));

  },

  renderForm: function(templateSelector) {
    var source   = $(templateSelector).html();
    var template = Handlebars.compile(source);
    $('body').html(template);
  },

   sendMessage: function(e) {
    e.preventDefault();
    console.log("in the send message function");
    var messageData = new Object();
    messageData['reciever_id'] = $('.main-message-form').data('id');
    messageData['user_id'] = localStorage['currentUser'];
    messageData['content'] = $('form').serialize();
    console.log("you're in the match messaging");
    var templateSelector = "#message-inbox-template";
    var self = this;
    $.ajax({
      url: self.baseUrl + 'messages',
      type: "POST",
      data: messageData
    })
    .done(function(data) {
      console.log('you have posted a message');
      console.log(data);
      // self.render(templateSelector, data);
      // $('#greenbutton').on('click', voteOnProfile);
    });
  }
}



var onSuccess = function(position) {
  var coords = new Object();
  coords['latitude']= position.coords.latitude;
  coords['longitude'] = position.coords.longitude;
  console.log(localStorage['currentUser'])
  $.post('http://localhost:3000/users/' +localStorage['currentUser'], coords)
};

function onError(error) {
  // alert('please turn on your location settings for greenlight' );
}

function getLocation(){
  navigator.geolocation.getCurrentPosition(onSuccess, onError);
}


