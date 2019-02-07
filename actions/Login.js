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
        password: ''
    };
    if (input.userName == example.userName && input.password == example.password){
        return true;
    } else {
        console.log('wat')
        return false;
    }
}