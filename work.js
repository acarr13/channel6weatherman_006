$(document).ready(function () {

    // On click of Search or city list
    $('#getEnteredCityWeather,#past-searches').on('click', function () {
          let click = $(event.target)[0];
          let loc = "";
          if (click.id === "getEnteredCityWeather") {
            loc = $('#cityEntered').val().trim().toUpperCase();
          } else if ( click.className === ("allCity") ) {
            loc = click.innerText;
          }
          if (loc == "") return;
          updateLocalMemory (loc);
          pulCurWeather(loc);
          pulWeather(loc);
         });
  
      // Convert to MMM DD, YYYY format
      function convertTimestampe(UNIXtimestamp) {
        let convertTime = "";
        let a = new Date(UNIXtimestamp * 1000);
        let monthName = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let fullYear = a.getFullYear();
        let getMonth = monthName[a.getMonth()];
        let getDate = a.getDate();
        convertTime = getMonth + ' ' + getDate + ', '+ fullYear;
        return convertTime;
      }
  
      function updateLocalMemory(loc) 
      {
         let allCity = JSON.parse(localStorage.getItem("allCity")) || [];
         allCity.push(loc); 
         allCity.sort();
         for (let i=1; i<allCity.length; i++) {
             if (allCity[i] === allCity[i-1]) allCity.splice(i,1);
         }
         localStorage.setItem('allCity', JSON.stringify(allCity));
  
         $('#cityEntered').val("");
      }
      function establishCurrLoc() 
      {
          let loc = {};
          function lat_lan(position) {
            loc = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              lat_lan: true
            }
            pulCurWeather(loc);
            pulWeather(loc);
          }
          function error() {
            loc = { lat_lan: false }
            return loc;
          }
          if (!navigator.geolocation) {
            console.log('Geolocation is not supported by your browser');
          } else {
            navigator.geolocation.getCurrentPosition(lat_lan, error);
          }
        }
      function pulCurWeather(loc) 
      {
          let allCity = JSON.parse(localStorage.getItem("allCity")) || [];
          $('#past-searches').empty();
          allCity.forEach ( function (city) {  
            let cityNameHis = $('<div>');      
            cityNameHis.addClass("allCity");         
            cityNameHis.attr("value",city);
            cityNameHis.text(city);
            $('#past-searches').append(cityNameHis);
          });      
          $('#city-search').val("");
          if (typeof loc === "object") {
            city = `lat=${loc.latitude}&lon=${loc.longitude}`;
          } else {
            city = `q=${loc}`;
          }
          var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
          var cityName = city;
          var unitsURL = "&units=imperial";
          var apiIdURL = "&appid="
          var key = "630e27fa306f06f51bd9ecbb54aae081";
          var openCurrWeatherAPI = currentURL + cityName + unitsURL + apiIdURL + key;
          $.ajax({
              url: openCurrWeatherAPI,
              method: "GET"
          }).then(function (response1) {
            obj = {
              city: `${response1.name}`,
              wind: response1.wind.speed,
              humidity: response1.main.humidity,
              temp: Math.round(response1.main.temp),
        
              // convert date to usable format [1] = MM/DD/YYYY Format
              date: (convertTimestampe(response1.dt)),
              icon: `http://openweathermap.org/img/w/${response1.weather[0].icon}.png`,
              desc: response1.weather[0].description
          }
            $('#forecast').empty(); 
            $('#cityName').text(obj.city + " (" + obj.date + ")");
            $('#currWeathIcn').attr("src", obj.icon);
            $('#currTemp').text("Temperature: " + obj.temp + " " +  "°F");
            $('#currHum').text("Humidity: " + obj.humidity + "%");
            $('#currWind').text("Windspeed: " + obj.wind + " MPH");      
          city = `&lat=${parseInt(response1.coord.lat)}&lon=${parseInt(response1.coord.lon)}`;
          var uviURL = "https://api.openweathermap.org/data/2.5/uvi";
          var apiIdURL = "?appid="
          var key = "630e27fa306f06f51bd9ecbb54aae081";
          var cityName = city;
          var openUviWeatherAPI = uviURL + apiIdURL + key + cityName;
          $.ajax({
              url: openUviWeatherAPI,
              method: "GET"
          }).then(function(response3) {
              let level = parseFloat(response3.value);
              let bgColor = 'violet';      
              if (level < 3) {bgColor = 'green';} 
                  else if (level < 6) { bgColor = 'yellow';} 
                  else if (level < 8) { bgColor = 'orange';} 
                  else if (level < 11) {bgColor = 'red';}     
              let uviTitle = '<span>UV Index: </span>';
              let color = uviTitle + `<span style="background-color: ${bgColor}; padding: 0 7px 0 7px;">${response3.value}</span>`;
              $('#currUVI').html(color);            
              });
          });
      }
      function pulWeather(loc) {
          if (typeof loc === "object") {
              city = `lat=${loc.latitude}&lon=${loc.longitude}`;      
          } else {
              city = `q=${loc}`; }
          var currentURL = "https://api.openweathermap.org/data/2.5/weather?";
          var cityName = city;
          var unitsURL = "&units=imperial";
          var apiIdURL = "&appid="
          var key = "630e27fa306f06f51bd9ecbb54aae081";
          var openCurrWeatherAPI2 = currentURL + cityName + unitsURL + apiIdURL + key;
          $.ajax({
              url: openCurrWeatherAPI2,
              method: "GET",
          }).then(function (response4) {
          var lon = response4.coord.lon;
          var lat = response4.coord.lat;
          city = `lat=${lat}&lon=${lon}`;
          let arr = [];
          let obj = {};
          var currentURL = "https://api.openweathermap.org/data/2.5/onecall?";
          var cityName = city;
          var exclHrlURL = "&exclude=hourly";
          var unitsURL = "&units=imperial";
          var apiIdURL = "&appid=";
          var key = "630e27fa306f06f51bd9ecbb54aae081";
          var openFcstWeatherAPI = currentURL + cityName + exclHrlURL + unitsURL + apiIdURL + key;
          $.ajax({
              url: openFcstWeatherAPI,
              method: "GET"
          }).then(function (response2) {
            for (let i=1; i < (response2.daily.length-2); i++) {
              let cur = response2.daily[i]
              obj = {
                  weather: cur.weather[0].description,
                  icon: `http://openweathermap.org/img/w/${cur.weather[0].icon}.png`,
                  minTemp: Math.round(cur.temp.min),
                  maxTemp: Math.round(cur.temp.max),
                  humidity: cur.humidity,
                  uvi: cur.uvi,
                  date: (convertTimestampe(cur.dt))
              }
              arr.push(obj);
            }
            for (let i = 0; i < arr.length; i++) {
              let $colmx1 = $('<div class="col mx-1">');
              let $cardBody = $('<div class="card-body forecast-card">');
              let $cardTitle = $('<h6 class="card-title">');
              $cardTitle.text(arr[i].date);
              let $ul = $('<ul>'); 
              let $iconLi = $('<li>');
              let $iconI = $('<img>');
              let $weathLi = $('<li>');
              let $tempMaxLi = $('<li>');
              let $tempMinLi = $('<li>');
              let $humLi = $('<li>');
              $iconI.attr('src', arr[i].icon);
              $weathLi.text(arr[i].weather);                
              $tempMaxLi.text('Temp High: ' + arr[i].maxTemp + " °F");
              $tempMinLi.text('Temp Low: ' + arr[i].minTemp + " °F");
              $humLi.text('Humidity: ' + arr[i].humidity + "%");
              $iconLi.append($iconI);
              $ul.append($iconLi);
              $ul.append($weathLi);         
              $ul.append($tempMaxLi);
              $ul.append($tempMinLi);
              $ul.append($humLi);
              $cardTitle.append($ul);
              $cardBody.append($cardTitle);
              $colmx1.append($cardBody);
              $('#forecast').append($colmx1);
            }
          });
        });        
      }
      var location = establishCurrLoc();
    });