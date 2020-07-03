const auth = (req, res, next) => {
    console.log(req.method);
    console.log('auth middleware');
    next();
};

const redirectLogin = (req, res, next) => {
    console.log(req.session.userID);
    if(!req.session.userID){
        res.redirect('/');
    }else{
        next();
    }
};

const redirectHome = (req, res, next) => {
    console.log(req.session.userID);
    if(req.session.userID){
        res.redirect('/home');
    }else{
        next();
    }
};

module.exports = { auth, redirectLogin, redirectHome };