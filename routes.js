var passport = require('passport');
var Account = require("./models/account.js");
var Post = require("./models/post.js");
var router = require('express').Router();
var func = require('./lib/functions.js');


router.get('/', function(req, res) {
    if(req.user != undefined){
      res.redirect('/user/postlist');
    }else{
      res.redirect('/public');
    }
});


router.get('/register', function(req, res) {
  res.render('security/register', {});
});

router.post('/register', function(req,res, next){
	console.log('registering user');
  Account.register(new Account({username: req.body.username, role: "user", posts:[]}), req.body.password, function(err) {
    if (err) {
      console.log('error while user register!', err);
      return next(err);
    }
    console.log('user registered!');
    res.redirect('/');
	});
});

router.get('/login', function(req, res) {
  res.render('security/login', {user: req.user});
});

router.post('/login', passport.authenticate('local'), function(req, res) {
  if (req.user.role === "user"){
    res.redirect('/user/postList');
  }else{
    res.redirect('/admin');
  }
});

router.get('/public', function(req, res) {
    if(req.user != undefined){var admin = func.checkAdmin(req.user);}
    Post.find({}).sort({postDate: -1}).exec(function(err, post){
      if(err) console.error('Unable to find Posts: ' + err);
      var postList = post.map(function(post){
		   	return{
		   	  username: post.username,
		   	  title: post.title,
		   	  content: post.content.slice(0,140) + "...",
		   	  _id: post._id,
		   	  userID: post.userID,
		   	  postDate: post.postDate,
		   	  image: post.image
		    };
      });
      res.render('public/publicPage', {admin:admin, user: req.user, post: postList});
    }); 
});

router.get('/postDetails/:postID', function(req, res) {
  if(req.user != undefined){var admin = func.checkAdmin(req.user);}
  Post.findById(req.params.postID, function(err, post){
     if(err) console.error('Unable to find Posts: ' + err);
    res.render('public/postDetails', {public:true, admin:admin, user:req.user, post:post});
  });
});

router.post('/search', function(req, res) {
    if(req.user != undefined){var admin = func.checkAdmin(req.user);}
    Post.find({$text: {$search: req.body.search}})
      .skip(0)
      .limit(20)
      .sort({postDate: -1})
      .exec(function(err, post) {
        if(err) console.error('Unable to find Posts: ' + err);
        var postList = post.map(function(post){
		   	  return{
		   	    username: post.username,
		   	    title: post.title,
		   	    content: post.content.slice(0,140) + "...",
		   	    _id: post._id,
		   	    userID: post.userID,
		   	    postDate: post.postDate,
		   	    image: post.image
		      };
        });
        res.render('public/resultPage', {admin:admin, user:req.user, post:postList});   
      });
});

router.use(function(req, res, next){
  if (req.user != undefined){
    next();
  }else{
    res.render('error/404');
  }
});

router.get('/user/postlist', function(req, res) {
    var admin = func.checkAdmin(req.user);
    Post.find({userID: req.user._id}).sort({postDate: -1}).exec(function(err, post){
      if(err) console.error('Unable to find Posts: ' + err);
      var postList = post.map(function(post){
		   	return{
		   	  username: post.username,
		   	  title: post.title,
		   	  content: post.content.slice(0,140) + "...",
		   	  _id: post._id,
		   	  userID: post.userID,
		   	  postDate: post.postDate,
		   	  image: post.image
		    };
        });
      
      res.render('user/listPosts', {admin:admin, user: req.user, post: postList});
    });
});

router.get('/user/postDetails/:postID', function(req, res) {
  var admin = func.checkAdmin(req.user);
  Post.findById(req.params.postID, function(err, post){
      
     if(err) console.error('Unable to find Posts: ' + err);
      if(req.user != undefined && req.user.username === post.username){
       res.render('public/postDetails', {public: false, admin:admin, user: req.user, post:post}); 
      }else{
        res.render('error/404', {user:req.user});
      }
  });
});

router.get('/user/createpost', function(req, res){
  var admin = func.checkAdmin(req.user);
  res.render('user/createPost', {admin:admin, user: req.user});
});

router.post('/user/createpost', function(req, res) {
  var post = new Post({
    username: req.user.username,
    postDate: new Date,
    title: req.body.title,
    content: req.body.content,
    image: req.body.image_url,
    userID: req.user._id,
  });
  post.save(function(err, post){
    if(err) console.error('Unable to add Traveler: ' + err);
    res.redirect(303, 'postList');
  });
});

router.get('/user/deletePost/:postID', function(req, res) {
  Post.findById(req.params.postID, function(err,post){
    if(err) console.error('Unable to delete Post: ' + err);
    if(req.user != undefined && req.user.username === post.username){
    post.remove(function(err){
      if(err) console.error('Unable to delete Post: ' + err);
      res.redirect(303, '/user/postlist');
    });
    }else{
        res.render('error/404', {user:req.user});
    }
  });
});

router.get('/user/editPost/:postID', function(req, res) {
    var admin = func.checkAdmin(req.user);
    Post.findById(req.params.postID, function(err, post){
     if(err) console.error('Unable to find Post: ' + err);
      if(req.user != undefined && req.user.username === post.username){
        res.render('user/editPost', {admin:admin, user:req.user, post:post});
      }else{
        res.render('error/404', {user:req.user});
      }
   }); 
});

router.post('/user/editPost', function(req, res){
  console.log(req.body.postID);
  console.log(req.body.title);
  Post.findByIdAndUpdate(req.body.postID, {
    $set:{
      title: req.body.title,
      content: req.body.content,
      image: req.body.image_url
    }
  }, {safe:true, upsert:true}, function(err, post){
    if (err) return console.error('Unable to edit Post: ' + err);
    res.redirect(303, '/user/postList');
    
  });
});

router.get('/user/logout', function(req, res) {
  req.logout();
  res.redirect(303, '/');
});

router.use(function(req, res, next){
  if (req.user.role ==='admin'){
    next();
  }else{
    res.render('error/404', {user:req.user});
  }
});

router.get('/admin', function(req, res) {
      Account.find({}, function(err, account){
        if(err) console.error('Unable to find Users: ' + err);
        res.render('admin/adminDashboard', {admin:true, user:req.user, account:account});
      });
});

router.get('/admin/postlist/:userID', function(req, res) {
    Post.find({userID: req.params.userID}, function(err, post){
      if(err) console.error('Unable to find Posts: ' + err);
      res.render('admin/adminPostList', {admin:true, user:req.user, post: post}); 
    });
});



module.exports = router;
