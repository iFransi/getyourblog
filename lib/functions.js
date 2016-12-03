module.exports = {
        checkAdmin: function(user){
        if (user.role === "admin"){
            return true;
        }else{
            return false;
        }
    },
};