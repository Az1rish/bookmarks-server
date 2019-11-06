require('dotenv').config()
const { expect } = require('chai')
const knex = require('knex')
const app = require('../src/app')
const { makeBookmarksArray, makeMaliciousBookmark } = require('./bookmarks.fixtures')

describe('Bookmarks Endpoints', function() {
    let db
    
    before('make knex instance', () => {
        db = knex({
            client: 'pg',
            connection: process.env.TEST_DB_URL,
        })
        app.set('db', db)
    })

    after('disconnect from db', () => db.destroy())

    before('clean the table', () => db('bookmarks').truncate())

    afterEach('cleanup', () => db('bookmarks').truncate())

    describe('GET /bookmarks', () => {
        context('Given no bookmarks', () => {
            it(`responds with 200 and an empty list`, () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, [])
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
    
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and all of the bookmarks', () => {
                return supertest(app)
                    .get('/bookmarks')
                    .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, testBookmarks)
            })
        })
    })

    describe('GET /bookmarks/:id', () => {
        context('Given no bookmarks', () => {
            it('responds with 404', () => {
                const bookmarkId = 123456
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                    .expect(404, { error: { message: `Bookmark doesn't exist` } })
            })
        })

        context('Given there are bookmarks in the database', () => {
            const testBookmarks = makeBookmarksArray()
    
            beforeEach('insert bookmarks', () => {
                return db
                    .into('bookmarks')
                    .insert(testBookmarks)
            })

            it('responds with 200 and the specified bookmark', () => {
                const bookmarkId = 2
                const expectedBookmark = testBookmarks[bookmarkId - 1]
                return supertest(app)
                    .get(`/bookmarks/${bookmarkId}`)
                    .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                    .expect(200, expectedBookmark)
            })
        })
    })
    
    describe.only('POST /bookmarks', () => {
        it(`creates a bookmark, responding with 201 and the new bookmark`, function() {
            const newBookmark = {
                title: "New Test title",
                url: "http://www.NewTestUrl.com",
                description: "New test description...",
                rating: "2"
            }
            return supertest(app)
                .post('/bookmarks')
                .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                .send(newBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(newBookmark.title)
                    expect(res.body.url).to.eql(newBookmark.url)
                    expect(res.body.description).to.eql(newBookmark.description)
                    expect(res.body.rating).to.eql(newBookmark.rating)
                    expect(res.body).to.have.property('id')
                    expect(res.headers.location).to.eql(`/bookmarks/${res.body.id}`)
                })
                .then(postRes => 
                    supertest(app)
                        .get(`/bookmarks/${postRes.body.id}`).set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                        .expect(postRes.body)
                )
        })

        const requiredFields = ['title', 'url', 'rating']

        requiredFields.forEach(field => {
            const newBookmark = {
                title: "New Test title",
                url: "http://www.NewTestUrl.com",
                rating: "2"
            }

            it(`responds with 400 and an error message when the '${field}' is missing`, () => {
                delete newBookmark[field]

                return supertest(app)
                    .post('/bookmarks')
                    .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                    .send(newBookmark)
                    .expect(400, {
                        error: { message: `Missing '${field}' in request body`}
                    })
            })
        })

        it('removes XSS attack content from response', () => {
            const { maliciousBookmark, expectedBookmark } = makeMaliciousBookmark()
            return supertest(app)
                .post('/bookmarks')
                .set(`Authorization`, `Bearer ${process.env.API_TOKEN}`)
                .send(maliciousBookmark)
                .expect(201)
                .expect(res => {
                    expect(res.body.title).to.eql(expectedBookmark.title)
                    expect(res.body.url).to.eql(expectedBookmark.url)
                    expect(res.body.description).to.eql(expectedBookmark.description)
                    expect(res.body.rating).to.eql(expectedBookmark.rating)
                })
        })
    })

})