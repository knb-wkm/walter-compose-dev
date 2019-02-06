import * as moment from 'moment';

const dateTimeFormatter = function(locale,options){
  this.format = (datetime) => {
    if(locale === "ja") {
      moment.locale('ja', {
        weekdays: ["日曜日","月曜日","火曜日","水曜日","木曜日","金曜日","土曜日"],
        weekdaysShort: ["日","月","火","水","木","金","土"],
        weekdaysMin: ["日","月","火","水","木","金","土"],
      });
    }
    const m = moment(datetime);

    if( !options ){
      return m.format("YYYY-MM-DD");
    } else if (options.month === "short" && options.weekday === "short" && options.day === "2-digit"){
      return m.format("M月D日(ddd)");
    } else if( options.weekday === "narrow" ){
      return m.format("dd");
    }else if (options.year === "numeric" && options.month === "long") {
      return m.format("YYYY年M月");
    }else if (options.year === "numeric" ) {
      return m.format("YYYY");
    }else if (options.day === "numeric" ) {
      return m.format("D");
    }else{
      return m.format("YYYY-MM-DD");
    }
  };
 };

 export default dateTimeFormatter;
