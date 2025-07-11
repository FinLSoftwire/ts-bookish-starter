import { Router, Request, Response } from 'express';
import { Connection, Request as tdRequest } from 'tedious';
import Book from '../resources/Book';

class BookController {
    router: Router;
    config;
    connection;
    constructor() {
        this.config = {
            server: 'localhost',
            authentication: {
                type: 'default',
                options: {
                    userName: 'bookishuser',
                    password: 'NewPassword12!',
                },
            },
            options: {
                database: 'bookish',
                port: 1434,
                trustServerCertificate: true,
            },
        };
        this.connection = new Connection(this.config);
        this.connection.on('connect', function (err) {
            if (err) {
                console.log('Error: ', err);
            } else {
                console.log('Connected!!');
            }
        });
        this.connection.connect();
        this.router = Router();
        this.router.get('/', this.getAllBooks.bind(this));
        this.router.get('/b/:isbn:title:pagecount', this.addBook.bind(this));
    }
    async retrieveAllBooksFromDB(): Promise<Book[]> {
        return new Promise((resolve, reject) => {
            const request = new tdRequest(
                'SELECT * FROM Book',
                (error, rowCount) => {
                    if (error !== undefined) {
                        console.log(
                            'Error: ' + error + ' row count ' + rowCount,
                        );
                        reject([]);
                    }
                },
            );
            const allBooks: Book[] = [];
            request.on('row', function (columns) {
                const newBook = new Book(
                    columns[0].value,
                    columns[1].value,
                    columns[2].value,
                );
                allBooks.push(newBook);
            });
            this.connection.execSql(request);
            request.on('requestCompleted', () => {
                resolve(allBooks);
            });
        });
    }
    async getAllBooks(req: Request, res: Response) {
        const retrievedBooks = await this.retrieveAllBooksFromDB();
        return res.status(200).json({
            status: 'OK',
            books: retrievedBooks,
        });
    }
    async insertNewBookIntoDB(
        ISBN: string,
        title: string,
        pageCount: number | undefined = undefined,
    ) {
        const notNullPageCount = pageCount === undefined ? 0 : pageCount;
        return new Promise((resolve, reject) => {
            const request = new tdRequest(
                'INSERT INTO Book VALUES (' +
                    ISBN +
                    ',' +
                    title +
                    ',' +
                    notNullPageCount +
                    ')',
                (error, rowCount) => {
                    if (error !== undefined) {
                        console.log(
                            'Error: ' + error + ' row count ' + rowCount,
                        );
                        reject();
                    }
                },
            );
            this.connection.execSql(request);
            request.on('requestCompleted', () => {
                resolve(ISBN);
            });
        });
    }
    async addBook(req: Request, res: Response) {
        console.log(req.params);
        if (req.params.isbn === undefined || req.params.title === undefined) {
            return res.status(500).json({
                status: 'FAIL',
                description: 'Invalid parameters for new book',
            });
        }
        const addedISBN = await this.insertNewBookIntoDB(
            req.params.isbn,
            req.params.title,
            parseInt(req.params.pagecount),
        );
        return res.status(200).json({
            status: 'OK',
            ISBN: addedISBN,
        });
    }
}
export default new BookController().router;
