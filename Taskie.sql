DROP DATABASE IF EXISTS TaskieDB
GO
CREATE DATABASE TaskieDB
GO
USE TaskieDB
GO

-- Table: Users
CREATE TABLE Users (
    UserID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the user
    Email NVARCHAR(255) NOT NULL UNIQUE, -- User's email address (must be unique)
    PasswordHash NVARCHAR(255) NOT NULL, -- Hashed password for security
    FullName NVARCHAR(255) NOT NULL, -- User's full name
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the user was created
    Role NVARCHAR(50) NOT NULL DEFAULT 'User' -- User role (User or Admin)
);

-- Table: Boards
CREATE TABLE Boards (
    BoardID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the board
    UserID INT NOT NULL, -- ID of the user who owns the board
    BoardName NVARCHAR(255) NOT NULL, -- Name of the board
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the board was created
    CONSTRAINT FK_Boards_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) -- Foreign key to link board to user
);

-- Table: Lists
CREATE TABLE Lists (
    ListID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the list
    BoardID INT NOT NULL, -- ID of the board the list belongs to
    ListName NVARCHAR(255) NOT NULL, -- Name of the list
    Position INT NOT NULL, -- Order of the list within the board
    CONSTRAINT FK_Lists_Boards FOREIGN KEY (BoardID) REFERENCES Boards(BoardID) -- Foreign key to link list to board
);

-- Table: Cards
CREATE TABLE Cards (
    CardID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the Card
    ListID INT NOT NULL, -- ID of the list the Card belongs to
    CardName NVARCHAR(255) NOT NULL, -- Name of the Card
    Description NVARCHAR(MAX), -- Card description (optional)
    DueDate DATETIME, -- Due date (optional, changed from DATE to DATETIME for more precision)
    Status NVARCHAR(50) CHECK (Status IN ('To Do', 'In Progress', 'Done')) NOT NULL, -- Card status
    Position INT NOT NULL DEFAULT 0, -- Order of the Card within the list
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the Card was created
    CONSTRAINT FK_Cards_Lists FOREIGN KEY (ListID) REFERENCES Lists(ListID) -- Foreign key to link Card to list
);

-- Table: Comments
CREATE TABLE Comments (
    CommentID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the comment
    CardID INT NOT NULL, -- ID of the Card the comment belongs to
    UserID INT NOT NULL, -- ID of the user who wrote the comment
    Content NVARCHAR(MAX) NOT NULL, -- Comment content
    CreatedAt DATETIME DEFAULT GETDATE(), -- Date and time the comment was created
    CONSTRAINT FK_Comments_Cards FOREIGN KEY (CardID) REFERENCES Cards(CardID) ON DELETE NO ACTION, -- Prevent cascade delete
    CONSTRAINT FK_Comments_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE NO ACTION -- Prevent cascade delete
);

-- Table: BoardMembers (New table that was missing)
CREATE TABLE BoardMembers (
    MemberID INT IDENTITY(1,1) PRIMARY KEY, -- Auto-incrementing ID for the board membership
    BoardID INT NOT NULL, -- ID of the board 
    UserID INT NOT NULL, -- ID of the user who is a member
    Role NVARCHAR(50) NOT NULL DEFAULT 'Editor', -- Role in the board (Owner, Editor, Viewer)
    AddedAt DATETIME DEFAULT GETDATE(), -- Date and time the member was added
    CONSTRAINT FK_BoardMembers_Boards FOREIGN KEY (BoardID) REFERENCES Boards(BoardID) ON DELETE CASCADE,
    CONSTRAINT FK_BoardMembers_Users FOREIGN KEY (UserID) REFERENCES Users(UserID) ON DELETE NO ACTION,
    CONSTRAINT UQ_BoardMembers UNIQUE (BoardID, UserID) -- Ensure a user can be a member of a board only once
);

-- Indexes for faster queries
CREATE INDEX IX_Boards_UserID ON Boards(UserID); -- Speed up fetching a user's boards
CREATE INDEX IX_Lists_BoardID ON Lists(BoardID); -- Speed up fetching lists for a board
CREATE INDEX IX_Cards_ListID_Position ON Cards(ListID, Position); -- Speed up fetching Cards for a list, ordered by position
CREATE INDEX IX_Comments_CardID ON Comments(CardID); -- Speed up fetching comments for a card
CREATE INDEX IX_Comments_UserID ON Comments(UserID); -- Speed up fetching comments by a user
CREATE INDEX IX_BoardMembers_BoardID ON BoardMembers(BoardID); -- Speed up fetching members of a board
CREATE INDEX IX_BoardMembers_UserID ON BoardMembers(UserID); -- Speed up fetching boards a user is a member of

-- Create initial admin account
INSERT INTO Users (Email, PasswordHash, FullName, Role)
VALUES ('admin@taskie.com', '$2a$11$CgAtL0xKL9P0L74.vbKlD.3GzZJ0RsaMJJITbFgLKaIBeUAF9zBp2', 'System Admin', 'Admin');

-- Queries to select all data from each table
SELECT * FROM Users;
SELECT * FROM Boards;
SELECT * FROM Lists;
SELECT * FROM Cards;
SELECT * FROM Comments;
SELECT * FROM BoardMembers;

UPDATE Users SET Role = 'Admin'
WHERE UserID = 1

DELETE Users WHERE UserID = 4
