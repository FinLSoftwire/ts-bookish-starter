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
        this.router.get('/:id', this.addBook.bind(this));
    }
    async retrieveBooks(): Promise<Book[]> {
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
        // TODO: implement functionality
        const retrievedBooks = await this.retrieveBooks();
        return res.status(200).json({
            status: 'OK',
            books: retrievedBooks,
        });
    }
    async addBook(req: Request, res: Response) {
        return res.status(200).json({
            status: 'OK',
        });
    }
}
export default new BookController().router;
