const bcrypt = require('bcrypt');
data = {};

module.exports.check = function(input) {
    return new Promise((resolve, reject)=>{
        results = DB_Query(input);
        if(results == true){
            data.userName = input.userName;
            data.password = input.password;
            resolve(data);
        }
        else {
            data.error = 1;
            reject(data);
        }
    });
};



function DB_Query(input){
    // function for DB query
    var example = {
        userName: 'jason',
        password: bcrypt.hashSync('jason', bcrypt.genSaltSync(10))
    };
    console.log(example.password);
    console.log(input.password);
    console.log(bcrypt.compareSync(input.password, example.password));
    if (input.userName == example.userName && bcrypt.compareSync(input.password, example.password) == true){
        return true;
    } else {
        console.log('wat')
        return false;
    }
}