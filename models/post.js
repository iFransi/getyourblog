var mongoose = require('mongoose');
var textSearch = require('mongoose-text-search');

var postSchema = mongoose.Schema({
    postDate: { type: Date, default: Date.now },
    title: String,
    content: String,
    image: String,
    userID: String,
    username: String,
    comment: []
});

postSchema.plugin(textSearch);
postSchema.index({'$**': 'text'});

var Item = mongoose.model('Post', postSchema);
module.exports = Item;
