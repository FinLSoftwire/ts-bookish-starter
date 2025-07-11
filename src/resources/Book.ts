export default class Book {
    ISBN: string;
    title: string;
    pageCount: string;
    constructor(ISBN, title, pageCount) {
        this.ISBN = ISBN;
        this.title = title;
        this.pageCount = pageCount;
    }
}
