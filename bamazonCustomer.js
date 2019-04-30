var inquirer = require("inquirer");
var mysql = require("mysql");
var productID;
var purchaseQty;
var stockQty;
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "Bballdough1!",
    database: "bamazon"
  });
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    askQuestions();
  });
  function askQuestions() {
      inquirer.prompt([
        {
            type: "input",
            message: "What is the ID of the product you would like to buy?",
            name: "productID"
          },
          {
            type: "input",
            message: "How many units would you like to purchase?",
            name: "purchaseQty"
          }
      ]).then(function(response) {
          productID = response.productID;
          purchaseQty = response.purchaseQty;
          console.log(`You would like to purchase ${purchaseQty} units of the item with ID ${productID}`);
          checkDB();
        });
  }
  function checkDB() {
      console.log("Check Database");
      connection.query("SELECT * FROM products WHERE ?",
      {
          item_id: productID
      },
      function(err,res) {
        if (err) throw err;
        stockQty = res[0].stock_quantity;
        console.log(stockQty);
        checkQty();
      });
  }
  function checkQty() {
    if (stockQty < purchaseQty) {
        console.log("Insufficient quantity!");
    } else {
        console.log("There is enough left in stock!");
        updateDB();
    }
  }
  function updateDB() {
    connection.query(
        "UPDATE products SET ? WHERE ?",
        [
          {
            stock_quantity: stockQty - purchaseQty
          },
          {
            item_id: productID
          }
        ],
        function(error) {
          if (error) throw err;
          console.log(`Purchase complete! You purchased ${purchaseQty} of item with ID ${productID}. There are ${stockQty - purchaseQty} left in stock.`);
          connection.end();
        }
      );
  }