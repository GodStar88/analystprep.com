var mongoose = require('mongoose');
var findOrCreate = require('mongoose-findorcreate');

var ObjectID = mongoose.SchemaTypes.ObjectId;

var accountSchema = new mongoose.Schema({
  n_login: Number,
  n_questions: Number,
  ip_address: String,
  ref: String,
  email: String,
  password: String,
  code: Number,
  id: Number,
  time_signup: Number,
  username: String,
  premium: Number,
  time_paid: Number,
  premium_cfa2: Number,
  time_paid_cfa2: Number,
  premium_cfa_bundle: Number,
  time_paid_cfa_bundle: Number,
  premium_frm1: Number,
  time_paid_frm1: Number,
  premium_frm2: Number,
  time_paid_frm2: Number,
  premium_frm_bundle: Number,
  time_paid_frm_bundle: Number,
  exam_chosen: Number,
  imagelocation: String,
  name: String,
  location: String,
  exam_date: String,
  age: String,
  occupation: String,
  education: String,
  mock: Number,
  notes: Number,
  admin: Number,
  testmode: Number,
  confirmation: Number,
  mock_premium: Number,
  test: Number,
  n_login: Number,
  n_questions: Number,
  ip_address: String,
  ref: String,
  email: String,
  password: String,
  code: Number,
  id: Number,
  time_signup: Number,
  username: String,
  premium: Number,
  time_paid: Number,
  premium_cfa2: Number,
  time_paid_cfa2: Number,
  premium_cfa_bundle: Number,
  time_paid_cfa_bundle: Number,
  premium_frm1: Number,
  time_paid_frm1: Number,
  premium_frm2: Number,
  time_paid_frm2: Number,
  premium_frm_bundle: Number,
  time_paid_frm_bundle: Number,
  exam_chosen: Number,
  imagelocation: String,
  name: String,
  location: String,
  exam_date: String,
  age: String,
  occupation: String,
  education: String,
  mock: Number,
  notes: Number,
  admin: Number,
  testmode: Number,
  confirmation: Number,
  mock_premium: Number,
  test: Number,
});

var imageSchema = new mongoose.Schema({
    caption: String,
    path: String,
    owner: ObjectID,
    created_at: {
        type: Date,
        default: Date.now
    }
});

accountSchema.plugin(findOrCreate);


mongoose.model('Account', accountSchema);
mongoose.model('Image', imageSchema);

module.exports = {
    accountSchema: accountSchema,
    imageSchema: imageSchema
};