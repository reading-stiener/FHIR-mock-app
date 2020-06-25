module.exports = {
    getHomePage: (req, res) => {
        let query = "SELECT * FROM `athlete` ORDER BY id ASC";

        db.all(query, [], (err, rows) => {
            if (err) {
                res.redirect('/');
            }
            res.render('index.ejs', {
                title: "Welcome to My Sport Team | View Athletes",
                athletes: rows
            });

        });


    }
}