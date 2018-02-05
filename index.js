const fs = require('fs')
const htmlparser = require('htmlparser2')

const inFile = './MyActivity.html';
const outFile = './activity.csv';

console.log('Loading Activity');
const html = fs.readFileSync(inFile)
const out = fs.createWriteStream(outFile)
out.write("query,date,hour,year,day of week\n");
console.log('Parsing Activity');

const searchMatcher = /Searched for/i;
var newEntry = null;
var saveNextText = false;

var parser = new htmlparser.Parser({
  onopentag: function(name, attribs){
    if(attribs.class && attribs.class.indexOf('outer-cell') >= 0){
      if (newEntry && newEntry.search && newEntry.date) {
        saveNextText = false;
        out.write(`"${newEntry.query}","${newEntry.date}",${newEntry.hour},${newEntry.year},${newEntry.dayOfWeek}\n`);
      }
      newEntry = {};
    }
  },
  ontext: function(text){
    if (saveNextText && text.trim().length > 0) {
      newEntry.query = text;
      saveNextText = false;
    }
    if (text.match(searchMatcher)) {
      newEntry.search = true;
      saveNextText = true;
    }
    //Try and parse a date (if this works, the it's the date)
    let date = new Date(text);
    if (date instanceof Date && isFinite(date)) {
      newEntry.date = date.toISOString();
      newEntry.hour = date.getHours();
      newEntry.year = date.getFullYear();
      newEntry.dayOfWeek = date.getDay();
      newEntry.month = date.getMonth();
    }
  },
  onend: function(){
    out.end();
    console.log('Completed!');
  }
}, {decodeEntities: true});
parser.write(html);
parser.end();
