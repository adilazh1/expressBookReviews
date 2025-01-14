const express = require('express');
let books = require("./booksdb.js");
const jwt = require('jsonwebtoken');//is not necesary because public_user not need to login like in /costumer
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to check if the user is authenticated
const authenticatedUser = (username, password) => {
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  return validusers.length > 0;
};

// Function to check if the user exists
const doesExist = (username) => {
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  return userswithsamename.length > 0;
};


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({ "username": username, "password": password });
      return res.status(200).json({ message: "User successfully registered. Now you can login" });
    } else {
      return res.status(404).json({ message: "User already exists!" });
    }
  }
  return res.status(404).json({ message: "Unable to register user." });
});

//only registered users can login
public_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }

  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: "1h" });

    req.session.authorization = {
      accessToken, username
    };
    return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({ message: "Invalid Login. Check username and password" });
  }
});
// last code exists dans auth_users.js, but to acces to it, we need put /customer in the url. 
// And it's not necesary give acces to public users by login, only register is OK, so code of /login is not important.

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  res.send(JSON.stringify(books));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book != null){
    res.send(JSON.stringify(book));
  }else{
    res.status(300).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const targetAuthor = req.params.author;
  let foundBook = null;
  
  for (let id in books) {
    if (books[id].author === targetAuthor) {
      foundBook = books[id];
      break; 
    }
  }
  
  if (foundBook) {
    res.send(JSON.stringify(foundBook));
  } else {
    res.status(300).json({message: `Book whit author ${targetAuthor} not found`});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const targetTitle = req.params.title;
  let foundBook = null;
  
  for (let id in books) {
    if (books[id].title === targetTitle) {
      foundBook = books[id];
      break; 
    }
  }
  
  if (foundBook) {
    res.send(JSON.stringify(foundBook));
  } else {
    res.status(300).json({message: `Book whit Title ${targetTitle} not found`});
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];
  if(book != null){
    res.send(JSON.stringify(book.reviews));
  }else{
    res.status(300).json({message: "Book not found"});
  }
});

// Task 10 
// Add the code for getting the list of books available in the shop (done in Task 1) using Promise callbacks or async-await with Axios

function getBookList(){
  return new Promise((resolve,reject)=>{
    resolve(books);
  })
}

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  getBookList().then(
    (bk)=>res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send("denied")
  );  
});
// Task 11
// Add the code for getting the book details based on ISBN (done in Task 2) using Promise callbacks or async-await with Axios.

function getFromISBN(isbn){
  let book_ = books[isbn];  
  return new Promise((resolve,reject)=>{
    if (book_) {
      resolve(book_);
    }else{
      reject("Unable to find book!");
    }    
  })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  getFromISBN(isbn).then(
    (bk)=>res.send(JSON.stringify(bk, null, 4)),
    (error) => res.send(error)
  )
 });

module.exports.general = public_users;
