DROP DATABASE TaskieDB
CREATE DATABASE TaskieDB
USE TaskieDB


-- Table: Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the user
    Email NVARCHAR(255) NOT NULL UNIQUE, -- User's email address (must be unique)
    PasswordHash NVARCHAR(255) NOT NULL, -- Hashed password for security
    FullName NVARCHAR(255) NOT NULL, -- User's full name
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the user was created
	Role NVARCHAR(50) NOT NULL DEFAULT 'User'
);

-- Table: Board
CREATE TABLE Boards (
    BoardID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the board
    UserID INT NOT NULL, -- ID of the user who owns the board
    BoardName NVARCHAR(255) NOT NULL, -- Name of the board
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the board was created
    CONSTRAINT FK_Board_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) -- Foreign key to link board to user
);

-- Table: List
CREATE TABLE Lists (
    ListID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the list
    BoardID INT NOT NULL, -- ID of the board the list belongs to
    ListName NVARCHAR(255) NOT NULL, -- Name of the list
    Position INT NOT NULL, -- Order of the list within the board
    CONSTRAINT FK_List_Board FOREIGN KEY (BoardID) REFERENCES Board(BoardID) -- Foreign key to link list to board
);

-- Table: Card
CREATE TABLE Cards (
    CardID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the Card
    ListID INT NOT NULL, -- ID of the list the Card belongs to
    CardName NVARCHAR(255) NOT NULL, -- Name of the Card
    Description NVARCHAR(MAX), -- Card description (optional)
    DueDate DATE, -- Due date (optional)
    Status NVARCHAR(50) CHECK (Status IN ('To Do', 'In Progress', 'Done')) NOT NULL, -- Card status
    Position INT NOT NULL DEFAULT 0, -- Order of the Card within the list
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the Card was created
    CONSTRAINT FK_Card_List FOREIGN KEY (ListID) REFERENCES List(ListID) -- Foreign key to link Card to list
);

-- Table: Comment (Updated)
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the comment
    CardID INT NOT NULL, -- ID of the Card the comment belongs to
    UserID INT NOT NULL, -- ID of the user who wrote the comment
    Content NVARCHAR(MAX) NOT NULL, -- Comment content
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the comment was created
    CONSTRAINT FK_Comment_Card FOREIGN KEY (CardID) REFERENCES Card(CardID) ON DELETE NO ACTION, -- Prevent cascade delete
    CONSTRAINT FK_Comment_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE NO ACTION -- Prevent cascade delete
);

-- Indexes for faster queries
CREATE INDEX IX_Board_UserID ON Board(UserID); -- Speed up fetching a user's boards
CREATE INDEX IX_List_BoardID ON List(BoardID); -- Speed up fetching lists for a board
CREATE INDEX IX_Card_ListID_Position ON Card(ListID, Position); -- Speed up fetching Cards for a list, ordered by position

-- Queries to select all data from each table
SELECT * FROM Users;
SELECT * FROM Boards;
SELECT * FROM Lists;
SELECT * FROM Cards;
SELECT * FROM Comments;

UPDATE Users SET Role = 'Admin'
WHERE UserID = 1
