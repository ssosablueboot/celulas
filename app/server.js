const express = require('express');
const passport = require('passport');
const xsenv = require('@sap/xsenv');
const JWTStrategy = require('@sap/xssec').JWTStrategy;
const axios = require('axios');

const xsuaaService = xsenv.getServices({ myXsuaa: { tag: 'xsuaa' }});
const xsuaaCredentials = xsuaaService.myXsuaa; 
const jwtStrategy = new JWTStrategy(xsuaaCredentials);
passport.use(jwtStrategy);

const app = express();
app.use(passport.initialize());
app.use(passport.authenticate('JWT', { session: false }));

app.get('/actualizarCelulas', function(req, res){
    axios.get('https://celulas-cmp.azurewebsites.net/api/ServerMethods/GetAllCelulas')
        .then(response => {
            // Handle the response data
            if (response.data.length){
                const url = 'https://cap-capcf-grp-js.cfapps.us10.hana.ondemand.com/celulas.xsjs';
                const method = '?method=save';
                
                const config = {
                    headers: {
                    'Content-Type': 'application/json'
                    }
                };

                response.data.forEach((celula, i) => {
                    delete celula.id;
                    const delay = i * 2500; 

                    setTimeout(() => {                                                
                        
                        const data = JSON.stringify(celula);
                        
                        axios.post(url + method, data, config )
                        .then(response => {
                            // Handle the response data
                            // console.log(response.data);                     
                        }).catch(error => {
                            console.error(error);
                        });  
                    }, delay);
                })
            } else {
                console.log("No se obtuvieron células desde: https://celulas-cmp.azurewebsites.net/api/ServerMethods/GetAllCelulas");
            }
        })
        .catch(error => {
            // Handle any error that occurred during the request
            console.error(error);
    });

    console.log('==> [APP JOB LOG] Job is running . . .');
    res.send('Finished job');
});

const port = process.env.PORT || 3000;
app.listen(port, function(){
    console.log('listening');
})
