const axios = require('axios');
const faker = require('faker');
const fs = require('fs');
const get = require('lodash/get');
const DB = require("./services/db");
const categoriesModel = require("./models/categories");
const authorsModel = require("./models/author");



const searchWord = "ship";

// axios.get(baseUrl).then(resp => {
//     const 
//     fs.writeFile('myjsonfile.json', JSON.stringify(resp.data, null, 4), () => null);
// })

const token = "AIzaSyDpdr4HCcHkmXOb4sFRCpv_Qr6lFVAgiX0";

(async function fetchBooks() {
    const jsonBooks = fs.readFileSync("books.json");
    const existingBooks = JSON.parse(jsonBooks);
    const booksObj = {};
    let startIndex = 0;
    let totalItems = 0;

    do {
        const booksResp = await axios.get(`https://www.googleapis.com/books/v1/volumes?q=${searchWord}&projection=full&filter=paid-ebooks&maxResults=40&startIndex=${startIndex}&key=${token}`);

        totalItems = booksResp.data.totalItems;
        startIndex += 40;

        const filteredList = get(booksResp, "data.items", []).filter(({ id, volumeInfo }) => (volumeInfo.language === "en" && volumeInfo.description && !(id in existingBooks)));
        filteredList.forEach(({ id, volumeInfo, saleInfo }) => {
            booksObj[id] = {
                title: volumeInfo.title,
                publisher: volumeInfo.publisher,
                authors: get(volumeInfo, "authors", []),
                printType: volumeInfo.printType,
                imageLinks: get(volumeInfo, "imageLinks.thumbnail", null),
                previewLink: volumeInfo.previewLink,
                amount: get(saleInfo, "listPrice.amount", 120.00),
                pageCount: volumeInfo.pageCount,
                categories: get(volumeInfo, "categories", []),
                averageRating: get(volumeInfo, "averageRating", 1),
            }
        });
        console.log(startIndex, totalItems);
    } while (startIndex < totalItems);

    fs.writeFileSync('books.json', JSON.stringify({
        ...existingBooks,
        ...booksObj,
    }, null, 4));
    console.log(`added ${Object.keys(booksObj).length} new books. Total books:${Object.keys(booksObj).length + Object.keys(existingBooks).length}`);
});

(function getAuthors() {
    const jsonBooks = fs.readFileSync("books.json");
    const existingBooks = JSON.parse(jsonBooks);

    const newValues= Object.keys(existingBooks).slice(0, 600).reduce((acc, key) => {
        return acc.concat([...existingBooks[key].authors]);
      }, []);

    const aniqAuthorsSet = new Set(newValues);
    const listOfAuthors = Array.from(aniqAuthorsSet);

    const correctList = listOfAuthors.map(author => ({ name: author, description: faker.lorem.sentences() }));

    fs.writeFileSync('authors.json', JSON.stringify(correctList, null, 4));
    console.log(`Writed ${correctList.length} authors`);
});

(function getCategories() {
    const jsonBooks = fs.readFileSync("books.json");
    const existingBooks = JSON.parse(jsonBooks);

    const newValues= Object.keys(existingBooks).slice(0, 600).reduce((acc, key) => {
        return acc.concat([...existingBooks[key].categories]);
      }, []);

    const aniqCategoriesSet = new Set(newValues);
    const listOfCategories = Array.from(aniqCategoriesSet);

    const correctList = listOfCategories.map(category => ({ title: category }));

    fs.writeFileSync('categories.json', JSON.stringify(correctList, null, 4));
    console.log(`Writed ${correctList.length} categories`);
});

(async function pushCategoriesToDB() {
    const categoriesFromFile = fs.readFileSync("categories.json");
    const jsonCategories = JSON.parse(categoriesFromFile);

    return await DB("Categories").insert(jsonCategories);
});

(async function pushAuthorsToDB() {
    try {
        const categoriesFromFile = fs.readFileSync("authors.json");
        const jsonCategories = JSON.parse(categoriesFromFile);
    
        return await DB("Authors").insert(jsonCategories).returning("*");
    } catch (e) {
        console.log(e)
    }
});

(async function pushBooksToDB() {
    try {
        const categoriesFromFile = fs.readFileSync("books.json");
        const jsonCategories = JSON.parse(categoriesFromFile);
        const keys = Object.keys(jsonCategories).slice(0, 600);

        for (key of keys) {
            try {
                const { categories,  authors, ...fields } = jsonCategories[key];
                const [book] = await DB("Books").insert({
                    title: fields.title,
                    description: faker.lorem.sentences(),
                    shortDescription: faker.lorem.text().slice(0 , 20),
                    printType: fields.printType,
                    thumbnailLink: fields.imageLinks,
                    previewLink: fields.previewLink,
                    amount: fields.amount,
                    averageRating: fields.averageRating,
                    pageCount: fields.pageCount,
                }).returning("*");
    
                if (categories) {
                    const categoriesList = await categoriesModel.getCategoryByTitlesList(categories);
                    Promise.all(categoriesList.map(async (category) => {
                        return DB("Books_Categories").insert({ book_id: book.id, category_id: category.id }).returning("*");
                    }));
                }
            
                if (authors) {
                    const authorsList = await authorsModel.getAuthorsByName(authors);
                    Promise.all(authorsList.map(async (author) => {
                        return DB("Books_Authors").insert({ book_id: book.id, author_id: author.id }).returning("*");
                    }));
                }

                console.log(`book created ${book.title} - ${book.id}`)
            } catch (e) {
                console.log("Error on creting new book", e)
            }
        }
        console.log("finished")
        // return await DB("Authors").insert(jsonCategories).returning("*");
    } catch (e) {
        console.log(e)
    }
});


(async function bropBooksDB() {
    try {
        const booksList = await DB("Books").select("id").limit(700);
        const result = await DB("Books").delete().whereIn("id", booksList.map(item => item.id));
        console.log(result);
        
        return;
    } catch (e) {
        console.log(e)
    }
});
