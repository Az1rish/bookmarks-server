const path = require('path')
const express = require('express')
const xss = require('xss')
const { isWebUri } = require('valid-url')
const bookmarkRouter = express.Router()
const bodyParser = express.json()
const logger = require('./logger')
const BookmarksService = require('./bookmarks-service')

const serializeBookmark = bookmark => ({
    id: bookmark.id,
    title: xss(bookmark.title),
    url: bookmark.url,
    description: xss(bookmark.description),
    rating: bookmark.rating,
})

bookmarkRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        BookmarksService.getAllBookmarks(knexInstance)
            .then(bookmarks => {
                res.json(bookmarks.map(serializeBookmark))
            })
            .catch(next)
    })
    .post(bodyParser, (req, res, next) => {
        for (const field of ['title', 'url', 'rating']) {
            if (!req.body[field]) {
                logger.error(`${field} is required`)
                return res.status(400).json({
                    error: { message: `Missing '${field}' in request body` }
                })
            }
        }

        const { title, url, rating, description } = req.body

        const ratingNumber = Number(rating)

        if (!Number.isInteger(ratingNumber) || ratingNumber < 0 || ratingNumber > 5) {
            logger.error(`Invalid rating '${rating}' supplied`)
            return res.status(400).json({
                error: { message: `'rating' must be a number between 0 and 5`}
            })
        }

        if (!isWebUri(url)) {
            logger.error(`Invalid url '${url}' supplied`)
            return res.status(400).json({
                error: { message: `'url' must be a valid URL`}
            })
        }

        const newBookmark = { title, url, rating, description }

        BookmarksService.insertBookmark(
            req.app.get('db'),
            newBookmark
        )
            .then(bookmark => {
                logger.info(`Bookmark with id ${bookmark.id} created`)
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
                    .json(serializeBookmark(bookmark))
            })
            .catch(next)
    })
   

bookmarkRouter
    .route('/:id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { id } = req.params
        
        BookmarksService.getById(knexInstance, id)
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
                res.bookmark = bookmark
                next()
            })
            .catch(next)
    })
    .get((req, res, next) => {
        res.json(serializeBookmark(res.bookmark))
    })
    .delete((req, res, next) => {
        const knexInstance = req.app.get('db')
        const { id } = req.params
        
        BookmarksService.deleteBookmark(knexInstance, id)
            .then(() => {
                logger.info(`Bookmark with id ${id} deleted.`)
                res.status(204).end()
            })
            .catch(next)
    })
    .patch(bodyParser, (req, res, next) => {
        const { title, url, description, rating } = req.body
        const bookmarkToUpdate = { title, url, description,rating }
        const knexInstance = req.app.get('db')
        const { id } = req.params

        BookmarksService.updateBookmark(
            knexInstance,
            id,
            bookmarkToUpdate
        )
            .then(numRowsAffected => {
                logger.info(`Bookmark with id ${id} updated`)
                res.status(204).end()
            })
            .catch(next)
    })

module.exports = bookmarkRouter