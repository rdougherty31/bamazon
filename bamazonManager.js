var inquirer = require("inquirer");
var mysql = require("mysql");
var stock_quantity;
var productName;
var inventoryIncrease;
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon"
  });
  connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    menuOptions();
  });
  //list a set of menu options
  function menuOptions() {}
  inquirer
    .prompt({
      name: "menuOptions",
      type: "list",
      message: "What would you like to do?",
      choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory","Add New Product","Exit"]
    })
    .then(function(answer) {
      // based on their answer, either call the bid or the post functions
      if (answer.menuOptions === "View Products for Sale") {
        productsForSale();
      }
      else if(answer.menuOptions === "View Low Inventory") {
        lowInventory();
      } else if (answer.menuOptions === "Add to Inventory") {
        addInventory();
      } else if (answer.menuOptions === "Add New Product") {
        addProduct();
      } else{
        connection.end();
      }
    });
  //view products for sale
  //list every available item with IDs, names, prices, & quantities
  function productsForSale() {
    console.log("products for sale fxn");
    connection.query("SELECT * FROM products",function(err, res){
        if (err) throw err;
        for (var i=0; i<res.length;i++) {
            console.log(`Product Name: ${res[i].product_name}`);
            console.log(`Department Name: ${res[i].department_name}`);
            console.log(`Selling Price: $${res[i].price}`);
            console.log(`Quantity in Stock: ${res[i].stock_quantity}`);
            console.log("---------------------");
        }
    });
  }

  //view low inventory
  //display prompt to allow manager to add more of any item currently in the store
  function lowInventory() {
    console.log("low inventory fxn");
    connection.query("SELECT * FROM products WHERE stock_quantity<5",function(err, res){
        if (err) throw err;
        for (var i=0; i<res.length;i++) {
            console.log(`Product Name: ${res[i].product_name}`);
            console.log(`Department Name: ${res[i].department_name}`);
            console.log(`Selling Price: $${res[i].price}`);
            console.log(`Quantity in Stock: ${res[i].stock_quantity}`);
            console.log("---------------------");
        }
    });
  }

  //add to inventory
  //display prompt to allow manager to add more of any item currently in the store
  function addInventory() {
    console.log("add inventory fxn");
    inquirer.prompt([
        {
          name: "product_name",
          type: "input",
          message: "Please input the name of a product."
        },
        {
          name: "increaseInventory",
          type: "input",
          message: "How many units of this product would you like to add to inventory?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        }
      ]).then(function(answer) {
        productName = answer.product_name;
        inventoryIncrease = parseInt(answer.increaseInventory);
        console.log(answer);
        console.log(productName);
        console.log(inventoryIncrease);
        console.log(typeof productName);
        console.log(typeof inventoryIncrease);
        connection.query(
            "SELECT * FROM products WHERE ?", 
                {
                    product_name: productName
                }
            , function(error,res) {
            if (error) throw error;
            stock_quantity = parseInt(res[0].stock_quantity);
            console.log(res);
            console.log(inventoryIncrease);
            console.log(res[0].stock_quantity);
            console.log(stock_quantity);
            console.log(inventoryIncrease+stock_quantity);
            connection.query(
                "UPDATE products SET ? WHERE ?",
                [
                    {
                        stock_quantity: stock_quantity+inventoryIncrease
                    },
                    {
                        product_name: productName
                    }
                ], function (error,res) {
                    if (error) throw error;
                    console.log(res);
                }
            );
        });
      });
  }

  //add new product
  //allow manager to add a complete new product to the store
  function addProduct() {
    console.log("add product fxn");
    inquirer.prompt([
        {
          name: "addProduct",
          type: "input",
          message: "What is the product you would like to add?"
        },
        {
          name: "department",
          type: "input",
          message: "What department would you like to place your product in?"
        },
        {
          name: "price",
          type: "input",
          message: "What would you like its selling price to be?",
          validate: function(value) {
            if (isNaN(value) === false) {
              return true;
            }
            return false;
          }
        },
        {
            name: "inventory",
            type: "input",
            message: "How many units of this product would you like to add to inventory?",
            validate: function(value) {
                if (isNaN(value) === false) {
                  return true;
                }
                return false;
              }
        }
      ]).then(function(answer) {
        // when finished prompting, insert a new item into the db with that info
        connection.query(
          "INSERT INTO products SET ?",
          {
            product_name: answer.addProduct,
            department_name: answer.department,
            price: answer.price,
            stock_quantity: answer.inventory
          },
          function(err) {
            if (err) throw err;
            console.log("Your product was added successfully!");
            // re-prompt the user for if they want to bid or post
            menuOptions();
          }
        );
      });
  }