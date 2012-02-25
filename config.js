module.exports = {
  PORT: 3000,
  REDIS_PORT: 6379,

  EMAIL_TEST: function(email) {
    return /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/.test(email);
  },

  GRAVATAR_URL: 'http://www.gravatar.com/avatar/{{hash}}.jpg?d=identicon',

  AUTH: 'user-auth',

  SPLIT: '::',
  NEXT: 'next',
  
  USER: 'user',
  USERS: 'users',

  SECTION: 'section',
  SECTIONS: 'sections',
  THREAD: 'thread',
  THREADS: 'threads',
  MESSAGE: 'message',
  MESSAGES: 'messages'
}
