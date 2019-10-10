const request = require('request');
const cheerio = require('cheerio');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');
let userData;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

for (let i = 17001; i <= 17100; i++) {
    userData = {
        'info': {},
        'education': {}
    };

    request({
        "rejectUnauthorized": false,
        "url": `https://events.hec.gov.pk/portal_dashboard/view_profile.php?id=${i}`,
        "method": "GET",
        "headers": {
            "X-API-VERSION": 1
        }
    }, async (error, respone, html) => {
        if (!error && respone.statusCode == 200) {
            // console.log(html);
            const $ = cheerio.load(html);
            userData.info.id = $('#emp_id') == null ? "" : $('#emp_id').val();
            userData.info.name = $('#sname') == null ? "" : $('#sname').val();
            userData.info.surName = $('#father_name') == null ? "" : $('#father_name').val();
            userData.info.gender = $('#gender') == null ? "" : $('#gender').val();
            userData.info.cnic = $('#cnic') == null ? "" : $('#cnic').val();
            userData.info.dob = $('#dob') == null ? "" : $('#dob').val();
            userData.info.permAddress = $('#per_addres') == null ? "" : $('#per_addres').val();
            userData.info.resAddress = $('#pre_addres') == null ? "" : $('#pre_addres').val();
            userData.info.city = $('#pre_city') == null ? "" : $('#pre_city').val();
            userData.info.phone = $('#phone') == null ? "" : $('#phone').val();
            userData.info.province = $('#pre_province').children("[selected='selected']") == null ? "" : $('#pre_province').children("[selected='selected']").text();
            userData.info.domProvince = $('#domicil').children("[selected='selected']") == null ? "" : $('#domicil').children("[selected='selected']").text();
            userData.info.mail = $("div:contains('Email:')").next() == null ? "" : $("div:contains('Email:')").next().text().trim();

            if (userData.info.mail != "") {

                // db.collection('test').doc(i + "").collection('data').doc('info').set(userData.info);


                request({
                    "rejectUnauthorized": false,
                    "url": `https://events.hec.gov.pk/portal_dashboard/education.php?id=${i}`,
                    "method": "GET",
                    "headers": {
                        "X-API-VERSION": 1
                    }
                }, async (error, respone, html) => {
                    if (!error && respone.statusCode == 200) {
                        const $ = cheerio.load(html);
                        userData.education.passingYear = $('#myTable').children('tr').children('td:nth-of-type(1)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(1)').text();
                        userData.education.qualification = $('#myTable').children('tr').children('td:nth-of-type(2)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(2)').text();
                        userData.education.programTitle = $('#myTable').children('tr').children('td:nth-of-type(3)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(3)').text();
                        userData.education.discipline = $('#myTable').children('tr').children('td:nth-of-type(4)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(4)').text();
                        userData.education.majorSubj = $('#myTable').children('tr').children('td:nth-of-type(5)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(5)').text();
                        userData.education.uniBoard = $('#myTable').children('tr').children('td:nth-of-type(6)') == null ? "" : $('#myTable').children('tr').children('td:nth-of-type(6)').text();


                        await db.collection('test').doc(i + "").set(userData);
                        // console.log(`data entered for ${i}`)


                    }
                    else {
                        console.log(error, respone);
                    }
                });


            }

        }
        else {
            console.log(error, respone);
        }
    });

}




// }

// console.log(info.sort());
