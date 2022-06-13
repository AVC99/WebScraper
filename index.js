require('dotenv').config();
const request = require('request');
const axios = require('axios').default;
const cheerio = require('cheerio');
const fs = require('fs');
const writeStream = fs.createWriteStream('Anuga.csv');


global.baseURL = process.env.BASE_URL;
global.startingURL = process.env.STARTING_URL;

const totalPages = 231;
let firstURL = process.env.SHADOW_URL;

let newCounter = 0;
//Write Headers to CSV
writeStream.write(`Name, Direcction, Phone, Fax, Email, Website\n`);

function createUrl(url) {
    return baseURL + url;
}
function addTwentyToURL(url) {
    //https://www.anuga.com/exhibitors-2021/list-of-exhibitors/?fw_goto=aussteller/blaettern&&start=20&paginatevalues=null
    let newURL = `https://www.anuga.com/exhibitors-2021/list-of-exhibitors/?fw_goto=aussteller/blaettern&&start=${newCounter}&paginatevalues=null`;
    newCounter += 20;
    return newURL;
}




//request(global.startingURL, (error, response, body) => {
   // if (!error && response.statusCode == 200) {
function getData(){
    let url = addTwentyToURL(firstURL);
            request(url, (error, response, body) => {
                if (!error && response.statusCode == 200) {
                    console.log("consulting :" + url)
                    var $ = cheerio.load(body);
                    var linkList = [];

                    //get all links from one site
                    $('.item').each((i, el) => {
                        let link = $(el).find('a').attr('href');
                        linkList.push(link);
                    })

                    //iterate all links generated from one site
                    linkList.forEach(link => {
                        request(createUrl(link), (error, response, body) => {
                            if (!error && response.statusCode == 200) {
                                //Get individual data from each page
                                let $$ = cheerio.load(body);
                                let name = $$('.cont').find('strong').text();
                                let direction = $$('.cont').text().replace(/\s\s+/g, '');
                                let phone = $$('.sico.ico_phone').text();
                                let fax = $$('.sico.ico_fax').text();
                                let email = $$('.sico.ico_email').text();
                                let website = $$('.sico.ico_link').text();

                                writeStream.write(`${name}, ${direction}, ${phone}, ${fax}, ${email}, ${website}\n`),err=>{
                                    if(err) console.log(err);
                                };
                            }
                        })
                    });
                } else {
                     console.log("error: "+error);
                     console.log("status code: "+response.statusCode);
                }
            })
           
          return 0  
    }
     

       
   
    const task = async () => {
        for (let i = 0; i < totalPages; i++) {
            await new Promise(r => setTimeout(r,(Math.random()*1000)+5000 ));
            getData();
        }
    }
    task();
    
    clearInterval();
    console.log("doneScraping");
        




//makeGetRequest('https://www.google.com');