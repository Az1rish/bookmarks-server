const express = require('express')
const bookmarkRouter = express.Router()
const bodyParser = express.json()
const uuid = require('uuid/v4')
const logger = require('./logger')
const BookmarksService = require('./bookmarks-service')

const bookmarks = [{
    id: 1,
    title: "Google",
    url: "www.google.com",
    description: "All of your searching needs",
    rating: 5
}]

bookmarkRouter
    .route('/bookmarks')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks)
            })
            .catch(next)
    })
    .post(bodyParser, (req, res) => {
        console.log(req.body);
        const { title, url, rating, description="" } = req.body;

        if(!title) {
            logger.error('Title is required');
            return res
                .status(400)
                .send('Invalid data');
        }
        if(!url) {
            logger.error('URL is required');
            return res
                .status(400)
                .send('Invalid data');
        }
        if(!rating) {
            logger.error('Rating is required');
            return res
                .status(400)
                .send('Invalid data');
        }

        const id = uuid();
        const bookmark = {
            id,
            title,
            url,
            description,
            rating
        };

        bookmarks.push(bookmark);

        logger.info(`Bookmark with id ${id} created`);
        
        res 
            .status(201)
            .location(`http://localhost:8000/bookmark/${id}`)
            .json(bookmark);
    })

bookmarkRouter
    .route('/bookmarks/:id')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')

        BookmarksService.getById(knexInstance, req.params.id)
            .then(bookmark => {
                if (!bookmark) {
                    // make sure we found a card
                    logger.error(`Bookmark with id ${id} not found.`);
                    return res
                        .status(404)
                        .json({
                            error: {
                                message: `Bookmark doesn't exist`
                            }
                        })
                }
                res.json(bookmark)
            })
            .catch(next)
    })
    .delete((req, res) => {
        const { id } = req.params;

        const bookmarkIndex = bookmarks.findIndex(bi => bi.id == id);

        if (bookmarkIndex === -1) {
            logger.error(`Bookmark with id ${id} not found.`);
            return res
                .status(404)
                .send('Not Found');
        }

        bookmarks.splice(bookmarkIndex, 1);

        logger.info(`Bookmark with id ${id} deleted.`);
        res
            .status(204)
            .end();
    });

module.exports = bookmarkRouter