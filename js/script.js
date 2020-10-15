var formatter = new Intl.NumberFormat("nl-NL", {
  style: "currency",
  currency: "EUR",
});

$(document).ready(function () {
  $("#output-table").css("visibility", "hidden");
  $("#upload").click(function (e) {
    var config = {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: ";",
      quoteChar: '"',
      complete: function (results, file) {
        console.log("Parsing complete:", results, file);
        var filter = $("#filterText").val();
        var fromDate = $("#fromDate").val();
        var toDate = $("#toDate").val();
        fromDate = moment(fromDate, "YYYY-MM-DD");
        toDate = moment(toDate, "YYYY-MM-DD");

        processData(results.data, filter, fromDate, toDate);
      },
      encoding: "utf-8",
    };

    $("#csvFile").parse({
      config: config,
      before: function (file, inputElem) {
        console.log("Parsing file...", file);
      },
      error: function (err, file) {
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

  $("#csvFile").bind("change", function () {
    var config = {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      delimiter: ";",
      quoteChar: '"',
      complete: function (results) {
        getHeaders(results);
      },
      encoding: "utf-8",
    };

    $("#csvFile").parse({
      config: config,
      before: function (file, inputElem) {
        console.log("Parsing file for headers...", file);
      },
      error: function (err, file) {
        console.log("ERROR:", err, file);
        firstError = firstError || err;
        errorCount++;
      },
    });
  });

  $(document).ready(function () {
    if ($("#csvFile").get(0).files.length > 0) {
      var config = {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
        delimiter: ";",
        quoteChar: '"',
        complete: function (results) {
          getHeaders(results);
        },
        encoding: "utf-8",
      };

      $("#csvFile").parse({
        config: config,
        before: function (file, inputElem) {
          console.log("Parsing file for headers...", file);
        },
        error: function (err, file) {
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

  var fromDatepicker = $("#fromDate").flatpickr({
    altInput: true,
    altFormat: "d-m-Y",
    dateFormat: "Y-m-d",
    maxDate: "today",
    onClose: (selectedDates, dateStr, instance) => {
      toDatepicker.set("minDate", dateStr);
    },
    onChange: () => {
      toDatepicker.open();
    },
  });

  var toDatepicker = $("#toDate").flatpickr({
    altInput: true,
    altFormat: "d-m-Y",
    dateFormat: "Y-m-d",
    maxDate: "today",
  });
});

function getHeaders(results) {
  var selectIdArray = ["nameSelect", "amountSelect", "dateSelect"];

  selectIdArray.forEach((select) => {
    $.each(results.meta["fields"], function (i) {
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
