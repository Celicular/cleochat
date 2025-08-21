const bcrypt = require('bcrypt');
async function test() {
    console.log(await bcrypt.compare("1234567","$2b$08$./QvAWHcFZp7yf83m5OO4.YF0SXkK.TqWA0O6tE0eqV8DyVKlNbFK"));
}

test()