var formatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

$(document).ready(() => {
  $("#output-table").css("visibility", "hidden");
  $("#submit").click(() => {
    var config = {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: ";",
      quoteChar: '"',
      complete: (results, file) => {
        console.log("Parsing complete:", results, file);
        var filter = $("#filterText").val();
        var fromDate = $("#fromDate").val();
        var toDate = $("#toDate").val();
        fromDate = moment(fromDate, "YYYY-MM-DD");
        toDate = moment(toDate, "YYYY-MM-DD");
        console.log(results.data);
        processData(results.data, filter, fromDate, toDate);
      },
      encoding: "utf-8",
    };

    $("#csvFile").parse({
      config: config,
      before: (file, inputElem) => {
        console.log("Parsing file...", file);
      },
      error: (err, file) => {
        console.log("ERROR:", err, file);
        firstError = firstError || err;
        errorCount++;
      },
    });
  });

  $("#csvFile").bind("change", function () {
    var fileName = "";
    fileName = $(this).val().replace("C:\\fakepath\\", "");
    $("#file-selected").html(fileName);
  });

  $("#csvFile").bind("change", () => {
    var config = {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: ";",
      quoteChar: '"',
      complete: (results) => {
        getHeaders(results);
      },
      encoding: "utf-8",
    };

    $("#csvFile").parse({
      config: config,
      before: (file, inputElem) => {
        console.log("Parsing file for headers...", file);
      },
      error: (err, file) => {
        console.log("ERROR:", err, file);
        firstError = firstError || err;
        errorCount++;
      },
    });
  });

  $(document).ready(() => {
    if ($("#csvFile").get(0).files.length > 0) {
      var config = {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: ";",
        quoteChar: '"',
        complete: (results) => {
          getHeaders(results);
        },
        encoding: "utf-8",
      };

      $("#csvFile").parse({
        config: config,
        before: (file, inputElem) => {
          console.log("Parsing file for headers...", file);
        },
        error: (err, file) => {
          console.log("ERROR:", err, file);
          firstError = firstError || err;
          errorCount++;
        },
      });
    }
  });

  if ($("#csvFile").get(0).files.length > 0) {
    var fileName = "";
    fileName = $("#csvFile").val().replace("C:\\fakepath\\", "");
    $("#file-selected").html(fileName);
  }

  $("#fromDate").flatpickr({
    altInput: true,
    altFormat: "d-m-Y",
    dateFormat: "Y-m-d",
    maxDate: "today",
  });

  $("#toDate").flatpickr({
    altInput: true,
    altFormat: "d-m-Y",
    dateFormat: "Y-m-d",
    maxDate: "today",
  });
});

function getHeaders(results) {
  var selectIdArray = ["nameSelect", "amountSelect", "dateSelect"];

  selectIdArray.forEach((select) => {
    $.each(results.meta["fields"], (i) => {
      $("#" + select).append(
        $("<option>", {
          value: results.meta["fields"][i],
          text: results.meta["fields"][i],
        })
      );
    });
  });
}

function printData(resultsArray, totalAmount) {
  totalAmount = formatter.format(totalAmount);
  $("#output-table").css("visibility", "visible");
  $("#output-table").empty();
  $("#output-table").append("<tr><th>Name</th><th>Amount</th><th>Date</th></th>");
  resultsArray.forEach((result) => {
    result.amount = formatter.format(result.amount);
    $("#output-table").append(
      "<tr>" + "<td>" + result.name + "</td>" + "<td>" + result.amount + "</td>" + "<td>" + result.date + "</td>" + "</tr>"
    );
  });

  $("#output-table").append("<tr>" + "<td><b>Total</b></td>" + "<td colspan='2'><b>" + totalAmount + "</b></td>" + "</tr>");
}

function processData(array, filter, fromDate, toDate) {
  var resultsArray = [];
  var totalAmount = 0.0;
  var nameField = $("#nameSelect").val();
  var amountField = $("#amountSelect").val();
  var dateField = $("#dateSelect").val();

  array.forEach((transaction) => {
    var name = transaction[nameField];
    var nameRegEx = new RegExp(filter, "i");
    if (transaction[amountField].indexOf(",") != -1) {
      var amount = parseFloat(transaction[amountField].replace(",", "."));
    } else {
      var amount = parseFloat(transaction[amountField]);
    }
    var date = moment(transaction[dateField], "YYYY-MM-DD");
    var afBij = transaction["Af Bij"];
    var formattedDate = moment(date).format("DD/MM/YYYY");

    if (filter && (!fromDate || !toDate) && afBij == "Af") {
      if (nameRegEx.test(name) && afBij == "Af") {
        totalAmount += amount;
        resultsArray.push({ name: name, amount: amount, date: formattedDate });
      }
    } else if (filter && fromDate && toDate) {
      if (nameRegEx.test(name) && date >= fromDate && date <= toDate && afBij == "Af") {
        totalAmount += amount;
        resultsArray.push({ name: name, amount: amount, date: formattedDate });
      }
    } else if (!filter && (fromDate || toDate)) {
      if (date >= fromDate && date <= toDate && afBij == "Af") {
        totalAmount += amount;
        resultsArray.push({ name: name, amount: amount, date: formattedDate });
      }
    }
  });

  printData(resultsArray, totalAmount);
}
$(document).ready(function () {
  var base_color = "rgb(230,230,230)";
  var active_color = "rgb(40,145,237)";

  var child = 1;
  var length = $("section").length - 1;
  $("#prev").addClass("disabled");
  $("#submit").addClass("disabled");

  $("section").not("section:nth-of-type(1)").hide();
  $("section").not("section:nth-of-type(1)").css("transform", "translateX(100px)");

  var svgWidth = length * 200 + 24;
  $("#svg_wrap").html(
    '<svg version="1.1" id="svg_form_time" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 ' +
      svgWidth +
      ' 24" xml:space="preserve"></svg>'
  );

  function makeSVG(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  for (i = 0; i < length; i++) {
    var positionX = 12 + i * 200;
    var rect = makeSVG("rect", { x: positionX, y: 9, width: 200, height: 6 });
    document.getElementById("svg_form_time").appendChild(rect);
    // <g><rect x="12" y="9" width="200" height="6"></rect></g>'
    var circle = makeSVG("circle", {
      cx: positionX,
      cy: 12,
      r: 12,
      width: positionX,
      height: 6,
    });
    document.getElementById("svg_form_time").appendChild(circle);
  }

  var circle = makeSVG("circle", {
    cx: positionX + 200,
    cy: 12,
    r: 12,
    width: positionX,
    height: 6,
  });
  document.getElementById("svg_form_time").appendChild(circle);

  $("#svg_form_time rect").css("fill", base_color);
  $("#svg_form_time circle").css("fill", base_color);
  $("circle:nth-of-type(1)").css("fill", active_color);

  $(".button").click(function () {
    $("#svg_form_time rect").css("fill", active_color);
    $("#svg_form_time circle").css("fill", active_color);
    var id = $(this).attr("id");
    if (id == "next") {
      $("#prev").removeClass("disabled");
      if (child >= length) {
        $(this).addClass("disabled");
        $("#submit").removeClass("disabled");
      }
      if (child <= length) {
        child++;
      }
    } else if (id == "prev") {
      $("#next").removeClass("disabled");
      $("#submit").addClass("disabled");
      if (child <= 2) {
        $(this).addClass("disabled");
      }
      if (child > 1) {
        child--;
      }
    }
    var circle_child = child + 1;
    $("#svg_form_time rect:nth-of-type(n + " + child + ")").css("fill", base_color);
    $("#svg_form_time circle:nth-of-type(n + " + circle_child + ")").css("fill", base_color);
    var currentSection = $("section:nth-of-type(" + child + ")");
    currentSection.fadeIn();
    currentSection.css("transform", "translateX(0)");
    currentSection.prevAll("section").css("transform", "translateX(-100px)");
    currentSection.nextAll("section").css("transform", "translateX(100px)");
    $("section").not(currentSection).hide();
  });
});
