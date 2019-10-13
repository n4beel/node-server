const request = require('request');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');
let userData;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const getInfo = inputUrl => {
    return new Promise((resolve, reject) => {
        request({
            "rejectUnauthorized": false,
            "url": `https://events.hec.gov.pk/portal_dashboard/view_profile.php?id=${inputUrl}`,
            "method": "GET",
            "headers": {
                "X-API-VERSION": 1
            }
        }, (error, respone, html) => {
            if (!error && respone.statusCode == 200) {
                // console.log(html);
                let information = {};
                const $ = cheerio.load(html);
                information.id = $('#emp_id') == null ? "" : $('#emp_id').val();
                information.name = $('#sname') == null ? "" : $('#sname').val();
                information.surName = $('#father_name') == null ? "" : $('#father_name').val();
                information.gender = $('#gender') == null ? "" : $('#gender').val();
                information.cnic = $('#cnic') == null ? "" : $('#cnic').val();
                information.dob = $('#dob') == null ? "" : $('#dob').val();
                information.permAddress = $('#per_addres') == null ? "" : $('#per_addres').val();
                information.resAddress = $('#pre_addres') == null ? "" : $('#pre_addres').val();
                information.city = $('#pre_city') == null ? "" : $('#pre_city').val();
                information.phone = $('#phone') == null ? "" : $('#phone').val();
                information.province = $('#pre_province').children("[selected='selected']") == null ? "" : $('#pre_province').children("[selected='selected']").text();
                information.domProvince = $('#domicil').children("[selected='selected']") == null ? "" : $('#domicil').children("[selected='selected']").text();
                information.mail = $("div:contains('Email:')").next() == null ? "" : $("div:contains('Email:')").next().text().trim();

                if (information.mail != "") {
                    resolve(information);
                }
                else {
                    reject(`Error: no contact info for id: ${inputUrl}`);
                }

            }
            else {
                reject("Error: Connection Timed Out" + inputUrl);
            }
        });
    });
}

const getEdu = inputUrl => {
    return new Promise((resolve, reject) => {
        request({
            "rejectUnauthorized": false,
            "url": `https://events.hec.gov.pk/portal_dashboard/education.php?id=${inputUrl}`,
            "method": "GET",
            "headers": {
                "X-API-VERSION": 1
            }
        }, (error, respone, html) => {
            if (!error && respone.statusCode == 200) {
                const $ = cheerio.load(html);
                let edu = {};
                edu.passingYear = $('#myTable').children('tr').children('td:nth-of-type(1)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(1)').text();
                edu.qualification = $('#myTable').children('tr').children('td:nth-of-type(2)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(2)').text();
                edu.programTitle = $('#myTable').children('tr').children('td:nth-of-type(3)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(3)').text();
                edu.discipline = $('#myTable').children('tr').children('td:nth-of-type(4)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(4)').text();
                edu.majorSubj = $('#myTable').children('tr').children('td:nth-of-type(5)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(5)').text();
                edu.uniBoard = $('#myTable').children('tr').children('td:nth-of-type(6)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(6)').text();

                if (true)
                    resolve(edu);
                else
                    reject("Error: impossibl    e happened")
            }
            else {
                reject("Error: Connection Timed Out" + inputUrl);
            }
        });

    });
}

// const set

for (let i = 12301; i <= 12400; i++) {
    userData = {
        'info': {},
        'education': {}
    };

    const infoResolve = getInfo(i);
    const eduResolve = getEdu(i);

    Promise.all([infoResolve, eduResolve]).then(values => {
        userData.info = values[0];
        userData.education = values[1];
        db.collection('test').doc(i + "").set(userData);
    }).catch(err => console.log(err));

}

