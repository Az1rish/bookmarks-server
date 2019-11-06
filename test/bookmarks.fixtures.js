function makeBookmarksArray() {
    return [
        {
            id: 1,
            title: 'First test bookmark!',
            url: 'www.site1.com',
            description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            rating: '1'
        },
        {
            id: 2,
            title: 'Second test bookmark!',
            url: 'www.site2.com',
            description: 'Lorem ipsum part two dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            rating: '2'
        },
        {
            id: 3,
            title: 'Third test bookmark!',
            url: 'www.site3.com',
            description: 'Lorem ipsum part three dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            rating: '3'
        },
        {
            id: 4,
            title: 'Fourth test bookmark!',
            url: 'www.site4.com',
            description: 'Lorem ipsum part four dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            rating: '4'
        },
        {
            id: 5,
            title: 'Fifth test bookmark!',
            url: 'www.site5.com',
            description: 'Lorem ipsum part five dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
            rating: '5'
        },
    ];
}

function makeMaliciousBookmark() {
    const maliciousBookmark = {
      id: 911,
      url: 'http://www.google.com',
      rating: '2',
      title: 'Naughty naughty very naughty <script>alert("xss");</script>',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`
    }
    const expectedBookmark = {
      ...maliciousBookmark,
      title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
      description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`
    }
    return {
      maliciousBookmark,
      expectedBookmark,
    }
  }

module.exports = {
    makeBookmarksArray,
    makeMaliciousBookmark,
}