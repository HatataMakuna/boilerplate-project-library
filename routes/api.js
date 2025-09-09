/*
2. You can send a POST request to /api/books with title as part of the form data to add a book. The returned response will be an object with the title and a unique _id as keys. If title is not included in the request, the returned response should be the string missing required field title.
3. You can send a GET request to /api/books and receive a JSON response representing all the books. The JSON response will be an array of objects with each object (book) containing title, _id, and commentcount properties.
4. You can send a GET request to /api/books/{_id} to retrieve a single object of a book containing the properties title, _id, and a comments array (empty array if no comments present). If no book is found, return the string no book exists.
5. You can send a POST request containing comment as the form body data to /api/books/{_id} to add a comment to a book. The returned response will be the books object similar to GET /api/books/{_id} request in an earlier test. If comment is not included in the request, return the string missing required field comment. If no book is found, return the string no book exists.
6. You can send a DELETE request to /api/books/{_id} to delete a book from the collection. The returned response will be the string delete successful if successful. If no book is found, return the string no book exists.
7. You can send a DELETE request to /api/books to delete all books in the database. The returned response will be the string complete delete successful if successful.
*/

'use strict';
const mongoose = require('mongoose');

mongoose.connect(process.env.DB.toString(), { useNewUrlParser: true, useUnifiedTopology: true });

const bookSchema = new mongoose.Schema({
  _id: {type: mongoose.Schema.Types.ObjectId, auto: true},
  title: { type: String, required: true },
  comments: { type: [String], default: [] }
});
const Book = mongoose.model('Book', bookSchema);

module.exports = function (app) {
  app.route('/api/books')
    .get(async function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      try {
        const books = await Book.find({}, '_id title comments').exec();
        const bookList = books.map(book => ({
          _id: book._id,
          title: book.title,
          // if comments is undefined, default to 0
          commentcount: book.comments ? book.comments.length : 0
        }));
        res.json(bookList);
      } catch (error) {
        res.status(500).send('Error retrieving books');
      }
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      //response will contain new book object including atleast _id and title
      if (!title) {
        return res.json({error: 'missing required field title'});
      }
      const newBook = new Book({ title: title });
      try {
        const savedBook = await newBook.save();
        res.json({ _id: savedBook._id, title: savedBook.title });
      } catch (error) {
        res.status(500).send('Error saving book');
      }
    })

    .delete(async function(req, res){
      try {
        await Book.deleteMany({});
        res.send('complete delete successful');
      } catch (error) {
        res.status(500).send('Error deleting books');
      }
    });

  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      // Check for id
      if (!bookid) {
        return res.status(200).json({ error: 'missing required field id' });
      }
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        const book = await Book.findById(bookid).exec();
        if (!book) return res.status(200).json({ error: 'no book exists' });
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (error) {
        res.status(500).send('Error retrieving book');
      }
    })

    .post(async function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      //json res format same as .get
      if (!comment) {
        return res.status(200).json({ error: 'missing required field comment' });
      }
      try {
        const book = await Book.findByIdAndUpdate(bookid, { $push: { comments: comment } }, { new: true }).exec();
        if (!book) return res.status(200).json({ error: 'no book exists' });
        res.json({ _id: book._id, title: book.title, comments: book.comments });
      } catch (error) {
        res.status(500).send('Error adding comment');
      }
    })

    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      try {
        const book = await Book.findByIdAndDelete(bookid).exec();
        if (!book) return res.status(200).json({ error: 'no book exists' });
        res.json({ message: 'delete successful' });
      } catch (error) {
        res.status(500).send('Error deleting book');
      }
   });
};
