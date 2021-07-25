module.exports = {
    randomStr,
}

function randomStr(len) {
    let result           = '';
    const characters       = '123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < len; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return parseInt( result );
}





