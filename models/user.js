const { Schema, model } = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});
UserSchema.plugin(passportLocalMongoose); // it provides username and password

module.exports = model('User', UserSchema);
