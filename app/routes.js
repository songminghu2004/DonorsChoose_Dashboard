var Subjects = require('./models/SubjectViews');

module.exports = function(app) {

	// server routes ===========================================================
	// handle things like api calls
	// authentication routes	
	// sample api route
 app.get('/api/data', function(req, res) {
  // use mongoose to get all nerds in the database
  Subjects.find({"date_posted": {$ne :"" }}, {'_id': 0, 'school_state': 1, 'resource_type': 1, 'poverty_level': 1, 'date_posted': 1, 'total_donations': 1, 'funding_status': 1, 'grade_level': 1, 'school_latitude': 1, 'school_longitude': 1, 'total_price_including_optional_support': 1,
  'school_metro': 1, 'school_city': 1}, function(err, subjectDetails) {
   // if there is an error retrieving, send the error. 
       // nothing after res.send(err) will execute
   if (err) 
   res.send(err);
    res.json(subjectDetails); // return all nerds in JSON format
  }).limit(100000);
 });

 



 // frontend routes =========================================================
 app.get('*', function(req, res) {
  res.sendfile('./public/login.html');
 });
}
