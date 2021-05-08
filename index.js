var express = require('express'),
    path = require('path'),
    app = express(),
    cors = require('cors'),
    axios = require('axios'),
    fetch = require('node-fetch');

app.use(cors());
const PORT = process.env.PORT || 3010;
app.set('port', process.env.PORT || 3010);
app.use(express.static(path.join(__dirname, 'public')));
app.listen(PORT, function() {
    console.log('Node.js server is running on port ' + PORT);
});

// This is the list of centers where script will check the available slot
var myCenters = [609927, 548126, 32325, 604639, 613165];
var city = 188; // this is for Gurgaon

Date.prototype.yyyymmdd = function() {
    var mm = this.getMonth() + 1; // getMonth() is zero-based
    var dd = this.getDate();

    return [(dd > 9 ? '' : '0') + dd,
        (mm > 9 ? '' : '0') + mm,
        this.getFullYear()
    ].join('-');
};


function checkResponseStatus(res) {
    if(res.ok){
        return res
    } else {
        throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
    }
}

function getVaccineAvailability(date) {
    fetch('https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=' + city + '&date=' + date , {
    "headers": {
      "authority": "cdn-api.co-vin.in",
      "origin": "https://www.cowin.gov.in",
      "accept": "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      "cache-control": "no-cache",
      "pragma": "no-cache",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "referrer": "https://www.cowin.gov.in/",
      "user-agent": "Mozilla/5.1 (Macintosh; Intel Mac OS X 11_2_1) AppleWebKit/538.36 (KHTML, like Gecko) Chrome/89.0.4324.146 Safari/537.39"
    }

  })
      .then(checkResponseStatus)
      .then(response => response.json())
        .then(data => {
            var centers = data['centers'];
            console.log('Total centers  ' + centers.length + " for Starting date + 7 days " + date);
            if (centers != null && centers.length > 0)
                centers.forEach(centerFilter);

        }).catch(error => {
            console.log(error);
        });
}

function play() {

    var player = require('play-sound')(opts = {})

    player.play('./beep-01a.mp3', function(err) {
        if (err) throw "error in playing beep";
        console.log("Audio played");
    });

    //console.log("play audio");

}

function centerFilter(center) {

    //if(center.center_id == 609927 || center.center_id == 548126  || center.center_id == 32325  || center.center_id ==  604639 || center.center_id == 613165){
    if (myCenters.indexOf(center.center_id) >= 0) {
        //console.log(center);
        console.log('checking for center-' + center.name);
        var sessions = center.sessions;
        if (sessions != null && sessions.length > 0) {
            sessions.forEach(session => {
                if (session.available_capacity > 1 && session.min_age_limit == 18) {
                    play();

                    console.log("*******************BOOKING OPENED ********************************");

                    console.log('Center Name   :- ' + center.name);
                    console.log('Center Address:- ' + center.address);
                    console.log('Session Date  :- ' + session.date);
                    console.log('Capacity      :- ' + session.available_capacity);
                    console.log('Min Age       :- ' + session.min_age_limit);
                    console.log('Vaccine       :- ' + session.vaccine);
                    console.log('Fee Type      :- ' + center.fee_type);
                    console.log("***************************************************");
                } else {

                }

            });
        }
    }
}

var cron = require('node-cron');
cron.schedule('*/1 * * * *', () => {
    console.log('running a task in 1 minute');
    var today = new Date();
    var dateCall = today.yyyymmdd();
    console.log("Passed Date " + dateCall + " called at " + today);
    getVaccineAvailability(dateCall);
    var date = new Date();
    date.setDate(date.getDate() + 7);
    var dateCallAfterSevenDays = date.yyyymmdd();
    console.log("Future Date " + dateCallAfterSevenDays + " called at " + today);
    getVaccineAvailability(dateCallAfterSevenDays);
});
