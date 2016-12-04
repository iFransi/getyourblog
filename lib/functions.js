function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
}

module.exports = {
    checkAdmin: function(user){
        if (user.role === "admin"){
            return true;
        }else{
            return false;
        }
    },
    guid: function(){
        return  s4() + s4() + '-' + s4() + '-' + s4() + '-' +
        s4() + '-' + s4() + s4() + s4();
    },
};