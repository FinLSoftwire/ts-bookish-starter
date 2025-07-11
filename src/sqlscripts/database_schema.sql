CREATE TABLE Book (
                      ISBN varchar(13) NOT NULL PRIMARY KEY,
                      Title varchar(255) NOT NULL,
                      PageCount integer,
                      CHECK(PageCount > 0)
);
CREATE TABLE Loaner (
                        UserID integer NOT NULL PRIMARY KEY,
                        FirstName varchar(30) NOT NULL,
                        LastName varchar(30) NOT NULL
);
CREATE TABLE Author (
                        AuthorID integer NOT NULL PRIMARY KEY,
                        FirstName varchar(30),
                        LastName varchar(30)
);
CREATE TABLE Stock (
                       ISBN varchar(13) NOT NULL UNIQUE,
                       StockCount integer DEFAULT 0,
                       FOREIGN KEY(ISBN) REFERENCES Book(ISBN),
                       CHECK(StockCount > 0)
);
CREATE TABLE Loan (
                      ISBN varchar(13) NOT NULL,
                      UserID integer NOT NULL,
                      StartDate date NOT NULL,
                      DueDate date NOT NULL,
                      FOREIGN KEY(ISBN) REFERENCES Book(ISBN),
                      FOREIGN KEY(UserID) REFERENCES Loaner(UserID)
);
CREATE TABLE BookAuthor (
                            AuthorID integer NOT NULL,
                            ISBN varchar(13) NOT NULL,
                            FOREIGN KEY(AuthorID) REFERENCES Author(AuthorID),
                            FOREIGN KEY(ISBN) REFERENCES Book(ISBN),
                            CONSTRAINT AuthorAtomicity UNIQUE (AuthorID,ISBN)
);