/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  let validId; // Store a valid book ID for later tests
  
  suite('Routing tests', function() {
    suite('POST /api/books with title => create book object/expect book object', function() {
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test Book' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book object should contain _id');
            assert.property(res.body, 'title', 'Book object should contain title');
            assert.equal(res.body.title, 'Test Book', 'Book title should match');
            validId = res.body._id; // Store the valid ID for later tests
            done();
          });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing required field title', 'Response should indicate missing title');
            done();
          });
      });
    });

    suite('GET /api/books => array of books', function(){
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'response should be an array');
            assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
            assert.property(res.body[0], 'title', 'Books in array should contain title');
            assert.property(res.body[0], '_id', 'Books in array should contain _id');
            done();
          });
      });
    });

    suite('GET /api/books/[id] => book object with [id]', function(){
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/64a7f0f4e4b0c8b1c8e4d1a1') // Assuming this ID does not exist
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no book exists', 'Response should indicate no book exists');
            done();
          });
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get(`/api/books/${validId}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book object should contain _id');
            assert.property(res.body, 'title', 'Book object should contain title');
            assert.property(res.body, 'comments', 'Book object should contain comments');
            done();
          });
      });
    });

    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post(`/api/books/${validId}`)
          .send({ comment: 'Test Comment' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.isObject(res.body, 'response should be an object');
            assert.property(res.body, '_id', 'Book object should contain _id');
            assert.property(res.body, 'title', 'Book object should contain title');
            assert.property(res.body, 'comments', 'Book object should contain comments');
            assert.include(res.body.comments, 'Test Comment', 'Comment should be added');
            done();
          });
      });

      test('Test POST /api/books/[id] without comment field', function(done){
        chai.request(server)
          .post(`/api/books/${validId}`)
          .send({ })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'missing required field comment', 'Response should indicate missing comment');
            done();
          });
      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai.request(server)
          .post('/api/books/64a7f0f4e4b0c8b1c8e4d1a1')
          .send({ comment: 'Test Comment' })
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no book exists', 'Response should indicate no book exists');
            done();
          });
      });
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        chai.request(server)
          .delete(`/api/books/${validId}`)
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.message, 'delete successful', 'Response should indicate successful deletion');
            done();
          });
      });

      test('Test DELETE /api/books/[id] with id not in db', function(done){
        chai.request(server)
          .delete('/api/books/64a7f0f4e4b0c8b1c8e4d1a1')
          .end(function(err, res){
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no book exists', 'Response should indicate no book exists');
            done();
          });
      });
    });
  });
});
